"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/utils/api/profiles";

type Props = {
  profileName: string;
  initialOn: boolean;
};

/**
 * VenueManagerToggle component.
 *
 * Renders a toggle button to enable/disable venue manager status.
 * When clicked, it shows a confirmation modal before applying the change.
 *
 * Features:
 * - Displays current status (on/off) with a styled toggle switch.
 * - Opens a confirmation modal on click, asking the user to confirm the change.
 * - Calls `updateProfile` API to save the new status.
 * - Handles loading state and error messages.
 * - Refreshes the page to reflect changes after a successful update.
 *
 * @param profileName - The profile name used for the API call.
 * @param initialOn - Initial venue manager status (true/false).
 * @returns A toggle button with confirmation modal functionality.
 */
export default function VenueManagerToggle({ profileName, initialOn }: Props) {
  const [on, setOn] = React.useState<boolean>(initialOn);
  const [open, setOpen] = React.useState(false);
  const [nextValue, setNextValue] = React.useState<boolean>(initialOn);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const router = useRouter();

  function handleToggleClick() {
    if (busy) return;
    const next = !on;
    setNextValue(next);
    setErr(null);
    setOpen(true);
  }

  async function confirmChange() {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      await updateProfile(profileName, { venueManager: nextValue });
      setOn(nextValue);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn’t save your changes.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {/* TOGGLE */}
      <button
        type="button"
        aria-pressed={on}
        aria-label="Toggle venue manager"
        onClick={handleToggleClick}
        disabled={busy}
        className={[
          "relative inline-block w-[29px] h-[15px] rounded-full",
          "shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[5.10px]",
          "transition-colors",
          on ? "bg-primary" : "bg-primary/60",
          busy ? "opacity-60 cursor-not-allowed" : "",
        ].join(" ")}>
        <span
          className={[
            "absolute left-[1px] top-[1px] h-[13px] w-[13px] rounded-full bg-secondary",
            "transition-transform",
            on ? "translate-x-[14px]" : "",
          ].join(" ")}
        />
      </button>

      {/* CONFIRMATION MODAL */}
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* BACKDROP */}
          <button
            aria-label="Close modal"
            onClick={() => !busy && setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[685px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-secondary p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-5 md:px-30">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex-1 text-center">
                <h2 className="font-noto text-[20px] font-bold text-primary">
                  {nextValue
                    ? "Become a venue manager?"
                    : "Stop being a venue manager?"}
                </h2>
              </div>
            </div>
            <p className="text-primary text-[14px] font-jakarta text-center mb-4">
              {nextValue
                ? "Are you sure you want to become a venue manager?"
                : "Are you sure you don’t want to be a venue manager anymore?"}
            </p>
            {err && (
              <p className="text-sm text-red-300 text-center mb-2">{err}</p>
            )}
            <div className="mt-2 flex w-full items-center justify-center gap-[30px]">
              <button
                onClick={confirmChange}
                disabled={busy}
                className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold disabled:opacity-60">
                {busy ? "Saving…" : "YES"}
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
                onClick={() => !busy && setOpen(false)}
                className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary/60 font-bold">
                NO
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
          </div>
        </div>
      )}
    </>
  );
}
