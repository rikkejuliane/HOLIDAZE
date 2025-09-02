export type LoginErrors = Partial<{ loginEmail: string; loginPassword: string }>;
export type RegisterErrors = Partial<{
  regName: string;
  regEmail: string;
  regPassword: string;
  regPasswordConfirm: string;
}>;

export function validateLoginFields({
  email,
  password,
}: { email: string; password: string }): LoginErrors {
  const e: LoginErrors = {};
  if (!email) e.loginEmail = "Please enter your email address.";
  else if (!email.includes("@")) e.loginEmail = "Please enter a valid email.";
  if (!password) e.loginPassword = "Please enter your password.";
  return e;
}

export function validateRegisterFields({
  name,
  email,
  password,
  confirm,
}: { name: string; email: string; password: string; confirm: string }): RegisterErrors {
  const e: RegisterErrors = {};
  if (!name) e.regName = "Please enter a username.";
  if (!email) e.regEmail = "Please enter your email address.";
  else if (!email.includes("@")) e.regEmail = "Please enter a valid email.";
  if (!password) e.regPassword = "Please enter a password.";
  if (confirm !== password) e.regPasswordConfirm = "Passwords must match.";
  return e;
}
