/**
 * Specific HKDSE Mathematical generation rules per micro-skill.
 * This object is injected directly into the Gemini prompt to ensure questions
 * match the exact style, common traps, and strict standards of the exam.
 */
const MATHS_TOPIC_SYLLABUS = {
    // --- STRAND A: NUMBER & ALGEBRA ---
    'math_num_percentages': {
        guidance: `
        - Focus on Percentage Change, Profit/Loss, Discounts, Simple/Compound Interest, and Growth/Decay.
        - Level 3 (Easy): Direct calculation. Single-step formula application. Straightforward arithmetic with all variables provided. No trick wording. (e.g., finding absolute discount amount given marked price and discount %).
        - Level 4 (Medium): 2-3 logical steps, reverse calculations combining multiple concepts. Student must set up their own algebraic equation. (e.g., marking up cost by 25%, selling at 20% discount for HK$800, find percentage profit/loss).
        - Level 5 (Standard): Multi-step reasoning matching late Section A(2) or Section B difficulty. Involves logarithms for financial math (finding 'n' years), compound interest with varying periods, or analyzing changing rates.
        - Level 7 (Elite): Extremely difficult, hybrid topic crossovers (e.g., intersecting Percentages with Arithmetic/Geometric Sequences or Quadratics for optimization). Abstract deduction with no raw numbers given initially.
        - TRAPS TO AVOID: Do not use ridiculously large interest rates (e.g., 50% p.a.). Stick to realistic HK bank rates (2% to 12%). Use HKD for all currency.
        `
    },
    'math_num_ratio': {
        guidance: `
        - Focus on combining ratios (LCM method), algebraic ratios (x/y = a/b), direct/inverse proportion, map scales, and similar figures (lengths, areas, volumes).
        - Level 3: Simple manipulation of ratios, solving direct/inverse variation without constants, or finding basic map distances.
        - Level 4: Combining 3 variables (a:b and b:c). Calculating partial variation equations y = k1x + k2. Word problems with map scales transferring length to area, requiring squaring the scale.
        - Level 5: Complex ratios involving quadratics or simultaneous equations. Frustum/Similar solids problems involving area and volume ratio transitions (l1:l2, A1:A2, V1:V2).
        - MANDATORY REQUIREMENT: Provide a "diagram_json" for Similar Figures and graphs showing proportionality if applicable.
        `
    },
    'math_alg_formulas': {
        guidance: `
        - Focus on Change of Subject, Algebraic Substitution, and constructing/interpreting formulas.
        - Level 3 (Easy): Direct substitution of values into a given formula. Change of subject involving one step (e.g., make 'r' the subject of A = πr²).
        - Level 4 (Medium): Change of subject requiring 2-3 algebraic steps, including square roots or fractions. Substitution into formulas with multiple variables.
        - Level 5 (Standard): Complex change of subject involving nested fractions or combined operations. Constructing a formula from a word problem scenario.
        - Level 7 (Elite): Multi-variable formulas requiring simultaneous substitution. Abstract formula manipulation with no numeric values.
        - STRICT SCOPE: Only HKDSE Compulsory Part content. No calculus or advanced algebra beyond the syllabus.
        `
    },
    'math_alg_quadratics': {
        guidance: `
        - Focus on Factorization, Quadratic Formula, Discriminant (Δ > 0, = 0, < 0), and Vertex/Completing the Square.
        - Level 3: Solving standard equations or finding intercepts.
        - Level 4: Using the discriminant to find ranges of a constant 'k' for real/no roots. Finding the maximum/minimum value of a quadratic function (Alpha/Beta relation).
        - Level 5: Relating roots of one equation to roots of another (e.g. roots are α+1, β+1). Complex word problems maximizing area/profit using quadratic models.
        - MANDATORY: Ensure solutions to equations are mathematically precise (leave in surd form if explicitly asked, otherwise 3 sig. fig.).
        `
    },
    'math_alg_functions': {
        guidance: `
        - Focus on Domain/Range, evaluating f(x), and transformations (f(x) + k, f(x-h)).
        - Level 3: finding f(2), f(-a), identifying simple domain restrictions (denominator non-zero).
        - Level 4: Transformations of graphs (translations, reflections). E.g. "If g(x) = f(x) + 3, what is the new y-intercept?".
        - Level 5: Complex piecewise functions or finding inverse functions. Combining with quadratics (e.g., find maximum of f(x) = -2x^2 + 4x + 1 then transform it).
        - MANDATORY REQUIREMENT: Provide a "diagram_json" showing the coordinate plane, axes, and the function curve (using "polyline" for smooth curves).
        `
    },
    'math_alg_polynomials': {
        guidance: `
        - Focus on Remainder Theorem, Factor Theorem, and Long Division.
        - Level 3: Direct application (find remainder when P(x) is divided by x - a).
        - Level 4: Finding unknown constants 'a' and 'b' given two remainders or factors.
        - Level 5: Divisors of degree 2 (e.g. division by x^2 - 1). Word problems involving geometry where side lengths are polynomials. Complete factorization into linear factors.
        `
    },
    'math_alg_indices_log': {
        guidance: `
        - Focus on Laws of Indices, properties of Logs, and solving exponential equations.
        - Level 3: Simplify expressions involving powers (e.g. (x^3 / y^-2)^4). Evaluate simple logs.
        - Level 4: Solve exponential equations by taking logs on both sides. Change of base formula.
        - Level 5: Solving quadratic-like exponential equations (a^(2x) + b*a^x + c = 0). Expressing log(x*y^2) in terms of other logs. Graphing y = a * b^x by transforming to a linear log graph.
        `
    },
    'math_alg_complex_numbers': {
        guidance: `
        - Focus ONLY on the HKDSE Compulsory Part: imaginary unit i (i^2 = -1), real/imaginary parts, and basic operations (a + bi).
        - Level 3 (Easy): Basic addition/subtraction. Identifying real and imaginary parts. Simple 4-cycle of i (i, -1, -i, 1).
        - Level 4 (Medium): Multiplication of complex numbers using FOIL and simplifying i^2. Standard form z = a + bi. 
        - Level 5 (Standard): Division of complex numbers using conjugates to rationalize the denominator. Solving quadratic equations with ∆ < 0 to find non-real roots.
        - Level 7 (Elite): Equality of complex numbers to solve for real unknowns x and y. Crossover with quadratic equations (finding p and q in x^2 + px + q = 0 given one non-real root).
        - STRICT EXCLUSIONS: NEVER generate questions about Modulus (|z|), Argument (arg z), or Polar Form. These are NOT in the Compulsory syllabus.
        - TRAPS TO AVOID: Remind students that Re(z) and Im(z) are REAL numbers. Im(3+4i) is 4, not 4i.
        `
    },
    'math_alg_log_exp': {
        guidance: `
        - Focus on Laws of Indices, properties of Logarithms, and solving exponential/logarithmic equations.
        - Level 3 (Easy): Simplify expressions involving powers (e.g. (x^3 / y^-2)^4). Evaluate simple logs like log₁₀(1000).
        - Level 4 (Medium): Solve exponential equations by taking logs on both sides. Apply the change of base formula. Convert between index form and log form.
        - Level 5 (Standard): Solving quadratic-like exponential equations (a^(2x) + b·a^x + c = 0). Expressing log(x·y²) in terms of other logs.
        - Level 7 (Elite): Graphing y = a·b^x by transforming to a linear log graph (log y = log a + x·log b). Complex simultaneous log/exp equations.
        - STRICT SCOPE: Only HKDSE Compulsory Part. No natural logarithm (ln) unless it arises naturally from context. Focus on log₁₀ and log_a.
        `
    },
    'math_alg_variations': {
        guidance: `
        - Focus on Direct Variation, Inverse Variation, Joint Variation, and Partial Variation.
        - Level 3 (Easy): Identify the type of variation from a given equation or table. Direct substitution to find the variation constant k.
        - Level 4 (Medium): Setting up a variation equation from a word problem (e.g., y varies directly as x² and inversely as z). Finding unknown values after determining k.
        - Level 5 (Standard): Partial variation problems (y = k₁x + k₂) requiring simultaneous equations to find two constants. Percentage change problems under variation.
        - Level 7 (Elite): Multi-step variation word problems combining partial and joint variation. Problems where one variable changes and you must find the percentage change in another.
        - STRICT SCOPE: Only HKDSE Compulsory Part content. No calculus-based rates of change.
        `
    },

    'math_alg_apgp': {
        guidance: `
        - Focus on Arithmetic Progressions (T(n) = a + (n-1)d, S(n) = n/2(2a + (n-1)d)) and Geometric Progressions (T(n) = ar^(n-1), S(n) = a(r^n - 1)/(r - 1), S∞ = a/(1-r)).
        - Level 3 (Easy): Find the next term, the common difference/ratio, or apply T(n) directly with all values given.
        - Level 4 (Medium): Find sum of first n terms, or find n given S(n). Simple word problems with AP or GP.
        - Level 5 (Standard): Multi-step problems requiring linking T(n) and S(n). Setting up simultaneous equations from two conditions.
        - Level 7 (Elite): Sum to infinity of convergent GP. Compound AP/GP problems. Proving whether a sequence is AP or GP.
        - STRICT SCOPE: Only HKDSE Compulsory Part. No sigma notation, no complex series beyond AP/GP.
        `
    },
    'math_num_inequalities': {
        guidance: `
        - Focus on Linear Inequalities in one unknown, Quadratic Inequalities, and Systems of Linear Inequalities.
        - Level 3 (Easy): Solve a simple linear inequality (e.g., 2x - 3 > 5). Represent the solution on a number line.
        - Level 4 (Medium): Solve compound inequalities (e.g., -3 ≤ 2x + 1 < 7). Solve quadratic inequalities using sign tables or sketches.
        - Level 5 (Standard): Word problems leading to inequalities. Finding integer solutions satisfying a system of inequalities.
        - Level 7 (Elite): Systems of inequalities with optimization (e.g., find the maximum value of 2x + y subject to constraints). Abstract inequality problems requiring algebraic manipulation.
        - STRICT SCOPE: Only HKDSE Compulsory Part. No absolute value inequalities unless simple. Focus on linear and quadratic only.
        `
    },

    // --- STRAND B: MEASURES, SHAPE & SPACE ---
    'math_geo_coord': {
        guidance: `
        - Focus on Distance Formula, Given Ratio (Section Formula), Slope (parallel/perpendicular), and Incenter/Circumcenter concepts.
        - Level 3: Find distance, midpoint, or equation of a line passing through two points.
        - Level 4: Find area of polygon using shoelace formula. Find coordinates of a point dividing a line in a given ratio. Perpendicular bisectors.
        - Level 5: Finding coordinates of Incenter/Orthocenter. Tangents to curves (intersecting with circles). Locus of points.
        - REQUIRED: Always provide coordinates in the format (x, y).
        `
    },
    'math_geo_circles': {
        guidance: `
        - Focus on Angles at center/circumference, Angles in same segment, Angle in semi-circle, Chord properties (perp. bisector), Cyclic Quadrilaterals (opp. angles, ext. angle), and Tangent properties (tangent perp. radius, tangents from ext. point, angles in alternate segment).
        - Level 3 (Easy): Direct application of ONE standard theorem (e.g., finding an angle in a semi-circle or using angles in same segment).
        - Level 4 (Medium): 2-3 logical steps combining theorems. Involves basic chord calculations or simple cyclic quadrilateral properties. Must include reasoning for each step (e.g., "(∠ in semi-circle)").
        - Level 5 (Standard): Complex multi-step problems matching Section A(2) difficulty. Linking 3+ theorems. Finding radius/angles using similar triangles or Pythagoras within circle setups.
        - Level 7 (Elite): Hard Section B style problems. Abstract proofs or highly complex overlapping circle/tangent configurations. Involves optimization or complex algebraic setups within the geometry.
        - GEOMETRIC VALIDITY (CRITICAL):
          1. COLLINEARITY: Three distinct points on a circle circumference (e.g., A, B, C) CANNOT be collinear. If a chord AE is "extended to meet the circle at C", this is geometrically impossible unless C is A or E. 
          2. EXTERIOR POINTS: If a point (e.g., intersection of tangents, or where extended chords meet) lies OUTSIDE the circle, do NOT use "angle". Use "pos": [x, y] and carefully estimate coordinates relative to center [0,0] and radius.
        - VARIETY REQUIREMENT: Force explicitly diverse geometric configurations. Do NOT repeat the standard "triangle inside a circle" layout. Actively generate variants with:
          1. Tangents meeting secants exactly ON or OUTSIDE the circle.
          2. Cyclic quadrilaterals with extended lines forming external angles.
          3. Semicircles with inscribed right-angled triangles.
          4. Intersecting chords forming "bowtie" shapes inside the circle.
        - COMPLETENESS REQUIREMENT: You MUST include all lines/chords necessary to form the angles mentioned in the question. For example, if you mention angle ABC, a line between A and B and a line between B and C MUST exist in the "lines" array.
        - TARGET INDICATOR: You MUST include an angle indicator with label "?" or "x" for the angle the student is asked to find.
        - MANDATORY REQUIREMENT: Provide a "diagram_json" for ALL difficulties. Every question MUST have a high-quality visual.
        - DIAGRAM_JSON SPECIFICATION (Version 2.0 - Smarter Rendering):
          {
            "center": [0, 0],
            "radius": 5,
            "show_center": true,
            "points": [
              { "label": "A", "angle": 270, "offset": [0, -0.6] },
              { "label": "B", "angle": 150, "offset": [-0.4, 0.4] },
              { "label": "C", "angle": 30, "offset": [0.4, 0.4] },
              { "label": "P", "pos": [7, 0], "offset": [0.5, 0.5] } 
            ],
            "lines": [
              { "pts": ["A", "B"], "style": "-" },
              { "pts": ["B", "C"], "style": "-" },
              { "pts": ["C", "A"], "style": "-" },
              { "pts": ["B", "P"], "style": "-" },
              { "pts": ["C", "P"], "style": "-" }
            ],
            "angles": [
              { "pts": ["A", "B", "C"], "label": "58\\degree", "radius": 0.8 },
              { "pts": ["B", "A", "C"], "label": "?", "radius": 0.8 }
            ]
          }
        - NOTE: "angle" is in degrees (0 = right, 90 = top). "pts" in lines and angles refers to the point "label". "pos" is [x, y] for points NOT on the circle circumference.
        - STRICT SCOPE: Only HKDSE Compulsory Part. No power of a point theorem, no advanced inversion geometry.
        `
    },
    'math_geo_mensuration': {
        guidance: `
        - Focus on Arc Length, Sector Area, Surface Area and Volume of 3D Solids (Cylinders, Cones, Spheres, Frustums).
        - Level 3: Direct substitution into volume/area formulas for simple shapes.
        - Level 4: Melting/Recasting problems (Volume is constant, find new height/radius). Ratios of volumes/areas of similar solids (V1/V2 = l1^3/l2^3).
        - Level 5: Frustums (truncated cones/pyramids). Complex inscribed shapes (e.g. sphere inside a cylinder). Rate of water flowing into a tank.
        - REQUIRED: Specify whether answers should be exact (in terms of π) or rounded to 3 sig. fig.
        `
    },
    'math_trig_ratios': {
        guidance: `
        - Focus on Sine Rule, Cosine Rule, and Area of Triangle (1/2 * a * b * sinC).
        - Level 3: Find a missing side or angle in a 2D triangle.
        - Level 4: Bearings and navigation (2D). Word problems combining 2 adjacent triangles. Ambiguous case of sine rule questions.
        - Level 5: Bearings with multi-stage journeys. Calculating shortest distances to a line of travel.
        `
    },
    'math_trig_3d': {
        guidance: `
        - Focus on Angles between lines and planes, angles between two planes, line of greatest slope.
        - Level 3: N/A - 3D Trig is inherently higher level. Start at Level 3.
        - Level 4: Finding the angle between a sloping edge and the base of a regular pyramid.
        - Level 5: Angle between two sloping faces of a tetrahedron. Complex real-world 3D structures (tents, inclined roads on hills).
        - MANDATORY: Provide a highly detailed "diagram_json" featuring dashed lines (strokeDasharray: "5,5") for hidden interior lines in 3D.
        `
    },
    'math_geo_rectilinear': {
        guidance: `
        - Focus on Angles of Triangles/Polygons, Pythagoras' Theorem, Similarity, and Congruence.
        - Level 3 (Easy): Basic polygon angle sum calculations (e.g., finding one interior angle of a regular octagon). Simple Pythagoras problems.
        - Level 4 (Medium): Problems with overlapping triangles or basic similarity (finding a side). 2-3 step angle proofs.
        - Level 5 (Standard): Complex similarity problems involving area ratios (A1/A2 = (l1/l2)^2). Harder geometry proofs in Section A(2).
        - Level 7 (Elite): Hard abstract proofs or complex geometric configurations requiring multiple theorems (e.g., properties of circumcenter/incenter combined with similarity).
        - MANDATORY REQUIREMENT: Provide a "diagram_json" for ALL geometric configurations.
        `
    },

    // --- STRAND C: DATA HANDLING ---
    'math_stat_measures': {
        guidance: `
        - Focus on Central Tendency (Mean, Median, Mode) and Dispersion (Range, IQR, Variance, Standard Deviation).
        - Level 3: Calculating from a raw list of numbers or simple frequency table.
        - Level 4: Finding unknown frequencies given a mean/median. Adjusting data (what happens to SD if all numbers are multiplied by 2 and added by 5?). Cumulative frequency polygons.
        - Level 5: Combining two sets of data (finding the combined mean and combined standard deviation). Changes to SD when data points are added/removed.
        `
    },
    'math_stat_probability': {
        guidance: `
        - Focus on Addition Rule, Multiplication Rule, Conditional Probability, Expected Value.
        - Level 3: Simple dice/card drawing without replacement.
        - Level 4: Expected value games (is the game fair?). Drawing multiple items with/without replacement. Tree diagrams.
        - Level 5: Bayes' theorem style conditional probability (e.g. Given that the ball drawn was red, what is the probability it came from Urn A?).
        `
    }
};

const getSyllabusGuidance = (topicId) => {
    const data = MATHS_TOPIC_SYLLABUS[topicId] || MATHS_TOPIC_SYLLABUS[topicId.replace('_math_', 'math_')];
    if (data && data.guidance) {
        return data.guidance.trim();
    }
    return "Ensure the question strongly reflects Hong Kong DSE Mathematics standards for this topic.";
};

module.exports = {
    MATHS_TOPIC_SYLLABUS,
    getSyllabusGuidance
};
