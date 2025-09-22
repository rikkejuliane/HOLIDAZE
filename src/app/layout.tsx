import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Holidaze",
  description: "Book unique venues and manage your stays easily.",
  keywords: ["venues", "booking", "travel", "holidaze"],
  openGraph: {
    title: "Holidaze",
    description: "Find and book venues around the world.",
    url: "https://yourdomain.com",
    siteName: "Holidaze",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background max-w-[1440px] mx-auto">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
