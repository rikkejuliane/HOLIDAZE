export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function getString(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}
function getObject(obj: Record<string, unknown>, key: string) {
  const v = obj[key];
  return isRecord(v) ? v : undefined;
}

/** Normalizes different API shapes into { token, name } */
export function extractAuthFields(res: unknown): { token?: string; name?: string } {
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
