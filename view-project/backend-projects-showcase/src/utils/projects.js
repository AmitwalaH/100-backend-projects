import { NO_DEMO_SENTINEL } from "../constants";

/**
 * Returns true if the project has a real deployed demo URL.
 */
export function hasLiveDemo(project) {
  return (
    project.liveDemo &&
    project.liveDemo !== NO_DEMO_SENTINEL &&
    project.liveDemo.startsWith("http")
  );
}

/**
 * Zero-pads a project id: 3 → "03", 12 → "12"
 */
export function formatProjectNumber(id) {
  return String(id).padStart(2, "0");
}

/**
 * Derives the unique sorted list of categories from the projects array.
 * Always prepends "All".
 */
export function getCategories(projects) {
  const unique = [...new Set(projects.map((p) => p.category))].sort();
  return ["All", ...unique];
}

/**
 * Filters projects by search query and selected category.
 * Search is case-insensitive and matches title, description, and tech stack.
 */
export function filterProjects(projects, { search, category }) {
  const q = search.trim().toLowerCase();

  return projects.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;

    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tech.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });
}
