const GenerativeAIService = require('./GenerativeAIService');
const fs = require('fs'); // For debugging logs
const path = require('path');
const crypto = require('crypto'); // For deterministic hashing
const { MICRO_SKILLS } = require('../constants/microSkills');
const QuestionBankStore = require('./QuestionBankStore');
const CosmosStore = require('./CosmosStore');

// Helper: Generate Hash for Deduplication
const generateQuestionHash = (topic, type, questionText) => {
  const str = `${topic.toLowerCase()}-${type}-${questionText.trim()}`;
  return crypto.createHash('md5').update(str).digest('hex');
};

const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  if (cleaned.includes('```json')) {
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```[\w]*\n?/g, '').replace(/```\n?/g, '').trim();
  }
  
  // Handle common trailing garbage or truncation
  if (cleaned.endsWith('}') === false && cleaned.includes('}')) {
      cleaned = cleaned.substring(0, cleaned.lastIndexOf('}') + 1);
  }
  
  return cleaned;
};

// Robust repair for when JSON.parse fails
const repairJson = (text) => {
    try {
        // First try standard cleaning
        return JSON.parse(cleanJsonResponse(text));
    } catch (e) {
        console.warn("[LabService] Standard Parse Failed. Attempting Regex Repair...");
        // 1. Try to extract the outer-most { ... }
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch (innerE) {
                // 2. Simple quote normalization (handle unescaped quotes inside strings)
                // This is risky but useful for feedback fields
                let fixed = match[0].replace(/([^\\])"/g, '$1\\"'); // Very crude, might break keys
                // We'll skip crude string manipulation for now and just log the failure.
                throw innerE;
            }
        }
        throw e;
    }
};

// --- ENGLISH DIFFICULTY TIERS (mirrors Math's DIFFICULTY_TIERS) ---
const ENGLISH_DIFFICULTY_TIERS = {
  // Factory tiers map: easy -> level 3 | medium -> level 4 | standard -> level 5 | elite -> level 7
  '3': { name: 'Easy', passageWords: '250-350', sentenceLen: '10-15 words', vocab: 'Common everyday vocabulary. No academic jargon. Simple, familiar topics (school, family, hobbies).', structure: '2-3 short paragraphs. Simple narrative or descriptive structure.', taskComplexity: 'Straightforward literal comprehension. Direct fact-finding. Single-skill focus.' },
  '4': { name: 'Medium', passageWords: '350-450', sentenceLen: '15-20 words', vocab: 'Moderately sophisticated. Some subject-specific terms with context clues provided. Pre-DSE level vocabulary.', structure: '3-4 paragraphs. Basic argumentative or expository structure.', taskComplexity: 'Identifying attitudes, following arguments. Mixed question types. 2-skill integration.' },
  '5': { name: 'DSE Standard', passageWords: '400-600', sentenceLen: '20-30 words', vocab: 'DSE frequently-used vocabulary. Academic/professional register. Abstract concepts typical of the HKDSE exam.', structure: '4-5 paragraphs. Full DSE argumentative structure (claim → evidence → counterpoint → rebuttal → conclusion).', taskComplexity: 'Synthesizing information across paragraphs. Abstract themes. Multi-skill integration.' },
  '6': { name: 'Elite (5*)', passageWords: '500-700', sentenceLen: '25-35 words', vocab: 'High-frequency academic vocabulary. Nuanced, precise word choices. No obscure archaisms.', structure: '5+ paragraphs. Complex multi-layered argument with irony, rhetorical devices.', taskComplexity: 'Subtle nuances, irony, complex stylistic features. Evaluating contrasting views.' },
  '7': { name: 'Elite (5**)', passageWords: '500-700', sentenceLen: '25-35 words', vocab: 'High-end journalism level (The Economist, NYT). Linguistic precision and logical synthesis.', structure: '5+ paragraphs. Masterful multi-layered argument.', taskComplexity: 'Identifying subtle speaker attitudes. Evaluating highly abstract/technical contexts. Focus on logical synthesis.' }
};

// Prompts...
const LAB_GENERATION_PROMPT = `Expert HKDSE English Tutor. Generate a high-stakes Learning Lab for topic '{{TOPIC}}', focus '{{FOCUS}}', level '{{LEVEL}}'.

### SAFETY RULES (STRICT ADHERENCE REQUIRED):
1. **NO ANSWER LEAKS**: The 'placeholder' MUST NEVER contain even a single word from the intended answer. 
   - BAD: placeholder: "Add details (e.g., from Canada)" -> LEAK!
   - GOOD: placeholder: "Provide a prepositional phrase clarifying origin..."
2. **DISTINCT TASKS**: Every task in the 'interactive_tasks' array must be unique.
3. **MCQ INTEGRITY**: For MCQ tasks, provided options must be plausible but only one is correct.

### DIFFICULTY TIER: {{TIER_NAME}}
- **Passage Length**: {{PASSAGE_WORD_COUNT}} words
- **Sentence Complexity**: Average {{SENTENCE_LENGTH}} per sentence
- **Vocabulary Level**: {{VOCAB_LEVEL}}
- **Passage Structure**: {{PASSAGE_STRUCTURE}}
- **Task Complexity**: {{TASK_COMPLEXITY}}

### TOPIC DISCIPLINE:
- If topic is 'Literal Comprehension': Focus EXCLUSIVELY on information explicitly stated in the text. Find specific facts, names, dates, or clearly stated stances. The challenge at high DSE levels (5*-5**) comes from the COMPLEXITY of the reading passage and the PRECISION needed to extract the correct detail, NOT from making abstract inferences or logical leaps.
- If topic is 'reading_inference': Focus on "Textual Evidence (Clues) + Prior Knowledge (Logic) = Inference". Tasks must require students to deduce unstated meanings, writer's tone/attitude, or implicit purposes. Avoid over-inferencing (ensure there is a text-based evidence chain).
- If topic is 'reading_skimmingScanning': Focus on tasks that require locating specific keywords (dates, names, capital letters) or identifying the "gist" (overall main idea) of specific paragraphs within 5-10 seconds of scanning.
- If topic is 'reading_paraphrasing': Focus on tasks that require students to restate information "in their own words". Penalize simple copying-and-pasting in the explanation/logic.
- If topic is 'reading_cohesionReference': Focus on "What does 'it/this/them/the former' refer to?" questions. Test the student's understanding of grammatical links between sentences.

### MICRO-SKILLS TAGGING:
- You MUST tag each interactive task with 1 appropriate micro-skill ID from the following list:
{{AVAILABLE_SKILLS}}
- If the lab topic matches a specific skill (e.g., 'reading_inference'), use that tag mostly. If 'General', mix the tags.

### EXAMINER PROFESSIONALISM & STYLE (MANDATORY):
1. **FULL QUESTIONS**: Every 'question' must be a complete, grammatically correct interrogative sentence. 
   - BAD: "Emily's attitude is...?" 
   - GOOD: "According to the passage, what is Emily's attitude towards her current workload?"
2. **NO SENTENCE FRAGMENTS**: DO NOT use sentence-completion style (trailing dots) in the 'question' field. The user must feel they are taking a professional HKDSE Paper 1 exam.
3. **EXAMINER TONE**: Use formal, objective, and precise language. Avoid casual or overly simplistic phrasing.
4. **HKDSE FORMATTING**: For MCQs, ensure options are distinct and follow the DSE pattern (A, B, C, D).

JSON SCHEMA:
{
  "type": "READING"|"GRAMMAR"|"VOCAB",
  "reading_passage": string, // REQUIRED for 'READING' type. MUST be {{PASSAGE_WORD_COUNT}} words with {{PASSAGE_STRUCTURE}}. CRITICAL: Separate each paragraph with double newline (\\n\\n). Topics: HK-relevant social issues, technology, education, environment, culture.
  "conceptual_explanation": string,
  "key_points": string[], // Standard sentence case.
  "examples": [
      { "text": "Example sentence/context", "explanation": "Analysis..." }
  ],
  "interactive_tasks": [{ 
    "id": string, 
    "type": "SHORT_ANSWER" | "MCQ" | "ORDERING" | "CATEGORIZATION",
    "skills": string[], // e.g. ["reading_inference"]
    "instruction": string, 
    "question": string, 
    "options": string[], // Required for MCQ, ORDERING, CATEGORIZATION.
    "buckets": string[], // Required for CATEGORIZATION. (e.g. ["Pros", "Cons"])
    "answer": string | object, // REQUIRED. MCQ="A". ORDERING="0-2-1". CATEGORIZATION={"BucketA": [0, 2], "BucketB": [1]} (Indices).
    "placeholder": string, 
    "answer_logic": string, 
    "explanation": string, // REQUIRED. A brief explanation of why the answer is correct and why other options are wrong.
    "expected_keywords": string[] 
  }], 
  "success_feedback": string,
  "suggested_next_steps": string[]
}
- CRITICAL: For 'ORDERING' tasks, the 'options' array MUST contain the items to be ordered, and 'answer' MUST be the correct index sequence (e.g., "0-2-1").
- CRITICAL: For 'CATEGORIZATION' tasks, 'options' (items to sort), 'buckets' (names), and 'answer' (object mapping buckets to indices) are ALL MANDATORY.
- CRITICAL: Ensure 'options' is NEVER empty for MCQ, ORDERING, or CATEGORIZATION.
- CRITICAL: Generate exactly {{QUESTION_COUNT}} tasks.
- CRITICAL: For 'READING' labs, the 'reading_passage' MUST be {{PASSAGE_WORD_COUNT}} words. YOU MUST separate paragraphs with \n\n (double newline). DO NOT write as one continuous block.
- CRITICAL: If the topic is 'Literal Comprehension', tasks MUST be verifiable directly from the text without outside knowledge or abstract inference.
- CRITICAL: The vocabulary, sentence complexity, and passage length MUST match the {{TIER_NAME}} tier specifications above. Do NOT exceed the word count range.
- CRITICAL: DO NOT include any text, notes, or punctuation (like a period) AFTER the closing JSON bracket. The response MUST end strictly with '}'.`;




const SPEAKING_LAB_PROMPT = `Speaking Coach. Generate HKDSE Speaking Lab JSON for '{{TOPIC}}' at level '{{LEVEL}}'.

### SAFETY & DIFFICULTY RULES:
1. **NO LEAKS**: 'placeholder' must be generic.
2. **DISTINCT TASKS**: {{QUESTION_COUNT}} unique tasks.
3. **DIFFICULTY TIER: {{TIER_NAME}}**:
   - **Vocabulary Level**: {{VOCAB_LEVEL}}
   - **Task Complexity**: {{TASK_COMPLEXITY}}
   - Easy: Simple structures, basic fluency. Short responses.
   - Medium: Moderate fluency. Express opinions with reasons.
   - DSE Standard: Sophisticated patterns. DSE frequently-used vocabulary. Strategic discussion management.
   - Elite: Effortless fluency, complex gambits. Rhetorical effectiveness and nuanced expression.

### MICRO-SKILLS TAGGING:
- You MUST tag each interactive task with 1 appropriate micro-skill ID from the following list:
{{AVAILABLE_SKILLS}}

JSON SCHEMA:
{
  "type": "SPEAKING",
  "conceptual_explanation": string,
  "key_points": string[], // Standard sentence case.
  "interactive_tasks": [{ 
    "id": string, 
    "type": "SHADOWING" | "GAMBIT" | "DRILL" | "MCQ", 
    "skills": string[], // e.g. ["speaking_pronunciationClarity"]
    "target_sentence": string, 
    "instruction": string, 
    "question": string, 
    "options": string[], // Required for MCQ.
    "answer": string, // REQUIRED.
    "explanation": string, // REQUIRED.
    "placeholder": string, 
    "expected_keywords": string[], 
    "answer_logic": string
  }], 
  "success_feedback": string,
  "suggested_next_steps": string[]
}
- CRITICAL: Generate exactly {{QUESTION_COUNT}} tasks.
- CRITICAL: Vocabulary and complexity MUST match the {{TIER_NAME}} tier.`;

