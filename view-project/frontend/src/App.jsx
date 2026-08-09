import { useMemo, useState, useEffect } from "react";
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
import Sidebar from "./components/layout/Sidebar";
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

function Shell({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const { slug } = useParams();

  const {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    categories,
    filtered,
  } = useProjectFilter(projectsData);

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
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <div className="shell">
        <Sidebar
          projects={projectsData}
          filtered={filtered}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          search={search}
          onSearchChange={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

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
              <WelcomeScreen />
            )}
          </GridErrorBoundary>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return (
      window.localStorage.getItem("apiExplorerTheme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("apiExplorerTheme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Both routes render the same Shell — slug presence determines what's shown */}
        <Route path="/" element={<Shell theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/project/:slug" element={<Shell theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/project-page/:slug" element={<ProjectPageShell theme={theme} onToggleTheme={toggleTheme} />} />
        {/* Catch-all: redirect unknown paths to home */}
        <Route path="*" element={<Shell theme={theme} onToggleTheme={toggleTheme} />} />
      </Routes>
    </BrowserRouter>
  );
}

function ProjectPageShell({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const { slug } = useParams();

  const {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    categories,
    filtered,
  } = useProjectFilter(projectsData);

  const selected = useMemo(
    () => projectsData.find((p) => toSlug(p) === slug) ?? null,
    [slug],
  );

  return (
    <>
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <div className="shell">
        <Sidebar
          projects={projectsData}
          filtered={filtered}
          selectedId={selected?.id ?? null}
          onSelect={(project) => navigate(`/project/${toSlug(project)}`)}
          search={search}
          onSearchChange={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        <main className="main">
          <GridErrorBoundary>
            {selected ? <ProjectPage project={selected} /> : <WelcomeScreen />}
          </GridErrorBoundary>
        </main>
      </div>
      <Footer />
    </>
  );
}
