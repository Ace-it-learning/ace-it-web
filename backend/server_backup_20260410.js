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

console.log(`[DEBUG] Checking for Service Account at: ${serviceAccountPath}`);
console.log(`[DEBUG] File Exists: ${fs.existsSync(serviceAccountPath)}`);

if (fs.existsSync(serviceAccountPath)) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath))
        });
        db_firestore = admin.firestore();
        global.db = db_firestore; // Alias for endpoints using 'db'
        console.log("Firebase Admin initialized successfully.");
    } catch (error) {
        console.error("Firebase Admin initialization failed:", error);
    }
} else {
    console.error("❌ Firebase Service Account NOT FOUND at " + serviceAccountPath);
}

const { writingCheatAgent } = require('./prompts/writingCheatAgent');
const { writingGradingAgent } = require('./prompts/writingGradingAgent');
const { listeningCheatAgent } = require('./prompts/listeningCheatAgent');
const { listeningGradingAgent } = require('./prompts/listeningGradingAgent');
const { generateListeningMock } = require('./listeningMockGenerator');


const UserProfileService = require('./services/UserProfileService');
const DiagnosticService = require('./services/DiagnosticService');
const MathsLabService = require('./services/maths/MathsLabService');
const MathsIntentRouter = require('./services/maths/MathsIntentRouter');
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
const PORT = process.env.PORT || 3001;

const app = express();

// --- GLOBAL TRACING (Immediate) ---
app.use((req, res, next) => {
    if (req.url.includes('/api/stats')) {
        console.log(`[TRACE] Incoming Stats Request: ${req.method} ${req.url} from ${req.ip}`);
    }
    next();
});


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// --- SECURITY & COST GUARDRAILS (PHASE 4) ---
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
    app.use(helmet()); // Secure HTTP headers
} else {
    console.log("[DEBUG] Dev Mode: Helmet disabled for easier local debugging.");
}

// Rate Limiting: 100 requests per 15 minutes
// Rate Limiting: Strict for Production, Relaxed for Dev
const limiter = rateLimit({
    windowMs: isProduction ? 15 * 60 * 1000 : 1 * 60 * 1000, // 15 mins (Prod) vs 1 min (Dev)
    max: isProduction ? 100 : 10000, // 100 requests (Prod) vs 10,000 (Dev)
    message: { error: "Too many requests, please try again later." }
});
app.use('/api/', limiter);

// Serve generated math diagrams
app.use('/output', express.static(path.join(__dirname, 'output')));

// --- MODULE ROUTES ---
// (Moved to after CORS middleware)

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
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-secret');
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

// --- GLOBAL TIMEOUT MIDDLEWARE (5s Default) ---
app.use((req, res, next) => {
    res.setTimeout(30000, () => {
        console.warn(`[TIMEOUT] Request ${req.method} ${req.url} timed out.`);
        if (!res.headersSent) {
            res.status(503).json({ error: "Service Timeout", retry: true });
        }
    });
    next();
});


// --- MODULE ROUTES ---
app.use('/api/stats', require('./routes/statsRoutes'));

app.use('/api/admin', require('./routes/adminRoutes'));

app.use('/api/maths/diagnostic', require('./routes/maths/mathsDiagnosticRoutes'));
app.use('/api/reading', require('./routes/readingScaffoldRoutes'));
app.use('/api/speaking', require('./routes/speakingQuestRoutes'));
app.use('/api/lab', require('./routes/english/labRoutes'));
app.get('/api/quests/personalized', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        const PersonalizedQuestService = require('./services/quests/PersonalizedQuestService');
        const batch = await PersonalizedQuestService.getPersonalizedBatch(uid);
        res.json(batch);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

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

// RESET MATH PROGRESS ONLY
app.post('/api/user/reset/math', async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        await UserProfileService.resetMathProgress(uid);
        res.json({ success: true, message: "Math progress reset successfully." });
    } catch (e) {
        console.error("Reset Math Error:", e);
        res.status(500).json({ error: "Failed to reset Math progress" });
    }
});





// --- TTS API (Google Cloud) ---
const { generateSpeech } = require('./services/TTSService');

app.post('/api/tts', async (req, res) => {
    const { text, languageCode, gender } = req.body;

    if (!text) return res.status(400).json({ error: "Missing text" });

    try {
        const audioContent = await generateSpeech(text, languageCode, gender);
        res.json({ audioContent });
    } catch (error) {
        console.error("TTS API Error:", error.message);
        // Fallback: Client should handle 500 by using Browser TTS
        res.status(500).json({ error: "TTS Generation Failed", details: error.message });
    }
});

// Helper to get specific user data (Wrapper for backward compatibility if needed, but better to use Service directly)
// ... Legacy readDb/writeDb functions removed ...

// =====================================================
// DREAM PROGRAMS API (Ace Sir - University Matching)
// =====================================================
app.get('/api/user/dream-programs', async (req, res) => {
    const { uid } = req.query;
    if (!uid) {
        return res.status(400).json({ error: 'Missing uid parameter' });
    }
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.json({ programs: [] });
        }
        const userData = userDoc.data();
        return res.json({
            programs: userData.dreamPrograms || [],
            targets: {
                eng: userData.targetGradeEng,
                chi: userData.targetGradeChi,
                math: userData.targetGradeMath,
                electives: userData.electives || []
            }
        });
    } catch (error) {
        console.error('[DreamPrograms] GET error:', error);
        return res.status(500).json({ error: 'Failed to fetch dream programs' });
    }
});

