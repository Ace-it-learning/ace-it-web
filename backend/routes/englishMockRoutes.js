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

module.exports = router;
