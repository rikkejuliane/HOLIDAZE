"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/utils/api/auth";
import { extractAuthFields } from "@/utils/auth/authResponse";
import { validateLoginFields, type LoginErrors } from "@/utils/auth/validation";
import { setSession } from "@/utils/auth/session";

/**
 * Custom React hook to manage login form state and submission.
 *
 * Handles:
 * - Tracking input values for `email` and `password`.
 * - Validating fields with `validateLoginFields`.
 * - Calling the login API and extracting authentication fields.
 * - Saving the session token and username via `setSession`.
 * - Redirecting to the `/profile` page on success.
 * - Displaying error or success notices via the provided callback.
 *
 * @param onNotice - Callback to display status messages (e.g., errors, success).
 * @returns An object with:
 * - `email`, `setEmail`: controlled state for the email field.
 * - `password`, `setPassword`: controlled state for the password field.
 * - `errors`: validation errors for the fields.
 * - `isSubmitting`: whether the login is currently in progress.
 * - `submit`: form submit handler.
 */
export function useLoginForm(onNotice: (msg: string) => void) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const router = useRouter();
  
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateLoginFields({ email, password });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      const res = await login({
        email: email.trim(),
        password: password.trim(),
      });
      const { token, name } = extractAuthFields(res);
      if (token) {
        setSession(token, name);
      }
      onNotice("Login successful! Redirecting…");
      router.push("/profile");
      router.refresh();
    } catch (err) {
      onNotice(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }
  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    isSubmitting,
    submit,
  };
}
