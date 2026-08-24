const mongoose = require("mongoose");
const { MONGODB_URI, NODE_ENV } = require("../config");
const SANDBOX = require("../sandbox/registry");

let connection = null;

async function getDb(projectSlug) {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!connection || connection.readyState !== 1) {
    connection = await mongoose
      .createConnection(MONGODB_URI, { maxPoolSize: 5 })
      .asPromise();
  }

  return connection.useDb(`demo_${projectSlug}`, { useCache: true });
}

function buildRouteKey(method, path) {
  return `${method.toUpperCase()} ${path}`;
}

function matchHandler(handlers, method, path) {
  const exactKey = buildRouteKey(method, path);
  if (handlers[exactKey]) {
    return { handler: handlers[exactKey], params: {} };
  }

  const requestSegments = path.split("/").filter(Boolean);
  for (const key of Object.keys(handlers)) {
    const [handlerMethod, handlerPath] = key.split(" ");
    if (handlerMethod !== method.toUpperCase()) continue;

    const patternSegments = handlerPath.split("/").filter(Boolean);
    if (patternSegments.length !== requestSegments.length) continue;

    const params = {};
    let matched = true;
    for (let i = 0; i < patternSegments.length; i += 1) {
      const patternSegment = patternSegments[i];
      const requestSegment = requestSegments[i];

      if (patternSegment.startsWith(":")) {
        params[patternSegment.slice(1)] = requestSegment;
        continue;
      }

      if (patternSegment !== requestSegment) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return { handler: handlers[key], params };
    }
  }

  return null;
}

exports.handleDemoRequest = async (req, res) => {
  const { project } = req.params;
  const { method = "GET", path: apiPath, body: demoBody = {} } = req.body;

  const handlers = SANDBOX[project];
  if (!handlers) {
    return res.status(404).json({
      error: `No live sandbox for project "${project}". Showing captured demo data instead.`,
      fallback: true,
    });
  }

  const match = matchHandler(handlers, method, apiPath);
  if (!match) {
    return res.status(404).json({
      error: `Endpoint ${method.toUpperCase()} ${apiPath} not found in demo sandbox.`,
      availableEndpoints: Object.keys(handlers),
    });
  }

  const { handler, params } = match;
  try {
    const db = await getDb(project);
    const start = Date.now();
    const result = await handler({ ...demoBody, ...params }, db, params);
    const ms = Date.now() - start;

    return res.status(result.status).json({
      ...result.body,
      _demo: { responseTimeMs: ms, project, endpoint: buildRouteKey(method, apiPath) },
    });
  } catch (err) {
    console.error(`[demo/${project}] ${method.toUpperCase()} ${apiPath} error:`, err.message);
    return res.status(500).json({
      error: "Demo handler threw an error.",
      detail: NODE_ENV !== "production" ? err.message : undefined,
    });
  }
};

exports.listSandboxProjects = (_req, res) => {
  res.json({ liveProjects: Object.keys(SANDBOX) });
};
