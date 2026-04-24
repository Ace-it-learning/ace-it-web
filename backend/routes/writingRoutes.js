const express = require('express');
const router = express.Router();
const WritingQuestService = require('../services/writing/WritingQuestService');
const UserProfileService = require('../services/UserProfileService');

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

// GET /api/writing/scenarios
// Returns ALL scenarios for the Roadmap UI
router.get('/scenarios', async (req, res) => {
    try {
        const scenarios = await WritingQuestService.getAllScenarios();
        console.log(`[WritingRoutes] Returning ${scenarios.length} scenarios for Roadmap.`);
        res.json(scenarios);
    } catch (err) {
        console.error("[WritingRoutes] Error fetching all scenarios:", err);
        res.status(500).json({ error: "Failed to fetch all scenarios" });
    }
});

// POST /api/writing/brainstorm
// Pillar 1: Generate "PEE" prompts
router.post('/brainstorm', async (req, res) => {
    try {
        const { topic, weakSkills, messages, points, uid } = req.body;
        const persona = await UserProfileService.getPersona(uid, 'english');
        const result = await WritingQuestService.generateBrainstormingPrompts(topic, weakSkills, messages, points);
        
        // Dynamic identity injection
        if (result.intro_message) result.intro_message = result.intro_message.replace(/{{agentName}}/g, persona.name);
        if (result.questions) {
            result.questions = result.questions.map(q => ({
                ...q,
                text: q.text.replace(/{{agentName}}/g, persona.name)
            }));
        }

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
        const { text, textType, brainstormPoints, uid } = req.body;
        const persona = await UserProfileService.getPersona(uid, 'english');
        const result = await WritingQuestService.analyzeDraftParagraph(text, textType || "Essay", "5*", brainstormPoints);
        
        // Inject identity if needed (though powerup is mostly technical feedback)
        if (typeof result === 'object' && result.feedback_summary) {
            result.feedback_summary = result.feedback_summary.replace(/{{agentName}}/g, persona.name);
        }

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Analysis failed" });
    }
});

// POST /api/writing/draft/review
// Real-time analysis for "Review Draft" button
router.post('/draft/review', async (req, res) => {
    try {
        const { content, topic, textType } = req.body;
        const result = await WritingQuestService.analyzeRealTime(content, topic, textType || "Essay");
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Review failed" });
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
    let { topic, textType, content, question, answer, uid } = req.body;

    // Normalize inputs to support both Quest (topic/content) and Exam (question/answer) formats
    const finalContent = content || answer;
    const finalTopic = topic || question || "General Writing";
    const finalTextType = textType || "Essay";

    if (!finalContent) return res.status(400).json({ error: "Content/Answer required" });

    try {
        const persona = await UserProfileService.getPersona(uid, 'english');
        const result = await WritingQuestService.gradeFinalPiece(finalTopic, finalTextType, finalContent);
        
        // Inject identity into assessment
        if (result.examiner_summary) {
            if (result.examiner_summary.en) result.examiner_summary.en = result.examiner_summary.en.replace(/{{agentName}}/g, persona.name);
            if (result.examiner_summary.zh) result.examiner_summary.zh = result.examiner_summary.zh.replace(/{{agentName}}/g, persona.name);
        }

        // --- PERSIST RESULT FOR HISTORICAL REVIEW ---
        let resultId = null;
        if (uid && uid !== 'guest') {
            resultId = await UserProfileService.saveQuestResult(uid, {
                topic: finalTopic,
                textType: finalTextType,
                content: finalContent,
                scores: result.pillar_scores || {},
                pillar_scores: result.pillar_scores || {},
                predicted_level: result.predicted_level || "4",
                overall_score: result.overall_score || 4,
                feedback: result, // Full feedback object
                subject: 'english',
                paper: 'Writing',
                missionName: finalTopic
            });
        }

        // --- AWARD XP ---
        let xpAwarded = 0;
        if (uid && uid !== 'guest' && result.predicted_level) {
            const GamificationService = require('../services/GamificationService');
            
            // New standardized XP: 150 for general writing quest
            let baseAmount = 150;
            let questBonus = 0;

            // Handle Weekly Quest award
            if (req.body.isWeeklyQuest) {
                const weeklyResult = await GamificationService.awardWeeklyQuestCompletion(uid);
                if (weeklyResult.success) {
                    questBonus = weeklyResult.earned;
                    baseAmount = 250; // Weekly quest base
                }
            }

            const xpResult = await GamificationService.awardXP(uid, baseAmount, 'writing', {
                title: `Writing: ${finalTopic}`,
                score: `${result.predicted_level} / 5**`,
                subject: 'english',
                paper: 'Writing',
                questName: finalTopic,
                resultId: resultId
            }) || { earned: 0 };
            
            res.json({
                ...result,
                resultId,
                xp_awarded: (xpResult.earned || 0) + questBonus,
                xp_breakdown: xpResult.breakdown
            });
            return;
        }

        res.json({
            ...result,
            resultId: null,
            xp_awarded: 0
        });
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

// --- ADMIN/TESTING CHEAT LIBRARY ---

// GET /api/writing/admin/cheat-library
// Returns the pre-generated hardcoded cheat essays for testing
router.get('/admin/cheat-library', async (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const libraryPath = path.join(__dirname, '../data/writing_cheat_library.json');
    
    try {
        if (!fs.existsSync(libraryPath)) {
            return res.status(404).json({ error: "Cheat library not yet generated." });
        }
        const data = fs.readFileSync(libraryPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error("[WritingRoutes] Cheat library error:", err);
        res.status(500).json({ error: "Failed to load cheat library" });
    }
});

module.exports = router;
