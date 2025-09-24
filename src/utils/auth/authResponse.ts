/**
 * Type guard: checks if a value is a non-null object (`Record<string, unknown>`).
 *
 * @param v - Any unknown value.
 * @returns `true` if `v` is an object and not `null`.
 */
export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Safely reads a string property from a plain object.
 *
 * @param obj - Source object.
 * @param key - Property name to read.
 * @returns The string value if present and of type string; otherwise `undefined`.
 */
function getString(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

/**
 * Safely reads an object property from a plain object.
 *
 * @param obj - Source object.
 * @param key - Property name to read.
 * @returns The value if it is a non-null object; otherwise `undefined`.
 */
function getObject(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return isRecord(v) ? v : undefined;
}

/**
 * Normalizes various auth API response shapes into a common `{ token, name }`.
 * Tries `res.data.accessToken` / `res.accessToken` for the token, and
 * `res.data.name` / `res.name` / `res.profile.name` for the user name.
 *
 * @param res - Raw response from an auth API.
 * @returns An object with optional `token` and `name` fields.
 */
export function extractAuthFields(res: unknown): {
  token?: string;
  name?: string;
} {
  if (!isRecord(res)) return {};
  const data = getObject(res, "data");
  let token = data ? getString(data, "accessToken") : undefined;
  let name = data ? getString(data, "name") : undefined;

  if (!token) token = getString(res, "accessToken");
  if (!name) {
    name = getString(res, "name");
    if (!name) {
      const profile = getObject(res, "profile");
      if (profile) name = getString(profile, "name");
    }
  }
  return { token, name };
}
