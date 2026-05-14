# Ace it! Agent Profiles

## English Tutor
- **Role**: DSE Paper 1 & 2 Specialist.
- **Focus**: Reading comprehension strategies, writing formats, vocabulary enhancement.
- **Personality**: Professional, articulate, encouraging. Uses British English spelling.
- **Context**: 
    - Explains "effective reading strategies": previewing structure, topic sentences, key words.
    - Guides through past paper criteria.

## Math Tutor
- **Role**: Geometry & Algebra Specialist.
- **Focus**: Geometric proofs, algebraic manipulation, logical deduction.
- **Personality**: Logical, precise, step-by-step.
- **Context**:
    - Helps with "Geometric proofs".
    - Emphasizes showing steps for method marks.

## Ace Sir
- **Role**: General Study Strategist.
- **Focus**: Motivation, time management, exam tactics, stress management.
- **Personality**: Energetic, confident, coach-like. "Trust the process!" "You got this!"
- **Context**:
    - Focuses on "All-round exam strategy".
    - Tracks XP and Level progress.

# Development Rules
- Use React Context for state management (Auth, Language, Avatar, Header).
- Use Tailwind CSS for styling (utility-first, mobile-first responsive design).
- Persistence via **Azure Cosmos DB** in DEV (primary store) and Firebase Firestore in PROD (legacy).
- API calls go through `/src/services`; do not call `fetch`/`axios` directly from components.
- Functional components with hooks only; no class components.

# ACE IT! - DEVELOPMENT RULES (STRICT MODE)

## 1. SCOPE ISOLATION (The "Surgical" Rule)
* **Context Boundaries:** When asked to fix a bug in a specific file (e.g., `SpeakingInteractionPage.jsx`), you are STRICTLY FORBIDDEN from modifying any other files unless explicitly tagged.
* **Import Integrity:** Never change the path of an import in a working file to fix an error in a current file. If a shared component is broken, STOP and ask for permission to edit the shared file.
* **Modular Safety:** Treat component directories (`src/components/speaking/`, `src/components/writing/`, `src/components/reading/`) as independent silos. A change in "Speaking" must never trigger a refactor in "Writing".

## 2. MODEL ENFORCEMENT PROTOCOL
* **Strict Routing:** All AI tasks in DEV are routed through **Deepseek API** (`GenerativeAIService.js`).
    * **UI / CSS / Simple Logic:** Use `deepseek-chat` (fast, cheap).
    * **Complex Reasoning / Essay Grading / Exam Logic:** Use `deepseek-reasoner`.
* **Quota Failure Protocol:**
    * IF you hit a quota limit on `deepseek-reasoner` while doing a complex task (e.g., grading an essay), **DO NOT** silently switch to `deepseek-chat` and attempt to do it poorly.
    * **ACTION:** Stop generation. Output an error: "⚠️ Quota Hit on Reasoner Model. Task requires reasoning capabilities. Please wait or confirm switch to Chat model."
    * *Rationale:* Better to have a paused task than broken logic.
* **PROD Legacy:** `gemini-1.5-flash` / `gemini-3.1-flash` and `gemini-1.5-pro` / `gemini-3.5-pro` are PROD-only (Vertex AI). Do not use Gemini model IDs in DEV.

## 3. CHANGE CONTROL (The "No Auto-Fix" Rule)
* **Zero Global Refactoring:** Never "clean up" or "optimize" code across the whole project without a specific command.
* **Error Handling:** If a fix requires changing more than 2 files, propose the plan first. Do not execute immediately.
* **Legacy Protection:** Do not delete comments or "unused" code in `backend/backups/`, `backend/scratch/`, `src/legacy/`, or commented-out blocks unless explicitly instructed.

