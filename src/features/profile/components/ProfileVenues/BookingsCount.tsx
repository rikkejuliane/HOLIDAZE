"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getVenueById } from "@/utils/api/venues";

type AvatarLike = { url?: string; alt?: string | null } | null | undefined;
type CustomerLike =
  | { name?: string; email?: string; avatar?: AvatarLike }
  | null
  | undefined;

type BookingLike = {
  id: string;
  dateFrom?: string;
  dateTo?: string;
  guests?: number;
  customer?: CustomerLike;
};

type VenueMaybeBookings = { bookings?: BookingLike[] | null };

type Props = {
  venueId: string;
  venueName?: string | null;
  bookings?: BookingLike[] | null | undefined;
  labelSingular?: string;
  labelPlural?: string;
};

function fmtDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function BookingsCount({
  venueId,
  venueName,
  bookings: preloaded,
  labelSingular = "booking",
  labelPlural = "bookings",
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingLike[] | null | undefined>(
    preloaded
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (preloaded !== undefined) return;
      setBusy(true);
      setError(null);
      try {
        const v = await getVenueById(venueId, { bookings: true });
        if (cancelled) return;
        const list = (v as VenueMaybeBookings).bookings ?? [];
        setBookings(list);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Couldn’t load bookings.");
        setBookings([]);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [venueId, preloaded]);

  useEffect(() => {
    setBookings(preloaded);
  }, [preloaded]);

  const count = useMemo(
    () => (Array.isArray(bookings) ? bookings.length : 0),
    [bookings]
  );

  function onOpen() {
    if (count > 0) setOpen(true);
  }

  return (
    <>
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1.5 font-bold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded disabled:opacity-60"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={busy || count === 0}
        title={error ?? undefined}>
        {busy && bookings === undefined
          ? "Loading…"
          : `${count} ${count === 1 ? labelSingular : labelPlural}`}
        <svg
          width="12"
          height="7"
          viewBox="0 0 12 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true">
          <path
            d="M1 1L6 6L11 1"
            stroke="#FCFEFF"
            strokeOpacity="0.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Modal */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[1000]">
            {/* backdrop */}
            <button
              aria-label="Close bookings modal"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/50"
            />

            <div className="fixed inset-0 grid place-items-center p-4 text-primary">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="bookings-title"
                className="w-[92vw] max-w-[740px] rounded-[10px] bg-secondary shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-5 md:px-30 py-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2
                    id="bookings-title"
                    className="font-noto text-[20px] font-bold text-primary">
                    Bookings: {venueName || "Venue"}
                  </h2>
                  <button
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                    className="text-primary/70 hover:text-primary">
                    ✕
                  </button>
                </div>

                {busy ? (
                  <p className="text-primary/80 text-sm">Loading…</p>
                ) : error ? (
                  <p className="text-red-400 text-sm">{error}</p>
                ) : !bookings?.length ? (
                  <p className="text-primary/80 text-sm">No bookings yet.</p>
                ) : (
                  <ul className="space-y-3 max-h-[52vh] md:max-h-[55vh] overflow-auto pr-1.5">
                    {bookings.map((b) => {
                      const avatarSrc =
                        b.customer?.avatar?.url ?? "/default-avatar.png";
                      const avatarAlt = b.customer?.avatar?.alt ?? "Avatar";
                      const who =
                        b.customer?.name ||
                        b.customer?.email ||
                        "Unknown guest";

                      return (
                        <li
                          key={b.id}
                          className="flex items-center gap-3 border-b border-primary/20 pb-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-primary/10">
                            <Image
                              src={avatarSrc}
                              alt={avatarAlt}
                              width={40}
                              height={40}
                              unoptimized
                              className="w-10 h-10 object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold truncate">{who}</p>
                            <p className="text-sm opacity-80">
                              {fmtDate(b.dateFrom)} – {fmtDate(b.dateTo)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
