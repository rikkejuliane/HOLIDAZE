import Image from "next/image";
import type { Profile } from "@/utils/api/profiles";

export default function PublicProfileHeader({ profile }: { profile: Profile }) {
  return (
    <section className="pt-[90px] sm:pt-[70px] text-primary font-jakarta">
      <div className="relative flex flex-col mx-auto max-w-[1055px]">
        {/* Banner */}
        {profile.banner?.url && (
          <Image
            src={profile.banner.url}
            alt={profile.banner.alt || "Profile banner"}
            width={1055}
            height={210}
            unoptimized
            className="object-cover w-[1055px] h-[210px] rounded-tl-[10px] rounded-tr-[10px] brightness-80"
          />
        )}

        {/* Card */}
        <div className="h-[210px] bg-secondary rounded-bl-[10px] rounded-br-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <h1 className="font-bold text-[20px] text-center pt-[65px]">
            {profile.name}
          </h1>
          <p className="text-[15px] text-center pt-[15px]">
            {profile.bio || " "}
          </p>

          <div className="flex flex-row justify-center items-center pt-[20px] sm:pt-[35px] gap-1.5">
            <p className="text-[13px] font-medium text-primary/70">
              {profile.venueManager ? "VENUE MANAGER" : "GUEST"}
            </p>
          </div>
        </div>

        {/* Absolute avatar (read-only) */}
        <div className="absolute top-30 left-1/2 -translate-x-1/2 w-[150px] h-[150px] z-20">
          <div className="relative h-full w-full rounded-full overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.35)]">
            <Image
              src={profile.avatar?.url || "/listingplaceholder.jpg"}
              alt={profile.avatar?.alt || `${profile.name} avatar`}
              width={150}
              height={150}
              unoptimized
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
