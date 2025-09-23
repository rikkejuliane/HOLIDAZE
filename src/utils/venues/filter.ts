import type { Venue } from "@/types/venue";

const JUNK_RE = /(test|zzz|yyy|www|ttt)/i;
export const MIN_VENUE_NAME_LEN = 5;

/**
 * Filters out "junk" venues based on simple heuristics:
 * - Name shorter than `MIN_VENUE_NAME_LEN` (default: 5) after trimming.
 * - No images in `media` array.
 * - Name or description contains "test", "zzz", "yyy", "www", or "ttt" (case-insensitive).
 *
 * @param venues - List of venues to filter.
 * @returns Filtered list of venues excluding those that appear to be junk/test data.
 */
export function filterJunkVenues(venues: Venue[]) {
  return (venues ?? []).filter((v) => {
    const nameLen = v.name?.trim().length ?? 0;
    if (nameLen < MIN_VENUE_NAME_LEN) return false;
    const hasImage = !!v.media?.some(
      (m) => typeof m?.url === "string" && m.url.trim().length > 0
    );
    if (!hasImage) return false;
    const haystack = `${v.name ?? ""} ${v.description ?? ""}`;
    return !JUNK_RE.test(haystack);
  });
}
