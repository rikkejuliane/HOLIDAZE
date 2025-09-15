import Image from "next/image";

export default function ProfileVenuesSection() {
  return (
    <section className="mt-5 mb-20">
      <div className="flex flex-col mx-auto font-jakarta text-primary max-w-[1055px]">
        {/* TABS */}
        <div className="flex flex-row h-[55px]">
          <div className="flex items-center justify-center w-[185px] bg-primary/20 rounded-tl-[10px] rounded-tr-[10px] backdrop-blur-[2px]">
            <p className="font-bold text-[15px]">MY BOOKINGS</p>
          </div>
          {/* SPACE FOR EMPTY TAB/ NO TABS SPACE - it will fill up the space the tabs dont take up */}
          <div className="w-full bg-zinc-800 rounded-tl-[10px] rounded-tr-[10px]"></div>
        </div>
        {/* CONTENT FOR THE TABS*/}
        <div className="h-[572px] bg-white/20 rounded-bl-[10px] rounded-br-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px]">
         {/* ONE LISTING */}
         <div className="flex flex-col">
         <div className="flex flex-row mt-2.5 justify-between text-lg px-[40px]">
            <div className="flex gap-7.5 items-center">
              <Image
                src="/listingplaceholder.jpg"
                alt="listing placeholder"
                width={60}
                height={60}
                unoptimized
                className="w-15 h-15 rounded-full"
              />
              <p className="font-bold">Title of listing</p>
              <p className="text-primary/70">Location listing</p>
              <p className="font-bold">Number guest</p>
            </div>
            <div className="flex flex-row items-center gap-7.5">
              {/* VIEW SVG */}
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

              {/* DELETE SVG */}
              <svg
                width="15"
                height="20"
                viewBox="0 0 15 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.07143 17.7778C1.07143 19 2.03571 20 3.21429 20H11.7857C12.9643 20 13.9286 19 13.9286 17.7778V4.44444H1.07143V17.7778ZM15 1.11111H11.25L10.1786 0H4.82143L3.75 1.11111H0V3.33333H15V1.11111Z"
                  fill="#E63946"
                />
              </svg>
            </div>
            </div>
            <span className="border-b border-primary/30 w-full pt-2.5"></span>
          </div>

          {/* ONE LISTING */}
         <div className="flex flex-col">
         <div className="flex flex-row mt-2.5 justify-between text-lg px-[40px]">
            <div className="flex gap-7.5 items-center">
              <Image
                src="/listingplaceholder.jpg"
                alt="listing placeholder"
                width={60}
                height={60}
                unoptimized
                className="w-15 h-15 rounded-full"
              />
              <p className="font-bold">Title of listing</p>
              <p className="text-primary/70">Location listing</p>
              <p className="font-bold">Number guest</p>
            </div>
            <div className="flex flex-row items-center gap-7.5">
              {/* VIEW SVG */}
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

              {/* DELETE SVG */}
              <svg
                width="15"
                height="20"
                viewBox="0 0 15 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1.07143 17.7778C1.07143 19 2.03571 20 3.21429 20H11.7857C12.9643 20 13.9286 19 13.9286 17.7778V4.44444H1.07143V17.7778ZM15 1.11111H11.25L10.1786 0H4.82143L3.75 1.11111H0V3.33333H15V1.11111Z"
                  fill="#E63946"
                />
              </svg>
            </div>
            </div>
            <span className="border-b border-primary/30 w-full pt-2.5"></span>
          </div>
        </div>
      </div>
    </section>
  );
}
