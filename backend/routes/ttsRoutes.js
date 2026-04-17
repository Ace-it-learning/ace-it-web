const express = require('express');
const router = express.Router();
const TTSService = require('../services/TTSService');

/**
 * POST /api/tts
 * Unified endpoint for high-fidelity audio generation.
 * Routes Cantonese to Gemini Multimodal and English to Standard TTS.
 */
router.post('/tts', async (req, res) => {
    const { text, languageCode, gender, uid } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Missing text for synthesis" });
    }

    if (!uid) {
        return res.status(400).json({ error: "Missing uid for voice quota tracking" });
    }

    try {
        console.log(`[ttsRoutes] Synthesis requested for: "${text.substring(0, 30)}..." (${languageCode || 'en-US'})`);
        
        // Use the unified TTSService which now handles the hybrid logic.
        // Returns base64 audio content.
        const audioContent = await TTSService.generateSpeech(
            text, 
            languageCode || 'en-US', 
            gender || 'FEMALE'
        );

        res.json({
            audio: audioContent,
            audioContent: audioContent,
            mimeType: 'audio/mpeg' // Standards update
        });
    } catch (error) {
        console.error("[ttsRoutes] TTS Generation failed:", error);
        res.status(500).json({ 
            error: "TTS Generation failed", 
            details: error.message 
        });
    }
});

module.exports = router;
