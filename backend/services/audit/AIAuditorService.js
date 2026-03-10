const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIAuditorService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    }

    /**
     * Role: Blind Solver
     * Solves the question from scratch and compares with the factory answer.
     * @param {object} quest - The quest object from the Factory.
     */
    async auditLogic(quest) {
        const prompt = `
            You are a Senior Mathematics Examiner for the HKDSE. 
            Your task is to solve the following question independently and verify if the provided answer is correct.

            QUESTION (English): ${quest.question_text_en}
            QUESTION (Chinese): ${quest.question_text_zh}

            FACTORY ANSWER: ${quest.answer}
            FACTORY STEPS: ${quest.solution_steps.join('\n')}

            Please solve this step-by-step. 
            Then, provide your final answer and a Boolean 'match' field indicating if it matches the Factory Answer.
            Return the result in JSON format:
            {
                "solver_answer": "string",
                "is_match": boolean,
                "reasoning": "short explanation of any discrepancy",
                "confidence_score": number (0-1)
            }
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Failed to extract JSON from AI Auditor response.");
        } catch (error) {
            console.error("AI Auditor Error:", error);
            throw error;
        }
    }

    /**
     * Role: Vision Check
     * Uses multimodal capabilities to ensure the diagram matches question labels.
     * @param {object} quest - The quest object.
     * @param {Buffer} imgBuffer - The generated diagram image.
     */
    async auditVision(quest, imgBuffer) {
        const prompt = `
            Analyze this math diagram for HKDSE alignment.
            QUESTION: ${quest.question_text_en}
            EXPECTED LABELS: The diagram should show points relevant to ${quest.topic}.
            
            Verify:
            1. Are all labels (e.g., O, A, B, M) from the text present in the image?
            2. Does the diagram look mathematically plausible based on the text?
            3. Are there any overlapping labels or visual glitches?
            
            Return JSON:
            {
                "vision_passed": boolean,
                "issues": ["string"],
                "ocr_labels_detected": ["string"]
            }
        `;

        try {
            const result = await this.model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: imgBuffer.toString("base64"),
                        mimeType: "image/png",
                    },
                },
            ]);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { vision_passed: false, error: "JSON parse failed" };
        } catch (error) {
            console.error("AI Vision Audit Error:", error);
            return { vision_passed: false, error: error.message };
        }
    }

    /**
     * Role: Sanity Bounds
     * Rule-based mathematical verification (Non-LLM).
     */
    auditSanity(quest) {
        const issues = [];

        // Example Rule: Probability must be between 0 and 1
        if (quest.sub_topic.includes("Probability")) {
            const ans = parseFloat(quest.answer);
            if (isNaN(ans) || ans < 0 || ans > 1) issues.push("Probability answer out of bounds (0-1).");
        }

        // Example Rule: Geometry lengths must be positive
        if (quest.topic === "Geometry") {
            const ans = parseFloat(quest.answer);
            if (isNaN(ans) || ans <= 0) issues.push("Geometric length must be a positive number.");
        }

        return {
            sanity_passed: issues.length === 0,
            issues: issues
        };
    }
}

module.exports = new AIAuditorService();
