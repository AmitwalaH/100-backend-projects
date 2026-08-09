/**
 * Generates a reasonably unique id for tabs, rows, saved requests, etc.
 * Uses crypto.randomUUID when available (all modern browsers) and falls
 * back to a timestamp+random string so the module never throws in an
 * older embedded webview.
 */
export function createId(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}