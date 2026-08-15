# AMOLED Dark-Mode Verification

## Production desktop — initial public-route review

The live Vercel alias was opened with `?theme=dark&build=a8b5992`. The public Library entry route rendered the black grid, pale-lilac editorial type, new Study Shelf logo, and the header theme picker correctly. The protected Upload route correctly displayed its Google sign-in gate using the same AMOLED dark composition and supplied logo while unauthenticated. The authenticated Upload, Note Detail, and My Notes designs were separately reviewed in the managed preview at desktop and mobile sizes with the dark override enabled.

The public production captures for Note Detail and My Notes also displayed their route-specific sign-in gates with the same theme, logo, navigation, and Google sign-in treatment. Access to the authenticated production route interiors requires a user session, so the authenticated preview evidence remains the direct visual check for form, detail, and collection surfaces.

At 390×844, the production Library and Upload entry views retained readable editorial headings, the new compact logo treatment, the direct icon theme toggle beside navigation, and the dark gradient card without overflow. The Google sign-in call to action remained touch-friendly and legible.

The production Note Detail mobile route retained the same clean dark entry presentation. The My Notes entry route also rendered dark correctly, but its rotated hero panel exposed a horizontal document scrollbar at the narrow viewport; a final overflow containment adjustment is required before release.

After the containment deployment, the live 390×844 My Notes dark capture no longer exposed a horizontal scrollbar. The long “Keep your contributions in view” sign-in heading is now clipped rather than scrollable at that width, so its mobile type scale still needs a final responsive adjustment.
