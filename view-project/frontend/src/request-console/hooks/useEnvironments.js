import { useCallback, useEffect, useState } from "react";
import { createId } from "../utils/id";
import { LOCAL_STORAGE_PREFIX } from "../constants";

// Environments are global (not per-project) — the same variable set
// (e.g. a shared auth token) is meant to travel across every project
// you're exploring in one sitting, matching how environments behave
// in any request client.
const STORAGE_KEY = `${LOCAL_STORAGE_PREFIX}:environments`;

function defaultState() {
  const noEnv = { id: "no-environment", name: "No Environment", variables: [] };
  return { environments: [noEnv], activeEnvironmentId: noEnv.id };
}

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.environments) && parsed.environments.length > 0) return parsed;
    return defaultState();
  } catch {
    return defaultState();
  }
}

export function useEnvironments() {
  const [state, setState] = useState(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota/private-mode errors — environments simply won't persist
    }
  }, [state]);

  const activeEnvironment =
    state.environments.find((e) => e.id === state.activeEnvironmentId) ?? state.environments[0];

  const activeVariables = activeEnvironment?.variables ?? [];

  const setActiveEnvironmentId = useCallback((id) => {
    setState((current) => ({ ...current, activeEnvironmentId: id }));
  }, []);

  const createEnvironment = useCallback((name) => {
    const env = { id: createId("env"), name: name || "New Environment", variables: [] };
    setState((current) => ({
      environments: [...current.environments, env],
      activeEnvironmentId: env.id,
    }));
    return env.id;
  }, []);

  const renameEnvironment = useCallback((id, name) => {
    setState((current) => ({
      ...current,
      environments: current.environments.map((e) => (e.id === id ? { ...e, name } : e)),
    }));
  }, []);

  const deleteEnvironment = useCallback((id) => {
    if (id === "no-environment") return;
    setState((current) => {
      const environments = current.environments.filter((e) => e.id !== id);
      const activeEnvironmentId =
        current.activeEnvironmentId === id ? "no-environment" : current.activeEnvironmentId;
      return { environments, activeEnvironmentId };
    });
  }, []);

  const setVariables = useCallback((id, variables) => {
    setState((current) => ({
      ...current,
      environments: current.environments.map((e) => (e.id === id ? { ...e, variables } : e)),
    }));
  }, []);

  /** Merges pre-request-script assignments into the active environment (creating vars as needed). */
  const mergeVariables = useCallback((id, assignments) => {
    if (!assignments.length) return;
    setState((current) => ({
      ...current,
      environments: current.environments.map((e) => {
        if (e.id !== id) return e;
        const byKey = new Map(e.variables.map((v) => [v.key, v]));
        for (const { key, value } of assignments) {
          const existing = byKey.get(key);
          // Was `byKey.get(key).value = value` — mutating the existing
          // variable object in place, even though it's still referenced
          // by the PREVIOUS state's `e.variables` array. That violates
          // React's immutability contract: the old state object ends up
          // silently reflecting the new value too, which can confuse
          // reference-equality checks (memoization) and DevTools state
          // history. Building a new object instead.
          if (existing) {
            byKey.set(key, { ...existing, value });
          } else {
            byKey.set(key, { id: createId("var"), key, value, enabled: true });
          }
        }
        return { ...e, variables: Array.from(byKey.values()) };
      }),
    }));
  }, []);

  return {
    environments: state.environments,
    activeEnvironment,
    activeEnvironmentId: state.activeEnvironmentId,
    activeVariables,
    setActiveEnvironmentId,
    createEnvironment,
    renameEnvironment,
    deleteEnvironment,
    setVariables,
    mergeVariables,
  };
}