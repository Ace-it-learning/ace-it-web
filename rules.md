# Ace it! Agent Profiles

## English Tutor
- **Role**: DSE Paper 1 & 2 Specialist.
- **Focus**: Reading comprehension strategies, writing formats, vocabulary enhancement.
- **Personality**: Professional, articulate, encouraging. Uses British English spelling.
- **Context**: 
    - Explains "effective reading strategies": previewing structure, topic sentences, key words.
    - Guides through past paper criteria.

## Matt sir
- **Role**: Geometry & Algebra Specialist.
- **Focus**: Geometric proofs, algebraic manipulation, logical deduction.
- **Personality**: Logical, precise, step-by-step.
- **Context**:
    - Helps with "Geometric proofs".
    - Emphasizes showing steps for method marks.

## Chinese Tutor
- **Role**: Classical Texts & Exemplar Specialist.
- **Focus**: 12 specified classical texts (範文), writing flow, rhetoric devices.
- **Personality**: Cultured, deep, poetic but accessible.
- **Context**:
    - Challenges student with "Recitation challenges".
    - Explains deeper meanings of classical texts.

## Ace Sir
- **Role**: General Study Strategist.
- **Focus**: Motivation, time management, exam tactics, stress management.
- **Personality**: Energetic, confident, coach-like. "Trust the process!" "You got this!"
- **Context**:
    - Focuses on "All-round exam strategy".
    - Tracks XP and Level progress.

# Development Rules
- Use React Context for state management.
- Use Tailwind CSS for styling.
- Persistence via local JSON file during development.

# ACE IT! - ANTIGRAVITY DEVELOPMENT RULES (STRICT MODE)

## 1. SCOPE ISOLATION (The "Surgical" Rule)
* **Context Boundaries:** When I ask you to fix a bug in a specific file (e.g., `SpeakingRoom.js`), you are STRICTLY FORBIDDEN from modifying any other files unless I explicitly tag them.
* **Import Integrity:** Never change the path of an import in a working file to fix an error in a current file. If a shared component is broken, STOP and ask for permission to edit the shared file.
* **Modular Safety:** Treat the `src/modules/` folders (Speaking, Writing, Learning) as independent silos. A change in "Speaking" must never trigger a refactor in "Writing".

## 2. MODEL ENFORCEMENT PROTOCOL
* **Strict Routing:** You must adhere to this model usage strategy based on the complexity of the task.
    * **UI / CSS / Simple Logic:** Use `gemini-2.0-flash`. (Fast, cheap).
    * **Complex Reasoning / SVG Diagrams / Exam Logic:** Use `gemini-1.5-pro`.
* **Quota Failure Protocol:**
    * IF you hit a quota limit on `gemini-1.5-pro` while doing a complex task (e.g., grading an essay), **DO NOT** silently switch to `flash` and attempt to do it poorly.
    * **ACTION:** Stop generation. Output an error: "⚠️ Quota Hit on Pro Model. Task requires reasoning capabilities. Please wait or confirm switch to Flash."
    * *Rationale:* Better to have a paused task than broken logic.

## 3. CHANGE CONTROL (The "No Auto-Fix" Rule)
* **Zero Global Refactoring:** Never "clean up" or "optimize" code across the whole project without a specific command.
* **Error Handling:** If a fix requires changing more than 2 files, propose the plan first. Do not execute immediately.
* **Legacy Protection:** Do not delete comments or "unused" code in `src/legacy/` or commented-out blocks. I am saving them for reference.

## 4. TECH STACK IMMUTABILITY
* **Framework:** React (Next.js) + Firebase ONLY.
* **Styling:** Tailwind CSS ONLY. Do not introduce inline styles or CSS modules.
* **State Management:** React Context + Hooks. Do not suggest Redux or MobX.
* **New Libraries:** Do not install new `npm` packages to solve a trivial problem (e.g., don't install `moment.js`, use native `Date` object).

## 5. CODING STYLE
* **Functional Components:** Use const `Component = () => {}`.
* **Error Boundaries:** Every major module (Speaking, Writing) must be wrapped in a specific Error Boundary so a crash doesn't kill the whole app.
* **Comments:** When writing complex logic (especially the "Intent Router"), add JSDoc comments explaining *why*, not just *what*.

## 6. BILLING & API SAFETY
* **Vertex AI Prohibited in DEV:** You are STRICTLY FORBIDDEN from initializing or using Vertex AI (Google Cloud billing) for any development, testing, or batch generation tasks.
* **Mandatory AI Studio Usage:** All AI features must be routed through the Google AI Studio (API Key) path in the development environment.
* **Environment Safeguard:** Ensure `USE_AI_STUDIO_IN_PROD=true` is set in the local `.env` whenever performing heavy generation tasks to prevent accidental SKU switches.
* **Model ID Hygiene:** Never use experimental model IDs (e.g., 2.5, 3.1) unless they have been explicitly verified against the project's AI Studio "Available Models" list. Use stable aliases like `gemini-pro-latest` or `gemini-flash-latest` by default.

## 7. TOKEN OPTIMIZATION (THE "SKIP_TOKEN_TAX" PROTOCOL)
* **Knowledge Index First**: Before deep browsing the project, I will refer to `PROJECT_INDEX.md` and my internal Knowledge Items to understand the architecture.
* **Direct File Access**: I will use `grep_search` and `view_file` with specific line ranges to minimize context window bloat.
* **Forbidden Discovery**: I will NEVER search or index the following directories unless explicitly instructed:
    * `backend/backups/`, `backend/scratch/`, `backend/scripts/`.
    * Root scripts matching `fix_*.js`, `test_*.js`, `check_*.js`.
* **Structural Prompts**: I will rely on the `prompt_map` (located in Knowledge Items) rather than reading large prompt config files in every turn.