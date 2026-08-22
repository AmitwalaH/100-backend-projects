import { METHOD_COLORS } from "../constants";

export default function TabBar({
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onDuplicate,
  onNewTab,
}) {
  function handleTabKeyDown(event, tab, index) {
    // Ignore keydowns that bubbled up from a child control (the close
    // button) — only handle keys that landed on the tab itself.
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(tab.id);
      return;
    }

    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      event.preventDefault();
      const nextTab = tabs[nextIndex];
      onSelect(nextTab.id);
      // Only the active tab is in the tab order (roving tabindex below),
      // so move DOM focus along with selection or focus gets stranded
      // on a tab that's no longer reachable by Tab key.
      requestAnimationFrame(() => {
        document.getElementById(`rc-tab-${nextTab.id}`)?.focus();
      });
    }
  }

  return (
    <div className="rc-tab-bar">
      <div className="rc-tab-scroll" role="tablist" aria-label="Open requests">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              id={`rc-tab-${tab.id}`}
              className={`rc-tab ${isActive ? "active" : ""}`}
              onClick={() => onSelect(tab.id)}
              onDoubleClick={() => onDuplicate(tab.id)}
              onKeyDown={(e) => handleTabKeyDown(e, tab, index)}
              title={tab.url || tab.name}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
            >
              <span
                className="rc-tab-method"
                style={{ color: METHOD_COLORS[tab.method] || "#6b7280" }}
              >
                {tab.method}
              </span>
              <span className="rc-tab-name">{tab.name}</span>
              {tab.isDirty && (
                <span className="rc-tab-dirty" aria-label="Unsaved changes" />
              )}
              <button
                type="button"
                className="rc-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                aria-label={`Close ${tab.name}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="rc-tab-new"
        onClick={onNewTab}
        aria-label="New request"
      >
        +
      </button>
    </div>
  );
}
