export const NOTE_FILE_TYPES = ["pdf", "docx", "pptx", "txt", "md"] as const;

export type NoteFileType = (typeof NOTE_FILE_TYPES)[number];

export const NOTE_FILE_TYPE_LABELS: Record<NoteFileType, string> = {
  pdf: "PDF",
  docx: "DOCX",
  pptx: "PPTX",
  txt: "TXT",
  md: "Markdown",
};

export const MIME_TYPES_BY_FILE_TYPE: Record<NoteFileType, readonly string[]> = {
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  txt: ["text/plain"],
  md: ["text/markdown", "text/x-markdown", "text/plain"],
};

export const MAX_NOTE_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_NOTE_FILE_LABEL = "10 MB";
