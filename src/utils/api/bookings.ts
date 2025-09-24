import { API_HOLIDAZE } from "./constants";
import { apiFetch } from "./client";
import { buildHeaders } from "./headers";
import type { Booking } from "../../types/bookings";

type CreateBookingInput = {
  venueId: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
};
type ApiEnvelope<T> = { data: T; meta?: unknown };

export type ApiListMeta = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

/**
 * Create a new booking for a venue.
 * Requires auth (uses `buildHeaders({ authToken: true })`).
 *
 * @param input - Booking payload: `venueId`, ISO `dateFrom`/`dateTo`, and `guests`.
 * @returns The created {@link Booking}.
 * @throws Error if the API responds with a non-OK status.
 */
export async function createBooking(
  input: CreateBookingInput
): Promise<Booking> {
  const headers = buildHeaders({
    apiKey: true,
    authToken: true,
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
 * Fetch bookings (optionally with venue/customer) for the authenticated user scope.
 * Note: This hits the global `/bookings` endpoint — not the profile-scoped one.
 *
 * @param opts.withVenue - Include venue details (`_venue=true`).
 * @param opts.withCustomer - Include customer details (`_customer=true`).
 * @param opts.page - Page number.
 * @param opts.limit - Page size.
 * @returns API envelope with an array of {@link Booking}.
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
 * Fetch bookings for a specific profile (used for “My bookings” UI).
 * Always includes venue details (`_venue=true`) for display.
 *
 * @param profileName - Profile/username.
 * @param opts.page - Page number.
 * @param opts.limit - Page size.
 * @param opts.sort - Sort field (e.g., `"created"`).
 * @param opts.sortOrder - `"asc"` or `"desc"`.
 * @returns `{ data: Booking[]; meta: ApiListMeta }`.
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

/**
 * Delete a booking by its id.
 * Requires auth.
 *
 * @param id - Booking id.
 * @returns Resolves when deletion succeeds.
 * @throws Error if the API responds with a non-OK status.
 */
export async function deleteBookingById(id: string): Promise<void> {
  await apiFetch<void>(`${API_HOLIDAZE}/bookings/${id}`, {
    method: "DELETE",
    headers: buildHeaders({ apiKey: true, authToken: true }),
  });
}
