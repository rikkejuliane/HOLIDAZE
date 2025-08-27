import Image from "next/image";

export default function Footer() {
  return (
    <footer className="h-[725px] border border-[rgba(255,255,255,0.02)] bg-[rgba(255,255,255,0.09)] backdrop-blur-[5.1px]">
      <div className="px-[73px] pt-[83px] flex flex-col">
        <div className="flex flex-row">
          <Image src="/logo-light.png"
                alt="Holidaze logo"
                width={379}
                height={81} />
        </div>
        <span></span>
        <div className="flex flex-row"></div>
        <div><p>&copy; {new Date().getFullYear()} Holidaze. All rights reserved.</p></div>
      </div>
      
    </footer>
  );
}