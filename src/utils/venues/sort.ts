import type { Venue } from "@/types/venue";

export type PriceSort = "price:asc" | "price:desc";

export function sortByPrice(venues: Venue[], order: PriceSort): Venue[] {
  const mul = order === "price:asc" ? 1 : -1;
  return [...(venues ?? [])].sort((a, b) => {
    const cmp = (a.price - b.price) * mul;
    if (cmp !== 0) return cmp;

    const rb = (b.rating ?? 0) - (a.rating ?? 0);
    if (rb !== 0) return rb;

    return (a.name ?? "").localeCompare(b.name ?? "");
  });
}
