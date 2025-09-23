"use client";

import ListingsAndMapLayout from "@/features/home/components/ListingsAndMapLayout";
import ListingsGrid from "@/features/home/components/ListingsGrid";
import ListingsPagination from "@/features/home/components/ListingsPagination";
import MapPanel from "@/features/home/components/map/MapPanel";
import { useVenuesQuery } from "@/features/home/hooks/useVenuesQuery";

/**
 * HomeListingsSection component.
 *
 * Section combining a listings grid with pagination and an interactive map.
 *
 * Features:
 * - Fetches venue data using `useVenuesQuery` hook.
 * - Displays loading state, error messages, and paginated listings.
 * - Integrates `MapPanel` to show venue locations on a map.
 * - Smoothly scrolls to top of listings on page change.
 *
 * @component
 * @returns The combined listings and map section UI.
 */
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
          {error && <p className="text-imperialRed">Error: {error.message}</p>}
          <div id="listings-grid">
            <ListingsGrid
              items={items}
              isLoading={isLoading}
              skeletonCount={8}
            />
          </div>
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
