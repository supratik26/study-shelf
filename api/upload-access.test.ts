import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthorizedUser: vi.fn(),
}));

vi.mock("./_supabase.js", () => ({
  getAuthorizedUser: mocks.getAuthorizedUser,
}));

import handler from "./upload-access";

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

describe("upload-access endpoint", () => {
  beforeEach(() => {
    process.env.UPLOAD_OWNER_EMAIL = "supratikkundu2006@gmail.com,devilluciferbest@gmail.com";
    mocks.getAuthorizedUser.mockReset();
  });

  it("allows only the configured owner after authentication", async () => {
    mocks.getAuthorizedUser.mockResolvedValue({ email: "SUPRATIKKUNDU2006@gmail.com" });
    const { response, body } = createResponse();

    await handler({ method: "GET", headers: {} }, response);

    expect(response.statusCode).toBe(200);
    expect(body.value).toEqual({ canUpload: true });
  });

  it("allows the additional configured upload administrator after authentication", async () => {
    mocks.getAuthorizedUser.mockResolvedValue({ email: "DEVILLUCIFERBEST@gmail.com" });
    const { response, body } = createResponse();

    await handler({ method: "GET", headers: {} }, response);

    expect(response.statusCode).toBe(200);
    expect(body.value).toEqual({ canUpload: true });
  });

  it("keeps signed-in non-owners read-only", async () => {
    mocks.getAuthorizedUser.mockResolvedValue({ email: "friend@example.com" });
    const { response, body } = createResponse();

    await handler({ method: "GET", headers: {} }, response);

    expect(response.statusCode).toBe(200);
    expect(body.value).toEqual({ canUpload: false });
  });
});
