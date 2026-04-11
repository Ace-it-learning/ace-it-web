/**
 * HKEAA-Aligned DSE Scoring Constants
 * Single source of truth for all DSE scoring logic.
 * Shared across English, Maths, and future Chinese.
 *
 * Thresholds are approximated from HKEAA standards-referenced grading
 * and publicly available JUPAS conversion data.
 */
const DSE_SCORING = {

    // --- LEVEL THRESHOLDS (Accuracy % → DSE Level) ---
    // Applied to ACCUMULATED practice data, not single sessions.
    LEVEL_THRESHOLDS: [
        { minAccuracy: 0.90, level: 7, label: '5**' }, // Top ~1%
        { minAccuracy: 0.85, level: 6, label: '5*' }, // Top ~10%
        { minAccuracy: 0.75, level: 5, label: '5' }, // Top ~30%
        { minAccuracy: 0.65, level: 4, label: '4' }, // ~50th percentile
        { minAccuracy: 0.50, level: 3, label: '3' }, // Pass
        { minAccuracy: 0.35, level: 2, label: '2' }, // Below pass
        { minAccuracy: 0.00, level: 1, label: '1' }, // Minimal
    ],

    // --- MINIMUM PRACTICE GATES ---
    // A student MUST accumulate this many correct answers at or above
    // the level's difficulty before the system will promote them.
    // This prevents "lucky guess" promotions.
    MIN_CORRECT_FOR_LEVEL: {
        1: 0,  // Everyone starts at Level 1 (no gate)
        2: 3,  // 3 correct answers needed
        3: 5,  // 5 correct answers
        4: 7,  // 7 correct answers (Medium)
        5: 10, // 10 correct answers (DSE Standard)
        6: 15, // 15 correct answers (5*)
        7: 20, // 20 correct answers (5**)
    },

    // --- DIAGNOSTIC CAPS ---
    // Even a perfect diagnostic score caps micro-skills at this level.
    // Students must earn higher levels through Lab practice.
    DIAGNOSTIC_MAX_LEVEL: 4,    // Cap at "Medium" (DSE Level 4)
    DIAGNOSTIC_SMOOTHING: true, // Enable Laplacian smoothing

    // --- WEIGHTED PROGRESSION ---
    // When updating the Overall Subject Level from practice sessions:
    EXISTING_WEIGHT: 0.7, // 70% weight to existing level
    NEW_WEIGHT: 0.3,      // 30% weight to new session performance

    // --- DIFFICULTY CAPS ---
    // A student's micro-skill level is restricted by the difficulty of the
    // content they have mastered. Mastering Easy content shouldn't grant Elite levels.
    DIFFICULTY_CAPS: {
        1: 3, // Easy    → Max Level 3
        2: 3,
        3: 5, // Medium  → Max Level 5
        4: 5,
        5: 7, // Elite   → Max Level 7 (5**)
    },

    // --- OVERALL LEVEL CALCULATION ---
    // Minimum number of micro-skills that must be practiced before
    // the overall subject level can exceed Level 3.
    MIN_SKILLS_FOR_ADVANCED_OVERALL: 5,

    // --- SUBJECT-SPECIFIC OVERRIDES ---
    // Rules for skill types that bypass or modify difficulty caps.
    SUBJECT_RULES: {
        english: {
            writing: { useDifficultyCap: false }, // Writing is purely performance-based
            speaking: {
                voice_clarity: { useDifficultyCap: true }, // Passage difficulty matters
                flow: { useDifficultyCap: false }, // Performance-based
                group_discussion: { useDifficultyCap: false }, // Performance-based
            },
        },
        weekly_quest: { useDifficultyCap: true }, // Weekly Quests follow Level + 1
    },

    // --- RENORMALIZED ENGLISH WEIGHTS (Excluding SBA) ---
    // Paper 1 (Reading): 20/85 = 23.5%
    // Paper 2 (Writing): 25/85 = 29.4%
    // Paper 3 (Listening): 30/85 = 35.3%
    // Paper 4 (Speaking): 10/85 = 11.8%
    ENGLISH_PAPER_WEIGHTS: {
        reading: 0.235,
        writing: 0.294,
        listening: 0.353,
        speaking: 0.118
    },

    // --- MATH STRAND WEIGHTS (Compulsory Part) ---
    // Number & Algebra: 45%
    // Geometry & Trigonometry: 30%
    // Data Handling: 25%
    MATH_STRAND_WEIGHTS: {
        algebra: 0.45,
        geometry: 0.30,
        data: 0.25
    }
};

/**
 * Calculates a weighted DSE level based on paper averages.
 * @param {Object} paperLevels - { reading: val, writing: val, listening: val, speaking: val }
 * @returns {number} Weighted average level (1-7)
 */
function calculateWeightedEnglishGrade(paperLevels) {
    const weights = DSE_SCORING.ENGLISH_PAPER_WEIGHTS;
    let total = 0;
    
    // Fallback to Level 1 if paper hasn't been practiced
    const scores = {
        reading: paperLevels.reading || 1,
        writing: paperLevels.writing || 1,
        listening: paperLevels.listening || 1,
        speaking: paperLevels.speaking || 1
    };

    total += (scores.reading * weights.reading);
    total += (scores.writing * weights.writing);
    total += (scores.listening * weights.listening);
    total += (scores.speaking * weights.speaking);

    return Math.round(total);
}

/**
 * Calculates a weighted DSE level based on Math strands.
 * @param {Object} strandLevels - { algebra: val, geometry: val, data: val }
 * @returns {number} Weighted average level (1-7)
 */
function calculateWeightedMathGrade(strandLevels) {
    const weights = DSE_SCORING.MATH_STRAND_WEIGHTS;
    let total = 0;
    
    const scores = {
        algebra: strandLevels.algebra || 1,
        geometry: strandLevels.geometry || 1,
        data: strandLevels.data || 1
    };

    total += (scores.algebra * weights.algebra);
    total += (scores.geometry * weights.geometry);
    total += (scores.data * weights.data);

    return Math.round(total);
}

/**
 * Converts a cumulative accuracy (0–1) to a DSE level (1–7).
 * Uses the ordered LEVEL_THRESHOLDS array.
 * @param {number} accuracy - Value between 0 and 1
 * @returns {number} DSE level 1–7
 */
function accuracyToLevel(accuracy) {
    for (const threshold of DSE_SCORING.LEVEL_THRESHOLDS) {
        if (accuracy >= threshold.minAccuracy) return threshold.level;
    }
    return 1;
}

/**
 * Converts a numeric DSE level to its HKEAA grade label.
 * @param {number} level - Numeric level 1–7
 * @returns {string} e.g. '5**', '5*', '5', '4', etc.
 */
function levelToLabel(level) {
    const entry = DSE_SCORING.LEVEL_THRESHOLDS.find(t => t.level === level);
    return entry ? entry.label : '1';
}

/**
 * Laplacian smoothing to avoid extreme 0%/100% accuracy from few samples.
 * Adds 1 virtual correct and 2 virtual total → stabilises small-sample accuracy.
 * @param {number} correct - Number of correct answers
 * @param {number} total   - Total number of questions answered
 * @returns {number} Smoothed accuracy between 0 and 1
 */
function laplaceSmooth(correct, total) {
    if (total === 0) return 0; // No data → no score
    return (correct + 1) / (total + 2);
}

module.exports = { 
    DSE_SCORING, 
    accuracyToLevel, 
    levelToLabel, 
    laplaceSmooth, 
    calculateWeightedEnglishGrade,
    calculateWeightedMathGrade
};
