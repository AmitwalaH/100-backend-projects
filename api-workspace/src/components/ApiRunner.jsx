import { useMemo, useState } from "react";

export default function ApiRunner({ backendConfig }) {
  const [requestBodyByIndex, setRequestBodyByIndex] = useState(() => {
    return backendConfig.calls.reduce((acc, call, index) => {
      acc[index] = call.requestBody ? JSON.stringify(call.requestBody, null, 2) : "";
      return acc;
    }, {});
  });

  const [resultsByIndex, setResultsByIndex] = useState({});
  const [activeCallIndex, setActiveCallIndex] = useState(0);

  const hasCalls = useMemo(
    () => Array.isArray(backendConfig?.calls) && backendConfig.calls.length > 0,
    [backendConfig],
  );

  if (!backendConfig || !hasCalls) {
    return (
      <div className="api-runner-empty">
        No API call definitions are available for this project.
      </div>
    );
  }

  function updateBody(index, value) {
    setRequestBodyByIndex((current) => ({ ...current, [index]: value }));
  }

  async function executeCall(call, index) {
    const bodyText = requestBodyByIndex[index] ?? "";
    let bodyValue = null;

    if (!["GET", "DELETE"].includes(call.method.toUpperCase())) {
      if (bodyText.trim().length > 0) {
        try {
          bodyValue = JSON.parse(bodyText);
        } catch (err) {
          setResultsByIndex((current) => ({
            ...current,
            [index]: {
              ok: false,
              status: "invalid-json",
              error: err.message,
              url: `${backendConfig.baseUrl}${call.path}`,
            },
          }));
          return;
        }
      }
    }

    setResultsByIndex((current) => ({
      ...current,
      [index]: {
        status: "running",
        ok: null,
      },
    }));

    try {
      const proxyResponse = await fetch("/api/project-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: backendConfig.baseUrl,
          path: call.path,
          method: call.method,
          requestBody: bodyValue,
        }),
      });

      const payload = await proxyResponse.json();

      setResultsByIndex((current) => ({
        ...current,
        [index]: {
          ok: payload.ok,
          status: payload.status ?? proxyResponse.status,
          statusText: payload.statusText || proxyResponse.statusText,
          body: payload.body ?? payload,
          url: payload.url,
          error: payload.error || null,
          durationMs: payload.durationMs,
        },
      }));
    } catch (err) {
      setResultsByIndex((current) => ({
        ...current,
        [index]: {
          ok: false,
          status: "network-error",
          error: err.message,
          url: `${backendConfig.baseUrl}${call.path}`,
        },
      }));
    }
  }

  return (
    <div className="api-runner-panel">
      <div className="api-runner-summary">
        <div>
          <h3>Request Builder</h3>
          <p>Choose an endpoint, edit the request, and inspect the response in a dedicated view.</p>
        </div>
        <div className="api-runner-summary-badge">Local Proxy</div>
      </div>

      <div className="api-runner-shell">
        <aside className="api-call-sidebar">
          <div className="api-sidebar-header">
            <span>Endpoints</span>
            <strong>{backendConfig.calls.length}</strong>
          </div>
          <div className="api-sidebar-list">
            {backendConfig.calls.map((call, index) => (
              <button
                key={`${call.method}-${call.path}-${index}`}
                type="button"
                className={`api-sidebar-item ${activeCallIndex === index ? "active" : ""}`}
                onClick={() => setActiveCallIndex(index)}
              >
                <span className={`api-method-mini api-method-${call.method.toLowerCase()}`}>
                  {call.method}
                </span>
                <span>{call.path}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="api-call-editor-panel">
          {backendConfig.calls.map((call, index) => {
            if (index !== activeCallIndex) return null;
            const result = resultsByIndex[index];
            const bodyText = requestBodyByIndex[index] ?? "";
            const editable = !["GET", "DELETE"].includes(call.method.toUpperCase());

            return (
              <div key={index} className="api-call-editor-card">
                <div className="api-call-editor-top">
                  <div>
                    <p className="api-call-label">{call.method} {call.path}</p>
                    <p className="api-call-description">{call.description}</p>
                  </div>
                  <button className="btn-send-full" onClick={() => executeCall(call, index)}>
                    Send Request
                  </button>
                </div>

                <div className="api-call-meta-row">
                  <div className="api-call-meta">
                    <span>URL</span>
                    <code>{backendConfig.baseUrl}{call.path}</code>
                  </div>
                  <div className="api-call-meta">
                    <span>Method</span>
                    <strong>{call.method}</strong>
                  </div>
                </div>

                {editable && (
                  <div className="api-call-body-section">
                    <div className="api-call-body-header">
                      <span>Body</span>
                      <small>JSON</small>
                    </div>
                    <textarea
                      value={bodyText}
                      onChange={(event) => updateBody(index, event.target.value)}
                      className="api-call-body-editor"
                      spellCheck={false}
                      placeholder="Edit JSON payload before sending"
                    />
                  </div>
                )}

                <div className="api-response-panel">
                  <div className="api-response-toolbar">
                    <span>Response</span>
                    {result?.durationMs ? <small>{result.durationMs} ms</small> : null}
                  </div>
                  {result ? (
                    <div className="api-response-content">
                      <div className="api-response-status">
                        <span className={`response-pill response-pill-${result.ok ? "success" : result.status === "running" ? "running" : "error"}`}>
                          {result.status === "running" ? "Running" : result.ok ? "Success" : "Error"}
                        </span>
                        <span>{result.statusText || result.status}</span>
                      </div>
                      <pre className="response-body">{result.error ? result.error : JSON.stringify(result.body, null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="api-response-empty">Send a request to view response details here.</div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
