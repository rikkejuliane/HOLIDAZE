"use client";

import { useMemo, useState, useEffect } from "react";
import DateRangePopover from "@/components/date/DateRangePopover";

type Range = { start?: Date; end?: Date };
type Booking = { dateFrom: string; dateTo: string };

/** DateInputsWithCalendar — paired read-only inputs that open a range picker.
 * Renders “CHECK IN / CHECK OUT” fields and a popover calendar (DateRangePopover).
 * Calls `onRangeChange` whenever the internal range changes.
 *
 * @param props.existingBookings Optional list of booked spans (ISO strings) that
 *   will be shown as unavailable in the calendar.
 * @param props.minNights Minimum number of nights the user must select (default 1).
 * @param props.onRangeChange Callback fired with `{ start?: Date; end?: Date }`
 *   whenever the selected range updates.
 *
 * @remarks
 * - The popover is toggled by clicking either input.
 * - Unavailable ranges are computed from `existingBookings` and passed down.
 * - Inputs are read-only and display localized short-date labels.
 * - Past dates are disallowed (`allowPast = false`).
 *
 * @returns JSX with two inputs and a conditional calendar popover.
 */
export default function DateInputsWithCalendar({
  existingBookings = [],
  minNights = 1,
  onRangeChange,
}: {
  existingBookings?: Booking[];
  minNights?: number;
  onRangeChange?: (range: { start?: Date; end?: Date }) => void;
}) {
  const [range, setRange] = useState<Range>({
    start: undefined,
    end: undefined,
  });
  const [openCal, setOpenCal] = useState(false);
  useEffect(() => {
    onRangeChange?.(range);
  }, [range, onRangeChange]);
  const unavailableRanges = useMemo(
    () =>
      (existingBookings ?? []).map((b) => ({
        start: new Date(b.dateFrom),
        end: new Date(b.dateTo),
      })),
    [existingBookings]
  );
  const checkInStr =
    range.start &&
    range.start.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const checkOutStr =
    range.end &&
    range.end.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  return (
    <div className="relative w-full">
      <div className="flex gap-3 w-full">
        {/* CHECK IN */}
        <div className="relative flex-1 min-w-0">
          <label
            htmlFor="checkIn"
            className="absolute z-10 left-3 top-1 text-[10px] font-bold text-primary/70">
            CHECK IN
          </label>
          <input
            id="checkIn"
            name="checkIn"
            type="text"
            placeholder="Add date"
            readOnly
            onClick={() => setOpenCal((v) => !v)}
            value={checkInStr || ""}
            className="w-full h-[46px] bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-3 pt-6 pb-2 text-sm text-white placeholder-primary focus:outline-none [appearance:none] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
          />
        </div>
        {/* CHECK OUT */}
        <div className="relative flex-1 min-w-0">
          <label
            htmlFor="checkOut"
            className="absolute z-10 left-3 top-1 text-[10px] font-bold text-primary/70">
            CHECK OUT
          </label>
          <input
            id="checkOut"
            name="checkOut"
            type="text"
            placeholder="Add date"
            readOnly
            onClick={() => setOpenCal((v) => !v)}
            value={checkOutStr || ""}
            className="w-full h-[46px] bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-3 pt-6 pb-2 text-sm text-white placeholder-primary focus:outline-none [appearance:none] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
          />
        </div>
      </div>
      {openCal && (
        <div className="absolute z-50  md:left-0 xl:-left-1/2 bottom-97 md:bottom-107 text-primary">
          <DateRangePopover
            value={range}
            onChange={setRange}
            onClose={() => setOpenCal(false)}
            initialMonth={range.start ?? new Date()}
            unavailableRanges={unavailableRanges}
            minNights={minNights}
            allowPast={false}
          />
        </div>
      )}
    </div>
  );
}
