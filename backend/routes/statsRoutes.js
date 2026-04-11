const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const GamificationService = require('../services/GamificationService');
const UserProfileService = require('../services/UserProfileService');
const ServiceMonitor = require('../services/ServiceMonitor');

/**
 * GET /api/stats
 * Main endpoint for user onboarding status and progress.
 * Hardened with timeouts and safe fallbacks.
 */
router.get('/', statsHandler);
router.get('/user-stats', statsHandler);

async function statsHandler(req, res) {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    try {
        console.log(`[statsRoutes] Fetching data for UID ${uid}...`);
        const start = Date.now();
        
        // 1. Core Data Fetch (Essential for Dashboard)
        // We fetch profile and stats concurrently but without the aggressive batch timeout 
        // that was causing 3.5s hangs and empty radar data.
        const [statsResult, profileResult] = await Promise.allSettled([
            GamificationService.getProgress(uid),
            UserProfileService.getProfile(uid)
        ]);

        const stats = statsResult.status === 'fulfilled' ? statsResult.value : null;
        const user = profileResult.status === 'fulfilled' ? profileResult.value : null;

        if (statsResult.status === 'rejected') console.error(`[statsRoutes] Gamification failed for ${uid}:`, statsResult.reason);
        if (profileResult.status === 'rejected') console.error(`[statsRoutes] Profile failed for ${uid}:`, profileResult.reason);
        
        console.log(`[statsRoutes] Data fetch completed in ${Date.now() - start}ms`);

        // If user profile is missing or fetch timed out, we apply safe defaults.
        // IMPORTANT: We do NOT force is_new_student: true here anymore, as it causes 
        // redirect loops if the DB is just slow. Instead, we assume returning but degraded.
        if (!user) {
            console.warn(`[statsRoutes] User profile missing or timeout for ${uid}. Assuming RETURNING (degraded).`);
            return res.status(200).json({ 
                is_new_student: false, // Don't force redirect to onboarding
                user: { status: 'active', onboarding_completed: true },
                stats: stats || { xp: 0, level: 1 },
                _warning: "Data fetch degraded"
            });
        }

        // Logic check for "is_new_student"
        const isNewStudent = user.is_new_student === true || (!user.onboarding_completed && user.status !== 'active');

        // Check if diagnostic is done
        const hasDiagnosticEnglish = user.diagnostic_completed === true || !!user.diagnostic_results?.english;
        const hasDiagnosticMaths = user.has_maths_diagnostic === true || !!user.maths_diagnostic;

        // 2. Identify Top 3 Bottlenecks for "Target Growth"
        // Hardened with timeouts to prevent dashboard hangs
        const [engResult, mathResult] = await Promise.allSettled([
            ServiceMonitor.withTimeout(admin.firestore().collection('users').doc(uid).collection('progress').doc('english').get(), 3000, null),
            ServiceMonitor.withTimeout(admin.firestore().collection('users').doc(uid).collection('progress').doc('maths').get(), 3000, null)
        ]);

        const englishProgress = engResult.status === 'fulfilled' ? engResult.value : null;
        const mathsProgress = mathResult.status === 'fulfilled' ? mathResult.value : null;

        const engWeaknesses = (englishProgress && englishProgress.exists) ? (englishProgress.data().weaknessPriority || []) : [];
        const mathWeaknesses = (mathsProgress && mathsProgress.exists) ? (mathsProgress.data().weaknessPriority || []) : [];
        
        // Combine and prioritize (could be more complex, but simple join works for now)
        const combinedBottlenecks = [...mathWeaknesses, ...engWeaknesses].slice(0, 3);

        // Safeguard stats object to ensure dashboard doesn't show 0 incorrectly
        const safeStats = stats || { xp: 0, level: 1, currentStepXP: 0, nextLevelXP: 100, progressPercent: 0 };

        res.json({
            ...safeStats, // Flatten for simple root-level access
            stats: safeStats, // NESTED for dashboard compatibility
            user: {
                ...user,
                onboarding_completed: user?.onboarding_completed || false,
                diagnostic_completed: hasDiagnosticEnglish,
                has_maths_diagnostic: hasDiagnosticMaths
            },
            is_new_student: isNewStudent,
            diagnostic_completed: hasDiagnosticEnglish,
            has_maths_diagnostic: hasDiagnosticMaths,
            hasDiagnostic: {
                english: hasDiagnosticEnglish,
                maths: hasDiagnosticMaths
            },
            weaknessPriority: combinedBottlenecks, // For Target Growth UI
            xp: safeStats.xp,
            level: safeStats.level,
            currentStepXP: safeStats.currentStepXP || 0,
            nextLevelXP: safeStats.nextLevelXP || 100,
            progressPercent: safeStats.progressPercent || 0
        });
    } catch (err) {
        console.error("[statsRoutes] Panic Catch:", err);
        res.status(500).json({ error: "Internal Server Error in stats", fallback: true });
    }
}

