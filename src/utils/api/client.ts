// src/utils/api/client.ts
import { API_BASE } from "./constants";
import { buildHeaders } from "./headers";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  info?: unknown;
  constructor(message: string, status: number, info?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.info = info;
  }
}

/**
 * Small fetch wrapper that:
 * - Resolves relative paths against `API_BASE`.
 * - Adds default headers (API key by default; no auth token for GET).
 * - Forces `cache: "no-store"` and parses JSON automatically.
 * - Throws {@link ApiError} with `status` and parsed server payload on failure.
 *
 * @template T - Expected response shape.
 * @param pathOrUrl - Relative API path or absolute URL.
 * @param init - Fetch options; `method` is typed to common HTTP verbs.
 * @returns Parsed JSON typed as `T`.
 * @throws {@link ApiError} when `res.ok` is false.
 */
export async function apiFetch<T>(
  pathOrUrl: string,
  init: RequestInit & { method?: HttpMethod } = {}
): Promise<T> {
  const isAbsolute = /^https?:\/\//i.test(pathOrUrl);
  const url = isAbsolute
    ? pathOrUrl
    : `${API_BASE}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
  const headers = buildHeaders({
    apiKey: true,
    authToken: false,
    contentType: false,
  });
  const mergedHeaders = new Headers(headers);
  if (init.headers) {
    new Headers(init.headers).forEach((v, k) => mergedHeaders.set(k, v));
  }
  const res = await fetch(url, {
    ...init,
    headers: mergedHeaders,
    cache: "no-store",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(
      data?.message ?? `Request failed: ${res.status}`,
      res.status,
      data
    );
  }
  return data as T;
}
