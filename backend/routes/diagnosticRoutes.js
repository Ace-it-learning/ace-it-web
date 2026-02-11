const express = require('express');
const router = express.Router();
const DiagnosticService = require('../services/DiagnosticService');
const UserProfileService = require('../services/UserProfileService');
const RoadmapService = require('../services/RoadmapService');

// GET /api/diagnostic/paper/:setId
router.get('/paper/:setId', (req, res) => {
    try {
        const paper = DiagnosticService.getPaper(req.params.setId);
        res.json(paper);
    } catch (e) {
        res.status(404).json({ error: "Paper not found" });
    }
});

// POST /api/diagnostic/submit_step
router.post('/submit_step', async (req, res) => {
    const { step, submission } = req.body;
    if (!step || !submission) return res.status(400).json({ error: "Missing data" });
    try {
        const result = await DiagnosticService.evaluateStep(step, submission);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "Grading failed" });
    }
});

// POST /api/diagnostic/finalize
router.post('/finalize', async (req, res) => {
    const { uid, results } = req.body;
    try {
        const profile = await DiagnosticService.finalizeDiagnostic(uid, results);
        await UserProfileService.saveDiagnosticResult(uid, 'english', profile);

        // Background roadmap generation
        RoadmapService.generatePlan(uid)
            .then(() => console.log(`[Roadmap] Background auto-regeneration complete for ${uid}`))
            .catch(err => console.error("Roadmap background generation failed:", err));

        res.json(profile);
    } catch (e) {
        console.error("Diagnostic Finalize Error:", e);
        res.status(500).json({ error: `Finalization failed: ${e.message || "Unknown error"}` });
    }
});

module.exports = router;
