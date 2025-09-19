"use client";

import { useEffect, useState } from "react";
import type { Venue } from "@/types/venue";
import { useProfileTabs } from "@/store/useProfileTabs";
import MyBookingsList from "./MyBookingsList";
import MyFavoritesList from "./MyFavoritesList";
import MyVenuesList from "./MyVenuesList";
import CreateVenueModal from "../createVenue/CreateVenueModal";
import EditVenueModal from "./EditVenueModal";

type Props = {
  profileName: string;
  isVenueManager: boolean;
};

export default function ProfileVenuesSection({
  profileName,
  isVenueManager,
}: Props) {
  const { active, setActive } = useProfileTabs();
  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Venue | null>(null);

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

  // OPEN Edit modal when MyVenuesList emits "venues:edit"
  useEffect(() => {
    function onEdit(e: Event) {
      const ve = e as CustomEvent<Venue>;
      setEditTarget(ve.detail ?? null);
      setEditOpen(true);
    }
    window.addEventListener("venues:edit", onEdit);
    return () => window.removeEventListener("venues:edit", onEdit);
  }, []);

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
              "w-[100px] sm:w-[185px] rounded-t-[10px] backdrop-blur-[2px] grid place-items-center",
              "bg-primary/20",
              active === "bookings" ? "font-bold" : "",
            ].join(" ")}>
            {/* mobile: "BOOKINGS" */}
            <span className="block sm:hidden">BOOKINGS</span>

            {/* tablet+ (≥sm): "MY BOOKINGS" */}
            <span className="hidden sm:block">MY BOOKINGS</span>
          </button>

          {/* Favorites — fixed bg-secondary/20, bold when active */}
          <button
            role="tab"
            aria-selected={active === "favorites"}
            aria-label="Favorites"
            type="button"
            onClick={() => setActive("favorites")}
            className={[
              "w-[60px] md:w-[185px] rounded-t-[10px] backdrop-blur-[2px] grid place-items-center",
              "bg-secondary/20",
              active === "favorites" ? "font-bold" : "",
            ].join(" ")}>
            {/* mobile: heart icon */}
            <svg
              className="block md:hidden"
              width="16"
              height="14"
              viewBox="0 0 16 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 14L6.84 12.9929C2.72 9.42997 0 7.07248 0 4.19619C0 1.83869 1.936 0 4.4 0C5.792 0 7.128 0.617984 8 1.58692C8.872 0.617984 10.208 0 11.6 0C14.064 0 16 1.83869 16 4.19619C16 7.07248 13.28 9.42997 9.16 12.9929L8 14Z"
                fill="#FCFEFF"
              />
            </svg>

            {/* desktop: text */}
            <span className="hidden md:inline">FAVORITES</span>
          </button>

          {/* My venues — only visible if venue manager; fixed bg-primary/9, bold when active */}
          {isVenueManager && (
            <button
              role="tab"
              aria-selected={active === "venues"}
              type="button"
              onClick={() => setActive("venues")}
              className={[
                "w-[90px] sm:w-[185px] rounded-t-[10px] backdrop-blur-[2px] grid place-items-center",
                "bg-primary/9",
                active === "venues" ? "font-bold" : "",
              ].join(" ")}>
              {/* mobile: "VENUES" */}
              <span className="block sm:hidden">VENUES</span>

              {/* tablet+ (≥sm): "MY VENUES" */}
              <span className="hidden sm:block">MY VENUES</span>
            </button>
          )}

          {/* spacer (relative) + create button inside it */}
          <div className="flex-1 bg-secondary rounded-t-[10px]">
            <div className="relative">
              {isVenueManager && (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  aria-haspopup="dialog"
                  className="absolute right-1 sm:right-4 top-4 w-[40px] md:w-[175px] font-jakarta text-[13px] md:text-[15px] font-bold flex flex-row gap-1.5 items-center justify-center">
                  {/* mobile: only plus icon */}
                  <svg
                    className="block md:hidden"
                    width="16"
                    height="16"
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

                  {/* desktop: text + plus icon */}
                  <span className="hidden md:flex items-center gap-1.5">
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
                  </span>
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

          {active === "venues" && isVenueManager && (
            <MyVenuesList profileName={profileName} />
          )}
        </div>
      </div>

      {/* Modal lives at the bottom so it can overlay everything */}
      <CreateVenueModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <EditVenueModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditTarget(null);
        }}
        venue={editTarget}
      />
    </section>
  );
}
