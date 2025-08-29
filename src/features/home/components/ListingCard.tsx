"use client";

import Image from "next/image";
import type { Venue } from "@/types/venue";

type Props = {
  venue: Venue;
  onClick?: (id: string) => void; // optional
};

export default function ListingCard({ venue, onClick }: Props) {
  const img = venue.media?.[0]?.url ?? null;

  return (
    <article
      className="relative w-[292px] h-[350px] rounded-3xl overflow-hidden drop-shadow-lg"
      aria-label={venue.name}
      onClick={() => onClick?.(venue.id)}>
      {/* IMAGE AREA (top 14rem) */}
      <div className="relative w-[292px] h-[230px] overflow-hidden rounded-tl-3xl rounded-tr-3xl">
        {" "}
        {img ? (
          <Image
            src={img}
            alt={venue.media?.[0]?.alt || venue.name}
            fill
            className="object-cover"
            sizes="288px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-primary/60 text-xs">
            No image
          </div>
        )}
        {/* bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#282A2E] to-transparent z-[1]" />
      </div>

      {/* BOTTOM PANEL */}
      <div
        id="listing-panel"
        className="relative -mt-1 w-[292px] h-[120px] rounded-bl-3xl rounded-br-3xl bg-[#282A2E] p-4 flex flex-col justify-between z-20 before:content-[''] before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:bg-gradient-to-t before:from-[#282A2E] before:to-transparent before:pointer-events-none">
        {/* TITLE */}
        <h2 className="text-white text-xl font-bold font-noto leading-tight truncate">
          {venue.name}
        </h2>

        {/* META: location | guests | rating */}
        <div className="flex items-center gap-2 text-white/60 text-sm font-light font-['Plus_Jakarta_Sans'] leading-tight">
          <span className="truncate">
            {[venue.location?.city, venue.location?.country]
              .filter(Boolean)
              .join(", ") || "—"}
          </span>
          <span aria-hidden>|</span>
          <span>{venue.maxGuests ?? "—"} guests</span>
          <span aria-hidden>|</span>
          <span className="inline-flex items-center gap-1">
            {/* star svg */}

            <span>
              {typeof venue.rating === "number" ? venue.rating.toFixed(1) : "—"}
            </span>
          </span>
        </div>

        {/* BOTTOM ROW: price + CTA */}
        <div className="flex items-center justify-between text-sm font-['Plus_Jakarta_Sans'] leading-tight">
          <div className="text-white font-light">
            {formatPrice(venue.price)} / per night
          </div>
          <button className="inline-flex items-center gap-1 text-white font-bold">
            BOOK VENUE
          </button>
        </div>
      </div>
    </article>
  );
}

function formatPrice(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR", // change if you want NOK/USD
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n}`;
  }
}
