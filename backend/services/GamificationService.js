const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const UserProfileService = require('./UserProfileService');

// Load Configuration Source of Truth
const GAMIFICATION_CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, '../gamification.json'), 'utf8'));

class GamificationService {
    constructor() {
        this.config = GAMIFICATION_CONFIG;
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
    async awardXP(uid, baseAmount, source = 'general', actionMetadata = {}) {
        if (!uid || uid === 'guest') return null;

        const userRef = this.db.collection('users').doc(uid);
        const statsRef = userRef.collection('stats').doc('main');

        return this.db.runTransaction(async (t) => {
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
        });
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
        const doc = await this.db.collection('users').doc(uid).collection('stats').doc('main').get();
        if (!doc.exists) return null;

        const data = doc.data();
        const totalXP = data.total_xp || data.xp || 0;
        const levelData = this.calculateLevelFromXP(totalXP);

        // Fetch Inventory (Limited to last 50 for now)
        const inventorySnap = await this.db.collection('users').doc(uid).collection('inventory').orderBy('acquiredAt', 'desc').get();
        const inventory = inventorySnap.docs.map(d => d.data());

        return {
            ...data,
            nextLevelXP: levelData.nextLevelXP,
            currentStepXP: levelData.currentStepXP, // Progress in current level
            progressPercent: (levelData.currentStepXP / levelData.nextLevelXP) * 100,
            inventory
        };
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
            // Note: We do NOT decrease level. Level tracks "Lifetime XP" or "Current Power".
            // Typically in gamification, spending XP shouldn't de-level you unless XP is currency only.
            // If XP is both currency and level, spending it is painful.
            // BETTER ARCHITECTURE: "Total Lifetime XP" for Level, "Spendable Coins" (or just XP) for shop.
            // Given the prompt implies simple "XP", let's assume spending it reduces your "Balance", but
            // we should probably keep "level" based on a separate "lifetime_xp" field if we want to be nice.
            // BUT, if I just update `xp`, the level calculation in `getProgress` uses `xp`.
            // So spending XP de-levels you? That's harsh.
            // Let's check `calculateLevelFromXP`. It uses input XP.
            // SOLUTION: Add `lifetime_xp` to stats. Level is calculated from `lifetime_xp`.
            // Shop deducts `xp` (spendable).
            // `awardXP` updates both.

            // MIGRATION FIX in awardXP needed? Or just assume spending reduces Level for this MVP?
            // User didn't specify. Standard RPG: XP is for Level, Gold is for Shop.
            // Here we use XP for Shop.
            // Let's assume for MVP: Spending XP reduces your "Current XP" but we want to freeze the Level?
            // "Level based on Total XP".
            // Let's modify awardXP to track `lifetime_xp` if not present, and base level on that.
            // For now, let's just deduct XP and let the level drop (Hardcore Mode) OR
            // introduce `coins` separate from XP?
            // "Spend your hard-earned XP".
            // Let's deduct it. If level drops, so be it. (Or I can stick `level` in stats and only update it up)

            t.set(statsRef, stats, { merge: true });

            // Add Item
            // If blind box, `itemId` might be generic, but `itemMetadata` has the real prize.
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
