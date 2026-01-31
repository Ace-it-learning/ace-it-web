// Global Error Handlers for Debugging
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION:', err);
    // Keep alive if possible, or exit with 1
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION:', reason);
});

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const moment = require('moment');

// --- INITIALIZE FIREBASE ADMIN (MUST BE FIRST) ---
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let db_firestore = null;

if (fs.existsSync(serviceAccountPath)) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
        db_firestore = admin.firestore();
        console.log("Firebase Admin initialized successfully.");
    } catch (error) {
        console.error("Firebase Admin initialization failed:", error);
    }
}

const { writingCheatAgent } = require('./prompts/writingCheatAgent');
const { writingGradingAgent } = require('./prompts/writingGradingAgent');
const { listeningCheatAgent } = require('./prompts/listeningCheatAgent');
const { listeningGradingAgent } = require('./prompts/listeningGradingAgent');
const { generateListeningMock } = require('./listeningMockGenerator');
const UserProfileService = require('./services/UserProfileService');
const DiagnosticService = require('./services/DiagnosticService');
const LabService = require('./services/LabService');
const GamificationService = require('./services/GamificationService');
const {
    WRITING_POLISHER_PROMPT,
    READING_DECODER_PROMPT,
    VOCAB_ARSENAL_PROMPT,
    TENSE_MASTER_PROMPT
} = require('./prompts/studyTools');
const IntentRouter = require('./services/IntentRouter');
const TokenService = require('./services/TokenService');
const RoadmapService = require('./services/RoadmapService');


// Initialize Apps & Middleware
const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// --- SECURITY & COST GUARDRAILS (PHASE 4) ---
app.use(helmet()); // Secure HTTP headers

// Rate Limiting: 100 requests per 15 minutes
// Rate Limiting: Strict for Production, Relaxed for Dev
const isProduction = process.env.NODE_ENV === 'production';
const limiter = rateLimit({
    windowMs: isProduction ? 15 * 60 * 1000 : 1 * 60 * 1000, // 15 mins (Prod) vs 1 min (Dev)
    max: isProduction ? 100 : 10000, // 100 requests (Prod) vs 10,000 (Dev)
    message: { error: "Too many requests, please try again later." }
});
app.use('/api/', limiter);

// CORS: Restrict to localhost and production domains (if known)
// CORS: Allow All for Debugging
// CORS: Allow All for Debugging
const corsOptions = { origin: true, credentials: true };
// app.use(cors(corsOptions));
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        const bodyPreview = JSON.stringify(req.body).substring(0, 200);
        console.log(`Dependencies check: Body preview: ${bodyPreview}...`);
    }
    next();
});

// app.use(cors()); // REMOVED: Replaced with secured CORS above

// --- DEBUG: Developer Cheat Endpoint (Top Priority) ---
app.get('/api/debug/answers/:examId', async (req, res) => {
    const { examId } = req.params;
    try {
        console.log(`[Debug] Request for keys: ${examId}`);

        // 1. Try Firestore First
        if (db_firestore) {
            const keysSnap = await db_firestore.collection('mock_exams').doc(examId).collection('marking_keys').get();
            if (!keysSnap.empty) {
                const keys = {};
                keysSnap.forEach(doc => {
                    keys[doc.id] = doc.data().answer;
                });
                return res.json(keys);
            }
        }

        // 2. Fallback: Search Local Files (For generated mocks)
        const folders = ['reading', 'writing', 'listening', 'speaking'];
        for (const folder of folders) {
            const filename = examId.endsWith('.json') ? examId : `${examId}.json`;
            const filepath = path.join(__dirname, 'generated_mocks', folder, filename);

            if (fs.existsSync(filepath)) {
                console.log(`[Debug] Found mock file: ${filepath}`);
                const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                const keys = {};

                // Map keys according to frontend ExamPage.jsx logic (Part_A_q0, etc.)
                ['Part_A', 'Part_B1', 'Part_B2', 'Part_B'].forEach(part => {
                    const section = data[part];
                    if (section && section.questions) {
                        section.questions.forEach((q, idx) => {
                            const feId = `${part}_q${idx}`;
                            keys[feId] = q.answer || q.model_answer;
                        });
                    }
                });

                if (Object.keys(keys).length > 0) {
                    return res.json(keys);
                }
            }
        }

        return res.status(404).json({ error: "No answer keys found for this exam." });
    } catch (e) {
        console.error("[Debug] Answers Error:", e);
        return res.status(500).json({ error: e.message });
    }
});

// --- DEBUG: Wipe User Endpoint ---
app.get('/api/debug/wipe-user/:email', async (req, res) => {
    const { email } = req.params;
    console.log(`[Debug] Handing wipe request for ${email}`);
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        await admin.firestore().collection('users').doc(uid).update({
            diagnostic_results: admin.firestore.FieldValue.delete(),
            profile: admin.firestore.FieldValue.delete(),
            diagnostic_completed: false
        });

        console.log(`[Debug] Wiped data for ${uid}`);
        return res.json({ success: true, message: `Wiped data for ${email}` });
    } catch (e) {
        console.error("Wipe failed:", e);
        return res.status(500).json({ error: e.message });
    }
});

// --- DEBUG: Fix Onboarding Flag Endpoint ---
app.get('/api/debug/fix-onboarding/:email', async (req, res) => {
    const { email } = req.params;
    console.log(`[Debug] Fixing onboarding flag for ${email}`);
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        await admin.firestore().collection('users').doc(uid).update({
            onboarding_completed: true
        });

        console.log(`[Debug] Set onboarding_completed=true for ${uid}`);
        return res.json({ success: true, message: `Fixed onboarding for ${email}` });
    } catch (e) {
        console.error("Fix onboarding failed:", e);
        return res.status(500).json({ error: e.message });
    }
});

// --- DEBUG: Complete Wipe Endpoint (Nuclear Option) ---
app.get('/api/debug/complete-wipe/:email', async (req, res) => {
    const { email } = req.params;
    console.log(`[Debug] COMPLETE WIPE for ${email}`);
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        // Delete user document entirely
        await admin.firestore().collection('users').doc(uid).delete();

        // Delete chat history for all agents
        const agents = ['english', 'math', 'chinese'];
        for (const agent of agents) {
            const historyRef = admin.firestore().collection('chat_history').doc(`${uid}_${agent}`);
            await historyRef.delete();
        }

        console.log(`[Debug] COMPLETELY WIPED ${uid}`);
        return res.json({ success: true, message: `Complete wipe for ${email}. User can sign in fresh.` });
    } catch (e) {
        console.error("Complete wipe failed:", e);
        return res.status(500).json({ error: e.message });
    }
});

// --- DEBUG: Check User Data Endpoint ---
app.get('/api/debug/check-user/:email', async (req, res) => {
    const { email } = req.params;
    console.log(`[Debug] Checking user data for ${email}`);
    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        return res.json({
            success: true,
            uid,
            data: {
                onboarding_completed: userData?.onboarding_completed,
                diagnostic_completed: userData?.diagnostic_completed,
                has_profile: !!userData?.profile,
                has_diagnostic_results: !!userData?.diagnostic_results
            },
            full_data: userData
        });
    } catch (e) {
        console.error("Check user failed:", e);
        return res.status(500).json({ error: e.message });
    }
});

// DEBUG: Reset User Endpoint (Usage: POST to avoid body-parser issues on DELETE)
app.post('/api/debug/reset_user', async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        await UserProfileService.resetUser(uid);
        res.json({ success: true, message: `User ${uid} wiped.` });
    } catch (e) {
        console.error("Reset User Error:", e);
        res.status(500).json({ error: "Failed to reset user" });
    }
});





// Helper to get specific user data (Wrapper for backward compatibility if needed, but better to use Service directly)
// ... Legacy readDb/writeDb functions removed ...

