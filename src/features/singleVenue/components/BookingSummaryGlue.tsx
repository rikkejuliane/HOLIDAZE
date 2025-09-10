"use client";

import { useState } from "react";
import DateInputsWithCalendar from "./DateInputsWithCalendar";
import GuestsInput from "./GuestsInput";
import BookingSummary from "./BookingsSummary";

type Booking = { dateFrom: string; dateTo: string };

export default function BookingSummaryGlue({
  nightlyPrice,
  maxGuests,
  existingBookings = [],
}: {
  nightlyPrice: number;
  maxGuests: number;
  existingBookings?: Booking[];
}) {
  const [range, setRange] = useState<{ start?: Date; end?: Date }>({});
  const [guests, setGuests] = useState<number>(1);

  return (
    <>
      {/* Dates */}
      <DateInputsWithCalendar
        existingBookings={existingBookings}
        minNights={1}
        onRangeChange={(r) => setRange(r)}
      />

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
        guests={guests}
      />
    </>
  );
}
