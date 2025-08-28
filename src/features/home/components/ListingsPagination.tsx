"use client";

import type { ListMeta } from "@/types/venue";

export default function ListingsPagination({
  meta,
  onPageChange,
  isLoading,
}: {
  meta: ListMeta | null;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}) {
  if (!meta) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        disabled={isLoading || meta.isFirstPage}
        onClick={() => onPageChange(meta.previousPage ?? Math.max(1, meta.currentPage - 1))}
        className="rounded-md border border-neutral-800/40 px-3 py-2 disabled:opacity-50"
      >
        Prev
      </button>

      <span className="text-sm opacity-80">
        Page {meta.currentPage} / {meta.pageCount}
      </span>

      <button
        disabled={isLoading || meta.isLastPage}
        onClick={() => onPageChange(meta.nextPage ?? meta.currentPage + 1)}
        className="rounded-md border border-neutral-800/40 px-3 py-2 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
