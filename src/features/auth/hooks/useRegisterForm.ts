"use client";

import { useMemo, useState } from "react";
import { register } from "@/utils/api/auth";
import {
  validateRegisterFields,
  type RegisterErrors,
} from "../../../utils/auth/validation";

/**
 * useRegisterForm hook.
 *
 * Custom React hook that manages the registration form state and submission flow.
 *
 * Handles:
 * - Tracking input values for `name`, `email`, `password`, and `confirm`.
 * - Validating fields with `validateRegisterFields`.
 * - Detecting mismatched passwords (`isMismatch`).
 * - Calling the `register` API to create a new user.
 * - Triggering success and error notices via the provided callback.
 * - Executing a follow-up action (`onAfterRegister`), e.g., switching to login mode.
 *
 * @param onNotice - Callback to display status messages (e.g., errors, success).
 * @param onAfterRegister - Callback to execute after successful registration.
 * @returns An object with:
 * - `name`, `setName`: controlled state for the username field.
 * - `email`, `setEmail`: controlled state for the email field.
 * - `password`, `setPassword`: controlled state for the password field.
 * - `confirm`, `setConfirm`: controlled state for the confirm password field.
 * - `errors`: validation errors for the fields.
 * - `isMismatch`: whether password and confirm password do not match.
 * - `isSubmitting`: whether the registration is currently in progress.
 * - `submit`: form submit handler.
 */
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
  const isMismatch = useMemo(
    () => confirm !== "" && confirm !== password,
    [confirm, password]
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateRegisterFields({ name, email, password, confirm });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      onNotice("Registration successful! You can now log in.");
      onAfterRegister();
      setConfirm("");
    } catch (err) {
      onNotice(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }
  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirm,
    setConfirm,
    errors,
    isMismatch,
    isSubmitting,
    submit,
  };
}
