/**
 * Resolves {{variableName}} placeholders against a flat list of
 * environment variables. Unknown variables are left untouched (rather
 * than silently becoming an empty string) so a missing variable is
 * visible in the resolved URL/header/body instead of failing quietly.
 */
const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export function interpolate(input, variables) {
  if (typeof input !== "string" || input.length === 0) return input;

  const lookup = new Map();
  for (const variable of variables || []) {
    if (variable.enabled === false) continue;
    lookup.set(variable.key, variable.value);
  }

  return input.replace(VARIABLE_PATTERN, (match, name) => {
    return lookup.has(name) ? lookup.get(name) : match;
  });
}

/** Recursively interpolates every string value in a plain object. */
export function interpolateObject(obj, variables) {
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = typeof value === "string" ? interpolate(value, variables) : value;
  }
  return out;
}