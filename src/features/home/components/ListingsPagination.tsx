// src/features/home/components/ListingsPagination.tsx
"use client";

import type { ListMeta } from "@/types/venue";

type Props = {
  meta: ListMeta | null;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

export default function ListingsPagination({
  meta,
  onPageChange,
  isLoading,
}: Props) {
  if (!meta || !meta.pageCount || meta.pageCount <= 1) return null;

  const { currentPage, pageCount, isFirstPage, isLastPage } = meta;
  const pages = getPageItems(currentPage, pageCount);

  const go = (p: number) => {
    if (isLoading) return;
    if (p < 1 || p > pageCount || p === currentPage) return;
    onPageChange(p);
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-center gap-4 font-jakarta text-[15px] font-semibold text-primary"
    >
      {/* Prev */}
      <button
        type="button"
        onClick={() => go(meta.previousPage ?? Math.max(1, currentPage - 1))}
        aria-label="Previous page"
        disabled={isLoading || isFirstPage}
        className="w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <svg
          width="8"
          height="13"
          viewBox="0 0 8 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0 pointer-events-none"
        >
          <path
            d="M7 1L1 6.5L7 12"
            stroke="#FCFEFF"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Number row with ellipses */}
      <div className="flex items-center gap-2">
        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`dots-${i}`}
              aria-hidden
              className="px-2 opacity-70 select-none cursor-default"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className="relative w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              disabled={isLoading || p === currentPage}
            >
              {/* circle under the selected number */}
              {p === currentPage && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white/10 rounded-full border border-white/0 backdrop-blur-[5.10px]"
                />
              )}
              <span className="relative leading-none pointer-events-none">
                {p}
              </span>
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        type="button"
        onClick={() => go(meta.nextPage ?? currentPage + 1)}
        aria-label="Next page"
        disabled={isLoading || isLastPage}
        className="w-8 h-8 inline-flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <svg
          width="8"
          height="13"
          viewBox="0 0 8 13"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="shrink-0 pointer-events-none"
        >
          <path
            d="M1 12L7 6.5L1 1"
            stroke="#FCFEFF"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </nav>
  );
}

/** Produces sequences like:
 * page=1  -> [1, 2, …, total]
 * middle  -> [1, …, p-1, p, p+1, …, total]
 * end     -> [1, …, total-2, total-1, total]
 * small totals (<=7) -> all pages
 */
function getPageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 3) return [1, 2, 3, "…", total];
  if (current >= total - 2) return [1, "…", total - 2, total - 1, total];

  return [1, "…", current - 1, current, current + 1, "…", total];
}
