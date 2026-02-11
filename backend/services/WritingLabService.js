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

        const response = await GenerativeAIService.generateJson(prompt);
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
            return await GenerativeAIService.generateJson(prompt);
        } catch (e) {
            console.error("Polisher JSON Error", e);
            // Fallback: parse text if needed
            throw e;
        }
    }
}

module.exports = new WritingLabService();
