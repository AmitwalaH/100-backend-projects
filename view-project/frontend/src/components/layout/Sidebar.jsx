import { useState, useRef, useEffect } from "react";
import { formatProjectNumber } from "../../utils/projects";

const SearchIcon = () => (
  <svg
    className="sidebar-search-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const FilterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="15"
    height="15"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export default function Sidebar({
  projects,
  filtered,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-title-row">
          <span className="sidebar-title">Projects</span>

          {/* Filter icon + dropdown */}
          <div className="sidebar-filter-wrap" ref={dropdownRef}>
            <button
              className={`sidebar-filter-icon-btn${activeCategory !== "All" ? " has-filter" : ""}`}
              onClick={() => setFilterOpen((v) => !v)}
              aria-label="Filter by category"
              title="Filter by category"
            >
              <FilterIcon />
              {activeCategory !== "All" && <span className="filter-dot" />}
            </button>

            {filterOpen && (
              <div className="sidebar-filter-dropdown">
                <div className="sfd-label">Filter by category</div>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`sfd-item${activeCategory === cat ? " active" : ""}`}
                    onClick={() => {
                      onCategoryChange(cat);
                      setFilterOpen(false);
                    }}
                  >
                    {cat}
                    {activeCategory === cat && (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        width="12"
                        height="12"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="sidebar-search">
          <SearchIcon />
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            spellCheck={false}
            aria-label="Search projects"
          />
        </div>
      </div>

      {/* Active filter indicator */}
      {activeCategory !== "All" && (
        <div className="sidebar-active-filter">
          <span>{activeCategory}</span>
          <button
            onClick={() => onCategoryChange("All")}
            aria-label="Clear filter"
          >
            ×
          </button>
        </div>
      )}

      {/* Project list */}
      <div className="sidebar-list" role="listbox" aria-label="Project list">
        {filtered.length === 0 && (
          <div className="sidebar-empty">No projects found.</div>
        )}
        {filtered.map((project) => (
          <SidebarItem
            key={project.id}
            project={project}
            isActive={selectedId === project.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Count */}
      <div className="sidebar-count">
        {filtered.length} of {projects.length} projects
        {activeCategory !== "All" && ` · ${activeCategory}`}
      </div>
    </aside>
  );
}

function SidebarItem({ project, isActive, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0 });
  const ref = useRef(null);

  function handleMouseEnter() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPos({ top: rect.top + rect.height / 2 });
    }
    setHovered(true);
  }

  return (
    <div
      ref={ref}
      className={`sidebar-item${isActive ? " active" : ""}`}
      onClick={() => onSelect(project)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      role="option"
      aria-selected={isActive}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(project)}
    >
      <span className="sidebar-item-num">
        {formatProjectNumber(project.id)}
      </span>
      <span className="sidebar-item-name">{project.title}</span>

      {/* Star-history style hover tooltip */}
      {hovered && !isActive && (
        <div className="sidebar-tooltip" style={{ top: tooltipPos.top }}>
          <span className="stt-category">{project.category}</span>
          <span className="stt-title">{project.title}</span>
          <div className="stt-tags">
            {project.tech.slice(0, 3).map((t) => (
              <span key={t} className="stt-tag">
                {t}
              </span>
            ))}
            {project.tech.length > 3 && (
              <span className="stt-tag">+{project.tech.length - 3}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
