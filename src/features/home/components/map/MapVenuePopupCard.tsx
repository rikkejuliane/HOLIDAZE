"use client";

type Props = {
  id: string;
  name: string;
  img?: string;
  city?: string;
  country?: string;
  price?: number | null;
  basePath?: string;
  onClose?: () => void;
};

/**
 * MapVenuePopupCard component.
 *
 * Compact venue preview used inside Mapbox popups.
 *
 * - Shows an optional header image with a gradient overlay and close button.
 * - Displays venue name, city/country, and a formatted nightly price.
 * - “View venue” link navigates to `${basePath}/${id}`.
 * - Invokes `onClose` when the close button is clicked.
 *
 * @param id       - Venue identifier.
 * @param name     - Venue name.
 * @param img      - Optional image URL to display in the header.
 * @param city     - Optional city label.
 * @param country  - Optional country label.
 * @param price    - Optional nightly price to display.
 * @param basePath - Base path for the venue details link (default: "/venues").
 * @param onClose  - Callback fired when the close button is pressed.
 *
 * @returns The popup card UI for a single venue.
 */
export default function MapVenuePopupCard({
  id,
  name,
  img,
  city,
  country,
  price,
  basePath = "/venues",
  onClose,
}: Props) {
  return (
    <article className="w-[292px] overflow-hidden rounded-3xl shadow-lg text-primary bg-[#282A2E] relative">
      {img ? (
        <div className="relative h-[140px] w-[292px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={name} className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-20 bg-gradient-to-t from-[#282A2E] to-transparent" />
          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="absolute right-3 top-3 z-10 inline-flex items-center justify-center">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true">
              <path
                d="M1.53551 8.6066L8.60658 1.53553M1.53551 1.53553L8.60658 8.6066"
                stroke="#E63946"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          title="Close"
          className="absolute right-2 top-2 z-10 inline-flex items-center justify-center rounded-full bg-black/50 p-1.5 ring-1 ring-primary/20 hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true">
            <path
              d="M1.53551 8.6066L8.60658 1.53553M1.53551 1.53553L8.60658 8.6066"
              stroke="#E63946"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
      {/* BOTTOM PANEL */}
      <div className="relative w-[292px] h-[120px] px-4">
        <h2 className="pt-2 truncate font-noto text-lg font-bold text-primary">
          {name}
        </h2>
        {/* City, Country */}
        <p className="pt-1 max-w-[200px] truncate font-jakarta text-sm font-light text-primary/60">
          {[city, country].filter(Boolean).join(", ") || "—"}
        </p>
        {/* Price */}
        <div className="pt-4 flex items-center justify-between font-jakarta text-sm leading-tight">
          <span className="text-primary/90">
            {price != null ? `${formatPrice(price)} / per night` : "—"}
          </span>
          <a
            href={`${basePath}/${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-1 font-bold text-primary hover:opacity-90">
            View venue
            <svg
              width="7"
              height="12"
              viewBox="0 0 7 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true">
              <path
                d="M1 11L6 6L1 1"
                stroke="#FCFEFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}

/**
 * Formats a number as a currency string (USD, no decimals).
 *
 * Falls back to a simple `$<n>` string if `Intl.NumberFormat` fails.
 *
 * @param n - Numeric price to format.
 * @returns A user-friendly currency string.
 */
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
