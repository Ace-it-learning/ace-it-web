# Ace it! — Agent Guide

## Project Overview

Ace it! is an AI-powered tutoring platform targeting HKDSE (Hong Kong Diploma of Secondary Education) English Language and Mathematics exam preparation. It provides adaptive learning through AI tutors, mock exams, diagnostics, speaking/writing/listening quests, micro-skill tracking, and gamification (XP, streaks, leveling).

The project is a full-stack JavaScript application with a React frontend and a Node.js/Express backend. Infrastructure is environment-dependent: **DEV runs on Azure**; **PROD runs on Firebase + Google Cloud**.

---

## Technology Stack

### Frontend
- **Framework**: React 19 (functional components + hooks only)
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3 (utility-first, mobile-first responsive design)
- **Routing**: React Router DOM 7
- **State Management**: React Context (Auth, Language, Avatar, Header)
- **Data Fetching**: SWR, Axios
- **UI Primitives**: Radix UI (Dialog), Framer Motion (animations), Lucide React (icons)
- **Math Rendering**: KaTeX, react-katex, rehype-katex, remark-math
- **Rich Text Editor**: TipTap (starter-kit, placeholder, underline)
- **Charts**: Chart.js, react-chartjs-2, Recharts
- **Payments**: Stripe (@stripe/react-stripe-js)
- **Authentication**: Azure AD (MSAL Browser) — DEV only. PROD retains Firebase Auth legacy.
- **Analytics**: react-ga4 (Google Analytics 4)
- **Internationalization**: i18next, react-i18next
- **Audio**: wavesurfer.js
- **Device Fingerprinting**: @fingerprintjs/fingerprintjs

### Backend
- **Runtime**: Node.js >= 18.0.0
- **Framework**: Express 5
- **Module System**: CommonJS (`require`/`module.exports`)
- **Authentication**: Azure AD / MSAL (via jwks-rsa, jsonwebtoken). Firebase Admin SDK removed in DEV.
- **Security**: Helmet, express-rate-limit, CORS
- **File Uploads**: Multer
- **Image Processing**: Sharp
- **OCR**: Tesseract.js, @azure/ai-form-recognizer
- **Email**: Nodemailer
- **Caching**: node-cache
- **Date/Time**: moment

### AI / ML Services
- **Primary AI Gateway (DEV)**: Deepseek API
- **Legacy AI (PROD — suspended)**: Google Gemini / Vertex AI (retained in production only; do not use in DEV)
- **Speech**: Google Cloud Speech-to-Text (@google-cloud/speech)
- **TTS**: Google Cloud Text-to-Speech (@google-cloud/text-to-speech)
- **Model Strategy (DEV)**:
  - Deepseek for all AI tasks (routing, chat, reasoning, essay grading)
- **Model Strategy (PROD — legacy)**:
  - `gemini-1.5-flash` / `gemini-3.1-flash` for high-speed routing, UI, and simple logic
  - `gemini-1.5-pro` / `gemini-3.5-pro` for deep reasoning, essay grading, and exam logic

### Databases & Storage
- **Primary Database (DEV)**: Azure Cosmos DB (@azure/cosmos) — single source of truth
- **Legacy Database (PROD)**: Firebase Firestore (NoSQL document store)
- **Relational Database**: PostgreSQL — **deprecated / removed in DEV**
- **Object Storage**: Azure Blob Storage (@azure/storage-blob) — DEV primary. Google Cloud Storage — PROD only.

### Infrastructure & Deployment
- **DEV Environment**: Azure (frontend + backend hosting)
- **PROD Environment**: Firebase Hosting (frontend), Google Cloud Run (backend), Google App Engine (`app.yaml`)
- **Containerization**: Docker (`backend/Dockerfile`, Node 20 slim base)
- **CDN/Static Assets**: Azure CDN — DEV; Firebase Hosting — PROD

> **Note**: Render hosting has been removed entirely.

---

## Directory Structure

