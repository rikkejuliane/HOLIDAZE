"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/utils/api/profiles";
import { updateProfile } from "@/utils/api/profiles";

type Props = {
  open: boolean;
  onClose: () => void;
  profile: Profile;
};

// API defaults  — used when fields are left empty
const DEFAULT_AVATAR_URL =
  "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=400&w=400";
const DEFAULT_AVATAR_ALT = "A blurry multi-colored rainbow background";
const DEFAULT_BANNER_URL =
  "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&h=210&w=1055";
const DEFAULT_BANNER_ALT = "A blurry multi-colored rainbow background";

export default function UpdateProfileModal({ open, onClose, profile }: Props) {
  const router = useRouter();
  const [bio, setBio] = React.useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = React.useState(profile.avatar?.url ?? "");
  const [avatarAlt, setAvatarAlt] = React.useState(profile.avatar?.alt ?? "");
  const [bannerUrl, setBannerUrl] = React.useState(profile.banner?.url ?? "");
  const [bannerAlt, setBannerAlt] = React.useState(profile.banner?.alt ?? "");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar?.url ?? "");
      setAvatarAlt(profile.avatar?.alt ?? "");
      setBannerUrl(profile.banner?.url ?? "");
      setBannerAlt(profile.banner?.alt ?? "");
      setErr(null);
    }
  }, [open, profile]);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);

    try {
      const bioTrim = bio.trim();
      const avatarUrlTrim = avatarUrl.trim();
      const avatarAltTrim = (avatarAlt || "").trim();
      const bannerUrlTrim = bannerUrl.trim();
      const bannerAltTrim = (bannerAlt || "").trim();

      const payload = {
        bio: bioTrim, 
        avatar: {
          url: avatarUrlTrim || DEFAULT_AVATAR_URL,
          alt: avatarUrlTrim ? avatarAltTrim || null : DEFAULT_AVATAR_ALT,
        },
        banner: {
          url: bannerUrlTrim || DEFAULT_BANNER_URL,
          alt: bannerUrlTrim ? bannerAltTrim || null : DEFAULT_BANNER_ALT,
        },
      };

      await updateProfile(profile.name, payload);
      onClose();
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      {/* dialog */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[685px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-secondary p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-5 md:px-30">
        {/* heading */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="font-noto text-[35px] font-bold text-primary">
              Update profile
            </h2>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {/* Avatar URL */}
          <div className="flex flex-col w-full">
            <label htmlFor="avatarUrl" className="font-jakarta font-bold text-xs">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              placeholder="Avatar URL (https://…)"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          {/* Avatar alt */}
          <div className="flex flex-col w-full">
            <label htmlFor="avatarAlt" className="font-jakarta font-bold text-xs">
              Avatar alt
            </label>
            <input
              id="avatarAlt"
              name="avatarAlt"
              type="text"
              placeholder="Avatar alt text"
              value={avatarAlt}
              onChange={(e) => setAvatarAlt(e.target.value)}
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          {/* Banner URL */}
          <div className="flex flex-col w-full">
            <label htmlFor="bannerUrl" className="font-jakarta font-bold text-xs">
              Banner URL
            </label>
            <input
              id="bannerUrl"
              name="bannerUrl"
              type="url"
              placeholder="Banner URL (https://…)"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          {/* Banner alt */}
          <div className="flex flex-col w-full">
            <label htmlFor="bannerAlt" className="font-jakarta font-bold text-xs">
              Banner alt
            </label>
            <input
              id="bannerAlt"
              name="bannerAlt"
              type="text"
              placeholder="Banner alt text"
              value={bannerAlt}
              onChange={(e) => setBannerAlt(e.target.value)}
              className="h-[30px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col w-full">
            <label htmlFor="bio" className="font-jakarta font-bold text-xs">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="min-h-[90px] min-w-0 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 py-2 text-[14px] text-primary placeholder:text-primary placeholder:font-jakarta outline-none"
            />
          </div>

          {err && <p className="text-sm text-red-300">{err}</p>}

          {/* Buttons row */}
          <div className="mt-2 flex w-full items-center justify-center gap-[30px]">
            <button
              type="submit"
              disabled={busy}
              className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold disabled:opacity-60">
              {busy ? "Saving…" : "SAVE CHANGES"}
              <svg
                width="7"
                height="12"
                viewBox="0 0 7 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1 11L6 6L1 1"
                  stroke="#FCFEFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary/60 font-bold">
              CANCEL
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.53478 8.53531L8.60585 1.46424M1.53478 1.46424L8.60585 8.53531"
                  stroke="#FCFEFF"
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
