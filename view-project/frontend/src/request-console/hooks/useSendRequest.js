import { useCallback } from "react";
import { interpolate } from "../utils/interpolate";
import { buildRequestUrl, splitUrlForProxy } from "../utils/buildUrl";
import { runPreRequestScript, runTests } from "../utils/testRunner";
import { METHODS_WITHOUT_BODY } from "../constants";

function bytesOf(value) {
  if (value == null) return 0;
  try {
    return new Blob([typeof value === "string" ? value : JSON.stringify(value)])
      .size;
  } catch {
    return 0;
  }
}

// Plain btoa() only handles Latin1 — it throws InvalidCharacterError for
// any non-ASCII character, which is a completely normal thing to have
// in a real username or password (accented characters, etc.). This
// encodes via UTF-8 bytes first so Basic Auth doesn't crash on those.
function toBase64Utf8(str) {
  if (typeof TextEncoder !== "undefined") {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }
  return btoa(unescape(encodeURIComponent(str)));
}

function buildAuthHeader(auth, variables) {
  if (!auth || auth.type === "none") return null;
  if (auth.type === "bearer") {
    const token = interpolate(auth.token || "", variables);
    return token ? { key: "Authorization", value: `Bearer ${token}` } : null;
  }
  if (auth.type === "basic") {
    const username = interpolate(auth.username || "", variables);
    const password = interpolate(auth.password || "", variables);
    if (!username && !password) return null;
    const encoded = toBase64Utf8(`${username}:${password}`);
    return { key: "Authorization", value: `Basic ${encoded}` };
  }
  return null;
}

function buildBody(tab, variables) {
  if (METHODS_WITHOUT_BODY.includes(tab.method))
    return { bodyMode: "none", body: null };

  if (tab.bodyMode === "raw-json") {
    const resolved = interpolate(tab.bodyRaw || "", variables);
    if (!resolved.trim()) return { bodyMode: "raw-json", body: {} };
    try {
      return { bodyMode: "raw-json", body: JSON.parse(resolved) };
    } catch (err) {
      // Was throwing a fresh Error with no `cause` — silently discarding
      // the original JSON.parse error's stack trace/details.
      throw new Error(`Request body is not valid JSON: ${err.message}`, {
        cause: err,
      });
    }
  }

  if (tab.bodyMode === "raw-text") {
    return {
      bodyMode: "raw-text",
      body: interpolate(tab.bodyRaw || "", variables),
    };
  }

  if (tab.bodyMode === "form-urlencoded") {
    const fields = {};
    for (const field of tab.formBody || []) {
      if (field.enabled === false || !field.key) continue;
      fields[interpolate(field.key, variables)] = interpolate(
        field.value ?? "",
        variables,
      );
    }
    return { bodyMode: "form-urlencoded", body: fields };
  }

  return { bodyMode: "none", body: null };
}

/**
 * Builds a fully-resolved request from a tab + active environment, sends
 * it through the backend proxy, runs the tab's test assertions against
 * the result, and returns a normalized response object.
 */
export function useSendRequest({ environments }) {
  const { activeVariables, mergeVariables, activeEnvironmentId } = environments;

  return useCallback(
    async (tab, { onLog } = {}) => {
      const startedAt = Date.now();
      // Was `let resolvedUrl` declared only where it's built, inside the
      // build phase — but building the request (URL/headers/auth/body)
      // used to happen OUTSIDE the try/catch that only wrapped fetch().
      // That meant a bad-JSON body or the btoa crash above skipped
      // onLog entirely: the Response panel still showed an error
      // (caught one level up in RequestConsole's handleSend), but the
      // Console Log tab stayed silent for that failure. Declaring this
      // up front and wrapping the whole flow in one try/catch makes
      // every failure mode — bad URL, bad JSON, auth encoding, network —
      // get logged the same way.
      let resolvedUrl = tab.url;

      try {
        // 1. Pre-request script: assign/override environment variables
        //    first, so the rest of the build sees the updated values.
        const assignments = runPreRequestScript(
          tab.preRequestScript,
          activeVariables,
        );
        if (assignments.length > 0) {
          mergeVariables(activeEnvironmentId, assignments);
        }
        const variables =
          assignments.length > 0
            ? mergeLocal(activeVariables, assignments)
            : activeVariables;

        // 2. Resolve URL + params against variables.
        resolvedUrl = buildRequestUrl({
          url: tab.url,
          params: tab.params,
          variables,
        });
        if (!resolvedUrl) {
          throw new Error("Request URL is empty.");
        }
        const { baseUrl, path } = splitUrlForProxy(resolvedUrl);

        // 3. Resolve headers, including any auth header.
        const headers = {};
        for (const header of tab.headers || []) {
          if (header.enabled === false || !header.key) continue;
          headers[interpolate(header.key, variables)] = interpolate(
            header.value ?? "",
            variables,
          );
        }
        const authHeader = buildAuthHeader(tab.auth, variables);
        if (authHeader) headers[authHeader.key] = authHeader.value;

        // 4. Resolve body.
        const { bodyMode, body } = buildBody(tab, variables);

        onLog?.("info", `${tab.method} ${resolvedUrl}`, { headers, body });

        const proxyResponse = await fetch("/api/project-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            baseUrl,
            method: tab.method,
            path,
            headers,
            bodyMode,
            requestBody: body,
            timeoutMs: tab.settings?.timeoutMs,
          }),
        });

        const json = await proxyResponse.json();
        const responseTime = Date.now() - startedAt;
        const sizeBytes = bytesOf(json.body);

        const testResults = runTests(tab.testScript, {
          status: json.status,
          responseTime,
          headers: json.headers || {},
          body: json.body,
        });

        const result = {
          ok: json.ok ?? proxyResponse.ok,
          status: json.status ?? proxyResponse.status,
          statusText: json.statusText || "",
          url: json.url || resolvedUrl,
          body: json.body ?? null,
          headers: json.headers || {},
          setCookies: json.setCookies || [],
          error: json.error || null,
          responseTime,
          sizeBytes,
          testResults,
          respondedAt: Date.now(),
        };

        onLog?.(
          result.ok ? "success" : "error",
          `${result.status} ${result.statusText} · ${responseTime}ms`,
          result,
        );
        return result;
      } catch (err) {
        const responseTime = Date.now() - startedAt;
        const result = {
          ok: false,
          status: null,
          statusText: "",
          url: resolvedUrl,
          body: null,
          headers: {},
          setCookies: [],
          error: err.message,
          responseTime,
          sizeBytes: 0,
          testResults: [],
          respondedAt: Date.now(),
        };
        onLog?.("error", err.message, result);
        return result;
      }
    },
    [activeVariables, mergeVariables, activeEnvironmentId],
  );
}

function mergeLocal(variables, assignments) {
  const byKey = new Map(variables.map((v) => [v.key, v]));
  for (const { key, value } of assignments) {
    byKey.set(key, { key, value, enabled: true });
  }
  return Array.from(byKey.values());
}
