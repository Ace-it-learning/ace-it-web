const GenerativeAIService = require('../GenerativeAIService');
const { MATH_MICRO_SKILLS } = require('../../constants/mathMicroSkills');

class MathsMicroSkillAssessor {

    /**
     * Assess Maths micro-skills based on diagnostic responses
     */
    async assessAllSkills(mathsData) {
        if (!mathsData) return {};

        // We feed the answers AND the skill definitions to the AI
        const prompt = `Analyze the student's Maths diagnostic answers and assess their proficiency in the following micro-skills.
        
        MICRO-SKILLS TAXONOMY:
        ${JSON.stringify(MATH_MICRO_SKILLS)}
        
        STUDENT ANSWERS:
        ${JSON.stringify(mathsData)}
        
        TASK:
        For each relevant micro-skill demonstrated in the test, estimate the student's DSE Level (1-7, where 7=5**, 6=5*, 5=5).
        If a skill was not tested, do not include it.
        
        Return JSON:
        {
          "math_alg_formulas": { "level": 4, "confidence": 0.9, "evidence": "Correctly rearranged formula" },
          "math_geo_circles": { "level": 2, "confidence": 0.8, "evidence": "Failed to identify chord property" }
          ...
        }
        `;

        try {
            const result = await GenerativeAIService.generateContent(prompt, {
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const text = result.response.text();
            return JSON.parse(text);
        } catch (error) {
            console.error("Maths Skill Assessment Failed:", error);
            return {};
        }
    }
}

module.exports = new MathsMicroSkillAssessor();
