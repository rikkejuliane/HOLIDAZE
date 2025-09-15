"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ListingsPagination from "@/features/home/components/ListingsPagination";
import { buildMeta } from "@/utils/venues/pagination";
import { useFavoritesForUser, type FavoritesState } from "@/store/favorites";
import { API_HOLIDAZE } from "@/utils/api/constants";
import { apiFetch } from "@/utils/api/client";
import { buildHeaders } from "@/utils/api/headers";
import type { StoreApi } from "zustand";
import type { UseBoundStore } from "zustand/react";

type VenueLite = {
  id: string;
  name?: string;
  media?: { url: string; alt?: string }[];
  location?: { city?: string; country?: string };
};

type Props = { profileName: string };

type PersistHelpers<T> = {
  hasHydrated: () => boolean;
  onFinishHydration: (cb: (state: T) => void) => () => void;
};

type PersistedStore<T> = UseBoundStore<StoreApi<T>> & {
  persist?: Partial<PersistHelpers<T>>;
};

async function getVenueById(id: string): Promise<VenueLite> {
  const res = await apiFetch<{ data: VenueLite }>(
    `${API_HOLIDAZE}/venues/${id}`,
    {
      method: "GET",
      headers: buildHeaders({ apiKey: true }),
    }
  );
  return res.data;
}

