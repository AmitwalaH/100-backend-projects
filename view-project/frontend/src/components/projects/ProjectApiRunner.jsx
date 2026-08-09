import { useState, useMemo } from "react";

const METHOD_COLORS = {
  GET: "#16a34a",
  POST: "#ea580c",
  PUT: "#2563eb",
  PATCH: "#ca8a04",
  DELETE: "#dc2626",
};

function statusColor(status) {
  if (typeof status !== "number") return "#6b7280";
  if (status >= 200 && status < 300) return "#16a34a";
  if (status >= 300 && status < 400) return "#2563eb";
  if (status >= 400 && status < 500) return "#d97706";
  return "#dc2626";
}

function bytesOf(value) {
  try {
    return new Blob([typeof value === "string" ? value : JSON.stringify(value)]).size;
  } catch {
    return 0;
  }
}

export default function ProjectApiRunner({ backendConfig }) {
  const hasCalls = useMemo(
    () => Array.isArray(backendConfig?.calls) && backendConfig.calls.length > 0,
    [backendConfig],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [requestTab, setRequestTab] = useState("body");
  const [responseTab, setResponseTab] = useState("body");
  const [editorValueByIndex, setEditorValueByIndex] = useState(() => {
    if (!backendConfig?.calls) return {};
    return backendConfig.calls.reduce((map, call, index) => {
      map[index] = call.requestBody ? JSON.stringify(call.requestBody, null, 2) : "";
      return map;
    }, {});
  });
  const [resultByIndex, setResultByIndex] = useState({});

  if (!backendConfig || !backendConfig.baseUrl || !hasCalls) {
    return null;
  }

  const call = backendConfig.calls[activeIndex];
  const method = call.method.toUpperCase();
  const isBodyEditable = !["GET", "DELETE"].includes(method);
  const result = resultByIndex[activeIndex];
  const requestBodyText = editorValueByIndex[activeIndex] ?? "";
  const fullUrl = `${backendConfig.baseUrl.replace(/\/$/, "")}${call.path}`;
  const isRunning = result?.status === "running";

  function selectCall(index) {
    setActiveIndex(index);
    setRequestTab("body");
    setResponseTab("body");
  }

  function updateRequestBody(value) {
    setEditorValueByIndex((state) => ({ ...state, [activeIndex]: value }));
  }

  async function runCall() {
    const bodyText = editorValueByIndex[activeIndex] ?? "";
    let parsedBody = null;

    if (isBodyEditable) {
      if (bodyText.trim().length > 0) {
        try {
          parsedBody = JSON.parse(bodyText);
        } catch (err) {
          setResultByIndex((state) => ({
            ...state,
            [activeIndex]: {
              status: "error",
              ok: false,
              error: `Invalid JSON: ${err.message}`,
              url: fullUrl,
            },
          }));
          return;
        }
      } else {
        parsedBody = {};
      }
    }

    const startedAt = Date.now();
    setResultByIndex((state) => ({
      ...state,
      [activeIndex]: { status: "running", body: null, error: null, startedAt },
    }));

    try {
      const response = await fetch("/api/project-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: backendConfig.baseUrl,
          method: call.method,
          path: call.path,
          requestBody: parsedBody,
        }),
      });

      const json = await response.json();
      const elapsed = Date.now() - startedAt;

      setResultByIndex((state) => ({
        ...state,
        [activeIndex]: {
          status: json.status ?? response.status,
          ok: json.ok ?? response.ok,
          body: json.body ?? null,
          url: json.url ?? fullUrl,
          statusText: json.statusText,
          error: json.error || null,
          timelineMs: elapsed,
          headers: json.headers || null,
        },
      }));
    } catch (err) {
      setResultByIndex((state) => ({
        ...state,
        [activeIndex]: {
          status: "error",
          ok: false,
          error: err.message,
          url: fullUrl,
          timelineMs: Date.now() - startedAt,
        },
      }));
    }
  }

  return (
    <div className="apibase-runner">
      {/* Saved-request style tab strip along the top, one per endpoint */}
      <div className="apibase-endpoint-tabs">
        {backendConfig.calls.map((c, index) => (
          <button
            key={`${c.method}-${c.path}-${index}`}
            className={`apibase-endpoint-tab ${index === activeIndex ? "active" : ""}`}
            onClick={() => selectCall(index)}
            type="button"
          >
            <span
              className="apibase-endpoint-tab-method"
              style={{ color: METHOD_COLORS[c.method.toUpperCase()] || "#6b7280" }}
            >
              {c.method.toUpperCase()}
            </span>
            <span className="apibase-endpoint-tab-path">{c.path}</span>
          </button>
        ))}
      </div>

      {/* URL bar: method badge + full url + Send button */}
      <div className="apibase-url-bar">
        <span
          className="apibase-method-badge"
          style={{ background: METHOD_COLORS[method] || "#6b7280" }}
        >
          {method}
        </span>
        <code className="apibase-url-input">{fullUrl}</code>
        <button className="apibase-send-btn" onClick={runCall} disabled={isRunning} type="button">
          {isRunning ? "Sending…" : "Send"}
        </button>
      </div>

      {call.description && <p className="apibase-description">{call.description}</p>}

      {/* Request panel: Body / Headers tabs */}
      <div className="apibase-request-panel">
        <div className="apibase-tab-strip">
          <button
            className={`apibase-tab ${requestTab === "body" ? "active" : ""}`}
            onClick={() => setRequestTab("body")}
            type="button"
          >
            Body
          </button>
          <button
            className={`apibase-tab ${requestTab === "headers" ? "active" : ""}`}
            onClick={() => setRequestTab("headers")}
            type="button"
          >
            Headers
          </button>
        </div>

        {requestTab === "body" &&
          (isBodyEditable ? (
            <textarea
              className="apibase-editor"
              value={requestBodyText}
              onChange={(e) => updateRequestBody(e.target.value)}
              spellCheck={false}
              aria-label={`Request body for ${method} ${call.path}`}
            />
          ) : (
            <div className="apibase-empty-note">{method} requests don't send a body.</div>
          ))}

        {requestTab === "headers" && (
          <div className="apibase-headers-table">
            <div className="apibase-headers-row">
              <span className="apibase-headers-key">Content-Type</span>
              <span className="apibase-headers-value">application/json</span>
            </div>
          </div>
        )}
      </div>

      {/* Response panel */}
      {result && (
        <div className="apibase-response-panel">
          <div className="apibase-response-summary">
            <span className="apibase-response-label">Response</span>
            {typeof result.status === "number" ? (
              <span className="apibase-status-chip" style={{ color: statusColor(result.status) }}>
                {result.status} {result.statusText || ""}
              </span>
            ) : result.status === "running" ? (
              <span className="apibase-status-chip apibase-status-running">Sending…</span>
            ) : (
              <span className="apibase-status-chip apibase-status-error">Error</span>
            )}
            {typeof result.timelineMs === "number" && (
              <span className="apibase-response-meta">{result.timelineMs} ms</span>
            )}
            {result.body != null && (
              <span className="apibase-response-meta">{bytesOf(result.body)} B</span>
            )}
          </div>

          {result.status === "running" ? (
            <div className="run-loading">
              <div className="run-dot" />
              <div className="run-dot" />
              <div className="run-dot" />
            </div>
          ) : (
            <>
              <div className="apibase-tab-strip">
                <button
                  className={`apibase-tab ${responseTab === "body" ? "active" : ""}`}
                  onClick={() => setResponseTab("body")}
                  type="button"
                >
                  Body
                </button>
                <button
                  className={`apibase-tab ${responseTab === "headers" ? "active" : ""}`}
                  onClick={() => setResponseTab("headers")}
                  disabled={!result.headers}
                  type="button"
                >
                  Headers
                </button>
              </div>

              {responseTab === "body" && (
                <pre className="apibase-response-body">
                  {result.error ? result.error : JSON.stringify(result.body, null, 2)}
                </pre>
              )}

              {responseTab === "headers" && (
                <div className="apibase-headers-table">
                  {result.headers ? (
                    Object.entries(result.headers).map(([key, value]) => (
                      <div className="apibase-headers-row" key={key}>
                        <span className="apibase-headers-key">{key}</span>
                        <span className="apibase-headers-value">{value}</span>
                      </div>
                    ))
                  ) : (
                    <div className="apibase-empty-note">No response headers captured.</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}