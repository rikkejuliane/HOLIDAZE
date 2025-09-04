"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value?: number;                 // undefined = no preference
  onChange: (next?: number) => void;
  onClose: () => void;
  min?: number;                   // default 1
  max?: number;                   // default 20
};

export default function GuestsPopover({
  value,
  onChange,
  onClose,
  min = 1,
  max = 20,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState<number>(typeof value === "number" ? value : min);

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

  useEffect(() => {
    setCount(typeof value === "number" ? value : min);
  }, [value, min]);

  function setAndEmit(n: number) {
    const clamped = Math.max(min, Math.min(max, n));
    setCount(clamped);
    onChange(clamped);
  }

  return (
    <div
      ref={wrapRef}
      className="absolute z-50 w-[220px] rounded-xl border border-white/10 bg-background/80 backdrop-blur-xl p-4 text-primary shadow-lg"
      role="dialog"
      aria-label="Select guests"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Guests</span>

        <div className="flex items-center gap-3">
          {/* – button */}
          <button
            type="button"
            onClick={() => setAndEmit(count - 1)}
            disabled={count <= min}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-40"
            aria-label="Decrease guests"
          >
            {/* minus SVG */}
            <svg width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M1 1H11" stroke="#FCFEFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* value */}
          <span className="w-6 text-center text-sm tabular-nums">{count}</span>

          {/* + button */}
          <button
            type="button"
            onClick={() => setAndEmit(count + 1)}
            disabled={count >= max}
            className="grid h-7 w-7 place-items-center rounded-full border border-white/20 hover:bg-white/10 disabled:opacity-40"
            aria-label="Increase guests"
          >
            {/* plus SVG */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M6 11V1M1 6H11" stroke="#FCFEFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
