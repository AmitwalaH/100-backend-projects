import { useState, useMemo } from "react";
import { filterProjects, getCategories } from "../utils/projects";

/**
 * Encapsulates search + category filter state and derived data.
 * App and ProjectGrid don't need to know HOW filtering works.
 */
export function useProjectFilter(projects) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => getCategories(projects), [projects]);

  const filtered = useMemo(
    () => filterProjects(projects, { search, category: activeCategory }),
    [projects, search, activeCategory],
  );

  function resetFilters() {
    setSearch("");
    setActiveCategory("All");
  }

  return {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    categories,
    filtered,
    resetFilters,
    isFiltered: search.trim() !== "" || activeCategory !== "All",
  };
}
