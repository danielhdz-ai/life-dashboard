export function getAllowedEmail(): string | null {
  const email = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function isEmailAllowed(email: string): boolean {
  const allowed = getAllowedEmail();
  if (!allowed) return false;
  return email.trim().toLowerCase() === allowed;
}
