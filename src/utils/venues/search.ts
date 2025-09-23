import type { Venue } from "@/types/venue";

/**
 * Checks if a venue's name or description contains the query string (case-insensitive).
 *
 * - If `q` is falsy (empty string, null, or undefined), always returns `true`.
 * - Otherwise, returns `true` if `q` is found in either `name` or `description`.
 *
 * @param v Venue to check.
 * @param q Query string to search for.
 * @returns `true` if `q` is empty or found in `name`/`description`; otherwise `false`.
 */
export function matchesQuery(v: Venue, q: string): boolean {
  if (!q) return true;
  const hay = `${v.name ?? ""} ${v.description ?? ""}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}
