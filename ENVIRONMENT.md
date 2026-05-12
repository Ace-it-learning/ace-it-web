# Ace it! Environment Configuration Guide

This document explains how the application switches between **DEV** (Azure stack) and **PROD** (Firebase + GCP stack) environments.

## Stack Matrix

| Layer | DEV (Local/Azure) | PROD (Firebase/GCP) |
|-------|-------------------|---------------------|
| **Auth** | Azure Entra (MSAL) | Firebase Auth |
| **Database** | Azure Cosmos DB | Firebase Firestore |
| **AI / LLM** | Deepseek API | Google Gemini / Vertex AI |
| **Storage** | Azure Blob Storage | Google Cloud Storage |
| **Hosting** | Azure App Service / Static Web Apps | Firebase Hosting + Cloud Run |

## Environment Variables

The following environment variables control which stack is active. They must be set in `/backend/.env` and `/frontend/.env.development` (or `.env.production`).

### Backend (`/backend/.env`)

| Variable | Values | Description |
|----------|--------|-------------|
| `AUTH_PROVIDER` | `entra` / `firebase` | Controls authentication backend. Use `entra` for Azure DEV. |
| `DATA_PROVIDER` | `cosmos` / `firebase` / `dual` | Controls database backend. Use `cosmos` for Azure DEV. `dual` writes to both Cosmos and Firestore. |
| `STORAGE_PROVIDER` | `azure` / `gcs` | Controls object storage backend. Use `azure` for Azure DEV. |
| `AI_PROVIDER` | `deepseek` / `azure_openai` / `groq` / `google` | Controls AI gateway. Use `deepseek` for Azure DEV. |
| `NODE_ENV` | `development` / `production` | General environment flag. Affects rate limits, error messages, and Firebase hard-guard. |

### Frontend (`/frontend/.env.development`)

| Variable | Values | Description |
|----------|--------|-------------|
| `VITE_USE_ENTRA` | `true` / `false` | When `true`, Firebase SDK is not initialized and MSAL is used for auth. |
| `VITE_ENTRA_CLIENT_ID` | *GUID* | Azure AD application client ID. |
| `VITE_ENTRA_AUTHORITY` | *URL* | Azure AD authority URL (e.g., `https://login.microsoftonline.com/{tenant}/v2.0`). |
| `VITE_API_URL` | *URL* | Backend API base URL. |

## How It Works

### Backend Bootstrap (`server.js`)

On startup, `server.js` reads `AUTH_PROVIDER` and `DATA_PROVIDER` to decide whether to initialize Firebase Admin:

```javascript
const needsFirebase = forceProduction || 
                      AUTH_PROVIDER === 'firebase' || 
                      DATA_PROVIDER === 'firebase' || 
                      DATA_PROVIDER === 'dual';
```

- If `needsFirebase` is `true`: Firebase Admin is initialized as before.
- If `needsFirebase` is `false`: Firebase Admin is skipped and the server logs the active Azure stack.

This means in a pure Azure DEV environment (`AUTH_PROVIDER=entra`, `DATA_PROVIDER=cosmos`), **no Firebase service account keys are required**.

### Repository Switching (`repositories/index.js`)

The data access layer automatically selects the correct repository implementation:

```javascript
const primary = isAzureData()
    ? { userRepo: new AzureUserRepository(), ... }
    : { userRepo: new FirestoreUserRepository(), ... };
```

All active routes and services use `createRepositories()` to get the appropriate repository. Direct Firestore access (`global.db`, `admin.firestore()`) only exists in legacy maintenance scripts.

### AI Gateway (`services/GenerativeAIService.js`)

`GenerativeAIService` reads `AI_PROVIDER` to select the active adapter:

- `deepseek` → Deepseek API (`deepseek-chat` / `deepseek-reasoner`)
- `azure_openai` → Azure OpenAI Service
- `groq` → Groq API
- `google` / `vertex` → Google AI Studio / Vertex AI (PROD only)

### Frontend Auth (`context/AuthContext.jsx`)

The frontend reads `VITE_USE_ENTRA` to decide which auth flow to use:

- `VITE_USE_ENTRA=true` → MSAL (`@azure/msal-browser`) for Entra login/logout
- `VITE_USE_ENTRA=false` → Firebase Auth for email/password and Google login

When `VITE_USE_ENTRA=true`, `firebase.js` does **not** call `initializeApp()`, so no Firebase SDK network requests are made.

## Legacy Code

The following directories contain legacy code for the old Firebase/GCP stack. They are preserved for PROD compatibility but are not loaded in Azure DEV:

- `backend/repositories/firestore/` — Firestore repository implementations
- `backend/scripts/legacy/firestore/` — Firestore-only maintenance scripts (backups, wipes, audits)
- `backend/server_backup_20260410.js` — Old server snapshot

## Switching Between Stacks

To switch a DEV environment back to Firebase (e.g., for testing PROD parity):

```bash
# backend/.env
AUTH_PROVIDER=firebase
DATA_PROVIDER=firebase
AI_PROVIDER=google

# frontend/.env.development
VITE_USE_ENTRA=false
VITE_FIREBASE_API_KEY=...
# ... other Firebase vars
```

Then restart both frontend and backend.

## Migration Status

| Phase | Status |
|-------|--------|
| Backend bootstrap (conditional Firebase init) | ✅ Complete |
| Repository pattern (Azure / Firestore switch) | ✅ Complete |
| AI gateway (Deepseek / Gemini switch) | ✅ Complete |
| Auth middleware (Entra / Firebase switch) | ✅ Complete |
| Frontend auth (MSAL / Firebase switch) | ✅ Complete |
| Service layer direct Firestore access | ✅ Complete (no direct access in active services/routes) |
| Legacy scripts archive | ✅ Complete |
| Environment documentation | ✅ Complete |
