export default function ProjectNavigation({ projects, selectedSlug, onSelect }) {
  return (
    <aside className="project-nav">
      <div className="project-nav-header">
        <h2>Projects</h2>
        <p>Choose a backend and inspect its API.</p>
      </div>
      <div className="project-nav-list">
        {projects.map((project) => (
          <button
            key={project.slug}
            className={`project-nav-item ${project.slug === selectedSlug ? "active" : ""}`}
            onClick={() => onSelect(project.slug)}
            type="button"
          >
            <span>{project.title}</span>
            <small>{project.category}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}
