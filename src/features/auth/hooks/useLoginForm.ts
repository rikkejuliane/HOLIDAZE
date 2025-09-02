"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/utils/api/auth";
import { extractAuthFields } from "../utils/authResponse";
import { validateLoginFields, type LoginErrors } from "../utils/validation";

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
      const res = await login({ email: email.trim(), password: password.trim() });
      const { token, name } = extractAuthFields(res);
      if (token) localStorage.setItem("token", token);
      if (name) localStorage.setItem("username", name);
      onNotice("Login successful! Redirecting…");
      router.push("/profile");
    } catch (err) {
      onNotice(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    email, setEmail,
    password, setPassword,
    errors,
    isSubmitting,
    submit,
  };
}
