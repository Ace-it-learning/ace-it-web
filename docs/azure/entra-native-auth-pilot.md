# Entra Native Authentication Pilot (Email Only)

This runbook implements Phase 4 of the Azure-only login UX plan.

## Objective

Pilot native authentication for email/password journeys only, while keeping social login (Google) on redirect flow.

## Important limitation

Google/social sign-in generally remains browser-redirect based in current Entra External ID native auth patterns.

## Pilot strategy

- Keep current redirect flow as baseline.
- Add native auth behind a feature flag for DEV only.
- Measure success and keep rollback immediate.

## Feature flag

Frontend env flag proposal:

- `VITE_ENTRA_NATIVE_AUTH=false` (default)

Enable only in pilot branch/environment.

## Step 1: Azure app registration settings

1. Open app registration used by frontend.
2. Go to Authentication -> Advanced settings.
3. Enable native authentication if available for your tenant setup.
4. Save.

## Step 2: Frontend pilot implementation scope

1. Keep Google button on existing redirect flow.
2. Route email/password actions to native auth path only when:
   - `VITE_ENTRA_NATIVE_AUTH=true`
3. Keep current redirect path as fallback.

## Step 3: Validation matrix

Test each path:

- Email signup success
- Email login success
- Forgot password flow
- Session restore after refresh
- Google redirect login unchanged
- Backend uid mapping and profile load

## Metrics to compare

- Login completion rate
- Login drop-off rate at first auth step
- Median time-to-dashboard
- Auth-related error rate from frontend logs

## Go/No-Go criteria

Go only if all are true:

- No increase in auth failures.
- Better or equal completion rate.
- No regression in profile resolution or progress continuity.

## Rollback

1. Set `VITE_ENTRA_NATIVE_AUTH=false`.
2. Redeploy frontend.
3. Verify email and Google both work via redirect flow.
