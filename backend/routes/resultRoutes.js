const express = require('express');
const router = express.Router();
const UserProfileService = require('../services/UserProfileService');

/**
 * @route   GET /api/results/:resultId
 * @desc    Fetch a specific quest result for review
 */
router.get('/:resultId', async (req, res) => {
    try {
        const { resultId } = req.params;
        const { uid } = req.query; // Assuming uid is passed or available via auth

        if (!uid) {
            return res.status(401).json({ error: "Unauthorized: UID required" });
        }

        const result = await UserProfileService.getQuestResult(uid, resultId);
        if (!result) {
            return res.status(404).json({ error: "Result not found" });
        }

        res.json(result);
    } catch (error) {
        console.error('[ResultRoutes] Error fetching result:', error);
        res.status(500).json({ error: "Failed to fetch result" });
    }
});

module.exports = router;
