import math
import random
import json

def get_pt(cx, cy, r, angle_deg):
    rad = math.radians(angle_deg)
    return f"{cx + r * math.cos(rad):.1f},{cy - r * math.sin(rad):.1f}"

def generate_30_circle_eq_seeds():
    seeds = []
    # Difficulty counts: 5 Easy, 5 Medium, 10 DSE Standard, 10 Elite
    
    # ================= LEVEL 3: EASY (5 Questions) =================
    # 1. Standard Form to C/R
    h, k, r = random.randint(-5, 5), random.randint(-5, 5), random.randint(2, 10)
    sign_h = "-" if h >= 0 else "+"
    sign_k = "-" if k >= 0 else "+"
    eq = f"(x {sign_h} {abs(h)})^2 + (y {sign_k} {abs(k)})^2 = {r**2}"
    seeds.append({
        "level": 3,
        "topic": "Standard Form to Center/Radius",
        "question": f"Find the center and radius of the circle with equation ${eq}$.",
        "answer": f"Center: ({h}, {k}), Radius: {r}",
        "steps": [
            f"Compare with the standard form $(x-h)^2 + (y-k)^2 = r^2$.",
            f"Center $(h, k) = ({h}, {k})$.",
            f"Radius $r = \\sqrt{{{r**2}}} = {r}$."
        ],
        "diagram_json": {
            "type": "coordinate",
            "x_range": [h-r-2, h+r+2],
            "y_range": [k-r-2, k+r+2],
            "circles": [{"center": [h, k], "radius": r, "color": "blue"}]
        }
    })

    # 2. C/R to Standard Form
    h, k, r = random.randint(-5, 5), random.randint(-5, 5), random.randint(2, 10)
    seeds.append({
        "level": 3,
        "topic": "Center/Radius to Standard Form",
        "question": f"Find the equation of a circle with center $({h}, {k})$ and radius {r} in standard form.",
        "answer": f"(x {'-' if h>=0 else '+'} {abs(h)})^2 + (y {'-' if k>=0 else '+'} {abs(k)})^2 = {r**2}",
        "steps": [
            f"The standard form is $(x-h)^2 + (y-k)^2 = r^2$.",
            f"Substitute $h={h}$, $k={k}$, and $r={r}$.",
            f"Equation: $(x {'-' if h>=0 else '+'} {abs(h)})^2 + (y {'-' if k>=0 else '+'} {abs(k)})^2 = {r**2}$."
        ]
    })

    # 3. Point on Circle?
    r = random.choice([5, 10, 13])
    # x^2 + y^2 = r^2
    px = random.randint(1, r-1)
    py = int(math.sqrt(r**2 - px**2))
    # Adjust to make it on, in, or out
    dist_sq = px**2 + py**2
    seeds.append({
        "level": 3,
        "topic": "Point and Circle",
        "question": f"Does the point $({px}, {py})$ lie on, inside, or outside the circle $x^2 + y^2 = {r**2}$?",
        "answer": "On the circle" if dist_sq == r**2 else ("Inside" if dist_sq < r**2 else "Outside"),
        "steps": [
            f"Substitute $x={px}$ and $y={py}$ into $x^2 + y^2$.",
            f"${px}^2 + {py}^2 = {dist_sq}$.",
            f"Since {dist_sq} {'=' if dist_sq == r**2 else ('<' if dist_sq < r**2 else '>')} {r**2}, the point lies {'on' if dist_sq == r**2 else ('inside' if dist_sq < r**2 else 'outside')} the circle."
        ]
    })

    # 4. Diameter Endpoints (Simple)
    x1, y1 = 0, 0
    x2, y2 = 6, 8
    seeds.append({
        "level": 3,
        "topic": "Diameter Endpoints",
        "question": f"Find the center of the circle where $A(0, 0)$ and $B(6, 8)$ are endpoints of a diameter.",
        "answer": "(3, 4)",
        "steps": [
            "The center is the midpoint of the diameter endpoints.",
            "Center $= (\\frac{0+6}{2}, \\frac{0+8}{2}) = (3, 4)$."
        ]
    })

    # 5. Radius from Equation (General Form Simple)
    # x^2 + y^2 - 4x - 6y + 4 = 0
    seeds.append({
        "level": 3,
        "topic": "General Form Radius",
        "question": "Find the radius of the circle $x^2 + y^2 - 4x - 6y + 4 = 0$.",
        "answer": "3",
        "steps": [
            "Identify $D=-4$ and $E=-6$ and $F=4$.",
            "Center $(h, k) = (-D/2, -E/2) = (2, 3)$.",
            "Radius $r = \\sqrt{h^2 + k^2 - F} = \\sqrt{2^2 + 3^2 - 4} = \\sqrt{9} = 3$."
        ]
    })

    # ================= LEVEL 4: MEDIUM (5 Questions) =================
    # 6. General Form to Center/Radius (coefficients not 1)
    # 2x^2 + 2y^2 - 8x + 12y - 6 = 0 => x^2 + y^2 - 4x + 6y - 3 = 0
    seeds.append({
        "level": 4,
        "topic": "General Form (Coefficients)",
        "question": "Find the center and radius of the circle $2x^2 + 2y^2 - 8x + 12y - 6 = 0$.",
        "answer": "Center: (2, -3), Radius: 4",
        "steps": [
            "Divide the entire equation by 2 to make the coefficients of $x^2$ and $y^2$ equal to 1.",
            "$x^2 + y^2 - 4x + 6y - 3 = 0$",
            "Center $(h, k) = (-(-4)/2, -(6)/2) = (2, -3)$.",
            "Radius $r = \\sqrt{2^2 + (-3)^2 - (-3)} = \\sqrt{4 + 9 + 3} = \\sqrt{16} = 4$."
        ]
    })

    # 7. Axes Intercepts
    # x^2 + y^2 - 6x - 8y + 9 = 0
    seeds.append({
        "level": 4,
        "topic": "Axes Intercepts",
        "question": "Find the x-intercepts of the circle $x^2 + y^2 - 6x - 8y + 9 = 0$.",
        "answer": "3",
        "steps": [
            "To find x-intercepts, set $y=0$.",
            "$x^2 + 0^2 - 6x - 8(0) + 9 = 0 \\Rightarrow x^2 - 6x + 9 = 0$.",
            "$(x - 3)^2 = 0 \\Rightarrow x = 3$.",
            "The circle touches the x-axis at $x=3$."
        ]
    })

    # 8. Circle Tangent to Y-axis
    h, k = 5, 3
    r = abs(h) # Tangent to y-axis => r = |h|
    seeds.append({
        "level": 4,
        "topic": "Tangency to Axes",
        "question": f"A circle with center $({h}, {k})$ is tangent to the y-axis. Find its equation in general form.",
        "answer": f"x^2 + y^2 - {2*h}x - {2*k}y + {k**2} = 0",
        "steps": [
            f"Since the circle is tangent to the y-axis, the radius $r$ is the absolute value of the x-coordinate of the center.",
            f"$r = |{h}| = {r}$.",
            f"Equation in standard form: $(x - {h})^2 + (y - {k})^2 = {r}^2$.",
            f"$x^2 - {2*h}x + {h**2} + y^2 - {2*k}y + {k**2} = {r**2}$.",
            f"General form: $x^2 + y^2 - {2*h}x - {2*k}y + {k**2} = 0$."
        ]
    })

    # 9. Find k for general form
    # x^2 + y^2 + 4x - 2y + k = 0 is a circle with radius 5. Find k.
    seeds.append({
        "level": 4,
        "topic": "Finding Unknowns",
        "question": "The equation $x^2 + y^2 + 4x - 2y + k = 0$ represents a circle with radius 5. Find the value of $k$.",
        "answer": "-20",
        "steps": [
            "Center $(h, k_{mid}) = (-2, 1)$.",
            "Radius formula: $r^2 = h^2 + k_{mid}^2 - F$.",
            "$5^2 = (-2)^2 + 1^2 - k$.",
            "$25 = 4 + 1 - k \\Rightarrow k = 5 - 25 = -20$."
        ]
    })

    # 10. Circle passing through Origin
    # Center (3, -4), passes through origin
    seeds.append({
        "level": 4,
        "topic": "Passing through Origin",
        "question": "Find the equation of the circle with center $(3, -4)$ that passes through the origin $(0, 0)$.",
        "answer": "x^2 + y^2 - 6x + 8y = 0",
        "steps": [
            "The radius is the distance from $(3, -4)$ to $(0, 0)$.",
            "$r^2 = (3-0)^2 + (-4-0)^2 = 9 + 16 = 25$.",
            "Standard form: $(x - 3)^2 + (y + 4)^2 = 25$.",
            "$x^2 - 6x + 9 + y^2 + 8y + 16 = 25$.",
            "$x^2 + y^2 - 6x + 8y = 0$."
        ]
    })

    # ================= LEVEL 5: DSE STANDARD (10 Questions) =================
    # 11. Diameter endpoints (General Form)
    seeds.append({
        "level": 5,
        "topic": "Diameter Endpoints (Comprehensive)",
        "question": "Points $A(-1, 2)$ and $B(5, 6)$ are the endpoints of a diameter of circle $C$. Find the equation of $C$ in general form.",
        "answer": "x^2 + y^2 - 4x - 8y + 7 = 0",
        "steps": [
            "Center $O = (\\frac{-1+5}{2}, \\frac{2+6}{2}) = (2, 4)$.",
            "Radius squared $r^2 = (5-2)^2 + (6-4)^2 = 3^2 + 2^2 = 9 + 4 = 13$.",
            "Standard form: $(x-2)^2 + (y-4)^2 = 13$.",
            "Expand: $x^2 - 4x + 4 + y^2 - 8y + 16 = 13$.",
            "General form: $x^2 + y^2 - 4x - 8y + 7 = 0$."
        ]
    })

    # 12. Tangent line distance method
    seeds.append({
        "level": 5,
        "topic": "Tangency to Line (Distance)",
        "question": "Show that the line $3x - 4y + 5 = 0$ is tangent to the circle $(x-1)^2 + (y+2)^2 = 4$.",
        "answer": "Yes, it is tangent.",
        "steps": [
            "The center of the circle is $(1, -2)$ and the radius $r = 2$.",
            "Calculate the perpendicular distance from $(1, -2)$ to the line $3x - 4y + 5 = 0$.",
            "$d = \\frac{|3(1) - 4(-2) + 5|}{\\sqrt{3^2 + (-4)^2}} = \\frac{|3 + 8 + 5|}{5} = \\frac{16}{5} = 3.2$.",
            "Wait, if $r=2$ and $d=3.2$, it is NOT tangent. Let's fix the numbers.",
            "Distance should be 2. $|3(1) - 4(-2) + k|/5 = 2 \\Rightarrow |11+k|=10 \\Rightarrow k=-1$.",
            "Let's use line $3x - 4y - 1 = 0$. $|3(1) - 4(-2) - 1|/5 = |11-1|/5 = 2$. Correct."
        ],
        "is_draft": True # Marker to fix content later
    })
    # Corrected version of 12
    seeds[-1] = {
        "level": 5,
        "topic": "Tangency to Line (Distance)",
        "question": "Find the constant $k$ such that the line $3x - 4y + k = 0$ is tangent to the circle $(x-1)^2 + (y+2)^2 = 4$ in the first quadrant.",
        "answer": "k = -1",
        "steps": [
            "Center $(1, -2)$, Radius $r = 2$.",
            "Distance from $(1, -2)$ to $3x - 4y + k = 0$ must be 2.",
            "$\\frac{|3(1) - 4(-2) + k|}{\\sqrt{3^2 + (-4)^2}} = 2$.",
            "$\\frac{|11 + k|}{5} = 2 \\Rightarrow |11 + k| = 10$.",
            "$11 + k = 10 \\Rightarrow k = -1$ or $11 + k = -10 \\Rightarrow k = -21$."
        ]
    }

    # 13. Two Intersections (Discriminant)
    seeds.append({
        "level": 5,
        "topic": "Number of Intersections",
        "question": "For what values of $k$ does the line $y = x + k$ intersect the circle $x^2 + y^2 = 8$ at two distinct points?",
        "answer": "-4 < k < 4",
        "steps": [
            "Substitute $y = x + k$ into the circle equation.",
            "$x^2 + (x + k)^2 = 8 \\Rightarrow x^2 + x^2 + 2kx + k^2 - 8 = 0$.",
            "$2x^2 + 2kx + (k^2 - 8) = 0$.",
            "For two distinct points, $\\Delta > 0$.",
            "$(2k)^2 - 4(2)(k^2 - 8) > 0$.",
            "$4k^2 - 8k^2 + 64 > 0 \\Rightarrow -4k^2 + 64 > 0$.",
            "$k^2 < 16 \\Rightarrow -4 < k < 4$."
        ]
    })

    # 14. Circle Tangent to both axes
    seeds.append({
        "level": 5,
        "topic": "Tangent to Both Axes",
        "question": "A circle in the first quadrant is tangent to both the x-axis and the y-axis, and its center lies on the line $x + y = 10$. Find its equation.",
        "answer": "(x - 5)^2 + (y - 5)^2 = 25",
        "steps": [
            "Since the circle is tangent to both axes in the first quadrant, its center is $(r, r)$ and its radius is $r$.",
            "Substitute $(r, r)$ into the line $x + y = 10$.",
            "$r + r = 10 \\Rightarrow 2r = 10 \\Rightarrow r = 5$.",
            "Equation: $(x - 5)^2 + (y - 5)^2 = 25$."
        ]
    })

    # 15. Tangent Equation at a Point
    seeds.append({
        "level": 5,
        "topic": "Tangent Equation",
        "question": "Find the equation of the tangent line to the circle $x^2 + y^2 = 25$ at the point $(3, 4)$.",
        "answer": "3x + 4y - 25 = 0",
        "steps": [
            "The slope of the radius from $(0, 0)$ to $(3, 4)$ is $m_r = \\frac{4-0}{3-0} = \\frac{4}{3}$.",
            "The tangent is perpendicular to the radius, so its slope is $m_t = -\\frac{3}{4}$.",
            "Equation: $y - 4 = -\\frac{3}{4}(x - 3)$.",
            "$4y - 16 = -3x + 9 \\Rightarrow 3x + 4y - 25 = 0$."
        ]
    })

    # 16. Midpoint of Chord
    seeds.append({
        "level": 5,
        "topic": "Midpoint of Chord",
        "question": "The line $y = x + 2$ intersects the circle $x^2 + y^2 = 10$ at points $A$ and $B$. Find the coordinates of the midpoint of $AB$.",
        "answer": "(-1, 1)",
        "steps": [
            "Substitute $y = x + 2$ into $x^2 + y^2 = 10$.",
            "$x^2 + (x + 2)^2 = 10 \\Rightarrow 2x^2 + 4x - 6 = 0 \\Rightarrow x^2 + 2x - 3 = 0$.",
            "$(x + 3)(x - 1) = 0 \\Rightarrow x_1 = -3, x_2 = 1$.",
            "Corresponding $y$ values: $y_1 = -1, y_2 = 3$.",
            "Midpoint $= (\\frac{-3+1}{2}, \\frac{-1+3}{2}) = (-1, 1)$."
        ]
    })

    # 17. Distance between Centers
    seeds.append({
        "level": 5,
        "topic": "Distance between Circles",
        "question": "Circle $C_1: x^2 + y^2 = 4$ and Circle $C_2: (x-6)^2 + (y-8)^2 = 9$. Find the shortest distance between the two circles.",
        "answer": "5",
        "steps": [
            "Centers: $O_1(0, 0)$, $O_2(6, 8)$. Radii: $r_1=2, r_2=3$.",
            "Distance between centers $d = \\sqrt{6^2 + 8^2} = 10$.",
            "Shortest distance between circles $= d - r_1 - r_2 = 10 - 2 - 3 = 5$."
        ]
    })

    # 18. Area of Circle from General Form
    seeds.append({
        "level": 5,
        "topic": "Area Calculation",
        "question": "Find the area of the circle $x^2 + y^2 + 4x - 10y + 13 = 0$ in terms of $\\pi$.",
        "answer": "16\\pi",
        "steps": [
            "Center $(h, k) = (-2, 5)$.",
            "Radius squared $r^2 = (-2)^2 + 5^2 - 13 = 4 + 25 - 13 = 16$.",
            "Area $= \\pi r^2 = 16\\pi$."
        ]
    })

    # 19. Circumference to Equation
    seeds.append({
        "level": 5,
        "topic": "Circumference to Equation",
        "question": "A circle centered at $(2, -3)$ has a circumference of $10\\pi$. Find its equation in general form.",
        "answer": "x^2 + y^2 - 4x + 6y - 12 = 0",
        "steps": [
            "Circumference $2\\pi r = 10\\pi \\Rightarrow r = 5$.",
            "Standard form: $(x - 2)^2 + (y + 3)^2 = 25$.",
            "Expand: $x^2 - 4x + 4 + y^2 + 6y + 9 = 25$.",
            "General form: $x^2 + y^2 - 4x + 6y - 12 = 0$."
        ]
    })

    # 20. Point outside circle (Distance range)
    seeds.append({
        "level": 5,
        "topic": "Point Location Range",
        "question": "Find the range of $k$ such that the point $(k, 2)$ lies outside the circle $x^2 + (y-1)^2 = 5$.",
        "answer": "k < -2 or k > 2",
        "steps": [
            "Substitute $(k, 2)$ into the circle inequality $(x)^2 + (y-1)^2 > 5$.",
            "$k^2 + (2-1)^2 > 5 \\Rightarrow k^2 + 1 > 5$.",
            "$k^2 > 4 \\Rightarrow k < -2$ or $k > 2$."
        ]
    })

    # ================= LEVEL 7: ELITE (10 Questions) =================
    # 21. Circle through 3 points (0,0), (4,0), (0,6) - Right Triangle
    seeds.append({
        "level": 7,
        "topic": "Circle through 3 Points",
        "question": "Find the equation of the circle passing through $(0, 0)$, $(4, 0)$, and $(0, 6)$.",
        "answer": "x^2 + y^2 - 4x - 6y = 0",
        "steps": [
            "General equation: $x^2 + y^2 + Dx + Ey + F = 0$.",
            "Through $(0,0) \\Rightarrow F = 0$.",
            "Through $(4,0) \\Rightarrow 16 + 0 + 4D + 0 = 0 \\Rightarrow D = -4$.",
            "Through $(0,6) \\Rightarrow 0 + 36 + 0 + 6E = 0 \\Rightarrow E = -6$.",
            "Equation: $x^2 + y^2 - 4x - 6y = 0$."
        ]
    })

    # 22. Radical Axis
    seeds.append({
        "level": 7,
        "topic": "Radical Axis",
        "question": "Find the equation of the radical axis (the line of intersection) of circles $C_1: x^2 + y^2 + 4x + 2y - 5 = 0$ and $C_2: x^2 + y^2 - 2x + 6y + 1 = 0$.",
        "answer": "6x - 4y - 6 = 0 (or 3x - 2y - 3 = 0)",
        "steps": [
            "Subtract the two equations: $(x^2 + y^2 + 4x + 2y - 5) - (x^2 + y^2 - 2x + 6y + 1) = 0$.",
            "$4x - (-2x) + 2y - 6y - 5 - 1 = 0$.",
            "$6x - 4y - 6 = 0$.",
            "Simplify to $3x - 2y - 3 = 0$."
        ]
    })

    # 23. Chord length calculation
    seeds.append({
        "level": 7,
        "topic": "Chord Length",
        "question": "Find the length of the chord intercepted by the circle $x^2 + y^2 = 25$ on the line $x + y = 1$.",
        "answer": "7\\sqrt{2}",
        "steps": [
            "Center $(0,0)$, $r=5$. Line $x+y-1=0$.",
            "Perpendicular distance from $(0,0)$ to line $d = \\frac{|0+0-1|}{\\sqrt{1^2+1^2}} = \\frac{1}{\\sqrt{2}}$.",
            "Half chord length $c = \\sqrt{r^2 - d^2} = \\sqrt{25 - 0.5} = \\sqrt{24.5}$.",
            "Total length $= 2 \\times \\sqrt{24.5} = 2 \\times \\sqrt{\\frac{49}{2}} = \\frac{14}{\\sqrt{2}} = 7\\sqrt{2}$."
        ]
    })

    # 24. Orthogonal Circles (Elite)
    # Circle 1: x^2 + y^2 = 13. Circle 2: (x-5)^2 + (y-0)^2 = 12.
    seeds.append({
        "level": 7,
        "topic": "Orthogonal Circles",
        "question": "Two circles are said to be orthogonal if the square of the distance between their centers is equal to the sum of the squares of their radii. Are $C_1: x^2 + y^2 = 13$ and $C_2: x^2 + y^2 - 10x + 13 = 0$ orthogonal?",
        "answer": "Yes",
        "steps": [
            "For $C_1$: $O_1(0,0), r_1^2 = 13$.",
            "For $C_2$: $O_2(5,0), r_2^2 = 5^2 - 13 = 12$.",
            "Distance squared between centers $d^2 = (5-0)^2 + (0-0)^2 = 25$.",
            "$r_1^2 + r_2^2 = 13 + 12 = 25$.",
            "Since $d^2 = r_1^2 + r_2^2$, the circles are orthogonal."
        ]
    })

    # 25. External Point Tangent Length
    seeds.append({
        "level": 7,
        "topic": "Tangent Length from Point",
        "question": "Find the length of the tangent from the point $(8, 6)$ to the circle $x^2 + y^2 - 4x - 6y + 4 = 0$.",
        "answer": "6",
        "steps": [
            "The squared length of the tangent from $(x_1, y_1)$ to $x^2 + y^2 + Dx + Ey + F = 0$ is $L^2 = x_1^2 + y_1^2 + Dx_1 + Ey_1 + F$.",
            "$L^2 = 8^2 + 6^2 - 4(8) - 6(6) + 4 = 64 + 36 - 32 - 36 + 4 = 36$.",
            "$L = \\sqrt{36} = 6$."
        ]
    })

    # 26. Circle tangent to line at specific point
    # Tangent to x-axis at (4,0) and passing through (0,2)
    seeds.append({
        "level": 7,
        "topic": "Geometric Construction",
        "question": "A circle is tangent to the x-axis at $(4, 0)$ and passes through the point $(0, 2)$. Find its equation.",
        "answer": "(x - 4)^2 + (y - 5)^2 = 25",
        "steps": [
            "Since it is tangent to the x-axis at $(4, 0)$, the center must be $(4, k)$ and the radius $r = |k|$.",
            "The distance from $(4, k)$ to $(0, 2)$ must be $r = |k|$.",
            "$(4-0)^2 + (k-2)^2 = k^2$.",
            "$16 + k^2 - 4k + 4 = k^2$.",
            "$20 - 4k = 0 \\Rightarrow k = 5$.",
            "Equation: $(x-4)^2 + (y-5)^2 = 25$."
        ]
    })

    # 27. Circle passing through 2 points with center on line
    seeds.append({
        "level": 7,
        "topic": "Center on Line",
        "question": "Find the equation of the circle passing through $(1, 2)$ and $(3, 4)$ with its center on the line $y = x + 1$.",
        "answer": "(x - 1)^2 + (y - 2)^2 = 0 is wrong. Midpoint (2,3). Perp bis slope -1. Bisector eq: y-3 = -1(x-2) => y = -x+5. Intersect x+1 = -x+5 => x=2, y=3. Center (2,3). r^2=2.",
        "is_draft": True
    })
    seeds[-1] = {
        "level": 7,
        "topic": "Center on Line",
        "question": "Find the equation of the circle passing through $(1, 2)$ and $(3, 4)$ with its center on the line $y = 2x$.",
        "answer": "(x - 1.4)^2 + (y - 2.8)^2 = 0.8",
        "steps": [
            "Let center be $(h, 2h)$.",
            "Distance to $(1,2)$ squared = Distance to $(3,4)$ squared.",
            "$(h-1)^2 + (2h-2)^2 = (h-3)^2 + (2h-4)^2$.",
            "$h^2 - 2h + 1 + 4h^2 - 8h + 4 = h^2 - 6h + 9 + 4h^2 - 16h + 16$.",
            "$-10h + 5 = -22h + 25 \\Rightarrow 12h = 20 \\Rightarrow h = 5/3$.",
            "Center $(5/3, 10/3)$, $r^2 = (5/3 - 1)^2 + (10/3 - 2)^2 = (2/3)^2 + (4/3)^2 = 20/9$."
        ]
    }

    # 28. Circle Intersection Condition (k range)
    seeds.append({
        "level": 7,
        "topic": "Contact of Two Circles",
        "question": "Find $k$ such that the circle $x^2 + y^2 = 1$ and $(x-k)^2 + y^2 = 9$ touch each other internally.",
        "answer": "k = 2 or k = -2",
        "steps": [
            "Centers: $O_1(0,0), O_2(k,0)$. Radii: $r_1=1, r_2=3$.",
            "For internal contact, distance between centers $d = |r_2 - r_1|$.",
            "$\\sqrt{(k-0)^2 + 0} = |3 - 1| = 2$.",
            "$|k| = 2 \\Rightarrow k = \\pm 2$."
        ]
    })

    # 29. Equation through 3 points (Generic Case)
    # (2, 3), (-1, 1), (2, -2)
    seeds.append({
        "level": 7,
        "topic": "3-Point Equation Solution",
        "question": "Find the equation of the circle passing through $P(2, 1)$, $Q(0, 5)$, and $R(-1, 2)$.",
        "answer": "x^2 + y^2 - 2x - 4y - 5 = 0",
        "steps": [
            "$(2,1) \\Rightarrow 4 + 1 + 2D + E + F = 0 \\Rightarrow 2D + E + F = -5$.",
            "$(0,5) \\Rightarrow 0 + 25 + 0 + 5E + F = 0 \\Rightarrow 5E + F = -25$.",
            "$(-1,2) \\Rightarrow 1 + 4 - D + 2E + F = 0 \\Rightarrow -D + 2E + F = -5$.",
            "Subtracting eq 1 and 3: $3D - E = 0 \\Rightarrow E = 3D$.",
            "Substitute into others to solve... E=-4, D=-2/3? No. Let's make it easy.",
            "Center (1, 2), Radius \\sqrt{10}. Through (1+3, 2-1) = (4,1). Through (1-3, 2+1) = (-2,3). Through (1-1, 2-3) = (0, -1).",
            "Equation: x^2 + y^2 - 2x - 4y - 5 = 0."
        ]
    })
    seeds[-1] = {
        "level": 7,
        "topic": "Circle through 3 Points (System)",
        "question": "Find the equation of the circle passing through $A(4, 1)$, $B(-2, 3)$, and $C(0, -1)$.",
        "answer": "x^2 + y^2 - 2x - 4y - 5 = 0",
        "steps": [
            "Assume $x^2 + y^2 + Dx + Ey + F = 0$.",
            "At $C(0, -1)$: $1 - E + F = 0 \\Rightarrow F = E - 1$.",
            "At $A(4, 1)$: $16 + 1 + 4D + E + F = 0 \\Rightarrow 4D + E + F = -17$.",
            "At $B(-2, 3)$: $4 + 9 - 2D + 3E + F = 0 \\Rightarrow -2D + 3E + F = -13$.",
            "Substitute $F = E - 1$ into eq A and B.",
            "4D + 2E = -16 \\Rightarrow 2D + E = -8$.",
            "-2D + 4E = -12 \\Rightarrow -D + 2E = -6$.",
            "Solve: $5E = -20 \\Rightarrow E = -4, D = -2, F = -5$.",
            "Equation: $x^2 + y^2 - 2x - 4y - 5 = 0$."
        ]
    }

    # 30. Radical Axis of 3 circles (Radical Center)
    seeds.append({
        "level": 7,
        "topic": "Radical Center",
        "question": "Find the coordinates of the radical center of the three circles: $x^2+y^2=1$, $x^2+y^2-8x+7=0$, and $x^2+y^2-10y+9=0$.",
        "answer": "(1, 1)",
        "steps": [
            "Radical axis of $C_1, C_2$: $(x^2+y^2-1) - (x^2+y^2-8x+7) = 0 \\Rightarrow 8x - 8 = 0 \\Rightarrow x = 1$.",
            "Radical axis of $C_1, C_3$: $(x^2+y^2-1) - (x^2+y^2-10y+9) = 0 \\Rightarrow 10y - 10 = 0 \\Rightarrow y = 1$.",
            "The intersection of these radical axes is the radical center: $(1, 1)$."
        ]
    })

    return seeds

# Usage
seeds = generate_30_circle_eq_seeds()
print(json.dumps(seeds, indent=2))
