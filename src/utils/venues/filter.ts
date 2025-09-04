import type { Venue } from "@/types/venue";

const JUNK_RE = /(test|zzz|yyy|www|ttt)/i;
export const MIN_VENUE_NAME_LEN = 5;

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
