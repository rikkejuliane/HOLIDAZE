import type { CreateVenueInput } from "@/utils/api/venues";

type Args = {
  name: string;
  description: string;
  price: string;
  maxGuests: string;
  rating: number;
  media: Array<{ url: string; alt: string }>;
  wifi: boolean;
  parking: boolean;
  breakfast: boolean;
  pets: boolean;
  address: string;
  zip: string;
  city: string;
  country: string;
  lat: string;
  lng: string;
};

/**
 * Build a valid `CreateVenueInput` from raw form values with basic validation.
 *
 * - Trims text fields.
 * - Validates:
 *   - `name` and `description` are required (non-empty).
 *   - `price` is a finite number > 0.
 *   - `maxGuests` is an integer > 0.
 *   - `lat`/`lng` are either blank or finite numbers.
 * - Normalizes:
 *   - `media`: trims, drops empty URLs, caps to 4, sets empty `alt` → `null`.
 *   - `location`: empty strings → `null` (except `lat`/`lng`, see below).
 *   - `lat`/`lng`: blank inputs remain “unset” internally but are serialized as `0`
 *     to satisfy API schema expectations.
 * - Returns a discriminated union:
 *   - `{ ok: true, payload }` on success
 *   - `{ ok: false, error }` with a user-friendly message on failure
 *
 * @param args Raw form values (see `Args`).
 * @returns Result union containing either the payload or a validation error.
 */
export function buildCreateVenuePayload(
  args: Args
): { ok: true; payload: CreateVenueInput } | { ok: false; error: string } {
  const priceNum = Number(args.price);
  const guestsNum = Number(args.maxGuests);
  const latNum = args.lat === "" ? undefined : Number(args.lat);
  const lngNum = args.lng === "" ? undefined : Number(args.lng);

  if (!args.name.trim()) return { ok: false, error: "Title is required." };
  if (!args.description.trim())
    return { ok: false, error: "Description is required." };
  if (!Number.isFinite(priceNum) || priceNum <= 0)
    return { ok: false, error: "Please enter a valid price per night." };
  if (!Number.isInteger(guestsNum) || guestsNum <= 0)
    return {
      ok: false,
      error: "Please enter a valid maximum number of guests.",
    };
  if (args.lat !== "" && !Number.isFinite(latNum!))
    return { ok: false, error: "Latitude must be a number." };
  if (args.lng !== "" && !Number.isFinite(lngNum!))
    return { ok: false, error: "Longitude must be a number." };

  const mediaPayload: CreateVenueInput["media"] = args.media
    .map((m) => ({ url: m.url.trim(), alt: m.alt.trim() || null }))
    .filter((m) => m.url.length > 0)
    .slice(0, 4);

  const payload: CreateVenueInput = {
    name: args.name.trim(),
    description: args.description.trim(),
    price: priceNum,
    maxGuests: guestsNum,
    rating: args.rating,
    media: mediaPayload.length ? mediaPayload : undefined,
    meta: {
      wifi: args.wifi,
      parking: args.parking,
      breakfast: args.breakfast,
      pets: args.pets,
    },
    location: {
      address: args.address.trim() || null,
      city: args.city.trim() || null,
      zip: args.zip.trim() || null,
      country: args.country.trim() || null,
      continent: null,
      lat: latNum ?? 0,
      lng: lngNum ?? 0,
    },
  };
  return { ok: true, payload };
}
