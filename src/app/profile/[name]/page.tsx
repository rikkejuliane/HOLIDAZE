import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPublicProfileByName, getProfileByName } from "@/utils/api/profiles";
import PublicProfileHeader from "@/features/profile/components/ProfilePublic/PublicProfileHeader";
import PublicProfileVenuesSection from "@/features/profile/components/ProfilePublic/PublicProfileVenuesSection";

type RouteParams = { name: string };
// In Next 15+ Request APIs, params is a Promise you must await
type Props = { params: Promise<RouteParams> };

// Narrower helper to check for an HTTP-like error with a status code
function hasStatus(err: unknown): err is { status: number } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as Record<string, unknown>).status === "number"
  );
}

export default async function PublicProfilePage({ params }: Props) {
  const { name } = await params;
  const nameFromUrl = decodeURIComponent(name);

  // 1) Try PUBLIC (no auth)
  try {
    const profile = await getPublicProfileByName(nameFromUrl, { venues: true });
    return (
      <>
        <PublicProfileHeader profile={profile} />
        <PublicProfileVenuesSection
          profileName={profile.name}
          isVenueManager={!!profile.venueManager}
        />
      </>
    );
  } catch (err: unknown) {
    // 2) Fallback: if logged in, try AUTHED
    const token = (await cookies()).get("token")?.value;
    if (token) {
      try {
        const profile = await getProfileByName(nameFromUrl, token, {
          venues: true,
        });
        return (
          <>
            <PublicProfileHeader profile={profile} />
            <PublicProfileVenuesSection
              profileName={profile.name}
              isVenueManager={!!profile.venueManager}
            />
          </>
        );
      } catch (err2: unknown) {
        if (hasStatus(err2) && err2.status === 404) return notFound();
        throw err2;
      }
    }

    if (hasStatus(err) && err.status === 404) return notFound();
    throw err; // surface 401/403/500 during dev
  }
}
