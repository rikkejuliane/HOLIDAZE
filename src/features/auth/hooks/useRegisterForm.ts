"use client";

import { useMemo, useState } from "react";
import { register } from "@/utils/api/auth";
import { validateRegisterFields, type RegisterErrors } from "../utils/validation";

export function useRegisterForm(
  onNotice: (msg: string) => void,
  onAfterRegister: () => void
) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setSubmitting] = useState(false);

  const isMismatch = useMemo(() => confirm !== "" && confirm !== password, [confirm, password]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateRegisterFields({ name, email, password, confirm });
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password: password.trim() });
      onNotice("Registration successful! You can now log in.");
      onAfterRegister(); // e.g., switch mode to "signin"
      setConfirm("");
    } catch (err) {
      onNotice(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirm, setConfirm,
    errors,
    isMismatch,
    isSubmitting,
    submit,
  };
}
