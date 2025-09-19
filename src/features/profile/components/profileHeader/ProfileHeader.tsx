import Image from "next/image";
import type { Profile } from "@/utils/api/profiles";
import LogoutButton from "@/features/auth/components/LogoutButton";
import UpdateProfileButton from "./UpdateProfileButton";
import VenueManagerToggle from "./VenueManagerToggle";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <section className="pt-[90px] sm:pt-[70px] text-primary font-jakarta">
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
            <VenueManagerToggle
              profileName={profile.name}
              initialOn={!!profile.venueManager}
            />
          </div>
        </div>

        <UpdateProfileButton profile={profile} />

        <div className="absolute top-2 right-2">
          <LogoutButton />
        </div>
      </div>
    </section>
  );
}
