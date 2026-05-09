# Entra Custom Domain Rollout

This runbook implements Phase 3 of the Azure-only login UX plan.

## Goal

Serve authentication from a first-party domain, for example:

- `auth.aceit-learning.com`

Instead of tenant-hosted domain URLs.

## Prerequisites

- DNS access for `aceit-learning.com`.
- Azure access to configure custom domain for External ID.
- If required by your tenant setup, Azure Front Door profile.

## Step 1: Add custom domain in Entra External ID

1. Open Azure Portal in your External ID tenant.
2. Go to custom domain section for External ID/CIAM.
3. Add `auth.aceit-learning.com`.
4. Copy verification TXT record details.

## Step 2: Verify DNS ownership

1. In DNS provider, add TXT record provided by Azure.
2. Wait for propagation.
3. Complete verification in Azure.

## Step 3: Bind domain to edge endpoint

1. If required, configure Azure Front Door endpoint.
2. Add custom domain mapping to Front Door.
3. Enable HTTPS/TLS certificate for the domain.
4. Confirm cert status is `Issued`.

## Step 4: Update app configuration

Update frontend env authority values:

- `VITE_ENTRA_AUTHORITY=https://auth.aceit-learning.com/<tenant_or_policy_path>`

Keep redirect URI as:

- `VITE_ENTRA_REDIRECT_URI=http://localhost:3005/login` (DEV)

For deployed environments, use deployed callback URL.

## Step 5: Validate redirect and token flows

1. Login with Google and Email from app.
2. Confirm browser address bar stays on custom auth domain.
3. Confirm backend token validation still passes:
   - issuer (if custom issuer used)
   - audience
4. Confirm `/api/user/resolve-identity` returns uid/email.

## Browser checks

Run smoke tests on:

- Chrome
- Edge
- Safari

Focus on redirect/cookie behavior and silent session restore.

## Rollback

If custom domain has outage/misconfiguration:

1. Revert `VITE_ENTRA_AUTHORITY` to Microsoft tenant authority.
2. Restart frontend deployment.
3. Keep backend token validation issuer aligned with active authority.
