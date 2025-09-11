export function setTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `token=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function setSession(token: string, username?: string) {
  localStorage.setItem("token", token);
  if (username) localStorage.setItem("username", username);
  setTokenCookie(token);
  window.dispatchEvent(new CustomEvent("auth:changed"));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
  window.dispatchEvent(new CustomEvent("auth:changed"));
}