/**
 * GET /api/stats/unlocks
 * Ability Radar Gating Logic.
 */
router.get('/unlocks', async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    try {
        console.log(`[statsRoutes] Checking unlocks for UID ${uid}`);
        
        const snapPromise = admin.firestore().collection('exam_submissions')
            .where('uid', '==', uid)
            .get();
            
        const snap = await ServiceMonitor.withTimeout(snapPromise, 4000, { empty: true, docs: [] });

        const ENGLISH_PAPER_TYPES = ['reading', 'writing', 'listening', 'speaking'];
        const MATHS_PAPER_TYPES = ['maths_p1', 'maths_p2'];

        const classify = (sub) => {
            const id = (sub.examId || '').toLowerCase();
            const type = (sub.type || sub.subject || '').toLowerCase();
            if (type.includes('read')) return 'reading';
            if (type.includes('writ')) return 'writing';
            if (type.includes('listen')) return 'listening';
            if (type.includes('speak')) return 'speaking';
            if (type.includes('maths') || type.includes('math')) {
                if (id.includes('p1') || id.includes('paper1') || id.includes('paper_1')) return 'maths_p1';
                return 'maths_p2';
            }
            if (id.includes('math') || id.includes('maths')) {
                if (id.includes('p1') || id.includes('paper1')) return 'maths_p1';
                return 'maths_p2';
            }
            if (id.includes('listen')) return 'listening';
            if (id.includes('speak')) return 'speaking';
            if (id.includes('writ')) return 'writing';
            return 'reading';
        };

        const completedTypes = new Set();
        if (snap && snap.forEach) {
            snap.forEach(doc => {
                completedTypes.add(classify(doc.data()));
            });
        }

        res.json({
            englishUnlocked: ENGLISH_PAPER_TYPES.every(t => completedTypes.has(t)),
            mathsUnlocked: MATHS_PAPER_TYPES.every(t => completedTypes.has(t)),
            completedTypes: Array.from(completedTypes)
        });
    } catch (err) {
        console.error("[statsRoutes] Unlocks Error:", err);
        res.status(500).json({ error: "Failed to calculate unlocks", englishUnlocked: false });
    }
});

/**
 * GET /api/microskills/:uid
 * Fetch all micro-skill data for a user
 */
router.get('/microskills/:uid', async (req, res) => {
    const { uid } = req.params;
    const { subject = 'english' } = req.query; // Support subject filtering
    try {
        const progressDoc = await admin.firestore().collection('users').doc(uid).collection('progress').doc(subject).get();
        let data = { microSkills: {}, weaknessPriority: [], practicedSkills: [], version: 1 };
        if (progressDoc.exists) {
            const d = progressDoc.data();
            data = {
                microSkills: d.microSkills || {},
                weaknessPriority: d.weaknessPriority || [],
                practicedSkills: d.practicedSkills || [],
                version: d.version || 1,
                timestamp: d.lastUpdated
            };
        }
        const weeklyStatus = await GamificationService.getWeeklyQuestStatus(uid);
        res.json({ ...data, weeklyQuest: weeklyStatus });
    } catch (e) {
        console.error(`[MicroSkills] Fetch Error for ${subject}:`, e);
        res.status(500).json({ error: 'Failed to fetch' });
    }
});

/**
 * GET /api/microskills/:uid/paper/:paper
 * Fetch skills filtered by paper (reading/writing/etc)
 */
router.get('/microskills/:uid/paper/:paper', async (req, res) => {
    const { uid, paper } = req.params;
    try {
        const progressDoc = await admin.firestore().collection('users').doc(uid).collection('progress').doc('english').get();
        if (!progressDoc.exists) return res.json({ skills: {} });
        const allSkills = progressDoc.data().microSkills || {};
        const filtered = Object.fromEntries(Object.entries(allSkills).filter(([k]) => k.startsWith(paper.toLowerCase())));
        res.json({ skills: filtered });
    } catch (e) {
        res.status(500).json({ error: 'Filter failed' });
    }
});

/**
 * POST /api/microskills/:uid/update
 * Manual update for micro-skills
 */
router.post('/microskills/:uid/update', async (req, res) => {
    const { uid } = req.params;
    const { skills, subject = 'english' } = req.body;
    try {
        await admin.firestore().collection('users').doc(uid).collection('progress').doc(subject).set({
            microSkills: skills,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

module.exports = router;
