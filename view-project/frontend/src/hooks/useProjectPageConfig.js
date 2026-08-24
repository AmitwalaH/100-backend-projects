import { validateProjectPages } from "../utils/validateProjectPages";

// Path goes up from: src/hooks/ → src/ → frontend/ → view-project/ → repo root
// Then loads project page metadata from each project folder.
const rawPageModules = import.meta.glob("../../../../project-*/project-page.json", {
  eager: true,
  import: "default",
});

const pageConfigByFolder = validateProjectPages(rawPageModules);

export function useProjectPageConfig(project) {
  if (!project) return null;

  const folderName = project.slug || project.github?.match(/(project-[\w-]+)\/?$/)?.[1];
  return folderName ? pageConfigByFolder[folderName] ?? null : null;
}
