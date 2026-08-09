import { useCallback, useEffect, useState } from "react";
import { createId } from "../utils/id";
import { LOCAL_STORAGE_PREFIX } from "../constants";

const storageKey = (projectKey) => `${LOCAL_STORAGE_PREFIX}:saved:${projectKey}`;

function readStored(projectKey) {
  try {
    const raw = window.localStorage.getItem(storageKey(projectKey));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Saved requests are a project's "collection" — the persisted, named counterpart to a tab. */
export function useSavedRequests(projectKey) {
  const [savedRequests, setSavedRequests] = useState(() => readStored(projectKey));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey(projectKey), JSON.stringify(savedRequests));
    } catch {
      // non-fatal — see useRequestTabs for rationale
    }
  }, [projectKey, savedRequests]);

  const saveRequest = useCallback((tab, nameOverride) => {
    const { id: _tabId, isDirty: _dirty, response: _response, ...requestFields } = tab;
    const savedId = tab.savedRequestId || createId("saved");
    const record = { ...requestFields, id: savedId, name: nameOverride || tab.name };

    setSavedRequests((current) => {
      const exists = current.some((r) => r.id === savedId);
      return exists ? current.map((r) => (r.id === savedId ? record : r)) : [...current, record];
    });

    return savedId;
  }, []);

  const deleteSavedRequest = useCallback((id) => {
    setSavedRequests((current) => current.filter((r) => r.id !== id));
  }, []);

  const renameSavedRequest = useCallback((id, name) => {
    setSavedRequests((current) => current.map((r) => (r.id === id ? { ...r, name } : r)));
  }, []);

  return { savedRequests, saveRequest, deleteSavedRequest, renameSavedRequest };
}