export default function MyFavoritesList({ profileName }: Props) {
  const PAGE_SIZE = 6;

  // normalize username to match your stored key "favorites-store:rikkejuliane"
  const userKey = profileName.trim().toLowerCase();

  // per-user favorites store
  const useFavs = useFavoritesForUser(userKey);
  const favoriteIdsMap = useFavs((s: FavoritesState) => s.favoriteIds);
  const removeFav = useFavs((s: FavoritesState) => s.remove);

  // typed hydration guard (no any)
  const favsStore = useFavs as PersistedStore<FavoritesState>;
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    const has = favsStore.persist?.hasHydrated?.() ?? false;
    setHydrated(has);
    const unsub = favsStore.persist?.onFinishHydration?.(() =>
      setHydrated(true)
    );
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [favsStore]);

  const ids = useMemo<string[]>(
    () => Object.keys(favoriteIdsMap ?? {}),
    [favoriteIdsMap]
  );

  const [page, setPage] = useState<number>(1);
  const [rows, setRows] = useState<VenueLite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<ReturnType<typeof buildMeta> | null>(null);

  // modal
  const [open, setOpen] = useState<boolean>(false);
  const [target, setTarget] = useState<VenueLite | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  // keep page valid when total changes
  useEffect(() => {
    const total = ids.length;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > pageCount) setPage(pageCount);
  }, [ids, page]);

  // fetch details for current page of IDs
  useEffect(() => {
    if (!hydrated) return; // wait until favorites store has hydrated

    let alive = true;
    setLoading(true);
    setError(null);

    const start = (page - 1) * PAGE_SIZE;
    const currentIds = ids.slice(start, start + PAGE_SIZE);

    Promise.all(currentIds.map((id) => getVenueById(id)))
      .then((venues) => {
        if (!alive) return;
        setRows(venues);
        setMeta(buildMeta(ids.length, page, PAGE_SIZE));
      })
      .catch(() => {
        if (alive) setError("Couldn’t load favorites");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [hydrated, ids, page]);

  function askRemove(v: VenueLite) {
    if (busy) return;
    setTarget(v);
    setErr(null);
    setOpen(true);
  }

  async function confirmRemove() {
    if (!target) return;
    setBusy(true);
    setErr(null);
    try {
      removeFav(target.id); // updates ids -> effect refetches
      const newTotal = Math.max(0, ids.length - 1);
      const newPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      if (page > newPages) setPage(newPages);
      setOpen(false);
      setTarget(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn’t remove favorite.");
    } finally {
      setBusy(false);
    }
  }

  // Loading & empty states
  if (!hydrated)
    return <div className="p-8 text-primary/70">Loading favorites…</div>;
  if (loading)
    return <div className="p-8 text-primary/70">Loading favorites…</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!ids.length)
    return (
      <div className="p-8 text-primary/80">
        You don’t have any favorites yet.
      </div>
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex flex-col">
        {rows.map((v) => {
          const img = v.media?.[0]?.url ?? "/listingplaceholder.jpg";
          const alt = v.media?.[0]?.alt ?? "Listing photo";
          const loc = [v.location?.city, v.location?.country]
            .filter(Boolean)
            .join(", ");

          return (
            <div key={v.id} className="flex flex-col">
              <div className="flex flex-row mt-2.5 justify-between text-lg px-[40px]">
                <div className="flex items-center gap-7.5 flex-1 min-w-0">
                  <Image
                    src={img}
                    alt={alt}
                    width={60}
                    height={60}
                    unoptimized
                    className="w-15 h-15 rounded-full object-cover shrink-0"
                  />
                  <div className="flex items-center gap-7.5 flex-1 min-w-0">
                    <p className="font-bold w-[25%] min-w-0 truncate">
                      {v.name ?? "Untitled venue"}
                    </p>
                    <p className="text-primary/70 w-[25%] min-w-0 truncate">
                      {loc || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-7.5 shrink-0">
                  <Link href={`/venues/${v.id}`} aria-label="View venue">
                    <svg
                      width="29"
                      height="20"
                      viewBox="0 0 29 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M29 10C29 9.40167 28.6792 9.01 28.0377 8.22333C25.69 5.35 20.5116 0 14.5 0C8.48837 0 3.31003 5.35 0.962258 8.22333C0.320753 9.01 0 9.40167 0 10C0 10.5983 0.320753 10.99 0.962258 11.7767C3.31003 14.65 8.48837 20 14.5 20C20.5116 20 25.69 14.65 28.0377 11.7767C28.6792 10.99 29 10.5983 29 10ZM14.5 15C15.8155 15 17.0771 14.4732 18.0073 13.5355C18.9375 12.5979 19.4601 11.3261 19.4601 10C19.4601 8.67392 18.9375 7.40215 18.0073 6.46447C17.0771 5.52678 15.8155 5 14.5 5C13.1845 5 11.9229 5.52678 10.9927 6.46447C10.0625 7.40215 9.53991 8.67392 9.53991 10C9.53991 11.3261 10.0625 12.5979 10.9927 13.5355C11.9229 14.4732 13.1845 15 14.5 15Z"
                        fill="#FCFEFF"
                        fillOpacity="0.7"
                      />
                    </svg>
                  </Link>

                  <button
                    onClick={() => askRemove(v)}
                    aria-label="Remove favorite"
                    disabled={busy}
                    className="disabled:opacity-50">
                    <svg
                      width="15"
                      height="20"
                      viewBox="0 0 15 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M1.07143 17.7778C1.07143 19 2.03571 20 3.21429 20H11.7857C12.9643 20 13.9286 19 13.9286 17.7778V4.44444H1.07143V17.7778ZM15 1.11111H11.25L10.1786 0H4.82143L3.75 1.11111H0V3.33333H15V1.11111Z"
                        fill="#E63946"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <span className="border-b border-primary/30 w-full pt-2.5"></span>
            </div>
          );
        })}
      </div>

      <div className="pb-2">
        <ListingsPagination
          meta={meta}
          onPageChange={setPage}
          isLoading={loading}
        />
      </div>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <button
            aria-label="Close modal"
            onClick={() => !busy && setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-fav-title"
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-[685px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-secondary p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-5 md:px-30">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex-1 text-center">
                <h2
                  id="remove-fav-title"
                  className="font-noto text-[20px] font-bold text-primary">
                  Remove from favorites?
                </h2>
              </div>
            </div>
            <p className="text-primary text-[14px] font-jakarta text-center mb-4">
              Remove{" "}
              <span className="font-bold">{target?.name ?? "this venue"}</span>{" "}
              from your favorites?
            </p>
            {err && (
              <p className="text-sm text-red-300 text-center mb-2">{err}</p>
            )}
            <div className="mt-2 flex w-full items-center justify-center gap-[30px]">
              <button
                onClick={confirmRemove}
                disabled={busy}
                className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold disabled:opacity-60">
                {busy ? "Removing…" : "YES"}
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
                onClick={() => !busy && setOpen(false)}
                className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary/60 font-bold">
                NO
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
          </div>
        </div>
      )}
    </div>
  );
}
