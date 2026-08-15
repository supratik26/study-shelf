# Vercel Alias Repair Notes

The user reported that `https://study-shelf-notes.vercel.app` returned Vercel `404 DEPLOYMENT_NOT_FOUND` on mobile.

At diagnosis, Vercel Domains reported `study-shelf-notes.vercel.app` as **Valid Configuration** and **Production**, with the legacy `study-shelf-kappa.vercel.app` redirecting to it. Vercel Deployments also showed the latest `main` production release, commit `8c612f6`, as **Ready** at `https://study-shelf-6wvfia1v1-supratik1.vercel.app`.

The next repair step is to reassign or refresh the production alias against that ready deployment, then verify the clean domain directly at a mobile viewport.

The latest ready deployment’s action menu includes **Assign Domain**. A direct menu-item click did not persist because of a browser menu-selection error, so the assignment will be retried from the deployment’s dedicated page rather than repeating the same action.

The latest deployment page confirms `study-shelf-notes.vercel.app` is listed under **Current Domains** for ready deployment `8c612f6`. A direct cache-busted request to the clean alias now renders the Study Shelf landing page correctly rather than returning `DEPLOYMENT_NOT_FOUND`, indicating the alias now points to the active release.

A representative Android mobile-browser request to the repaired clean alias also returned **HTTP 200**. The original 404 was therefore resolved without a destructive domain change: Vercel currently has the clean production alias assigned to the latest ready release.

Vercel’s domain screen completed its configuration refresh and reports `study-shelf-notes.vercel.app` as **Valid Configuration** and **Production**. The legacy `study-shelf-kappa.vercel.app` remains a 307 redirect to the clean address.

The clean domain’s **Refresh** control was explicitly invoked after the incident. Its completed state remains **Valid Configuration** and **Production**, confirming the active ready deployment keeps the alias without requiring a destructive reassignment.

The repaired alias was then loaded in a true Android-style mobile viewport (`390 × 844`). It returned the Study Shelf document title and hero heading, retained a `scrollWidth` of 390 (no horizontal overflow), and used `DM Serif Display` for the hero heading. This confirms the production site renders normally at mobile size rather than returning `DEPLOYMENT_NOT_FOUND`.
