const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "../../../..");
const projectDirPattern = /^project-\d+-[\w-]+$/;
const projectConfigPath = "project-page.json";

function loadProjectConfigs() {
  const configs = {};
  if (!fs.existsSync(repoRoot)) return configs;

  const entries = fs.readdirSync(repoRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!projectDirPattern.test(entry.name)) continue;

    const configFile = path.join(repoRoot, entry.name, projectConfigPath);
    if (!fs.existsSync(configFile)) continue;

    try {
      const raw = fs.readFileSync(configFile, "utf8");
      const config = JSON.parse(raw);
      configs[entry.name] = config;
    } catch (err) {
      console.warn(`[projectConfig] Failed to load ${entry.name}/${projectConfigPath}: ${err.message}`);
    }
  }

  return configs;
}

module.exports = loadProjectConfigs();
