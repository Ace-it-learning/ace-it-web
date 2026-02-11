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
        name: 'AS & GS Sequences',
        category: 'Number & Algebra',
        description: 'Arithmetic/Geometric sequences, summation.',
        paper: 'Paper 1'
    },
    'math_alg_inequalities': {
        id: 'math_alg_inequalities',
        name: 'Linear & Quadratic Inequalities',
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
        name: 'Properties of Circle',
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
    }
};

const getMathSkill = (id) => MATHS_MICRO_SKILLS[id];

module.exports = {
    MATHS_MICRO_SKILLS,
    getMathSkill
};
