// src/features/profile-public/components/PublicProfileVenuesSection.tsx
"use client";

import PublicVenuesList from "./PublicVenueList";

type Props = {
  profileName: string;
  isVenueManager: boolean;
};

export default function PublicProfileVenuesSection({
  profileName,
  isVenueManager,
}: Props) {
  return (
    <section className="mt-5 mb-20">
      <div className="flex flex-col mx-auto font-jakarta text-primary max-w-[1055px]">
        {/* Single 'tab' shell to match your existing look */}
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
            <span className="block sm:hidden">VENUES</span>
            <span className="hidden sm:block">VENUES</span>
          </button>

          {/* spacer */}
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
