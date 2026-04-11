const admin = require('firebase-admin');
const moment = require('moment'); // You might need to install moment or use native Date
const GenerativeAIService = require('./GenerativeAIService');
const UserProfileService = require('./UserProfileService');
const CacheService = require('./CacheService');

class RoadmapService {
    constructor() {
        this.db = admin.firestore();
    }

    /**
     * MAIN ENTRY: Get or Generate Current Plan
     */
    async getCurrentPlan(uid, subject = 'english') {
        if (!uid) return null;

        const cacheKey = `roadmap_${subject}_${uid}`;
        const cached = CacheService.getDbCache(cacheKey);
        if (cached) return cached;

        const docId = subject === 'maths' ? 'current_maths' : 'current';
        const roadmapRef = this.db.collection('users').doc(uid).collection('roadmap').doc(docId);
        const doc = await roadmapRef.get();

        if (doc.exists) {
            const plan = doc.data();
            // Check Expiry (7 days)
            let expiresAt;
            if (plan.expiresAt && typeof plan.expiresAt.toDate === 'function') {
                expiresAt = plan.expiresAt.toDate();
            } else if (plan.expiresAt) {
                expiresAt = new Date(plan.expiresAt);
            }

            if (expiresAt && new Date() < expiresAt) {
                CacheService.setDbCache(cacheKey, plan);
                return plan;
            } else {
                console.log(`[Roadmap] Plan for ${uid} expired or invalid. Generating new one.`);
                return this.generatePlan(uid, subject);
            }
        }

        const newPlan = await this.generatePlan(uid, subject);
        CacheService.setDbCache(cacheKey, newPlan);
        return newPlan;
    }

    /**
     * Helper: Calculate the next Monday at 00:00 Hong Kong Time (UTC+8)
     */
    getNextMondayHK() {
        // Get current time in UTC
        const now = moment.utc();
        // Convert to HK time (UTC+8)
        const hkNow = now.clone().add(8, 'hours');

        // Find next Monday
        const nextMonday = hkNow.clone().startOf('isoWeek').add(1, 'week').startOf('day');

        // Convert back to UTC for Firestore persistence
        return nextMonday.subtract(8, 'hours').toDate();
    }

    /**
     * GENERATE: The "Smart Director" Engine
     * 1. Fetches User Profile & Weaknesses
     * 2. Uses AI to curate 4 Practice Targets + 1 Master Quest
     * 3. Saves to DB
     */
    async generatePlan(uid, subject = 'english') {
        console.log(`[Roadmap] Generating new Weekly Quest for ${uid} [${subject}]...`);

        // 1. Fetch Context (Diagnostic Result determines the Plan)
        const diag = await UserProfileService.getDiagnosticResult(uid, subject);
        const userProfile = await UserProfileService.getProfile(uid);

        let generatedTasks = [];
        const startLevel = Number(diag?.overall_level || userProfile?.level || 1);

        // 2. Personalization Logic
        const planItems = diag?.one_month_plan || diag?.weekly_quest_plan || [];
        if (planItems.length > 0) {
            console.log(`[Roadmap] Found personalized plan for ${uid}. Mapping top items...`);

            // Generate 5 Tailored Tasks from the plan
            // Filter out speaking tasks if we are injecting the Special Quest to avoid duplicates
            const filteredItems = subject === 'english'
                ? planItems.filter(item => {
                    const title = (typeof item === 'object' && item !== null) ? item.title : item;
                    // Filter out speaking/discussion/individual response tasks
                    return !/speaking|discussion|individual response/i.test(title);
                })
                : planItems;

            generatedTasks = filteredItems.slice(0, 5).map((planItem, idx) => {
                const isObject = typeof planItem === 'object' && planItem !== null;
                const title = isObject ? planItem.title : planItem;
                const topic = isObject ? planItem.topic : planItem;

                // Tiered XP Logic for Roadmap
                const skillLevel = (subject === 'maths' ? diag?.microSkills?.[topic]?.level : diag?.microSkills?.[topic]?.level) || startLevel || 1;
                const GamificationService = require('./GamificationService');

                let tier = 1;
                if (skillLevel >= 6.0) tier = 4;
                else if (skillLevel >= 4.5) tier = 3;
                else if (skillLevel >= 2.5) tier = 2;

                const taskXp = GamificationService.getTieredXP(tier);

                return {
                    id: `week_${moment().format('WW')}_task_${idx}`,
                    title: title, // e.g., "Master Indefinite Articles"
                    topic: topic, // Used to seed the Chat/Lab context
                    type: 'PRACTICE', // Force all to PRACTICE
                    category: 'PERSONALIZED', // AI-generated personalized quest
                    xp: taskXp, // Standardized tiered XP
                    status: 'PENDING'
                };
            });
        } else {
            // Fallback: If no diagnostic, the ONLY task is to take it.
            console.log(`[Roadmap] No diagnostic found for ${uid}. Defaulting to Onboarding.`);
            generatedTasks.push({
                id: 'onboarding_step_1',
                title: 'Complete Diagnostic Check (Initial)',
                topic: 'Diagnostic Test',
                type: 'DIAGNOSTIC', // Frontend should route this to /diagnostic
                xp: 200,
                status: 'PENDING'
            });
        }

        // --- INJECT ERASER CHALLENGE ---
        if (subject === 'english') {
            generatedTasks.unshift({
                id: `eraser_challenge_${moment().format('YYYY_MM_DD')}`,
                title: 'Eraser Challenge: Remove the Weakness',
                topic: 'Eraser Challenge: General Academic',
                type: 'CHALLENGE',
                category: 'SPECIAL', // Special weekly challenge
                xp: 150,
                status: 'PENDING'
            });
        }

        // --- INJECT SPEAKING INTERACTION ---
        if (subject === 'english') {
            generatedTasks.unshift({
                id: `speaking_interaction_${moment().format('YYYY_MM_DD')}`,
                title: 'Speaking Interaction: Group Discussion',
                topic: 'Speaking: Academic Discussion',
                type: 'SPEAKING_CHALLENGE',
                category: 'SPECIAL', // Special weekly challenge
                xp: 200,
                status: 'PENDING'
            });
        }

        // 3. Construct the Week Object
        const newPlan = {
            weekId: moment().format('YYYY_WW'),
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            expiresAt: admin.firestore.Timestamp.fromDate(this.getNextMondayHK()),
            level_at_start: startLevel,
            tasks: [
                ...generatedTasks,
                {
                    id: 'boss',
                    title: `Weekly Master Quest (Lvl ${startLevel})`,
                    type: 'MOCK',
                    xp: 500,
                    locked: true,
                    status: 'LOCKED'
                }
            ]
        };

        // 4. Save to DB
        const docId = subject === 'maths' ? 'current_maths' : 'current';
        await this.db.collection('users').doc(uid).collection('roadmap').doc(docId).set(newPlan);
        return newPlan;
    }

