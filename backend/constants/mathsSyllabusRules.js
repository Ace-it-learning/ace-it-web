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
  'math_num_num_systems': {
    guidance: `
        - Focus on Binary (base 2), Hexadecimal (base 16), Standard Form, Significant Figures, and Approximation Errors (absolute, relative, percentage errors).
        - Level 3 (Easy): Direct conversion between Binary/Hexadecimal and Decimal. Writing numbers in Standard Form. Rounding to a given number of significant figures.
        - Level 4 (Medium): Operations with Binary/Hexadecimal (addition/subtraction). Calculating errors (absolute/relative/percentage) when a value is rounded or estimated.
        - Level 5 (Standard): Complex problems involving indices within base conversions (e.g., $2^{10} + 2^5 + 1$ to binary). Finding the maximum/minimum range of a value given its rounded measurement and error.
        - Level 7 (Elite): Hybrid problems involving number systems with algebra (e.g., finding unknowns in a base-n equation). Difficult error analysis in geometric contexts (e.g., error in area given errors in length/width).
        - TRAPS TO AVOID: In Hexadecimal, remind students that A=10, B=11, C=12, D=13, E=14, F=15. For errors, the maximum absolute error is half of the smallest unit of measurement.
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
        - Level 4: Using the discriminant to find ranges of a constant 'k' for real/no roots. Finding the maximum/minimum value of a quadratic function.
        - Level 5: Word problems maximizing area/profit using quadratic models.
        - MANDATORY: For Level 4/5 questions, provide a "diagram_json" of type "coordinate" showing a sketch of the parabola with "show_grid": true and "show_axes": true. Mark the vertex or intercepts.
        - DIAGRAM_JSON SPECIFICATION:
          {
            "type": "coordinate",
            "x_range": [-5, 5], "y_range": [-2, 10], "show_grid": true, "show_axes": true,
            "polylines": [{ "label": "y = f(x)", "color": "blue", "points": [[-5, 25], ..., [5, 25]] }],
            "points": [{ "label": "V(h, k)", "pos": [h, k], "color": "red" }]
          }
        - STRICT SCOPE: Only HKDSE Compulsory Part content.
        `
  },
  'math_alg_functions': {
    guidance: `
        - Focus on Domain/Range, evaluating f(x), and transformations (f(x) + k, f(x-h)).
        - Level 3: finding f(2), f(-a), identifying simple domain restrictions.
        - Level 4: Transformations of graphs (translations, reflections).
        - Level 5: Complex piecewise functions or finding inverse functions.
        - MANDATORY REQUIREMENT: Provide a "diagram_json" of type "coordinate" showing the coordinate plane, axes, and the function curve.
        - PREMIUM STANDARD: ALWAYS set "show_grid": true and "show_axes": true.
        - DIAGRAM_JSON SPECIFICATION (Type: coordinate):
          {
            "type": "coordinate",
            "x_range": [-5, 5], "y_range": [-5, 10], "show_grid": true, "show_axes": true,
            "polylines": [{ "label": "y = f(x)", "color": "blue", "points": [[-5, 25], ..., [5, 25]] }]
          }
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
  'math_alg_indices': {
    guidance: `
        - Focus on Laws of Integral Indices, Fractional Indices, and Negative Indices.
        - Level 3 (Easy): Basic simplification using $a^m \cdot a^n = a^{m+n}$, $(a^m)^n = a^{mn}$, and $a^m / a^n = a^{m-n}$. Integral indices only.
        - Level 4 (Medium): Combined laws with negative and fractional indices. Simplifying expressions like $(x^2 y^{-3})^{1/2} / x^{-1}$.
        - Level 5 (Standard): Solving exponential equations by constantizing the base (e.g., $9^{x+1} = 27^{x-1}$). Comparing sizes of large powers by making either the base or the index the same.
        - Level 7 (Elite): Hard exponential equations that reduce to quadratics ($a^{2x} + b \cdot a^x + c = 0$). Abstract index proofs or complex magnitude comparisons.
        - TRAPS TO AVOID: Remind students that $a^0 = 1$ (for $a \neq 0$) and $a^{-n} = 1/a^n$. Do not mix multiplication and addition laws (e.g., $3^2 + 3^3 \neq 3^5$).
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
        - MANDATORY REQUIREMENT: Provide a "diagram_json" for ALL difficulties to illustrate the coordinate plane.
        - PREMIUM STANDARD: ALWAYS set "show_grid": true and "show_axes": true.
        - DIAGRAM_JSON SPECIFICATION (Type: coordinate):
          {
            "type": "coordinate",
            "x_range": [-5, 5], "y_range": [-5, 5], "show_grid": true, "show_axes": true,
            "points": [{ "label": "A(1, 2)", "pos": [1, 2], "color": "black" }],
            "lines": [{ "points": [[1, 2], [4, 4]], "style": "-", "color": "blue" }]
          }
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
          2. EXTERIOR POINTS: If a point (e.g., intersection of tangents, or where extended chords meet) lies OUTSIDE the circle, do NOT use "angle". Use "pos": [x, y] and carefully calculate coordinates.
             - CALCULATION TIP: For tangents at angles θ1 and θ2 on a circle with radius r and center (0,0), the intersection point T [x, y] is:
               x = r * cos((θ1 + θ2) / 2) / cos((θ1 - θ2) / 2)
               y = r * sin((θ1 + θ2) / 2) / cos((θ1 - θ2) / 2)
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
        - Focus on Sine Rule, Cosine Rule, and Area of Triangle (\( \frac{1}{2}ab\sin C \)).
        - Level 3 (Easy): Direct calculation of a missing side or angle in a non-right-angled triangle. Single-step application of Sine or Cosine rule.
        - Level 4 (Medium): Problems involving bearings (3-figure) and navigation in 2D. Word problems requiring 2-3 steps, possibly combining two triangles. Ambiguous case of the Sine Rule (SSA).
        - Level 5 (Standard): Complex 2D problems. Finding shortest distance from a point to a line. Problems combining trigonometry with geometry of circles or quadrilaterals.
        - Level 7 (Elite): Hard Section B style problems. Abstract proofs, optimization (minimization/maximization), or multi-variable systems. 
        - **MATHEMATICAL INTEGRITY (ELITE)**: 
          1. If solving for a minimum length of a side (e.g., BC) given fixed Area and side AB, perform a formal derivation in the scratchpad. (Hint: Min value often occurs when the angle is \( 90^\circ \) if other sides are variable, but MUST be verified).
          2. NEVER use identity traps like \( 0 = 0 \) to justify a solution. Every step must be a logical derivation.
          3. For complex systems, use the identity \( \sin^2 \theta + \cos^2 \theta = 1 \) to eliminate angles accurately.
        - NO HIGHLIGHTING: NEVER use markdown highlighting (==text==) or bolding (**text**) in the prose explanations. Use plain text for words and proper delimiters for math.
        - VARIETY REQUIREMENT: Force explicitly diverse real-world scenarios and abstract geometric configurations. 
        - DANGER: NEVER start a question with "In triangle ABC" if a scenario seed is provided. 
        - Actively generate variants with:
          1. Diverse real-world contexts like architecture, surveying, mechanics, aerospace, or stadium design.
          2. Abstract 2D geometry involving non-standard shapes, transversals, and complex multi-polygon layouts.
          3. Bearings combined with realistic navigation constraints (e.g., wind drift, multi-leg journeys).
          4. Mixed problems integrating sine/cosine rules with optimization or physical constraints.
        - MANDATORY REQUIREMENT: Provide a "diagram_json" for ALL geometric configurations.
        - DIAGRAM_JSON SPECIFICATION (Type: coordinate):
          {
            "type": "coordinate",
            "x_range": [-2, 8],
            "y_range": [-2, 8],
            "points": [
              { "label": "A", "pos": [0, 0], "offset": [-0.3, -0.3] },
              { "label": "B", "pos": [6, 0], "offset": [0.3, -0.3] },
              { "label": "C", "pos": [2, 5], "offset": [0, 0.4] }
            ],
            "lines": [
              { "pts": ["A", "B"], "label": "6 cm" },
              { "pts": ["B", "C"], "style": "-" },
              { "pts": ["C", "A"], "style": "--" }
            ],
            "angles": [
              { "pts": ["B", "A", "C"], "label": "theta", "radius": 0.8 }
            ]
          }
        - NOTE: Coordinates (pos) MUST be mathematically consistent with the side lengths and angles described in the question.
        `
  },
  'math_trig_applications': {
    guidance: `
        - Focus on applying Sine Rule, Cosine Rule, Area of Triangle, 2D Bearings, and Angles of Elevation/Depression.
        - Level 3 (Easy): Direct Sine/Cosine rule application. Finding single angles of elevation or depression from simple word problems. One-step bearing calculations.
        - Level 4 (Medium): Problems combining two triangles. Multi-step bearing+trig (e.g., finding distance between two ships after different legs). Area of triangle involving Ambiguous Case (SSA).
        - Level 5 (Standard): Complex 2D navigation (multi-point bearings). Problems with two observers at different elevations. Shortest distance to a line from a moving object.
        - Level 7 (Elite): Hard Section B style multi-concept problems. Abstract navigation proofs. Optimization problems (e.g., find minimum distance given certain constraints). Hybrid topic crossovers.
        - MANDATORY REQUIREMENT: Provide a "diagram_json" for ALL navigation/word-problem configurations.
        - PREMIUM 3D STANDARD: For multi-observer or 3D navigation problems, use "ellipses" to represent horizontal planes/horizons in 3D-perspective.
        - DIAGRAM_JSON SPECIFICATION (Version 3.0 - 3D Perspective):
          {
            "type": "coordinate",
            "x_range": [-2, 10], "y_range": [-2, 10],
            "ellipses": [{ "center": [0, 0], "width": 8, "height": 2, "style": "--", "color": "grey" }], // Horizon
            "points": [{ "label": "A", "pos": [0, 0] }, { "label": "Tower", "pos": [0, 6] }],
            "lines": [{ "pts": ["A", "Tower"], "style": "-" }]
          }
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
        - DIAGRAM_JSON SPECIFICATION (Type: coordinate):
          {
            "type": "coordinate",
            "x_range": [-1, 10], 
            "y_range": [-1, 10],
            "points": [
              { "label": "A", "pos": [0, 0] },
              { "label": "B", "pos": [5, 0] }
            ],
            "lines": [
              { "pts": ["A", "B"], "style": "-" }
            ]
          }
        `
  },

  // --- STRAND B (continued): MENSURATION ---
  'math_mensuration': {
    guidance: `
        - Focus on Arc Length, Sector Area, Surface Area and Volume of 3D Solids (Cylinders, Cones, Spheres, Pyramids, Frustums), and Similar Solids ratios.
        - Level 3 (Easy): Direct substitution into volume or surface area formulas for a single solid (cylinder, cone, sphere). Finding arc length or sector area from a given angle and radius.
        - Level 4 (Medium): Melting/Recasting problems where volume is conserved (e.g., a cone melted into a cylinder — find the new height). Finding the total surface area of a composite solid (cylinder + hemisphere). Ratios of volumes/areas of similar solids: $V_1/V_2 = (l_1/l_2)^3$.
        - Level 5 (Standard): Frustum (truncated cone) problems requiring the student to reconstruct the full cone using similarity, then subtract. Complex inscribed shapes (e.g., sphere inscribed in a cylinder, or cone inscribed in a sphere). Problems involving rates (water flowing into a conical tank — find volume after t seconds).
        - Level 7 (Elite): Multi-step optimization problems (e.g., given a fixed surface area, find the radius that maximizes volume). Frustum problems combined with trigonometry. Problems where a sector is folded into a cone.
        - REQUIRED: Specify whether answers should be exact (in terms of π) or rounded to 3 significant figures. Use 'correct to 3 significant figures' or 'in terms of π' in the question.
        - MANDATORY REQUIREMENT: Provide a "diagram_json" for ALL difficulties. Every solid MUST be shown in 3D-perspective (using ellipses for circular bases).
        - DIAGRAM_JSON SPECIFICATION (Version 3.0 - Premium 3D Perspective):
          1. Use "ellipses" to represent circular bases in perspective (e.g., width: 10, height: 3).
          2. Use "lines" to form the slant sides of cones or vertical walls of cylinders.
          3. Use "points" and "labels" for dimensions (r, h, H, etc.).
          4. For hidden back edges of ellipses, create a second ellipse with style: "--".
          Example (Cone/Frustum):
          {
            "type": "coordinate",
            "x_range": [-8, 8], "y_range": [-2, 12],
            "ellipses": [
              { "center": [0, 0], "width": 10, "height": 3, "color": "blue", "style": "--" }, // Hidden base
              { "center": [0, 8], "width": 4.5, "height": 1.35, "color": "blue" } // Cut-off plane
            ],
            "lines": [
              { "points": [[-5, 0], [-2.25, 8]], "color": "blue" }, // Slant wall left
              { "points": [[5, 0], [2.25, 8]], "color": "blue" }, // Slant wall right
              { "points": [[0, 8], [0, 12]], "style": "--", "color": "blue" } // Hidden height line
            ],
            "labels": [
                { "pos": [3, 0], "text": "R=6" },
                { "pos": [1.5, 8], "text": "r=2" }
            ]
          }
        - STRICT SCOPE: Only HKDSE Compulsory Part content. No calculus-based optimization.
        `
  },

  // --- STRAND C: DATA HANDLING ---
  'math_stat_measures': {
    guidance: `
        - Focus on Central Tendency (Mean, Median, Mode) and Dispersion (Range, IQR, Variance, Standard Deviation).
        - Level 3 (Easy): Calculating mean, median, mode from a raw list of numbers or a simple frequency table. Finding the range.
        - Level 4 (Medium): Finding unknown frequencies given a mean or median constraint. Transformation effects: what happens to the mean and SD if all data values are multiplied by $c$ and then $k$ is added? Reading quartiles from a given cumulative frequency polygon. Constructing a grouped frequency table.
        - Level 5 (Standard): Combining two sets of data — finding the combined mean and combined standard deviation using the formula $\\sigma_{combined}^2 = \\frac{n_1(\\sigma_1^2 + d_1^2) + n_2(\\sigma_2^2 + d_2^2)}{n_1 + n_2}$. Changes to SD when specific data points are added or removed.
        - Level 7 (Elite): Abstract proof-style questions about properties of standard deviation. Complex data interpretation combining frequency tables with transformation effects.
        - STRICT SCOPE: Only HKDSE Compulsory Part. No variance formulas using sample (n-1) — use population SD ($\\div n$) only.
        - TRAPS TO AVOID: Students often confuse the effect of adding a constant (SD unchanged) vs multiplying (SD scales by |c|).
        `
  },
  'math_stat_charts': {
    guidance: `
        - Focus on Stem-and-Leaf Diagrams (including back-to-back), Histograms (equal and unequal class widths), Cumulative Frequency Polygons, and Box-and-Whisker Plots.
        - Level 3 (Easy): Reading values from a given stem-and-leaf diagram or histogram. Finding the mode or range from a chart. Constructing a simple frequency table from raw data.
        - Level 4 (Medium): Finding the median and quartiles from a cumulative frequency polygon. Constructing a box-and-whisker plot from a five-number summary. Comparing two data sets using box plots (median, IQR, range). Histograms with UNEQUAL class widths — using frequency density.
        - Level 5 (Standard): Complex interpretation: given a cumulative frequency polygon, estimate the number of data values within a specific range. Back-to-back stem-and-leaf comparison questions. Multi-step problems combining histogram reading with statistical calculations.
        - Level 7 (Elite): Given partial information from a box plot or cumulative frequency polygon, deduce missing parameters. Combined chart + calculation problems requiring setting up equations.
        - MANDATORY REQUIREMENT: Provide a "diagram_json" for ALL questions involving charts. Box-and-whisker and cumulative frequency questions MUST have visual aids.
        - DIAGRAM_JSON SPECIFICATION (Type: statistics):
          {
            "type": "box_plot",
            "datasets": [
              {
                "label": "Class A",
                "min": 45,
                "q1": 55,
                "median": 62,
                "q3": 72,
                "max": 90,
                "color": "#4682B4"
              },
              {
                "label": "Class B",
                "min": 40,
                "q1": 50,
                "median": 58,
                "q3": 68,
                "max": 85,
                "color": "#E74C3C"
              }
            ],
            "x_label": "Score",
            "title": "Test Scores Comparison"
          }
        - For Histograms:
          {
            "type": "histogram",
            "bins": [
              { "range": [0, 10], "frequency": 5 },
              { "range": [10, 20], "frequency": 12 },
              { "range": [20, 30], "frequency": 8 }
            ],
            "x_label": "Score",
            "y_label": "Frequency",
            "title": "Score Distribution"
          }
        - For Cumulative Frequency Polygons:
          {
            "type": "cumulative_frequency",
            "points": [[10, 0], [20, 5], [30, 17], [40, 35], [50, 48], [60, 50]],
            "x_label": "Score",
            "y_label": "Cumulative Frequency",
            "title": "Cumulative Frequency of Test Scores"
          }
        - STRICT SCOPE: Only HKDSE Compulsory Part. No pie charts or scatter plots beyond basic interpretation.
        `
  },
  'math_prob_basic': {
    guidance: `
        - Focus on Classical Probability, Complement Rule, Addition Rule (mutually exclusive/non-mutually exclusive), Multiplication Rule (independent/dependent events), Tree Diagrams, and Expected Value.
        - Level 3 (Easy): Simple single-event probability (rolling a die, drawing a card, choosing a ball from a bag). Direct application of P(A) = favourable/total.
        - Level 4 (Medium): Two-step experiments with/without replacement using tree diagrams (e.g., drawing 2 balls from a bag). Expected value calculations — 'Is the game fair?' problems. Calculating P(at least one) using the complement: $P(\\text{at least one}) = 1 - P(\\text{none})$.
        - Level 5 (Standard): Complex tree diagrams with 3+ stages. Multi-event probability problems combining addition and multiplication rules. Expected value with variable payoffs. Problems requiring construction of probability distributions.
        - Level 7 (Elite): Abstract probability proofs. Optimization of expected value (e.g., choosing the best strategy). Complex real-world scenarios requiring careful event decomposition.
        - VARIETY REQUIREMENT: Mix contexts — dice, cards, balls in bags, coin flips, real-world scenarios (weather, quality control, games). Do NOT repeat the same context.
        - STRICT SCOPE: Only HKDSE Compulsory Part. No continuous probability distributions, no binomial theorem for probability.
        - TRAPS TO AVOID: Students confuse 'with replacement' and 'without replacement'. Always state this explicitly in the question.
        `
  },
  'math_prob_advanced': {
    guidance: `
        - Focus on Permutations ($P(n,r) = \\frac{n!}{(n-r)!}$), Combinations ($C(n,r) = \\frac{n!}{r!(n-r)!}$), Conditional Probability ($P(A|B) = \\frac{P(A \\cap B)}{P(B)}$), and Counting Principles applied to probability.
        - Level 3 (Easy): Direct calculation of $P(n,r)$ and $C(n,r)$. Simple 'how many ways' questions (e.g., choosing a committee of 3 from 8 people).
        - Level 4 (Medium): Probability using combinations: $P = \\frac{C(\\text{favourable})}{C(\\text{total})}$. Arrangement problems with restrictions (e.g., certain people must/must not sit together). Conditional probability with tree diagrams.
        - Level 5 (Standard): Complex counting problems with multiple restrictions (e.g., arrange 5 boys and 3 girls such that no two girls are adjacent). Bayes' theorem-style problems: 'Given that a defective item was found, what is the probability it came from Machine A?' Multi-category selection problems.
        - Level 7 (Elite): Abstract combinatorial arguments. Complex conditional probability chains. Problems combining permutations and geometry (e.g., choosing vertices of a polygon to form triangles). Multi-stage selection with dependent probabilities.
        - STRICT SCOPE: Only HKDSE Compulsory Part. No generating functions, no advanced combinatorial identities beyond basic $C(n,r) = C(n, n-r)$.
        - TRAPS TO AVOID: Students often confuse when to use permutations vs combinations. The question must make it clear whether order matters.
        `
  },
  'math_stat_probability': {
    guidance: `
        - Focus on Addition Rule, Multiplication Rule, Conditional Probability, Expected Value.
        - Level 3: Simple dice/card drawing without replacement.
        - Level 4: Expected value games (is the game fair?). Drawing multiple items with/without replacement. Tree diagrams.
        - Level 5: Bayes' theorem style conditional probability (e.g. Given that the ball drawn was red, what is the probability it came from Urn A?).
        `
  },
  'math_int_algebra': {
    guidance: `
    - COMBINATION: Arithmetic/Geometric Progressions + Logarithms + Exponential Functions.
    - FOCUS: Problems where the common ratio 'r' or term 'n' must be solved using logs (e.g., finding the first year total savings exceed $X).
    - STRUCTURE: Section B style (5-8 marks). Usually 3 parts (a, b, c).
    - EXAMPLE: Given common difference 'd' in AP, terms are passed through log10(x) to form a new sequence. Prove it is an AP/GP.
    `
  },
  'math_int_geometry': {
    guidance: `
    - COMBINATION: Circle Equations + Coordinate Geometry + Locus.
    - FOCUS: Finding intersection points between lines and circles. Proving a line is a tangent (∆ = 0). Finding equations of locus formed by moving points relative to a fixed circle.
    - STRUCTURE: Multi-part (a, b). Part (a) finding circle eq, Part (b) finding tangency or intersection area.
    - MANDATORY: diagram_json of type 'coordinate' with circle and line sketched.
    `
  },
  'math_int_trig': {
    guidance: `
    - COMBINATION: 3D Trigonometry + Mensuration.
    - FOCUS: Pyramids/Prisms/Cones where students find the angle between two planes or a line and a plane using Sine/Cosine rules, then calculate the total surface area or volume.
    - STRUCTURE: Section B (8+ marks).
    - MANDATORY: diagram_json of type '3d_perspective' (using elliptical bases for circular parts).
    `
  },
  'math_int_data': {
    guidance: `
    - COMBINATION: Probability + Measures of Dispersion (Stats).
    - FOCUS: Using the Mean/SD of a dataset to define ranges, then calculating the probability that a randomly selected person falls into a certain range.
    - EXAMPLE: Given mean and SD of exam marks, find the probability that a student scored > 80 if the distribution is transformed (standardized).
    `
  }
};

const getSyllabusGuidance = (topicId) => {
  // Alias mappings for topic IDs used in different parts of the codebase
  const aliasMap = {
    'math_geo_mensuration': 'math_mensuration',
    'math_stat_probability': 'math_prob_basic',
  };
  const resolvedId = aliasMap[topicId] || topicId;
  const data = MATHS_TOPIC_SYLLABUS[resolvedId] || MATHS_TOPIC_SYLLABUS[resolvedId.replace('_math_', 'math_')];
  if (data && data.guidance) {
    return data.guidance.trim();
  }
  return "Ensure the question strongly reflects Hong Kong DSE Mathematics standards for this topic.";
};

module.exports = {
  MATHS_TOPIC_SYLLABUS,
  getSyllabusGuidance
};
