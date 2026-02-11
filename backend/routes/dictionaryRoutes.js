const express = require('express');
const router = express.Router();
const GenerativeAIService = require('../services/GenerativeAIService');

// POST /api/dictionary
router.post('/', async (req, res) => {
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
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        let textResponse = result.response.text();
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(textResponse);

        res.json(json);
    } catch (error) {
        console.error("Dictionary API Error:", error);
        res.status(500).json({
            error: "Definition unavailable.",
            details: error.message
        });
    }
});

module.exports = router;
