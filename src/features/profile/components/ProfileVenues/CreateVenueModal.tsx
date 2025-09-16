"use client";

import * as React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateVenueModal({ open, onClose }: Props) {
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // layout-only for now — we'll wire this to createVenue later
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* dialog (same look as UpdateProfileModal) */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[685px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-secondary p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-5 md:px-30">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="font-noto text-[35px] font-bold text-primary">
              Create new venue
            </h2>
          </div>
        </div>

        {/* Placeholder form content — swap these for your real fields later */}
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col w-full gap-1">
            <label className="font-jakarta font-bold">Name</label>
            <input
              placeholder="Venue name"
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          <div className="flex flex-col w-full gap-1">
            <label className="font-jakarta font-bold">Description</label>
            <textarea
              rows={4}
              placeholder="Describe your venue"
              className="min-h-[90px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 py-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          {/* Buttons row */}
          <div className="mt-2 flex w-full items-center justify-center gap-[30px]">
            <button
              type="submit"
              disabled={busy}
              className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold disabled:opacity-60"
            >
              {busy ? "Creating…" : "CREATE VENUE"}
              <svg
                width="7"
                height="12"
                viewBox="0 0 7 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1 11L6 6L1 1"
                  stroke="#FCFEFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary/60 font-bold"
            >
              CANCEL
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.53478 8.53531L8.60585 1.46424M1.53478 1.46424L8.60585 8.53531"
                  stroke="#FCFEFF"
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
