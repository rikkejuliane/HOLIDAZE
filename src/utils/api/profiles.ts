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
      // API shape: { errors: [{ message }], status, statusCode }
      const data: { errors?: Array<{ message?: string }> } = await res
        .clone()
        .json();
      const raw = (data.errors ?? [])
        .map((e) => e.message ?? "")
        .filter(Boolean)
        .join(" ");

      // Try to identify the offending URL + which field it belongs to
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
    } catch {
      // keep userMsg fallback above
    }
    throw new Error(userMsg);
  }

  const { data } = await res.json();
  return data as Profile;
}

// PUBLIC READ (no auth): get a profile by name with optional embeds
export async function getPublicProfileByName(
  name: string,
  opts?: { bookings?: boolean; venues?: boolean }
): Promise<Profile> {
  const qs = new URLSearchParams();
  if (opts?.bookings) qs.set("_bookings", "true");
  if (opts?.venues) qs.set("_venues", "true");

  const res = await fetch(
    `${API_PROFILES}/${encodeURIComponent(name)}${qs.toString() ? `?${qs}` : ""}`,
    {
      // IMPORTANT: only API key; no auth token here
      headers: buildServerHeaders({ apiKey: true }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => undefined);
    // Throw a plainly-typed object (no any)
    throw { name: "HttpError", message: "getPublicProfileByName failed", status: res.status, body } as const;
  }

  const { data } = await res.json();
  return data as Profile;
}