"use client";

import { useMemo } from "react";

type Props = {
  nightlyPrice: number;
  start?: Date;
  end?: Date;
  guests?: number;
  cleaningFee?: number;
  taxRate?: number;
};

/** Returns the number of whole nights between two dates.
 * Normalizes both dates to midnight and rounds positive differences.
 * @param a Check-in date.
 * @param b Check-out date.
 * @returns Number of nights (0 if invalid/missing or non-positive span).
 */
function daysBetween(a?: Date, b?: Date) {
  if (!a || !b) return 0;
  const A = new Date(a);
  A.setHours(0, 0, 0, 0);
  const B = new Date(b);
  B.setHours(0, 0, 0, 0);
  const ms = B.getTime() - A.getTime();
  return ms > 0 ? Math.round(ms / 86400000) : 0;
}

/** BookingSummary — shows pricing breakdown for the selected stay.
 * Computes nights, base (nightly × nights), cleaning fee, taxes, and total,
 * and renders a small receipt with helpful labels.
 *
 * @param props.nightlyPrice Price per night.
 * @param props.start Optional check-in date.
 * @param props.end Optional check-out date.
 * @param props.cleaningFee Flat fee added to total (default 25).
 * @param props.taxRate Tax multiplier applied to (base + cleaning) (default 0.1).
 * @returns JSX element with a summary block.
 *
 * @remarks
 * - When dates are incomplete or nights ≤ 0, amounts render as "—".
 * - Tax label switches to “Taxes (included)” once dates are valid.
 */
export default function BookingSummary({
  nightlyPrice,
  start,
  end,
  cleaningFee = 25,
  taxRate = 0.1,
}: Props) {
  const nights = useMemo(() => daysBetween(start, end), [start, end]);
  const base = useMemo(() => nights * nightlyPrice, [nights, nightlyPrice]);
  const taxes = useMemo(
    () => (nights > 0 ? (base + cleaningFee) * taxRate : 0),
    [nights, base, cleaningFee, taxRate]
  );
  const total = useMemo(
    () => (nights > 0 ? base + cleaningFee + taxes : 0),
    [nights, base, cleaningFee, taxes]
  );
  const fmt = (n: number) =>
    n > 0
      ? `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
          n
        )}`
      : "—";
  const baseLabel =
    nights > 0
      ? `$${nightlyPrice} × ${nights} night${nights === 1 ? "" : "s"}`
      : "Add dates to see price";
  const taxLabel = nights > 0 ? "Taxes (included)" : "Taxes";
  return (
    <div className="w-full h-auto mt-2.5 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-3 pt-6 pb-2 text-sm text-primary placeholder-primary">
      <label
        htmlFor="summary"
        className="absolute z-10 left-3 top-1 text-[10px] font-bold text-primary/70">
        SUMMARY
      </label>
      <output id="summary" className="text-primary text-sm block">
        <div className="flex flex-row justify-between">
          <p>{baseLabel}</p>
          <p>{fmt(base)}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p>Cleaning fee</p>
          <p>{fmt(nights > 0 ? cleaningFee : 0)}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p>{taxLabel}</p>
          <p>{fmt(taxes)}</p>
        </div>
        <span className="block h-px w-full bg-primary/60 my-1"></span>
        <div className="flex flex-row justify-between font-bold">
          <p>TOTAL</p>
          <p>{fmt(total)}</p>
        </div>
      </output>
    </div>
  );
}
