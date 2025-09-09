// src/features/home/components/MapPanel.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Venue } from "@/types/venue";
import mapboxgl from "mapbox-gl";
import { createRoot, type Root } from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";

import MapVenuePopupCard from "@/features/home/components/map/MapVenuePopupCard";
import {
  extractCoordsFromVenue,
  extractCityCountry,
  geocodeToLngLat,
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
  coords: [number, number];
  city?: string;
  country?: string;
  price?: number | null;
};
type Bundle = { marker: mapboxgl.Marker; popup: mapboxgl.Popup; root: Root };

function scheduleUnmount(root: Root) {
  setTimeout(() => {
    try {
      root.unmount();
    } catch {}
  }, 0);
}

export default function MapPanel({ items = [] }: Props) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const bundlesRef = useRef<Bundle[]>([]);
  const geocodeCacheRef = useRef<Map<string, [number, number]>>(new Map());

  const readyPoints = useMemo<Point[]>(() => {
    const out: Point[] = [];
    for (const v of items ?? []) {
      const coords = extractCoordsFromVenue(v);
      if (!coords) continue;
      const { city, country } = extractCityCountry(v);
      out.push({
        id: v.id,
        name: v.name ?? "Untitled",
        img: v.media?.[0]?.url ?? "",
        coords,
        city,
        country,
        price: typeof v.price === "number" ? v.price : null,
      });
    }
    return out;
  }, [items]);

  const geocodeTargets = useMemo(() => {
    const already = new Set(readyPoints.map((p) => p.id));
    return (items ?? [])
      .filter((v) => !already.has(v.id))
      .map((v) => {
        const { city, country } = extractCityCountry(v);
        const c = (city ?? "").trim();
        const co = (country ?? "").trim();

        const keys: string[] = [];
        if (c && co) {
          if (c.toLowerCase() === co.toLowerCase()) keys.push(c, co);
          else keys.push(`${c}, ${co}`, c, co);
        } else if (c) keys.push(c);
        else if (co) keys.push(co);

        const uniq = Array.from(new Set(keys)).filter(Boolean);
        if (!uniq.length) return null;

        return {
          id: v.id,
          name: v.name ?? "Untitled",
          img: v.media?.[0]?.url ?? "",
          keys: uniq,
          city: c || undefined,
          country: co || undefined,
          price: typeof v.price === "number" ? v.price : null,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      name: string;
      img: string;
      keys: string[];
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
          let coords: [number, number] | null = null;
          for (const q of t.keys) {
            coords = await geocodeToLngLat(
              q,
              geocodeCacheRef.current,
              mapboxgl.accessToken as string
            );
            if (coords) break;
          }
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
      bundlesRef.current.forEach(({ popup, marker, root }) => {
        try {
          popup.remove();
        } catch {}
        try {
          marker.remove();
        } catch {}
        scheduleUnmount(root);
      });
      bundlesRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    bundlesRef.current.forEach(({ popup, marker, root }) => {
      try {
        popup.remove();
      } catch {}
      try {
        marker.remove();
      } catch {}
      scheduleUnmount(root);
    });
    bundlesRef.current = [];

    if (!points.length) return;

    const bounds = new mapboxgl.LngLatBounds();

    points.forEach((p) => {
      const el = document.createElement("div");
      el.className = "w-3 h-3 rounded-full ring-2 ring-white/50";
      (el.style as CSSStyleDeclaration).backgroundColor =
        "var(--color-imperialRed, #e63946)";
      (el.style as CSSStyleDeclaration).cursor = "pointer";

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat(p.coords)
        .addTo(map);

      const container = document.createElement("div");
      const root = createRoot(container);

      const popup = new mapboxgl.Popup({
        offset: 18,
        anchor: "bottom",
        closeButton: false,
        closeOnClick: true,
        className: "no-tip clean",
        focusAfterOpen: false,
      } as mapboxgl.PopupOptions).setDOMContent(container);

      root.render(
        <MapVenuePopupCard
          id={p.id}
          name={p.name}
          img={p.img}
          city={p.city}
          country={p.country}
          price={p.price ?? undefined}
          basePath={VENUE_BASE_PATH}
          onClose={() => popup.remove()}
        />
      );

      popup.on("open", () => {
        const viewH = map.getContainer()?.clientHeight ?? 0;
        const popupH = container.offsetHeight || 220;
      
        const isShort = viewH > 0 && viewH <= 360; // ~h-[300px]–h-[360px]
      
        if (isShort) {
          // Push the marker toward the bottom so the card sits at the bottom edge
          const bottomPad = 0;
          // Leave enough top padding to accommodate the popup height (+ a bit)
          const topPad = Math.min(popupH + 24, Math.max(0, viewH - bottomPad - 8));
      
          map.easeTo({
            center: p.coords,
            padding: { top: topPad, bottom: bottomPad, left: 0, right: 0 },
            duration: 300,
            maxZoom: Math.max(map.getZoom(), 12),
          });
        } else {
          // Original “center the popup” behavior on taller maps
          const offsetY = Math.min(Math.round(popupH / 2 + 24), 220);
          map.easeTo({
            center: p.coords,
            offset: [0, offsetY],
            duration: 300,
            maxZoom: Math.max(map.getZoom(), 12),
          });
        }
      });

      marker.setPopup(popup);

      bundlesRef.current.push({ marker, popup, root });
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

  return (
    <div className="h-[300px] xl:h-[636px] w-full overflow-hidden overscroll-contain">
      <div ref={mapNode} className="h-full w-full" />
    </div>
  );
}
