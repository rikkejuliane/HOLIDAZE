"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** Selected min (undefined => 0) */
  minValue?: number;
  /** Selected max (undefined => no upper limit, i.e., 10k+ $) */
  maxValue?: number;
  /** Fires live while dragging */
  onChange: (min?: number, max?: number) => void;
  onClose: () => void;
  /** Slider config */
  min?: number;  // default 0
  max?: number;  // default 10000
  step?: number; // default 50
};

function rightLabel(max: number) {
  return max >= 1000 && max % 1000 === 0 ? `${max / 1000}k+ $` : `${max.toLocaleString()}+ $`;
}

export default function PricePopover({
  minValue,
  maxValue,
  onChange,
  onClose,
  min = 0,
  max = 10000,
  step = 50,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Local controlled values (visual). If maxValue is undefined, show thumb at max.
  const [minLocal, setMinLocal] = useState<number>(typeof minValue === "number" ? minValue : min);
  const [maxLocal, setMaxLocal] = useState<number>(typeof maxValue === "number" ? maxValue : max);
  const [dragging, setDragging] = useState<null | "min" | "max">(null);

  // Sync with external changes (URL back/forward, etc.)
  useEffect(() => {
    setMinLocal(typeof minValue === "number" ? minValue : min);
  }, [minValue, min]);
  useEffect(() => {
    setMaxLocal(typeof maxValue === "number" ? maxValue : max);
  }, [maxValue, max]);

  // Close on outside / ESC
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

  const range = max - min;
  const displayMax = typeof maxValue === "number" ? maxLocal : max;

  const pctMin = useMemo(() => ((minLocal - min) / range) * 100, [minLocal, min, range]);
  const pctMax = useMemo(() => ((displayMax - min) / range) * 100, [displayMax, min, range]);

  function roundToStep(raw: number) {
    const steps = Math.round((raw - min) / step);
    const v = min + steps * step;
    return Math.min(max, Math.max(min, v));
  }

  function commit(nextMin: number, nextMax: number) {
    // Far-right max => no upper limit
    const upper = nextMax >= max ? undefined : nextMax;
    const lower = Math.max(min, Math.min(nextMin, upper ?? max));
    onChange(lower <= min ? undefined : lower, upper);
  }

  function pxToValue(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return min;
    const ratio = (clientX - rect.left) / rect.width;
    const unclamped = min + ratio * range;
    return roundToStep(Math.min(max, Math.max(min, unclamped)));
  }

  function pickHandle(clientX: number) {
    // Choose the closest thumb to where the user clicked
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return "max" as const;
    const x = clientX - rect.left;
    const minX = (pctMin / 100) * rect.width;
    const maxX = (pctMax / 100) * rect.width;
    return Math.abs(x - minX) <= Math.abs(x - maxX) ? ("min" as const) : ("max" as const);
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const which = pickHandle(e.clientX);
    setDragging(which);
    const v = pxToValue(e.clientX);
    if (which === "min") {
      const clamped = Math.min(v, maxLocal - step);
      setMinLocal(clamped);
      commit(clamped, maxLocal);
    } else {
      const clamped = Math.max(v, minLocal + step);
      setMaxLocal(clamped);
      commit(minLocal, clamped);
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const v = pxToValue(e.clientX);
    if (dragging === "min") {
      const clamped = Math.min(v, maxLocal - step);
      setMinLocal(clamped);
      commit(clamped, maxLocal);
    } else {
      const clamped = Math.max(v, minLocal + step);
      setMaxLocal(clamped);
      commit(minLocal, clamped);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    setDragging(null);
  }

  // Keyboard support (like MUI): arrows, PageUp/Down, Home/End
  function onThumbKeyDown(which: "min" | "max", e: React.KeyboardEvent) {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowUp" ? step :
      e.key === "ArrowLeft"  || e.key === "ArrowDown" ? -step :
      e.key === "PageUp" ? step * 10 :
      e.key === "PageDown" ? -step * 10 :
      0;

    if (e.key === "Home") {
      if (which === "min") { setMinLocal(min); commit(min, maxLocal); }
      else { setMaxLocal(Math.max(minLocal + step, min)); commit(minLocal, Math.max(minLocal + step, min)); }
      e.preventDefault(); return;
    }
    if (e.key === "End") {
      if (which === "min") { const m = Math.min(maxLocal - step, max); setMinLocal(m); commit(m, maxLocal); }
      else { setMaxLocal(max); commit(minLocal, max); }
      e.preventDefault(); return;
    }

    if (delta !== 0) {
      if (which === "min") {
        const next = roundToStep(minLocal + delta);
        const clamped = Math.min(next, maxLocal - step);
        setMinLocal(clamped);
        commit(clamped, maxLocal);
      } else {
        const next = roundToStep(maxLocal + delta);
        const clamped = Math.max(next, minLocal + step);
        setMaxLocal(clamped);
        commit(minLocal, clamped);
      }
      e.preventDefault();
    }
  }

  return (
    <div
      ref={wrapRef}
      className="absolute z-50 w-[310px] rounded-xl border border-white/10 bg-background/80 backdrop-blur-xl p-4 text-primary shadow-lg"
      role="dialog"
      aria-label="Select price range"
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="relative mx-1 mt-3 mb-2 h-1.5 rounded bg-white/20"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Selected band */}
        <div
          className="absolute h-1.5 rounded bg-current"
          style={{ left: `${pctMin}%`, width: `${Math.max(0, pctMax - pctMin)}%` }}
          aria-hidden
        />

        {/* Min thumb */}
        <button
          type="button"
          role="slider"
          aria-label="Minimum price"
          aria-valuemin={min}
          aria-valuemax={maxLocal - step}
          aria-valuenow={minLocal}
          tabIndex={0}
          onKeyDown={(e) => onThumbKeyDown("min", e)}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-current border-2 border-white/70 cursor-grab focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          style={{ left: `${pctMin}%` }}
        />

        {/* Max thumb (when unlimited we still render at far right) */}
        <button
          type="button"
          role="slider"
          aria-label="Maximum price"
          aria-valuemin={minLocal + step}
          aria-valuemax={max}
          aria-valuenow={displayMax}
          tabIndex={0}
          onKeyDown={(e) => onThumbKeyDown("max", e)}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-current border-2 border-white/70 cursor-grab focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          style={{ left: `${pctMax}%` }}
        />
      </div>

      {/* Range labels */}
      <div className="mt-1 flex justify-between text-xs opacity-90 select-none">
        <span>0</span>
        <span>{rightLabel(max)}</span>
      </div>
    </div>
  );
}
