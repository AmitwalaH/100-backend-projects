import ProjectApiRunner from "./ProjectApiRunner";

export default function ProjectPageRenderer({ pageConfig }) {
  if (!pageConfig) return null;

  const { backendConfig, frontendConfig } = pageConfig;

  return (
    <div className="project-page-renderer">
      <div className="project-page-actions-panel">
        <section className="project-page-backend-panel">
          <div className="panel-header">
            <div>
              <h2>Backend Runner</h2>
              <p>
                Execute real backend requests for this project in an integrated request flow.
              </p>
            </div>
            <span className="panel-badge">Backend</span>
          </div>

          <div className="backend-summary">
            <div>
              <span className="backend-summary-label">Base URL</span>
              <code>{backendConfig.baseUrl}</code>
            </div>
            <div>
              <span className="backend-summary-label">Endpoints</span>
              <strong>{backendConfig.calls.length}</strong>
            </div>
          </div>

          <ProjectApiRunner backendConfig={backendConfig} />
        </section>

        <section className="project-page-frontend-panel">
          <div className="panel-header">
            <div>
              <h2>Frontend Preview</h2>
              <p>
                Open the local project UI or view a quick summary of the frontend experience.
              </p>
            </div>
            <span className="panel-badge panel-badge-secondary">Frontend</span>
          </div>

          <div className="frontend-preview-content">
            <p className="frontend-preview-description">
              {frontendConfig?.description ??
                "This project includes a frontend preview for the current backend project."}
            </p>

            {frontendConfig?.preview?.length ? (
              <div className="frontend-preview-list">
                {frontendConfig.preview.map((item, index) => (
                  <div key={index} className="frontend-preview-item">
                    <span className="frontend-preview-label">{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="frontend-preview-list">
                <div className="frontend-preview-item">
                  <span className="frontend-preview-label">Preview</span>
                  <span>Open the live frontend or project overview.</span>
                </div>
              </div>
            )}
          </div>

          {frontendConfig?.url ? (
            <a
              href={frontendConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-action btn-frontend"
            >
              Open Frontend
            </a>
          ) : (
            <div className="frontend-preview-empty">
              Frontend link is not configured for this project.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
