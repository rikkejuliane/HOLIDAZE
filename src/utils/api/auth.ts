import { API_AUTH_LOGIN, API_AUTH_REGISTER } from "@/utils/api/constants";

type LoginArgs = { email: string; password: string };
type RegisterArgs = { name: string; email: string; password: string };

export async function login({ email, password }: LoginArgs) {
  const res = await fetch(API_AUTH_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || json?.errors?.[0]?.message || "Login failed. Please check your credentials.");
  }
  return json;
}

export async function register({ name, email, password }: RegisterArgs) {
  const res = await fetch(API_AUTH_REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.errors?.[0]?.message || json?.error || json?.message || "Registration failed";
    throw new Error(msg);
  }
  return json;
}
