"use client";

import { useEffect, useState } from "react";
import { useProfileTabs } from "@/store/useProfileTabs";
import MyBookingsList from "./MyBookingsList";
import MyFavoritesList from "./MyFavoritesList";
import MyVenuesList from "./MyVenuesList";
import CreateVenueModal from "../createVenue/CreateVenueModal";

type Props = {
  profileName: string;
  isVenueManager: boolean;
};

export default function ProfileVenuesSection({
  profileName,
  isVenueManager,
}: Props) {
  const { active, setActive } = useProfileTabs();
  const [createOpen, setCreateOpen] = useState(false); // <-- needed

  // If user turns off venue manager while "venues" is active, bounce back to bookings
  useEffect(() => {
    if (!isVenueManager && active === "venues") setActive("bookings");
  }, [isVenueManager, active, setActive]);

  useEffect(() => {
    function onCreated() {
      setActive("venues");
    }
    window.addEventListener("venues:created", onCreated);
    return () => window.removeEventListener("venues:created", onCreated);
  }, [setActive]);

  return (
    <section className="mt-5 mb-20">
      <div className="flex flex-col mx-auto font-jakarta text-primary max-w-[1055px]">
        {/* TABS */}
        <div className="flex h-[55px]" role="tablist" aria-label="Profile tabs">
          {/* My bookings — fixed bg-primary/20, bold when active */}
          <button
            role="tab"
            aria-selected={active === "bookings"}
            type="button"
            onClick={() => setActive("bookings")}
            className={[
              "w-[185px] rounded-t-[10px] backdrop-blur-[2px] grid place-items-center",
              "bg-primary/20",
              active === "bookings" ? "font-bold" : "",
            ].join(" ")}>
            MY BOOKINGS
          </button>

          {/* Favorites — fixed bg-secondary/20, bold when active */}
          <button
            role="tab"
            aria-selected={active === "favorites"}
            type="button"
            onClick={() => setActive("favorites")}
            className={[
              "w-[185px] rounded-t-[10px] backdrop-blur-[2px] grid place-items-center",
              "bg-secondary/20",
              active === "favorites" ? "font-bold" : "",
            ].join(" ")}>
            FAVORITES
          </button>

          {/* My venues — only visible if venue manager; fixed bg-primary/9, bold when active */}
          {isVenueManager && (
            <button
              role="tab"
              aria-selected={active === "venues"}
              type="button"
              onClick={() => setActive("venues")}
              className={[
                "w-[185px] rounded-t-[10px] backdrop-blur-[2px] grid place-items-center",
                "bg-primary/9",
                active === "venues" ? "font-bold" : "",
              ].join(" ")}>
              MY VENUES
            </button>
          )}

          {/* spacer (relative) + create button inside it */}
          <div className="flex-1 bg-secondary rounded-t-[10px]">
            <div className="relative">
              {isVenueManager && (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="absolute right-4 top-4 w-[175px] font-jakarta text-[13px] md:text-[15px] font-bold flex flex-row gap-1.5 items-center"
                  aria-haspopup="dialog">
                  CREATE NEW VENUE
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
              )}
            </div>
          </div>
        </div>

        {/* PANEL */}
        <div
          role="tabpanel"
          className={[
            "h-[572px] rounded-bl-[10px] rounded-br-[10px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] flex flex-col",
            active === "bookings"
              ? "bg-primary/20"
              : active === "favorites"
              ? "bg-secondary/20"
              : "bg-primary/9",
          ].join(" ")}>
          {active === "bookings" && (
            <MyBookingsList profileName={profileName} />
          )}

          {active === "favorites" && (
            <MyFavoritesList profileName={profileName} />
          )}

          {active === "venues" && isVenueManager && <MyVenuesList />}
        </div>
      </div>

      {/* Modal lives at the bottom so it can overlay everything */}
      <CreateVenueModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </section>
  );
}
