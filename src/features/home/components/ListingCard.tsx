"use client";

import Image from "next/image";
import type { Venue } from "@/types/venue";

type Props = {
  venue: Venue;
  onClick?: (id: string) => void;
};

export default function ListingCard({ venue, onClick }: Props) {
  const img = venue.media?.[0];
  const hasImage = !!img?.url;

  return (
    <article
      className="overflow-hidden rounded-xl border border-neutral-800/40 bg-background"
      role="group"
      aria-label={venue.name}
      onClick={() => onClick?.(venue.id)}>
      <div className="relative aspect-[4/3] w-full">
        {hasImage ? (
          <Image
            src={img!.url}
            alt={img?.alt || venue.name}
            className="object-cover"
            height={300}
            width={400}
            priority={false}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-900 text-sm opacity-70">
            No image
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold leading-tight line-clamp-2">
          {venue.name}
        </h3>

        {(venue.location?.city || venue.location?.country) && (
          <p className="mt-1 text-sm opacity-70">
            {[venue.location?.city, venue.location?.country]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm">
            <span className="font-semibold">{formatPrice(venue.price)}</span>
            <span className="opacity-70"> / night</span>
          </span>

          <div className="flex items-center gap-2 text-sm opacity-80">
            {typeof venue.rating === "number" && (
              <span aria-label={`Rating ${venue.rating} of 5`}>
                ★ {venue.rating.toFixed(1)}
              </span>
            )}
            <span>👥 {venue.maxGuests}</span>
          </div>
        </div>
      </div>

      
      <div className="h-1 w-full bg-transparent transition-colors group-hover:bg-primary/60" />
    </article>
  );
}

function formatPrice(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${n}`;
  }
}
