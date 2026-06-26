import { validateDemoFiles } from "../utils/validateDemoFiles";

// Relative path — Vite resolves this relative to THIS file's location:
// src/hooks/useProjectDemo.js → up 3 levels → repo root → project-*/demo.json
// DO NOT change to an absolute path (starting with /) — that breaks Vite's glob resolution.
const rawDemoModules = import.meta.glob("../../../project-*/demo.json", {
  eager: true,
  import: "default",
});

const demoByFolder = validateDemoFiles(rawDemoModules);

function getFolderName(githubUrl) {
  const match = githubUrl?.match(/(project-[\w-]+)\/?$/);
  return match ? match[1] : null;
}

export function useProjectDemo(project) {
  const folderName = getFolderName(project?.github);
  return folderName ? (demoByFolder[folderName] ?? null) : null;
}