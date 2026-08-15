import { describe, expect, it } from "vitest";
import { canIssueUploadTicket, validateUploadMetadata } from "./upload-ticket";

describe("Vercel upload ticket validation", () => {
  it("accepts a supported PDF within the maximum upload size", () => {
    expect(validateUploadMetadata({ fileName: "revision.pdf", fileType: "pdf", mimeType: "application/pdf", fileSize: 1_024 })).toEqual({ ok: true, fileType: "pdf" });
  });

  it("rejects mismatched MIME types and oversized file metadata server-side", () => {
    expect(validateUploadMetadata({ fileName: "revision.pdf", fileType: "pdf", mimeType: "text/plain", fileSize: 1_024 }).ok).toBe(false);
    expect(validateUploadMetadata({ fileName: "lecture.pptx", fileType: "pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileSize: 10 * 1024 * 1024 + 1 }).ok).toBe(false);
  });

  it("issues signed upload tickets only for the configured owner email", () => {
    expect(canIssueUploadTicket("supratikkundu2006@gmail.com", "supratikkundu2006@gmail.com")).toBe(true);
    expect(canIssueUploadTicket("FRIEND@example.com", "supratikkundu2006@gmail.com")).toBe(false);
    expect(canIssueUploadTicket("supratikkundu2006@gmail.com", undefined)).toBe(false);
  });
});