const WRITING_LAB_PROMPT = `HKDSE Writing Specialist. Generate HKDSE Writing Lab JSON for '{{TOPIC}}' at level '{{LEVEL}}'.

### WRITING STRUCTURE RULES:
1. **WRITING SITUATION**: Provide a rich, structured "Writing Situation" in the 'reading_passage' field.
   - **For Short Stories ('fic')**: You MUST include:
     a) **Starting Sentence**: A specific opening line in quotes. Avoid clichés like "clocks", "keys", or "mysterious doors" unless they have a practical, realistic twist.
     b) **Writing Situation:** A detailed paragraph on your role, the setting, and the conflict. **PRIORITIZE Hong Kong contexts** (e.g., local schools, housing estates, wet markets, MTR, family traditions).
     c) **Requirements (Focus):** Specific instructions on what to emphasize (e.g., "describe the character's internal conflict", "focus on their reaction to a social pressure").
   - **For Other Genres**: Use clearly labeled sections for "**Writing Situation:**" (Professional scenario detailing Role, Audience, and Purpose) and "**Requirements (Focus):**" (Specific instructions for the writing task).
   - **VOCABULARY DISCIPLINE**: Ensure the vocabulary is appropriate for HKDSE students (Levels 3-5**). Avoid overly archaic, obscure, or purely "artistic" words that do not appear in common HK academic or professional contexts.
   - Length: 100-200 words.
   - Style: Balanced between imaginative and realistic.
2. **MODEL ANSWERS (MANDATORY)**: Instead of various drafting tasks, the 'interactive_tasks' MUST contain exactly 4 items, each representing a complete model answer at a specific HKDSE level.
   - Task 1: Level 4 (Good) - Solid grammar, basic range of vocabulary, logical structure. (approx 400 words)
   - Task 2: Level 5 (Strong) - Accurate grammar, complex structures, varied vocabulary. (approx 500 words)
   - Task 3: Level 5* (Exemplary) - Sophisticated language, highly effective organization, insightful content. (approx 500+ words)
   - Task 4: Level 5** (Mastery) - Exceptionally polished, elegant style, compelling and highly original arguments. (approx 500+ words)
3. **TASK DATA MAPPING**:
   - 'id': Use "lvl_4", "lvl_5", "lvl_5s", "lvl_5ss" respectively.
   - 'type': Set to "MODEL_ANSWER".
   - 'instruction': Summarize the key characteristics of this level (e.g., "Level 5**: Elegant style and highly original arguments.").
   - 'question': Label as "Model Answer (Level X)".
   - 'answer': The FULL model essay for this level.
   - 'explanation': Educational breakdown of WHY this answer achieves this specific level (mention vocabulary, sentence structure, and development).

### TOPIC DISCIPLINE:
- The content MUST be highly relevant to the provided TOPIC and SITUATION.
- Ensure a clear distinction in quality between the levels.

JSON SCHEMA:
{
  "type": "WRITING",
  "reading_passage": string, // The Writing Situation.
  "conceptual_explanation": string,
  "key_points": string[],
  "interactive_tasks": [{ 
    "id": "lvl_4" | "lvl_5" | "lvl_5s" | "lvl_5ss", 
    "type": "MODEL_ANSWER", 
    "skills": string[],
    "instruction": string, 
    "question": string,
    "answer": string, // The FULL ESSAY content.
    "answer_logic": string, 
    "explanation": string, // Breakdown of the level's performance.
    "placeholder": string,
    "expected_keywords": string[]
  }], 
  "success_feedback": string,
  "suggested_next_steps": string[]
}
- CRITICAL: Generate exactly 4 tasks (one for each level: 4, 5, 5*, 5**).`;



const GRAMMAR_LAB_PROMPT_V2 = `Expert HKDSE Grammar Specialist. Generate a high-speed Grammar Lab JSON for '{{TOPIC_NAME}}' (ID: {{TOPIC_ID}}) at Level {{LEVEL}}.

### THE 5 HKDSE TRAPS (CORE FOCUS):
{{TOPIC_TRAPS}}

### JSON STRUCTURE (MANDATORY):
{
  "type": "GRAMMAR",
  "topic_id": "{{TOPIC_ID}}",
  "level": "{{LEVEL}}",
  "conceptual_explanation": "A high-level summary of the topic.",
  "rule_cards": [
    { "name": string, "formula": string, "correct": string, "incorrect": string }
  ], // Generate 3-5 formula cards.
  "head_noun_tasks": [
    { 
      "sentence_tokens": string[], // The sentence split into words/tokens.
      "head_noun_indices": number[], // The indices of the tokens that form the Head Noun.
      "explanation": string 
    }
  ], // Generate 5 tasks.
  "drill_tasks": [
    { 
      "type": "MCQ",
      "question": string, 
      "options": string[], 
      "answer": string, 
      "explanation": string 
    }
  ], // Generate 10 isolated sentences.
  "boss_fight": {
    "paragraph": string, // Max 60 words.
    "errors": [
      { "original": string, "correction": string, "explanation": string }
    ] // Exactly 3 errors.
  },
  "success_feedback": string,
  "suggested_next_steps": string[]
}

### STYLE RULES:
- **PRIORITIZE HONG KONG CONTEXTS**: Use examples involving local schools, MTR, housing estates, or cultural events.
- **NO LONG PASSAGES**: The only paragraph is in the 'boss_fight'.
- **STRICT SCHEMAS**: Ensure 'head_noun_indices' are accurate based on the 'sentence_tokens' array.`;

const GRAMMAR_TRAPS_MAP = {
  "grammar_accuracy_sva": `1. **The Prepositional Phrase**: Distractors inside 'of/in/between'.
2. **The "Along With" Trap**: 'as well as', 'including' do NOT make subjects plural.
3. **The Proximity Rule**: 'neither/nor', 'either/or' agree with the CLOSEST subject.
4. **The "Number" Flip**: 'A number of' (Plural) vs 'The number of' (Singular).
5. **Relative Clauses**: Verbs inside who/which/that must agree with the antecedent.`,

  "grammar_accuracy_tense": `1. **Sequence of Tenses**: Mixing past and present in complex sentences (e.g., 'He said that he is...').
2. **Time Marker Clashes**: Using 'already' or 'just' with simple past instead of present perfect.
3. **Conditional Mix-ups**: Incorrect combinations in Type 1, 2, or 3 conditionals.
4. **Stative Verbs**: Incorrectly using continuous forms for verbs like 'know', 'believe', 'own'.
5. **Future in Past**: Confusing 'will' vs 'would' in reported thoughts.`,

  "grammar_accuracy_countable": `1. **Uncountable Traps**: 'Advice', 'Information', 'Furniture', 'Equipment' treated as plural.
2. **Collective Nouns**: 'Staff', 'Committee', 'Police' - singular vs plural usage.
3. **Quantity Quantifiers**: 'Few/A few' vs 'Little/A little' with the wrong noun type.
4. **Irregular Plurals**: Nouns that change form or stay the same (e.g., 'Phenomena', 'Criteria').
5. **Compound Noun Plurals**: Pluralizing the wrong part (e.g., 'Passers-by' vs 'Passer-bys').`,

  "grammar_accuracy_wordform": `1. **Adverb vs Adjective**: Using '-ly' words to modify nouns or adjectives to modify verbs.
2. **Noun vs Verb form**: Confusing 'Advice' (N) vs 'Advise' (V), 'Effect' (N) vs 'Affect' (V).
3. **Participial Adjectives**: '-ing' (causing feeling) vs '-ed' (receiving feeling) mix-ups.
4. **Suffix Confusion**: '-ance' vs '-ancy', '-ment' vs '-ness' in formal contexts.
5. **Negative Prefixes**: Choosing the wrong prefix (e.g., 'un-', 'in-', 'im-', 'dis-').`,

  "grammar_elite_inversion": `1. **Negative Adverbials**: Forgetting the auxiliary-subject swap after 'Seldom', 'Hardly', 'Never'.
2. **'Not only... but also'**: Incorrect inversion in the second clause or missing auxiliary.
3. **Conditionals (Had/Were/Should)**: Omitting 'if' and failing to invert (e.g., 'Had I known' vs 'If I had known').
4. **'So/Neither' responses**: Subject-verb order in short responses.
5. **Only after/Only when**: Inverting the wrong clause (main vs subordinate).`,

  "grammar_elite_subjunctive": `1. **Mandative Subjunctive**: Forgetting the base form after 'suggest', 'recommend', 'insist' (e.g., 'suggest he go').
2. **'If I were'**: Incorrect use of 'was' in formal hypothetical scenarios.
3. **'It is essential that'**: Missing base form in noun clauses of necessity.
4. **'Wish' structures**: Confusing 'wish' + past (present regret) vs 'wish' + past perfect (past regret).
5. **'As if/As though'**: Incorrect tense for unreal comparisons.`,

  "grammar_elite_participle": `1. **Dangling Participles**: The implied subject of the phrase doesn't match the main subject.
2. **Perfect Participles**: Failing to use 'Having + pp' for actions completed before the main verb.
3. **Passive Participles**: Confusing 'Written by...' vs 'Writing...'.
4. **Conjunction + Participle**: Incorrectly omitting or including 'While', 'When', 'After'.
5. **Resultative Phrases**: Using participles to show consequence (e.g., '..., thus causing...').`,

  "grammar_elite_cohesion": `1. **Reference Ambiguity**: 'This' or 'That' pointing to the wrong antecedent.
2. **Transition Overuse**: 'Moreover/Furthermore' used where no addition exists.
3. **Contrast Misplacement**: Using 'However' vs 'On the contrary' incorrectly.
4. **Lexical Chains**: Failing to use synonyms or related terms to link ideas.
5. **Substitution**: Incorrect use of 'so', 'do so', or 'one/ones' to avoid repetition.`,

  "grammar_accuracy_pronoun": `1. **Ambiguous Antecedents**: 'It' or 'They' could refer to more than one preceding noun.
2. **Number Agreement**: Using 'They' for singular subjects or 'It' for plural ones.
3. **Relative Pronouns**: Using 'Which' for people or 'Who' for things.
4. **Subject vs Object Form**: Using 'I' vs 'Me' or 'We' vs 'Us' in complex structures (e.g., 'Between you and I').
5. **Reflexive Pronouns**: Incorrect use of 'Myself' or 'Themselves' where a simple object pronoun is needed.`
};

const SIMULATOR_SCENARIO_PROMPT = `HKDSE Paper 3 (Listening and Integrated Skills) Examiner.
Generate a high-fidelity exam scenario for topic '{{TITLE}}' ({{DESCRIPTION}}).

### HKEAA STYLE & AUDIO SPECIFICATIONS (CRITICAL):
1. **PART A SPEED**: Native, dense pace (~150-160 wpm).
2. **PART B SPEED**: Balanced pace (~130-140 wpm) to allow for structured note-taking.
3. **TRAPS & DISTRACTORS**: 
   - **Self-Correction**: Include speakers correcting themselves (e.g., "Meet at 2 PM... actually, no, Tuesday is 4 PM").
   - **Consensus Logic**: Speakers must disagree initially before agreeing on a final detail.
4. **VOICE PROFILES**:
   - **Interviewer**: Professional British (RP) or American.
   - **Educated Local**: Grammatically perfect HK English accent (clear 'L' sounds, local rhythm).
   - **Student**: Enthusiastic, casual but polite, slightly faster pace.
5. **DATA INTEGRITY**: The Part B audio MUST provide 3-4 specific points that are **NOT** found in the Data File. The student must combine these auditory points with the Data File to succeed.

### PART A: THE DATA SPRINT (Compulsory)
- Focus: Rapid, accurate extraction of factual data.
- Audio Transcript: (300-400 words) incorporate "Consensus Logic" and "Self-Corrections".
- Tasks: Exactly 3 distinct tasks (Task 1, Task 2, Task 3). Mix of Table Completion, Form Filling, and MCQ (A, B, C, D).

### PART B: INTEGRATED SIMULATION
- Focus: Multi-source data synthesis and professional writing.
- Audio Transcript: (800-1000 words). Include 3-4 key points NOT in the data file.
- Notetaking Sheet: Exactly 3 fields (Context, Stakeholders, Solutions/Recommendations).
- Data File: 3-4 documents (Email, Minutes, Poster, Webpage).
- Writing Task:
  - Instructions: Role-based prompt (e.g., "Write a formal letter to the Principal...").
  - Requirements: Tone (Formal/Semi-formal), Word Count (200-250).

### SCORING CRITERIA (HKEAA WEIGHTS):
- Part A: Accuracy (1 mark per task).
- Part B: content (0-5), language (0-5), organization (0-5), appropriacy (0-3).

JSON SCHEMA:
{
  "sprint_data": {
    "audio_transcript": string,
    "tasks": [
       { 
         "id": string, 
         "type": "GAP_FILL"|"MCQ"|"FORM_FILLING"|"TABLE"|"SHORT_RESPONSE", 
         "question": string, 
         "options": string[], // For MCQ
         "fields": [{ "label": string, "answer": string }], // For FORM_FILLING
         "rows": [{ "label": string, "answer": string }], // For TABLE
         "answer": string, 
         "explanation": string 
       }
    ]
  },
  "integrated_data": {
    "audio_transcript": string,
    "notetaking_fields": [{ "id": string, "label": string, "placeholder": string }],
    "data_file": [{ "id": string, "title": string, "type": "email"|"minutes"|"poster"|"webpage", "content": string (HTML) }],
    "writing_task": { "instruction": string, "word_count": string, "marking_criteria": string }
  }
}`;

