"use client";

import React from "react";

type ListingsAndMapLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export default function ListingsAndMapLayout({
  left,
  right,
}: ListingsAndMapLayoutProps) {
  return (
    <section className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 mt-[35px]">
      <div style={{ height: "var(--header-h)" }} aria-hidden />
      {/* Single column by default, 2 cols on xl */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_500px]">
        {/* Map first on small (stacked), sticky only on xl */}
        <aside
          className="block xl:order-2 order-1"
          aria-label="Map showing listing locations"
        >
          <div className="xl:sticky xl:top-5">{right}</div>
        </aside>

        {/* Listings second on small, first on xl */}
        <div className="min-w-0 xl:order-1 order-2">{left}</div>
      </div>
    </section>
  );
}
