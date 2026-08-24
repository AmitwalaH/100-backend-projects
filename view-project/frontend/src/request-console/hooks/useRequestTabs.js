import { useCallback, useEffect, useMemo, useState } from "react";
import { createId } from "../utils/id";
import { LOCAL_STORAGE_PREFIX, METHODS_WITHOUT_BODY } from "../constants";

const storageKey = (projectKey) => `${LOCAL_STORAGE_PREFIX}:tabs:${projectKey}`;

function readStoredTabs(projectKey) {
  try {
    const raw = window.localStorage.getItem(storageKey(projectKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.tabs) && parsed.tabs.length > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeStoredTabs(projectKey, tabs, activeTabId) {
  try {
    window.localStorage.setItem(storageKey(projectKey), JSON.stringify({ tabs, activeTabId }));
  } catch {
    // localStorage can throw in private-browsing / quota-exceeded situations.
    // Losing tab persistence is not fatal — the console still works in-memory.
  }
}

function blankTab(overrides = {}) {
  return {
    id: createId("tab"),
    name: overrides.name || "New Request",
    method: "GET",
    url: "",
    params: [],
    headers: [{ id: createId("hdr"), key: "Content-Type", value: "application/json", enabled: true }],
    auth: { type: "none", token: "", username: "", password: "" },
    bodyMode: "none",
    bodyRaw: "",
    formBody: [],
    preRequestScript: "",
    testScript: "",
    settings: { timeoutMs: 15000, followRedirects: true },
    isDirty: false,
    savedRequestId: null,
    response: null,
    ...overrides,
  };
}

/** Builds an initial tab from a project-page.json `call` entry. */
function tabFromCall(call, baseUrl) {
  const hasBody = call.requestBody !== undefined && call.requestBody !== null;
  const method = (call.method || "GET").toUpperCase();
  return blankTab({
    name: `${method} ${call.path}`,
    method,
    url: `${baseUrl.replace(/\/$/, "")}${call.path}`,
    bodyMode: hasBody && !METHODS_WITHOUT_BODY.includes(method) ? "raw-json" : "none",
    bodyRaw: hasBody ? JSON.stringify(call.requestBody, null, 2) : "",
    headers: hasBody
      ? [{ id: createId("hdr"), key: "Content-Type", value: "application/json", enabled: true }]
      : [],
  });
}

/**
 * Owns the open-tab collection for one project's request console.
 * Seeds itself once from `backendConfig.calls` the first time a project
 * is opened, then persists whatever the learner does with it.
 */
export function useRequestTabs(projectKey, backendConfig) {
  const [tabs, setTabs] = useState(() => {
    const stored = readStoredTabs(projectKey);
    if (stored) return stored.tabs;
    if (backendConfig?.calls?.length) {
      return backendConfig.calls.map((call) => tabFromCall(call, backendConfig.baseUrl));
    }
    return [blankTab()];
  });

  const [activeTabId, setActiveTabId] = useState(() => {
    const stored = readStoredTabs(projectKey);
    if (stored?.activeTabId) return stored.activeTabId;
    return tabs[0]?.id ?? null;
  });

  useEffect(() => {
    writeStoredTabs(projectKey, tabs, activeTabId);
  }, [projectKey, tabs, activeTabId]);

  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId) ?? null, [tabs, activeTabId]);

  const updateTab = useCallback((tabId, patch) => {
    setTabs((current) =>
      current.map((tab) =>
        tab.id === tabId
          ? { ...tab, ...(typeof patch === "function" ? patch(tab) : patch), isDirty: true }
          : tab,
      ),
    );
  }, []);

  /** Sets fields without marking the tab dirty — used for response updates, not edits. */
  const patchTabSilently = useCallback((tabId, patch) => {
    setTabs((current) =>
      current.map((tab) =>
        tab.id === tabId ? { ...tab, ...(typeof patch === "function" ? patch(tab) : patch) } : tab,
      ),
    );
  }, []);

  const openBlankTab = useCallback(() => {
    const tab = blankTab();
    setTabs((current) => [...current, tab]);
    setActiveTabId(tab.id);
    return tab.id;
  }, []);

  const openTabFromSaved = useCallback((savedRequest) => {
    const tab = blankTab({ ...savedRequest, id: createId("tab"), savedRequestId: savedRequest.id, isDirty: false });
    setTabs((current) => [...current, tab]);
    setActiveTabId(tab.id);
    return tab.id;
  }, []);

  // closeTab/duplicateTab previously called setActiveTabId as a SIDE
  // EFFECT inside the setTabs(current => ...) updater function. React 18
  // Strict Mode intentionally double-invokes updater functions in dev to
  // catch exactly this pattern — since blankTab()/createId() generate a
  // new id every call, a double-invocation could call setActiveTabId
  // twice with two DIFFERENT ids, leaving activeTabId pointing at a tab
  // that was never actually committed to `tabs`. When that happens,
  // activeTab resolves to null and the whole console disappears (see
  // RequestConsole's `if (!activeTab) return null`). Fixed by reading
  // from `tabs` directly (now a real dependency) and calling setTabs/
  // setActiveTabId as separate, plain calls instead of nesting one
  // inside the other's updater.
  const closeTab = useCallback(
    (tabId) => {
      const remaining = tabs.filter((t) => t.id !== tabId);

      if (remaining.length === 0) {
        const fresh = blankTab();
        setTabs([fresh]);
        setActiveTabId(fresh.id);
        return;
      }

      if (tabId === activeTabId) {
        const closedIndex = tabs.findIndex((t) => t.id === tabId);
        const fallback = remaining[Math.max(0, closedIndex - 1)];
        setActiveTabId(fallback.id);
      }

      setTabs(remaining);
    },
    [tabs, activeTabId],
  );

  const duplicateTab = useCallback(
    (tabId) => {
      const source = tabs.find((t) => t.id === tabId);
      if (!source) return;
      const copy = {
        ...source,
        id: createId("tab"),
        name: `${source.name} copy`,
        savedRequestId: null,
        response: null,
      };
      const index = tabs.findIndex((t) => t.id === tabId);
      const next = [...tabs];
      next.splice(index + 1, 0, copy);
      setTabs(next);
      setActiveTabId(copy.id);
    },
    [tabs],
  );

  return {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    updateTab,
    patchTabSilently,
    openBlankTab,
    openTabFromSaved,
    closeTab,
    duplicateTab,
  };
}