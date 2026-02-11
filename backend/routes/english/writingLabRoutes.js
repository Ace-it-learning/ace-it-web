const express = require('express');
const router = express.Router();
const WritingLabService = require('../../services/WritingLabService');

// POST /api/lab/writing/generate
router.post('/generate', async (req, res) => {
    try {
        const { topic, level, mode } = req.body;
        // topic: "Argumentative", "Social Issues", etc.
        // mode: "SENTENCE_BUILDER" | "PARAGRAPH_PLANNER" | "MINI_ESSAY"

        console.log(`[WritingLab] Generating session for ${mode} | Level ${level}`);
        const session = await WritingLabService.generateSession(topic, level, mode);
        res.json(session);
    } catch (e) {
        console.error("Writing Lab Gen Error:", e);
        res.status(500).json({ error: "Failed to generate writing session" });
    }
});

// POST /api/lab/writing/evaluate
router.post('/evaluate', async (req, res) => {
    try {
        const { studentText, context } = req.body;
        // context includes { mode, theme, instruction, target_level }

        console.log(`[WritingLab] Evaluating submission for ${context.mode}`);
        const feedback = await WritingLabService.evaluateSubmission(studentText, context);
        res.json(feedback);
    } catch (e) {
        console.error("Writing Lab Eval Error:", e);
        res.status(500).json({ error: "Failed to evaluate writing" });
    }
});

module.exports = router;
