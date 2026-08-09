import { useMemo, useState } from "react";
import ApiRunner from "./components/ApiRunner";
import ProjectNavigation from "./components/ProjectNavigation";
import { projectConfigs } from "./data/projectConfigs";

export default function App() {
  const [selectedSlug, setSelectedSlug] = useState("project-01-blog-api");
  const selectedProject = useMemo(
    () => projectConfigs.find((project) => project.slug === selectedSlug),
    [selectedSlug],
  );

  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <div>
          <p className="workspace-kicker">Local API Workspace</p>
          <h1>Backend request builder</h1>
          <p className="workspace-intro">
            Choose a backend project, select an endpoint, and run requests with a response panel.
          </p>
        </div>
      </header>

      <div className="workspace-layout">
        <ProjectNavigation
          projects={projectConfigs}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
        />

        <main className="workspace-main">
          <div className="workspace-project-card">
            <div className="card-header">
              <div>
                <p className="card-label">{selectedProject.category}</p>
                <h2>{selectedProject.title}</h2>
              </div>
              <span className="card-badge">API</span>
            </div>
            <p className="card-description">{selectedProject.description}</p>
            <div className="card-preview">
              <div className="card-preview-row">
                <span>Base URL</span>
                <code>{selectedProject.backendConfig.baseUrl}</code>
              </div>
              <div className="card-preview-row">
                <span>Endpoints</span>
                <strong>{selectedProject.backendConfig.calls.length}</strong>
              </div>
            </div>
          </div>

          <ApiRunner backendConfig={selectedProject.backendConfig} />
        </main>
      </div>
    </div>
  );
}
