# Entra External ID Branding and User Flow Checklist

This runbook implements Phase 2 of the Azure-only login UX plan.

## Scope

- Keep Microsoft Entra External ID as the only auth provider.
- Reduce user perception of third-party redirection.
- Ensure Google login path is enabled and optimized.

## Prerequisites

- Tenant: `aceitdev` (or your active External ID tenant).
- External Identities admin access in Azure.
- Brand assets prepared:
  - Square logo (PNG, transparent background recommended)
  - Background image (1920x1080+)
  - Short brand footer text

## Step 1: Verify tenant and app alignment

1. Open Azure Portal and switch to your External ID tenant.
2. Confirm app registration IDs used by frontend env:
   - `VITE_ENTRA_CLIENT_ID`
   - `VITE_ENTRA_AUTHORITY`
3. Confirm redirect URI exists:
   - `http://localhost:3005/login`

## Step 2: Configure company branding

Path: `Entra ID -> External Identities -> Custom Branding`

1. Upload your AceIt logo and background image.
2. Set page layout to partial/full-screen as preferred.
3. Set page title and subtitle to AceIt language.
4. Disable optional footer links where policy allows:
   - Privacy and cookies
   - Terms of use
5. Save and preview.

## Step 3: Validate user flow and identity providers

Path: `Entra ID -> External Identities -> User flows`

1. Open the active sign-in/sign-up flow used by your app.
2. Ensure these identity providers are enabled:
   - Email (local account)
   - Google (social)
3. Ensure Google appears as an enabled provider in that flow.
4. Confirm claims include:
   - `email`
   - `name`
   - `sub` or equivalent stable ID

## Step 4: Reduce extra provider-selection friction

1. In app UX, keep separate CTA buttons:
   - Continue with Google
   - Continue with Email
2. Keep frontend `domain_hint=google.com` and account prompt behavior.
3. Validate expected behavior:
   - Clicking Google should usually jump directly to Google account chooser.
   - Fallback provider chooser page should be rare and still branded.

## Step 5: Tenant health checks for self-service flows

1. Confirm self-service sign-up settings are enabled at tenant level.
2. Confirm user flow create/edit actions are available (not disabled).
3. If disabled, resolve directory policy restrictions before release.

## Acceptance Criteria

- Branded page no longer feels like generic Microsoft login.
- Google path is one-click from app CTA in normal cases.
- Email flow still works and returns token with required claims.
- Existing user mappings continue to resolve by email on backend.
