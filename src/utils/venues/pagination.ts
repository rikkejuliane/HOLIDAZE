import type { ListMeta } from "@/types/venue";

export const UI_PAGE_SIZE = 8;

/**
 * Builds pagination metadata for UI controls.
 *
 * @param total - Total number of items.
 * @param currentPage - Current page number (1-based).
 * @param pageSize - Number of items per page (default: `UI_PAGE_SIZE`).
 * @returns Pagination metadata including `currentPage`, `pageCount`, `totalCount`, `isFirstPage`, `isLastPage`, `previousPage`, and `nextPage`.
 */
export function buildMeta(
  total: number,
  currentPage: number,
  pageSize: number = UI_PAGE_SIZE
): ListMeta {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const cur = Math.min(Math.max(1, currentPage), pageCount);
  return {
    currentPage: cur,
    pageCount,
    totalCount: total,
    isFirstPage: cur === 1,
    isLastPage: cur === pageCount,
    previousPage: cur > 1 ? cur - 1 : null,
    nextPage: cur < pageCount ? cur + 1 : null,
  };
}
