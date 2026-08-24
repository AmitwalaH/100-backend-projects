import { useCallback, useEffect, useState } from "react";
import { LOCAL_STORAGE_PREFIX } from "../constants";

// Each option is a base/hover pair so buttons get a real :hover state
// without needing a CSS preprocessor to darken a color at build time.
export const ACCENT_OPTIONS = [
  { id: "amber", label: "Amber", base: "#ea580c", hover: "#c2410c" },
  { id: "blue", label: "Blue", base: "#2563eb", hover: "#1d4ed8" },
  { id: "green", label: "Green", base: "#16a34a", hover: "#15803d" },
  { id: "violet", label: "Violet", base: "#7c3aed", hover: "#6d28d9" },
  { id: "rose", label: "Rose", base: "#e11d48", hover: "#be123c" },
];

const STORAGE_KEY = LOCAL_STORAGE_PREFIX + ":accent";

function readStored() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return ACCENT_OPTIONS.find((a) => a.id === stored) || ACCENT_OPTIONS[0];
  } catch {
    return ACCENT_OPTIONS[0];
  }
}

/** Accent color is a global preference, not per-project, same as environments. */
export function useAccentColor() {
  const [accent, setAccentState] = useState(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, accent.id);
    } catch {
      // non-fatal
    }
  }, [accent]);

  const setAccent = useCallback((id) => {
    const found = ACCENT_OPTIONS.find((a) => a.id === id);
    if (found) setAccentState(found);
  }, []);

  return { accent, setAccent, options: ACCENT_OPTIONS };
}