class LabService {
  static formatLevelName(level) {
    let lvl = String(level).trim();
    // Handle "41" or other concatenated garbage by taking the first digit
    if (/^\d{2,}$/.test(lvl)) {
      lvl = lvl.charAt(0);
    }

    // Version 1.1: Frontend Level Mapping (1-4 -> 3, 4, 5, 7)
    const mappedLevels = {
        '1': '3',
        '2': '4',
        '3': '5',
        '4': '7'
    };
    if (mappedLevels[lvl]) {
        lvl = mappedLevels[lvl];
    }

    if (lvl === '7') return 'HKDSE Level 5** (Mastery)';
    if (lvl === '6') return 'HKDSE Level 5* (Exemplary)';
    if (lvl === '5') return 'HKDSE Level 5 (Strong)';
    if (lvl === '4') return 'HKDSE Level 4 (Good)';
    if (lvl === '3') return 'HKDSE Level 3 (Adequate)';
    return lvl && lvl.includes('HKDSE') ? lvl : `HKDSE Level ${lvl || '3'}`;
  }

  /**
   * Maps legacy / lab-export shapes to the Paper 3 simulator schema.
   * Many Firestore docs store Part A as root `interactive_tasks` while the UI expects `sprint_data.tasks`.
   */
  static normalizeListeningMissionData(data) {
    if (!data) return data;
    const isMission =
      data.type === 'listening_mission' ||
      (String(data.paper || '').toLowerCase() === 'listening' &&
        (Array.isArray(data.interactive_tasks) || data.topic === 'listening_weekly'));
    if (!isMission) return data;

    if (!data.sprint_data || typeof data.sprint_data !== 'object') data.sprint_data = {};
    const sd = data.sprint_data;
    const existing = sd.tasks;
    if (!Array.isArray(existing) || existing.length === 0) {
      const merged = sd.interactive_tasks || data.interactive_tasks || data.questions;
      if (Array.isArray(merged) && merged.length > 0) {
        sd.tasks = merged;
      }
    }
    if (!sd.audio_transcript && data.reading_passage) {
      sd.audio_transcript = data.reading_passage;
    }

    if (!data.integrated_data || typeof data.integrated_data !== 'object') data.integrated_data = {};
    const idata = data.integrated_data;
    if (!idata.audio_transcript && data.reading_passage) {
      idata.audio_transcript = data.reading_passage;
    }
    if (!idata.notetaking_fields || !idata.notetaking_fields.length) {
      idata.notetaking_fields = [
        { id: 'nt1', label: 'Key Arguments', placeholder: 'Capture the main points mentioned...' },
        { id: 'nt2', label: 'Proposed Actions', placeholder: 'What are the suggested next steps?' },
        { id: 'nt3', label: 'Stakeholders / Context', placeholder: 'Who is affected and what is the situation?' }
      ];
    }
    if (!idata.data_file || !idata.data_file.length) {
      if (data.reading_passage) {
        idata.data_file = [
          { id: 'df_ctx', type: 'webpage', title: 'Contextual Briefing', content: data.reading_passage }
        ];
      }
    }
    if (!idata.writing_task || !idata.writing_task.instruction) {
      idata.writing_task = {
        instruction:
          data.writing_instruction ||
          data.instruction ||
          idata.writing_task?.instruction ||
          'Draft a formal response based on the discussion and the data file provided.',
        format: idata.writing_task?.format || 'Formal Report',
        word_count: idata.writing_task?.word_count || '200-250',
        marking_criteria: idata.writing_task?.marking_criteria || 'Content, Language, Organization, Appropriacy'
      };
    }
    if (!idata.marking_key || !idata.marking_key.length) {
      if (Array.isArray(data.key_points) && data.key_points.length) {
        idata.marking_key = data.key_points;
      }
    }

    if (Array.isArray(sd.tasks)) {
      sd.tasks.forEach((t) => {
        if (t && t.correct_answer != null && t.answer == null) t.answer = t.correct_answer;
      });
    }

    return data;
  }

  static async getListeningQuests() {
    try {
      const rows = await QuestionBankStore.listListeningApproved(100);
      const quests = rows.map((data) => ({
        id: data.id,
        title: data.title,
        topic: data.topic,
        level: data.level,
        paper: data.paper,
        subject: data.subject,
        created_at: data.created_at,
        hasAudio: Array.isArray(data.audio_segments) && data.audio_segments.length > 0
      }));

      // Sort in-memory to avoid composite index requirements
      quests.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });

