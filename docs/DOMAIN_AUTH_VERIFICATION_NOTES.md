# Production Domain and Authentication Verification Notes

## 2026-08-15

The live site at `https://study-shelf-kappa.vercel.app` delivered a Supabase passwordless sign-in email successfully. The browser used for automated verification still displayed the signed-out gate after the user reported opening the link, so that browser session cannot independently prove the user's separate email/browser session.

Vercel's domain settings initially showed `study-shelf-kappa.vercel.app` as the only configured production domain, with a valid configuration. Vercel accepted the requested replacement alias `study-shelf.vercel.app` syntactically and presented a confirmation that can preserve the former address as a redirect to the new one. However, Vercel then reported that `study-shelf.vercel.app` is already aliased to a deployment on another account. The change was cancelled, leaving the current production domain intact. An alternative clean alias that does not include “kappa” can still be evaluated.

The next candidate entered for availability validation is `study-shelf-notes.vercel.app`. Vercel accepted this alternative and configured it as the production domain. The previous `study-shelf-kappa.vercel.app` domain now performs a 307 redirect to the new domain, preserving existing shared links.

Supabase authentication URL configuration must now use `https://study-shelf-notes.vercel.app` as the site URL and allow this same URL as an approved redirect destination before issuing new magic links from the new domain.

The authenticated Supabase URL Configuration screen is open. Its interactive fields were still loading at the latest check, so the configuration must be inspected once the form is rendered.

The Supabase Site URL field is now populated with `https://study-shelf-notes.vercel.app` and is ready to save. The existing redirect allowlist still contains only the previous Vercel URL, so the new address must be added separately after the site URL is saved.

Supabase confirmed that the Site URL was updated successfully. The Add New Redirect URLs dialog is open and ready for `https://study-shelf-notes.vercel.app`; the former Vercel address will remain permitted for continuity.

Supabase confirmed that the new production address was added to the redirect allowlist successfully. It now permits both `https://study-shelf-kappa.vercel.app` and `https://study-shelf-notes.vercel.app`, while the Site URL uses the new clean address.

The new production address `https://study-shelf-notes.vercel.app` serves the current Study Shelf passwordless sign-in experience. Visiting the previous address automatically redirects to the new domain, confirming that existing links remain usable.

The user confirmed opening the production magic link after the email was sent. The automated browser session remained separate from the user’s email/browser session and therefore could not display that session cookie directly; the Supabase user-list screen did not finish rendering during a subsequent corroboration attempt. The passwordless flow is considered user-confirmed, with server-side URL configuration and both sign-in entry points verified.
