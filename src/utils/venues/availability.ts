import type { Venue } from "@/types/venue";

type BookingLike = { dateFrom: string; dateTo: string };

// Read optional bookings safely without `any`
function getBookings(venue: Venue): BookingLike[] {
  const maybe = (venue as unknown as { bookings?: BookingLike[] }).bookings;
  return Array.isArray(maybe) ? maybe : [];
}

function normalizeStart(d: Date) {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}
function normalizeEnd(d: Date) {
  const n = new Date(d);
  n.setHours(23, 59, 59, 999);
  return n;
}
function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  // Overlap if NOT (A ends before B starts OR A starts after B ends)
  return !(aEnd < bStart || aStart > bEnd);
}

/** True if the venue has NO booking that overlaps with [start, end]. */
export function isVenueAvailable(venue: Venue, start: Date, end: Date): boolean {
  // Handle reversed user input gracefully
  const s = start <= end ? normalizeStart(start) : normalizeStart(end);
  const e = end >= start ? normalizeEnd(end) : normalizeEnd(start);

  const bookings = getBookings(venue);
  return !bookings.some((b) => {
    const bs = new Date(b.dateFrom);
    const be = new Date(b.dateTo);
    return rangesOverlap(s, e, bs, be);
  });
}

/** Convenience helper: filter a list by availability. */
export function filterAvailableVenues(venues: Venue[], start: Date, end: Date): Venue[] {
  return (venues ?? []).filter((v) => isVenueAvailable(v, start, end));
}
