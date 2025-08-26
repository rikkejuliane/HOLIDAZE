import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 z-50  bg-transparent px-[74px]">
      <div className="mx-auto grid grid-cols-3 items-center h-[70px] text-primary font-jakarta text-lg font-bold">
        {/* left */}
        <div>
          <nav className="flex items-center gap-14 [&>a]:border-b [&>a]:border-transparent [&>a:hover]:border-primary [&>a]:transition-colors">
            <Link href="/about">ABOUT</Link>
            <span className="w-px h-[18px] bg-primary" />
            <Link href="/contact">CONTACT</Link>
          </nav>
        </div>

        {/* center */}
        <div className="justify-self-center">
          <Link href="/">
            <Image
              src="/logo-light.png"
              alt="Holidaze logo"
              width={145}
              height={0}
            />
          </Link>
        </div>

        {/* right */}
        <div className="justify-self-end">
          <nav className="flex items-center gap-14 [&>a]:border-b [&>a]:border-transparent [&>a:hover]:border-primary [&>a]:transition-colors">
            <Link href="/venues">VENUES</Link>
            <span className="w-px h-[18px] bg-primary" />
            <Link href="/auth">LOGIN</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
