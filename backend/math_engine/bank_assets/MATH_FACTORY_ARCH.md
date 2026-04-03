# ACE IT! - The Math Factory Architecture

This document outlines the premium architectural design for reusing established Math topic generators to power advanced features like Mock Exams, Integrated Skills, and Weekly Adaptive Quests.

## Core Principle: The "Seed Separation" Rule
To strictly ensure Mock Exams and Weekly Quests **never repeat** existing practice questions:
1.  **Static Banks (Quest Practice)**: Use the existing 30-question `_final.json` files. These are fixed and persistent.
2.  **Dynamic Generation (Mocks/Weekly)**: The `.py` scripts will be refactored to accept a `random_seed` integer and a `context` parameter (e.g., `context="mock_exam"` or `context="weekly_quest"`). By using different seed ranges, the script mathematically guarantees the generation of *new* numbers, coefficients, and geometries that have never been seen in the practice bank.
3.  **Mandatory Metadata**: All questions (static or dynamic) MUST include `topic`, `topic_id`, `subject="maths"`, and `is_approved=true` to ensure they are visible to the backend filtering logic. See [MATH_TOPIC_GUIDE.md](../../../MATH_TOPIC_GUIDE.md) for the full attribute schema.

---

## 1. Authentic DSE Mock Exam Generator
The Mock Exam must feel indistinguishable from a real HKEAA paper in structure, length, and quality.

### Structure Blueprint
*   **Paper 1 (Conventional)**: 2 hours 15 minutes. 105 Marks.
    *   **Section A(1)** [35 marks, ~8-9 Qs]: Level 3/4 difficulty generated from basic topics.
    *   **Section A(2)** [35 marks, ~4-6 Qs]: Level 5 difficulty featuring Integrated Skills.
    *   **Section B** [35 marks, ~4-5 Qs]: Level 7 difficulty (e.g., 3D Mensuration, Advanced Polynomials).
*   **Paper 2 (MCQ)**: 1 hour 15 minutes. 45 Questions.
    *   **Implementation**: Wrap existing `.py` generators with a distractor generator module to automatically create 3 plausible wrong MCQ options based on common student errors.

### Generation Flow
1.  The `MockOrchestrator.js` selects an exam template.
2.  It executes the Python generators asynchronously, passing a unique `mock_seed`, ensuring brand new questions.
3.  It compiles the questions into a PDF or a locked down exam UI with a strict countdown timer.

---

## 2. Integrated Skills (Topic Interleaving)
Premium Section B questions often combine multiple topics.
*   **The Pipeline Approach**: Configure Python scripts to pipe outputs to one another.
    *   *Example*: Use a remainder from `PolynomialsGen` as the radius for `EquationOfCircleGen`.

---

## 3. Weekly Adaptive Quests
*   **Algorithmic Selection**: The backend analyzes student `microSkills` mastery.
*   **Targeted Generation**: It identifies weakness topics and calls respective `.py` scripts with a `weekly_seed` to generate 10 fresh, tailored questions.
*   **Prevention of UI Stagnation**: Because these are dynamically generated, the Weekly Quest never exhausts its question pool.
