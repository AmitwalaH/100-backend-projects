import { DIFFICULTY_CONFIG } from "../../constants";
import { hasLiveDemo, formatProjectNumber } from "../../utils/projects";

const ExternalIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="12"
    height="12"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const CodeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="12"
    height="12"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export default function ProjectCard({ project }) {
  const num = formatProjectNumber(project.id);
  const diffConfig =
    DIFFICULTY_CONFIG[project.difficulty] ?? DIFFICULTY_CONFIG.Beginner;
  const showDemo = hasLiveDemo(project);

  return (
    <article className="project-card">
      {/* Header row */}
      <div className="card-top">
        <span className="card-number">#{num}</span>
        <span className={`card-difficulty ${diffConfig.className}`}>
          {diffConfig.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="card-title">{project.title}</h3>

      {/* Description */}
      <p className="card-desc">{project.description}</p>

      {/* Tech tags */}
      <div className="card-tags">
        {project.tech.map((tag) => (
          <span key={tag} className="tech-tag">
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="card-footer">
        {showDemo && (
          <a
            href={project.liveDemo}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-demo"
            aria-label={`Live demo for ${project.title}`}
          >
            <ExternalIcon /> Live Demo
          </a>
        )}
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-code"
          aria-label={`View source code for ${project.title}`}
        >
          <CodeIcon /> View Code
        </a>
      </div>
    </article>
  );
}
