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

/**
 * Recursively interpolates every string value in a plain object or
 * array — was previously only walking the top level despite the name/
 * docstring saying "recursively," so a nested body like
 * {"user": {"email": "{{userEmail}}"}} left the nested placeholder
 * completely unresolved. Nested JSON bodies are the common case for a
 * REST client, not the exception, so this was a real correctness gap.
 */
export function interpolateObject(value, variables) {
  if (typeof value === "string") {
    return interpolate(value, variables);
  }
  if (Array.isArray(value)) {
    return value.map((item) => interpolateObject(item, variables));
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = interpolateObject(val, variables);
    }
    return out;
  }
  return value;
}
