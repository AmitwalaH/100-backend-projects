import { validateDemoFiles } from "../utils/validateDemoFiles";

// Path goes up from: src/hooks/ → src/ → frontend/ → view-project/ → repo root
// Then matches project-*/demo.json
// If your structure is: 100-backend-projects/view-project/frontend/src/hooks/useProjectDemo.js
// Then ../../../../ goes up 4 levels to repo root
//
// If your structure is: 100-backend-projects/view-project/backend-projects-showcase/src/hooks/useProjectDemo.js  
// Then ../../../ goes up 3 levels to repo root
//
// The glob below tries BOTH depths — whichever finds files wins.

const rawDemoModules4 = import.meta.glob("../../../../project-*/demo.json", {
  eager: true,
  import: "default",
});

const rawDemoModules3 = import.meta.glob("../../../project-*/demo.json", {
  eager: true,
  import: "default",
});

// Use whichever depth actually found files
const rawDemoModules =
  Object.keys(rawDemoModules4).length > 0
    ? rawDemoModules4
    : rawDemoModules3;

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