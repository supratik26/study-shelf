import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("./supabase", () => ({
  assertSupabaseConfigured: vi.fn(),
  isExternalDeployment: true,
  supabase: { auth: { getSession: mocks.getSession } },
}));

import { getExternalUploadAccess, normalizeTags } from "./externalNotes";

describe("external upload access", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    mocks.getSession.mockReset();
  });

  it("asks the server for publisher access and keeps non-owner members read-only", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: { access_token: "member-token" } } });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ canUpload: false }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getExternalUploadAccess()).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledWith("/api/upload-access", { headers: { Authorization: "Bearer member-token" } });
  });

  it("does not request publisher access without an authenticated session", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getExternalUploadAccess()).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("normalizes malformed legacy tag values so card rendering never receives an undefined array", () => {
    expect(normalizeTags(undefined)).toEqual([]);
    expect(normalizeTags("revision, chemistry")).toEqual(["revision", "chemistry"]);
    expect(normalizeTags('["lecture", "summary"]')).toEqual(["lecture", "summary"]);
  });
});
