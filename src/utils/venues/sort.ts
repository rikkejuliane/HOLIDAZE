import type { Venue } from "@/types/venue";

export type PriceSort = "price:asc" | "price:desc";

/** Sort venues by price, then rating, then name.
 *
 * - Pure (does not mutate input).
 * - Venues without a numeric `price` are treated as having price `0`.
 * - Venues without a numeric `rating` are treated as having rating `0`.
 * - Venues without a `name` are treated as having an empty string name.
 *
 * @param venues List of venues to sort.
 * @param order  Sort order: `"price:asc"` (lowest first) or `"price:desc"` (highest first).
 * @returns Venues sorted by price, then rating, then name.
 */
export function sortByPrice(venues: Venue[], order: PriceSort): Venue[] {
  const mul = order === "price:asc" ? 1 : -1;
  return [...(venues ?? [])].sort((a, b) => {
    const cmp = (a.price - b.price) * mul;
    if (cmp !== 0) return cmp;
    const rb = (b.rating ?? 0) - (a.rating ?? 0);
    if (rb !== 0) return rb;
    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}
