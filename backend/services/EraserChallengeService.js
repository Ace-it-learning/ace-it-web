const GenerativeAIService = require('./GenerativeAIService');
const TokenService = require('./TokenService');

/**
 * EraserChallengeService
 * Handles the "Eraser Challenge" game mode.
 * Goal: Transform Level 3 sentences into Level 5** sentences relative to HKDSE standards.
 */
class EraserChallengeService {

    /**
     * Generates a "Level 3" sentence that needs improvement.
     * @param {string} uid - User ID for logging.
     * @param {string} topic - Optional topic filter.
     */
    static async generateChallenge(uid, topic = 'General') {
        const prompt = `Act as an HKEAA Examination Report writer. Generate a "Common Candidate Mistake" (Level 3) sentence for a HKDSE English writing task.

        TOPIC: ${topic}

        ### GUIDELINES:
        1. The sentence should be grammatically correct but **stylistically weak**.
        2. Use "Level 3" vocabulary (e.g., "good", "bad", "happy", "important").
        3. Use simple or compound sentence structures (avoiding complex inversion or cohesion).
        4. It should sound like a typical Hong Kong student's writing (Chinglish undertones are okay but keep grammar mostly valid).

        ### JSON OUTPUT FORMAT:
        {
            "original_sentence": "...",
            "context": "Brief context of where this sentence appears (e.g. 'An email to a friend' or 'An argumentative essay').",
            "flaws": ["List", "of", "2-3", "weaknesses"]
        }
        Return ONLY the JSON.`;

        try {
            const parsed = await GenerativeAIService.generateJson(prompt, {
                uid: uid,
                service: 'eraser_gen'
            });

            // Normalize & Trim Field Names
            const normalized = {
                original_sentence: (parsed.original_sentence || parsed.originalSentence || parsed.Original_Sentence || "").trim(),
                context: (parsed.context || parsed.Context || "").trim(),
                flaws: Array.isArray(parsed.flaws || parsed.Flaws) ? (parsed.flaws || parsed.Flaws) : []
            };

            // Structural Integrity Check with Hard Fallback
            if (!normalized.original_sentence || normalized.flaws.length === 0) {
                console.warn("[EraserService] AI returned invalid/empty structure. Using hard fallback.");
                return {
                    original_sentence: "Technology is very good for students because it helps them learn faster.",
                    context: "Argumentative Essay about Technology",
                    flaws: ["Repetitive vocabulary ('good', 'help')", "Simple sentence structure"]
                };
            }

            return {
                original_sentence: normalized.original_sentence,
                context: normalized.context || "General Academic",
                flaws: normalized.flaws
            };

        } catch (error) {
            console.error("Eraser Gen Failed:", error);
            // Fallback
            return {
                original_sentence: "Technology is very good for students because it helps them learn faster.",
                context: "Argumentative Essay about Technology",
                flaws: ["Repetitive vocabulary ('good', 'help')", "Simple structure"]
            };
        }
    }

    /**
     * Grades the user's attempt to rewrite the sentence.
     * @param {string} uid 
     * @param {string} original 
     * @param {string} attempt 
     */
    static async gradeAttempt(uid, original, attempt) {
        const prompt = `Act as a ruthless HKDSE Level 5** English Tutor.
        
        TASK: The student tried to upgrade a Level 3 sentence to Level 5**.
        
        Original (Level 3): "${original}"
        Student Rewrite: "${attempt}"

        ### INSTRUCTIONS:
        1. **Analyze**: Did the student actually improve the sentence?
        2. **Grade**: Give a score from 1-10.
            - 1-3: No improvement or worse.
            - 4-6: Better vocab but same structure.
            - 7-8: Good structure (Level 5).
            - 9-10: Sophisticated, native-like, complex syntax (Level 5**).
        3. **Golden Version**: Provide YOUR own Level 5** rewrite (The "Golden Answer").

        ### JSON OUTPUT FORMAT:
        {
            "score": 0,
            "feedback": "Brief, punchy feedback.",
            "golden_rewrite": "Your 5** version here.",
            "diff_analysis": "One sentence explaining the gap between Student and Golden."
        }
        Return ONLY the JSON.`;

        try {
            const result = await GenerativeAIService.generateContent(prompt, {
                generationConfig: { responseMimeType: "application/json" }
            });

            if (result.response.usageMetadata) {
                TokenService.logUsage(uid, 'eraser_grade', result.response.usageMetadata);
            }

            return JSON.parse(this.cleanJsonResponse(result.response.text()));

        } catch (error) {
            console.error("Eraser Grade Failed:", error);
            return {
                score: 5,
                feedback: "Grading service unavailable, but good effort!",
                golden_rewrite: "Technology acts as a catalyst for accelerated learning, empowering students to acquire knowledge with unprecedented efficiency.",
                diff_analysis: "Unable to analyze specific differences at this time."
            };
        }
    }

    static cleanJsonResponse(text) {
        return text.replace(/```json/g, '').replace(/```/g, '').trim();
    }
}

module.exports = EraserChallengeService;
