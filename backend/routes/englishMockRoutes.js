const express = require('express');
const router = express.Router();
const EnglishMockService = require('../services/EnglishMockService');

/**
 * GET /api/english/mock/headers/:paperCode
 * Get headers for Paper 1, 2, 3, or 4
 */
router.get('/headers/:paperCode', async (req, res) => {
    try {
        const headers = await EnglishMockService.getLibraryHeaders(req.params.paperCode);
        res.json(headers);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * GET /api/english/mock/:paperId
 * Get full paper data (JSON)
 */
router.get('/:paperId', async (req, res) => {
    try {
        const paper = await EnglishMockService.getMockPaper(req.params.paperId);
        if (!paper) return res.status(404).json({ error: "Paper not found" });
        res.json(paper);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/english/mock/writing/submit
 * Submit Writing Mock responses (Part A & B)
 */
router.post('/writing/submit', async (req, res) => {
    try {
        const { paperId, responses, uid } = req.body;
        const WritingQuestService = require('../services/writing/WritingQuestService');
        const EnglishMockService = require('../services/EnglishMockService');
        
        const mockData = await EnglishMockService.getMockPaper(paperId);
        if (!mockData) return res.status(404).json({ error: "Paper not found" });

        const assessment = await WritingQuestService.gradeMockPaper(mockData.meta?.topic || 'Paper 2', responses);
        
        // Award XP (Standard: 250 XP for Writing Mock)
        if (uid && uid !== 'guest') {
            const GamificationService = require('../services/GamificationService');
            const awardedXP = Math.round(250 * (assessment.overall_score / 100)) || 150; // Fallback or logic based on level
            
            try {
                await GamificationService.awardXP(uid, awardedXP, 'writing', {
                    title: `Writing Mock: ${mockData.meta?.topic}`,
                    score: assessment.predicted_level,
                    paper: 'Paper 2'
                });
                assessment.xpAwarded = awardedXP;
            } catch (e) {
                console.error("XP Award failed:", e);
            }
        }

        res.json(assessment);
    } catch (e) {
        console.error("Writing Mock submission error:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;

