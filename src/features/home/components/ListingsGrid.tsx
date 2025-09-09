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
        className="grid grid-cols-1 gap-5 md:[grid-template-columns:repeat(2,minmax(0,320px))] justify-items-center justify-center"
        aria-busy="true"
        aria-live="polite">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <li key={`s-${i}`}>
            <ListingCardSkeleton />
          </li>
        ))}
        <span className="sr-only">Loading listings..</span>
      </ul>
    );
  }

  const clean = filterJunkVenues(items ?? []);
  if (!clean.length) return <p className="font-jakarta text-primary font-bold">No venues found.</p>;

  return (
    <ul className="grid grid-cols-1 gap-5 md:[grid-template-columns:repeat(2,minmax(0,320px))] justify-items-center justify-center">
      {clean.map((v) => (
        <li key={v.id}>
          <ListingCard venue={v} />
        </li>
      ))}
    </ul>
  );
}
