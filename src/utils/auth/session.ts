export function setTokenCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  document.cookie = "token=; Path=/; Max-Age=0; SameSite=Lax";
}
