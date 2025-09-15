"use client";

import { useProfileTabs } from "@/store/useProfileTabs";
import MyBookingsList from "./MyBookingsList";
import MyFavoritesList from "./MyFavoritesList";

type Props = { profileName: string };

export default function ProfileVenuesSection({ profileName }: Props) {
  const { active, setActive } = useProfileTabs();

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

          {/* spacer */}
          <div className="flex-1 bg-secondary rounded-t-[10px]" />
        </div>

        {/* PANEL */}
        <div
          role="tabpanel"
          className={[
            "h-[572px] rounded-bl-[10px] rounded-br-[10px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] flex flex-col",
            active === "bookings" ? "bg-primary/20" : "bg-secondary/20",
          ].join(" ")}>
          {active === "bookings" && (
            <MyBookingsList profileName={profileName} />
          )}
          {active === "favorites" && (
            <MyFavoritesList profileName={profileName} />
          )}
        </div>
      </div>
    </section>
  );
}
