"use client";

import ListingsAndMapLayout from "@/features/home/components/ListingsAndMapLayout";
import ListingsGrid from "@/features/home/components/ListingsGrid";
import ListingsPagination from "@/features/home/components/ListingsPagination";
import MapPanel from "@/features/home/components/map/MapPanel";
import { useVenuesQuery } from "@/features/home/hooks/useVenuesQuery";
import ListingCardSkeleton from "@/components/SkeletonLoader/ListingCardSkeleton";

export default function HomeListingsSection() {
  const { items, meta, isLoading, error, setPage } = useVenuesQuery();

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    requestAnimationFrame(() => {
      document
        .getElementById("listings-grid")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  return (
    <ListingsAndMapLayout
      left={
        <>
          {error && <p className="text-red-500">Error: {error.message}</p>}
          {isLoading && !items.length ? (
            <ul
              className="grid grid-cols-1 gap-5 xl:grid-cols-2"
              aria-busy="true"
              aria-live="polite">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={`s-${i}`}>
                  <ListingCardSkeleton />
                </li>
              ))}
              <span className="sr-only">Loading listings…</span>
            </ul>
          ) : (
            <div id="listings-grid">
              <ListingsGrid items={items} />
            </div>
          )}
          <ListingsPagination
            meta={meta}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </>
      }
      right={<MapPanel items={items} />}
    />
  );
}
