"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Venue, ListMeta } from "@/types/venue";
import ListingsPagination from "@/features/home/components/ListingsPagination";
import { getVenuesByProfile } from "@/utils/api/venues";

type Props = { profileName: string };

type ApiListMeta = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

/**
 * PublicVenueList component.
 *
 * Lists a host’s venues with simple pagination (server-paginated).
 *
 * Connected to:
 * - `getVenuesByProfile` — fetches venues for the public profile.
 * - `ListingsPagination` — renders the pagination controls.
 * - `PublicProfileVenuesSection` — parent section that shows this list.
 *
 * @param profileName - The public profile’s slug to fetch venues for.
 * @returns A paginated list of venues (or an empty/loading/error state).
 */
export default function PublicVenuesList({ profileName }: Props) {
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Venue[]>([]);
  const [meta, setMeta] = useState<ListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setPage(1);
  }, [profileName]);
  const fetchData = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);
      try {
        const { data, meta } = await getVenuesByProfile(profileName, {
          page: p,
          limit: PAGE_SIZE,
          sort: "created",
          sortOrder: "desc",
        });
        setRows(data ?? []);
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
        setError("Couldn’t load venues for this host.");
      } finally {
        setLoading(false);
      }
    },
    [profileName]
  );
  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);
  if (loading)
    return <div className="p-8 text-primary/70">Loading venues…</div>;
  if (error) return <div className="p-8 text-imperialRed">{error}</div>;
  if (!rows.length)
    return (
      <div className="p-8 text-primary/80">
        This host hasn’t listed any venues yet.
      </div>
    );
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex flex-col">
        {rows.map((v) => {
          const img = v.media?.[0]?.url ?? "/listingplaceholder.jpg";
          const alt = v.media?.[0]?.alt ?? "Venue photo";
          const loc = [v.location?.city, v.location?.country]
            .filter(Boolean)
            .join(", ");
          return (
            <div key={v.id} className="flex flex-col font-jakarta">
              <div className="flex flex-row mt-2.5 justify-between text-lg px-[20px] md:px-[40px]">
                {/* IMAGE AND COLIMNS */}
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
                    {/* TITLE */}
                    <p className="font-bold w-[70%] md:w-[25%] min-w-0 truncate">
                      {v.name || "Untitled venue"}
                    </p>
                    {/* LOCATION */}
                    <p className="text-primary/70 w-[70%] md:w-[25%] min-w-0 truncate">
                      {loc || "—"}
                    </p>
                    {/* GUESTS */}
                    <div className="w-[210px] shrink-0">
                      <div className="inline-flex items-center gap-2">
                        <span className="">
                          {typeof v.maxGuests === "number" ? v.maxGuests : "—"}
                        </span>
                        <span>guests</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* VIEW */}
                <div className="flex items-center gap-7.5 shrink-0">
                  {v.id && (
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
                  )}
                </div>
              </div>
              <span className="border-b border-primary/30 w-full pt-2.5"></span>
            </div>
          );
        })}
      </div>
      {/* PAGINATION */}
      <div className="pb-2">
        <ListingsPagination
          meta={meta}
          onPageChange={setPage}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
