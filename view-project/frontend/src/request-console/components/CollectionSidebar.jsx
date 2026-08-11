import { useMemo, useState } from "react";
import { METHOD_COLORS } from "../constants";

function groupByFolder(savedRequests) {
  const groups = new Map();
  for (const req of savedRequests) {
    const folder = req.folder || "General";
    if (!groups.has(folder)) groups.set(folder, []);
    groups.get(folder).push(req);
  }
  return Array.from(groups.entries());
}

export default function CollectionSidebar({
  savedRequests,
  history,
  onOpenSaved,
  onDeleteSaved,
  onOpenHistoryEntry,
  onClearHistory,
}) {
  const [view, setView] = useState("saved");
  const [collapsedFolders, setCollapsedFolders] = useState(() => new Set());

  const folders = useMemo(() => groupByFolder(savedRequests), [savedRequests]);

  function toggleFolder(name) {
    setCollapsedFolders((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="rc-collection-sidebar">
      <div className="rc-collection-tabs">
        <button
          type="button"
          className={view === "saved" ? "active" : ""}
          onClick={() => setView("saved")}
        >
          Saved
        </button>
        <button
          type="button"
          className={view === "history" ? "active" : ""}
          onClick={() => setView("history")}
        >
          History
        </button>
      </div>

      {view === "saved" && (
        <div className="rc-collection-list">
          {savedRequests.length === 0 && (
            <div className="rc-empty-note">
              No saved requests yet. Use Save on any request.
            </div>
          )}

          {folders.map(([folderName, requests]) => {
            const isCollapsed = collapsedFolders.has(folderName);
            return (
              <div key={folderName} className="rc-folder-group">
                <button
                  type="button"
                  className="rc-folder-header"
                  onClick={() => toggleFolder(folderName)}
                >
                  <span
                    className={
                      "rc-folder-caret" + (isCollapsed ? " collapsed" : "")
                    }
                  >
                    &#9656;
                  </span>
                  <span className="rc-folder-name">{folderName}</span>
                  <span className="rc-folder-count">{requests.length}</span>
                </button>

                {!isCollapsed &&
                  requests.map((req) => (
                    <div
                      key={req.id}
                      className="rc-collection-item"
                      onClick={() => onOpenSaved(req)}
                    >
                      <span
                        className="rc-collection-item-method"
                        style={{
                          color: METHOD_COLORS[req.method] || "#6b7280",
                        }}
                      >
                        {req.method}
                      </span>
                      <span className="rc-collection-item-name">
                        {req.name}
                      </span>
                      <button
                        type="button"
                        className="rc-collection-item-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSaved(req.id);
                        }}
                        aria-label={"Delete " + req.name}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      {view === "history" && (
        <div className="rc-collection-list">
          <div className="rc-collection-list-header">
            <span>{history.length} recent</span>
            {history.length > 0 && (
              <button
                type="button"
                className="rc-history-clear"
                onClick={onClearHistory}
              >
                Clear
              </button>
            )}
          </div>
          {history.length === 0 && (
            <div className="rc-empty-note">Nothing sent yet.</div>
          )}
          {history.map((entry) => (
            <div
              key={entry.id}
              className="rc-collection-item"
              onClick={() => onOpenHistoryEntry(entry)}
            >
              <span
                className="rc-collection-item-method"
                style={{ color: METHOD_COLORS[entry.method] || "#6b7280" }}
              >
                {entry.method}
              </span>
              <span className="rc-collection-item-name">{entry.url}</span>
              <span
                className={
                  "rc-collection-item-status " + (entry.ok ? "ok" : "err")
                }
              >
                {entry.status ?? "--"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
