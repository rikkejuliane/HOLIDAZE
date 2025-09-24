import Image from "next/image";
import { Suspense } from "react";
import HeroFilters from "./HeroFilters";

/**
 * HeroHome component.
 *
 * Full-bleed hero banner with a background image, two-line headline,
 * and the `HeroFilters` bar positioned near the bottom of the hero.
 *
 * - Uses absolute positioning to center the headline responsively.
 * - Pins the filter form so it overlaps the hero at smaller breakpoints.
 *
 * @returns The homepage hero section with search filters.
 */
export default function HeroHome() {
  return (
    <div className="relative overflow-x-clip">
      <Image
        src="/heroImage.jpg"
        alt="Ai generated image of a woman sitting in an infinity pool looking over snowey mountains"
        width={1440}
        height={767}
        priority
        className="w-full h-[745px] object-cover object-center sm:h-auto"
      />
      <div className="absolute top-80 sm:top-28 md:top-28 lg:top-45 xl:top-60 left-1/2 -translate-x-1/2 w-full">
        <h1 className="text-[25px] sm:text-[29px]  md:text-[50px] lg:text-[55px] xl:text-[65px] font-noto text-primary font-black italic text-center [text-shadow:0_4px_4px_rgba(0,0,0,0.25)] -mb-2 md:-mb-8">
          Explore Hidden Corners
        </h1>
        <h1 className="text-[25px] sm:text-[29px]  md:text-[50px] lg:text-[55px] xl:text-[65px] font-noto text-primary font-black italic text-center [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]">
          of the World
        </h1>
      </div>
      <div className="absolute -bottom-80 sm:-bottom-44 lg:bottom-4 left-0 right-0 px-4 flex justify-center">
        <Suspense fallback={null}>
          <HeroFilters />
        </Suspense>
      </div>
    </div>
  );
}
