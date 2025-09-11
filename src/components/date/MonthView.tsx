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
  /** optional: visually mark certain days (e.g. user’s own bookings) */
  isHighlighted?: (d: Date) => boolean;
};

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
            !!range.start && !range.end && inPreviewRange(d, range.start, hovered);

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
