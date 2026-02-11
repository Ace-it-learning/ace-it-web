const express = require('express');
const router = express.Router();
const MathsLabService = require('../../services/maths/MathsLabService');

// POST /api/maths/lab/generate
router.post('/generate', async (req, res) => {
    const { topic, level, uid } = req.body;
    console.log(`[MathsLab] Generating session for topic: ${topic}, user: ${uid}, level: ${level}`);

    try {
        const lesson = await MathsLabService.generateLesson({ topic, level, uid });
        res.json(lesson);
    } catch (e) {
        console.error("Maths Lab Gen Error:", e);
        res.status(500).json({ error: "Failed to generate maths lab" });
    }
});

// POST /api/maths/lab/submit
router.post('/submit', async (req, res) => {
    const { uid, results, xp, topic } = req.body;
    const GamificationService = require('../../services/GamificationService');
    const UserProfileService = require('../../services/UserProfileService');

    if (!uid) return res.status(400).json({ error: "Missing data" });

    try {
        console.log(`[MathsLab] Submitting results for ${uid}`);

        // Update Math Micro-Skills
        if (topic) {
            // Transform simplistic "masteryScore" into skill update format if needed
            // For now, assuming basic update
            const score = req.body.masteryScore || 0;
            // Map single topic update
            const skillUpdates = {};
            skillUpdates[topic] = {
                level: (score / 20), // Rough map: 100% -> Level 5 wait, scaling is different. 
                // Let's assume UserProfileService handles the merging logic well or we just track practice count?
                // Actually UserProfileService.updateMathSkills expects specific structure. 
                // Let's just track it simply for now or use the generic one?
                // Re-using existing simplified update for now:
                practiceCount: 1
            };

            // We need a specific math updater or just generic one?
            // UserProfileService has updateMathSkills. 
            // Let's call it.
            // But wait, updateMathSkills logic is complex (weighted average). 
            // Let's simplify and just use the same pattern as English for now (generic update)
            // or build a specific one.
            // Given time constraints, let's use a simple distinct call if possible.
            // But wait, `updateMathSkills` is robust. Let's use it.
            await UserProfileService.updateMathSkills(uid, {
                [topic]: {
                    level: Math.max(1, Math.min(7, (score / 100) * 7)), // Map 0-100% to 1-7 (approx)
                    practiceCount: 1
                }
            }, 'lab');
        }

        // Award XP & Quest Completion
        let questXP = 0;
        let practiceXP = 0;

        // 1. Quest Completion
        if (req.body.taskId) {
            const questResult = await GamificationService.awardQuestCompletion(uid, req.body.taskId, 'maths');
            if (questResult.success && questResult.fresh) {
                questXP = questResult.earned;
            }
        }

        // 2. Practice XP
        if (xp) {
            let sourceType = 'maths_practice';
            if (req.body.isPersonalised) sourceType = 'maths_personalised';
            if (req.body.isChallenge) sourceType = 'maths_challenge';

            const displayName = UserProfileService.getSkillName(topic, 'maths');

            const xpResult = await GamificationService.awardXP(uid, parseInt(xp), sourceType, {
                duration: req.body.duration || 0,
                expectedDuration: 300,
                title: req.body.title || `Maths Lab: ${displayName || 'Practice'}`,
                subject: 'maths',
                topic: displayName,
                score: req.body.masteryScore ? `${req.body.masteryScore}%` : undefined
            });
            practiceXP = xpResult.earned;
        }

        res.json({ success: true, earnedTotal: questXP + practiceXP, questBonus: questXP, practiceXP });

    } catch (e) {
        console.error("Maths Lab Submit Error:", e);
        res.status(500).json({ error: "Failed to submit maths lab" });
    }
});

// POST /api/maths/explain-step
router.post('/explain-step', async (req, res) => {
    const { question, fullSolution, targetStep, language } = req.body;

    try {
        const explanation = await MathsLabService.explainStep({
            question,
            fullSolution,
            targetStep,
            language
        });
        res.json(explanation);
    } catch (e) {
        console.error("Maths Step Explain Error:", e);
        res.status(500).json({ error: "Failed to explain math step" });
    }
});

module.exports = router;
