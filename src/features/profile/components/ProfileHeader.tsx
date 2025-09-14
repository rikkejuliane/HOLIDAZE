// src/features/profile/components/ProfileHeader.tsx
import Image from "next/image";
import type { Profile } from "@/utils/api/profiles";
import LogoutButton from "@/features/auth/components/LogoutButton";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <section className="pt-[70px] text-primary font-jakarta">
      <div className="relative flex flex-col mx-auto max-w-[1055px]">
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

        <div className="h-[210px] bg-secondary rounded-bl-[10px] rounded-br-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <h1 className="font-bold text-[20px] text-center pt-[65px]">
            {profile.name}
          </h1>
          <p className="text-[15px] text-center pt-[15px]">
            {profile.bio || " "}
          </p>
          <div className="flex flex-row justify-center items-center pt-[35px] gap-1.5">
            <p className="text-[15px] font-bold">VENUE MANAGER</p>
            <button
              type="button"
              aria-pressed={!!profile.venueManager}
              className="relative inline-block w-[29px] h-[15px] rounded-full bg-primary/60 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[5.10px]">
              <span className="absolute left-[1px] top-[1px] h-[13px] w-[13px] rounded-full bg-secondary transition-transform" />
            </button>
          </div>
        </div>
        <Image
          src={profile.avatar?.url || "/listingplaceholder.jpg"}
          alt={profile.avatar?.alt || `${profile.name} avatar`}
          width={150}
          height={150}
          unoptimized
          className="absolute top-30 left-1/2 -translate-x-1/2 w-[150px] h-[150px] rounded-full object-cover"
        />

        <div className="absolute top-2 right-2">
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}
