/**
 * HKDSE Mathematics (Compulsory Part) Micro-Skills Framework
 * Mapped to "Project Ace" Granular Tracking System
 */

const MATHS_MICRO_SKILLS = {
    // === STRAND A: NUMBER & ALGEBRA ===
    'math_num_percentages': {
        id: 'math_num_percentages',
        name: 'Percentages & Interest',
        category: 'Number & Algebra',
        description: 'Simple/Compound interest, growth/decay, profit/loss.',
        paper: 'Paper 1/2'
    },
    'math_num_num_systems': {
        id: 'math_num_num_systems',
        name: 'Number Systems',
        category: 'Number & Algebra',
        description: 'Binary/Hexadecimal, complex numbers basics.',
        paper: 'Paper 2'
    },
    'math_alg_formulas': {
        id: 'math_alg_formulas',
        name: 'Formulas & Substitution',
        category: 'Number & Algebra',
        description: 'Change of subject, algebraic substitution.',
        paper: 'Paper 1'
    },
    'math_alg_quadratics': {
        id: 'math_alg_quadratics',
        name: 'Quadratic Equations',
        category: 'Number & Algebra',
        description: 'Factorization, formula, discriminant, vertex form.',
        paper: 'Paper 1'
    },
    'math_alg_functions': {
        id: 'math_alg_functions',
        name: 'Functions & Graphs',
        category: 'Number & Algebra',
        description: 'Domain/Range, transformations (f(x)+k), properties.',
        paper: 'Paper 1/2'
    },
    'math_alg_polynomials': {
        id: 'math_alg_polynomials',
        name: 'Polynomials',
        category: 'Number & Algebra',
        description: 'Remainder/Factor theorem, division of polynomials.',
        paper: 'Paper 1'
    },
    'math_alg_indices_log': {
        id: 'math_alg_indices_log',
        name: 'Indices & Logarithms',
        category: 'Number & Algebra',
        description: 'Laws of indices, log properties, solving exponential eq.',
        paper: 'Paper 1/2'
    },
    'math_alg_variations': {
        id: 'math_alg_variations',
        name: 'Variations',
        category: 'Number & Algebra',
        description: 'Direct, inverse, joint, and partial variations.',
        paper: 'Paper 1'
    },
    'math_alg_sequences': {
        id: 'math_alg_sequences',
        name: 'AP & GP',
        category: 'Number & Algebra',
        description: 'Arithmetic/Geometric sequences, summation.',
        paper: 'Paper 1'
    },
    'math_num_inequalities': {
        id: 'math_num_inequalities',
        name: 'Inequalities',
        category: 'Number & Algebra',
        description: 'Solving inequalities, graphical representation.',
        paper: 'Paper 1/2'
    },

    // === STRAND B: MEASURES, SHAPE & SPACE ===
    'math_geo_coord': {
        id: 'math_geo_coord',
        name: 'Coordinate Geometry',
        category: 'Geometry',
        description: 'Distance, slope, mid-point, equation of lines.',
        paper: 'Paper 1/2'
    },
    'math_geo_circle_eq': {
        id: 'math_geo_circle_eq',
        name: 'Equation of Circle',
        category: 'Geometry',
        description: 'Center, radius, general form, intersections.',
        paper: 'Paper 1/2'
    },
    'math_geo_properties_circle': {
        id: 'math_geo_properties_circle',
        name: 'Circle Properties',
        category: 'Geometry',
        description: 'Chords, arcs, tangents, cyclic quads.',
        paper: 'Paper 1/2'
    },
    'math_geo_properties_rect': {
        id: 'math_geo_properties_rect',
        name: 'Rectilinear Figures',
        category: 'Geometry',
        description: 'Triangles, polygons, similarity, congruence.',
        paper: 'Paper 1'
    },
    'math_geo_mensuration': {
        id: 'math_geo_mensuration',
        name: 'Mensuration',
        category: 'Geometry',
        description: 'Area, volume, surface area of 3D solids (cones, spheres).',
        paper: 'Paper 1'
    },
    'math_trig_ratios': {
        id: 'math_trig_ratios',
        name: 'Trigonometry Ratios',
        category: 'Geometry',
        description: 'Sine/Cosine rule, area of triangle, 2D problems.',
        paper: 'Paper 1'
    },
    'math_trig_3d': {
        id: 'math_trig_3d',
        name: '3D Trigonometry',
        category: 'Geometry',
        description: 'Angle between lines/planes, 3D visualization.',
        paper: 'Paper 1'
    },
    'math_trig_graphs': {
        id: 'math_trig_graphs',
        name: 'Trig Functions & Graphs',
        category: 'Geometry',
        description: 'Graphs of sin/cos/tan, solving trig equations.',
        paper: 'Paper 2'
    },

    // === STRAND C: DATA HANDLING ===
    'math_stat_measures': {
        id: 'math_stat_measures',
        name: 'Measures of Dispersion',
        category: 'Data Handling',
        description: 'Mean, median, mode, SD, range, box-and-whisker.',
        paper: 'Paper 1'
    },
    'math_stat_probability': {
        id: 'math_stat_probability',
        name: 'Probability Basics',
        category: 'Data Handling',
        description: 'Laws of probability, expected value.',
        paper: 'Paper 1/2'
    },
    'math_stat_counting': {
        id: 'math_stat_counting',
        name: 'Permutations & Combinations',
        category: 'Data Handling',
        description: 'nCr, nPr, arrangement problems.',
        paper: 'Paper 1/2'
    },
    'math_trig_applications': {
        id: 'math_trig_applications',
        name: 'Trig Applications',
        category: 'Geometry',
        description: 'Sine/Cosine rule, Area of triangle, 2D/3D problems.',
        paper: 'Paper 1'
    },
    'math_num_ratio': {
        id: 'math_num_ratio',
        name: 'Ratio & Proportion',
        category: 'Number & Algebra',
        description: 'Ratio, proportion, and simple rates.',
        paper: 'Paper 1'
    },
    'math_num_inequalities': {
        id: 'math_num_inequalities',
        name: 'Inequalities',
        category: 'Number & Algebra',
        description: 'Linear inequalities, systems of inequalities.',
        paper: 'Paper 1/2'
    },
    'math_alg_log_exp': {
        id: 'math_alg_log_exp',
        name: 'Log & Exp Functions',
        category: 'Number & Algebra',
        description: 'Properties of logarithms and exponents.',
        paper: 'Paper 1/2'
    },
    'math_alg_complex_numbers': {
        id: 'math_alg_complex_numbers',
        name: 'Complex Numbers',
        category: 'Number & Algebra',
        description: 'Basic operations of complex numbers.',
        paper: 'Paper 1'
    },
    'math_prob_advanced': {
        id: 'math_prob_advanced',
        name: 'Advanced Probability',
        category: 'Data Handling',
        description: 'Conditional probability, Combinations & Permutations.',
        paper: 'Paper 1/2'
    },

    // === FRONTEND COMPATIBILITY ALIASES ===
    'math_geo_circles': {
        id: 'math_geo_circles',
        name: 'Circle Properties',
        category: 'Geometry',
        description: 'Angles in circles, chords, tangents (Frontend Alias)',
        paper: 'Paper 1/2'
    },
    'math_geo_rectilinear': {
        id: 'math_geo_rectilinear',
        name: 'Rectilinear Figures',
        category: 'Geometry',
        description: 'Triangles, polygons, similarity (Frontend Alias)',
        paper: 'Paper 1'
    },
    'math_mensuration': {
        id: 'math_mensuration',
        name: 'Mensuration',
        category: 'Geometry',
        description: 'Volume and Surface Area (Frontend Alias)',
        paper: 'Paper 1'
    },
    'math_alg_apgp': {
        id: 'math_alg_apgp',
        name: 'AP & GP',
        category: 'Number & Algebra',
        description: 'Arithmetic and Geometric sequences (Frontend Alias)',
        paper: 'Paper 1'
    },
    'math_stat_charts': {
        id: 'math_stat_charts',
        name: 'Statistical Charts',
        category: 'Data Handling',
        description: 'Box-and-whisker, Stem-and-leaf (Frontend Alias)',
        paper: 'Paper 1'
    },
    'math_prob_basic': {
        id: 'math_prob_basic',
        name: 'Basic Probability',
        category: 'Data Handling',
        description: 'Classic probability (Frontend Alias)',
        paper: 'Paper 1/2'
    },

    // === INTEGRATED TOPICS (Section B Style) ===
    'math_int_algebra': {
        id: 'math_int_algebra',
        name: 'Integrated: Algebra & Sequences',
        category: 'Integrated',
        description: 'Combining AP/GP with Logarithms and Polynomials (DSE Section B).',
        paper: 'Paper 1'
    },
    'math_int_geometry': {
        id: 'math_int_geometry',
        name: 'Integrated: Circle & Coordinate Geometry',
        category: 'Integrated',
        description: 'Solving circle equations with lines, tangent properties and locus.',
        paper: 'Paper 1'
    },
    'math_int_trig': {
        id: 'math_int_trig',
        name: 'Integrated: 3D Trigonometry & Mensuration',
        category: 'Integrated',
        description: 'Calculating volume/angles in complex 3D solids using multiple trig rules.',
        paper: 'Paper 1'
    },
    'math_int_data': {
        id: 'math_int_data',
        name: 'Integrated: Probability & Statistics',
        category: 'Integrated',
        description: 'Using measures of dispersion to calculate conditional probabilities.',
        paper: 'Paper 1'
    }
};

const getMathSkill = (id) => MATHS_MICRO_SKILLS[id];

module.exports = {
    MATHS_MICRO_SKILLS,
    getMathSkill
};
