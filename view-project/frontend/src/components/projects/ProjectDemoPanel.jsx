import { useState } from "react";

// In dev: http://localhost:3001
// In prod: set VITE_API_URL to your deployed backend URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

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

function EndpointRunner({ endpoint, projectSlug }) {
  const [state, setState] = useState("idle"); // idle | running | done | error
  const [result, setResult] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const hasRequestBody =
    endpoint.requestBody !== null && endpoint.requestBody !== undefined;

  async function handleRun() {
    setState("running");
    setResult(null);

    const start = Date.now();

    try {
      const res = await fetch(`${API_BASE}/api/demo/${projectSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: endpoint.method,
          path: endpoint.path,
          body: endpoint.requestBody ?? {},
        }),
      });

      const data = await res.json();
      const ms = Date.now() - start;

      if (data.fallback) {
        // Backend has no sandbox for this project — show captured data
        setResult({
          status: endpoint.responseStatus,
          body: endpoint.responseBody,
          ms: endpoint.responseTimeMs,
          live: false,
        });
      } else {
        setResult({
          status: res.status,
          body: data,
          ms,
          live: true,
        });
        setIsLive(true);
      }
    } catch {
      // Network error (backend not running) — fall back to captured data
      setResult({
        status: endpoint.responseStatus,
        body: endpoint.responseBody,
        ms: endpoint.responseTimeMs,
        live: false,
      });
    }

    setState("done");
  }

  return (
    <div className="endpoint-block">
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
        {state === "done" && result?.live && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.65rem",
              color: "#16a34a",
              fontWeight: 600,
            }}
          >
            ● LIVE
          </span>
        )}
      </div>

      {endpoint.description && (
        <p className="endpoint-desc">{endpoint.description}</p>
      )}

      {hasRequestBody && (
        <div className="endpoint-section">
          <div className="endpoint-section-label">Request Body</div>
          <pre className="json-block">
            {JSON.stringify(endpoint.requestBody, null, 2)}
          </pre>
        </div>
      )}

      <button
        className="btn-demo run-btn"
        onClick={handleRun}
        disabled={state === "running"}
      >
        {state === "idle" && "▶  Run Request"}
        {state === "running" && "Sending…"}
        {state === "done" && "↺  Run Again"}
      </button>

      {state === "running" && (
        <div className="endpoint-section">
          <div className="run-loading">
            <span className="run-dot" />
            <span className="run-dot" />
            <span className="run-dot" />
          </div>
        </div>
      )}

      {state === "done" && result && (
        <div className="endpoint-section response-section">
          <div className="endpoint-section-label">
            Response
            <StatusBadge status={result.status} />
            <span className="response-time">{result.ms}ms</span>
            {!result.live && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.62rem",
                  color: "#a3a39c",
                }}
              >
                captured example
              </span>
            )}
          </div>
          <pre className="json-block">
            {JSON.stringify(result.body, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function ProjectDemoPanel({ demo, projectSlug }) {
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
          projectSlug={projectSlug}
        />
      ))}

      <p className="demo-disclaimer">
        Live responses use a shared demo database — data resets periodically.
        Projects without a live sandbox show captured examples.
      </p>
    </div>
  );
}