      return quests.slice(0, 20);
    } catch (err) {
      console.error("[LabService] Error fetching listening quests:", err);
      return [];
    }
  }

  static async getQuestById(id) {
    try {
      let data = await QuestionBankStore.getById(id);
      if (!data) return null;

      LabService.normalizeListeningMissionData(data);

      // If this is a placeholder/factory quest, generate real content now
      const isPlaceholder = data.factory_template && (
          (data.sprint_data?.audio_transcript || '').includes("placeholder") || 
          (data.sprint_data?.tasks || []).length <= 1
      );

      if (isPlaceholder) {
        console.log(`[LabService] Triggering dynamic generation for mission: ${data.title}`);
        try {
          const generated = await this.generateSimulatorScenario(data.title, data.description);
          await QuestionBankStore.upsertById(id, {
            sprint_data: generated.sprint_data,
            integrated_data: generated.integrated_data,
            factory_template: false // Mark as generated
          }, { merge: true });
          data = { ...data, ...generated };
        } catch (genErr) {
          console.error("[LabService] Content generation failed:", genErr);
          // Fallback to data as is (placeholders)
        }
      }

      return { id, ...data };
    } catch (err) {
      console.error("[LabService] Error fetching quest by ID:", err);
      throw err;
    }
  }

  static async generateSimulatorScenario(title, description) {
    const prompt = SIMULATOR_SCENARIO_PROMPT
      .replace('{{TITLE}}', title)
      .replace('{{DESCRIPTION}}', description);

    console.log(`[LabService] Prompting Gemini for Simulator Content: ${title}`);
    const result = await GenerativeAIService.generateContent(prompt, {
      model: "ace-it-pro", // High quality for simulation content
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = result.response.text();
    return repairJson(text);
  }

  static async resolveWeeklyQuest(paper) {
    try {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const weekNum = Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
      const year = d.getFullYear();

      const filename = `week_${weekNum}_${paper}.json`;
      const filepath = path.join(__dirname, '..', 'data', 'weekly_quests', filename);

      let universalMeta = null;
      try {
        const metaPath = path.join(__dirname, '..', 'data', 'weekly_quests', 'weekly_meta.json');
        if (fs.existsSync(metaPath)) {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          const weekKey = `${year}_${weekNum}`;
          universalMeta = meta[weekKey] || null;
        }
      } catch (mErr) { 
        console.warn("[LabService] Weekly meta lookup failed:", mErr.message); 
      }

      if (fs.existsSync(filepath)) {
        console.log(`[LabService] SUCCESS: Loading weekly quest for ${paper}: ${filename}`);
        let content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        
        if (Array.isArray(content)) {
          content = content[0]; // If array, get first element (legacy)
        }

        // Add special formatting logic depending on paper
        if (paper === 'listening') {
          // Mapping for High-Fidelity Listening Simulator
          if (!content.sprint_data) {
             content.sprint_data = {
                 audio_transcript: content.reading_passage || "Listen to the discussion.",
                 audioContext: {
                     transcript: content.reading_passage || "Listen to the discussion.",
                     roles: ["Host", "Guest 1", "Guest 2"],
                     situation: content.title || "A debate on an important topical issue."
                 },
                 tasks: content.interactive_tasks || content.questions || []
             };
          } else if (!content.sprint_data.tasks || content.sprint_data.tasks.length === 0) {
              content.sprint_data.tasks = content.interactive_tasks || content.questions || [];
              if (!content.sprint_data.audio_transcript) {
                  content.sprint_data.audio_transcript = content.reading_passage || "Listen to the discussion.";
              }
          }
          
          if (!content.integrated_data) {
              content.integrated_data = {
                  audio_transcript: content.reading_passage || "Starting Part B planning meeting audio briefing.",
                  notetaking_fields: content.notetaking_fields || [
                      { id: 'nt1', label: 'Key Arguments', placeholder: 'Capture the main points mentioned...' },
                      { id: 'nt2', label: 'Proposed Actions', placeholder: 'What are the suggested next steps?' }
                  ],
                  data_file: content.data_file || [
                      { type: 'ARTICLE', title: 'Contextual Briefing', content: content.reading_passage || "Background info." }
                  ],
                  writing_task: {
                      instruction: content.writing_instruction || content.instruction || "Draft a formal response based on the discussion and the data file provided.",
                      format: 'Formal Report',
                      word_count: '200-250'
                  },
                  marking_key: content.marking_key || content.key_points || []
              };
          }

          if (!content.id) content.id = `weekly_${paper}`;
          content.isWeeklyQuest = true;
          content.type = content.type || 'listening_mission';
          LabService.normalizeListeningMissionData(content);
        }

        if (paper === 'writing') {
          // Remap writing properties to Writer's Studio format
          if (!content.id) content.id = `weekly_${paper}`;
          content.isWeeklyQuest = true;
          if (!content.prompt && content.reading_passage) content.prompt = content.reading_passage;
          if (!content.genre) content.genre = "Article";
        }
        
        if (paper === 'speaking') {
           if (!content.id) content.id = `weekly_${paper}`;
           content.isWeeklyQuest = true;
        }

        if (paper === 'reading') {
           if (!content.id) content.id = `weekly_${paper}`;
           content.isWeeklyQuest = true;
        }

        if (universalMeta) {
          content.universalTopicTitle = universalMeta.theme;
          content.universalTopicLong = universalMeta.topic;
          if (!content.title) {
              content.title = universalMeta.theme + " (" + paper.charAt(0).toUpperCase() + paper.slice(1) + ")";
          }
        }
        return content;
      } else {
        return null;
      }
    } catch (err) {
      console.error("[LabService] resolveWeeklyQuest Error:", err);
      return null;
    }
  }

  static async generateLesson(params) {
    console.log("[LabService] generateLesson START", JSON.stringify(params));
    let { topic, focus, level, uid, targetCount, themeOverride, mcqRatio, forceHighQuality } = params;
    const isWeeklyQuest = params.isWeeklyQuest || false;
    const skillsKey = (topic || '').toLowerCase();
    const paperType = (params.paperType || '').toLowerCase();
    const isReadingTopic = (skillsKey.includes('reading') || skillsKey.includes('comprehension')) && !skillsKey.includes('math');
    const isWritingTopic = skillsKey.includes('writing');
    const isListeningTopic = skillsKey.includes('listening') || paperType.includes('listening');
    const isSpeakingTopic = skillsKey.includes('speaking') || skillsKey.includes('interaction');

    const modelToUse = forceHighQuality ? "ace-it-pro" : "ace-it-flash";

    // --- WEEKLY QUEST: PRE-GENERATED CONTENT CHECK ---
    if (isWeeklyQuest || topic?.includes('weekly')) {
      try {
        // Calculate ISO Week (Native)
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const weekNum = Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
        const year = d.getFullYear(); // Could use year too if needed for multi-year support

        let typeLabel = 'reading';
        if (isWritingTopic) typeLabel = 'writing';
        else if (isListeningTopic) typeLabel = 'listening';
        else if (isSpeakingTopic) typeLabel = 'speaking';

        const filename = `week_${weekNum}_${typeLabel}.json`;
        const filepath = path.join(__dirname, '..', 'data', 'weekly_quests', filename);

        // --- PROACTIVE METADATA LOOKUP (For Steering & Enrichment) ---
        let universalMeta = null;
        try {
          const metaPath = path.join(__dirname, '..', 'data', 'weekly_quests', 'weekly_meta.json');
          if (fs.existsSync(metaPath)) {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            const weekKey = `${year}_${weekNum}`;
            universalMeta = meta[weekKey] || null;
          }
        } catch (mErr) { 
          console.warn("[LabService] Weekly meta lookup failed:", mErr.message); 
        }

        if (fs.existsSync(filepath)) {
          console.log(`[LabService] SUCCESS: Loading pre-generated weekly quest: ${filename}`);
          let content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
          
          if (Array.isArray(content)) {
            content = content[0];
          }

          content.level = level; 

          // Enrich with universal theme
          if (universalMeta) {
            content.universalTopicTitle = universalMeta.theme;
            content.universalTopicLong = universalMeta.topic;
            // Ensure topic name is student-friendly if the pre-gen has a technical ID
            if (!content.title || content.title.toLowerCase().includes('weekly')) {
                content.title = universalMeta.theme;
            }
          }

          return content;
        } else {
          console.log(`[LabService] INFO: Pre-generated file ${filename} not found. Falling back to dynamic gen.`);
          // --- STEERING ---
          if (universalMeta) {
             console.log(`[LabService] Steering AI to universal topic: ${universalMeta.theme}`);
             topic = universalMeta.topic; // Use the long descriptive topic for the prompt
          }
        }
      } catch (err) {
        console.error("[LabService] Pre-generated loading error:", err);
      }
    }
    
    // --- GRAMMAR LAB: PRE-GENERATED CONTENT CHECK ---
    if (topic?.startsWith('grammar_')) {
      try {
        const filename = `${topic}_level_${level}.json`;
        const filepath = path.join(__dirname, '..', 'data', 'grammar_labs', filename);
        if (fs.existsSync(filepath)) {
          console.log(`[LabService] SUCCESS: Loading pre-generated grammar lab: ${filename}`);
          const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
          content.level = level;
          return content;
        }
      } catch (err) {
        console.error("[LabService] Grammar pre-gen lookup error:", err);
      }
    }

    // Scaling question counts to optimize learning density:
    // General Quest: Level 3 (8) | Level 4 (10) | Level 5+ (12)
    // Weekly Challenge: Fixed 15 (Mini-Mock format)
    let dynamicTarget = 12; // Default for Elite
    if (isReadingTopic) {
      if (isWeeklyQuest) {
        dynamicTarget = 15;
      } else {
        const lvlNum = parseInt(level);
        if (lvlNum <= 3) dynamicTarget = 8;
        else if (lvlNum === 4) dynamicTarget = 10;
        else dynamicTarget = 12;
      }
    }

    // HARDSET: For Reading, we ignore the requested targetCount if it's below our premium threshold (8/10/12)
    // to ensure legacy 5-question clusters are never served.
    const TARGET_COUNT = isReadingTopic ? dynamicTarget : (targetCount || dynamicTarget);

    const levelName = this.formatLevelName(level);

    // Resolve Topic ID to Name if possible
    const skill = MICRO_SKILLS[topic];
    const resolvedTopic = skill ? skill.name : (topic || 'General English');

    // Fetch Landing Content (Learning Guide) if available
    let landingContent = null;
    try {
      const landingData = await CosmosStore.getMicroSkillLanding(topic);
      if (landingData) {
        landingContent = landingData;
        console.log(`[LabService] Found learning guide for topic: ${topic}`);
      }
    } catch (err) {
      console.warn(`[LabService] Failed to fetch landing content for topic ${topic}:`, err);
    }

    // 1. Fetch Seen Question IDs for this user
    let seenQuestionIds = new Set();
    if (uid && uid !== 'placeholder') {
      try {
        const seenIds = await CosmosStore.getPracticeHistoryIds(uid, 4000);
        seenIds.forEach((id) => seenQuestionIds.add(id));
      } catch (err) {
        console.warn("Could not fetch user history:", err);
      }
    }

    // 2. Hybrid Strategy: "Mix & Match"
    // CAUTION: For Reading, we CANNOT mix questions from different passages.
    // We must find a "Passage Group" (same passage hash) or generate fresh.
    let mixedQuestions = [];
    let selectedPassage = null;

    if (isReadingTopic && !params.isFactory) {
      console.log(`[LabService] Reading Topic Detected: Enforcing ATOMIC PASSAGE grouping.`);
      try {
        const strictDocs = await QuestionBankStore.queryApprovedByTopicAndLevel(resolvedTopic, levelName, 50);

        const passageGroups = {}; // hash -> { passage, questions: [] }

        strictDocs.forEach((data) => {
          if (!data.passage) return; // Skip broken ones
          if (seenQuestionIds.has(data.id)) return; // Skip seen

          // Group by Passage Hash (simple content hash)
          const pHash = crypto.createHash('md5').update(data.passage.trim()).digest('hex');

          if (!passageGroups[pHash]) {
            passageGroups[pHash] = { passage: data.passage, questions: [] };
          }
          passageGroups[pHash].questions.push({ ...data, id: data.id });
        });

        // Find the best cluster
        const clusters = Object.values(passageGroups);
        console.log(`[LabService] Found ${clusters.length} clusters for ${resolvedTopic} (${levelName}).`);
        clusters.forEach((c, i) => console.log(`  Cluster ${i+1}: ${c.questions.length} questions. Passage: ${c.passage.substring(0, 30)}...`));

        clusters.sort((a, b) => b.questions.length - a.questions.length);

        if (clusters.length > 0 && clusters[0].questions.length >= TARGET_COUNT) {
          // We have a healthy cluster (at least TARGET_COUNT questions) for an existing passage.
          selectedPassage = clusters[0].passage;
          mixedQuestions = clusters[0].questions.slice(0, TARGET_COUNT);
          console.log(`[LabService] PICKED cluster with ${mixedQuestions.length} questions. Total in cluster: ${clusters[0].questions.length}`);
        } else {
          console.warn(`[LabService] No sufficient question cluster found (Needed ${TARGET_COUNT}).`);
          
          // CRITICAL: Block dynamic generation for Reading missions for students (only Factory Admin allowed)
          if (isReadingTopic && !params.isFactory && uid !== 'FACTORY_ADMIN') {
             console.error(`[LabService] BLOckED: Reading generation not allowed for public users. Quest bank is exhausted.`);
             throw new Error("QUEST_BANK_EMPTY"); // We want to catch this and show a 'Wait for more content' UI
          }
          console.log(`[LabService] Forcing FULL GENERATION (Factory Mode).`);
        }

      } catch (e) {
        console.warn("Reading fetch failed", e);
      }

    } else if (!params.isFactory) {
      // --- OLD LOGIC FOR NON-READING (GRAMMAR, VOCAB, ETC) ---
      try {
        const strictDocs = await QuestionBankStore.queryApprovedByTopicAndLevel(resolvedTopic, levelName, 20);
        strictDocs.forEach((data) => {
          if (mixedQuestions.length < TARGET_COUNT && !seenQuestionIds.has(data.id)) {
            mixedQuestions.push({ ...data, id: data.id });
          }
        });
      } catch (e) { console.warn("Strict fetch failed", e); }

      // Fallback logic omitted for brevity, keeping simple
      if (mixedQuestions.length < 2 && String(level) === '3') {
        // Wide fetch logic...
      }
    }

    // --- FACTORY DEDUPLICATION: Fetch recent prompts to avoid repeats ---
    let forbiddenPrompts = [];
    if (params.isFactory) {
      try {
        const docs = await QuestionBankStore.queryByTopic(resolvedTopic, 20);

        // Sort by created_at desc in-memory to avoid composite index requirement
        docs.sort((a, b) => {
          const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at || 0);
          const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at || 0);
          return dateB - dateA;
        });

        // Take the top 10 unique prompts/situations
        const seenHeads = new Set();
        for (const data of docs) {
          const promptText = data.passage || data.instruction || "";
          if (!promptText) continue;

          // Use a snippet as a key
          const head = promptText.substring(0, 100).trim().toLowerCase();
          if (!seenHeads.has(head)) {
            forbiddenPrompts.push(promptText.substring(0, 300) + (promptText.length > 300 ? "..." : ""));
            seenHeads.add(head);
          }
          if (forbiddenPrompts.length >= 10) break;
        }

        if (forbiddenPrompts.length > 0) {
          console.log(`[LabService] Found ${forbiddenPrompts.length} existing prompts for deduplication.`);
        }
      } catch (err) {
        console.warn("[LabService] Failed to fetch factory history:", err);
      }
    }

    // 3. Check for Cached Explanation / Completion
    let lessonContent = {};
    const missingCount = TARGET_COUNT - mixedQuestions.length;

    // For READING: If we are missing questions, and we have a selectedPassage, we technically COULD generate more for that passage.
    // But for now, if we don't have enough, let's just generate a FRESH set (10) unless we have a decent amount (e.g. 5+).
    // Refined logic:
    // We need generation IF we have 0 questions OR if we are under our TARGET_COUNT (Healthy state)
    const isBypassUser = params.isFactory || uid === 'FACTORY_ADMIN' || uid === 'fungtam@gmail.com';
    let needsGeneration = mixedQuestions.length < TARGET_COUNT || isWeeklyQuest;

    // --- INDUSTRIAL LOCKDOWN: Never generate in real-time for Reading ---
    // Reading MUST come from the high-fidelity premium library.
    if (isReadingTopic && needsGeneration) {
      console.log(`[LabService] STRICT LOCKDOWN: Reading Bank is empty for ${resolvedTopic}. Real-time generation is disabled.`);
      throw new Error(`QUEST_BANK_EMPTY: No approved Reading quests found for ${resolvedTopic}.`);
    }

    if (!needsGeneration && mixedQuestions.length > 0) {
      console.log(`[LabService] Using CACHED/CLUSTERED session (${mixedQuestions.length} questions): ${mixedQuestions.map(q => q.id).join(', ')}`);
      lessonContent = await this.generateExplanationOnly(topic, level, uid);
      lessonContent.interactive_tasks = mixedQuestions;
      if (isReadingTopic && selectedPassage) {
        lessonContent.reading_passage = selectedPassage;
      }
    } else {
      if (isReadingTopic) {
        throw new Error(`QUEST_BANK_EMPTY: Failed to fetch clustered Reading session for ${resolvedTopic}.`);
      }
      console.log(`[LabService] Generating FRESH session.`);

      // Build Contextual Prompt
      const paperType = params.paperType?.toLowerCase() || (skill ? skill.paper : (topic?.toLowerCase().includes('speaking') ? 'speaking' : topic?.toLowerCase().includes('listening') ? 'listening' : topic?.toLowerCase().includes('writing') ? 'writing' : 'reading'));
      const isWriting = paperType === 'writing' || topic?.startsWith('writing_');
      const isListening = paperType === 'listening' || topic?.startsWith('listening_');
      const isSpeaking = paperType === 'speaking' || topic?.startsWith('speaking_');

      let prompt;
      if (isWriting) {
        prompt = WRITING_LAB_PROMPT;
      } else if (isListening) {
        prompt = LISTENING_LAB_PROMPT;
        prompt += `\n\n### LISTENING SPECIAL INSTRUCTIONS:
        FOCUS: Listening Skill. The user will hear this text.
        Use the "Three Pillars" framework: Ear, Pen, Brain.`;
      } else if (isSpeaking) {
        prompt = SPEAKING_LAB_PROMPT;
      } else if (topic?.startsWith('grammar_')) {
        prompt = GRAMMAR_LAB_PROMPT_V2;
      } else {
        prompt = LAB_GENERATION_PROMPT;
      }

      if (isWriting) {
        prompt = `Creative Writing Tutor. ${prompt} 
        FOCUS: This is a WRITING skill. Focus on tasks that improve drafting, vocabulary selection, and structural transitions.`;

        if (topic === 'writing_general') {
          prompt += `\n\n### WRITING_GENERAL TASK:
          1. Generate a diverse mix of writing tasks related to HKDSE Paper 2 (Writing).
          2. Tasks should include:
             - Sentence upgrades (Grammar/Vocabulary)
             - Paragraph planning (Cohesion/Development)
             - Formality/Tone adjustments (Register)
          3. Topic/Theme should be a common HKDSE theme (e.g., Youth housing, AI in schools, Cantopop preservation).`;
        }

        if (topic === 'writing_genre_fic') {
          prompt += `\n\n### SHORT STORY SPECIAL INSTRUCTIONS:
          1. **Grounded & Practical**: Prioritize realistic scenarios over abstract or sci-fi ones. Think about family relations, school life, social issues in Hong Kong, or personal growth.
          2. **Hong Kong Relevance**: Incorporate local culture, landmarks (e.g., Mong Kok, Star Ferry, a specific housing estate), or social phenomena (e.g., exam pressure, volunteer work, local festivals).
          3. **HKDSE Format**: Strictly follow the (Opening Sentence + Situation + Focus) structure in the 'reading_passage' field.
          4. **Accessible Language**: Use sophisticated but accessible English. Avoid "purple prose" or highly literary vocabulary that would alienate a typical Hong Kong student.
          5. **Example Structure**: 
             Write a short story that begins with: "I handed my grandmother the steaming bowl of red bean soup."
             **Writing Situation:** It's the Winter Solstice (Dongzhi), and your family has gathered in your small public housing flat... [context about family tension or a secret shared].
             **Requirements (Focus):** Describe the atmosphere of the dinner and the character's internal realization about family heritage.`;
        }
      }

      const isHighStakes = ['4', '5', '6', '7'].includes(String(level));
      const generationTarget = params.targetCount || (isReadingTopic ? TARGET_COUNT + 3 : 20);

      // Resolve tier for this level
      const numLevel = String(level).replace(/\D/g, '') || '3';
      const tier = ENGLISH_DIFFICULTY_TIERS[numLevel] || ENGLISH_DIFFICULTY_TIERS['5'];

      // Prepare Available Skills List for Injection
      const { getSkillsByPaper } = require('../constants/microSkills');
      const paperKeyMap = { "Reading": "reading", "Listening": "listening", "Speaking": "speaking", "Writing": "writing" };
      // Map paperType (which might be "Paper 1/2" or "reading") to key
      let skillsKey = paperType.toLowerCase();
      if (skillsKey.includes('reading')) skillsKey = 'reading';
      else if (skillsKey.includes('listening')) skillsKey = 'listening';
      else if (skillsKey.includes('speaking')) skillsKey = 'speaking';

      const availableSkills = getSkillsByPaper(skillsKey)
        .map(s => `- ${s.id} (${s.name})`)
        .join('\n');

      if (landingContent) {
        prompt += `\n\n### LEARNING GUIDE CONSTRAINTS & CONTEXT:
1. **FOCUS & DEFINITION**: ${landingContent.learning_content?.anatomy?.definition || 'As per standard DSE guidelines.'}
2. **DSE APPEARANCE**: Generate tasks that match these DSE patterns: ${(landingContent.learning_content?.dse_appearance || []).map(a => `${a.type} (${a.description})`).join(', ')}
3. **COMMON TRAPS**: Ensure the question design and explanations address or avoid these traps: ${(landingContent.learning_content?.common_traps || []).map(t => t.trap).join(', ')}
4. **PRO TIPS**: Incorporate logic or explanations that align with these tips: ${(landingContent.learning_content?.pro_tips_en || []).join('; ')}`;

        // Inject Strategic Advice if topic matches Literal Comprehension
        if (topic === 'reading_literalComprehension') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **Distract with Synonyms**: Don't always use the exact word from the text in the question (e.g., Text says "Annually," Question asks "How often?").
   - **Test "Lifting" limits**: Ask a question where the answer is in the middle of a long, complex sentence to see if students can extract just the necessary part.`;
        } else if (topic === 'reading_mainIdea') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **The Elimination Lab**: For MCQ tasks, design the options according to this DSE strategy: one is "Too Broad," one is "Too Narrow," one is "Factually Correct but Not the Main Idea," and one is the "Correct Main Idea."
   - **Keyword Frequency (Lexical Chains)**: Encourage the identification of lexical chains—repeated related words (e.g., sustainability, eco-friendly) that signal the main idea. Mention these chains in the 'explanation' field.`;
        } else if (topic === 'reading_detailRecognition') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **Distractor Design**: Create MCQ distractors that use Synonyms (e.g., if the text says "a fortnight", the correct option might say "two weeks"). This tests if they understand the detail rather than just matching word shapes.
   - **The "Lifting" Limit**: For open-ended questions, provide explanations that emphasize "Less is More." Encourage extracting just the necessary facts to avoid marks being lost for "excessive lifting."
   - **Visual Cues**: In your explanations, highlight how details often follow Transition Words like "specifically," "for instance," or "in particular."`;
        } else if (topic === 'reading_sequencing') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **Signpost Training**: Emphasize "Signpost words" in your explanations. Categorize them for the student: START (Initially, First and foremost), CONTINUE (Subsequently, Meanwhile), and END (Ultimately, Finally).
   - **Complex Sentence Challenge**: For higher-level practices (Level 4+), use "Past Perfect" tense (e.g., By the time X happened, Y had already occurred) to force students to use grammar clues to determine the sequence.
   - **Visual Logic**: Prioritize the "ORDERING" task type for this skill. Ask students to reorganize information from the text into a specific chronological or step-by-step order.`;
        } else if (topic === 'reading_synthesis') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **MANDATORY DISTRIBUTION**: Ensure at least 4-5 tasks (25%) are of the "CATEGORIZATION" type. This is the core mechanic for this skill.
   - **Categorization Lab**: Provide 6-8 scattered facts or phrases from the text and ask the student to sort them into 2 distinct "Buckets" (e.g., "Benefits vs. Drawbacks", "Before vs. After", "Cause vs. Effect").
   - **Multi-Source Training**: Create tasks that explicitly require combining information from at least two different paragraphs to find the answer. Mention "Paragraph X and Paragraph Y" in the cues.
   - **The Umbrella Summary**: Teach students to find the "Umbrella Term." If the text lists "rain, snow, hail," the answer should involve "precipitation" or "weather."`;
        } else if (topic === 'reading_factVsOpinion') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **The Evidence Filter Lab**: Use the "CATEGORIZATION" task type where students are given 6-8 statements from the text and must categorize them into "Facts" and "Opinions" buckets.
   - **The Bias Detector**: Generate a passage that presents two distinct viewpoints on a controversial topic. Ask students to identify which facts both authors agree on (fact-checking) and where their opinions diverge (evaluative analysis).
   - **Language Nuance (Reporting vs. Stating)**: In your explanations, emphasize the difference between "reporting a belief" (e.g., "Many people believe X" is a FACT that they believe it) and "stating a belief as truth" (e.g., "X is bad" is an OPINION).
   - **Clue Hunt**: Highlight modal verbs (should, must, might) and emotional adjectives in the explanations as markers for opinions.`;
        } else if (topic === 'reading_authorPurpose') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **The Action Verb Bank**: In your explanations and question options, use high-level "Purpose Verbs" such as: advocate, debunk, satirize, illustrate, clarify, and provoke.
   - **The Contextual Clue Lab**: Present the student with three distinct but short perspectives on the same topic (e.g., Video Games). One should be a professional report (inform), one an angry blog (criticize), and one a set of rules (explain). Ask the student to match each style to its primary purpose.
   - **Audience Target**: Explicitly ask "Who is the intended audience?" and show how the language (slang vs. formal) helps determine the purpose.
   - **The 'Why' vs 'What' Trap**: Ensure at least one task specifically tests if students can distinguish the 'Topic' (What it's about) from the 'Purpose' (Why it was written).`;
        } else if (topic === 'reading_toneAttitude') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **The Vibe Check Lab**: Present students with a baseline sentence (e.g., "The man entered.") and ask them to select which word swap (e.g., "stormed" vs. "strolled") creates a specific tone (e.g., "furious" vs. "relaxed").
   - **The Vocabulary Matrix**: Use the "CATEGORIZATION" task type where students must sort 6-8 tone adjectives (e.g., Apprehensive, Enthusiastic, Clinical, Nostalgic) into "Positive", "Negative", and "Neutral" buckets.
   - **Intensity Training**: Challenge students to order three related words by intensity (e.g., Interested -> Concerned -> Furious) using the "ORDERING" task type if appropriate, or via multiple choice.
   - **Clue Spotting (Punctuation & Adverbs)**: In explanations, explicitly point out how exclamation marks, rhetorical questions, or adverbs like 'allegedly'/ 'unfortunately' serve as the "emotional temperature gauge" for the text.`;
        } else if (topic === 'reading_registerStyle') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **The Style Swap Lab**: Provide a highly formal/scientific sentence (e.g., "Tobacco usage is deleterious.") and ask the student to select the best "Street Level" (informal) rewrite (e.g., "Smoking is bad for you.") or vice versa.
   - **The Text-Type Matrix**: Create tasks where students identify the text type (Report vs. Blog vs. Email) based on lexical clues like passive voice or personal pronouns.
   - **Active vs. Passive Detection**: Explicitly teach that Passive Voice (e.g., "It was observed...") is a marker of formal/objective style. Ask students to identify which sentence sounds more "Authoritative" or "Academic."
   - **Lexical Complexity audit**: Use explanations to contrast Latinate/multi-syllabic words (e.g., 'commence', 'terminate') with their Germanic/simple counterparts (e.g., 'start', 'stop') to illustrate register level.`;
        } else if (topic === 'reading_metaphoricalLanguage') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **The Association Lab**: Present a subject (e.g., "Exam Pressure") and ask what meaning is created when it's compared to different images (e.g., a "mountain" vs. a "prison").
   - **The Tenor-Vehicle Drill**: In question options or explanations, explicitly ask students to identify the two things being compared (e.g., Identify the image (Vehicle) and the subject (Tenor)).
   - **Quality Transfer**: Focus explanations on the "Shared Quality" being transferred from the image to the subject (e.g., "Ticking time bomb" transfers 'hidden danger' and 'impending explosion' to the housing market).
   - **Literal vs. Symbolic Trap**: Ensure at least one distractor is a literal interpretation of the metaphorical phrase to test symbolic understanding.`;
        } else if (topic === 'reading_textOrganization') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **The Jigsaw Challenge**: Generate at least 25% of the questions as "ORDERING" tasks where students reorder 4 scrambled paragraphs based on logical flow (e.g., Cause -> Effect or General -> Specific).
   - **The Signpost Hunt**: Generate tasks where students must identify transition words (e.g., "similarly", "nevertheless") and use the "CATEGORIZATION" task type to sort them based on their logical function (Addition, Contrast, Result).
   - **Function Matching**: Ask students to match paragraphs to "Functional Labels" (e.g., Rebuttal, Supporting Evidence, Recommendation).
   - **Cohesion Audit**: In explanations, highlight "Echo" words and pronoun references (e.g., "This trend", "Such findings") that bridge paragraphs.`;
        } else if (topic === 'reading_paraphrasing') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **The Keyword Filter**: In your passage and explanations, highlight "Unchangeable Words" (e.g., proper nouns like "Hong Kong", technical terms like "DNA") and "Changeable Words" (e.g., verbs like "increase", adjectives like "significant") to show students what must remain and what can be edited.
   - **Vocabulary Extension (Synonym Bank)**: Provide a tailored "Synonym Bank" for core DSE verbs used in the passage (e.g., scrapped, disputed, yield, anticipate).
   - **Voice & class Flip**: Challenge students to rewrite active sentences into passive (or vice versa), or transform word classes (e.g., "She succeeded" -> "Her success") using the "FILL_IN_BLANK" or "MULTIPLE_CHOICE" task types.
   - **Meaning Drift Prevention**: In explanations, emphasize consistent "Intensity" (e.g., paraphrasing 'often' as 'frequently' is correct, but 'always' is a drift).`;
        } else if (topic === 'reading_cohesionReference') {
          prompt += `\n5. **STRATEGIC EXAMINER ADVICE**:
   - **The Logic Chain Lab**: Design tasks (especially "FILL_IN_BLANK") where students must identify what a specific pronoun (e.g., 'them', 'this') refers to.
   - **Complex Antecedent Drill**: Include references that point to whole clauses or ideas (e.g., 'Such a discovery', 'This reality') rather than just simple nouns, particularly for higher difficulty levels.
   - **This vs. That Distinction**: In explanations, clarify that "This" usually points to the immediate preceding fact, while "That" or "Such" can have broader or contrasting references.
   - **Substitution Rule**: Always suggest the "Substitution Test" in explanations: "If you replace the pronoun with [Answer], does the sentence still make 100% sense?"`;
        }

        // --- WEEKLY QUEST: Skill Cluster Injection ---
        if (isWeeklyQuest && params.weeklySkillCluster) {
          const clusterSkillNames = params.weeklySkillCluster.map(sid => {
            const s = MICRO_SKILLS[sid];
            return s ? `${sid} (${s.name})` : sid;
          }).join(', ');

          prompt += `\n5. **WEEKLY QUEST SUPER-SET — ${params.weeklyClusterLabel || 'Mixed Skills'}**:
   - This is a WEEKLY QUEST batch. You must generate exactly ${generationTarget} questions.
   - **SKILL DISTRIBUTION**: Distribute questions EVENLY across these micro-skills: ${clusterSkillNames}
   - **QUESTION TYPE VARIETY**: YOU MUST prioritize high-interaction types. 
     - At least 30% of questions should be **CATEGORIZATION** (e.g., sorting evidence into 'For' or 'Against').
     - At least 20% should be **ORDERING** (e.g., re-arranging events or steps in a process chronologically).
     - Include MULTIPLE_CHOICE, FILL_IN_BLANK, and SHORT_ANSWER for the remainder.
   - Each question's \"micro_skill\" field MUST be set to one of: ${params.weeklySkillCluster.map(s => `"${s}"`).join(', ')}
   - Ensure the content is sophisticated and tests high-level DSE thinking (Level 5+).`;
        }
      }

      // Resolve Grammar Traps
      let topicTraps = GRAMMAR_TRAPS_MAP[topic] || GRAMMAR_TRAPS_MAP["grammar_accuracy_sva"];
      
      prompt = prompt
        .replace('{{TOPIC}}', resolvedTopic)
        .replace('{{TOPIC_NAME}}', resolvedTopic)
        .replace('{{TOPIC_ID}}', topic)
        .replace('{{TOPIC_TRAPS}}', topicTraps)
        .replace('{{FOCUS}}', JSON.stringify(focus) || 'Fundamentals')
        .replace('{{LEVEL}}', levelName)
        .replace('{{AVAILABLE_SKILLS}}', availableSkills)
        .replace(/{{TIER_NAME}}/g, tier.name)
        .replace(/{{PASSAGE_WORD_COUNT}}/g, tier.passageWords)
        .replace(/{{SENTENCE_LENGTH}}/g, tier.sentenceLen)
        .replace(/{{VOCAB_LEVEL}}/g, tier.vocab)
        .replace(/{{PASSAGE_STRUCTURE}}/g, tier.structure)
        .replace(/{{TASK_COMPLEXITY}}/g, tier.taskComplexity)
        .replace(/{{QUESTION_COUNT}}/g, String(generationTarget));

      // Inject explicitly for Reading
      if (isReadingTopic) {
        // WEEKLY QUEST: Reuse existing passage for batches 2-5
        if (isWeeklyQuest && params.existingPassage) {
          prompt += `\n\n### FINAL EXAMINER CONSTRAINTS:
