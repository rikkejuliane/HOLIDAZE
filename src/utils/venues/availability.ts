import type { Venue } from "@/types/venue";

type BookingLike = { dateFrom: string; dateTo: string };

/**
 * Safely extracts a venue’s bookings list.
 *
 * - Accepts any `Venue` that may or may not carry a `bookings` array.
 * - Returns an empty array when missing or malformed.
 *
 * @param venue - The venue object (may be a narrowed API shape).
 * @returns Array of `{ dateFrom, dateTo }` booking-like objects.
 */
function getBookings(venue: Venue): BookingLike[] {
  const maybe = (venue as unknown as { bookings?: BookingLike[] }).bookings;
  return Array.isArray(maybe) ? maybe : [];
}

/**
 * Normalizes a date to the **start of its day** in local time.
 * Sets time to `00:00:00.000`.
 *
 * @param d - Any `Date` instance.
 * @returns A new `Date` at the start of the same day.
 */
function normalizeStart(d: Date) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}

/**
 * Normalizes a date to the **end of its day** in local time.
 * Sets time to `23:59:59.999`.
 *
 * @param d - Any `Date` instance.
 * @returns A new `Date` at the end of the same day.
 */
function normalizeEnd(d: Date) {
  const n = new Date(d);
  n.setHours(23, 59, 59, 999);
  return n;
}

/**
 * Inclusive overlap test for two date ranges.
 *
 * Considered overlapping when the ranges share **any** instant:
 * `!(aEnd < bStart || aStart > bEnd)`.
 *
 * @param aStart - Start of range A.
 * @param aEnd   - End of range A.
 * @param bStart - Start of range B.
 * @param bEnd   - End of range B.
 * @returns `true` if A and B overlap; otherwise `false`.
 */
function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return !(aEnd < bStart || aStart > bEnd);
}

/**
 * Checks if a venue is available for booking in the given date range.
 * Bookings are inclusive of their start and end dates.
 *
 * @param venue - Venue to check.
 * @param start - Start date of desired booking range.
 * @param end - End date of desired booking range.
 * @returns `true` if no existing bookings overlap the desired range; otherwise `false`.
 */
export function isVenueAvailable(
  venue: Venue,
  start: Date,
  end: Date
): boolean {
  const s = start <= end ? normalizeStart(start) : normalizeStart(end);
  const e = end >= start ? normalizeEnd(end) : normalizeEnd(start);

  const bookings = getBookings(venue);
  return !bookings.some((b) => {
    const bs = new Date(b.dateFrom);
    const be = new Date(b.dateTo);
    return rangesOverlap(s, e, bs, be);
  });
}

/**
 * Filters a list of venues to only those available for the given date range.
 * Uses {@link isVenueAvailable} internally.
 *
 * @param venues - Array of venues to test.
 * @param start  - Desired check-in date.
 * @param end    - Desired check-out date.
 * @returns Venues that are free for the entire (normalized) date range.
 */
export function filterAvailableVenues(
  venues: Venue[],
  start: Date,
  end: Date
): Venue[] {
  return (venues ?? []).filter((v) => isVenueAvailable(v, start, end));
}
