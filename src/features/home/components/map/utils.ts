import type { Venue } from "@/types/venue";

type MaybeNum = number | string | null | undefined;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

export function toNum(x: MaybeNum): number | null {
  if (x == null) return null;
  const n = typeof x === "string" ? Number(x) : x;
  return Number.isFinite(n as number) ? (n as number) : null;
}

export function extractCoordsFromVenue(v: Venue): [number, number] | null {
  const rec = v as unknown as Record<string, unknown>;
  const loc = (rec["location"] as Record<string, unknown> | undefined) ?? {};

  const candidates: Array<[MaybeNum, MaybeNum]> = [
    [loc["lng"] as MaybeNum, loc["lat"] as MaybeNum],
    [loc["lon"] as MaybeNum, loc["lat"] as MaybeNum],
    [loc["longitude"] as MaybeNum, loc["latitude"] as MaybeNum],
  ];

  const coordsField = loc["coordinates"] as unknown;
  if (Array.isArray(coordsField) && coordsField.length >= 2) {
    candidates.push([coordsField[0] as MaybeNum, coordsField[1] as MaybeNum]);
  } else if (isRecord(coordsField)) {
    candidates.push([coordsField["lng"] as MaybeNum, coordsField["lat"] as MaybeNum]);
    candidates.push([coordsField["lon"] as MaybeNum, coordsField["lat"] as MaybeNum]);
  }

  candidates.push([rec["lng"] as MaybeNum, rec["lat"] as MaybeNum]);
  candidates.push([rec["lon"] as MaybeNum, rec["lat"] as MaybeNum]);
  candidates.push([rec["longitude"] as MaybeNum, rec["latitude"] as MaybeNum]);

  for (const [lng, lat] of candidates) {
    const Lng = toNum(lng);
    const Lat = toNum(lat);
    if (Lng != null && Lat != null) return [Lng, Lat];
  }
  return null;
}

export function extractCityCountry(v: Venue): { city?: string; country?: string } {
  const rec = v as unknown as Record<string, unknown>;
  const loc = (rec["location"] as Record<string, unknown> | undefined) ?? {};
  const city = String(loc["city"] ?? "").trim() || undefined;
  const country = String(loc["country"] ?? "").trim() || undefined;
  return { city, country };
}

export function makePlaceKey(v: Venue): { key: string | null; city?: string; country?: string } {
  const { city, country } = extractCityCountry(v);
  const parts = [city, country].filter(Boolean) as string[];
  return { key: parts.length ? parts.join(", ") : null, city, country };
}

// Mapbox geocoding with simple in-memory + localStorage cache
export async function geocodeToLngLat(
  query: string,
  memCache: Map<string, [number, number]>,
  accessToken: string
): Promise<[number, number] | null> {
  if (memCache.has(query)) return memCache.get(query)!;

  try {
    if (typeof window !== "undefined") {
      const hit = window.localStorage.getItem("mbx:gc:" + query);
      if (hit) {
        const parsed = JSON.parse(hit) as [number, number];
        memCache.set(query, parsed);
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?limit=1&access_token=${accessToken}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const features = (data as { features?: Array<{ center?: [number, number] }> }).features ?? [];
    const center = features[0]?.center;
    if (Array.isArray(center) && center.length >= 2) {
      const pair: [number, number] = [Number(center[0]), Number(center[1])];
      if (Number.isFinite(pair[0]) && Number.isFinite(pair[1])) {
        memCache.set(query, pair);
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem("mbx:gc:" + query, JSON.stringify(pair));
          }
        } catch {}
        return pair;
      }
    }
  } catch {}
  return null;
}
