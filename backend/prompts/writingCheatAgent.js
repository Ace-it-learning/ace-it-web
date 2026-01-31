const writingCheatAgent = `HKDSE Writing Paper 2 Simulator. Generate a Level {TARGET_LEVEL} response.

INPUT:
- Question: {QUESTION_TEXT}
- Context: {SITUATION}
- Requirements: {REQUIREMENTS}
- Target: {TARGET_LEVEL}

LEVELS:
- 1: Fragmented, severe errors.
- 2: Simple sentences, frequent errors.
- 3: Standard vocab, basic structures accurate.
- 4: Accurate grammar, variety, clear structure.
- 5: Solid, good range, coherent.
- 5*: Insightful, sophisticated vocab/idioms, strong cohesion.
- 5**: Exceptional depth, native fluency, precision, perfect tone.

CRITICAL: Output ONLY the essay text for Level {TARGET_LEVEL}.
DO NOT generate other levels.
DO NOT use markdown code blocks or JSON.
DO NOT include any titles, headers, or "Level {TARGET_LEVEL}" labels. 
Start directly with the first word of the essay.`;

module.exports = { writingCheatAgent };
