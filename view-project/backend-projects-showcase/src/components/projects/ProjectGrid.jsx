import ProjectCard from "./ProjectCard";

const EmptyIcon = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#d4d4d8"
    strokeWidth="1.5"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export default function ProjectGrid({ projects, onReset }) {
  if (projects.length === 0) {
    return (
      <div className="grid-wrapper">
        <div className="empty-state">
          <EmptyIcon />
          <p>No projects match your search.</p>
          {onReset && (
            <button
              className="filter-btn"
              onClick={onReset}
              style={{ marginTop: "12px" }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid-wrapper">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
