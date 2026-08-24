import { DIFFICULTY_CONFIG } from "../../constants";
import { formatProjectNumber } from "../../utils/projects";

export default function ProjectGrid({ projects, onSelect }) {
  return (
    <div className="project-grid">
      {projects.map((project) => {
        const diffConfig =
          DIFFICULTY_CONFIG[project.difficulty] ?? DIFFICULTY_CONFIG.Beginner;
        const num = formatProjectNumber(project.id);
        return (
          <button
            key={project.id}
            type="button"
            className="project-card"
            onClick={() => onSelect?.(project)}
          >
            <div className="project-card-top">
              <span className="project-card-num">#{num}</span>
              <span className={`detail-difficulty ${diffConfig.className}`}>
                {diffConfig.label}
              </span>
            </div>

            <h3 className="project-card-title">{project.title}</h3>
            <p className="project-card-desc">{project.description}</p>

            <div className="project-card-footer">
              <span className="detail-category-pill">{project.category}</span>
              <div className="project-card-tech">
                {project.tech.slice(0, 3).map((t) => (
                  <span key={t} className="tech-tag">
                    {t}
                  </span>
                ))}
                {project.tech.length > 3 && (
                  <span className="tech-tag project-card-tech-more">
                    +{project.tech.length - 3}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
