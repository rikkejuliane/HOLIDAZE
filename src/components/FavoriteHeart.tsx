"use client";

import * as React from "react";
import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus";
import { useFavoritesForUser, type FavoritesState } from "@/store/favorites";

type Props = {
  venueId: string;
  className?: string;
  username?: string;
};

/**
 * Heart (favorite) button for a venue.
 *
 * - If logged in: toggles favorite state via the user-scoped favorites store and shows a short toast.
 * - If logged out: shows a tooltip and a toast prompting the user to log in.
 * - Resolves the username from `props.username` or falls back to the `username` cookie (defaults to "guest").
 * - Uses a mounted flag to avoid hydration mismatch before client state is ready.
 * - Accessible labels/titles reflect the current action (favorite / unfavorite / log in to favorite).
 *
 * @param venueId   - The venue id to toggle as favorite.
 * @param className - Optional wrapper classes to position/size the control.
 * @param username  - Optional explicit username to scope favorites (overrides cookie).
 *
 * @returns The favorite heart control with tooltip/toast behavior.
 */
export default function FavoriteHeart({
  venueId,
  className,
  username: usernameProp,
}: Props) {
  const { loggedIn } = useAuthStatus();
  const [mounted, setMounted] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const authedTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const loggedOutTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [username, setUsername] = React.useState<string>(usernameProp ?? "");
  React.useEffect(() => {
    setMounted(true);
    if (usernameProp) {
      setUsername(usernameProp);
      return;
    }
    const cookieVal = (() => {
      if (typeof document === "undefined") return "";
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("username="));
      return match ? decodeURIComponent(match.split("=")[1] || "") : "";
    })();
    setUsername(cookieVal || "guest");
  }, [usernameProp]);
  const useFavs = useFavoritesForUser(username || "guest");
  const isFav = useFavs((s: FavoritesState) => s.isFav(venueId));
  const toggle = useFavs((s: FavoritesState) => s.toggle);
  const handleClickAuthed = () => {
    const wasFav = isFav;
    toggle(venueId);
    setNotice(
      wasFav
        ? "Removed from favorites."
        : "This venue is added to your favorites!"
    );
    if (authedTimeoutRef.current) clearTimeout(authedTimeoutRef.current);
    authedTimeoutRef.current = setTimeout(() => setNotice(""), 3000);
  };
  const handleClickLoggedOut = () => {
    setNotice("Log in to favorite this venue");
    if (loggedOutTimeoutRef.current) clearTimeout(loggedOutTimeoutRef.current);
    loggedOutTimeoutRef.current = setTimeout(() => setNotice(""), 2200);
  };
  const active = mounted && loggedIn && isFav;
  const commonProps = {
    width: 16,
    height: 14,
    viewBox: "0 0 16 14",
    xmlns: "http://www.w3.org/2000/svg",
    role: "img",
    "aria-label": active
      ? "Unfavorite venue"
      : loggedIn
      ? "Favorite venue"
      : "Log in to favorite",
  } as const;
  return (
    <>
      <div
        className={["relative inline-block", className]
          .filter(Boolean)
          .join(" ")}>
        {loggedIn ? (
          <button
            type="button"
            onClick={handleClickAuthed}
            aria-pressed={active}
            title={active ? "Remove from favorites" : "Add to favorites"}>
            <svg {...commonProps} fill="none">
              <path
                d="M8 14L6.84 12.9929C2.72 9.42997 0 7.07248 0 4.19619C0 1.83869 1.936 0 4.4 0C5.792 0 7.128 0.617984 8 1.58692C8.872 0.617984 10.208 0 11.6 0C14.064 0 16 1.83869 16 4.19619C16 7.07248 13.28 9.42997 9.16 12.9929L8 14Z"
                fill={active ? "#E63946" : "#FCFEFF"}
              />
            </svg>
          </button>
        ) : (
          <div className="group relative">
            <button
              type="button"
              onClick={handleClickLoggedOut}
              aria-label="Log in to favorite"
              title="Log in to favorite this venue"
              className="cursor-pointer">
              <svg {...commonProps} fill="none">
                <path
                  d="M8 14L6.84 12.9929C2.72 9.42997 0 7.07248 0 4.19619C0 1.83869 1.936 0 4.4 0C5.792 0 7.128 0.617984 8 1.58692C8.872 0.617984 10.208 0 11.6 0C14.064 0 16 1.83869 16 4.19619C16 7.07248 13.28 9.42997 9.16 12.9929L8 14Z"
                  fill="#FCFEFF"
                  fillOpacity={0.5}
                />
              </svg>
            </button>
            {/* Tooltip */}
            <div
              role="tooltip"
              className="
                pointer-events-none
                absolute -top-6 right-0
                hidden md:block
                whitespace-nowrap rounded-md bg-black/70 px-2 py-1
                text-[11px] text-primary opacity-0
                transition-opacity
                group-hover:opacity-100
              ">
              Log in to favorite this venue
            </div>
          </div>
        )}
      </div>
      {/* Toast */}
      {notice && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-secondary text-primary font-jakarta px-4 py-2 rounded z-50">
          {notice}
        </div>
      )}
    </>
  );
}
