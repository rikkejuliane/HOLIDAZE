export type LoginErrors = Partial<{
  loginEmail: string;
  loginPassword: string;
}>;
export type RegisterErrors = Partial<{
  regName: string;
  regEmail: string;
  regPassword: string;
  regPasswordConfirm: string;
}>;

/**
 * Validates the login form fields with simple presence + email checks.
 *
 * @param email - Email address from the login form.
 * @param password - Password from the login form.
 * @returns An object with optional `loginEmail` and/or `loginPassword` error messages.
 */
export function validateLoginFields({
  email,
  password,
}: {
  email: string;
  password: string;
}): LoginErrors {
  const e: LoginErrors = {};
  if (!email) e.loginEmail = "Please enter your email address.";
  else if (!email.includes("@")) e.loginEmail = "Please enter a valid email.";
  if (!password) e.loginPassword = "Please enter your password.";
  return e;
}

/**
 * Validates the registration form fields with simple rules.
 *
 * Rules:
 * - `name` is required.
 * - `email` is required and must include `"@"`.
 * - `password` is required.
 * - `confirm` must match `password`.
 *
 * @param name - Chosen username.
 * @param email - User email.
 * @param password - Desired password.
 * @param confirm - Confirmation of the password.
 * @returns An object with optional error messages for
 *          `regName`, `regEmail`, `regPassword`, and `regPasswordConfirm`.
 */
export function validateRegisterFields({
  name,
  email,
  password,
  confirm,
}: {
  name: string;
  email: string;
  password: string;
  confirm: string;
}): RegisterErrors {
  const e: RegisterErrors = {};
  if (!name) e.regName = "Please enter a username.";
  if (!email) e.regEmail = "Please enter your email address.";
  else if (!email.includes("@")) e.regEmail = "Please enter a valid email.";
  if (!password) e.regPassword = "Please enter a password.";
  if (confirm !== password) e.regPasswordConfirm = "Passwords must match.";
  return e;
}
