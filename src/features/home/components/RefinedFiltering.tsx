export default function RefinedFiltering() {
  return (
    <section className="mt-[30px]">
      <div className="flex flex-col items-center font-jakarta text-[15px]">
        <p className="text-primary/60 font-semibold mb-[15px]">
          REFINE YOUR SEARCH
        </p>

        <div className="flex flex-row gap-[15px] text-primary/70 text-jakarta">
          <button className="flex flex-row items-center justify-around bg-secondary w-[240px] h-[43px] ">
            SORT BY: HIGHEST PRICE
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

          <button className="flex flex-row items-center justify-around bg-secondary w-[150px] h-[43px] ">
            AMENITIES (0)
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

          <button className="flex flex-row items-center justify-around bg-secondary w-[190px] h-[43px] ">
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
        </div>
      </div>
    </section>
  );
}
