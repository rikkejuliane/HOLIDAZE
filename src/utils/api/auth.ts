import { API_AUTH_LOGIN, API_AUTH_REGISTER } from "@/utils/api/constants";

type LoginArgs = { email: string; password: string };
type RegisterArgs = { name: string; email: string; password: string };

/**
 * Authenticate a user with the API.
 *
 * Sends a JSON `POST` to `API_AUTH_LOGIN` with `{ email, password }`.
 * Resolves with the parsed response body (e.g., tokens/user), per your API.
 *
 * Errors:
 * - Throws `Error` when the response is not OK.
 * - Picks the most useful message from `json.message`, `json.errors[0].message`,
 *   otherwise falls back to a generic message.
 *
 * @param params - Login credentials.
 * @param params.email - User email.
 * @param params.password - User password.
 * @returns Parsed JSON from the API on success.
 */
export async function login({ email, password }: LoginArgs) {
  const res = await fetch(API_AUTH_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json?.message ||
        json?.errors?.[0]?.message ||
        "Login failed. Please check your credentials."
    );
  }
  return json;
}

/**
 * Create a new user account.
 *
 * Sends a JSON `POST` to `API_AUTH_REGISTER` with `{ name, email, password }`.
 * Resolves with the parsed response body (per your API). Does **not** auto-login.
 *
 * Errors:
 * - Throws `Error` when the response is not OK.
 * - Uses `json.errors[0].message`, `json.error`, or `json.message` if present.
 *
 * @param params - Registration payload.
 * @param params.name - Display name.
 * @param params.email - Email address.
 * @param params.password - Password.
 * @returns Parsed JSON from the API on success.
 */
export async function register({ name, email, password }: RegisterArgs) {
  const res = await fetch(API_AUTH_REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg =
      json?.errors?.[0]?.message ||
      json?.error ||
      json?.message ||
      "Registration failed";
    throw new Error(msg);
  }
  return json;
}
