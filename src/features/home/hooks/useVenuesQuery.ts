"use client";

import { useEffect, useMemo, useState } from "react";
import { venuesListURL } from "@/utils/api/constants";
import { apiFetch, ApiError } from "@/utils/api/client";
import type { Venue, ListResponse, ListMeta } from "@/types/venue";
import { useSearchParams, useRouter } from "next/navigation";
import { filterJunkVenues } from "@/utils/venues/filter";
import { isVenueAvailable } from "@/utils/venues/availability";
import { filterByPriceRange } from "@/utils/venues/pricing";
import { filterByGuests } from "@/utils/venues/guests";
import { UI_PAGE_SIZE, buildMeta } from "@/utils/venues/pagination";
import { matchesQuery } from "@/utils/venues/search";
import { fetchAllVenues } from "@/utils/venues/FetchAll";
import { sortByPrice, type PriceSort } from "@/utils/venues/sort";
import {
  filterByAmenities,
  parseAmenitiesParam,
  type AmenityKey,
} from "@/utils/venues/amenities";

/**
 * Appends sort parameters to a URL.
 *
 * @param url       - Base URL (may already contain query params).
 * @param sort      - Sort field (default: `"created"`).
 * @param sortOrder - Sort order `"asc"` or `"desc"` (default: `"desc"`).
 * @returns URL with `sort` and `sortOrder` applied.
 */
function withSort(
  url: string,
  sort: "created" | "updated" = "created",
  sortOrder: "asc" | "desc" = "desc"
) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}sort=${encodeURIComponent(
    sort
  )}&sortOrder=${encodeURIComponent(sortOrder)}`;
}

/**
 * useVenuesQuery hook.
 *
 * Client-side data hook that powers the home listings + map.
 *
 * Behavior:
 * - Reads filter/sort params from `useSearchParams()`:
 *   `q`, `start`, `end`, `priceMin`, `priceMax`, `guests`, `sort`, `amenities`, `page`.
 * - If any client filters are present, fetches **all** venues (paginated) via `fetchAllVenues`
 *   and applies in-memory filters: junk, text search, availability, price, guests, amenities,
 *   and price sort; then paginates the filtered result for the current page.
 * - If **no** filters are present, fetches a single API page (plus a few follow-up pages
 *   to fill `UI_PAGE_SIZE` after junk filtering) for a faster initial load.
 * - Uses `AbortController` and an `alive` flag to avoid setting state after unmount.
 *
 * Returned API:
 * - `items`: `Venue[]` page slice to render.
 * - `meta`: pagination metadata when available (or `null` when derived client-side).
 * - `page`: current page number from the URL.
 * - `limit`: page size used for the UI (`UI_PAGE_SIZE`).
 * - `isLoading`: loading state.
 * - `error`: last API error encountered (if any).
 * - `setPage(nextPage)`: updates `page` in the URL and anchors to `#listings-grid`.
 *
 * @returns Query state and helpers for rendering listings and pagination.
 */
