import { SITE } from "../../constants";

const SearchIcon = () => (
  <svg
    className="search-icon"
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

export default function ProjectControls({
  search,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  resultCount,
}) {
  return (
    <>
      {/* Search + Filters */}
      <div className="controls" id="projects">
        <div className="search-wrapper">
          <SearchIcon />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, tech, or description…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            spellCheck={false}
            aria-label="Search projects"
          />
        </div>

        <div className="filters" role="group" aria-label="Filter by category">
          <span className="filter-label">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn${activeCategory === cat ? " active" : ""}`}
              onClick={() => onCategoryChange(cat)}
              aria-pressed={activeCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="results-bar" aria-live="polite" aria-atomic="true">
        <span className="results-count">
          Showing <strong>{resultCount}</strong> of{" "}
          <strong>{SITE.totalProjects}</strong> projects
          {activeCategory !== "All" && (
            <>
              {" "}
              in <strong>{activeCategory}</strong>
            </>
          )}
          {search.trim() && (
            <>
              {" "}
              matching "<strong>{search.trim()}</strong>"
            </>
          )}
        </span>
      </div>
    </>
  );
}
