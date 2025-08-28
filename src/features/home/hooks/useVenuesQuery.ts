"use client";

import { useEffect, useMemo, useState } from "react";
import { venuesListURL } from "@/utils/api/constants";
import { apiFetch, ApiError } from "@/utils/api/client";
import type { Venue, ListResponse } from "@/types/venue";
import { useSearchParams, useRouter } from "next/navigation";

export function useVenuesQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = 16;

  const url = useMemo(() => venuesListURL({ page, limit }), [page]);

  const [data, setData] = useState<ListResponse<Venue> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError(null);

    apiFetch<ListResponse<Venue>>(url, { signal: abort.signal })
      .then((res) => setData(res))
      .catch((e: unknown) => {
        if ((e as any)?.name !== "AbortError") setError(e as ApiError);
      })
      .finally(() => setLoading(false));

    return () => abort.abort();
  }, [url]);

  function setPage(nextPage: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(Math.max(1, nextPage)));
    router.push(`?${sp.toString()}`);
  }

  return {
    items: data?.data ?? [],
    meta: data?.meta ?? null,
    page,
    limit,
    isLoading,
    error,
    setPage,
  };
}
