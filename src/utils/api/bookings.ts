import { API_HOLIDAZE } from "./constants";
import { apiFetch } from "./client";
import { buildHeaders } from "./headers";
import type { Booking } from "../../types/bookings";

type CreateBookingInput = {
  venueId: string;
  dateFrom: string; // ISO
  dateTo: string; // ISO
  guests: number;
};

type ApiEnvelope<T> = { data: T; meta?: unknown };

// Optional: typed list meta for pagination (matches Holidaze meta)
export type ApiListMeta = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

export async function createBooking(
  input: CreateBookingInput
): Promise<Booking> {
  const headers = buildHeaders({
    apiKey: true,
    authToken: true, // <-- requires token in localStorage
    contentType: true,
  });

  const body = JSON.stringify(input);

  const res = await apiFetch<ApiEnvelope<Booking>>(`${API_HOLIDAZE}/bookings`, {
    method: "POST",
    headers,
    body,
  });
  return res.data;
}

/**
 * Global bookings list (all users).
 * Use ONLY where appropriate (e.g., admin). Not for "My bookings".
 */
export async function getMyBookings(opts?: {
  withVenue?: boolean;
  withCustomer?: boolean;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (opts?.withVenue) params.set("_venue", "true");
  if (opts?.withCustomer) params.set("_customer", "true");
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.limit) params.set("limit", String(opts.limit));

  return apiFetch<ApiEnvelope<Booking[]>>(
    `${API_HOLIDAZE}/bookings${
      params.toString() ? `?${params.toString()}` : ""
    }`,
    {
      method: "GET",
      headers: buildHeaders({ apiKey: true, authToken: true }),
    }
  );
}

/**
 * Profile-scoped bookings (the one you want for "My bookings").
 * Example: GET /holidaze/profiles/:name/bookings?_venue=true&page=1&limit=6
 */
export async function getBookingsByProfile(
  profileName: string,
  opts?: {
    page?: number;
    limit?: number;
    sort?: string;
    sortOrder?: "asc" | "desc";
  }
) {
  const params = new URLSearchParams();
  params.set("_venue", "true"); // include venue details for title/media/location
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.sort) params.set("sort", opts.sort);
  if (opts?.sortOrder) params.set("sortOrder", opts.sortOrder);

  return apiFetch<{ data: Booking[]; meta: ApiListMeta }>(
    `${API_HOLIDAZE}/profiles/${encodeURIComponent(profileName)}/bookings${
      params.size ? `?${params.toString()}` : ""
    }`,
    {
      method: "GET",
      headers: buildHeaders({ apiKey: true, authToken: true }),
    }
  );
}

export async function deleteBookingById(id: string): Promise<void> {
  await apiFetch<void>(`${API_HOLIDAZE}/bookings/${id}`, {
    method: "DELETE",
    headers: buildHeaders({ apiKey: true, authToken: true }),
  });
}
