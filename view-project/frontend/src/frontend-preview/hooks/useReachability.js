import { useCallback, useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 4000;

/**
 * Detects whether a local project server is actually listening before we
 * try to render it in an iframe.
 *
 * Polls only while unreachable, so the preview connects automatically
 * when the project server is started.
 */
export function useReachability(url) {
  const [status, setStatus] = useState("checking");
  const timerRef = useRef(null);
  const requestIdRef = useRef(0);

  const checkOnce = useCallback(async (targetUrl, requestId) => {
    if (!targetUrl) {
      if (requestIdRef.current === requestId) {
        setStatus("unreachable");
      }
      return false;
    }

    try {
      await fetch(targetUrl, {
        mode: "no-cors",
        cache: "no-store",
      });

      if (requestIdRef.current === requestId) {
        setStatus("reachable");
      }

      return true;
    } catch {
      if (requestIdRef.current === requestId) {
        setStatus("unreachable");
      }

      return false;
    }
  }, []);

  // Was: `const pollLoop = useCallback(async (targetUrl, requestId) => { ...
  // setTimeout(() => pollLoop(...)) ... })` — pollLoop referencing itself
  // through the OUTER const binding works at runtime here (the self-call
  // is deferred, never invoked synchronously during its own assignment),
  // but it's a fragile pattern that a linter correctly flags: it's
  // relying on closure/TDZ timing rather than real self-reference.
  // A named function expression sidesteps this entirely — `poll` is
  // available inside its own body via its own binding, regardless of
  // when/whether the outer `pollLoop` const has finished being assigned.
  const pollLoop = useCallback(
    async function poll(targetUrl, requestId) {
      const ok = await checkOnce(targetUrl, requestId);
      if (requestIdRef.current !== requestId) return;
      if (!ok) {
        timerRef.current = setTimeout(
          () => poll(targetUrl, requestId),
          POLL_INTERVAL_MS,
        );
      }
    },
    [checkOnce],
  );

  useEffect(() => {
    const requestId = (requestIdRef.current += 1);
    let stopped = false;

    // Defer the initial status update so it isn't a synchronous
    // setState call directly inside the effect body.
    queueMicrotask(() => {
      if (!stopped && requestIdRef.current === requestId) {
        setStatus("checking");
      }
    });

    pollLoop(url, requestId);

    return () => {
      stopped = true;
      // Also invalidates any in-flight checkOnce() fetch from this
      // effect run — without this, a fetch that resolves after unmount
      // would still pass the requestIdRef comparison and call setState
      // on an unmounted component.
      requestIdRef.current += 1;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [url, pollLoop]);

  const retry = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const requestId = (requestIdRef.current += 1);
    setStatus("checking");
    pollLoop(url, requestId);
  }, [url, pollLoop]);

  return { status, retry };
}
