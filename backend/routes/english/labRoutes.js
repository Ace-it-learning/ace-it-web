const express = require('express');
const router = express.Router();
const LabService = require('../../services/LabService');
const GamificationService = require('../../services/GamificationService');
const fs = require('fs');
const path = require('path');
const UserProfileService = require('../../services/UserProfileService');

// GET /api/lab/weekly-theme
router.get('/weekly-theme', async (req, res) => {
    try {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const weekNum = Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
        const weekKey = `2026_${weekNum}`;

        const metaPath = path.join(__dirname, '..', '..', 'data', 'weekly_quests', 'weekly_meta.json');
        if (fs.existsSync(metaPath)) {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            if (meta[weekKey]) {
                return res.json(meta[weekKey]);
            }
        }
        res.status(404).json({ error: "Weekly theme not found" });
    } catch (e) {
        console.error("Weekly Theme Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch weekly theme" });
    }
});

// GET /api/lab/weekly/:paper
router.get('/weekly/:paper', async (req, res) => {
    const { paper } = req.params;
    try {
        const quest = await LabService.resolveWeeklyQuest(paper);
        if (!quest) return res.status(404).json({ error: "Weekly quest not found for " + paper });
        res.json(quest);
    } catch (e) {
        console.error("Weekly Quest Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch weekly quest" });
    }
});

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

        // Determine Base XP based on standardized rules
        let baseXP = 150; // Default flat reward

        // 1. Grammar Lab (50 XP flat)
        if (req.body.isGrammarLab || (req.body.topic && req.body.topic.toLowerCase().includes('grammar'))) {
            baseXP = 50;
        } else {
            // Scaled Rewards for Reading
            const isReading = req.body.paper === 'Reading' || (req.body.topic || '').includes('reading');
            if (isReading) {
                baseXP = GamificationService.getTieredXP(req.body.level || '4');
            }
        }

        // 3. Factory Model Quest Completion
        if (req.body.isFactoryQuest) {
            const factoryResult = await GamificationService.awardFactoryQuestCompletion(uid, req.body.taskId || questionIds[0], 'english', baseXP);
            if (factoryResult.success) {
                questXP = factoryResult.totalEarned || factoryResult.earned;
            }
        } else if (req.body.isWeeklyQuest || req.body.topic === 'reading_weekly') {
            // 4. Weekly Quest Completion
            const weeklyResult = await GamificationService.awardWeeklyQuestCompletion(uid);
            if (weeklyResult.success) {
                questXP = weeklyResult.earned;
            }
        } else if (req.body.taskId) {
            // Legacy/Roadmap award
            const questResult = await GamificationService.awardQuestCompletion(uid, req.body.taskId, 'english');
            if (questResult.success && questResult.fresh) {
                questXP = questResult.earned;
            }
        }

        // 2. Practice XP (Always awarded)
        if (xp || baseXP) {
            let sourceType = 'practice_lab';
            if (req.body.isPersonalised) sourceType = 'personalised_recommendation';
            if (req.body.isChallenge) sourceType = 'challenge';

            const displayName = UserProfileService.getSkillName(req.body.topic, 'english');
            const questName = req.body.title || `Lab: ${displayName || 'Practice'}`;
            const paper = req.body.paper || ((req.body.topic || '').includes('listening') ? 'Listening' : 'Reading');

            // Listening logic: If it's listening, XP is awarded during evaluation steps (80/120)
            // But if called via /submit (legacy), we award the flat 150.
            const rewardAmount = (xp !== undefined && xp !== null) ? parseInt(xp) : baseXP;

            // PERSIST RESULT
            let resultId = null;
            if (uid !== 'placeholder') {
                try {
                    resultId = await UserProfileService.saveQuestResult(uid, {
                        module: paper,
                        questName: questName,
                        score: req.body.masteryScore || 0,
                        xpAwarded: rewardAmount,
                        content: req.body.results,
                        feedback: req.body.feedback || { summary: "Great practice session." },
                        timestamp: new Date()
                    });
                } catch (e) { console.warn("Result save failed", e.message); }
            }

            const xpResult = await GamificationService.awardXP(uid, rewardAmount, sourceType, {
                duration: req.body.duration || 0,
                expectedDuration: 600,
                title: questName,
                subject: 'english',
                topic: displayName,
                score: req.body.masteryScore ? `${req.body.masteryScore}%` : undefined,
                paper: paper,
                questName: questName,
                resultId: resultId
            });

            return res.json({ 
                success: true, 
                earnedTotal: questXP + xpResult.earned, 
                questBonus: questXP, 
                practiceXP: xpResult.earned, 
                breakdown: xpResult.breakdown,
                isFactoryQuest: req.body.isFactoryQuest 
            });
        }

        res.json({ success: true, earnedTotal: 0 });
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

        const prompt = `You are a strict but fair HKDSE Senior English Examiner. Grade these student answers for a ${category || 'general'} proficiency lab. 
Tasks to Grade: ${JSON.stringify(gradingRequests)}

For each task:
1. MANDATORY SEMANTIC GRADING: For open-ended questions (Short Answer, TFNG justifications), grade based on SEMANTIC MEANING, not literal keyword matching. If the student uses different words to express the identical logical concept found in the 'logic' or 'keywords', they must be awarded the mark.
2. If the student's answer captures the core semantic meaning completely, mark "status": "correct", and "correct": true.
3. If the answer is partially correct (captures some but not all of the required meaning), mark "status": "partial", and "correct": false.
4. If the answer is wrong, irrelevant, or misses the core meaning, mark "status": "incorrect", and "correct": false.
5. For MCQ tasks, "status" is "correct" ONLY if the student's letter matches the correct option exactly.
6. Provide a "feedback" string:
   - If correct: Confirm why it's right.
   - If partial: Explain what was correct and what crucial detail was missing.
   - If incorrect: Explain the error clearly AND provide the correct solution.
   
Return a SINGLE JSON OBJECT where keys are the task IDs. 
Format: { "id": { "status": "correct"|"partial"|"incorrect", "correct": boolean, "feedback": "..." } }`;

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

        // Use the unified TTSService which handles logic branching (Standard vs Multimodal) internally.
        // This avoids redundant timeouts in the route layer.

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

