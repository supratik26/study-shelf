export const UPLOAD_OWNER_EMAIL_ENV = "UPLOAD_OWNER_EMAIL";

export function normalizeEmail(email: string | null | undefined) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function isApprovedUploader(userEmail: string | null | undefined, ownerEmail: string | null | undefined) {
  const normalizedOwner = normalizeEmail(ownerEmail);
  return Boolean(normalizedOwner && normalizeEmail(userEmail) === normalizedOwner);
}

export function isConfiguredOwnerEmail(value: string | null | undefined) {
  return Boolean(normalizeEmail(value));
}
