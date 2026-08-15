# Project TODO

- [x] Apply the editorial brand system: off-white/cream, deep indigo, amber, and site-wide Lora typography.
- [x] Build responsive top navigation with Library, Upload, My Notes, and seamless Manus OAuth controls.
- [x] Add a notes database schema with metadata, storage references, owner relationship, download count, and search indexes.
- [x] Generate and apply the notes database migration.
- [x] Implement server-side file upload validation for PDF, DOCX, PPTX, TXT, and Markdown files, including a size limit.
- [x] Store validated note files in S3-compatible storage and retain metadata in the database.
- [x] Add authenticated search, filtering, sorting, note detail, owner management, and server-side download-count procedures.
- [x] Build the editorial Notes Library page with search, filters, cards, skeletons, and no-results states.
- [x] Build the authenticated drag-and-drop Upload page with picker fallback, feedback, and error handling.
- [x] Build the Note Detail page with full metadata and a download action that registers the download server-side.
- [x] Build the My Notes page with edit metadata and remove-from-library actions restricted to the note owner.
- [x] Add responsive states, accessible controls, toast feedback, loading skeletons, empty states, and error states across the app.
- [x] Add and run Vitest coverage for validation, authorization, searching, and download-count behavior.
- [x] Run type checks, production build, and visual verification on desktop and mobile.
- [ ] Save a final checkpoint and deliver the completed website.
- [x] Add explicit authentication-loading states to each protected route before rendering its main interface.
- [x] Extend Vitest coverage for search query, file-type filtering, and sorting contracts.
