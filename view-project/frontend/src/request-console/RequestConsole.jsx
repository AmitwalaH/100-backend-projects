import "./styles.css";
import { useCallback, useMemo, useState } from "react";

import { useRequestTabs } from "./hooks/useRequestTabs";
import { useEnvironments } from "./hooks/useEnvironments";
import { useSavedRequests } from "./hooks/useSavedRequests";
import { useRequestHistory } from "./hooks/useRequestHistory";
import { useConsoleLog } from "./hooks/useConsoleLog";
import { useSendRequest } from "./hooks/useSendRequest";
import { useAccentColor } from "./hooks/useAccentColor";

import CollectionSidebar from "./components/CollectionSidebar";
import TabBar from "./components/TabBar";
import EnvironmentBar from "./components/EnvironmentBar";
import AccentPicker from "./components/AccentPicker";
import UrlBar from "./components/UrlBar";
import RequestPanel from "./components/RequestPanel";
import ResponsePanel from "./components/ResponsePanel";
import SplitPane from "./components/SplitPane";
import ConsoleLog from "./components/ConsoleLog";

const SIDEBAR_COLLAPSED_KEY = "request-console:sidebar-collapsed";

/**
 * Top-level request console for one project. projectKey scopes tabs,
 * saved requests, and history to this project; environments and the
 * accent color are shared globally across every project.
 */
export default function RequestConsole({ backendConfig, projectKey }) {
  const {
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
  } = useRequestTabs(projectKey, backendConfig);

  const environments = useEnvironments();
  const { savedRequests, saveRequest, deleteSavedRequest } =
    useSavedRequests(projectKey);
  const { history, addEntry, clearHistory } = useRequestHistory(projectKey);
  const { entries: logEntries, log, clear: clearLog } = useConsoleLog();
  const sendRequest = useSendRequest({ environments, projectKey });
  const { accent, setAccent, options: accentOptions } = useAccentColor();

  const [isSending, setIsSending] = useState(false);

  // Sidebar is empty a lot of the time ("No saved requests yet") and
  // permanently ate 250px regardless — every real API client (Postman,
  // Insomnia, Hoppscotch) makes this collapsible for exactly that reason.
  // Persisted the same way SplitPane already persists its split ratio.
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // non-fatal
      }
      return next;
    });
  }, []);

  const rootStyle = useMemo(
    () => ({ "--rc-accent": accent.base, "--rc-accent-hover": accent.hover }),
    [accent],
  );

  const handleChange = useCallback(
    (patch) => {
      if (!activeTab) return;
      updateTab(activeTab.id, patch);
    },
    [activeTab, updateTab],
  );

  const handleSend = useCallback(async () => {
    if (!activeTab || isSending) return;
    setIsSending(true);
    patchTabSilently(activeTab.id, { response: null });

    try {
      const result = await sendRequest(activeTab, { onLog: log });
      patchTabSilently(activeTab.id, { response: result });
      addEntry({
        method: activeTab.method,
        url: result.url,
        status: result.status,
        ok: result.ok,
        responseTime: result.responseTime,
      });
    } catch (err) {
      patchTabSilently(activeTab.id, {
        response: {
          ok: false,
          status: null,
          statusText: "",
          url: activeTab.url,
          body: null,
          headers: {},
          setCookies: [],
          error: err.message,
          responseTime: 0,
          sizeBytes: 0,
          testResults: [],
        },
      });
    } finally {
      setIsSending(false);
    }
  }, [activeTab, isSending, sendRequest, patchTabSilently, addEntry, log]);

  const handleSave = useCallback(() => {
    if (!activeTab) return;
    const savedId = saveRequest(activeTab);
    updateTab(activeTab.id, { savedRequestId: savedId });
    patchTabSilently(activeTab.id, { isDirty: false });
  }, [activeTab, saveRequest, updateTab, patchTabSilently]);

  const handleOpenSaved = useCallback(
    (savedRequestRecord) => {
      const existingTab = tabs.find(
        (t) => t.savedRequestId === savedRequestRecord.id,
      );
      if (existingTab) {
        setActiveTabId(existingTab.id);
        return;
      }
      openTabFromSaved(savedRequestRecord);
    },
    [tabs, openTabFromSaved, setActiveTabId],
  );

  const handleOpenHistoryEntry = useCallback(
    (entry) => {
      const id = openBlankTab();
      updateTab(id, {
        name: entry.method + " " + entry.url,
        method: entry.method,
        url: entry.url,
      });
    },
    [openBlankTab, updateTab],
  );

  if (!activeTab) return null;

  return (
    <div
      className={
        "request-console" + (isSidebarCollapsed ? " sidebar-collapsed" : "")
      }
      style={rootStyle}
    >
      <CollectionSidebar
        savedRequests={savedRequests}
        history={history}
        onOpenSaved={handleOpenSaved}
        onDeleteSaved={deleteSavedRequest}
        onOpenHistoryEntry={handleOpenHistoryEntry}
        onClearHistory={clearHistory}
      />

      <button
        type="button"
        className="rc-sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isSidebarCollapsed}
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isSidebarCollapsed ? "\u203A" : "\u2039"}
      </button>

      <div className="rc-main-column">
        <div className="rc-top-row">
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelect={setActiveTabId}
            onClose={closeTab}
            onDuplicate={duplicateTab}
            onNewTab={openBlankTab}
          />
          <div className="rc-top-row-controls">
            <AccentPicker
              accent={accent}
              options={accentOptions}
              onChange={setAccent}
            />
            <EnvironmentBar environments={environments} />
          </div>
        </div>

        <UrlBar
          tab={activeTab}
          onChange={handleChange}
          onSend={handleSend}
          onSave={handleSave}
          isSending={isSending}
        />

        <SplitPane
          storageKey="request-console:split-ratio"
          top={<RequestPanel tab={activeTab} onChange={handleChange} />}
          bottom={
            <ResponsePanel
              response={activeTab.response}
              isSending={isSending}
            />
          }
        />

        <ConsoleLog entries={logEntries} onClear={clearLog} />
      </div>
    </div>
  );
}
