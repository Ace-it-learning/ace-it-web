const express = require('express');
const router = express.Router();
const GamificationService = require('../services/GamificationService');
const UserProfileService = require('../services/UserProfileService');
const ServiceMonitor = require('../services/ServiceMonitor');
const CosmosStore = require('../services/CosmosStore');
const { requireResolvedUid } = require('../middleware/requireResolvedUid');

/**
 * GET /api/stats
 * Main endpoint for user onboarding status and progress.
 * Hardened with timeouts and safe fallbacks.
 */
router.get('/', requireResolvedUid, statsHandler);
router.get('/user-stats', requireResolvedUid, statsHandler);

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
            console.warn(`[statsRoutes] User profile missing or timeout for ${uid}. Treating as NEW (degraded).`);
            return res.status(200).json({
                is_new_student: true,
                user: { status: 'pending', onboarding_completed: false },
                stats: stats || { xp: 0, level: 1 },
                _warning: "Data fetch degraded"
            });
        }

        // Logic check for "is_new_student"
        const isNewStudent =
            user.is_new_student === true ||
            user.onboarding_completed === false ||
            (!user.onboarding_completed && !user.school && user.status !== 'active');

        // Check if diagnostic is done
        const hasDiagnosticEnglish = user.diagnostic_completed === true || !!user.diagnostic_results?.english;
        const hasDiagnosticMaths = user.has_maths_diagnostic === true || !!user.maths_diagnostic;

        // 2. Identify Top 3 Bottlenecks for "Target Growth"
        // Hardened with timeouts to prevent dashboard hangs
        const [engResult, mathResult] = await Promise.allSettled([
            ServiceMonitor.withTimeout(UserProfileService.getSkillMap(uid, 'english'), 3000, null),
            ServiceMonitor.withTimeout(UserProfileService.getSkillMap(uid, 'maths'), 3000, null)
        ]);

        const englishProgress = engResult.status === 'fulfilled' ? engResult.value : null;
        const mathsProgress = mathResult.status === 'fulfilled' ? mathResult.value : null;

        const engWeaknesses = englishProgress?.weaknessPriority || [];
        const mathWeaknesses = mathsProgress?.weaknessPriority || [];
        
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
router.get('/unlocks', requireResolvedUid, async (req, res) => {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });

    try {
        console.log(`[statsRoutes] Checking unlocks for UID ${uid}`);

        const ENGLISH_PAPER_TYPES = ['reading', 'writing', 'listening', 'speaking'];
        const MATHS_PAPER_TYPES = ['maths_p1', 'maths_p2'];

        const classify = (sub) => {
            const id = (sub.examId || sub.paperId || sub.mockId || '').toLowerCase();
            const type = (sub.type || sub.subject || sub.paper || '').toLowerCase();
            const topic = (sub.topic || sub.questName || '').toLowerCase();
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
            if (topic.includes('mock') && topic.includes('read')) return 'reading';
            if (topic.includes('mock') && topic.includes('listen')) return 'listening';
            if (topic.includes('mock') && topic.includes('speak')) return 'speaking';
            if (topic.includes('mock') && topic.includes('writ')) return 'writing';
            return null;
        };

        const completedTypes = new Set();

        // 1. Check legacy exam_submissions
        const submissions = await ServiceMonitor.withTimeout(
            CosmosStore.container('exam_submissions')
                .then((c) => c.items.query({
                    query: "SELECT * FROM c WHERE c.pk = @uid",
                    parameters: [{ name: "@uid", value: uid }]
                }).fetchAll())
                .then((r) => r.resources || []),
            4000,
            []
        );
        if (Array.isArray(submissions)) {
            submissions.forEach((sub) => {
                const type = classify(sub);
                if (type) completedTypes.add(type);
            });
        }

        // 2. Check quest_results for mock exam completions
        const questResults = await ServiceMonitor.withTimeout(
            CosmosStore.container('quest_results')
                .then((c) => c.items.query({
                    query: "SELECT * FROM c WHERE c.pk = @uid",
                    parameters: [{ name: "@uid", value: uid }]
                }).fetchAll())
                .then((r) => r.resources || []),
            4000,
            []
        );
        if (Array.isArray(questResults)) {
            questResults.forEach((sub) => {
                const type = classify(sub);
                if (type) completedTypes.add(type);
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
router.get('/microskills/:uid', requireResolvedUid, async (req, res) => {
    const { uid } = req.params;
    const { subject = 'english' } = req.query; // Support subject filtering
    try {
        const progress = await UserProfileService.getSkillMap(uid, subject);
        let data = { microSkills: {}, weaknessPriority: [], practicedSkills: [], version: 1 };
        if (progress) {
            data = {
                microSkills: progress.microSkills || {},
                weaknessPriority: progress.weaknessPriority || [],
                practicedSkills: progress.practicedSkills || [],
                version: progress.version || 1,
                timestamp: progress.lastUpdated
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
router.get('/microskills/:uid/paper/:paper', requireResolvedUid, async (req, res) => {
    const { uid, paper } = req.params;
    try {
        const progress = await UserProfileService.getSkillMap(uid, 'english');
        if (!progress) return res.json({ skills: {} });
        const allSkills = progress.microSkills || {};
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
router.post('/microskills/:uid/update', requireResolvedUid, async (req, res) => {
    const { uid } = req.params;
    const { skills, subject = 'english' } = req.body;
    try {
        await UserProfileService.saveSkillMap(uid, subject, {
            microSkills: skills,
            lastUpdated: new Date().toISOString()
        });
        await UserProfileService.saveProgressSnapshot(uid, subject);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

module.exports = router;
