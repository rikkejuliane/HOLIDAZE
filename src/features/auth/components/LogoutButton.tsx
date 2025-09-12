"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/utils/auth/session";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        clearSession();     // clears localStorage + token cookie
        router.push("/auth"); // send to auth page (or "/" if you prefer)
        router.refresh();     // refresh RSC so server reads “no token”
      }}
      className={className}
    >
      Log out
    </button>
  );
}
