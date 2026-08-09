import { useCallback, useEffect, useState } from "react";
import { createId } from "../utils/id";
import { LOCAL_STORAGE_PREFIX } from "../constants";

const storageKey = (projectKey) => `${LOCAL_STORAGE_PREFIX}:history:${projectKey}`;
const MAX_ENTRIES = 100;

function readStored(projectKey) {
  try {
    const raw = window.localStorage.getItem(storageKey(projectKey));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useRequestHistory(projectKey) {
  const [history, setHistory] = useState(() => readStored(projectKey));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(projectKey), JSON.stringify(history));
    } catch {
      // non-fatal
    }
  }, [projectKey, history]);

  const addEntry = useCallback((entry) => {
    setHistory((current) => {
      const record = { id: createId("hist"), timestamp: Date.now(), ...entry };
      return [record, ...current].slice(0, MAX_ENTRIES);
    });
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return { history, addEntry, clearHistory };
}
