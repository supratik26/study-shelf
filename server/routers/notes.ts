import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createNote,
  getNoteById,
  getNoteWithOwner,
  incrementNoteDownloadCount,
  listNotesByOwner,
  removeNote,
  searchNotes,
  updateNoteMetadata,
} from "../db";
import {
  MAX_NOTE_FILE_BYTES,
  MIME_TYPES_BY_FILE_TYPE,
  NOTE_FILE_TYPES,
  type NoteFileType,
} from "../../shared/notes";
import { storagePut } from "../storage";
import { protectedProcedure, router } from "../_core/trpc";

const MAX_BASE64_LENGTH = Math.ceil((MAX_NOTE_FILE_BYTES * 4) / 3) + 8;

const metadataSchema = z.object({
  title: z.string().trim().min(2).max(180),
  course: z.string().trim().min(2).max(180),
  term: z.string().trim().max(100).optional().or(z.literal("")),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1).max(32)).max(8),
});

export function parseTags(value: string) {
  return value ? value.split(",").filter(Boolean) : [];
}

export function normalizeTags(tags: string[]) {
  return Array.from(new Set(tags.map(tag => tag.trim().toLowerCase()).filter(Boolean))).join(",");
}

export function toNoteView(note: {
  id: number;
  title: string;
  description: string | null;
  course: string;
  term: string | null;
  tags: string;
  originalFileName: string;
  fileType: NoteFileType;
  mimeType: string;
  fileSize: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}, ownerName?: string | null) {
  return {
    id: note.id,
    title: note.title,
    description: note.description,
    course: note.course,
    term: note.term,
    tags: parseTags(note.tags),
    originalFileName: note.originalFileName,
    fileType: note.fileType,
    mimeType: note.mimeType,
    fileSize: note.fileSize,
    downloadCount: note.downloadCount,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    uploaderName: ownerName || "Study Shelf member",
  };
}

export function getFileType(fileName: string): NoteFileType {
  const extension = fileName.trim().toLowerCase().split(".").pop();
  if (!extension || !NOTE_FILE_TYPES.includes(extension as NoteFileType)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "This file type is not supported." });
  }
  return extension as NoteFileType;
}

export function decodeFile(base64: string) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64) || base64.length % 4 !== 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The selected file could not be read safely." });
  }
  const file = Buffer.from(base64, "base64");
  if (!file.length) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "The selected file is empty." });
  }
  if (file.byteLength > MAX_NOTE_FILE_BYTES) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Files must be 10 MB or smaller." });
  }
  return file;
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function assertOwner(ownerId: number, currentUserId: number) {
  if (ownerId !== currentUserId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only the uploader can manage this note." });
  }
}

export const notesRouter = router({
  search: protectedProcedure
    .input(z.object({
      query: z.string().max(120).optional(),
      fileType: z.enum(NOTE_FILE_TYPES).optional(),
      sort: z.enum(["recent", "title", "downloads"]).default("recent"),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(30).default(12),
    }))
    .query(async ({ input }) => {
      const rows = await searchNotes(input);
      return { items: rows.map(row => ({ ...row, tags: parseTags(row.tags), uploaderName: row.ownerName || "Study Shelf member" })) };
    }),

  getById: protectedProcedure
    .input(z.object({ noteId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const record = await getNoteWithOwner(input.noteId);
      if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "This note is no longer in the library." });
      return toNoteView(record.note, record.ownerName);
    }),

  myUploads: protectedProcedure.query(async ({ ctx }) => {
    const rows = await listNotesByOwner(ctx.user.id);
    return { items: rows.map(note => toNoteView(note, ctx.user.name)) };
  }),

  create: protectedProcedure
    .input(metadataSchema.extend({
      fileName: z.string().trim().min(1).max(255),
      mimeType: z.string().trim().min(1).max(160),
      fileData: z.string().min(4).max(MAX_BASE64_LENGTH),
    }))
    .mutation(async ({ ctx, input }) => {
      const fileType = getFileType(input.fileName);
      if (!MIME_TYPES_BY_FILE_TYPE[fileType].includes(input.mimeType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "The file type does not match a supported study-note format." });
      }
      const file = decodeFile(input.fileData);
      const cleanedFileName = safeFileName(input.fileName);
      if (!cleanedFileName) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Please choose a file with a valid name." });
      }

      const storage = await storagePut(
        `notes/${ctx.user.id}/${cleanedFileName}`,
        file,
        input.mimeType,
      );
      const created = await createNote({
        ownerId: ctx.user.id,
        title: input.title.trim(),
        course: input.course.trim(),
        term: input.term?.trim() || null,
        description: input.description?.trim() || null,
        tags: normalizeTags(input.tags),
        originalFileName: input.fileName.trim(),
        fileType,
        mimeType: input.mimeType,
        fileSize: file.byteLength,
        storageKey: storage.key,
        storageUrl: storage.url,
      });
      if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Your note was uploaded but could not be indexed." });
      return toNoteView(created, ctx.user.name);
    }),

  update: protectedProcedure
    .input(metadataSchema.extend({ noteId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getNoteById(input.noteId);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "This note is no longer in the library." });
      assertOwner(existing.ownerId, ctx.user.id);
      const updated = await updateNoteMetadata(input.noteId, {
        title: input.title.trim(),
        course: input.course.trim(),
        term: input.term?.trim() || null,
        description: input.description?.trim() || null,
        tags: normalizeTags(input.tags),
      });
      if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "This note is no longer in the library." });
      return toNoteView(updated, ctx.user.name);
    }),

  remove: protectedProcedure
    .input(z.object({ noteId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await getNoteById(input.noteId);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "This note is no longer in the library." });
      assertOwner(existing.ownerId, ctx.user.id);
      await removeNote(input.noteId);
      return { success: true } as const;
    }),

  registerDownload: protectedProcedure
    .input(z.object({ noteId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const note = await getNoteById(input.noteId);
      if (!note) throw new TRPCError({ code: "NOT_FOUND", message: "This note is no longer in the library." });
      const updated = await incrementNoteDownloadCount(note.id);
      return {
        downloadUrl: note.storageUrl,
        fileName: note.originalFileName,
        downloadCount: updated?.downloadCount ?? note.downloadCount + 1,
      };
    }),
});
