"use client";

import { useState } from "react";
import DateInputsWithCalendar from "@/features/singleVenue/components/DateInputsWithCalendar";
import GuestsInput from "@/features/singleVenue/components/GuestsInput";
import BookingSummary from "./BookingsSummary";

type Booking = { dateFrom: string; dateTo: string };

export default function BookingPanel({
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
    <div className="flex flex-col pt-2.5 font-jakarta">
      {/* Dates */}
      <div className="flex flex-row justify-between">
        <DateInputsWithCalendar
          existingBookings={existingBookings}
          minNights={1}
          onRangeChange={setRange}
        />
      </div>

      {/* Guests (keeps your label + styling) */}
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

      {/* Summary UNDER dates + guests */}
      <BookingSummary
        nightlyPrice={nightlyPrice}
        start={range.start}
        end={range.end}
      />
    </div>
  );
}
