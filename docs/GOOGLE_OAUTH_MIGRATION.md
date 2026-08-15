# Google OAuth Migration Notes

## Live provider state

The Study Shelf Supabase project (`swrvvehuxwkqhrlrznmk`) currently has the **Google** provider disabled. Its provider form identifies the required Google OAuth callback URL as:

`https://swrvvehuxwkqhrlrznmk.supabase.co/auth/v1/callback`

To enable Google-only sign-in, a Google Cloud OAuth **Web application** client must be created. It requires the Study Shelf production origin (`https://study-shelf-notes.vercel.app`) as an authorized JavaScript origin and the callback URL above as an authorized redirect URI. The resulting client ID and client secret must be entered in the Supabase Google provider form, with the provider enabled and nonce checks left enabled.

The browser client will replace `signInWithOtp` with `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })`. Supabase retains the signed-in user email, so existing owner-only upload authorization can continue to require `supratikkundu2006@gmail.com`.

## Operational note

Once Google Sign-In is live, the email sign-in UI and email-provider user guidance must be removed. The Supabase Email provider should be disabled only after Google OAuth has been configured and the replacement flow has been tested.

## Google Cloud access check

The project owner is signed in to Google Cloud as `supratikkundu2006@gmail.com`. Google Cloud currently directs the account to its multi-factor-authentication enrollment screen before a project can be selected or an OAuth client can be created. Google’s required account-security enrollment must therefore be completed before this migration can continue.

After that check, Google Cloud confirmed that the owner account has no selectable existing projects. A new, no-billing OAuth configuration project must be created solely to hold the Study Shelf Google OAuth client.

The project has been named **Study Shelf Authentication**. It is being created without an organization or billing account and will be used only for the Google OAuth consent configuration and web-client credentials.

Google Cloud confirmed successful creation of the `study-shelf-authentication` project. It is ready to be selected so the OAuth consent and web-client settings can be created.

The console’s project-created notification offers a **Select Project** action for the new `study-shelf-authentication` project. The automated element handler encountered a Google Cloud console client-side recursion error, so project selection will continue through the console’s direct navigation state rather than repeating that failed click.

The `study-shelf-authentication` project is now active in Google Cloud. Its dashboard exposes the OAuth consent-screen and credential configuration routes required for the Study Shelf Google provider.

Google Auth Platform reports that this new project is not yet configured. The next required configuration begins with **Get started**, then completes branding, audience, Google profile/email scopes, and a web OAuth client.

The Google consent screen has been given the visible application name **Study Shelf**. The remaining consent configuration requires the owner’s support email, public-app audience selection, and owner contact email before client credentials can be created.

The consent screen now uses `supratikkundu2006@gmail.com` as its support email. This associates student questions about Google Sign-In with the Study Shelf owner.

During the audience-step transition, the browser session navigated away from the Google Cloud setup screen. The previously entered app name and support contact must be checked after reopening the same Google Cloud configuration URL before proceeding.

Reopening the incomplete Google Auth Platform wizard showed that its fields had not been persisted. The consent configuration will therefore be completed in one active browser session before navigating away, to retain the Study Shelf name and owner support contact.

The active wizard now shows the Study Shelf app-information step as complete. Its audience step requires **External**, because Study Shelf is intended for students using any Google account rather than an organization-managed internal audience.

The external audience is now selected. Google Auth Platform requires `supratikkundu2006@gmail.com` as the owner contact address before it will create the consent configuration.

The owner Gmail contact has been accepted in the wizard. The final consent-screen step is now ready to be completed, after which the Study Shelf web OAuth client can be created.

The final step references the Google API Services User Data Policy. The policy was reviewed after the owner approved acceptance; it requires accurate disclosure, minimum necessary Google data access, and keeping OAuth credentials confidential. Study Shelf will request only basic identity, email, and profile scopes for sign-in.

Opening the policy reference displaced the incomplete wizard before the agreement could be selected. The Google Auth Platform setup URL has been reopened; the approved consent setup will be completed inside this active wizard without following the policy link again.

The browser session subsequently returned to a blank tab while recovering the wizard. The authenticated Google Cloud setup URL can be reopened directly, but the loading state must be allowed to settle before any further configuration interaction.

An attempt to complete the approved consent setup in one active browser session progressed through the early wizard stages but encountered a dynamic-form timing mismatch before confirming the owner contact stage. The final consent configuration has not been created yet; the active wizard state must be inspected before retrying with a narrower step-by-step fallback.

The wizard has been recovered to the contact step and the owner email has again been accepted as a contact chip. The next action will advance only to the final policy-confirmation step, where the owner has already granted approval to accept the policy.

With the owner’s explicit confirmation, the Google API Services User Data Policy checkbox was accepted through the actual consent control and the wizard’s final continuation action was submitted. The Google Auth Platform consent configuration should now be provisioned and needs verification before the web OAuth client is created.

The consent configuration creation was submitted and Google Auth Platform entered its processing state. Once provisioning completes, the next action is to create a web OAuth client with the Study Shelf production origin and the Supabase callback URL.

Google Auth Platform confirmed that the Study Shelf OAuth configuration was created successfully. The web OAuth client setup has been opened and now requires the production JavaScript origin and Supabase callback URL.

The OAuth client form confirms that **Web application** is the correct client type for Study Shelf’s Vercel-hosted React app. After selecting it, the client will be named and configured with `https://study-shelf-notes.vercel.app` as its authorized JavaScript origin and `https://swrvvehuxwkqhrlrznmk.supabase.co/auth/v1/callback` as its authorized redirect URI.

The Google client form is initialized with the Web application type. A direct scripting attempt to edit its controlled fields was rejected by the browser runtime, so the named client and its endpoint entries will be completed through the form’s supported controls instead.

The Google Cloud client form again lost its active browser surface before its fields could be entered. The project and consent configuration remain created, but completion of the client credentials now requires either a stable user-takeover session or a resumed Cloud Console tab before the final endpoint fields can be saved.

The owner completed the web OAuth client form. Google Cloud created **Study Shelf Web** with the required `https://study-shelf-notes.vercel.app` authorized JavaScript origin and `https://swrvvehuxwkqhrlrznmk.supabase.co/auth/v1/callback` redirect URI. Its client credentials are available in the authenticated Google Cloud page and must be transferred directly to Supabase without recording secret values in project files or chat.

The Google OAuth client secret has been copied within the authenticated browser session for direct insertion into Supabase. The Supabase Google provider page is open and will receive the client ID and copied secret before the provider is enabled.

The Supabase session was reauthenticated successfully. The Google provider form is ready, currently disabled, and exposes fields for the client ID and client secret. Nonce checks and email requirements will retain their secure defaults; the existing Email provider remains enabled only until Google sign-in is verified.

The Google OAuth client ID has been entered into the Supabase provider form. The client-secret field is focused, ready to receive the secret directly from the authenticated browser clipboard; the secret value is not stored in project files or documentation.

The client secret has now been placed in the Supabase Google provider form through the protected browser field. Credential values remain excluded from source code and project documentation. The next steps are enabling Google sign-in and saving the provider configuration with the default secure nonce and email requirements unchanged.

Supabase confirmed that the Google provider settings were saved successfully and now lists Google as **Enabled**. The client secret remains protected in Supabase; Email authentication remains temporarily enabled only until the application’s Google-only interface and redirect flow are verified.
