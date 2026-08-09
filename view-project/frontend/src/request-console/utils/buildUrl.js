import { interpolate } from "./interpolate";

/**
 * Resolves environment variables in a base URL, then merges in any
 * enabled query params. Params defined directly in the URL string
 * (e.g. "...?existing=1") are preserved; params from the editor are
 * appended/overwritten on top of them.
 */
export function buildRequestUrl({ url, params = [], variables = [] }) {
  const resolvedUrl = interpolate(url || "", variables);
  if (!resolvedUrl) return "";

  let parsed;
  try {
    parsed = new URL(resolvedUrl);
  } catch {
    // Relative or malformed URL (e.g. missing protocol while typing) —
    // fall back to manual query-string concatenation so the console
    // never throws while a learner is mid-edit.
    return appendParamsManually(resolvedUrl, params, variables);
  }

  for (const param of params) {
    if (param.enabled === false || !param.key) continue;
    parsed.searchParams.set(
      interpolate(param.key, variables),
      interpolate(param.value ?? "", variables),
    );
  }

  return parsed.toString();
}

function appendParamsManually(url, params, variables) {
  const enabled = params.filter((p) => p.enabled !== false && p.key);
  if (enabled.length === 0) return url;

  const query = enabled
    .map(
      (p) =>
        `${encodeURIComponent(interpolate(p.key, variables))}=${encodeURIComponent(
          interpolate(p.value ?? "", variables),
        )}`,
    )
    .join("&");

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${query}`;
}

/** Splits an already-built URL into { baseUrl, path } shape the backend proxy expects. */
export function splitUrlForProxy(fullUrl) {
  try {
    const parsed = new URL(fullUrl);
    return {
      baseUrl: `${parsed.protocol}//${parsed.host}`,
      path: `${parsed.pathname}${parsed.search}`,
    };
  } catch {
    return { baseUrl: fullUrl, path: "" };
  }
}