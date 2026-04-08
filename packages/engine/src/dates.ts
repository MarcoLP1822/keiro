/**
 * Returns the local calendar date as a YYYY-MM-DD string.
 *
 * Using toISOString() would return the UTC date, which drifts from local time.
 * For example, a user in UTC+9 at 11 PM would get tomorrow's UTC date — breaking
 * SRS scheduling, streak tracking, and daily plan lookups.
 */
export function localDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
