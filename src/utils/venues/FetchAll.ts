import type { Venue, ListResponse } from "@/types/venue";
import { venuesListURL } from "@/utils/api/constants";
import { apiFetch } from "@/utils/api/client";

/** Append Holidaze sort params to a URL.
 * @param url Base URL (may already contain query params)
 * @param sort Field to sort by (default: "created")
 * @param sortOrder Direction (default: "desc")
 * @returns URL with `sort` and `sortOrder` appended.
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

/** Fetch **all** venues by walking paginated results in large chunks.
 * Uses `venuesListURL(page,limit,bookings)` and forces newest-first ordering.
 *
 * @param includeBookings When true, includes `_bookings` on each venue.
 * @param signal Optional `AbortSignal` to cancel the request loop early.
 * @param chunk Page size (default: 100). Larger = fewer requests, more memory.
 * @param maxPages Safety cap on pages to walk (default: 500).
 * @returns Promise resolving to a flat array of all collected `Venue` objects.
 */
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
      venuesListURL({
        page: nextPage,
        limit: chunk,
        bookings: includeBookings,
      }),
      "created",
      "desc"
    );
    const res = await apiFetch<ListResponse<Venue>>(url, {
      signal,
      cache: "no-store",
      next: { revalidate: 0 },
    });
    collected.push(...res.data);
    if (res.meta.isLastPage || !res.meta.nextPage) break;
    nextPage = res.meta.nextPage;
  }
  return collected;
}
