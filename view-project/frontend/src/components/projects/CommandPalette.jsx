import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import projectsData from "../../../../../project-manifest.json";
import { formatProjectNumber } from "../../utils/projects";

const SearchIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

/**
 * openSignal: bump this number (from a parent) to request the palette open,
 *   e.g. from a WelcomeScreen category chip. Optional — ⌘K and the trigger
 *   button work with no parent involvement at all.
 * initialCategory: category to pre-filter to the next time openSignal fires.
 * onSelect: optional callback(project) fired on selection, in addition to
 *   the palette's own navigate() — lets a parent do extra bookkeeping
 *   (e.g. scrolling .main to top, matching the old Sidebar's onSelect).
 */
export default function CommandPalette({
  openSignal,
  initialCategory = null,
  onSelect,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    for (const p of projectsData)
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projectsData
      .filter((p) => {
        if (activeCategory && p.category !== activeCategory) return false;
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tech || []).some((t) => t.toLowerCase().includes(q))
        );
      })
      .slice(0, 50);
  }, [query, activeCategory]);

  // Reset the highlighted row whenever the search itself changes. This is a
  // derived-state adjustment, not a side effect on an external system, so
  // React's own guidance is to do it during render (comparing against the
  // previous render's key) rather than in a useEffect — it avoids an extra
  // render/commit round-trip and the cascading-render lint warning.
  const resultsKey = `${query}|${activeCategory ?? ""}|${results.length}`;
  const [prevResultsKey, setPrevResultsKey] = useState(resultsKey);
  if (resultsKey !== prevResultsKey) {
    setPrevResultsKey(resultsKey);
    setActiveIndex(0);
  }

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveCategory(null);
    setActiveIndex(0);
  }, []);

  const selectProject = useCallback(
    (project) => {
      if (!project) return;
      navigate(`/project/${project.slug}`);
      onSelect?.(project);
      close();
    },
    [navigate, onSelect, close],
  );

  // External open request (e.g. a WelcomeScreen chip). Same render-time
  // comparison technique as above: initializing prevOpenSignal to the first
  // openSignal value makes the very first render a no-op automatically, so
  // there's no separate "skip on mount" ref to maintain.
  const [prevOpenSignal, setPrevOpenSignal] = useState(openSignal);
  if (openSignal !== undefined && openSignal !== prevOpenSignal) {
    setPrevOpenSignal(openSignal);
    setIsOpen(true);
    setActiveCategory(initialCategory ?? null);
    setQuery("");
  }

  // Cmd+K / Ctrl+K toggles globally; Escape closes
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen((prev) => {
          if (prev) close();
          return prev;
        });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  function handleInputKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectProject(results[activeIndex]);
    }
  }

  return (
    <>
      <button
        type="button"
        className="cmdk-trigger"
        onClick={() => setIsOpen(true)}
      >
        <SearchIcon className="cmdk-trigger-icon" />
        <span>Find a project</span>
        <span className="cmdk-trigger-kbd">⌘K</span>
      </button>

      {isOpen && (
        <div className="cmdk-backdrop" onClick={close}>
          <div className="cmdk-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cmdk-input-row">
              <SearchIcon className="cmdk-input-icon" />
              <input
                ref={inputRef}
                className="cmdk-input"
                type="text"
                placeholder="Search projects, categories, tech..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              <span className="cmdk-input-esc">ESC</span>
            </div>

            <div className="cmdk-categories">
              <div className="cmdk-categories-label">Categories</div>
              <div className="cmdk-categories-row">
                {categoryCounts.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={
                      "cmdk-category-chip" +
                      (activeCategory === c.name ? " active" : "")
                    }
                    onClick={() =>
                      setActiveCategory((cur) =>
                        cur === c.name ? null : c.name,
                      )
                    }
                  >
                    {c.name}
                    <span className="cmdk-category-chip-count">{c.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cmdk-results">
              {results.length === 0 ? (
                <div className="cmdk-empty">No projects match "{query}"</div>
              ) : (
                results.map((project, index) => (
                  <div
                    key={project.slug || project.id}
                    className={
                      "cmdk-item" + (index === activeIndex ? " active" : "")
                    }
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectProject(project)}
                  >
                    <span className="cmdk-item-num">
                      {formatProjectNumber(project.id)}
                    </span>
                    <div className="cmdk-item-main">
                      <div className="cmdk-item-name">{project.title}</div>
                      <div className="cmdk-item-meta">
                        <span className="cmdk-item-category">
                          {project.category}
                        </span>
                        {project.tech?.length > 0 && (
                          <span className="cmdk-item-tech">
                            {project.tech.join(" · ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="cmdk-item-enter">↵</span>
                  </div>
                ))
              )}
            </div>

            <div className="cmdk-footer">
              <span className="cmdk-footer-hint">
                <kbd>↑</kbd>
                <kbd>↓</kbd> navigate
              </span>
              <span className="cmdk-footer-hint">
                <kbd>↵</kbd> select
              </span>
              <span className="cmdk-footer-hint">
                <kbd>esc</kbd> close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}