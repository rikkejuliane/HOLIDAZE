import type { ListResponse, Venue } from "@/types/venue";
import { apiFetch } from "./client";

type SortableField = "created" | "updated" | "name" | "price" | "rating";

export async function fetchVenues({
  page = 1,
  limit = 12,
  sort = "created",          // change to "updated" if your API sets it
  sortOrder = "desc",        // newest first
}: {
  page?: number;
  limit?: number;
  sort?: SortableField;
  sortOrder?: "asc" | "desc";
}): Promise<ListResponse<Venue>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
    sortOrder,
  });

  return apiFetch<ListResponse<Venue>>(`/holidaze/venues?${params.toString()}`);
}
