const express = require('express');
const router = express.Router();
const RoadmapService = require('../services/RoadmapService');
const { requireResolvedUid } = require('../middleware/requireResolvedUid');

// GET /api/roadmap
router.get('/', requireResolvedUid, async (req, res) => {
    const { uid, subject } = req.query; // Support subject (english/maths)
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const plan = await RoadmapService.getCurrentPlan(uid, subject || 'english');
        res.json(plan);
    } catch (e) {
        console.error("Fetch Roadmap Error:", e);
        res.status(500).json({ error: "Failed to fetch roadmap" });
    }
});

// POST /api/roadmap/complete
router.post('/complete', requireResolvedUid, async (req, res) => {
    const { uid, taskId } = req.body;
    if (!uid || !taskId) return res.status(400).json({ error: "Missing data" });
    try {
        const result = await RoadmapService.completeTask(uid, taskId);
        res.json(result);
    } catch (e) {
        console.error("Complete Task Error:", e);
        res.status(500).json({ error: "Failed to complete task" });
    }
});

// POST /api/roadmap/regenerate
router.post('/regenerate', requireResolvedUid, async (req, res) => {
    const { uid, subject } = req.body;
    try {
        const plan = await RoadmapService.generatePlan(uid, subject || 'english');
        res.json(plan);
    } catch (e) {
        console.error("Regenerate Error:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
