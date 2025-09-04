"use client";

import { useEffect, useMemo, useState } from "react";
import { venuesListURL } from "@/utils/api/constants";
import { apiFetch, ApiError } from "@/utils/api/client";
import type { Venue, ListResponse, ListMeta } from "@/types/venue";
import { useSearchParams, useRouter } from "next/navigation";
import { filterJunkVenues } from "@/utils/venues/filter";
import { isVenueAvailable } from "@/utils/venues/availability";
import { filterByPriceRange } from "@/utils/venues/pricing";
import { searchVenuesRaw } from "@/utils/api/venues";

function withSort(
  url: string,
  sort: "created" | "updated" = "created",
  sortOrder: "asc" | "desc" = "desc"
) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}sort=${encodeURIComponent(sort)}&sortOrder=${encodeURIComponent(sortOrder)}`;
}

function buildSearchMeta(total: number, currentPage: number, limit: number): ListMeta {
  const pageCount = Math.max(1, Math.ceil(total / limit));
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

export function useVenuesQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = (searchParams.get("q") ?? "").trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 8;

  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");
  const priceMinStr = searchParams.get("priceMin");
  const priceMaxStr = searchParams.get("priceMax");

  const hasDates = Boolean(startStr && endStr);
  const priceMin = priceMinStr ? Number(priceMinStr) : undefined;
  const priceMax = priceMaxStr ? Number(priceMaxStr) : undefined;

  const filterKey = `${startStr ?? ""}|${endStr ?? ""}|${priceMin ?? ""}|${priceMax ?? ""}`;

  const baseUrl = useMemo(() => {
    const base = venuesListURL({ page, limit, bookings: hasDates });
    return withSort(base, "created", "desc");
  }, [page, limit, hasDates]);

  const [items, setItems] = useState<Venue[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const deps: readonly [string, string, string] = [baseUrl, q, filterKey];

  useEffect(() => {
    const abort = new AbortController();
    let alive = true;

    const start = startStr ? new Date(startStr) : undefined;
    const end = endStr ? new Date(endStr) : undefined;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // --- SEARCH MODE (client-side pagination) ---
        if (q) {
          const raw = await searchVenuesRaw(q);
          let collected: Venue[] = filterJunkVenues(raw);

          if (hasDates && start && end) {
            collected = collected.filter((v) => isVenueAvailable(v, start, end));
          }
          collected = filterByPriceRange(collected, priceMin, priceMax);

          const total = collected.length;
          const virtualMeta = buildSearchMeta(total, page, limit);
          const startIdx = (virtualMeta.currentPage - 1) * limit;
          const pageItems = collected.slice(startIdx, startIdx + limit);

          if (!alive) return;
          setItems(pageItems);
          setMeta(virtualMeta);
          return;
        }

        // --- LIST MODE (server pagination) ---
        const first = await apiFetch<ListResponse<Venue>>(baseUrl, { signal: abort.signal });

        const originalMeta = first.meta;
        const collected: Venue[] = filterJunkVenues(first.data);

        let nextPage = originalMeta.nextPage ?? originalMeta.currentPage + 1;
        let safety = 0;

        while (
          collected.length < limit &&
          nextPage &&
          !originalMeta.isLastPage &&
          safety < 10
        ) {
          const nextUrl = withSort(venuesListURL({ page: nextPage, limit, bookings: hasDates }), "created", "desc");
          const nextRes = await apiFetch<ListResponse<Venue>>(nextUrl, { signal: abort.signal });
          const filteredNext = filterJunkVenues(nextRes.data);
          collected.push(...filteredNext);

          if (nextRes.meta.isLastPage || nextRes.meta.nextPage == null) break;
          nextPage = nextRes.meta.nextPage;
          safety += 1;
        }

        let final = collected;
        if (hasDates && start && end) {
          final = final.filter((v) => isVenueAvailable(v, start, end));
        }
        final = filterByPriceRange(final, priceMin, priceMax);

        if (!alive) return;
        setItems(final.slice(0, limit));
        setMeta(originalMeta);
      } catch (e: unknown) {
        if (!alive) return;
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e as ApiError);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
      abort.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  function setPage(nextPage: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(Math.max(1, nextPage)));
    router.push(`?${sp.toString()}`, { scroll: false });
  }

  return { items, meta, page, limit, isLoading, error, setPage };
}
