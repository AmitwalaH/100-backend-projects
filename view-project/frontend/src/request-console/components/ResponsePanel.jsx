import { useState } from "react";
import { RESPONSE_TABS } from "../constants";

function statusColor(status) {
  if (typeof status !== "number") return "#6b7280";
  if (status >= 200 && status < 300) return "#16a34a";
  if (status >= 300 && status < 400) return "#2563eb";
  if (status >= 400 && status < 500) return "#d97706";
  return "#dc2626";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function downloadResponse(response) {
  const text = typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `response-${response.status ?? "error"}-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function BodyTab({ response }) {
  const [view, setView] = useState("pretty");
  const isHtml = String(response.headers?.["content-type"] || "").includes("text/html");
  const raw = typeof response.body === "string" ? response.body : JSON.stringify(response.body);
  const pretty = typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2);

  return (
    <div className="rc-response-body-wrap">
      <div className="rc-response-body-toggle">
        <button type="button" className={view === "pretty" ? "active" : ""} onClick={() => setView("pretty")}>
          Pretty
        </button>
        <button type="button" className={view === "raw" ? "active" : ""} onClick={() => setView("raw")}>
          Raw
        </button>
        {isHtml && (
          <button type="button" className={view === "preview" ? "active" : ""} onClick={() => setView("preview")}>
            Preview
          </button>
        )}
      </div>

      {view === "pretty" && <pre className="rc-response-body">{response.error || pretty}</pre>}
      {view === "raw" && <pre className="rc-response-body">{response.error || raw}</pre>}
      {view === "preview" && isHtml && (
        <iframe title="response-preview" className="rc-response-preview-frame" srcDoc={raw} sandbox="" />
      )}
    </div>
  );
}

function CookiesTab({ response }) {
  if (!response.setCookies || response.setCookies.length === 0) {
    return <div className="rc-empty-note">No cookies were set by this response.</div>;
  }
  return (
    <table className="kv-table kv-table-readonly">
      <thead>
        <tr>
          <th>Cookie</th>
          <th>Attributes</th>
        </tr>
      </thead>
      <tbody>
        {response.setCookies.map((cookie, i) => {
          const [pair, ...attrs] = cookie.split(";");
          return (
            <tr key={i}>
              <td>{pair.trim()}</td>
              <td>{attrs.join(";").trim() || "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function HeadersTab({ response }) {
  const entries = Object.entries(response.headers || {});
  if (entries.length === 0) {
    return <div className="rc-empty-note">No response headers captured.</div>;
  }
  return (
    <table className="kv-table kv-table-readonly">
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {entries.map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TestsTab({ response }) {
  if (!response.testResults || response.testResults.length === 0) {
    return <div className="rc-empty-note">No assertions were run. Add lines under the Tests script to check this response.</div>;
  }
  const passed = response.testResults.filter((t) => t.passed).length;
  return (
    <div className="rc-tests-tab">
      <div className="rc-tests-summary">
        {passed} / {response.testResults.length} passed
      </div>
      <ul className="rc-tests-list">
        {response.testResults.map((t, i) => (
          <li key={i} className={t.passed ? "rc-test-pass" : "rc-test-fail"}>
            <span className="rc-test-icon">{t.passed ? "✓" : "✕"}</span>
            <span className="rc-test-message">{t.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TAB_COMPONENTS = { body: BodyTab, cookies: CookiesTab, headers: HeadersTab, tests: TestsTab };

export default function ResponsePanel({ response, isSending }) {
  const [activeTabId, setActiveTabId] = useState("body");

  if (isSending) {
    return (
      <div className="rc-response-panel rc-response-loading">
        <div className="run-loading">
          <div className="run-dot" />
          <div className="run-dot" />
          <div className="run-dot" />
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="rc-response-panel rc-response-empty">
        <p>Send a request to see the response here.</p>
      </div>
    );
  }

  const ActiveTab = TAB_COMPONENTS[activeTabId];

  return (
    <div className="rc-response-panel">
      <div className="rc-response-summary">
        {typeof response.status === "number" ? (
          <span className="rc-status-chip" style={{ color: statusColor(response.status) }}>
            {response.status} {response.statusText}
          </span>
        ) : (
          <span className="rc-status-chip rc-status-chip-error">Request failed</span>
        )}
        <span className="rc-response-meta">{response.responseTime} ms</span>
        <span className="rc-response-meta">{formatBytes(response.sizeBytes)}</span>
        <button type="button" className="rc-download-btn" onClick={() => downloadResponse(response)}>
          Save Response
        </button>
      </div>

      <div className="rc-panel-tab-strip">
        {RESPONSE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`rc-panel-tab ${activeTabId === t.id ? "active" : ""}`}
            onClick={() => setActiveTabId(t.id)}
          >
            {t.label}
            {t.id === "cookies" && response.setCookies?.length > 0 && (
              <span className="rc-panel-tab-count">{response.setCookies.length}</span>
            )}
            {t.id === "tests" && response.testResults?.length > 0 && (
              <span className="rc-panel-tab-count">{response.testResults.filter((r) => r.passed).length}/{response.testResults.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="rc-panel-body">
        <ActiveTab response={response} />
      </div>
    </div>
  );
}
