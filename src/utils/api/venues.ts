// src/utils/api/venues.ts
import type { ListResponse, Venue } from "@/types/venue";
import { apiFetch } from "./client";
import { API_VENUES } from "./constants";

type SortableField = "created" | "updated" | "name" | "price" | "rating";
type SingleResponse<T> = { data: T };

// ---------- LIST ----------
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
  const u = new URL(API_VENUES);
  u.searchParams.set("page", String(page));
  u.searchParams.set("limit", String(limit));
  u.searchParams.set("sort", sort);
  u.searchParams.set("sortOrder", sortOrder);
  return apiFetch<ListResponse<Venue>>(u.toString());
}

// ---------- SEARCH ----------
/**
 * Search venues by query (name/description).
 * The API may return either { data: Venue[] } or a raw array of venues.
 */
type SearchResponse = { data: Venue[] } | Venue[];

export async function searchVenuesRaw(query: string): Promise<Venue[]> {
  const u = new URL(`${API_VENUES}/search`);
  u.searchParams.set("q", query);
  const res = await apiFetch<SearchResponse>(u.toString());
  return Array.isArray(res) ? res : res.data ?? [];
}

// ---------- SINGLE ----------
/**
 * Retrieve a single venue by id.
 * Pass `{ owner: true, bookings: true }` to include relations.
 *
 * API: GET /holidaze/venues/:id[?_owner=true&_bookings=true]
 * Response: { data: Venue, meta: {} }
 */
export async function getVenueById(
  id: string,
  opts: { owner?: boolean; bookings?: boolean } = {}
): Promise<Venue> {
  if (!id) throw new Error("getVenueById: id is required");

  const u = new URL(`${API_VENUES}/${encodeURIComponent(id)}`);
  if (opts.owner) u.searchParams.set("_owner", "true");
  if (opts.bookings) u.searchParams.set("_bookings", "true");

  const res = await apiFetch<SingleResponse<Venue>>(u.toString());
  if (!res?.data) throw new Error(`Venue ${id} not found`);
  return res.data;
}
