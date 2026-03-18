/**
 * Timezone-safe date utilities for date-only (YYYY-MM-DD) values.
 *
 * Problem: `new Date("2024-03-03")` is parsed as UTC midnight.
 * In IST (UTC+5:30) that becomes 2024-03-02T18:30 — one day behind.
 *
 * Solution: Always parse date-only strings with explicit local components,
 * and always serialise Date→string using local year/month/day.
 */

/**
 * Parse a "YYYY-MM-DD" string (or ISO datetime) into a local-timezone Date
 * without the UTC-midnight off-by-one bug.
 *
 * Returns undefined for falsy / unparseable input.
 */
export function parseLocalDate(value: string | undefined | null): Date | undefined {
  if (!value) return undefined;
  // Match date-only "YYYY-MM-DD"
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  // ISO datetime – still construct via local parts to avoid shift
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  return d;
}

/**
 * Format a Date object (or date string) into "YYYY-MM-DD" using local
 * timezone components. Safe for payloads.
 *
 * Returns "" for falsy input.
 */
export function formatLocalDate(value: Date | string | undefined | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? parseLocalDate(value) : value;
  if (!d || isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Format a date-only string or Date for human display ("dd MMM yyyy")
 * without timezone shift. Returns "—" for empty values.
 */
export function formatDateDisplay(value: string | Date | undefined | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? parseLocalDate(value) : value;
  if (!d || isNaN(d.getTime())) return String(value);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
