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
- [x] Save a final checkpoint and deliver the completed website.
- [x] Add explicit authentication-loading states to each protected route before rendering its main interface.
- [x] Extend Vitest coverage for search query, file-type filtering, and sorting contracts.
- [x] Deliver the completed website checkpoint to the user.
- [x] Audit managed Manus dependencies that block direct external hosting.
- [x] Select a supported external deployment target and compatible replacements for authentication, database, and file storage.
- [x] Adapt the project’s runtime and configuration for the selected provider.
- [x] Implement the Vercel-compatible Supabase authentication, notes data, signed-upload, and signed-download runtime.
- [x] Add provider-specific deployment files, environment-variable templates, and external-hosting documentation.
- [x] Verify the external-ready build and deliver the migration handoff.
- [x] Replace the unavailable external Google provider with a working Supabase passwordless sign-in flow.
- [x] Verify the passwordless sign-in route and redeploy the corrected Vercel build.
- [x] Define the Vercel serverless runtime boundary and Supabase service mapping for Study Shelf.
- [x] Add a non-secret Vercel and Supabase environment-variable template and reference it in the migration guide.
- [x] Add GitHub Actions continuous-integration checks for type checking, tests, and production builds.
- [x] Write a step-by-step GitHub, Supabase, and Vercel deployment guide, including required manual configuration.
- [x] Verify the Vercel-ready project configuration and provide the external hosting handoff.
- [x] Deliver the completed Vercel and GitHub deployment handoff to the user.
- [x] Make the external header sign-in control open the same passwordless email-link flow as the access gate.
- [x] Confirm the production Vercel alias serves the current passwordless-auth build.
- [x] Complete an end-to-end passwordless sign-in test and verify protected library access on the live production site.
- [x] Check availability of a cleaner Vercel address without the current “kappa” suffix and configure it if available.
- [x] Update Supabase authentication URL configuration to trust the new Vercel production domain.
- [x] Record the owner-approved decision to defer an additional observable same-browser passwordless session because the default email service is capped at 2 emails/hour.
- [x] Record the owner-approved decision to rely on existing Auth-user, policy, and endpoint evidence rather than another rate-limited production session check.
- [x] Restrict note-upload authorization to the owner’s approved Gmail address while retaining authenticated downloads for all other users.
- [x] Add regression tests for owner-only upload authorization in both the browser data layer and Vercel upload-ticket endpoint.
- [x] Verify the owner-only upload restriction through deployed anonymous-denial checks, production RLS simulations, direct endpoint tests, and documented ownership settings.
- [x] Apply the reviewed owner-only note and Storage policy migration in Supabase before releasing the Vercel change.
- [x] Configure the matching owner Gmail in Vercel as the server-only `UPLOAD_OWNER_EMAIL` environment variable.
- [x] Restore GitHub write authorization for the Vercel-linked repository and publish local commit `346f0f4` to `main`.
- [x] Fix Vercel ESM local-module resolution for the upload and download serverless endpoints, then redeploy and smoke-test them.
- [x] Verify owner and non-owner authorization through production RLS simulations and direct endpoint-handler tests, accepted by the owner in lieu of another rate-limited email session.
- [x] Verify owner upload-ticket issuance and non-owner denial through endpoint-handler regression tests after the ESM deployment repair.
- [x] Smoke-test the production download endpoint after the ESM fix with the expected anonymous-authentication denial behavior.
- [x] Record the owner-approved deferral of another same-browser magic-link flow because Supabase default email delivery is rate-limited.
- [x] Record the available Supabase Auth user, RLS, and endpoint verification evidence in the deployment notes.
- [x] Accept production policy and endpoint-handler verification in lieu of a rate-limited live owner test upload, as selected by the owner.
- [x] Document the final production policy, endpoint, email-rate-limit, and creator-footer verification results in the deployment notes.
- [x] Add direct unit coverage for the upload-access endpoint’s owner-allow and non-owner-deny responses.
- [x] Investigate the owner-approved Supabase Auth email-limit adjustment and record that the default provider locks the setting at 2 emails/hour.
- [x] Add a site-wide footer credit reading “Made with ❤️ by Supratik” in the Study Shelf editorial style.
- [x] Configure Vitest to discover the footer component’s `.tsx` regression test.
- [x] Confirm the live Vercel deployment renders the “Made with ❤️ by Supratik” footer credit.
- [x] Prepare the final external-hosting handoff with the live URL, GitHub repository, sign-in instructions, ownership policy, and future deployment steps.
- [x] Include in the final handoff that additional same-browser magic-link testing was owner-deferred because the default Supabase email service is capped at 2 emails/hour.
- [x] Create a concise user-facing external-hosting handoff artifact for Study Shelf.
- [x] Replace the Lora-only type system with DM Serif Display for editorial headings and Source Sans 3 for interface text.
- [x] Add regression coverage that confirms the new Google Fonts configuration and global font-role tokens.
- [x] Verify and publish the live typography refresh on Vercel.
- [x] Open the ready production domain and verify the computed DM Serif Display heading and Source Sans 3 interface font families.
- [x] Refresh and revalidate the Vercel production alias against the latest ready deployment after the reported `DEPLOYMENT_NOT_FOUND` error.
- [x] Confirm the live alias renders in an actual mobile viewport and document the exact revalidation action.
- [x] Select and configure a custom SMTP provider for Supabase passwordless-email delivery (superseded by the owner-approved Google-only sign-in route).
- [x] Verify the custom SMTP configuration and update the Study Shelf sign-in guidance (superseded by Google-only sign-in).
- [x] Replace the Resend-only route with a Gmail-verified SMTP provider that does not require a custom domain (provider research completed; the route was superseded by Google-only sign-in).
- [x] Verify the owner Gmail sender identity and configure Supabase with the selected provider’s SMTP credentials (superseded by Google-only sign-in).
- [x] Configure the owner Gmail account for SMTP using a dedicated Google app password (superseded by Google-only sign-in).
- [x] Apply and verify the Gmail SMTP credentials in Supabase Auth for passwordless sign-in emails (superseded by Google-only sign-in).
- [x] Replace passwordless email authentication with Google Sign-In for the external Vercel deployment.
- [x] Configure the Google OAuth client, Supabase provider settings, and production redirect URLs.
- [x] Preserve owner-only uploads by checking the signed-in Google account email.
- [x] Test and publish the Google-only sign-in experience with updated regression coverage and documentation.
- [x] Disable Supabase Email authentication after the deployed Google-only flow is verified.
- [x] Repair the GitHub Actions pnpm bootstrap so the Google Sign-In release verification can pass remotely.
- [x] Review the supplied animation CSS and JSX, then map suitable motion patterns to Study Shelf components.
- [x] Add accessible animation tokens, entrance motion, hover feedback, search focus treatment, and mobile-menu transitions.
- [x] Verify reduced-motion behavior, responsive rendering, tests, and the production build before publishing the animation update.
- [x] Audit the existing animation system and map iOS-style spring, press, and layered-surface patterns to Study Shelf.
- [x] Implement iOS-style motion tokens, tactile interactions, and polished mobile-menu transitions.
- [x] Verify the iOS-style refinement across responsive layouts, reduced-motion settings, tests, and the production build.
- [x] Verify non-essential iOS-style motion is suppressed under a reduced-motion preference.
- [x] Publish the iOS-style motion refinement and validate the live deployment on desktop and mobile.
- [x] Capture explicit production evidence that the deployed Study Shelf interface renders correctly at a 390 × 844 mobile viewport.
- [x] Audit the supplied Study Shelf UI references and map their archival editorial patterns to the working application.
- [x] Publish the supplied Study Shelf logo as a production-safe static brand asset.
- [x] Redesign shared navigation, authentication gate, and library browsing around the new archival grid and pastel-note-card system.
- [x] Redesign upload, note detail, and My Notes experiences while preserving all existing data and authorization flows.
- [x] Add regression coverage and verify the redesigned interface across desktop, mobile, reduced-motion, and the production build.
- [x] Restore Google/Supabase sign-in in the redesigned logged-out header and mobile navigation.
- [x] Add regression coverage for logo usage, archival layout hooks, and numbered pastel note cards.
- [x] Verify redesigned screens explicitly under the reduced-motion preference before release.
- [x] Perform browser-level reduced-motion verification for the redesigned library, upload, and personal collection screens.
- [x] Capture and review authenticated reduced-motion renderings of the upload and personal collection interfaces.
- [x] Fix the production runtime error caused by incomplete note metadata in the redesigned library.
- [x] Correct Study Shelf logo crop, scale, and alignment in the responsive header and landing treatment.
- [x] Add regression coverage and verify the production repair on desktop and mobile.
- [x] Capture and review the repaired live production landing page at a true mobile viewport.
- [x] Trace and eliminate the persistent undefined-length crash reported from the older mobile production bundle.
- [x] Confirm the Vercel alias points to the fixed bundle and provide an explicit cache-refresh recovery path.
- [x] Confirm the live alias references the final repaired JavaScript asset after deployment.
- [x] Deliver explicit mobile cache-refresh guidance for any browser still holding the older error bundle.
- [x] Add a persistent light, dark, and system-aware theme preference with a header control.
- [x] Replace the Study Shelf brand asset with the supplied AMOLED-compatible logo.
- [x] Apply the supplied AMOLED dark visual language across the shared layout and all primary screens.
- [x] Add theme regression coverage and verify dark mode on desktop, mobile, and production builds.
- [x] Add a persisted Light, Dark, and System theme picker to the header controls.
- [x] Apply and inspect AMOLED-specific dark treatments for upload, note detail, and personal collection screens.
- [x] Verify all primary screens in dark mode on desktop, mobile, and the live production deployment.
- [x] Verify the live production dark mode across every primary route at desktop size.
- [x] Verify the live production dark mode across every primary route at a true mobile viewport.
- [x] Eliminate the horizontal overflow exposed by the rotated dark hero on the My Notes mobile route.
- [x] Re-verify the live My Notes dark route at a phone viewport after deploying the overflow containment fix.
- [x] Adjust mobile sign-in headline sizing so long route-specific titles wrap without clipping.
- [x] Recheck the final live Upload and Note Detail dark mobile routes after the shared heading refinement.
- [x] Replace the oversized landing-card logo treatment with a cleaner integrated composition in light and dark themes.
- [x] Verify the refined landing composition across mobile, desktop, and the production build.
- [x] Restore the missing mobile navigation options in dark mode and keep every item visibly labelled.
- [x] Round the Study Shelf header logo treatment in both light and dark themes.
- [x] Authorize devilluciferbest@gmail.com alongside the existing owner for note uploads across server and Supabase enforcement.
- [x] Add regression coverage and verify the mobile menu, logo treatment, and dual-owner upload policy.
- [x] Verify the rounded header logo visually in final light and dark renders.
- [x] Confirm the Vercel deployment using the new dual-owner environment setting and validate second-owner upload access live where possible.
- [x] Inspect and record the rounded header logo in final light and dark visual renders.
- [x] Verify the second approved uploader through an authenticated production session, or document the exact session limitation.
- [x] Add page-specific AMOLED classes to the upload, note-detail, and personal collection layouts.
- [x] Capture explicit dark-mode desktop and mobile renderings for Library, Upload, Note Detail, and My Notes.


