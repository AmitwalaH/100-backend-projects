export function validateProjectPages(rawModules) {
  const result = {};
  const allProblems = [];

  for (const [filePath, pageData] of Object.entries(rawModules)) {
    const match = filePath.match(/(project-[\w-]+)\/project-page\.json$/);
    const projectFolder = match ? match[1] : filePath;
    const problems = [];

    if (typeof pageData?.title !== "string") {
      problems.push(`${projectFolder} is missing a string "title"`);
    }
    if (typeof pageData?.description !== "string") {
      problems.push(`${projectFolder} is missing a string "description"`);
    }

    if (typeof pageData?.backendConfig !== "object" || pageData.backendConfig === null) {
      problems.push(`${projectFolder} must include a "backendConfig" object`);
    } else {
      if (typeof pageData.backendConfig.baseUrl !== "string") {
        problems.push(`${projectFolder} backendConfig is missing a string "baseUrl"`);
      }
      if (!Array.isArray(pageData.backendConfig.calls) || pageData.backendConfig.calls.length === 0) {
        problems.push(`${projectFolder} backendConfig must include a non-empty "calls" array`);
      } else {
        pageData.backendConfig.calls.forEach((call, index) => {
          if (typeof call.method !== "string") {
            problems.push(`${projectFolder} backendConfig call #${index} is missing "method"`);
          }
          if (typeof call.path !== "string") {
            problems.push(`${projectFolder} backendConfig call #${index} is missing "path"`);
          }
          if (typeof call.description !== "string") {
            problems.push(`${projectFolder} backendConfig call #${index} is missing "description"`);
          }
        });
      }
    }

    if (pageData?.frontendConfig !== undefined) {
      if (typeof pageData.frontendConfig?.url !== "string") {
        problems.push(`${projectFolder} frontendConfig must include a string "url"`);
      }
      if (typeof pageData.frontendConfig?.description !== "string") {
        problems.push(`${projectFolder} frontendConfig must include a string "description"`);
      }
    }

    if (pageData?.visuals !== undefined && !Array.isArray(pageData.visuals)) {
      problems.push(`${projectFolder} has invalid "visuals" — must be an array`);
    }

    if (problems.length > 0) {
      allProblems.push(...problems);
      continue;
    }

    result[projectFolder] = pageData;
  }

  if (allProblems.length > 0) {
    const message = `Invalid project-page.json files:\n${allProblems.map((p) => `  - ${p}`).join("\n")}`;
    if (import.meta.env?.DEV) throw new Error(message);
    console.warn(message);
  }

  return result;
}
