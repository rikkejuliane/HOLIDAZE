import type { ListResponse, Venue } from "@/types/venue";
import { apiFetch } from "./client";
import { API_VENUES } from "./constants";
import { API_HOLIDAZE } from "./constants";
import { buildHeaders } from "./headers";

type SortableField = "created" | "updated" | "name" | "price" | "rating";
type SingleResponse<T> = { data: T };

/**
 * Fetch a paginated list of venues.
 *
 * @param page       1-based page index (default 1).
 * @param limit      Page size (default 12).
 * @param sort       Sort field (created | updated | name | price | rating).
 * @param sortOrder  Sort direction ("asc" | "desc", default "desc").
 * @returns Promise resolving to a {@link ListResponse} of {@link Venue}.
 */
export async function fetchVenues({
  page = 1,
  limit = 12,
  sort = "created",
  sortOrder = "desc",
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

  return apiFetch<ListResponse<Venue>>(u.toString(), {
    cache: "no-store",
    next: { revalidate: 0 },
  });
}

/**
 * Search venues by free-text query (name/description).
 * Normalizes API responses that may be `{ data: Venue[] }` or `Venue[]`.
 *
 * @param query  Search string.
 * @returns Promise resolving to an array of {@link Venue}.
 */
type SearchResponse = { data: Venue[] } | Venue[];

export async function searchVenuesRaw(query: string): Promise<Venue[]> {
  const u = new URL(`${API_VENUES}/search`);
  u.searchParams.set("q", query);
  const res = await apiFetch<SearchResponse>(u.toString());
  return Array.isArray(res) ? res : res.data ?? [];
}

/**
 * Fetch a single venue by id, optionally embedding relations.
 *
 * @param id    Venue id (required).
 * @param opts  `{ owner?: boolean; bookings?: boolean }` to include `_owner` / `_bookings`.
 * @returns Promise resolving to the {@link Venue}.
 * @throws  Error if `id` is missing or the venue is not found.
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

/**
 * Create a new venue (authenticated).
 * Requires API key and Bearer token; sends JSON body.
 *
 * @param input  {@link CreateVenueInput} payload.
 * @returns Promise resolving to the created {@link Venue}.
 */
export type CreateVenueInput = {
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  media?: { url: string; alt?: string | null }[];
  rating?: number;
  meta?: {
    wifi?: boolean;
    parking?: boolean;
    breakfast?: boolean;
    pets?: boolean;
  };
  location?: {
    address?: string | null;
    city?: string | null;
    zip?: string | null;
    country?: string | null;
    continent?: string | null;
    lat?: number;
    lng?: number;
  };
};

export async function createVenue(input: CreateVenueInput): Promise<Venue> {
  const headers = buildHeaders({
    apiKey: true,
    authToken: true,
    contentType: true,
  });
  const res = await apiFetch<SingleResponse<Venue>>(API_VENUES, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  return res.data;
}

/**
 * Fetch venues owned by a specific profile (authenticated/private read).
 * Use {@link getPublicVenuesByProfile} for public access without a token.
 *
 * @param profileName  Profile/username.
 * @param opts         Pagination & sorting options `{ page, limit, sort, sortOrder }`.
 * @returns Promise resolving to `{ data: Venue[]; meta: VenuesApiListMeta }`.
 */
export type VenuesApiListMeta = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

export async function getVenuesByProfile(
  profileName: string,
  opts?: {
    page?: number;
    limit?: number;
    sort?: "created" | "updated" | "name" | "price" | "rating";
    sortOrder?: "asc" | "desc";
  }
): Promise<{ data: Venue[]; meta: VenuesApiListMeta }> {
  const params = new URLSearchParams();
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.sort) params.set("sort", opts.sort);
  if (opts?.sortOrder) params.set("sortOrder", opts.sortOrder);
  return apiFetch<{ data: Venue[]; meta: VenuesApiListMeta }>(
    `${API_HOLIDAZE}/profiles/${encodeURIComponent(profileName)}/venues${
      params.size ? `?${params.toString()}` : ""
    }`,
    {
      method: "GET",
      headers: buildHeaders({ apiKey: true, authToken: true }),
      cache: "no-store",
      next: { revalidate: 0 },
    }
  );
}

/**
 * Delete one of **your** venues by id (authenticated).
 *
 * @param id  Venue id (required).
 * @returns Promise resolving to `void` on success.
 * @throws  Error if `id` is missing or deletion fails.
 */
export async function deleteVenueById(id: string): Promise<void> {
  if (!id) throw new Error("deleteVenueById: id is required");
  await apiFetch<void>(`${API_VENUES}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: buildHeaders({ apiKey: true, authToken: true }),
  });
}

/**
 * Update a venue by id (authenticated). Sends the full payload via PUT.
 *
 * @param id     Venue id (required).
 * @param input  {@link UpdateVenueInput} payload.
 * @returns Promise resolving to the updated {@link Venue}.
 */
export type UpdateVenueInput = CreateVenueInput;

export async function updateVenue(
  id: string,
  input: UpdateVenueInput
): Promise<Venue> {
  if (!id) throw new Error("updateVenue: id is required");
  const res = await apiFetch<{ data: Venue }>(
    `${API_VENUES}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: buildHeaders({
        apiKey: true,
        authToken: true,
        contentType: true,
      }),
      body: JSON.stringify(input),
    }
  );
  return res.data;
}

/**
 * Public read: fetch venues by profile **without** auth (API key only).
 *
 * @param profileName  Profile/username.
 * @param opts         Pagination & sorting options `{ page, limit, sort, sortOrder }`.
 * @returns Promise resolving to `{ data: Venue[]; meta: VenuesApiListMeta }`.
 */
export async function getPublicVenuesByProfile(
  profileName: string,
  opts?: {
    page?: number;
    limit?: number;
    sort?: "created" | "updated" | "name" | "price" | "rating";
    sortOrder?: "asc" | "desc";
  }
): Promise<{ data: Venue[]; meta: VenuesApiListMeta }> {
  const params = new URLSearchParams();
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.sort) params.set("sort", opts.sort);
  if (opts?.sortOrder) params.set("sortOrder", opts.sortOrder);
  return apiFetch<{ data: Venue[]; meta: VenuesApiListMeta }>(
    `${API_HOLIDAZE}/profiles/${encodeURIComponent(profileName)}/venues${
      params.size ? `?${params.toString()}` : ""
    }`,
    {
      method: "GET",
      headers: buildHeaders({ apiKey: true }),
      cache: "no-store",
      next: { revalidate: 0 },
    }
  );
}
