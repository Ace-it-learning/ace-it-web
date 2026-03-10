const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const GenerativeAIService = require('../services/GenerativeAIService');
const { getSyllabusGuidance } = require('../constants/mathsSyllabusRules');

async function debugGeneration() {
    const topic = 'math_geo_rectilinear';
    const config = { name: 'Rectilinear Figures' };
    const level = 4;

    const difficultyGuide = `- Target: HKDSE Level 4 students.
- Question complexity: Standard application requiring 2 formulas or a small system.
- Steps to solve: 3-5 steps.`;

    const syllabusGuidance = getSyllabusGuidance(topic);

    const prompt = `You are an expert HKDSE Mathematics tutor. Generate EXACTLY 1 practice question.
Topic: ${config.name}
Topic ID: ${topic}
Level: ${level}
Syllabus: ${syllabusGuidance}
Guide: ${difficultyGuide}

Return ONLY valid JSON with keys: question, answer, diagram_json.`;

    try {
        console.log("Generating debug question...");
        const result = await GenerativeAIService.generateJson(prompt, { model: "gemini-2.5-pro" });
        console.log("AI Response received.");
        const qResult = Array.isArray(result) ? result[0] : result;
        console.log("Diagram JSON:", JSON.stringify(qResult.diagram_json, null, 2));
    } catch (err) {
        console.error("AI Generation failed:", err);
    }
    process.exit(0);
}

debugGeneration();
