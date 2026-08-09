import { useCallback, useEffect, useRef, useState } from "react";

const MIN_RATIO = 0.2;
const MAX_RATIO = 0.8;

/**
 * A generic vertical resizable split: `top` and `bottom` panes with a
 * draggable divider between them. Ratio is persisted to localStorage
 * per storageKey so a learner's preferred split survives a reload.
 */
export default function SplitPane({ top, bottom, storageKey, defaultRatio = 0.5 }) {
  const containerRef = useRef(null);
  const draggingRef = useRef(false);

  const [ratio, setRatio] = useState(() => {
    if (!storageKey) return defaultRatio;
    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored ? Number(stored) : null;
      return parsed && parsed > MIN_RATIO && parsed < MAX_RATIO ? parsed : defaultRatio;
    } catch {
      return defaultRatio;
    }
  });

  const persistRatio = useCallback(
    (value) => {
      if (!storageKey) return;
      try {
        window.localStorage.setItem(storageKey, String(value));
      } catch {
        // non-fatal
      }
    },
    [storageKey],
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relative = (event.clientY - rect.top) / rect.height;
      const clamped = Math.min(MAX_RATIO, Math.max(MIN_RATIO, relative));
      setRatio(clamped);
    },
    [],
  );

  const stopDragging = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    setRatio((current) => {
      persistRatio(current);
      return current;
    });
  }, [persistRatio]);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [handlePointerMove, stopDragging]);

  function startDragging() {
    draggingRef.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }

  return (
    <div className="split-pane" ref={containerRef}>
      <div className="split-pane-top" style={{ flexBasis: `${ratio * 100}%` }}>
        {top}
      </div>
      <div
        className="split-pane-divider"
        onPointerDown={startDragging}
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize request and response panels"
      >
        <span className="split-pane-grip" />
      </div>
      <div className="split-pane-bottom" style={{ flexBasis: `${(1 - ratio) * 100}%` }}>
        {bottom}
      </div>
    </div>
  );
}