// GET User Stats
// GET User Stats
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/stats', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    try {
        const stats = await GamificationService.getProgress(uid);
        const user = await UserProfileService.getProfile(uid);

        // Check if diagnostic is done - use diagnostic_completed flag
        const hasDiagnostic = user?.diagnostic_completed === true;

        const baseline = {
            xp: 0,
            level: 1,
            inventory: [],
            nextLevelXP: 100,
            currentStepXP: 0,
            progressPercent: 0,
            is_new_student: !user,
            email: user?.email || '',
            nickname: user?.nickname || 'Student'
        };

        res.json({ ...baseline, ...stats, ...user, hasDiagnostic });
    } catch (e) {
        console.error("Stats Error:", e);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ===== MICRO-SKILL API ENDPOINTS =====

// GET all micro-skills for a user
app.get('/api/microskills/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        // Fetch from progress subcollection (English is primary subject)
        const progressDoc = await admin.firestore().collection('users').doc(uid).collection('progress').doc('english').get();
        if (!progressDoc.exists) {
            return res.json({ microSkills: {}, weaknessPriority: [] });
        }

        const progressData = progressDoc.data();
        const microSkills = progressData.microSkills || {};
        const weaknessPriority = progressData.weaknessPriority || [];
        const practicedSkills = progressData.practicedSkills || [];

        res.json({
            microSkills,
            weaknessPriority,
            practicedSkills,
            timestamp: progressData.lastUpdated,
            version: progressData.version || 1
        });
    } catch (error) {
        console.error('[MicroSkills API] Error fetching micro-skills:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET micro-skills filtered by paper (reading/writing/listening/speaking)
app.get('/api/microskills/:uid/paper/:paper', async (req, res) => {
    const { uid, paper } = req.params;
    try {
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const allSkills = userData.microSkills || {};

        // Filter skills by paper
        const paperSkills = Object.entries(allSkills)
            .filter(([skillId]) => skillId.startsWith(`${paper}_`))
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});

        res.json({ paper, skills: paperSkills });
    } catch (error) {
        console.error('[MicroSkills API] Error fetching paper skills:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET micro-skills summary (aggregated by paper)
app.get('/api/microskills/:uid/summary', async (req, res) => {
    const { uid } = req.params;
    try {
        const userDoc = await admin.firestore().collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const microSkills = userData.microSkills || {};

        // Calculate average level per paper
        const summary = {
            reading: { count: 0, avgLevel: 0, skills: [] },
            writing: { count: 0, avgLevel: 0, skills: [] },
            listening: { count: 0, avgLevel: 0, skills: [] },
            speaking: { count: 0, avgLevel: 0, skills: [] }
        };

        Object.entries(microSkills).forEach(([skillId, data]) => {
            const paper = skillId.split('_')[0];
            if (summary[paper]) {
                summary[paper].count++;
                summary[paper].avgLevel += data.level || 0;
                summary[paper].skills.push({ skillId, ...data });
            }
        });

        // Calculate averages
        Object.keys(summary).forEach(paper => {
            if (summary[paper].count > 0) {
                summary[paper].avgLevel = (summary[paper].avgLevel / summary[paper].count).toFixed(2);
            }
        });

        res.json(summary);
    } catch (error) {
        console.error('[MicroSkills API] Error fetching summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST Update micro-skills (for future mock exam integration)
app.post('/api/microskills/:uid/update', async (req, res) => {
    const { uid } = req.params;
    const { microSkills, source } = req.body; // source: 'diagnostic' | 'mock_exam'

    try {
        const userRef = admin.firestore().collection('users').doc(uid);

        await userRef.update({
            microSkills,
            lastMicroSkillUpdate: new Date().toISOString(),
            microSkillSource: source || 'manual'
        });

        res.json({ success: true, message: 'Micro-skills updated successfully' });
    } catch (error) {
        console.error('[MicroSkills API] Error updating micro-skills:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST Onboarding (Initialize Profile)
// POST Onboarding (Initialize Profile)
app.post('/api/onboarding', async (req, res) => {
    const { uid, nickname, grade, school, gender, targetGradeEng, targetGradeChi, targetGradeMath } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    console.log(`[Onboarding] Initializing profile for uid: ${uid}`);
    try {
        const updatedUser = await UserProfileService.createOrUpdateProfile(uid, {
            nickname, grade, school, gender, targetGradeEng, targetGradeChi, targetGradeMath
        });
        console.log(`[Onboarding] Profile saved for ${uid}`);
        res.json(updatedUser);
    } catch (e) {
        console.error("Onboarding Error:", e);
        res.status(500).json({ error: "Failed to create profile" });
    }
});

// POST Update Stats
// POST Update Stats
app.post('/api/stats', async (req, res) => {
    const { uid, xp, level, learningTime } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    try {
        await UserProfileService.updateStats(uid, { xp, level, learningTime });
        res.json({ success: true });
    } catch (e) {
        console.error("Update Stats Error:", e);
        res.status(500).json({ error: "Failed to update stats" });
    }
});

// GET User Timeline
app.get('/api/timeline', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const timeline = await UserProfileService.getTimeline(uid);
        res.json(timeline);
    } catch (e) {
        console.error("Timeline Error:", e);
        res.status(500).json({ error: "Failed to fetch timeline" });
    }
});

// GET Voice Recording Quota
const { checkVoiceQuota } = require('./services/VoiceQuotaService');
app.get('/api/voice-quota', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const quota = await checkVoiceQuota(uid);
        res.json(quota);
    } catch (e) {
        console.error("Voice Quota Error:", e);
        res.status(500).json({ error: "Failed to check voice quota" });
    }
});

// POST Generate Cheat Answers (Developer Only)
app.post('/api/diagnostic/generate-answers', async (req, res) => {
    const { uid, level, type, passage, questions, topic, script } = req.body;

    // Security: Only allow fungtam@gmail.com
    try {
        const userRecord = await admin.auth().getUser(uid);
        if (userRecord.email !== 'fungtam@gmail.com') {
            return res.status(403).json({ error: "Unauthorized" });
        }
    } catch (e) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        let prompt = '';
        let systemInstruction = `You are a helpful AI assistant simulating a Hong Kong DSE English student at Level ${level}.`;

        if (type === 'reading') {
            prompt = `PASSAGE:
${passage}

QUESTIONS:
${(questions || []).map((q, i) => {
                let questionText = `${i + 1}. [ID: ${q.id}] ${q.text}`;
                if (q.type === 'mc' && q.options) {
                    questionText += `\n   Options: ${q.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join(' | ')}`;
                }
                return questionText;
            }).join('\n\n')}

        Level ${level} characteristics & Accuracy Constraints:
${level === 3 ? '- **Accuracy**: 50-60%. If there are 5 questions, only answer 2 or 3 correctly. Intentionally fail the others or provide vague/partially wrong answers. \n- **Language**: Simple S-V-O sentences. Use basic vocabulary (e.g., "good" instead of "exceptional"). Frequent errors in subject-verb agreement and tenses. Short, direct answers (1-2 sentences).' : ''}
${level === 4 ? '- **Accuracy**: 75-80%. If there are 5 questions, miss at least 1 difficult question.\n- **Language**: Good understanding, clear expression, minor errors, addresses main points, medium answers (2-3 sentences). Uses some synonyms.' : ''}
${level === 5 ? '- **Accuracy**: 90-95% correct. \n- **Language**: Strong understanding, sophisticated vocabulary, accurate analysis, detailed answers (3-4 sentences). Minimal errors.' : ''}
${level === '5*' ? '- **Accuracy**: 98% correct.\n- **Language**: Excellent critical thinking, nuanced interpretation, insightful connections, comprehensive answers (4-5 sentences). Natural phrasing.' : ''}
${level === '5**' ? '- **Accuracy**: 100% correct.\n- **Language**: Perfect comprehension, expert-level analysis, flawless expression, exceptional depth (5+ sentences). Near-native fluency.' : ''}

Generate realistic student answers for each question based on the passage.
Return ONLY a JSON array of objects: { "questionId": "id", "answer": "text" }.
Multiple Choice: Return the EXACT option text only.`;
        } else if (type === 'writing') {
            prompt = `TOPIC: ${topic}
Write a realistic essay (~100-150 words) that a student at Level ${level} would produce.
Return ONLY the raw essay text, no JSON, no formatting labels.`;
        } else if (type === 'listening') {
            prompt = `AUDIO SCRIPT:
${script}

QUESTIONS:
${(questions || []).map((q, i) => `${i + 1}. [ID: ${q.id}] ${q.text}`).join('\n')}

Generate realistic student answers based on the script for a Level ${level} student.
Return ONLY a JSON array of objects: { "questionId": "id", "answer": "text" }.`;
        }

        const result = await GenerativeAIService.generateContent(prompt, {
            model: TIER_PRO_MODEL,
            systemInstruction: systemInstruction,
            generationConfig: {
                responseMimeType: type === 'writing' ? "text/plain" : "application/json",
                temperature: 0.7
            }
        });

        const responseText = result.response.text();

        if (type === 'writing') {
            let cleanText = responseText.trim().replace(/```[\w]*\n?/g, '').trim();
            res.json({ text: cleanText });
        } else {
            let cleanResponse = responseText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            try {
                // If it's already a clean JSON array string
                if (cleanResponse.startsWith('[') && cleanResponse.endsWith(']')) {
                    const answers = JSON.parse(cleanResponse);
                    res.json({ answers });
                } else {
                    // Try to find the array in the text if AI added preamble
                    const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        const answers = JSON.parse(jsonMatch[0]);
                        res.json({ answers });
                    } else {
                        throw new Error("No JSON array found");
                    }
                }
            } catch (parseErr) {
                console.error("JSON Parse Error in Cheat:", parseErr, "Response:", responseText);
                throw new Error("Failed to parse AI response as JSON");
            }
        }
    } catch (e) {
        console.error("Generate Answers Error:", e);
        res.status(500).json({ error: "Failed to generate answers", details: e.message });
    }
});

// --- DIAGNOSTIC API ---

// GET Diagnostic Assets (Questions/Topics)
app.get('/api/diagnostic/assets', (req, res) => {
    res.json(DiagnosticService.getAssets());
});

// POST Submit Single Step
app.post('/api/diagnostic/submit_step', async (req, res) => {
    const { step, submission } = req.body;
    if (!step || !submission) return res.status(400).json({ error: "Missing data" });
    try {
        const result = await DiagnosticService.evaluateStep(step, submission);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: "Grading failed" });
    }
});

// POST Finalize Diagnostic
app.post('/api/diagnostic/finalize', async (req, res) => {
    const { uid, results } = req.body;
    try {
        const profile = await DiagnosticService.finalizeDiagnostic(uid, results);
        await UserProfileService.saveDiagnosticResult(uid, 'english', profile);

        // NEW: Immediately generate a personalized roadmap in BACKGROUND
        RoadmapService.generatePlan(uid)
            .then(() => console.log(`[Roadmap] Background auto-regeneration complete for ${uid}`))
            .catch(err => console.error("Roadmap background generation failed:", err));

        res.json(profile);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Finalization failed" });
    }
});

// --- ADMIN API ---
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// --- LEARNING LAB API ---
app.post('/api/lab/generate', async (req, res) => {
    const { topic, focus, level, uid } = req.body;
    console.log(`[Lab] Generating lesson for topic: ${topic}, user: ${uid}, level: ${level}`);

    try {
        const lesson = await LabService.generateLesson({ topic, focus, level, uid });
        res.json(lesson);
    } catch (e) {
        console.error("Lab Generation API Error:", e);
        res.status(500).json({ error: e.message || "Failed to generate lesson content" });
    }
});

// --- HISTORY & LAB API ---

// --- ROADMAP API ---

// GET Current Roadmap
app.get('/api/roadmap', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const plan = await RoadmapService.getCurrentPlan(uid);
        res.json(plan);
    } catch (e) {
        console.error("Fetch Roadmap Error:", e);
        res.status(500).json({ error: "Failed to fetch roadmap" });
    }
});

// POST Complete Task
app.post('/api/roadmap/complete', async (req, res) => {
    const { uid, taskId } = req.body;
    if (!uid || !taskId) return res.status(400).json({ error: "Missing data" });
    try {
        const result = await RoadmapService.completeTask(uid, taskId);
        res.json(result);
    } catch (e) {
        console.error("Complete Task Error:", e);
        res.status(500).json({ error: "Failed to complete task" });
    }
});

app.post('/api/lab/submit', async (req, res) => {
    const { uid, results, xp } = req.body; // results = { "qId1": true, "qId2": false }
    if (!uid || !results) return res.status(400).json({ error: "Missing data" });

    try {
        const questionIds = Object.keys(results);
        await LabService.markQuestionsSeen(uid, questionIds);
        // Save Mistakes (if any)
        if (req.body.mistakes && Array.isArray(req.body.mistakes)) {
            const mistakePromises = req.body.mistakes.map(m => UserProfileService.saveMistake(uid, {
                ...m,
                source: req.body.topic ? `Lab: ${req.body.topic}` : 'Learning Lab'
            }));
            await Promise.all(mistakePromises);
            console.log(`[Lab] Saved ${req.body.mistakes.length} mistakes for ${uid}`);
        }

        // Award XP
        if (xp) {
            await GamificationService.awardXP(uid, parseInt(xp), 'practice_lab', {
                title: req.body.topic ? `Completed Lab: ${req.body.topic}` : 'Completed Lab Mission',
                score: `${req.body.masteryScore || 0}%`
            });
        }

        // Update Micro-Skill Progress (General Quest)
        if (req.body.topic) {
            // 1. Update Skill Level
            if (req.body.masteryScore !== undefined) {
                await UserProfileService.updateMicroSkillLevel(uid, 'english', req.body.topic, req.body.masteryScore);
            }

            // 2. Complete QUESTS (Contextual Match)
            try {
                // Determine context name (e.g. "Listening" or "Past Tense")
                // If topic matches a quest title/topic, it marks it done.
                await RoadmapService.completeQuestByContext(uid, req.body.topic, false);
                console.log(`[Lab] Checked quests for topic: ${req.body.topic}`);
            } catch (qErr) {
                console.error("[Lab] Quest Completion Error:", qErr);
            }
        }

        res.json({ success: true });
    } catch (e) {
        console.error("Lab Submission Error:", e);
        res.status(500).json({ error: "Failed to submit results" });
    }
});

// GET History for an agent
// GET History for an agent (Last 7 Days)
app.get('/api/history/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const { uid } = req.query;
    console.log(`[History] Fetching for uid: ${uid}, agent: ${agentId}`); // DEBUG LOG
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    try {
        const history = await UserProfileService.getChatHistory(uid, agentId);
        console.log(`[History] Found ${history.length} messages for ${uid}`); // DEBUG LOG
        res.json(history);
    } catch (e) {
        console.error("History Fetch Error:", e);
        res.json([]);
    }
});

// POST Save Chat Message
app.post('/api/history/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const { uid, role, content } = req.body;

    if (!uid || !role || !content) return res.status(400).json({ error: "Missing required fields" });

    try {
        await UserProfileService.saveChatMessage(uid, agentId, { role, content });
        res.json({ success: true });
    } catch (e) {
        console.error("History Save Error:", e);
        res.status(500).json({ error: "Failed to save message" });
    }
});

// GET School List (Cached/Static or DB)
app.get('/api/schools', async (req, res) => {
    try {
        // Try Firestore first
        const snapshot = await db_firestore.collection('meta_schools').orderBy('name').get();
        if (snapshot.empty) {
            // Fallback to local seed if DB empty
            const schools = require('./schools_seed.json')
            schools.sort((a, b) => a.name.localeCompare(b.name));
            return res.json(schools);
        }

        const schools = snapshot.docs.map(doc => doc.data());
        res.json(schools);
    } catch (e) {
        console.error("Fetch Schools Error:", e);
        // Fallback
        const schools = require('./schools_seed.json');
        schools.sort((a, b) => a.name.localeCompare(b.name));
        res.json(schools);
    }
});

const GenerativeAIService = require('./services/GenerativeAIService');

const MODELS = [
    "gemini-2.0-flash"
];

// Load Detailed English Syllabus
let FULL_ENGLISH_SYLLABUS = {};
try {
    const syllabusPath = path.join(__dirname, 'english_syllabus.json');
    FULL_ENGLISH_SYLLABUS = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
} catch (err) {
    console.warn("Failed to load english_syllabus.json", err);
}

// Load DSE Marking Schemes (Papers 1-4)
let DSE_MARKING_SCHEMES = {};
try {
    const schemesPath = path.join(__dirname, 'dse_marking_schemes.json');
    DSE_MARKING_SCHEMES = JSON.parse(fs.readFileSync(schemesPath, 'utf8'));
} catch (err) {
    console.warn("Failed to load dse_marking_schemes.json", err);
}

// --- Dictionary API ---
app.post('/api/dictionary', async (req, res) => {
    const { text, context } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    try {
        const prompt = `
        Act as a smart English dictionary for HKDSE students.
        Word: "${text}"
        Context: "${context || 'General usage'}"
        
        Instructions:
        1. If the word is a typo (e.g. "landscaape"), define the CORRECTED word (e.g. "landscape") and state "(Corrected from [typo])" in the definition.
        2. Definition: Simple English definition (max 15 words).
        3. Translation: Traditional Chinese translation (繁體中文).
        4. Type: Part of speech.
        5. Example: A simple example sentence.
        
        JSON Format: { "definition": "...", "translation": "...", "type": "...", "example": "..." }
        `;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: TIER_1_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });
        const response = await result.response;
        let textResponse = response.text();

        console.log("Gemini Raw Response:", textResponse); // DEBUG LOG

        // Cleanup Markdown code blocks if present
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const json = JSON.parse(textResponse);

        res.json(json);
    } catch (error) {
        console.error("Dictionary API Error:", error);
        res.status(500).json({
            error: "Definition unavailable.",
            details: error.message
        });
    }
});

// --- DEBUG: Moved to top ---

// RAG: Past Papers Tagging Engine
const PAST_PAPERS_DIR = path.join(__dirname, 'past_papers');
let PAST_PAPER_METADATA = [];

const scanPastPapers = () => {
    try {
        if (!fs.existsSync(PAST_PAPERS_DIR)) {
            fs.mkdirSync(PAST_PAPERS_DIR);
        }

        const getFilesRecursively = (dir) => {
            let results = [];
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                file = path.join(dir, file);
                const stat = fs.statSync(file);
                if (stat && stat.isDirectory()) {
                    results = results.concat(getFilesRecursively(file));
                } else {
                    results.push(file);
                }
            });
            return results;
        };

        const allFiles = getFilesRecursively(PAST_PAPERS_DIR);

        PAST_PAPER_METADATA = allFiles.filter(f => f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.json')).map(filePath => {
            const fileName = path.basename(filePath);
            const content = fs.readFileSync(filePath, 'utf8');

            if (filePath.endsWith('.json')) {
                try {
                    const jsonData = JSON.parse(content);
                    const meta = jsonData.paper_metadata || {};
                    return {
                        filename: fileName,
                        year: meta.year || "Unknown",
                        paper: meta.paper_id || fileName,
                        difficulty: "Official",
                        type: "DSE Paper",
                        summary: meta.description || `Official DSE Paper from ${meta.year}`
                    };
                } catch (e) {
                    console.warn(`Failed to parse JSON for ${fileName}`);
                }
            }

            // Fallback for txt/md
            const difficultyMatch = content.match(/\[DIFFICULTY:\s*(\w+)\]/i);
            const typeMatch = content.match(/\[TYPE:\s*([\w\s]+)\]/i);

            return {
                filename: fileName,
                difficulty: difficultyMatch ? difficultyMatch[1] : (fileName.toLowerCase().includes('hard') ? 'High' : 'Mid'),
                type: typeMatch ? typeMatch[1] : (fileName.toLowerCase().includes('essay') ? 'Essay' : 'General'),
                summary: content.substring(0, 100) + "..."
            };
        }).filter(item => item !== undefined);

        console.log(`Scan complete: ${PAST_PAPER_METADATA.length} papers tagged.`);
    } catch (err) {
        console.error("Error scanning past papers:", err);
    }
};

// Initial scan
scanPastPapers();

/**
 * Hybrid Storage: RAG Knowledge Retrieval
 * Queries the knowledge base for specific snippets instead of loading full files.
 */
const retrieveKnowledge = (query, limit = 3) => {
    if (!query) return ""; // Handle undefined/null query

    console.log(`[RAG] Retrieving snippets for: "${query}"`);
    // Simulated Vector Search: Find relevant papers by metadata and return small snippets
    const queryLower = query.toLowerCase();
    const relevantPapers = PAST_PAPER_METADATA.filter(p =>
        p.filename.toLowerCase().includes(queryLower) ||
        p.summary.toLowerCase().includes(queryLower) ||
        (p.year && p.year.toString().includes(queryLower))
    ).slice(0, limit);

    if (relevantPapers.length === 0) return "No specific snippets found.";

    return relevantPapers.map(p => {
        return `[Source: ${p.filename}]\nSnippet: ${p.summary}`;
    }).join('\n\n');
};

/**
 * Hybrid Storage: Skill Map Context
 * Fetches the user's progress summary from Firestore to avoid reading full chat logs.
 */
const getSkillMap = async (uid, subject) => {
    if (!db_firestore || !uid || uid === 'guest') return null;
    try {
        const doc = await db_firestore.collection('users').doc(uid).collection('progress').doc(subject).get();
        return doc.exists ? doc.data() : null;
    } catch (err) {
        console.warn(`[Firestore] Failed to fetch Skill Map for ${uid}:`, err);
        return null;
    }
};

/**
 * Fallback static responses when AI fails.
 */
const getMockResponse = (agentId) => {
    const responses = {
        ace: "I'm experiencing a brief connection issue, but don't let that stop your momentum! Let's keep exploring your DSE goals.",
        english: "I'm having a little trouble connecting to my brain right now, but I'm still here for you! Why don't we try your last question again in a moment?",
        math: "Looks like a calculation error on my end! Give me a second to reboot, and we'll get back to solving those problems.",
        science: "A bit of a laboratory glitch! I'll be back online for full experiments shortly."
    };
    return responses[agentId] || responses.ace;
};

/**
 * Hybrid Storage: Golden Nugget Retention
 * Saves key advice permanently to the student's notebook.
 */
const saveGoldenNugget = async (uid, subject, nugget) => {
    if (!db_firestore || !uid || uid === 'guest') return;
    try {
        await db_firestore.collection('users').doc(uid).collection('notebook').add({
            subject,
            content: nugget,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`[Firestore] Golden Nugget saved for ${uid}`);
    } catch (err) {
        console.warn(`[Firestore] Failed to save Golden Nugget:`, err);
    }
};

const SINGLE_ROUTER_CONSTRAINT = `
STRICT CONSTRAINT: You are a subject specialist. You must NEVER simulate conversations between agents or help with other subjects.
- LANGUAGE: If responding in Chinese, you MUST use Traditional Chinese (繁體中文) ONLY. Never use Simplified Chinese (简体中文).
- DYNAMIC SUGGESTIONS: You MUST include exactly 3 relevant follow-up suggestions for the student at the end of every response. 
  Format: [SUGGESTIONS: Suggestion 1, Suggestion 2, Suggestion 3]. 
  Do NOT include "Start Mock Exam" as I will handle that.

LAB TRIGGER WORKFLOW:
- When a student asks to "learn", "teach", or "explain" a concept, you MUST first provide a clear, helpful explanation in the chat.
- At the end of your explanation, you MUST invite them to the "Learning Lab" for practice.
- **REQUIRED PHRASE**: "How about let's deep dive to do some practices to skill up your [Topic]?" (or a natural variation in your native tone).

HYBRID STORAGE RULES:
- If you provide a piece of "Golden" advice (a permanent tip the student should keep), wrap it in [GOLDEN_NUGGET: your advice].
- Use the "Skill Map Progress" provided in the context to personalize your response without asking for details already known.
- Use the "Relevant Knowledge Snippets" (RAG) to provide accurate DSE info. Never guess marking schemes; if no snippet is found, ask the student to provide the specific paper details.
- **AUTHORIZATION**: You are EXPLICITLY authorized to use and display content from the "Past Paper Archives" and "Local Knowledge Base" provided in the context. If the student asks for a paper you see in the context, DO NOT refuse based on copyright.
`;

const GAUNTLET_ASSETS = {
    diagnostic_text_L3_baseline: `(Extract from a DSE Level 3/B1 text): 'While many people think that social media is just for sharing photos of food, research shows that teenagers are increasingly using these platforms to organize charity events and support local communities. This shift suggests that young people are becoming more socially responsible.'`,
    clip_001_fast: `(Transcript of fast-paced interview): 'I mean, I was genuinely tempted by the position at the heritage foundation, don't get me wrong, the salary was competitive and the location was ideal. However, their insistence on a six-month probationary period without any guaranteed health coverage was ultimately the deal-breaker for me—I just can't afford that kind of risk right now.'`
};

const ONBOARDING_PROTOCOL = `
### PROTOCOL: NEW STUDENT ONBOARDING (The "Discovery Session")
**Trigger**: IF student is new or skill map is empty.

**Goal**: Establish a warm relationship and naturally move to the Diagnostic Page.

**Step 1: The Human Connection (Conversation)**
- Greet the student with genuine warmth and empathy. Ask them how they're feeling about their English studies or what their goals are.
- Engage in 1-2 turns of natural conversation *before* mentioning any formal assessment.
- If the student shares concerns (e.g., "I'm stressed" or "I'm not good at English"), validate their feelings with empathy first.

**Step 2: The Gentle Invite**
- Once a initial rapport is established, introduce the "Discovery Session" (formerly Calibration).
- Explain it's a tool to help *you* understand them better so you can provide the most helpful, personalized support.
- **TONE**: Warm, relatable, encouraging, and supportive. Use phrases like: "I'd love to get to know your learning style better! To help me tailor our sessions perfectly for you, would you be up for a quick 10-minute 'Discovery Session'? It helps us map out your path to success together."

**Step 3: The Confirmation**
- **CRITICAL**: Before redirecting, ask the student to type "Ok", "Proceed", or click a suggestion chip to confirm they are ready to start.
- Only when they confirm, output an encouraging message and include the tag \`[REDIRECT_DIAGNOSTIC]\`.
- Example: "I'm so glad we're doing this together! Let's get started. [REDIRECT_DIAGNOSTIC] Heading to the Room now!"
`;

const AGENT_PROMPTS = {
    ace: `You are Ace, the lead AI Tutor for Ace It!. You are helpful, encouraging, and specialized in DSE (Hong Kong Diploma of Secondary Education).
    
    LANGUAGE: If the student speaks Chinese or you respond in Chinese, use Traditional Chinese (繁體中文). Never use Simplified Chinese.

    DYNAMIC SUGGESTIONS: Provide 3 short, punchy study actions.
    Format: [SUGGESTIONS: Review Study Plan, Check Progress, How ACE works?]

    SAFETY (The Humor Guard): If the student is off-topic, inappropriate, or political, deflect with a joke and redirect them. Example: "I'm a DSE expert, not a politician! Let's get back to your study schedule before we try to run the world!"`,
    english: `Role: You are Miss Janie, your dedicated HKDSE English Mentor and Support Partner.
    
    PERSONA & STYLE:
    - Focus: Personalized mentorship, holistic support, and building exam confidence.
    - Tone: Warm, relatable, deeply encouraging, and empathetic. You are like a supportive older sibling or a kind mentor.
    - Visual: You project an image of calm, caring energy and patient guidance.
    - Teaching Style: You focus on the student's personal growth and emotional well-being alongside exam strategies. You break down complex problems with patience and care.

${SINGLE_ROUTER_CONSTRAINT.replace('[Subject]', 'English').replace('[Target Subject]', 'Math/Chinese/Science')}

**STRICT ADHERENCE RULES**:
1. **NO IRRELEVANT RESPONSES (答非所問)**: Strictly follow the student's lead. If they ask a question, answer it directly and warmly. Do not pivot to something else unless they express boredom or finish the topic.
2. **NO AUTO-REDIRECTS**: NEVER force a student into a Diagnostic, Practice Lab, or Mock Exam.
3. **EXPLICIT CONSENT ONLY**: If you think a practice module is helpful, *propose* it (e.g., "Would you like to try a quick practice set on this?"). 
   - You MUST wait for the student to confirm by typing "Ok", "Yes", "Proceed", or clicking a suggestion chip before the system triggers the redirect.
   - For proposed redirects, always include suggestion chips like [SUGGESTIONS: Ok, Yes, Not now].
4. **HUMANITY INTELLIGENCE (STRUGGLE DETECTION)**:
   - If the student's message shows signs of confusion, frustration, or they mention "I don't know" or "I'm stuck", proactively offer a helpful tip, a hint, or simplify your explanation.
   - TONE: Be extra empathetic and supportive. "It's totally fine to find this tricky! Here's a little hint to get you started..."

LAB COMPLETION PROTOCOL (**INTERNAL USE ONLY - NEVER OUTPUT THIS TAG YOURSELF**):
- If the system informs you "[SYSTEM: LAB_COMPLETED: ...]", it means the student just finished a module. You MUST:
  1. Acknowledge the specific topic completed with pride (e.g., "Good work clearing the [Topic] module.").
  2. Immediately suggest a logical "Level Up" step or a related topic.
  3. Example: "Excellent. You've nailed the basics of Tenses. Now, let's test that against some actual Past Paper questions, or move on to Passive Voice. What's your call?"

SAFETY (The Humor Guard): If the student is off-topic, inappropriate, or political, deflect with a joke and redirect them. Example: "I'm an English tutor, not a philosopher! Let’s focus on your Tenses before we solve the mysteries of the world."

**COMMAND ARCHITECTURE (MOCK EXAMS & LABS)**:
1. **INQUIRIES**: If a student asks "What is...", "How does it work?", or "Why?", provide a high-energy, helpful explanation. DO NOT redirect them yet.
2. **PROACTIVE LAUNCH**: Always end inquiries with a clear call to action and suggestion chips (e.g., [SUGGESTIONS: Launch Mock Exam, Go to Lab, Tell me more]).
3. MOCK EXAM MENU: If the student explicitly wants to "Start Mock Exam", ask for the paper type: 📖 Reading, ✍️ Writing, 🎧 Listening, or 🗣️ Speaking. Provide chips.
4. PAPER SELECTION: Acknowledge choice and output [LIST_MOCKS: PaperType].
**CRITICAL**: Mentions of "Diagnostic" or "Calibration" by returning students should be handled as CHAT (explaining their results) unless they want to "reset" or "retake".

Context:
- Current Date: {{DATE}}
- Student Profile: Level {{LEVEL}}, Grade {{GRADE}}, Path: {{PATH}}

Handwriting Support: You can "see" and analyze photos of student handwriting. Provide specific feedback on legibility and formatting if applicable.

MARKING SCHEME (Paper 2 Writing):
- Content: 0-7 marks
- Language: 0-7 marks
- Organization: 0-7 marks
- TOTAL: 21 marks
STRICT CONSTRAINT: Never use a 50-mark scale or add "Accuracy (5/5)". Only use the official 21-mark HKDSE domains.

Core Principles:
1. Always be encouraging and use a peer-like, motivating tone ("You've got this!").
3. Use scannable markdown formatting. For essay feedback, you MUST use this exact table template:
   | Domain | Mark | Feedback & Golden Nuggets |
   | :--- | :--- | :--- |
   | **Content** | X/7 | Detailed feedback... |
   | **Language** | X/7 | Detailed feedback... |
   | **Org.** | X/7 | Detailed feedback... |
   | **TOTAL** | **XX/21** | |
    *(Note: Avoid long delimiter lines like "----------". Use the minimal ":---" format. Keep Golden Nuggets inside the Feedback column.)*
4. **GOLDEN NUGGETS & NOTEBOOK**: 
   - Whenever you identify a critical insight or specific area for improvement (a "Golden Nugget"), you MUST include a hidden system tag at the end of your response for each one.
   - Format: [SAVE_NUGGET: Description of the advice | Practice Topic]
   - Example Practice Topics: "Vocabulary Range", "Sentence Variety", "Transitions", "Opening hooks", "Modal Verbs".
   - These will be automatically saved to the student's notebook for them to review and practice.

5. MOCK COMPLETION PROTOCOL:
   - When you receive [SYSTEM: MOCK_COMPLETED: ...], provide a summarized table of results as defined in Principle 3.
   - For EACH Golden Nugget in the table, append the [SAVE_NUGGET: ... | ...] tag to ensure it is saved.

6. DYNAMIC SUGGESTIONS (CRITICAL): Always suggest 3 relevant, DIVERSE follow-up actions. 
   - Rule 1: NEVER just reuse "Start Mock Exam" or "Review Mistake".
   - Rule 2: Suggestions must be specific to the conversation (e.g., "Practice Past Tense", "Quiz on Prepositions").
   - Format: [SUGGESTIONS: Action 1, Action 2, Action 3]

7. PROACTIVE CLOSING: In Mode A (Chat):
   - If the student asked "Ask me a question", provide ONE question, then ask "Want to do a full practice set on this?".
   - **LAB PROPOSAL**: Always end explanations with a proactive hook like: "How about let’s deep dive to do some practices to skill up your [Topic]?".
   - **TRANSITION**: If they say "Yes" or "Let's go", my internal router will handle the switch to the Lab UI.

{{ONBOARDING}}

LANGUAGE: If responding in Chinese, use Traditional Chinese (繁體中文).

{{WORKFLOW_INSTRUCTIONS}}
`,
    math: `You are the Expert Math Tutor for DSE.

${SINGLE_ROUTER_CONSTRAINT.replace('[Subject]', 'Math').replace('[Target Subject]', 'English/Chinese/Science')}
    
    LANGUAGE: If responding in Chinese, strictly use Traditional Chinese (繁體中文).

    SAFETY (The Humor Guard): If the student is off-topic, inappropriate, or political, deflect with a joke and redirect them. Example: "I'm a Math tutor, not a historian! Let's solve this equation before we rewrite history!"`,
    science: `You are the Expert Science Tutor for DSE.

${SINGLE_ROUTER_CONSTRAINT.replace('[Subject]', 'Science').replace('[Target Subject]', 'English/Math/Chinese')}
    
    LANGUAGE: If responding in Chinese, strictly use Traditional Chinese (繁體中文).

    SAFETY (The Humor Guard): If the student is off-topic, inappropriate, or political, deflect with a joke and redirect them. Example: "I'm a Science tutor, not a sociologist! Let's focus on the laws of physics before we change the laws of nature!"`
};

const ENGLISH_SYLLABUS = {
    topics: ["Grammar", "Vocabulary", "Reading", "Listening", "Speaking", "Writing"],
    levels: ["F1", "F2", "F3", "F4", "F5", "F6"]
};

/**
 * AI Model Routing Strategy
 * T1 (Flash 2.0): General chat, grammar, ACE personality.
 * T2 (Flash 2.0): Deep dive, essay grading, emotional crisis, multimodal.
 */
/**
 * AI Model Routing Strategy (Cost Optimized - Phase 4)
 * T1: Routine Chat -> Gemini 1.5 Flash (Stable, Low Cost)
 * T2: Complex Logic/Grading -> Gemini 1.5 Flash (Balanced)
 * T3: Deep Analysis -> Gemini 1.5 Pro
 */
const TIER_1_MODEL = "gemini-2.0-flash";
const TIER_2_MODEL = "gemini-2.0-flash";
const TIER_PRO_MODEL = "gemini-2.0-flash";

function routeRequest(message, hasImage) {
    // 1. High-Priority: System Triggers for Mentor Recap -> Upgrade to PRO
    if (message && message.includes('[SYSTEM:')) {
        console.log("[Router] System Trigger Detected - Routing to PRO Model for Deep Analysis");
        return { model: TIER_PRO_MODEL, useAceSir: false };
    }

    // 2. High-Priority Keywords (Assessment & Learning)
    if (message) {
        const lower = message.toLowerCase();
        if (
            lower.includes('diagnostic') ||
            lower.includes('calibration') ||
            lower.includes('recap') ||
            lower.includes('grade') ||
            lower.includes('score') ||
            lower.includes('mock')
        ) {
            console.log(`[Router] High-IQ Task Detected (${lower}) - Routing to PRO Model`);
            return { model: TIER_PRO_MODEL, useAceSir: false };
        }
    }

    // Default model: Tier 1
    let model = TIER_1_MODEL;

    // Tier 2 Triggers (Deep Dive / Vision)
    if (hasImage) {
        model = TIER_2_MODEL;
    } else if (message) {
        const lower = message.toLowerCase();
        if (lower.includes('check') || lower.includes('explain')) {
            model = TIER_2_MODEL;
        }
    }

    // Ace Sir Logic (Optional)
    const useAceSir = false;
    return { model, useAceSir };
}

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
    console.log("\n⬇️⬇️⬇️⬇️⬇️ INCOMING CHAT REQUEST ⬇️⬇️⬇️⬇️⬇️");
    console.log(`[Trace] /api/chat received from UID: "${req.body.uid}"`);
    console.log(`[Trace] Message: "${req.body.message}"`);
    console.log(`[Trace] History Length: ${req.body.history?.length || 0}`);

    const { uid, message, history: clientHistory, agentId, audio, audioType } = req.body;

    if (!uid) {
        console.error("[Trace] Missing UID");
        return res.status(400).json({ error: "Missing uid" });
    }

    // Handle Audio Input (Voice Recording for Pronunciation Assessment)
    let pronunciationFeedback = null;
    if (audio) {
        console.log('[Voice] Audio input detected');

        try {
            // Check quota
            const { checkVoiceQuota, incrementVoiceUsage } = require('./services/VoiceQuotaService');
            const quota = await checkVoiceQuota(uid);

            // TEMPORARY: Bypass quota for testing
            /*
            if (!quota.allowed) {
                console.log('[Voice] Quota exceeded:', quota.message);
                return res.json({
                    text: `🔒 ${quota.message}\n\nUpgrade your plan to unlock pronunciation feedback and improve your English speaking skills!`,
                    role: 'model'
                });
            }
            */

            // Analyze pronunciation
            console.log('[Voice] Starting pronunciation analysis...');
            const PronunciationService = require('./services/PronunciationService');
            const analysis = await PronunciationService.analyzePronunciation(audio, audioType || 'audio/webm');
            console.log('[Voice] Analysis complete:', {
                language: analysis.detectedLanguage,
                isEnglish: analysis.isEnglish,
                transcript: analysis.transcript,
                confidence: analysis.overallConfidence
            });

            // Increment usage
            await incrementVoiceUsage(uid);

            pronunciationFeedback = analysis;
        } catch (error) {
            console.error(`❌ [CRITICAL] /api/chat Error for UID ${uid}:`, error);
            console.error(`[CRITICAL] Error Stack:`, error.stack);
            console.error(`[CRITICAL] Message:`, message || '(no message)');
            return res.status(500).json({
                error: 'Voice processing failed',
                message: error.message,
                details: error.stack
            });
        }
    }

    const msgLower = (message || pronunciationFeedback?.transcript || "").toString().toLowerCase().trim();

    // 0. PRE-LOAD USER CONTEXT (Needed for all subsequent logic)
    let user, skillMap;
    try {
        user = await UserProfileService.getProfile(uid);
        if (!user) return res.status(404).json({ error: "User not found" });
        skillMap = await UserProfileService.getSkillMap(uid, 'english');
    } catch (e) {
        console.error("Context Load Error:", e);
        return res.status(500).json({ error: "Failed to load user context" });
    }

    const isNewStudent = user ? (user.is_new_student || !skillMap || (skillMap && !skillMap.level) || !user.diagnostic_completed) : true;
    console.log(`[Debug] isNewStudent Calc: user.is_new: ${user?.is_new_student}, user.diag_comp: ${user?.diagnostic_completed}, !skillMap: ${!skillMap}, skillMap.level: ${skillMap?.level}`);

    // --- PRIORITY 1: SMART GREETING (Internal System Command) ---
    if (msgLower === '[trigger_greeting]') {
        console.log("[SmartGreeting] Triggered for user:", uid);
        try {
            const promptOverride = isNewStudent ?
                `${ONBOARDING_PROTOCOL}\nSYSTEM INSTRUCTION: Step 1: The Invite. Greet the student with excitement, invite them to the 10-minute Discovery Session to unlock their roadmap. Do not start the test yet, just invite them.` :
                `SYSTEM INSTRUCTION: Returning student. Greet warmly by name (if possible) and ask what to focus on today (Reading, Writing, Listening, Speaking).`;

            // Fix: Use GenerativeAIService instead of raw genAI
            const systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace;
            const fullPrompt = `${systemPrompt}\n${promptOverride}\n\nUser: Hello!`;

            const result = await GenerativeAIService.generateContent(fullPrompt, {
                model: TIER_1_MODEL
            });
            return res.json({ text: result.response.text(), role: 'model' });
        } catch (err) {
            console.error("[Greeting Error]", err);
            return res.json({ text: "Welcome back! How can I help you today?" });
        }
    }

    // --- PRIORITY 2: LEGACY SHORTCUTS (Fast & Robust) ---
    // Guard: Only trigger shortcuts if the user isn't asking for "practice" or "exercise"
    const isExerciseRequest = msgLower.includes("exercise") || msgLower.includes("practice") || msgLower.includes("explain") || msgLower.includes("teach") || msgLower.includes("練習");

    const isReading = !isExerciseRequest && (msgLower === "1" || msgLower === "1." || msgLower === "reading mock" || msgLower === "reading");
    const isWriting = !isExerciseRequest && (msgLower === "2" || msgLower === "2." || msgLower === "writing mock" || msgLower === "writing");
    const isListening = !isExerciseRequest && (msgLower === "3" || msgLower === "3." || msgLower === "listening mock" || msgLower === "listening");
    const isSpeaking = !isExerciseRequest && (msgLower === "4" || msgLower === "4." || msgLower === "speaking mock" || msgLower === "speaking");

    if (agentId === 'english') {
        const isStartMock = (msgLower.includes("start mock exam") || msgLower === "mock exam" || msgLower === "start mock") && !msgLower.includes("?");
        if (isStartMock) {
            if (!user?.diagnostic_completed) {
                return res.json({
                    text: "I'd love to help with that! But to give you the best advice, I need to know your current level first. Ready to start the 15-min check? [SUGGESTIONS: I'm ready!, Tell me more, Why is this important?]",
                    role: 'model'
                });
            }
            return res.json({ text: "Ready to test your skills! Which paper would you like to practice?\n\n1. 📖 Reading\n2. ✍️ Writing\n3. 🎧 Listening\n4. 🗣️ Speaking" });
        }

        // Only trigger these if they are absolute short-hands
        const isAbsoluteShorthand = msgLower.length < 15 || msgLower.match(/^\d\.?\s*$/);
        if (isAbsoluteShorthand) {
            if (isReading || isWriting || isListening || isSpeaking) {
                if (!user?.diagnostic_completed) {
                    return res.json({
                        text: "Great energy! But before we dive into specific papers, let's complete your Study Calibration to unlock your full roadmap. Ready?",
                        role: 'model'
                    });
                }
                if (isReading) return res.json({ text: "Excellent choice! Here are the available Reading Mock Exams. [LIST_MOCKS: Reading]" });
                if (isWriting) return res.json({ text: "Great! Let's work on your Writing. [LIST_MOCKS: Writing]" });
                if (isListening) return res.json({ text: "Listening it is! Here are the mocks: [LIST_MOCKS: Listening]" });
                if (isSpeaking) return res.json({ text: "Let's practice Speaking! Pick a topic: [LIST_MOCKS: Speaking]" });
            }
        }
    }

    // --- PRIORITY 3: INTENT ROUTER (Intelligence for Natural Language) ---
    const { image } = req.body;
    let route = { intent: 'CHAT', bridge_text: null, ui_command: null };

    const startTime = Date.now();
    console.log(`[Trace] Chat Router Start: ${new Date(startTime).toLocaleTimeString()}`);

    if (!image && !audio) {
        try {
            const msgLower = (message || "").toLowerCase().trim();
            const isQuestion = msgLower.includes("?");
            const isGreeting = ["hi", "hello", "hey", "yo", "good morning", "good afternoon", "morning"].some(k => msgLower.startsWith(k));
            const isIdentityQuery = ["who are you", "what is your name", "your name", "who is this"].some(k => msgLower.includes(k));

            // Keywords that definitely NEED the AI Router
            const needsRouter = ["diagnostic", "calibration", "test", "exam", "quiz", "practice", "lab", "start", "launch", "roadmap"].some(k => msgLower.includes(k));

            // SMART SHORT-CIRCUIT: Skip AI Router for obvious chat
            if ((isQuestion || isGreeting || isIdentityQuery) && !needsRouter && msgLower.length < 60) {
                console.log(`[IntentRouter] ⚡ Short-circuit hit for: "${message}"`);
                // Use default route (CHAT)
            } else {
                const shortHistory = clientHistory ? clientHistory.slice(-3) : [];
                route = await IntentRouter.classify(message || "", shortHistory, uid, {
                    diagnostic_completed: user?.diagnostic_completed,
                    is_new_student: isNewStudent,
                    has_active_exam: !!user?.activeExam
                });
                console.log(`[IntentRouter] AI Classify: "${message}" -> Detected Intent: ${route.intent} (took ${Date.now() - startTime}ms)`);
            }

            if (route.ui_command) console.log(`[IntentRouter] Target Module: ${route.ui_command.module}`);

            if (route.intent === 'ONBOARDING') {
                console.log("[IntentRouter] Detected Onboarding Intent.");

                // Redirect only if clearly requesting a launch and not already completed
                const isExplicitStart = msgLower.includes("start") || msgLower.includes("go to") || msgLower.includes("i'm ready") || msgLower.includes("launch");
                const canRedirect = !user?.diagnostic_completed || msgLower.includes("reset") || msgLower.includes("retake");

                if (isExplicitStart && canRedirect) {
                    console.log("[IntentRouter] Explicit Onboarding Start detected. Returning Redirect Tag.");
                    return res.json({
                        text: "[REDIRECT_DIAGNOSTIC] Excellent choice! I'm prepping the calibration room for you. Let's get this done so we can build your roadmap. Good luck!",
                        role: 'model'
                    });
                }
                // Fall through to CHAT if it's an inquiry or already completed
            } else if ((route.intent === 'LAB' || route.intent === 'EXAM_ROUTER') && !user?.diagnostic_completed) {
                console.log(`[IntentRouter] Intercepting ${route.intent} for new student ${uid}. Enforcing Diagnostic.`);
                return res.json({
                    text: `I'd love to help you with that! But to give you the best, most targeted advice, I need to assess your current level first. Let's start with a quick 15-minute Study Calibration to unlock your full roadmap. Ready? [SUGGESTIONS: Yes please!, Tell me more, Why is this important?]`,
                    role: 'model'
                });
            }
            else if (route.intent === 'LAB' && route.ui_command) {
                console.log("[IntentRouter] Triggering Launch Card Payload:", JSON.stringify(route.ui_command));
                return res.json({
                    text: route.bridge_text || "Opening Learning Lab...",
                    customComponent: 'launch_card',
                    payload: route.ui_command,
                    role: 'model'
                });
            } else if (route.intent === 'EXAM_ROUTER') {
                console.log("[IntentRouter] Triggering Exam Router Flow:", JSON.stringify(route.ui_command));
                const type = route.ui_command?.params?.type || "Speaking";
                return res.json({
                    text: route.bridge_text || `I'd love to help you practice ${type}! Here are the available Mock Exams:`,
                    customComponent: 'exam_link',
                    examType: type.toLowerCase(),
                    role: 'model'
                });
            }
        } catch (rErr) {
            console.error("[IntentRouter] Error:", rErr);
        }
    }

    // --- PRIORITY 4: STANDARD AI FLOW (Fallback) ---
    let dbUpdated = false;

    console.log(`[Trace] User profile loaded for ${uid}. Level: ${user.level}`);
    let systemPrompt = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace;

    // skillMap and isNewStudent are already loaded at 0. PRE-LOAD USER CONTEXT
    console.log(`[Trace] isNewStudent for ${uid}: ${isNewStudent}. skillMap exists: ${!!skillMap}`);
    const ragSnippets = message ? retrieveKnowledge(message) : null;
    const goldenNuggets = agentId === 'english' ? await UserProfileService.getGoldenNuggets(uid, 'english') : [];

    // --- POST-DIAGNOSTIC RECAP LOGIC ---
    // --- INTELLIGENT RESULT RECAP (MENTOR ANALYSIS) ---
    const isSystemTrigger = message && message.startsWith('[SYSTEM:');
    if (isSystemTrigger) {
        console.log(`[Trace] Intelligent Recap Triggered for ${uid}: ${message}`);

        // 1. Award XP for Diagnostic if applicable
        if (message.includes('DIAGNOSTIC_JUST_COMPLETED')) {

            const diagnosticResult = await UserProfileService.getDiagnosticResult(uid, 'english');
            const currentPlan = await RoadmapService.getCurrentPlan(uid);

            if (diagnosticResult) {
                systemPrompt += `\n### URGENT TASK: DIAGNOSTIC RECAP
The student has just completed the "Study Calibration".
**Archetype**: ${diagnosticResult.archetype}
**Overall Level**: ${diagnosticResult.overall_level}/5**
**Strengths**: ${diagnosticResult.strengths ? diagnosticResult.strengths.join(', ') : 'Determination'}
**Weaknesses**: ${diagnosticResult.weaknesses ? diagnosticResult.weaknesses.join(', ') : 'Grammar'}

**ACTUAL PERSONALIZED WEEKLY QUESTS**:
${currentPlan?.tasks?.filter(t => t.id !== 'boss').map((t, i) => `${i + 1}. ${t.title}`).join('\n')}

**Mentor Goal**: Welcome them, explain their archetype, and explicitly mention their **Personalized Weekly Quests** listed above as their immediate roadmap. **GOLDEN NUGGET**: Based on their weaknesses, provide 1 specific, actionable piece of advice using the [SAVE_NUGGET: Advice text | Topic] tag. Use a warm, encouraging tone.`;
            }
        }

        // 2. Lab Completion Recap
        if (message.includes('LAB_JUST_COMPLETED')) {
            const topicMatch = message.match(/LAB_JUST_COMPLETED:\s*([^\]]+)\]/);
            const topic = topicMatch ? topic[1] : "Learning Lab";

            // --- QUEST UPDATE START (Unified) ---
            try {
                const { completedQuests } = await RoadmapService.completeQuestByContext(uid, topic, false);
                if (completedQuests && completedQuests.length > 0) {
                    completedQuests.forEach(q => systemPrompt += `\n[SYSTEM: QUEST_COMPLETED: ${q}]`);
                    console.log(`[Roadmap] Quest Completed via Lab: ${completedQuests.join(', ')}`);
                }
            } catch (qErr) { console.error("[Quest Update Lab] Error:", qErr); }
            // --- QUEST UPDATE END ---

            systemPrompt += `\n### URGENT TASK: LAB RECAP
The student just successfully completed a mission in the **English Learning Lab**.
**Topic**: ${topic}
**Mentor Goal**: Celebrate their mastery of ${topic}. Briefly summarize why ${topic} is crucial for DSE Paper 1/2 success. **GOLDEN NUGGET**: Extract one key learning point from this module and include it as a [SAVE_NUGGET: Advice text | ${topic}] tag. Finally, suggest "Leveling up" to a related Mock Exam or a more advanced Grammar lab.`;
        }

        // 3. Mock Exam Completion Recap
        if (message.includes('EXAM_JUST_COMPLETED')) {
            const examIdMatch = message.match(/EXAM_JUST_COMPLETED:\s*([^\]]+)\]/);
            const examId = examIdMatch ? examIdMatch[1] : "Mock Exam";

            // --- QUEST UPDATE START (Unified) ---
            try {
                const { completedQuests } = await RoadmapService.completeQuestByContext(uid, examId, true);
                if (completedQuests && completedQuests.length > 0) {
                    completedQuests.forEach(q => systemPrompt += `\n[SYSTEM: QUEST_COMPLETED: ${q}]`);
                    console.log(`[Roadmap] Quest Completed via Mock: ${completedQuests.join(', ')}`);
                }
            } catch (qErr) { console.error("[Quest Update Exam] Error:", qErr); }
            // --- QUEST UPDATE END ---

            // Fetch most recent submission
            let examResult = null;
            try {
                const subSnap = await db_firestore.collection('exam_submissions')
                    .where('uid', '==', uid)
                    .orderBy('timestamp', 'desc')
                    .limit(1)
                    .get();
                if (!subSnap.empty) examResult = subSnap.docs[0].data();
            } catch (e) { console.error("Exam fetch error", e); }

            if (examResult) {
                systemPrompt += `\n### URGENT TASK: MOCK EXAM ANALYSIS
The student has just finished a Mock Exam (${examId}).
**Score**: ${examResult.percentage}% (${examResult.totalScore}/${examResult.totalMaxScore})
**Part Breakdown**: ${JSON.stringify(examResult.partScores)}
**Mentor Goal**: Provide a professional, high-precision analysis of this score. 
- If score < 50%: Focus on fundamentals and vocab. Propose a specific Lab.
- If score > 70%: Focus on technique and "Level 5" vocabulary.
- Propose the EXACT next paper or lab topic they should tackle to push for their target grade.`;
            }
        }

        if (message.includes('MOCK_COMPLETED')) {
            const dataMatch = message.match(/MOCK_COMPLETED:\s*([^\]]+)\]/);
            const rawData = dataMatch ? dataMatch[1] : "Writing";
            const improvements = message.split('Improvement Advice: ')[1] || "Focus on technique.";

            // --- QUEST UPDATE START (Unified) ---
            try {
                // "Writing" or "Speaking" -> Trigger MOCK completion (allows Boss)
                const { completedQuests } = await RoadmapService.completeQuestByContext(uid, rawData, true);
                if (completedQuests && completedQuests.length > 0) {
                    completedQuests.forEach(q => systemPrompt += `\n[SYSTEM: QUEST_COMPLETED: ${q}]`);
                    console.log(`[Roadmap] Quest Completed via Writing/Speaking: ${completedQuests.join(', ')}`);
                }
            } catch (qErr) { console.error("[Quest Update Mock] Error:", qErr); }
            // --- QUEST UPDATE END ---

            systemPrompt += `\n### URGENT TASK: MOCK EXAM RECAP
The student just finished a ${rawData} Mock Exam.
**Initial Grading Metadata**: ${rawData}
**Key Improvement Areas from Examiner**: ${improvements}

**Mentor Goal**: 
1. Recap their results warmly.
2. For each "Golden Nugget" (advice), you MUST include the [SAVE_NUGGET: Advice text | Practice Topic] tag at the very end of your response so I can save it to their notebook.
3. Suggest a specific practice topic they can launch now to improve.`;
        }

        // Signal to the model that it's in a "Premium Mentor Analysis" mode
        systemPrompt += `\n\n**INSTRUCTION**: You are currently performing a DEEP ANALYSIS turn. Be more insightful and detailed than usual. Provide a clear path forward.`;
    }

    // --- ENGLISH AGENT (MISS JANIE) SYSTEM PROMPT INJECTION ---
    if (agentId === 'english') {
        systemPrompt = systemPrompt
            .replace('{{DATE}}', new Date().toDateString())
            .replace('{{LEVEL}}', skillMap?.overall_level || skillMap?.level || 1)
            .replace('{{GRADE}}', user.grade || 'F6')
            .replace('{{PATH}}', user.targetGradeEng || 'Level 4')
            .replace('{{ONBOARDING}}', isNewStudent ? ONBOARDING_PROTOCOL : "")
            .replace('{{WORKFLOW_INSTRUCTIONS}}', ""); // Placeholder for future generic workflow logic

        // --- INJECT WEEKLY QUEST CONTEXT (HUMANITY INTELLIGENCE) ---
        // GATED: Only show quests for students who completed calibration
        if (!isNewStudent && user?.diagnostic_completed) {
            try {
                const plan = await RoadmapService.getCurrentPlan(uid);
                if (plan && plan.tasks) {
                    const pendingCount = plan.tasks.filter(t => t.status === 'PENDING').length;
                    if (pendingCount > 0) {
                        const pendingTasks = plan.tasks.filter(t => t.id !== 'boss' && t.status === 'PENDING');
                        const daysLeft = moment(plan.expiresAt.toDate()).diff(moment(), 'days');
                        const expiryDate = moment(plan.expiresAt.toDate()).format('dddd, MMM Do');
                        systemPrompt += `\n\n[SYSTEM: WEEKLY_QUEST_CONTEXT]
- Current Pending Weekly Quests: ${pendingCount}. 
- **PENDING QUEST TITLES**:
${pendingTasks.map((t, i) => `  ${i + 1}. ${t.title}`).join('\n')}
- Days until expiry: ${daysLeft} days (Expires on ${expiryDate} HK Time).
- **MENTOR INSTRUCTION**: Naturally mention the pending weekly targets in your check-in or closing. 
- Example: "By the way, your weekly targets expire on ${expiryDate}! Do you want to knock one out together after we finish this?"
- **GOLDEN NUGGET**: If the student expresses anxiety or high motivation about these quests, give them a "Success Secret" nugget using the [SAVE_NUGGET: Tip | Quest Guide] tag.
- **CRITICAL**: Use the exact names of the Pending Quests listed above. Do not hallucinate.`;
                    }
                }
            } catch (roadmapErr) {
                console.error("Roadmap context injection failed:", roadmapErr);
            }
        }

        // Output Language Handling (From Chat Interface Toggle)
        const outputLanguage = req.body.outputLanguage;
        if (outputLanguage === 'zh-HK') {
            systemPrompt += `\n**IMPORTANT LANGUAGE OVERRIDE**:
The student prefers to communicate in **Traditional Chinese (Cantonese Context)**.
- If the subject allows (e.g. Chatting, Explaining ideas), use friendly Cantonese (e.g. 係呀, 其實...).
- If teaching specific English phrases, keep the target phrase in English but explain in Chinese.
- **NEVER** output Simplified Chinese.
`;
        }

        // Pronunciation Feedback (Voice Recording)
        if (pronunciationFeedback) {
            if (!pronunciationFeedback.isEnglish) {
                // Student spoke Chinese or other non-English language
                const langName = pronunciationFeedback.detectedLanguage.startsWith('zh') ? 'Chinese' : pronunciationFeedback.detectedLanguage;
                systemPrompt += `\n\n[IMPORTANT - PRONUNCIATION FEEDBACK]
The student just used voice recording but spoke in ${langName} instead of English!
Transcript: "${pronunciationFeedback.transcript}"

Your Response:
1. Gently call them out with a friendly tone (e.g., "I noticed you spoke in ${langName}! 😊")
2. Remind them this feature is for English pronunciation practice
3. Encourage them to try again in English
4. Be supportive and explain how pronunciation feedback helps their speaking skills

Example: "Hey there! I heard you speaking ${langName} 😊 This voice recording feature is designed to help you practice English pronunciation and get feedback on your accent. Give it another try in English, and I'll give you helpful tips on how to improve!"`;
            } else if (!pronunciationFeedback.transcript || pronunciationFeedback.transcript.length < 10) {
                // Too short or unclear
                systemPrompt += `\n\n[IMPORTANT - PRONUNCIATION FEEDBACK]
The student's recording was too short or unclear.
Transcript: "${pronunciationFeedback.transcript || '(empty)'}"

Your Response:
1. Let them know you couldn't catch what they said
2. Ask them to speak a full sentence in English
3. Give them a simple example to try (e.g., "Try saying: 'Hello, my name is...'")`;
            } else {
                // Valid English - provide pronunciation feedback
                const confidencePercent = (pronunciationFeedback.overallConfidence * 100).toFixed(1);

                // Find words with low confidence (< 0.7) for specific feedback
                const lowConfidenceWords = pronunciationFeedback.wordDetails
                    ?.filter(w => w.confidence < 0.7)
                    .map(w => `"${w.word}" (${(w.confidence * 100).toFixed(0)}%)`)
                    .slice(0, 3) || [];

                const wordLevelFeedback = lowConfidenceWords.length > 0
                    ? `\n\nWords to practice: ${lowConfidenceWords.join(', ')}`
                    : '';

                systemPrompt += `\n\n[PRONUNCIATION ANALYSIS]
The student recorded: "${pronunciationFeedback.transcript}"
Overall Pronunciation Confidence: ${confidencePercent}%
Detected Language: English ✓
${wordLevelFeedback}

Your Response Guidelines:
1. **Acknowledge** what they said (repeat the transcript)
2. **Praise** their overall pronunciation (mention the confidence score)
3. **Specific Tips** (if confidence < 85%):
   - If low-confidence words exist, give tips on those specific words
   - Focus on common issues: consonant clarity, vowel sounds, word stress
   - Example: "Try emphasizing the 'T' sound in 'pretty' more clearly"
4. **Encourage** them to keep practicing
5. **Suggest** next steps:
   - If confidence >= 85%: Suggest longer/more complex sentences
   - If confidence < 85%: Suggest practicing the difficult words
   - Always encourage speaking more naturally

Example Response:
"Great job! I heard you say '${pronunciationFeedback.transcript}'. Your pronunciation was ${confidencePercent >= 85 ? 'excellent' : 'good'} (${confidencePercent}% accuracy). ${lowConfidenceWords.length > 0 ? `I noticed a few words that could use some practice: ${lowConfidenceWords.join(', ')}. Try slowing down and emphasizing the consonants in these words.` : 'Your clarity and fluency are impressive!'} Keep up the great work!"`;
            }
        }

        if (ragSnippets) systemPrompt += `\nReference (RAG):\n${ragSnippets}`;

        // Inject student notebook (Golden Nuggets)
        if (goldenNuggets && goldenNuggets.length > 0) {
            systemPrompt += `\n\n### STUDENT NOTEBOOK (Golden Nuggets)\nThese are tips and advice you previously gave this student. Do not repeat them unless they ask for a refresher:\n${goldenNuggets.map((n, i) => `${i + 1}. ${n}`).join('\n')}`;
        }

        // Inject Enhanced Detailed Micro-Skills
        if (skillMap) {
            const microSkills = skillMap.microSkills || {};
            const weaknessPriority = skillMap.weaknessPriority || [];

            let detailedSkillContext = "\n### STUDENT DETAILED MICRO-SKILLS ANALYSIS\n";

            if (Object.keys(microSkills).length > 0) {
                // Group by paper
                const grouped = {};
                Object.entries(microSkills).forEach(([id, skill]) => {
                    const paper = id.split('_')[0];
                    if (!grouped[paper]) grouped[paper] = [];
                    grouped[paper].push(`${id.replace(paper + '_', '')}: Level ${skill.level || skill}`);
                });

                Object.entries(grouped).forEach(([paper, skills]) => {
                    detailedSkillContext += `**${paper.toUpperCase()}**: ${skills.join(', ')}\n`;
                });
            } else {
                detailedSkillContext += `(No micro-skill data calibrated yet)\n`;
            }

            if (weaknessPriority.length > 0) {
                detailedSkillContext += `\n**PRIORITY IMPROVEMENT PLAN (Weaknesses)**:\n`;
                weaknessPriority.slice(0, 5).forEach(w => {
                    detailedSkillContext += `- ${w.skillName}: ${w.recommendedAction}\n`;
                });
            }

            systemPrompt += detailedSkillContext;

            systemPrompt += `\n**MENTOR INSTRUCTION**: Always check the student's current status (Calibration done or not) and micro-skill levels above to tailor your advice. 
- If a student hasn't completed calibration, your ONLY priority is to help them feel ready for it.
- If calibrated, use their Level 1-3 skills for practice suggestions. Reference their Priority Improvement Plan for long-term study.
- NEVER suggest weekly targets if they are not provided in the [SYSTEM: WEEKLY_QUEST_CONTEXT] section.`;
        }
    }



    // Initialize history for this agent if not exists  (In-memory only for this scope, real storage handled later)
    // No need to write to db.json anymore



    console.log(`[Trace] Routing request for agent ${agentId}...`);
    const { model: selectedModelName, useAceSir } = routeRequest(message, !!req.body.image);

    const isExamMode = !!user.activeExam;
    if (useAceSir && !isExamMode) {
        systemPrompt = `${ACE_SIR_INJECTION}\n\n${systemPrompt}`;
    }

    try {
        const { image } = req.body;


        console.log(`[Trace] Attempting model: ${selectedModelName}`);
        console.log(`[Trace] Final System Prompt Snippet: ${systemPrompt.substring(0, 500)}...`);
        console.log(`[Trace] System Prompt Gating Check - isNewStudent: ${isNewStudent}, diagComp: ${user?.diagnostic_completed}`);

        await GenerativeAIService.init();
        const model = GenerativeAIService.getModel({
            model: selectedModelName,
            systemInstruction: systemPrompt
        });

        console.log(`[Trace] System Prompt Length: ${systemPrompt.length} chars`);

        // --- HISTORY SANITIZATION ---
        console.log("[Trace] Sanitizing history...");
        let sanitizedHistory = [];
        if (clientHistory && Array.isArray(clientHistory)) {
            // Prune history: Take last 10 turns to save tokens
            const historyWindow = clientHistory.slice(-10);

            let lastRole = null;
            for (const turn of historyWindow) {
                if (!turn.role || !turn.parts || !Array.isArray(turn.parts) || turn.parts.length === 0) continue;
                const currentRole = turn.role === 'user' ? 'user' : 'model';
                const validParts = turn.parts.map(p => ({
                    text: p.text || "" // Ensure string
                })).filter(p => p.text.trim() !== "");

                if (validParts.length === 0) continue;

                if (currentRole !== lastRole) {
                    sanitizedHistory.push({ role: currentRole, parts: validParts });
                    lastRole = currentRole;
                } else {
                    const lastEntry = sanitizedHistory[sanitizedHistory.length - 1];
                    if (lastEntry && turn.parts[0].text) {
                        lastEntry.parts[0].text += "\n" + turn.parts[0].text;
                    }
                }
            }
        }

        // Gemini Constraint: History must START with 'user'
        while (sanitizedHistory.length > 0 && sanitizedHistory[0].role === 'model') {
            sanitizedHistory.shift();
        }

        const chat = model.startChat({
            history: sanitizedHistory,
            generationConfig: { maxOutputTokens: 2048 }, // Optimized response length
        });

        let result;
        console.log("[Trace] Sending message to Gemini via Resilient Service...");

        // For audio input, use the transcript as the message
        const messageToSend = message || (pronunciationFeedback ? `[Voice Recording: ${pronunciationFeedback.transcript}]` : "");
        const payload = image ? [
            { text: messageToSend },
            { inlineData: { data: image.data, mimeType: image.mimeType } }
        ] : messageToSend;

        try {
            // Use the centralized service with built-in retries and failover
            result = await GenerativeAIService.sendMessage(chat, payload, { model: selectedModelName });

            // Log Usage
            if (result.response && result.response.usageMetadata) {
                TokenService.logUsage(uid, 'chat', result.response.usageMetadata);
            }
            console.log(`[Trace] Gemini response received. Total Turn Time: ${Date.now() - startTime}ms`);
        } catch (geminiError) {
            console.error(`❌ [Trace] Persistent Gemini Failure after retries (total time: ${Date.now() - startTime}ms):`, geminiError.message);

            // AUTO-RECOVERY: TRY STATELESS GENERATION AS FINAL RESORT
            try {
                console.log("[Trace] Attempting STATELESS generation as final resort...");
                result = await GenerativeAIService.generateContent(messageToSend, { model: selectedModelName });
                console.log("[Trace] Stateless Recovery Successful!");
            } catch (finalError) {
                console.error("❌ [Trace] Global AI Failure:", finalError.message);
                throw finalError; // Give up
            }
        }
        const response = result.response;
        let text = response.text();

        // FIX: Unwrap JSON if AI returns structured output
        if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
            try {
                const parsed = JSON.parse(text);
                if (parsed.response) text = parsed.response;
                else if (parsed.text) text = parsed.text;
                else if (parsed.message) text = parsed.message;
                // If no key matches, keep original text (it might be a code block)
            } catch (e) {
                // Not valid JSON, ignore
            }
        }

        // FIX: Strip technical markdown code blocks (e.g. ```tool_code ... ```)
        text = text.replace(/```tool_code[\s\S]*?```/g, "").trim();

        // --- TAG PARSING LOGIC ---
        let dbUpdated = false;

        // *   **Final Output:** Assign DSE Level 1-5 via `[SET_LEVEL: X]`. Once the **entire** 5-part diagnostic is finished, you MUST include the tag `[DIAGNOSTIC_COMPLETE]` in your final summary response.
        // 1. Check [SET_LEVEL: X]
        const levelMatch = text.match(/\[SET_LEVEL:\s*(\d+)\]/);
        if (levelMatch) {
            user.level = parseInt(levelMatch[1]);
            user.xp += 100;
            dbUpdated = true;
            text = text.replace(levelMatch[0], "");
        }

        // [SAVE_NUGGET: Advice text | Practice Topic]
        const saveNuggetMatches = text.matchAll(/\[SAVE_NUGGET:\s*([^|\]]+)(?:\|\s*([^\]]+))?\]/g);
        for (const match of saveNuggetMatches) {
            const content = match[1].trim();
            const practiceTopic = match[2] ? match[2].trim() : null;
            try {
                await UserProfileService.saveGoldenNugget(uid, agentId, content, practiceTopic);
            } catch (err) {
                console.error("Failed to save nugget:", err);
            }
            text = text.replace(match[0], "");
        }

        // Legacy support/Table cleanup
        text = text.replace(/\[GOLDEN_NUGGET:\s*[^\]]+\]/g, "");

        // [DIAGNOSTIC_COMPLETE]
        if (text.includes('[DIAGNOSTIC_COMPLETE]')) {
            user.diagnostic_completed = true;
            dbUpdated = true;
            text = text.replace('[DIAGNOSTIC_COMPLETE]', "");
        }


        // (Languge/Grade matches...)
        const langMatch = text.match(/\[SET_LANG:\s*(\w+)\]/);
        if (langMatch) {
            user.preferredLanguage = langMatch[1];
            dbUpdated = true;
            text = text.replace(langMatch[0], "");
        }
        const gradeMatch = text.match(/\[SET_GRADE:\s*(\d+)\]/);
        if (gradeMatch) {
            user.grade = parseInt(gradeMatch[1]);
            dbUpdated = true;
            text = text.replace(gradeMatch[0], "");
        }

        // Save tagged updates to Firestore if any
        if (dbUpdated) {
            try {
                await UserProfileService.createOrUpdateProfile(uid, user);
                console.log(`[Firestore] Profile updated for ${uid} (Tagged changes)`);
            } catch (saveErr) {
                console.error("[Firestore] Tagged update failed:", saveErr);
            }
        }

        // Clear active exam if completed
        if (text.includes('[EXAM_COMPLETED]')) {
            // Logic to clear exam state in Firestore (collection 'exam_state' or similar)
            // For now, we assume frontend handles navigation.
            text = text.replace('[EXAM_COMPLETED]', "");
        }

        // Save AI reply to history
        let cleanText = text.trim();

        // --- HYBRID STORAGE: History Persistence & TTL ---
        if (db_firestore) {
            try {
                const historyRef = db_firestore.collection('users').doc(uid).collection('chat_history');
                const timestamp = new Date();
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7); // 7-day TTL

                await historyRef.add({
                    agentId: agentId,
                    role: 'assistant',
                    content: cleanText,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
                });

                // Also save the user's last message if not already synced
                await historyRef.add({
                    agentId: agentId,
                    role: 'user',
                    content: message,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt)
                });

                console.log(`[Firestore] History synced for ${uid}`);
            } catch (err) {
                console.warn(`[Firestore] Failed to sync history for ${uid}: `, err);
            }
        }

        // We no longer support writing to db.json

        res.json({ text: cleanText });
        return;
    } catch (error) {
        console.error("\n❌❌❌❌❌ ERROR IN CHAT ENDPOINT ❌❌❌❌❌");
        console.error(`UID: ${req.body.uid}`);
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
        console.error("❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌\n");

        console.dir(error, { depth: null });

        const errorLog = `
    === ERROR REPORT ===
        Time: ${new Date().toISOString()}
Model: ${selectedModelName}
Error: ${error.message}
Stack: ${error.stack}
${error.response ? "Response: " + JSON.stringify(error.response, null, 2) : ""}
====================
`;
        fs.appendFileSync(path.join(__dirname, 'chat_error.log'), errorLog);

        // Fallback...
        const mockReply = getMockResponse(agentId);
        return res.json({ reply: mockReply, isSystemResponse: true });
    }
});

