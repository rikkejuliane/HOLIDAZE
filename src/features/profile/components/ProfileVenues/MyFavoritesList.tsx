"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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

/**
 * Fetches a lightweight Venue by id (name, media, location).
 *
 * Connected to:
 * - apiFetch(`${API_HOLIDAZE}/venues/${id}`) with buildHeaders({ apiKey: true })
 *
 * Behavior:
 * - Returns the venue payload (`VenueLite`) on success.
 * - Throws on network/API error; caller handles errors (including 404).
 *
 * @param id - Venue id to fetch.
 * @returns VenueLite
 */
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

/**
 * MyFavoritesList — paginated list of the signed-in user's favorite venues.
 *
 * Connected to:
 * - useFavoritesForUser(userKey) — reads and mutates favorites in a persisted zustand store.
 * - ListingsPagination — page navigation UI.
 * - getVenueById(id) — fetches details for each favorite id on the current page.
 * - createPortal — confirmation dialog rendered to <body>.
 *
 * Behavior:
 * - Waits for the favorites store to hydrate before rendering (client-only).
 * - Paginates favorite *ids* (PAGE_SIZE = 6), then fetches their VenueLite data in parallel.
 * - If an id returns 404, it is removed from the favorites store automatically.
 * - Shows empty, loading, and error states.
 * - Provides a modal to confirm removing a favorite; after removal, adjusts pagination if the last item on the last page is removed.
 *
 * Props:
 * - profileName: used to key the per-user favorites store.
 */
export default function MyFavoritesList({ profileName }: Props) {
  const PAGE_SIZE = 6;
  const userKey = profileName.trim().toLowerCase();
  const useFavs = useFavoritesForUser(userKey);
  const favoriteIdsMap = useFavs((s: FavoritesState) => s.favoriteIds);
  const removeFav = useFavs((s: FavoritesState) => s.remove);
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
  const [open, setOpen] = useState<boolean>(false);
  const [target, setTarget] = useState<VenueLite | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const total = ids.length;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > pageCount) setPage(pageCount);
  }, [ids, page]);
  useEffect(() => {
    if (!hydrated) return;
    let alive = true;
    setLoading(true);
    setError(null);
    const start = (page - 1) * PAGE_SIZE;
    const currentIds = ids.slice(start, start + PAGE_SIZE);
    Promise.allSettled(currentIds.map((id) => getVenueById(id)))
      .then((results) => {
        if (!alive) return;
        const ok: VenueLite[] = [];
        let removedCount = 0;
        results.forEach((res, idx) => {
          const id = currentIds[idx];
          if (res.status === "fulfilled" && res.value) {
            ok.push(res.value);
          } else {
            const reason: unknown = (res as PromiseRejectedResult).reason;
            let status: number | undefined;
            if (typeof reason === "object" && reason !== null) {
              type MaybeStatus = {
                status?: number;
                response?: { status?: number };
                cause?: { status?: number };
                data?: { status?: number };
              };
              const r = reason as MaybeStatus;
              status =
                r.status ??
                r.response?.status ??
                r.cause?.status ??
                r.data?.status;
            }
            if (status === 404) {
              removedCount += 1;
              removeFav(id);
            }
          }
        });
        setRows(ok);
        const newTotal = Math.max(0, ids.length - removedCount);
        setMeta(buildMeta(newTotal, page, PAGE_SIZE));
        if (ok.length === 0 && currentIds.length > 0) {
          setError("Couldn’t load favorites");
        }
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
  }, [hydrated, ids, page, removeFav]);

  /**
   * Opens the confirmation dialog to remove a venue from favorites.
   *
   * - Skips if a previous removal is still in progress (`busy`).
   * - Stores the target venue and clears any prior modal error.
   *
   * @param v - The favorite venue the user wants to remove.
   */
  function askRemove(v: VenueLite) {
    if (busy) return;
    setTarget(v);
    setErr(null);
    setOpen(true);
  }

  /**
   * Confirms and removes the selected venue from the favorites store.
   *
   * Connected to: useFavoritesForUser(userKey).remove(id)
   *
   * Behavior:
   * - Removes the target id from the store immediately.
   * - Recalculates total favorites and, if necessary, navigates to the previous page
   *   when the last item on the last page is removed.
   * - Closes the modal on success; shows an error in the modal on failure.
   */
  async function confirmRemove() {
    if (!target) return;
    setBusy(true);
    setErr(null);
    try {
      removeFav(target.id);
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
              <div className="flex flex-row mt-2.5 justify-between text-lg px-[20px] md:px-[40px]">
                <div className="flex flex-col sm:flex-row md:items-center gap-3 md:gap-7.5 flex-1 min-w-0">
                  <Image
                    src={img}
                    alt={alt}
                    width={60}
                    height={60}
                    unoptimized
                    className="w-15 h-15 rounded-full object-cover shrink-0"
                  />
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-7.5 flex-1 min-w-0">
                    <p className="font-bold w-[70%] md:w-[25%] min-w-0 truncate">
                      {v.name ?? "Untitled venue"}
                    </p>
                    <p className="text-primary/70 w-[70%] md:w-[25%] min-w-0 truncate">
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
                        d="M29 10C29 9.40167 28.6792 9.01 28.0377 8.22333C25.69 5.35 20.5116 0 14.5 0C8.48837 0 3.31003 5.35 0.962258 8.22333C0.320753 9.01 0 9.40167 0 10C0 10.5983 0.320753 10.99 0.962258 11.7767C3.31003 14.65 8.48837 20 14.5 20C20.5116 20 25.69 14.65 28.0377 11.7767C28.6792 10.99 29 10.5983 29 10.5983ZM14.5 15C15.8155 15 17.0771 14.4732 18.0073 13.5355C18.9375 12.5979 19.4601 11.3261 19.4601 10C19.4601 8.67392 18.9375 7.40215 18.0073 6.46447C17.0771 5.52678 15.8155 5 14.5 5C13.1845 5 11.9229 5.52678 10.9927 6.46447C10.0625 7.40215 9.53991 8.67392 9.53991 10C9.53991 11.3261 10.0625 12.5979 10.9927 13.5355C11.9229 14.4732 13.1845 15 14.5 15Z"
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
      {/* CONFIRMATION MODAL */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[1000]">
            {/* BACKDROP */}
            <button
              aria-label="Close modal"
              onClick={() => !busy && setOpen(false)}
              className="absolute inset-0 bg-black/50"
            />
            <div className="fixed inset-0 grid place-items-center p-4">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="remove-fav-title"
                className="w-[92vw] max-w-[685px] rounded-[10px] bg-secondary shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-5 md:px-30 py-6">
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
                  <span className="font-bold">
                    {target?.name ?? "this venue"}
                  </span>{" "}
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
          </div>,
          document.body
        )}
    </div>
  );
}
