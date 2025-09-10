"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Range = { start?: Date; end?: Date };
type BlockedRange = { start: Date; end: Date };

type Props = {
  value: Range;
  onChange: (next: Range) => void;
  onClose: () => void;
  initialMonth?: Date;

  /** NEW (optional): block dates (booked/out of service) by ranges */
  unavailableRanges?: BlockedRange[];
  /** NEW (optional): custom blocker if you prefer full control */
  isDateBlocked?: (day: Date) => boolean;
  /** NEW (optional): require at least N nights */
  minNights?: number;
  /** NEW (optional): allow selecting past days (default false) */
  allowPast?: boolean;
};

function startOfDaySafe(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function isPastDay(day: Date, today = new Date()) {
  return startOfDaySafe(day) < startOfDaySafe(today);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function isSameDay(a?: Date, b?: Date) {
  return !!a && !!b && a.toDateString() === b.toDateString();
}
function isBefore(a: Date, b: Date) {
  return a.setHours(0, 0, 0, 0) < b.setHours(0, 0, 0, 0);
}
function isAfter(a: Date, b: Date) {
  return a.setHours(0, 0, 0, 0) > b.setHours(0, 0, 0, 0);
}
function inRange(day: Date, start?: Date, end?: Date) {
  if (!start || !end) return false;
  const t = day.setHours(0, 0, 0, 0);
  return t >= start.setHours(0, 0, 0, 0) && t <= end.setHours(0, 0, 0, 0);
}
function inPreviewRange(day: Date, start?: Date, hovered?: Date) {
  if (!start || !hovered) return false;
  const a = isBefore(start, hovered) ? start : hovered;
  const b = isBefore(start, hovered) ? hovered : start;
  const t = day.setHours(0, 0, 0, 0);
  return t >= a.setHours(0, 0, 0, 0) && t <= b.setHours(0, 0, 0, 0);
}
function daysInCalendar(month: Date) {
  const first = startOfMonth(month);
  const startWeekday = (first.getDay() + 6) % 7; // Mon=0
  const days: Date[] = [];

  // leading
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(first);
    d.setDate(d.getDate() - (startWeekday - i));
    days.push(d);
  }
  // month
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= last; d++) {
    days.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  // trailing to 42 cells
  while (days.length % 7 !== 0 || days.length < 42) {
    const next = new Date(days[days.length - 1]);
    next.setDate(next.getDate() + 1);
    days.push(next);
  }
  return days.slice(0, 42);
}

function clampToStartOfDay(d?: Date) {
  return d ? startOfDaySafe(d) : undefined;
}

function buildIsBlocked(opts: {
  unavailableRanges?: BlockedRange[];
  isDateBlocked?: (d: Date) => boolean;
  allowPast?: boolean;
}) {
  const { unavailableRanges = [], isDateBlocked, allowPast = false } = opts;

  // normalize ranges (inclusive)
  const ranges = unavailableRanges
    .map((r) => ({
      start: startOfDaySafe(r.start),
      end: startOfDaySafe(r.end),
    }))
    .filter((r) => !isAfter(r.start, r.end));

  function inAnyBlockedRange(d: Date) {
    const t = startOfDaySafe(d).getTime();
    for (const r of ranges) {
      const a = r.start.getTime();
      const b = r.end.getTime();
      if (t >= a && t <= b) return true;
    }
    return false;
  }

  return (d: Date) => {
    if (!allowPast && isPastDay(d)) return true;
    if (isDateBlocked && isDateBlocked(d)) return true;
    if (inAnyBlockedRange(d)) return true;
    return false;
  };
}

function hasBlockedBetween(a: Date, b: Date, isBlocked: (d: Date) => boolean) {
  const start = isBefore(a, b) ? a : b;
  const end = isBefore(a, b) ? b : a;
  const cur = new Date(start);
  // walk day by day (exclusive of start, inclusive of end)
  cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    if (isBlocked(cur)) return true;
    cur.setDate(cur.getDate() + 1);
  }
  return false;
}

