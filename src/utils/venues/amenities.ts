import type { Venue } from "@/types/venue";

export type AmenityKey = "wifi" | "parking" | "breakfast" | "pets";

/**
 * Filters venues to only those that have **all** selected amenities
 * (truthy booleans in `venue.meta`).
 *
 * @param venues - List of venues to filter.
 * @param selected - Amenity keys to require; empty array returns `venues` unchanged.
 * @returns Venues whose `meta` includes every selected amenity set to `true`.
 */
export function filterByAmenities(
  venues: Venue[],
  selected: AmenityKey[] = []
) {
  if (!selected.length) return venues ?? [];
  return (venues ?? []).filter((v) => {
    const m = v.meta ?? {};
    return selected.every((k) => m[k as keyof typeof m] === true);
  });
}

/**
 * Parses a comma-separated query string (e.g. `"wifi,parking"`) into `AmenityKey[]`.
 * Invalid entries are ignored; values are trimmed and lower-cased; order is preserved.
 * (Duplicates, if present, are preserved.)
 *
 * @param param - Comma-separated list from the URL (or `null`).
 * @returns Array of allowed amenity keys.
 */
export function parseAmenitiesParam(param: string | null): AmenityKey[] {
  if (!param) return [];
  const allowed: AmenityKey[] = ["wifi", "parking", "breakfast", "pets"];
  return param
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is AmenityKey => allowed.includes(s as AmenityKey));
}

/**
 * Serializes selected amenities into a stable, comma-separated string
 * using the order: `wifi,parking,breakfast,pets`. Duplicates are deduped.
 *
 * @param selected - Amenity keys to serialize.
 * @returns Comma-separated string, or empty string if none selected.
 */
export function serializeAmenitiesParam(selected: AmenityKey[]): string {
  if (!selected.length) return "";
  const order: AmenityKey[] = ["wifi", "parking", "breakfast", "pets"];
  const set = new Set(selected);
  return order.filter((k) => set.has(k)).join(",");
}
