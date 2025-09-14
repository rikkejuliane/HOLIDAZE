"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/utils/auth/session";

export default function LogoutButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        clearSession(); // clears localStorage + token cookie
        router.push("/auth"); // send to auth page (or "/" if you prefer)
        router.refresh(); // refresh RSC so server reads “no token”
      }}
      className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold">
      LOG OUT
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
  );
}
