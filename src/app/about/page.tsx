import Image from "next/image";

export default function About() {
  return (
    <section className="mb-20">
      <div className="relative">
        <Image
          src="/vincent-guth-62V7ntlKgL8-unsplash1.jpg"
          alt="Trees with Northern lights above in the sky"
          width={1440}
          height={355}
          className="w-full h-[745px] object-cover object-center sm:h-auto"
        />
        <div className="absolute top-80 sm:top-28 md:top-32  left-1/2 -translate-x-1/2 w-full">
          <h1 className="max-w-[350px] sm:max-w-full mx-auto sm:mx-0 text-[45px] sm:text-[29px]  lg:text-[50px] xl:text-[65px] font-noto text-primary font-black italic text-center [text-shadow:0_4px_4px_rgba(0,0,0,0.25)] -mb-2 md:-mb-8 leading-tight">
            Built by travelers, for travelers.
          </h1>
        </div>
      </div>

      <div className="flex flex-row flex-wrap justify-center gap-[50px] mt-[43px] text-primary px-[75px]"> 
        <div className="flex flex-col gap-[30px]">
          <div>
          <h2 className="font-noto text-[35px] font-bold pb-4">Purpose.</h2>
          <p className="w-[287px] font-jakarta text-sm">We started Holidaze to take the guesswork out of booking — clear calendars, honest photos, and hosts who care.</p>
          </div>
          <div>
          <h2 className="font-noto text-[35px] font-bold pb-4">Values.</h2>
          <p className="w-[287px] font-jakarta text-sm">Clarity  |  Care  |  Responsibility  |  Trust</p>
          </div>
        </div>
          <div>
          <h2 className="font-noto text-[35px] font-bold pb-4">Story.</h2>
          <p className="w-[287px] font-jakarta text-sm">Holidaze began as a small idea between friends who were tired of surprises at check-in. We believed travel should feel calm: know what you’re getting, feel good about where you’re staying, and be treated with care. We turned that belief into a platform shaped by feedback from guests and hosts.</p>
          </div>
          <div>
          <h2 className="font-noto text-[35px] font-bold pb-4">Promise.</h2>
          <ul className="w-[287px] font-jakarta text-sm list-disc">
            <li>Clarity over hype. Plain language, real expectations.</li>
            <li>No gotchas. Transparent pricing and what’s included.</li>
            <li>People first. Kind support and fair policies.</li>
            <li>Respect for places and neighbors.</li>
          </ul>
          </div>
          <div>
          <h2 className="font-noto text-[35px] font-bold pb-4">Approach.</h2>
          <p className="w-[287px] font-jakarta text-sm">We sweat the details so you don’t have to. Fewer clicks, clearer words, decisions that respect your time. We listen, we iterate, and we’d rather ship something honest than something loud.</p>
          </div>
      </div>
    </section>
  );
}
