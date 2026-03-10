const express = require('express');
const router = express.Router();
const MathsLabService = require('../../services/maths/MathsLabService');

// POST /api/maths/lab/generate
router.post('/generate', async (req, res) => {
    const { topic, level, uid, language, isFactory } = req.body;
    console.log(`[MathsLab] Generating session for topic: ${topic}, user: ${uid}, level: ${level}, language: ${language}`);

    try {
        const lesson = await MathsLabService.generateLesson({ topic, level, uid, language, isFactory: isFactory || false });
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

        // 3. Factory Model Quest Completion (Phase 5)
        if (req.body.isFactoryQuest) {
            const MATHS_XP_MAPPING = { 1: 50, 2: 75, 3: 100, 4: 150 };
            const baseXP = MATHS_XP_MAPPING[req.body.level] || 50;

            const factoryResult = await GamificationService.awardFactoryQuestCompletion(uid, req.body.taskId || topic, 'maths', baseXP);
            if (factoryResult.success) {
                questXP = factoryResult.totalEarned || factoryResult.earned;
                console.log(`[MathsLab] Factory Quest Awarded: ${questXP} XP (Bonus: ${factoryResult.bonusAwarded})`);
            }
        } else if (req.body.taskId) {
            // 1. Legacy Quest Completion
            const questResult = await GamificationService.awardQuestCompletion(uid, req.body.taskId, 'maths');
            if (questResult.success && questResult.fresh) {
                questXP = questResult.earned;
                console.log(`[MathsLab] Quest Bonus Awarded: ${questXP} XP`);
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

// GET /api/maths/lab/learning-content/:microSkillId
router.get('/learning-content/:microSkillId', async (req, res) => {
    const { microSkillId } = req.params;
    const { lang } = req.query;
    console.log(`[MathsLabRoutes] GET learning-content for: ${microSkillId}, lang: ${lang}`);

    try {
        const content = await MathsLabService.getLearningContent(microSkillId, lang);
        console.log(`[MathsLabRoutes] Sending content for: ${microSkillId}`);
        res.json(content);
    } catch (e) {
        console.error("Maths Learning Content Error:", e);
        res.status(500).json({ error: "Failed to fetch math learning content" });
    }
});

// POST /api/maths/lab/grade
router.post('/grade', async (req, res) => {
    const { questions, answers, imageAnswers, language } = req.body;

    if (!questions || !answers) {
        return res.status(400).json({ error: "Missing questions or answers payload" });
    }

    try {
        const gradedResults = await MathsLabService.gradeShortAnswers(questions, answers, language, imageAnswers || {});
        res.json(gradedResults);
    } catch (e) {
        console.error("Maths Lab Grading Error:", e);
        res.status(500).json({ error: "Failed to grade math short answers" });
    }
});

// POST /api/maths/lab/hint
router.post('/hint', async (req, res) => {
    const { question, question_zh, topic, level } = req.body;
    try {
        const hint = await MathsLabService.getHint({ question, question_zh, topic, level });
        res.json(hint);
    } catch (e) {
        console.error("Maths Hint Error:", e);
        res.status(500).json({ error: "Failed to fetch math hint" });
    }
});

module.exports = router;
