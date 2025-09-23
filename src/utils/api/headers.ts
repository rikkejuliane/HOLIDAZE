/**
 * Build default **client-side** headers for API requests.
 *
 * - Adds `X-Noroff-API-Key` from `NEXT_PUBLIC_NOROFF_API_KEY` when `apiKey` is true.
 * - Adds `Authorization: Bearer <token>` from `localStorage.token` when `authToken` is true (browser only).
 * - Adds `Content-Type: application/json` when `contentType` is true.
 *
 * @param options.apiKey       Include public API key header (default: true)
 * @param options.authToken    Include `Authorization` from browser localStorage (default: false)
 * @param options.contentType  Include JSON content type (default: false)
 * @returns A configured {@link Headers} instance.
 */
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

/**
 * Build default **server-side** headers for API requests.
 *
 * - Adds `X-Noroff-API-Key` from `NEXT_PUBLIC_NOROFF_API_KEY` or `NOROFF_API_KEY` when `apiKey` is true.
 * - Adds `Authorization: Bearer <token>` when `token` is provided.
 * - Adds `Content-Type: application/json` when `contentType` is true.
 *
 * @param options.token        Bearer token to include (server context)
 * @param options.apiKey       Include API key header (default: true)
 * @param options.contentType  Include JSON content type (default: false)
 * @returns A configured {@link Headers} instance.
 */
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