1. **VERBATIM PASSAGE**: You MUST use the passage text provided below EXACTLY as it is written. DO NOT change a single word, punctuation mark, or paragraph break. It must be 100% identical.
---BEGIN PASSAGE---
${params.existingPassage}
---END PASSAGE---
2. **FULL SET**: Generate exactly ${generationTarget} PROFESSIONAL, FULL-SENTENCE questions based on this passage.
3. **NO FRAGMENTS**: Strictly forbid completion-style questions like "The writer feels...". Use "How does the writer feel about...?" instead.
4. **NO DUPLICATE QUESTIONS**: Each question must test a different aspect of the text. Do not repeat questions from previous batches.
5. Set the "reading_passage" field to the EXACT passage text above (word-for-word).`;
        } else {
          // Batch 1 or general reading: generate fresh passage
          const themeOverride = isWeeklyQuest && params.weeklyTheme ? params.weeklyTheme : null;
          prompt += `\n\n### FINAL EXAMINER CONSTRAINTS:
1. **ATOMIC PASSAGE**: Generate a completely NEW, COHERENT READING PASSAGE (${tier.passageWords} words). 
2. **VARIETY & DIVERSITY**: Prioritize diverse content types and themes. The passage can be:
   - An extract from a novel, short story, or diary
   - A news article or opinion piece
   - An essay or academic text
   - A biographical or historical account
   - A scientific or technological explanation
