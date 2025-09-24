"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether a user is currently authenticated.
 *
 * Checks for:
 * - A `token` cookie in `document.cookie`.
 * - An `auth_token` entry in `localStorage`.
 *
 * If either is present, `loggedIn` is set to `true`.
 * On error or if neither is present, `loggedIn` is `false`.
 *
 * @returns An object with a single property:
 * - `loggedIn`: boolean indicating authentication status.
 */
export function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    try {
      const cookie = typeof document !== "undefined" ? document.cookie : "";
      const hasTokenCookie = /(?:^|; )token=/.test(cookie);
      const lsToken =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      setLoggedIn(Boolean(hasTokenCookie || lsToken));
    } catch {
      setLoggedIn(false);
    }
  }, []);
  return { loggedIn };
}
