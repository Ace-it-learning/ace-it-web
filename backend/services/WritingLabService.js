const GenerativeAIService = require('./GenerativeAIService');
const admin = require('firebase-admin');

class WritingLabService {
    constructor() {
        this.db = admin.firestore();
    }

    /**
     * Generate a Writing Session
     * @param {string} topic - The broad skill or theme (e.g., "Argumentative Skills" or "Technology")
     * @param {string} level - "3", "4", "5", "5*", "5**"
     * @param {string} mode - "SENTENCE_BUILDER" | "PARAGRAPH_PLANNER" | "MINI_ESSAY"
     */
    async generateSession(topic, level, mode) {
        // HKDSE Hot Topics & Frequent Past Paper Themes
        const HK_CONTEXT_PROMPT = `
        ### CONTEXTUAL REQUIREMENT:
        You are simulating a customized HKDSE English Paper 2 (Writing) training session.
        Content MUST be relevant to Hong Kong students. 
        
        **PRIORITY THEMES (Select one relevant to '${topic}'):**
        1. **Digital Citizenship**: AI in HK classrooms, cyberbullying, 'lying flat' culture.
        2. **youth Wellbeing**: Academic pressure, mental health (Student Health Service data), exam stress.
        3. **Social Issues**: Waste charging scheme (MSW), housing crunch (nano flats), aging population.
        4. **Culture**: Preserving Cantopop/Neon signs vs. Urban renewal, Dim Sum culture, intangible heritage.
        5. **Trends**: K-pop influence, influencer culture, slash careers.
        `;

        let prompt = "";

        if (mode === 'SENTENCE_BUILDER') {
            prompt = `
            ${HK_CONTEXT_PROMPT}

            Create a **Sentence Builder** task for Level ${level}.
            1. Provide a "Kernel Idea" (simple sentence(s) related to the theme).
            2. Provide a "Constraint/Instruction" (e.g., "Combine using a participle phrase", "Start with an inversion", "Use the word 'ubiquitous'").
            3. The goal is to rewriting the kernel into a sophisticated sentence.
            
            JSON Output Format:
            {
                "mode": "SENTENCE_BUILDER",
                "theme": "string",
                "kernel": "string",
                "instruction": "string",
                "hint": "string",
                "target_level": "${level}"
            }
            `;
        } else if (mode === 'PARAGRAPH_PLANNER') {
            prompt = `
            ${HK_CONTEXT_PROMPT}

            Create a **Paragraph Planner** task for Level ${level}.
            1. Provide a specific "Topic Sentence" or "Argument" regarding the chosen theme.
            2. Ask the student to write ONE body paragraph (approx 100-150 words) developing this point.
            3. Specify the "Functional Focus" (e.g., Elaboration, Rebuttal, Cause & Effect).

            JSON Output Format:
            {
                "mode": "PARAGRAPH_PLANNER",
                "theme": "string",
                "prompt_text": "string (The core argument/topic sentence)",
                "functional_focus": "string",
                "guidance": ["point 1", "point 2"],
                "target_level": "${level}"
            }
            `;
        } else {
            // MINI_ESSAY
            prompt = `
            ${HK_CONTEXT_PROMPT}

            Create a **Mini-Essay** prompt (Part A or short Part B style) for Level ${level}.
            1. Provide a realistic scenario (e.g., "You are the President of the Student Union...").
            2. Ask for a short response (approx 200 words) on the issue.

            JSON Output Format:
            {
                "mode": "MINI_ESSAY",
                "theme": "string",
                "question_text": "string",
                "role": "string",
                "target_audience": "string",
                "target_level": "${level}"
            }
            `;
        }

        const response = await GenerativeAIService.generateJson(prompt, { model: "gemini-2.5-pro" });
        return response;
    }