export function useVenuesQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = (searchParams.get("q") ?? "").trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");
  const priceMinStr = searchParams.get("priceMin");
  const priceMaxStr = searchParams.get("priceMax");
  const guestsStr = searchParams.get("guests");
  const sortStr = (searchParams.get("sort") ?? "").trim() as PriceSort | "";
  const amenitiesParam = searchParams.get("amenities");
  const hasDates = Boolean(startStr && endStr);
  const priceMin = priceMinStr ? Number(priceMinStr) : undefined;
  const priceMax = priceMaxStr ? Number(priceMaxStr) : undefined;
  const guests = guestsStr ? Number(guestsStr) : undefined;
  const sort: PriceSort | undefined =
    sortStr === "price:asc" || sortStr === "price:desc" ? sortStr : undefined;
  const amenities: AmenityKey[] = parseAmenitiesParam(amenitiesParam);
  const hasClientFilters = Boolean(
    q ||
      hasDates ||
      priceMinStr ||
      priceMaxStr ||
      guestsStr ||
      sort ||
      amenities.length
  );
  const baseUrl = useMemo(() => {
    const base = venuesListURL({ page, limit: UI_PAGE_SIZE, bookings: false });
    return withSort(base, "created", "desc");
  }, [page]);
  const filterKey = `${q}|${startStr ?? ""}|${endStr ?? ""}|${priceMin ?? ""}|${
    priceMax ?? ""
  }|${guests ?? ""}|${sort ?? ""}|${amenities.join(",")}`;
  const [items, setItems] = useState<Venue[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!hasClientFilters) return;
    const abort = new AbortController();
    let alive = true;
    const start = startStr ? new Date(startStr) : undefined;
    const end = endStr ? new Date(endStr) : undefined;

    async function loadFiltered() {
      setLoading(true);
      setError(null);
      try {
        const all = await fetchAllVenues(hasDates, abort.signal);
        let filtered = filterJunkVenues(all);
        if (q) filtered = filtered.filter((v) => matchesQuery(v, q));
        if (hasDates && start && end)
          filtered = filtered.filter((v) => isVenueAvailable(v, start, end));
        filtered = filterByPriceRange(filtered, priceMin, priceMax);
        filtered = filterByGuests(filtered, guests);
        filtered = filterByAmenities(filtered, amenities);
        if (sort) filtered = sortByPrice(filtered, sort);
        const m = buildMeta(filtered.length, page, UI_PAGE_SIZE);
        const startIdx = (m.currentPage - 1) * UI_PAGE_SIZE;
        const pageSlice = filtered.slice(startIdx, startIdx + UI_PAGE_SIZE);
        if (!alive) return;
        setItems(pageSlice);
        setMeta(m);
      } catch (e: unknown) {
        if (!alive) return;
        if (e instanceof Error && e.name !== "AbortError")
          setError(e as ApiError);
      } finally {
        if (alive) setLoading(false);
      }
    }
    void loadFiltered();
    return () => {
      alive = false;
      abort.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, page, hasClientFilters]);

  useEffect(() => {
    if (hasClientFilters) return;
    const abort = new AbortController();
    let alive = true;
    async function loadUnfiltered() {
      setLoading(true);
      setError(null);
      try {
        const first = await apiFetch<ListResponse<Venue>>(baseUrl, {
          signal: abort.signal,
        });
        const originalMeta = first.meta;
        const collected: Venue[] = filterJunkVenues(first.data);
        let nextPage = originalMeta.nextPage ?? originalMeta.currentPage + 1;
        let safety = 0;
        while (
          collected.length < UI_PAGE_SIZE &&
          nextPage &&
          !originalMeta.isLastPage &&
          safety < 25
        ) {
          const nextUrl = withSort(
            venuesListURL({
              page: nextPage,
              limit: UI_PAGE_SIZE,
              bookings: false,
            }),
            "created",
            "desc"
          );
          const nextRes = await apiFetch<ListResponse<Venue>>(nextUrl, {
            signal: abort.signal,
          });
          const filteredNext = filterJunkVenues(nextRes.data);
          collected.push(...filteredNext);
          if (nextRes.meta.isLastPage || nextRes.meta.nextPage == null) break;
          nextPage = nextRes.meta.nextPage;
          safety += 1;
        }
        if (!alive) return;
        setItems(collected.slice(0, UI_PAGE_SIZE));
        setMeta(originalMeta);
      } catch (e: unknown) {
        if (!alive) return;
        if (e instanceof Error && e.name !== "AbortError")
          setError(e as ApiError);
      } finally {
        if (alive) setLoading(false);
      }
    }
    void loadUnfiltered();
    return () => {
      alive = false;
      abort.abort();
    };
  }, [baseUrl, hasClientFilters]);

  function setPage(nextPage: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(Math.max(1, nextPage)));
    router.push(`?${sp.toString()}#listings-grid`, { scroll: true });
  }
  return {
    items,
    meta,
    page,
    limit: UI_PAGE_SIZE,
    isLoading,
    error,
    setPage,
  };
}
