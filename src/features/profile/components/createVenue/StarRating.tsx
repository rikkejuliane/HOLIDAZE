import * as React from "react";

export function StarRating({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
}) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label="Star rating"
      role="radiogroup">
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={filled}
            onClick={() => onChange(n)}
            className="p-0.5"
            title={`${n} star${n > 1 ? "s" : ""}`}>
            <StarIcon filled={filled} />
          </button>
        );
      })}
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="16"
      viewBox="0 0 15 14"
      xmlns="http://www.w3.org/2000/svg"
      className={filled ? "text-primary" : "text-primary/60"}
      aria-hidden="true">
      <path
        d="M2.86875 14L4.0875 8.82368L0 5.34211L5.4 4.88158L7.5 0L9.6 4.88158L15 5.34211L10.9125 8.82368L12.1312 14L7.5 11.2553L2.86875 14Z"
        fill="currentColor"
      />
    </svg>
  );
}
