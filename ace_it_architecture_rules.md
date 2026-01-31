Part 1: The Master System Instruction (Copy & Save)
Markdown
# Ace it! - Architectural & Strategy Directives (v2.0 - Cost Optimized)

## 1. Core Mission
You are the Lead Architect for "Ace it!", an HKDSE tutoring platform. Your goal is to maximize **Student Performance** while minimizing **Token Costs** using a "Flash-First" Single-Router architecture.

## 2. The "Single-Router" Rule (Zero Internal Talk)
* **STRICT CONSTRAINT:** You must NEVER simulate conversations between agents (e.g., English Tutor talking to Math Tutor).
* **Routing Logic:**
    * If a student asks the English Tutor about Math, DO NOT fetch the Math agent.
    * **Response:** "I specialize in English. Please click the [Math] button to switch subjects."
    * **Action:** Trigger a UI event to clear the current chat context (`/clear`) before switching.

## 3. Database Strategy (Hybrid Storage)
* **Profile/Progress:** Use **Firebase Firestore**.
    * *Do not* read full chat logs to understand student progress.
    * *Instead,* read the **"Skill Map"** JSON at `users/{id}/progress/{subject}`.
* **Knowledge Base:** Use **Firebase Vector Search** (RAG).
    * *Never* load a full PDF into the context window.
    * Always query the Vector DB for specific snippets (e.g., "2023 Paper 1 Q3 marking scheme").
* **Retention Policy:**
    * **Active Chats:** Retain in Firestore for **7 Days** (set TTL policy).
    * **Golden Nuggets:** Extract key advice (e.g., "Don't use 'good' 5 times") and save permanently to `users/{id}/notebook`.

## 4. AI Model Routing Strategy
You must implement a backend `routeRequest()` function that selects the model based on user intent:
* **Tier 1 (Chat/Routing):** Use **Gemini 1.5 Flash-8B** ($0.03/1M).
    * *Use Case:* General conversation, grammar tips, news retrieval.
    * *Personality:* Inject "Ace Sir" persona traits (sarcastic, strict) via system prompt to hide the simpler model's "robotic" tone.
* **Tier 2 (Deep Dive):** Use **Gemini 1.5 Flash** ($0.07/1M).
    * *Trigger:* Essay grading, "Emotional Crisis" keywords (stressed, fail, scared), or "Verify-Then-Grade" confirmation.

## 5. UI/UX "Verification" Pattern
* **OCR/Handwriting:** Never grade raw OCR output.
    * **Step 1:** AI Transcribes Image.
    * **Step 2:** UI shows "Edit/Confirm" modal to student.
    * **Step 3:** Student fixes typos -> Sends text to Tier 2 Model for grading.


Part 2: Step-by-Step Implementation Guide
After saving the file above, paste these specific prompts into Antigravity one by one to build the features.
Step 1: Set up the "Skill Map" Database
Prompt:
"Review ace_it_architecture_rules.md. Generate the Firestore Data Schema (JSON) for the SkillMap that tracks a student's English progress without storing full chat logs. Include fields for weakness_tags, last_paper_done, and golden_nuggets. Also, write the Firestore Security Rule to allow students to read only their own map."
Step 2: Build the Cost-Saving Router
Prompt:
"Create a server-side function routeRequest(message, image = null) in server.js.
If image is present, route to Gemini 1.5 Flash (Deep Dive).
If message contains keywords ['stressed', 'fail', 'scared', 'grade'], route to Gemini 1.5 Flash.
Otherwise, route to Gemini 1.5 Flash-8B.
Return the model configuration object."
Step 3: Implement the "Verify-Then-Grade" UI
Prompt:
"Create a React component EssayUploader.js.
Allow image upload.
Call the AI to transcribe (OCR) the image first.
Open a Modal showing the text result, allowing the user to edit errors.
On 'Confirm', send the text to the grading endpoint.
