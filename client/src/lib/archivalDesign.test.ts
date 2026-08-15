import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");
const header = readFileSync(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");
const gate = readFileSync(new URL("../components/SignInGate.tsx", import.meta.url), "utf8");
const card = readFileSync(new URL("../components/NoteCard.tsx", import.meta.url), "utf8");
const library = readFileSync(new URL("../pages/Library.tsx", import.meta.url), "utf8");
const myNotes = readFileSync(new URL("../pages/MyNotes.tsx", import.meta.url), "utf8");
const bootstrap = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");

describe("archival redesign contracts", () => {
  it("keeps the warm-paper archival system and pastel note-card hooks", () => {
    expect(css).toContain("--paper: #fffaf0");
    expect(css).toContain("--ink: #151c4a");
    expect(css).toContain(".archive-note-card--sage");
    expect(css).toContain(".archive-note-card--rose");
    expect(css).toContain(".archive-card-number");
    expect(css).toContain(".archive-display");
  });

  it("uses the production Study Shelf logo in the shared entry points", () => {
    expect(header).toContain('https://files.manuscdn.com/user_upload_by_module/session_file/310519663891328980/xGcShWuEiTUvfPve.png');
    expect(gate).toContain("archive-hero-shelf");
    expect(gate).toContain("archive-hero-wordmark");
    expect(gate).not.toContain("archive-hero-logo");
  });

  it("keeps the AMOLED dark palette and theme toggle styling available", () => {
    expect(css).toContain("html.dark");
    expect(css).toContain("--paper: #000000");
    expect(css).toContain("--foreground: #ebe6ff");
    expect(css).toContain(".theme-toggle");
    expect(css).toContain(".dark .archive-note-card--sage");
    expect(css).toContain(".dark .archive-upload-frame");
    expect(css).toContain(".dark .archive-detail-panel");
    expect(css).toContain(".dark .archive-managed-note");
    expect(css).toContain("@media (max-width: 639px)");
    expect(css).toContain(".archive-landing-title { font-size: clamp(2.45rem, 12vw, 3.4rem)");
  });

  it("keeps note cards numbered and cycles their six pastel tones", () => {
    expect(card).toContain('const tones = ["sage", "sky", "peach", "lilac", "butter", "rose"]');
    expect(card).toContain('String(cardNumber).padStart(2, "0")');
    expect(card).toContain("archive-note-card--${tone}");
    expect(library).toContain("cardNumber={index + 1}");
  });

  it("uses Google/Supabase sign-in from the external deployment header", () => {
    expect(header).toContain("startExternalGoogleSignIn");
    expect(header).toContain("if (!isExternalDeployment) { startLogin(); return; }");
    expect(header).toContain("handleSignIn");
  });

  it("defaults external query collections while Supabase data is still loading", () => {
    expect(library).toContain("externalNotesQuery.data ?? []");
    expect(myNotes).toContain("externalMyNotes.data ?? []");
  });

  it("suppresses non-essential redesign motion when reduced motion is requested", () => {
    expect(css).toContain(".archive-hero-card");
    expect(css).toContain(".motion-card");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("*, *::before, *::after { animation-duration: 0.01ms !important");
    expect(css).toContain('html[data-reduced-motion-verify="true"]');
    expect(bootstrap).toContain('get("motion") === "reduce"');
  });
});
