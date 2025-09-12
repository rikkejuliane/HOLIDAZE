"use client";

import Image from "next/image";
import Link from "next/link";
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
        className="relative -mt-1 w-[292px] h-[120px] rounded-bl-3xl rounded-br-3xl bg-[#282A2E] px-4 flex flex-col  z-20 before:content-[''] before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:bg-gradient-to-t before:from-[#282A2E] before:to-transparent before:pointer-events-none">
        {/* TITLE */}
        <h2 className="text-primary text-xl font-bold font-noto leading-tight truncate pt-2.5">
          {venue.name}
        </h2>

        {/* META: location | guests | rating */}
        <div className="flex items-center gap-2 text-primary/60 text-sm font-light font-jakarta leading-tight pt-1">
          <span className="truncate max-w-[120px]">
            {[venue.location?.city, venue.location?.country]
              .filter(Boolean)
              .join(", ") || "—"}
          </span>
          <span aria-hidden>|</span>
          <span>{venue.maxGuests ?? "—"} guests</span>
          <span aria-hidden>|</span>
          <span className="inline-flex items-center gap-1">
            {/* star svg */}
            <svg
              width="12"
              height="11"
              viewBox="0 0 12 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.295 11L3.27 6.93289L0 4.19737L4.32 3.83553L6 0L7.68 3.83553L12 4.19737L8.73 6.93289L9.705 11L6 8.84342L2.295 11Z"
                fill="#FCFEFF"
                fillOpacity="0.6"
              />
            </svg>

            <span>
              {typeof venue.rating === "number" ? venue.rating.toFixed(1) : "—"}
            </span>
          </span>
        </div>

        {/* BOTTOM ROW: price + CTA */}
        <div className="flex items-center justify-between text-sm font-jakarta leading-tight pt-7">
          <div className="text-primary font-light ">
            {formatPrice(venue.price)} / per night
          </div>
          <Link
            href={`/venues/${encodeURIComponent(venue.id)}`}
            className="inline-flex items-center gap-1 text-white font-bold hover:opacity-90 cursor-pointer">
            BOOK VENUE
            <svg
              width="7"
              height="12"
              viewBox="0 0 7 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 11L6 6L1 1"
                stroke="#FCFEFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatPrice(n: number) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n}`;
  }
}
