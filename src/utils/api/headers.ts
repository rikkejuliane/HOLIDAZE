export function buildHeaders({
  apiKey = true,
  authToken = false,
  contentType = false,
}: {
  apiKey?: boolean;
  authToken?: boolean;
  contentType?: boolean;
} = {}) {
  const h = new Headers();

  if (apiKey) {
    const key = process.env.NEXT_PUBLIC_NOROFF_API_KEY;
    if (key) h.set("X-Noroff-API-Key", key);
  }
  if (authToken && typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) h.set("Authorization", `Bearer ${token}`);
  }
  if (contentType) h.set("Content-Type", "application/json");

  return h;
}

export function buildServerHeaders({
  token,
  apiKey = true,
  contentType = false,
}: {
  token?: string; 
  apiKey?: boolean;
  contentType?: boolean;
} = {}) {
  const h = new Headers();

  if (apiKey) {
    const key =
      process.env.NEXT_PUBLIC_NOROFF_API_KEY ?? process.env.NOROFF_API_KEY;
    if (key) h.set("X-Noroff-API-Key", key);
  }
  if (token) h.set("Authorization", `Bearer ${token}`);
  if (contentType) h.set("Content-Type", "application/json");

  return h;
}
