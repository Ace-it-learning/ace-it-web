const admin = require('firebase-admin');
const moment = require('moment'); // You might need to install moment or use native Date
const GenerativeAIService = require('./GenerativeAIService');
const UserProfileService = require('./UserProfileService');

class RoadmapService {
    constructor() {
        this.db = admin.firestore();
    }

    /**
     * MAIN ENTRY: Get or Generate Current Plan
     */
    async getCurrentPlan(uid) {
        if (!uid) return null;

        const roadmapRef = this.db.collection('users').doc(uid).collection('roadmap').doc('current');
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
                return plan;
            } else {
                console.log(`[Roadmap] Plan for ${uid} expired or invalid. Generating new one.`);
                return this.generatePlan(uid);
            }
        }

        return this.generatePlan(uid);
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
    async generatePlan(uid) {
        console.log(`[Roadmap] Generating new Weekly Quest for ${uid}...`);

        // 1. Fetch Context (Diagnostic Result determines the Plan)
        const diag = await UserProfileService.getDiagnosticResult(uid, 'english');
        const userProfile = await UserProfileService.getProfile(uid);

        let generatedTasks = [];
        const startLevel = Number(diag?.overall_level || userProfile?.level || 1);

        // 2. Personalization Logic
        const planItems = diag?.one_month_plan || diag?.weekly_quest_plan || [];
        if (planItems.length > 0) {
            console.log(`[Roadmap] Found personalized plan for ${uid}. Mapping top items...`);

            // Generate 5 Tailored Tasks from the plan
            generatedTasks = planItems.slice(0, 5).map((planItem, idx) => {
                return {
                    id: `week_${moment().format('WW')}_task_${idx}`,
                    title: planItem, // e.g., "Master Indefinite Articles"
                    topic: planItem, // Used to seed the Chat/Lab context
                    type: 'PRACTICE', // Force all to PRACTICE
                    xp: 100, // Tailored tasks earn 100 XP
                    status: 'PENDING'
                };
            });
        } else {
            // Fallback: If no diagnostic, the ONLY task is to take it.
            console.log(`[Roadmap] No diagnostic found for ${uid}. Defaulting to Onboarding.`);
            generatedTasks.push({
                id: 'onboarding_step_1',
                title: 'Complete Study Calibration',
                topic: 'Diagnostic Test',
                type: 'DIAGNOSTIC', // Frontend should route this to /diagnostic
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
        await this.db.collection('users').doc(uid).collection('roadmap').doc('current').set(newPlan);
        return newPlan;
    }

    /**
     * UPDATE: Mark Task Complete & Check Boss Unlock
     */
    async completeTask(uid, taskId) {
        const roadmapRef = this.db.collection('users').doc(uid).collection('roadmap').doc('current');
        const doc = await roadmapRef.get();
        if (!doc.exists) return null;

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
            await roadmapRef.update({ tasks: newTasks });
        }

        return { success: true, tasks: newTasks, bossUnlocked: tasksCompletedCount >= 4 };
    }

    /**
     * UNIFIED HELPER: Auto-complete Quests based on Context (Lab/Mock)
     * Matches user activity (Lab topic, Mock Exam type) to pending quests.
     * @param {string} uid User ID
     * @param {string} contextQuery The topic or exam name (e.g. "Past Tense", "Reading Mock")
     * @param {boolean} isMockEvent Whether this is a Mock Exam (triggers Boss completion)
     */
    async completeQuestByContext(uid, contextQuery, isMockEvent = false) {
        if (!uid) return { success: false };

        const docRef = this.db.collection('users').doc(uid).collection('roadmap').doc('current');
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

        return { success: updated, completedQuests: completedTitles };
    }
}

module.exports = new RoadmapService();