function daysDiff(a: Date, b: Date) {
  const ms = startOfDaySafe(b).getTime() - startOfDaySafe(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function MonthView({
  month,
  range,
  hovered,
  onHover,
  onPick,
  isBlocked,
}: {
  month: Date;
  range: Range;
  hovered?: Date;
  onHover: (d?: Date) => void;
  onPick: (d: Date) => void;
  isBlocked: (d: Date) => boolean;
}) {
  const grid = useMemo(() => daysInCalendar(month), [month]);
  const monthIndex = month.getMonth();

  return (
    <div className="w-[240px] sm:w-[280px] p-2 sm:p-3">
      <div className="grid grid-cols-7 text-center text-[11px] sm:text-xs opacity-80 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((d, i) => {
          const isOtherMonth = d.getMonth() !== monthIndex;
          const disabled = isBlocked(d);

          const selectedStart = isSameDay(d, range.start);
          const selectedEnd = isSameDay(d, range.end);
          const within = inRange(d, range.start, range.end);
          const previewWithin =
            !!range.start &&
            !range.end &&
            inPreviewRange(d, range.start, hovered);

          const base =
            "h-8 sm:h-9 grid place-items-center rounded text-xs sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
          const dim = isOtherMonth ? "opacity-40" : "";
          const isSelected = selectedStart || selectedEnd;

          const bg = isSelected
            ? "bg-white/20 border border-white/0 backdrop-blur-[5.10px]"
            : within
            ? "bg-white/10"
            : previewWithin
            ? "bg-white/5"
            : "hover:bg-white/10";

          const disabledCls = disabled
            ? "opacity-40 cursor-not-allowed pointer-events-none"
            : "cursor-pointer";

          const cls = `${base} ${bg} ${dim} ${disabledCls}`;

          return (
            <button
              key={i}
              type="button"
              onClick={disabled ? undefined : () => onPick(new Date(d))}
              onMouseEnter={disabled ? undefined : () => onHover(new Date(d))}
              onMouseLeave={disabled ? undefined : () => onHover(undefined)}
              className={cls}
              aria-pressed={isSelected}
              aria-disabled={disabled}
              tabIndex={disabled ? -1 : 0}
              aria-label={d.toDateString()}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DateRangePopover({
  value,
  onChange,
  onClose,
  initialMonth,
  unavailableRanges,
  isDateBlocked,
  minNights = 1,
  allowPast = false,
}: Props) {
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    startOfMonth(initialMonth ?? new Date())
  );
  const [hovered, setHovered] = useState<Date | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);

  const isBlocked = useMemo(
    () =>
      buildIsBlocked({
        unavailableRanges,
        isDateBlocked,
        allowPast,
      }),
    [unavailableRanges, isDateBlocked, allowPast]
  );

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);

  function handlePick(day: Date) {
    const start = clampToStartOfDay(value.start);
    const end = clampToStartOfDay(value.end);
    const picked = clampToStartOfDay(day)!;

    // 1) No start yet, or both chosen: start over
    if (!start || (start && end)) {
      if (isBlocked(picked)) return; // guard
      onChange({ start: picked, end: undefined });
      return;
    }

    // 2) Choosing the end
    if (isBefore(picked, start)) {
      // If user clicks before start, flip to (picked -> start) if path isn’t blocked
      if (hasBlockedBetween(picked, start, isBlocked)) return;
      const nights = daysDiff(picked, start);
      if (nights < minNights) return;
      onChange({ start: picked, end: start });
      onClose();
      return;
    }

    // same day?
    if (isSameDay(picked, start)) {
      // Only allow same-day if minNights === 0 (rare). Otherwise ignore.
      if (minNights <= 0) {
        onChange({ start, end: picked });
        onClose();
      }
      return;
    }

    // path must not cross blocked dates
    if (hasBlockedBetween(start, picked, isBlocked)) return;

    // min nights
    const nights = daysDiff(start, picked);
    if (nights < minNights) return;

    onChange({ start, end: picked });
    onClose();
  }

  return (
    <div
      ref={wrapRef}
      className="absolute z-50 mt-2 w-fit max-w-[95vw] rounded-xl border border-white/10 bg-background/80 backdrop-blur-xl p-2 sm:p-3 shadow-lg"
      role="dialog"
      aria-label="Choose dates">
      <div className="flex items-center justify-between px-2 pb-2">
        <button
          type="button"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
          className="p-1 rounded hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Previous month">
          ‹
        </button>
        <div className="text-xs sm:text-sm font-semibold text-center">
          {visibleMonth.toLocaleString(undefined, {
            month: "long",
            year: "numeric",
          })}
          <span className="hidden sm:inline">
            {"  –  "}
            {addMonths(visibleMonth, 1).toLocaleString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
          className="p-1 rounded hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Next month">
          ›
        </button>
      </div>

      <div className="flex gap-2">
        <MonthView
          month={visibleMonth}
          range={value}
          hovered={hovered}
          onHover={setHovered}
          onPick={handlePick}
          isBlocked={isBlocked}
        />
        {/* Hide second month on mobile */}
        <div className="hidden sm:block">
          <MonthView
            month={addMonths(visibleMonth, 1)}
            range={value}
            hovered={hovered}
            onHover={setHovered}
            onPick={handlePick}
            isBlocked={isBlocked}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-2 text-[11px] sm:text-xs opacity-80">
        <span className="truncate">
          {value.start ? value.start.toLocaleDateString() : "Pick a start date"}
          {" — "}
          {value.end ? value.end.toLocaleDateString() : "Pick an end date"}
        </span>
        <button
          type="button"
          onClick={() => onChange({ start: undefined, end: undefined })}
          className="underline hover:opacity-80">
          Clear
        </button>
      </div>
    </div>
  );
}
