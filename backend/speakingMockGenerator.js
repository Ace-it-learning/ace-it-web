const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MOCK_DIR = path.join(__dirname, 'generated_mocks', 'speaking');
if (!fs.existsSync(MOCK_DIR)) fs.mkdirSync(MOCK_DIR, { recursive: true });

async function generateSpeakingMock(theme = "Social Issues") {
    try {
        const GenerativeAIService = require('./services/GenerativeAIService');
        const model = GenerativeAIService.getModel({ model: 'gemini-2.0-flash' });

        const prompt = `
            You are an expert Cambridge/HKDSE English Exam writer.
            Create a "Group Discussion" (Paper 4) task for HKDSE English Language.
            
            Theme: ${theme}
            
            Output JSON format:
            {
                "title": "Short catchy title",
                "topic_description": "A short text (150-200 words) describing the situation or providing a news article excerpt that the candidates will read.",
                "discussion_points": [
                    "Point 1 (e.g. Causes of...)",
                    "Point 2 (e.g. Impacts on...)",
                    "Point 3 (e.g. Solutions for...)"
                ],
                "individual_response_questions": [
                    "Question 1 related to topic?",
                    "Question 2 related to topic?"
                ],
                "candidates": {
                    "A": "Supports the motion actively",
                    "B": "Skeptical / Plays devil's advocate",
                    "C": "Neutral / Focuses on practical details"
                }
            }
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;

        // Log Token Usage
        if (response.usageMetadata) {
            const TokenService = require('./services/TokenService');
            // Mock generator might be called by system, but we try to pass uid if it becomes available
            TokenService.logUsage('system', 'speaking_mock_gen', response.usageMetadata);
        }

        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error("No JSON found");

        const mockData = JSON.parse(jsonMatch[0]);

        // Add Metadata
        const mockinfo = {
            id: `Speaking_${theme.replace(/\s+/g, '_')}_${Date.now()}`,
            ...mockData,
            created_at: new Date().toISOString(),
            type: "speaking"
        };

        // Save to File
        const filePath = path.join(MOCK_DIR, `${mockinfo.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(mockinfo, null, 2));
        console.log(`[Speaking] Generated: ${filePath}`);

        return mockinfo;

    } catch (error) {
        console.error("Speaking Gen Error:", error);
        return null;
    }
}

module.exports = { generateSpeakingMock };
