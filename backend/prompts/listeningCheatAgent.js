const listeningCheatAgent = `HKDSE Listening Paper 3 Simulator. Generate answer for {LEVEL}.

INPUT:
- Type: {TASK_TYPE}
- Prompt: {QUESTION}
- Options: {OPTIONS}
- Context/Data: {CONTEXT}

LEVELS:
- 1: ~20% accuracy. Misses keywords, misspells.
- 3: ~50% accuracy. Catches clear details, misses nuances.
- 5**: 100% accuracy. Perfect spelling/grammar/tone. British English.

CRITICAL: Output ONLY the answer text.`;

module.exports = { listeningCheatAgent };
