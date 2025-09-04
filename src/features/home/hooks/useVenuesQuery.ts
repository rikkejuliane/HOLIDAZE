"use client";

import { useEffect, useMemo, useState } from "react";
import { venuesListURL } from "@/utils/api/constants";
import { apiFetch, ApiError } from "@/utils/api/client";
import type { Venue, ListResponse, ListMeta } from "@/types/venue";
import { useSearchParams, useRouter } from "next/navigation";
import { filterJunkVenues } from "@/utils/venues/filter";
import { isVenueAvailable } from "@/utils/venues/availability";
import { filterByPriceRange } from "@/utils/venues/pricing";

const UI_PAGE_SIZE = 8;

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

function buildMeta(
  total: number,
  currentPage: number,
  pageSize: number
): ListMeta {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const cur = Math.min(Math.max(1, currentPage), pageCount);
  return {
    currentPage: cur,
    pageCount,
    totalCount: total,
    isFirstPage: cur === 1,
    isLastPage: cur === pageCount,
    previousPage: cur > 1 ? cur - 1 : null,
    nextPage: cur < pageCount ? cur + 1 : null,
  };
}

function matchesQuery(v: Venue, q: string): boolean {
  if (!q) return true;
  const hay = `${v.name ?? ""} ${v.description ?? ""}`.toLowerCase();
  return hay.includes(q.toLowerCase());
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

  const hasDates = Boolean(startStr && endStr);
  const priceMin = priceMinStr ? Number(priceMinStr) : undefined;
  const priceMax = priceMaxStr ? Number(priceMaxStr) : undefined;

  const hasClientFilters = Boolean(q || hasDates || priceMinStr || priceMaxStr);

  // Server-paginated list (used only when no client filters)
  const baseUrl = useMemo(() => {
    const base = venuesListURL({ page, limit: UI_PAGE_SIZE, bookings: false });
    return withSort(base, "created", "desc");
  }, [page]);

  // Stable key for filtered mode
  const filterKey = `${q}|${startStr ?? ""}|${endStr ?? ""}|${priceMin ?? ""}|${
    priceMax ?? ""
  }`;

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

    async function fetchAllVenues(includeBookings: boolean): Promise<Venue[]> {
      const collected: Venue[] = [];
      let nextPage = 1;
      const LIMIT = 100; // large chunks to reduce round-trips
      const MAX_PAGES = 500; // safety

      while (nextPage && nextPage <= MAX_PAGES) {
        const url = withSort(
          venuesListURL({
            page: nextPage,
            limit: LIMIT,
            bookings: includeBookings,
          }),
          "created",
          "desc"
        );
        const res = await apiFetch<ListResponse<Venue>>(url, {
          signal: abort.signal,
        });
        collected.push(...res.data);
        if (res.meta.isLastPage || !res.meta.nextPage) break;
        nextPage = res.meta.nextPage;
      }
      return collected;
    }

    async function loadFiltered() {
      setLoading(true);
      setError(null);
      try {
        const all = await fetchAllVenues(hasDates);
        let filtered = filterJunkVenues(all);

        if (q) filtered = filtered.filter((v) => matchesQuery(v, q));
        if (hasDates && start && end)
          filtered = filtered.filter((v) => isVenueAvailable(v, start, end));
        filtered = filterByPriceRange(filtered, priceMin, priceMax);

        const m = buildMeta(filtered.length, page, UI_PAGE_SIZE);
        const startIdx = (m.currentPage - 1) * UI_PAGE_SIZE;
        const pageSlice = filtered.slice(startIdx, startIdx + UI_PAGE_SIZE);

        if (!alive) return;
        setItems(pageSlice);
        setMeta(m);
      } catch (e: unknown) {
        if (!alive) return;
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e as ApiError);
        }
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

  // UNFILTERED MODE: use server pagination directly (fast)
  useEffect(() => {
    if (hasClientFilters) return;

    const abort = new AbortController();
    let alive = true;

    async function loadUnfiltered() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<ListResponse<Venue>>(baseUrl, {
          signal: abort.signal,
        });
        const pageItems = filterJunkVenues(res.data);

        if (!alive) return;
        setItems(pageItems);
        setMeta(res.meta);
      } catch (e: unknown) {
        if (!alive) return;
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e as ApiError);
        }
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
