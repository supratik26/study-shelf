import { NOTE_FILE_TYPE_LABELS, type NoteFileType } from "@shared/notes";

export function formatFileType(fileType: NoteFileType) {
  return NOTE_FILE_TYPE_LABELS[fileType];
}

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

export function formatTags(tags: unknown) {
  const values = Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0) : [];
  return values.length ? values.map(tag => `#${tag.trim()}`).join("  ") : "No tags added";
}
