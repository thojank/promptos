/**
 * Utility functions for BasePrompt UI and validation.
 */

/**
 * Check if a value is considered empty.
 * - null, undefined, "", empty array [], empty object {} are empty.
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined || value === "") {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  return false;
}

/**
 * Flatten an object into a set of dot-notation paths.
 * e.g., { a: { b: 1 } } => { "a", "a.b" }
 */
export function flattenObjectPaths(obj: any, prefix = ""): Set<string> {
  const paths = new Set<string>();

  function traverse(current: any, currentPrefix: string) {
    if (current === null || current === undefined) {
      if (currentPrefix) paths.add(currentPrefix);
      return;
    }

    if (Array.isArray(current)) {
      if (currentPrefix) paths.add(currentPrefix);
      current.forEach((item, index) => {
        traverse(item, `${currentPrefix}[${index}]`);
      });
      return;
    }

    if (typeof current === "object") {
      if (currentPrefix) paths.add(currentPrefix);
      Object.keys(current).forEach((key) => {
        const newPrefix = currentPrefix ? `${currentPrefix}.${key}` : key;
        traverse(current[key], newPrefix);
      });
      return;
    }

    if (currentPrefix) paths.add(currentPrefix);
  }

  traverse(obj, prefix);
  return paths;
}

/**
 * Check if a field path has a default applied.
 * Handles both exact matches and partial matches.
 */
export function hasDefaultApplied(
  fieldPath: string,
  defaultsApplied: string[] | undefined
): boolean {
  if (!defaultsApplied || defaultsApplied.length === 0) return false;
  return defaultsApplied.some(
    (d) => d === fieldPath || fieldPath.startsWith(d + ".")
  );
}

/**
 * Get the status badge info for a field.
 */
export type ValidationStatus =
  | "default"
  | "missing"
  | "empty"
  | "set"
  | "warning";

export function getValidationStatus(
  value: any,
  defaultsApplied: string[] | undefined,
  fieldPath: string,
  isRequired: boolean
): ValidationStatus {
  if (hasDefaultApplied(fieldPath, defaultsApplied)) {
    return "default";
  }
  if (isEmpty(value)) {
    return isRequired ? "missing" : "empty";
  }
  return "set";
}

/**
 * Group BasePrompt fields into sections.
 * Supports both subject (singular) and subjects (plural).
 */
export interface BasePromptSections {
  subjects: any[];
  environment: any;
  style: any;
  technical: any;
}

export function groupBasePromptSections(
  basePrompt: any
): BasePromptSections {
  const subjects = basePrompt.subjects || (basePrompt.subject ? [basePrompt.subject] : []);

  return {
    subjects,
    environment: basePrompt.environment || null,
    style: basePrompt.style || null,
    technical: basePrompt.technical || null,
  };
}
