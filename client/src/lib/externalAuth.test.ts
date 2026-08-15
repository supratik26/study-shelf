import { describe, expect, it } from "vitest";
import { getExternalGoogleSignInOptions } from "./externalAuth";

describe("getExternalGoogleSignInOptions", () => {
  it("starts Google OAuth and returns users to the current Study Shelf route", () => {
    expect(getExternalGoogleSignInOptions({ origin: "https://study-shelf-notes.vercel.app", pathname: "/my-notes" } as Location)).toEqual({
      provider: "google",
      options: { redirectTo: "https://study-shelf-notes.vercel.app/my-notes" },
    });
  });

  it("does not encode a magic-link email address in the OAuth request", () => {
    const options = getExternalGoogleSignInOptions({ origin: "https://study-shelf-notes.vercel.app", pathname: "/" } as Location);
    expect(options).not.toHaveProperty("email");
    expect(options.options).not.toHaveProperty("emailRedirectTo");
  });
});
