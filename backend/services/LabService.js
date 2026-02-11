const GenerativeAIService = require('./GenerativeAIService');
const admin = require('firebase-admin');
const fs = require('fs'); // For debugging logs
const crypto = require('crypto'); // For deterministic hashing
const { MICRO_SKILLS } = require('../constants/microSkills');

// Helper: Generate Hash for Deduplication
const generateQuestionHash = (topic, type, questionText) => {
  const str = `${topic.toLowerCase()}-${type}-${questionText.trim().substring(0, 50)}`;
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

// Prompts...
const LAB_GENERATION_PROMPT = `Expert HKDSE English Tutor. Generate a high-stakes Learning Lab for topic '{{TOPIC}}', focus '{{FOCUS}}', level '{{LEVEL}}'.

### SAFETY RULES (STRICT ADHERENCE REQUIRED):
1. **NO ANSWER LEAKS**: The 'placeholder' MUST NEVER contain even a single word from the intended answer. 
   - BAD: placeholder: "Add details (e.g., from Canada)" -> LEAK!
   - GOOD: placeholder: "Provide a prepositional phrase clarifying origin..."
2. **DISTINCT TASKS**: Every task in the 'interactive_tasks' array must be unique.
3. **MCQ INTEGRITY**: For MCQ tasks, provided options must be plausible but only one is correct.

### DIFFICULTY BLUEPRINT (HKDSE STANDARDS):
- **Level 3 (Adequate)**: Focus on straightforward literal comprehension, common vocabulary, and simple inferences. Sentences are 15-20 words.
- **Level 4 (Good)**: Requires identifying attitudes and following more complex arguments. Use moderately sophisticated vocabulary. Sentences are 20-30 words.
- **Level 5 (Strong)**: Requires synthesizing information from multiple parts of a text. Abstract themes. High-tier vocabulary (academic/professional).
- **Level 5* (Exemplary)**: Subtle nuances, irony, and complex stylistic features. High-frequency academic vocabulary (no obscure archaisms). Sentence structures are varied and complex (30+ words).
- **Level 5** (Mastery)**: Masterful command. Tasks require identifying subtle speaker attitudes and evaluating contrasting views in highly abstract/technical contexts. Focus on linguistic precision and logical synthesis, NOT just vocabulary difficulty. Use vocabulary typical of high-end journalism (e.g., The Economist, New York Times).

### TOPIC DISCIPLINE:
- If topic is 'Literal Comprehension': Focus EXCLUSIVELY on information explicitly stated in the text. Find specific facts, names, dates, or clearly stated stances. The challenge at high DSE levels (5*-5**) comes from the COMPLEXITY of the reading passage and the PRECISION needed to extract the correct detail, NOT from making abstract inferences or logical leaps.

### MICRO-SKILLS TAGGING:
- You MUST tag each interactive task with 1 appropriate micro-skill ID from the following list:
{{AVAILABLE_SKILLS}}
- If the lab topic matches a specific skill (e.g., 'reading_inference'), use that tag mostly. If 'General', mix the tags.

JSON SCHEMA:
{
  "type": "READING"|"GRAMMAR"|"VOCAB",
  "reading_passage": string, // REQUIRED for 'READING' type. MUST be 400-600 words with 3-5 paragraphs. CRITICAL: Separate each paragraph with double newline (\\n\\n). Example format: "Paragraph 1 text here.\\n\\nParagraph 2 text here.\\n\\nParagraph 3 text here." Follow DSE argumentative structure: (1) Main claim/introduction, (2) Supporting evidence with examples, (3) Counterpoint or alternative view, (4) Rebuttal or further evidence, (5) Conclusion. Topics: HK-relevant social issues, technology, education, environment, culture.
  "conceptual_explanation": string,
  "key_points": string[], // Standard sentence case.
  "examples": [
      { "text": "Example sentence/context", "explanation": "Analysis..." }
  ],
  "interactive_tasks": [{ 
    "id": string, 
    "type": "SHORT_ANSWER" | "MCQ",
    "skills": string[], // e.g. ["reading_inference"]
    "instruction": string, 
    "question": string, 
    "options": string[], // Required for MCQ. (e.g. ["A. ...", "B. ..."])
    "placeholder": string, 
    "answer_logic": string, 
    "expected_keywords": string[] 
  }], 
  "success_feedback": string,
  "suggested_next_steps": string[]
}
- CRITICAL: Generate exactly 10 tasks.
- CRITICAL: For 'READING' labs, the 'reading_passage' MUST be 400-600 words with 3-5 paragraphs. YOU MUST separate paragraphs with \\n\\n (double newline). DO NOT write as one continuous block. Each paragraph should have a distinct purpose (claim, evidence, counterpoint, conclusion).
- CRITICAL: If the topic is 'Literal Comprehension', tasks MUST be verifiable directly from the text without outside knowledge or abstract inference. At Level 5+, the difficulty must come from tracking complex conditional statements or subtle lexical precision (e.g. 'partially agreed' vs 'unconditionally supported') within the text.
- CRITICAL: For Level 5 and above, tasks MUST be significantly more challenging, focuses on synthesis and subtle nuances rather than purely obscure vocabulary.`;

const LISTENING_LAB_PROMPT = `Listening Specialist. Generate HKDSE Listening Lab JSON for '{{TOPIC}}' at level '{{LEVEL}}'.

### SAFETY & DIFFICULTY RULES:
1. **NO LEAKS**: 'placeholder' must be generic (e.g., "Analyze the tone...").
2. **DISTINCT TASKS**: 10 unique tasks.
3. **LEVEL SCALING**: 
   - Level 3: Simple info at moderate speed.
   - Level 5+: Abstract themes, implied meanings, figurative language, near-natural speed, and subtle intonation analysis. Focus on speaker attitude and logical flow rather than obscure linguistic trivia.

### MICRO-SKILLS TAGGING:
- You MUST tag each interactive task with 1 appropriate micro-skill ID from the following list:
{{AVAILABLE_SKILLS}}

JSON SCHEMA:
{
  "type": "LISTENING",
  "conceptual_explanation": string,
  "key_points": string[], // Standard sentence case.
  "interactive_tasks": [{ 
    "id": string, 
    "type": "LISTENING_COMPREHENSION" | "MCQ", 
    "skills": string[], // e.g. ["listening_mainIdea"]
    "audio_script": "text for TTS", 
    "instruction": string, 
    "question": string, 
    "options": string[], // Required for MCQ.
    "placeholder": string, 
    "expected_keywords": string[], 
    "answer_logic": string // CRITICAL: Provide the full correct answer and a detailed explanation of why it is correct.
  }], 
  "success_feedback": string,
  "suggested_next_steps": string[]
}
- CRITICAL: Generate exactly 10 tasks. MIX types.`;

const SPEAKING_LAB_PROMPT = `Speaking Coach. Generate HKDSE Speaking Lab JSON for '{{TOPIC}}' at level '{{LEVEL}}'.

### SAFETY & DIFFICULTY RULES:
1. **NO LEAKS**: 'placeholder' must be generic.
2. **DISTINCT TASKS**: 10 unique tasks.
3. **LEVEL SCALING**: 
   - Level 3: Simple structures, basic fluency.
   - Level 5+: Sophisticated patterns, effortless fluency, complex gambits, and strategic initiation/maintenance of abstract discussions. Focus on rhetorical effectiveness and nuanced expression, NOT just high-tier vocabulary.

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
    "placeholder": string, 
    "expected_keywords": string[], 
    "answer_logic": string // CRITICAL: Provide the full correct answer and a detailed explanation of why it is correct.
  }], 
  "success_feedback": string,
  "suggested_next_steps": string[]
}
- CRITICAL: Generate exactly 10 tasks.`;

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

  static async generateLesson(params) {
    const db = admin.firestore();
    let { topic, focus, level, uid } = params;
    const TARGET_COUNT = 10;

    // Extract numeric level if it's already "HKDSE Level X"
    if (typeof level === 'string' && level.startsWith('HKDSE Level ')) {
      level = level.replace('HKDSE Level ', '').split(' ')[0];
    }
    const levelName = this.formatLevelName(level);

    // Resolve Topic ID to Name if possible
    const skill = MICRO_SKILLS[topic];
    const resolvedTopic = skill ? skill.name : (topic || 'General English');

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

    const isReadingTopic = (topic || '').toLowerCase().includes('comprehension') || (topic || '').toLowerCase().includes('reading');
    let mixedQuestions = [];
    let selectedPassage = null;

    if (isReadingTopic) {
      console.log(`[LabService] Reading Topic Detected: Enforcing ATOMIC PASSAGE grouping.`);
      try {
        // Fetch candidates
        const strictSnapshot = await db.collection('question_bank')
          .where('topic', '==', resolvedTopic)
          .where('level', '==', levelName)
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

    } else {
      // --- OLD LOGIC FOR NON-READING (GRAMMAR, VOCAB, ETC) ---
      try {
        const strictSnapshot = await db.collection('question_bank')
          .where('topic', '==', resolvedTopic)
          .where('level', '==', levelName)
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
    const needsGeneration = mixedQuestions.length === 0;
    // If we have 5 questions, we don't generate 5 more (too complex to align passage). We just show 5.

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
      let prompt = LAB_GENERATION_PROMPT;
      const paperType = skill ? skill.paper : (topic?.toLowerCase().includes('speaking') ? 'speaking' : topic?.toLowerCase().includes('listening') ? 'listening' : 'reading');

      if (paperType === 'speaking' || topic?.toLowerCase().includes('speaking')) prompt = SPEAKING_LAB_PROMPT;
      else if (paperType === 'listening' || topic?.toLowerCase().includes('listening')) prompt = LISTENING_LAB_PROMPT;
      else if (paperType === 'writing') {
        prompt = `Creative Writing Tutor. ${LAB_GENERATION_PROMPT} 
        FOCUS: This is a WRITING skill. Focus on tasks that improve drafting, vocabulary selection, and structural transitions.`;
      }

      const isHighStakes = ['4', '5', '6', '7'].includes(String(level));
      const generationTarget = TARGET_COUNT; // Always generate full set if we generate

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

      prompt = prompt
        .replace('{{TOPIC}}', resolvedTopic)
        .replace('{{FOCUS}}', JSON.stringify(focus) || 'Fundamentals')
        .replace('{{LEVEL}}', levelName)
        .replace('{{AVAILABLE_SKILLS}}', availableSkills);
      // .replace(/8-12/g, `${generationTarget}`); // Not in prompt but good practice

      // Inject explicitly for Reading
      if (isReadingTopic) {
        prompt += `\n\nCRITICAL: GENERATE A NEW, COHERENT READING PASSAGE (250-400 words) relevant to '${resolvedTopic}'. All 10 questions must be based on this passage.`;
      }

      console.log(`[LabService] Requesting AI Generation for: ${resolvedTopic} (${paperType || 'unknown'})`);

      try {
        const result = await GenerativeAIService.generateContent(prompt);
        // ... standard processing ...

        const response = result.response;
        // Log token usage...
        if (response && response.usageMetadata) {
          const TokenService = require('./TokenService');
          TokenService.logUsage(uid || 'system', 'lab_generation', response.usageMetadata);
        }

        let responseText = response.text();
        let data = JSON.parse(cleanJsonResponse(responseText));
        if (Array.isArray(data)) data = data[0];

        // Deduplicate & Save
        if (data.interactive_tasks) {
          const batch = db.batch();
          data.interactive_tasks.forEach(task => {
            const qHash = generateQuestionHash(resolvedTopic, task.type || 'gen', task.question || task.instruction);
            task.id = qHash;
            const docRef = db.collection('question_bank').doc(qHash);

            // For Reading, ensure we save the passage with EACH question so they can be clustered later
            const passageToSave = data.reading_passage || null;

            batch.set(docRef, {
              ...task,
              topic: resolvedTopic,
              level: levelName,
              passage: passageToSave,
              created_at: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            if (mixedQuestions.length < TARGET_COUNT) {
              mixedQuestions.push(task);
            }
          });
          await batch.commit();
        }

        lessonContent = data;
        lessonContent.interactive_tasks = mixedQuestions;
        // Ensure passage is set
        if (!lessonContent.reading_passage && isReadingTopic && data.reading_passage) {
          lessonContent.reading_passage = data.reading_passage;
        }

      } catch (error) {
        console.error("Fresh Generation Failed:", error);
        throw error;
      }
    }
    // Final consistency check for type
    if (!lessonContent.type && skill?.paper) {
      lessonContent.type = skill.paper.toUpperCase();
    }

    // Ensure we return the technical topic ID for progress tracking
    lessonContent.topic = topic;

    return this.normalizeLessonContent(lessonContent);
  }

  // Helper to generate just the explanation part if we have questions
  static async generateExplanationOnly(topic, level, uid = null) {
    const levelName = this.formatLevelName(level);
    const skill = MICRO_SKILLS[topic];
    const resolvedTopic = skill ? skill.name : (topic || 'General English');

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
    
    Return ONLY the JSON.`;

    const result = await GenerativeAIService.generateContent(prompt, {
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    try {
      let data = JSON.parse(cleanJsonResponse(result.response.text()));
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
