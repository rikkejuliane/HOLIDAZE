// src/features/profile/components/ProfileVenues/MyBookingsList.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBookingsByProfile, deleteBookingById } from "@/utils/api/bookings";
import type { Booking } from "@/types/bookings";
import type { ListMeta } from "@/types/venue";
import ListingsPagination from "@/features/home/components/ListingsPagination";

type Props = { profileName: string };

type BookingWithVenue = Booking & {
  venue?: {
    id?: string;
    name?: string;
    media?: { url: string; alt?: string }[];
    location?: { city?: string; country?: string };
  };
};

type ApiListMeta = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function fmtDMY2(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}

function formatRange(fromISO: string, toISO: string) {
  const from = new Date(fromISO);
  const to = new Date(toISO);

  if (sameDay(from, to)) return fmtDMY2(from);
  // want an en dash? replace '-' with '–'
  return `${fmtDMY2(from)} - ${fmtDMY2(to)}`;
}

export default function BookingsList({ profileName }: Props) {
  const PAGE_SIZE = 6;

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<BookingWithVenue[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<BookingWithVenue | null>(null);
  const [modalBusy, setModalBusy] = useState(false);
  const [modalErr, setModalErr] = useState<string | null>(null);

  // keep page=1 when user changes
  useEffect(() => {
    setPage(1);
  }, [profileName]);

  // central fetch we can reuse after deletes
  const fetchData = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const { data, meta } = await getBookingsByProfile(profileName, {
          page: p,
          limit: PAGE_SIZE,
          sort: "created",
          sortOrder: "desc",
        });

        setRows((data ?? []) as BookingWithVenue[]);

        const m = meta as ApiListMeta;
        setMeta({
          currentPage: m.currentPage,
          pageCount: m.pageCount,
          totalCount: m.totalCount,
          isFirstPage: m.isFirstPage,
          isLastPage: m.isLastPage,
          previousPage: m.previousPage,
          nextPage: m.nextPage,
        });
      } catch {
        setError("Couldn’t load bookings");
      } finally {
        setLoading(false);
      }
    },
    [profileName]
  );

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  // open modal
  function askDelete(b: BookingWithVenue) {
    if (modalBusy) return;
    setTarget(b);
    setModalErr(null);
    setModalOpen(true);
  }

  // confirm delete from modal
  async function confirmDelete() {
    if (!target) return;
    setModalBusy(true);
    setModalErr(null);
    try {
      await deleteBookingById(target.id);

      const isOnlyRow = rows.length === 1;
      const isLastPage = meta?.currentPage === meta?.pageCount;

      if (isOnlyRow && isLastPage && page > 1) {
        setPage(page - 1);
      } else {
        await fetchData(page);
      }

      setModalOpen(false);
      setTarget(null);
    } catch (e) {
      setModalErr(
        e instanceof Error ? e.message : "Couldn’t delete the booking."
      );
    } finally {
      setModalBusy(false);
    }
  }

  if (loading)
    return <div className="p-8 text-primary/70">Loading bookings…</div>;
  if (error) return <div className="p-8 text-red-400">{error}</div>;
  if (!rows.length)
    return (
      <div className="p-8 text-primary/80">
        You don’t have any bookings yet.
      </div>
    );

  // compute once per render for "past" comparison (midnight today)
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex flex-col">
        {rows.map((b) => {
          const v = b.venue;
          const img = v?.media?.[0]?.url ?? "/listingplaceholder.jpg";
          const alt = v?.media?.[0]?.alt ?? "Listing photo";
          const loc = [v?.location?.city, v?.location?.country]
            .filter(Boolean)
            .join(", ");
          const dateLabel = formatRange(b.dateFrom, b.dateTo);
          const isPast = new Date(b.dateTo) < todayStart;

          const textMuted = isPast ? "text-primary/60" : "";
          const iconMuted = isPast ? "opacity-60" : "";

          return (
            <div key={b.id} className="flex flex-col">
              <div className="flex flex-row mt-2.5 justify-between text-lg px-[40px]">
                {/* left side */}
                <div
                  className={`flex items-center gap-7.5 flex-1 min-w-0 ${textMuted}`}>
                  <Image
                    src={img}
                    alt={alt}
                    width={60}
                    height={60}
                    unoptimized
                    className={`w-15 h-15 rounded-full object-cover shrink-0 ${
                      isPast ? "grayscale opacity-60" : ""
                    }`}
                  />

                  {/* simple 3-column block (Title, Location, Dates) */}
                  <div className="flex items-center gap-7.5 flex-1 min-w-0">
                    <p className="font-bold w-[25%] min-w-0 truncate">
                      {v?.name ?? "Untitled venue"}
                    </p>
                    <p className="text-primary/70 w-[25%] min-w-0 truncate">
                      {loc || "—"}
                    </p>
                    {/* Date range column (fixed width, truncates if too long) */}
                    <p className="font-bold w-[210px] shrink-0 truncate">
                      {dateLabel}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-7.5 shrink-0 ${iconMuted}`}>
                  {v?.id && (
                    <Link href={`/venues/${v.id}`} aria-label="View venue">
                      {/* eye SVG */}
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
                  )}

                  <button
                    onClick={() => askDelete(b)}
                    aria-label="Delete booking"
                    disabled={modalBusy}
                    className="disabled:opacity-50">
                    {/* trash SVG */}
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

      {/* pagination */}
      <div className="pb-2">
        <ListingsPagination
          meta={meta}
          onPageChange={setPage}
          isLoading={loading}
        />
      </div>

      {/* confirmation modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100]">
          {/* backdrop */}
          <button
            aria-label="Close modal"
            onClick={() => !modalBusy && setModalOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-[685px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-secondary p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] px-5 md:px-30">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex-1 text-center">
                <h2
                  id="delete-title"
                  className="font-noto text-[20px] font-bold text-primary">
                  Delete this booking?
                </h2>
              </div>
            </div>

            <p className="text-primary text-[14px] font-jakarta text-center mb-4">
              Are you sure you want to delete your booking
              {target?.venue?.name ? (
                <>
                  {" "}
                  for <span className="font-bold">{target.venue.name}</span>
                </>
              ) : null}
              ?
            </p>

            {modalErr && (
              <p className="text-sm text-red-300 text-center mb-2">
                {modalErr}
              </p>
            )}

            <div className="mt-2 flex w-full items-center justify-center gap-[30px]">
              <button
                onClick={confirmDelete}
                disabled={modalBusy}
                className="flex flex-row items-center gap-1.5 font-jakarta text-[15px] text-primary font-bold disabled:opacity-60">
                {modalBusy ? "Deleting…" : "YES"}
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
                onClick={() => !modalBusy && setModalOpen(false)}
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
