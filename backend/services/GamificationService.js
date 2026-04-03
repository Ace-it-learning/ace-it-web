const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const UserProfileService = require('./UserProfileService');
const moment = require('moment');

// Load Configuration Source of Truth
const GAMIFICATION_CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '../gamification.json'), 'utf8'));

class GamificationService {
    constructor() {
        this.config = GAMIFICATION_CONFIG;
    }

    /**
     * Helper to get the current Week ID (consistent with Admin Factory & Roadmap)
     */
    getCurrentWeekId() {
        return moment().format('YYYY_WW');
    }

    /**
     * Get Weekly Quest Status for a user
     */
    async getWeeklyQuestStatus(uid) {
        if (!uid || uid === 'guest') return { weekId: null, completed: false };
        try {
            const weekId = this.getCurrentWeekId();
            const statsDoc = await this.db.collection('users').doc(uid).collection('stats').doc('main').get();
            if (!statsDoc.exists) return { weekId, completed: false };

            const data = statsDoc.data();
            const completedQuests = data.weekly_quests_completed || [];
            return {
                weekId,
                completed: completedQuests.includes(weekId)
            };
        } catch (e) {
            console.error("[Gamification] getWeeklyQuestStatus Error:", e);
            return { weekId: null, completed: false };
        }
    }

    /**
     * Get standardized XP for an adaptive tier (1-4).
     */
    getTieredXP(tier) {
        return this.config.xp_table.adaptive_practice_tiers?.[tier] || 50;
    }

    get db() {
        return admin.firestore();
    }

    /**
     * Calculate Level based on Total XP.
     * Formula: XP_Required_Next = 100 + (current_level - 1) * 200
     * This implies a cumulative XP curve. 
     * However, the formula given is for "XP Required for Next Level". 
     * We need to invert this or run a loop to find the current level from Total XP.
     * 
     * L1 -> L2: 100 XP (Total 100)
     * L2 -> L3: 300 XP (100 + 200) (Total 400)
     * L3 -> L4: 500 XP (Total 900)
     * ...
     * This is an arithmetic series sum.
     */
    calculateLevelFromXP(totalXP) {
        let level = 1;
        let xpForNext = this.config.leveling_curve.base_xp_gap; // 100
        let cumulativeXP = 0;

        // Safety cap to prevent infinite loops if formula is weird, though math says it scales
        // Using a loop is simplest for this specific "gap" formula.
        // Optimization: Could use quadratic formula if needed, but for <100 levels, loop is fine.
        while (level < this.config.leveling_curve.max_tier) {
            if (totalXP < cumulativeXP + xpForNext) {
                return { level, currentStepXP: totalXP - cumulativeXP, nextLevelXP: xpForNext };
            }
            cumulativeXP += xpForNext;
            level++;
            // Increment gap: 100, 300, 500... (+200 each time)
            xpForNext += this.config.leveling_curve.increment;
        }
        return { level: this.config.leveling_curve.max_tier, currentStepXP: 0, nextLevelXP: 0 };
    }

