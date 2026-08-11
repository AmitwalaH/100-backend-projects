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

    async function loop() {
      const ok = await checkOnce(url, requestId);

      if (stopped || requestIdRef.current !== requestId) {
        return;
      }

      if (!ok) {
        timerRef.current = setTimeout(loop, POLL_INTERVAL_MS);
      }
    }

    loop();

    return () => {
      stopped = true;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [url, checkOnce]);

  const retry = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const requestId = (requestIdRef.current += 1);
    setStatus("checking");

    checkOnce(url, requestId).then((ok) => {
      if (!ok && requestIdRef.current === requestId) {
        timerRef.current = setTimeout(() => {
          // Start a fresh polling cycle.
          const nextRequestId = (requestIdRef.current += 1);
          checkOnce(url, nextRequestId);
        }, POLL_INTERVAL_MS);
      }
    });
  }, [url, checkOnce]);

  return { status, retry };
}
