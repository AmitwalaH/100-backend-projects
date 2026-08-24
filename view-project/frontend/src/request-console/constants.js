export const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export const METHOD_COLORS = {
  GET: "#16a34a",
  POST: "#ea580c",
  PUT: "#2563eb",
  PATCH: "#ca8a04",
  DELETE: "#dc2626",
  HEAD: "#7c3aed",
  OPTIONS: "#0891b2",
};

export const REQUEST_TABS = [
  { id: "params", label: "Params" },
  { id: "auth", label: "Authorization" },
  { id: "headers", label: "Headers" },
  { id: "body", label: "Body" },
  { id: "scripts", label: "Scripts" },
  { id: "settings", label: "Settings" },
];

export const RESPONSE_TABS = [
  { id: "body", label: "Body" },
  { id: "cookies", label: "Cookies" },
  { id: "headers", label: "Headers" },
  { id: "tests", label: "Test Results" },
];

export const BODY_MODES = [
  { id: "none", label: "none" },
  { id: "raw-json", label: "JSON" },
  { id: "raw-text", label: "text" },
  { id: "form-urlencoded", label: "x-www-form-urlencoded" },
];

export const AUTH_TYPES = [
  { id: "none", label: "No Auth" },
  { id: "bearer", label: "Bearer Token" },
  { id: "basic", label: "Basic Auth" },
];

export const METHODS_WITHOUT_BODY = ["GET", "HEAD"];

export const DEFAULT_TIMEOUT_MS = 15000;

export const LOCAL_STORAGE_PREFIX = "request-console";