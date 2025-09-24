import type { Venue } from "@/types/venue";

type MaybeNum = number | string | null | undefined;

/** Type guard: returns true if `value` is a non-null object (plain record-ish). */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

/**
 * Safely coerce a `number | string | null | undefined` to a finite `number`.
 * @param x - Value like `42` or `"42"`.
 * @returns Finite number, or `null` if not parseable.
 */
export function toNum(x: MaybeNum): number | null {
  if (x == null) return null;
  const n = typeof x === "string" ? Number(x) : x;
  return Number.isFinite(n as number) ? (n as number) : null;
}

/**
 * Pulls valid coordinates from a `Venue`.
 * @returns `[lng, lat]` when both exist, finite, and not `0,0`; otherwise `null`.
 * Note: Order is `[lng, lat]` (Mapbox convention).
 */
export function extractCoordsFromVenue(v: Venue): [number, number] | null {
  const lat = v.location?.lat ?? null;
  const lng = v.location?.lng ?? null;
  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    (lat !== 0 || lng !== 0)
  ) {
    return [lng, lat];
  }
  return null;
}

/**
 * Reads and trims `city` and `country` from `venue.location`.
 * @returns `{ city?: string; country?: string }` with `undefined` for empty values.
 */
export function extractCityCountry(v: Venue): {
  city?: string;
  country?: string;
} {
  const rec = v as unknown as Record<string, unknown>;
  const loc = (rec["location"] as Record<string, unknown> | undefined) ?? {};
  const city = String(loc["city"] ?? "").trim() || undefined;
  const country = String(loc["country"] ?? "").trim() || undefined;
  return { city, country };
}

export type PlaceKey = { q: string; types?: string };
/**
 * Builds an array of `PlaceKey` objects from a `Venue`'s city and country.
 * @returns Array of one or two `PlaceKey` objects, or empty array if neither city nor country.
 */
export function makePlaceKeys(v: Venue): PlaceKey[] {
  const { city, country } = extractCityCountry(v);
  const keys: PlaceKey[] = [];
  if (city && country)
    keys.push({
      q: `${city}, ${country}`,
      types: "place,locality,region,country",
    });
  else if (city) keys.push({ q: city, types: "place,locality,region" });
  if (country) keys.push({ q: country, types: "country" });
  return keys;
}

/**
 * Geocodes `query` via Mapbox → `[lng, lat]`, with in-memory + `localStorage` caching.
 * @param query - Free-text place (e.g., `"Bergen, Norway"`).
 * @param memCache - A Map used to memoize results during the session.
 * @param accessToken - Mapbox access token.
 * @param types - Optional Mapbox `types` filter (e.g., `"place,locality,region"`).
 * @returns `[lng, lat]` on success, otherwise `null`. Silently ignores network errors.
 */
export async function geocodeToLngLat(
  query: string,
  memCache: Map<string, [number, number]>,
  accessToken: string,
  types?: string
): Promise<[number, number] | null> {
  const cacheKey = types ? `${query}|types=${types}` : query;
  if (memCache.has(cacheKey)) return memCache.get(cacheKey)!;
  try {
    if (typeof window !== "undefined") {
      const hit = window.localStorage.getItem("mbx:gc:" + cacheKey);
      if (hit) {
        const parsed = JSON.parse(hit) as [number, number];
        memCache.set(cacheKey, parsed);
        return parsed;
      }
    }
  } catch {}
  try {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json` +
      `?limit=1&access_token=${accessToken}` +
      (types ? `&types=${encodeURIComponent(types)}` : "");
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const features =
      (data as { features?: Array<{ center?: [number, number] }> }).features ??
      [];
    const center = features[0]?.center;
    if (Array.isArray(center) && center.length >= 2) {
      const pair: [number, number] = [Number(center[0]), Number(center[1])];
      if (Number.isFinite(pair[0]) && Number.isFinite(pair[1])) {
        memCache.set(cacheKey, pair);
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "mbx:gc:" + cacheKey,
              JSON.stringify(pair)
            );
          }
        } catch {}
        return pair;
      }
    }
  } catch {}
  return null;
}
