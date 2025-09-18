// src/utils/auth/session.ts
export function setTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `token=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

// NEW: set username cookie so the server can read it on /profile
export function setUsernameCookie(username: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `username=${encodeURIComponent(
    username
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function setSession(token: string, username?: string) {
  localStorage.setItem("token", token);
  if (username) {
    localStorage.setItem("username", username);
    setUsernameCookie(username); 
  }
  setTokenCookie(token);
  window.dispatchEvent(new CustomEvent("auth:changed"));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "username=; Path=/; Max-Age=0; SameSite=Lax";
  window.dispatchEvent(new CustomEvent("auth:changed"));
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
