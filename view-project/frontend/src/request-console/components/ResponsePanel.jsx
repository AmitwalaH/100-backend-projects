import { useState } from "react";
import { RESPONSE_TABS } from "../constants";

function statusColor(status) {
  if (typeof status !== "number") return "#6b7280";
  if (status >= 200 && status < 300) return "#16a34a";
  if (status >= 300 && status < 400) return "#2563eb";
  if (status >= 400 && status < 500) return "#d97706";
  return "#dc2626";
}

// Postman/Insomnia both show status as a filled badge rather than bare
// colored text — scans at a glance instead of requiring you to read a
// small colored number. Low-opacity tint of the same status color.
function statusBg(status) {
  if (typeof status !== "number") return "rgba(107, 114, 128, 0.14)";
  if (status >= 200 && status < 300) return "rgba(22, 163, 74, 0.14)";
  if (status >= 300 && status < 400) return "rgba(37, 99, 235, 0.14)";
  if (status >= 400 && status < 500) return "rgba(217, 119, 6, 0.14)";
  return "rgba(220, 38, 38, 0.14)";
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  return (bytes / 1024).toFixed(1) + " KB";
}

const MIME_BY_KIND = {
  json: "application/json",
  html: "text/html",
  xml: "application/xml",
  text: "text/plain",
};

const EXT_BY_KIND = {
  json: "json",
  html: "html",
  xml: "xml",
  text: "txt",
};

function downloadResponse(response) {
  // Was hardcoded to application/json + a .json filename regardless of
  // what the response actually was — an HTML or XML response would be
  // saved with a misleading extension and MIME type. detectContentKind
  // is a hoisted function declaration below, so it's safe to call here.
  const kind = detectContentKind(response);
  const text =
    typeof response.body === "string"
      ? response.body
      : JSON.stringify(response.body, null, 2);
  const blob = new Blob([text], { type: MIME_BY_KIND[kind] || "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download =
    "response-" +
    (response.status ?? "error") +
    "-" +
    Date.now() +
    "." +
    (EXT_BY_KIND[kind] || "txt");
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Classifies a response by its actual content-type instead of just checking for HTML. */
function detectContentKind(response) {
  const contentType = String(
    response.headers?.["content-type"] || "",
  ).toLowerCase();
  if (contentType.includes("html")) return "html";
  if (contentType.includes("xml")) return "xml";
  if (contentType.includes("json") || typeof response.body === "object")
    return "json";
  if (contentType.includes("text/")) return "text";
  return typeof response.body === "string" ? "text" : "json";
}

/** Minimal indentation pass for XML-ish text so it isn't shown as one unbroken line. Not a real parser. */
function softIndentXml(raw) {
  if (typeof raw !== "string") return raw;
  const withBreaks = raw.replace(/></g, ">\n<");
  const lines = withBreaks.split("\n");
  let depth = 0;
  const indented = lines.map((line) => {
    const isClosing = /^<\//.test(line.trim());
    if (isClosing) depth = Math.max(0, depth - 1);
    const result = "  ".repeat(depth) + line.trim();
    const isSelfClosing = /\/>$/.test(line.trim());
    const isOpening = /^<[^/!?]/.test(line.trim()) && !isSelfClosing;
    if (isOpening) depth += 1;
    return result;
  });
  return indented.join("\n");
}

function BodyTab({ response }) {
  const kind = detectContentKind(response);
  const [view, setView] = useState(kind === "html" ? "preview" : "pretty");

  const raw =
    typeof response.body === "string"
      ? response.body
      : JSON.stringify(response.body);
  let pretty = raw;
  if (kind === "json") {
    pretty =
      typeof response.body === "string"
        ? response.body
        : JSON.stringify(response.body, null, 2);
  } else if (kind === "xml") {
    pretty = softIndentXml(raw);
  }

  return (
    <div className="rc-response-body-wrap">
      <div className="rc-response-body-toggle">
        <button
          type="button"
          className={view === "pretty" ? "active" : ""}
          onClick={() => setView("pretty")}
        >
          Pretty
        </button>
        <button
          type="button"
          className={view === "raw" ? "active" : ""}
          onClick={() => setView("raw")}
        >
          Raw
        </button>
        {kind === "html" && (
          <button
            type="button"
            className={view === "preview" ? "active" : ""}
            onClick={() => setView("preview")}
          >
            Preview
          </button>
        )}
        <span className="rc-response-kind-tag">{kind}</span>
      </div>

      {view === "pretty" && (
        <pre className="rc-response-body">{response.error || pretty}</pre>
      )}
      {view === "raw" && (
        <pre className="rc-response-body">{response.error || raw}</pre>
      )}
      {view === "preview" && kind === "html" && (
        <iframe
          title="response-preview"
          className="rc-response-preview-frame"
          srcDoc={raw}
          sandbox=""
        />
      )}
    </div>
  );
}

function CookiesTab({ response }) {
  if (!response.setCookies || response.setCookies.length === 0) {
    return (
      <div className="rc-empty-note">No cookies were set by this response.</div>
    );
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
          const parts = cookie.split(";");
          const pair = parts[0];
          const attrs = parts.slice(1);
          return (
            <tr key={i}>
              <td>{pair.trim()}</td>
              <td>{attrs.join(";").trim() || "-"}</td>
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
    return (
      <div className="rc-empty-note">
        No assertions were run. Add lines under the Tests script to check this
        response.
      </div>
    );
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
            <span className="rc-test-icon">{t.passed ? "OK" : "FAIL"}</span>
            <span className="rc-test-message">{t.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TAB_COMPONENTS = {
  body: BodyTab,
  cookies: CookiesTab,
  headers: HeadersTab,
  tests: TestsTab,
};

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
          <span
            className="rc-status-chip"
            style={{
              color: statusColor(response.status),
              background: statusBg(response.status),
            }}
          >
            {response.status} {response.statusText}
          </span>
        ) : (
          <span className="rc-status-chip rc-status-chip-error">
            Request failed
          </span>
        )}
        <span className="rc-response-meta">{response.responseTime} ms</span>
        <span className="rc-response-meta">
          {formatBytes(response.sizeBytes)}
        </span>
        <button
          type="button"
          className="rc-download-btn"
          onClick={() => downloadResponse(response)}
        >
          Save Response
        </button>
      </div>

      <div className="rc-panel-tab-strip">
        {RESPONSE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={"rc-panel-tab" + (activeTabId === t.id ? " active" : "")}
            onClick={() => setActiveTabId(t.id)}
          >
            {t.label}
            {t.id === "cookies" && response.setCookies?.length > 0 && (
              <span className="rc-panel-tab-count">
                {response.setCookies.length}
              </span>
            )}
            {t.id === "tests" && response.testResults?.length > 0 && (
              <span className="rc-panel-tab-count">
                {response.testResults.filter((r) => r.passed).length}/
                {response.testResults.length}
              </span>
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
