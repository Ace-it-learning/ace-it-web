const express = require('express');
const router = express.Router();
const EnglishMockService = require('../services/EnglishMockService');
const MockAssessmentService = require('../services/MockAssessmentService');

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
 * POST /api/english/mock/submit
 * Submit mock answers for assessment
 */
router.post('/submit', async (req, res) => {
    try {
        const { paperId, userAnswers, analytics } = req.body;
        if (!paperId || !userAnswers) {
            return res.status(400).json({ error: "Missing paperId or userAnswers" });
        }

        const mockData = await EnglishMockService.getMockPaper(paperId);
        if (!mockData) return res.status(404).json({ error: "Paper not found" });

        const assessment = await MockAssessmentService.evaluatePaper(mockData, userAnswers, analytics);
        
        // Award XP based on marks result (Standard: 250 XP max for Reading Mock)
        const baseMaxXP = 250;
        const awardedXP = Math.round(baseMaxXP * (assessment.percentage / 100));
        
        // Attempt to award XP if user is logged in
        if (req.user?.uid) {
            try {
                const GamificationService = require('../services/GamificationService');
                const xpResult = await GamificationService.awardXP(req.user.uid, awardedXP, 'reading', {
                    title: `Mock Exam: ${mockData.meta?.topic || 'Paper 1'}`,
                    score: `${Math.round(assessment.percentage)}%`,
                    topic: mockData.meta?.topic,
                    paper: 'Paper 1'
                });
                assessment.xpAwarded = xpResult?.earned || awardedXP;
            } catch (e) {
                console.error("XP Award failed:", e);
                assessment.xpAwarded = awardedXP; // Fallback for UI display
            }
        } else {
            assessment.xpAwarded = awardedXP;
        }

        res.json(assessment);
    } catch (e) {
        console.error("Assessment error:", e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/english/mock/writing/submit
 * Submit a writing paper for evaluation
 */
router.post('/writing/submit', async (req, res) => {
    try {
        const { paperId, uid, email, responses } = req.body;
        const MockAssessmentService = require('../services/MockAssessmentService');
        const EnglishMockService = require('../services/EnglishMockService');
        
        // 1. Get mock data
        const mockData = await EnglishMockService.getMockPaper(paperId);
        
        // 2. Prepare userAnswers format for MockAssessmentService
        const userAnswers = {
            partA_draft: responses.find(r => r.part === 'A')?.text || '',
            partB_draft: responses.find(r => r.part === 'B')?.text || '',
            selectedPartB: responses.find(r => r.part === 'B')
        };
        
        // 3. Evaluate
        const results = await MockAssessmentService.evaluatePaper(mockData, userAnswers, {
            paperType: 'WRITING',
            selectedPartB: userAnswers.selectedPartB
        });
        
        res.json(results);
    } catch (e) {
        console.error("Writing submission error:", e);
        res.status(500).json({ error: e.message });
    }
});

/**
 * POST /api/english/mock/cheat/writing
 * Generate a model answer for a specific level
 */
router.post('/cheat/writing', async (req, res) => {
    try {
        const { level, part, type, situation } = req.body;
        const WritingCheatService = require('../services/WritingCheatService');
        const response = await WritingCheatService.generateCheatResponse(level, part, type, situation);
        res.json(response);
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

module.exports = router;
