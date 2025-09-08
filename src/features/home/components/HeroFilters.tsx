"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import DateRangePopover from "./date/DateRangePopover";
import PricePopover from "./price/PricePopover";
import GuestsPopover from "./guests/GuestsPopover";

type Range = { start?: Date; end?: Date };

function formatRange(r: Range) {
  const fmt: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (!r.start && !r.end) return "Add dates";
  if (r.start && !r.end) return r.start.toLocaleDateString(undefined, fmt);
  if (r.start && r.end) {
    const a = r.start.toLocaleDateString(undefined, fmt);
    const b = r.end.toLocaleDateString(undefined, fmt);
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
function fmtPriceUSD(n?: number) {
  if (typeof n !== "number" || isNaN(n)) return undefined;
  return `$${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(n)}`;
}
function formatPriceInput(min?: number, max?: number, cap = 10000) {
  if (min == null && max == null) return "Maximum Budget";
  const left = min == null ? "$0" : fmtPriceUSD(min);
  const right = max == null ? `${cap / 1000}k+ $` : fmtPriceUSD(max);
  return `${left} – ${right}`;
}

export default function HeroFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const startStr = searchParams.get("start");
  const endStr = searchParams.get("end");
  const priceMinStr = searchParams.get("priceMin");
  const priceMaxStr = searchParams.get("priceMax");
  const guestsStr = searchParams.get("guests");

  // Dates
  const [range, setRange] = useState<Range>(() => ({
    start: startStr ? new Date(startStr) : undefined,
    end: endStr ? new Date(endStr) : undefined,
  }));
  const [openCal, setOpenCal] = useState(false);

  useEffect(() => {
    setRange({
      start: startStr ? new Date(startStr) : undefined,
      end: endStr ? new Date(endStr) : undefined,
    });
  }, [startStr, endStr]);

  // Price
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceMin, setPriceMin] = useState<number | undefined>(
    priceMinStr ? Number(priceMinStr) : undefined
  );
  const [priceMax, setPriceMax] = useState<number | undefined>(
    priceMaxStr ? Number(priceMaxStr) : undefined
  );

  useEffect(() => {
    setPriceMin(priceMinStr ? Number(priceMinStr) : undefined);
    setPriceMax(priceMaxStr ? Number(priceMaxStr) : undefined);
  }, [priceMinStr, priceMaxStr]);

  // Guests
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [guests, setGuests] = useState<number | undefined>(
    guestsStr ? Number(guestsStr) : undefined
  );

  useEffect(() => {
    setGuests(guestsStr ? Number(guestsStr) : undefined);
  }, [guestsStr]);

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

    if (typeof priceMin === "number" && !isNaN(priceMin) && priceMin > 0) {
      sp.set("priceMin", String(priceMin));
    } else sp.delete("priceMin");

    if (typeof priceMax === "number" && !isNaN(priceMax)) {
      sp.set("priceMax", String(priceMax));
    } else sp.delete("priceMax");

    if (typeof guests === "number" && guests > 0) {
      sp.set("guests", String(guests));
    } else sp.delete("guests");

    sp.set("page", "1");
    router.push(`?${sp.toString()}#listings-grid`, { scroll: true });
  }

  const dateDisplay = useMemo(() => formatRange(range), [range]);
  const priceDisplay = useMemo(
    () => formatPriceInput(priceMin, priceMax, 10000),
    [priceMin, priceMax]
  );
  const guestsDisplay = guests != null ? String(guests) : "";

  return (
    <form
      onSubmit={onSubmit}
      className="w-[300px] sm:w-[550px] lg:w-[1290px] h-[480px] sm:h-45 lg:h-20 bg-white/10 rounded-[10px] border border-white/0 backdrop-blur-[5.10px] flex flex-col sm:flex-row justify-around sm:flex-wrap lg:justify-between items-center text-primary px-[39px] cursor-pointer">
      {/* Search */}
      <div className="flex flex-col">
        <fieldset>
          <legend className="sr-only">Search</legend>
          <label
            htmlFor="search"
            className="font-jakarta text-[15px] font-bold pb-[15px]">
            WHERE TO?
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              key={q || "empty"}
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
              xmlns="http://www.w3.org/2000/svg">
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
      <div className="flex flex-col relative">
        <fieldset>
          <legend className="sr-only">Dates</legend>
          <label
            htmlFor="dates"
            className="font-jakarta text-[15px] font-bold pb-[15px]">
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
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 1L6 6L11 1"
                stroke="#FCFEFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </fieldset>

        {openCal && (
          <div className="absolute -left-8 sm:-left-80 lg:left-0 bottom-[395px] lg:bottom-[450px]">
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
      <div className="flex flex-col relative">
        <fieldset>
          <legend className="sr-only">Price</legend>
          <label
            htmlFor="price"
            className="font-jakarta text-[15px] font-bold pb-[15px]">
            PRICE
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              id="price"
              name="price"
              type="text"
              placeholder="Maximum Budget"
              readOnly
              onClick={() => setPriceOpen((v) => !v)}
              value={priceDisplay}
              className="w-48 border-0 border-b border-primary bg-transparent focus:outline-none placeholder:text-primary cursor-pointer"
            />
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2"
              width="12"
              height="7"
              viewBox="0 0 12 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 1L6 6L11 1"
                stroke="#FCFEFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </fieldset>

        {priceOpen && (
          <div className="absolute -left-8 lg:left-0  bottom-[135px] lg:bottom-[150px]">
            <PricePopover
              minValue={priceMin}
              maxValue={priceMax}
              onChange={(lo, hi) => {
                setPriceMin(lo);
                setPriceMax(hi);
              }}
              onClose={() => setPriceOpen(false)}
              min={0}
              max={10000}
              step={50}
            />
          </div>
        )}
      </div>

      {/* Guests */}
      <div className="flex flex-col relative">
        <fieldset>
          <legend className="sr-only">Guests</legend>
          <label
            htmlFor="guests"
            className="font-jakarta text-[15px] font-bold pb-[15px]">
            GUESTS
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              id="guests"
              name="guests"
              type="text"
              placeholder="Number of guests"
              readOnly
              onClick={() => setGuestsOpen((v) => !v)}
              value={guestsDisplay}
              className="w-48 border-0 border-b border-primary bg-transparent focus:outline-none placeholder:text-primary cursor-pointer"
            />
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2"
              width="12"
              height="7"
              viewBox="0 0 12 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 1L6 6L11 1"
                stroke="#FCFEFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </fieldset>

        {guestsOpen && (
          <div className="absolute -left-3 lg:left-0 bottom-[120px]">
            <GuestsPopover
              value={guests}
              onChange={setGuests}
              onClose={() => setGuestsOpen(false)}
              min={1}
              max={20}
            />
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="flex basis-auto sm:basis-full lg:basis-auto justify-normal sm:justify-center">
        <button
          type="submit"
          className="font-jakarta text-[15px] font-bold flex flex-row items-center gap-1.5 cursor-pointer">
          GO
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
      </div>
    </form>
  );
}
