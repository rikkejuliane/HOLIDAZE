"use client";

import { useProfileTabs } from "@/store/useProfileTabs";
import MyBookingsList from "./MyBookingsList";

type Props = { profileName: string };

export default function ProfileVenuesSection({ profileName }: Props) {
  const { active, setActive } = useProfileTabs();

  return (
    <section className="mt-5 mb-20">
      <div className="flex flex-col mx-auto font-jakarta text-primary max-w-[1055px]">
        {/* TABS */}
        <div className="flex h-[55px]">
          {/* My bookings */}
          <button
            type="button"
            onClick={() => setActive("bookings")}
            className={[
              "w-[185px] rounded-t-[10px] backdrop-blur-[2px] grid place-items-center",
              active === "bookings"
                ? "bg-primary/20 font-bold"
                : "bg-secondary/60",
            ].join(" ")}>
            MY BOOKINGS
          </button>

          {/* Favorites */}
          <button
            type="button"
            onClick={() => setActive("favorites")}
            className={[
              "w-[185px] rounded-t-[10px] backdrop-blur-[2px] grid place-items-center",
              active === "favorites"
                ? "bg-pink-500/20 font-bold"
                : "bg-secondary/60",
            ].join(" ")}>
            FAVORITES
          </button>

          {/* spacer */}
          <div className="flex-1 bg-secondary rounded-t-[10px]" />
        </div>

        {/* PANEL (color can change per tab) */}
        <div
          className={[
            "h-[572px] rounded-bl-[10px] rounded-br-[10px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] flex flex-col",
            active === "favorites" ? "bg-pink-500/10" : "bg-primary/20",
          ].join(" ")}>
          {active === "bookings" && (
            <MyBookingsList profileName={profileName} />
          )}

          {active === "favorites" && (
            <div className="p-8 text-primary/80">Favorites coming next…</div>
          )}
        </div>
      </div>
    </section>
  );
}
