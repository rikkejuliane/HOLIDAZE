// src/components/date/DateRangePopover.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import MonthView from "./MonthView";
import { useOutsideAndEsc } from "./hooks/useOutsideAndEsc";
import {
  Range,
  BlockedRange,
  addMonths,
  buildIsBlocked,
  clampToStartOfDay,
  daysDiff,
  hasBlockedBetween,
  isBefore,
  isSameDay,
  startOfDaySafe,
  startOfMonth,
} from "./dateMath";

type Props = {
  value: Range;
  onChange: (next: Range) => void;
  onClose: () => void;
  initialMonth?: Date;

  unavailableRanges?: BlockedRange[];
  isDateBlocked?: (day: Date) => boolean;
  minNights?: number;
  allowPast?: boolean;

  /** optional visual highlighting (e.g., user's bookings) */
  highlightedRanges?: BlockedRange[];
};

export default function DateRangePopover({
  value,
  onChange,
  onClose,
  initialMonth,
  unavailableRanges,
  isDateBlocked,
  minNights = 1,
  allowPast = false,
  highlightedRanges = [],
}: Props) {
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    startOfMonth(initialMonth ?? new Date())
  );
  const [hovered, setHovered] = useState<Date | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  useOutsideAndEsc(wrapRef, onClose);

  const isBlocked = useMemo(
    () =>
      buildIsBlocked({
        unavailableRanges,
        isDateBlocked,
        allowPast,
      }),
    [unavailableRanges, isDateBlocked, allowPast]
  );

  // Optional highlight helper
  const isHighlighted = useMemo(() => {
    const ranges =
      (highlightedRanges ?? [])
        .map((r) => ({
          start: startOfDaySafe(r.start),
          end: startOfDaySafe(r.end),
        }))
        .filter((r) => !isBefore(r.end, r.start)) || [];

    return (d: Date) => {
      const t = startOfDaySafe(d).getTime();
      for (const r of ranges) {
        const a = r.start.getTime();
        const b = r.end.getTime();
        if (t >= a && t <= b) return true;
      }
      return false;
    };
  }, [highlightedRanges]);

  function handlePick(day: Date) {
    const start = clampToStartOfDay(value.start);
    const end = clampToStartOfDay(value.end);
    const picked = clampToStartOfDay(day)!;

    // 1) No start yet, or both chosen: start over
    if (!start || (start && end)) {
      if (isBlocked(picked)) return;
      onChange({ start: picked, end: undefined });
      return;
    }

    // 2) Choose end (including "flip" if clicked before start)
    if (isBefore(picked, start)) {
      if (hasBlockedBetween(picked, start, isBlocked)) return;
      const nights = daysDiff(picked, start);
      if (nights < minNights) return;
      onChange({ start: picked, end: start });
      onClose();
      return;
    }

    if (isSameDay(picked, start)) {
      if (minNights <= 0) {
        onChange({ start, end: picked });
        onClose();
      }
      return;
    }

    if (hasBlockedBetween(start, picked, isBlocked)) return;

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
          isHighlighted={highlightedRanges.length ? isHighlighted : undefined}
        />
        <div className="hidden sm:block">
          <MonthView
            month={addMonths(visibleMonth, 1)}
            range={value}
            hovered={hovered}
            onHover={setHovered}
            onPick={handlePick}
            isBlocked={isBlocked}
            isHighlighted={highlightedRanges.length ? isHighlighted : undefined}
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
