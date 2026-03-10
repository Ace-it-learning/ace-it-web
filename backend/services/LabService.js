const GenerativeAIService = require('./GenerativeAIService');
const admin = require('firebase-admin');
const fs = require('fs'); // For debugging logs
const crypto = require('crypto'); // For deterministic hashing
const { MICRO_SKILLS } = require('../constants/microSkills');

// Helper: Generate Hash for Deduplication
const generateQuestionHash = (topic, type, questionText) => {
  const str = `${topic.toLowerCase()}-${type}-${questionText.trim()}`;
  return crypto.createHash('md5').update(str).digest('hex');
};

const cleanJsonResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.includes('```json')) {
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```[\w]*\n?/g, '').replace(/```\n?/g, '').trim();
  }
  return cleaned;
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

const LISTENING_LAB_PROMPT = `HKDSE Listening Specialist. Generate HKDSE Listening Lab JSON for '{{TOPIC}}' at level '{{LEVEL}}'.

### LISTENING STRUCTURE RULES:
1. **AUDIO SCRIPT ("reading_passage")**:
   - Create a realistic dialogue or monologue relevant to the topic (approx {{PASSAGE_WORD_COUNT}} words).
   - **ACCENT & SPEED**: Indicate speakers' accents (British, American, Australian, HK Local) in square brackets e.g., [British Accent, Fast].
   - **DISTRACTIONS**: Include natural self-corrections, interruptions, and hesitations types (e.g., "Let's meet at... no wait, make it...").
   - **ATTITUDE**: Infuse specific emotions (Sarcasm, Excitement, Reluctance) into the script.

2. **PREDICTION STRATEGY (The Pen: Capture)**:
   - YOU MUST generate a "prediction_metadata" object to prepare the student's ear for the content.
   - **LOGIC SHIFT**: Move from "exact word-matching" to "relevant sub-topics". Sub-topics should be logical concepts the student might encounter.
   - **THE SYNONYM BRIDGE**: For each correct sub-topic (not a distractor), provide 3-4 synonyms or related phrases that appear in the script. This prevents "tunnel vision".
   - **PREDICTION FEEDBACK**: For distractors, provide a hint that triggers critical thinking (e.g., "Think about the context—how would a doctor help with a train delay?").

3. **TASK DESIGN (3 PILLARS)**:
   - Generate exactly {{QUESTION_COUNT}} tasks that cover the "Three Pillars of Auditory Mastery":
   - **Decoding (The Ear)**: Tasks focused on Accent/Speed/Ambiguity. (e.g. MCQ)
   - **Capture (The Pen)**: Tasks focused on Details/Prediction/Note-taking. (e.g. GAP_FILL or FORM_FILLING)
   - **Synthesis (The Brain)**: Tasks focused on Main Idea/Attitude/Integration. (e.g. MCQ or SHORT_RESPONSE)
   - **Integrated Task**: Mini-synthesis tasks based on the audio content.
   - You MUST provide a diverse mix across these types to reach the total {{QUESTION_COUNT}}.

### MICRO-SKILLS TAGGING:
- Tag each task with one of the following IDs:
  - Decoding: accent_recognition, speed_processing, ambiguity_handling
  - Capture: note_taking, prediction, detail_listening, listening_for_gist, form_filling
  - Synthesis: main_idea, speaker_attitude, integrated_tasks

JSON SCHEMA:
{
  "type": "LISTENING",
  "prediction_metadata": {
    "topic_name": string,
    "sub_topics": [
      {
        "id": string,
        "name": string, // The logical concept (e.g., "Budget Deficit")
        "category": "Strategic Capture",
        "synonyms": string[], // 3-4 synonyms or related concepts found in script (empty for distractors)
        "is_distractor": boolean,
        "hint": string // A pedagogical hint (mandatory for distractors)
      }
    ]
  },
  "reading_passage": string, // The Script with [Stage Directions].
  "conceptual_explanation": string,
  "key_points": string[],
  "interactive_tasks": [{
    "id": string,
    "type": "MCQ" | "GAP_FILL" | "FORM_FILLING" | "SHORT_RESPONSE",
    "skills": string[], // ARRAY of micro-skill IDs.
    "instruction": string,
    "question": string,
    "options": string[], // Required for MCQ.
    "answer": string,
    "answer_logic": string,
    "explanation": string
  }],
  "success_feedback": string,
  "suggested_next_steps": string[]
}`;

