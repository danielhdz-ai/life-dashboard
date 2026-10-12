export function getAllowedEmail(): string | null {
  const email = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  return email || null;
}

export function isEmailAllowed(email: string): boolean {
  const allowed = getAllowedEmail();
  // Sin ALLOWED_EMAIL configurado, no bloquear (dev); en prod debe estar definido.
  if (!allowed) return process.env.NODE_ENV !== "production";
  return email.trim().toLowerCase() === allowed;
}
