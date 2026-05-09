const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Services
const GenerativeAIService = require('../services/GenerativeAIService');
const TokenService = require('../services/TokenService');
const UserProfileService = require('../services/UserProfileService');
const GamificationService = require('../services/GamificationService');
const RoadmapService = require('../services/RoadmapService');
const CosmosStore = require('../services/CosmosStore');

// Prompts & Config
const writingGradingAgent = require('../prompts/writingGradingAgent');
const writingCheatAgent = require('../prompts/writingCheatAgent');
const listeningGradingAgent = require('../prompts/listeningGradingAgent');
const listeningCheatAgent = require('../prompts/listeningCheatAgent');
const speakingGradingAgent = require('../prompts/speakingGradingAgent');
const speakingAgent = require('../prompts/speakingAgent');
const { generateSpeakingMock } = require('../speakingMockGenerator');
const { generateListeningMock } = require('../listeningMockGenerator');

// Constants
// Constants
const TIER_1_MODEL = "gemini-flash-latest";
const TIER_2_MODEL = "gemini-flash-latest";
const TIER_PRO_MODEL = "gemini-pro-latest";

/**
 * Common Mock Exam Endpoints
 */

// List Reading Mocks
router.get('/reading/list', (req, res) => {
    try {
        const dir = path.join(__dirname, '..', 'generated_mocks', 'reading');
        if (!fs.existsSync(dir)) return res.json([]);
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        const exams = files.map(f => {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
                return {
                    id: f.replace('.json', ''),
                    title: data.title || f,
                    created_at: data.created_at || new Date().toISOString()
                };
            } catch (err) { return null; }
        }).filter(e => e !== null);
        res.json(exams);
    } catch (e) { res.json([]); }
});

// Submit Exam (Generic)
router.post('/submit', async (req, res) => {
    const { uid, examId, type, answers } = req.body;

    if (!uid || !examId) return res.status(400).json({ error: "Missing uid or examId" });

    try {
        console.log(`[Exam] Submission received for ${type} exam ${examId}`);
        const attempt = await CosmosStore.addExamAttempt(uid, {
            examId,
            type,
            answers,
            status: 'submitted'
        });

        res.json({ success: true, attemptId: attempt.id });
    } catch (e) {
        console.error("Exam submission failed:", e);
        res.status(500).json({ error: "Submission failed" });
    }
});

// --- READING MOCK EXAM ENDPOINTS ---
router.get('/reading/exams', (req, res) => {
    try {
        const dir = path.join(__dirname, '..', 'generated_mocks', 'reading');
        if (!fs.existsSync(dir)) return res.json([]);

        const files = fs.readdirSync(dir).filter(f => f.endsWith('_FullMock.json'));
        const exams = files.map(f => {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
                const meta = data.meta || {};
                return {
                    id: f.replace('.json', ''),
                    title: (meta.topic || data.topic || f.replace('_FullMock.json', '')) + " (Reading)",
                    topic: meta.topic || data.topic || "Reading Mock",
                    created_at: meta.generated_at || new Date().toISOString()
                };
            } catch (err) { return null; }
        }).filter(e => e !== null)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(exams);
    } catch (e) { res.json([]); }
});

router.get('/reading/exam/:id', (req, res) => {
    try {
        const filename = `${req.params.id}.json`;
        const filepath = path.join(__dirname, '..', 'generated_mocks', 'reading', filename);
        if (!fs.existsSync(filepath)) return res.status(404).json({ error: "Exam not found" });
        res.json(JSON.parse(fs.readFileSync(filepath, 'utf8')));
    } catch (error) { res.status(500).json({ error: "Read failed" }); }
});

// --- WRITING MOCK EXAM ENDPOINTS ---
router.get('/writing/exams', (req, res) => {
    try {
        const dir = path.join(__dirname, '..', 'generated_mocks', 'writing');
        if (!fs.existsSync(dir)) return res.json([]);
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        const exams = files.map(filename => {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(dir, filename), 'utf8'));
                const meta = content.meta || {};
                return {
                    id: filename.replace('.json', ''),
                    title: meta.title || content.title || filename,
                    topic: meta.topic || content.topic || "Writing Paper",
                    generated_at: meta.generated_at || content.created_at || new Date().toISOString(),
                    type: 'writing'
                };
            } catch (err) { return null; }
        }).filter(e => e !== null).sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));
        res.json(exams);
    } catch (error) { res.status(500).json({ error: "List failed" }); }
});

