const express = require('express');
const router = express.Router();
const LabService = require('../../services/LabService');
const GamificationService = require('../../services/GamificationService');
const UserProfileService = require('../../services/UserProfileService');

// GET /api/lab/listening
router.get('/listening', async (req, res) => {
    console.log(`[LabRoute] GET /listening hit`);
    try {
        const quests = await LabService.getListeningQuests();
        console.log(`[LabRoute] Found ${quests.length} quests`);
        res.json(quests);
    } catch (e) {
        console.error("Listening Quests Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch listening quests" });
    }
});

// GET /api/lab/listening/:id
router.get('/listening/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`[LabRoute] GET /listening/${id} hit`);
    try {
        const quest = await LabService.getQuestById(id);
        if (!quest) return res.status(404).json({ error: "Quest not found" });
        res.json(quest);
    } catch (e) {
        console.error("Listening Quest Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch quest" });
    }
});

// POST /api/lab/generate
router.post('/generate', async (req, res) => {
    const { topic, focus, level, uid, isFactory } = req.body;
    console.log(`[Lab] Generating lesson for topic: ${topic}, user: ${uid}, level: ${level}, isFactory: ${isFactory}`);

    try {
        const lesson = await LabService.generateLesson({ topic, focus, level, uid, isFactory });
        res.json(lesson);
    } catch (e) {
        console.error("Lab Generation API Error:", e);
        res.status(500).json({ error: e.message || "Failed to generate lesson content" });
    }
});

// POST /api/lab/submit
router.post('/submit', async (req, res) => {
    const { uid, results, xp } = req.body;
    if (!uid || !results) return res.status(400).json({ error: "Missing data" });

    try {
        const questionIds = Object.keys(results);
        await LabService.markQuestionsSeen(uid, questionIds);

        // Save Mistakes
        if (req.body.mistakes && Array.isArray(req.body.mistakes)) {
            const mistakePromises = req.body.mistakes.map(m => UserProfileService.saveMistake(uid, {
                ...m,
                source: req.body.topic ? `Lab: ${req.body.topic}` : 'Learning Lab'
            }));
            await Promise.all(mistakePromises);
            console.log(`[Lab] Saved ${req.body.mistakes.length} mistakes for ${uid}`);
        }

        // Update Micro-Skill Level & Practiced Skills
        if (req.body.topic && uid !== 'placeholder') {
            await UserProfileService.updateMicroSkillLevel(uid, 'english', req.body.topic, req.body.masteryScore || 0);
        }

        // Award XP & Quest Completion
        let questXP = 0;
        let practiceXP = 0;

        // 3. Factory Model Quest Completion (Phase 5)
        if (req.body.isFactoryQuest) {
            const ENGLISH_XP_MAPPING = { "3": 50, "4": 75, "5": 100, "7": 150 };
            const baseXP = ENGLISH_XP_MAPPING[String(req.body.level)] || 100;
            const factoryResult = await GamificationService.awardFactoryQuestCompletion(uid, req.body.taskId || questionIds[0], 'english', baseXP);
            if (factoryResult.success) {
                questXP = factoryResult.totalEarned || factoryResult.earned;
                console.log(`[Lab] Factory Quest Awarded: ${questXP} XP (Bonus: ${factoryResult.bonusAwarded})`);
            }
        } else if (req.body.isWeeklyQuest || req.body.topic === 'reading_weekly') {
            // 4. Weekly Quest Completion (Phase 6b)
            console.log(`[Lab] Attempting Weekly Quest Award for user: ${uid} (Topic: ${req.body.topic})`);
            const weeklyResult = await GamificationService.awardWeeklyQuestCompletion(uid);
            if (weeklyResult.success) {
                questXP = weeklyResult.earned;
                console.log(`[Lab] Weekly Quest Awarded: ${questXP} XP. WeekId: ${weeklyResult.weekId}`);
            } else {
                console.warn(`[Lab] Weekly Quest Award Failed: ${weeklyResult.error}`);
            }
        } else if (req.body.taskId) {
            // 1. Legacy Quest Completion (Roadmap Bonus)
            const questResult = await GamificationService.awardQuestCompletion(uid, req.body.taskId, 'english');
            if (questResult.success && questResult.fresh) {
                questXP = questResult.earned;
                console.log(`[Lab] Quest Bonus Awarded: ${questXP} XP`);
            }
        }

        // 2. Practice XP (Always awarded)
        if (xp) {
            // Determine Source Type for Multipliers
            // Default: 'practice_lab'
            // If personalised: 'personalised_recommendation'
            // If challenge: 'challenge'
            let sourceType = 'practice_lab';
            if (req.body.isPersonalised) sourceType = 'personalised_recommendation';
            if (req.body.isChallenge) sourceType = 'challenge';

            const displayName = UserProfileService.getSkillName(req.body.topic, 'english');

            const xpResult = await GamificationService.awardXP(uid, parseInt(xp), sourceType, {
                duration: req.body.duration || 0,
                expectedDuration: 600,
                title: req.body.title || `Completed Lab: ${displayName || 'Practice'}`, // Use specific title if sent
                subject: 'english',
                topic: displayName,
                score: req.body.masteryScore ? `${req.body.masteryScore}%` : undefined
            });
            practiceXP = xpResult.earned;
        }

        // Return the total XP earned in this session so frontend can show " +150 XP "
        res.json({ success: true, earnedTotal: questXP + practiceXP, questBonus: questXP, practiceXP, isFactoryQuest: req.body.isFactoryQuest });
        return;

        res.json({ success: true });
    } catch (e) {
        console.error("Lab Submit Error:", e);
        res.status(500).json({ error: "Failed to submit lab results" });
    }
});

