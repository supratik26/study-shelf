import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const library = readFileSync(new URL("../pages/Library.tsx", import.meta.url), "utf8");
const header = readFileSync(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");

describe("Study Shelf motion system", () => {
  it("defines shared motion timing and honors reduced-motion preferences", () => {
    expect(css).toContain("--duration-base: 260ms");
    expect(css).toContain("--ease-out: cubic-bezier(0.23, 1, 0.32, 1)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation-duration: 0.01ms !important");
  });

  it("uses staggered card motion and an animated mobile-menu surface", () => {
    expect(library).toContain('"--card-index": index');
    expect(library).toContain("library-search-input");
    expect(header).toContain("site-mobile-menu");
    expect(header).toContain("site-menu-button--open");
  });
});