3. **HONG KONG RELEVANCE (OPTIONAL)**: Where appropriate, incorporate HK context such as:
   - Local news, current events, or social issues relevant to HK DSE students (e.g., education reform, housing, environmental initiatives, youth culture)
   - HK landmarks, neighborhoods, or cultural practices (e.g., Central, Mong Kok, Cha Chaan Teng culture, Cantonese Opera)
   - HK public figures, local businesses, or community initiatives
   - Topics that resonate with HK secondary school students preparing for the DSE
4. ${themeOverride ? `**MANDATORY THEME**: Write the passage based on this specific theme: "${themeOverride}". The content must be ORIGINAL and centered around this topic.` : '**THEME NOVELTY**: Each passage must use a UNIQUE theme and story. DO NOT repeat common narratives (e.g., "a student studying abroad", "a tech startup founder"). Draw inspiration from diverse contexts: literature, history, science, arts, culture, technology, social movements, personal narratives, etc.'}
5. **HKDSE SYLLABUS**: Topics should be socio-technological, educational, or cultural, aligned with DSE reading standards.
6. **FULL SET**: Generate exactly ${generationTarget} PROFESSIONAL, FULL-SENTENCE questions based on this passage.
7. **NO FRAGMENTS**: Strictly forbid completion-style questions like "The writer feels...". Use "How does the writer feel about...?" instead.`;
        }
      } else if (topic?.startsWith('grammar_')) {
        prompt += `\n\n### GRAMMAR LAB CONSTRAINTS:
1. **NO READING PASSAGE**: Do not generate a 'reading_passage'. Use 'boss_fight.paragraph' for context.
2. **AUTHENTIC TRAPS**: Ensure every drill and head-noun task tests one of the 5 HKDSE traps.
3. **ACCURATE INDICES**: The 'head_noun_indices' in 'head_noun_tasks' must be 0-indexed relative to the 'sentence_tokens' array.
4. **DETAILED LOGIC**: In 'explanation', explain WHY the Head Noun is correct and WHY the distractor is wrong.`;
      } else {
        prompt += `\n\n### FINAL EXAMINER CONSTRAINTS:
1. **FULL SET**: Generate exactly ${generationTarget} professional, full-sentence interactive tasks.
2. **NO FRAGMENTS**: Ensure every question is a complete interrogative sentence.`;
      }

      // DSE-Compliant Themes for Diversity
      const DSE_THEMES = [
        "Technology in Education (e.g., AI tutors, VR classrooms)",
        "Urban Development vs. Nature (e.g., Green roofs, micro-parks)",
        "Cultural Preservation (e.g., Cantonese Opera, Neon signs)",
        "Mental Health & Well-being (e.g., Digital detox, Academic pressure)",
        "The Gig Economy & Future of Work (e.g., Slash careers, Remote work)",
        "Sustainable Living (e.g., Zero-waste, Fast fashion impact)",
        "Space Exploration & Science (e.g., Mars colonization, Ocean cleanup)",
        "Intergenerational Relationships (e.g., Elderly care, communication gaps)",
        "Smart Cities & IoT (e.g., Automated transport, data privacy)",
        "Global Citizenship (e.g., Voluntourism, ethical travel)",
        "Traditional Arts in Modern Society (e.g., Calligraphy revival)",
        "Food Culture & Identity (e.g., Evolution of Dim Sum, localized cuisines)",
        "Sports & Resilience (e.g., E-sports legitimacy, Paralympians)",
        "Consumer Psychology (e.g., Influencer marketing, online shopping habits)"
      ];
      const randomTheme = DSE_THEMES[Math.floor(Math.random() * DSE_THEMES.length)];

      console.log(`[LabService] Requesting AI Generation for: ${resolvedTopic} (${paperType || 'unknown'})`);
      console.log(`[LabService] Selected Diversity Theme: ${randomTheme}`);

      try {
        let finalPrompt = prompt;
        
        // Inject Theme Override or Random Theme
        const themeToUse = themeOverride || randomTheme;
        if (isReadingTopic) {
          finalPrompt = finalPrompt.replace(
            '4. **THEME NOVELTY**: Each passage must use a UNIQUE theme and story. DO NOT repeat common narratives (e.g., "a student studying abroad", "a tech startup founder"). Draw inspiration from diverse contexts: literature, history, science, arts, culture, technology, social movements, personal narratives, etc.',
            `4. **MANDATORY THEME**: Write the passage based on this specific theme: "${themeToUse}". The content must be ORIGINAL and centered around this topic.`
          );
        }

        // --- MCQ RATIO INJECTION ---
        if (isReadingTopic && mcqRatio !== undefined) {
          const mcq = Math.round(mcqRatio * 100);
          const sa = 100 - mcq;
          finalPrompt += `\n\n### QUESTION FORMAT CONSTRAINTS:
1. **PROPORTION**: Approximately ${mcq}% of questions should be Multiple Choice (MCQ) and ${sa}% should be Short Answer/Open-ended. 
2. **DSE ALIGNMENT**: For MCQs, ensure the distractors are highly plausible to test precise comprehension.`;
        }

        // --- ELITE PROMPTING FOR PRO MODEL ---
        if (forceHighQuality) {
          finalPrompt += `\n\n### SENIOR EXAMINER PROTOCOL (PREMIUM):
1. **HALLUCINATION GUARD**: For every question generated, explicitly verify that the answer is stated or clearly implied in the passage. Reject any question that relies on general knowledge outside the passage.
2. **DISTRACTOR LOGIC**: Ensure MCQ options include specific traps (e.g., words used in the text but in the wrong context).
3. **PASSAGE SOPHISTICATION**: Use a formal, journalistic, or academic register suitable for HKDSE Part B2.`;
        }

        // --- DEDUPLICATION INJECTION ---
        if (forbiddenPrompts.length > 0) {
          const forbiddenList = forbiddenPrompts.map((p, i) => `${i + 1}. "${p}"`).join('\n');
          finalPrompt += `\n\n### CRITICAL: FORBIDDEN THEMES / PREVIOUS QUESTIONS (DO NOT REPEAT):
The following topics/prompts have ALREADY BEENT GENERATED. You MUST generate something ENTIRELY DIFFERENT.
${forbiddenList}