router.get('/writing/exam/:id', (req, res) => {
    try {
        const filepath = path.join(__dirname, '..', 'generated_mocks', 'writing', `${req.params.id}.json`);
        if (!fs.existsSync(filepath)) return res.status(404).json({ error: "Not found" });
        res.json(JSON.parse(fs.readFileSync(filepath, 'utf8')));
    } catch (error) { res.status(500).json({ error: "Read failed" }); }
});

router.post('/writing/grade', async (req, res) => {
    try {
        const { question, requirements, answer, uid } = req.body;
        const persona = await UserProfileService.getPersona(uid, 'english');
        const prompt = writingGradingAgent
            .replace('{QUESTION_TEXT}', question || "General writing task")
            .replace('{REQUIREMENTS}', Array.isArray(requirements) ? requirements.join(', ') : (requirements || "Standard requirements"))
            .replace('{STUDENT_ANSWER}', answer)
            .replace(/{{agentName}}/g, persona.name);

        const result = await GenerativeAIService.generateContent(prompt, {
            model: TIER_2_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });

        if (result.response && result.response.usageMetadata) {
            TokenService.logUsage(uid || 'system', 'writing_grade', result.response.usageMetadata);
        }

        const jsonResponse = JSON.parse(result.response.text());
        let xpGranted = 0;
        if (uid) {
            try {
                await UserProfileService.awardXP(uid, 150, "Writing Mock Part");
                xpGranted = 150;
            } catch (err) { console.error("XP Award Failed:", err); }
        }
        res.json({ ...jsonResponse, xpEarned: xpGranted });
    } catch (error) { res.status(500).json({ error: "Grading failed" }); }
});

router.post('/writing/cheat', async (req, res) => {
    try {
        const { question, situation, requirements, level, uid } = req.body;
        const prompt = writingCheatAgent
            .replace('{QUESTION_TEXT}', question || "General Writing Task")
            .replace('{SITUATION}', situation || "N/A")
            .replace('{REQUIREMENTS}', Array.isArray(requirements) ? requirements.join('\n- ') : (requirements || "N/A"))
            .replace(/{TARGET_LEVEL}/g, level);

        const result = await GenerativeAIService.generateContent(prompt, {
            model: TIER_1_MODEL,
            generationConfig: { responseMimeType: "text/plain" }
        });

        if (result.response && result.response.usageMetadata) {
            TokenService.logUsage(uid || 'system', 'writing_cheat', result.response.usageMetadata);
        }

        const text = result.response.text().trim().replace(/```[\s\S]*?\n/g, '').replace(/```/g, '').trim();
        res.json({ text });
    } catch (error) { res.status(500).json({ error: "Cheat failed" }); }
});

// --- LISTENING MOCK ENDPOINTS ---
router.post('/listening/generate', async (req, res) => {
    try {
        const { topic } = req.body;
        const result = await generateListeningMock(topic || "General Theme");
        res.json(result);
    } catch (error) { res.status(500).json({ error: "Gen failed" }); }
});

router.get('/listening/exams', (req, res) => {
    const dir = path.join(__dirname, '..', 'generated_mocks', 'listening');
    if (!fs.existsSync(dir)) return res.json([]);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const exams = files.map(f => {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
            const metadata = data.metadata || data.meta || {};
            return {
                id: f.replace('.json', ''),
                title: metadata.title || metadata.description || f.replace('.json', '').replace(/_/g, ' '),
                date: metadata.generated_at || data.generated_at || new Date().toISOString(),
                tags: ["Listening", "Paper 3"]
            };
        } catch (e) { return null; }
    }).filter(e => e !== null);
    res.json(exams);
});

