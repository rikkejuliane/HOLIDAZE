import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileHeader from "@/features/profile/components/ProfileHeader";
import { getProfileByName } from "@/utils/api/profiles";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const username = cookieStore.get("username")?.value;

  if (!token) redirect("/auth");
  if (!username) redirect("/auth");

  const profile = await getProfileByName(username, token, {
    bookings: true,
    venues: true,
  });

  return (
    <>
      <ProfileHeader profile={profile} />
    </>
  );
}
