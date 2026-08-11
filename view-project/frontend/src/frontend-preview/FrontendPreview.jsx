import { useMemo, useState } from "react";
import "./styles.css";
import { useReachability } from "./hooks/useReachability";

function resolvePageUrl(baseUrl, page) {
  if (!baseUrl) return page.path;
  const trimmedBase = baseUrl.replace(/\/$/, "");
  const path = page.path.startsWith("/") ? page.path : "/" + page.path;
  return trimmedBase + path;
}

/**
 * Embedded preview of a project's own static frontend (public/*.html),
 * rendered directly via iframe against the project's local dev server.
 * See FRONTEND_PREVIEW.md at the repo root for why this is an iframe
 * and not a rewriting proxy, and why no sandbox attribute is applied.
 */
export default function FrontendPreview({
  frontendConfig,
  backendBaseUrl,
  projectKey,
}) {
  const pages = useMemo(() => {
    if (frontendConfig?.pages?.length) return frontendConfig.pages;
    if (frontendConfig?.url) return [{ label: "Preview", path: "/" }];
    return [];
  }, [frontendConfig]);

  const baseUrl = frontendConfig?.url || backendBaseUrl;
  const [activeIndex, setActiveIndex] = useState(0);
  const activePage = pages[activeIndex] || null;
  const activeUrl = activePage ? resolvePageUrl(baseUrl, activePage) : null;
  const { status, retry } = useReachability(activeUrl);
  const runCommand = "cd " + projectKey + " && npm install && npm start";

  if (pages.length === 0) {
    return (
      <div className="frontend-preview">
        <div className="fp-empty">
          <p>No frontend preview is configured for this project yet.</p>
          <p className="fp-empty-hint">
            Add a "pages" array under frontendConfig in this project's
            project-page.json to enable one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="frontend-preview">
      <div className="fp-tabs">
        {pages.map((page, index) => (
          <button
            key={page.label + "-" + index}
            type="button"
            className={"fp-tab" + (index === activeIndex ? " active" : "")}
            onClick={() => setActiveIndex(index)}
          >
            {page.label}
          </button>
        ))}
        <div className="fp-tabs-spacer" />
        {activeUrl && (
          <a
            className="fp-open-new-tab"
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in new tab
          </a>
        )}
      </div>

      <div className="fp-frame-wrap">
        {status !== "reachable" && (
          <div className="fp-status-overlay">
            {status === "checking" && (
              <p className="fp-status-title">Checking for a local server...</p>
            )}

            {status === "unreachable" && (
              <>
                <p className="fp-status-title">Can't reach this preview.</p>
                <p className="fp-status-hint">
                  Either the project's server isn't running locally, or this
                  browser is blocking a local (http) preview on a secure (https)
                  page. "Open in new tab" above works either way.
                </p>
                <pre className="fp-status-command">{runCommand}</pre>
                <button type="button" className="fp-retry-btn" onClick={retry}>
                  Retry now
                </button>
              </>
            )}
          </div>
        )}

        {status === "reachable" && (
          <iframe
            key={activeUrl}
            title={activePage.label}
            src={activeUrl}
            className="fp-frame"
          />
        )}
      </div>
    </div>
  );
}
