# Ace it! Project Index & Map

This document serves as high-level map to optimize token usage and developer efficiency.

## 🏗️ Architecture Overview
- **Frontend**: React (Vite) + Tailwind CSS.
- **Backend**: Node.js/Express.
- **Infrastructure**: Firebase (Auth, Firestore), Google Cloud (Vertex AI), AI Studio.
- **Model Strategy**: 
    - `gemini-1.5-flash` for high-speed routing, UI, and simple logic.
    - `gemini-1.5-pro` for deep reasoning, essay grading, and exam logic.

## 📂 Core Directory Map

### 🖥️ Backend (`/backend`)
- **`/services`**: Core business logic.
    - `GenerativeAIService.js`: AI Gateway (Studio/Vertex failover).
    - `IntentRouter.js`: The "brain" that classifies user intent.
    - `UserProfileService.js`: Firestore database management.
    - `GamificationService.js`: XP/Streaks/Leveling.
- **`/routes`**: API endpoints.
    - `chatRoutes.js`: Primary chat conversation handling.
    - `speakingQuestRoutes.js`: Speaking module logic.
    - `adminRoutes.js`: Content management & tools.
- **`/prompts`**: Centralized system prompts (if applicable) or prompt templates.

### ⚛️ Frontend (`/frontend/src`)
- **`/context`**: Global state (Auth, Language, UI).
- **`/components`**: Reusable UI elements.
- **`/pages`**: Major module views (Writing, Speaking, Dashboard).
- **`/services`**: API client methods.

## 🚫 Forbidden / Excluded Zones
To save tokens, the following directories and file patterns are **EXCLUDED** from AI discovery unless explicitly requested:
- `backend/backups/` (Legacy copies)
- `backend/scratch/` (One-off tests)
- `backend/scripts/` (Maintenance or bug-fix scripts)
- Projects root: `fix_*.js`, `test_*.js`, `check_*.js` (Utility scripts)
- `**/node_modules/**`

## 🧠 Knowledge Items (KIs)
The following topics are distilled into persistent Knowledge Items for the AI:
- `ace_it_core_index`: Project structure and service responsibilities.
- `ace_it_prompt_map`: Map of major system prompts and their parameters.