    /**
     * Core method to award XP.
     * @param {string} uid User ID
     * @param {number} baseAmount XP Amount
     * @param {string} source 'reading', 'writing', 'speaking', 'listening' or 'general'
     * @param {object} actionMetadata Optional metadata for anti-cheat
     */
    async awardXP(uid, baseAmount, source = 'general', actionMetadata = {}, existingTx = null) {
        if (!uid || uid === 'guest') return null;

        const userRef = this.db.collection('users').doc(uid);
        const statsRef = userRef.collection('stats').doc('main');

        const logic = async (t) => {
            const statsDoc = await t.get(statsRef);
            let stats = statsDoc.exists ? statsDoc.data() : { xp: 0, level: 1, daily_xp: 0, last_xp_date: null };

            // 1. Check Daily Cap & Streak
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();

            if (stats.last_xp_date !== today) {
                // Streak Logic
                if (stats.last_xp_date === yesterday) {
                    stats.streakDays = (stats.streakDays || 0) + 1;
                    console.log(`[Gamification] Streak Increment: ${uid} now at ${stats.streakDays} days.`);
                } else {
                    stats.streakDays = 1; // Missing day or first ever
                    console.log(`[Gamification] Streak Reset/Start: ${uid} reset to 1 day.`);
                }

                stats.daily_xp = 0; // Reset for new day
                stats.last_xp_date = today;
            } else if (!stats.streakDays) {
                // Ensure at least 1 if they have activity today
                stats.streakDays = 1;
            }

            if (stats.daily_xp >= this.config.anti_cheating.daily_xp_cap) {
                return { success: false, reason: 'daily_cap_reached', earned: 0 };
            }

            let finalAmount = baseAmount;
            let cheatingDetected = false;
            let cheatReason = null;

            // --- ANTI-CHEAT: Speed Check ---
            if (actionMetadata && actionMetadata.duration && actionMetadata.expectedDuration) {
                const ratio = actionMetadata.duration / actionMetadata.expectedDuration;
                // Threshold: < 20%
                if (ratio < 0.2) {
                    cheatingDetected = true;
                    cheatReason = "suspicious_speed";

                    // Penalty: 10% of XP (0.1 multiplier)
                    finalAmount = Math.floor(finalAmount * this.config.anti_cheating.penalty_multiplier);
                    console.log(`[AntiCheat] Speed detected for ${uid}. Ratio: ${ratio.toFixed(2)}. XP reduced to ${finalAmount}.`);
                }
            }

            // Cap the amount if it exceeds the remaining daily limit
            const remainingDaily = this.config.anti_cheating.daily_xp_cap - stats.daily_xp;
            if (finalAmount > remainingDaily) {
                finalAmount = remainingDaily;
            }

            // 2. Sub-skill Logic
            const skillKey = `xp_${source}`;
            const skillLevelKey = `level_${source}`;
            const currentSkillXP = stats[skillKey] || 0;
            const currentSkillLevel = stats[skillLevelKey] || 1;

            let isSkillLevelUp = false;

            if (['reading', 'writing', 'listening', 'speaking', 'maths'].includes(source) || source.startsWith('maths_')) {
                // Determine new skill level
                const newSkillXP = currentSkillXP + finalAmount;
                const skillLevelData = this.calculateLevelFromXP(newSkillXP);

                if (skillLevelData.level > currentSkillLevel) {
                    isSkillLevelUp = true;
                    // BOOST: 1.5x multiplier to the triggering task XP
                    finalAmount = Math.floor(finalAmount * this.config.multipliers.skill_jump_boost);
                }

                stats[skillKey] = newSkillXP;
                stats[skillLevelKey] = skillLevelData.level;
            }

            // 3. Update XP & Level
            stats.xp = (stats.xp || 0) + finalAmount; // Spendable Balance
            stats.total_xp = (stats.total_xp || stats.xp || 0) + finalAmount; // Lifetime XP
            stats.daily_xp += finalAmount;

            const oldLevel = stats.level || 1;
            const mainLevelData = this.calculateLevelFromXP(stats.total_xp);
            stats.level = mainLevelData.level;

            // 4. Global Level Milestone Check
            // Calculate Average Level across Reading, Writing, Listening, Speaking + Maths (if applicable)
            // For now, sticking to English 4 pillars for "Global Level" as per original design, 
            // or we could add Maths. Let's keep it safe.
            if (['reading', 'writing', 'listening', 'speaking'].includes(source)) {
                const levels = ['reading', 'writing', 'listening', 'speaking'].map(s => stats[`level_${s}`] || 1);
                const avgLevel = levels.reduce((a, b) => a + b, 0) / 4;
                const oldGlobal = stats.global_level || 1;

                if (avgLevel > oldGlobal) {
                    stats.xp += this.config.multipliers.overall_milestone_grant;
                    const bonusLevelData = this.calculateLevelFromXP(stats.xp);
                    stats.level = bonusLevelData.level;
                    stats.global_level = avgLevel;
                }
            }

            t.set(statsRef, stats, { merge: true });

            const title = actionMetadata.title || this.deriveTitleFromSource(source);

            // Timeline Entry
            const result = {
                success: true,
                earned: finalAmount,
                newLevel: stats.level,
                levelUp: stats.level > oldLevel,
                skillLevelUp: isSkillLevelUp,
                newSkillLevel: stats[`level_${source}`],
                timelineEntry: {
                    type: source.includes('practice') || source === 'maths' ? 'milestone' : 'practice',
                    title: title,
                    xp: finalAmount,
                    score: actionMetadata.score || `${Math.floor((finalAmount / (actionMetadata.maxXP || 50)) * 100)}%`,
                    subject: actionMetadata.subject || source,
                    topic: actionMetadata.topic || null
                }
            };

            // Non-blocking history record
            UserProfileService.recordTimelineEvent(uid, result.timelineEntry)
                .catch(e => console.error("History record failed", e));

            return result;
        };

        if (existingTx) {
            return logic(existingTx);
        } else {
            return this.db.runTransaction(logic);
        }
    }

