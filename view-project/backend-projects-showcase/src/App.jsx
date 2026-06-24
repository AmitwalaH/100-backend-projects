import projectsData from "./data/projects.json";
import { useProjectFilter } from "./hooks/useProjectFilter";

import Navbar from "./components/layout/Navbar";
import Hero from "./components/layout/Hero";
import Footer from "./components/layout/Footer";
import ProjectControls from "./components/projects/ProjectControls";
import ProjectGrid from "./components/projects/ProjectGrid";

export default function App() {
  const {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    categories,
    filtered,
    resetFilters,
  } = useProjectFilter(projectsData);

  return (
    <>
      <Navbar />
      <Hero />

      <ProjectControls
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        resultCount={filtered.length}
      />

      <ProjectGrid projects={filtered} onReset={resetFilters} />

      <Footer />
    </>
  );
}
