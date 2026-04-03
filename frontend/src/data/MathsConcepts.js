const MathsConcepts = {
    // --- GEOMETRY ---
    'sine_rule_angles': {
        en: {
            title: "Sine Rule (Finding Angles)",
            time_estimate: "5 mins",
            difficulty: "Medium",
            concepts: [
                {
                    title: "The Formula",
                    content: "$$\\frac{\\sin A}{a} = \\frac{\\sin B}{b}$$",
                    type: "formula"
                },
                {
                    title: "When to use it?",
                    content: "Use the Sine Rule when you have a **matching pair** of an angle and its opposite side.",
                    type: "text",
                    icon: "target"
                },
                {
                    title: "Key Tip",
                    content: "Put the unknown angle on top of the fraction to make rearranging easier.",
                    type: "tip"
                }
            ],
            steps: [
                {
                    step: 1,
                    title: "Label the Triangle",
                    description: "Label the angles A, B, C and opposite sides a, b, c."
                },
                {
                    step: 2,
                    title: "Identify the Pair",
                    description: "Find the complete pair (angle and side) you know."
                },
                {
                    step: 3,
                    title: "Substitute & Solve",
                    description: "Plug values into the formula and solve for $\\sin \\theta$. Don't forget $\\sin^{-1}$ at the end!"
                }
            ],
            example: {
                question: "Find the value of $\\theta$ correct to 3 significant figures.",
                imageURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Sine_rule.svg/1200px-Sine_rule.svg.png", // Placeholder
                steps: [
                    "Label the known pair: Angle $80^\\circ$ opposite side 10cm.",
                    "Label the unknown pair: Angle $\\theta$ opposite side 7cm.",
                    "Set up the formula: $$\\frac{\\sin \\theta}{7} = \\frac{\\sin 80^\\circ}{10}$$",
                    "Rearrange: $$\\sin \\theta = \\frac{7 \\times \\sin 80^\\circ}{10}$$",
                    "Calculate: $$\\sin \\theta \\approx 0.68936...$$",
                    "Final Answer: $$\\theta = \\sin^{-1}(0.68936...) \\approx 43.6^\\circ$$"
                ]
            },
            pitfalls: [
                "Check your calculator is in **DEGREE** mode, not Radian mode.",
                "Remember the Ambiguous Case: $\\sin \\theta$ can have two solutions ($180^\\circ - \\theta$)."
            ]
        },
        zh: {
            title: "正弦定理 (求角度)",
            time_estimate: "5 分鐘",
            difficulty: "中等",
            concepts: [
                {
                    title: "公式",
                    content: "$$\\frac{\\sin A}{a} = \\frac{\\sin B}{b}$$",
                    type: "formula"
                },
                {
                    title: "何時使用?",
                    content: "當你有一組**已知對應**的角和邊 (Matching Pair) 時使用正弦定理。",
                    type: "text",
                    icon: "target"
                },
                {
                    title: "關鍵技巧",
                    content: "將未知角度放在分數上方 (分子)，以便更容易移項。",
                    type: "tip"
                }
            ],
            steps: [
                {
                    step: 1,
                    title: "標記三角形",
                    description: "將角標記為 A, B, C，對邊標記為 a, b, c。"
                },
                {
                    step: 2,
                    title: "識別配對",
                    description: "找出已知數值的一組完整配對 (角和對邊)。"
                },
                {
                    step: 3,
                    title: "代入並求解",
                    description: "將數值代入公式並求 $\\sin \\theta$。最後別忘了用 $\\sin^{-1}$！"
                }
            ],
            example: {
                question: "求 $\\theta$ 的值，準確至 3 位有效數字。",
                imageURL: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Sine_rule.svg/1200px-Sine_rule.svg.png",
                steps: [
                    "標記已知配對: 角 $80^\\circ$ 對邊 10cm。",
                    "標記未知配對: 角 $\\theta$ 對邊 7cm。",
                    "建立公式: $$\\frac{\\sin \\theta}{7} = \\frac{\\sin 80^\\circ}{10}$$",
                    "移項: $$\\sin \\theta = \\frac{7 \\times \\sin 80^\\circ}{10}$$",
                    "計算: $$\\sin \\theta \\approx 0.68936...$$",
                    "最終答案: $$\\theta = \\sin^{-1}(0.68936...) \\approx 43.6^\\circ$$"
                ]
            },
            pitfalls: [
                "檢查計數機是否處於 **DEGREE** (角度) 模式，而不是 Radian (弧度)。",
                "緊記模糊情況 (Ambiguous Case): $\\sin \\theta$ 可能有兩個解 ($180^\\circ - \\theta$)。"
            ]
        }
    },
    'math_geo_circle_eq': {
        en: {
            title: "Equation of Circle",
            time_estimate: "6 mins",
            difficulty: "Medium",
            concepts: [
                {
                    title: "Standard Form",
                    content: "$$(x - h)^2 + (y - k)^2 = r^2$$ Center: $(h, k)$, Radius: $r$",
                    type: "formula"
                },
                {
                    title: "General Form",
                    content: "$$x^2 + y^2 + Dx + Ey + F = 0$$",
                    type: "formula",
                    takeaway: "Center $= (\\frac{-D}{2}, \\frac{-E}{2})$. Radius $= \\sqrt{(\\frac{D}{2})^2 + (\\frac{E}{2})^2 - F}$. Requirement: $(\\frac{D}{2})^2 + (\\frac{E}{2})^2 - F > 0$.",
                    diagram: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="60" fill="none" stroke="#333" stroke-width="2"/><circle cx="100" cy="100" r="3" fill="#3B82F6"/><text x="75" y="90" font-family="sans-serif" font-size="12" fill="#3B82F6">(-D/2, -E/2)</text><line x1="100" y1="100" x2="160" y2="100" stroke="#9ca3af" stroke-dasharray="4,4"/><text x="125" y="95" font-family="sans-serif" font-size="12">r</text></svg>`
                },
                {
                    title: "Intersection (Circle & Line)",
                    content: "Substitute the line equation into the circle to form a quadratic. Use $\\Delta$ to finding the number of intersection points.",
                    type: "text",
                    diagram: `<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto;"><circle cx="100" cy="100" r="50" fill="none" stroke="#333" stroke-width="2"/><line x1="20" y1="70" x2="180" y2="70" stroke="#10B981" stroke-width="2"/><text x="125" y="65" font-family="sans-serif" font-size="12" fill="#10B981">Δ > 0</text><line x1="20" y1="150" x2="180" y2="150" stroke="#F59E0B" stroke-width="2"/><text x="125" y="145" font-family="sans-serif" font-size="12" fill="#F59E0B">Δ = 0</text><line x1="20" y1="180" x2="180" y2="180" stroke="#EF4444" stroke-width="2"/><text x="125" y="175" font-family="sans-serif" font-size="12" fill="#EF4444">Δ < 0</text></svg>`
                }
            ],
            steps: [
                {
                    step: 1,
                    title: "Identify Form",
                    description: "Determine if the equation is in Standard Form or General Form."
                },
                {
                    step: 2,
                    title: "Normalize",
                    description: "For General Form, ensure coefficients of $x^2$ and $y^2$ are 1."
                },
                {
                    step: 3,
                    title: "Extract Parameters",
                    description: "Calculate the center coordinates and radius length."
                }
            ],
            example: {
                question: "Find the center and radius of $x^2 + y^2 - 4x + 6y - 12 = 0$.",
                steps: [
                    "Identify $D = -4, E = 6, F = -12$.",
                    "Center $(h, k) = (\\frac{-D}{2}, \\frac{-E}{2}) = (2, -3)$.",
                    "Radius $r = \\sqrt{2^2 + (-3)^2 - (-12)} = \\sqrt{4 + 9 + 12} = \\sqrt{25} = 5$.",
                    "Final Answer: Center (2, -3), Radius 5"
                ]
            },
            pitfalls: [
                "Coefficient of $x^2$ and $y^2$ must be 1.",
                "Radius must be a positive number; if $h^2 + k^2 - F < 0$, it's not a real circle."
            ]
        },
        zh: {
            title: "圓方程",
            time_estimate: "6 分鐘",
            difficulty: "中等",
            concepts: [
                {
                    title: "標準式",
                    content: "$$(x - h)^2 + (y - k)^2 = r^2$$ 圓心: $(h, k)$, 半徑: $r$",
                    type: "formula"
                },
                {
                    title: "一般式",
                    content: "$$x^2 + y^2 + Dx + Ey + F = 0$$",
                    type: "formula",
                    takeaway: "圓心 $= (\\frac{-D}{2}, -\\frac{E}{2})$。半徑 $= \\sqrt{(\\frac{D}{2})^2 + (\\frac{E}{2})^2 - F}$。條件：$(\\frac{D}{2})^2 + (\\frac{E}{2})^2 - F > 0$。",
                    diagram: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="60" fill="none" stroke="#333" stroke-width="2"/><circle cx="100" cy="100" r="3" fill="#3B82F6"/><text x="75" y="90" font-family="sans-serif" font-size="12" fill="#3B82F6">(-D/2, -E/2)</text><line x1="100" y1="100" x2="160" y2="100" stroke="#9ca3af" stroke-dasharray="4,4"/><text x="125" y="95" font-family="sans-serif" font-size="12">r</text></svg>`
                },
                {
                    title: "相交 (圓與直線)",
                    content: "將直線方程代入圓方程中構成二次方程。利用判別式 $\\Delta$ 找出交點數量。",
                    type: "text",
                    diagram: `<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: auto;"><circle cx="100" cy="100" r="50" fill="none" stroke="#333" stroke-width="2"/><line x1="20" y1="70" x2="180" y2="70" stroke="#10B981" stroke-width="2"/><text x="125" y="65" font-family="sans-serif" font-size="12" fill="#10B981">Δ > 0</text><line x1="20" y1="150" x2="180" y2="150" stroke="#F59E0B" stroke-width="2"/><text x="125" y="145" font-family="sans-serif" font-size="12" fill="#F59E0B">Δ = 0</text><line x1="20" y1="180" x2="180" y2="180" stroke="#EF4444" stroke-width="2"/><text x="125" y="175" font-family="sans-serif" font-size="12" fill="#EF4444">Δ < 0</text></svg>`
                }
            ],
            steps: [
                {
                    step: 1,
                    title: "識別形式",
                    description: "確定方程是標準式還是一般式。"
                },
                {
                    step: 2,
                    title: "標準化",
                    description: "對於一般式，確保 $x^2$ 和 $y^2$ 的係數為 1。"
                },
                {
                    step: 3,
                    title: "提取參數",
                    description: "計算圓心坐標和半徑長度。"
                }
            ],
            example: {
                question: "求 $x^2 + y^2 - 4x + 6y - 12 = 0$ 的圓心和半徑。",
                steps: [
                    "識別 $D = -4, E = 6, F = -12$。",
                    "圓心 $(h, k) = (\\frac{-D}{2}, \\frac{-E}{2}) = (2, -3)$。",
                    "半徑 $r = \\sqrt{2^2 + (-3)^2 - (-12)} = \\sqrt{4 + 9 + 12} = \\sqrt{25} = 5$。",
                    "最終答案: 圓心 (2, -3), 半徑 5"
                ]
            },
            pitfalls: [
                "$x^2$ 和 $y^2$ 的係數必須為 1。",
                "半徑必須為正數；如果 $h^2 + k^2 - F < 0$，則該方程不代表一個實圓。"
            ]
        }
    },
    // --- STATISTICS ---
    'histograms': {
        en: {
            title: "Histograms & Frequency Polygons",
            time_estimate: "4 mins",
            difficulty: "Easy",
            concepts: [
                {
                    title: "Key Concept",
                    content: "Area of the bar represents frequency, not just height.",
                    type: "text"
                },
                {
                    title: "Class Boundaries",
                    content: "Bars must touch. Use boundaries (e.g., 0.5-5.5), not limits (1-5).",
                    type: "text"
                }
            ],
            steps: [
                { step: 1, title: "Find Boundaries", description: "Convert Class Limits (1-5) to Boundaries (0.5-5.5)." },
                { step: 2, title: "Draw Bars", description: "Width = Class Width. Height = Frequency." },
                { step: 3, title: "Frequency Polygon", description: "Join the mid-points of the tops of the bars." }
            ],
            example: {
                question: "Draw a histogram for the data: 1-5 (freq 3), 6-10 (freq 5).",
                steps: [
                    "Boundaries are 0.5-5.5 and 5.5-10.5.",
                    "Draw first bar from 0.5 to 5.5 with height 3.",
                    "Draw second bar from 5.5 to 10.5 with height 5.",
                    "Ensure bars touch at 5.5."
                ]
            },
            pitfalls: [
                "Don't leave gaps between bars!",
                "Polygon starts and ends at frequency 0 on the x-axis."
            ]
        },
        zh: {
            title: "組織圖與頻數多邊形",
            time_estimate: "4 分鐘",
            difficulty: "容易",
            concepts: [
                {
                    title: "核心概念",
                    content: "長條的面積代表頻數 (Frequency)，而不僅僅是高度。",
                    type: "text"
                },
                {
                    title: "組界 (Class Boundaries)",
                    content: "長條必須相連。使用組界 (如 0.5-5.5)，而非組限 (1-5)。",
                    type: "text"
                }
            ],
            steps: [
                { step: 1, title: "找出組界", description: "將組限 (1-5) 轉換為組界 (0.5-5.5)。" },
                { step: 2, title: "繪製長條", description: "寬度 = 組闊。高度 = 頻數。" },
                { step: 3, title: "頻數多邊形", description: "連接長條頂部的中點。" }
            ],
            example: {
                question: "為數據繪製組織圖: 1-5 (頻數 3), 6-10 (頻數 5)。",
                steps: [
                    "組界為 0.5-5.5 和 5.5-10.5。",
                    "繪製第一條長條：範圍 0.5 至 5.5，高度 3。",
                    "繪製第二條長條：範圍 5.5 至 10.5，高度 5。",
                    "確保長條在 5.5 處相連。"
                ]
            },
            pitfalls: [
                "長條之間不能有空隙！",
                "多邊形的起點和終點必須在 x 軸上 (頻數為 0)。"
            ]
        }
    }
};

export default MathsConcepts;
