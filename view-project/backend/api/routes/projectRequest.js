const express = require("express");
const router = express.Router();

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_TIMEOUT_MS = 60000;
const MIN_TIMEOUT_MS = 1000;

/**
 * Serializes the request body according to the caller's declared bodyMode.
 * Returns { payload, contentType } — contentType is only set when the
 * caller hasn't already supplied their own Content-Type header, so an
 * explicit header from the request console always wins.
 */
function serializeBody(bodyMode, requestBody) {
  if (bodyMode === "raw-text") {
    return { payload: typeof requestBody === "string" ? requestBody : String(requestBody ?? ""), contentType: "text/plain" };
  }

  if (bodyMode === "form-urlencoded") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(requestBody || {})) {
      params.append(key, value);
    }
    return { payload: params.toString(), contentType: "application/x-www-form-urlencoded" };
  }

  // Default / "raw-json" / legacy callers that only ever sent requestBody as JSON.
  return { payload: JSON.stringify(requestBody ?? {}), contentType: "application/json" };
}

function clampTimeout(timeoutMs) {
  const value = Number(timeoutMs);
  if (!Number.isFinite(value)) return DEFAULT_TIMEOUT_MS;
  return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, value));
}

/**
 * Parses one or more Set-Cookie header values into an array of cookie
 * strings. Node's fetch (undici) exposes multiple Set-Cookie values via
 * `headers.getSetCookie()` on newer runtimes; we fall back to a single
 * comma-joined string on older ones rather than failing outright.
 */
function extractSetCookies(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

router.post("/", async (req, res) => {
  const {
    baseUrl,
    method,
    path: apiPath,
    requestBody,
    headers: requestHeaders,
    bodyMode,
    timeoutMs,
  } = req.body;

  if (!baseUrl || !method || !apiPath) {
    return res.status(400).json({
      error: "project-request requires baseUrl, method, and path",
    });
  }

  const targetUrl = `${baseUrl.replace(/\/$/, "")}${apiPath}`;
  const upperMethod = method.toUpperCase();
  const methodAllowsBody = !["GET", "HEAD"].includes(upperMethod);

  const outgoingHeaders = { ...(requestHeaders || {}) };

  const fetchOptions = { method: upperMethod, headers: outgoingHeaders };

  if (methodAllowsBody && bodyMode !== "none") {
    const { payload, contentType } = serializeBody(bodyMode, requestBody);
    fetchOptions.body = payload;
    const hasExplicitContentType = Object.keys(outgoingHeaders).some(
      (key) => key.toLowerCase() === "content-type",
    );
    if (!hasExplicitContentType) {
      outgoingHeaders["Content-Type"] = contentType;
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), clampTimeout(timeoutMs));
  fetchOptions.signal = controller.signal;

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();

    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return res.status(response.status).json({
      ok: response.ok,
      url: targetUrl,
      status: response.status,
      statusText: response.statusText,
      body,
      headers,
      setCookies: extractSetCookies(response.headers),
    });
  } catch (error) {
    const isTimeout = error.name === "AbortError";
    return res.status(502).json({
      error: isTimeout
        ? `Request to ${targetUrl} timed out after ${clampTimeout(timeoutMs)}ms.`
        : "Failed to proxy request to local project backend.",
      detail: error.message,
    });
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;
