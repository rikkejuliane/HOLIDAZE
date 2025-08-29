// src/utils/venues.ts
import type { Venue } from "@/types/venue";

// block these substrings anywhere in name/description
const JUNK_RE = /(test|zzz|yyy|www|ttt)/i;
export function filterJunkVenues(venues: Venue[]) {
  return (venues ?? []).filter(v => !JUNK_RE.test(`${v.name ?? ""} ${v.description ?? ""}`));
}


/**
 * Optional: quick helper to inspect why something might look "off" in data.
 * Not used by default; handy for console logging while debugging.
 */
export function debugVenue(v: Venue) {
  const missing: string[] = [];
  if (!v.name?.trim()) missing.push("name");
  if (!v.description?.trim()) missing.push("description"); // many APIs omit this
  if (!v.media?.[0]?.url?.trim()) missing.push("image");
  if (!(typeof v.price === "number" && v.price > 0)) missing.push("price");
  if (!(typeof v.maxGuests === "number" && v.maxGuests > 0)) missing.push("maxGuests");
  if (!v.location?.city?.trim() && !v.location?.country?.trim()) missing.push("location");
  return missing;
}
