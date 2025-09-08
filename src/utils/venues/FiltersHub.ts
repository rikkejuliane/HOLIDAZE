export const FILTER_QUERY_KEYS = [
  "sort",
  "amenities",
  "q",
  "start",
  "end",
  "priceMin",
  "priceMax",
  "guests",
] as const;

export type FilterKey = (typeof FILTER_QUERY_KEYS)[number];

export function clearAllFiltersIn(
  sp: URLSearchParams,
  opts?: { keep?: (FilterKey | string)[] }
) {
  const keep = new Set(opts?.keep ?? []);
  for (const key of FILTER_QUERY_KEYS) {
    if (!keep.has(key)) sp.delete(key);
  }
  sp.set("page", "1");
  return sp;
}