    /**
     * Evaluate & Polish Submission
     * @param {string} studentText 
     * @param {object} context - { mode, theme, instruction, target_level }
     */
    async evaluateSubmission(studentText, context) {
        const prompt = `
        You are a Senior HKDSE English Marker (Level 5** Expert).
        
        **TASK**:
        The student is attempting a ${context.mode} task.
        Theme: ${context.theme}
        Instruction: ${context.instruction || context.question_text}
        Target Level: ${context.target_level}

        **STUDENT TEXT**:
        "${studentText}"

        **YOUR JOB (The "Writing Polisher")**:
        1. **Critique**: Identify 3 specific strengths/weaknesses.
        2. **Polished Version**: Rewrite the text to a solid Level 5/5* standard. 
           - Preserve the student's core ideas/arguments. 
           - UPGRADE syntax, vocabulary, and cohesion.
           - Ensure tone is appropriate (e.g., formal for essay, persuasive for speech).
        3. **Analysis**: Explain 3 key changes you made and WHY they improve the grade (e.g., "Changed 'bad' to 'detrimental' for precise tone").

        JSON Output Format:
        {
            "score_estimated": "string (e.g. 3, 4, 5, 5*)",
            "critique_points": ["string", "string", "string"],
            "polished_text": "string (The full rewrite)",
            "key_changes": [
                { "original": "snippet", "improved": "snippet", "reason": "string" }
            ],
            "general_comment": "string"
        }
        `;

        try {
            // Direct JSON generation
            return await GenerativeAIService.generateJson(prompt, { model: "gemini-2.5-pro" });
        } catch (e) {
            console.error("Polisher JSON Error", e);
            // Fallback: parse text if needed
            throw e;
        }
    }

    /**
     * Fetch a premium exemplar by ID
     */
    async getExemplar(id) {
        const doc = await this.db.collection('writing_exemplars').doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    }

    /**
     * Get a list of available exemplars by genre
     */
    async getExemplarsList(genre = 'all') {
        let query = this.db.collection('writing_exemplars');
        
        if (genre !== 'all') {
            query = query.where('genre', '==', genre);
        }

        const snapshot = await query.orderBy('created_at', 'desc').get();
        const results = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            results.push({
                id: doc.id,
                title: data.title,
                genre: data.genre,
                theme: data.theme,
                level: data.level || "5**",
                word_count: data.word_count || 0,
                difficulty: data.difficulty || "ELITE"
            });
        });
        return results;
    }

    /**
     * Internal: High-Quality Exemplar Generator (Used by the Factory)
     */
    async generateEliteExemplar(genreId, specificTheme = null) {
        const { ENGLISH_WRITING_GENRES } = require('../constants/englishWritingSyllabus');
        const genre = ENGLISH_WRITING_GENRES[genreId];
        if (!genre) throw new Error("Invalid Genre ID");

        const prompt = `
        You are a Senior HKDSE English Paper 2 Marker (Chief Examiner).
        GOAL: Generate an **Elite (Level 5**)** Writing Exemplar.

        GENRE: ${genre.name} (${genre.description})
        CRITERIA: ${genre.elite_criteria}
        ${specificTheme ? `THEME: ${specificTheme}` : "Select a popular, high-difficulty HKDSE theme (e.g., MSW Charging, AI, Aging Population, or Youth Mental Health)."}

        ### FORMAT REQUIREMENT (JSON):
        {
          "title": "A short, engaging title",
          "genre": "${genreId}",
          "theme": "The chosen theme",
          "prompt": "The full realistic Paper 2 Part B prompt (approx 100 words context).",
          "model_answer": "The full Level 5** essay (approx 400-500 words). Use sophisticated vocabulary and structures.",
          "structural_analysis": [
            {"part": "Introduction", "logic": "A hook followed by a clear thesis statement...", "snippet": "First 2 sentences"},
            {"part": "Body Paragraph 1", "logic": "Developing point 1 with data/examples...", "snippet": "Example sentence"},
            {"part": "Counter-argument", "logic": "Acknowledging the opposition and rebutting...", "snippet": "Refutation sentence"},
            {"part": "Conclusion", "logic": "Summary and impactful closing statement...", "snippet": "Final thought"}
          ],
          "vocabulary_bank": [
            {"word": "word", "meaning": "definition", "syllables": "...", "usage_example": "snippet from essay"}
          ],
          "connective_masterclass": [
             {"phrase": "In light of...", "function": "Causal relationship", "why_elite": "More formal than 'because'"}
          ],
          "word_count": 450,
          "level": "5**"
        }
        Return ONLY valid JSON.
        `;

        const { data: resData } = await GenerativeAIService.generateJson(prompt, { model: "gemini-2.5-pro" });
        const data = Array.isArray(resData) ? resData[0] : resData;
        return data;
    }
}

module.exports = new WritingLabService();
