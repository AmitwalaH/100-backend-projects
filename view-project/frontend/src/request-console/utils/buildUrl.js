import { interpolate } from "./interpolate";

// A string like "localhost:3000/path" satisfies the URL spec's scheme
// grammar ("localhost" is a valid scheme token), so `new URL(...)` does
// NOT throw for it — it parses as scheme "localhost:" with an opaque
// path, .host ends up empty, and the resulting URL silently targets
// nothing like what was typed. Since this is a local-API testing tool,
// a bare host:port with no "http://" is an extremely plausible typo,
// not a genuinely different scheme — so we fill it in rather than let
// it parse "successfully" into garbage.
const HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;

function withHttpScheme(value) {
  return HAS_SCHEME.test(value) ? value : `http://${value}`;
}

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
    parsed = new URL(withHttpScheme(resolvedUrl));
  } catch {
    // Genuinely malformed / still being typed — fall back to manual
    // query-string concatenation on the ORIGINAL string (not the
    // scheme-prefixed one) so the console never throws mid-edit.
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
    const parsed = new URL(withHttpScheme(fullUrl || ""));
    return {
      baseUrl: `${parsed.protocol}//${parsed.host}`,
      path: `${parsed.pathname}${parsed.search}`,
    };
  } catch {
    return { baseUrl: fullUrl, path: "" };
  }
}
