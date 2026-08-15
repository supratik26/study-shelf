import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getNoteById: vi.fn(),
  incrementNoteDownloadCount: vi.fn(),
  searchNotes: vi.fn(),
  getNoteWithOwner: vi.fn(),
  listNotesByOwner: vi.fn(),
  createNote: vi.fn(),
  removeNote: vi.fn(),
  updateNoteMetadata: vi.fn(),
}));

vi.mock("../db", () => dbMocks);
vi.mock("../storage", () => ({ storagePut: vi.fn() }));

import { assertOwner, decodeFile, getFileType, normalizeTags, notesRouter, toNoteView } from "./notes";

const authContext = { user: { id: 7, name: "Ada", openId: "ada", email: null, loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } } as any;

describe("notes server validation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts supported file extensions and rejects unsupported files", () => {
    expect(getFileType("Lecture-Guide.PDF")).toBe("pdf");
    expect(getFileType("seminar-notes.md")).toBe("md");
    expect(() => getFileType("archive.zip")).toThrow(TRPCError);
  });

  it("rejects malformed and oversized base64 file data before storage", () => {
    expect(() => decodeFile("not valid base64!")).toThrow(TRPCError);
    const oversized = Buffer.alloc(10 * 1024 * 1024 + 1).toString("base64");
    expect(() => decodeFile(oversized)).toThrow("Files must be 10 MB or smaller.");
  });

  it("normalizes tags and protects owner-only operations", () => {
    expect(normalizeTags(["Revision", "revision", "  Essays "])).toBe("revision,essays");
    expect(() => assertOwner(7, 8)).toThrow(TRPCError);
    expect(() => assertOwner(7, 7)).not.toThrow();
  });

  it("does not disclose internal storage references in a note response", () => {
    const view = toNoteView({
      id: 3, title: "Archive theory", description: "Reading guide", course: "History", term: "Spring", tags: "essay,revision", originalFileName: "guide.pdf", fileType: "pdf", mimeType: "application/pdf", fileSize: 2000, downloadCount: 1, createdAt: new Date(), updatedAt: new Date(), storageKey: "private/key", storageUrl: "/manus-storage/private/key", ownerId: 7,
    } as any, "Ada");
    expect(view).not.toHaveProperty("storageKey");
    expect(view).not.toHaveProperty("storageUrl");
    expect(view).not.toHaveProperty("ownerId");
    expect(view.tags).toEqual(["essay", "revision"]);
  });

  it("passes query matching, file-type filtering, and sort preferences to the search layer", async () => {
    dbMocks.searchNotes.mockResolvedValue([{ id: 22, title: "Biology revision", course: "Biology", term: null, tags: "revision,cell", fileType: "pdf", downloadCount: 9, createdAt: new Date("2026-08-01"), ownerName: "Ada" }]);
    const caller = notesRouter.createCaller(authContext);

    const result = await caller.search({ query: "biology", fileType: "pdf", sort: "downloads", page: 1, pageSize: 12 });

    expect(dbMocks.searchNotes).toHaveBeenCalledWith({ query: "biology", fileType: "pdf", sort: "downloads", page: 1, pageSize: 12 });
    expect(result.items).toMatchObject([{ title: "Biology revision", tags: ["revision", "cell"], uploaderName: "Ada" }]);
  });

  it("increments the download count server-side before returning a file URL", async () => {
    dbMocks.getNoteById.mockResolvedValue({ id: 12, storageUrl: "/manus-storage/notes/guide.pdf", originalFileName: "guide.pdf", downloadCount: 4 });
    dbMocks.incrementNoteDownloadCount.mockResolvedValue({ downloadCount: 5 });
    const caller = notesRouter.createCaller(authContext);

    await expect(caller.registerDownload({ noteId: 12 })).resolves.toEqual({ downloadUrl: "/manus-storage/notes/guide.pdf", fileName: "guide.pdf", downloadCount: 5 });
    expect(dbMocks.incrementNoteDownloadCount).toHaveBeenCalledWith(12);
  });
});