    /**
     * Award Quest Completion Bonus (First Time Only)
     * Wraps RoadmapService.completeTask to ensure idempotency.
     */
    async awardQuestCompletion(uid, taskId, subject = 'english') {
        if (!uid || !taskId) return { success: false };

        try {
            const RoadmapService = require('./RoadmapService'); // Lazy load to avoid circular dep
            const result = await RoadmapService.completeTask(uid, taskId, subject);

            if (result.success && result.xpAwarded > 0) {
                // It was a fresh completion! Award the Quest Bonus.
                const displayName = UserProfileService.getSkillName(taskId, subject);

                await this.awardXP(uid, result.xpAwarded, 'quest_bonus', {
                    title: `Quest Completed: ${displayName}`,
                    subject: subject,
                    topic: displayName
                });

                return { success: true, earned: result.xpAwarded, fresh: true };
            }

            return { success: true, earned: 0, fresh: false }; // Already completed
        } catch (e) {
            console.error("[Gamification] Quest Completion Error:", e);
            return { success: false, error: e.message };
        }
    }

    /**
     * Award Factory Quest Completion Bonus (4+2 Card System)
     */
    async awardFactoryQuestCompletion(uid, questId, subject, baseXP = null) {
        if (!uid || !questId) return { success: false };

        try {
            const statsRef = this.db.collection('users').doc(uid).collection('stats').doc('main');
            const today = new Date().toDateString();

            return await this.db.runTransaction(async (t) => {
                const statsDoc = await t.get(statsRef);
                let statsData = statsDoc.exists ? statsDoc.data() : {};

                let factorySet = statsData.factory_set || { date: today, completed: [] };

                // Handle date rollover
                if (factorySet.date !== today) {
                    factorySet = { date: today, completed: [] };
                }

                if (factorySet.completed.includes(questId)) {
                    return { success: true, earned: 0, bonusAwarded: false, alreadyCompleted: true };
                }

                // Award XP for completion (standardize to tier XP if provided)
                const xpToAward = baseXP || this.config.xp_table.factory_quest.completion || 200;
                const xpResult = await this.awardXP(uid, xpToAward, 'factory_quest', {
                    title: `Quest Completed: ${subject}`,
                    subject: subject
                }, t);

                factorySet.completed.push(questId);
                let bonusAwarded = false;
                let bonusAmount = 0;

                // Check for Set Bonus (All 6 cards done)
                if (factorySet.completed.length === 6) {
                    bonusAmount = this.config.xp_table.factory_quest.set_bonus || 200;
                    await this.awardXP(uid, bonusAmount, 'factory_bonus', {
                        title: `Full Set Bonus! 🏆`,
                        subject: 'bonus'
                    }, t);
                    bonusAwarded = true;
                }

                t.set(statsRef, { factory_set: factorySet }, { merge: true });

                return {
                    success: true,
                    earned: xpResult.earned,
                    bonusAwarded,
                    bonusAmount,
                    totalEarned: xpResult.earned + bonusAmount
                };
            });
        } catch (e) {
            console.error("[Gamification] Factory Quest Error:", e);
            return { success: false, error: e.message };
        }
    }

