import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./ThemeContext.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const header = readFileSync(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");

describe("Study Shelf theme system", () => {
  it("uses system preference by default and persists an explicit user choice", () => {
    expect(source).toContain('export type ThemePreference = Theme | "system"');
    expect(source).toContain('const THEME_STORAGE_KEY = "study-shelf-theme-preference"');
    expect(source).toContain('window.matchMedia("(prefers-color-scheme: dark)")');
    expect(source).toContain('window.localStorage.setItem(THEME_STORAGE_KEY, preference)');
    expect(source).toContain('new URLSearchParams(window.location.search).get("theme")');
    expect(app).toContain('defaultTheme="system"');
    expect(app).toContain("switchable");
  });

  it("exposes an accessible header control for manual theme changes", () => {
    expect(header).toContain("useTheme");
    expect(header).toContain("toggleTheme");
    expect(header).toContain("ThemePicker");
    expect(header).toContain('label: "System"');
    expect(header).toContain("setTheme(option.value)");
  });
});
