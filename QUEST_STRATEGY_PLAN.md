# Quest Strategy Refinement: Implementation Plan
**Project:** Ace It (HKDSE Math)  
**Objective:** Transition from Real-Time Generation to a Curated, Pre-Generated "Factory Model" for enhanced quality, speed, and cost-efficiency.

---

## 📅 Executive Summary
Moving away from pure real-time LLM generation to a **Python-Template + Human-in-the-Loop** architecture. This ensures 100% mathematical accuracy, standardizes diagrams, and enables "Write Once, Serve Infinitely" economics.

---

## Phase 1: Architecture & Data Design
**Goal:** Define the "Warehouse" schema to support sub-50ms fetching and rich filtering.

### 1.1 Database Schema (Firestore / NoSQL)
Create a new collection `question_bank` with the following structure to support rapid querying by topic and difficulty.

```json
{
  "question_id": "math_circle_001_v2",
  "meta": {
    "topic": "Geometry",
    "sub_topic": "Circle Properties",
    "difficulty_tier": 3, // 1=Easy, 2=Medium, 3=DSE, 4=Elite
    "tags": ["Chords", "Pythagoras", "Visual"],
    "exam_ref": "2018-Q17-Similar" // Internal reference if applicable
  },
  "content": {
    "question_text_en": "In the figure, AB is a chord...",
    "question_text_zh": "圖中，AB 是一條弦...",
    "diagram_url": "gs://ace-it-assets/math/circles/q001_v2.png",
    "options": [ // Null if Section A (Conventional)
      { "id": "A", "text": "5 cm" },
      { "id": "B", "text": "8 cm" }
    ]
  },
  "answer": {
    "value": "6",
    "unit": "cm",
    "solution_steps_latex": [
      "Step 1: Draw OM \\perp AB...",
      "Step 2: AM = 8/2 = 4..."
    ]
  },
  "status": "published", // draft, flagged, published
  "audit_log": {
    "generated_at": "2023-10-25T10:00:00Z",
    "audited_by": "ai_auditor_v1",
    "approved_by": "admin_user"
  }
}

Here is the comprehensive **Implementation Plan** formatted as a Markdown (`.md`) file. You can save this as `QUEST_STRATEGY_PLAN.md` in your project folder for your AI (Antigravity) or development team to follow.

```markdown
# Quest Strategy Refinement: Implementation Plan
**Project:** Ace It (HKDSE Math)  
**Objective:** Transition from Real-Time Generation to a Curated, Pre-Generated "Factory Model" for enhanced quality, speed, and cost-efficiency.

---

## 📅 Executive Summary
Moving away from pure real-time LLM generation to a **Python-Template + Human-in-the-Loop** architecture. This ensures 100% mathematical accuracy, standardizes diagrams, and enables "Write Once, Serve Infinitely" economics.

---

## Phase 1: Architecture & Data Design
**Goal:** Define the "Warehouse" schema to support sub-50ms fetching and rich filtering.

### 1.1 Database Schema (Firestore / NoSQL)
Create a new collection `question_bank` with the following structure to support rapid querying by topic and difficulty.

```json
{
  "question_id": "math_circle_001_v2",
  "meta": {
    "topic": "Geometry",
    "sub_topic": "Circle Properties",
    "difficulty_tier": 3, // 1=Easy, 2=Medium, 3=DSE, 4=Elite
    "tags": ["Chords", "Pythagoras", "Visual"],
    "exam_ref": "2018-Q17-Similar" // Internal reference if applicable
  },
  "content": {
    "question_text_en": "In the figure, AB is a chord...",
    "question_text_zh": "圖中，AB 是一條弦...",
    "diagram_url": "gs://ace-it-assets/math/circles/q001_v2.png",
    "options": [ // Null if Section A (Conventional)
      { "id": "A", "text": "5 cm" },
      { "id": "B", "text": "8 cm" }
    ]
  },
  "answer": {
    "value": "6",
    "unit": "cm",
    "solution_steps_latex": [
      "Step 1: Draw OM \\perp AB...",
      "Step 2: AM = 8/2 = 4..."
    ]
  },
  "status": "published", // draft, flagged, published
  "audit_log": {
    "generated_at": "2023-10-25T10:00:00Z",
    "audited_by": "ai_auditor_v1",
    "approved_by": "admin_user"
  }
}

```

