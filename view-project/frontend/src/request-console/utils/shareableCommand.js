/**
 * Renders a resolved request as a copyable shell command, the same way
 * any request builder lets you take a request out of the browser and
 * run it from a terminal. Kept generic (no third-party tool naming).
 */
export function buildShareableCommand({ method, url, headers = [], bodyMode, bodyRaw, formBody }) {
  const parts = [`curl -X ${method}`, `'${url}'`];

  for (const header of headers) {
    if (header.enabled === false || !header.key) continue;
    parts.push(`-H '${header.key}: ${header.value ?? ""}'`);
  }

  if (bodyMode === "raw-json" || bodyMode === "raw-text") {
    if (bodyRaw && bodyRaw.trim().length > 0) {
      const escaped = bodyRaw.replace(/'/g, `'\\''`);
      parts.push(`--data-raw '${escaped}'`);
    }
  } else if (bodyMode === "form-urlencoded") {
    const enabled = (formBody || []).filter((f) => f.enabled !== false && f.key);
    for (const field of enabled) {
      parts.push(`--data-urlencode '${field.key}=${field.value ?? ""}'`);
    }
  }

  return parts.join(" \\\n  ");
}