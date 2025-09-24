import { Suspense } from "react";
import HeroHome from "@/features/home/components/HeroHome";
import RefinedFiltering from "@/features/home/components/refined/RefinedFiltering";
import HomeListingsSection from "@/features/home/components/HomeListingsSection";

/**
 * Home page of the application.
 *
 * - Renders a hero section with `HeroHome`.
 * - Includes a refined filtering component for searching venues.
 * - Displays a section with home listings.
 *
 * @returns The home page component.
 */
export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <section>
          <HeroHome />
        </section>
        <RefinedFiltering />
        <HomeListingsSection />
      </Suspense>
    </>
  );
}
