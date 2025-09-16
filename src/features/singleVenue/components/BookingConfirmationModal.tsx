"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SummaryView = {
  startLabel: string;
  endLabel: string;
  guests: number;
  baseLabel: string;
  baseAmount: string;
  cleaningLabel: string;
  cleaningAmount: string;
  taxLabel: string;
  taxAmount: string;
  totalLabel: string;
  totalAmount: string;
};

type Props = {
  open: boolean;
  onClose: () => void;

  // Content
  venueName: string;
  venueImg?: { url?: string; alt?: string };
  summary: SummaryView;

  // Actions
  /** Called when user clicks "Yes" on the confirm step. Should perform the real booking. */
  onConfirm?: () => Promise<void> | void;

  /** Optional: tells parent a booking succeeded (useful to trigger refresh outside). */
  onConfirmed?: () => void; // ✅ NEW

  /** Where "View booking" should go after confirmation */
  viewBookingHref?: string;
};

export default function BookingConfirmationModal({
  open,
  onClose,
  venueName,
  venueImg,
  summary,
  onConfirm,
  onConfirmed, // ✅ NEW
  viewBookingHref = "/profile",
}: Props) {
  const [phase, setPhase] = useState<"confirm" | "confirmed">("confirm");
  const [isConfirming, setIsConfirming] = useState(false);

  // Reset phase when reopened
  useEffect(() => {
    if (open) {
      setPhase("confirm");
      setIsConfirming(false);
    }
  }, [open]);

  if (!open) return null;

  const handleYes = async () => {
    if (!onConfirm) {
      setPhase("confirmed");
      onConfirmed?.(); // ✅ fire immediately if no async confirm provided
      return;
    }
    try {
      setIsConfirming(true);
      await onConfirm();
      setPhase("confirmed");
      onConfirmed?.(); // ✅ notify parent after success
    } finally {
      setIsConfirming(false);
    }
  };

  const handleNo = () => onClose();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-secondary shadow-[0px_8px_24px_rgba(0,0,0,0.45)] p-5 text-primary">
        {/* Close X — only in CONFIRMED phase, top-right */}
        {phase === "confirmed" && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 p-1 rounded hover:bg-white/10 transition">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1.53551 8.6066L8.60658 1.53553M1.53551 1.53553L8.60658 8.6066"
                stroke="#E63946"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {/* Header */}
        {phase === "confirmed" ? (
          <div className="mb-3">
            <h3 className="font-noto font-bold text-lg tracking-wide">
              BOOKING CONFIRMATION
            </h3>
            <p className="text-sm font-jakarta text-primary/80 mt-1">
              Thank you so much for your booking:
            </p>
          </div>
        ) : (
          <div className="mb-3">
            <h3 className="font-noto font-bold text-lg tracking-wide">
              BOOKING CONFIRMATION
            </h3>
            <p className="text-sm font-jakarta text-primary/80 mt-1">
              Are you sure you want to book this venue?
            </p>
          </div>
        )}

        {/* Venue mini header (image + title) */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/20">
            {venueImg?.url ? (
              <Image
                src={venueImg.url}
                alt={venueImg.alt ?? venueName}
                width={48}
                height={48}
                unoptimized
                className="w-12 h-12 object-cover"
              />
            ) : null}
          </div>
          <h4 className="font-noto font-bold text-base">{venueName}</h4>
        </div>

        {/* Summary */}
        <div className="text-sm font-jakarta space-y-1.5">
          <div className="flex justify-between">
            <span>Check in</span>
            <span>{summary.startLabel}</span>
          </div>
          <div className="flex justify-between">
            <span>Check out</span>
            <span>{summary.endLabel}</span>
          </div>
          <div className="flex justify-between">
            <span>Guests</span>
            <span>{summary.guests}</span>
          </div>
          <span className="block h-px w-full bg-primary/40 my-2" />
          <div className="flex justify-between">
            <span>{summary.baseLabel}</span>
            <span>{summary.baseAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>{summary.cleaningLabel}</span>
            <span>{summary.cleaningAmount}</span>
          </div>
          <div className="flex justify-between">
            <span>{summary.taxLabel}</span>
            <span>{summary.taxAmount}</span>
          </div>
          <span className="block h-px w-full bg-primary/60 my-2" />
          <div className="flex justify-between font-bold">
            <span>{summary.totalLabel}</span>
            <span>{summary.totalAmount}</span>
          </div>
        </div>

        {/* Footer actions */}
        {phase === "confirm" ? (
          <div className="mt-4 flex items-center justify-center gap-5">
            <button
              onClick={handleYes}
              disabled={isConfirming}
              className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold disabled:opacity-60">
              {isConfirming ? "Booking…" : "YES"}
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

            <button
              onClick={handleNo}
              className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary/60 font-bold">
              NO
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.53478 8.53531L8.60585 1.46424M1.53478 1.46424L8.60585 8.53531"
                  stroke="#FCFEFF"
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-row items-center justify-between gap-3">
            <p className="text-xs text-primary/70 w-[220px]">
              You will receive an email with your booking details.
            </p>
            <div className="flex items-center">
              <a
                href={viewBookingHref}
                className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold">
                View booking
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
