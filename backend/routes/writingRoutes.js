const express = require('express');
const router = express.Router();
const WritingQuestService = require('../services/writing/WritingQuestService');

// GET /api/writing/syllabus
// Returns the Master JSON for the 3 Pillars
router.get('/syllabus', (req, res) => {
    try {
        const syllabus = WritingQuestService.getSyllabus();
        res.json(syllabus);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load syllabus" });
    }
});

// GET /api/writing/format/:id
// Returns factory tasks for a specific format
router.get('/format/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const prompts = await WritingQuestService.getFactoryTopics(id);
        res.json(prompts);
    } catch (err) {
        console.error("[WritingRoutes] Error fetching topics:", err);
        res.status(500).json({ error: "Failed to fetch topics" });
    }
});

// POST /api/writing/brainstorm
// Pillar 1: Generate "PEE" prompts
router.post('/brainstorm', async (req, res) => {
    try {
        const { topic, weakSkills, messages, points } = req.body;
        const result = await WritingQuestService.generateBrainstormingPrompts(topic, weakSkills, messages, points);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Brainstorming failed" });
    }
});

// POST /api/writing/draft/powerup
// Pillar 2: Analyze paragraph for "Level 5" upgrades & Register check
router.post('/draft/powerup', async (req, res) => {
    try {
        const { text, textType, brainstormPoints } = req.body;
        const result = await WritingQuestService.analyzeDraftParagraph(text, textType || "Essay", "5*", brainstormPoints);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Analysis failed" });
    }
});


// POST /api/writing/draft/generate
// Admin Cheat: Generate full essay
router.post('/draft/generate', async (req, res) => {
    try {
        const { topic, textType, level, points } = req.body;
        const result = await WritingQuestService.generateFullEssay(topic, textType || "Essay", level || "5**", points);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Generation failed" });
    }
});

// POST /api/writing/draft/connect
// Pillar 3: Check transitions between paragraphs
router.post('/draft/connect', async (req, res) => {
    const { prevParagraph, currentParagraph } = req.body;
    if (!prevParagraph || !currentParagraph) return res.status(400).json({ error: "Both paragraphs required" });

    try {
        const result = await WritingQuestService.checkTransitions(prevParagraph, currentParagraph);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Connection check failed" });
    }
});

// POST /api/writing/draft/structure
// Pillar 3: Review overall essay structure
router.post('/draft/structure', async (req, res) => {
    const { paragraphs, topic, textType } = req.body;
    if (!paragraphs || !Array.isArray(paragraphs)) return res.status(400).json({ error: "Paragraphs array required" });

    try {
        const result = await WritingQuestService.reviewStructure(paragraphs, topic, textType);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Structure review failed" });
    }
});

// POST /api/writing/grade
// Final assessment of the piece
router.post('/grade', async (req, res) => {
    let { topic, textType, content, question, answer } = req.body;

    // Normalize inputs to support both Quest (topic/content) and Exam (question/answer) formats
    const finalContent = content || answer;
    const finalTopic = topic || question || "General Writing";
    const finalTextType = textType || "Essay";

    if (!finalContent) return res.status(400).json({ error: "Content/Answer required" });

    try {
        const result = await WritingQuestService.gradeFinalPiece(finalTopic, finalTextType, finalContent);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Grading failed" });
    }
});

router.post('/draft/compare', async (req, res) => {
    try {
        const { content, topic, textType, targetLevel } = req.body;
        const result = await WritingQuestService.compareEssays(content, topic, textType, targetLevel);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ELITE EXEMPLARS (Writing Lab) ---

// GET /api/writing/exemplars
// List all high-quality model essays
router.get('/exemplars', async (req, res) => {
    const { genre } = req.query;
    const WritingLabService = require('../services/WritingLabService');
    try {
        const results = await WritingLabService.getExemplarsList(genre || 'all');
        res.json(results);
    } catch (err) {
        console.error("[WritingRoutes] Exemplar list error:", err);
        res.status(500).json({ error: "Failed to fetch exemplars" });
    }
});

// GET /api/writing/exemplars/:id
// Get full details for a specific exemplar
router.get('/exemplars/:id', async (req, res) => {
    const { id } = req.params;
    const WritingLabService = require('../services/WritingLabService');
    try {
        const result = await WritingLabService.getExemplar(id);
        if (!result) return res.status(404).json({ error: "Exemplar not found" });
        res.json(result);
    } catch (err) {
        console.error("[WritingRoutes] Exemplar fetch error:", err);
        res.status(500).json({ error: "Failed to fetch exemplar details" });
    }
});

module.exports = router;
