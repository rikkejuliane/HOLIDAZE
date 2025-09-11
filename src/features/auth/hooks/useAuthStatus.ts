"use client";

import { useEffect, useState } from "react";

/**
 * Minimal client-side auth check.
 * Returns true if a token-like value is found in cookies or localStorage.
 * Works with your existing setTokenCookie() approach.
 */
export function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const cookie = typeof document !== "undefined" ? document.cookie : "";
      const hasTokenCookie = /(?:^|; )token=/.test(cookie); // adjust if your cookie name differs
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
