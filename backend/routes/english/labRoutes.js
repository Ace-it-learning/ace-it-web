const express = require('express');
const router = express.Router();
const LabService = require('../../services/LabService');
const GamificationService = require('../../services/GamificationService');
const fs = require('fs');
const path = require('path');
const UserProfileService = require('../../services/UserProfileService');

const normalizeTaskType = (task) => String(task?.type || '').trim().toUpperCase();

const normalizeIndexList = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((v) => Number(v)).filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
};

const normalizeBucketMap = (map, bucketNames) => {
    const names = bucketNames.length ? bucketNames : Object.keys(map || {});
    const out = {};
    names.forEach((name) => {
        out[name] = normalizeIndexList((map || {})[name]);
    });
    return out;
};

const bucketMapsEqual = (userMap, correctMap, bucketNames) => {
    const normUser = normalizeBucketMap(userMap, bucketNames);
    const normCorrect = normalizeBucketMap(correctMap, bucketNames);
    return bucketNames.every((name) => {
        const u = normUser[name] || [];
        const c = normCorrect[name] || [];
        return u.length === c.length && u.every((v, i) => v === c[i]);
    });
};

const resolveOrderingString = (task, raw) => {
    if (raw === null || raw === undefined) return '';
    if (Array.isArray(raw)) {
        if (raw.every((v) => typeof v === 'number' || /^\d+$/.test(String(v)))) {
            return raw.map((v) => Number(v)).join('-');
        }
        const options = Array.isArray(task?.options) ? task.options : [];
        const indices = raw.map((v) => {
            const idx = options.findIndex((opt) => String(opt).trim() === String(v).trim());
            return idx >= 0 ? idx : Number(v);
        });
        return indices.filter((n) => !Number.isNaN(n)).join('-');
    }
    return String(raw).trim();
};

const gradeMcqTask = (task, userAnswer) => {
    const correctAnswer = task.correct_answer ?? task.answer;
    if (!correctAnswer || typeof correctAnswer === 'object') return null;

    const user = String(userAnswer ?? '').trim().toUpperCase();
    const correct = String(correctAnswer).trim().toUpperCase();
    const isCorrect = user === correct;

    return {
        status: isCorrect ? 'correct' : 'incorrect',
        correct: isCorrect,
        feedback: isCorrect
            ? `The selected answer ${user} matches the correct option.`
            : `The selected answer ${user || '(none)'} is incorrect. The correct answer is ${correct}.`,
        hkeaa_level: isCorrect ? 5 : 1
    };
};

const gradeOrderingTask = (task, userAnswer) => {
    const correctRaw = task.answer_order || task.correct_order || task.answer || task.correct_answer;
    const correctStr = resolveOrderingString(task, correctRaw);
    const userStr = resolveOrderingString(task, userAnswer);
    const isCorrect = Boolean(correctStr) && userStr === correctStr;

    return {
        status: isCorrect ? 'correct' : 'incorrect',
        correct: isCorrect,
        feedback: isCorrect
            ? 'Correct sequence.'
            : `Incorrect order. The correct sequence is: ${correctStr || 'see model answer'}.`,
        hkeaa_level: isCorrect ? 5 : 1
    };
};

const gradeCategorizationTask = (task, userAnswer) => {
    const correctMap = task.answer_map || task.bucket_map || task.correct_answer || task.answer;
    if (!correctMap || typeof correctMap !== 'object' || Array.isArray(correctMap)) {
        return {
            status: 'incorrect',
            correct: false,
            feedback: 'This categorization task is missing a model answer key.',
            hkeaa_level: 1
        };
    }

    const bucketNames = Array.isArray(task.buckets) && task.buckets.length
        ? task.buckets
        : [...new Set([...Object.keys(correctMap), ...Object.keys(userAnswer || {})])];

    const userMap = (userAnswer && typeof userAnswer === 'object' && !Array.isArray(userAnswer))
        ? userAnswer
        : {};

    const optionCount = Array.isArray(task.options) ? task.options.length : 0;
    const assigned = new Set();
    bucketNames.forEach((b) => (userMap[b] || []).forEach((i) => assigned.add(Number(i))));

    const allAssigned = optionCount === 0 || assigned.size === optionCount;
    const isCorrect = allAssigned && bucketMapsEqual(userMap, correctMap, bucketNames);

    let feedback;
    if (isCorrect) {
        feedback = 'Correct! All items are sorted into the right categories.';
    } else if (!allAssigned) {
        feedback = 'Incorrect. Assign every statement to a category before submitting.';
    } else {
        const wrongBuckets = bucketNames.filter((b) => {
            const u = normalizeIndexList(userMap[b]);
            const c = normalizeIndexList(correctMap[b]);
            return u.length !== c.length || u.some((v, i) => v !== c[i]);
        });
        feedback = wrongBuckets.length
            ? `Incorrect. Review items in: ${wrongBuckets.join(', ')}.`
            : 'Incorrect categorization. Compare your sorting with the model answer.';
    }

    return {
        status: isCorrect ? 'correct' : 'incorrect',
        correct: isCorrect,
        feedback,
        hkeaa_level: isCorrect ? 5 : 1
    };
};

