"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/utils/auth/session";

/**
 * Logout button.
 *
 * - Clears the current session.
 * - Redirects to `/auth` and refreshes the router.
 *
 * @returns A styled logout button element.
 */
export default function LogoutButton() {
  const router = useRouter();
  function handleLogout() {
    clearSession();
    router.push("/auth");
    router.refresh();
  }
  return (
    <button
      onClick={handleLogout}
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
