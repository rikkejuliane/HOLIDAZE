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
  highlightedRanges?: BlockedRange[];
};

/**
 * Date range popover used for picking check-in/check-out dates.
 *
 * - Renders one or two months with keyboard/mouse close via `useOutsideAndEsc`.
 * - Supports unavailable ranges, custom date blocking, highlighted ranges,
 *   minimum nights, and optional selection of past dates.
 * - Clicking a day sets start/end with safeguards (blocked days and min nights).
 * - Closes automatically when a valid end date is chosen, or on outside/Escape.
 *
 * @param value - The current date range selection (start/end).
 * @param onChange - Called with the next range when the user picks/clears dates.
 * @param onClose - Invoked to close the popover (outside click or Escape).
 * @param initialMonth - Month to display initially; defaults to current month.
 * @param unavailableRanges - Date ranges that cannot be selected.
 * @param isDateBlocked - Predicate to block additional custom dates.
 * @param minNights - Minimum number of nights required; defaults to 1.
 * @param allowPast - Whether past dates are allowed; defaults to false.
 * @param highlightedRanges - Passive highlight ranges (e.g., pricing bands).
 *
 * @returns The popover UI for selecting a date range.
 */
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

  /**
   * Handles a day click according to selection rules:
   * - If no start (or both start/end set), set start if the day isn’t blocked.
   * - If clicking before start, ensure no blocked dates in between and min nights met,
   *   then set the earlier date as start and original start as end.
   * - If clicking the same day as start and min nights is 0, set a same-day range.
   * - Otherwise, validate the path from start to picked day, set end, and close.
   */
  function handlePick(day: Date) {
    const start = clampToStartOfDay(value.start);
    const end = clampToStartOfDay(value.end);
    const picked = clampToStartOfDay(day)!;
    if (!start || (start && end)) {
      if (isBlocked(picked)) return;
      onChange({ start: picked, end: undefined });
      return;
    }
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
      className="absolute z-50 mt-2 w-fit max-w-[95vw] rounded-xl border border-primary/10 bg-background/80 backdrop-blur-xl p-2 sm:p-3 shadow-lg"
      role="dialog"
      aria-label="Choose dates">
      <div className="flex items-center justify-between px-2 pb-2">
        <button
          type="button"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
          className="p-1 rounded hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
          className="p-1 rounded hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