class LabService {
  static formatLevelName(level) {
    let lvl = String(level).trim();
    // Handle "41" or other concatenated garbage by taking the first digit
    if (/^\d{2,}$/.test(lvl)) {
      lvl = lvl.charAt(0);
    }

    if (lvl === '7') return 'HKDSE Level 5** (Mastery)';
    if (lvl === '6') return 'HKDSE Level 5* (Exemplary)';
    if (lvl === '5') return 'HKDSE Level 5 (Strong)';
    if (lvl === '4') return 'HKDSE Level 4 (Good)';
    if (lvl === '3') return 'HKDSE Level 3 (Adequate)';
    return lvl && lvl.includes('HKDSE') ? lvl : `HKDSE Level ${lvl || '3'}`;
  }

  static async getListeningQuests() {
    const db = admin.firestore();
    try {
      const snapshot = await db.collection('question_bank')
        .where('type', '==', 'listening_mission')
        .where('is_approved', '==', true)
        .limit(100)
        .get();

      // PERFORMANCE OPTIMIZATION: Return only metadata to make menu load instantly
      const quests = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          topic: data.topic,
          level: data.level,
          paper: data.paper,
          subject: data.subject,
          created_at: data.created_at,
          hasAudio: data.audio_segments && data.audio_segments.length > 0
        };
      });

      // Sort in-memory to avoid composite index requirements
      quests.sort((a, b) => {
        const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at || 0);
        const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at || 0);
        return dateB - dateA;
      });

      return quests.slice(0, 20);
    } catch (err) {
      console.error("[LabService] Error fetching listening quests:", err);
      return [];
    }
  }

  static async getQuestById(id) {
    const db = admin.firestore();
    try {
      const doc = await db.collection('question_bank').doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (err) {
      console.error("[LabService] Error fetching quest by ID:", err);
      throw err;
    }
  }

  static async generateLesson(params) {
    console.log("[LabService] generateLesson START", JSON.stringify(params));
    const db = admin.firestore();
    let { topic, focus, level, uid, targetCount } = params;
    const isWeeklyQuest = params.isWeeklyQuest || false;
    const skillsKey = (topic || '').toLowerCase();
    const paperType = (params.paperType || '').toLowerCase();
    const isReadingTopic = isWeeklyQuest || skillsKey.includes('reading') || skillsKey.includes('comprehension');
    const isWritingTopic = skillsKey.includes('writing');
    const isListeningTopic = skillsKey.includes('listening') || paperType.includes('listening');

    // Default target counts based on user request:
    // Easy (Level 3) -> 5 questions
    // Medium (Level 4) -> 8 questions 
    // DSE Standard/Elite (Level 5+) -> 10 questions (default)
    let dynamicTarget = 10;
    if (isReadingTopic) {
      const lvlNum = parseInt(level);
      if (lvlNum <= 3) dynamicTarget = 5;
      else if (lvlNum === 4) dynamicTarget = 8;
      else dynamicTarget = 10;
    }

    const TARGET_COUNT = targetCount || dynamicTarget;

    const levelName = this.formatLevelName(level);

    // Resolve Topic ID to Name if possible
    const skill = MICRO_SKILLS[topic];
    const resolvedTopic = skill ? skill.name : (topic || 'General English');

    // Fetch Landing Content (Learning Guide) if available
    let landingContent = null;
    try {
      const landingDoc = await db.collection('micro_skill_landing').doc(topic).get();
      if (landingDoc.exists) {
        landingContent = landingDoc.data();
        console.log(`[LabService] Found learning guide for topic: ${topic}`);
      }
    } catch (err) {
      console.warn(`[LabService] Failed to fetch landing content for topic ${topic}:`, err);
    }

    // 1. Fetch Seen Question IDs for this user
    let seenQuestionIds = new Set();
    if (uid && uid !== 'placeholder') {
      try {
        const historySnapshot = await db.collection('users').doc(uid).collection('practice_history').get();
        historySnapshot.forEach(doc => seenQuestionIds.add(doc.id));
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
        // Fetch candidates
        const strictSnapshot = await db.collection('question_bank')
          .where('topic', '==', resolvedTopic)
          .where('level', '==', levelName)
          .where('is_approved', '==', true)
          .limit(50) // Fetch more to find a cluster
          .get();

        const passageGroups = {}; // hash -> { passage, questions: [] }

        strictSnapshot.forEach(doc => {
          const data = doc.data();
          if (!data.passage) return; // Skip broken ones
          if (seenQuestionIds.has(doc.id)) return; // Skip seen

          // Group by Passage Hash (simple content hash)
          const pHash = crypto.createHash('md5').update(data.passage.trim()).digest('hex');

          if (!passageGroups[pHash]) {
            passageGroups[pHash] = { passage: data.passage, questions: [] };
          }
          passageGroups[pHash].questions.push({ ...data, id: doc.id });
        });

        // Find the best cluster
        const clusters = Object.values(passageGroups);
        // We want a cluster that has at least X questions?
        // Or if we have checking for "seen", maybe we just pick the biggest remaining cluster.
        clusters.sort((a, b) => b.questions.length - a.questions.length);

        if (clusters.length > 0 && clusters[0].questions.length >= 5) {
          // We have a decent cluster (at least 5 questions) for an existing passage.
          // We can use it. If it's less than 10, we can GENERATE MORE for THIS SAME PASSAGE?
          // That's hard because the AI needs the passage. 
          // Better: If we have < 10, just serve what we have? Or Force Gen?
          // Let's decide: If we have >= 5, use them. If < 5, force FULL FRESH GEN.

          selectedPassage = clusters[0].passage;
          mixedQuestions = clusters[0].questions.slice(0, TARGET_COUNT);
          console.log(`[LabService] Found valid cluster with ${mixedQuestions.length} questions.`);
        } else {
          console.log(`[LabService] No sufficient question cluster found. Forcing FULL GENERATION.`);
        }

      } catch (e) {
        console.warn("Reading fetch failed", e);
      }

    } else if (!params.isFactory) {
      // --- OLD LOGIC FOR NON-READING (GRAMMAR, VOCAB, ETC) ---
      try {
        const strictSnapshot = await db.collection('question_bank')
          .where('topic', '==', resolvedTopic)
          .where('level', '==', levelName)
          .where('is_approved', '==', true)
          .limit(20)
          .get();

        strictSnapshot.forEach(doc => {
          const data = doc.data();
          if (mixedQuestions.length < TARGET_COUNT && !seenQuestionIds.has(doc.id)) {
            mixedQuestions.push({ ...data, id: doc.id });
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
        const factoryHistory = await db.collection('question_bank')
          .where('topic', '==', resolvedTopic)
          .limit(20)
          .get();

        const docs = [];
        factoryHistory.forEach(doc => docs.push(doc.data()));

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
    // If we have 0 questions, we generate 10.

    // Override missingCount logic for Reading:
    // If Reading and mixedQuestions < TARGET_COUNT, we might just accept a shorter lesson OR force full 10 new ones if we had 0.
    // If we have defined "cluster >= 5" as success, then missingCount might be > 0.
    // We will just serve the partial lesson if we found a cluster. 
    // BUT if we found NO cluster (length 0), we generate 10.

    // Refined logic:
    let needsGeneration = mixedQuestions.length === 0 || isWeeklyQuest;

    // --- INDUSTRIAL LOCKDOWN: Never generate in real-time for students ---
    // Exception: Allow speaking_ topics to pass (defensive, as they should be redirected anyway)
    if (needsGeneration && !params.isFactory && !isWeeklyQuest && !resolvedTopic.startsWith('speaking_')) {
      console.log(`[LabService] LOCKDOWN: Bank is empty for ${resolvedTopic}. Refusing real-time AI generation.`);
      throw new Error(`QUEST_BANK_EMPTY: No approved quests found for ${resolvedTopic} (${levelName}). Please notify administrator.`);
    }

    if (!needsGeneration && mixedQuestions.length > 0) {
      console.log(`[LabService] Using CACHED/CLUSTERED session (${mixedQuestions.length} questions): ${mixedQuestions.map(q => q.id).join(', ')}`);
      lessonContent = await this.generateExplanationOnly(topic, level, uid);
      lessonContent.interactive_tasks = mixedQuestions;
      if (isReadingTopic && selectedPassage) {
        lessonContent.reading_passage = selectedPassage;
      }
    } else {
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
      const generationTarget = params.targetCount || 20;

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

      prompt = prompt
        .replace('{{TOPIC}}', resolvedTopic)
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
        // Inject the random theme into the constraints
        if (isReadingTopic) {
          finalPrompt = finalPrompt.replace(
            '4. **THEME NOVELTY**: Each passage must use a UNIQUE theme and story. DO NOT repeat common narratives (e.g., "a student studying abroad", "a tech startup founder"). Draw inspiration from diverse contexts: literature, history, science, arts, culture, technology, social movements, personal narratives, etc.',
            `4. **MANDATORY THEME**: Write the passage based on this specific theme: "${randomTheme}". The content must be ORIGINAL and centered around this topic.`
          );
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
          model: "gemini-2.0-flash", // Proven working alias
          uid: uid || 'system',
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 1.0
          }
        });

        console.log("[LabService] AI Response Data type:", typeof data);
        if (data && typeof data === 'object') {
          console.log("[LabService] AI Raw Keys:", Object.keys(data));
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

        // Deduplicate & Save
        if (data.interactive_tasks && Array.isArray(data.interactive_tasks)) {
          console.log(`[LabService] Processing ${data.interactive_tasks.length} tasks.`);
          const isListeningFactory = (isListeningTopic || data.type === 'LISTENING') && params.isFactory;

          if (isListeningFactory) {
            console.log("[LabService] 🎧 Unified Listening Mission Batch Detected.");
            // Save as a UNIFIED mission document for the Menu
            const qHash = generateQuestionHash(resolvedTopic, 'listening_mission', data.reading_passage || topic);
            const docRef = db.collection('question_bank').doc(qHash);

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

            await docRef.set({
              id: qHash,
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
              created_at: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`[LabService] Saved unified Listening Mission: ${qHash}`);
            mixedQuestions = data.interactive_tasks;
          } else {
            const batch = db.batch();
            data.interactive_tasks.forEach(task => {
              const qHash = generateQuestionHash(resolvedTopic, task.type || 'gen', task.question || task.instruction);
              const levelLabel = isWriting && task.id && task.id.startsWith('lvl_') ? task.id : null;
              task.id = qHash;
              if (levelLabel) task.levelLabel = levelLabel;

              const docRef = db.collection('question_bank').doc(qHash);

              // For Reading/Writing, ensure we save the passage with EACH question so they can be clustered later
              const passageToSave = data.reading_passage || null;

              batch.set(docRef, {
                ...task,
                topic: resolvedTopic,
                level: levelName,
                passage: passageToSave,
                levelLabel: levelLabel, // Save explicit level label if it exists
                subject: 'English',
                is_approved: params.isFactory ? false : true,
                is_factory: params.isFactory || false,
                ...(isWeeklyQuest ? {
                  quest_type: 'weekly',
                  week_id: params.weekId || null,
                  micro_skill: task.micro_skill || null
                } : {}),
                created_at: admin.firestore.FieldValue.serverTimestamp()
              }, { merge: true });

              if (params.isFactory || mixedQuestions.length < TARGET_COUNT) {
                mixedQuestions.push(task);
              }
            });
            await batch.commit();
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
    const db = admin.firestore();
    const levelName = this.formatLevelName(level);
    const skill = MICRO_SKILLS[topic];
    const resolvedTopic = skill ? skill.name : (topic || 'General English');

    // 1. Try to fetch from specialized landing content (NEW)
    try {
      const landingDoc = await db.collection('micro_skill_landing').doc(topic).get();
      if (landingDoc.exists) {
        const landingData = landingDoc.data();
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
      model: "gemini-2.0-flash",
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
      model: "gemini-2.0-flash"
    });

    return { text: result.response.text().trim() };
  }

  // New method to mark questions as complete
  static async markQuestionsSeen(uid, questionIds) {
    const db = admin.firestore();
    if (!uid || !questionIds || questionIds.length === 0) return;

    const batch = db.batch();
    questionIds.forEach(qid => {
      const ref = db.collection('users').doc(uid).collection('practice_history').doc(qid);
      batch.set(ref, {
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        completed: true
      });
    });
    await batch.commit();
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
