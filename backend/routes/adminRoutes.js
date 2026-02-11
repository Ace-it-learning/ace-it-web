const express = require('express');
const router = express.Router();
const GenerativeAIService = require('../services/GenerativeAIService');
const fs = require('fs');
const path = require('path');

const MOCK_TOPICS = [
    "School Open Day",
    "Environmental Conservation Campaign",
    "Student Council Election",
    "Sports Day Planning",
    "Cultural Festival Organization",
    "Career Fair Preparation"
];

// POST /api/admin/generate-listening-mock
router.post('/generate-listening-mock', async (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    console.log(`[Admin] Generating listening mock for topic: ${topic}`);

    try {
        const blueprintPath = path.join(__dirname, '../blueprints/Eng_Listening_Blueprint.json');
        const blueprint = fs.readFileSync(blueprintPath, 'utf8');

        const prompt = `You are an expert HKDSE English Listening Exam Designer. Generate a complete Paper 3 Listening Mock Exam on the topic: "${topic}".

        **CONTEXT**: This is for Hong Kong DSE students (Secondary 4-6). The exam must follow the official HKDSE format.

        **BLUEPRINT REFERENCE**:
        ${blueprint}

        **OUTPUT FORMAT (STRICT JSON)** - Generate 3-5 documents in data_file array with types: email, minutes, poster, webpage, note, memo

        **CRITICAL**: Part_B.data_file MUST be an array of document objects, NOT a string.

        Generate the complete mock exam with multi-document Data File now.`;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: 'gemini-2.0-flash',
            generationConfig: { responseMimeType: "application/json" }
        });

        const responseText = result.response.text();
        let cleanedText = responseText.trim();
        if (cleanedText.includes('```json')) {
            cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }

        const mockData = JSON.parse(cleanedText);

        // Save to file
        const outputDir = path.join(__dirname, '../generated_mocks/listening');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filename = `Listening_${topic.replace(/\s+/g, '_')}_${Date.now()}.json`;
        const filepath = path.join(outputDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(mockData, null, 2));

        console.log(`[Admin] Successfully generated: ${filename}`);

        res.json({
            success: true,
            filename,
            stats: {
                partATasks: mockData.Part_A?.tasks?.length || 0,
                partBDocuments: mockData.Part_B?.data_file?.length || 0,
                partBTasks: mockData.Part_B?.tasks?.length || 0
            }
        });

    } catch (error) {
        console.error(`[Admin] Failed to generate listening mock:`, error);
        res.status(500).json({
            error: 'Failed to generate listening mock',
            message: error.message
        });
    }
});

// GET /api/admin/mock-topics
router.get('/mock-topics', (req, res) => {
    res.json({ topics: MOCK_TOPICS });
});
const { runPipeline } = require('../mockGenerator');

// Middleware: Simple Admin Secret Check
// In production, use Firebase Claims. For now/MVP, use a secret header/body param.
const requireAdmin = (req, res, next) => {
    const secret = req.headers['x-admin-secret'] || req.body.adminSecret;
    // Hardcoded for MVP, ideally in .env
    const VALID_SECRET = process.env.ADMIN_SECRET || "ace-it-admin-secret-123";

    if (secret === VALID_SECRET) {
        next();
    } else {
        res.status(403).json({ error: "Unauthorized. Admin access only." });
    }
};

// POST /api/admin/generate-mock
router.post('/generate-mock', requireAdmin, async (req, res) => {
    const { topic, paperType } = req.body;

    if (!topic) return res.status(400).json({ error: "Topic is required" });

    console.log(`[Admin] Triggering Mock Generation: ${topic} (${paperType})`);

    // Run async (Fire and Forget) or Await?
    // Generation takes ~30s. Vercel/Cloud Run has 60s timeout. 
    // It's safer to "Fire and Forget" and return "Job Started".
    // However, for local dev, we can await.
    // Let's await for now to give immediate feedback, but catch timeout errors.

    try {
        // Note: runPipeline saves to disk. It doesn't return the JSON directly yet.
        await runPipeline(topic, paperType || "Reading");

        res.json({
            success: true,
            message: `Mock Exam (${paperType}) for '${topic}' generated successfully.`,
            note: "File saved to generated_mocks directory."
        });
    } catch (e) {
        console.error("Admin Generation Error:", e);
        res.status(500).json({ error: "Generation Failed", details: e.message });
    }
});

module.exports = router;
