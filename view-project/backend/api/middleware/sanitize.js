// Lightweight input sanitizer — strips prototype pollution and
// limits body size. express.json() already enforces size via limit option.
// This adds key-level safety for demo payloads.

function sanitizeObject(obj, depth = 0) {
  if (depth > 5) return {}; // prevent deeply nested bombs
  if (typeof obj !== "object" || obj === null) return obj;

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Block prototype pollution keys
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    clean[key] =
      typeof value === "object" && value !== null
        ? sanitizeObject(value, depth + 1)
        : value;
  }
  return clean;
}

module.exports = function sanitize(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
};
