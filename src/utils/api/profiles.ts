// src/utils/api/profiles.ts
import { API_PROFILES } from "./constants";
import { buildServerHeaders } from "./headers";

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
