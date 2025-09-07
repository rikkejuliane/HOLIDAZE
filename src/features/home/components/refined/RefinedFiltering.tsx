"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  parseAmenitiesParam,
  serializeAmenitiesParam,
  type AmenityKey,
} from "@/utils/venues/amenities";

function useOutsideClose(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [onClose]);
  return ref;
}

export default function RefinedFiltering() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---------- SORT (UNCHANGED) ----------
  const sort = searchParams.get("sort"); // "price:asc" | "price:desc" | null
  const [openSort, setOpenSort] = useState(false);
  const sortWrapRef = useOutsideClose(() => setOpenSort(false));

  function applySort(next?: "price:asc" | "price:desc") {
    const sp = new URLSearchParams(searchParams.toString());
    if (next) sp.set("sort", next);
    else sp.delete("sort");
    sp.set("page", "1");
    router.push(`?${sp.toString()}#listings-grid`, { scroll: true });
    setOpenSort(false);
  }

  const isSortActive = sort === "price:asc" || sort === "price:desc";
  const sortLabel =
    sort === "price:asc"
      ? "SORT BY: LOWEST PRICE"
      : sort === "price:desc"
      ? "SORT BY: HIGHEST PRICE"
      : "SORT BY: HIGHEST PRICE"; // default text

  // ---------- AMENITIES (BUFFERED) ----------
  const amenitiesParam = searchParams.get("amenities") ?? "";

  // Parse from the *string* so the dependency is stable
  const amenitiesFromUrl = useMemo(
    () => parseAmenitiesParam(amenitiesParam),
    [amenitiesParam]
  );

  const [openAmenities, setOpenAmenities] = useState(false);
  const amenitiesWrapRef = useOutsideClose(() => setOpenAmenities(false));

  // Local buffer used inside the popdown
  const [pendingAmenities, setPendingAmenities] = useState<Set<AmenityKey>>(
    new Set(amenitiesFromUrl)
  );

  // Sync buffer when the popdown is *closed* and the URL param actually changes
  useEffect(() => {
    if (!openAmenities) {
      setPendingAmenities(new Set(amenitiesFromUrl));
    }
  }, [amenitiesParam, openAmenities, amenitiesFromUrl]);

  const selectedCount = amenitiesFromUrl.length;

  function toggleAmenityBuffered(key: AmenityKey) {
    setPendingAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function clearAmenitiesBuffered(apply = false) {
    // 1) empty the local buffer (uncheck boxes)
    setPendingAmenities(new Set());
  
    // 2) optionally clear the active URL filter too
    if (apply) {
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete("amenities");
      sp.set("page", "1");
      router.push(`?${sp.toString()}#listings-grid`, { scroll: true });
      setOpenAmenities(false);
    }
  }
  

  function applyAmenities() {
    const serialized = serializeAmenitiesParam([...pendingAmenities]);
    const sp = new URLSearchParams(searchParams.toString());
    if (serialized) sp.set("amenities", serialized);
    else sp.delete("amenities");
    sp.set("page", "1");
    router.push(`?${sp.toString()}#listings-grid`, { scroll: true });
    setOpenAmenities(false);
  }

  return (
    <section className="mt-[30px]">
      <div className="flex flex-col items-center font-jakarta text-[15px]">
        <p className="text-primary/60 font-semibold mb-[15px]">
          REFINE YOUR SEARCH
        </p>

        <div className="flex flex-row gap-[15px] text-jakarta">
          {/* Sort button + dropdown (UNCHANGED) */}
          <div className="relative" ref={sortWrapRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={openSort}
              aria-controls="sort-menu"
              onClick={() => setOpenSort((v) => !v)}
              className={`flex flex-row items-center justify-around bg-secondary w-[240px] h-[43px] text-primary ${
                isSortActive ? "opacity-100" : "opacity-70"
              }`}>
              {sortLabel}
              <svg
                width="12"
                height="7"
                viewBox="0 0 12 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden>
                <path
                  d="M1 1L6 6L11 1"
                  stroke="#FCFEFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Popover */}
            {openSort && (
              <div
                id="sort-menu"
                role="menu"
                aria-labelledby="sort-btn"
                className="absolute left-0 top-full mt-2 z-50 w-[240px] border border-white/10 bg-background/80 backdrop-blur-xl p-3 shadow-lg text-primary">
                <button
                  role="menuitemradio"
                  aria-checked={sort === "price:desc"}
                  onClick={() => applySort("price:desc")}
                  className="flex w-full items-center px-2 py-2 hover:bg-white/10 text-left font-jakarta text-sm">
                  HIGHEST PRICE
                </button>
                <button
                  role="menuitemradio"
                  aria-checked={sort === "price:asc"}
                  onClick={() => applySort("price:asc")}
                  className="flex w-full items-center px-2 py-2 hover:bg-white/10 text-left font-jakarta text-sm">
                  LOWEST PRICE
                </button>
                <button
                  role="menuitem"
                  onClick={() => applySort(undefined)}
                  className="mt-1 flex w-full items-center px-2 py-2 hover:bg-white/10 text-left opacity-80 font-jakarta text-sm">
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Amenities button + popdown (buffered, styled like Sort) */}
          <div className="relative" ref={amenitiesWrapRef}>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={openAmenities}
              aria-controls="amenities-menu"
              onClick={() => {
                setPendingAmenities(new Set(amenitiesFromUrl)); // hydrate on open
                setOpenAmenities((v) => !v);
              }}
              className={`flex flex-row items-center justify-around bg-secondary w-[150px] h-[43px] text-primary ${
                selectedCount ? "opacity-100" : "opacity-70"
              }`}>
              AMENITIES ({selectedCount})
              <svg
                width="12"
                height="7"
                viewBox="0 0 12 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden>
                <path
                  d="M1 1L6 6L11 1"
                  stroke="#FCFEFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {openAmenities && (
              <div
                id="amenities-menu"
                role="dialog"
                aria-modal="false"
                className="absolute left-0 top-full mt-2 z-50 w-[150px] border border-white/10 bg-background/80 backdrop-blur-xl p-3 shadow-lg text-primary">
                <fieldset className="font-jakarta text-[15px]">
                  <legend className="sr-only">Amenities</legend>

                  <ul className="space-y-1">
                    {(
                      ["wifi", "parking", "breakfast", "pets"] as AmenityKey[]
                    ).map((k) => (
                      <li key={k}>
                        <label className="flex items-center justify-between gap-2 cursor-pointer">
                          <span className="uppercase">{k}</span>
                          <input
                            type="checkbox"
                            className="accent-current"
                            checked={pendingAmenities.has(k)}
                            onChange={() => toggleAmenityBuffered(k)}
                          />
                        </label>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      className="mt-1 flex items-center py-2 hover:bg-white/10 text-left opacity-80 font-jakarta text-sm"
                      onClick={() => clearAmenitiesBuffered(true)}>
                      Clear
                    </button>

                    <button
                      type="button"
                      onClick={applyAmenities}
                      className="font-jakarta text-[15px] font-bold flex flex-row items-center gap-1.5 cursor-pointer"
                      aria-label="Apply amenities">
                      GO
                      <svg
                        width="7"
                        height="12"
                        viewBox="0 0 7 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden>
                        <path
                          d="M1 11L6 6L1 1"
                          stroke="#FCFEFF"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </fieldset>
              </div>
            )}
          </div>

          {/* SHOW: FEATURED (placeholder — unchanged) */}
          <button className="flex flex-row items-center justify-around bg-secondary w-[190px] h-[43px] text-primary/70">
            SHOW: FEATURED
            <svg
              width="12"
              height="7"
              viewBox="0 0 12 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 1L6 6L11 1"
                stroke="#FCFEFF"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* CLEAR ALL FILTERING (placeholder — unchanged) */}
          <button className="flex flex-row items-center justify-around bg-secondary w-[200px] h-[43px] text-primary/70">
            CLEAR ALL FILTERING
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
      </div>
    </section>
  );
}
