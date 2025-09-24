"use client";

import * as React from "react";
import type { Venue } from "@/types/venue";
import { updateVenue, type UpdateVenueInput } from "@/utils/api/venues";
import { buildCreateVenuePayload } from "@/utils/venues/buildCreateVenuePayload";
import { StarRating } from "../createVenue/StarRating";
import { AmenityToggle } from "../createVenue/AmenityToggle";
import { ImageRows } from "../createVenue/ImageRows";

type Props = { open: boolean; onClose: () => void; venue: Venue | null };
type EditBuildResult =
  | { ok: true; payload: UpdateVenueInput }
  | { ok: false; error: string };

/**
 * EditVenueModal — modal UI for editing an existing venue.
 *
 * Connected to:
 * - buildCreateVenuePayload(...) for validation/normalization.
 * - updateVenue(venue.id, payload) to persist changes.
 * - window.dispatchEvent(new CustomEvent("venues:updated")) after save.
 *
 * Behavior:
 * - Hydrates form fields from `venue` whenever the modal opens.
 * - Shows a temporary toast (`notice`) for success/error.
 * - Closes shortly after a successful save.
 *
 * @param props.open       Controls visibility; when false, returns null.
 * @param props.onClose    Called to dismiss the modal.
 * @param props.venue      Venue being edited; required if `open` is true.
 */
