"use client";

import { useEffect, useMemo, useState } from "react";
import { venuesListURL } from "@/utils/api/constants";
import { apiFetch, ApiError } from "@/utils/api/client";
import type { Venue, ListResponse, ListMeta } from "@/types/venue";
import { useSearchParams, useRouter } from "next/navigation";
import { filterJunkVenues } from "@/utils/venues";

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
  const limit = 8;

  const baseUrl = useMemo(() => {
    const base = venuesListURL({ page, limit });
    return withSort(base, "created", "desc");
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
        const first = await apiFetch<ListResponse<Venue>>(baseUrl, {
          signal: abort.signal,
        });

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

          if (nextRes.meta.isLastPage || nextRes.meta.nextPage == null) break;

          nextPage = nextRes.meta.nextPage;
          safety += 1;
        }

        if (!alive) return;

        setItems(collected.slice(0, limit));
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
  }, [baseUrl, page, limit]);

  function setPage(nextPage: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(Math.max(1, nextPage)));
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
