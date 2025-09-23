import type { Venue } from "@/types/venue";

/** Check if a venue’s price falls within an optional min/max range.
 *
 * - Excludes venues without a numeric `price`.
 * - Bounds are inclusive.
 *
 * @param v   Venue to test.
 * @param min Minimum allowed price (inclusive).
 * @param max Maximum allowed price (inclusive).
 * @returns `true` if `v.price` exists and `min ≤ price ≤ max` (respecting missing bounds).
 */
export function withinPriceRange(
  v: Venue,
  min?: number,
  max?: number
): boolean {
  const p = typeof v.price === "number" ? v.price : undefined;
  if (p == null) return false;
  if (typeof min === "number" && p < min) return false;
  if (typeof max === "number" && p > max) return false;
  return true;
}

/** Filter venues by an optional price range.
 *
 * - Excludes venues without a numeric `price`.
 * - Bounds are inclusive.
 * - Pure (does not mutate input).
 *
 * @param venues List of venues to evaluate.
 * @param min    Minimum allowed price (inclusive).
 * @param max    Maximum allowed price (inclusive).
 * @returns Venues where `min ≤ price ≤ max` (respecting missing bounds).
 */
export function filterByPriceRange(
  venues: Venue[],
  min?: number,
  max?: number
): Venue[] {
  return (venues ?? []).filter((v) => withinPriceRange(v, min, max));
}
