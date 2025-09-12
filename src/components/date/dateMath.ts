export type Range = { start?: Date; end?: Date };
export type BlockedRange = { start: Date; end: Date };

export function startOfDaySafe(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
export function isPastDay(day: Date, today = new Date()) {
  return startOfDaySafe(day) < startOfDaySafe(today);
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
export function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
export function isSameDay(a?: Date, b?: Date) {
  return !!a && !!b && a.toDateString() === b.toDateString();
}
export function isBefore(a: Date, b: Date) {
  return a.setHours(0, 0, 0, 0) < b.setHours(0, 0, 0, 0);
}
export function isAfter(a: Date, b: Date) {
  return a.setHours(0, 0, 0, 0) > b.setHours(0, 0, 0, 0);
}
export function inRange(day: Date, start?: Date, end?: Date) {
  if (!start || !end) return false;
  const t = day.setHours(0, 0, 0, 0);
  return t >= start.setHours(0, 0, 0, 0) && t <= end.setHours(0, 0, 0, 0);
}
export function inPreviewRange(day: Date, start?: Date, hovered?: Date) {
  if (!start || !hovered) return false;
  const a = isBefore(start, hovered) ? start : hovered;
  const b = isBefore(start, hovered) ? hovered : start;
  const t = day.setHours(0, 0, 0, 0);
  return t >= a.setHours(0, 0, 0, 0) && t <= b.setHours(0, 0, 0, 0);
}
export function daysInCalendar(month: Date) {
  const first = startOfMonth(month);
  const startWeekday = (first.getDay() + 6) % 7; // Mon=0
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

export function clampToStartOfDay(d?: Date) {
  return d ? startOfDaySafe(d) : undefined;
}

export function daysDiff(a: Date, b: Date) {
  const ms = startOfDaySafe(b).getTime() - startOfDaySafe(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

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

export function hasBlockedBetween(
  a: Date,
  b: Date,
  isBlocked: (d: Date) => boolean
) {
  const start = isBefore(a, b) ? a : b;
  const end = isBefore(a, b) ? b : a;
  const cur = new Date(start);
  cur.setDate(cur.getDate() + 1); // exclusive of start, inclusive of end
  while (cur <= end) {
    if (isBlocked(cur)) return true;
    cur.setDate(cur.getDate() + 1);
  }
  return false;
}
