import { useCallback, useState } from "react";
import { createId } from "../utils/id";

const MAX_LOG_ENTRIES = 200;

/** In-memory only — the console log is a debugging aid for the current session, not a persisted record. */
export function useConsoleLog() {
  const [entries, setEntries] = useState([]);

  const log = useCallback((level, message, detail) => {
    setEntries((current) => {
      const entry = { id: createId("log"), timestamp: Date.now(), level, message, detail };
      return [entry, ...current].slice(0, MAX_LOG_ENTRIES);
    });
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, log, clear };
}
