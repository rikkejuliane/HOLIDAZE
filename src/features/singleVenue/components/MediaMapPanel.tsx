"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { geocodeToLngLat } from "@/utils/map/helpers";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const STYLE_URL =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || "mapbox://styles/mapbox/dark-v11";

type MediaItem = { url?: string | null; alt?: string | null };
type Owner = { email?: string | null };
type Location = {
  lat?: number | null;
  lng?: number | null;
  city?: string | null;
  country?: string | null;
};
type Props = {
  media?: MediaItem[] | null;
  owner?: Owner | null;
  location?: Location | null;
  placeholderSrc?: string;
};

// Typed response for direct Mapbox fetch (no 'any')
type MapboxFeature = { center?: [number, number] };
type MapboxGeocodeResponse = { features?: MapboxFeature[] };

/**
 * MediaMapPanel
 *
 * A split “PHOTOS / MAP” panel for a venue detail page.
 * - Photos: shows the current image with previous/next controls (if >1 image).
 * - Map: renders a Mapbox map centered on provided coordinates, or falls back
 *   to geocoding `city`/`country` when lat/lng are missing. If location
 *   cannot be resolved, shows a helpful message (with a mailto link if
 *   `owner.email` is available).
 *
 * Behavior
 * - Mode toggled via two buttons: "PHOTOS" and "MAP".
 * - Photo source order is taken from `media`; if empty, `placeholderSrc` is used.
 * - Map is lazily initialized only when the "MAP" tab is active and a center
 *   is available. Uses:
 *   - `process.env.NEXT_PUBLIC_MAPBOX_TOKEN` (required)
 *   - `process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL` (optional, defaults to dark-v11)
 * - Coordinates at (0,0) are treated as invalid.
 * - Geocoding runs as soon as props are available (not only after you
 *   switch to the MAP tab). We first try the shared helper (no `types`),
 *   then fall back to a direct Mapbox fetch if needed. Map updates if derived
 *   coords arrive later.
 *
 * Accessibility
 * - Photo nav buttons have aria-labels.
 * - Tab buttons use `aria-pressed`.
 *
 * Props
 * @param media          Optional list of media items { url, alt }.
 * @param owner          Optional owner info { email } for fallback contact link.
 * @param location       Optional location { lat, lng, city, country }.
 * @param placeholderSrc Fallback image URL (default: "/listingplaceholder.jpg").
 */
