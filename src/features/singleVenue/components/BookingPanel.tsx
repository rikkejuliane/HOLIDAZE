"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DateInputsWithCalendar from "@/features/singleVenue/components/DateInputsWithCalendar";
import GuestsInput from "@/features/singleVenue/components/GuestsInput";
import BookingSummary from "./BookingsSummary";
import BookingConfirmationModal from "./BookingConfirmationModal";
import { createBooking } from "@/utils/api/bookings";
import { isAuthenticated } from "@/utils/auth/session";
import { ApiError } from "@/utils/api/client";

type Booking = { dateFrom: string; dateTo: string };

function daysBetween(a?: Date, b?: Date) {
  if (!a || !b) return 0;
  const A = new Date(a);
  A.setHours(0, 0, 0, 0);
  const B = new Date(b);
  B.setHours(0, 0, 0, 0);
  const ms = B.getTime() - A.getTime();
  return ms > 0 ? Math.round(ms / 86400000) : 0;
}

function fmtMoney(n: number) {
  return n > 0
    ? `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
        n
      )}`
    : "—";
}

/** Convert checkout (exclusive) → API dateTo (inclusive = checkout-1 day). */
function toInclusiveDateTo(checkout: Date): string {
  const d = new Date(checkout);
  d.setDate(d.getDate() - 1);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

/** Narrow unknown errors into a displayable message (no `any`). */
function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return "Could not complete booking. Please try again.";
}

export default function BookingPanel({
  venueId,
  venueName,
  venueImg,
  nightlyPrice,
  maxGuests,
  existingBookings = [],
  cleaningFee = 25,
  taxRate = 0.1,
}: {
  venueId: string;
  venueName: string;
  venueImg?: { url?: string; alt?: string };
  nightlyPrice: number;
  maxGuests: number;
  existingBookings?: Booking[];
  cleaningFee?: number;
  taxRate?: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [range, setRange] = useState<{ start?: Date; end?: Date }>({});
  const [guests, setGuests] = useState<number>(1);
  const [isSubmitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // track if the booking completed so we refresh on close
  const [wasConfirmed, setWasConfirmed] = useState(false);

  // toast
  const [notice, setNotice] = useState<string | null>(null);
  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4000);
  }, []);

  const nights = useMemo(() => daysBetween(range.start, range.end), [range]);
  const base = useMemo(() => nights * nightlyPrice, [nights, nightlyPrice]);
  const taxes = useMemo(
    () => (nights > 0 ? (base + cleaningFee) * taxRate : 0),
    [nights, base, cleaningFee, taxRate]
  );
  const total = useMemo(
    () => (nights > 0 ? base + cleaningFee + taxes : 0),
    [nights, base, cleaningFee, taxes]
  );

  const startLabel =
    range.start &&
    range.start.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const endLabel =
    range.end &&
    range.end.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const canBook =
    !!range.start &&
    !!range.end &&
    nights > 0 &&
    guests >= 1 &&
    guests <= Math.max(1, maxGuests);

  const handleCTA = useCallback(async () => {
    if (!isAuthenticated()) {
      // Preserve user selection through login
      const params = new URLSearchParams(sp?.toString() ?? "");
      if (range.start)
        params.set("start", range.start.toISOString().slice(0, 10));
      if (range.end) params.set("end", range.end.toISOString().slice(0, 10));
      params.set("guests", String(guests));
      router.push(`/auth?next=/venues/${venueId}?${params.toString()}`);
      return;
    }
    if (!canBook || !range.start || !range.end) {
      showNotice("Please select valid dates and guests to continue.");
      return;
    }
    setShowConfirm(true);
  }, [
    router,
    sp,
    range.start,
    range.end,
    guests,
    venueId,
    canBook,
    showNotice,
  ]);

  return (
    <div className="flex flex-col pt-2.5 font-jakarta">
      {/* Header: price + auth-aware CTA */}
      <div className="flex flex-row justify-between items-end pb-2">
        <h3 className="font-noto font-bold text-xl text-primary">
          ${nightlyPrice} / per night
        </h3>
        {isAuthenticated() ? (
          <button
            type="button"
            onClick={handleCTA}
            disabled={isSubmitting || !canBook}
            className="flex flex-row gap-1.5 items-center font-jakarta font-bold text-primary text-[15px] disabled:opacity-50">
            BOOK
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
          </button>
        ) : (
          <a
            href="/auth"
            className="flex flex-row gap-1.5 items-center font-jakarta font-bold text-primary text-[15px]">
            LOG IN TO BOOK
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
          </a>
        )}
      </div>

      {/* Dates */}
      <div className="flex flex-row justify-between">
        <DateInputsWithCalendar
          existingBookings={existingBookings}
          minNights={1}
          onRangeChange={setRange}
        />
      </div>

      {/* Guests */}
      <div className="relative mt-2.5">
        <label
          htmlFor="guests"
          className="absolute z-10 left-3 top-1 text-[10px] font-bold text-primary/70">
          GUESTS
        </label>
        <GuestsInput
          max={maxGuests}
          name="guests"
          initial={1}
          onChange={(n) => Number.isFinite(n) && setGuests(n)}
        />
      </div>

      {/* Summary */}
      <BookingSummary
        nightlyPrice={nightlyPrice}
        start={range.start}
        end={range.end}
        cleaningFee={cleaningFee}
        taxRate={taxRate}
      />

      {/* Confirmation Modal */}
      <BookingConfirmationModal
        open={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          if (wasConfirmed) {
            setWasConfirmed(false);
            router.refresh(); // refresh venue so booked dates show immediately
          }
        }}
        venueName={venueName}
        venueImg={venueImg}
        summary={{
          startLabel: startLabel ?? "—",
          endLabel: endLabel ?? "—",
          guests,
          baseLabel:
            nights > 0
              ? `$${nightlyPrice} × ${nights} night${nights === 1 ? "" : "s"}`
              : "Add dates to see price",
          baseAmount: fmtMoney(base),
          cleaningLabel: "Cleaning fee",
          cleaningAmount: fmtMoney(nights > 0 ? cleaningFee : 0),
          taxLabel: nights > 0 ? "Taxes (included)" : "Taxes",
          taxAmount: fmtMoney(taxes),
          totalLabel: "TOTAL",
          totalAmount: fmtMoney(total),
        }}
        onConfirm={async () => {
          if (!range.start || !range.end) return;
          setSubmitting(true);
          try {
            await createBooking({
              venueId,
              dateFrom: new Date(range.start).toISOString(),
              dateTo: toInclusiveDateTo(range.end),
              guests,
            });
            setWasConfirmed(true); // mark success; refresh will happen on close
          } catch (e) {
            const msg =
              e instanceof ApiError && e.status === 409
                ? "Those dates overlap an existing booking. Please choose different dates."
                : getErrorMessage(e);
            showNotice(msg);
            throw e; // keep modal on confirm step
          } finally {
            setSubmitting(false);
          }
        }}
        viewBookingHref="/profile"
      />

      {/* Toast */}
      {notice && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-secondary text-primary text-jakarta px-4 py-2 rounded z-50">
          {notice}
        </div>
      )}
    </div>
  );
}
