const express = require('express');
const router = express.Router();
const GenerativeAIService = require('../services/GenerativeAIService');
const TokenService = require('../services/TokenService');
const OcrService = require('../services/OcrService');
const axios = require('axios');
const { getContainer } = require('../db/cosmos');

const TIER_1_MODEL = "gemini-flash-latest";
const TIER_PRO_MODEL = "gemini-pro-latest";

/**
 * Utility Endpoints (Dictionary, OCR, etc.)
 */

router.post('/dictionary', async (req, res) => {
    const { text, context } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    try {
        const prompt = `
        Act as a smart English dictionary for HKDSE students.
        Word: "${text}"
        Context: "${context || 'General usage'}"
        
        Instructions:
        1. If the word is a typo (e.g. "landscaape"), define the CORRECTED word (e.g. "landscape") and state "(Corrected from [typo])" in the definition.
        2. Definition: Simple English definition (max 15 words).
        3. Translation: Traditional Chinese translation (繁體中文).
        4. Type: Part of speech.
        5. Example: A simple example sentence.
        
        JSON Format: { "definition": "...", "translation": "...", "type": "...", "example": "..." }
        `;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: TIER_1_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });
        
        let textResponse = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(textResponse));
    } catch (error) {
        console.error("Dictionary API Error:", error);
        res.status(500).json({ error: "Definition unavailable." });
    }
});

router.post('/ocr', async (req, res) => {
    try {
        const { image, uid } = req.body;
        if (!image || !image.data) return res.status(400).json({ error: "No image provided" });

        // Use the same OCR stack as /api/chat image grading (Tesseract + preprocessing + optional Azure Read).
        // The old path used Gemini multimodal (inlineData); that breaks when AI_PROVIDER=deepseek (text-only).
        const detailed = await OcrService.extractDetailedFromBase64(image.data, "eng");
        const text = (detailed?.text || "").trim();

        if (!text || text.length < 5) {
            return res.status(422).json({
                error: "OCR incomplete",
                details: "Could not read enough text from the image. Try a clearer photo or paste the text."
            });
        }

        res.json({ transcription: text });
    } catch (e) {
        console.error("[utilRoutes] OCR error:", e.message);
        res.status(500).json({ error: "OCR failed", details: e.message });
    }
});

const UserProfileService = require('../services/UserProfileService');
const { checkVoiceQuota } = require('../services/VoiceQuotaService');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/timeline
 */
router.get('/timeline', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.json([]); // Return empty array instead of 400 to prevent crashes
    try {
        const timeline = await UserProfileService.getTimeline(uid);
        res.json(Array.isArray(timeline) ? timeline : []);
    } catch (e) {
        console.error("Timeline Error:", e);
        res.json([]); // Fail gracefully with empty array for .map()
    }
});

/**
 * GET /api/voice-quota
 */
router.get('/voice-quota', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const quota = await checkVoiceQuota(uid);
        res.json(quota);
    } catch (e) {
        console.error("Voice Quota Error:", e);
        res.status(500).json({ error: "Failed to check voice quota" });
    }
});

/**
 * GET /api/schools
 */
router.get('/schools', async (req, res) => {
    try {
        const container = await getContainer('meta_schools', '/pk');
        const result = await container.items.query({
            query: "SELECT c.name, c.code, c.district FROM c WHERE c.pk = @pk ORDER BY c.name",
            parameters: [{ name: "@pk", value: "meta_schools" }]
        }).fetchAll();
        const schoolsFromDb = result.resources || [];
        if (!schoolsFromDb.length) {
            const schools = require('../schools_seed.json');
            schools.sort((a, b) => a.name.localeCompare(b.name));
            return res.json(schools);
        }
        res.json(schoolsFromDb);
    } catch (e) {
        console.error("Fetch Schools Error:", e);
        const schools = require('../schools_seed.json');
        schools.sort((a, b) => a.name.localeCompare(b.name));
        res.json(schools);
    }
});

/**
 * GET /api/trigger-weekly
 * Manual trigger for developer testing of weekly reports
 */
/**
 * GET /api/health
 * Standard health check for Cloud Run and monitoring
 */
router.get('/health', async (req, res) => {
    const payload = {
        status: 'operational',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    };
    const { isAzureData } = require('../config/runtime');
    if (isAzureData()) {
        try {
            const c = await getContainer('chat_messages', '/pk');
            await c.items.query({ query: 'SELECT VALUE COUNT(1) FROM c' }).fetchAll();
            payload.cosmos = 'ok';
        } catch (err) {
            payload.status = 'degraded';
            payload.cosmos = 'error';
            payload.cosmosError = err.message;
        }
    }
    res.json(payload);
});

router.get('/trigger-weekly', async (req, res) => {
    const { uid, email } = req.query;
    if (!uid || !email) return res.status(400).json({ error: 'Missing uid or email' });
    try {
        const profile = await UserProfileService.getProfile(uid);
        if (!profile) return res.status(404).json({ error: 'User not found' });
        
        // This is a placeholder for the actual report service trigger
        // which was originally a large block of logic in server.js
        res.json({ success: true, message: `Report triggered for ${email}` });
    } catch (e) {
        console.error("Trigger Weekly Error:", e);
        res.status(500).json({ error: "Trigger failed" });
    }
});


module.exports = router;