app.post('/api/user/dream-programs', async (req, res) => {
    const { uid, programs } = req.body;
    if (!uid || !programs) {
        return res.status(400).json({ error: 'Missing uid or programs' });
    }
    try {
        const userRef = db.collection('users').doc(uid);
        const updates = { dreamPrograms: programs };

        // If user already has a dreamSubject, keep it. 
        // Otherwise, use the name of the first program as a default.
        const userDoc = await userRef.get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            if (!userData.dreamSubject && programs.length > 0) {
                updates.dreamSubject = programs[0].name;
            }
        }

        await userRef.set(updates, { merge: true });
        return res.json({ success: true });
    } catch (error) {
        console.error('[DreamPrograms] POST error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

const { sendWeeklyReport } = require('./services/EmailService');

// University Matching Engine API
app.get('/api/universities/match', (req, res) => {
    const { best5, category } = req.query;
    if (!best5) {
        return res.status(400).json({ error: 'Missing best5 parameter' });
    }

    const score = parseInt(best5, 10);

    // Duplicate of frontend data for backend logic (Single Source of Truth refactor planned)
    const PROGRAMS = [
        { id: 'hku-med', code: 'JS6107', name: '內外全科醫學士', university: '香港大學', faculty: '醫學院', median: 36, band_a: 38, category: 'medicine' },
        { id: 'hku-law', code: 'JS6070', name: '法學士', university: '香港大學', faculty: '法律學院', median: 32, band_a: 34, category: 'law' },
        { id: 'hku-eng-civil', code: 'JS6963', name: '土木工程學士', university: '香港大學', faculty: '工程學院', median: 24, band_a: 26, category: 'engineering' },
        { id: 'cuhk-med', code: 'JS4501', name: '內外全科醫學士', university: '香港中文大學', faculty: '醫學院', median: 35, band_a: 37, category: 'medicine' },
        { id: 'cuhk-law', code: 'JS4072', name: '法學士', university: '香港中文大學', faculty: '法律學院', median: 31, band_a: 33, category: 'law' },
        { id: 'cuhk-bba', code: 'JS4202', name: '工商管理學士', university: '香港中文大學', faculty: '商學院', median: 26, band_a: 28, category: 'business' },
        { id: 'hkust-cs', code: 'JS5200', name: '計算機科學學士', university: '香港科技大學', faculty: '工程學院', median: 27, band_a: 29, category: 'engineering' },
        { id: 'hkust-bba', code: 'JS5313', name: '工商管理學士', university: '香港科技大學', faculty: '商學院', median: 28, band_a: 30, category: 'business' },
        { id: 'polyu-nursing', code: 'JS3636', name: '護理學學士', university: '香港理工大學', faculty: '護理學院', median: 23, band_a: 25, category: 'medicine' },
        { id: 'cityu-law', code: 'JS1801', name: '法律學學士', university: '香港城市大學', faculty: '法律學院', median: 29, band_a: 31, category: 'law' },
        { id: 'eduhk-bed', code: 'JS8501', name: '教育學學士', university: '香港教育大學', faculty: '教育學院', median: 21, band_a: 23, category: 'education' },
        { id: 'bu-film', code: 'JS2420', name: '電影學文學士', university: '香港浸會大學', faculty: '傳理學院', median: 22, band_a: 24, category: 'arts' },
        // ... (truncated for brevity in server.js, full list in frontend)
    ];

    const matches = PROGRAMS.filter(p => {
        if (category && category !== 'all' && p.category !== category) return false;
        // Reachable: Score >= Median - 1
        // Stretch: Score >= Median - 4
        return score >= (p.median - 4);
    }).map(p => ({
        ...p,
        gap: p.median - score,
        status: (p.median - score) <= 0 ? 'reachable' : (p.median - score) <= 2 ? 'stretch' : 'ambitious'
    })).sort((a, b) => a.gap - b.gap);

    res.json({ count: matches.length, matches });
});

// =====================================================
// WEEKLY PARENT REPORTING API (Phase 4)
// =====================================================
app.get('/api/reports/trigger-weekly', async (req, res) => {
    const { uid, email } = req.query; // For dev/testing: allow triggering for specific user/email

    if (!uid || !email) {
        return res.status(400).json({ error: 'Missing uid or email (required for dev trigger)' });
    }

    try {
        // 1. Fetch User Data
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
        const userData = userDoc.data();

        // 2. Fetch/Calculate Stats (Mocking mostly if not strictly tracked yet)
        // Ideally fetch from 'stats' collection.
        const stats = {
            totalTimeFormatted: userData.stats?.totalTime || '4h 30m',
            sessionsCount: userData.stats?.sessions || 12
        };

        // 3. Fetch Mastery (English)
        const masteryRef = await db.collection('users').doc(uid).collection('mastery').get();
        const recentSkills = [];
        masteryRef.forEach(doc => {
            if (doc.data().status === 'mastered') recentSkills.push(doc.id);
        });

        // 4. Fetch Math Ability
        const mathRef = await db.collection('users').doc(uid).collection('math_ability').get();
        const recentTopics = [];
        mathRef.forEach(doc => {
            if (doc.data().level >= 3) recentTopics.push(doc.id);
        });

        // 5. Build Report Data
        const reportData = {
            studentName: userData.profile?.name || 'Student',
            period: moment().subtract(7, 'days').format('MMM Do') + ' - ' + moment().format('MMM Do'),
            stats: stats,
            mastery: { recentSkills: recentSkills.slice(0, 5) }, // Top 5
            mathAbility: { recentTopics: recentTopics.slice(0, 5) },
            aceSir: {
                // Default to empty/generic if no dream programs set
                dreamPrograms: userData.dreamPrograms || [],
                estimatedBest5: userData.estimatedBest5 || 22, // Placeholder default
                recommendation: userData.aceRecommendation || "Focus on improving English Paper 2 writing structure and Math probability questions."
            }
        };

        // 6. Send Email
        const result = await sendWeeklyReport(email, reportData);

        return res.json({ success: true, result });

    } catch (error) {
        console.error('[WeeklyReport] Trigger failed:', error);
        return res.status(500).json({ error: error.message });
    }
});

// GET Health
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});


// ===== MICRO-SKILL API ENDPOINTS =====

// GET all micro-skills for a user
app.get('/api/microskills/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        // Fetch from progress subcollection (English is primary subject)
        const progressDoc = await admin.firestore().collection('users').doc(uid).collection('progress').doc('english').get();

        let microSkills = {};
        let weaknessPriority = [];
        let practicedSkills = [];
        let lastUpdated = null;
        let version = 1;

        if (progressDoc.exists) {
            const progressData = progressDoc.data();
            microSkills = progressData.microSkills || {};
            weaknessPriority = progressData.weaknessPriority || [];
            practicedSkills = progressData.practicedSkills || [];
            lastUpdated = progressData.lastUpdated;
            version = progressData.version || 1;
        }

        // Fetch Weekly Quest Status
        const GamificationService = require('./services/GamificationService');
        const weeklyStatus = await GamificationService.getWeeklyQuestStatus(uid);

        res.json({
            microSkills,
            weaknessPriority,
            practicedSkills,
            timestamp: lastUpdated,
            version,
            weeklyQuest: weeklyStatus
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

// ===== MATH PROFILE API ENDPOINTS =====

// GET Math micro-skills profile (used by MathRoadmapModal)
app.get('/api/profile/maths', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });

    try {
        const mathData = await UserProfileService.getMathSkillMap(uid);
        res.json({
            microSkills: mathData?.microSkills || {},
            practicedSkills: mathData?.practicedSkills || [],
            weaknessPriority: mathData?.weaknessPriority || [],
            level: mathData?.level || 0,
            archetype: mathData?.archetype || null,
            timestamp: mathData?.last_updated || null
        });
    } catch (error) {
        console.error('[Math Profile API] Error fetching math profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET Math Skill Map (used by mathMasteryService.js)
app.get('/api/skillmap/maths', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });

    try {
        const mathData = await UserProfileService.getMathSkillMap(uid);
        res.json(mathData || { subject: 'Mathematics', level: 0, microSkills: {} });
    } catch (error) {
        console.error('[Math SkillMap API] Error fetching math skill map:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET Math Skill History (used by mathMasteryService.js)
app.get('/api/skillmap/maths/history', async (req, res) => {
    const { uid, limit } = req.query;
    if (!uid) return res.status(400).json({ error: 'Missing uid' });

    try {
        const history = await UserProfileService.getMathSkillHistory(uid, parseInt(limit) || 5);
        res.json(history);
    } catch (error) {
        console.error('[Math SkillMap API] Error fetching math history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST Onboarding (Initialize Profile)
// POST Onboarding (Initialize Profile)
app.post('/api/onboarding', async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    console.log(`[Onboarding] Initializing profile for uid: ${uid}`);
    try {
        const updatedUser = await UserProfileService.createOrUpdateProfile(uid, req.body);
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

// --- DIAGNOSTIC API ---
const diagnosticRoutes = require('./routes/diagnosticRoutes');
app.use('/api/diagnostic', diagnosticRoutes);

// --- ENGLISH LAB API ---
const englishLabRoutes = require('./routes/english/labRoutes');
app.use('/api/lab', englishLabRoutes);

// --- WRITING LAB API (Writing 2.0) ---
const writingLabRoutes = require('./routes/english/writingLabRoutes');
app.use('/api/lab/writing', writingLabRoutes);

// --- MATHS LAB API ---
const mathsLabRoutes = require('./routes/maths/mathsLabRoutes');
app.use('/api/maths/lab', mathsLabRoutes);

// --- MATHS EXAM API ---
app.use('/api/maths/exam', require('./routes/maths/mathsExamRoutes'));

// --- ROADMAP API ---
const roadmapRoutes = require('./routes/roadmapRoutes');
app.use('/api/roadmap', roadmapRoutes);

// --- TUTOR API ---
const tutorRoutes = require('./routes/tutorRoutes'); // New Tutor Service
app.use('/api/tutor', tutorRoutes); // Register Tutor Routes

// --- PROFILE & GAMIFICATION API ---
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);
app.use('/api/gamification', profileRoutes);
app.use('/api/skillmap', profileRoutes);
const writingRoutes = require('./routes/writingRoutes'); // Phase 23
app.use('/api/writing', writingRoutes); // Phase 23
app.use('/api/redemption', profileRoutes);

// --- DICTIONARY API ---
const dictionaryRoutes = require('./routes/dictionaryRoutes');
app.use('/api/dictionary', dictionaryRoutes);


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

const { GLOBAL_BASE_RULES, SINGLE_ROUTER_CONSTRAINT, GAUNTLET_ASSETS, ONBOARDING_PROTOCOL, AGENT_PROMPTS } = require('./system_prompts.js');

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
const TIER_1_MODEL = "gemini-flash-latest";
const TIER_2_MODEL = "gemini-flash-latest";
const TIER_PRO_MODEL = "gemini-pro-latest";

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
            console.log(`[Router] High - IQ Task Detected(${lower}) - Routing to PRO Model`);
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
    console.log(`[Trace] / api / chat received from UID: "${req.body.uid}"`);
    console.log(`[Trace] Message: "${req.body.message}"`);
    console.log(`[Trace] History Length: ${req.body.history?.length || 0} `);

    const { uid, message, history: clientHistory, agentId, audio, audioType, image } = req.body;

    // INCREASE TIMEOUT FOR CHAT (Especially for complex DSE Strategy analysis)
    req.setTimeout(90000); 
    res.setTimeout(90000); 

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
                    text: `🔒 ${ quota.message } \n\nUpgrade your plan to unlock pronunciation feedback and improve your English speaking skills!`,
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
            console.error(`❌[CRITICAL] / api / chat Error for UID ${uid}: `, error);
            console.error(`[CRITICAL] Error Stack: `, error.stack);
            console.error(`[CRITICAL] Message: `, message || '(no message)');
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
    const subject = (agentId === 'math' || agentId === 'maths') ? 'maths' : (agentId === 'chinese' ? 'chinese' : 'english');
    try {
        user = await UserProfileService.getProfile(uid);
        if (!user) return res.status(404).json({ error: "User not found" });
        skillMap = await UserProfileService.getSkillMap(uid, subject);
    } catch (e) {
        console.error("Context Load Error:", e);
        return res.status(500).json({
            error: "Failed to load user context",
            message: e.message,
            stack: e.stack,
            uid: uid || 'undefined',
            agentId: agentId || 'undefined'
        });
    }

    const isDiagCompleted = agentId === 'math'
        ? (user?.has_maths_diagnostic === true || !!user?.maths_diagnostic)
        : (agentId === 'chinese' ? user?.has_chinese_diagnostic === true : (user?.diagnostic_completed === true || !!user?.diagnostic_results?.english));
    const isNewStudent = user ? (user.is_new_student !== false && !isDiagCompleted && user.status !== 'active') : true;
    console.log(`[Debug] isNewStudent Calc(${agentId}): user.is_new: ${user?.is_new_student}, status: ${user?.status}, isDiagComp: ${isDiagCompleted}, hasSkillMap: ${!!skillMap} `);

    // --- PRIORITY 1: SMART GREETING (Internal System Command) ---
    if (msgLower === '[trigger_greeting]') {
        console.log("[SmartGreeting] Triggered for user:", uid);
        try {
            const subjectLabel = agentId === 'math' ? 'Mathematics' : (agentId === 'chinese' ? 'Chinese' : 'English');
            const onboardingWithSubject = ONBOARDING_PROTOCOL.replace(/{{SUBJECT}}/g, subjectLabel);

            let promptOverride;
            if (isNewStudent) {
                promptOverride = `${onboardingWithSubject} \nSYSTEM INSTRUCTION: Step 1: The Invite. Greet the student with excitement, invite them to the 10-minute Discovery Session to unlock their roadmap. Do not start the test yet, just invite them.`;
            } else {
                // FETCH PERSONALIZED CONTEXT
                const pContext = await UserProfileService.getPersonalizedContext(uid, agentId);
                const weaknessText = pContext?.topWeaknesses?.length > 0 ? `The student is currently struggling with: ${pContext.topWeaknesses.join(', ')}.` : '';
                const mistakeText = pContext?.recentMistakes?.length > 0 ? `Their recent mistakes include: "${pContext.recentMistakes.join('", "')}".` : '';

                const skippedText = pContext?.skippedPapers?.length > 0 ? `Note: The student SKIPPED these sections during the diagnostic: ${pContext.skippedPapers.join(', ')}.` : '';

                const weeklyQuestText = pContext?.weeklyQuest?.completed
                    ? "Great news: They have already completed this week's Weekly Integrated Challenge! Don't suggest it again."
                    : `They have NOT yet completed this week's Weekly Integrated Challenge (${pContext?.weeklyQuest?.weekId}). It expires in ${pContext?.weeklyQuest?.daysRemaining} days. Gently encourage them to try it for +200 XP.`;

                promptOverride = `SYSTEM INSTRUCTION: Returning student. 
                Context about ${pContext?.nickname || 'the student'}:
                - Level: ${pContext?.level || 1}
                - Grade: ${pContext?.grade || 'F4'}
                - Diagnostic Completed: ${isDiagCompleted ? 'YES' : 'NO'}
                - Weekly Integrated Challenge: ${pContext?.weeklyQuest?.completed ? 'COMPLETED ✓' : 'PENDING'}
                - Status: ${weeklyQuestText}
                - Weaknesses: ${weaknessText}
                - Recent Mistakes: ${mistakeText}
                ${skippedText}

                TASK:
                1. Greet them warmly by their nickname: ${pContext?.nickname}.
                2. Briefly acknowledge their progress or one of their recent struggles/mistakes. 
                3. PROPOSE a specific next study step. ${pContext?.weeklyQuest?.completed ? '' : 'Mention the Weekly Integrated Challenge as a prime objective.'}
                4. Since the Diagnostic is ${isDiagCompleted ? 'ALREADY COMPLETED' : 'NOT YET DONE'}, ${isDiagCompleted ? 'do NOT ask them to perform a diagnostic again' : 'gently suggest they can finish the missing sections (' + pContext.skippedPapers.join(', ') + ') anytime, but focus on their current next step first'}.
                5. Output exactly 3 personalized suggestion chips at the end: [SUGGESTIONS: Action 1, Action 2, Action 3]. ${pContext?.weeklyQuest?.completed ? '' : 'One chip MUST be "Start Integrated Challenge".'}`;
            }

            // HYDRATE SYSTEM PROMPT
            let systemPrompt = `${GLOBAL_BASE_RULES}\n\n${AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace}`;
            const userName = user?.displayName || user?.nickname || user?.email?.split('@')[0] || "小戰士";
            const dreamSubject = user?.dreamSubject || "心儀學科 (未設定)";

            systemPrompt = systemPrompt
                .replace(/{{DATE}}/g, moment().format('MMMM Do YYYY'))
                .replace(/{{LEVEL}}/g, skillMap?.level || 1)
                .replace(/{{GRADE}}/g, user?.grade || 'F4')
                .replace(/{{PATH}}/g, user?.path || 'English')
                .replace(/{{userName}}/g, userName)
                .replace(/{{DREAM_SUBJECT}}/g, dreamSubject)
                .replace(/{{ONBOARDING}}/g, isNewStudent ? onboardingWithSubject : "");

            // INJECT EQUIPPED TUTOR PERSONALITY (Card Collection System)
            try {
                const cardPoolData = require('./data/card_pool.json');
                const userDoc = await db.collection('users').doc(uid).get();
                const equippedTutorId = userDoc.exists ? userDoc.data()?.equipped_tutor : null;
                if (equippedTutorId) {
                    const tutorCard = cardPoolData.tutor_cards.find(c => c.id === equippedTutorId);
                    if (tutorCard) {
                        systemPrompt += `\n\nPERSONALITY OVERRIDE: You are now adopting the "${tutorCard.name}" persona. ${tutorCard.tone}. Your greeting style example: "${tutorCard.greeting_style}". Maintain this personality in ALL responses.`;
                    }
                }
            } catch (e) { /* card pool not found, ignore */ }

            const fullPrompt = `${systemPrompt} \n${promptOverride} \n\nUser: Hello!`;

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
            // Check if ANY diagnostic is completed (reading/writing counts)
            const hasAnyDiag = user?.diagnostic_results && Object.keys(user.diagnostic_results).length > 0;
            if (!hasAnyDiag) {
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
                        text: "Great energy! But before we dive into specific papers, let's complete your Diagnostic Test to unlock your full roadmap. Ready?",
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
    let route = { intent: 'CHAT', bridge_text: null, ui_command: null };

    const startTime = Date.now();
    console.log(`[Trace] Chat Router Start: ${new Date(startTime).toLocaleTimeString()} `);

    // INTENT ROUTER: Skip only if audio is present (handled separately)
    // For images, we WANT the router to check if it's a request for assessment
    if (!audio) {
        try {
            const msgLower = (message || "").toLowerCase().trim();
            const isQuestion = msgLower.includes("?");
            const isGreeting = ["hi", "hello", "hey", "yo", "good morning", "good afternoon", "morning"].some(k => msgLower.startsWith(k));
            const isIdentityQuery = ["who are you", "what is your name", "your name", "who is this"].some(k => msgLower.includes(k));

            // Keywords that definitely NEED the AI Router
            const needsRouter = ["diagnostic", "calibration", "test", "exam", "quiz", "practice", "lab", "start", "launch", "roadmap"].some(k => msgLower.includes(k));

            // SMART SHORT-CIRCUIT: Skip AI Router for obvious chat
            if ((isQuestion || isGreeting || isIdentityQuery) && !needsRouter && msgLower.length < 60) {
                console.log(`[IntentRouter] ⚡ Short - circuit hit for: "${message}"`);
                // Use default route (CHAT)
            } else {
                const shortHistory = clientHistory ? clientHistory.slice(-3) : [];
                const routerContext = {
                    diagnostic_completed: isDiagCompleted,
                    is_new_student: isNewStudent,
                    has_active_exam: !!user?.activeExam,
                    has_image: !!image
                };

                if (agentId === 'math') {
                    console.log(`[IntentRouter] [${uid}] Routing MATH message: "${message || '[IMAGE_ONLY]'}", Has Image: ${!!image}`);
                    route = await MathsIntentRouter.classify(message || "", shortHistory, uid, routerContext, !!image);

                    
                    // FALLBACK: If there's an image and it's not a LAB/ONBOARDING request, default to ASSESS for Math
                    if (image && route.intent === 'CHAT') {
                        console.log(`[IntentRouter] Image detected with CHAT intent. Overriding to ASSESS for pedagogical analysis.`);
                        route.intent = 'ASSESS';
                    }
                } else {
                    console.log(`[IntentRouter] [${uid}] Routing ENGLISH message: "${message}", Has Image: ${!!image}`);
                    route = await IntentRouter.classify(message || "", shortHistory, uid, routerContext);
                }


                console.log(`[IntentRouter] AI Classify: "${message}" -> Detected Intent: ${route.intent} (took ${Date.now() - startTime}ms)`);
            }

            if (route.ui_command) console.log(`[IntentRouter] Target Module: ${route.ui_command.module} `);

            if (route.intent === 'ONBOARDING') {
                console.log("[IntentRouter] Detected Onboarding Intent.");

                // Redirect only if clearly requesting a launch and not already completed
                const isExplicitStart = msgLower.includes("start") || msgLower.includes("go to") || msgLower.includes("i'm ready") || msgLower.includes("launch");
                const canRedirect = !isDiagCompleted || msgLower.includes("reset") || msgLower.includes("retake");

                if (isExplicitStart && canRedirect) {
                    console.log("[IntentRouter] Explicit Onboarding Start detected. Returning Redirect Tag.");
                    return res.json({
                        text: "[REDIRECT_DIAGNOSTIC] Excellent choice! I'm prepping the diagnostic room for you. Let's get this done so we can build your roadmap. Good luck!",
                        role: 'model'
                    });
                }
                // Fall through to CHAT if it's an inquiry or already completed
            } else if ((route.intent === 'LAB' || route.intent === 'EXAM_ROUTER') && !isDiagCompleted) {
                console.log(`[IntentRouter] Intercepting ${route.intent} for student ${uid} in ${agentId}. Enforcing Diagnostic.`);
                return res.json({
                    text: `I'd love to help you with that! But to give you the best, most targeted advice, I need to assess your current level first. Let's start with a quick 15 - minute Diagnostic Test to unlock your full roadmap.Ready ? [SUGGESTIONS: Yes please!, Tell me more, Why is this important ?]`,
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
            } else if (route.intent === 'TUTOR_ACTION') {
                console.log("[IntentRouter] Triggering Tutor Action:", JSON.stringify(route));
                const EnglishTutorService = require('./services/EnglishTutorService');
                const action = route.action_type; /* POLISH | DECODE | VOCAB */
                const params = route.params || {};

                let result = {};
                let customComponent = '';

                try {
                    if (action === 'POLISH') {
                        // Polish text (either from params or message)
                        const targetText = params.text || message;
                        result = await EnglishTutorService.polishWriting(targetText, uid);
                        customComponent = 'polisher_card';
                    } else if (action === 'DECODE') {
                        // Decode text or image
                        let imageBuffer = null;
                        if (image) {
                            const base64String = typeof image === 'string' ? image.replace(/^data:image\/\w+;base64,/, "") : image.data;
                            imageBuffer = Buffer.from(base64String, 'base64');
                        }
                        const targetText = params.text || null;
                        result = await EnglishTutorService.decodeReading(targetText, imageBuffer, 'image/jpeg', uid);
                        customComponent = 'decoder_card';
                    } else if (action === 'VOCAB') {
                        result = await EnglishTutorService.generateVocabularyChips(params.topic || 'General', uid);
                        customComponent = 'vocab_card';
                    }

                    return res.json({
                        text: "Here is the analysis you requested:",
                        customComponent: customComponent,
                        payload: result,
                        role: 'model'
                    });
                } catch (tutorErr) {
                    console.error("Tutor Action Failed:", tutorErr);
                    return res.json({ text: "I tried to analyze that, but ran into a hiccup. Could you try sending it again?", role: 'model' });
                }
            } else if (route.intent === 'ASSESS' && agentId === 'math') {
                console.log("[IntentRouter] Triggering Math Assessment Flow.");
                const MathsLabService = require('./services/maths/MathsLabService');
                
                let imageBuffer = null;
                let mimeType = 'image/jpeg';
                
                if (image) {
                    const base64String = typeof image === 'string' ? image.replace(/^data:image\/\w+;base64,/, "") : image.data;
                    mimeType = image.mimeType || 'image/jpeg';
                    imageBuffer = Buffer.from(base64String, 'base64');
                }
                
                if (!imageBuffer) {
                    return res.json({ 
                        text: "I'd love to help you with that! Please upload a photo of your math problem so I can see it clearly. 📸", 
                        role: 'model' 
                    });
                }

                try {
                    const result = await MathsLabService.assessHandwriting(imageBuffer, mimeType, uid);
                    return res.json(result);
                } catch (assessErr) {
                    console.error("Math Assessment Failed:", assessErr);
                    return res.json({ 
                        text: "I tried to analyze your math problem, but ran into a technical hiccup. Could you try uploading the photo again? Make sure it's clear and well-lit!", 
                        role: 'model' 
                    });
                }
            }
        } catch (rErr) {
            console.error("[IntentRouter] Error:", rErr);
        }
    }

    // --- STANDARD AI FLOW (Fallback) ---
    let dbUpdated = false;

    console.log(`[Trace] User profile loaded for ${uid}. Level: ${user.level}`);
            let systemPrompt = `${GLOBAL_BASE_RULES}\n\n${AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace}`;

    const userName = user?.displayName || user?.nickname || user?.email?.split('@')[0] || "小戰士";
    
    // Improved dreamSubject detection: fallback to first dreamProgram name if dreamSubject string is missing
    let dreamSubject = user?.dreamSubject;
    if (!dreamSubject && user?.dreamPrograms && Array.isArray(user.dreamPrograms) && user.dreamPrograms.length > 0) {
        dreamSubject = user.dreamPrograms[0].name;
    }
    if (!dreamSubject) dreamSubject = "心儀學科 (未設定)";

    // Replace common placeholders
    systemPrompt = systemPrompt
        .replace(/{{userName}}/g, userName)
        .replace(/{{DREAM_SUBJECT}}/g, dreamSubject);

    // skillMap and isNewStudent are already loaded at 0. PRE-LOAD USER CONTEXT
    console.log(`[Trace] isNewStudent for ${uid}: ${isNewStudent}. skillMap exists: ${!!skillMap}`);
    const ragSnippets = message ? retrieveKnowledge(message) : null;

    // --- ACE SIR: ADDITIONAL CONTEXT ---
    if (agentId === 'ace') {
        let aceContext = `\n\n[STUDENT TARGETS & CAPABILITIES]
- Name: ${userName}
- Dream Subject: ${user?.dreamSubject || 'Not set'}
- Target Grades (Core):
  - English: ${user?.targetGradeEng || 'N/A'} (Assessed: Level ${user?.diagnostic_results?.english?.overall_level || 'Pending'})
  - Chinese: ${user?.targetGradeChi || 'N/A'} (Assessed: Level ${user?.diagnostic_results?.chinese?.overall_level || 'Pending'})
  - Mathematics: ${user?.targetGradeMath || 'N/A'} (Assessed: Level ${user?.diagnostic_results?.maths?.overall_level || 'Pending'})`;

        if (user?.electives && Array.isArray(user.electives) && user.electives.length > 0) {
            aceContext += `\n- Elective Subjects:
${user.electives.map(e => `  - ${e.subject || 'Unknown'}: Target ${e.targetGrade || 'N/A'}`).join('\n')}`;
        }

        aceContext += `\n\n[ACE SIR STRATEGY INSTRUCTION]
1. Perform a "Best 5" analysis based on the student's targets and dream subject.
2. If the student's assessed level is below their target, highlight the "Score Gap" and give specific DSE strategy tips.
3. Remind them how their elective choices impact their ${user?.dreamSubject || 'university'} entrance chances (mention "Best 5" or "Best 6" calculation).
4. Always address them as ${userName} and maintain your expert DSE mentor persona.`;

        systemPrompt += aceContext;
    }

    // --- (RECAP LOGIC MOVED DOWN) ---


    // --- INSIGHTFUL SUGGESTIONS ENGINE (NEW) ---
    let insightPackage = "";
    const lang = user?.preferredLanguage || 'zh-Hant';
    
    if (!isNewStudent && user?.diagnostic_completed) {
        try {
            const roadmap = await RoadmapService.getCurrentPlan(uid, agentId === 'math' ? 'maths' : 'english');
            const mistakes = await UserProfileService.getMistakes(uid, agentId === 'math' ? 'math' : 'english', 1);
            const weeklyStatus = await GamificationService.getWeeklyQuestStatus(uid);
            const overallLevel = skillMap?.overall_level || skillMap?.level || 1;
            const completedWeeklyCount = (user?.weekly_quests_completed || []).length;

            const nextQuest = roadmap?.tasks?.find(t => t.status === 'PENDING' && t.id !== 'boss');
            const recentMistake = mistakes?.[0];

            // Localized Header
            insightPackage = lang === 'en' ? "\n\n[STUDENT_INSIGHTS_FOR_SUGGESTIONS]" : "\n\n[學生學習洞察 - 用於生成建議筆 (SUGGESTIONS)]";

            if (nextQuest) {
                insightPackage += lang === 'en' 
                    ? `\n- NEXT_QUEST: ${nextQuest.title}`
                    : `\n- 下一個任務: ${nextQuest.title}`;
            }

            if (recentMistake) {
                insightPackage += lang === 'en'
                    ? `\n- RECENT_MISTAKE: ${recentMistake.term} (${recentMistake.subject})`
                    : `\n- 最近錯誤: ${recentMistake.term} (${recentMistake.subject})`;
            }

            // Mock Readiness Logic: 2+ weekly completed
            if (completedWeeklyCount >= 2) {
                // Find weakest paper/skill
                let weakest = null;
                if (agentId === 'math') {
                    const skills = Object.entries(skillMap?.microSkills || {}).sort((a,b) => (a[1].level || 0) - (b[1].level || 0));
                    if (skills[0]) weakest = skills[0][0].replace('math_', '').replace(/_/g, ' ');
                } else {
                    const papers = ['reading', 'writing', 'listening', 'speaking'];
                    const sortedPapers = papers.sort((a,b) => (skillMap?.raw_results?.[a]?.level_estimate || 0) - (skillMap?.raw_results?.[b]?.level_estimate || 0));
                    weakest = sortedPapers[0];
                }
                
                insightPackage += lang === 'en'
                    ? `\n- MOCK_READY: Student has finished 2+ Weekly Quests. Recommend a Mock for ${weakest || 'general'}.`
                    : `\n- 模擬試準備就緒: 學生已完成 2 個或以上每週任務。推薦進行 ${weakest || '綜合'} 模擬考試。`;
            }

            insightPackage += lang === 'en'
                ? `\n- CURRENT_DSE_LEVEL: ${overallLevel}. Advise on pushing for Level ${Math.min(7, Math.ceil(overallLevel + 1))}.`
                : `\n- 目前 DSE 等級估計: ${overallLevel}。建議如何衝刺到 Level ${Math.min(7, Math.ceil(overallLevel + 1))}。`;

            if (lang !== 'en') {
                insightPackage += `\n- IMPORTANT: Output chips in Traditional Chinese (繁體中文).`;
            } else {
                insightPackage += `\n- IMPORTANT: Output chips in English.`;
            }
        } catch (suggestionErr) {
            console.warn("[Suggestions] Insight gathering failed:", suggestionErr);
        }
    }

    // --- ENGLISH AGENT (MISS JANIE) SYSTEM PROMPT INJECTION ---
    if (agentId === 'english') {
        systemPrompt = systemPrompt
            .replace('{{DATE}}', new Date().toDateString())
            .replace('{{LEVEL}}', skillMap?.overall_level || skillMap?.level || 1)
            .replace('{{GRADE}}', user.grade || 'F6')
            .replace('{{PATH}}', user.targetGradeEng || 'Level 4')
            .replace('{{ONBOARDING}}', isNewStudent ? ONBOARDING_PROTOCOL : "")
            .replace('{{INSIGHT_PACKAGE}}', insightPackage)
            .replace('{{WORKFLOW_INSTRUCTIONS}}', ""); // Placeholder for future generic workflow logic

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
    }

    // --- MATH AGENT (MATT SIR) SYSTEM PROMPT INJECTION ---
    if (agentId === 'math') {
        const mathLevel = skillMap?.level || user?.maths_level || 1;
        systemPrompt = systemPrompt
            .replace('{{DATE}}', new Date().toDateString())
            .replace('{{LEVEL}}', mathLevel)
            .replace('{{GRADE}}', user.grade || 'F6')
            .replace('{{PATH}}', user.targetGradeMath || 'Level 5**')
            .replace('{{INSIGHT_PACKAGE}}', insightPackage)
            .replace('{{ONBOARDING}}', isNewStudent ? "STRICT INSTRUCTION: Invite the student to start the 15-minute Diagnostic Test to find their DSE projected level." : "");

        const resultRecapMatch = (message || "").match(/DIAGNOSTIC_JUST_COMPLETED/);
        if (!resultRecapMatch && !isNewStudent && user?.has_maths_diagnostic) {
            systemPrompt += `\n\n[SYSTEM: MATH_PROFILE_CONTEXT]
- Student is a diagnosed student. Overall Math Level: ${mathLevel}.
- Target: ${user.targetGradeMath || 'Level 5**'}.
- Mentor Instruction: Be the precise, encouraging Matt Sir. Reference their micro-skills below if they ask for practice.`;

        }

        // Output Language Handling
        const outputLanguage = req.body.outputLanguage;
        if (outputLanguage === 'zh-HK') {
            systemPrompt += `\n**IMPORTANT LANGUAGE OVERRIDE**:
The student prefers to communicate in **Traditional Chinese (Cantonese Context)**.
- Use friendly, professional Cantonese (e.g. "呢條題目...", "其實關鍵在於...").
- Keep mathematical terms primarily in English if common (e.g. "Slope", "Quadratic Equation") but explain in Chinese.
- **NEVER** output Simplified Chinese.
`;
        }
    }

    if (ragSnippets) systemPrompt += `\nReference (RAG):\n${ragSnippets}`;

    // Inject Enhanced Detailed Micro-Skills




    // Initialize history for this agent if not exists  (In-memory only for this scope, real storage handled later)
    // No need to write to db.json anymore



    console.log(`[Trace] Routing request for agent ${agentId}...`);
    const { model: selectedModelName, useAceSir } = routeRequest(message, !!req.body.image);

    const isExamMode = !!user.activeExam;
    if (useAceSir && !isExamMode) {
        systemPrompt = `${ACE_SIR_INJECTION}\n\n${systemPrompt}`;
    }

    try {
        


        console.log(`[Trace] Attempting model: ${selectedModelName}`);
        console.log(`[Trace] Final System Prompt Snippet: ${systemPrompt.substring(0, 500)}...`);
        console.log(`[Trace] System Prompt Gating Check - isNewStudent: ${isNewStudent}, diagComp: ${user?.diagnostic_completed}`);

        // --- INTELLIGENT RESULT RECAP (MENTOR ANALYSIS) ---
        if (message && message.startsWith('[SYSTEM:')) {
            console.log(`[Trace] Intelligent Recap Triggered for ${uid}: ${message}`);

            const trigger = message.match(/\[SYSTEM: (.*)\]/)?.[1];
            if (trigger === 'DIAGNOSTIC_JUST_COMPLETED') {
                const subject = agentId === 'math' ? 'maths' : 'english';
                const diagnosticResult = await UserProfileService.getDiagnosticResult(uid, subject);
                const currentPlan = await RoadmapService.getCurrentPlan(uid, subject);

                if (diagnosticResult) {
                    const subjectLabel = agentId === 'math' ? 'Mathematics' : 'English';
                    const levelDisplay = agentId === 'math' ? `${diagnosticResult.overall_level}` : `${diagnosticResult.overall_level}/7`;

                    systemPrompt += `\n### URGENT TASK: DIAGNOSTIC RECAP
The student has just completed the "${subjectLabel} Diagnostic Test".
**Archetype**: ${diagnosticResult.archetype}
**Overall Level**: ${levelDisplay}
**Strengths**: ${diagnosticResult.strengths ? diagnosticResult.strengths.join(', ') : (agentId === 'math' ? 'Mathematical Logic' : 'Determination')}
**Weaknesses**: ${diagnosticResult.weaknesses ? diagnosticResult.weaknesses.join(', ') : (agentId === 'math' ? 'Complex Problem Solving' : 'Grammar')}

**ACTUAL PERSONALIZED WEEKLY INTEGRATED CHALLENGES**:
${currentPlan?.tasks?.filter(t => t.id !== 'boss').map((t, i) => `${i + 1}. ${t.title}`).join('\n')}

**Mentor Goal**: Welcome them and explain their archetype.
**CRITICAL (Nuance & Accuracy)**: 
1. Since this was only a 15-minute diagnostic, do NOT make definitive claims like "You are Level 4". 
2. Instead, use estimated/speculative language: "Based on this quick check, you appear to be around Level ${diagnosticResult.overall_level}", or "This preliminary result suggests a DSE ${levelDisplay} foundation."
3. Emphasize that we will solidify and verify this level together through regular practice.

**Immediate Roadmap**: Explicitly mention their **Personalized Weekly Integrated Challenges** listed above. 
**GOLDEN NUGGET**: Based on their weaknesses, provide 1 specific, actionable piece of advice using the [SAVE_NUGGET: Advice text | Topic] tag. 

**STRICT PERSONA REMAINDER**: Maintain your identity as **${agentId === 'math' ? 'Matt sir' : 'Miss Janie'}**. ${agentId === 'math' ? 'Be the precise, encouraging specialist.' : 'Use a warm, peer-like, and highly encouraging tone.'}`;
                }
            }

            // 2. Lab Completion Recap
            if (message.includes('LAB_COMPLETED')) {
                const topicMatch = message.match(/LAB_COMPLETED:\s*([^|\]]+)/);
                const topic = topicMatch ? topicMatch[1].trim() : "Learning Lab";
                const xpMatch = message.match(/XP:\s*(\d+)/);
                const xpEarned = xpMatch ? xpMatch[1] : null;
                const masteryMatch = message.match(/Mastery:\s*(\d+)%/);
                const masteryScore = masteryMatch ? masteryMatch[1] : null;

                const subject = agentId === 'math' ? 'maths' : 'english';

                // --- QUEST UPDATE START (Unified) ---
                try {
                    const { completedQuests } = await RoadmapService.completeQuestByContext(uid, topic, false, subject);
                    if (completedQuests && completedQuests.length > 0) {
                        completedQuests.forEach(q => systemPrompt += `\n[SYSTEM: QUEST_COMPLETED: ${q}]`);
                        console.log(`[Roadmap] Quest Completed via Lab: ${completedQuests.join(', ')}`);
                    }
                } catch (qErr) { console.error("[Quest Update Lab] Error:", qErr); }
                // --- QUEST UPDATE END ---

                systemPrompt += `\n### URGENT TASK: LAB RECAP
The student just successfully completed a mission in the **English Learning Lab**.
**Topic**: ${topic}
${xpEarned ? `**XP Earned**: ${xpEarned}` : ''}
${masteryScore ? `**Mastery Score**: ${masteryScore}%` : ''}

**Mentor Goal**: Celebrate their mastery of ${topic}. ${xpEarned ? `Specifically congratulate them on earning **${xpEarned} XP**.` : ''} Briefly summarize why ${topic} is crucial for DSE Paper 1/2 success. **GOLDEN NUGGET**: Extract one key learning point from this module and include it as a [SAVE_NUGGET: Advice text | ${topic}] tag. Finally, suggest "Leveling up" to a related Mock Exam or a more advanced Grammar lab.`;
            }

            // 2b. Quest Completion (Proactive Summary on Dashboard return)
            if (message.includes('CHALLENGE_COMPLETED')) {
                const topicMatch = message.match(/CHALLENGE_COMPLETED:\s*([^|\]]+)/);
                const topic = topicMatch ? topicMatch[1].trim() : "Activity";

                systemPrompt += `\n### URGENT TASK: TASK SUMMARY
The student just finished their **Roadmap Challenge** for "${topic}" and returned to the dashboard. 
**Mentor Goal**: Proactively greet them and summarize their big achievement. Use phrases like "Welcome back! I saw you just crushed that ${topic} challenge!" or "Great job completing your ${topic} mission!". 
Briefly tell them why this specific skill (${topic}) is a 'game-changer' for their DSE target grade. 
**NEXT STEP**: Check their roadmap and suggest the *very next* task they should tackle. 
**STRICT OUTPUT FORMAT**: You MUST return your response as a valid JSON object:
{
  "text": "Your celebration and advice message here (plain text, no markdown blocks)",
  "suggested_chips": ["Short label for Next Challenge", "Another option", "View Progress"]
}
Maintain a high-energy, supportive "Big Sister/Brother" tone.`;
            }

            // 3. Mock Exam Completion Recap
            if (message.includes('EXAM_JUST_COMPLETED')) {
                const examIdMatch = message.match(/EXAM_JUST_COMPLETED:\s*([^\]]+)\]/);
                const examId = examIdMatch ? examIdMatch[1] : "Mock Exam";
                const subject = agentId === 'math' ? 'maths' : 'english';

                // --- QUEST UPDATE START (Unified) ---
                try {
                    const { completedQuests } = await RoadmapService.completeQuestByContext(uid, examId, true, subject);
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

        await GenerativeAIService.init();

        const model = GenerativeAIService.getModel({
            model: selectedModelName,
            systemInstruction: systemPrompt
        });

        console.log(`[Trace] System Prompt Length: ${systemPrompt.length} chars`);
        if (message && message.includes('[SYSTEM:')) {
            require('fs').appendFileSync('debug.log', `[${new Date().toISOString()}] FINAL SYSTEM PROMPT SNIPPET (last 1000 chars):\n${systemPrompt.slice(-1000)}\n\n`);
        }

        // --- HISTORY SANITIZATION ---
        console.log("[Trace] Sanitizing history...");
        let sanitizedHistory = [];
        if (clientHistory && Array.isArray(clientHistory)) {
            // Prune history: Take last 4 turns to save tokens
            const historyWindow = clientHistory.slice(-4);

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
            generationConfig: { maxOutputTokens: 4096 }, // Increased for long mentor recaps
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
            result = await GenerativeAIService.sendMessage(chat, payload, {
                model: selectedModelName,
                systemInstruction: systemPrompt // Pass current instruction for potential failover retries
            });

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
        
        if (!response) {
            console.error("❌ [Trace] No response object found in AI result:", JSON.stringify(result, null, 2));
            throw new Error("AI provider returned an empty response.");
        }

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

        if (res.headersSent) {
            console.warn(`[Trace] Attempted to send response for ${uid} but headers were already sent (likely timeout).`);
            return;
        }

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
        
        if (res.headersSent) {
            console.error(`[Trace] Error in chat endpoint for ${uid}, but headers already sent. Logging only.`);
            return;
        }

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
const cardPool = require('./data/card_pool.json');

// Helper: weighted random pick from array based on rarity
function pickCardByRarity(cards) {
    const rarityWeights = { common: 60, rare: 25, epic: 10, legendary: 5 };
    const weighted = cards.map(c => ({ card: c, weight: rarityWeights[c.rarity] || 10 }));
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const w of weighted) {
        roll -= w.weight;
        if (roll <= 0) return w.card;
    }
    return weighted[weighted.length - 1].card;
}

app.post('/api/redemption/blindbox', async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    const BOX_COST = cardPool.draw_cost || 500;

    try {
        // Fetch existing inventory to avoid duplicates
        const inventorySnap = await db.collection('users').doc(uid).collection('inventory').get();
        const ownedIds = new Set(inventorySnap.docs.map(d => d.data().itemId));

        // Category roll: 80% student, 20% tutor
        const categoryRoll = Math.random();
        const istutor = categoryRoll > cardPool.draw_rates.student; // > 0.80 = tutor
        const pool = istutor ? cardPool.tutor_cards : cardPool.student_cards;
        const cardType = istutor ? 'tutor' : 'student';

        // Pick card with rarity weighting + duplicate protection (re-roll up to 5x)
        let selectedCard = null;
        const availableCards = pool.filter(c => !ownedIds.has(c.id));

        if (availableCards.length === 0) {
            // All cards in this category owned — try the other pool
            const altPool = istutor ? cardPool.student_cards : cardPool.tutor_cards;
            const altAvailable = altPool.filter(c => !ownedIds.has(c.id));
            if (altAvailable.length === 0) {
                return res.status(400).json({ error: "You've collected all cards! 🎉 Amazing!" });
            }
            selectedCard = pickCardByRarity(altAvailable);
        } else {
            selectedCard = pickCardByRarity(availableCards);
        }

        const newItem = {
            id: selectedCard.id,
            itemId: selectedCard.id,
            name: selectedCard.name,
            type: cardType,
            rarity: selectedCard.rarity,
            description: selectedCard.description,
            image: selectedCard.image,
            personality: selectedCard.personality || null,
            tone: selectedCard.tone || null
        };

        const result = await GamificationService.redeemItem(uid, newItem.id, BOX_COST, newItem);

        if (result.success) {
            res.json({ success: true, newItem, newBalance: result.newBalance, isNew: true });
        } else {
            res.status(400).json({ error: result.error });
        }
    } catch (e) {
        console.error("Redemption Error:", e);
        res.status(500).json({ error: "Transaction failed" });
    }
});

// GET /api/redemption/collection — fetch full catalog with owned status
app.get('/api/redemption/collection', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    try {
        const inventorySnap = await db.collection('users').doc(uid).collection('inventory').get();
        const ownedCards = {};
        inventorySnap.docs.forEach(d => {
            const data = d.data();
            ownedCards[data.itemId] = { ...data, docId: d.id };
        });

        // Get equipped tutor
        const userDoc = await db.collection('users').doc(uid).get();
        const equippedTutor = userDoc.exists ? userDoc.data()?.equipped_tutor || null : null;

        // Build full catalog with ownership
        const studentCards = cardPool.student_cards.map(c => ({
            ...c,
            type: 'student',
            owned: !!ownedCards[c.id],
            acquiredAt: ownedCards[c.id]?.acquiredAt || null
        }));

        const tutorCards = cardPool.tutor_cards.map(c => ({
            ...c,
            type: 'tutor',
            owned: !!ownedCards[c.id],
            equipped: equippedTutor === c.id,
            acquiredAt: ownedCards[c.id]?.acquiredAt || null
        }));

        const stats = {
            totalStudentCards: cardPool.student_cards.length,
            ownedStudentCards: studentCards.filter(c => c.owned).length,
            totalTutorCards: cardPool.tutor_cards.length,
            ownedTutorCards: tutorCards.filter(c => c.owned).length
        };

        res.json({
            studentCards,
            tutorCards,
            equippedTutor,
            stats,
            drawCost: cardPool.draw_cost
        });
    } catch (e) {
        console.error("Collection fetch error:", e);
        res.status(500).json({ error: "Failed to fetch collection" });
    }
});

// POST /api/redemption/equip — equip a tutor card personality
app.post('/api/redemption/equip', async (req, res) => {
    const { uid, cardId } = req.body;
    if (!uid || !cardId) return res.status(400).json({ error: "Missing uid or cardId" });

    try {
        // Verify ownership
        const inventorySnap = await db.collection('users').doc(uid).collection('inventory')
            .where('itemId', '==', cardId).get();

        if (inventorySnap.empty) {
            return res.status(403).json({ error: "You don't own this card" });
        }

        // Verify it's a tutor card
        const tutorCard = cardPool.tutor_cards.find(c => c.id === cardId);
        if (!tutorCard) {
            return res.status(400).json({ error: "Not a tutor card" });
        }

        await db.collection('users').doc(uid).set({ equipped_tutor: cardId }, { merge: true });

        res.json({ success: true, equippedTutor: cardId, tutorName: tutorCard.name });
    } catch (e) {
        console.error("Equip error:", e);
        res.status(500).json({ error: "Failed to equip card" });
    }
});

// POST /api/redemption/unequip — remove tutor card, back to default
app.post('/api/redemption/unequip', async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    try {
        await db.collection('users').doc(uid).set({ equipped_tutor: null }, { merge: true });
        res.json({ success: true, equippedTutor: null });
    } catch (e) {
        console.error("Unequip error:", e);
        res.status(500).json({ error: "Failed to unequip card" });
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

            // Handle both structure versions
            const metadata = data.metadata || data.meta || {};
            const title = metadata.title || metadata.description || f.replace('.json', '').replace(/_/g, ' ');
            const date = metadata.generated_at || data.generated_at || new Date().toISOString();

            return {
                id: f.replace('.json', ''),
                title: title,
                date: date,
                tags: ["Listening", "Paper 3"]
            };
        } catch (e) {
            console.error(`Error parsing listening mock file ${f}:`, e);
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

        const rawData = fs.readFileSync(filePath, 'utf8');
        let data = JSON.parse(rawData);

        // --- NORMALIZATION ENGINE ---

        // 1. Unify Metadata
        const meta = data.metadata || data.meta || {};
        data.metadata = {
            title: meta.title || meta.description || req.params.id.replace(/_/g, ' '),
            generated_at: meta.generated_at || data.generated_at || new Date().toISOString(),
            difficulty: meta.difficulty || "Level 4"
        };

        // 2. Unpack Sections
        if (data.sections) {
            Object.assign(data, data.sections);
            delete data.sections;
        }

        // 3. Normalize Scripts (Flatten Task-based scripts)
        const normalizeScript = (partKey) => {
            const part = data[partKey];
            if (!part) return [];

            let lines = [];

            // Source A: Part.script (Already flat)
            if (Array.isArray(part.script)) {
                lines = part.script;
            }
            // Source B: Part.audio_script (Nested by Task)
            else if (part.audio_script) {
                Object.values(part.audio_script).forEach(taskObj => {
                    if (Array.isArray(taskObj.content)) lines.push(...taskObj.content);
                    else if (Array.isArray(taskObj.script)) lines.push(...taskObj.script);
                });
            }
            // Source C: data.audio_scripts[partKey] (Global Scripts object)
            else if (data.audio_scripts && data.audio_scripts[partKey]) {
                const partScriptObj = data.audio_scripts[partKey];
                if (Array.isArray(partScriptObj)) {
                    lines = partScriptObj;
                } else {
                    Object.values(partScriptObj).forEach(taskObj => {
                        if (Array.isArray(taskObj.script)) lines.push(...taskObj.script);
                        else if (Array.isArray(taskObj.content)) lines.push(...taskObj.content);
                        else if (Array.isArray(taskObj)) lines.push(...taskObj);
                    });
                }
            }

            // Standardize line format { speaker, text }
            return lines.map(l => ({
                speaker: l.speaker || "Announcer",
                text: l.text || l.dialogue || l.line || ""
            }));
        };

        if (data.Part_A) data.Part_A.script = normalizeScript('Part_A');
        if (data.Part_B) data.Part_B.script = normalizeScript('Part_B');

        // 4. Normalize Questions (Some AI put questions inside scripts or different keys)
        const normalizeTasks = (partKey) => {
            const part = data[partKey];
            if (!part) return;

            // Handle case where Part.tasks is missing but tasks are inside audio_script (Source B)
            if (!Array.isArray(part.tasks) && part.audio_script) {
                part.tasks = Object.entries(part.audio_script)
                    .filter(([taskId]) => taskId.startsWith('Task'))
                    .map(([taskId, taskObj]) => ({
                        id: taskId,
                        instructions: taskObj.instructions || taskObj.prompt || taskObj.title || "Complete the task.",
                        questions: taskObj.questions || []
                    }));
            }

            if (!Array.isArray(part.tasks)) return;

            part.tasks = part.tasks.map(task => {
                // Unify instructions/prompt
                task.instructions = task.instructions || task.prompt || "Complete the task.";

                // If questions are missing but exist in the audio_script area
                if (!task.questions && part.audio_script?.[task.id]?.questions) {
                    task.questions = part.audio_script[task.id].questions;
                }

                // Normalizing each question to ensure it's not undefined
                if (Array.isArray(task.questions)) {
                    task.questions = task.questions.map((q, idx) => ({
                        id: q.id || q.qId || `Q${idx + 1}`,
                        type: (q.type || "fill_in_blank").toLowerCase().replace(/_/g, ' '),
                        label: q.label || q.text || q.question || "Answer here:",
                        options: q.options || [],
                        answer: q.answer || ""
                    }));
                } else {
                    task.questions = [];
                }

                return task;
            });
        };

        normalizeTasks('Part_A');
        normalizeTasks('Part_B');

        res.json(data);
    } catch (error) {
        console.error("Critical normalization failure for listening mock:", error);
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
        const { history, currentSpeaker, forcedNextSpeaker, topic, context, uid, userStatus, userLevel, candidateLevels } = req.body;

        const historyPayload = (history || []).slice(-15).map(h => {
            const role = h.role === 'user' ? 'Candidate_D' : h.role;
            return `${role}: ${h.text}`;
        }).join('\n');

        // Dynamic Personas based on levels
        const cl = candidateLevels || { 'Candidate_A': 5, 'Candidate_B': 4, 'Candidate_C': 3 };
        const personas = [
            `- Examiner (Miss Janie): Formal, facilitates the discussion. Does NOT dominate. Only speaks to prompt or redirect.`,
            `- Candidate_A (Annie, Level ${cl.Candidate_A}): High confidence, sophisticated vocabulary, often takes the lead or synthesizes points.`,
            `- Candidate_B (Ben, Level ${cl.Candidate_B}): Competent, uses common transitions, focuses on providing examples.`,
            `- Candidate_C (Charlie, Level ${cl.Candidate_C}): Basic fluency, simple vocabulary, agrees or disagrees with simple reasons.`
        ].join('\n');

        // Construct context-aware prompt
        const prompt = speakingAgent
            .replace('{TOPIC}', topic || context?.title || 'Unknown Topic')
            .replace('{POINTS}', JSON.stringify(context?.discussion_points || []))
            .replace('{CURRENT_SPEAKER}', currentSpeaker || 'Examiner')
            .replace('{FORCED_SPEAKER}', forcedNextSpeaker || 'None')
            .replace('{USER_STATUS}', userStatus || 'Idle')
            .replace('{HISTORY}', historyPayload)
            .replace('{PERSONAS}', personas);

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

        // --- ENFORCE UNIQUE SPEAKERS (Anti-Loop Guard) ---
        const candidates = ['Candidate_A', 'Candidate_B', 'Candidate_C'];

        // 1. Identify Last Speaker from History (or current context)
        let lastSpeaker = currentSpeaker;
        if (history && history.length > 0) {
            // Scan backwards for the last non-system/non-user speaker
            for (let i = history.length - 1; i >= 0; i--) {
                const h = history[i];
                if (h.role && candidates.includes(h.role)) {
                    lastSpeaker = h.role;
                    break;
                }
            }
        }

        // 2. Iterate and Fix turns in this batch
        let prev = lastSpeaker;
        finalTurns.forEach(turn => {
            if (turn.speaker === prev) {
                // Conflict detected: Pick a different candidate
                const otherCandidates = candidates.filter(c => c !== prev);
                const fallback = otherCandidates[Math.floor(Math.random() * otherCandidates.length)];
                console.log(`[Speaking] Consecutive speaker fix: ${turn.speaker} -> ${fallback} (prev was ${prev})`);
                turn.speaker = fallback;
            }
            prev = turn.speaker;
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

// 404 Handler
app.use((req, res, next) => {
    console.log(`[404] NOT FOUND: ${req.method} ${req.url}`);
    res.status(404).json({ error: "Route not found", path: req.url });
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


// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error(`[CRITICAL ERROR] ${new Date().toISOString()}: ${err.stack}`);
    if (!res.headersSent) {
        res.status(500).json({ 
            error: "Something went wrong on our end.",
            message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
        });
    }
});

// --- START SERVER ---
const finalPort = process.env.PORT || 3001;
console.log("[DEBUG] Attempting to start server on port " + finalPort);
const server = app.listen(finalPort, () => {
    console.log(`[OK] Server running on http://localhost:${finalPort}`);
});

// Increase timeout for long-running AI generations (10 minutes)
server.timeout = 600000;
