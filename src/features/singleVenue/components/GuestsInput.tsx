"use client";

import { useEffect, useState } from "react";

/**
 * GuestsInput
 *
 * A controlled numeric input for selecting the number of guests with +/- buttons,
 * clamped between 1 and the provided `max`. Accepts only digits when typing,
 * gracefully handles empty/invalid input, and calls `onChange` whenever the
 * internal value changes.
 *
 * Accessibility:
 * - Input has `aria-label="Number of guests"`.
 * - Decrease/Increase buttons have labels and disabled states at bounds.
 *
 * Props:
 * @param max      Maximum allowed guests (lower bound is always 1).
 * @param name     Input name attribute (default: "guests").
 * @param initial  Initial guests value (default: 1). Clamped to [1, max].
 * @param onChange Callback invoked with the latest valid guests value.
 *
 * Behavior:
 * - Typing: non-digits are stripped; empty field renders as "" temporarily.
 * - Blur: empty/invalid value is snapped back into [1, max].
 * - Buttons: bump value by ±1, clamped to bounds.
 */
export default function GuestsInput({
  max,
  name = "guests",
  initial = 1,
  onChange,
}: {
  max: number;
  name?: string;
  initial?: number;
  onChange?: (val: number) => void;
}) {
  const clamp = (n: number) => {
    if (!Number.isFinite(n)) return 1;
    return Math.min(Math.max(1, n), Math.max(1, max));
  };
  const [value, setValue] = useState<number>(
    Number.isFinite(initial) ? clamp(initial) : 1
  );
  useEffect(() => {
    if (Number.isFinite(value)) onChange?.(value as number);
  }, [value, onChange]);
  const bump = (delta: number) => {
    setValue((v) => clamp((Number.isFinite(v) ? (v as number) : 1) + delta));
  };
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    if (raw === "") {
      setValue(NaN as unknown as number);
      return;
    }
    setValue(clamp(parseInt(raw, 10)));
  };
  const handleBlur = () => {
    setValue((v) => clamp(Number.isFinite(v) ? (v as number) : 1));
  };
  const display = Number.isFinite(value) ? String(value) : "";
  const atMin = Number.isFinite(value) ? (value as number) <= 1 : false;
  const atMax = Number.isFinite(value)
    ? (value as number) >= Math.max(1, max)
    : false;
  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        type="text"
        inputMode="numeric"
        placeholder="1"
        value={display}
        onChange={handleInput}
        onBlur={handleBlur}
        className="w-full h-[46px] bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-9 pt-6 pb-2 text-sm text-primary placeholder-primary focus:outline-none"
        aria-label="Number of guests"
      />
      <button
        type="button"
        onClick={() => bump(-1)}
        disabled={atMin}
        className="absolute left-2 top-8 -translate-y-1/2 p-1 rounded hover:bg-primary/10 disabled:opacity-40"
        aria-label="Decrease guests">
        <svg
          width="12"
          height="2"
          viewBox="0 0 12 2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1 1H11"
            stroke="#FCFEFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => bump(1)}
        disabled={atMax}
        className="absolute left-13 top-8 -translate-y-1/2 p-1 rounded hover:bg-primary/10 disabled:opacity-40"
        aria-label="Increase guests">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6 11V1M1 6H11"
            stroke="#FCFEFF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
