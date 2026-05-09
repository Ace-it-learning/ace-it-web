const CosmosStore = require('../CosmosStore');

/**
 * MathsMockService
 * Orchestrates Mock Exams using the 'integrated_challenges' data bank.
 * Provides 10 distinct, deterministic papers.
 */
class MathsMockService {

    /**
     * Get a Mock Paper by Paper ID (1-10)
     * Fetches from 'integrated_challenges' bank.
     */
    static async getMockPaper(paperId, language = 'en') {
        const batchNum = parseInt(paperId) || 1;
        
        console.log(`[MathsMockService] Assembling Mock Paper ${batchNum} (Lang: ${language})...`);

        try {
            // Fetch ALL approved integrated challenges
            // We fetch more than we need then slice deterministically
            const rows = await CosmosStore.getApprovedIntegratedChallenges(500);
            if (!rows.length) {
                console.warn("[MathsMockService] Bank empty. Falling back to dynamic placeholder.");
                return this.generateFallbackMock(batchNum);
            }            

            const allQuestions = [];
            rows.forEach((data) => {
                allQuestions.push({
                    ...data,
                    id: data.id,
                    text: language === 'zh' ? (data.question_zh || data.text_zh) : (data.question_en || data.text),
                    text_zh: data.question_zh || data.text_zh,
                    solution_steps: language === 'zh' ? (data.solution_steps_zh || data.solution_steps) : (data.solution_steps_en || data.solution_steps),
                    explanation: language === 'zh' ? (data.explanation_zh || data.explanation) : (data.explanation_en || data.explanation)
                });
            });

            // Deterministic Sort (by ID) to ensure consistency across sessions
            allQuestions.sort((a, b) => a.id.localeCompare(b.id));

            // Chunk size: If we have ~250 questions, we can give ~25 questions per mock.
            const QUESTIONS_PER_MOCK = 25;
            const startIdx = (batchNum - 1) * QUESTIONS_PER_MOCK;
            
            // Loop slice for wrap-around if bank is smaller than needed
            let paperQuestions = [];
            for (let i = 0; i < QUESTIONS_PER_MOCK; i++) {
                const idx = (startIdx + i) % allQuestions.length;
                paperQuestions.push(allQuestions[idx]);
            }

            // Standardize format for the Mock Runner (MathsLabPage)
            return {
                id: `mock_maths_${batchNum}`,
                batchId: batchNum,
                title: `DSE Maths Integrated Mock: Paper ${batchNum}`,
                duration: 3600, // 60 mins for a 25-question session
                total_marks: paperQuestions.length,
                interactive_tasks: paperQuestions,
                source: 'integrated_bank'
            };

        } catch (e) {
            console.error("[MathsMockService] Error fetching mock paper:", e);
            throw e;
        }
    }

    static generateFallbackMock(batchNum) {
        return {
            id: `mock_maths_fallback_${batchNum}`,
            title: `[Backup] DSE Maths Mock Paper ${batchNum}`,
            duration: 3600,
            interactive_tasks: [
                {
                    id: "fb_q1",
                    type: "mc",
                    text: "The bank is currently offline. This is a placeholder for Paper " + batchNum,
                    options: ["A", "B", "C", "D"],
                    answer: "A"
                }
            ]
        };
    }

    // Legacy support for dynamic AI papers (forwarding to bank)
    static async generatePaper1(uid = 'guest', language = 'en') {
        return this.getMockPaper(1, language);
    }

    static async generatePaper2(uid = 'guest', language = 'en') {
        return this.getMockPaper(2, language);
    }
}

module.exports = MathsMockService;