## Restore previous smooth deployment
- [x] Revert only the Quiet Observatory dashboard sync commits.
- [x] Preserve the prior authentication, notes, uploads, backend, and existing visual system.
- [x] Run typecheck and production build after restoration.
- [ ] Push the restoration to the Vercel-connected main branch.
- [ ] Confirm the restored production deployment is ready.

## High-refresh-rate fluidity
- [x] Eliminate avoidable main-thread work and render-time storage writes on common app paths.
- [x] Tune scroll surfaces, animation durations, and composited properties for smoother 120 Hz interactions.
- [x] Reduce expensive per-card animation and backdrop effects in list-heavy views.
- [x] Verify the typecheck, production build, and responsive rendering before publishing.
- [ ] Deploy the fluidity refinements to the Vercel-connected main branch.

## Goluu study assistant
- [x] Configure the user-provided OpenAI credential as a server-only Vercel environment variable.
- [x] Audit the deployed serverless runtime and existing AI-compatible configuration.
- [x] Add Goluu's accessible chat interface with useful study-library guidance and clear answer boundaries.
- [x] Implement a server-side chatbot endpoint that keeps provider credentials private.
- [x] Test the chat interaction and validate the production build.
- [x] Publish Goluu to Vercel and confirm the ready deployment.

## Goluu live-chat repair
- [x] Identify why Goluu’s composer is disabled for the current live visitor state.
- [ ] Restore an active OpenAI quota or replace the current provider credential.
- [ ] Improve Goluu’s unavailable-provider guidance for signed-in users.
- [ ] Verify a live signed-in chat request reaches Goluu’s production endpoint.
- [ ] Publish and confirm the repaired chat experience.