// GET /api/lab/weekly-theme
router.get('/weekly-theme', async (req, res) => {
    try {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const weekNum = Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
        const weekKey = `${d.getFullYear()}_${weekNum}`;

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
    console.log(`[Lab] FULL BODY:`, JSON.stringify(req.body));

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
    const { results, xp } = req.body;
    const uid = req.body.uid || req.uid || req.query?.uid || 'guest';
    if (!results) return res.status(400).json({ error: "Missing data" });
    if (!uid || uid === 'guest') return res.status(401).json({ error: "Missing resolved uid" });

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
            await UserProfileService.saveProgressSnapshot(uid, 'english');
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
                        passage: req.body.passage || null,
                        questions: req.body.questions || null,
                        feedback: req.body.feedback || { summary: "Great practice session." },
                        timestamp: new Date()
                    });
                } catch (e) { console.warn("Result save failed", e.message); }
            }

            // Skip timeline for Reading quests that already created one via evaluate_batch
            // to avoid duplicate entries in /achievements
            const skipTimeline = req.body.skipTimeline === true;
            
            const xpResult = await GamificationService.awardXP(uid, rewardAmount, sourceType, {
                duration: req.body.duration || 0,
                expectedDuration: 600,
                title: questName,
                subject: 'english',
                topic: displayName,
                score: req.body.masteryScore ? `${req.body.masteryScore}%` : undefined,
                paper: paper,
                questName: questName,
                resultId: resultId,
                skipTimeline: skipTimeline
            });

            // Check Weekly Focus bonus (Mon-Sat quests)
            const hkNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
            const hkDay = hkNow.getDay();
            const daysSinceMonday = hkDay === 0 ? 6 : hkDay - 1;
            const mondayDate = new Date(hkNow);
            mondayDate.setDate(hkNow.getDate() - daysSinceMonday);
            const weekKey = mondayDate.getFullYear() + '-' + String(mondayDate.getMonth() + 1).padStart(2, '0') + '-' + String(mondayDate.getDate()).padStart(2, '0');
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayOfWeek = dayNames[hkDay];
            const weeklyFocusResult = await GamificationService.awardWeeklyFocusBonus(uid, weekKey, dayOfWeek);
            if (weeklyFocusResult.bonusAwarded) {
                console.log(`[LabRoutes] Weekly Focus bonus awarded: +${weeklyFocusResult.earned} XP to ${uid}`);
            }

            return res.json({ 
                success: true, 
                earnedTotal: questXP + xpResult.earned + (weeklyFocusResult.earned || 0), 
                questBonus: questXP, 
                practiceXP: xpResult.earned, 
                weeklyFocusBonus: weeklyFocusResult.earned || 0,
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
        let { tasks, answers, uid, category } = req.body;
        const taskList = Array.isArray(tasks) ? tasks : [];
        if (taskList.length === 0) {
            return res.json({});
        }
        tasks = taskList;

        // --- PROGRAMMATIC GRADING (MCQ, ORDERING, CATEGORIZATION) ---
        const deterministicResults = {};
        const openEndedTasks = [];

        tasks.forEach((t) => {
            const taskType = normalizeTaskType(t);
            const userAnswer = answers[t.id];

            if (taskType === 'MCQ') {
                const graded = gradeMcqTask(t, userAnswer);
                if (graded) {
                    deterministicResults[t.id] = graded;
                    return;
                }
            }

            if (taskType === 'ORDERING') {
                deterministicResults[t.id] = gradeOrderingTask(t, userAnswer);
                return;
            }

            if (taskType === 'CATEGORIZATION') {
                deterministicResults[t.id] = gradeCategorizationTask(t, userAnswer);
                return;
            }

            openEndedTasks.push(t);
        });

        // --- AI GRADING FOR OPEN-ENDED QUESTIONS ONLY ---
        let aiResults = {};
        if (openEndedTasks.length > 0) {
            const gradingRequests = openEndedTasks.map(t => ({
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

### 📊 HKEAA READING LEVEL DESCRIPTORS (Official):
**Level 5**: Complex texts, inferences, figurative language, explicit+implied info.
**Level 4**: Fairly complex texts, obvious inferences, simple figurative language.
**Level 3**: Straightforward texts, literal language, explicit views.
**Level 2**: Simple texts, clearly signalled main ideas, literal only.
**Level 1**: Predictable factual info, linear sequence only.

### 🎯 MARKING RULES:
1. **SEMANTIC GRADING**: Grade on SEMANTIC MEANING, not literal keyword matching. Different words expressing the same logical concept = correct.
2. **Full Marks**: Captures ALL required criteria. Award "status": "correct", "correct": true, "hkeaa_level": 5.
3. **Partial Marks**: Captures main idea but misses nuance. Award "status": "partial", "correct": false, "hkeaa_level": 3.
4. **Zero Marks**: Fundamentally misunderstands. Award "status": "incorrect", "correct": false, "hkeaa_level": 1.
5. **Feedback**: Keep feedback concise (1 sentence). State if correct/partial/incorrect and why.

Return a SINGLE JSON OBJECT where keys are task IDs:
{ "id": { "status": "correct"|"partial"|"incorrect", "correct": boolean, "feedback": "...", "hkeaa_level": 1-5 } }`;

            const result = await GenerativeAIService.generateContent(prompt, {
                model: "ace-it-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    maxOutputTokens: 4096
                }
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

            aiResults = JSON.parse(responseText);

            // Robust Flattening
            if (Array.isArray(aiResults)) {
                const flat = {};
                aiResults.forEach(item => {
                    const key = Object.keys(item)[0];
                    if (key) flat[key] = item[key];
                });
                aiResults = flat;
            }
        }

        // Merge deterministic and AI-graded results
        const json = { ...deterministicResults, ...aiResults };

        // --- PERSIST MICRO-SKILL MASTERY & QUEST RESULT ---
        const resolvedUid = uid || req.body?.uid || req.query?.uid || null;
        if (resolvedUid && resolvedUid !== 'guest' && resolvedUid !== 'placeholder') {
            try {
                const UserProfileService = require('../../services/UserProfileService');
                const GamificationService = require('../../services/GamificationService');

                const resultsMap = json;
                // Calculate overall percentage from results
                const resultEntries = Object.values(resultsMap).filter(v => v && typeof v === 'object');
                const correctCount = resultEntries.filter(r => r.correct === true || r.status === 'correct').length;
                const overallPercentage = resultEntries.length > 0 ? Math.round((correctCount / resultEntries.length) * 100) : 0;
                const overallHkeaaLevel = resultEntries.length > 0
                    ? Math.round(resultEntries.reduce((sum, r) => sum + (r.hkeaa_level || 3), 0) / resultEntries.length)
                    : 3;

                // Calculate per-skill accuracy from task skills tags
                const skillAccuracy = {};
                const skillCounts = {};
                tasks.forEach(t => {
                    const taskResult = resultsMap[t.id];
                    const skillId = t.skills?.[0] || t.micro_skill || t.skill || category || 'reading_literalComprehension';
                    if (!skillAccuracy[skillId]) {
                        skillAccuracy[skillId] = 0;
                        skillCounts[skillId] = 0;
                    }
                    skillCounts[skillId]++;
                    if (taskResult && (taskResult.correct === true || taskResult.status === 'correct')) {
                        skillAccuracy[skillId]++;
                    }
                });

                // Update each micro-skill with its accuracy
                const skillUpdatePromises = Object.entries(skillAccuracy).map(([skillId, correctCount]) => {
                    const total = skillCounts[skillId] || 1;
                    const masteryScore = Math.round((correctCount / total) * 100);
                    return UserProfileService.updateMicroSkillLevel(resolvedUid, 'english', skillId, masteryScore, {
                        type: 'Quest',
                        difficulty: req.body.level || 4,
                        totalQuestions: total
                    });
                });
                await Promise.all(skillUpdatePromises);
                await UserProfileService.saveProgressSnapshot(resolvedUid, 'english');
                console.log(`[Lab evaluate_batch] Updated ${skillUpdatePromises.length} micro-skills for ${resolvedUid}`);

                // Calculate the XP that was awarded via /lab/submit for consistency in review
                const baseXP = GamificationService.getTieredXP(req.body.level || '4');
                const xpAmount = Math.round((overallPercentage / 100) * baseXP);

                // Build question data for review page (passage + questions + user answers + correct answers)
                const questionData = tasks.map(t => ({
                    id: t.id,
                    question: t.question,
                    type: t.type,
                    options: t.options || null,
                    target_sentence: t.target_sentence || null,
                    expected_keywords: t.expected_keywords || null,
                    answer_logic: t.answer_logic || null,
                    userAnswer: answers[t.id] || '',
                    correctAnswer: t.correct_answer || t.answer || null
                }));

                // Save quest result for historical review (with actual XP amount)
                const resultId = await UserProfileService.saveQuestResult(resolvedUid, {
                    module: 'Reading',
                    questName: req.body.questName || `Reading Lab: ${category || 'General'}`,
                    score: overallPercentage,
                    hkeaaLevel: overallHkeaaLevel,
                    xpAwarded: xpAmount,
                    content: resultsMap,
                    passage: req.body.passage || null,
                    questions: questionData,
                    feedback: {
                        summary: `HKDSE Level ${overallHkeaaLevel} performance (${correctCount}/${resultEntries.length} correct)`,
                        strength_areas: [],
                        weakness_areas: []
                    },
                    subject: 'english',
                    paper: 'Reading',
                    timestamp: new Date()
                });

                // Award XP and create timeline event so it appears in /achievements
                // alwaysRecordTimeline ensures the quest shows in /achievements even if daily XP cap is reached
                await GamificationService.awardXP(resolvedUid, xpAmount, 'reading_quest', {
                    title: req.body.questName || `Reading Lab: ${category || 'General'}`,
                    subject: 'english',
                    paper: 'Reading',
                    score: `${overallPercentage}%`,
                    questName: req.body.questName || `Reading Lab: ${category || 'General'}`,
                    resultId: resultId,
                    alwaysRecordTimeline: true
                });

                // Check Weekly Focus bonus (Mon-Sat quests)
                const hkNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
                const hkDay = hkNow.getDay();
                const daysSinceMonday = hkDay === 0 ? 6 : hkDay - 1;
                const mondayDate = new Date(hkNow);
                mondayDate.setDate(hkNow.getDate() - daysSinceMonday);
                const weekKey = mondayDate.getFullYear() + '-' + String(mondayDate.getMonth() + 1).padStart(2, '0') + '-' + String(mondayDate.getDate()).padStart(2, '0');
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const dayOfWeek = dayNames[hkDay];
                const weeklyFocusResult = await GamificationService.awardWeeklyFocusBonus(resolvedUid, weekKey, dayOfWeek);
                if (weeklyFocusResult.bonusAwarded) {
                    console.log(`[LabRoutes] Weekly Focus bonus awarded: +${weeklyFocusResult.earned} XP to ${resolvedUid}`);
                }
            } catch (persistErr) {
                console.warn(`[Lab evaluate_batch] Persistence failed for ${resolvedUid}:`, persistErr.message);
            }
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
        
        // Use tiered XP based on difficulty level
        const partBBaseXP = GamificationService.getTieredXP(targetLevel || '4');
        let xpResult = null;
        let resultId = null;
        if (uid && uid !== 'placeholder') {
            xpResult = await GamificationService.awardXP(uid, partBBaseXP, 'listening', {
                title: `Listening Part B: ${questId}`,
                subject: 'english',
                paper: 'Listening',
                score: `${evaluation.overallScore}%`
            });

            // Persist result for historical review
            try {
                resultId = await UserProfileService.saveQuestResult(uid, {
                    module: 'Listening',
                    questName: `Listening Part B: ${questId}`,
                    score: evaluation.overallScore || 0,
                    xpAwarded: partBBaseXP,
                    content: { [questId]: { correct: (evaluation.overallScore || 0) >= 50, feedback: evaluation.feedback || 'Completed' } },
                    feedback: {
                        summary: evaluation.feedback || `Part B completed with score ${evaluation.overallScore}%`,
                        strength_areas: [],
                        weakness_areas: []
                    },
                    subject: 'english',
                    paper: 'Listening',
                    timestamp: new Date()
                });
            } catch (e) {
                console.warn('[LabRoutes] Failed to save Part B result:', e.message);
            }

            // Check Weekly Focus bonus (Mon-Sat quests)
            const hkNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
            const hkDay = hkNow.getDay();
            const daysSinceMonday = hkDay === 0 ? 6 : hkDay - 1;
            const mondayDate = new Date(hkNow);
            mondayDate.setDate(hkNow.getDate() - daysSinceMonday);
            const weekKey = mondayDate.getFullYear() + '-' + String(mondayDate.getMonth() + 1).padStart(2, '0') + '-' + String(mondayDate.getDate()).padStart(2, '0');
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayOfWeek = dayNames[hkDay];
            const weeklyFocusResult = await GamificationService.awardWeeklyFocusBonus(uid, weekKey, dayOfWeek);
            if (weeklyFocusResult.bonusAwarded) {
                console.log(`[LabRoutes] Weekly Focus bonus awarded: +${weeklyFocusResult.earned} XP to ${uid}`);
            }
            if (xpResult && weeklyFocusResult.earned) {
                xpResult.earned = (xpResult.earned || 0) + weeklyFocusResult.earned;
            }
        }
        
        // Update Mastery
        if (uid && uid !== 'placeholder') {
            const masteryScore = evaluation.overallScore || 0;
            await UserProfileService.updateMicroSkillLevel(uid, 'english', 'Listening Part B', masteryScore, {
                type: 'Quest',
                difficulty: targetLevel || 4
            });
            await UserProfileService.saveProgressSnapshot(uid, 'english');
        }
        
        res.json({ ...evaluation, xpResult, resultId });
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
        
        // Use tiered XP based on difficulty level
        const partALevel = req.body.level || '4';
        const partABaseXP = GamificationService.getTieredXP(partALevel);
        let xpResult = null;
        let resultId = null;
        if (uid && uid !== 'placeholder') {
            xpResult = await GamificationService.awardXP(uid, partABaseXP, 'listening', {
                title: `Listening Part A: ${questId}`,
                subject: 'english',
                paper: 'Listening',
                score: `${evaluation.score}%`
            });

            // Persist result for historical review
            try {
                resultId = await UserProfileService.saveQuestResult(uid, {
                    module: 'Listening',
                    questName: `Listening Part A: ${questId}`,
                    score: evaluation.score || 0,
                    xpAwarded: partABaseXP,
                    content: evaluation.details || { [questId]: { correct: (evaluation.score || 0) >= 50, feedback: 'Completed' } },
                    feedback: {
                        summary: `Part A Data Sprint completed with score ${evaluation.score}%`,
                        strength_areas: [],
                        weakness_areas: []
                    },
                    subject: 'english',
                    paper: 'Listening',
                    timestamp: new Date()
                });
            } catch (e) {
                console.warn('[LabRoutes] Failed to save Part A result:', e.message);
            }
        }
        
        // Update Mastery
        if (uid && uid !== 'placeholder') {
            const masteryScore = evaluation.score || 0;
            await UserProfileService.updateMicroSkillLevel(uid, 'english', 'Listening Part A', masteryScore, {
                type: 'Quest',
                difficulty: parseInt(partALevel) || 4
            });
            await UserProfileService.saveProgressSnapshot(uid, 'english');
        }
        
        res.json({ ...evaluation, xpResult, resultId });
    } catch (e) {
        console.error("Sprint Evaluation API Error:", e);
        res.status(500).json({ error: e.message || "Evaluation failed" });
    }
});

module.exports = router;
