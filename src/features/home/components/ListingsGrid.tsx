"use client";

import type { Venue } from "@/types/venue";
import { filterJunkVenues } from "@/utils/venues/filter";
import ListingCard from "./ListingCard";
import ListingCardSkeleton from "@/components/SkeletonLoader/ListingCardSkeleton";

type Props = {
  items?: Venue[];
  isLoading?: boolean;
  skeletonCount?: number;
};

export default function ListingsGrid({
  items,
  isLoading,
  skeletonCount = 6,
}: Props) {
  if (isLoading) {
    return (
      <ul
        className="grid grid-cols-1 gap-5 xl:grid-cols-2"
        aria-busy="true"
        aria-live="polite">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <li key={`s-${i}`}>
            <ListingCardSkeleton />
          </li>
        ))}
        <span className="sr-only">Laster inn steder…</span>
      </ul>
    );
  }

  const clean = filterJunkVenues(items ?? []);
  if (!clean.length) return <p className="font-jakarta text-primary font-bold">No venues found.</p>;

  return (
    <ul className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {clean.map((v) => (
        <li key={v.id}>
          <ListingCard venue={v} />
        </li>
      ))}
    </ul>
  );
}
