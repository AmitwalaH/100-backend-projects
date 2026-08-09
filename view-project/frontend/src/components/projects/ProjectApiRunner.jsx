import { useState, useMemo } from "react";

export default function ProjectApiRunner({ backendConfig }) {
  const [resultByIndex, setResultByIndex] = useState({});
  const [editorValueByIndex, setEditorValueByIndex] = useState(() => {
    if (!backendConfig?.calls) return {};
    return backendConfig.calls.reduce((map, call, index) => {
      map[index] = call.requestBody ? JSON.stringify(call.requestBody, null, 2) : "";
      return map;
    }, {});
  });

  const hasCalls = useMemo(
    () => Array.isArray(backendConfig?.calls) && backendConfig.calls.length > 0,
    [backendConfig],
  );

  if (!backendConfig || !backendConfig.baseUrl || !hasCalls) {
    return null;
  }

  function updateRequestBody(index, value) {
    setEditorValueByIndex((state) => ({ ...state, [index]: value }));
  }

  async function runCall(call, index) {
    const bodyText = editorValueByIndex[index] ?? "";
    let parsedBody = null;

    if (call.method.toUpperCase() !== "GET" && call.method.toUpperCase() !== "DELETE") {
      if (bodyText.trim().length > 0) {
        try {
          parsedBody = JSON.parse(bodyText);
        } catch (err) {
          setResultByIndex((state) => ({
            ...state,
            [index]: {
              status: "error",
              ok: false,
              error: `Invalid JSON: ${err.message}`,
              url: `${backendConfig.baseUrl.replace(/\/$/, "")}${call.path}`,
            },
          }));
          return;
        }
      } else {
        parsedBody = {};
      }
    }

    setResultByIndex((state) => ({
      ...state,
      [index]: { status: "running", body: null, error: null, startedAt: Date.now() },
    }));

    try {
      const response = await fetch("/api/project-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseUrl: backendConfig.baseUrl,
          method: call.method,
          path: call.path,
          requestBody: parsedBody,
        }),
      });

      const json = await response.json();
      const elapsed = Date.now() - (resultByIndex[index]?.startedAt || Date.now());

      setResultByIndex((state) => ({
        ...state,
        [index]: {
          status: json.status ?? response.status,
          ok: json.ok ?? response.ok,
          body: json.body ?? null,
          url: json.url ?? `${backendConfig.baseUrl.replace(/\/$/, "")}${call.path}`,
          statusText: json.statusText,
          error: json.error || null,
          timelineMs: elapsed,
          headers: json.headers || null,
        },
      }));
    } catch (err) {
      setResultByIndex((state) => ({
        ...state,
        [index]: {
          status: "error",
          ok: false,
          error: err.message,
          url: `${backendConfig.baseUrl.replace(/\/$/, "")}${call.path}`,
        },
      }));
    }
  }

  return (
    <div className="api-runner">
      <div className="api-runner-header">
        <div>
          <span className="api-workspace-badge">API Workspace</span>
          <h3>Backend API Runner</h3>
          <p>Send requests directly to the local backend and inspect response details.</p>
        </div>
        <div className="api-runner-base-info">
          <span className="api-runner-label">Base URL</span>
          <code className="api-runner-base-url">{backendConfig.baseUrl}</code>
        </div>
      </div>

      {backendConfig.calls.map((call, index) => {
        const result = resultByIndex[index];
        const requestBodyText = editorValueByIndex[index] ?? "";
        const isBodyEditable = !["GET", "DELETE"].includes(call.method.toUpperCase());

        return (
          <div key={`${call.method}-${call.path}-${index}`} className="api-call-card">
            <div className="api-call-row api-call-row-top">
              <span className={`api-call-method api-call-method-${call.method.toLowerCase()}`}>
                {call.method}
              </span>
              <div className="api-call-route">
                <span className="api-call-route-prefix">{backendConfig.baseUrl}</span>
                <code>{call.path}</code>
              </div>
              <button className="btn-run-api" onClick={() => runCall(call, index)}>
                Run
              </button>
            </div>

            <p className="api-call-description">{call.description}</p>

            {isBodyEditable && (
              <div className="api-call-section api-call-editor">
                <div className="api-call-section-label">Request Body</div>
                <textarea
                  className="api-call-textarea"
                  value={requestBodyText}
                  onChange={(e) => updateRequestBody(index, e.target.value)}
                  spellCheck={false}
                  aria-label={`Request body for ${call.method} ${call.path}`}
                />
                <div className="api-editor-hint">You can modify the payload before sending.</div>
              </div>
            )}

            {result && (
              <div className="api-call-result">
                <div className="api-call-result-header">
                  <div>
                    <span
                      className={`status-pill status-pill-${result.ok ? "success" : result.status === "running" ? "running" : "error"}`}
                    >
                      {result.ok ? "Success" : result.status === "running" ? "Running" : "Error"}
                    </span>
                    <span className="api-result-status-code">{result.status}</span>
                    <span className="api-result-time">{result.timelineMs ? `${result.timelineMs} ms` : ""}</span>
                  </div>
                  <div className="api-result-url">{result.url}</div>
                </div>
                {result.error ? (
                  <pre className="json-block">{result.error}</pre>
                ) : (
                  <pre className="json-block">{JSON.stringify(result.body, null, 2)}</pre>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
