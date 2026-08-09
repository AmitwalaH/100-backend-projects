import { Link } from "react-router-dom";
import RequestConsole from "../../request-console";
import { useProjectPageConfig } from "../../hooks/useProjectPageConfig";
import { formatProjectNumber } from "../../utils/projects";
import { DIFFICULTY_CONFIG } from "../../constants";

export default function ProjectPage({ project }) {
  const pageConfig = useProjectPageConfig(project);
  const diffConfig =
    DIFFICULTY_CONFIG[project.difficulty] ?? DIFFICULTY_CONFIG.Beginner;
  const projectNumber = formatProjectNumber(project.id);
  const projectKey = project.slug || `project-${project.id}`;
  const frontendUrl = pageConfig?.frontendConfig?.url;

  return (
    <div className="project-page project-page-console-mode">
      <div className="project-page-topbar">
        <div className="project-page-topbar-main">
          <Link to="/" className="project-page-back-link">
            Projects
          </Link>
          <span className="project-page-number">#{projectNumber}</span>
          <h1>{project.title}</h1>
          <span className={`detail-difficulty ${diffConfig.className}`}>
            {diffConfig.label}
          </span>
          <span className="project-page-category">{project.category}</span>
        </div>

        {frontendUrl && (
          <a
            href={frontendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="project-page-frontend-link"
          >
            Frontend Preview
          </a>
        )}
      </div>

      {pageConfig ? (
        <RequestConsole
          backendConfig={pageConfig.backendConfig}
          projectKey={projectKey}
        />
      ) : (
        <section className="project-page-no-config">
          <div className="project-page-no-config-title">
            No local project page configured yet.
          </div>
          <p>
            Add a project-page.json file to this project folder and the explorer
            will show a local backend runner here.
          </p>
        </section>
      )}
    </div>
  );
}
