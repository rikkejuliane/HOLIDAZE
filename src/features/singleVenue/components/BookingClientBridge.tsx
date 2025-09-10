"use client";

import { useState } from "react";
import DateInputsWithCalendar from "@/features/singleVenue/components/DateInputsWithCalendar";
import BookingSummary from "./BookingsSummary";

type Booking = { dateFrom: string; dateTo: string };

export default function BookingClientBridge({
  nightlyPrice,
  existingBookings = [],
}: {
  nightlyPrice: number;
  existingBookings?: Booking[];
}) {
  const [range, setRange] = useState<{ start?: Date; end?: Date }>({});

  return (
    <>
      <div className="flex flex-row justify-between">
        <DateInputsWithCalendar
          existingBookings={existingBookings}
          minNights={1}
          onRangeChange={setRange}
        />
      </div>

      <BookingSummary
        nightlyPrice={nightlyPrice}
        start={range.start}
        end={range.end}
      />
    </>
  );
}
