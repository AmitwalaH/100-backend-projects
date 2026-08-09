import { useState } from "react";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour12: false });
}

export default function ConsoleLog({ entries, onClear }) {
  const [isOpen, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className={`rc-console-log ${isOpen ? "open" : ""}`}>
      <button type="button" className="rc-console-toggle" onClick={() => setOpen((v) => !v)}>
        Console {entries.length > 0 && <span className="rc-console-count">{entries.length}</span>} {isOpen ? "▾" : "▸"}
      </button>

      {isOpen && (
        <div className="rc-console-body">
          <div className="rc-console-header">
            <span>{entries.length} entries this session</span>
            <button type="button" className="rc-console-clear" onClick={onClear}>
              Clear
            </button>
          </div>
          <div className="rc-console-entries">
            {entries.length === 0 && <div className="rc-empty-note">Nothing sent yet.</div>}
            {entries.map((entry) => (
              <div key={entry.id} className={`rc-console-entry rc-console-entry-${entry.level}`}>
                <div
                  className="rc-console-entry-row"
                  onClick={() => setExpandedId((id) => (id === entry.id ? null : entry.id))}
                >
                  <span className="rc-console-time">{formatTime(entry.timestamp)}</span>
                  <span className="rc-console-message">{entry.message}</span>
                </div>
                {expandedId === entry.id && entry.detail && (
                  <pre className="rc-console-detail">{JSON.stringify(entry.detail, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
