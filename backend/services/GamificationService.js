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

            // 1. Check Daily Cap
            const today = new Date().toDateString();
            if (stats.last_xp_date !== today) {
                stats.daily_xp = 0; // Reset for new day
                stats.last_xp_date = today;
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

            if (['reading', 'writing', 'listening', 'speaking'].includes(source)) {
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

            // 3. Update Total XP & Level
            stats.xp = (stats.xp || 0) + finalAmount;
            stats.daily_xp += finalAmount;

            const oldLevel = stats.level || 1;
            const mainLevelData = this.calculateLevelFromXP(stats.xp);
            stats.level = mainLevelData.level;

            // 4. Global Level Milestone Check
            if (['reading', 'writing', 'listening', 'speaking'].includes(source)) {
                const levels = ['reading', 'writing', 'listening', 'speaking'].map(s => stats[`level_${s}`] || 1);
                const avgLevel = levels.reduce((a, b) => a + b, 0) / 4;
                const oldGlobal = stats.global_level || 1;

                // Truncate to 1 decimal for comparison/display? 
                // Or check if integer floor increased? Requirement: "every time this global level increases"
                // Assuming significant increase (e.g. 1.0 -> 1.25 is an increase).
                // "Trigger a 2,000 XP grant every time this global level increases."
                // Usually this means crossing a threshold. Let's assume crossing an integer or 0.5 threshold?
                // Or literally every increment. Since sub-skills only go up, global only goes up.
                // Let's grant it if it exceeds the stored global_level.

                if (avgLevel > oldGlobal) {
                    // But wait, if it goes 1.0 -> 1.25, do we grant 2000? 
                    // That implies a LOT of XP. 
                    // Let's check "Global Level ... as average". 
                    // Maybe it means "When the Average Level crosses a new Integer"?
                    // User said: "Trigger a 2,000 XP grant every time this global level increases."
                    // If I have 4 skills. L1, L1, L1, L1. Global = 1.
                    // Reading becomes L2. Global = 1.25. (Increase!) -> Grant 2000.
                    // Writing becomes L2. Global = 1.50. (Increase!) -> Grant 2000.
                    // This seems generous but matches the instruction literal.
                    // Let's stick to "Any increase in the calculated average".

                    stats.xp += this.config.multipliers.overall_milestone_grant;
                    // Recalculate main level again after bonus
                    const bonusLevelData = this.calculateLevelFromXP(stats.xp);
                    stats.level = bonusLevelData.level;
                    stats.global_level = avgLevel;
                }
            }

            t.set(statsRef, stats, { merge: true });

            // 5. Dynamic History Recording
            // We use the UserProfileService directly or just write to collection
            // Calling UserProfileService.recordTimelineEvent after transaction (or inside if we pass db)
            // Inside transaction is safer for ordering, but recordTimelineEvent uses 'add' (auto-id) which is fine.
            // Let's derive title from source/actionMetadata
            const title = actionMetadata.title || this.deriveTitleFromSource(source);

            // Note: We don't await recordTimelineEvent inside runTransaction if it's not part of the transaction
            // But UserProfileService uses simple 'add'. Let's just do it after.

            const result = {
                success: true,
                earned: finalAmount,
                newLevel: stats.level,
                levelUp: stats.level > oldLevel,
                skillLevelUp: isSkillLevelUp,
                newSkillLevel: stats[`level_${source}`],
                timelineEntry: {
                    type: source === 'practice_lab' ? 'milestone' : 'exam',
                    title: title,
                    xp: finalAmount,
                    score: actionMetadata.score || `${Math.floor((finalAmount / (actionMetadata.maxXP || 50)) * 100)}%`
                }
            };

            // Non-blocking history record
            UserProfileService.recordTimelineEvent(uid, result.timelineEntry)
                .catch(e => console.error("History record failed", e));

            return result;
        });
    }

    deriveTitleFromSource(source) {
        switch (source) {
            case 'practice_lab': return 'Completed Lab Mission';
            case 'reading': return 'Reading Proficiency Level Up';
            case 'writing': return 'Writing Mastery Increase';
            case 'listening': return 'Listening Skill Improvement';
            case 'speaking': return 'Speaking Fluency Boost';
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
        const levelData = this.calculateLevelFromXP(data.xp || 0);

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
