import type { ListResponse, Venue } from "@/types/venue";
import { apiFetch } from "./client";

type SortableField = "created" | "updated" | "name" | "price" | "rating";

/**
 * Fetch a paginated list of venues.
 */
export async function fetchVenues({
  page = 1,
  limit = 12,
  sort = "created", // change to "updated" if your API sets it
  sortOrder = "desc", // newest first
}: {
  page?: number;
  limit?: number;
  sort?: SortableField;
  sortOrder?: "asc" | "desc";
}): Promise<ListResponse<Venue>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
    sortOrder,
  });

  return apiFetch<ListResponse<Venue>>(`/holidaze/venues?${params.toString()}`);
}

/**
 * Search venues by query (name/description).
 * The API may return either { data: Venue[] } or a raw array of venues.
 */
type SearchResponse = { data: Venue[] } | Venue[];

export async function searchVenuesRaw(query: string): Promise<Venue[]> {
  const res = await apiFetch<SearchResponse>(
    `/holidaze/venues/search?q=${encodeURIComponent(query)}`
  );
  return Array.isArray(res) ? res : res.data ?? [];
}
