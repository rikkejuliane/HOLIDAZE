import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth");
  }

  // TODO: fetch profile data with the token
  // Example (if Noroff has a profile endpoint):
  // const res = await fetch("https://v2.api.noroff.dev/auth/profile", {
  //   headers: { Authorization: `Bearer ${token}` },
  //   cache: "no-store",
  // });
  // const profile = await res.json();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <p className="mt-4">You are logged in 🎉</p>
      {/* Replace with profile.data.name etc. when API is wired up */}
    </main>
  );
}
