"use client";

import React from "react";

type ListingsAndMapLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

/**
 * ListingsAndMapLayout component.
 *
 * Two-column layout that places the map in a right sidebar (sticky on XL)
 * and the listings/content on the left. On smaller screens, the map appears
 * above the listings.
 *
 * - Adds top spacing to account for the fixed header (`--header-h`).
 * - Uses a responsive CSS grid with a fixed-width right column on XL.
 * - Provides an accessible `<aside>` with an ARIA label for the map area.
 *
 * @param left  - React node rendered as the primary listings/content area.
 * @param right - React node rendered in the sticky sidebar (map).
 * @returns The responsive listings + map layout section.
 */
export default function ListingsAndMapLayout({
  left,
  right,
}: ListingsAndMapLayoutProps) {
  return (
    <section className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 mt-[35px] mb-20">
      <div style={{ height: "var(--header-h)" }} aria-hidden />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_500px]">
        <aside
          className="block xl:order-2 order-1"
          aria-label="Map showing listing locations">
          <div className="xl:sticky xl:top-5">{right}</div>
        </aside>
        <div className="min-w-0 xl:order-1 order-2">{left}</div>
      </div>
    </section>
  );
}
