"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import DateRangePopover from "./date/DateRangePopover";

type Range = { start?: Date; end?: Date };

function formatRange(r: Range) {
  const fmt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (!r.start && !r.end) return "Add dates";
  if (r.start && !r.end) return r.start.toLocaleDateString(undefined, fmt);
  if (r.start && r.end) {
    const a = r.start.toLocaleDateString(undefined, fmt);
    const b = r.end.toLocaleDateString(undefined, fmt); // always include month on both
    return `${a} – ${b}`;
  }
  return "Add dates";
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HeroFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");

  // hydrate range from URL if present
  const [range, setRange] = useState<Range>(() => ({
    start: startStr ? new Date(startStr) : undefined,
    end: endStr ? new Date(endStr) : undefined,
  }));
  const [openCal, setOpenCal] = useState(false);
  const datesWrapRef = useRef<HTMLDivElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextQ = String(fd.get("search") ?? "").trim();

    const sp = new URLSearchParams(searchParams.toString());

    if (nextQ) sp.set("q", nextQ);
    else sp.delete("q");

    if (range.start && range.end) {
      sp.set("start", toISODate(range.start));
      sp.set("end", toISODate(range.end));
    } else {
      sp.delete("start");
      sp.delete("end");
    }

    // Always reset pagination when searching/applying dates
    sp.set("page", "1");

    router.push(`?${sp.toString()}`, { scroll: false });
  }

  const dateDisplay = useMemo(() => formatRange(range), [range]);

  return (
    <form
      onSubmit={onSubmit}
      className="w-[1290px] h-20 bg-white/10 rounded-[10px] border border-white/0 backdrop-blur-[5.10px] flex flex-row justify-between items-center text-primary px-[39px] cursor-pointer"
    >
      {/* Search */}
      <div className="flex flex-col">
        <fieldset>
          <legend className="sr-only">Search</legend>
          <label
            htmlFor="search"
            className="font-jakarta text-[15px] font-bold pb-[15px]"
          >
            WHERE TO?
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              id="search"
              name="search"
              type="search"
              placeholder="Oslo, Norway"
              defaultValue={q}
              className="w-48 border-0 border-b border-primary bg-transparent focus:outline-none placeholder:text-primary"
            />
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2"
              width="12"
              height="7"
              viewBox="0 0 12 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="#FCFEFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </fieldset>
      </div>

      {/* Dates */}
      <div className="flex flex-col relative" ref={datesWrapRef}>
        <fieldset>
          <legend className="sr-only">Dates</legend>
          <label
            htmlFor="dates"
            className="font-jakarta text-[15px] font-bold pb-[15px]"
          >
            DATE
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              id="dates"
              name="dates"
              type="text"
              placeholder="Add dates"
              readOnly
              onClick={() => setOpenCal((v) => !v)}
              value={dateDisplay}
              className="w-48 border-0 border-b border-primary bg-transparent focus:outline-none placeholder:text-primary cursor-pointer"
            />
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
              width="12"
              height="7"
              viewBox="0 0 12 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="#FCFEFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </fieldset>

        {/* Popover ABOVE the bar */}
        {openCal && (
          <div className="absolute left-0 bottom-[450px]">
            <DateRangePopover
              value={range}
              onChange={setRange}
              onClose={() => setOpenCal(false)}
              initialMonth={range.start ?? new Date()}
            />
          </div>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col">
        <fieldset>
          <legend className="sr-only">Price</legend>
          <label
            htmlFor="price"
            className="font-jakarta text-[15px] font-bold pb-[15px]"
          >
            PRICE
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              id="price"
              name="price"
              type="text"
              placeholder="Maximum Budget"
              readOnly
              className="w-48 border-0 border-b border-primary bg-transparent focus:outline-none placeholder:text-primary"
            />
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2"
              width="12"
              height="7"
              viewBox="0 0 12 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="#FCFEFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </fieldset>
      </div>

      {/* Guests */}
      <div className="flex flex-col">
        <fieldset>
          <legend className="sr-only">Guests</legend>
          <label
            htmlFor="guests"
            className="font-jakarta text-[15px] font-bold pb-[15px]"
          >
            GUESTS
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              id="guests"
              name="guests"
              type="text"
              placeholder="Number of guests"
              readOnly
              className="w-48 border-0 border-b border-primary bg-transparent focus:outline-none placeholder:text-primary"
            />
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2"
              width="12"
              height="7"
              viewBox="0 0 12 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="#FCFEFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </fieldset>
      </div>

      {/* CTA Button */}
      <div>
        <button
          type="submit"
          className="font-jakarta font-jakarta text-[15px] font-bold flex flex-row items-center gap-1.5 cursor-pointer"
        >
          GO
          <svg
            width="7"
            height="12"
            viewBox="0 0 7 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 11L6 6L1 1"
              stroke="#FCFEFF"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