```
/frontend                    React SPA (Vite)
  package.json               Frontend dependencies & scripts
  vite.config.js             Vite config with proxy to localhost:3001
  tailwind.config.js         Tailwind theme (primary: #ff6a00, darkMode: "class")
  eslint.config.js           ESLint flat config (React Hooks + Refresh)
  index.html                 Entry HTML
  postcss.config.js          PostCSS with autoprefixer
  /src
    /components              Reusable UI components
      /ace                   Ace-it specific components
      /auth                  Authentication components
      /common                Shared/common UI
      /dashboard             Dashboard widgets
      /diagnostic            Diagnostic flow components
      /exam                  Exam components
      /lab                   Lab/practice components
      /landing               Landing page sections
      /listening             Listening module components
      /maths                 Mathematics components
      /notebook              Notebook components
      /payment               Payment/stripe components
      /reading               Reading module components
      /shared                Shared layout primitives
      /speaking              Speaking module components
      /tutor                 Tutor chat components
      /utils                 Utility components (ScrollToTop, AnalyticsTracker, etc.)
      /writing               Writing module components
    /pages                   Route-level views
      /mock-eng              English mock exam pages
      /mock-math             Mathematics mock exam pages
    /context                 Global React contexts
      AuthContext.jsx
      AvatarContext.jsx
      HeaderContext.jsx
      LanguageContext.jsx
    /services                API client methods & business services
    /hooks                   Custom React hooks
    /utils                   Helper functions
    /assets                  Static assets
    /constants               App constants
    /data                    Static data files
    /layouts                 Page layout wrappers
      MainLayout.jsx
    main.jsx                 React entry point (StrictMode)
    App.jsx                  Root router component
    setupTests.js            Vitest setup (jsdom mocks)
    i18n.js                  i18n initialization
    index.css                Global styles
  /.env                      Environment variables (VITE_ prefix required)
  /.env.development
  /.env.production

/backend                     Node.js/Express API
  server.js                  Express app bootstrap & route mounting
  package.json               Backend dependencies & scripts
  app.yaml                   Google App Engine config (nodejs20)
  Dockerfile                 Container image (Azure DEV + Google Cloud Run PROD)
  nodemon.json               Nodemon dev config
  /routes                    API route handlers
    chatRoutes.js            Primary chat endpoint
    examRoutes.js            Exam management
    userRoutes.js            User profile & onboarding
    statsRoutes.js           Statistics & micro-skills
    profileRoutes.js         Gamification, skillmap, redemption
    englishMockRoutes.js     English mock exams
    speakingQuestRoutes.js   Speaking quests
    writingRoutes.js         Writing quests & grading
    diagnosticRoutes.js      Diagnostic assessments
    tutorRoutes.js           AI tutor routing
    adminRoutes.js           Admin tools & CMS
    paymentRoutes.js         Stripe payments
    ttsRoutes.js             Text-to-speech
    dataRoutes.js            Data operations
    debugRoutes.js           Debug utilities
    /english                 English-specific routes
      labRoutes.js
      writingLabRoutes.js
    /maths                   Mathematics-specific routes
      mathsChatRoutes.js
      mathsDiagnosticRoutes.js
      mathsExamRoutes.js
      mathsLabRoutes.js
  /services                  Core business logic
    GenerativeAIService.js   AI Gateway (Studio/Vertex failover)
    IntentRouter.js          Intent classification "brain"
    UserProfileService.js    User data management (Cosmos DB in DEV, Firestore in PROD)
    GamificationService.js   XP, streaks, leveling
    TokenService.js          Token usage logging
    TTSService.js            Text-to-speech
    SpeakingQuestService.js  Speaking quest logic
    WritingLabService.js     Writing lab & grading
    DiagnosticService.js     Diagnostic assessment engine
    EnglishMockService.js    English mock exam generation
    MockAssessmentService.js Mock assessment scoring
    OcrService.js            OCR processing
    CacheService.js          In-memory caching
    CosmosStore.js           Azure Cosmos DB adapter (primary data store in DEV)
    ... (and more)
  /repositories              Data access layer
    ChatRepository.js
    UserRepository.js
    UsageRepository.js
    index.js
  /middleware                Express middleware
    Auth0IdentityMiddleware.js
    requireResolvedUid.js
    SubscriptionGuard.js
  /prompts                   System prompt templates & utilities
    speakingAgent.js
    writingAgents.js
    examinerAgent.js
    auditorAgent.js
    ... (and more .js & .md prompts)
  /blueprints                Exam paper blueprints (JSON)
    Eng_Listening_Blueprint.json
    Eng_Reading_Blueprint.json
    Eng_Speaking_Blueprint.json
    Eng_Writing_Blueprint.json
    Math_Compulsory_Blueprint.json
  /config                    Azure credentials (DEV) & Firebase service account keys (PROD)
  /constants                 Domain constants
    dseScoring.js            HKEAA-aligned scoring logic
    microSkills.js           47-skill taxonomy
    mathMicroSkills.js       Math micro-skills
    ...
  /tests                     Backend tests
    dseScoring.test.js       DSE scoring unit tests (node runner)
    azureMigrationSmoke.test.js
  /scripts                   One-off & maintenance scripts

/firebase                    Firebase config & security rules (PROD-only)
  firestore.rules
  skillmap_schema.json

/docs                        Architecture & deployment docs
  /azure                     Azure-specific documentation

/plans                       Feature planning docs
/scripts                     Root-level one-off scripts
```

