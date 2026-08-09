import ProjectPageRenderer from "./ProjectPageRenderer";
import { useProjectPageConfig } from "../../hooks/useProjectPageConfig";
import { formatProjectNumber } from "../../utils/projects";
import { DIFFICULTY_CONFIG } from "../../constants";

export default function ProjectPage({ project }) {
  const pageConfig = useProjectPageConfig(project);
  const diffConfig = DIFFICULTY_CONFIG[project.difficulty] ?? DIFFICULTY_CONFIG.Beginner;
  const projectNumber = formatProjectNumber(project.id);

  return (
    <div className="project-page">
      <div className="project-page-hero">
        <div className="project-page-header">
          <div>
            <span className="project-page-number">#{projectNumber}</span>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
          </div>
          <div className="project-page-badges">
            <span className={`detail-difficulty ${diffConfig.className}`}>
              {diffConfig.label}
            </span>
            <span className="project-page-category">{project.category}</span>
          </div>
        </div>

        <div className="project-page-visuals">
          {pageConfig?.visuals?.map((visual, index) => (
            <div key={index} className={`visual-card visual-card-${visual.type}`}>
              <div className="visual-card-label">{visual.label}</div>
              <div className="visual-card-value">{visual.value}</div>
            </div>
          ))}
        </div>
      </div>

      {pageConfig ? (
        <ProjectPageRenderer pageConfig={pageConfig} />
      ) : (
        <section className="project-page-no-config">
          <div className="project-page-no-config-title">No local project page configured yet.</div>
          <p>
            Add a `project-page.json` file to this project folder and the explorer will show a local backend runner plus a frontend preview card.
          </p>
        </section>
      )}
    </div>
  );
}
