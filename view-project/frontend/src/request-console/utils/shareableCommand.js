/**
 * Renders a resolved request as a copyable shell command, the same way
 * any request builder lets you take a request out of the browser and
 * run it from a terminal. Kept generic (no third-party tool naming).
 */
function escapeSingleQuotes(value) {
  return String(value ?? "").replace(/'/g, `'\\''`);
}

export function buildShareableCommand({
  method,
  url,
  headers = [],
  bodyMode,
  bodyRaw,
  formBody,
}) {
  // Was only escaping single quotes in the raw body — a header value or
  // the URL itself (e.g. an interpolated auth token containing an
  // apostrophe) would silently produce invalid shell syntax when pasted.
  const parts = [`curl -X ${method}`, `'${escapeSingleQuotes(url)}'`];

  for (const header of headers) {
    if (header.enabled === false || !header.key) continue;
    parts.push(
      `-H '${escapeSingleQuotes(header.key)}: ${escapeSingleQuotes(header.value)}'`,
    );
  }

  if (bodyMode === "raw-json" || bodyMode === "raw-text") {
    if (bodyRaw && bodyRaw.trim().length > 0) {
      parts.push(`--data-raw '${escapeSingleQuotes(bodyRaw)}'`);
    }
  } else if (bodyMode === "form-urlencoded") {
    const enabled = (formBody || []).filter(
      (f) => f.enabled !== false && f.key,
    );
    for (const field of enabled) {
      parts.push(
        `--data-urlencode '${escapeSingleQuotes(field.key)}=${escapeSingleQuotes(field.value)}'`,
      );
    }
  }

  return parts.join(" \\\n  ");
}