---

## Build & Development Commands

### Frontend (from `/frontend`)
```bash
npm run dev        # Start Vite dev server on port 3005 (--host)
npm run build      # Production build (outputs to frontend/dist)
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm test           # Run Vitest
```

### Backend (from `/backend`)
```bash
npm start          # Start production server (node server.js)
npm run dev        # Start with nodemon (kills port 3001 first)
npm run seed:listening        # Seed listening simulator data
npm run migrate:cosmos        # Legacy: Migrate Firestore JSON to Cosmos DB (do not run)
npm run verify:cosmos-parity  # Legacy: Verify Cosmos DB parity (do not run)
npm run test:azure-migration  # Run Azure migration smoke test
npm run wipe-user             # Wipe user data
npm run deploy-dev            # Deploy to Azure DEV environment
npm run deploy-prod           # Deploy to prod Cloud Run (asia-east2) — PROD only
```

### Full Stack (from project root)
```bash
start_ace_it.bat   # Windows batch: kills ports 3001/3005, starts backend + frontend
```

### Backend Tests
```bash
# DSE Scoring (unit tests, no DB dependencies)
node backend/tests/dseScoring.test.js

# Azure Migration Smoke Test
node backend/tests/azureMigrationSmoke.test.js
```

### Frontend Tests
```bash
cd frontend
npm test           # Vitest with jsdom, React Testing Library
```

---

## Development Conventions

### JavaScript / Node.js (Backend)
- **Module System**: CommonJS (`require`/`module.exports`). The backend explicitly sets `"type": "commonjs"`.
- **Naming**: camelCase for variables/functions; PascalCase for classes and service names.
- **Async Style**: Use `async/await`; avoid callback pyramids.
- **Error Handling**: Explicit try/catch with meaningful error messages. Global error handler in `server.js` returns sanitized messages in production.
- **Route Handlers**: Keep thin; delegate to services.
- **Logging**: Structured logging where possible; include `uid` and `prompt_tier` for chat telemetry.
- **Comments**: English comments and documentation throughout.

### React (Frontend)
- **Module System**: ES modules (`import`/`export`). The frontend sets `"type": "module"`.
- **Components**: Functional components with hooks only; no class components.
- **Composition**: Prefer composition over inheritance.
- **Styling**: Use `clsx` + `tailwind-merge` for conditional Tailwind classes.
- **Component Size**: Extract logic into custom hooks when state/effects exceed ~30 lines.
- **API Calls**: Go through `/src/services`; do not call `fetch`/`axios` directly from components except in services.
- **Responsive**: Mobile-first design with Tailwind utility classes.
- **Math**: Use `react-katex` + `remark-math`/`rehype-katex` for math rendering.

