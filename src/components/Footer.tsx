import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="h-[725px] border border-[rgba(255,255,255,0.02)] bg-[rgba(255,255,255,0.09)] backdrop-blur-[5.1px]">
      <div className="px-[73px] pt-[83px] flex flex-col">
        <div className="flex flex-row justify-between items-end">
          <Image
            src="/logo-light.png"
            alt="Holidaze logo"
            width={379}
            height={81}
          />
          <div aria-labelledby="newsletter-heading">
            <h3 id="newsletter-heading" className="font-jakarta text-[20px] text-primary pb-2.5">
              Sign up for our <strong>Newsletter</strong>
            </h3>
            <form method="post">
              <label for="email" class="sr-only">
                Newsletter
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-[278px] h-[41px] text-[20px] font-jakarta placeholder:text-primary pl-4 rounded-[5px] bg-[rgba(252,254,255,0.20)] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] backdrop-blur-[2px]"
                />
                <button type="submit" aria-label="Subscribe" className="absolute right-2 bottom-3">
                  <svg
                    width="10"
                    height="17"
                    viewBox="0 0 10 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1 16L9 8.5L1 1"
                      stroke="#FCFEFF"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        <span className="block w-[1290px] h-px bg-white mt-[54px]"></span>
        <div className="flex flex-row gap-[148px] mt-26">
          {/* SITE MAP */}
          <div className="font-jakarta text-[20px]">
            <h3 className=" text-primary font-bold pb-[30px]">SITE MAP</h3>
            <ul className="text-primary/60 flex flex-col gap-2.5 leading-none">
              <Link href="/"><li>Home</li></Link>
              <Link href="/about"><li>About</li></Link>
              <Link href="/contact"><li>Contact</li></Link>
              <Link href="#venues"><li>Venues</li></Link>
            </ul>
          </div>

          {/* INFO */}
          <div className="font-jakarta text-[20px]">
            <h3 className=" text-primary font-bold pb-[30px]">INFO</h3>
            <ul className="text-primary/60 flex flex-col gap-2.5 leading-none">
              <Link href=""><li>FAQ</li></Link>
              <Link href=""><li>Terms & Conditions</li></Link>
              <Link href=""><li>Privacy Policy</li></Link>
              <Link href="/RP"><li>Refund Policy</li></Link>
            </ul>
          </div>
        
       {/* CONTACT */}
        <div className="font-jakarta text-[20px]">
            <h3 className=" text-primary font-bold pb-[30px]">CONTACT US</h3>
            <ul className="text-primary/60 flex flex-col gap-2.5 leading-none">
              <li className="w-[188px]">Bygdøy allé 12B, 0287 Oslo, Norway</li>
              <li>contact@holidaze.com</li>
              <li>+47 22334455</li>
            </ul>
          </div>

          <Image src="/ellipseFooter.png" alt="Graphic design of a mountain made of stripes" width={350} height={350}/>

          </div>
        
        <div>
          <p className="text-primary text-[20px]">
            &copy; {new Date().getFullYear()} Holidaze. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
