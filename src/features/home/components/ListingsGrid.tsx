"use client";

import type { Venue } from "@/types/venue";
import ListingCard from "./ListingCard";

export default function ListingsGrid({ items }: { items: Venue[] }) {
  if (!items.length) return <p>No venues found.</p>;

  return (
    <ul className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {items.map((v) => (
        <li key={v.id}>
          <ListingCard venue={v} />
        </li>
      ))}
    </ul>
  );
}
