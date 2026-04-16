const GenerativeAIService = require('../GenerativeAIService');
const fs = require('fs');
const path = require('path');

class AntigravityService {
    constructor() {
        // Updated to use the Examiner prompt
        this.promptPath = path.join(__dirname, '..', '..', 'prompts', 'Antigravity_Examiner.md');
    }

    /**
     * Directly assesses a handwritten math solution from an image.
     * @param {Buffer} imageBuffer - The student's handwritten image.
     * @param {string} contentType - MIME type (e.g. 'image/jpeg')
     * @param {object} problemContext - JSON including question, solution_steps, correct_answer, and marks.
     * @returns {Promise<object>} - The structured JSON grading report.
     */
    async assessHandwriting(imageBuffer, contentType, problemContext) {
        console.log(`[Antigravity] Assessing handwritten solution via Multimodal Examiner...`);
        
        try {
            const systemInstruction = fs.readFileSync(this.promptPath, 'utf8');
            const base64Image = imageBuffer.toString('base64');

            // Construct the runtime input exactly as requested
            const runtimeInput = {
                problem_context: problemContext
            };

            const multimodalInput = [
                { text: `### [RUNTIME INPUT]\n${JSON.stringify(runtimeInput, null, 2)}` },
                { inlineData: { mimeType: contentType, data: base64Image } }
            ];

            const { data: resData } = await GenerativeAIService.generateJson(multimodalInput, {
                model: "ace-it-pro",
                systemInstruction: systemInstruction,
                generationConfig: {
                    temperature: 0.0 // Strict grading
                }
            });

            const result = Array.isArray(resData) ? resData[0] : resData;
            
            // Post-process: Ensure UUID and required structure
            if (!result.assessment_id) {
                result.assessment_id = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            }

            console.log(`[Antigravity] Assessment Complete: ${result.marks_awarded}/${problemContext.marks} marks awarded.`);
            return result;
        } catch (error) {
            console.error(`[Antigravity] Multimodal Assessment failed:`, error.message);
            // Return a safe fallback schema
            return {
                assessment_id: `err_${Date.now()}`,
                is_fully_correct: false,
                marks_awarded: 0,
                transcribed_final_answer: "N/A",
                grading_feedback: "Error assessing solution: " + error.message,
                error_step_description: "System error during vision processing.",
                rubric_breakdown: []
            };
        }
    }
}

module.exports = new AntigravityService();
