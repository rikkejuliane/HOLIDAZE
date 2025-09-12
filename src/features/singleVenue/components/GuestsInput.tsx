"use client";

import { useEffect, useState } from "react";

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
        className="w-full h-[46px] bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-9 pt-6 pb-2 text-sm text-white placeholder-primary focus:outline-none"
        aria-label="Number of guests"
      />

      <button
        type="button"
        onClick={() => bump(-1)}
        disabled={atMin}
        className="absolute left-2 top-8 -translate-y-1/2 p-1 rounded hover:bg-white/10 disabled:opacity-40"
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
        className="absolute left-13 top-8 -translate-y-1/2 p-1 rounded hover:bg-white/10 disabled:opacity-40"
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