export default function EditVenueModal({ open, onClose, venue }: Props) {
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const hideTimerRef = React.useRef<number | null>(null);
  const clearNotice = React.useCallback(() => {
    setNotice(null);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  /**
   * Displays a toast message and auto-hides it after 5 seconds.
   * Replaces any existing message and resets the hide timer.
   *
   * @param msg - Message text to display.
   */
  function showNotice(msg: string) {
    setNotice(msg);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      hideTimerRef.current = null;
    }, 5000);
  }
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState<string>("");
  const [maxGuests, setMaxGuests] = React.useState<string>("");
  const [rating, setRating] = React.useState<number>(0);
  const [media, setMedia] = React.useState<Array<{ url: string; alt: string }>>(
    [{ url: "", alt: "" }]
  );
  const [wifi, setWifi] = React.useState(false);
  const [parking, setParking] = React.useState(false);
  const [breakfast, setBreakfast] = React.useState(false);
  const [pets, setPets] = React.useState(false);
  const [address, setAddress] = React.useState("");
  const [zip, setZip] = React.useState("");
  const [city, setCity] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [lat, setLat] = React.useState<string>("");
  const [lng, setLng] = React.useState<string>("");
  React.useEffect(() => {
    if (!open || !venue) return;
    setBusy(false);
    clearNotice();
    setName(venue.name ?? "");
    setDescription(venue.description ?? "");
    setPrice(
      typeof venue.price === "number" && !Number.isNaN(venue.price)
        ? String(venue.price)
        : ""
    );
    setMaxGuests(
      typeof venue.maxGuests === "number" && !Number.isNaN(venue.maxGuests)
        ? String(venue.maxGuests)
        : ""
    );
    setRating(typeof venue.rating === "number" ? venue.rating : 0);
    const m = (venue.media ?? []).map((x) => ({
      url: x?.url ?? "",
      alt: x?.alt ?? "",
    }));
    setMedia(m.length ? m : [{ url: "", alt: "" }]);
    setWifi(Boolean(venue.meta?.wifi));
    setParking(Boolean(venue.meta?.parking));
    setBreakfast(Boolean(venue.meta?.breakfast));
    setPets(Boolean(venue.meta?.pets));
    setAddress(venue.location?.address ?? "");
    setZip(venue.location?.zip ?? "");
    setCity(venue.location?.city ?? "");
    setCountry(venue.location?.country ?? "");
    setLat(
      typeof venue.location?.lat === "number" &&
        !Number.isNaN(venue.location.lat)
        ? String(venue.location.lat)
        : ""
    );
    setLng(
      typeof venue.location?.lng === "number" &&
        !Number.isNaN(venue.location.lng)
        ? String(venue.location.lng)
        : ""
    );
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [open, venue, clearNotice]);
  React.useEffect(() => {
    if (!open) clearNotice();
  }, [open, clearNotice]);
  if (!open || !venue) return null;

  /**
   * Handles form submission for editing a venue.
   * 1) Validates/normalizes inputs via buildCreateVenuePayload(...).
   * 2) Calls updateVenue(venue.id, payload) on success.
   * 3) Emits "venues:updated", shows success toast, then closes the modal.
   * 4) Shows an error toast on failure.
   *
   * Prevents default submit behavior and uses the `busy` flag to avoid dupes.
   *
   * @param e - React form submit event.
   */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const result = buildCreateVenuePayload({
      name,
      description,
      price,
      maxGuests,
      rating,
      media,
      wifi,
      parking,
      breakfast,
      pets,
      address,
      zip,
      city,
      country,
      lat,
      lng,
    }) as EditBuildResult;
    if (!result.ok) {
      showNotice(result.error);
      return;
    }
    const payload: UpdateVenueInput = result.payload;
    setBusy(true);
    try {
      if (!venue) {
        showNotice("No venue to update.");
        return;
      }
      await updateVenue(venue.id, payload);
      showNotice("Changes saved");
      window.dispatchEvent(new CustomEvent("venues:updated"));
      window.setTimeout(() => onClose(), 900);
    } catch (err: unknown) {
      showNotice(
        err instanceof Error ? err.message : "Failed to update venue."
      );
    } finally {
      setBusy(false);
    }
  }

  /**
   * Cancels the edit flow by clearing any active toast and closing the modal.
   */
  function handleCancel() {
    clearNotice();
    onClose();
  }
  return (
    <div className="fixed inset-0 z-[100]">
      {/* BACKDROP */}
      <button
        aria-label="Close modal"
        onClick={handleCancel}
        className="absolute inset-0 bg-black/50"
      />
      {/* DIALOG */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[685px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-secondary p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-5 md:px-30 text-primary font-jakarta max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="font-noto text-[35px] font-bold">Edit venue</h2>
          </div>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 text-sm">
          {/* TITLE */}
          <div className="flex flex-col w-full">
            <label htmlFor="title" className="font-jakarta font-bold text-xs">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Title *"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          {/* DESCRIPTION */}
          <div className="flex flex-col w-full">
            <label className="font-jakarta font-bold text-xs">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe your venue *"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[90px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 py-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          {/* PRICE */}
          <div className="flex flex-col w-full">
            <label htmlFor="price" className="font-jakarta font-bold text-xs">
              Price per night
            </label>
            <input
              id="price"
              name="price"
              inputMode="decimal"
              placeholder="Price per night *"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          {/* GUESTS */}
          <div className="flex flex-col w-full">
            <label htmlFor="guest" className="font-jakarta font-bold text-xs">
              Guests
            </label>
            <input
              id="guest"
              name="guest"
              inputMode="numeric"
              placeholder="Maximum number of guests *"
              required
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          {/* IMAGES */}
          <ImageRows rows={media} onChange={setMedia} max={4} />
          {/* RATINGS */}
          <div className="flex flex-row gap-2 items-center">
            <h2 className="font-jakarta text-[15px] font-bold">Rating:</h2>
            <StarRating value={rating} onChange={setRating} />
          </div>
          {/* AMENITIES */}
          <div className="flex flex-col bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 py-2 text-[14px]">
            <h2 className="font-jakarta text-[15px] font-bold pb-2">
              Amenities:
            </h2>
            <AmenityToggle
              label="Wifi available"
              checked={wifi}
              onChange={setWifi}
            />
            <AmenityToggle
              label="Parking available"
              checked={parking}
              onChange={setParking}
            />
            <AmenityToggle
              label="Breakfast included"
              checked={breakfast}
              onChange={setBreakfast}
            />
            <AmenityToggle
              label="Pets allowed"
              checked={pets}
              onChange={setPets}
            />
          </div>
          {/* LOCATION */}
          <div className="flex flex-col w-full">
            <label htmlFor="address" className="font-jakarta font-bold text-xs">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="zipCode" className="font-jakarta font-bold text-xs">
              Zip code
            </label>
            <input
              id="zipCode"
              name="zipCode"
              type="text"
              placeholder="Zip code"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="city" className="font-jakarta font-bold text-xs">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="country" className="font-jakarta font-bold text-xs">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="lat" className="font-jakarta font-bold text-xs">
              Latitude
            </label>
            <input
              id="lat"
              name="lat"
              inputMode="decimal"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          <div className="flex flex-col w-full">
            <label htmlFor="lng" className="font-jakarta font-bold text-xs">
              Longitude
            </label>
            <input
              id="lng"
              name="lng"
              inputMode="decimal"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          {/* ACTIONS */}
          <div className="mt-2 flex w-full items-center justify-center gap-[30px]">
            <button
              type="submit"
              disabled={busy}
              className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold disabled:opacity-60">
              {busy ? "Saving…" : "SAVE CHANGES"}
              <svg
                width="7"
                height="12"
                viewBox="0 0 7 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1 11L6 6L1 1"
                  stroke="#FCFEFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={busy}
              className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary/60 font-bold">
              CANCEL
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.53478 8.53531L8.60585 1.46424M1.53478 1.46424L8.60585 8.53531"
                  stroke="#FCFEFF"
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
      {/* TOAST */}
      {notice && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-secondary text-primary font-jakarta px-4 py-2 rounded z-[200] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          role="status"
          aria-live="polite">
          {notice}
        </div>
      )}
    </div>
  );
}
