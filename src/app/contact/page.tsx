"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Contact page with a hero background image and a centered contact form.
 *
 * Shows fields for first/last name, email, subject, optional booking ID, and message.
 * After submit, a thank-you message appears with a link back to the home page.
 */
export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * Handles form submission by preventing navigation and toggling the submitted state.
   * @param e Form submit event from the contact form.
   */
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitted(true);
  }
  return (
    <section>
      <div className="relative">
        <Image
          src="/pexels-raymond-petrik-1448389535-284006031.jpg"
          alt="The blue ocean from a cliff"
          width={1440}
          height={767}
          className="w-full h-[745px] object-cover object-center lg:h-auto"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[421px] h-[499px] bg-secondary rounded-[10px] backdrop-blur-[5.10px] text-primary px-[40px] overflow-hidden flex items-center justify-center">
            {!isSubmitted ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col space-y-2.5 text-sm w-full">
                <h1 className="font-noto text-[35px] font-bold text-center py-[20px]">
                  Get in Touch
                </h1>
                <div className="flex w-full gap-2.5">
                  <label htmlFor="firstName" className="sr-only">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    required
                    className="h-[30px] flex-1 min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] placeholder:text-primary placeholder:font-jakarta"
                  />
                  <label htmlFor="lastName" className="sr-only">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    required
                    className="h-[30px] flex-1 min-w-0 bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] placeholder:text-primary placeholder:font-jakarta"
                  />
                </div>
                <label htmlFor="e-mail" className="sr-only">
                  Email
                </label>
                <input
                  id="e-mail"
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="h-[30px] w-full bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] placeholder:text-primary placeholder:font-jakarta"
                />
                <label htmlFor="subject" className="sr-only">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="Subject"
                  required
                  className="h-[30px] w-full bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] placeholder:text-primary placeholder:font-jakarta"
                />
                <label htmlFor="bookingId" className="sr-only">
                  Booking ID
                </label>
                <input
                  id="bookingId"
                  name="bookingId"
                  type="text"
                  placeholder="Booking ID / Venue"
                  className="h-[30px] w-full bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] placeholder:text-primary placeholder:font-jakarta"
                />
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Message"
                  required
                  className="h-[158px] w-full bg-primary/20 rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] backdrop-blur-[2px] px-2 text-[14px] placeholder:text-primary placeholder:font-jakarta resize-none"
                />
                <button
                  type="submit"
                  className="flex flex-row gap-1.5 items-center justify-center text-primary font-jakarta font-bold text-[15px] cursor-pointer">
                  SEND
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
              </form>
            ) : (
              <div className="text-center px-4">
                <h2 className="font-noto text-[20px] font-bold mb-2">
                  Thank you so much for reaching out to us!
                </h2>
                <p className="text-[14px] font-jakarta text-primary/80">
                  Our customer service team has received your message and will
                  get back to you within 24 hours.
                </p>
                <Link
                  href="/"
                  className="flex flex-row gap-1.5 items-center justify-center text-primary font-jakarta font-bold text-[15px] cursor-pointer pt-10">
                  BACK
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
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
