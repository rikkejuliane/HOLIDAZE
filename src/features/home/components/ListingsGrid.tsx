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

/**
 * ListingsGrid component.
 *
 * Renders a responsive grid of venue cards. While loading, shows a grid of
 * skeleton placeholders. After loading, filters incoming items with
 * `filterJunkVenues` and either renders `<ListingCard>`s or a “No venues found.”
 * message when the filtered list is empty.
 *
 * Accessibility:
 * - Uses `aria-busy="true"` and `aria-live="polite"` on the loading list
 *   with an SR-only status message.
 *
 * @param items          - Venue items to render.
 * @param isLoading      - Whether to show loading skeletons.
 * @param skeletonCount  - How many skeleton cards to display (default: 6).
 * @returns The listings grid UI.
 */
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
  if (!clean.length)
    return (
      <p className="font-jakarta text-primary font-bold">No venues found.</p>
    );
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