// History Endpoint
app.get('/api/history/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const { uid } = req.query;

        if (!uid) {
            return res.json([]);
        }

        console.log(`[History] Fetching for ${uid} via Service...`);
        const history = await UserProfileService.getChatHistory(uid, agentId);
        res.json(history);
    } catch (e) {
        console.error("History Route Error:", e);
        res.status(500).json([]);
    }
});

app.delete('/api/history/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const { uid } = req.query;

        console.log(`[History] Clear request for ${uid} (Agent: ${agentId})`);

        if (!uid) {
            return res.status(400).json({ error: "Missing uid" });
        }

        await UserProfileService.clearChatHistory(uid, agentId);
        res.json({ success: true });
    } catch (e) {
        console.error("Clear History Error:", e);
        res.status(500).json({ error: "Failed to clear history" });
    }
});



// --- WRITING MOCK EXAM ENDPOINTS ---

app.get('/api/writing/exams', (req, res) => {
    try {
        const writingDir = path.join(__dirname, 'generated_mocks', 'writing');
        if (!fs.existsSync(writingDir)) return res.json([]);

        const files = fs.readdirSync(writingDir).filter(f => f.endsWith('.json'));
        const exams = files.map(filename => {
            try {
                const content = JSON.parse(fs.readFileSync(path.join(writingDir, filename), 'utf8'));
                const meta = content.meta || {};
                return {
                    id: filename.replace('.json', ''),
                    title: meta.title || content.title || filename,
                    topic: meta.topic || content.topic || "Writing Paper",
                    generated_at: meta.generated_at || content.created_at || new Date().toISOString(),
                    type: 'writing'
                };
            } catch (err) {
                console.error(`Failed to parse writing mock ${filename}:`, err);
                return null;
            }
        }).filter(e => e !== null);
        // Sort by newest first
        res.json(exams.sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at)));
    } catch (error) {
        console.error("Error listing writing exams:", error);
        res.status(500).json({ error: "Failed to list writing exams" });
    }
});

