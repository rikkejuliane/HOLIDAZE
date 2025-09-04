"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Range = { start?: Date; end?: Date };
type Props = {
  value: Range;
  onChange: (next: Range) => void;
  onClose: () => void;
  initialMonth?: Date; // defaults to today
};

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

  // Fill leading blanks from previous month
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(first);
    d.setDate(d.getDate() - (startWeekday - i));
    days.push(d);
  }

  // Fill current month (max 31)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= last; d++) {
    days.push(new Date(month.getFullYear(), month.getMonth(), d));
  }

  // Trailing to fill 6 rows * 7 cols = 42 cells
  while (days.length % 7 !== 0 || days.length < 42) {
    const next = new Date(days[days.length - 1]);
    next.setDate(next.getDate() + 1);
    days.push(next);
  }
  return days.slice(0, 42);
}

function MonthView({
  month,
  range,
  hovered,
  onHover,
  onPick,
}: {
  month: Date;
  range: Range;
  hovered?: Date;
  onHover: (d?: Date) => void;
  onPick: (d: Date) => void;
}) {
  const grid = useMemo(() => daysInCalendar(month), [month]);
  const monthIndex = month.getMonth();

  return (
    <div className="w-[280px] p-3">
      <div className="grid grid-cols-7 text-center text-xs opacity-80 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((d, i) => {
          const isOtherMonth = d.getMonth() !== monthIndex;
          const selectedStart = isSameDay(d, range.start);
          const selectedEnd = isSameDay(d, range.end);
          const within = inRange(d, range.start, range.end);
          const previewWithin =
            !!range.start && !range.end && inPreviewRange(d, range.start, hovered);

          const base =
            "h-9 grid place-items-center rounded cursor-pointer text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
          const dim = isOtherMonth ? "opacity-40" : "";
          const isSelected = selectedStart || selectedEnd;

          const bg = isSelected
            ? "bg-white/20 border border-white/0 backdrop-blur-[5.10px]"
            : within
            ? "bg-white/10"
            : previewWithin
            ? "bg-white/5" // softer preview color while hovering to choose end date
            : "hover:bg-white/10";

          const cls = `${base} ${bg} ${dim}`;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(new Date(d))}
              onMouseEnter={() => onHover(new Date(d))}
              onMouseLeave={() => onHover(undefined)}
              className={cls}
              aria-pressed={isSelected}
              aria-label={d.toDateString()}
            >
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
}: Props) {
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    startOfMonth(initialMonth ?? new Date())
  );
  const [hovered, setHovered] = useState<Date | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click / ESC
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
    const { start, end } = value;

    if (!start || (start && end)) {
      // start new range
      onChange({ start: day, end: undefined });
      return;
    }

    if (isBefore(day, start)) {
      // clicked before start -> swap
      onChange({ start: day, end: start });
      onClose();
      return;
    }

    // set end
    onChange({ start, end: day });
    onClose();
  }

  return (
    <div
      ref={wrapRef}
      className="absolute z-50 mt-2 w-fit rounded-xl border border-white/10 bg-background/80 backdrop-blur-xl p-3 shadow-lg"
      role="dialog"
      aria-label="Choose dates"
    >
      <div className="flex items-center justify-between px-2 pb-2">
        <button
          type="button"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
          className="p-1 rounded hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-sm font-semibold">
          {visibleMonth.toLocaleString(undefined, {
            month: "long",
            year: "numeric",
          })}
          {"  –  "}
          {addMonths(visibleMonth, 1).toLocaleString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          type="button"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
          className="p-1 rounded hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Next month"
        >
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
        />
        <MonthView
          month={addMonths(visibleMonth, 1)}
          range={value}
          hovered={hovered}
          onHover={setHovered}
          onPick={handlePick}
        />
      </div>

      <div className="flex items-center justify-between px-2 pt-2 text-xs opacity-80">
        <span>
          {value.start
            ? value.start.toLocaleDateString()
            : "Pick a start date"}
          {" — "}
          {value.end ? value.end.toLocaleDateString() : "Pick an end date"}
        </span>
        <button
          type="button"
          onClick={() => onChange({ start: undefined, end: undefined })}
          className="underline hover:opacity-80"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
