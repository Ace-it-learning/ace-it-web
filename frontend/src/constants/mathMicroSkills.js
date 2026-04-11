/**
 * Frontend Micro-Skills Constants for Mathematics (Compulsory Part)
 * Source of truth for skill names and descriptions in both English and Traditional Chinese.
 * Added 'minForm' to guide personalization.
 */

export const MATH_MICRO_SKILLS = {
    // --- NUMBER & ALGEBRA ---
    math_num_percentages: {
        en: { name: 'Percentages & Interest', desc: 'Compound interest, growth/decay, taxation' },
        zh: { name: '百分法與利息', desc: '複利息、增長/衰退、稅收' },
        minForm: 3 // Foundation
    },
    math_num_num_systems: {
        en: { name: 'Number Systems', desc: 'Binary/Hexadecimal conversions' },
        zh: { name: '數制系統', desc: '二進制及十六進制轉換' },
        minForm: 5
    },
    math_alg_formulas: {
        en: { name: 'Formulas & Substitution', desc: 'Change of subject, algebraic substitution' },
        zh: { name: '公式與代入', desc: '主項變換、代數代入' },
        minForm: 2 // Foundation
    },
    math_alg_polynomials: {
        en: { name: 'Polynomials', desc: 'Factor/Remainder theorem, division of polynomials' },
        zh: { name: '多項式', desc: '因式/餘式定理、多項式除法' },
        minForm: 4
    },
    math_alg_quadratics: {
        en: { name: 'Quadratic Equations', desc: 'Solving equations, nature of roots (discriminant)', short: 'Quadratics' },
        zh: { name: '一元二次方程', desc: '解方程、根的性質（判別式）' },
        minForm: 4
    },
    math_alg_functions: {
        en: { name: 'Functions & Graphs', desc: 'Quadratic graphs, transformation of functions' },
        zh: { name: '函數與圖像', desc: '二次圖像、函數變換' },
        minForm: 4
    },
    math_alg_variations: {
        en: { name: 'Variations', desc: 'Direct, inverse, joint, and partial variations' },
        zh: { name: '變分', desc: '正、反、聯、部分變分' },
        minForm: 4
    },
    math_alg_apgp: {
        en: { name: 'AP & GP', desc: 'Arithmetic and Geometric sequences and series' },
        zh: { name: '等差與等比數列', desc: '等差與等比數列及級數' },
        minForm: 5
    },
    math_alg_log_exp: {
        en: { name: 'Log & Exp Functions', desc: 'Properties of logarithms and exponents' },
        zh: { name: '對數與指數', desc: '對數與指數性質' },
        minForm: 4
    },
    math_alg_indices: {
        en: { name: 'Laws of Indices', desc: 'Positive, negative, and fractional indices' },
        zh: { name: '指數定律', desc: '正、負及分數指數' },
        minForm: 2
    },
    math_num_ratio: {
        en: { name: 'Ratio & Proportion', desc: 'Ratio, proportion, and simple rates' },
        zh: { name: '比與比例', desc: '比、比例及率' },
        minForm: 1 // Foundation
    },
    math_num_inequalities: {
        en: { name: 'Inequalities', desc: 'Linear inequalities in one/two unknowns, systems of inequalities' },
        zh: { name: '不等式', desc: '一元/二元一次不等式、不等式組' },
        minForm: 5
    },
    math_alg_complex_numbers: {
        en: { name: 'Complex Numbers', desc: 'Basic operations of complex numbers' },
        zh: { name: '複數', desc: '複數基本運算' },
        minForm: 4
    },

    // --- MEASURES, SHAPE & SPACE ---
    math_geo_rectilinear: {
        en: { name: 'Rectilinear Figures', desc: 'Properties of triangles, polygons, similarity' },
        zh: { name: '直線圖形', desc: '三角形、多邊形性質、相似圖形' },
        minForm: 2 // Foundation
    },
    math_geo_circles: {
        en: { name: 'Circle Properties', desc: 'Angles in circles, chords, tangents' },
        zh: { name: '圓的性質', desc: '圓內角、弦、切線' },
        minForm: 4
    },
    math_geo_coord: {
        en: { name: 'Coordinate Geometry', desc: 'Points, lines, slopes, mid-points' },
        zh: { name: '坐標幾何', desc: '坐標、直線、斜率' },
        minForm: 4
    },
    math_geo_circle_eq: {
        en: { name: 'Equation of Circle', desc: 'Center, radius, general form' },
        zh: { name: '圓方程', desc: '圓心、半徑、一般式' },
        minForm: 4
    },
    math_trig_ratios: {
        en: { name: 'Trig Ratios', desc: 'Sine, Cosine, Tangent, Special Angles' },
        zh: { name: '三角比', desc: '正弦、餘弦、正切、特殊角' },
        minForm: 2 // Foundation
    },
    math_trig_applications: {
        en: { name: 'Trig Applications', desc: 'Sine/Cosine rule, Area of triangle, 2D/3D problems' },
        zh: { name: '三角學應用', desc: '正弦/餘弦公式、三角形面積、立體問題' },
        minForm: 5
    },
    math_geo_trig_func: {
        en: { name: 'Trig Functions & Graphs', desc: 'ASTC rule, Sine/Cosine curves and transformations' },
        zh: { name: '三角函數與圖像', desc: 'ASTC 法則、正弦/餘弦圖形及變換' },
        minForm: 5
    },
    math_mensuration: {
        en: { name: 'Mensuration', desc: 'Volume and Surface Area of 3D solids' },
        zh: { name: '求積法', desc: '立體圖形的體積與表面面積' },
        minForm: 3 // Foundation
    },

    // --- DATA HANDLING ---
    math_stat_prob: {
        en: { name: 'Probability & Statistics (Quest)', desc: 'Consolidated DSE Data Handling' },
        zh: { name: '概率與統計 (任務)', desc: 'DSE 數據處理綜合練習' },
        minForm: 3
    },
    math_stat_probability: {
        en: { name: 'Probability', desc: 'Laws of probability, conditional probability, expectation' },
        zh: { name: '概率', desc: '概率定律、條件概率、期望值' },
        minForm: 3
    },
    math_stat_counting: {
        en: { name: 'Counting & Combinatorics', desc: 'Permutations and Combinations (nPr, nCr)' },
        zh: { name: '排列與組合', desc: '排列與組合 (nPr, nCr)' },
        minForm: 5
    },
    math_stat_measures: {
        en: { name: 'Measures of Dispersion', desc: 'Range, IQR, Standard Deviation, Variance' },
        zh: { name: '離散程度的量度', desc: '全距、四分位數間距、標準差、方差' },
        minForm: 4
    },
    math_stat_charts: {
        en: { name: 'Statistical Charts', desc: 'Box-and-whisker, Stem-and-leaf, Histograms' },
        zh: { name: '統計圖表', desc: '箱形圖、幹葉圖、直方圖' },
        minForm: 1 // Foundation
    },

    // --- MASTERY CHALLENGES ---
    integrated_challenge: {
        en: { name: 'Weekly Quest', desc: 'Top-tier DSE Section B mastery' },
        zh: { name: '每週任務', desc: '乙部頂尖 DSE 綜合試題' },
        minForm: 6
    },

    // --- INTEGRATED (Section B) ---
    math_int_algebra: {
        en: { name: 'Integrated: Algebra & Sequences', desc: 'Section B style: Combined AP/GP, Logs and Functions' },
        zh: { name: '綜合：代數與數列', desc: '乙部題型：結合等差/等比及對數、函數等' },
        minForm: 6
    },
    math_int_geometry: {
        en: { name: 'Integrated: Circles & Coord Geo', desc: 'Section B style: Equations of circles, lines and Locus' },
        zh: { name: '綜合：圓與坐標幾何', desc: '乙部題型：圓方程、直線及軌跡綜合題' },
        minForm: 6
    },
    math_int_trig: {
        en: { name: 'Integrated: 3D Trig & Mensuration', desc: 'Section B style: Angle and volume in 3D solids' },
        zh: { name: '綜合：立體三角與求積', desc: '乙部題型：立體圖形角及體積綜合計算' },
        minForm: 6
    },
    math_int_data: {
        en: { name: 'Integrated: Prob & Stats', desc: 'Section B style: Conditional probability and dispersion' },
        zh: { name: '綜合：概率與統計', desc: '乙部題型：條件概率與離散量度綜合應用' },
        minForm: 6
    }
};

