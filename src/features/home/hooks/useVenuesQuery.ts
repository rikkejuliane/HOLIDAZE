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
import { sortByPrice, type PriceSort } from "@/utils/venues/sort"; // ← added

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
  const sortStr = (searchParams.get("sort") ?? "").trim() as PriceSort | ""; // ← added

  const hasDates = Boolean(startStr && endStr);
  const priceMin = priceMinStr ? Number(priceMinStr) : undefined;
  const priceMax = priceMaxStr ? Number(priceMaxStr) : undefined;
  const guests = guestsStr ? Number(guestsStr) : undefined;
  const sort: PriceSort | undefined =
    sortStr === "price:asc" || sortStr === "price:desc" ? sortStr : undefined; // ← added

  const hasClientFilters = Boolean(
    q || hasDates || priceMinStr || priceMaxStr || guestsStr || sort // ← added sort
  );

  // Server-paginated list (used only when no client filters)
  const baseUrl = useMemo(() => {
    const base = venuesListURL({ page, limit: UI_PAGE_SIZE, bookings: false });
    return withSort(base, "created", "desc");
  }, [page]);

  // Stable key for filtered mode
  const filterKey = `${q}|${startStr ?? ""}|${endStr ?? ""}|${priceMin ?? ""}|${
    priceMax ?? ""
  }|${guests ?? ""}|${sort ?? ""}`; // ← added sort

  const [items, setItems] = useState<Venue[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // FILTERED MODE: fetch ALL, then paginate client-side
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

        // ← apply sort AFTER all filters
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

  // UNFILTERED MODE: use server pagination and TOP-UP to ensure 8 visible items
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

        // Top-up: fetch subsequent pages until we have 8 clean items or hit the end
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
