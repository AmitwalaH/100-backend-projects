const fs = require("fs");
const path = require("path");

const projectsDir = path.join(__dirname, "projects");

function loadSandboxProjects() {
  if (!fs.existsSync(projectsDir)) {
    return {};
  }

  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  const sandbox = {};
  const directoryNames = new Set(entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name));

  for (const dirName of directoryNames) {
    const modulePath = path.join(projectsDir, dirName, "index.js");
    if (fs.existsSync(modulePath)) {
      sandbox[dirName] = require(modulePath);
    }
  }

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) {
      continue;
    }

    const projectSlug = entry.name.replace(/\.js$/, "");
    if (directoryNames.has(projectSlug)) {
      continue;
    }

    sandbox[projectSlug] = require(path.join(projectsDir, entry.name));
  }

  return sandbox;
}

module.exports = loadSandboxProjects();