"use client";

import ListingsAndMapLayout from "@/features/home/components/ListingsAndMapLayout";
import ListingsGrid from "@/features/home/components/ListingsGrid";
import ListingsPagination from "@/features/home/components/ListingsPagination";
import MapPanel from "@/features/home/components/MapPanel";
import { useVenuesQuery } from "@/features/home/hooks/useVenuesQuery";

export default function HomeListingsSection() {
  const { items, meta, isLoading, error, setPage } = useVenuesQuery();

  return (
    <ListingsAndMapLayout
      left={
        <>
          {error && <p className="text-red-500">Error: {error.message}</p>}
          {isLoading && !items.length ? <p>Loading…</p> : <ListingsGrid items={items} />}
          <ListingsPagination meta={meta} onPageChange={setPage} isLoading={isLoading} />
        </>
      }
      right={<MapPanel />}
    />
  );
}
