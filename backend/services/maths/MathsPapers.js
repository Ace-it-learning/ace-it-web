/**
 * Maths Diagnostic Papers (Sets A-E)
 * Isolated repository for Mathematics Compulsory Part questions.
 */

// Note: text fields use LaTeX formatting. \text{} is used for text segments.
module.exports = {
    'A': {
        questions: [
            // --- PART 1: Conventional (Short Questions) ---
            {
                id: 'm_p1_1',
                part: 1,
                type: 'short_question',
                topic: 'Formulas',
                marks: 2,
                text: "Make $h$ the subject of the formula $A = 2\\pi r(r+h)$.",
                marking_scheme: "M1 for expansion $2\\pi r^2 + 2\\pi rh$ or division $A/2\\pi r = r+h$, A1 for $h = \\frac{A}{2\\pi r} - r$ or equivalent.",
                model_answer: "A = 2\\pi r^2 + 2\\pi rh \\\\ A - 2\\pi r^2 = 2\\pi rh \\\\ h = \\frac{A - 2\\pi r^2}{2\\pi r} = \\frac{A}{2\\pi r} - r"
            },
            {
                id: 'm_p1_2',
                part: 1,
                type: 'short_question',
                topic: 'Indices',
                marks: 3,
                text: "Simplify $\\frac{(x^2 y)^3}{x^4 y^{-2}}$ and express your answer with positive indices.",
                marking_scheme: "M1 for $(x^2 y)^3 = x^6 y^3$, M1 for handling limits, A1 for $x^2 y^5$.",
                model_answer: "\\frac{(x^2 y)^3}{x^4 y^{-2}} = \\frac{x^6 y^3}{x^4 y^{-2}} \\\\ = x^{6-4} y^{3 - (-2)} \\\\ = x^2 y^5"
            },
            {
                id: 'm_p1_3',
                part: 1,
                type: 'short_question',
                topic: 'Factorization',
                marks: 2,
                text: "Factorize $x^2 - x - 6$.",
                marking_scheme: "M1 for method (cross method), A1 for $(x-3)(x+2)$.",
                model_answer: "x^2 - x - 6 = (x - 3)(x + 2)"
            },
            {
                id: 'm_p1_4',
                part: 1,
                type: 'short_question',
                topic: 'Inequalities',
                marks: 2,
                text: "Solve $5 > 2x + 1$.",
                marking_scheme: "M1 for $4 > 2x$, A1 for $x < 2$.",
                model_answer: "5 > 2x + 1 \\\\ 4 > 2x \\\\ 2 > x \\\\ x < 2"
            },
            {
                id: 'm_p1_5',
                part: 1,
                type: 'short_question',
                topic: 'Coordinates',
                marks: 2,
                text: "Find the distance between $A(1, 2)$ and $B(4, 6)$.",
                marking_scheme: "M1 for $\\sqrt{(4-1)^2 + (6-2)^2}$, A1 for 5.",
                model_answer: "\\text{Distance } = \\sqrt{(4-1)^2 + (6-2)^2} \\\\ = \\sqrt{3^2 + 4^2} \\\\ = \\sqrt{9 + 16} \\\\ = \\sqrt{25} \\\\ = 5"
            },
            {
                id: 'm_p1_6',
                part: 1,
                type: 'short_question',
                topic: 'Statistics',
                marks: 2,
                text: "The table below shows the number of keys owned by a group of housewives:\n\n\\[\\begin{array}{|c|c|c|c|c|c|c|} \\hline \\text{Num of keys} & 3 & 4 & 5 & 6 & 7 & 8 \\\\ \\hline \\text{Frequency} & 10 & 9 & 4 & 3 & 4 & k \\\\ \\hline \\end{array}\\]\n\nIf the probability of selecting a housewife with more than 6 keys is $\\frac{5}{18}$, find $k$.",
                marking_scheme: "M1 for $\\frac{4+k}{30+k} = \\frac{5}{18}$, A1 for $k=6$.",
                model_answer: "\\text{Total freq} = 10+9+4+3+4+k = 30+k \\\\ \\text{Fav outcomes (>6)} = 4+k \\\\ \\frac{4+k}{30+k} = \\frac{5}{18} \\\\ 18(4+k) = 5(30+k) \\\\ 72 + 18k = 150 + 5k \\\\ 13k = 78 \\\\ k = 6"
            },
            {
                id: 'm_p1_7',
                part: 1,
                type: 'short_question',
                topic: 'Coordinate Geometry',
                marks: 3,
                text: "Points $A$ and $B$ lie on the positive x-axis. A vertical line through $B$ cuts the line $y=mx$ at $C$ such that $AB=BC$. $ABCD$ is a square to the right of $B$. Express the slope of $OD$ in terms of $m$.",
                marking_scheme: "M1 for coords $C(b, mb)$ and $A(b(1+m), 0)$, M1 for $D(b(1+m), mb)$, A1 for $\\frac{m}{1+m}$.",
                model_answer: "\\text{Let } B=(b,0). \\text{ Line } x=b \\text{ cuts } y=mx \\text{ at } C(b, mb). \\\\ BC = mb. \\text{ Since } AB=BC, AB=mb. \\\\ A = (b+mb, 0) = (b(1+m), 0). \\\\ D = (b(1+m), mb). \\\\ \\text{Slope } OD = \\frac{mb - 0}{b(1+m) - 0} = \\frac{mb}{b(1+m)} = \\frac{m}{1+m}"
            },
            {
                id: 'm_p1_8',
                part: 1,
                type: 'short_question',
                topic: 'Trigonometry',
                marks: 2,
                text: "In $\\triangle PQS$, $PQ=12$ cm, $PS=10$ cm, $\\angle QPS=82^\\circ$. Find $QS$ correct to 3 sig. fig.",
                marking_scheme: "M1 for Cosine Rule $QS^2 = 12^2 + 10^2 - 2(12)(10)\\cos 82^\\circ$, A1 for $14.5$.",
                model_answer: "QS^2 = 12^2 + 10^2 - 2(12)(10)\\cos 82^\\circ \\\\ QS^2 = 144 + 100 - 240(0.1392) \\\\ QS^2 = 244 - 33.408 \\\\ QS^2 = 210.59 \\\\ QS \\approx 14.5 \\text{ cm}"
            },
            {
                id: 'm_p1_9',
                part: 1,
                type: 'short_question',
                topic: '3D Geometry',
                marks: 4,
                text: "Figure 5(a) shows a regular tetrahedron $VABC$ with side length 50 cm. Let $M$ and $N$ be the midpoints of $AB$ and $BC$ respectively.\n\n(a) Find $VM$ and $MN$.\n(b) Find the angle between the plane $VMN$ and the base $ABC$.",
                imageURL: "/images/math/tetrahedron_diagnostic.png",
                parts: [
                    { id: 'a', label: '(a)', placeholder: 'Find VM and MN...' },
                    { id: 'b', label: '(b)', placeholder: 'Find the angle...' }
                ],
                marking_scheme: "M1 for $VM = 50\\sin 60^\\circ = 25\\sqrt{3}$, M1 for $MN = 25$, A1 for angle calculation.",
                model_answer: "VM = 50 \\sin 60^\\circ = 43.3 \\text{ cm} \\\\ MN = \\frac{1}{2} AC = 25 \\text{ cm} \\\\ \\text{Let } G \\text{ be the projection of } V \\text{ on base. } \\text{Angle } \\theta = \\cos^{-1}(\\frac{1}{3}) \\approx 70.5^\\circ"
            },
            {
                id: 'm_p1_10',
                part: 1,
                type: 'short_question',
                topic: 'Mensuration (3D)',
                marks: 5,
                text: "Figure 6 shows a right circular cone with base radius $r$ and slant height $l$. The height is $h$. It is given that the volume of the cone is $320\\pi \\text{ cm}^3$ and $r = 8$ cm.\n\n(a) Find the height $h$.\n(b) Find the total surface area of the cone in terms of $\\pi$.",
                imageURL: "/images/math/cone_diagnostic.png",
                parts: [
                    { id: 'a', label: '(a)', placeholder: 'Find h...' },
                    { id: 'b', label: '(b)', placeholder: 'Find total surface area...' }
                ],
                marking_scheme: "M1 for $320\\pi = \\frac{1}{3}\\pi (8)^2 h$, A1 for $h=15$. M1 for $l=\\sqrt{15^2+8^2}=17$, M1 for $\\pi(8)(17) + \\pi(8)^2$, A1 for $200\\pi$.",
                model_answer: "\\text{Volume} = \\frac{1}{3}\\pi r^2 h \\\\ 320\\pi = \\frac{1}{3}\\pi (8)^2 h \\\\ 960 = 64h \\\\ h = 15 \\text{ cm} \\\\ \\\\ l = \\sqrt{h^2+r^2} = \\sqrt{15^2+8^2} = 17 \\\\ \\text{Total SA} = \\pi rl + \\pi r^2 \\\\ = \\pi(8)(17) + \\pi(8)^2 \\\\ = 136\\pi + 64\\pi \\\\ = 200\\pi \\text{ cm}^2"
            },

            // --- PART 2: MCQ (Multiple Choice) ---
            {
                id: 'm_p2_2',
                part: 2,
                type: 'mc',
                topic: 'Ratio',
                marks: 1,
                text: "If $3x = 2y$, find $x:y$.",
                options: ['2:3', '3:2', '1:1', '3:1'],
                answer: '2:3'
            },
            {
                id: 'm_p2_3',
                part: 2,
                type: 'mc',
                topic: 'Transformation',
                marks: 1,
                text: "Find the coordinates of the reflection of $P(2, -3)$ in the x-axis.",
                options: ['(-2, -3)', '(2, 3)', '(-2, 3)', '(3, -2)'],
                answer: '(2, 3)'
            },
            {
                id: 'm_p2_4',
                part: 2,
                type: 'mc',
                topic: 'Probability',
                marks: 1,
                text: "A fair coin is tossed once. Find the probability of getting a Head.",
                options: ['0.25', '0.5', '0.75', '1'],
                answer: '0.5'
            },
            {
                id: 'm_p2_5',
                part: 2,
                type: 'mc',
                topic: 'Geometry',
                marks: 1,
                text: "Find the sum of interior angles of a pentagon.",
                options: ['360', '540', '720', '1080'],
                answer: '540'
            },
            {
                id: 'm_p2_6',
                part: 2,
                type: 'mc',
                topic: 'Quadratic',
                marks: 1,
                text: "Solve $x^2 = 9$.",
                options: ['3', '-3', '3, -3', '9'],
                answer: '3, -3'
            },
            {
                id: 'm_p2_7',
                part: 2,
                type: 'mc',
                topic: 'Linear Equations',
                marks: 1,
                text: "Find the slope of the line $2x + y - 1 = 0$.",
                options: ['2', '-2', '0.5', '-0.5'],
                answer: '-2'
            },
            {
                id: 'm_p2_8',
                part: 2,
                type: 'mc',
                topic: 'Mensuration',
                marks: 1,
                text: "Find the volume of a cube with side length 3.",
                options: ['9', '18', '27', '81'],
                answer: '27'
            },
            {
                id: 'm_p2_9',
                part: 2,
                type: 'mc',
                topic: 'Trigonometry',
                marks: 1,
                text: "Find the value of $\\sin 30^\\circ$.",
                options: ['0.5', '0.866', '1', '0'],
                answer: '0.5'
            },
            {
                id: 'm_p2_10',
                part: 2,
                type: 'mc',
                topic: 'Sequence',
                marks: 1,
                text: "Find the next term in the sequence: $1, 4, 9, 16, ...$",
                options: ['20', '24', '25', '36'],
                answer: '25'
            },
            {
                id: 'm_p2_11',
                part: 2,
                type: 'mc',
                topic: 'Percentages',
                marks: 1,
                text: "A shirt is sold for $240 at a loss of 20%. Find the cost price of the shirt.",
                options: ['$192', '$288', '$300', '$400'],
                answer: '$300'
            },
            {
                id: 'm_p2_12',
                part: 2,
                type: 'mc',
                topic: 'Complex Numbers',
                marks: 1,
                text: "Simplify $(2 + 3i) + (1 - i)$, where $i^2 = -1$.",
                options: ['3 + 2i', '3 + 4i', '1 + 2i', '3 - 2i'],
                answer: '3 + 2i'
            },
            {
                id: 'm_p2_13',
                part: 2,
                type: 'mc',
                topic: 'Variations',
                marks: 1,
                text: "If $y$ varies directly as $x$ and $y=10$ when $x=2$, find $y$ when $x=5$.",
                options: ['4', '20', '25', '50'],
                answer: '25'
            },
            {
                id: 'm_p2_14',
                part: 2,
                type: 'mc',
                topic: 'Polynomials',
                marks: 1,
                text: "Find the remainder when $x^2 - 4x + 5$ is divided by $x - 1$.",
                options: ['0', '2', '5', '10'],
                answer: '2'
            }
        ]
    }
};
