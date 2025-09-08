import Image from "next/image";
import HeroFilters from "./HeroFilters";

export default function HeroHome() {
  return (
    <div className="relative overflow-x-clip">
      <Image
        src="/heroImage.jpg"
        alt="Ai generated image of a woman sitting in an infinity pool looking over snowey mountains"
        width={1440}
        height={767}
        className="w-full h-[745px] object-cover object-center sm:h-auto"
      />
      <div className="absolute top-80 sm:top-28 md:top-28 lg:top-45 xl:top-60 left-1/2 -translate-x-1/2 w-full">
        <h1 className="text-[29px] md:text-[50px] lg:text-[55px] xl:text-[65px] font-noto text-primary font-black italic text-center [text-shadow:0_4px_4px_rgba(0,0,0,0.25)] -mb-2 md:-mb-8">
          Explore Hidden Corners
        </h1>
        <h1 className="text-[29px] md:text-[50px] lg:text-[55px] xl:text-[65px] font-noto text-primary font-black italic text-center [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]">
          of the World
        </h1>
      </div>
      <div className="absolute -bottom-80 lg:bottom-4 left-0 right-0 px-4 flex justify-center">
        <HeroFilters />
      </div>
    </div>
  );
}
