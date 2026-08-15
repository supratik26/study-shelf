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

The Supabase dashboard session remains available. A read-only query for the approved uploader’s Auth user record has been staged in a fresh SQL Editor tab to support policy verification without requesting another rate-limited passwordless email.

The SQL Editor was found to retain the prior policy-migration text alongside the new read-only lookup. No query was run. The editor exposes a Monaco model API, so the stale text will be replaced with a single, verified read-only query before any further database verification.

The stale query was safely replaced. The SQL Editor visibly contains only a single `SELECT` against `auth.users` for the approved uploader email and is ready for read-only execution.

The requested site-wide creator credit was published in commit `056e000`. Vercel marked the production deployment Ready, and the clean production domain visibly renders the exact text “Made with ❤️ by Supratik” in the footer.

A transaction-scoped owner RLS test is staged in the authenticated Supabase SQL Editor. It simulates the approved user’s JWT claims, attempts an insert matching the owner and email, produces a verification row only if the RLS policy permits the action, and ends with `ROLLBACK` so no test note or file is retained.

Before the staged rollback-only test could run, the Supabase dashboard session expired. The query was not executed and no database changes were made; the test must be re-opened after the dashboard session is restored.

After the session was restored, the rollback-only test completed successfully and returned `owner note insertion accepted by RLS`. The transaction ended with `ROLLBACK`, so no test note or storage object was retained.

A paired rollback-only non-owner test is staged and verified. It simulates an unrelated authenticated user and treats only `insufficient_privilege`—the expected RLS denial—as success; any other error or an unexpected allowed insert surfaces as a failure. The final `ROLLBACK` preserves the database state.

The non-owner test completed successfully and returned `non-owner note insertion denied by RLS`, while the owner test returned the matching acceptance result. Direct endpoint tests also verify that `/api/upload-access` reports `canUpload: true` only for the approved Gmail and that `/api/upload-ticket` returns a signed-upload ticket only for that owner, rejecting a signed-in non-owner before storage is reached. The complete test suite now has 17 passing tests.

The shared production browser remained unauthenticated after repeated existing-link attempts and showed Supabase’s `email rate limit exceeded` response when the owner email was present. No more email requests will be made until the rate limit is cleared or an available project setting safely raises it.

Supabase Auth Rate Limits shows the project is configured to send only **2 emails per hour**, which explains the repeated magic-link delivery block. The dashboard allows this setting to be changed; any increase must be confirmed by the owner because it changes an anti-abuse control.

The owner approved an increase to 6 emails per hour. The standard form-entry attempt did not retain the new value, so the currently displayed setting remains 2 and no rate-limit change has yet been saved.

The Supabase dashboard exposes the email rate as a disabled input (`RATE_LIMIT_EMAIL_SENT`), so the project cannot raise the 2-email-per-hour cap through this configuration screen. The rate-limit adjustment remains unapplied; the existing API, policy, and unit verification evidence is unaffected.

The owner selected the documented verification option that accepts the completed Supabase policy simulations, live anonymous endpoint checks, and endpoint-handler tests instead of waiting for the locked default email cap to reset. Commit `032d682` was published to GitHub and its Vercel deployment is in progress.

Vercel completed the deployment for commit `032d682` successfully and marked it Ready. The clean production alias remains `https://study-shelf-notes.vercel.app` and continues to serve the completed Study Shelf application.

The Vercel production deployment for commit `346f0f4` is ready. The clean production URL serves the revised navigation: the Upload entry is absent for a visitor without approved uploader access, while the Library and My Notes routes remain available. This matches the intended read-only member experience before sign-in.
