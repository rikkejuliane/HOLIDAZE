import type { Venue } from "@/types/venue";

/** Keep venues that can host at least `guests` people. */
export function filterByGuests(venues: Venue[], guests?: number): Venue[] {
  if (!guests || guests <= 0) return venues ?? [];
  return (venues ?? []).filter((v) => {
    const cap = (v as { maxGuests?: number }).maxGuests;
    return typeof cap === "number" && cap >= guests;
  });
}
