import { API_PROFILES } from "./constants";
import { buildServerHeaders, buildHeaders } from "./headers";

export type Media = { url: string; alt?: string | null };
export type Profile = {
  name: string;
  email: string;
  bio?: string | null;
  avatar?: Media | null;
  banner?: Media | null;
  venueManager?: boolean;
  _count?: { venues: number; bookings: number };
};

/**
 * Fetch a **private** profile by name (server-side) using a Bearer token.
 * Optionally embeds bookings/venues via `_bookings` / `_venues` query params.
 *
 * @param name   Profile name to fetch.
 * @param token  Bearer token to authorize the request.
 * @param opts   { bookings?: boolean; venues?: boolean }
 * @returns The resolved {@link Profile}.
 * @throws  Error when the HTTP response is not OK (includes status code).
 */
export async function getProfileByName(
  name: string,
  token: string,
  opts?: { bookings?: boolean; venues?: boolean }
): Promise<Profile> {
  const qs = new URLSearchParams();
  if (opts?.bookings) qs.set("_bookings", "true");
  if (opts?.venues) qs.set("_venues", "true");
  const res = await fetch(
    `${API_PROFILES}/${encodeURIComponent(name)}${
      qs.toString() ? `?${qs}` : ""
    }`,
    { headers: buildServerHeaders({ token, apiKey: true }), cache: "no-store" }
  );
  if (!res.ok) {
    console.error("Profiles GET failed", res.status, await res.text());
    throw new Error(`getProfileByName failed: ${res.status}`);
  }
  const { data } = await res.json();
  return data as Profile;
}

/**
 * Update the **current** user's profile (client-side).
 * Requires an auth token (read from `localStorage`) and API key header.
 * Accepts partial updates for bio / venueManager / avatar / banner.
 * Provides friendlier error messages for invalid/unreachable image URLs.
 *
 * @param name   Profile name to update.
 * @param body   Partial fields to update.
 * @returns The updated {@link Profile}.
 * @throws  Error with a user-friendly message if the update fails.
 */
export async function updateProfile(
  name: string,
  body: {
    bio?: string | null;
    venueManager?: boolean;
    avatar?: Media | null;
    banner?: Media | null;
  }
): Promise<Profile> {
  const res = await fetch(`${API_PROFILES}/${encodeURIComponent(name)}`, {
    method: "PUT",
    headers: buildHeaders({ apiKey: true, authToken: true, contentType: true }),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let userMsg = "Couldn’t save your changes. Please try again.";
    try {
      const data: { errors?: Array<{ message?: string }> } = await res
        .clone()
        .json();
      const raw = (data.errors ?? [])
        .map((e) => e.message ?? "")
        .filter(Boolean)
        .join(" ");
      const urlMatch = raw.match(/https?:\/\/[^\s"']+/i);
      const offendingUrl = urlMatch?.[0];
      const which =
        offendingUrl && body.avatar?.url === offendingUrl
          ? "Avatar URL"
          : offendingUrl && body.banner?.url === offendingUrl
          ? "Banner URL"
          : undefined;
      if (/image is not accessible/i.test(raw)) {
        let host = "";
        try {
          host = offendingUrl ? new URL(offendingUrl).hostname : "";
        } catch {}
        userMsg =
          `${which ? which + ": " : ""}That link can’t be loaded${
            host ? ` (${host})` : ""
          }. ` +
          "Use a direct, public image file URL (e.g. ending in .jpg, .png or .webp).";
      } else if (res.status === 400) {
        userMsg =
          "Some details look invalid. Double-check the links and try again.";
      } else if (res.status === 401) {
        userMsg = "Your session has expired. Please log in again.";
      } else if (res.status === 403) {
        userMsg = "You don’t have permission to update this profile.";
      }
    } catch {}
    throw new Error(userMsg);
  }
  const { data } = await res.json();
  return data as Profile;
}

/**
 * Fetch a **public** profile by name (no auth). Uses API key only.
 * Optionally embeds bookings/venues via `_bookings` / `_venues`.
 *
 * @param name  Profile name to fetch.
 * @param opts  { bookings?: boolean; venues?: boolean }
 * @returns The resolved {@link Profile}.
 * @throws  A plain typed object `{ name, message, status, body }` on failure.
 */
export async function getPublicProfileByName(
  name: string,
  opts?: { bookings?: boolean; venues?: boolean }
): Promise<Profile> {
  const qs = new URLSearchParams();
  if (opts?.bookings) qs.set("_bookings", "true");
  if (opts?.venues) qs.set("_venues", "true");
  const res = await fetch(
    `${API_PROFILES}/${encodeURIComponent(name)}${
      qs.toString() ? `?${qs}` : ""
    }`,
    {
      headers: buildServerHeaders({ apiKey: true }),
      cache: "no-store",
    }
  );
  if (!res.ok) {
    const body = await res.text().catch(() => undefined);
    throw {
      name: "HttpError",
      message: "getPublicProfileByName failed",
      status: res.status,
      body,
    } as const;
  }
  const { data } = await res.json();
  return data as Profile;
}