router.get('/listening/exam/:id', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'generated_mocks', 'listening', `${req.params.id}.json`);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });

        let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const meta = data.metadata || data.meta || {};
        data.metadata = {
            title: meta.title || meta.description || req.params.id.replace(/_/g, ' '),
            generated_at: meta.generated_at || data.generated_at || new Date().toISOString(),
            difficulty: meta.difficulty || "Level 4"
        };

        if (data.sections) { Object.assign(data, data.sections); delete data.sections; }

        const normalizeScript = (partKey) => {
            const part = data[partKey];
            if (!part) return [];
            let lines = [];
            if (Array.isArray(part.script)) lines = part.script;
            else if (part.audio_script) {
                Object.values(part.audio_script).forEach(taskObj => {
                    if (Array.isArray(taskObj.content)) lines.push(...taskObj.content);
                    else if (Array.isArray(taskObj.script)) lines.push(...taskObj.script);
                });
            } else if (data.audio_scripts && data.audio_scripts[partKey]) {
                const partScriptObj = data.audio_scripts[partKey];
                if (Array.isArray(partScriptObj)) lines = partScriptObj;
                else {
                    Object.values(partScriptObj).forEach(taskObj => {
                        if (Array.isArray(taskObj.script)) lines.push(...taskObj.script);
                        else if (Array.isArray(taskObj.content)) lines.push(...taskObj.content);
                        else if (Array.isArray(taskObj)) lines.push(...taskObj);
                    });
                }
            }
            return lines.map(l => ({ speaker: l.speaker || "Announcer", text: l.text || l.dialogue || l.line || "" }));
        };

        if (data.Part_A) data.Part_A.script = normalizeScript('Part_A');
        if (data.Part_B) data.Part_B.script = normalizeScript('Part_B');

        const normalizeTasks = (partKey) => {
            const part = data[partKey];
            if (!part) return;
            if (!Array.isArray(part.tasks) && part.audio_script) {
                part.tasks = Object.entries(part.audio_script).filter(([taskId]) => taskId.startsWith('Task')).map(([taskId, taskObj]) => ({
                    id: taskId, instructions: taskObj.instructions || taskObj.prompt || taskObj.title || "Complete the task.", questions: taskObj.questions || []
                }));
            }
            if (!Array.isArray(part.tasks)) return;
            part.tasks = part.tasks.map(task => {
                task.instructions = task.instructions || task.prompt || "Complete the task.";
                if (!task.questions && part.audio_script?.[task.id]?.questions) task.questions = part.audio_script[task.id].questions;
                if (Array.isArray(task.questions)) {
                    task.questions = task.questions.map((q, idx) => ({
                        id: q.id || q.qId || `Q${idx + 1}`, type: (q.type || "fill_in_blank").toLowerCase().replace(/_/g, ' '), label: q.label || q.text || q.question || "Answer here:", options: q.options || [], answer: q.answer || ""
                    }));
                } else task.questions = [];
                return task;
            });
        };
        normalizeTasks('Part_A'); normalizeTasks('Part_B');
        res.json(data);
    } catch (error) { res.status(500).json({ error: "Read failed" }); }
});

router.post('/listening/grade', async (req, res) => {
    try {
        const { mode, taskPrompt, context, modelAnswer, studentAnswer, uid } = req.body;
        const prompt = listeningGradingAgent
            .replace('{MODE}', mode || "PART_A")
            .replace('{TASK_PROMPT}', taskPrompt)
            .replace('{CONTEXT}', context ? context.substring(0, 5000) : "N/A")
            .replace('{MODEL_ANSWER}', modelAnswer || "N/A")
            .replace('{STUDENT_ANSWER}', studentAnswer || "N/A");
        const result = await GenerativeAIService.generateContent(prompt, { model: TIER_PRO_MODEL, generationConfig: { responseMimeType: "application/json" } });
        if (result.response && result.response.usageMetadata) TokenService.logUsage(uid || 'system', 'listening_grade', result.response.usageMetadata);
        res.json(JSON.parse(result.response.text()));
    } catch (error) { res.status(500).json({ error: "Grading failed" }); }
});

// --- SPEAKING MOCK ENDPOINTS ---
router.post('/speaking/generate', async (req, res) => {
    const { theme } = req.body;
    const mock = await generateSpeakingMock(theme || "Social Issues");
    if (mock) res.json({ success: true, examId: mock.id });
    else res.status(500).json({ error: "Generation failed" });
});

router.get('/speaking/exams', (req, res) => {
    try {
        const dir = path.join(__dirname, '..', 'generated_mocks', 'speaking');
        if (!fs.existsSync(dir)) return res.json([]);
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        const exams = files.map(f => {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
                return { id: data.id || f.replace('.json', ''), title: data.title || f.replace('.json', ''), topic: data.topic_description || "Speaking Practice", created_at: data.created_at || new Date().toISOString() };
            } catch (err) { return null; }
        }).filter(e => e !== null).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(exams);
    } catch (e) { res.json([]); }
});

router.get('/speaking/exam/:id', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'generated_mocks', 'speaking', `${req.params.id}.json`);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
        res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
    } catch (e) { res.status(500).json({ error: "Read failed" }); }
});

