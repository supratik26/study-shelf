import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("Study Shelf typography system", () => {
  it("loads DM Serif Display and Source Sans 3 from Google Fonts", () => {
    expect(html).toContain("family=DM+Serif+Display");
    expect(html).toContain("family=Source+Sans+3");
  });

  it("uses the serif face for editorial headings and the sans-serif face for interface text", () => {
    expect(css).toContain('--font-interface: "Source Sans 3"');
    expect(css).toContain('--font-editorial: "DM Serif Display"');
    expect(css).toContain("body {");
    expect(css).toContain("font-family: var(--font-interface)");
    expect(css).toContain("h1, h2, h3, h4, h5, h6 { font-family: var(--font-editorial); }");
  });
});
