# Study Shelf: Live Hosting Handoff

Study Shelf is live on Vercel at **[study-shelf-notes.vercel.app](https://study-shelf-notes.vercel.app)**. The source repository is **[github.com/supratik26/study-shelf](https://github.com/supratik26/study-shelf)**, and the connected `main` branch automatically deploys through Vercel.

| Topic | Details |
|---|---|
| Sign in | Use **Continue with Google** and choose a Google account. No sign-in email is sent. |
| Upload permissions | Only the approved owner Gmail can access upload capability or obtain a signed upload ticket. Other signed-in students can browse and download notes. |
| Supported files | PDF, DOCX, PPTX, TXT, and Markdown files up to 10 MB. |
| Download tracking | Every download is registered server-side before its private file link is issued. |
| Future updates | Commit and push to `main`; Vercel automatically creates a new production deployment. |

## Verification status

The production release includes Supabase row-level-security checks for both the approved owner and a non-owner, deployed anonymous API-denial checks, direct endpoint regression tests for owner upload-ticket issuance and non-owner denial, and Google OAuth configuration coverage. The full suite passes **21 tests**, TypeScript checks, and the Vercel production build.

> Study Shelf now uses Google Sign-In instead of Supabase magic-link email. The Google OAuth client is scoped to the production Vercel origin and Supabase callback URL, while the owner-only upload check continues to use the signed-in account’s email address.

The site footer now displays **“Made with ❤️ by Supratik.”**

## Typography refresh

The site now uses **DM Serif Display** for its editorial headings and **Source Sans 3** for navigation, forms, buttons, and reading interface text. The typography regression tests, TypeScript check, and Vercel build pass; GitHub commit `0cb63e4` is deployed through the connected Vercel project and its production deployment is marked Ready. The live production domain was visually checked after that release, and computed styles confirmed `DM Serif Display, Georgia, serif` for the hero heading and `Source Sans 3, Arial, sans-serif` for interface controls.