export default function MediaMapPanel({
  media,
  owner,
  location,
  placeholderSrc = "/listingplaceholder.jpg",
}: Props) {
  const [mode, setMode] = useState<"photos" | "map">("photos");
  const images = useMemo(
    () => (media ?? []).map((m) => m?.url).filter(Boolean) as string[],
    [media]
  );
  const hasImages = images.length > 0;
  const [idx, setIdx] = useState(0);
  const canPrevNext = images.length > 1;
  const currSrc = hasImages ? images[idx] : placeholderSrc;

  const lat = location?.lat ?? null;
  const lng = location?.lng ?? null;
  const hasCoords =
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    (lat !== 0 || lng !== 0);

  // Keys like homepage: "City, Country" → City → Country (dedupe + city===country guard)
  const placeKeys = useMemo(() => {
    const c = (location?.city ?? "").trim();
    const co = (location?.country ?? "").trim();
    const keys: string[] = [];
    if (c && co) {
      if (c.toLowerCase() === co.toLowerCase()) {
        keys.push(c, co);
      } else {
        keys.push(`${c}, ${co}`, c, co);
      }
    } else if (c) keys.push(c);
    else if (co) keys.push(co);
    return Array.from(new Set(keys)).filter(Boolean);
  }, [location?.city, location?.country]);

  const geoCacheRef = useRef<Map<string, [number, number]>>(new Map());
  const [derived, setDerived] = useState<[number, number] | null>(null);

  // Prefetch geocode (don’t wait for MAP tab)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (hasCoords || !placeKeys.length || !mapboxgl.accessToken) {
        setDerived(null);
        return;
      }

      // Pass 1: helper (no types), mirrors homepage
      for (const q of placeKeys) {
        try {
          const coords = await geocodeToLngLat(
            q,
            geoCacheRef.current,
            mapboxgl.accessToken as string
          );
          if (!alive) return;
          if (coords) {
            setDerived(coords);
            return;
          }
        } catch {
          /* ignore and try next */
        }
      }

      // Pass 2: direct Mapbox fetch (typed)
      for (const q of placeKeys) {
        try {
          const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            q
          )}.json?access_token=${mapboxgl.accessToken}`;
          const r = await fetch(url);
          if (!alive) return;
          if (!r.ok) continue;
          const json: MapboxGeocodeResponse = await r.json();
          const coords = json.features?.[0]?.center ?? null;
          if (coords && coords.length === 2) {
            setDerived(coords as [number, number]);
            return;
          }
        } catch {
          /* ignore and try next */
        }
      }

      setDerived(null);
    })();
    return () => {
      alive = false;
    };
  }, [hasCoords, placeKeys]);

  const noToken = !mapboxgl.accessToken;
  const showMap = (hasCoords || !!derived) && !noToken;

  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Create map when MAP tab is active and we have a center
  useEffect(() => {
    if (mode !== "map") return;
    if (!showMap) return;
    if (mapRef.current || !mapNodeRef.current) return;

    const center: [number, number] = hasCoords
      ? [lng as number, lat as number]
      : (derived as [number, number]);

    const map = new mapboxgl.Map({
      container: mapNodeRef.current,
      style: STYLE_URL,
      center,
      zoom: 13,
      attributionControl: false,
    });
    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );

    const el = document.createElement("div");
    el.className = "w-3 h-3 rounded-full ring-2 ring-primary/50";
    (el.style as CSSStyleDeclaration).backgroundColor =
      "var(--color-imperialRed, #e63946)";

    const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
      .setLngLat(center)
      .addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      try {
        marker.remove();
      } catch {}
      try {
        map.remove();
      } catch {}
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [mode, showMap, hasCoords, lat, lng, derived]);

  // If derived coords arrive after map mount, update smoothly
  useEffect(() => {
    if (mode !== "map") return;
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const center: [number, number] | null = hasCoords
      ? [lng as number, lat as number]
      : derived;

    if (!center) return;

    marker.setLngLat(center);
    map.easeTo({ center, zoom: Math.max(map.getZoom(), 13), duration: 400 });
  }, [mode, hasCoords, lat, lng, derived]);

  /**
   * prev
   * Moves the photo carousel to the previous image (wrap-around).
   * Does nothing when there is fewer than 2 images.
   */
  function prev() {
    if (!canPrevNext) return;
    setIdx((i) => (i - 1 + images.length) % images.length);
  }

  /**
   * next
   * Moves the photo carousel to the next image (wrap-around).
   * Does nothing when there is fewer than 2 images.
   */
  function next() {
    if (!canPrevNext) return;
    setIdx((i) => (i + 1) % images.length);
  }

  const reason =
    noToken
      ? "Map is unavailable — missing or restricted Mapbox token."
      : !placeKeys.length && !hasCoords
      ? "No city/country available to locate this venue."
      : "We couldn’t locate this venue on the map.";

  return (
    <div className="relative w-full md:w-[720px] h-[56vw] md:h-[680px] min-h-[260px] overflow-hidden object-fit">
      {/* TABS */}
      <div className="absolute z-20 top-9 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center w-[200px] h-[38px] mx-auto rounded-[10px] bg-secondary/10 border border-secondary/0 backdrop-blur-[5.10px]">
        <button
          type="button"
          aria-pressed={mode === "photos"}
          onClick={() => setMode("photos")}
          className={`w-[100px] h-[38px] rounded-[10px] font-jakarta font-bold text-[15px] ${
            mode === "photos" ? "bg-secondary text-primary" : "text-primary"
          }`}>
          PHOTOS
        </button>
        <button
          type="button"
          aria-pressed={mode === "map"}
          onClick={() => setMode("map")}
          className={`w-[100px] h-[38px] rounded-[10px] font-jakarta font-bold text-[15px] ${
            mode === "map" ? "bg-secondary text-primary" : "text-primary"
          }`}>
          MAP
        </button>
      </div>
      {/* PHOTOS PANEL */}
      <div
        className={`absolute inset-0 transition-transform duration-300 ${
          mode === "photos" ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={mode !== "photos"}>
        <div className="relative w-full h-full">
          <Image
            src={currSrc}
            alt={media?.[idx]?.alt || "Venue photo"}
            fill
            sizes="(max-width: 767px) 100vw, 720px"
            priority
            className="object-cover"
            unoptimized
          />
        </div>
        {canPrevNext && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-[32px] items-center">
            <button
              onClick={prev}
              aria-label="Previous image"
              className="w-[26px] h-[26px] bg-secondary/70 rounded-full border-[1.25px] border-primary/10 backdrop-blur-[5.10px] flex items-center justify-center">
              <svg
                width="9"
                height="16"
                viewBox="0 0 9 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.1875 1L1 8.1875L8.1875 15.375"
                  stroke="#FCFEFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="w-[26px] h-[26px] bg-secondary/70 rounded-full border-[1.25px] border-primary/10 backdrop-blur-[5.10px] flex items-center justify-center">
              <svg
                width="9"
                height="16"
                viewBox="0 0 9 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M0.8125 15L8 7.8125L0.8125 0.625"
                  stroke="#FCFEFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
      {/* MAP PANEL*/}
      <div
        className={`absolute inset-0 transition-transform duration-300 ${
          mode === "map" ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={mode !== "map"}>
        {showMap ? (
          <div ref={mapNodeRef} className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/20 text-center px-8">
            <div className="max-w-xs">
              <p className="text-sm text-primary/80">
                {reason}
              </p>
              {owner?.email ? (
                <a
                  className="mt-2 inline-block underline text-primary"
                  href={`mailto:${owner.email}?subject=Address%20request`}>
                  Ask the venue manager for the address
                </a>
              ) : (
                <p className="mt-2 text-sm text-primary/70">
                  Ask the venue manager for the address
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
