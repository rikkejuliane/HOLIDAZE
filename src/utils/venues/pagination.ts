import type { ListMeta } from "@/types/venue";

export const UI_PAGE_SIZE = 8;

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