STRICT RULE: Do NOT use the same hooks, starting sentences, or specific scenarios listed above.`;
        }

        console.log("[LabService] Calling GenerativeAIService.generateJson");
        let data = await GenerativeAIService.generateJson(finalPrompt, {
          model: modelToUse, // Use specified model (Flash for speed, Pro for quality)
          uid: uid || 'system',
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 1.0
          }
        });

        console.log("[LabService] AI Response Data type:", typeof data);
        if (data && typeof data === 'object') {
          console.log("[LabService] AI Raw Keys:", Object.keys(data));
          // [2026 FIX]: GenerativeAIService.generateJson returns { data, model, audio }
          if (data.data && typeof data.data === 'object') {
            console.log("[LabService] Unwrapping actual content from GenerativeAIService response wrapper.");
            data = data.data;
          }
        }

        if (Array.isArray(data)) {
          console.log("[LabService] Data is array, taking first item.");
          data = data[0];
        }

        if (!data || typeof data !== 'object') {
          console.error("[LabService] INVALID AI RESPONSE: Data is not an object.");
          if (data) console.error("[LabService] Data Preview:", JSON.stringify(data).substring(0, 200));
          throw new Error("AI returned malformed or empty data.");
        }

        if (data.interactive_tasks && data.interactive_tasks.length > 0) {
          console.log("[LabService] First task preview:", JSON.stringify(data.interactive_tasks[0]).substring(0, 200));
        } else {
          console.warn("[LabService] No interactive_tasks found in AI response. Checking fallback keys...");
          data.interactive_tasks = data.interactive_tasks || data.tasks || data.interactiveTasks || [];
          console.log("[LabService] After fallback, task count:", data.interactive_tasks?.length);
        }

        // Key Normalization
        data.interactive_tasks = data.interactive_tasks || data.tasks || data.interactiveTasks || [];

        // --- GRAMMAR V2 BYPASS ---
        if (topic?.startsWith('grammar_')) {
          console.log("[LabService] Grammar V2 detected. Bypassing question_bank persistence.");
          return this.normalizeLessonContent(data);
        }

        // Deduplicate & Save
        if (data.interactive_tasks && Array.isArray(data.interactive_tasks)) {
          console.log(`[LabService] Processing ${data.interactive_tasks.length} tasks.`);
          const isListeningFactory = (isListeningTopic || data.type === 'LISTENING') && params.isFactory;

          if (isListeningFactory) {
            console.log("[LabService] 🎧 Unified Listening Mission Batch Detected.");
            // Save as a UNIFIED mission document for the Menu
            const qHash = generateQuestionHash(resolvedTopic, 'listening_mission', data.reading_passage || topic);

            // --- AUDIO GENERATION UPGRADE ---
            // If this is a Listening Quest, generate audio segments
            if (data.reading_passage) {
              try {
                const TTSService = require('./TTSService');
                console.log("[LabService] Generating Audio for Listening Quest...");

                // Parse script into segments
                const lines = data.reading_passage.split(/\n+/).filter(line => line.trim().length > 0);
                const segments = [];
                let totalAudioSize = 0;
                const MAX_AUDIO_SIZE = 900000; // 900KB safety limit for Firestore
                let audioLimitReached = false;

                let currentSpeaker = "Narrator";

                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i];
                  const match = line.match(/^([^:]+):\s*(.*)/);

                  let textToSpeak = line;
                  if (match) {
                    currentSpeaker = match[1].trim();
                    textToSpeak = match[2].trim();
                  }

                  // Determine gender/voice based on speaker tag
                  let gender = 'FEMALE'; // Default
                  let lang = 'en-US';

                  const speakerLower = currentSpeaker.toLowerCase();
                  if (speakerLower.includes('male') || speakerLower.includes('man') || speakerLower.includes('boy') || speakerLower.includes('father') || speakerLower.includes('sir')) {
                    gender = 'MALE';
                  }

                  if (speakerLower.includes('british') || speakerLower.includes('uk')) {
                    lang = 'en-GB';
                  } else if (speakerLower.includes('local') || speakerLower.includes('hk')) {
                    lang = 'en-US';
                  }

                  // Generate Audio
                  try {
                    // Strip stage directions like "[Sighs]" or "[British Accent]" from the spoken text
                    const speakableText = textToSpeak.replace(/\[.*?\]/g, '').trim();

                    if (speakableText.length > 0 && !audioLimitReached) {
                      // Pass only the speakable text to TTS but keep the original for UI display
                      const audioBase64 = await TTSService.generateSpeech(speakableText, lang, gender);

                      // Check size contribution (base64 is ~1.33x the binary size, but Firestore limit is on the final string size)
                      const segmentSize = audioBase64 ? audioBase64.length : 0;

                      if (totalAudioSize + segmentSize > MAX_AUDIO_SIZE) {
                        console.warn(`[LabService] Firestore 1MB limit approaching. Marking segment ${i} as lazy.`);
                        audioLimitReached = true;
                        segments.push({
                          id: i,
                          speaker: currentSpeaker,
                          text: textToSpeak,
                          audio: null,
                          lazy: true,
                          lang: lang,
                          gender: gender
                        });
                      } else {
                        totalAudioSize += segmentSize;
                        segments.push({
                          id: i,
                          speaker: currentSpeaker,
                          text: textToSpeak,
                          audio: audioBase64
                        });
                        console.log(`[LabService] Generated segment ${i} (${currentSpeaker}). Total audio size: ~${Math.round(totalAudioSize / 1024)}KB`);
                      }
                    } else if (speakableText.length > 0 && audioLimitReached) {
                      // Skip audio generation due to size limit
                      segments.push({
                        id: i,
                        speaker: currentSpeaker,
                        text: textToSpeak,
                        audio: null,
                        lazy: true,
                        lang: lang,
                        gender: gender
                      });
                    } else {
                      // Pure stage direction
                      segments.push({
                        id: i,
                        speaker: currentSpeaker,
                        text: textToSpeak,
                        audio: null,
                        isStageDirection: true
                      });
                    }
                  } catch (ttsErr) {
                    console.error(`[LabService] TTS Failed for segment ${i}:`, ttsErr);
                    // FAIL-SAFE: Keep the segment but with null audio
                    segments.push({
                      id: i,
                      speaker: currentSpeaker,
                      text: textToSpeak,
                      audio: null,
                      isError: true
                    });
                  }
                }

                data.audio_segments = segments;
                data.audioLimitReached = audioLimitReached;
                console.log(`[LabService] Audio Generation Complete. ${segments.length} segments. Limit Reached: ${audioLimitReached}`);
              } catch (audioGenErr) {
                console.error("[LabService] CRITICAL TTS ERROR: Audio generation failed entirely.", audioGenErr);
                // System continues with text-only mission
              }
            }
            // --------------------------------

            await QuestionBankStore.upsertById(qHash, {
              id: qHash,
              pk: "question_bank",
              type: 'listening_mission',
              title: data.prediction_metadata?.topic_name || resolvedTopic,
              topic: resolvedTopic,
              level: levelName,
              paper: 'Listening',
              subject: 'English',
              reading_passage: data.reading_passage,
              prediction_metadata: data.prediction_metadata || null,
              audio_segments: data.audio_segments || [], // Save generated audio
              // audioLimitReached is now only true if we actually OMITTED data, 
              // but since we use lazy loading, we aren't omitting it, just deferring it.
              // So we should generally set this to false unless we hit a hard stop logic.
              audioLimitReached: false,
              interactive_tasks: data.interactive_tasks,
              is_approved: false,
              is_factory: true,
              created_at: new Date().toISOString()
            }, { merge: true });

            console.log(`[LabService] Saved unified Listening Mission: ${qHash}`);
            mixedQuestions = data.interactive_tasks;
          } else {
            for (const task of data.interactive_tasks) {
              const qHash = generateQuestionHash(resolvedTopic, task.type || 'gen', task.question || task.instruction);
              const levelLabel = isWriting && task.id && task.id.startsWith('lvl_') ? task.id : null;
              task.id = qHash;
              if (levelLabel) task.levelLabel = levelLabel;

              // For Reading/Writing, ensure we save the passage with EACH question so they can be clustered later
              const passageToSave = data.reading_passage || null;

              await QuestionBankStore.upsertById(qHash, {
                id: qHash,
                pk: "question_bank",
                ...task,
                topic: resolvedTopic,
                level: levelName,
                passage: passageToSave,
                levelLabel: levelLabel, // Save explicit level label if it exists
                subject: 'English',
                is_approved: (params.isFactory || forceHighQuality) ? true : true, // Set to true for all premium factory content
                is_factory: params.isFactory || false,
                is_premium: forceHighQuality || params.isPremium || false,
                ...(isWeeklyQuest ? {
                  quest_type: 'weekly',
                  week_id: params.weekId || null,
                  micro_skill: task.micro_skill || null
                } : {}),
                created_at: new Date().toISOString()
              }, { merge: true });

              if (params.isFactory || mixedQuestions.length < TARGET_COUNT) {
                mixedQuestions.push(task);
              }
            }
          }
        }

        lessonContent = data;
        lessonContent.interactive_tasks = mixedQuestions;
        // Ensure passage is set
        if (!lessonContent.reading_passage && isReadingTopic && data.reading_passage) {
          lessonContent.reading_passage = data.reading_passage;
        }

      } catch (error) {
        console.error("[LabService] Fresh Generation CRITICAL ERROR:", error);
        throw error;
      }
    }
    // Final consistency check for type
    if (!lessonContent.type && skill?.paper) {
      lessonContent.type = skill.paper.toUpperCase();
    }

    // Ensure we return the technical topic ID for progress tracking
    lessonContent.topic = topic;

    try {
      return this.normalizeLessonContent(lessonContent);
    } catch (normError) {
      console.error("[LabService] Normalization Error:", normError);
      throw normError;
    }
  }

  // Helper to generate just the explanation part if we have questions
  static async generateExplanationOnly(topic, level, uid = null) {
    const levelName = this.formatLevelName(level);
    const skill = MICRO_SKILLS[topic];
    const resolvedTopic = skill ? skill.name : (topic || 'General English');

    // 1. Try to fetch from specialized landing content (NEW)
    try {
      const landingData = await CosmosStore.getMicroSkillLanding(topic);
      if (landingData) {
        console.log(`[LabService] Found specialized landing content for: ${topic}`);
        // Transform to match the schema expected by frontend
        return {
          conceptual_explanation: landingData.learning_content.anatomy.definition,
          key_points: landingData.learning_content.pro_tips_en,
          examples: landingData.learning_content.anatomy.examples.map(ex => ({
            text: ex.text,
            explanation: `CLUES: ${ex.clues.join(', ')}\nLOGIC: ${ex.logic}\nINFERENCE: ${ex.inference_en}`
          })),
          success_feedback: "Great job! You've mastered the core concepts of this skill.",
          suggested_next_steps: ["Try the DSE Standard level for more challenge."],
          learning_content: landingData.learning_content // Include full structured content
        };
      }
    } catch (err) {
      console.warn(`[LabService] Failed to fetch specialized landing content for ${topic}:`, err);
    }

    // 2. Fallback to AI Generation
    const isReadingTopic = (topic || '').toLowerCase().includes('reading') || (topic || '').toLowerCase().includes('comprehension');
    if (isReadingTopic) {
      console.warn(`[LabService] Briefing missing for Reading topic: ${topic}. Generation blocked.`);
      throw new Error(`EXPLANATION_MISSING: No specialized briefing found for Reading topic '${topic}'.`);
    }

    const prompt = `Generate a JSON object with 'conceptual_explanation', 'key_points', 'examples', 'success_feedback', 'suggested_next_steps' for the topic '${resolvedTopic}' at '${levelName}'. NO interactive_tasks needed.
    
    IMPORTANT: Provide 3 distinct 'examples' in the array. Each example must have 'text' (the example passage/sentence) and 'explanation' (analysis). Do NOT use placeholders.
    CRITICAL: For 'key_points', use standard sentence case (e.g. "This is a point.") - NEVER CAPITALIZE EVERY WORD.`;
    const result = await GenerativeAIService.generateContent(prompt, {
      generationConfig: { responseMimeType: "application/json" }
    });

    if (result.response && result.response.usageMetadata) {
      const TokenService = require('./TokenService');
      TokenService.logUsage(uid || 'system', 'lab_explanation_only', result.response.usageMetadata);
    }

    let data = JSON.parse(cleanJsonResponse(result.response.text()));
    if (Array.isArray(data)) data = data[0];
    return data;
  }

  static async generateCheatAnswers(tasks, targetDseLevel, passage = null) {
    const prompt = `You are an expert HKDSE English tutor. For the following set of interactive tasks, generate answers that would be typical of a student performing at HKDSE ${targetDseLevel}.
    
    ${passage ? `CONTEXT PASSAGE: ${passage}\n\n` : ''}
    TASKS: ${JSON.stringify(tasks)}
    
    Return a JSON object where keys are task IDs and values are the generated answer strings. 
    - For MCQ tasks, just return the letter (e.g. "A").
    - For SHORT_ANSWER, provide a response appropriate for the requested level.
    - For ORDERING, return a hyphen-separated string of the 0-indexed positions of the options in their correct sequence (e.g. "2-0-3-1" means the item at index 2 comes first, then index 0, etc.).
    - For CATEGORIZATION, return a JSON object mapping bucket names to arrays of 0-based option indices (e.g. { "Pros": [0, 2], "Cons": [1, 3] }).
    
    Return ONLY the JSON. No trailing punctuation.`;

    const result = await GenerativeAIService.generateContent(prompt, {
      model: "ace-it-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      const responseText = result.response.text();
      // Optional debug logging (mirrors evaluate_batch)
      if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_LAB) {
        fs.appendFileSync('lab_debug.log', `\n--- CHEAT PROMPT ---\n${prompt}\n--- CHEAT RESPONSE ---\n${responseText}\n`);
      }

      let data = JSON.parse(cleanJsonResponse(responseText));
      if (Array.isArray(data)) data = data[0];
      return data;
    } catch (e) {
      console.error("[LabService] Cheat JSON Parse Error:", e, result.response.text());
      return {};
    }
  }

  static async generateWritingCheat(promptText, mode, level) {
    const prompt = `You are an expert HKDSE English Exam candidate. 
    Task: Write a response for the following writing prompt.
    Mode: ${mode}
    Target Level: HKDSE Level ${level}
    
    Prompt: "${promptText}"
    
    Write ONLY the response text. 
    - If Level 3: Simple, adequate, some grammatical slips, basic vocabulary.
    - If Level 5**: Sophisticated, flawless, complex structures, impressive vocabulary, perfect tone.
    - Keep length appropriate for the mode (Sentence: 1 sentence, Paragraph: 100-150 words, Essay: 400 words).`;

    const result = await GenerativeAIService.generateContent(prompt, {
      model: "ace-it-flash"
    });

    return { text: result.response.text().trim() };
  }

  // New method to mark questions as complete
  static async markQuestionsSeen(uid, questionIds) {
    if (!uid || !questionIds || questionIds.length === 0) return;
    await CosmosStore.markPracticeHistory(uid, questionIds);
  }

  // New method to evaluate Integrated Simulation (Part B)
  static async evaluateIntegratedSimulation(questId, studentNotes, studentDraft, targetLevel) {
    const quest = await QuestionBankStore.getById(questId);
    if (!quest) throw new Error("Quest not found");
    LabService.normalizeListeningMissionData(quest);

    const prompt = `You are a Senior HKEAA Examiner for Paper 3 (Listening and Integrated Skills).
    Task: Grade the student's submission for the mission: "${quest.title}".
    
    ### MISSION CONTEXT:
    - WRITING TASK: "${quest.integrated_data?.writing_task?.instruction || 'General integrated task'}"
    - ROLE PROFILE: "${quest.integrated_data?.writing_task?.role_profile || 'Professional school/community coordinator writing to an official audience.'}"
    - TARGET DSE LEVEL: ${targetLevel}
    
    ### SOURCE DATA:
    - DATA FILE (Reference): ${JSON.stringify(quest.integrated_data?.data_file || [])}
    - AUDIO TRANSCRIPT: ${quest.integrated_data?.audio_transcript || 'Audio transcript missing.'}
    - STUDENT NOTES: ${JSON.stringify(studentNotes)}
    - STUDENT DRAFT: "${studentDraft}"

    ### MARKING KEY (MANDATORY CONTENT POINTS):
    ${JSON.stringify(quest.integrated_data?.marking_key || [])}

    ### GRADING PROTOCOL:
    1. **Content (0-5)**:
       - Scale linearly based on the provided Marking Key. 
       - 100% points met = 5/5, 80%+ met = 4/5, 60%+ met = 3/5, etc.
       - Use "Positive Marking": Award points for semantic matches.
       - Precision Rule for bounded KPIs: if a key point includes qualifiers like "under", "below", "maximum", or "at most", the student must preserve that boundary language. Writing only the bare number (e.g. just "five minutes") is NOT full-credit at Level 5 standard.
       - Threshold Comparator Rule: if the key specifies "over/above/more than", do NOT accept equality-only wording. Example: if the required point is "over five litres", then "five litres" is imprecise and cannot receive full credit.
       - Correction Trap Rule: when two conflicting values are mentioned (e.g., an earlier date later corrected), award credit only for the final consensus value and call out the correction explicitly in feedback.
       - Reasoning / Causation: if a Marking Key bullet requires the student to link a rule or deadline to its stated justification in the briefing (e.g. prior complaints), award that bullet only when both the fact and the cause are present; restating the time/rule without the cause does not satisfy that bullet.
       - Primary vs backup: if a Marking Key bullet states that method A is primary and method B is backup-only, reject answers that treat both as equally important or that present paper/legacy as the main channel when the key requires digital/QR as primary.
       - Currency completeness (HKD): When a Marking Key bullet concerns Hong Kong dollar amounts, expect currency alongside the figure (HK$, $, HKD, or "dollars") unless the bullet is purely numerical by design; bare integers are imprecise for formal memos.
       - Named security or operations codes: If the Marking Key names a protocol label (e.g. "Code Orange"), full credit for that bullet requires the student to use that label or explicitly equate their wording to it; correct numbers without the code earn partial credit only if the key allows.
       - Proper-name spelling: If the Marking Key requires exact spelling of a named person (e.g. "Marcus Thorpe", "Julianne Kwok", "Janice Wong"), penalize serious misspellings or garbled names; minor typos one letter off may receive partial credit at examiner discretion.
       - Integrated Briefing synthesis: Marking Key bullets that start with "[Audio synthesis — Integrated Briefing only]" (or clearly state they are from the stakeholder briefing only) must be satisfied using facts from the Integrated Briefing audio, not by copying the Data Files alone; if the student only paraphrases documents and misses those briefing-only facts, mark those bullets not met.
    2. **Language (0-5)**: Professionalism, grammar, and variety.
    3. **Organization (0-5)**: Logical flow and structure.
    4. **Appropriacy (0-3)**: Tone and register consistency.
       - Penalize sign-offs or tone that conflict with the required professional role profile.
    
    ### JSON OUTPUT SCHEMA (STRICT):
    - **CRITICAL**: Escape all double quotes (\\") and newlines (\\n) within strings.
    - **CRITICAL**: Return ONLY the JSON object. No preamble.
    {
      "content": number,
      "language": number,
      "organization": number,
      "appropriacy": number,
      "totalScore": number, // Sum of 1-4 (Max 18)
      "dseLevel": string, // "1", "2", "3", "4", "5", "5*", "5**"
      "feedback": string,
      "contentBreakdown": [
        {
          "point": string, // From the Marking Key
          "met": boolean,
          "rationale": string,
          "quote": string, // Direct quote from Audio/Data File
          "documentSource": string
        }
      ],
      "exemplar5": string // Level 5 model answer only: ~150–220 words. No second exemplar (saves output tokens).
    }
    
    Return ONLY the JSON response.`;

    const result = await GenerativeAIService.generateContent(prompt, {
      model: "ace-it-flash",
      generationConfig: {
        responseMimeType: "application/json",
        // One bounded exemplar + checklist JSON (no 5** second exemplar).
        maxOutputTokens: 4096
      }
    });

    try {
      const responseText = result.response.text();
      let data = repairJson(responseText);
      if (Array.isArray(data)) data = data[0];
      return data;
    } catch (e) {
      const raw = result.response.text();
      console.error("[LabService] Integrated Evaluation Parse Error:", e);
      // Log for manual audit
      try { fs.appendFileSync('grading_errors.log', `\n[${new Date().toISOString()}] QUEST: ${questId}\nERROR: ${e.message}\nRAW: ${raw}\n`); } catch(le) {}
      
      return {
        content: 1, language: 2, organization: 2, appropriacy: 2,
        totalScore: 7, dseLevel: "3",
        feedback: "The grading service returned a response that could not be read (often the model output was cut off). Please use \"Restart simulation\" or submit again. If this keeps happening, try a slightly shorter draft or contact support.",
        contentBreakdown: [
          { point: "Grading response parse failed", met: false, rationale: "The examiner JSON could not be parsed. This is usually truncated model output, not your draft length.", quote: "N/A", documentSource: "System" }
        ],
        exemplar5: "Exemplar generation failed during parsing. Please refresh and try again."
      };
    }
  }

  // New method to evaluate Data Sprint (Part A)
  static async evaluateDataSprint(questId, answers) {
    const quest = await QuestionBankStore.getById(questId);
    if (!quest) throw new Error("Quest not found");
    LabService.normalizeListeningMissionData(quest);

    const sprintTasks = quest.sprint_data?.tasks || [];
    
    // Format comparison data for LLM
    const gradingBasis = sprintTasks.map(t => {
        if (t.type === 'TABLE') return { id: t.id, type: t.type, questions: (t.rows || []).map((r, i) => ({ label: r.label, answer: r.answer, student: answers[`${t.id}_${i}`] })) };
        if (t.type === 'LIST' || t.type === 'GAP_FILL_LIST') return { id: t.id, type: t.type, questions: (t.items || []).map((it, i) => ({ label: it.label, answer: it.answer, student: answers[`${t.id}_${i}`] })) };
        if (t.type === 'MCQ_BATCH') return { id: t.id, type: t.type, questions: (t.questions || []).map((q, i) => ({ question: q.question, answer: q.answer || q.correct_answer, student: answers[`${t.id}_${i}`] })) };
        if (t.type === 'FORM_FILLING') return { id: t.id, type: t.type, questions: (t.fields || []).map((f, i) => ({ label: f.label, answer: f.answer, student: answers[`${t.id}_${i}`] })) };
        return { id: t.id, type: t.type, question: t.question, answer: t.answer || t.correct_answer, student: answers[t.id] };
    });

    const prompt = `You are a professional HKDSE English Paper 3 Examiner.
    Task: Grade the student's factual extraction (Part A) for mission: "${quest.title}".
    
    RULES:
    1. Factual Accuracy: Be strict with numbers, dates, and names, but allow minor spelling errors if the phonetic meaning is clear (HKEAA "positive marking" principle).
    2. Format: "17th July" and "July 17" are equally correct.
    3. MCQ: Must match exactly.
    4. Correction Trap Detection (Miss Janie mode): If the student uses an earlier value that was later corrected in the script (for example "12 booths" later corrected to "14 booths", or "16 June" corrected to "18 June"), mark it wrong and explain that the speaker issued a correction and the final consensus is required.
    5. Threshold Comparator Strictness: For bounded thresholds (e.g. "over 20 mm/hour"), equality-only answers (e.g. "20mm" or "20") are wrong.
    6. Unit Precision: For technical thresholds, missing unit/time basis (e.g. leaving out "per hour") is wrong.

    ### AUDIO TRANSCRIPT (SOURCE):
    ${quest.sprint_data?.audio_transcript || 'Audio transcript missing.'}

    STUDENT SUBMISSION: ${JSON.stringify(gradingBasis)}

    ### JSON FORMAT (REQUIRED):
    {
      "score": number, // Percentage 0-100
      "correctCount": number,
      "totalCount": number,
      "feedback": string,
      "breakdown": [
        {
          "id": string, // ID of the task/field
          "label": string, // Question label
          "studentAnswer": string,
          "correctAnswer": string,
          "isCorrect": boolean,
          "rationale": string, // Direct quote from script explaining the answer; if wrong due to correction trap, include a specific caution tip
          "startTime": number // Estimated start time in seconds (e.g. 120)
        }
      ]
    }

    Return ONLY the JSON response.`;

    const result = await GenerativeAIService.generateContent(prompt, {
      model: "ace-it-flash",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096
      }
    });

    try {
      const responseText = result.response.text();
      let data = JSON.parse(cleanJsonResponse(responseText));
      if (Array.isArray(data)) data = data[0];
      return data;
    } catch (e) {
      console.error("[LabService] Sprint Evaluation Parse Error:", e);
      return { score: 10, feedback: "Error calculating score. Basic participation credit." };
    }
  }

  // Helper to normalize content (handle Array/Object mismatches from AI)
  static normalizeLessonContent(data) {
    // 1. Examples
    if (data.examples) {
      if (!Array.isArray(data.examples)) data.examples = [data.examples];
      data.examples = data.examples.map(ex => {
        if (typeof ex === 'string') return { text: ex, explanation: "Key Example" };
        return {
          text: ex.text || ex.sentence || ex.word || "Example",
          explanation: ex.explanation || ex.definition || "See context."
        };
      });
    } else {
      data.examples = [];
    }

    // 2. Key Points
    if (data.key_points) {
      if (!Array.isArray(data.key_points)) data.key_points = [data.key_points];
      data.key_points = data.key_points.filter(p => typeof p === 'string' && p.trim().length > 0);
    } else {
      data.key_points = [];
    }

    // 3. Suggested Next Steps
    if (data.suggested_next_steps) {
      if (!Array.isArray(data.suggested_next_steps)) data.suggested_next_steps = [data.suggested_next_steps];
      data.suggested_next_steps = data.suggested_next_steps.filter(s => typeof s === 'string' && s.trim().length > 0);
    } else {
      data.suggested_next_steps = [];
    }

    // 4. Tasks
    if (data.interactive_tasks) {
      if (!Array.isArray(data.interactive_tasks)) data.interactive_tasks = [data.interactive_tasks];
      data.interactive_tasks.forEach((t, i) => {
        if (!t.id) t.id = `gen_${Date.now()}_${i}`;
        // Ensure question text exists
        if (!t.question && t.target_sentence) t.question = `Speak this: ${t.target_sentence}`;
      });
    }

    return data;
  }

}

module.exports = LabService;
