import type { Venue, ListResponse } from "@/types/venue";
import { venuesListURL } from "@/utils/api/constants";
import { apiFetch } from "@/utils/api/client";

function withSort(
  url: string,
  sort: "created" | "updated" = "created",
  sortOrder: "asc" | "desc" = "desc"
) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}sort=${encodeURIComponent(sort)}&sortOrder=${encodeURIComponent(sortOrder)}`;
}

/** Pulls ALL venues in large chunks. Optionally includes _bookings. */
export async function fetchAllVenues(
  includeBookings: boolean,
  signal?: AbortSignal,
  chunk = 100,
  maxPages = 500
): Promise<Venue[]> {
  const collected: Venue[] = [];
  let nextPage = 1;

  while (nextPage && nextPage <= maxPages) {
    const url = withSort(
      venuesListURL({ page: nextPage, limit: chunk, bookings: includeBookings }),
      "created",
      "desc"
    );
    const res = await apiFetch<ListResponse<Venue>>(url, { signal });
    collected.push(...res.data);

    if (res.meta.isLastPage || !res.meta.nextPage) break;
    nextPage = res.meta.nextPage;
  }
  return collected;
}
