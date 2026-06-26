const VALID_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

function describeEndpointProblems(endpoint, projectFolder, index) {
  const problems = [];
  const label = `${projectFolder} endpoint #${index} (${endpoint?.method ?? "?"} ${endpoint?.path ?? "?"})`;

  if (!VALID_METHODS.includes(endpoint?.method)) {
    problems.push(`${label} has invalid method "${endpoint?.method}"`);
  }
  if (typeof endpoint?.path !== "string" || !endpoint.path.startsWith("/")) {
    problems.push(`${label} has invalid path — must start with "/"`);
  }
  if (typeof endpoint?.responseStatus !== "number") {
    problems.push(`${label} is missing a numeric responseStatus`);
  }
  if (endpoint?.responseBody === undefined) {
    problems.push(`${label} is missing responseBody`);
  }

  return problems;
}

export function validateDemoFiles(rawModules) {
  const result = {};
  const allProblems = [];

  for (const [filePath, demoData] of Object.entries(rawModules)) {
    const match = filePath.match(/(project-[\w-]+)\/demo\.json$/);
    const projectFolder = match ? match[1] : filePath;
    const problems = [];

    if (typeof demoData?.baseUrl !== "string") {
      problems.push(`${projectFolder} is missing a string "baseUrl"`);
    }
    if (
      !Array.isArray(demoData?.endpoints) ||
      demoData.endpoints.length === 0
    ) {
      problems.push(`${projectFolder} must have a non-empty "endpoints" array`);
    } else {
      demoData.endpoints.forEach((ep, i) => {
        problems.push(...describeEndpointProblems(ep, projectFolder, i));
      });
    }

    if (problems.length > 0) {
      allProblems.push(...problems);
      continue;
    }

    result[projectFolder] = demoData;
  }

  if (allProblems.length > 0) {
    const message = `Invalid demo.json files:\n${allProblems.map((p) => `  - ${p}`).join("\n")}`;
    if (import.meta.env?.DEV) throw new Error(message);
    console.warn(message);
  }

  return result;
}
