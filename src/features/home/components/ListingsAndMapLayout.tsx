// src/features/home/components/ListingsAndMapLayout.tsx
"use client";

import React from "react";

type ListingsAndMapLayoutProps = {
  left: React.ReactNode; // listings + pagination
  right: React.ReactNode; // map
};

export default function ListingsAndMapLayout({
  left,
  right,
}: ListingsAndMapLayoutProps) {
  return (
    <section className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 mt-[35px]">
      <div style={{ height: "var(--header-h)" }} aria-hidden />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_500px]">
        <div className="min-w-0">{left}</div>

        <aside
          className="hidden xl:block"
          aria-label="Map showing listing locations">
          <div className="sticky top-5">{right}</div>
        </aside>
      </div>
    </section>
  );
}