// POST /api/lab/evaluate_batch
router.post('/evaluate_batch', async (req, res) => {
    const GenerativeAIService = require('../../services/GenerativeAIService');
    const TokenService = require('../../services/TokenService');
    const fs = require('fs');

    try {
        const { tasks, answers, uid, category } = req.body;
        const gradingRequests = tasks.map(t => ({
            id: t.id,
            type: t.type,
            question: t.question,
            answer: answers[t.id] || '',
            logic: t.answer_logic,
            keywords: t.expected_keywords,
            target_sentence: t.target_sentence
        }));

        const prompt = `You are an expert HKDSE English Examiner. Grade these student answers for a ${category || 'general'} proficiency lab. 
Tasks to Grade: ${JSON.stringify(gradingRequests)}

For each task:
1. Compare "answer" (student) against "logic" and "keywords".
2. If the student captures the core semantic meaning, mark "correct": true.
3. For MCQ, "correct" is true ONLY if the student's letter matches the correct option exactly.
4. Provide a "feedback" string:
   - If correct: Confirm why it's right and offer a tiny extension tip.
   - If incorrect: Explain the error clearly AND provide the correct answer/solution.
   
Return a SINGLE JSON OBJECT where keys are the task IDs. 
Format: { "id": { "correct": boolean, "feedback": "..." } }`;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: "ace-it-pro",
            generationConfig: { responseMimeType: "application/json" }
        });

        if (result.response && result.response.usageMetadata) {
            TokenService.logUsage(uid || 'system', 'lab_evaluate_batch', result.response.usageMetadata);
        }

        let responseText = result.response.text().trim();
        if (typeof fs !== 'undefined') {
            fs.appendFileSync('lab_debug.log', `\n--- EVAL PROMPT ---\n${prompt}\n--- EVAL RESPONSE ---\n${responseText}\n`);
        }

        if (responseText.includes('```json')) {
            responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/```[\w]*\n?/g, '').replace(/```\n?/g, '').trim();
        }

        let json = JSON.parse(responseText);

        // Robust Flattening
        if (Array.isArray(json)) {
            const flat = {};
            json.forEach(item => {
                const key = Object.keys(item)[0];
                if (key) flat[key] = item[key];
            });
            json = flat;
        }

        res.json(json);
    } catch (e) {
        console.error("Batch Evaluation Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// POST /api/lab/cheat (Admin only - for testing)
router.post('/cheat', async (req, res) => {
    const admin = require('firebase-admin');
    const UserProfileService = require('../../services/UserProfileService');

    try {
        const { tasks, level, uid, passage } = req.body;
        console.log(`[Cheat] Auth Check for uid: ${uid}`);

        let userEmail = null;
        const profile = await UserProfileService.getProfile(uid);
        userEmail = profile?.email;

        if (!userEmail && uid && uid !== 'placeholder') {
            try {
                const authUser = await admin.auth().getUser(uid);
                userEmail = authUser.email;
            } catch (authErr) {
                console.warn(`[Cheat] Auth lookup failed for ${uid}:`, authErr.message);
            }
        }

        if (userEmail?.toLowerCase() !== 'fungtam@gmail.com') {
            console.warn(`[Cheat] UNAUTHORIZED access by ${userEmail || 'unknown'} (UID: ${uid})`);
            return res.status(403).json({ error: "Unauthorized" });
        }

        const answers = await LabService.generateCheatAnswers(tasks, level, passage);
        res.json(answers);
    } catch (e) {
        console.error("Lab Cheat Error:", e);
        const isQuotaError = e.message?.includes('429') || e.message?.includes('Quota');
        res.status(isQuotaError ? 429 : 500).json({
            error: e.message || "Cheat failed",
            type: isQuotaError ? 'QUOTA_EXHAUSTED' : 'SERVER_ERROR'
        });
    }
});

// POST /api/lab/writing/cheat (Dev/Test only)
router.post('/writing/cheat', async (req, res) => {
    try {
        const LabService = require('../../services/LabService'); // Ensure service is available
        const { prompt, mode, level } = req.body;
        console.log(`[WritingCheat] Generating Level ${level} response for: ${mode}`);

        const result = await LabService.generateWritingCheat(prompt, mode, level);
        res.json(result);
    } catch (e) {
        console.error("Writing Cheat Error:", e);
        res.status(500).json({ error: "Cheat generation failed" });
    }
});

// POST /api/lab/tts (On-Demand Audio with Multi-Speaker Support)
router.post('/tts', async (req, res) => {
    try {
        const TTSService = require('../../services/TTSService');
        const { text, includeTimepoints, languageCode, gender, premium } = req.body;

        if (!text) return res.status(400).json({ error: "Missing text" });

        // PREMIUM/MULTIPODAL FLOW (Highly Stable)
        // Default to premium for English pedagogically critical lines
        const isEnglish = (languageCode || '').startsWith('en');
        if (premium || (isEnglish && text.length > 20)) {
            try {
                console.log(`[TTS] Using Premium Multimodal Generation for stability...`);
                // Note: gender mapping is now handled inside TTSService.generateMultimodalSpeech
                const audioBase64 = await TTSService.generateMultimodalSpeech(text, gender || 'FEMALE');
                return res.json({ audio: audioBase64, mode: 'premium' });
            } catch (premiumError) {
                console.warn(`[TTS] Premium generation failed, falling back to standard:`, premiumError.message);
                // Fall through to standard flow
            }
        }

        // Standard Flow
        if (includeTimepoints) {
            const data = await TTSService.generateSpeech(text, languageCode || 'en-GB', gender || 'FEMALE', 1.0, null, true);
            return res.json(data);
        }

        if (gender) {
            const audioBase64 = await TTSService.generateSpeech(text, languageCode || 'en-GB', gender);
            return res.json({ audio: audioBase64 });
        }

        const audioBase64 = await TTSService.generateMultiSpeakerSpeech(text, languageCode || 'en-GB', gender || 'FEMALE');
        res.json({ audio: audioBase64 });
    } catch (e) {
        console.error("TTS Endpoint Error [DEBUG]:", e);
        res.status(500).json({ error: "TTS generation failed", details: e.message });
    }
});

// POST /api/lab/evaluate_integrated
router.post('/evaluate_integrated', async (req, res) => {
    const { questId, studentNotes, studentDraft, targetLevel, uid } = req.body;
    console.log(`[LabRoute] Evaluating Integrated Simulation for Quest: ${questId}, User: ${uid}`);
    try {
        const evaluation = await LabService.evaluateIntegratedSimulation(questId, studentNotes, studentDraft, targetLevel);
        res.json(evaluation);
    } catch (e) {
        console.error("Integrated Evaluation API Error:", e);
        res.status(500).json({ error: e.message || "Evaluation failed" });
    }
});

// POST /api/lab/evaluate_sprint
router.post('/evaluate_sprint', async (req, res) => {
    const { questId, answers, uid } = req.body;
    console.log(`[LabRoute] Evaluating Data Sprint for Quest: ${questId}, User: ${uid}`);
    try {
        const evaluation = await LabService.evaluateDataSprint(questId, answers);
        res.json(evaluation);
    } catch (e) {
        console.error("Sprint Evaluation API Error:", e);
        res.status(500).json({ error: e.message || "Evaluation failed" });
    }
});

module.exports = router;
