// src/features/profile/components/UpdateProfileModal.tsx
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
      const payload = {
        bio: bio.trim(),
        avatar: avatarUrl
          ? { url: avatarUrl.trim(), alt: (avatarAlt || "").trim() || null }
          : null,
        banner: bannerUrl
          ? { url: bannerUrl.trim(), alt: (bannerAlt || "").trim() || null }
          : null,
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* dialog */}
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-secondary p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-jakarta text-lg font-bold text-primary">
            Update Profile
          </h2>
          <button
            onClick={onClose}
            className="text-sm text-primary/80 hover:text-primary"
            aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-primary/70 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-md bg-primary/20 px-3 py-2 text-primary outline-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary/70 mb-1">
                Avatar URL
              </label>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-md bg-primary/20 px-3 py-2 text-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary/70 mb-1">
                Avatar alt
              </label>
              <input
                value={avatarAlt}
                onChange={(e) => setAvatarAlt(e.target.value)}
                className="w-full rounded-md bg-primary/20 px-3 py-2 text-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary/70 mb-1">
                Banner URL
              </label>
              <input
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-md bg-primary/20 px-3 py-2 text-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary/70 mb-1">
                Banner alt
              </label>
              <input
                value={bannerAlt}
                onChange={(e) => setBannerAlt(e.target.value)}
                className="w-full rounded-md bg-primary/20 px-3 py-2 text-primary outline-none"
              />
            </div>
          </div>

          {err && <p className="text-sm text-red-300">{err}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-sm font-jakarta text-primary/80 hover:text-primary">
              Cancel
            </button>

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
          </div>
        </form>
      </div>
    </div>
  );
}