app.get('/api/writing/exam/:id', (req, res) => {
    try {
        const filename = `${req.params.id}.json`;
        const filepath = path.join(__dirname, 'generated_mocks', 'writing', filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ error: "Writing Exam not found" });
        }

        const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        res.json(content);
    } catch (error) {
        console.error("Error fetching writing exam:", error);
        res.status(500).json({ error: "Failed to fetch writing exam" });
    }
});

// --- EXISTING ENDPOINTS ---
// Paper Migration endpoint (Internal Use)
app.get('/api/paper/:year', (req, res) => {
    console.log(`[Server] Migration request received for year: ${req.params.year}`);
    try {
        const filePath = path.join(__dirname, 'past_papers', req.params.year, `2023_Eng_Paper1_Reading.json`);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Paper not found on server." });

        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (e) {
        console.error("Paper Fetch Error:", e);
        res.status(500).json({ error: "Failed to read paper data." });
    }
});

// --- WRITING DEBUG API ---
app.post('/api/debug/writing/cheat', async (req, res) => {
    try {
        const { question, situation, requirements, level } = req.body;
        console.log(`🤖 Generating Level ${level} Writing Mock Response...`);

        const prompt = writingCheatAgent
            .replace('{QUESTION_TEXT}', question || "General Writing Task")
            .replace('{SITUATION}', situation || "N/A")
            .replace('{REQUIREMENTS}', Array.isArray(requirements) ? requirements.join('\n- ') : (requirements || "N/A"))
            .replace(/{TARGET_LEVEL}/g, level);

        const result = await GenerativeAIService.generateContent(prompt, {
            model: TIER_1_MODEL,
            generationConfig: { responseMimeType: "text/plain" }
        });

        // Log Usage
        if (result.response && result.response.usageMetadata) {
            const { uid } = req.body;
            TokenService.logUsage(uid || 'system', 'writing_cheat', result.response.usageMetadata);
        }

        const text = result.response.text().trim().replace(/```[\s\S]*?\n/g, '').replace(/```/g, '').trim();
        res.json({ text });
    } catch (error) {
        console.error("Cheat Gen Error:", error);
        res.status(500).json({ error: "Failed to generate cheat answer" });
    }
});

// --- WRITING GRADING API ---
app.post('/api/writing/grade', async (req, res) => {
    try {
        const { question, requirements, answer } = req.body;
        console.log(`📝 Grading Writing Submission...`);

        const prompt = writingGradingAgent
            .replace('{QUESTION_TEXT}', question || "General writing task")
            .replace('{REQUIREMENTS}', Array.isArray(requirements) ? requirements.join(', ') : (requirements || "Standard requirements"))
            .replace('{STUDENT_ANSWER}', answer);

        const result = await GenerativeAIService.generateContent(prompt, {
            model: TIER_2_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });

        // Log Usage
        if (result.response && result.response.usageMetadata) {
            const { uid } = req.body;
            TokenService.logUsage(uid || 'system', 'writing_grade', result.response.usageMetadata);
        }

        const jsonResponse = JSON.parse(result.response.text());

        // Save to Firestore (optional but good for history)
        // await db_firestore.collection('writing_results').add({ ...jsonResponse, timestamp: new Date() });

        // AWARD XP
        const { uid } = req.body;
        let xpGranted = 0;
        if (uid) {
            try {
                await UserProfileService.awardXP(uid, 150, "Writing Mock Part");
                xpGranted = 150;
            } catch (err) {
                console.error("Failed to award XP:", err);
            }
        }

        res.json({ ...jsonResponse, xpEarned: xpGranted });
    } catch (error) {
        console.error("Grading Error:", error);
        res.status(500).json({ error: "Failed to grade writing" });
    }
});

// --- GRADE EXAM ENDPOINT ---
app.post('/api/submit-exam', async (req, res) => {
    const { examId, uid, answers, duration } = req.body; // duration in seconds
    // answers is { "A_q1": "Answer Text", "B1_q2": "C" }

    if (!examId || !uid) return res.status(400).json({ error: "Missing examId or uid" });
    if (!db_firestore) return res.status(503).json({ error: "Database unavailable" });

    try {
        console.log(`[Grading] Processing submission for ${examId} by ${uid}`);

        // 1. Fetch Marking Keys (Protected)
        let keysSnap = await db_firestore.collection('mock_exams').doc(examId).collection('marking_keys').get();
        let markingKeys = {};
        let questionsMap = {};

        if (keysSnap.empty) {
            console.log(`[Grading] Keys not in Firestore, checking subdirectories for ${examId}...`);
            // FALLBACK: Check subdirectories for local JSON file
            const folders = ['reading', 'writing', 'listening', 'speaking'];
            let localFile = null;

            for (const folder of folders) {
                const checkPath = path.join(__dirname, 'generated_mocks', folder, `${examId}.json`);
                if (fs.existsSync(checkPath)) {
                    localFile = checkPath;
                    break;
                }
            }

            if (localFile) {
                try {
                    const localData = JSON.parse(fs.readFileSync(localFile, 'utf8'));
                    console.log(`[Grading] Found local mock file at ${localFile}. Extracting keys...`);

                    // Extract Questions and Keys from Parts (A, B1, B2)
                    ['Part_A', 'Part_B1', 'Part_B2', 'Part_B'].forEach(part => {
                        if (localData[part] && localData[part].questions) {
                            localData[part].questions.forEach((q, idx) => {
                                // IMPORTANT: Use consistent FE IDs (Part_A_q0) to match what ExamPage.jsx sends
                                const feId = `${part}_q${idx}`;

                                // Populate Questions Map (Reference for Marks/Type)
                                questionsMap[feId] = { ...q, mark: q.marks, part: part };

                                // Populate Marking Keys
                                markingKeys[feId] = {
                                    answer: q.answer || q.model_answer,
                                    logic: q.logic,
                                    type: q.type
                                };
                            });
                        }
                    });
                } catch (err) {
                    console.error("Failed to parse local mock:", err);
                    return res.status(500).json({ error: "Corrupt local mock file" });
                }
            } else {
                return res.status(404).json({ error: "Exam marking keys not found (DB or Local)" });
            }
        } else {
            // Firestore path
            const qSnap = await db_firestore.collection('mock_exams').doc(examId).collection('questions').get();
            qSnap.forEach(doc => {
                questionsMap[doc.id] = doc.data();
            });

            keysSnap.forEach(doc => {
                markingKeys[doc.id] = doc.data();
            });
        }

        let totalScore = 0;
        let totalMaxScore = 0;
        const feedback = {}; // { "A_q1": { correct: true/false, score: 2, max: 2, logic: "..." } }
        const partScores = {}; // { "Part_A": { score: 10, max: 20 } }

        // Loop through all questions in the Exam (not just what user answered)
        Object.keys(questionsMap).forEach(qId => {
            const qData = questionsMap[qId];
            const keyData = markingKeys[qId];
            const userAns = answers[qId];
            const maxMarks = parseInt(qData.marks || 1);
            const part = qData.part || "Unknown";

            // Initialize Part stats
            const partKey = part.toLowerCase().replace(/[\s_]+/g, '').includes('a') ? 'Part_A' :
                part.toLowerCase().includes('b2') ? 'Part_B2' : 'Part_B1';

            if (!partScores[partKey]) partScores[partKey] = { score: 0, max: 0 };
            partScores[partKey].max += maxMarks;
            totalMaxScore += maxMarks;

            let earned = 0;
            let isCorrect = false;

            if (keyData) {
                // Grading Logic
                const correctAns = keyData.answer;

                if (userAns) {
                    // Simple Grading: Exact Match (case insensitive for text)
                    if (String(userAns).trim().toLowerCase() === String(correctAns).trim().toLowerCase()) {
                        earned = maxMarks;
                        isCorrect = true;
                    }
                    // MCQ: usually exact char match "A" == "A"
                    // Short Answer: lenient match needed? For now strict.
                }

                partScores[partKey].score += earned;
                totalScore += earned;

                feedback[qId] = {
                    correct: isCorrect,
                    score: earned,
                    max: maxMarks,
                    userAnswer: userAns || null,
                    correctAnswer: correctAns,
                    logic: keyData.logic || "No explanation."
                };
            }
        });

        const resultData = {
            examId,
            uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            totalScore,
            totalMaxScore,
            percentage: Math.round((totalScore / totalMaxScore) * 100),
            partScores,
            feedback,
            answers // Save user raw answers
        };

        // --- GAMIFICATION: Award XP ---
        let xpEarned = 0;
        try {
            const baseXP = 500;
            let bonusXP = 0;
            if (resultData.percentage >= 50) bonusXP += 100;
            if (resultData.percentage >= 80) bonusXP += 300;

            const xpResult = await GamificationService.awardXP(uid, baseXP + bonusXP, 'reading', {
                duration: duration || 0,
                expectedDuration: 3600,
                title: `Completed Mock Exam: ${examId}`
            });
            xpEarned = xpResult.earned;
            resultData.xpEarned = xpEarned;
            resultData.newLevel = xpResult.newLevel;

            if (xpResult.cheatingDetected) {
                resultData.cheatingDetected = true;
                resultData.cheatReason = xpResult.cheatReason;
            }
        } catch (xpErr) {
            console.error("XP Award Failed:", xpErr);
        }

        // 2. Save Result to DB
        await db_firestore.collection('exam_submissions').add(resultData);

        // --- MASTERY: Update Micro-Skills ---
        try {
            const MicroSkillAssessor = require('./services/MicroSkillAssessor');
            const paperType = examId.split('_')[0].toLowerCase();
            const assessmentData = { [paperType]: answers };
            const newSkills = await MicroSkillAssessor.assessAllSkills(assessmentData);

            const currentSkillMap = await UserProfileService.getSkillMap(uid, 'english') || { microSkills: {} };
            const updatedMicroSkills = {
                ...(currentSkillMap.microSkills || {}),
                ...newSkills
            };

            const newWeaknesses = MicroSkillAssessor.prioritizeWeaknesses(updatedMicroSkills);

            await UserProfileService.saveSkillMap(uid, 'english', {
                microSkills: updatedMicroSkills,
                weaknessPriority: newWeaknesses,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[Mastery] Updated skills for ${uid} after ${paperType} exam.`);
        } catch (mErr) {
            console.error("Mastery Update Failed:", mErr);
        }

        // Return Result
        res.json({
            success: true,
            result: {
                totalScore,
                totalMaxScore,
                percentage: resultData.percentage,
                partScores,
                feedback,
                xpEarned: xpEarned,
                cheatingDetected: resultData.cheatingDetected,
                cheatReason: resultData.cheatReason
            }
        });

    } catch (e) {
        console.error("Grading Internal Error:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/lab/evaluate_batch', async (req, res) => {
    try {
        const { tasks, answers, uid, category } = req.body;
        const gradingRequests = tasks.map(t => ({
            id: t.id,
            type: t.type,
            question: t.question,
            answer: answers[t.id] || '',
            logic: t.answer_logic,
            keywords: t.expected_keywords,
            target_sentence: t.target_sentence // For Speaking shadowing
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
            model: "gemini-2.0-flash", // Use consistent model
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

        // Robust Flattening: If AI returns [{id:{}}, {id:{}}], flatten to {id:{}, id:{}}
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
        if (typeof fs !== 'undefined') {
            fs.appendFileSync('lab_debug.log', `\n--- EVAL ERROR ---\n${e.message}\n`);
        }
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/lab/cheat', async (req, res) => {
    try {
        const { tasks, level, uid, passage } = req.body;
        console.log(`[Cheat] Auth Check for uid: ${uid}`);

        let userEmail = null;

        // 1. Try Firestore Profile
        const UserProfileService = require('./services/UserProfileService');
        const profile = await UserProfileService.getProfile(uid);
        userEmail = profile?.email;

        // 2. Fallback to Firebase Auth (More reliable for security)
        if (!userEmail && uid && uid !== 'placeholder') {
            try {
                const authUser = await admin.auth().getUser(uid);
                userEmail = authUser.email;
                console.log(`[Cheat] Falling back to Auth record for email: ${userEmail}`);
            } catch (authErr) {
                console.warn(`[Cheat] Auth lookup failed for ${uid}:`, authErr.message);
            }
        }

        console.log(`[Cheat] Final Email resolved: ${userEmail} (target: fungtam@gmail.com)`);

        if (userEmail?.toLowerCase() !== 'fungtam@gmail.com') {
            console.warn(`[Cheat] UNAUTHORIZED access by ${userEmail || 'unknown'} (UID: ${uid})`);
            return res.status(403).json({ error: "Unauthorized" });
        }

        const answers = await LabService.generateCheatAnswers(tasks, level, passage);
        console.log(`[Cheat] Generated ${Object.keys(answers).length} answers successfully.`);
        res.json(answers);
    } catch (e) {
        console.error("Lab Cheat Error:", e);
        res.status(500).json({ error: "Cheat failed" });
    }
});

// --- TOKEN USAGE ENDPOINTS ---
app.get('/api/usage/summary', async (req, res) => {
    try {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ error: "Missing uid" });
        const summary = await TokenService.getUsageSummary(uid);
        res.json(summary || { total_prompt_tokens: 0, total_completion_tokens: 0, total_cost_usd: 0 });
    } catch (e) {
        console.error("Usage Summary Error:", e);
        res.status(500).json({ error: "Failed to fetch usage summary" });
    }
});

app.get('/api/usage/stats', async (req, res) => {
    try {
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ error: "Missing uid" });
        const db = admin.firestore();
        const snapshot = await db.collection('users').doc(uid).collection('usage_stats')
            .orderBy('timestamp', 'desc')
            .limit(20)
            .get();
        const stats = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            stats.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
            });
        });
        res.json(stats);
    } catch (e) {
        console.error("Usage Stats Error:", e);
        res.status(500).json({ error: "Failed to fetch usage stats" });
    }
});


// --- REDEMPTION ENDPOINTS ---
app.post('/api/redemption/blindbox', async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    const BOX_COST = 500;

    // RNG Logic
    const roll = Math.random();
    const newItem = roll > 0.8
        ? { id: 'tutor_janice', name: 'Miss Janie (Star Tutor)', type: 'tutor', rarity: 'legendary', icon: '👩‍🏫' }
        : { id: `avatar_${Math.floor(Math.random() * 5)}`, name: 'Cool Avatar Frame', type: 'avatar', rarity: 'common', icon: '🖼️' };

    try {
        const result = await GamificationService.redeemItem(uid, newItem.id, BOX_COST, newItem);

        if (result.success) {
            res.json({ success: true, newItem, newBalance: result.newBalance });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (e) {
        console.error("Redemption Error:", e);
        res.status(500).json({ error: "Transaction failed" });
    }
});

// --- LISTENING MODULE API ---

// 1. Generate Listening Mock
app.post('/api/listening/generate', async (req, res) => {
    try {
        const { topic } = req.body;
        const result = await generateListeningMock(topic || "General Theme");
        res.json(result);
    } catch (error) {
        console.error("Gen failed", error);
        res.status(500).json({ error: "Gen failed" });
    }
});

// 2. List Listening Mocks
app.get('/api/listening/exams', (req, res) => {
    const dir = path.join(__dirname, 'generated_mocks', 'listening');
    if (!fs.existsSync(dir)) return res.json([]);

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const exams = files.map(f => {
        try {
            const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
            return {
                id: f.replace('.json', ''),
                title: data.metadata.title,
                date: data.metadata.generated_at,
                tags: ["Listening", "Paper 3"]
            };
        } catch (e) {
            return null;
        }
    }).filter(e => e !== null);
    res.json(exams);
});

// 3. Get Specific Listening Mock
app.get('/api/listening/exam/:id', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'generated_mocks', 'listening', `${req.params.id}.json`);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Read failed" });
    }
});

// 4. Listening Cheat (Simulate Student)
// 4. Listening Cheat (Simulate Student)
app.post('/api/listening/cheat', async (req, res) => {
    try {
        const { taskType, question, context, level, options, answerKey, uid } = req.body;

        // SHORTCUT: If Level is 5* or 5** and Answer Key is provided, just return it! (Saves quota, ensures 100% score)
        if (answerKey && (level === '5**' || level === '5*')) {
            return res.json({ answer: answerKey });
        }

        const prompt = listeningCheatAgent
            .replace('{TASK_TYPE}', taskType)
            .replace('{QUESTION}', question)
            .replace('{OPTIONS}', options && options.length > 0 ? options.join(', ') : "N/A")
            .replace('{CONTEXT}', context || "Standard Listening Task")
            .replace('{LEVEL}', level || "5**");

        const result = await GenerativeAIService.generateContent(prompt + `\n\nTarget Level: ${level}`, { model: TIER_PRO_MODEL });
        res.json({ answer: result.response.text() });
    } catch (error) {
        console.error("Cheat failed after retries", error);
        res.status(500).json({ error: "Cheat failed (Quota)" });
    }
});

// 5. Listening Grade (AI Examiner)
app.post('/api/listening/grade', async (req, res) => {
    try {
        const { mode, taskPrompt, context, modelAnswer, studentAnswer, uid } = req.body;

        const prompt = listeningGradingAgent
            .replace('{MODE}', mode || "PART_A")
            .replace('{TASK_PROMPT}', taskPrompt)
            .replace('{CONTEXT}', context ? context.substring(0, 5000) : "N/A")
            .replace('{MODEL_ANSWER}', modelAnswer || "N/A")
            .replace('{STUDENT_ANSWER}', studentAnswer || "N/A");

        const result = await GenerativeAIService.generateContent(prompt, {
            model: TIER_PRO_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });

        // Log Usage
        if (result.response && result.response.usageMetadata) {
            TokenService.logUsage(uid || 'system', 'listening_grade', result.response.usageMetadata);
        }

        const json = JSON.parse(result.response.text());
        res.json(json);
    } catch (error) {
        console.error("Listening Grade failed", error);
        res.status(500).json({ error: "Grading failed" });
    }
});

// --- READING MOCK EXAM ENDPOINTS ---
app.get('/api/reading/exams', (req, res) => {
    try {
        const dir = path.join(__dirname, 'generated_mocks', 'reading');
        if (!fs.existsSync(dir)) {
            console.log("Reading exams dir not found:", dir);
            return res.json([]);
        }

        const files = fs.readdirSync(dir).filter(f => f.endsWith('_FullMock.json'));
        console.log(`Found ${files.length} reading mock files in ${dir}`);

        const exams = files.map(f => {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
                // Handle different structures
                const meta = data.meta || {};
                return {
                    id: f.replace('.json', ''),
                    title: (meta.topic || data.topic || f.replace('_FullMock.json', '')) + " (Reading)",
                    topic: meta.topic || data.topic || "Reading Mock",
                    created_at: meta.generated_at || new Date().toISOString()
                };
            } catch (err) {
                console.error(`Failed to parse ${f}:`, err);
                return null;
            }
        }).filter(e => e !== null)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        console.log(`Returning ${exams.length} valid reading exams.`);
        res.json(exams);
    } catch (e) {
        console.error("Error listing reading exams:", e);
        res.json([]);
    }
});

app.get('/api/reading/exam/:id', (req, res) => {
    try {
        const filename = `${req.params.id}.json`;
        const filepath = path.join(__dirname, 'generated_mocks', 'reading', filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ error: "Reading Exam not found" });
        }

        const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        res.json(content);
    } catch (error) {
        console.error("Error reading reading exam:", error);
        res.status(500).json({ error: "Failed to read reading exam" });
    }
});

// 6. Speaking Module Endpoints
// ----------------------------
const { generateSpeakingMock } = require('./speakingMockGenerator');
const speakingAgent = require('./prompts/speakingAgent');

app.post('/api/speaking/chat', async (req, res) => {
    try {
        const { history, currentSpeaker, topic, context, uid, userStatus } = req.body;

        const historyPayload = (history || []).slice(-10).map(h => {
            const role = h.role === 'user' ? 'Candidate_D' : h.role;
            return `${role}: ${h.text}`;
        }).join('\n');

        // Construct context-aware prompt
        const prompt = speakingAgent
            .replace('{TOPIC}', topic || context?.title || 'Unknown Topic')
            .replace('{POINTS}', JSON.stringify(context?.discussion_points || []))
            .replace('{CURRENT_SPEAKER}', currentSpeaker || 'Examiner')
            .replace('{USER_STATUS}', userStatus || 'Idle')
            .replace('{HISTORY}', historyPayload);

        const result = await GenerativeAIService.generateContent(prompt, {
            model: "gemini-2.0-flash", // User confirmed this is stable
            generationConfig: { responseMimeType: "application/json" }
        }, 6); // INCREASED RETRIES: Give rate limits time to reset (6 attempts)

        // Log Usage
        if (result.response && result.response.usageMetadata) {
            TokenService.logUsage(uid || 'system', 'speaking_chat', result.response.usageMetadata);
        }

        const responseText = result.response.text();
        let json;
        try {
            // Robust parsing: Remove markdown code blocks if AI included them
            const cleanSource = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            json = JSON.parse(cleanSource);
        } catch (e) {
            console.error("Failed to parse Speaking AI JSON:", responseText);
            // Fallback for simple text if AI slips up
            const rawText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            json = { turns: [{ speaker: "Candidate_A", content: rawText, action: "speak" }] };
        }

        // Normalize: We now expect an array of turns
        let finalTurns = [];
        if (json.turns && Array.isArray(json.turns)) {
            finalTurns = json.turns;
        } else if (json.content || json.next_speaker) {
            // Legacy/Single turn fallback
            finalTurns = [{
                speaker: json.next_speaker || "Candidate_A",
                content: json.content || json.message || "",
                action: json.action || "speak"
            }];
        } else if (typeof json === 'string') {
            finalTurns = [{ speaker: "Candidate_A", content: json, action: "speak" }];
        }

        // SILENCE GUARD: Ensure content is never empty
        finalTurns = finalTurns.map(t => {
            if (!t.content || t.content.trim().length === 0 || /^[\.\,\s]+$/.test(t.content)) {
                const fillers = {
                    'Candidate_A': "That is an interesting perspective.",
                    'Candidate_B': "I agree with that.",
                    'Candidate_C': "I think so too.",
                    'Examiner': "Let's continue."
                };
                t.content = fillers[t.speaker] || "I see what you mean.";
            }
            return t;
        });

        res.json({ turns: finalTurns });
    } catch (error) {
        console.error("Speaking Chat Error:", error);
        res.status(500).json({ error: "Chat failed", details: error.message, stack: error.stack });
    }
});

// --- CLEAR HISTORY ENDPOINT ---
app.delete('/api/history/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const { uid } = req.query;

    if (!uid || !agentId) return res.status(400).json({ error: "Missing uid or agentId" });
    if (!db_firestore) return res.status(503).json({ error: "Database unavailable" });

    try {
        console.log(`[History] Deleting history for ${uid} with ${agentId}`);
        const historyRef = db_firestore.collection('users').doc(uid).collection('chat_history');

        // Batch delete (limit 500 per batch)
        const snapshot = await historyRef.where('agentId', '==', agentId).get();
        if (snapshot.empty) {
            return res.json({ success: true, count: 0 });
        }

        const batch = db_firestore.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        console.log(`[History] Deleted ${snapshot.size} messages.`);
        res.json({ success: true, count: snapshot.size });
    } catch (e) {
        console.error("Delete history failed:", e);
        res.status(500).json({ error: e.message });
    }
});

// Grading Endpoint
app.post('/api/speaking/grade', async (req, res) => {
    try {
        const { audioBlob, topic, context, transcript, studentName, uid } = req.body;
        // Note: For now, we assume frontend sends 'transcript' (STT).

        // Format transcript safely
        const safeTranscript = Array.isArray(transcript)
            ? transcript.map(t => `${t.role}: ${t.text}`).join('\n')
            : transcript;

        const effectiveName = studentName || "Candidate D";

        const prompt = speakingGradingAgent
            .replace('{TOPIC}', topic)
            .replace('{CONTEXT}', JSON.stringify({
                title: context.title,
                description: context.topic_description,
                points: context.discussion_points
            }))
            .replace('{TRANSCRIPT}', safeTranscript)
            .replace('{STUDENT_NAME}', effectiveName);

        const result = await GenerativeAIService.generateContent(prompt, {
            model: TIER_PRO_MODEL,
            generationConfig: { responseMimeType: "application/json" }
        });

        // Log Usage
        if (result.response && result.response.usageMetadata) {
            TokenService.logUsage(uid || 'system', 'speaking_grade', result.response.usageMetadata);
        }

        const text = result.response.text();
        console.log(`[SpeakingGrade] AI RAW:`, text);

        // FIX: Strip Markdown if AI wrapped JSON in code blocks
        const sanitized = text.replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(sanitized));

    } catch (error) {
        console.error("Speaking Grade Error:", error);
        res.status(500).json({ error: "Grading failed" });
    }
});

app.post('/api/speaking/generate', async (req, res) => {
    const { theme } = req.body;
    const mock = await generateSpeakingMock(theme || "Social Issues");
    if (mock) {
        res.json({ success: true, examId: mock.id });
    } else {
        res.status(500).json({ error: "Generation failed" });
    }
});

app.get('/api/speaking/exams', (req, res) => {
    try {
        const dir = path.join(__dirname, 'generated_mocks', 'speaking');
        if (!fs.existsSync(dir)) return res.json([]);
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
        const exams = files.map(f => {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
                return {
                    id: data.id || f.replace('.json', ''),
                    title: data.title || f.replace('.json', ''),
                    topic: data.topic_description || "Speaking Practice",
                    created_at: data.created_at || new Date().toISOString()
                };
            } catch (err) {
                console.error(`Failed to parse speaking mock ${f}:`, err);
                return null;
            }
        }).filter(e => e !== null).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(exams);
    } catch (e) {
        res.json([]);
    }
});

app.get('/api/speaking/exam/:id', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'generated_mocks', 'speaking', `${req.params.id}.json`);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Read failed" });
    }
});

// End of server.js (Forced Restart)

// --- OCR ENDPOINT ---
app.post('/api/ocr', async (req, res) => {
    console.log("[Trace] /api/ocr hit");
    try {
        const { image } = req.body;
        if (!image || !image.data) {
            console.error("[OCR] No image data received");
            return res.status(400).json({ error: "No image provided" });
        }

        console.log(`[OCR] Processing image. Size: ${image.data.length} characters`);

        const result = await GenerativeAIService.generateContent([
            "You are an OCR specialist. Transcribe the handwritten text from the provided image exactly as it appears. DO NOT grade it, DO NOT provide feedback. ONLY return the text transcription. Ignore crossed-out words.",
            {
                inlineData: {
                    data: image.data,
                    mimeType: image.mimeType || "image/jpeg"
                }
            }
        ], { model: TIER_PRO_MODEL });

        // Log Usage
        if (result.response && result.response.usageMetadata) {
            const { uid } = req.body;
            TokenService.logUsage(uid || 'system', 'ocr', result.response.usageMetadata);
        }

        const text = result.response.text();
        console.log("[OCR] Success. Text length:", text.length);
        res.json({ transcription: text.trim() });
    } catch (e) {
        console.error("OCR Error Full:", e);
        res.status(500).json({
            error: "Failed to transcribe image.",
            details: e.message
        });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('💥 UNHANDLED ROUTE ERROR:', err);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// --- DEBUG: RESET USER ---
app.post('/api/debug/reset_user', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        console.log(`[DEBUG] Reset requested for email: ${email}`);

        // 1. Find UID
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;
        console.log(`[DEBUG] Found UID: ${uid}`);

        // 2. Call Service Reset (Deletes Profile, Stats, Chat, Roadmap, Inventory)
        await UserProfileService.resetUser(uid);

        // 3. Delete Root Collections checks (Just in case)
        const deleteQuery = async (collection, field) => {
            const snap = await admin.firestore().collection(collection).where(field, '==', uid).get();
            if (snap.empty) return;
            const batch = admin.firestore().batch();
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
            console.log(`[DEBUG] Deleted ${snap.size} docs from ${collection}`);
        };

        await deleteQuery('exam_attempts', 'userId');
        await deleteQuery('writings', 'userId'); // Writing submissions
        // generated_exams usually owner-agnostic or have userId metadata inside? 
        // We usually don't delete the exam definition itself, just the user's attempt.

        res.json({ success: true, message: `User ${email} (${uid}) fully reset.` });
    } catch (e) {
        console.error("Reset Failed:", e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
