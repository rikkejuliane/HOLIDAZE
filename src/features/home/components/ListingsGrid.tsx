"use client";

import type { Venue } from "@/types/venue";
import { filterJunkVenues } from "@/utils/venues";
import ListingCard from "./ListingCard";

export default function ListingsGrid({ items }: { items: Venue[] }) {
  const clean = filterJunkVenues(items);

  if (!clean.length) return <p>No venues found.</p>;

  return (
    <div>
    <ul className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {clean.map((v) => (
        <li key={v.id}>
          <ListingCard venue={v} />
        </li>
      ))}
    </ul>
    </div>
  );
}
