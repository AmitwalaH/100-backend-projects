import { useMemo, useState } from "react";
import rawProjectsData from "./data/projects.json";
import { validateProjects } from "./utils/validateProjects";
import { useProjectFilter } from "./hooks/useProjectFilter";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Sidebar from "./components/layout/Sidebar";
import WelcomeScreen from "./components/projects/WelcomeScreen";
import ProjectDetail from "./components/projects/ProjectDetail";
import { GridErrorBoundary } from "./components/GridErrorBoundary";

// Validate once at startup — throws in dev if projects.json is malformed,
// silently drops bad entries in prod so the rest of the site still works.
const projectsData = validateProjects(rawProjectsData);

export default function App() {
  const [selected, setSelected] = useState(null);

  const {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    categories,
    filtered,
  } = useProjectFilter(projectsData);

  // When filters change, if selected project is no longer in filtered list,
  // keep it selected (user might want to read it fully) — don't force deselect.

  // Prev/next within the FILTERED list for keyboard-friendly navigation
  const selectedIndex = useMemo(
    () => filtered.findIndex((p) => p.id === selected?.id),
    [filtered, selected],
  );

  const prevProject = selectedIndex > 0 ? filtered[selectedIndex - 1] : null;
  const nextProject =
    selectedIndex < filtered.length - 1 ? filtered[selectedIndex + 1] : null;

  function handleSelect(project) {
    setSelected(project);
    // On mobile, scroll main panel to top when switching projects
    const main = document.querySelector(".main");
    if (main) main.scrollTop = 0;
  }

  return (
    <>
      <Navbar />

      <div className="shell">
        {/* ── Left Sidebar ── */}
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

        {/* ── Main Content ── */}
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
