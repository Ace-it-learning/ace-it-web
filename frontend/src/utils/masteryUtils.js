/**
 * Shared logic for Mastery-to-Difficulty mapping and XP rewards.
 */

export const MASTERY_TIERS = {
    0: { id: 'mixed', label: 'Mixed (Interleaved)', zh: '混合練習', color: 'bg-indigo-500 text-white border-indigo-600 shadow-lg shadow-indigo-500/20', xp: 125, desc: 'Scientifically proven to improve retention' },
    1: { id: 'easy', label: 'Easy', zh: '基礎', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', xp: 50, desc: 'DSE Level 2-3 · Foundation & Core Concepts' },
    2: { id: 'medium', label: 'Medium', zh: '進階', color: 'bg-amber-100 text-amber-700 border-amber-200', xp: 75, desc: 'DSE Level 4 · Exam Readiness & Application' },
    3: { id: 'dse', label: 'DSE Standard', zh: 'DSE 水平', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', xp: 100, desc: 'DSE Level 5 · Full HKDSE Exam Standard' },
    4: { id: 'elite', label: 'Elite Challenge', zh: '精英挑戰', color: 'bg-rose-100 text-rose-700 border-rose-200 shadow-sm shadow-rose-100', xp: 150, desc: 'DSE Level 5*/5** · Elite Performance' }
};

/**
 * Maps a numeric level (0-7) to a 1-4 difficulty tier.
 * @param {number} level Mastery level
 * @param {boolean} capAtDSE If true, returns max Tier 3 (for General quests)
 */
export const calculateTier = (level = 0, capAtDSE = false) => {
    // Normalize level if it's a DSE string like '5*', '5**'
    let numericLevel = parseFloat(level);
    if (isNaN(numericLevel)) {
        const lvlStr = String(level);
        if (lvlStr === '5**') numericLevel = 7;
        else if (lvlStr === '5*') numericLevel = 6;
        else if (lvlStr === '5') numericLevel = 5;
        else numericLevel = 0;
    }

    let tier = 1;
    if (numericLevel >= 6.5) tier = 4; // Elite (5**/5*)
    else if (numericLevel >= 5.0) tier = 3; // DSE Standard (5)
    else if (numericLevel >= 3.5) tier = 2; // Medium (4)
    else tier = 1; // Easy (2-3)

    if (capAtDSE) return Math.min(tier, 3);
    return tier;
};

/**
 * Returns tier metadata (label, color, xp) for a given tier.
 */
export const getTierMetadata = (tier, isChinese = false) => {
    const meta = MASTERY_TIERS[tier] || MASTERY_TIERS[1];
    return {
        ...meta,
        displayName: isChinese ? meta.zh : meta.label
    };
};

/**
 * Convenience function to get full deck of stats for a mastery level (0-7 scale).
 * Used for English quests and general mastery display.
 */
export const getMasteryStats = (level, isChinese = false, capAtDSE = false) => {
    const tier = calculateTier(level, capAtDSE);
    return getTierMetadata(tier, isChinese);
};

/**
 * Maps a quest difficulty level (1-4) directly to tier metadata.
 * Use this for Maths quest pages — matches factory tiers:
 *   1=Easy (DSE 2-3), 2=Medium (DSE 4), 3=DSE Standard (DSE 5), 4=Elite (DSE 5+)
 * @param {number} difficultyLevel Quest difficulty level (1-4). 0 = Mixed.
 * @param {boolean} isChinese
 */
export const getDifficultyTierDetails = (difficultyLevel, isChinese = false) => {
    const lvl = parseInt(difficultyLevel) || 0;
    const meta = MASTERY_TIERS[lvl] || MASTERY_TIERS[1]; // Default to Easy if unknown
    return {
        ...meta,
        displayName: isChinese ? meta.zh : meta.label
    };
};
