import Link from "next/link";
import Image from "next/image";

/**
 * Custom 404 page.
 *
 * - Displays a full-screen hero image with overlay text and a playful
 *   “trip to nowhere” message.
 * - Informs the user that the page doesn’t exist.
 * - Provides a link back to the homepage.
 *
 * @returns A React component rendering the custom 404 page.
 */
export default function NotFound() {
  return (
    <section>
      <div className="relative">
        <Image
          src="/sebastian-unrau-sp-p7uuT0tw-unsplash1.jpg"
          alt="A dark and green forest with some sunlight shining trough the trees"
          width={1440}
          height={767}
          className="w-full h-[745px] object-cover object-center sm:h-auto"
        />
        <div className="absolute top-60 sm:top-20 md:top-20 lg:top-30 xl:top-30 left-1/2 -translate-x-1/2 w-full ">
          <h1 className="text-[25px] sm:text-[29px]  md:text-[50px] lg:text-[55px] xl:text-[65px] font-noto text-primary font-black italic text-center [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]">
            404
          </h1>
          <h1 className="text-[20px] sm:text-[29px]  md:text-[50px] lg:text-[55px] xl:text-[65px] font-noto text-primary font-black italic text-center [text-shadow:0_4px_4px_rgba(0,0,0,0.25)] -mb-2 md:-mb-8">
            Looks like you booked a trip
          </h1>
          <h1 className="text-[20px] sm:text-[29px]  md:text-[50px] lg:text-[55px] xl:text-[65px] font-noto text-primary font-black italic text-center [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]">
            to nowhere
          </h1>
          <div className="flex flex-col text-center pt-[50px] sm:pt-0 lg:pt-[130px]">
            <p className="text-jakarta font-extrabold  text-sm sm:text-[20px] text-primary leading-none">
              The page you’re looking for doesn’t exist.
            </p>
            <p className="text-jakarta font-extrabold text-sm sm:text-[20px] text-primary leading-none">
              Let’s get you back on track.
            </p>
          </div>
          <div>
            <Link
              href="/"
              className="text-jakarta font-bold text-primary text-[15px] flex flex-row items-center justify-center gap-[6px] mt-4">
              <svg
                width="7"
                height="12"
                viewBox="0 0 7 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 1L1 6L6 11"
                  stroke="#FCFEFF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              BACK TO HOMEPAGE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
