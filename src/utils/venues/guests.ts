import type { Venue } from "@/types/venue";

/** Filter venues by a minimum guest capacity.
 *
 * Returns the original list if `guests` is falsy or ≤ 0.
 * Venues without a numeric `maxGuests` are excluded from results.
 * Pure (does not mutate input).
 *
 * @param venues - List of venues to evaluate.
 * @param guests - Minimum required capacity.
 * @returns Venues where `maxGuests >= guests`.
 */
export function filterByGuests(venues: Venue[], guests?: number): Venue[] {
  if (!guests || guests <= 0) return venues ?? [];
  return (venues ?? []).filter((v) => {
    const cap = (v as { maxGuests?: number }).maxGuests;
    return typeof cap === "number" && cap >= guests;
  });
}
