// src/features/home/components/HomeListingsSection.tsx
"use client";

import ListingsAndMapLayout from "@/features/home/components/ListingsAndMapLayout";
import ListingsGrid from "@/features/home/components/ListingsGrid";
import ListingsPagination from "@/features/home/components/ListingsPagination";
import MapPanel from "@/features/home/components/MapPanel";
import { useVenuesQuery } from "@/features/home/hooks/useVenuesQuery";

export default function HomeListingsSection() {
  const { items, meta, isLoading, error, setPage } = useVenuesQuery();

  function handlePageChange(nextPage: number) {
    // Update page (hook will update the URL)
    setPage(nextPage);

    // Smoothly scroll just the listings grid into view
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
            <p>Loading…</p>
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
      right={<MapPanel />}
    />
  );
}
