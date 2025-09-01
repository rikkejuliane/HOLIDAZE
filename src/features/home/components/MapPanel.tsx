"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Venue } from "@/types/venue";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";

import MapVenuePopupCard from "@/features/home/components/map/MapVenuePopupCard";
import {
  extractCoordsFromVenue,
  extractCityCountry,
  geocodeToLngLat,
  makePlaceKey,
} from "@/features/home/components/map/utils";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const STYLE_URL =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL || "mapbox://styles/mapbox/dark-v11";

const GEOCODE_LIMIT_PER_PAGE = 8;
const VENUE_BASE_PATH = "/venues";

type Props = { items?: Venue[] };

type Point = {
  id: string;
  name: string;
  img: string;
  coords: [number, number]; // [lng, lat]
  city?: string;
  country?: string;
  price?: number | null;
};

export default function MapPanel({ items = [] }: Props) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const geocodeCacheRef = useRef<Map<string, [number, number]>>(new Map());

  // ready (has coords)
  const readyPoints = useMemo<Point[]>(() => {
    const pts: Point[] = [];
    for (const v of items ?? []) {
      const coords = extractCoordsFromVenue(v);
      if (!coords) continue;
      const { city, country } = extractCityCountry(v);
      pts.push({
        id: v.id,
        name: v.name ?? "Untitled",
        img: v.media?.[0]?.url ?? "",
        coords,
        city,
        country,
        price: typeof v.price === "number" ? v.price : null,
      });
    }
    return pts;
  }, [items]);

  // missing coords → geocode by city,country
  const geocodeTargets = useMemo(() => {
    const already = new Set(readyPoints.map((p) => p.id));
    return (items ?? [])
      .filter((v) => !already.has(v.id))
      .map((v) => {
        const { key, city, country } = makePlaceKey(v);
        return key
          ? {
              id: v.id,
              name: v.name ?? "Untitled",
              img: v.media?.[0]?.url ?? "",
              key,
              city,
              country,
              price: typeof v.price === "number" ? v.price : null,
            }
          : null;
      })
      .filter(Boolean) as Array<{
      id: string;
      name: string;
      img: string;
      key: string;
      city?: string;
      country?: string;
      price?: number | null;
    }>;
  }, [items, readyPoints]);

  const [geoPoints, setGeoPoints] = useState<Point[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!geocodeTargets.length || !mapboxgl.accessToken) {
        if (alive) setGeoPoints([]);
        return;
      }
      const toFetch = geocodeTargets.slice(0, GEOCODE_LIMIT_PER_PAGE);
      const results = await Promise.all(
        toFetch.map(async (t) => {
          const coords = await geocodeToLngLat(
            t.key,
            geocodeCacheRef.current,
            mapboxgl.accessToken as string
          );
          return coords
            ? ({
                id: t.id,
                name: t.name,
                img: t.img,
                coords,
                city: t.city,
                country: t.country,
                price: t.price ?? null,
              } as Point)
            : null;
        })
      );
      if (!alive) return;
      setGeoPoints(results.filter(Boolean) as Point[]);
    })();
    return () => {
      alive = false;
    };
  }, [geocodeTargets]);

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

  // remove tip + white background (once)
  useEffect(() => {
    if (document.getElementById("mapbox-popup-style")) return;
    const tag = document.createElement("style");
    tag.id = "mapbox-popup-style";
    tag.textContent = `
      .mapboxgl-popup.no-tip .mapboxgl-popup-tip { display: none !important; }
      .mapboxgl-popup.no-tip { padding-bottom: 0 !important; }
      .mapboxgl-popup.clean .mapboxgl-popup-content {
        background: transparent !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
    `;
    document.head.appendChild(tag);
  }, []);

  // init map
  useEffect(() => {
    if (!mapNode.current || mapRef.current || !mapboxgl.accessToken) return;
    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: STYLE_URL,
      center: [10, 59],
      zoom: 3,
      attributionControl: false,
    });
    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );
    mapRef.current = map;
    return () => {
      // clear markers + popups
      markersRef.current.forEach((m) => {
        m.getPopup()?.remove();
        m.remove();
      });
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // markers + React popups
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear old markers/popups
    markersRef.current.forEach((m) => {
      m.getPopup()?.remove();
      m.remove();
    });
    markersRef.current = [];

    if (!points.length) return;

    const bounds = new mapboxgl.LngLatBounds();

    points.forEach((p) => {
      // red dot
      const el = document.createElement("div");
      el.className = "w-3 h-3 rounded-full ring-2 ring-white/50";
      (el.style as CSSStyleDeclaration).backgroundColor =
        "var(--color-imperialRed, #e63946)";
      (el.style as CSSStyleDeclaration).cursor = "pointer";

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat(p.coords)
        .addTo(map);

      // React popup content
      const container = document.createElement("div");
      const root = createRoot(container);

      // Create popup first so we can reference it in onClose
      const popup = new mapboxgl.Popup({
        offset: 18,
        anchor: "bottom",
        closeButton: false,
        closeOnClick: true,
        className: "no-tip clean", // transparent; no speech-bubble tip
      });

      root.render(
        <MapVenuePopupCard
          id={p.id}
          name={p.name}
          img={p.img}
          city={p.city}
          country={p.country}
          price={p.price ?? undefined}
          basePath={VENUE_BASE_PATH}
          onClose={() => popup.remove()} // 👈 close from the X button
        />
      );

      popup.setDOMContent(container);

      // center map when popup opens
      popup.on("open", () => {
        const h = container.offsetHeight || 220;
        const offsetY = Math.min(Math.round(h / 2 + 24), 200);
        map.easeTo({
          center: p.coords,
          offset: [0, offsetY],
          duration: 300,
          maxZoom: Math.max(map.getZoom(), 12),
        });
      });

      // defer unmount to avoid React warning
      popup.on("close", () => {
        setTimeout(() => root.unmount(), 0);
      });

      marker.setPopup(popup);

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

  // size from grid column (500w) and fixed 636h per your Figma
  return (
    <div className="h-[636px] w-full overflow-hidden">
      <div ref={mapNode} className="h-full w-full" />
    </div>
  );
}
