"use client";

import { useMemo } from "react";
import {
  Range,
  daysInCalendar,
  inRange,
  inPreviewRange,
  isSameDay,
} from "./dateMath";

type Props = {
  month: Date;
  range: Range;
  hovered?: Date;
  onHover: (d?: Date) => void;
  onPick: (d: Date) => void;
  isBlocked: (d: Date) => boolean;
  isHighlighted?: (d: Date) => boolean;
};

/**
 * Single-month calendar grid for date picking.
 *
 * - Shows a 6-week grid (Mon–Sun) from `daysInCalendar(month)`.
 * - Highlights selected range, preview range (while hovering), and optional custom highlights.
 * - Disables blocked days and prevents interaction on them.
 *
 * @param month - The month to render.
 * @param range - Current selected start/end dates.
 * @param hovered - The day currently hovered (used for previewing an end date).
 * @param onHover - Called with a day (or undefined) on mouse enter/leave.
 * @param onPick - Called when a selectable day is clicked.
 * @param isBlocked - Predicate to determine if a day is unavailable.
 * @param isHighlighted - Optional predicate to visually emphasize certain days.
 *
 * @returns The month view UI for date selection.
 */
export default function MonthView({
  month,
  range,
  hovered,
  onHover,
  onPick,
  isBlocked,
  isHighlighted,
}: Props) {
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
            ? "bg-primary/20 border border-primary/0 backdrop-blur-[5.10px]"
            : within
            ? "bg-primary/10"
            : previewWithin
            ? "bg-primary/5"
            : "hover:bg-primary/10";
          const highlighted = isHighlighted?.(d) ?? false;
          const disabledCls = disabled
            ? `cursor-not-allowed pointer-events-none ${
                highlighted ? "" : "opacity-40"
              }`
            : "cursor-pointer";
          const highlightCls = highlighted
            ? "text-imperialRed opacity-100 font-semibold"
            : "";
          const cls = `${base} ${bg} ${dim} ${disabledCls} ${highlightCls}`;
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
