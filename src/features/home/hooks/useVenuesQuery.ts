// src/features/home/hooks/useVenuesQuery.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { venuesListURL } from "@/utils/api/constants";
import { apiFetch, ApiError } from "@/utils/api/client";
import type { Venue, ListResponse, ListMeta } from "@/types/venue";
import { useSearchParams, useRouter } from "next/navigation";
import { filterJunkVenues } from "@/utils/venues";

// Append API sorting (newest first)
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

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 8; // always show 8 cards per page

  // Base URL for the requested page (sorted newest first)
  const baseUrl = useMemo(() => {
    const base = venuesListURL({ page, limit }); // e.g. "/holidaze/venues?page=1&limit=8"
    return withSort(base, "created", "desc"); // or ("updated","desc") if your API supports it reliably
  }, [page, limit]);

  const [items, setItems] = useState<Venue[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1) Fetch the requested page
        const first = await apiFetch<ListResponse<Venue>>(baseUrl, {
          signal: abort.signal,
        });

        // Keep original meta so pagination UI stays consistent with API pages
        const originalMeta = first.meta;

        // 2) Start with filtered results from this page
        const collected: Venue[] = filterJunkVenues(first.data);

        // 3) If we still have fewer than `limit`, pull subsequent API pages
        let nextPage = originalMeta.nextPage ?? originalMeta.currentPage + 1;
        let safety = 0;

        while (
          collected.length < limit &&
          nextPage &&
          !originalMeta.isLastPage &&
          safety < 10
        ) {
          const nextUrl = withSort(
            venuesListURL({ page: nextPage, limit }),
            "created",
            "desc"
          );

          const nextRes = await apiFetch<ListResponse<Venue>>(nextUrl, {
            signal: abort.signal,
          });

          const filteredNext = filterJunkVenues(nextRes.data);
          collected.push(...filteredNext);

          // stop if API has no more pages
          if (nextRes.meta.isLastPage || nextRes.meta.nextPage == null) break;

          nextPage = nextRes.meta.nextPage;
          safety += 1;
        }

        if (!alive) return;

        // 4) Hard-cap to exactly `limit`
        setItems(collected.slice(0, limit));
        setMeta(originalMeta);
      } catch (e: unknown) {
        if (!alive) return;
        if (e instanceof Error && e.name !== "AbortError") {
          // keep ApiError type for consumers
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
  }, [baseUrl, page, limit]);

  function setPage(nextPage: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(Math.max(1, nextPage)));
    // Prevent Next.js default scroll-to-top on navigation
    router.push(`?${sp.toString()}`, { scroll: false });
  }

  return {
    items,
    meta,
    page,
    limit,
    isLoading,
    error,
    setPage,
  };
}
