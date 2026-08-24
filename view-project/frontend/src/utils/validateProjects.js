import { DIFFICULTY_CONFIG } from "../constants";

const REQUIRED_FIELDS = [
  "id",
  "title",
  "description",
  "tech",
  "category",
  "github",
];
const VALID_DIFFICULTIES = Object.keys(DIFFICULTY_CONFIG);

function describeProblems(project, index) {
  const problems = [];
  const label = project?.title || project?.id || `entry at index ${index}`;

  for (const field of REQUIRED_FIELDS) {
    if (
      project[field] === undefined ||
      project[field] === null ||
      project[field] === ""
    ) {
      problems.push(`"${label}" is missing required field "${field}"`);
    }
  }

  if (project.tech !== undefined && !Array.isArray(project.tech)) {
    problems.push(`"${label}" has "tech" that isn't an array`);
  }

  if (
    project.difficulty !== undefined &&
    !VALID_DIFFICULTIES.includes(project.difficulty)
  ) {
    problems.push(
      `"${label}" has difficulty "${project.difficulty}", expected one of: ${VALID_DIFFICULTIES.join(", ")}`,
    );
  }

  if (project.github !== undefined && !/^https?:\/\//.test(project.github)) {
    problems.push(`"${label}" has a "github" URL that isn't http(s)`);
  }

  if (project.liveDemo !== undefined && project.liveDemo !== false) {
    if (project.liveDemo !== "#" && typeof project.liveDemo === "string") {
      if (!/^https?:\/\//.test(project.liveDemo)) {
        problems.push(`"${label}" has a "liveDemo" URL that isn't http(s)`);
      }
    } else if (project.liveDemo !== "#" && typeof project.liveDemo !== "string") {
      problems.push(`"${label}" has a "liveDemo" value that must be false, "#", or an http(s) URL`);
    }
  }

  return problems;
}

export function validateProjects(rawProjects) {
  if (!Array.isArray(rawProjects))
    throw new Error("project-manifest.json must be an array");

  const seenIds = new Set();
  const valid = [];
  const allProblems = [];

  rawProjects.forEach((project, index) => {
    const problems = describeProblems(project, index);

    if (project?.id !== undefined) {
      if (seenIds.has(project.id)) {
        problems.push(`duplicate id "${project.id}"`);
      }
      seenIds.add(project.id);
    }

    if (problems.length > 0) {
      allProblems.push(...problems);
      return;
    }

    valid.push(project);
  });

  if (allProblems.length > 0) {
    const message = `Invalid entries in project-manifest.json:\n${allProblems.map((p) => `  - ${p}`).join("\n")}`;
    if (import.meta.env?.DEV) throw new Error(message);
    console.warn(message);
  }

  return valid;
}
