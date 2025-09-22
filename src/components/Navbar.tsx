"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Site navigation bar.
 *
 * - Displays the Holidaze logo centered with navigation links on left/right.
 * - Switches between desktop (inline nav) and mobile (hamburger + dropdown) layouts.
 * - Tracks login state from `localStorage` (`token`) and updates on storage,
 *   visibility, or a custom `auth:changed` event.
 * - Shows **PROFILE** if logged in, otherwise **LOGIN**.
 *
 * @returns The responsive navigation bar.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    const sync = () => setLoggedIn(!!localStorage.getItem("token"));
    sync();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "token") sync();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") sync();
    };
    const onAuthChanged = () => sync();
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("auth:changed", onAuthChanged as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener(
        "auth:changed",
        onAuthChanged as EventListener
      );
    };
  }, []);
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent px-10px lg:px-[74px] max-w-[1440px] mx-auto">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-3 items-center h-[70px] pt-[40px] sm:pt-0 text-primary font-jakarta text-lg font-bold">
        {/* LEFT GRID */}
        <div className="hidden lg:block">
          <nav className="flex items-center gap-14 [&>a]:border-b [&>a]:border-transparent [&>a:hover]:border-primary [&>a]:transition-colors">
            <Link href="/about">ABOUT</Link>
            <span className="w-px h-[18px] bg-primary" />
            <Link href="/contact">CONTACT</Link>
          </nav>
        </div>
        {/* CENTER GRID */}
        <div className="col-start-1 lg:col-start-2 col-end-2 lg:col-end-3 justify-self-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo-light.png"
                alt="Holidaze logo"
                width={145}
                height={32}
                priority
              />
            </Link>
            {/* MOBILE NAV */}
            <span className="w-px h-[18px] bg-primary lg:hidden" />
            <button
              aria-label="Toggle menu"
              className="h-10 w-10 grid place-items-center rounded-md hover:bg-primary/10 lg:hidden"
              onClick={() => setOpen((v) => !v)}>
              {!open ? (
                <svg
                  width="18"
                  height="12"
                  viewBox="0 0 18 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.5 0.75C17.5 0.948912 17.421 1.13968 17.2803 1.28033C17.1397 1.42098 16.9489 1.5 16.75 1.5H0.75C0.551088 1.5 0.360322 1.42098 0.21967 1.28033C0.0790175 1.13968 0 0.948912 0 0.75C0 0.551088 0.0790175 0.360322 0.21967 0.21967C0.360322 0.0790175 0.551088 0 0.75 0H16.75C16.9489 0 17.1397 0.0790175 17.2803 0.21967C17.421 0.360322 17.5 0.551088 17.5 0.75ZM17.5 5.75C17.5 5.94891 17.421 6.13968 17.2803 6.28033C17.1397 6.42098 16.9489 6.5 16.75 6.5H0.75C0.551088 6.5 0.360322 6.42098 0.21967 6.28033C0.0790175 6.13968 0 5.94891 0 5.75C0 5.55109 0.0790175 5.36032 0.21967 5.21967C0.360322 5.07902 0.551088 5 0.75 5H16.75C16.9489 5 17.1397 5.07902 17.2803 5.21967C17.421 5.36032 17.5 5.55109 17.5 5.75ZM17.5 10.75C17.5 10.9489 17.421 11.1397 17.2803 11.2803C17.1397 11.421 16.9489 11.5 16.75 11.5H0.75C0.551088 11.5 0.360322 11.421 0.21967 11.2803C0.0790175 11.1397 0 10.9489 0 10.75C0 10.5511 0.0790175 10.3603 0.21967 10.2197C0.360322 10.079 0.551088 10 0.75 10H16.75C16.9489 10 17.1397 10.079 17.2803 10.2197C17.421 10.3603 17.5 10.5511 17.5 10.75Z"
                    fill="#FCFEFF"
                  />
                </svg>
              ) : (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1.53478 8.53531L8.60585 1.46424M1.53478 1.46424L8.60585 8.53531"
                    stroke="#FCFEFF"
                    strokeOpacity="0.6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* RIGHT GRID */}
        <div className="justify-self-end hidden lg:block">
          <nav className="flex items-center gap-14 [&>a]:border-b [&>a]:border-transparent [&>a:hover]:border-primary [&>a]:transition-colors">
            <Link href="/#listings-grid">VENUES</Link>
            <span className="w-px h-[18px] bg-primary" />
            {loggedIn ? (
              <Link href="/profile">PROFILE</Link>
            ) : (
              <Link href="/auth">LOGIN</Link>
            )}
          </nav>
        </div>
      </div>
      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="lg:hidden absolute top-[90px] sm:top-[70px] w-[320px] left-1/2 -translate-x-1/2 sm:left-auto sm:right-[120px] sm:translate-x-0 rounded-[10px] border border-primary/5 bg-secondary/50 backdrop-blur-sm text-primary font-jakarta text-lg font-bold">
          <nav className="px-6 py-4 flex flex-col gap-3">
            <Link href="/about" onClick={() => setOpen(false)}>
              ABOUT
            </Link>
            <span className="h-px w-full bg-primary" />
            <Link href="/contact" onClick={() => setOpen(false)}>
              CONTACT
            </Link>
            <span className="h-px w-full bg-primary" />
            <Link href="/#listings-grid" onClick={() => setOpen(false)}>
              VENUES
            </Link>
            <span className="h-px w-full bg-primary" />
            {loggedIn ? (
              <Link href="/profile" onClick={() => setOpen(false)}>
                PROFILE
              </Link>
            ) : (
              <Link href="/auth" onClick={() => setOpen(false)}>
                LOGIN
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
