// src/features/auth/components/AuthView.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, register } from "@/utils/api/auth";

type Mode = "signin" | "signup";

/** Type guards + helpers to avoid `any` */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}
function getObject(obj: Record<string, unknown>, key: string): Record<string, unknown> | undefined {
  const v = obj[key];
  return isRecord(v) ? v : undefined;
}
function extractAuthFields(res: unknown): { token?: string; name?: string } {
  if (!isRecord(res)) return {};
  const data = getObject(res, "data");
  let token = data ? getString(data, "accessToken") : undefined;
  let name = data ? getString(data, "name") : undefined;

  if (!token) token = getString(res, "accessToken");
  if (!name) {
    name = getString(res, "name");
    if (!name) {
      const profile = getObject(res, "profile");
      if (profile) name = getString(profile, "name");
    }
  }
  return { token, name };
}

export default function AuthView() {
  const [mode, setMode] = useState<Mode>("signin");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordConfirm, setRegPasswordConfirm] = useState(""); // confirm password
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const router = useRouter();

  function validateLogin() {
    const e: Record<string, string> = {};
    if (!loginEmail) e.loginEmail = "Please enter your email address.";
    else if (!loginEmail.includes("@")) e.loginEmail = "Please enter a valid email.";
    if (!loginPassword) e.loginPassword = "Please enter your password.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateRegister() {
    const e: Record<string, string> = {};
    if (!regName) e.regName = "Please enter a username.";
    if (!regEmail) e.regEmail = "Please enter your email address.";
    else if (!regEmail.includes("@")) e.regEmail = "Please enter a valid email.";
    if (!regPassword) e.regPassword = "Please enter a password.";
    if (regPasswordConfirm !== regPassword) e.regPasswordConfirm = "Passwords must match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    if (!validateLogin()) return;
    setIsLoggingIn(true);
    try {
      const res = await login({ email: loginEmail.trim(), password: loginPassword.trim() });
      const { token, name } = extractAuthFields(res);
      if (token) localStorage.setItem("token", token);
      if (name) localStorage.setItem("username", name);
      setNotice("Login successful! Redirecting…");
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setNotice(message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setNotice("");
    if (!validateRegister()) return;
    setIsRegistering(true);
    try {
      await register({ name: regName.trim(), email: regEmail.trim(), password: regPassword.trim() });
      setNotice("Registration successful! You can now sign in.");
      setMode("signin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      setNotice(message);
    } finally {
      setIsRegistering(false);
    }
  }

  const containerClasses =
    `container flex justify-center items-center mx-auto mt-[70px] md:mt-20 mb-10 md:mb-0 ` +
    (mode === "signup" ? "right-panel-active" : "");

  const isMismatch = regPasswordConfirm !== "" && regPasswordConfirm !== regPassword;

  return (
      <section>
        <div id="container" className={containerClasses}>
          {/* Sign Up */}
          <div className="form-container sign-up-container">
            <form id="register-form" onSubmit={handleRegister}>
              <h1 className="font-serif text-3xl font-bold">Create account</h1>

              <label htmlFor="name-register" className="sr-only">Username</label>
              <input
                id="name-register" name="name" placeholder="Username"
                className="mt-4 p-2 shadow-md rounded w-[200px] h-[30px] bg-lavender-blue bg-opacity-20 placeholder-charcoal-grey placeholder:font-inter placeholder:text-sm"
                value={regName} onChange={(e) => setRegName(e.target.value)}
              />
              {errors.regName && <p className="input-error text-red-500 text-sm mt-1">{errors.regName}</p>}

              <label htmlFor="email-register" className="sr-only">Email</label>
              <input
                id="email-register" type="email" name="email" placeholder="Email"
                className="mt-3 p-2 shadow-md rounded w-[200px] h-[30px] bg-lavender-blue bg-opacity-20 placeholder-charcoal-grey placeholder:font-inter placeholder:text-sm"
                value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
              />
              {errors.regEmail && <p className="input-error text-red-500 text-sm mt-1">{errors.regEmail}</p>}

              <label htmlFor="password-register" className="sr-only">Password</label>
              <input
                id="password-register" type="password" name="password" placeholder="Password"
                className="mt-3 p-2 shadow-md rounded w-[200px] h-[30px] bg-lavender-blue bg-opacity-20 placeholder-charcoal-grey placeholder:font-inter placeholder:text-sm"
                value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
              />

              {/* Confirm password */}
              <label htmlFor="password-confirm-register" className="sr-only">Confirm password</label>
              <input
                id="password-confirm-register" type="password" name="passwordConfirm" placeholder="Confirm password"
                className="mt-3 p-2 shadow-md rounded w-[200px] h-[30px] bg-lavender-blue bg-opacity-20 placeholder-charcoal-grey placeholder:font-inter placeholder:text-sm"
                value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)}
              />
              {(errors.regPasswordConfirm || isMismatch) && (
                <p className="input-error text-red-500 text-sm mt-1">
                  {errors.regPasswordConfirm || "Passwords must match."}
                </p>
              )}

              <div id="spinner-container-register" className="flex justify-center h-6 mt-2">
                {isRegistering && <span className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full" aria-label="loading" />}
              </div>

              <button
                id="sign-up-button" type="submit"
                className="mt-4 bg-royal-blue text-white text-lg font-serif font-bold p-2 rounded w-[100px] h-[30px] flex items-center justify-center disabled:opacity-60"
                disabled={isRegistering || isMismatch}
              >
                {isRegistering ? "…" : "Sign up"}
              </button>
            </form>
          </div>

          {/* Sign In */}
          <div className="form-container sign-in-container">
            <form id="login-form" onSubmit={handleLogin}>
              <h1 className="font-serif text-3xl font-bold">Sign in</h1>

              <label htmlFor="email-login" className="sr-only">Email</label>
              <input
                id="email-login" type="email" name="email" placeholder="Email"
                className="mt-4 p-2 shadow-md rounded w-[200px] h-[30px] bg-lavender-blue bg-opacity-20 placeholder-charcoal-grey placeholder:font-inter placeholder:text-sm"
                value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
              />
              {errors.loginEmail && <p className="input-error text-red-500 text-sm mt-1">{errors.loginEmail}</p>}

              <label htmlFor="password-login" className="sr-only">Password</label>
              <input
                id="password-login" type="password" name="password" placeholder="Password"
                className="mt-3 p-2 shadow-md rounded w-[200px] h-[30px] bg-lavender-blue bg-opacity-20 placeholder-charcoal-grey placeholder:font-inter placeholder:text-sm"
                value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
              />

              <div id="spinner-container-login" className="flex justify-center h-6 mt-2">
                {isLoggingIn && <span className="animate-spin inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full" aria-label="loading" />}
              </div>

              <button
                id="sign-in-button" type="submit"
                className="mt-4 bg-royal-blue text-white text-lg font-serif font-bold p-2 rounded w-[100px] h-[30px] flex items-center justify-center disabled:opacity-60"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "…" : "Sign in"}
              </button>
            </form>
          </div>

          {/* Overlay */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1 className="font-serif text-3xl font-bold text-center">Welcome back!</h1>
                <p className="font-inter w-[242px] text-base py-8 text-center">
                  Enter your details to rejoin the World of Exclusive Auctions.
                </p>
                <button
                  id="signIn" type="button"
                  className="mt-4 bg-white text-royal-blue text-lg font-serif font-bold p-2 rounded w-[100px] h-[30px] flex items-center justify-center"
                  onClick={() => setMode("signin")}
                >
                  Sign in
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1 className="font-serif text-3xl font-bold text-center">Don’t have an account?</h1>
                <p className="font-inter w-[242px] text-base py-8 text-center">
                  Create your Biddy account and access exclusive auctions!
                </p>
                <button
                  id="signUp" type="button"
                  className="mt-4 bg-white text-royal-blue text-lg font-serif font-bold p-2 rounded w-[100px] h-[30px] flex items-center justify-center"
                  onClick={() => setMode("signup")}
                >
                  Sign up
                </button>
              </div>
            </div>
          </div>
        </div>

        {notice && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded">
            {notice}
          </div>
        )}
      </section>
    
  );
}
