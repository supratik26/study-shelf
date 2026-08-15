export const UPLOAD_OWNER_EMAIL_ENV = "UPLOAD_OWNER_EMAIL";

export function normalizeEmail(email: string | null | undefined) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function getApprovedUploaderEmails(value: string | null | undefined) {
  return typeof value === "string" ? Array.from(new Set(value.split(/[;,\n]/).map(normalizeEmail).filter(Boolean))) : [];
}

export function isApprovedUploader(userEmail: string | null | undefined, ownerEmail: string | null | undefined) {
  const normalizedUser = normalizeEmail(userEmail);
  return Boolean(normalizedUser && getApprovedUploaderEmails(ownerEmail).includes(normalizedUser));
}

export function isConfiguredOwnerEmail(value: string | null | undefined) {
  return getApprovedUploaderEmails(value).length > 0;
}
