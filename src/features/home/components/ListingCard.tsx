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
      className="relative w-[292px] h-80 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
      aria-label={venue.name}
      onClick={() => onClick?.(venue.id)}
    >
      {/* IMAGE AREA (top 14rem) */}
      <div className="relative w-[292px] h-[230px] overflow-hidden rounded-tl-3xl rounded-tr-3xl">        {img ? (
          <Image
            src={img}
            alt={venue.media?.[0]?.alt || venue.name}
            fill
            className="object-cover"
            sizes="288px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-white/60 text-xs">
            No image
          </div>
        )}

        {/* gradient overlay from figma */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-800/0 to-zinc-800" />
      </div>

      {/* BOTTOM PANEL (blurred, rounded as in figma) */}
      <div className="w-[292px] h-24 left-0 top-[230px] absolute bg-zinc-800 rounded-bl-[35px] rounded-br-3xl backdrop-blur-[50px]" />

      {/* TITLE */}
      <div className="left-[19px] top-[237px] absolute text-white text-xl font-bold font-['Noto_Serif_Display'] leading-tight">
        {/* <h2>{venue.name}</h2> */}
        {venue.name}
      </div>

      {/* META: location | guests | rating */}
      <div className="w-52 left-[19px] top-[258px] absolute text-white/60 text-sm font-light font-['Plus_Jakarta_Sans'] leading-tight flex items-center gap-2">
        {/* venue.location?.city, venue.location?.country */}
        <span className="truncate">
          {[venue.location?.city, venue.location?.country].filter(Boolean).join(", ") || "—"}
        </span>

        {/* separator */}
        <span aria-hidden>|</span>

        {/* {venue.maxGuests} */}
        <span>{venue.maxGuests ?? "—"} guests</span>

        {/* separator */}
        <span aria-hidden>|</span>

        {/* star + rating */}
        <span className="inline-flex items-center gap-1">
          <svg
            width="12"
            height="11"
            viewBox="0 0 12 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M2.295 11L3.27 6.93289L0 4.19737L4.32 3.83553L6 0L7.68 3.83553L12 4.19737L8.73 6.93289L9.705 11L6 8.84342L2.295 11Z"
              fill="#FCFEFF"
              fillOpacity="0.6"
            />
          </svg>
          {/* {venue.rating.toFixed(1)} */}
          <span>{typeof venue.rating === "number" ? venue.rating.toFixed(1) : "—"}</span>
        </span>
      </div>

      {/* little square detail from figma */}
      <div className="w-3 h-2.5 left-[205px] top-[263px] absolute bg-white/60" />

      {/* PRICE */}
      <div className="left-[19px] top-[294px] absolute text-white text-sm font-light font-['Plus_Jakarta_Sans'] leading-tight">
        {/* {formatPrice(venue.price)} */} {formatPrice(venue.price)} / per night
      </div>

      {/* CTA (text-only per figma; swap for a real button/link later) */}
      <div className="left-[170px] top-[294px] absolute text-white text-sm font-bold font-['Plus_Jakarta_Sans'] leading-tight inline-flex items-center gap-1">
        BOOK VENUE
        <svg
          width="7"
          height="12"
          viewBox="0 0 7 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path d="M1 11L6 6L1 1" stroke="#FCFEFF" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* tiny vertical line accent */}
      <div className="w-3.5 h-[5px] left-[269px] top-[313.51px] absolute origin-top-left -rotate-90 outline outline-1 outline-offset-[-0.50px] outline-white" />
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
