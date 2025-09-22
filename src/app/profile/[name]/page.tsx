import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getPublicProfileByName, getProfileByName } from "@/utils/api/profiles";
import PublicProfileHeader from "@/features/profile/components/ProfilePublic/PublicProfileHeader";
import PublicProfileVenuesSection from "@/features/profile/components/ProfilePublic/PublicProfileVenuesSection";

type RouteParams = { name: string };
type Props = { params: Promise<RouteParams> };

/**
 * Type guard that checks whether an unknown error-like value
 * carries a numeric `status` field (e.g., API client errors).
 *
 * @param err - The unknown value to check.
 * @returns True if `err` has a numeric `status` property.
 */
function hasStatus(err: unknown): err is { status: number } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as Record<string, unknown>).status === "number"
  );
}

/**
 * Public profile page.
 *
 * Tries to fetch a public profile by `name`. If that returns an error and a
 * session token cookie exists, it retries with an authenticated request.
 *
 * - On 404 from either path, renders Next.js `notFound()`.
 * - Other errors are rethrown to let Next handle them.
 *
 * The `params` prop is awaited because the route uses an async params pattern.
 * Decodes the `name` from the URL before calling the API.
 *
 * @param params - The route parameters provided by Next.js.
 * @returns A server component rendering the profile page, or triggers `notFound()`.
 */
export default async function PublicProfilePage({ params }: Props) {
  const { name } = await params;
  const nameFromUrl = decodeURIComponent(name);
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
    throw err;
  }
}
