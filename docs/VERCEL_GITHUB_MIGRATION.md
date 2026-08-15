# Study Shelf: Vercel and GitHub Migration Guide

## Purpose and current migration state

This repository now contains a **Vercel build contract**, a **GitHub Actions verification workflow**, an **external environment-variable template**, and a **Supabase SQL migration** for the notes library. These files make the source repository ready to connect to GitHub and import into Vercel.

The current live application uses Manus-managed OAuth, database procedures, and storage helpers. Those managed services are not portable as-is to Vercel. Before the Vercel site can provide authenticated uploads, note search, and downloads, the application runtime must be switched from the existing Manus service layer to Supabase Auth, Postgres, Storage, and the Vercel Function endpoints described below. Do not expose the service-role key in client code or version control. A safe copyable variable-name template is available in [`docs/vercel-environment.example.txt`](./vercel-environment.example.txt).

## External architecture

| Existing responsibility | Vercel and Supabase replacement | Notes |
|---|---|---|
| Manus OAuth | Supabase Auth with Google provider | Configure Google OAuth in Supabase and add the Vercel production and preview redirect URLs. |
| MySQL and Drizzle note records | Supabase Postgres `public.notes` | Apply `supabase/migrations/20260815_study_shelf.sql`; row-level security limits edit and removal to the uploader. |
| Managed object storage | Private Supabase Storage `notes` bucket | The migration constrains size and MIME types at bucket level; ownership is scoped to the user UUID folder. |
| tRPC upload and download procedures | Vercel Functions plus Supabase RPC | Use a short-lived signed upload URL for files and call `register_note_download` server-side before returning a signed download URL. |
| Managed environment values | Vercel Project Environment Variables | Add values separately for Development, Preview, and Production. |

> Vercel Function request bodies are limited to 4.5 MB. Study Shelf supports note files up to 10 MB, so the browser must upload directly to Supabase Storage using a short-lived signed upload URL. A Vercel Function should validate metadata and issue the signed URL; it must not proxy file bytes through the function.[1]

## Repository configuration

The root `vercel.json` configures Vercel to run `pnpm run build:vercel`, publish `dist/public`, and rewrite client routes to `index.html` so direct visits to `/upload`, `/my-notes`, or `/notes/<id>` continue to work. Vercel documents this SPA rewrite pattern for Vite applications.[2]

The `build:vercel` script disables Manus-only Vite runtime and debug plugins. It produces a static client bundle suitable for Vercel. The GitHub Actions workflow runs the test suite, TypeScript checker, and Vercel-specific build for every pull request and every push to `main`.

## Required Supabase setup

Create a Supabase project, open its SQL Editor, and run `supabase/migrations/20260815_study_shelf.sql`. The SQL creates the `profiles` and `notes` tables, an authenticated shared-library policy, owner-only modification policies, a download-count RPC, a private `notes` bucket, and file access policies.

In **Authentication → Providers**, enable Google. In **Authentication → URL Configuration**, add your Vercel production URL and any desired preview URLs. Copy the project URL and publishable key from the Supabase Connect panel. Keep the service-role key server-only.

| Vercel variable | Scope | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Client build | Supabase project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client build | Public key used with Supabase Row Level Security. |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel Function only | Creates signed upload/download URLs after server-side authentication and validation. |
| `APP_ORIGIN` | Vercel Function only | Production application origin used for redirect allowlists. |

## Required application migration

Before deployment, replace the existing Manus-only dependencies in `client/src/_core/hooks/useAuth.ts`, `client/src/const.ts`, `server/`, and the tRPC calls with the following service boundaries:

1. Create a browser Supabase client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
2. Replace the Manus sign-in action with `supabase.auth.signInWithOAuth({ provider: 'google' })`, using the active Vercel URL as the redirect destination.
3. Replace `notes.search`, `notes.getById`, `notes.myUploads`, `notes.update`, and `notes.remove` hooks with Supabase Postgres queries protected by the SQL policies.
4. Implement a Vercel Function that validates the file extension, MIME type, metadata, and 10 MB maximum before issuing a signed Supabase upload URL. Upload file bytes directly from the browser to Storage.
5. Implement a Vercel Function that verifies the bearer token, calls `public.register_note_download`, and returns a short-lived signed download URL. This keeps download counting server-side.

Supabase’s React documentation uses `@supabase/supabase-js` with the project URL and publishable key held in Vite environment variables, and emphasizes reviewing Row Level Security before production deployment.[3]

## GitHub and Vercel deployment steps

1. Export this project to a new GitHub repository through the project’s GitHub integration or push the source to a repository you control. Do not commit `.env.local`.
2. In Vercel, import the GitHub repository. Vercel automatically supports GitHub-driven deployments; pushes and pull requests receive deployments by default.[4]
3. Add the Supabase variables in **Vercel → Project Settings → Environment Variables**, using Production, Preview, and Development scopes deliberately.
4. Set the Vercel build command to `pnpm run build:vercel` and output directory to `dist/public` if Vercel does not read `vercel.json` automatically.
5. Configure the Google OAuth redirect URLs in both Google Cloud and Supabase for the Vercel production domain. Add your custom domain after the first successful deployment.
6. Push to a non-main branch first and verify the Vercel preview. Confirm sign-in, direct Storage upload, library search, owner-only note editing/removal, signed downloads, and download-count increments before merging to `main`.

## Data and rollout caution

Existing notes and user records in the managed project are not automatically copied to Supabase by this repository configuration. Migrate only data you have permission to export, and test the process in a Supabase development project first. Keep the existing managed deployment available until the Vercel deployment has passed a complete end-to-end review.

## References

[1]: https://vercel.com/docs/functions/limitations "Vercel Functions Limits"
[2]: https://vercel.com/docs/frameworks/frontend/vite "Vite on Vercel"
[3]: https://supabase.com/docs/guides/getting-started/quickstarts/reactjs "Use Supabase with React"
[4]: https://vercel.com/docs/git/vercel-for-github "Deploying GitHub Projects with Vercel"
