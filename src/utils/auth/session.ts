/**
 * Sets the `token` cookie for 7 days (Path=/, SameSite=Lax).
 *
 * @param token - JWT/access token string to store in a cookie.
 */
export function setTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `token=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

/**
 * Sets the `username` cookie for 7 days (Path=/, SameSite=Lax).
 *
 * @param username - The signed-in user's display/handle name.
 */
export function setUsernameCookie(username: string) {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `username=${encodeURIComponent(
    username
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

/**
 * Persists an authenticated session in the browser.
 *
 * Side effects:
 * - Saves `token` (and optional `username`) to `localStorage`.
 * - Writes `token` and `username` cookies for server-side reads.
 * - Dispatches a `window` event: `"auth:changed"`.
 *
 * @param token - Access token to store.
 * @param username - Optional username to store and expose via cookie.
 */
export function setSession(token: string, username?: string) {
  localStorage.setItem("token", token);
  if (username) {
    localStorage.setItem("username", username);
    setUsernameCookie(username);
  }
  setTokenCookie(token);
  window.dispatchEvent(new CustomEvent("auth:changed"));
}

/**
 * Clears all client auth state.
 *
 * Side effects:
 * - Removes `token` and `username` from `localStorage`.
 * - Deletes `token` and `username` cookies.
 * - Dispatches a `window` event: `"auth:changed"`.
 */
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "username=; Path=/; Max-Age=0; SameSite=Lax";
  window.dispatchEvent(new CustomEvent("auth:changed"));
}

/**
 * Reads the access token from `localStorage` (browser only).
 *
 * @returns The token string, or `null` if not available or on the server.
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Indicates whether a user appears logged in (token present).
 *
 * @returns `true` if an access token exists; otherwise `false`.
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Reads the username from `localStorage` (browser only).
 *
 * @returns The username string, or `null` if not available or on the server.
 */
export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("username");
}
