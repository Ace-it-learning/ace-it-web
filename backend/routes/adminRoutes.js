const express = require('express');
const router = express.Router();
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