## Goluu free-tier provider option
- [ ] Verify current free-tier provider options that suit a Vercel serverless chatbot.
- [ ] Select a provider and configure its credential as a server-only Vercel variable.
- [ ] Update Goluu's endpoint and verify a live response within the provider's free limits.

## Goluu Gemini migration
- [ ] Store the user-provided Gemini key as a server-only Vercel environment variable.
- [ ] Update Goluu's provider adapter from OpenAI to Gemini.
- [ ] Deploy and confirm a live Gemini-powered Goluu reply.

## Goluu Gemini runtime repair
- [ ] Inspect the Gemini error from the user’s failed production request.
- [ ] Correct the provider credential, model, or request implementation indicated by runtime logs.
- [ ] Verify a successful Gemini answer through Goluu’s live endpoint.

## Study Shelf UI polish
- [x] Audit the desktop and mobile presentation for hierarchy, density, touch ergonomics, and feature discoverability.
- [x] Refine navigation, resource cards, Study Space, Goluu, empty states, and core action feedback.
- [x] Validate responsive visual changes, accessibility states, and production build before deployment.
- [x] Publish the polished interface to the Vercel-connected main branch.

## Adaptive Study Shelf logo
- [x] Audit the current header, favicon, and light/dark theme logo usage.
- [x] Generate a redesigned paired logo treatment for the warm-paper and AMOLED-dark themes.
- [x] Integrate the light and dark logo variants with smooth theme-aware switching.
- [x] Validate responsive header, favicon, type check, build, and Vercel release.

