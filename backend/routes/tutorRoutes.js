const express = require('express');
const router = express.Router();
const EnglishTutorService = require('../services/EnglishTutorService');
const EraserChallengeService = require('../services/EraserChallengeService');

// Middleware to check for UID
const requireAuth = (req, res, next) => {
    const { uid } = req.body;
    if (!uid) {
        return res.status(401).json({ error: "Unauthorized: Missing UID" });
    }
    next();
};

/**
 * POST /api/tutor/writing/polish
 * Feature A: Writing Polisher
 * Body: { uid, text, context }
 */
router.post('/writing/polish', requireAuth, async (req, res) => {
    try {
        const { uid, text, context } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const result = await EnglishTutorService.polishWriting(text, uid, context);
        res.json(result);
    } catch (error) {
        console.error("Polish Error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/tutor/reading/decode
 * Feature B: Reading Decoder
 * Body: { uid, text, image, mimeType }
 * Note: 'image' should be a base64 encoded string if provided.
 */
router.post('/reading/decode', requireAuth, async (req, res) => {
    try {
        const { uid, text, image, mimeType } = req.body;

        if (!text && !image) {
            return res.status(400).json({ error: "Either text or image is required" });
        }

        let imageBuffer = null;
        if (image) {
            // Remove header if present (e.g. "data:image/jpeg;base64,")
            const base64String = image.replace(/^data:image\/\w+;base64,/, "");
            imageBuffer = Buffer.from(base64String, 'base64');
        }

        const result = await EnglishTutorService.decodeReading(text, imageBuffer, mimeType, uid);
        res.json(result);
    } catch (error) {
        console.error("Decode Error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/tutor/vocabulary/chips
 * Feature C: Contextual Vocabulary
 * Body: { uid, topic }
 */
router.post('/vocabulary/chips', requireAuth, async (req, res) => {
    try {
        const { uid, topic } = req.body;
        if (!topic) return res.status(400).json({ error: "Topic is required" });

        const result = await EnglishTutorService.generateVocabularyChips(topic, uid);
        res.json(result);
    } catch (error) {
        console.error("Vocab Error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/tutor/vocabulary/sentence
 * Generate example sentence for a vocabulary word
 * Body: { uid, word, level }
 */
router.post('/vocabulary/sentence', requireAuth, async (req, res) => {
    try {
        const { uid, word, level } = req.body;
        if (!word) return res.status(400).json({ error: "Word is required" });

        const result = await EnglishTutorService.generateVocabularySentence(word, level || '5**', uid);
        res.json(result);
    } catch (error) {
        console.error("Sentence Generation Error:", error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * POST /api/tutor/eraser/challenge
 * Feature: The Eraser Challenge (Game Gen)
 * Body: { uid, topic }
 */
router.post('/eraser/challenge', requireAuth, async (req, res) => {
    try {
        const { uid, topic } = req.body;
        const result = await EraserChallengeService.generateChallenge(uid, topic);
        res.json(result);
    } catch (error) {
        console.error("Eraser Challenge Error:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/tutor/eraser/grade
 * Feature: The Eraser Challenge (Grading)
 * Body: { uid, original, attempt }
 */
router.post('/eraser/grade', requireAuth, async (req, res) => {
    try {
        const { uid, original, attempt } = req.body;
        if (!original || !attempt) return res.status(400).json({ error: "Missing original or attempt text" });

        const result = await EraserChallengeService.gradeAttempt(uid, original, attempt);
        res.json(result);
    } catch (error) {
        console.error("Eraser Grade Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
