"use client";

import * as React from "react";
import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus";
import { useFavoritesStore } from "@/store/favorites";

type Props = {
  venueId: string;
  className?: string;
};

export default function FavoriteHeart({ venueId, className }: Props) {
  const { loggedIn } = useAuthStatus();
  const [mounted, setMounted] = React.useState(false);
  const [notice, setNotice] = React.useState("");

  const isFav = useFavoritesStore((s) => s.isFav(venueId));
  const toggle = useFavoritesStore((s) => s.toggle);

  React.useEffect(() => setMounted(true), []);

  const handleClick = () => {
    if (!loggedIn) return;
    const wasFav = isFav;
    toggle(venueId);
    const msg = wasFav
      ? "Removed from favorites."
      : "This venue is added to your favorites!";
    setNotice(msg);
    setTimeout(() => setNotice(""), 5000);
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
      {!loggedIn ? (
        <button
          type="button"
          className={className}
          title="Log in to favorite this venue"
          aria-disabled="true"
          disabled>
          <svg {...commonProps} fill="none">
            <path
              d="M8 14L6.84 12.9929C2.72 9.42997 0 7.07248 0 4.19619C0 1.83869 1.936 0 4.4 0C5.792 0 7.128 0.617984 8 1.58692C8.872 0.617984 10.208 0 11.6 0C14.064 0 16 1.83869 16 4.19619C16 7.07248 13.28 9.42997 9.16 12.9929L8 14Z"
              fill="#FCFEFF"
              fillOpacity="0.5"
            />
          </svg>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={className}
          aria-pressed={active}
          title={active ? "Remove from favorites" : "Add to favorites"}>
          <svg {...commonProps} fill="none">
            <path
              d="M8 14L6.84 12.9929C2.72 9.42997 0 7.07248 0 4.19619C0 1.83869 1.936 0 4.4 0C5.792 0 7.128 0.617984 8 1.58692C8.872 0.617984 10.208 0 11.6 0C14.064 0 16 1.83869 16 4.19619C16 7.07248 13.28 9.42997 9.16 12.9929L8 14Z"
              fill={active ? "#E63946" : "#FCFEFF"}
            />
          </svg>
        </button>
      )}
      {notice && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-secondary text-primary text-jakarta px-4 py-2 rounded z-50">
          {notice}
        </div>
      )}
    </>
  );
}
