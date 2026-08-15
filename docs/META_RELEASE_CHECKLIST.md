# BurmeseBridge — Meta release checklist

Updated: 2026-08-15

## App details

- App name: `BurmeseBridge`
- Website: `https://burmesebridge.eu.cc`
- App domain: `burmesebridge.eu.cc`
- Privacy policy: `https://burmesebridge.eu.cc/en/privacy`
- Terms of service: `https://burmesebridge.eu.cc/en/terms`
- User data deletion: `https://burmesebridge.eu.cc/en/data-deletion`
- App icon: `https://burmesebridge.eu.cc/brand-icon-1024.png`
- Supabase OAuth callback for Meta: `https://zoxixufbhagfhltfmeef.supabase.co/auth/v1/callback`
- Requested permissions: `public_profile`, `email`

## Use-case description

> BurmeseBridge uses Facebook Login only to let users create and authenticate an account. We request public_profile and email. We use the Facebook user identifier, name, email address, and profile image to create the platform account, display the user's profile, and protect account security. We do not request friends, Page, advertising, messaging, or publishing permissions and do not publish to Facebook on the user's behalf.

## Reviewer instructions

1. Visit `https://burmesebridge.eu.cc/en/login`.
2. Select **Facebook** under “or continue with”.
3. Complete the Facebook consent screen using a reviewer account.
4. After authorization, the app exchanges the OAuth code through `/auth/callback` and redirects to `https://burmesebridge.eu.cc/en/me`.
5. Confirm that the user is signed in and the account profile is available.
6. The user can review the privacy policy and request deletion through the footer links.

## Screencast plan

Record one continuous video showing:

1. The public BurmeseBridge login page and domain.
2. Clicking the Facebook button.
3. The Facebook consent screen with only `public_profile` and `email`.
4. Successful return to the BurmeseBridge profile page.
5. The privacy policy section “Service providers and Facebook Login”.
6. The User Data Deletion page and deletion instructions.

Do not show passwords, access tokens, app secrets, personal documents, or unrelated browser tabs.

## Data-handling answer notes

- Data collected: Facebook user identifier, name, email address, and profile image when available.
- Purpose: account creation, authentication, profile display, support, fraud prevention, and account security.
- Processors: Supabase for authentication/database and Vercel for hosting.
- Sale or sharing: personal data is not sold. It is disclosed only to service providers needed to operate the platform or where legally required.
- Security: HTTPS, database row-level security, role-based access controls, private payment evidence storage, and administrative audit records.
- Retention: retained while the account is active and only as needed for legal, security, fraud-prevention, transaction, and dispute obligations.
- Deletion: verified requests are normally processed within 30 days; social-login associations and related profile data are deleted or anonymized.
- Prohibited uses: no friends, Page, ads, private-message access, or publishing on the user's behalf.

## Business verification — owner action required

1. In the Meta app dashboard, open **Settings → Basic → Verification**.
2. Connect the app to the correct Meta Business Portfolio.
3. Start business verification as a Business Portfolio administrator.
4. Enter the legal entity name, registered address, phone number, and website exactly as shown in official records.
5. Upload only documents Meta requests. Names and addresses must match the form.
6. Complete domain/email/phone confirmation if offered.
7. Return to the app dashboard after approval and confirm the business is shown as verified.

If no legal company or accepted organization exists, do not submit invented details or altered documents. Development-mode Facebook Login remains limited to app-role users until Meta grants the required public access.

## App Review — final owner action required

1. Finish the Data Handling Questions and Data Protection Assessment shown in the dashboard.
2. Request only `public_profile` and `email`; remove any unused permission.
3. Paste the use-case description and reviewer instructions above.
4. Upload the continuous screencast.
5. Confirm all public URLs work without login.
6. Submit for review only after a real Facebook login succeeds end to end.