## 4. TECH STACK IMMUTABILITY
* **Frontend Framework:** React 19 (Vite 7) — NOT Next.js.
* **Backend Framework:** Node.js 20 + Express 5 (CommonJS).
* **Styling:** Tailwind CSS ONLY. Do not introduce inline styles or CSS modules.
* **State Management:** React Context + Hooks. Do not suggest Redux or MobX.
* **Database (DEV):** Azure Cosmos DB (primary). Firestore is PROD-only legacy.
* **Authentication (DEV):** Azure AD (MSAL Browser) — NOT Firebase Auth in DEV.
* **New Libraries:** Do not install new `npm` packages to solve a trivial problem (e.g., don't install `moment.js`, use native `Date` object). `moment` is already present but deprecated; do not add new usages.

## 5. CODING STYLE
* **Functional Components:** Use const `Component = () => {}`.
* **Error Boundaries:** Every major module (Speaking, Writing) must be wrapped in a specific Error Boundary so a crash doesn't kill the whole app.
* **Comments:** When writing complex logic (especially the "Intent Router"), add JSDoc comments explaining *why*, not just *what*.
* **Tailwind Classes:** Use `clsx` + `tailwind-merge` for conditional classes. Mobile-first responsive design.
* **Math Rendering:** Use `react-katex` + `rehype-katex` / `remark-math` for math content.

## 6. BILLING & API SAFETY
* **Deepseek API (DEV Primary):** All AI generation in DEV routes through `DEEPSEEK_API_KEY` and `DEEPSEEK_API_URL` (configured in `backend/.env`).
* **Vertex AI / AI Studio Prohibited in DEV:** You are STRICTLY FORBIDDEN from initializing or using Google Vertex AI, Google AI Studio, or any GCP-billed AI service for DEV work. These are PROD-only legacy.
* **Environment Safeguard:** Ensure `NODE_ENV=development` is set in `backend/.env`. The `GenerativeAIService.js` gateway uses Deepseek exclusively when `NODE_ENV !== 'production'`.
* **Model ID Hygiene:** Use stable Deepseek model IDs only:
    * `deepseek-chat` for chat / routing / simple logic.
    * `deepseek-reasoner` for essay grading, deep reasoning, exam logic.
    * Do not use experimental or Gemini model IDs in DEV.

## 7. TOKEN OPTIMIZATION (THE "SKIP_TOKEN_TAX" PROTOCOL)
* **Product Index First**: Before deep browsing the project, refer to **`PRODUCT_INDEX.md`** to map user-facing features (e.g., "General Reading Quest", "Dashboard Roadmap") directly to file paths. Do not scan the whole project.
* **Architecture Context**: Read **`AGENTS.md`** for tech stack, conventions, and key file references. Do not re-discover what is already documented.
* **Direct File Access**: Use `ReadFile` with specific `line_offset`/`n_lines` and `Grep` for targeted searches. Avoid `Glob` on large directories; avoid `Shell` `find`/`dir` on `node_modules`, `dist/`, or `backend/backups/`.
* **Forbidden Discovery**: NEVER search or index the following unless explicitly instructed:
    * `backend/backups/`, `backend/scratch/`, `backend/scripts/`.
    * Root scripts matching `fix_*.js`, `test_*.js`, `check_*.js`.
    * `**/node_modules/**`, `frontend/dist/`.
* **Structural Prompts**: Rely on the `prompt_map` (in Knowledge Items or `backend/prompts/`) rather than reading large prompt config files on every turn.
* **Transparent Tool Execution (Critical)**: While chat responses should be concise, ALL tool calls (WriteFile, Shell, etc.) must be 100% verbose. Never suppress, truncate, or encode the content in the IN block. Full visibility is required for the IDE to execute the command.
* **Chat Conciseness**: Only use plain language for the summary of what was done, but the background "vibe coding" logic must remain fully detailed.
* **Large Data Writing**: For files or JSON data larger than 50 lines, DO NOT use Shell commands (e.g., echo, cat, or heredocs). These fail due to shell character limits and quoting issues.
* **Action**: Always use the native WriteFile tool or generate a temporary Node.js "seeding" script to handle the file creation.