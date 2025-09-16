import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileHeader from "@/features/profile/components/profileHeader/ProfileHeader";
import { getProfileByName } from "@/utils/api/profiles";
import ProfileVenuesSection from "@/features/profile/components/ProfileVenues/ProfileVenuesSection";

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
      <ProfileVenuesSection
        profileName={profile?.name ?? username}
        isVenueManager={Boolean(profile?.venueManager)}
      />
    </>
  );
}
