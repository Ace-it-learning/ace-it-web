/** Max XP for a perfect Grammar Lab run at each HKDSE band. */
export const GRAMMAR_MAX_XP_BY_LEVEL = {
    '3': 100,
    '4': 150,
    '5': 200,
    '6': 250,
    '7': 350,
};

export const getGrammarMaxXp = (level) =>
    GRAMMAR_MAX_XP_BY_LEVEL[String(level)] ?? GRAMMAR_MAX_XP_BY_LEVEL['5'];

/**
 * Pre-generated JSON exists for levels 3, 4, 5, 7.
 * UI level 6 (5*) maps to the nearest bank: elite → level_5 (5*), accuracy → level_7.
 */
export const resolveGrammarContentLevel = (topicId, level) => {
    const lvl = String(level);
    if (lvl !== '6') return lvl;
    return topicId?.includes('_elite_') ? '5' : '7';
};

export const getGrammarLevelOptionLabel = (value, lang = 'en') => {
    const labels = {
        en: { '3': 'Level 3', '4': 'Level 4', '5': 'Level 5', '6': 'Level 5*', '7': 'Level 5**' },
        zh: { '3': 'Level 3', '4': 'Level 4', '5': 'Level 5', '6': 'Level 5*', '7': 'Level 5**' },
    };
    return (labels[lang] || labels.en)[value] || `Level ${value}`;
};

/** Short progress-chip label for Grammar Lab practice phases. */
export const getGrammarPhaseLabel = (subStep, topic) => {
    if (subStep === 'LEARN') return 'Rule';
    if (subStep === 'DRILL') return 'Drill';
    if (subStep === 'BOSS_FIGHT') return 'Final';
    if (subStep !== 'IDENTIFY') return 'Identify';

    if (topic?.includes('tense')) return 'Context';
    if (topic?.includes('countable')) return 'Noun type';
    if (topic?.includes('wordform')) return 'Word form';
    if (topic?.includes('pronoun')) return 'Pronoun';
    if (topic?.includes('inversion')) return 'Trigger';
    if (topic?.includes('subjunctive')) return 'Subjunctive';
    if (topic?.includes('participle')) return 'Participle';
    if (topic?.includes('cohesion')) return 'Cohesion';
    if (topic?.includes('nominal')) return 'Clause';
    if (topic?.includes('relative')) return 'Relative';
    if (topic?.includes('modals')) return 'Modal';
    if (topic?.includes('passive')) return 'Passive';
    return 'Identify';
};

/** Key briefing bullets from rule cards when key_points is empty in JSON. */
export const grammarRuleKeyPoints = (ruleCards = []) =>
    ruleCards.map((r) => r.name).filter(Boolean);
