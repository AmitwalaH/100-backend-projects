import { NO_DEMO_SENTINEL } from "../constants";

export function hasLiveDemo(project) {
  return (
    project.liveDemo &&
    project.liveDemo !== NO_DEMO_SENTINEL &&
    project.liveDemo.startsWith("http")
  );
}

export function formatProjectNumber(id) {
  return String(id).padStart(2, "0");
}

export function getCategories(projects) {
  const unique = [...new Set(projects.map((p) => p.category))].sort();
  return ["All", ...unique];
}

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