router.post('/speaking/chat', async (req, res) => {
    try {
        const persona = await UserProfileService.getPersona(uid, 'english');
        const historyPayload = (history || []).slice(-15).map(h => `${h.role === 'user' ? 'Candidate_D' : h.role}: ${h.text}`).join('\n');
        const cl = candidateLevels || { 'Candidate_A': 5, 'Candidate_B': 4, 'Candidate_C': 3 };
        const personas = [
            `- Examiner (${persona.name}): Formal, facilitates the discussion. Does NOT dominate. Only speaks to prompt or redirect.`,
            `- Candidate_A (Annie, Level ${cl.Candidate_A}): High confidence, sophisticated vocabulary, often takes the lead or synthesizes points.`,
            `- Candidate_B (Ben, Level ${cl.Candidate_B}): Competent, uses common transitions, focuses on providing examples.`,
            `- Candidate_C (Charlie, Level ${cl.Candidate_C}): Basic fluency, simple vocabulary, agrees or disagrees with simple reasons.`
        ].join('\n');

        const prompt = speakingAgent
            .replace('{TOPIC}', topic || context?.title || 'Unknown Topic')
            .replace('{POINTS}', JSON.stringify(context?.discussion_points || []))
            .replace('{CURRENT_SPEAKER}', currentSpeaker || 'Examiner')
            .replace('{FORCED_SPEAKER}', forcedNextSpeaker || 'None')
            .replace('{HISTORY}', historyPayload)
            .replace('{PERSONAS}', personas);

        const result = await GenerativeAIService.generateContent(prompt, { model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
        if (result.response && result.response.usageMetadata) TokenService.logUsage(uid || 'system', 'speaking_chat', result.response.usageMetadata);
        
        const responseText = result.response.text();
        const cleanSource = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        let json = JSON.parse(cleanSource);
        let finalTurns = json.turns || [{ speaker: json.next_speaker || "Candidate_A", content: json.content || json.message || "", action: json.action || "speak" }];
        
        const candidates = ['Candidate_A', 'Candidate_B', 'Candidate_C'];
        let prev = currentSpeaker;

        finalTurns = finalTurns.map(t => {
            if (!t.content || t.content.trim().length === 0) t.content = "I see what you mean.";
            if (t.speaker === prev) {
                const other = candidates.filter(c => c !== prev);
                t.speaker = other[Math.floor(Math.random() * other.length)];
            }
            prev = t.speaker;
            return t;
        });
        res.json({ turns: finalTurns });
    } catch (error) { res.status(500).json({ error: "Chat failed" }); }
});

router.post('/speaking/grade', async (req, res) => {
    try {
        const { topic, context, transcript, studentName, uid } = req.body;
        const safeTranscript = Array.isArray(transcript) ? transcript.map(t => `${t.role}: ${t.text}`).join('\n') : transcript;
        const prompt = speakingGradingAgent
            .replace('{TOPIC}', topic)
            .replace('{CONTEXT}', JSON.stringify({ title: context.title, description: context.topic_description, points: context.discussion_points }))
            .replace('{TRANSCRIPT}', safeTranscript)
            .replace('{STUDENT_NAME}', studentName || "Candidate D");

        const result = await GenerativeAIService.generateContent(prompt, { model: TIER_PRO_MODEL, generationConfig: { responseMimeType: "application/json" } });
        if (result.response && result.response.usageMetadata) TokenService.logUsage(uid || 'system', 'speaking_grade', result.response.usageMetadata);
        res.json(JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim()));
    } catch (error) { res.status(500).json({ error: "Grading failed" }); }
});

// --- MAIN SUBMIT EXAM ENDPOINT ---
router.post('/submit-exam', async (req, res) => {
    const { examId, uid, answers, duration } = req.body;

    if (!examId || !uid) return res.status(400).json({ error: "Missing examId or uid" });

    try {
        let markingKeys = {};
        let questionsMap = {};

        const questionsContainer = await require('../db/cosmos').getContainer('mock_exam_questions_cache', '/pk');
        const qRes = await questionsContainer.items.query({
            query: "SELECT c.payload FROM c WHERE c.exam_id = @examId",
            parameters: [{ name: "@examId", value: examId }]
        }).fetchAll();
        const examQuestions = (qRes.resources || []).map((r) => r.payload).filter(Boolean);

        if (examQuestions.length > 0) {
            examQuestions.forEach((q, idx) => {
                const qId = q.id || `q_${idx}`;
                questionsMap[qId] = q;
                markingKeys[qId] = {
                    answer: q.answer || q.model_answer,
                    logic: q.logic || q.explanation,
                    type: q.type
                };
            });
        } else {
            const folders = ['reading', 'writing', 'listening', 'speaking'];
            let localFile = null;
            for (const folder of folders) {
                const checkPath = path.join(__dirname, '..', 'generated_mocks', folder, `${examId}.json`);
                if (fs.existsSync(checkPath)) { localFile = checkPath; break; }
            }
            if (localFile) {
                const localData = JSON.parse(fs.readFileSync(localFile, 'utf8'));
                ['Part_A', 'Part_B1', 'Part_B2', 'Part_B'].forEach(part => {
                    if (localData[part] && localData[part].questions) {
                        localData[part].questions.forEach((q, idx) => {
                            const feId = `${part}_q${idx}`;
                            questionsMap[feId] = { ...q, mark: q.marks, part: part };
                            markingKeys[feId] = { answer: q.answer || q.model_answer, logic: q.logic, type: q.type };
                        });
                    }
                });
            } else {
                return res.status(404).json({ error: "Marking keys not found" });
            }
        }

        let totalScore = 0, totalMaxScore = 0;
        const feedback = {}, partScores = {};

        Object.keys(questionsMap).forEach(qId => {
            const qData = questionsMap[qId], keyData = markingKeys[qId], userAns = answers[qId];
            const maxMarks = parseInt(qData.marks || 1), part = qData.part || "Unknown";
            const partKey = part.toLowerCase().includes('a') ? 'Part_A' : (part.toLowerCase().includes('b2') ? 'Part_B2' : 'Part_B1');
            if (!partScores[partKey]) partScores[partKey] = { score: 0, max: 0 };
            partScores[partKey].max += maxMarks; totalMaxScore += maxMarks;
            let earned = 0, isCorrect = false;
            if (keyData) {
                if (userAns && String(userAns).trim().toLowerCase() === String(keyData.answer).trim().toLowerCase()) { earned = maxMarks; isCorrect = true; }
                partScores[partKey].score += earned; totalScore += earned;
                feedback[qId] = { correct: isCorrect, score: earned, max: maxMarks, userAnswer: userAns || null, correctAnswer: keyData.answer, logic: keyData.logic || "No explanation." };
            }
        });

        const resultData = { examId, uid, timestamp: new Date().toISOString(), totalScore, totalMaxScore, percentage: Math.round((totalScore / totalMaxScore) * 100), partScores, feedback, answers };

        let xpEarned = 0;
        try {
            const baseXP = 500; let bonusXP = resultData.percentage >= 80 ? 300 : (resultData.percentage >= 50 ? 100 : 0);
            const xpResult = await GamificationService.awardXP(uid, baseXP + bonusXP, 'reading', { duration: duration || 0, expectedDuration: 3600, title: `Completed Mock Exam: ${examId}` });
            xpEarned = xpResult.earned; resultData.xpEarned = xpEarned;
        } catch (xpErr) { console.error("XP Award Failed:", xpErr); }

        await CosmosStore.addExamSubmission(resultData);

        try {
            const MicroSkillAssessor = require('../services/MicroSkillAssessor');
            const paperType = examId.split('_')[0].toLowerCase();
            const newSkills = await MicroSkillAssessor.assessAllSkills({ [paperType]: answers });
            const currentSkillMap = await UserProfileService.getSkillMap(uid, 'english') || { microSkills: {} };
            const updatedMicroSkills = { ...(currentSkillMap.microSkills || {}), ...newSkills };
            const newWeaknesses = MicroSkillAssessor.prioritizeWeaknesses(updatedMicroSkills);
            await UserProfileService.saveSkillMap(uid, 'english', { microSkills: updatedMicroSkills, weaknessPriority: newWeaknesses, lastUpdated: new Date().toISOString() });
        } catch (mErr) { console.error("Mastery Update Failed:", mErr); }

        res.json({ success: true, result: { totalScore, totalMaxScore, percentage: resultData.percentage, partScores, feedback, xpEarned } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

/**
 * GET /api/quests/personalized
 * Dynamic batch generation for the Questhub
 */
router.get('/quests/personalized', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const PersonalizedQuestService = require('../services/quests/PersonalizedQuestService');
        const batch = await PersonalizedQuestService.getPersonalizedBatch(uid);
        res.json(batch);
    } catch (e) {
        console.error('[Quests] Personalized Batch Error:', e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
