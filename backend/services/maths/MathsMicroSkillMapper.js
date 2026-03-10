/**
 * MathsMicroSkillMapper.js
 * Maps natural language skill names (returned by AI) to internal System IDs.
 */

const SKILL_KEYWORDS = {
    // NUMBER & ALGEBRA
    'percent': 'math_num_percentages',
    'interest': 'math_num_percentages',
    'tax': 'math_num_percentages',
    'growth': 'math_num_percentages',
    'decay': 'math_num_percentages',


    'ratio': 'math_num_ratio',
    'proportion': 'math_num_ratio',
    'rate': 'math_num_ratio',

    'inequal': 'math_num_inequalities', // inequality, inequalities
    'absolute value': 'math_num_inequalities',

    'formula': 'math_alg_formulas',
    'substitut': 'math_alg_formulas',
    'change of subject': 'math_alg_formulas',
    'equation': 'math_alg_formulas',
    'identity': 'math_alg_formulas',

    'polynomial': 'math_alg_polynomials',
    'factor': 'math_alg_polynomials', // factor theorem
    'remainder': 'math_alg_polynomials',
    'division': 'math_alg_polynomials',

    'quadratic': 'math_alg_quadratics',
    'root': 'math_alg_quadratics', // roots of equation
    'discriminant': 'math_alg_quadratics',

    'function': 'math_alg_functions',
    'graph': 'math_alg_functions',
    'transformation': 'math_alg_functions',

    'variation': 'math_alg_variations', // direct variation etc.

    'arithmetic': 'math_alg_apgp', // AP
    'geometric': 'math_alg_apgp', // GP
    'sequence': 'math_alg_apgp',
    'series': 'math_alg_apgp',

    'log': 'math_alg_log_exp',
    'exp': 'math_alg_log_exp', // exponent
    'power': 'math_alg_log_exp',
    'indices': 'math_alg_log_exp',
    'index': 'math_alg_log_exp',

    'complex': 'math_alg_complex_numbers',
    'imaginary': 'math_alg_complex_numbers',

    // MEASURES, SHAPE & SPACE
    'rectilinear': 'math_geo_rectilinear',
    'triangle': 'math_geo_rectilinear', // general triangle properties
    'polygon': 'math_geo_rectilinear',
    'similar': 'math_geo_rectilinear',
    'congruen': 'math_geo_rectilinear', // congruence
    'geometry': 'math_geo_rectilinear',

    'circle': 'math_geo_circles', // geometry of circles
    'tangent': 'math_geo_circles',
    'chord': 'math_geo_circles',
    'angle': 'math_geo_circles', // angles in circle
    'cyclic': 'math_geo_circles',

    'coordinate': 'math_geo_coord',
    'slope': 'math_geo_coord',
    'equation of circle': 'math_geo_coord',
    'locus': 'math_geo_coord',

    'trig': 'math_trig_ratios', // trig keyword
    'sine': 'math_trig_ratios',
    'cosine': 'math_trig_ratios',
    'tangent ratio': 'math_trig_ratios',

    'area of triangle': 'math_trig_applications',
    'sine rule': 'math_trig_applications',
    'cosine rule': 'math_trig_applications',
    'bearing': 'math_trig_applications',
    '3d': 'math_trig_applications', // 3D trig often falls here or mensuration
    'elevation': 'math_trig_applications',

    'mensuration': 'math_mensuration',
    'volume': 'math_mensuration',
    'surface': 'math_mensuration', // surface area
    'sphere': 'math_mensuration',
    'cone': 'math_mensuration',
    'prism': 'math_mensuration',
    'cylinder': 'math_mensuration',

    // DATA HANDLING
    'statistic': 'math_stat_measures',
    'mean': 'math_stat_measures',
    'mode': 'math_stat_measures',
    'median': 'math_stat_measures',
    'deviation': 'math_stat_measures', // standard deviation
    'inter-quartile': 'math_stat_measures', // IQR
    'frequency': 'math_stat_measures',
    'table': 'math_stat_measures',

    'chart': 'math_stat_charts',
    'diagram': 'math_stat_charts',
    'box': 'math_stat_charts', // box and whisker
    'stem': 'math_stat_charts',
    'histogram': 'math_stat_charts',

    'probab': 'math_prob_basic', // probability
    'expect': 'math_prob_basic', // expected value
    'chance': 'math_prob_basic',

    'permutation': 'math_prob_advanced',
    'combination': 'math_prob_advanced',
    'conditional': 'math_prob_advanced',
    'handling': 'math_stat_measures'
};

/**
 * Maps a natural language skill string to a System ID.
 * @param {string} text 
 * @returns {string|null} System ID or null if no match found
 */
const mapSkillToId = (text) => {
    if (!text) return null;
    const lower = text.toLowerCase().trim();

    // 1. Direct match check (if AI output implies ID)
    if (lower.startsWith('math_')) return lower;

    // 2. Keyword Search
    // Sort keywords by length desc to match specific phrases first (e.g. "sine rule" before "sine")
    // Although our object is flat, Object.keys order isn't guaranteed.
    // Iterating carefully.

    // We can pre-sort keys once or just iterate. Perf is negligible for ~50 keys.
    const keys = Object.keys(SKILL_KEYWORDS);

    // Check for best match (could be partial)
    for (const key of keys) {
        if (lower.includes(key)) {
            return SKILL_KEYWORDS[key];
        }
    }

    return null;
};

module.exports = { mapSkillToId };
