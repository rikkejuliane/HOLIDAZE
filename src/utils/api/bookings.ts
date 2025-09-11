import { API_HOLIDAZE } from "./constants";
import { apiFetch } from "./client";
import { buildHeaders } from "./headers";
import type { Booking } from "../../types/bookings";

type CreateBookingInput = {
  venueId: string;
  dateFrom: string; // ISO
  dateTo: string;   // ISO
  guests: number;
};

type ApiEnvelope<T> = { data: T; meta?: unknown };

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const headers = buildHeaders({
    apiKey: true,
    authToken: true,   // <-- requires token in localStorage
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

// (prep for Profile later)
export async function getMyBookings(opts?: { withVenue?: boolean; withCustomer?: boolean; page?: number; limit?: number; }) {
  const params = new URLSearchParams();
  if (opts?.withVenue) params.set("_venue", "true");
  if (opts?.withCustomer) params.set("_customer", "true");
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.limit) params.set("limit", String(opts.limit));

  return apiFetch<ApiEnvelope<Booking[]>>(
    `${API_HOLIDAZE}/bookings${params.toString() ? `?${params.toString()}` : ""}`,
    {
      method: "GET",
      headers: buildHeaders({ apiKey: true, authToken: true }),
    }
  );
}
