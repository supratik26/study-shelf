# Owner-Only Upload Authorization Notes

## Intended authorization model

The approved uploader is `supratikkundu2006@gmail.com`. The Vercel upload-ticket endpoint compares the authenticated Supabase email with the server-only `UPLOAD_OWNER_EMAIL` setting before issuing any signed upload URL. The browser uses a read-only upload-access endpoint only to tailor the interface; server authorization remains authoritative.

The additional Supabase migration removes the previous authenticated-user insert/upload policies and replaces them with policies that require both ownership of the UUID folder and the approved Gmail in the authenticated JWT. The existing SQL Editor tab contains a previous base migration rather than a clean owner-only migration query, so it must not be executed again; a new query tab will be used for the reviewed supplemental policy SQL.

No owner-only policy SQL has been executed yet. An attempt to create a separate SQL snippet did not persist a selection in the dashboard menu, so the current editor query remains unchanged and must still not be run.

The Supabase dashboard session then expired before a fresh query could be entered. The owner-only SQL migration remains unapplied, and the Vercel deployment must not be released until that policy and the matching `UPLOAD_OWNER_EMAIL` environment variable are configured.

The Vercel project session remains active and its Environment Variables settings are available. The Supabase browser page still displayed its account sign-in form after the user reported signing in, so the policy application must wait until the dashboard session is visibly restored in this browser.

The Vercel environment-variable page then became unavailable in the browser after a stale-control error; no Vercel setting was changed. The page must be reopened before adding `UPLOAD_OWNER_EMAIL`.

The Vercel environment-variable form is now open. It is configured for the existing Production and Preview scope, which is appropriate for the live production site and its generated previews.

Vercel now has a server-only `UPLOAD_OWNER_EMAIL` setting for Production and Preview, set to the approved Gmail address. Vercel confirmed that a new deployment is required before the value can take effect.

After the user reported completing the Supabase sign-in, the automated browser returned to a blank page instead of an observable SQL Editor session. No database policy was applied; the reviewed policy SQL remains pending until the Supabase session is accessible in the shared browser.

The Supabase session is now visibly restored and a blank SQL Editor query is open. The first automated text-entry attempt did not populate the editor, so no SQL has been run; the editor will be safely populated by another controlled input method before execution.

The editor is confirmed to use a Monaco `textarea` with `aria-label="Editor content"`. This is the only target that will be used for the reviewed supplemental policy SQL.

The Supabase SQL Editor now visibly contains only the reviewed supplemental migration: it removes the former authenticated-user note and Storage insert policies, then creates policies limiting each action to the authenticated owner UUID and approved Gmail address. The query is ready to run.

The dashboard’s destructive-operation confirmation was accepted and the owner-only policy query was submitted. Supabase reported that the query is running; completion must be confirmed before deployment.

Supabase completed the query successfully with no rows returned. The approved Gmail is now required by both the `public.notes` insert policy and the private `notes` Storage insert policy.

The Vercel server setting and Supabase policy are complete, and the local implementation passed all tests and the Vercel build. The local Git commit is `346f0f4`, but GitHub rejected three verified write attempts with HTTP 403 / “Resource not accessible by integration” despite the account reporting repository admin access. The Vercel-linked `main` branch therefore still needs a refreshed GitHub connection or user-authorized push before the code can deploy.

GitHub authorization was refreshed successfully and commit `346f0f4` was published to `main`. Vercel automatically created the production deployment “Restrict external uploads to library owner”; it was building at the latest check.

After the first deployment exposed an ESM helper-resolution defect in the new `/api/upload-access` function, commit `1dd8de8` was published with explicit `.js` extensions for every local Vercel API helper import. Vercel automatically started the repair deployment, which was still building at the latest check.

The repair deployment remained in Vercel’s build state during two subsequent checks. Its final status and the live API smoke test are still pending.

Vercel completed the repair deployment for commit `1dd8de8` successfully. The `main`-branch production deployment is marked Ready at `https://study-shelf-b5fry382e-supratik1.vercel.app`; the clean production alias will now be used for endpoint verification.

The repaired `https://study-shelf-notes.vercel.app/api/upload-access` endpoint now returns the expected `401` JSON response for an anonymous request rather than a runtime module error. This confirms the function loads successfully and does not expose upload access before authentication.

The repaired production `/api/upload-ticket` and `/api/download` endpoints were also smoke-tested anonymously and each returned their expected `401` JSON response rather than a module-resolution failure. A subsequent owner sign-in attempt was blocked by Supabase’s email rate limit, so the signed-in owner allow-path and live upload remain pending until delivery is available again.

The Vercel production deployment for commit `346f0f4` is ready. The clean production URL serves the revised navigation: the Upload entry is absent for a visitor without approved uploader access, while the Library and My Notes routes remain available. This matches the intended read-only member experience before sign-in.
