import "./styles.css";
import { useCallback, useState } from "react";

import { useRequestTabs } from "./hooks/useRequestTabs";
import { useEnvironments } from "./hooks/useEnvironments";
import { useSavedRequests } from "./hooks/useSavedRequests";
import { useRequestHistory } from "./hooks/useRequestHistory";
import { useConsoleLog } from "./hooks/useConsoleLog";
import { useSendRequest } from "./hooks/useSendRequest";

import CollectionSidebar from "./components/CollectionSidebar";
import TabBar from "./components/TabBar";
import EnvironmentBar from "./components/EnvironmentBar";
import UrlBar from "./components/UrlBar";
import RequestPanel from "./components/RequestPanel";
import ResponsePanel from "./components/ResponsePanel";
import SplitPane from "./components/SplitPane";
import ConsoleLog from "./components/ConsoleLog";

/**
 * Top-level request console for one project. `projectKey` scopes tabs,
 * saved requests, and history to this project; environments are shared
 * globally across every project (see useEnvironments).
 */
export default function RequestConsole({ backendConfig, projectKey }) {
  const { tabs, activeTab, activeTabId, setActiveTabId, updateTab, patchTabSilently, openBlankTab, openTabFromSaved, closeTab, duplicateTab } =
    useRequestTabs(projectKey, backendConfig);

  const environments = useEnvironments();
  const { savedRequests, saveRequest, deleteSavedRequest } = useSavedRequests(projectKey);
  const { history, addEntry, clearHistory } = useRequestHistory(projectKey);
  const { entries: logEntries, log, clear: clearLog } = useConsoleLog();
  const sendRequest = useSendRequest({ environments, projectKey });

  const [isSending, setIsSending] = useState(false);

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
      const existingTab = tabs.find((t) => t.savedRequestId === savedRequestRecord.id);
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
      updateTab(id, { name: `${entry.method} ${entry.url}`, method: entry.method, url: entry.url });
    },
    [openBlankTab, updateTab],
  );

  if (!activeTab) return null;

  return (
    <div className="request-console">
      <CollectionSidebar
        savedRequests={savedRequests}
        history={history}
        onOpenSaved={handleOpenSaved}
        onDeleteSaved={deleteSavedRequest}
        onOpenHistoryEntry={handleOpenHistoryEntry}
        onClearHistory={clearHistory}
      />

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
          <EnvironmentBar environments={environments} />
        </div>

        <UrlBar tab={activeTab} onChange={handleChange} onSend={handleSend} onSave={handleSave} isSending={isSending} />

        <SplitPane
          storageKey="request-console:split-ratio"
          top={<RequestPanel tab={activeTab} onChange={handleChange} />}
          bottom={<ResponsePanel response={activeTab.response} isSending={isSending} />}
        />

        <ConsoleLog entries={logEntries} onClear={clearLog} />
      </div>
    </div>
  );
}