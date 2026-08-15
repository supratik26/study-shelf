import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthorizedUser: vi.fn(),
  getServerSupabase: vi.fn(),
}));

vi.mock("./_supabase.js", () => ({
  getAuthorizedUser: mocks.getAuthorizedUser,
  getServerSupabase: mocks.getServerSupabase,
}));

import handler, { canIssueUploadTicket, validateUploadMetadata } from "./upload-ticket";

function createResponse() {
  const body: { value?: unknown } = {};
  const response = {
    statusCode: 0,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(value: unknown) {
      body.value = value;
    },
    setHeader: vi.fn(),
  };
  return { response, body };
}

describe("Vercel upload ticket validation", () => {
  beforeEach(() => {
    process.env.UPLOAD_OWNER_EMAIL = "supratikkundu2006@gmail.com,devilluciferbest@gmail.com";
    mocks.getAuthorizedUser.mockReset();
    mocks.getServerSupabase.mockReset();
  });

  it("accepts a supported PDF within the maximum upload size", () => {
    expect(validateUploadMetadata({ fileName: "revision.pdf", fileType: "pdf", mimeType: "application/pdf", fileSize: 1_024 })).toEqual({ ok: true, fileType: "pdf" });
  });

  it("rejects mismatched MIME types and oversized file metadata server-side", () => {
    expect(validateUploadMetadata({ fileName: "revision.pdf", fileType: "pdf", mimeType: "text/plain", fileSize: 1_024 }).ok).toBe(false);
    expect(validateUploadMetadata({ fileName: "lecture.pptx", fileType: "pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileSize: 10 * 1024 * 1024 + 1 }).ok).toBe(false);
  });

  it("issues signed upload tickets only for configured owner emails", () => {
    const owners = "supratikkundu2006@gmail.com,devilluciferbest@gmail.com";
    expect(canIssueUploadTicket("supratikkundu2006@gmail.com", owners)).toBe(true);
    expect(canIssueUploadTicket("DEVILLUCIFERBEST@gmail.com", owners)).toBe(true);
    expect(canIssueUploadTicket("FRIEND@example.com", owners)).toBe(false);
    expect(canIssueUploadTicket("supratikkundu2006@gmail.com", undefined)).toBe(false);
  });

  it("returns a signed-upload ticket to the approved owner", async () => {
    mocks.getAuthorizedUser.mockResolvedValue({ id: "owner-id", email: "supratikkundu2006@gmail.com" });
    const createSignedUploadUrl = vi.fn().mockResolvedValue({ data: { token: "signed-token" }, error: null });
    mocks.getServerSupabase.mockReturnValue({ storage: { from: vi.fn().mockReturnValue({ createSignedUploadUrl }) } });
    const { response, body } = createResponse();

    await handler({ method: "POST", headers: {}, body: { fileName: "notes.pdf", fileType: "pdf", mimeType: "application/pdf", fileSize: 1024 } }, response);

    expect(response.statusCode).toBe(200);
    expect(body.value).toMatchObject({ token: "signed-token", path: expect.stringMatching(/^owner-id\/.+\.pdf$/) });
    expect(createSignedUploadUrl).toHaveBeenCalledOnce();
  });

  it("returns a signed-upload ticket to the additional approved administrator", async () => {
    mocks.getAuthorizedUser.mockResolvedValue({ id: "co-owner-id", email: "devilluciferbest@gmail.com" });
    const createSignedUploadUrl = vi.fn().mockResolvedValue({ data: { token: "second-owner-token" }, error: null });
    mocks.getServerSupabase.mockReturnValue({ storage: { from: vi.fn().mockReturnValue({ createSignedUploadUrl }) } });
    const { response, body } = createResponse();

    await handler({ method: "POST", headers: {}, body: { fileName: "notes.pdf", fileType: "pdf", mimeType: "application/pdf", fileSize: 1024 } }, response);

    expect(response.statusCode).toBe(200);
    expect(body.value).toMatchObject({ token: "second-owner-token", path: expect.stringMatching(/^co-owner-id\/.+\.pdf$/) });
  });

  it("denies a signed-in non-owner before it can request an upload ticket", async () => {
    mocks.getAuthorizedUser.mockResolvedValue({ id: "friend-id", email: "friend@example.com" });
    const { response, body } = createResponse();

    await handler({ method: "POST", headers: {}, body: { fileName: "notes.pdf", fileType: "pdf", mimeType: "application/pdf", fileSize: 1024 } }, response);

    expect(response.statusCode).toBe(403);
    expect(body.value).toEqual({ error: "Only the library owner may publish notes." });
    expect(mocks.getServerSupabase).not.toHaveBeenCalled();
  });
});