    /**
     * UPDATE: Mark Task Complete & Check Boss Unlock
     */
    async completeTask(uid, taskId, subject = 'english') {
        CacheService.invalidateUserDbCache(uid);
        
        const docId = subject === 'maths' ? 'current_maths' : 'current';
        const docRef = this.db.collection('users').doc(uid).collection('roadmap').doc(docId);
        const doc = await docRef.get();
        if (!doc.exists) return { success: false };

        const plan = doc.data();
        let updated = false;
        let tasksCompletedCount = 0;

        // Update specific task
        const newTasks = plan.tasks.map(t => {
            if (t.id === taskId && t.status !== 'COMPLETED') {
                updated = true;
                return { ...t, status: 'COMPLETED' };
            }
            if (t.status === 'COMPLETED') tasksCompletedCount++;
            return t;
        });

        // If we just updated one, increment count for logic check
        if (updated) tasksCompletedCount++;

        // Unlock Boss Logic (Require 4 tasks)
        const bossTaskIndex = newTasks.findIndex(t => t.id === 'boss');
        if (bossTaskIndex !== -1 && tasksCompletedCount >= 4) {
            if (newTasks[bossTaskIndex].locked) {
                newTasks[bossTaskIndex].locked = false;
                newTasks[bossTaskIndex].status = 'PENDING'; // Ready to start
                console.log(`[Roadmap] Boss Unlocked for ${uid}!`);
            }
        }

        if (updated) {
            await docRef.update({ tasks: newTasks });
        }

        return {
            success: true,
            tasks: newTasks,
            bossUnlocked: tasksCompletedCount >= 4,
            xpAwarded: updated ? (plan.tasks.find(t => t.id === taskId)?.xp || 0) : 0
        };
    }

    /**
     * UNIFIED HELPER: Auto-complete Quests based on Context (Lab/Mock)
     * Matches user activity (Lab topic, Mock Exam type) to pending quests.
     * @param {string} uid User ID
     * @param {string} contextQuery The topic or exam name (e.g. "Past Tense", "Reading Mock")
     * @param {boolean} isMockEvent Whether this is a Mock Exam (triggers Boss completion)
     */
    async completeQuestByContext(uid, contextQuery, isMockEvent = false, subject = 'english') {
        if (!uid) return { success: false };

        CacheService.invalidateUserDbCache(uid);

        const docId = subject === 'maths' ? 'current_maths' : 'current';
        const docRef = this.db.collection('users').doc(uid).collection('roadmap').doc(docId);
        const doc = await docRef.get();
        if (!doc.exists) return { success: false };

        const plan = doc.data();
        let updated = false;
        let completedTitles = [];

        const query = (contextQuery || "").toLowerCase().trim();

        // 1. Mark matching regular quests as COMPLETED
        const newTasks = plan.tasks.map(t => {
            if (t.status === 'COMPLETED') return t;

            const tTitle = t.title.toLowerCase();
            const tTopic = (t.topic || "").toLowerCase();

            // Fuzzy match: Query matches Title OR Topic
            // Example: Quest "Master Tenses" matches Lab "Tenses"
            const matches = tTitle.includes(query) || query.includes(tTitle) ||
                (tTopic && (tTopic.includes(query) || query.includes(tTopic)));

            if (matches) {
                updated = true;
                completedTitles.push(t.title);
                return { ...t, status: 'COMPLETED' };
            }
            return t;
        });

        // 2. Unlock Boss if 4+ tasks done
        const completedCount = newTasks.filter(t => t.status === 'COMPLETED').length;
        const bossIndex = newTasks.findIndex(t => t.id === 'boss');

        if (bossIndex !== -1) {
            const boss = newTasks[bossIndex];

            // Unlock Check
            if (boss.locked && completedCount >= 4) {
                boss.locked = false;
                boss.status = 'PENDING';
                updated = true;
                console.log(`[Roadmap] Boss Unlocked for ${uid}`);
            }

            // 3. Complete Boss if this is a MOCK Event and Boss is ready
            // (Mock Exams count as the Boss Battle)
            if (isMockEvent && boss.status === 'PENDING') {
                boss.status = 'COMPLETED';
                updated = true;
                completedTitles.push(boss.title);
            }
        }

        if (updated) {
            await docRef.update({ tasks: newTasks });
        }

        return { success: updated, completedQuests: completedTitles, xpAwarded: newTasks.filter(t => completedTitles.includes(t.title)).reduce((sum, t) => sum + (t.xp || 0), 0) };
    }
}

module.exports = new RoadmapService();
