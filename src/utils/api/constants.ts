export const API_BASE = "https://v2.api.noroff.dev";

/** Holidaze */
export const API_HOLIDAZE = `${API_BASE}/holidaze`;
export const API_VENUES = `${API_HOLIDAZE}/venues`;

/** Auth */
export const API_AUTH = `${API_BASE}/auth`;
export const API_AUTH_LOGIN = `${API_AUTH}/login`;
export const API_AUTH_REGISTER = `${API_AUTH}/register`;
export const API_AUTH_KEY = `${API_AUTH}/create-api-key`;

/** Builders (keep payload lean for the list page) */
export type ListParams = {
  page?: number;                           // 1-based
  limit?: number;                          // default 16 (2x8)
  sort?: `${string}:${"asc" | "desc"}`;    // e.g. "created:desc"
  owner?: boolean;                         // _owner
  bookings?: boolean;                      // _bookings
};

export function venuesListURL({
  page = 1,
  limit = 16,
  sort,
  owner = false,
  bookings = false,
}: ListParams = {}) {
  const u = new URL(API_VENUES);
  u.searchParams.set("page", String(page));
  u.searchParams.set("limit", String(limit));
  if (sort) u.searchParams.set("sort", sort);
  if (owner) u.searchParams.set("_owner", "true");
  if (bookings) u.searchParams.set("_bookings", "true");
  return u.toString();
}
