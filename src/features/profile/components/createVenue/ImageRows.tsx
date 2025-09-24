import * as React from "react";

type Row = { url: string; alt: string };

/**
 * ImageRows component.
 *
 * Small editor for a list of image entries (URL + alt text).
 * Enforces at least one row and caps rows at `max` (default: 4).
 *
 * Used by: `CreateVenueModal` to collect media items.
 *
 * @param rows     - Current list of image rows.
 * @param onChange - Called with the next rows array after add/remove/edit.
 * @param max      - Maximum number of rows allowed (default: 4).
 *
 * @returns The image list editor UI.
 */
export function ImageRows({
  rows,
  onChange,
  max = 4,
}: {
  rows: Row[];
  onChange: (next: Row[]) => void;
  max?: number;
}) {
  function addRow() {
    if (rows.length >= max) return;
    onChange([...rows, { url: "", alt: "" }]);
  }
  function removeRow(i: number) {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, idx) => idx !== i));
  }
  function updateRow(i: number, patch: Partial<Row>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  return (
    <div className="flex flex-col w-full">
      <label className="font-jakarta font-bold text-xs">Images</label>
      <div className="mt-1 flex flex-col gap-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <input
              type="text"
              placeholder="Image URL"
              value={row.url}
              onChange={(e) => updateRow(i, { url: e.target.value })}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary outline-none"
            />
            <input
              type="text"
              placeholder="Alt text (optional)"
              value={row.alt}
              onChange={(e) => updateRow(i, { alt: e.target.value })}
              className="h-[30px] min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary outline-none"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              className="h-[30px] px-2 rounded-[5px] font-bold disabled:opacity-50"
              aria-label="Remove image row"
              title="Remove image row">
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          disabled={rows.length >= max}
          className="mt-1 inline-flex items-center gap-1.5 font-jakarta text-[15px] font-bold disabled:opacity-50">
          ADD IMAGE
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
    </div>
  );
}
