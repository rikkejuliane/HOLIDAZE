"use client";

import { useMemo, useState } from "react";
import DateRangePopover from "@/components/date/DateRangePopover";

type Range = { start?: Date; end?: Date };
type Booking = { dateFrom: string; dateTo: string };

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DateInputsWithCalendar({
  existingBookings = [],
  minNights = 1,
}: {
  existingBookings?: Booking[];
  minNights?: number;
}) {
  const [range, setRange] = useState<Range>({
    start: undefined,
    end: undefined,
  });
  const [openCal, setOpenCal] = useState(false);

  // Reuse your DateRangePopover exactly, and block days if bookings are provided
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
    <div className="relative">
      {/* Inputs row — same look, now with a gap */}
      <div className="flex flex-row justify-between gap-3">
        {/* CHECK IN */}
        <div className="relative">
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
            className="w-[186.5px] h-[46px] bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-3 pt-6 pb-2 text-sm text-white placeholder-primary focus:outline-none [appearance:none] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
          />
        </div>

        {/* CHECK OUT */}
        <div className="relative">
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
            className="w-[186.5px] h-[46px] bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-3 pt-6 pb-2 text-sm text-white placeholder-primary focus:outline-none [appearance:none] [&::-webkit-calendar-picker-indicator]:hidden cursor-pointer"
          />
        </div>
      </div>

      {/* Popover — pops ABOVE the inputs and inherits white text */}
      {openCal && (
        <div className="absolute z-50 -left-1/2 bottom-107 text-primary">
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

      {/* Hidden fields if submitting via <form> */}
      <input
        type="hidden"
        name="start"
        value={range.start ? toISODate(range.start) : ""}
      />
      <input
        type="hidden"
        name="end"
        value={range.end ? toISODate(range.end) : ""}
      />
    </div>
  );
}
