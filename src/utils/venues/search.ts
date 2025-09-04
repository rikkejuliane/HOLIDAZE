import type { Venue } from "@/types/venue";

export function matchesQuery(v: Venue, q: string): boolean {
  if (!q) return true;
  const hay = `${v.name ?? ""} ${v.description ?? ""}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}