## High-performance motion system
- [x] Audit existing motion and identify the high-value interaction surfaces across Study Shelf.
- [x] Define a snappy timing scale, easing curves, and reduced-motion fallback for the archival interface.
- [x] Map animation patterns to navigation, cards, workspace actions, Goluu, forms, and state transitions.
- [x] Implement, profile, validate, and publish the approved motion system without regressing 120 Hz scrolling.

### Approved implementation stages
- [x] Build shared semantic motion utilities and strengthen reduced-motion safeguards.
- [x] Apply high-frequency motion to navigation, theme controls, library filtering, buttons, and note cards.
- [x] Add motion-safe feedback to study queues, collections, reminders, uploads, previews, and annotations.
- [x] Add Goluu panel, message, suggestion, loading, empty-state, and error-feedback motion.
- [x] Verify performance, responsive layouts, accessibility, production build, and Vercel release.

## Interface text-selection restrictions
- [x] Prevent long-press text selection and copying across the Study Shelf interface.
- [x] Preserve expected selection behavior inside PDF and file-preview surfaces.
- [x] Verify the mobile note-detail flow, production build, and Vercel release.

## Complete Study Shelf feature roadmap
- [x] Define and apply a safe persistence model for collections, study queue, annotations, requests, revisions, and reminders.
- [x] Add saved collections, a smart study queue, advanced filtering, recommendations, document preview, and note version history.
- [x] Add personal annotations, contribution requests, in-app and device revision reminders, and offline-friendly reading support.
- [x] Verify the complete experience across authentication, data safety, desktop, mobile, and reduced-motion states.
- [x] Publish the complete roadmap release to the Vercel-connected main branch.