### 1.2 Micro-Skill Taxonomy

Define standard tags for "Quest" filtering:

* **Calculation** (Pure number crunching)
* **Spatial Visualisation** (3D diagrams, Locus)
* **Abstract Reasoning** (Proofs, "Must be true" questions)
* **Trap Recognition** (Common careless error spots)

---

## Phase 2: Math Content Engine (The Generator)

**Goal:** Build the "Strategy A" Python engines to mass-produce high-fidelity math problems.

### 2.1 The Visual Python Library (`/backend/math_engine`)

Develop a standardized Python library using `matplotlib` and `numpy`.

* **Requirement:** Scripts must output **(1) High-Res PNG** (Diagram) and **(2) LaTeX Text** (Question).
* **Core Classes:**
* `BaseGeometry`: Handles coordinate systems, scaling, and labelling.
* `CircleGen`: Handles chords, tangents, cyclic quads.
* `Trig3DGen`: Handles pyramids, prisms, and projection angles.



### 2.2 Template Development

Create "Master Templates" for high-priority topics.

* **Input:** Random seed ranges (e.g., Radius 3-10, Angle 30-75).
* **Logic:** Hard-coded mathematical rules (e.g., `chord_len = 2 * sqrt(r**2 - d**2)`).
* **Localization:** Output dictionary keys for `{en}` and `{zh-hk}` text injection.

---

## Phase 3: Admin Portal (The Manufacturing Plant)

**Goal:** A "Human-in-the-Loop" dashboard to batch-generate and review content.

### 3.1 Dashboard Features (React/Next.js)

* **Topic Selector:** Dropdown to select "Master Template" (e.g., "3D Pyramid").
* **Batch Controls:** "Generate 50 Variations" button.
* **Review Interface (Split View):**
* **Left:** Rendered Question Card (Image + Text).
* **Right:** Editor (JSON/LaTeX) + "Approve/Reject" buttons.


* **Difficulty Override:** Slider to manually adjust the AI-suggested difficulty level (1-4).

### 3.2 Publish Workflow

* **Draft:** Generated by Python, sits in staging.
* **Audit:** Passed through Phase 4 (AI Auditor).
* **Published:** Pushed to live Firestore `question_bank`.

---

## Phase 4: AI Auditor Agent (QA Guardrails)

**Goal:** Automate quality checks to remove "hallucinations" and "impossible geometry".

### 4.1 The "Blind Solver" (Logic Audit)

* **Action:** Send **Question Text Only** to a Reasoning Model (Gemini Pro/GPT-4o).
* **Prompt:** "Solve this problem step-by-step. Return final answer."
* **Verification:** Compare `Auditor_Answer` == `Template_Answer`.
* *Mismatch?* -> Flag as 🔴 `REVIEW_NEEDED`.



### 4.2 The "Vision Check" (Diagram Audit)

* **Action:** Send **Diagram Image** to a Vision Model.
* **Prompt:** "List all labels visible in this image. Is there a triangle? Are any labels overlapping?"
* **Verification:** If labels are unreadable or missing -> Flag as 🔴 `BAD_DIAGRAM`.

### 4.3 The "Sanity Bounds" (Code Audit)

* **Action:** Simple conditional scripts running on generation.
* **Checks:**
* Triangle Inequality ().
* Discriminant Check ( for real roots).
* Negative Length Check ().



---

## Phase 5: Client-Side Migration

**Goal:** Switch the student app to fetch from the new verified database.

### 5.1 Logic Replacement

* **Legacy:** `Client -> Request(Topic) -> LLM Generates -> Return`
* **New:** `Client -> Request(Topic, Difficulty) -> DB Query(status='published') -> Return Random`

### 5.2 Adaptive Serving Logic

Implement "Scaffolding" logic in the fetch request:

* *If User fails 'Hard' 3D Trig -> Next fetch query: 'Medium' 3D Trig.*
* *If User passes 'Medium' -> Next fetch query: 'DSE Level'.*

---

## 📝 Success Metrics

* **Accuracy:** 100% (Zero math errors in published questions).
* **Latency:** Quest load time < 200ms.
* **Cost:** Reduce token usage by >90% (Generate once, read forever).

```

```