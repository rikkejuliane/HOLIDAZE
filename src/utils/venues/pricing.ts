import type { Venue } from "@/types/venue";

/** Treats Venue.price as price-per-night (realistic convention). */
export function withinPriceRange(v: Venue, min?: number, max?: number): boolean {
  const p = typeof v.price === "number" ? v.price : undefined;
  if (p == null) return false;
  if (typeof min === "number" && p < min) return false;
  if (typeof max === "number" && p > max) return false;
  return true;
}

export function filterByPriceRange(venues: Venue[], min?: number, max?: number): Venue[] {
  return (venues ?? []).filter((v) => withinPriceRange(v, min, max));
}