    /**
     * Award Weekly Quest Completion (Persistent)
     */
    async awardWeeklyQuestCompletion(uid) {
        if (!uid || uid === 'guest') return { success: false };

        const weekId = this.getCurrentWeekId();
        const statsRef = this.db.collection('users').doc(uid).collection('stats').doc('main');

        try {
            return await this.db.runTransaction(async (t) => {
                const statsDoc = await t.get(statsRef);
                const stats = statsDoc.exists ? statsDoc.data() : {};
                const completed = stats.weekly_quests_completed || [];

                if (completed.includes(weekId)) {
                    return { success: true, earned: 0, alreadyCompleted: true };
                }

                // Award 200 XP for completion
                const xpToAward = 200;
                const result = await this.awardXP(uid, xpToAward, 'weekly_quest', {
                    title: `Weekly Quest Completed: ${weekId}`,
                    subject: 'reading'
                }, t);

                completed.push(weekId);
                t.set(statsRef, { weekly_quests_completed: completed }, { merge: true });

                return {
                    success: true,
                    earned: result.earned,
                    weekId
                };
            });
        } catch (e) {
            console.error("[Gamification] Weekly Quest Award Error:", e);
            return { success: false, error: e.message };
        }
    }

    deriveTitleFromSource(source) {
        switch (source) {
            case 'practice_lab': return 'Completed Lab Mission';
            case 'reading': return 'Reading Proficiency Level Up';
            case 'writing': return 'Writing Mastery Increase';
            case 'listening': return 'Listening Skill Improvement';
            case 'speaking': return 'Speaking Fluency Boost';
            case 'maths': return 'Math Milestone';
            default: return 'Earned Activity XP';
        }
    }

    /**
     * Get User Progress for Frontend
     */
    async getProgress(uid) {
        if (!uid || uid === 'guest') return null;

        try {
            // Concurrent retrieval of stats and inventory
            const [doc, inventorySnap] = await Promise.all([
                this.db.collection('users').doc(uid).collection('stats').doc('main').get(),
                this.db.collection('users').doc(uid).collection('inventory')
                    .orderBy('acquiredAt', 'desc')
                    .limit(50) // Enforce the 50 limit correctly
                    .get()
            ]);

            if (!doc.exists) return null;

            const data = doc.data();
            const totalXP = data.total_xp || data.xp || 0;
            const levelData = this.calculateLevelFromXP(totalXP);
            const inventory = inventorySnap.docs.map(d => d.data());

            return {
                ...data,
                nextLevelXP: levelData.nextLevelXP,
                currentStepXP: levelData.currentStepXP, // Progress in current level
                progressPercent: (levelData.currentStepXP / levelData.nextLevelXP) * 100,
                inventory
            };
        } catch (error) {
            console.error(`[GamificationService] Error fetching progress for ${uid}:`, error);
            throw error;
        }
    }

    /**
     * Redeem an Item (Blind Box or Shop Item)
     */
    async redeemItem(uid, itemId, cost, itemMetadata) {
        if (!uid || uid === 'guest') return { success: false, error: "Guest cannot redeem" };

        const userRef = this.db.collection('users').doc(uid);
        const statsRef = userRef.collection('stats').doc('main');
        const inventoryRef = userRef.collection('inventory');

        return this.db.runTransaction(async (t) => {
            const statsDoc = await t.get(statsRef);
            if (!statsDoc.exists) return { success: false, error: "User stats not found" };

            const stats = statsDoc.data();
            const currentXP = stats.xp || 0;

            if (currentXP < cost) {
                return { success: false, error: "Insufficient XP" };
            }

            // Deduct XP
            stats.xp = currentXP - cost;
            t.set(statsRef, stats, { merge: true });

            // Add Item
            const newItemRef = inventoryRef.doc(); // Auto ID
            t.set(newItemRef, {
                itemId: itemId,
                ...itemMetadata,
                acquiredAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, newBalance: stats.xp };
        });
    }
}

module.exports = new GamificationService();
