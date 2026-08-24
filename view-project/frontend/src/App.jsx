import { useMemo, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import rawProjectsData from "../../../project-manifest.json";
import { validateProjects } from "./utils/validateProjects";
import { useProjectFilter } from "./hooks/useProjectFilter";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import CommandPalette from "./components/projects/CommandPalette";
import WelcomeScreen from "./components/projects/WelcomeScreen";
import ProjectDetail from "./components/projects/ProjectDetail";
import ProjectPage from "./components/projects/ProjectPage";
import { GridErrorBoundary } from "./components/GridErrorBoundary";

const projectsData = validateProjects(rawProjectsData);

// Slug: "Blog API" → "blog-api", matches what's in the URL
function toSlug(project) {
  if (!project) return "";
  return (
    project.slug ||
    project.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  );
}

function Shell() {
  const navigate = useNavigate();
  const { slug } = useParams();

  // Sidebar is gone, but prev/next on the detail page still walks the
  // filtered list, so the hook stays — it just defaults to the full
  // project list now since nothing drives search/activeCategory anymore
  // except the command palette handing us an initial category below.
  const { filtered } = useProjectFilter(projectsData);

  // Find selected project from URL slug
  const selected = useMemo(
    () => projectsData.find((p) => toSlug(p) === slug) ?? null,
    [slug],
  );

  // Prev/next within the FILTERED list
  const selectedIndex = useMemo(
    () => filtered.findIndex((p) => p.id === selected?.id),
    [filtered, selected],
  );

  const prevProject = selectedIndex > 0 ? filtered[selectedIndex - 1] : null;
  const nextProject =
    selectedIndex < filtered.length - 1 ? filtered[selectedIndex + 1] : null;

  function handleSelect(project) {
    navigate(`/project/${toSlug(project)}`);
    // Scroll main panel to top on mobile
    const main = document.querySelector(".main");
    if (main) main.scrollTop = 0;
  }

  return (
    <>
      <Navbar />
      <div className="shell">
        <main className="main">
          <GridErrorBoundary>
            {selected ? (
              <ProjectDetail
                project={selected}
                prevProject={prevProject}
                nextProject={nextProject}
                onNavigate={handleSelect}
              />
            ) : (
              <WelcomeScreen onSelectProject={handleSelect} />
            )}
          </GridErrorBoundary>
        </main>
      </div>
      <CommandPalette onSelect={handleSelect} />
      <Footer />
    </>
  );
}

export default function App() {
  // Single permanent theme — dark. The html[data-theme="dark"] CSS rules
  // already cover every screen, so we just force the attribute on once.
  useEffect(() => {
    document.documentElement.dataset.theme = "dark";
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Both routes render the same Shell — slug presence determines what's shown */}
        <Route path="/" element={<Shell />} />
        <Route path="/project/:slug" element={<Shell />} />
        <Route path="/project-page/:slug" element={<ProjectPageShell />} />
        {/* Catch-all: redirect unknown paths to home */}
        <Route path="*" element={<Shell />} />
      </Routes>
    </BrowserRouter>
  );
}

function ProjectPageShell() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const selected = useMemo(
    () => projectsData.find((p) => toSlug(p) === slug) ?? null,
    [slug],
  );

  return (
    <div className="shell">
      <main className="main">
        <GridErrorBoundary>
          {selected ? (
            <ProjectPage project={selected} />
          ) : (
            <WelcomeScreen
              onSelectProject={(project) =>
                navigate(`/project/${toSlug(project)}`)
              }
            />
          )}
        </GridErrorBoundary>
      </main>
    </div>
  );
}
