"use client";

import PublicVenuesList from "./PublicVenueList";

type Props = {
  profileName: string;
  isVenueManager: boolean;
};

/**
 * PublicProfileVenuesSection component.
 *
 * Renders a single “VENUES” tab shell (to match the site’s tab styling) and
 * either:
 * - the public venues list for the given `profileName`, or
 * - an empty-state message when the user isn’t a venue manager.
 *
 * Connected to:
 * - `PublicVenuesList` — performs the actual fetching/rendering of the profile’s venues.
 * - `PublicProfilePage` (route page) — parent that supplies `profileName` and
 *   `isVenueManager` from server-side profile lookups.
 *
 * Accessibility:
 * - Uses `role="tablist"`, `role="tab"`, and `role="tabpanel"` to convey the
 *   tabbed structure to assistive tech (even though there is only one tab here).
 *
 * @param profileName - The profile slug whose venues should be shown.
 * @param isVenueManager - If `true`, render the venues list; otherwise show an empty state.
 * @returns The public profile “Venues” section.
 */
export default function PublicProfileVenuesSection({
  profileName,
  isVenueManager,
}: Props) {
  return (
    <section className="mt-5 mb-20">
      <div className="flex flex-col mx-auto font-jakarta text-primary max-w-[1055px]">
        <div className="flex h-[55px]" role="tablist" aria-label="Profile tabs">
          <button
            role="tab"
            aria-selected
            type="button"
            className={[
              "w-[90px] sm:w-[185px] rounded-t-[10px] backdrop-blur-[2px] grid place-items-center",
              "bg-primary/9 font-bold",
            ].join(" ")}
          >
            <span className="block">VENUES</span>
          </button>

          {/* SPACER */}
          <div className="flex-1 bg-secondary rounded-t-[10px]" />
        </div>
        <div
          role="tabpanel"
          className={[
            "h-auto md:h-[572px] rounded-bl-[10px] rounded-br-[10px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] flex flex-col",
            "bg-primary/9",
          ].join(" ")}
        >
          {isVenueManager ? (
            <PublicVenuesList profileName={profileName} />
          ) : (
            <div className="p-8 text-primary/80">
              This host hasn’t listed any venues yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
