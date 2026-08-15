# Study Shelf: Live Hosting Handoff

Study Shelf is live on Vercel at **[study-shelf-notes.vercel.app](https://study-shelf-notes.vercel.app)**. The source repository is **[github.com/supratik26/study-shelf](https://github.com/supratik26/study-shelf)**, and the connected `main` branch automatically deploys through Vercel.

| Topic | Details |
|---|---|
| Sign in | Use **Sign in to study**, enter an email address, then open the passwordless email link. |
| Upload permissions | Only the approved owner Gmail can access upload capability or obtain a signed upload ticket. Other signed-in students can browse and download notes. |
| Supported files | PDF, DOCX, PPTX, TXT, and Markdown files up to 10 MB. |
| Download tracking | Every download is registered server-side before its private file link is issued. |
| Future updates | Commit and push to `main`; Vercel automatically creates a new production deployment. |

## Verification status

The production release includes Supabase row-level-security checks for both the approved owner and a non-owner, deployed anonymous API-denial checks, and direct endpoint regression tests for owner upload-ticket issuance and non-owner denial. The full suite passes **17 tests**, TypeScript checks, and the Vercel production build.

> The default Supabase email provider is locked at **2 emails per hour** for this project. The owner chose not to wait for another same-browser magic-link test after that rate limit was reached. The deployed policy and endpoint verification evidence is documented in `docs/OWNER_UPLOAD_AUTHORIZATION_NOTES.md`.

The site footer now displays **“Made with ❤️ by Supratik.”**
