import { METHOD_COLORS } from "../constants";

export default function TabBar({ tabs, activeTabId, onSelect, onClose, onDuplicate, onNewTab }) {
  return (
    <div className="rc-tab-bar">
      <div className="rc-tab-scroll">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              className={`rc-tab ${isActive ? "active" : ""}`}
              onClick={() => onSelect(tab.id)}
              onDoubleClick={() => onDuplicate(tab.id)}
              title={tab.url || tab.name}
            >
              <span className="rc-tab-method" style={{ color: METHOD_COLORS[tab.method] || "#6b7280" }}>
                {tab.method}
              </span>
              <span className="rc-tab-name">{tab.name}</span>
              {tab.isDirty && <span className="rc-tab-dirty" aria-label="Unsaved changes" />}
              <button
                type="button"
                className="rc-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                aria-label={`Close ${tab.name}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <button type="button" className="rc-tab-new" onClick={onNewTab} aria-label="New request">
        +
      </button>
    </div>
  );
}
