import * as React from "react";

export function AmenityToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-row justify-between items-center py-1">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        className="relative w-10 h-5 rounded-full bg-white/60 shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[5.10px] transition">
        <span
          className={[
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-zinc-800 transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
