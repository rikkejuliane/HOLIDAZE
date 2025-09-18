export const API_BASE = "https://v2.api.noroff.dev";

/** Holidaze */
export const API_HOLIDAZE = `${API_BASE}/holidaze`;
export const API_VENUES = `${API_HOLIDAZE}/venues`;
export const API_PROFILES = `${API_HOLIDAZE}/profiles`;

/** Auth */
export const API_AUTH = `${API_BASE}/auth`;
export const API_AUTH_LOGIN = `${API_AUTH}/login`;
export const API_AUTH_REGISTER = `${API_AUTH}/register`;
export const API_AUTH_KEY = `${API_AUTH}/create-api-key`;

export type ListParams = {
  page?: number;                           
  limit?: number;                          
  sort?: `${string}:${"asc" | "desc"}`;    
  owner?: boolean;                        
  bookings?: boolean;                      
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
