// src/features/home/components/MapPanel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Venue } from "@/types/venue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const STYLE_URL =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || "mapbox://styles/mapbox/dark-v11";

// Be gentle with geocoding; limit requests per items change
const GEOCODE_LIMIT_PER_PAGE = 8;

type Props = { items?: Venue[] };

type Point = {
  id: string;
  name: string;
  img: string;
  coords: [number, number]; // [lng, lat]
};

export default function MapPanel({ items = [] }: Props) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const geocodeCacheRef = useRef<Map<string, [number, number]>>(new Map());

  // 1) Points with real lat/lng right away
  const readyPoints = useMemo<Point[]>(() => {
    const src = Array.isArray(items) ? items : [];
    const pts: Point[] = [];
    for (const v of src) {
      const coords = extractCoordsFromVenue(v);
      if (!coords) continue;
      pts.push({
        id: v.id,
        name: v.name ?? "Untitled",
        img: v.media?.[0]?.url ?? "",
        coords,
      });
    }
    if (src.length && pts.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(
        "No mappable coords found. Example location object:",
        (src[0] as unknown as Record<string, unknown>)?.location ?? src[0]
      );
    }
    return pts;
  }, [items]);

  // 2) Targets to geocode (city,country) for those missing coords
  const geocodeTargets = useMemo(() => {
    const src = Array.isArray(items) ? items : [];
    const targets: Array<{ id: string; name: string; img: string; key: string }> = [];
    const already = new Set(readyPoints.map((p) => p.id));

    for (const v of src) {
      if (already.has(v.id)) continue;
      const key = makePlaceKey(v);
      if (key) {
        targets.push({
          id: v.id,
          name: v.name ?? "Untitled",
          img: v.media?.[0]?.url ?? "",
          key,
        });
      }
    }
    return targets;
  }, [items, readyPoints]);

  // 3) Geocode a few missing ones and keep locally
  const [geoPoints, setGeoPoints] = useState<Point[]>([]);
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!geocodeTargets.length || !mapboxgl.accessToken) {
        if (alive) setGeoPoints([]); // reset when list changes to none
        return;
      }

      const toFetch = geocodeTargets.slice(0, GEOCODE_LIMIT_PER_PAGE);
      const results = await Promise.all(
        toFetch.map(async (t) => {
          const coords = await geocodeToLngLat(t.key, geocodeCacheRef.current);
          return coords
            ? ({ id: t.id, name: t.name, img: t.img, coords } as Point)
            : null;
        })
      );

      if (!alive) return;
      const found = results.filter(Boolean) as Point[];
      setGeoPoints(found);
    })();

    return () => {
      alive = false;
    };
  }, [geocodeTargets]);

  // 4) Combined points (deduped by id)
  const points = useMemo(() => {
    if (!geoPoints.length) return readyPoints;
    const seen = new Set<string>();
    const merged: Point[] = [];
    for (const p of readyPoints) {
      merged.push(p);
      seen.add(p.id);
    }
    for (const p of geoPoints) {
      if (!seen.has(p.id)) merged.push(p);
    }
    return merged;
  }, [readyPoints, geoPoints]);

  // Init the map once
  useEffect(() => {
    if (!mapNode.current || mapRef.current || !mapboxgl.accessToken) return;

    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: STYLE_URL,
      center: [10, 59],
      zoom: 3,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render markers whenever points change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!points.length) return;

    const bounds = new mapboxgl.LngLatBounds();

    points.forEach((p) => {
      const el = document.createElement("div");
      // imperial red dot with fallback if CSS var missing
      el.className = "w-3 h-3 rounded-full ring-2 ring-white/50";
      el.style.backgroundColor = "var(--color-imperialRed, #e63946)";

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat(p.coords)
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        new mapboxgl.Popup({ offset: 14 })
          .setLngLat(p.coords)
          .setHTML(
            `<div style="min-width:160px">
               <strong style="display:block;margin-bottom:4px">${escapeHtml(p.name)}</strong>
               ${
                 p.img
                   ? `<img src="${p.img}" alt="${escapeHtml(
                       p.name
                     )}" style="width:100%;height:90px;object-fit:cover;border-radius:8px" />`
                   : ""
               }
             </div>`
          )
          .addTo(map);
      });

      markersRef.current.push(marker);
      bounds.extend(p.coords);
    });

    if (!bounds.isEmpty()) {
      if (points.length === 1) {
        map.easeTo({ center: points[0].coords, zoom: 12, duration: 500 });
      } else {
        map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: 600 });
      }
    }
  }, [points]);

  // Figma size: fill the right grid column; fixed height 636
  return (
    <div className="h-[636px] w-full overflow-hidden">
      <div ref={mapNode} className="h-full w-full" />
    </div>
  );
}

/* ----------------- helpers (typed) ----------------- */

type MaybeNum = number | string | null | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function toNum(x: MaybeNum): number | null {
  if (x == null) return null;
  const n = typeof x === "string" ? Number(x) : x;
  return Number.isFinite(n as number) ? (n as number) : null;
}

function extractCoordsFromVenue(v: Venue): [number, number] | null {
  const rec = v as unknown as Record<string, unknown>;
  const loc = (rec["location"] as Record<string, unknown> | undefined) ?? {};

  const candidates: Array<[MaybeNum, MaybeNum]> = [
    // location.*
    [loc["lng"] as MaybeNum, loc["lat"] as MaybeNum],
    [loc["lon"] as MaybeNum, loc["lat"] as MaybeNum],
    [loc["longitude"] as MaybeNum, loc["latitude"] as MaybeNum],
  ];

  // location.coordinates can be array [lng, lat] or object { lng, lat } / { lon, lat }
  const coordsField = loc["coordinates"] as unknown;
  if (Array.isArray(coordsField) && coordsField.length >= 2) {
    candidates.push([coordsField[0] as MaybeNum, coordsField[1] as MaybeNum]);
  } else if (isRecord(coordsField)) {
    candidates.push([
      coordsField["lng"] as MaybeNum,
      coordsField["lat"] as MaybeNum,
    ]);
    candidates.push([
      coordsField["lon"] as MaybeNum,
      coordsField["lat"] as MaybeNum,
    ]);
  }

  // top-level fields (rare but cheap to check)
  candidates.push([rec["lng"] as MaybeNum, rec["lat"] as MaybeNum]);
  candidates.push([rec["lon"] as MaybeNum, rec["lat"] as MaybeNum]);
  candidates.push([
    rec["longitude"] as MaybeNum,
    rec["latitude"] as MaybeNum,
  ]);

  for (const [lng, lat] of candidates) {
    const Lng = toNum(lng);
    const Lat = toNum(lat);
    if (Lng != null && Lat != null) return [Lng, Lat];
  }
  return null;
}

function makePlaceKey(v: Venue): string | null {
  const rec = v as unknown as Record<string, unknown>;
  const loc = (rec["location"] as Record<string, unknown> | undefined) ?? {};
  const city = String(loc["city"] ?? "").trim();
  const country = String(loc["country"] ?? "").trim();
  const parts = [city, country].filter(Boolean);
  return parts.length ? parts.join(", ") : null; // e.g., "Oslo, Norway" or "Oslo"
}

async function geocodeToLngLat(
  query: string,
  memCache: Map<string, [number, number]>
): Promise<[number, number] | null> {
  if (memCache.has(query)) return memCache.get(query)!;

  // localStorage cache (browser only)
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
    )}.json?limit=1&access_token=${mapboxgl.accessToken}`;
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
        } catch {
          /* ignore */
        }
        return pair;
      }
    }
  } catch {
    /* ignore network errors silently */
  }
  return null;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (ch) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[ch]!;
  });
}