export const getMathSkillName = (id, lang = 'en') => {
    if (MATH_MICRO_SKILLS[id]) return MATH_MICRO_SKILLS[id][lang]?.name || id;
    return id;
};

export const getMathSkillDesc = (id, lang = 'en') => {
    if (MATH_MICRO_SKILLS[id]) return MATH_MICRO_SKILLS[id][lang]?.desc || '';
    return '';
};

export const getMathSkillMinForm = (id) => {
    if (MATH_MICRO_SKILLS[id]) return MATH_MICRO_SKILLS[id].minForm || 1;
    return 1;
};

export const getSkillsByCategory = (category) => {
    const categories = {
        algebra: [
            'math_num_percentages', 'math_num_num_systems', 'math_num_ratio', 'math_num_inequalities',
            'math_alg_formulas', 'math_alg_polynomials', 'math_alg_quadratics', 'math_alg_functions',
            'math_alg_variations', 'math_alg_apgp', 'math_alg_log_exp', 'math_alg_complex_numbers',
            'math_alg_indices'
        ],
        geometry: [
            'math_geo_rectilinear', 'math_geo_circles', 'math_geo_coord', 'math_geo_circle_eq',
            'math_trig_ratios', 'math_trig_applications', 'math_geo_trig_func', 'math_mensuration'
        ],
        data: [
            'math_stat_probability', 'math_stat_counting', 'math_stat_measures', 'math_stat_charts'
        ]
    };
    return categories[category] || [];
};