// POST /api/lab/evaluate_integrated (Listening Part B)
router.post('/evaluate_integrated', async (req, res) => {
    const { questId, studentNotes, studentDraft, targetLevel, uid } = req.body;
    console.log(`[LabRoute] Evaluating Integrated Simulation (Part B) for Quest: ${questId}, User: ${uid}`);
    try {
        const evaluation = await LabService.evaluateIntegratedSimulation(questId, studentNotes, studentDraft, targetLevel);
        
        // Award 120 XP for Part B completion
        let xpResult = null;
        if (uid && uid !== 'placeholder') {
            xpResult = await GamificationService.awardXP(uid, 120, 'listening', {
                title: `Listening Part B: ${questId}`,
                subject: 'english',
                paper: 'Listening',
                score: `${evaluation.overallScore}%`
            });
        }
        
        // Update Mastery
        if (uid && uid !== 'placeholder') {
            const masteryScore = evaluation.overallScore || 0;
            await UserProfileService.updateMicroSkillLevel(uid, 'english', 'Listening Part B', masteryScore, {
                type: 'Quest',
                difficulty: targetLevel || 4
            });
        }
        
        res.json({ ...evaluation, xpResult });
    } catch (e) {
        console.error("Integrated Evaluation API Error:", e);
        res.status(500).json({ error: e.message || "Evaluation failed" });
    }
});

// POST /api/lab/evaluate_sprint (Listening Part A)
router.post('/evaluate_sprint', async (req, res) => {
    const { questId, answers, uid } = req.body;
    console.log(`[LabRoute] Evaluating Data Sprint (Part A) for Quest: ${questId}, User: ${uid}`);
    try {
        const evaluation = await LabService.evaluateDataSprint(questId, answers);
        
        // Award 80 XP for Part A completion
        let xpResult = null;
        if (uid && uid !== 'placeholder') {
            xpResult = await GamificationService.awardXP(uid, 80, 'listening', {
                title: `Listening Part A: ${questId}`,
                subject: 'english',
                paper: 'Listening',
                score: `${evaluation.score}%`
            });
        }
        
        // Update Mastery
        if (uid && uid !== 'placeholder') {
            const masteryScore = evaluation.score || 0;
            await UserProfileService.updateMicroSkillLevel(uid, 'english', 'Listening Part A', masteryScore, {
                type: 'Quest',
                difficulty: 4 // Part A is generally standard difficulty
            });
        }
        
        res.json({ ...evaluation, xpResult });
    } catch (e) {
        console.error("Sprint Evaluation API Error:", e);
        res.status(500).json({ error: e.message || "Evaluation failed" });
    }
});

module.exports = router;
