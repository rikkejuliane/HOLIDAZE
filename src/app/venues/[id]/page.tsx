import { notFound } from "next/navigation";
import type { Venue } from "@/types/venue";
import { getVenueById } from "@/utils/api/venues";
import Link from "next/link";
import Image from "next/image";
import MediaMapPanel from "@/features/singleVenue/components/MediaMapPanel";
import {
  extractCoordsFromVenue,
  extractCityCountry,
} from "@/utils/map/helpers";
import BookingPanel from "@/features/singleVenue/components/BookingPanel";
import FavoriteHeartWithToast from "@/components/FavoriteHeartWithToast";
import { cookies } from "next/headers";

type Props = { params: Promise<{ id: string }> };

/**
 * Venue detail page.
 *
 * - Fetches a venue by `id` (with `owner` and `bookings`) and renders details.
 * - Calls `notFound()` if the venue isn’t available.
 * - Reads the auth cookie to toggle logged-in UI (e.g., link to host profile).
 * - Renders media/map, meta info, amenities, host card, and the booking panel.
 *
 * @param params - Route params containing the venue `id`.
 * @returns Server component rendering the venue page, or triggers `notFound()`.
 */
export default async function VenueDetailPage({ params }: Props) {
  const { id } = await params;
  let venue: Venue | null = null;
  try {
    venue = await getVenueById(id, { owner: true, bookings: true });
  } catch {}
  if (!venue) return notFound();
  const coords = extractCoordsFromVenue(venue);
  const { city, country } = extractCityCountry(venue);
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get("token")?.value);
  const rawUsername = cookieStore.get("username")?.value;
  const viewerName = rawUsername ? decodeURIComponent(rawUsername) : null;
  const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();
  const isMyVenue =
    !!viewerName && norm(viewerName) === norm(venue.owner?.name);
  return (
    <section className="mt-[90px] sm:mt-[70px] mb-20">
      <div className="flex flex-col xl:flex-row gap-[45px] items-stretch md:items-center">
        <div className="w-full md:w-auto static xl:sticky top-0 xl:self-start">
          {/* MAP AND IMAGES */}
          <MediaMapPanel
            media={venue.media}
            owner={{ email: venue.owner?.email }}
            location={{
              lat: coords ? coords[1] : null,
              lng: coords ? coords[0] : null,
              city,
              country,
            }}
          />
        </div>
        {/* LISTINGS INFO */}
        <div className="flex flex-col mx-auto md:mx-0 pt-[10px] px-3">
          <div className="flex flex-row justify-between max-w-[590px] mb-[25px]">
            <Link
              href="/"
              className="flex flex-row gap-1.5 items-center font-jakarta font-bold text-primary">
              <svg
                width="7"
                height="12"
                viewBox="0 0 7 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 1L1 6L6 11"
                  stroke="#FCFEFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              BACK
            </Link>
            <FavoriteHeartWithToast venueId={venue.id} />
          </div>
          {/* Title */}
          <h1 className="max-w-[590px] font-noto text-primary font-bold text-[35px] leading-tight mb-4">
            {venue.name}
          </h1>
          <p className="max-w-[590px] font-jakarta text-primary text-sm leading-tight mb-4">
            {venue.description}
          </p>
          {/* META: location | guests | rating */}
          <div className="flex flex-wrap items-center gap-2 text-primary/60 text-base sm:text-[17px] font-light font-jakarta leading-tight mb-4">
            <span>
              {[venue.location?.city, venue.location?.country]
                .filter(Boolean)
                .join(", ") || "—"}
            </span>
            <span aria-hidden>|</span>
            <span>{venue.maxGuests ?? "—"} guests</span>
            <span aria-hidden>|</span>
            <span className="inline-flex items-center gap-1">
              <svg
                width="12"
                height="11"
                viewBox="0 0 12 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.295 11L3.27 6.93289L0 4.19737L4.32 3.83553L6 0L7.68 3.83553L12 4.19737L8.73 6.93289L9.705 11L6 8.84342L2.295 11Z"
                  fill="#FCFEFF"
                  fillOpacity="0.6"
                />
              </svg>
              <span>
                {typeof venue.rating === "number"
                  ? venue.rating.toFixed(1)
                  : "—"}
              </span>
            </span>
          </div>
          {/* AMENITIES AND HOST */}
          <div className="flex flex-col sm:flex-row gap-[15px]">
            <div className="w-full sm:w-[199px] h-36 bg-secondary rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-4 flex flex-col font-jakarta text-primary text-xs">
              <h2 className="font-bold pb-3">AMENITIES</h2>
              {/* WIFI */}
              <div className="flex flex-row justify-between pb-[3px]">
                <div className="flex flex-row items-center gap-2.5">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg
                      width="18"
                      height="14"
                      viewBox="0 0 18 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12.3539 9.53603C11.4624 8.74366 10.3112 8.30597 9.11848 8.30597C7.92577 8.30597 6.77453 8.74366 5.88308 9.53603M14.9392 6.95068C13.3604 5.47436 11.2796 4.65308 9.11805 4.65308C6.95651 4.65308 4.87571 5.47436 3.29688 6.95068"
                        stroke="#FCFEFF"
                        strokeOpacity="0.6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M17.238 4.0951C15.0034 2.10167 12.1135 1 9.11899 1C6.12446 1 3.23459 2.10167 1 4.0951"
                        stroke="#FCFEFF"
                        strokeOpacity="0.6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9.11881 14.0001C8.85079 14.0001 8.58879 13.9206 8.36594 13.7717C8.14309 13.6228 7.96939 13.4111 7.86683 13.1635C7.76426 12.9159 7.73742 12.6434 7.78971 12.3806C7.842 12.1177 7.97106 11.8762 8.16058 11.6867C8.3501 11.4972 8.59157 11.3681 8.85444 11.3158C9.11731 11.2635 9.38978 11.2904 9.6374 11.3929C9.88502 11.4955 10.0967 11.6692 10.2456 11.8921C10.3945 12.1149 10.474 12.3769 10.474 12.6449C10.474 13.0043 10.3312 13.349 10.077 13.6032C9.8229 13.8573 9.47822 14.0001 9.11881 14.0001Z"
                        fill="#FCFEFF"
                        fillOpacity="0.6"
                      />
                    </svg>
                  </div>
                  <p className="">WIFI:</p>
                </div>
                <p>{venue.meta?.wifi ? "YES" : "NO"}</p>
              </div>
              {/* PARKING */}
              <div className="flex flex-row justify-between pb-[3px]">
                <div className="flex flex-row items-center gap-2.5">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg
                      width="9"
                      height="13"
                      viewBox="0 0 9 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4.98462 5.77778H2.76923V2.88889H4.98462C5.35184 2.88889 5.70402 3.04107 5.96369 3.31196C6.22335 3.58284 6.36923 3.95024 6.36923 4.33333C6.36923 4.71642 6.22335 5.08382 5.96369 5.35471C5.70402 5.6256 5.35184 5.77778 4.98462 5.77778ZM4.84615 0H0V13H2.76923V8.66667H4.84615C5.94782 8.66667 7.00437 8.21012 7.78337 7.39746C8.56236 6.58481 9 5.4826 9 4.33333C9 1.93556 7.13769 0 4.84615 0Z"
                        fill="#FCFEFF"
                        fillOpacity="0.6"
                      />
                    </svg>
                  </div>
                  <p className="">PARKING:</p>
                </div>
                <p>{venue.meta?.parking ? "YES" : "NO"}</p>
              </div>
              {/* BREAKFAST */}
              <div className="flex flex-row justify-between pb-[3px]">
                <div className="flex flex-row items-center gap-2.5">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg
                      width="12"
                      height="13"
                      viewBox="0 0 12 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4.82123 0.0501443C4.88231 0.080603 4.93593 0.124295 4.97822 0.178081C5.02052 0.231867 5.05044 0.29441 5.06585 0.361216C5.08246 0.434573 5.53846 2.39757 5.53846 3.71429C5.53846 4.59643 5.13046 5.38293 4.49538 5.89271C4.26462 6.07843 4.15385 6.28086 4.15385 6.44986V6.90114C4.15385 6.92281 4.15508 6.94324 4.15754 6.96243C4.18892 7.19271 4.30246 8.04793 4.40862 8.93471C4.51292 9.80479 4.61538 10.7538 4.61538 11.1429C4.61538 11.6354 4.42088 12.1078 4.07466 12.4561C3.72844 12.8043 3.25886 13 2.76923 13C2.2796 13 1.81002 12.8043 1.4638 12.4561C1.11758 12.1078 0.923077 11.6354 0.923077 11.1429C0.923077 10.7529 1.02554 9.80571 1.12985 8.93471C1.236 8.04793 1.34954 7.19271 1.38092 6.96243L1.38462 6.90114V6.44986C1.38462 6.28086 1.27385 6.07843 1.04308 5.89271C0.717676 5.63178 0.454918 5.30042 0.274334 4.92328C0.0937496 4.54614 -1.82087e-05 4.1329 2.65222e-09 3.71429C2.65222e-09 2.40222 0.452308 0.44943 0.472615 0.362144C0.496612 0.258924 0.554667 0.166929 0.637312 0.101161C0.719957 0.0353938 0.822315 -0.000264687 0.927692 1.47931e-06C1.18615 1.47931e-06 1.39569 0.210787 1.39569 0.470787V3.25464C1.39205 3.31735 1.40123 3.38014 1.42265 3.43914C1.44408 3.49814 1.4773 3.5521 1.52026 3.59768C1.56322 3.64326 1.61501 3.6795 1.67244 3.70416C1.72987 3.72883 1.79171 3.74139 1.85415 3.74107C1.91659 3.74075 1.9783 3.72756 2.03548 3.70232C2.09266 3.67707 2.14408 3.64031 2.18658 3.59429C2.22908 3.54827 2.26176 3.49398 2.28259 3.43476C2.30342 3.37555 2.31196 3.31267 2.30769 3.25V0.464287C2.30769 0.341151 2.35632 0.223058 2.44287 0.135988C2.52943 0.0489171 2.64682 1.47931e-06 2.76923 1.47931e-06C2.89164 1.47931e-06 3.00903 0.0489171 3.09559 0.135988C3.18214 0.223058 3.23077 0.341151 3.23077 0.464287V3.27414C3.23334 3.39605 3.28395 3.51193 3.37145 3.5963C3.45896 3.68068 3.5762 3.72662 3.69738 3.72404C3.81857 3.72145 3.93377 3.67054 4.01764 3.58252C4.10151 3.49449 4.14719 3.37655 4.14462 3.25464V0.46893C4.14462 0.209859 4.35323 1.47931e-06 4.61169 1.47931e-06C4.632 1.47931e-06 4.72246 1.49783e-06 4.82123 0.0501443ZM6.92308 4.17857C6.92308 3.07035 7.36071 2.00751 8.13971 1.22388C8.91871 0.440242 9.97526 1.47931e-06 11.0769 1.47931e-06C11.1993 1.47931e-06 11.3167 0.0489171 11.4033 0.135988C11.4898 0.223058 11.5385 0.341151 11.5385 0.464287V6.01064L11.556 6.175C11.6294 6.86803 11.6999 7.56137 11.7674 8.255C11.8809 9.42129 12 10.7287 12 11.1429C12 11.6354 11.8055 12.1078 11.4593 12.4561C11.1131 12.8043 10.6435 13 10.1538 13C9.66422 13 9.19464 12.8043 8.84842 12.4561C8.5022 12.1078 8.30769 11.6354 8.30769 11.1429C8.30769 10.7287 8.42677 9.42129 8.54031 8.255C8.59846 7.6635 8.65662 7.09707 8.7 6.67736L8.71846 6.5H7.84615C7.60134 6.5 7.36655 6.40217 7.19344 6.22803C7.02033 6.05389 6.92308 5.8177 6.92308 5.57143V4.17857Z"
                        fill="#FCFEFF"
                        fillOpacity="0.6"
                      />
                    </svg>
                  </div>
                  <p className="">BREAKFAST:</p>
                </div>
                <p>{venue.meta?.breakfast ? "YES" : "NO"}</p>
              </div>
              {/* PETS */}
              <div className="flex flex-row justify-between pb-[3px]">
                <div className="flex flex-row items-center gap-2.5">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg
                      width="14"
                      height="13"
                      viewBox="0 0 14 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4.45541 0.0108552C5.27805 -0.111818 6.14948 0.819058 6.40045 2.10352C6.65143 3.38077 6.19828 4.52091 5.37565 4.6508C4.55999 4.78069 3.68158 3.84982 3.42364 2.56535C3.16569 1.2881 3.63278 0.147961 4.45541 0.0108552ZM9.44001 0.0108552C10.2696 0.147961 10.7297 1.2881 10.4857 2.56535C10.2208 3.84982 9.34939 4.78069 8.52675 4.6508C7.69715 4.52091 7.244 3.38077 7.50195 2.10352C7.75292 0.819058 8.62435 -0.111818 9.44001 0.0108552ZM0.725676 3.33026C1.52042 2.97667 2.601 3.6189 3.16569 4.7374C3.69552 5.87754 3.51426 7.07541 2.72649 7.429C1.93871 7.78259 0.865105 7.14757 0.314359 6.01465C-0.236387 4.88172 -0.041186 3.67663 0.725676 3.33026ZM13.2743 3.33026C14.0412 3.67663 14.2364 4.88172 13.6856 6.01465C13.1349 7.14757 12.0613 7.78259 11.2735 7.429C10.4857 7.07541 10.3045 5.87754 10.8343 4.7374C11.399 3.6189 12.4796 2.97667 13.2743 3.33026ZM12.1101 11.1092C12.138 11.7875 11.636 12.538 11.0365 12.8194C9.78859 13.4111 8.31064 12.1844 6.92331 12.1844C5.53599 12.1844 4.0441 13.4617 2.81712 12.8194C2.11997 12.4658 1.63894 11.5277 1.72957 10.7484C1.85505 9.6732 3.10295 9.09592 3.84192 8.30936C4.8249 7.29189 5.52205 5.37963 6.92331 5.37963C8.31761 5.37963 9.05658 7.26303 9.99773 8.30936C10.7716 9.18973 12.0613 9.93298 12.1101 11.1092Z"
                        fill="#FCFEFF"
                        fillOpacity="0.6"
                      />
                    </svg>
                  </div>
                  <p className="">PETS:</p>
                </div>
                <p>{venue.meta?.pets ? "YES" : "NO"}</p>
              </div>
            </div>
            {/* HOST */}
            <div className="w-full sm:w-[199px] h-36 bg-secondary rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-4 flex flex-col font-jakarta text-primary text-xs">
              <h2 className="font-bold pb-4">HOST</h2>
              <div className="flex flex-row gap-1.5 items-center">
                {isLoggedIn && venue.owner?.name ? (
                  <Link
                    href={
                      isMyVenue
                        ? "/profile"
                        : `/profile/${encodeURIComponent(venue.owner.name)}`
                    }
                    className="flex flex-row gap-1.5 items-center hover:underline"
                    aria-label={`View ${venue.owner.name}'s profile`}>
                    <Image
                      src={
                        venue.owner?.avatar?.url || "/placeholder-avatar.jpg"
                      }
                      alt={venue.owner?.avatar?.alt || "Host profile picture"}
                      width={36}
                      height={36}
                      unoptimized
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <p className="font-bold">{venue.owner?.name}</p>
                  </Link>
                ) : (
                  <div className="relative group flex flex-col gap-0.5">
                    <div className="flex flex-row gap-1.5 items-center cursor-not-allowed opacity-80">
                      <Image
                        src={
                          venue.owner?.avatar?.url || "/placeholder-avatar.jpg"
                        }
                        alt={venue.owner?.avatar?.alt || "Host profile picture"}
                        width={36}
                        height={36}
                        unoptimized
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <p className="font-bold">
                        {venue.owner?.name ?? "Unknown Host"}
                      </p>
                    </div>
                    {/* Tooltip */}
                    <div
                      role="tooltip"
                      className="hidden md:block pointer-events-none absolute -top-2 left-0 translate-y-[-2px] whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-[11px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Log in to view host profile
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] font-medium pt-[12px]">
                {venue.owner?.email ?? "No email available"}
              </p>
              {/* Mobile inline hint */}
              <span className="lg:hidden text-[11px] text-primary/70 mt-1">
                Log in to view host profile
              </span>
            </div>
          </div>
          {/* BOOKING & SUMMARY */}
          <div className="w-full sm:max-w-[413px] h-[330px] sm:h-[300px] bg-secondary rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] mt-4 px-4 flex flex-col">
            <form>
              <div
                id="booking-panel"
                className="flex flex-col pt-2.5 font-jakarta">
                <BookingPanel
                  venueId={venue.id}
                  venueName={venue.name}
                  venueImg={{
                    url: venue.media?.[0]?.url,
                    alt: venue.media?.[0]?.alt ?? undefined,
                  }}
                  nightlyPrice={venue.price}
                  maxGuests={venue.maxGuests}
                  existingBookings={venue.bookings ?? []}
                  ownerName={venue.owner?.name ?? ""}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
