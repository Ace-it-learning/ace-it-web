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

    const { uid, topic, level, language, isFactory, mode, batchId } = req.body;
    if (!uid || !topic) {
        console.log('[Practice Generate] Missing required fields');
        return res.status(400).json({ error: "Missing data" });
    }

    try {
        const MathsLabService = require('../../services/maths/MathsLabService');
        console.log('[Practice Generate] Calling MathsLabService.generateLesson...');
        console.log('[Practice Generate] Parameters:', { uid, topic, level: level || 3, language: language || 'en', batchId });

        const lessonData = await MathsLabService.generateLesson({
            uid,
            topic,
            level: level || 3,
            language: language || 'en',
            isFactory: isFactory || false,
            mode,
            batchId
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
    const { uid, taskId, xp, topic, questionIds, level, scorePercent } = req.body;
    console.log(`[MathsPractice] Submission received for uid: ${uid}, topic: ${topic}, questions: ${questionIds?.length || 0}`);

    if (!uid || !xp) {
        console.warn('[MathsPractice] Submission rejected: Missing UID or XP');
        return res.status(400).json({ error: "Missing data" });
    }

    try {
        const MathsLabService = require('../../services/maths/MathsLabService');
        const UserProfileService = require('../../services/UserProfileService');

        // 1. Mark questions as seen & Quality-Gated Auto-Approval
        if (questionIds && Array.isArray(questionIds)) {
            await MathsLabService.markQuestionsSeen(uid, questionIds);
            
            const db = admin.firestore();
            const batch = db.batch();
            const graphTopics = ['math_geo_coord', 'math_geo_circle', 'math_geo_trig', 'math_geo_mensuration'];

            for (const qid of questionIds) {
                const qRef = db.collection('question_bank').doc(qid);
                const qDoc = await qRef.get();
                if (qDoc.exists) {
                    const data = qDoc.data();
                    const isVisualTopic = graphTopics.includes(data.topic_id);
                    const hasVisual = !!(data.diagram_svg || data.diagram_url || (data.content && data.content.diagram_svg));
                    
                    // Only approve if it's not a visual topic OR if it successfully generated a visual
                    if (!isVisualTopic || hasVisual) {
                        batch.set(qRef, { is_approved: true }, { merge: true });
                    } else {
                        console.log(`[MathsPractice] Skipping auto-approval for ${qid} due to missing diagram in visual topic.`);
                    }
                }
            }
            await batch.commit();
            console.log(`[MathsPractice] ${questionIds.length} questions processed for uid: ${uid}`);
        }

        // 2. Update Micro-skill Mastery (Ability Radar & Mastery Bars)
        if (topic) {
            // Mapping frontend difficulty (0=adaptive, 1=easy, 2=med, 3=dse, 4=elite)
            // to DSE_SCORING difficulty caps (3, 4, 5, 7)
            const difficultyMap = { 0: 5, 1: 3, 2: 4, 3: 5, 4: 7 };
            const sessionDifficulty = difficultyMap[level] || 5;

            const masteryScore = req.body.scorePercent !== undefined ? req.body.scorePercent : 100;
            
            await UserProfileService.updateMicroSkillLevel(uid, 'maths', topic, masteryScore, {
                totalQuestions: questionIds?.length || 5,
                difficulty: sessionDifficulty,
                source: 'lab'
            });
            console.log(`[MathsPractice] Topic mastery updated for ${topic} (uid: ${uid}, score: ${masteryScore}%)`);
        }

        // 3. Award XP
        const GamificationService = require('../../services/GamificationService');
        await GamificationService.awardXP(uid, xp, 'maths', {
            title: `Practice: ${topic || 'Maths'}`,
            score: 100, // Full marks for correct answer
            subject: 'maths',
            topic: topic
        });

        // 4. Complete Roadmap Task if provided
        if (taskId) {
            const questResult = await GamificationService.awardQuestCompletion(uid, taskId, 'maths');
            if (questResult.success && questResult.fresh) {
                console.log(`[MathsPractice] Quest Bonus Awarded: ${questResult.earned} XP`);
            }
        }

        res.json({ success: true, xpAwarded: xp });
    } catch (e) {
        console.error("Math Practice Submit Error:", e);
        res.status(500).json({ error: "Failed to submit practice" });
    }
});

module.exports = router;
