const GenerativeAIService = require('../GenerativeAIService');

/**
 * MathsMockService
 * Generates full DSE-style Mock Exams (Paper 1 & Paper 2)
 */
class MathsMockService {

    /**
     * Generate a Mock Paper 1 (Compulsory Part - Conventional)
     * Total Marks: 105
     */
    static async generatePaper1(uid = 'guest', language = 'en') {
        const languageName = (language === 'zh' || language === 'zh-HK' || language === 'zh-TW')
            ? 'Traditional Chinese (Formal Written Chinese - 書面語)'
            : 'English';

        const prompt = `You are a Chief Examiner for the HKDSE Mathematics. Generate a FULL Paper 1 (Compulsory Part) Mock Exam.
        
        ### EXAM STRUCTURE (TOTAL 105 MARKS):
        1. **SECTION A(1)** (35 marks): ~9 Foundation questions (2-4 marks each).
           - Topics: Formulas, Indices, Factorization, Linear/Quadratic Equations, Percentages, Mensuration.
        2. **SECTION A(2)** (35 marks): ~6 Intermediate questions (6-9 marks each).
           - Topics: Variations, Polynomials, Functions & Graphs, Geometric Properties, Trigonometry.
        3. **SECTION B** (35 marks): ~4-5 Advanced questions (8-12 marks each).
           - Topics: Circle Geometry, Sequences, 3D Geometry/Trigonometry, Advanced Statistics/Probability.

        ### REQUIREMENTS:
        - **Language**: Use ${languageName}.
        - **Bilingual Context**: If Chinese, use Formal Written Chinese only.
        - **Scaffolding**: SECTION B questions MUST be multi-part (a), (b), (c).
        - **JSON SCHEMA**:
        {
            "title": "HKDSE Mathematics Compulsory Part Mock Paper 1",
            "reading_time_minutes": 135,
            "total_marks": 105,
            "questions": [
                {
                    "id": "p1_q1",
                    "part": 1, 
                    "section": "A1",
                    "type": "short_question",
                    "topic": "...",
                    "marks": 3,
                    "text": "...",
                    "answer": "...",
                    "solution_steps": ["..."],
                    "marking_scheme": "DSE point logic (M1, A1)"
                }
            ]
        }`;

        try {
            const data = await GenerativeAIService.generateJson(prompt, {
                model: "gemini-1.5-flash", // Use Flash for speed on large JSON
                systemInstruction: "You are a professional mathematician and examiner. Outout valid JSON only."
            });
            return data;
        } catch (e) {
            console.error("[MathsMockService] Paper 1 Generation failed:", e);
            throw e;
        }
    }

    /**
     * Generate a Mock Paper 2 (Multiple Choice)
     * Total: 45 Questions
     */
    static async generatePaper2(uid = 'guest', language = 'en') {
        const languageName = (language === 'zh' || language === 'zh-HK' || language === 'zh-TW')
            ? 'Traditional Chinese (Formal Written Chinese - 書面語)'
            : 'English';

        const prompt = `You are an HKDSE Mathematics examiner. Generate a FULL Paper 2 (Multiple Choice) Mock Exam.
        
        ### EXAM STRUCTURE:
        1. **SECTION A** (30 questions): Foundation & Integration level.
        2. **SECTION B** (15 questions): Advanced & Non-Foundation level.
        
        ### REQUIREMENTS:
        - Total 45 questions.
        - 4 options (A, B, C, D) per question.
        - Total Marks: 45 (1 mark each).
        - **Language**: Use ${languageName}.
        - **Logic**: Use "Must be true (I, II, III)" types for at least 10% of questions.
        - **JSON SCHEMA**:
        {
            "title": "HKDSE Mathematics Compulsory Part Mock Paper 2",
            "reading_time_minutes": 75,
            "total_marks": 45,
            "questions": [
                {
                    "id": "p2_q1",
                    "part": 2, // 2 indicates Paper 2 / Section B
                    "type": "mc",
                    "topic": "...",
                    "text": "...",
                    "options": ["A", "B", "C", "D"],
                    "answer": "A"
                }
            ]
        }`;

        try {
            const data = await GenerativeAIService.generateJson(prompt, {
                model: "gemini-1.5-flash",
                systemInstruction: "You are a professional math examiner. Output valid JSON only."
            });
            return data;
        } catch (e) {
            console.error("[MathsMockService] Paper 2 Generation failed:", e);
            throw e;
        }
    }
}

module.exports = MathsMockService;
