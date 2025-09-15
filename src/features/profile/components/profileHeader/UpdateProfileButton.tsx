"use client";

import * as React from "react";
import Image from "next/image";
import type { Profile } from "@/utils/api/profiles";
import UpdateProfileModal from "./UpdateProfileModal";

type Props = { profile: Profile };

export default function UpdateProfileButton({ profile }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="absolute top-30 left-1/2 -translate-x-1/2 w-[150px] h-[150px] z-20">
        <div className="group relative h-full w-full rounded-full overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
          <Image
            src={profile.avatar?.url || "/listingplaceholder.jpg"}
            alt={profile.avatar?.alt || `${profile.name} avatar`}
            width={150}
            height={150}
            unoptimized
            className="h-full w-full object-cover"
          />

          <button
            onClick={() => setOpen(true)}
            className="
              hidden md:flex
              absolute inset-0 items-center justify-center
              bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity
              font-jakarta text-[15px] text-primary font-bold
            "
            aria-label="Update profile"
          >
            UPDATE PROFILE
            <svg
              className="ml-1.5"
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
        </div>
      </div>

      <div className="absolute top-2 left-2 md:hidden z-20">
        <button
          onClick={() => setOpen(true)}
          className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold"
        >
          UPDATE PROFILE
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
      </div>

      <UpdateProfileModal open={open} onClose={() => setOpen(false)} profile={profile} />
    </>
  );
}
