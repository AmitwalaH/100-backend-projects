import { validateDemoFiles } from "../utils/validateDemoFiles";

// Path goes up from: src/hooks/ → src/ → frontend/ → view-project/ → repo root
// Then matches project-*/demo.json
const rawDemoModules = import.meta.glob("../../../../project-*/demo.json", {
  eager: true,
  import: "default",
});

const demoByFolder = validateDemoFiles(rawDemoModules);

function getFolderName(githubUrl) {
  const match = githubUrl?.match(/(project-[\w-]+)\/?$/);
  return match ? match[1] : null;
}

export function useProjectDemo(project) {
  if (!project) return null;
  const folderName = getFolderName(project.github);
  return folderName ? (demoByFolder[folderName] ?? null) : null;
}