import { describe, expect, it } from "vitest";
import { creatorCredit } from "./SiteFooter";

describe("SiteFooter", () => {
  it("keeps the requested creator credit exact", () => {
    expect(creatorCredit).toBe("Made with ❤️ by Supratik");
  });
});
