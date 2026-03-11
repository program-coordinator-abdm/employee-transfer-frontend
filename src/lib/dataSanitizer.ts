/**
 * Payload sanitization & display formatting for employee data.
 *
 * sanitizeEmployeePayload – ensures no null/undefined reaches the backend.
 * displayValue            – ensures "NA" / 0 / false placeholders don't leak into UI inputs.
 */

const DEFAULTS_BY_KEY: Record<string, string> = {
  telephoneNumber: "NA",
  officeTelephoneNumber: "NA",
  currentAreaType: "NA",
  timeboundCategory: "NA",
  timeboundYears: "NA",
  promotionRejectedDesignation: "NA",
  spouseDesignation: "NA",
  spouseDistrict: "NA",
  spouseTaluk: "NA",
  spouseCityTownVillage: "NA",
  currentHfrId: "NA",
};

/**
 * Recursively replace every null / undefined value with a safe default.
 * Key-specific defaults are looked up first; otherwise "NA" for unknowns.
 */
export function sanitizeEmployeePayload(input: any): any {
  if (Array.isArray(input)) return input.map(sanitizeEmployeePayload);

  if (input !== null && typeof input === "object") {
    const out: Record<string, any> = {};
    for (const key in input) {
      const v = input[key];
      if (v === null || v === undefined) {
        // Date fields must stay null — "NA" would be rejected as invalid date by backend
        if (key.endsWith("Date") || key === "dob" || key === "dateOfEntry" || key === "dateOfJoining") {
          out[key] = null;
        } else {
          out[key] = key in DEFAULTS_BY_KEY ? DEFAULTS_BY_KEY[key] : "NA";
        }
      } else if (Array.isArray(v)) {
        out[key] = v.map(sanitizeEmployeePayload);
      } else if (typeof v === "object") {
        out[key] = sanitizeEmployeePayload(v);
      } else {
        out[key] = v;
      }
    }
    return out;
  }

  // primitive – pass through as-is
  return input;
}

/**
 * Format a value for display in a form input.
 *
 * - strings: "NA", null, undefined → ""
 * - numbers: null, undefined, 0 (optional zeros) → ""
 * - booleans: coerced to boolean (null → false)
 */
export function displayValue(v: any, type: "string" | "number" | "boolean"): any {
  if (type === "string") {
    if (v === "NA" || v === null || v === undefined) return "";
    return String(v);
  }
  if (type === "number") {
    if (v === null || v === undefined) return "";
    if (v === 0) return "";
    return String(v);
  }
  if (type === "boolean") {
    return Boolean(v);
  }
  return v ?? "";
}