### Tailwind CSS
- Use utility classes directly; avoid `@apply` in new code unless overriding third-party components.
- Custom theme colors: `primary` (#ff6a00), `electric-orange` (#FF6B00), `background-light` (#f8f7f5), `background-dark` (#23170f).
- Custom fonts: `display` (Arial, Noto Sans TC), `signature` (Caveat), `brand` (Roboto).
- Dark mode: `darkMode: "class"` in Tailwind config.

---

## AI / LLM Conventions

### Chat Prompt Assembly (Backend)
The system prompt is assembled in strict tiers:
1. `core` = `GLOBAL_BASE_RULES` + `persona.prompt` + `AGENT_PROMPTS[agentId]`
2. `recent_activity` = `RECENT_ACTIVITY_GUIDANCE` (when recent quests/mock exist)
3. `rag` = capped at `MAX_RAG_CHARS = 600`
4. `strategy` = `ACE_SIR_INJECTION` (when strategy keywords flagged)
5. `lang_skip` = Native HK speaker topics, capped to `MAX_LANG_SKIP_TOPICS = 8`
6. `windowed` = `[CONTEXT_SUMMARY] N earlier turn(s) omitted` (when history window drops messages)

Always log `tierFlags.join('+')` as `prompt_tier` via `TokenService.logUsage()`.

### Agent Interaction & Debugging (CRITICAL)
- **Tool Call Visibility**: NEVER suppress or skip the content of `WriteFile` or `Shell` commands. The `IN` block must always contain the full, un-encoded source code or command string.
- **No Hidden Optimization**: Do not attempt to "save tokens" by omitting logs or truncating tool parameters. Debugging visibility is higher priority than token conservation.
- **Handling Large Files**: If a JSON or file is too large for a single `WriteFile` call:
  1. Do NOT use `base64` or complex `heredoc` redirects (these often fail in the shell).
  2. Instead, write a temporary Node.js script (e.g., `tmp_writer.js`) that handles the file writing via `fs.writeFileSync` and execute it.
- **Shell Execution**: Always output the full command being run in the terminal so the user can verify it before execution.

### History Window Contract
- `MAX_TURNS = 12`, `MAX_CHARS_PER_MSG = 800` (server authoritative).
- Frontend mirrors `MAX_PAYLOAD_TURNS = 24` for wire size only.
- Final content array ordering follows OpenAI/Deepseek conventions.
- Image data attaches to the LAST user turn.

### Intent Router Fast-Path
Bypass `IntentRouter.classify` ONLY when:
- `agentId !== 'math'`
- No image attached
- `CacheService.isGreetingOrAck(message)` is true
- `CacheService.hasRecentLabProposal(history)` is false

### Message Format (Frontend → Backend)
Use OpenAI-style (Deepseek-compatible): `{ role: 'user' | 'assistant', content: string }`
Legacy Gemini-style `{ role, parts: [{ text }] }` has been deprecated in DEV.
Hidden/system-trigger messages (e.g., `[trigger_greeting]`, `[REDIRECT_DIAGNOSTIC]`) must stay out of the payload.

### Streaming Tags
Backend may emit tags: `[SUGGESTIONS: a, b, c]`, `[FORCE_TTS]`, `[TRIGGER_CLEAR]`, `[STUDENT_STATE: ...]`, `[REDIRECT_DIAGNOSTIC]`.
Frontend uses `parseSuggestions` for chips and existing regex blocks for others.

---

## Database Conventions

### Firestore
- Collection naming: camelCase (e.g., `users`, `questResults`, `mockSummaries`).
- User-specific data lives under `users/{uid}/...`.
- `UserProfileService.saveMockSummary()` writes to Cosmos DB `users/{uid}/progress/mock_summary`.
- `GamificationService.getRecentQuestSummary()` reads from Cosmos DB `users/{uid}/quest_results`.
- All user data operations go through `CosmosStore.js` in DEV.

### Cosmos DB (Primary — DEV)
- Partitioning strategy aligned with `uid` for user-scoped data.
- Container naming: camelCase (e.g., `users`, `questResults`, `mockSummaries`).
- All repositories in `/backend/repositories/` target Cosmos DB in DEV.
- Migration scripts in `/backend/scripts/` were used for Firestore→Cosmos migration; do not run unless explicitly requested.

---

## API Conventions
- Base API URL from `VITE_API_URL` (frontend env).
- RESTful routes in `/backend/routes/`.
- Authentication via **Azure AD tokens** (verified in middleware). Firebase ID tokens are no longer used in DEV.
- Rate limiting applied on sensitive endpoints (`/api/` base limiter: 150 req/15min in production, 10,000 in dev).
- Legacy compatibility redirects use 307 to preserve POST body.
- CORS allows `localhost:3005` explicitly for local development.

---

## Environment & Secrets

### Frontend
- Environment variables must start with `VITE_` to be exposed to the client.
- Key variables: `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_AZURE_*` configs.
- `VITE_FIREBASE_*` variables are **PROD-only** and not used in DEV.

### Backend
- Reads from `/backend/.env` (never commit `.env` files).
- Key variables: `NODE_ENV`, `STRIPE_SECRET_KEY`, `DEEPSEEK_API_KEY`, `DEEPSEEK_API_URL`, `AZURE_*` configs.
- `GEMINI_API_KEY`, `VERTEX_LOCATION`, and `FIREBASE_*` configs are **PROD-only**.
- Azure AD credentials and Cosmos DB connection strings are stored in `/backend/.env`.
- Do not read/write `.env` files from agent flows.

---

## Testing Strategy

### Frontend
- **Runner**: Vitest with jsdom environment.
- **Libraries**: React Testing Library, @testing-library/jest-dom.
- **Setup**: `frontend/src/setupTests.js` configures jsdom mocks (`window.scrollTo`, `Element.prototype.scrollIntoView`).
- **Test Files**: `*.test.jsx` co-located with components/pages.
- Run with: `cd frontend && npm test`

### Backend
- **Runner**: Node.js directly (no dedicated test runner configured yet).
- **Test Files**: Located in `/backend/tests/`.
- `dseScoring.test.js`: Pure unit tests for HKEAA scoring logic, no DB dependencies.
- `azureMigrationSmoke.test.js`: Smoke tests for Azure migration.
- Run with: `node backend/tests/dseScoring.test.js`

---

## Deployment Processes

### DEV Deployment (Azure)
- Frontend and backend both deploy to **Azure** in DEV.
- Backend runs as an Azure App Service or Azure Container Instance (Docker image from `backend/Dockerfile`).
- Frontend is served via Azure Static Web Apps or Azure App Service.
- Cosmos DB is the backing database.
- No Firebase, Cloud Run, or Render involvement in DEV.

### PROD Deployment (Firebase + GCP — Retained)
The backend deploys to Google Cloud Run with Docker:
```bash
cd backend
gcloud run deploy ace-it-backend-prod \
  --project ace-it-production-1e0a4 \
  --region asia-east2 \
  --set-env-vars NODE_ENV=production \
  --source . \
  --allow-unauthenticated
```
- Dockerfile: Node 20 slim, port 3001, `npm install --omit=dev`.
- Vertex AI region fallback: `asia-east1` (primary), `asia-southeast1`, `us-central1`.
- App Engine fallback config exists in `app.yaml`.

### Frontend Deployment (PROD — Firebase Hosting)
```bash
cd frontend && npm run build
firebase deploy --only hosting
```
- Firebase Hosting serves `frontend/dist`.
- `/api/**` rewrites to Cloud Run service `ace-it-backend`.
- SPA fallback: `/**` → `/index.html`.

### Git Workflow
- **Never** commit directly to `main` for new features.
- Use **feature branches** (e.g., `feature/maths-tutor`).
- Tag stable releases (e.g., `v1.0`).
- Maintain `ace-it-web-vX.Y-backup.zip` before major changes.
- Follow Semantic Versioning (SemVer).

---

## Security Considerations
- Helmet.js enabled for security headers (`contentSecurityPolicy: false` for flexibility).
- Rate limiting on all `/api/` routes (150 req/15min in production).
- Azure AD token verification on protected routes in DEV. Firebase ID token verification remains in PROD only.
- Stripe webhook signature verification.
- Service account keys stored in `/backend/config/` — never commit to git.
- `.env` files are gitignored.
- Global uncaught exception and unhandled rejection handlers in `server.js`.
- Server timeout extended to 10 minutes for long AI generation.

---

## Important Exclusions (Save Tokens)
Avoid touching unless explicitly requested:
- `backend/backups/` (legacy copies)
- `backend/scratch/` (one-off tests)
- `backend/scripts/` (maintenance or bug-fix scripts)
- Root `fix_*.js`, `test_*.js`, `check_*.js` (utility scripts)
- `**/node_modules/**`
- `frontend/dist/`

---

## Key Files Reference
- `backend/services/GenerativeAIService.js` — AI Gateway (Deepseek in DEV; Studio/Vertex failover in PROD)
- `backend/services/IntentRouter.js` — Intent classification "brain"
- `backend/services/UserProfileService.js` — User data management (Cosmos DB in DEV, Firestore in PROD)
- `backend/services/GamificationService.js` — XP, streaks, leveling
- `backend/routes/chatRoutes.js` — Primary chat endpoint
- `backend/server.js` — Express app bootstrap
- `frontend/src/context/` — Global React contexts
- `frontend/src/App.jsx` — Root router with all routes
- `PROJECT_INDEX.md` — High-level project map
- `DSE_MICROSKILLS_TAXONOMY.md` — 47-skill taxonomy for HKDSE English
- `MATH_TOPIC_GUIDE.md` — Mathematics curriculum map
- `DEPLOYMENT_CHECKLIST.md` — Production deployment procedures
- `VERSIONING.md` — Versioning strategy
