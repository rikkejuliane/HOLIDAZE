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

          {/* CLOSE BUTTON (top-right over the image) */}
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
        // No image case: still provide a close button (top-right of card)
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          title="Close"
          className="absolute right-2 top-2 z-10 inline-flex items-center justify-center rounded-full bg-black/50 p-1.5 ring-1 ring-white/20 hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
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
        {/* Title (slightly smaller) */}
        <h2 className="pt-2 truncate font-noto text-lg font-bold text-primary">
          {name}
        </h2>

        {/* City, Country */}
        <p className="pt-1 max-w-[200px] truncate font-jakarta text-sm font-light text-primary/60">
          {[city, country].filter(Boolean).join(", ") || "—"}
        </p>

        {/* Price + CTA (text + arrow) */}
        <div className="pt-4 flex items-center justify-between font-jakarta text-sm leading-tight">
          <span className="text-primary/90">
            {price != null ? `${formatPrice(price)} / per night` : "—"}
          </span>

          <a
            href={`${basePath}/${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-1 font-bold text-white hover:opacity-90">
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
