import { useMemo } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import rawProjectsData from "./data/projects.json";
import { validateProjects } from "./utils/validateProjects";
import { useProjectFilter } from "./hooks/useProjectFilter";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Sidebar from "./components/layout/Sidebar";
import WelcomeScreen from "./components/projects/WelcomeScreen";
import ProjectDetail from "./components/projects/ProjectDetail";
import { GridErrorBoundary } from "./components/GridErrorBoundary";

const projectsData = validateProjects(rawProjectsData);

// Slug: "Blog API" → "blog-api", matches what's in the URL
function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function Shell() {
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
    () => projectsData.find((p) => toSlug(p.title) === slug) ?? null,
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
    navigate(`/project/${toSlug(project.title)}`);
    // Scroll main panel to top on mobile
    const main = document.querySelector(".main");
    if (main) main.scrollTop = 0;
  }

  return (
    <>
      <Navbar />
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
  return (
    <BrowserRouter>
      <Routes>
        {/* Both routes render the same Shell — slug presence determines what's shown */}
        <Route path="/" element={<Shell />} />
        <Route path="/project/:slug" element={<Shell />} />
        {/* Catch-all: redirect unknown paths to home */}
        <Route path="*" element={<Shell />} />
      </Routes>
    </BrowserRouter>
  );
}
