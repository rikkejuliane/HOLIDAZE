export type Range = { start?: Date; end?: Date };
export type BlockedRange = { start: Date; end: Date };

/**
 * Returns a new Date at the start of the given day (00:00:00).
 */
export function startOfDaySafe(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Checks if a given day is before today.
 */
export function isPastDay(day: Date, today = new Date()) {
  return startOfDaySafe(day) < startOfDaySafe(today);
}

/**
 * Returns a new Date set to the first day of the month.
 */
export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Returns a new Date advanced by `n` months.
 */
export function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/**
 * Checks whether two dates fall on the same day.
 */
export function isSameDay(a?: Date, b?: Date) {
  return !!a && !!b && a.toDateString() === b.toDateString();
}

/**
 * Checks if date `a` is before date `b` (ignoring time).
 */
export function isBefore(a: Date, b: Date) {
  return a.setHours(0, 0, 0, 0) < b.setHours(0, 0, 0, 0);
}

/**
 * Checks if date `a` is after date `b` (ignoring time).
 */
export function isAfter(a: Date, b: Date) {
  return a.setHours(0, 0, 0, 0) > b.setHours(0, 0, 0, 0);
}

/**
 * Checks whether a given day is within a [start, end] range.
 */
export function inRange(day: Date, start?: Date, end?: Date) {
  if (!start || !end) return false;
  const t = day.setHours(0, 0, 0, 0);
  return t >= start.setHours(0, 0, 0, 0) && t <= end.setHours(0, 0, 0, 0);
}

/**
 * Checks whether a given day is within a "preview range"
 * (between a fixed start date and the currently hovered date).
 */
export function inPreviewRange(day: Date, start?: Date, hovered?: Date) {
  if (!start || !hovered) return false;
  const a = isBefore(start, hovered) ? start : hovered;
  const b = isBefore(start, hovered) ? hovered : start;
  const t = day.setHours(0, 0, 0, 0);
  return t >= a.setHours(0, 0, 0, 0) && t <= b.setHours(0, 0, 0, 0);
}

/**
 * Builds a 6-week (42-day) calendar grid for the given month,
 * including leading/trailing days from adjacent months.
 */
export function daysInCalendar(month: Date) {
  const first = startOfMonth(month);
  const startWeekday = (first.getDay() + 6) % 7;
  const days: Date[] = [];
  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(first);
    d.setDate(d.getDate() - (startWeekday - i));
    days.push(d);
  }
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= last; d++) {
    days.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  while (days.length % 7 !== 0 || days.length < 42) {
    const next = new Date(days[days.length - 1]);
    next.setDate(next.getDate() + 1);
    days.push(next);
  }
  return days.slice(0, 42);
}

/**
 * Normalizes a date to the start of its day, or returns undefined.
 */
export function clampToStartOfDay(d?: Date) {
  return d ? startOfDaySafe(d) : undefined;
}

/**
 * Returns the difference in days between two dates.
 */
export function daysDiff(a: Date, b: Date) {
  const ms = startOfDaySafe(b).getTime() - startOfDaySafe(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Builds a function that determines whether a date is blocked.
 *
 * @param opts.unavailableRanges - Array of blocked date ranges.
 * @param opts.isDateBlocked - Custom blocking function.
 * @param opts.allowPast - Whether past dates are selectable.
 * @returns A predicate function `(d: Date) => boolean`.
 */
export function buildIsBlocked(opts: {
  unavailableRanges?: BlockedRange[];
  isDateBlocked?: (d: Date) => boolean;
  allowPast?: boolean;
}) {
  const { unavailableRanges = [], isDateBlocked, allowPast = false } = opts;
  const ranges = unavailableRanges
    .map((r) => ({
      start: startOfDaySafe(r.start),
      end: startOfDaySafe(r.end),
    }))
    .filter((r) => !isAfter(r.start, r.end));

  /**
   * Checks whether any blocked day exists between two dates.
   */
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

/**
 * Checks whether any blocked day exists between two dates (exclusive).
 *
 * @param a - First date.
 * @param b - Second date.
 * @param isBlocked - Blocking predicate function.
 * @returns True if any date between `a` and `b` is blocked.
 */
export function hasBlockedBetween(
  a: Date,
  b: Date,
  isBlocked: (d: Date) => boolean
) {
  const start = isBefore(a, b) ? a : b;
  const end = isBefore(a, b) ? b : a;
  const cur = new Date(start);
  cur.setDate(cur.getDate() + 1);
  while (cur <= end) {
    if (isBlocked(cur)) return true;
    cur.setDate(cur.getDate() + 1);
  }
  return false;
}
