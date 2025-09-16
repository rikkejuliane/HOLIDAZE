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
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[685px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-secondary p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-5 md:px-30 text-primary font-jakarta max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="font-noto text-[35px] font-bold">
              Create new venue
            </h2>
          </div>
        </div>

        {/* Placeholder form content — swap these for your real fields later */}
        <form onSubmit={onSubmit} className="flex flex-col gap-3 text-sm">
          <div className="flex flex-col w-full">
            <label htmlFor="title" className="font-jakarta font-bold text-xs">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Title *"
              required
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="font-jakarta font-bold text-xs">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe your venue *"
              required
              className="min-h-[90px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 py-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="price" className="font-jakarta font-bold text-xs">
              Price per night
            </label>
            <input
              id="price"
              name="price"
              type="text"
              placeholder="Price per night *"
              required
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="guest" className="font-jakarta font-bold text-xs">
              Guests
            </label>
            <input
              id="guest"
              name="guest"
              type="text"
              placeholder="Maximum number of quests *"
              required
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="image" className="font-jakarta font-bold text-xs">
              Images
            </label>
            <input
              id="image"
              name="image"
              type="text"
              placeholder="Image url *"
              required
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>
          <button className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] font-bold">
            ADD IMAGE{" "}
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

          <div className="flex flex-row gap-1.5 items-center">
            <h2 className="font-jakarta text-[15px] font-bold">Rating:</h2>
            <svg
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.86875 14L4.0875 8.82368L0 5.34211L5.4 4.88158L7.5 0L9.6 4.88158L15 5.34211L10.9125 8.82368L12.1312 14L7.5 11.2553L2.86875 14Z"
                fill="#FCFEFF"
                fillOpacity="0.6"
              />
            </svg>
            <svg
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.86875 14L4.0875 8.82368L0 5.34211L5.4 4.88158L7.5 0L9.6 4.88158L15 5.34211L10.9125 8.82368L12.1312 14L7.5 11.2553L2.86875 14Z"
                fill="#FCFEFF"
                fillOpacity="0.6"
              />
            </svg>
            <svg
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.86875 14L4.0875 8.82368L0 5.34211L5.4 4.88158L7.5 0L9.6 4.88158L15 5.34211L10.9125 8.82368L12.1312 14L7.5 11.2553L2.86875 14Z"
                fill="#FCFEFF"
                fillOpacity="0.6"
              />
            </svg>
            <svg
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.86875 14L4.0875 8.82368L0 5.34211L5.4 4.88158L7.5 0L9.6 4.88158L15 5.34211L10.9125 8.82368L12.1312 14L7.5 11.2553L2.86875 14Z"
                fill="#FCFEFF"
                fillOpacity="0.6"
              />
            </svg>
            <svg
              width="15"
              height="14"
              viewBox="0 0 15 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.86875 14L4.0875 8.82368L0 5.34211L5.4 4.88158L7.5 0L9.6 4.88158L15 5.34211L10.9125 8.82368L12.1312 14L7.5 11.2553L2.86875 14Z"
                fill="#FCFEFF"
                fillOpacity="0.6"
              />
            </svg>
          </div>

          <div className="flex flex-col bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 py-2 text-[14px]">
            <h2 className="font-jakarta text-[15px] font-bold pb-2">
              Ameneties:
            </h2>

            {/* WIFI */}
            <div className="flex flex-row justify-between">
              <p className="">Wifi available</p>
              <div className="w-7 h-3.5 relative">
                <div className="w-7 h-3.5 left-0 top-0 absolute bg-white/60 rounded-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[5.10px]" />
                <div className="w-3 h-3 left-[1px] top-[1px] absolute bg-zinc-800 rounded-full" />
              </div>
            </div>

            {/* PARKING */}
            <div className="flex flex-row justify-between">
              <p className="">Parking available</p>
              <div className="w-7 h-3.5 relative">
                <div className="w-7 h-3.5 left-0 top-0 absolute bg-white/60 rounded-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[5.10px]" />
                <div className="w-3 h-3 left-[1px] top-[1px] absolute bg-zinc-800 rounded-full" />
              </div>
            </div>

            {/* BREAKFAST */}
            <div className="flex flex-row justify-between">
              <p className="">Breakfast included</p>
              <div className="w-7 h-3.5 relative">
                <div className="w-7 h-3.5 left-0 top-0 absolute bg-white/60 rounded-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[5.10px]" />
                <div className="w-3 h-3 left-[1px] top-[1px] absolute bg-zinc-800 rounded-full" />
              </div>
            </div>

            {/* PETS */}
            <div className="flex flex-row justify-between">
              <p className="">Pets allowed</p>
              <div className="w-7 h-3.5 relative">
                <div className="w-7 h-3.5 left-0 top-0 absolute bg-white/60 rounded-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[5.10px]" />
                <div className="w-3 h-3 left-[1px] top-[1px] absolute bg-zinc-800 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="address" className="font-jakarta font-bold text-xs">
              Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Address *"
              required
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="zipCode" className="font-jakarta font-bold text-xs">
              Zip code
            </label>
            <input
              id="zipCode"
              name="zipCode"
              type="text"
              placeholder="Zip code *"
              required
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="city" className="font-jakarta font-bold text-xs">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="City *"
              required
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="country" className="font-jakarta font-bold text-xs">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              placeholder="Country *"
              required
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="lat" className="font-jakarta font-bold text-xs">
              Latitude
            </label>
            <input
              id="lat"
              name="lat"
              type="text"
              placeholder="Latitude *"
              required
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          <div className="flex flex-col w-full">
            <label htmlFor="lng" className="font-jakarta font-bold text-xs">
              Longitude
            </label>
            <input
              id="lng"
              name="lng"
              type="text"
              placeholder="Longitude *"
              required
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          {/* Buttons row */}
          <div className="mt-2 flex w-full items-center justify-center gap-[30px]">
            <button
              type="submit"
              disabled={busy}
              className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold disabled:opacity-60">
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
              className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary/60 font-bold">
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
