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
    url: "https://holidaze-rikkejuliane.netlify.app/",
    siteName: "Holidaze",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

/**
 * Root layout for the Next.js app.
 *
 * - Defines global metadata (title, description, Open Graph, favicon).
 * - Wraps all pages with `<Navbar />` at the top and `<Footer />` at the bottom.
 * - Applies global styles from `globals.css`.
 *
 * @param children - The page content injected by Next.js.
 * @returns The root HTML structure with global layout elements.
 */
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
