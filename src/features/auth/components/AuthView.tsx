"use client";

import { useEffect, useState } from "react";
import { useLoginForm } from "@/features/auth/hooks/useLoginForm";
import { useRegisterForm } from "@/features/auth/hooks/useRegisterForm";

type Mode = "signin" | "signup";

export default function AuthView() {
  const [mode, setMode] = useState<Mode>("signin");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  const {
    email: loginEmail,
    setEmail: setLoginEmail,
    password: loginPassword,
    setPassword: setLoginPassword,
    errors: loginErrors,
    isSubmitting: isLoggingIn,
    submit: handleLogin,
  } = useLoginForm(setNotice);

  const {
    name: regName,
    setName: setRegName,
    email: regEmail,
    setEmail: setRegEmail,
    password: regPassword,
    setPassword: setRegPassword,
    confirm: regPasswordConfirm,
    setConfirm: setRegPasswordConfirm,
    errors: regErrors,
    isMismatch,
    isSubmitting: isRegistering,
    submit: handleRegister,
  } = useRegisterForm(setNotice, () => setMode("signin"));

  const containerClasses =
    `container flex justify-center items-center mx-auto mt-[100px] md:mt-[70px]  ` +
    (mode === "signup" ? "right-panel-active" : "");

  return (
    <section>
      <div id="container" className={containerClasses}>
        {/* Sign Up */}
        <div className="form-container sign-up-container">
          <form id="register-form" onSubmit={handleRegister}>
            <h1 className="font-noto text-primary text-3xl font-bold pb-4 w-full">
              Sign up
            </h1>

            <label htmlFor="name-register" className="sr-only">
              Username
            </label>
            <input
              id="name-register"
              name="name"
              placeholder="Username"
              autoComplete="username"
              className="w-52 h-7 bg-white/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] placeholder:text-primary px-2 placeholder:font-jakarta placeholder:text-sm"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />
            {regErrors.regName && (
              <p className="input-error w-52 self-center text-left text-imperialRed text-sm mt-0 md:mt-2">
                {regErrors.regName}
              </p>
            )}

            <label htmlFor="email-register" className="sr-only">
              Email
            </label>
            <input
              id="email-register"
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              className="w-52 h-7 px-2 mt-[13px] bg-white/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] placeholder:text-primary placeholder:font-jakarta placeholder:text-sm"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
            {regErrors.regEmail && (
              <p className="input-error w-53 self-center text-left text-imperialRed text-sm mt-0 md:mt-2">
                {regErrors.regEmail}
              </p>
            )}

            <label htmlFor="password-register" className="sr-only">
              Password
            </label>
            <input
              id="password-register"
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              className="w-52 h-7 px-2 mt-[13px] bg-white/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] placeholder:text-primary placeholder:font-jakarta placeholder:text-sm"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
            />

            {/* Confirm password */}
            <label htmlFor="password-confirm-register" className="sr-only">
              Confirm password
            </label>
            <input
              id="password-confirm-register"
              type="password"
              name="passwordConfirm"
              placeholder="Confirm password"
              autoComplete="new-password"
              className="w-52 h-7 px-2 mt-[13px] bg-white/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] placeholder:text-primary placeholder:font-jakarta placeholder:text-sm"
              value={regPasswordConfirm}
              onChange={(e) => setRegPasswordConfirm(e.target.value)}
              aria-invalid={Boolean(regErrors.regPasswordConfirm) || isMismatch}
              aria-describedby={
                regErrors.regPasswordConfirm || isMismatch
                  ? "password-confirm-error"
                  : undefined
              }
            />
            {(regErrors.regPasswordConfirm || isMismatch) && (
              <p
                id="password-confirm-error"
                className="input-error w-52 self-center text-left text-imperialRed text-sm mt-0 md:mt-2">
                {regErrors.regPasswordConfirm || "Passwords must match."}
              </p>
            )}

            <div
              id="spinner-container-register"
              className="flex justify-center h-6 mt-2">
              {isRegistering && (
                <span
                  className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  aria-label="loading"
                />
              )}
            </div>

            <button
              id="sign-up-button"
              type="submit"
              className="text-primary text-[15px] font-jakarta font-bold flex flex-row items-center gap-1.5"
              disabled={isRegistering || isMismatch}>
              {isRegistering ? "…" : "REGISTER"}
              {!isRegistering && (
                <svg
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-0.5">
                  <path
                    d="M1 11L6 6L1 1"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>

        {/* Sign In */}
        <div className="form-container sign-in-container">
          <form id="login-form" onSubmit={handleLogin}>
            <h1 className="font-noto text-primary text-3xl font-bold">Login</h1>
            <label htmlFor="email-login" className="sr-only">
              Email
            </label>
            <input
              id="email-login"
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="email"
              className="w-52 h-7 px-2 mt-[13px] bg-white/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] placeholder:text-primary placeholder:font-jakarta placeholder:text-sm"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            {loginErrors.loginEmail && (
              <p className="input-error w-53 self-center text-left text-imperialRed text-sm mt-0 md:mt-2">
                {loginErrors.loginEmail}
              </p>
            )}

            <label htmlFor="password-login" className="sr-only">
              Password
            </label>
            <input
              id="password-login"
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              className="w-52 h-7 px-2 mt-[13px] bg-white/20 rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[2px] placeholder:text-primary placeholder:font-jakarta placeholder:text-sm"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <div
              id="spinner-container-login"
              className="flex justify-center h-6 mt-2">
              {isLoggingIn && (
                <span
                  className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  aria-label="loading"
                />
              )}
            </div>
            <button
              id="sign-in-button"
              type="submit"
              className="text-primary text-[15px] font-jakarta font-bold flex flex-row items-center gap-1.5"
              disabled={isLoggingIn}>
              {isLoggingIn ? "…" : "LOG IN"}
              {!isLoggingIn && (
                <svg
                  width="7"
                  height="12"
                  viewBox="0 0 7 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1 11L6 6L1 1"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="font-noto text-3xl font-bold text-center">
                Welcome back!
              </h1>
              <p className="font-jakarta w-[242px] text-base py-8 text-center">
                Log in to manage your bookings and discover more.
              </p>
              <button
                id="signIn"
                type="button"
                className="text-primary text-[15px] font-jakarta font-bold flex flex-row items-center gap-1.5"
                onClick={() => setMode("signin")}>
                LOG IN
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
            <div className="overlay-panel overlay-right">
              <h1 className="font-noto text-3xl font-bold text-center">
                Don’t have an account?
              </h1>
              <p className="font-jakarta w-80 text-base py-8 text-center">
                Become a member and make your booking experience effortless!
              </p>
              <button
                id="signUp"
                type="button"
                className="text-primary text-[15px] font-jakarta font-bold flex flex-row items-center gap-1.5"
                onClick={() => setMode("signup")}>
                REGISTER
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
          </div>
        </div>
      </div>
      {notice && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-secondary text-primary text-jakarta px-4 py-2 rounded z-50">
          {notice}
        </div>
      )}
    </section>
  );
}
