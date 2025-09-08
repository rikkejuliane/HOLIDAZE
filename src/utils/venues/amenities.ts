// src/utils/amenities.ts
import type { Venue } from "@/types/venue";

export type AmenityKey = "wifi" | "parking" | "breakfast" | "pets";

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

export function parseAmenitiesParam(param: string | null): AmenityKey[] {
  if (!param) return [];
  const allowed: AmenityKey[] = ["wifi", "parking", "breakfast", "pets"];
  return param
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is AmenityKey => allowed.includes(s as AmenityKey));
}

export function serializeAmenitiesParam(selected: AmenityKey[]): string {
  if (!selected.length) return "";
  const order: AmenityKey[] = ["wifi", "parking", "breakfast", "pets"];
  const set = new Set(selected);
  return order.filter((k) => set.has(k)).join(",");
}
