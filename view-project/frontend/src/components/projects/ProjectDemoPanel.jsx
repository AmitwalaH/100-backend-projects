import { useState } from "react";

const METHOD_COLORS = {
  GET: "#16a34a",
  POST: "#2563eb",
  PUT: "#d97706",
  PATCH: "#d97706",
  DELETE: "#dc2626",
};

function StatusBadge({ status }) {
  const color =
    status >= 200 && status < 300
      ? "#16a34a"
      : status >= 300 && status < 400
        ? "#2563eb"
        : "#dc2626";
  return (
    <span className="status-badge" style={{ color, borderColor: color }}>
      {status}
    </span>
  );
}

function EndpointRunner({ endpoint }) {
  const [state, setState] = useState("idle"); // idle | running | done

  function handleRun() {
    setState("running");
    const delay = Math.max(endpoint.responseTimeMs ?? 400, 300);
    setTimeout(() => setState("done"), delay);
  }

  const hasRequestBody =
    endpoint.requestBody !== null && endpoint.requestBody !== undefined;

  return (
    <div className="endpoint-block">
      {/* Method + Path */}
      <div className="endpoint-header">
        <span
          className="method-badge"
          style={{
            color: METHOD_COLORS[endpoint.method],
            borderColor: METHOD_COLORS[endpoint.method],
          }}
        >
          {endpoint.method}
        </span>
        <code className="endpoint-path">{endpoint.path}</code>
      </div>

      {endpoint.description && (
        <p className="endpoint-desc">{endpoint.description}</p>
      )}

      {/* Request body */}
      {hasRequestBody && (
        <div className="endpoint-section">
          <div className="endpoint-section-label">Request Body</div>
          <pre className="json-block">
            {JSON.stringify(endpoint.requestBody, null, 2)}
          </pre>
        </div>
      )}

      {/* Run button */}
      <button
        className="btn-demo run-btn"
        onClick={handleRun}
        disabled={state === "running"}
      >
        {state === "idle" && "▶  Run Request"}
        {state === "running" && "Sending…"}
        {state === "done" && "↺  Run Again"}
      </button>

      {/* Loading dots */}
      {state === "running" && (
        <div className="endpoint-section">
          <div className="run-loading">
            <span className="run-dot" />
            <span className="run-dot" />
            <span className="run-dot" />
          </div>
        </div>
      )}

      {/* Response */}
      {state === "done" && (
        <div className="endpoint-section response-section">
          <div className="endpoint-section-label">
            Response
            <StatusBadge status={endpoint.responseStatus} />
            <span className="response-time">
              {endpoint.responseTimeMs ?? "—"}ms
            </span>
          </div>
          <pre className="json-block">
            {JSON.stringify(endpoint.responseBody, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function ProjectDemoPanel({ demo }) {
  if (!demo) return null;

  return (
    <div className="demo-panel">
      <div className="demo-panel-header">
        <span className="demo-panel-label">API Playground</span>
        <code className="base-url">{demo.baseUrl}</code>
      </div>

      {demo.endpoints.map((endpoint, i) => (
        <EndpointRunner
          key={`${endpoint.method}-${endpoint.path}-${i}`}
          endpoint={endpoint}
        />
      ))}

      <p className="demo-disclaimer">
        Real captured request/response from this project's own test run — not a
        live server.
      </p>
    </div>
  );
}
