# UI Redesign Reference Notes

The supplied upload reference uses a centered, poster-like contribution panel with a pale mint frame, an oversized uppercase archival heading, a peach dashed drop zone, stacked labeled fields, and a wide butter-yellow publishing control. The implementation should preserve the existing owner-only validation while translating these visual cues into responsive, accessible form controls.

The supplied note-detail reference uses a two-column reading layout. A document-preview area occupies the left, while the right uses a soft butter panel for the dominant serif title, compact metadata, and clear download action. The implementation will retain the real note metadata and download behavior, rather than introducing the unsupported rating, verification, page-count, related-note, or save-to-collection features shown solely as visual reference material.

Desktop and 390px mobile checks confirm the reference-driven grid, paper background, pastel panels, navigation, numbered note cards, upload form, personal collection layout, and footer remain legible and responsive. On compact screens, the header compresses to a menu trigger and the upload fields deliberately stack to preserve usable control sizes.

The final verification suite passed with 29 tests, TypeScript validation, and a Vercel-targeted production build. The archival design regression suite confirms the deployed logo asset, the six-tone numbered-card system, the Google/Supabase external-header sign-in path, and the global reduced-motion rule that suppresses animation and transition duration across the redesigned surfaces.

A final browser-level check forced `prefers-reduced-motion: reduce` while opening the library, upload, and personal-collection routes. The captured library route rendered the redesigned landing experience without visible entrance motion. A second authenticated preview check used the same reduced-motion mode and directly rendered the protected upload form and personal collection dashboard; both stayed fully legible and stable with the suppression rule enabled.
