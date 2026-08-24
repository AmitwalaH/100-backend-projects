import { useCallback, useEffect, useState } from "react";
import { createId } from "../utils/id";
import { LOCAL_STORAGE_PREFIX } from "../constants";

const storageKey = (projectKey) =>
  LOCAL_STORAGE_PREFIX + ":saved:" + projectKey;
const DEFAULT_FOLDER = "General";

function readStored(projectKey) {
  try {
    const raw = window.localStorage.getItem(storageKey(projectKey));
    const parsed = raw ? JSON.parse(raw) : [];
    // Backfill folder on records saved before grouping existed.
    return parsed.map((r) => (r.folder ? r : { ...r, folder: DEFAULT_FOLDER }));
  } catch {
    return [];
  }
}

/** Saved requests are a project's collection - grouped into folders, the persisted counterpart to a tab. */
export function useSavedRequests(projectKey) {
  const [savedRequests, setSavedRequests] = useState(() =>
    readStored(projectKey),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        storageKey(projectKey),
        JSON.stringify(savedRequests),
      );
    } catch {
      // non-fatal - see useRequestTabs for rationale
    }
  }, [projectKey, savedRequests]);

  const saveRequest = useCallback((tab, nameOverride, folderOverride) => {
    const {
      id: _tabId,
      isDirty: _dirty,
      response: _response,
      ...requestFields
    } = tab;
    const savedId = tab.savedRequestId || createId("saved");
    const record = {
      ...requestFields,
      id: savedId,
      name: nameOverride || tab.name,
      folder: folderOverride || tab.folder || DEFAULT_FOLDER,
    };

    setSavedRequests((current) => {
      const exists = current.some((r) => r.id === savedId);
      return exists
        ? current.map((r) => (r.id === savedId ? record : r))
        : [...current, record];
    });

    return savedId;
  }, []);

  const deleteSavedRequest = useCallback((id) => {
    setSavedRequests((current) => current.filter((r) => r.id !== id));
  }, []);

  const renameSavedRequest = useCallback((id, name) => {
    setSavedRequests((current) =>
      current.map((r) => (r.id === id ? { ...r, name } : r)),
    );
  }, []);

  const moveSavedRequestToFolder = useCallback((id, folder) => {
    setSavedRequests((current) =>
      current.map((r) =>
        r.id === id ? { ...r, folder: folder || DEFAULT_FOLDER } : r,
      ),
    );
  }, []);

  return {
    savedRequests,
    saveRequest,
    deleteSavedRequest,
    renameSavedRequest,
    moveSavedRequestToFolder,
  };
}
