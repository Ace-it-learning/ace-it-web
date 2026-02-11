const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const MathsDiagnosticService = require('../../services/maths/MathsDiagnosticService');

// POST /start - Retrieve diagnostic test questions
router.post('/start', async (req, res) => {
    try {
        const { uid } = req.body;
        console.log(`[MathDiag] Starting assessment for uid: ${uid}`);

        // Get Paper A (Default for calibration)
        const assets = MathsDiagnosticService.getAssets('A');

        // Map questions to FRONTEND SAFE format (exclude answers/marking schemes)
        // Also ensure integer conversion for 'part' just in case
        const safeQuestions = assets.questions.map(q => ({
            id: q.id,
            part: Number(q.part),
            type: q.type,
            text: q.text,
            options: q.options, // Only for MC
            topic: q.topic,
            imageURL: q.imageURL,
            parts: q.parts
        }));

        res.json({
            paperId: 'A',
            questions: safeQuestions
        });
    } catch (e) {
        console.error("Math Start Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// POST /submit - Grade and save results
router.post('/submit', async (req, res) => {
    try {
        const { uid, submission } = req.body;
        console.log(`[MathDiag] Submitting assessment for uid: ${uid}`);

        // Grade the submission
        const results = await MathsDiagnosticService.gradeMaths(submission, uid);

        // Save to Firestore (Additional triggers if needed)
        if (uid) {
            // 1. Update main user document (Atomic fields only)
            await admin.firestore().collection('users').doc(uid).set({
                maths_diagnostic: {
                    totalScore: results.totalScore,
                    maxScore: results.maxScore,
                    percentage: results.percentage,
                    level: results.level,
                    timestamp: new Date().toISOString(),
                    paperId: submission.paperId || 'A'
                },
                maths_level: results.level,
                has_maths_diagnostic: true,
                is_new_student: false,
                status: 'active'
            }, { merge: true });

            // 2. Award XP
            const GamificationService = require('../../services/GamificationService');
            await GamificationService.awardXP(uid, results.profile.xp_earned || 500, 'maths', {
                title: 'Study Calibration (Maths)',
                score: results.level
            });

            // 3. Generate initial roadmap after diagnostic
            const RoadmapService = require('../../services/RoadmapService');
            await RoadmapService.generatePlan(uid, 'maths');

            // Note: microSkills and detailed progress are handled inside gradeMaths -> updateMathSkills
        }

        res.json(results);
    } catch (e) {
        console.error("Math Submit Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// GET /debug/paper/:id - FOR DEBUGGING ONLY (Retrieve questions WITH answers)
router.get('/debug/paper/:id', (req, res) => {
    try {
        const { id } = req.params;
        const assets = MathsDiagnosticService.getAssets(id || 'A');
        res.json(assets);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Test endpoint to verify route is working
router.get('/practice/test', (req, res) => {
    console.log('[Practice Test] Endpoint hit');
    res.json({ status: 'ok', message: 'Math practice routes are working', timestamp: new Date().toISOString() });
});

// POST /practice/generate - AI Generate a single practice question
router.post('/practice/generate', async (req, res) => {
    console.log('[Practice Generate] Request received:', {
        uid: req.body.uid,
        topic: req.body.topic,
        level: req.body.level,
        language: req.body.language
    });

    const { uid, topic, level, language } = req.body;
    if (!uid || !topic) {
        console.log('[Practice Generate] Missing required fields');
        return res.status(400).json({ error: "Missing data" });
    }

    try {
        const MathsLabService = require('../../services/maths/MathsLabService');
        console.log('[Practice Generate] Calling MathsLabService.generateLesson...');
        console.log('[Practice Generate] Parameters:', { uid, topic, level: level || 3, language: language || 'en' });

        const lessonData = await MathsLabService.generateLesson({
            uid,
            topic,
            level: level || 3,
            language: language || 'en'
        });

        console.log('[Practice Generate] Success! Returning data');
        console.log('[Practice Generate] Generated questions:', lessonData.interactive_tasks?.length);
        // We only want 1 question for the "Practice" mode usually, but service returns 5.
        // Let's return the whole set, frontend can pick one or iterate.
        res.json(lessonData);
    } catch (e) {
        console.error("=== Math Practice Gen Error ===");
        console.error("Error Type:", e.constructor.name);
        console.error("Error Message:", e.message);
        console.error("Error Stack:", e.stack);
        console.error("Request params:", { uid, topic, level, language });
        console.error("===============================");
        res.status(500).json({ error: "Failed to generate practice", details: e.message });
    }
});

// POST /practice/submit - Submit answer and award XP
router.post('/practice/submit', async (req, res) => {
    const { uid, taskId, xp, topic } = req.body;
    // taskId is the roadmap task id (e.g. week_12_task_0)

    if (!uid || !xp) return res.status(400).json({ error: "Missing data" });

    try {
        // 1. Award XP
        const GamificationService = require('../../services/GamificationService');
        await GamificationService.awardXP(uid, xp, 'maths', {
            title: `Practice: ${topic}`,
            score: 100, // Full marks for correct answer
            subject: 'maths',
            topic: topic
        });

        // 2. Complete Roadmap Task if provided
        if (taskId) {
            const RoadmapService = require('../../services/RoadmapService');
            // Check if it's a general quest or weekly
            if (taskId.startsWith('week_')) {
                await RoadmapService.completeTask(uid, taskId, 'maths');
            } else {
                // General quest tracking could be added here (e.g. UserProfileService.updatePracticedSkills)
                // For now, we assume frontend manages the "checked" state visually or we persist it
                const UserProfileService = require('../../services/UserProfileService');
                // We don't have a direct "addPracticedSkill" yet, but we can verify it via updateMathSkills if needed.
                // Or just use the XP history as record.
            }
        }

        res.json({ success: true, xpAwarded: xp });
    } catch (e) {
        console.error("Math Practice Submit Error:", e);
        res.status(500).json({ error: "Failed to submit practice" });
    }
});

module.exports = router;
