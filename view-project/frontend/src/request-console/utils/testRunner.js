/**
 * A deliberately small, line-based assertion language for the Tests tab.
 * No eval() / new Function() — every supported assertion is parsed and
 * evaluated explicitly. See request-console/README.md "Scripts" section
 * for the rationale and full grammar.
 *
 * Supported lines:
 *   status == 200
 *   status != 500
 *   responseTime < 800
 *   responseTime <= 800
 *   header[content-type] contains json
 *   body.<dot.path> exists
 *   body.<dot.path> == value
 *   body.<dot.path> != value
 *
 * Blank lines and lines starting with # are ignored (comments).
 */
import { interpolate } from "./interpolate";

const COMPARATORS = ["==", "!=", "<=", ">=", "<", ">"];

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => {
    if (acc == null) return undefined;
    return acc[key];
  }, obj);
}

function coerce(rawValue) {
  const trimmed = rawValue.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed !== "" && !Number.isNaN(Number(trimmed))) return Number(trimmed);
  return trimmed;
}

function splitOnComparator(line) {
  for (const comparator of COMPARATORS) {
    const index = line.indexOf(comparator);
    if (index !== -1) {
      return {
        left: line.slice(0, index).trim(),
        comparator,
        right: line.slice(index + comparator.length).trim(),
      };
    }
  }
  return null;
}

function compare(actual, comparator, expected) {
  switch (comparator) {
    case "==":
      return actual === expected;
    case "!=":
      return actual !== expected;
    case "<":
      return Number(actual) < Number(expected);
    case "<=":
      return Number(actual) <= Number(expected);
    case ">":
      return Number(actual) > Number(expected);
    case ">=":
      return Number(actual) >= Number(expected);
    default:
      return false;
  }
}

function invalidLine(line) {
  return {
    description: line,
    passed: false,
    message: `Could not parse assertion: "${line}"`,
  };
}

function evaluateLine(rawLine, context) {
  const line = rawLine.trim();

  if (/^header\[[^\]]+\]\s+contains\s+/.test(line)) {
    const match = line.match(/^header\[([^\]]+)\]\s+contains\s+(.+)$/);
    const headerName = match[1].trim().toLowerCase();
    const needle = match[2].trim().toLowerCase();
    const headerValue = String(context.headers?.[headerName] ?? "").toLowerCase();
    const passed = headerValue.includes(needle);
    return {
      description: line,
      passed,
      message: passed
        ? `Header "${headerName}" contains "${needle}"`
        : `Header "${headerName}" was "${headerValue || "(missing)"}", expected it to contain "${needle}"`,
    };
  }

  if (/^body\.[\w.]+\s+exists$/.test(line)) {
    const path = line.match(/^body\.([\w.]+)\s+exists$/)[1];
    const value = getByPath(context.body, path);
    const passed = value !== undefined && value !== null;
    return {
      description: line,
      passed,
      message: passed ? `body.${path} is present` : `body.${path} was missing`,
    };
  }

  if (line.startsWith("body.")) {
    const split = splitOnComparator(line);
    if (!split) return invalidLine(line);
    const path = split.left.replace(/^body\./, "");
    const actual = getByPath(context.body, path);
    const expected = coerce(split.right);
    const passed = compare(actual, split.comparator, expected);
    return {
      description: line,
      passed,
      message: passed
        ? `body.${path} ${split.comparator} ${split.right}`
        : `body.${path} was ${JSON.stringify(actual)}, expected ${split.comparator} ${split.right}`,
    };
  }

  if (line.startsWith("status") || line.startsWith("responseTime")) {
    const split = splitOnComparator(line);
    if (!split) return invalidLine(line);
    const actual = split.left === "status" ? context.status : context.responseTime;
    const expected = coerce(split.right);
    const passed = compare(actual, split.comparator, expected);
    return {
      description: line,
      passed,
      message: passed
        ? `${split.left} ${split.comparator} ${split.right}`
        : `${split.left} was ${actual}, expected ${split.comparator} ${split.right}`,
    };
  }

  return invalidLine(line);
}

/**
 * @param {string} script - newline-separated assertion lines
 * @param {{status:number, responseTime:number, headers:object, body:any}} context
 * @returns {{description:string, passed:boolean, message:string}[]}
 */
export function runTests(script, context) {
  if (!script || !script.trim()) return [];

  return script
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => evaluateLine(line, context));
}

/**
 * Pre-request DSL: "set name = value" lines only. Returns a list of
 * {key, value} pairs to merge into the active environment's variables
 * before the request is built. Intentionally cannot do anything other
 * than assign a literal or interpolated string — see README.
 */
export function runPreRequestScript(script, variables) {
  if (!script || !script.trim()) return [];

  return script
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("set "))
    .map((line) => {
      const match = line.match(/^set\s+([a-zA-Z0-9_.-]+)\s*=\s*(.*)$/);
      if (!match) return null;
      return { key: match[1], value: interpolate(match[2], variables) };
    })
    .filter(Boolean);
}