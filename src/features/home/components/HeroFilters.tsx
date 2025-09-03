export default function HeroFilters() {
  return (
    <form className="w-[1290px] h-20 bg-white/10 rounded-[10px] border border-white/0 backdrop-blur-[5.10px] flex flex-row justify-between items-center text-primary px-[39px] cursor-pointer">
      {/* Search */}
      <div className="flex flex-col">
        <fieldset>
          <legend className="sr-only">Search</legend>
          <label
            htmlFor="search"
            className="font-jakarta text-[15px] font-bold pb-[15px]">
            WHERE TO?
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              id="search"
              name="search"
              type="search"
              placeholder="Oslo, Norway"
              className="w-48 border-0 border-b border-primary bg-transparent focus:outline-none placeholder:text-primary"
            />
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2"
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
          </div>
        </fieldset>
      </div>

      {/* Dates */}
      <div className="flex flex-col">
        <fieldset>
          <legend className="sr-only">Dates</legend>
          <label
            htmlFor="dates"
            className="font-jakarta text-[15px] font-bold pb-[15px]">
            DATE
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              id="dates"
              name="dates"
              type="text"
              placeholder="Add dates"
              readOnly
              className="w-48 border-0 border-b border-primary bg-transparent focus:outline-none placeholder:text-primary"
            />
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2"
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
          </div>
        </fieldset>
      </div>

      {/* Price */}
      <div className="flex flex-col">
        <fieldset>
          <legend className="sr-only">Price</legend>
          <label
            htmlFor="price"
            className="font-jakarta text-[15px] font-bold pb-[15px]">
            PRICE
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              id="price"
              name="price"
              type="text"
              placeholder="Maximum Budget"
              readOnly
              className="w-48 border-0 border-b border-primary bg-transparent focus:outline-none placeholder:text-primary"
            />
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2"
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
          </div>
        </fieldset>
      </div>

      {/* Guests */}
      <div className="flex flex-col">
        <fieldset>
          <legend className="sr-only">Guests</legend>
          <label
            htmlFor="guests"
            className="font-jakarta text-[15px] font-bold pb-[15px]">
            GUESTS
          </label>
          <div className="flex flex-row relative mt-2">
            <input
              id="guests"
              name="guests"
              type="text"
              placeholder="Number of guests"
              readOnly
              className="w-48 border-0 border-b border-primary bg-transparent focus:outline-none placeholder:text-primary"
            />
            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2"
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
          </div>
        </fieldset>
      </div>

      {/* CTA Button */}
      <div>
        <button
          type="submit"
          className="font-jakarta font-jakarta text-[15px] font-bold flex flex-row items-center gap-1.5">
          GO
          <svg
            width="7"
            height="12"
            viewBox="0 0 7 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1 11L6 6L1 1"
              stroke="#FCFEFF"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
