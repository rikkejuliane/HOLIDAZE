import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileHeader from "@/features/profile/components/profileHeader/ProfileHeader";
import { getProfileByName } from "@/utils/api/profiles";
import ProfileVenuesSection from "@/features/profile/components/ProfileVenues/ProfileVenuesSection";

/**
 * Profile page for the currently authenticated user.
 *
 * - Reads `token` and `username` cookies to identify the user.
 * - Redirects to `/auth` if either cookie is missing.
 * - Fetches the full profile (with bookings and venues) from the API.
 * - Renders a profile header and the user’s venues section.
 *
 * @returns A server component rendering the authenticated user’s profile page,
 * or triggers a redirect to `/auth` if not authenticated.
 */
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
