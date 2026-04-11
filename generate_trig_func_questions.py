import json
import os

def generate_questions():
    questions = [
        # === LEVEL 3 (5 Questions) ===
        {
            "id": "trig_func_01",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 3,
            "type": "short_answer",
            "marks": 2,
            "question": r"In which quadrant does the angle $215^\circ$ lie? (Type '1', '2', '3', or '4')",
            "question_zh": r"角 $215^\circ$ 位於第幾象限？（輸入 '1', '2', '3' 或 '4'）",
            "answer": "3",
            "correct_answer": "3",
            "solution_steps": [
                r"1. $180^\circ < 215^\circ < 270^\circ$.",
                r"2. Therefore, it lies in Quadrant 3."
            ],
            "solution_steps_zh": [
                r"1. $180^\circ < 215^\circ < 270^\circ$。",
                r"2. 因此，它位於第三象限。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_02",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 3,
            "type": "short_answer",
            "marks": 2,
            "question": r"Find the maximum value of the function $f(x) = 4\sin x + 7$.",
            "question_zh": r"求函數 $f(x) = 4\sin x + 7$ 的最大值。",
            "answer": "11",
            "correct_answer": "11",
            "solution_steps": [
                r"1. The maximum value of $\sin x$ is 1.",
                r"2. Max $f(x) = 4(1) + 7 = 11$."
            ],
            "solution_steps_zh": [
                r"1. $\sin x$ 的最大值為 1。",
                r"2. 最大值 $f(x) = 4(1) + 7 = 11$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_03",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 3,
            "type": "short_answer",
            "marks": 2,
            "question": r"Find the minimum value of the function $g(\theta) = 3\cos\theta - 5$.",
            "question_zh": r"求函數 $g(\theta) = 3\cos\theta - 5$ 的最小值。",
            "answer": "-8",
            "correct_answer": "-8",
            "solution_steps": [
                r"1. The minimum value of $\cos\theta$ is -1.",
                r"2. Min $g(\theta) = 3(-1) - 5 = -8$."
            ],
            "solution_steps_zh": [
                r"1. $\cos\theta$ 的最小值為 -1。",
                r"2. 最小值 $g(\theta) = 3(-1) - 5 = -8$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_04",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 3,
            "type": "short_answer",
            "marks": 2,
            "question": r"Given that $\tan\theta < 0$ and $\cos\theta > 0$, in which quadrant does $\theta$ lie? (Type '1', '2', '3', or '4')",
            "question_zh": r"若 $\tan\theta < 0$ 且 $\cos\theta > 0$，則 $\theta$ 位於第幾象限？（輸入 '1', '2', '3' 或 '4'）",
            "answer": "4",
            "correct_answer": "4",
            "solution_steps": [
                r"1. Use ASTC rule.",
                r"2. $\cos\theta > 0$ in Quadrants 1 and 4.",
                r"3. $\tan\theta < 0$ in Quadrants 2 and 4.",
                r"4. The intersection is Quadrant 4."
            ],
            "solution_steps_zh": [
                r"1. 使用 ASTC 法則。",
                r"2. $\cos\theta > 0$ 於第一及第四象限。",
                r"3. $\tan\theta < 0$ 於第二及第四象限。",
                r"4. 交項為第四象限。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_05",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 3,
            "type": "short_answer",
            "marks": 2,
            "question": r"Evaluate $\sin(180^\circ + 30^\circ)$ without a calculator. (Give exact value)",
            "question_zh": r"在不使用計算器的情況下求 $\sin(180^\circ + 30^\circ)$ 的值。（給出準確值）",
            "answer": "-0.5",
            "correct_answer": "-0.5",
            "solution_steps": [
                r"1. $\sin(180^\circ + \theta) = -\sin\theta$.",
                r"2. $\sin(180^\circ + 30^\circ) = -\sin 30^\circ = -0.5$."
            ],
            "solution_steps_zh": [
                r"1. $\sin(180^\circ + \theta) = -\sin\theta$。",
                r"2. $\sin(180^\circ + 30^\circ) = -\sin 30^\circ = -0.5$。"
            ],
            "visual": None
        },

        # === LEVEL 4 (5 Questions) ===
        {
            "id": "trig_func_06",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 4,
            "type": "short_answer",
            "marks": 3,
            "question": r"Find the period of the function $y = \tan(3x)$.",
            "question_zh": r"求函數 $y = \tan(3x)$ 的週期。",
            "answer": "60",
            "correct_answer": "60",
            "solution_steps": [
                r"1. Period of $\tan(x)$ is $180^\circ$.",
                r"2. Period of $\tan(bx)$ is $180^\circ / b$.",
                r"3. Period $= 180^\circ / 3 = 60^\circ$."
            ],
            "solution_steps_zh": [
                r"1. $\tan(x)$ 的週期為 $180^\circ$。",
                r"2. $\tan(bx)$ 的週期為 $180^\circ / b$。",
                r"3. 週期 $= 180^\circ / 3 = 60^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_07",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 4,
            "type": "short_answer",
            "marks": 3,
            "question": r"Solve $\sqrt{2}\cos\theta = 1$ for $0^\circ \le \theta < 360^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $\sqrt{2}\cos\theta = 1$（$0^\circ \le \theta < 360^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "45, 315",
            "correct_answer": "45, 315",
            "solution_steps": [
                r"1. $\cos\theta = 1/\sqrt{2}$.",
                r"2. Reference angle $\theta_{ref} = 45^\circ$.",
                r"3. $\cos\theta$ is positive in Q1 and Q4.",
                r"4. Q1: $\theta = 45^\circ$; Q4: $\theta = 360^\circ - 45^\circ = 315^\circ$."
            ],
            "solution_steps_zh": [
                r"1. $\cos\theta = 1/\sqrt{2}$。",
                r"2. 參考角 $\theta_{ref} = 45^\circ$。",
                r"3. $\cos\theta$ 在第一及第四象限為正。",
                r"4. 第一象限：$\theta = 45^\circ$；第四象限：$\theta = 360^\circ - 45^\circ = 315^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_08",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 4,
            "type": "short_answer",
            "marks": 3,
            "question": r"Find the amplitude of the function $y = -5\cos(x/2) + 2$.",
            "question_zh": r"求函數 $y = -5\cos(x/2) + 2$ 的振幅。",
            "answer": "5",
            "correct_answer": "5",
            "solution_steps": [
                r"1. For $y = a\cos(bx) + c$, amplitude is $|a|$.",
                r"2. Amplitude $= |-5| = 5$."
            ],
            "solution_steps_zh": [
                r"1. 對於 $y = a\cos(bx) + c$，振幅為 $|a|$。",
                r"2. 振幅 $= |-5| = 5$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_09",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 4,
            "type": "short_answer",
            "marks": 3,
            "question": r"Solve $2\sin\theta + 1 = 0$ for $0^\circ \le \theta < 360^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $2\sin\theta + 1 = 0$（$0^\circ \le \theta < 360^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "210, 330",
            "correct_answer": "210, 330",
            "solution_steps": [
                r"1. $\sin\theta = -0.5$.",
                r"2. Reference angle $\theta_{ref} = 30^\circ$.",
                r"3. $\sin\theta$ is negative in Q3 and Q4.",
                r"4. Q3: $\theta = 180^\circ + 30^\circ = 210^\circ$; Q4: $\theta = 360^\circ - 30^\circ = 330^\circ$."
            ],
            "solution_steps_zh": [
                r"1. $\sin\theta = -0.5$。",
                r"2. 參考角 $\theta_{ref} = 30^\circ$。",
                r"3. $\sin\theta$ 在第三及第四象限為負。",
                r"4. 第三象限：$\theta = 180^\circ + 30^\circ = 210^\circ$；第四象限：$\theta = 360^\circ - 30^\circ = 330^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_10",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 4,
            "type": "short_answer",
            "marks": 3,
            "question": r"The graph of $y = 3\sin(x) - k$ has a minimum value of -5. Find the value of $k$.",
            "question_zh": r"函數 $y = 3\sin(x) - k$ 的最小值為 -5。求 $k$ 的值。",
            "answer": "2",
            "correct_answer": "2",
            "solution_steps": [
                r"1. Min value $= -3 - k$.",
                r"2. $-3 - k = -5$.",
                r"3. $k = 2$."
            ],
            "solution_steps_zh": [
                r"1. 最小值 $= -3 - k$。",
                r"2. $-3 - k = -5$。",
                r"3. $k = 2$。"
            ],
            "visual": None
        },

        # === LEVEL 5 (10 Questions) ===
        {
            "id": "trig_func_11",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": r"Find the period and maximum value of $y = 2\sin(4x) - 3$. (Format: Period, Max)",
            "question_zh": r"求 $y = 2\sin(4x) - 3$ 的週期及最大值。（格式：週期, 最大值）",
            "answer": "90, -1",
            "correct_answer": "90, -1",
            "solution_steps": [
                r"1. Period $= 360^\circ / 4 = 90^\circ$.",
                r"2. Max value $= 2(1) - 3 = -1$."
            ],
            "solution_steps_zh": [
                r"1. 週期 $= 360^\circ / 4 = 90^\circ$。",
                r"2. 最大值 $= 2(1) - 3 = -1$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_12",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": r"Solve $\sin^2\theta - \sin\theta = 0$ for $0^\circ \le \theta < 360^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $\sin^2\theta - \sin\theta = 0$（$0^\circ \le \theta < 360^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "0, 90, 180",
            "correct_answer": "0, 90, 180",
            "solution_steps": [
                r"1. Factor: $\sin\theta(\sin\theta - 1) = 0$.",
                r"2. $\sin\theta = 0$ or $\sin\theta = 1$.",
                r"3. From $\sin\theta = 0$, $\theta = 0^\circ, 180^\circ$.",
                r"4. From $\sin\theta = 1$, $\theta = 90^\circ$.",
                r"5. Roots: $0^\circ, 90^\circ, 180^\circ$."
            ],
            "solution_steps_zh": [
                r"1. 因式分解：$\sin\theta(\sin\theta - 1) = 0$。",
                r"2. $\sin\theta = 0$ 或 $1$。",
                r"3. 若 $\sin\theta = 0$，$\theta = 0^\circ, 180^\circ$。",
                r"4. 若 $\sin\theta = 1$，$\theta = 90^\circ$。",
                r"5. 根：$0^\circ, 90^\circ, 180^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_13",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": r"Solve $4\cos^2\theta = 3$ for $0^\circ \le \theta < 360^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $4\cos^2\theta = 3$（$0^\circ \le \theta < 360^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "30, 150, 210, 330",
            "correct_answer": "30, 150, 210, 330",
            "solution_steps": [
                r"1. $\cos^2\theta = 0.75 \implies \cos\theta = \pm\sqrt{3}/2$.",
                r"2. Reference angle $\theta_{ref} = 30^\circ$.",
                r"3. $\cos\theta = \sqrt{3}/2 \implies \theta = 30^\circ, 330^\circ$.",
                r"4. $\cos\theta = -\sqrt{3}/2 \implies \theta = 150^\circ, 210^\circ$."
            ],
            "solution_steps_zh": [
                r"1. $\cos^2\theta = 0.75 \implies \cos\theta = \pm\sqrt{3}/2$。",
                r"2. 參考角 $\theta_{ref} = 30^\circ$。",
                r"3. $\cos\theta = \sqrt{3}/2 \implies \theta = 30^\circ, 330^\circ$。",
                r"4. $\cos\theta = -\sqrt{3}/2 \implies \theta = 150^\circ, 210^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_14",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": r"Solve $\tan\theta = 3\sin\theta$ for $0^\circ \le \theta < 360^\circ$ and $\theta \neq 90^\circ, 270^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $\tan\theta = 3\sin\theta$（$0^\circ \le \theta < 360^\circ$ 且 $\theta \neq 90^\circ, 270^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "0, 70.5, 180, 289.5",
            "correct_answer": "0, 70.5, 180, 289.5",
            "solution_steps": [
                r"1. $\sin\theta/\cos\theta = 3\sin\theta$.",
                r"2. $\sin\theta(1/\cos\theta - 3) = 0$.",
                r"3. $\sin\theta = 0 \implies \theta = 0^\circ, 180^\circ$.",
                r"4. $\cos\theta = 1/3 \implies \theta \approx 70.5^\circ, 360 - 70.5 = 289.5^\circ$."
            ],
            "solution_steps_zh": [
                r"1. $\sin\theta/\cos\theta = 3\sin\theta$。",
                r"2. $\sin\theta(1/\cos\theta - 3) = 0$。",
                r"3. 若 $\sin\theta = 0$，則 $\theta = 0^\circ, 180^\circ$。",
                r"4. 若 $\cos\theta = 1/3$，則 $\theta \approx 70.5^\circ, 289.5^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_15",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": r"Find the range of the function $y = 3\cos(2x + 60^\circ) - 1$. (Format: min, max)",
            "question_zh": r"求函數 $y = 3\cos(2x + 60^\circ) - 1$ 的值域。（格式：最小值, 最大值）",
            "answer": "-4, 2",
            "correct_answer": "-4, 2",
            "solution_steps": [
                r"1. Min value: $3(-1) - 1 = -4$.",
                r"2. Max value: $3(1) - 1 = 2$."
            ],
            "solution_steps_zh": [
                r"1. 最小值：$3(-1) - 1 = -4$。",
                r"2. 最大值：$3(1) - 1 = 2$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_16",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": r"Solve $\tan^2\theta = 3$ for $0^\circ \le \theta < 360^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $\tan^2\theta = 3$（$0^\circ \le \theta < 360^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "60, 120, 240, 300",
            "correct_answer": "60, 120, 240, 300",
            "solution_steps": [
                r"1. $\tan\theta = \pm\sqrt{3}$.",
                r"2. Reference angle $\theta_{ref} = 60^\circ$.",
                r"3. Positive in Q1, Q3: $60^\circ, 240^\circ$.",
                r"4. Negative in Q2, Q4: $120^\circ, 300^\circ$."
            ],
            "solution_steps_zh": [
                r"1. $\tan\theta = \pm\sqrt{3}$。",
                r"2. 參考角 $\theta_{ref} = 60^\circ$。",
                r"3. 第一、三象限：$60^\circ, 240^\circ$。",
                r"4. 第二、四象限：$120^\circ, 300^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_17",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 5,
            "question": r"Solve $2\sin^2\theta - 3\sin\theta + 1 = 0$ for $0^\circ \le \theta < 360^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $2\sin^2\theta - 3\sin\theta + 1 = 0$（$0^\circ \le \theta < 360^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "30, 90, 150",
            "correct_answer": "30, 90, 150",
            "solution_steps": [
                r"1. Let $u = \sin\theta$: $2u^2 - 3u + 1 = 0$.",
                r"2. $(2u - 1)(u - 1) = 0 \implies \sin\theta = 0.5$ or $\sin\theta = 1$.",
                r"3. $\sin\theta = 0.5 \implies \theta = 30^\circ, 150^\circ$.",
                r"4. $\sin\theta = 1 \implies \theta = 90^\circ$."
            ],
            "solution_steps_zh": [
                r"1. 設 $u = \sin\theta$：$2u^2 - 3u + 1 = 0$。",
                r"2. $(2u - 1)(u - 1) = 0 \implies \sin\theta = 0.5$ 或 $1$。",
                r"3. 若 $\sin\theta = 0.5$，$\theta = 30^\circ, 150^\circ$。",
                r"4. 若 $\sin\theta = 1$，$\theta = 90^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_18",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": r"Find the period of the function $y = |\sin(x)|$.",
            "question_zh": r"求函數 $y = |\sin(x)|$ 的週期。",
            "answer": "180",
            "correct_answer": "180",
            "solution_steps": [
                r"1. The graph of $\sin x$ repeats every $360^\circ$.",
                r"2. Taking the absolute value reflect the negative parts to the positive side.",
                r"3. The pattern now repeats every $180^\circ$."
            ],
            "solution_steps_zh": [
                r"1. $\sin x$ 的圖像每 $360^\circ$ 重複一次。",
                r"2. 取絕對值後，負值部分向上反射。",
                r"3. 現在圖案每 $180^\circ$ 重複一次。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_19",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": r"Solve $2\cos(3x) = 1$ for $0^\circ \le x \le 120^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $2\cos(3x) = 1$（$0^\circ \le x \le 120^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "20, 100",
            "correct_answer": "20, 100",
            "solution_steps": [
                r"1. Let $u = 3x$. Range for $u$ is $0^\circ \le u \le 360^\circ$.",
                r"2. $\cos(u) = 1/2 \implies u = 60^\circ$ or $300^\circ$.",
                r"3. $3x = 60^\circ \implies x = 20^\circ$.",
                r"4. $3x = 300^\circ \implies x = 100^\circ$."
            ],
            "solution_steps_zh": [
                r"1. 設 $u = 3x$。範圍為 $0^\circ \le u \le 360^\circ$。",
                r"2. $\cos(u) = 1/2 \implies u = 60^\circ$ 或 $300^\circ$。",
                r"3. $3x = 60^\circ \implies x = 20^\circ$。",
                r"4. $3x = 300^\circ \implies x = 100^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_20",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 4,
            "question": r"Determine the value of $b$ if the period of $y = 3\cos(bx)$ is $144^\circ$.",
            "question_zh": r"若 $y = 3\cos(bx)$ 的週期為 $144^\circ$，求 $b$ 的值。",
            "answer": "2.5",
            "correct_answer": "2.5",
            "solution_steps": [
                r"1. Period $= 360^\circ / b$.",
                r"2. $360 / b = 144$.",
                r"3. $b = 360 / 144 = 2.5$."
            ],
            "solution_steps_zh": [
                r"1. 週期 $= 360^\circ / b$。",
                r"2. $360 / b = 144$。",
                r"3. $b = 360 / 144 = 2.5$。"
            ],
            "visual": None
        },

        # === LEVEL 7 (10 Questions) ===
        {
            "id": "trig_func_21",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 6,
            "question": r"Solve $2\sin^2\theta + 5\cos\theta - 4 = 0$ for $0^\circ \le \theta < 360^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $2\sin^2\theta + 5\cos\theta - 4 = 0$（$0^\circ \le \theta < 360^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "60, 300",
            "correct_answer": "60, 300",
            "solution_steps": [
                r"1. Use $\sin^2\theta = 1 - \cos^2\theta$.",
                r"2. $2(1 - \cos^2\theta) + 5\cos\theta - 4 = 0$.",
                r"3. $2 - 2\cos^2\theta + 5\cos\theta - 4 = 0 \implies 2\cos^2\theta - 5\cos\theta + 2 = 0$.",
                r"4. $(2\cos\theta - 1)(\cos\theta - 2) = 0$.",
                r"5. $\cos\theta = 0.5 \implies \theta = 60^\circ, 300^\circ$.",
                r"6. $\cos\theta = 2$ (No solution)."
            ],
            "solution_steps_zh": [
                r"1. 使用 $\sin^2\theta = 1 - \cos^2\theta$。",
                r"2. $2(1 - \cos^2\theta) + 5\cos\theta - 4 = 0$。",
                r"3. 化簡得 $2\cos^2\theta - 5\cos\theta + 2 = 0$。",
                r"4. 因式分解：$(2\cos\theta - 1)(\cos\theta - 2) = 0$。",
                r"5. $\cos\theta = 0.5 \implies \theta = 60^\circ, 300^\circ$。",
                r"6. $\cos\theta = 2$（無解）。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_22",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 6,
            "question": r"Solve $2\cos^2\theta - \sin\theta - 1 = 0$ for $0^\circ \le \theta < 360^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $2\cos^2\theta - \sin\theta - 1 = 0$（$0^\circ \le \theta < 360^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "30, 150, 270",
            "correct_answer": "30, 150, 270",
            "solution_steps": [
                r"1. Use $\cos^2\theta = 1 - \sin^2\theta$.",
                r"2. $2(1 - \sin^2\theta) - \sin\theta - 1 = 0 \implies 2\sin^2\theta + \sin\theta - 1 = 0$.",
                r"3. $(2\sin\theta - 1)(\sin\theta + 1) = 0$.",
                r"4. $\sin\theta = 0.5 \implies \theta = 30^\circ, 150^\circ$.",
                r"5. $\sin\theta = -1 \implies \theta = 270^\circ$."
            ],
            "solution_steps_zh": [
                r"1. 使用 $\cos^2\theta = 1 - \sin^2\theta$。",
                r"2. $2(1 - \sin^2\theta) - \sin\theta - 1 = 0$。",
                r"3. 化簡得 $2\sin^2\theta + \sin\theta - 1 = 0$。",
                r"4. $(2\sin\theta - 1)(\sin\theta + 1) = 0$。",
                r"5. $\sin\theta = 0.5 \implies \theta = 30^\circ, 150^\circ$；$\sin\theta = -1 \implies \theta = 270^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_23",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 6,
            "question": r"Find the minimum value of the function $y = \frac{10}{3 - \cos x}$ for any real $x$.",
            "question_zh": r"求函數 $y = \frac{10}{3 - \cos x}$ 對於任何實數 $x$ 的最小值。",
            "answer": "2.5",
            "correct_answer": "2.5",
            "solution_steps": [
                r"1. To minimize $y$, maximize the denominator $3 - \cos x$.",
                r"2. $3 - \cos x$ is maximized when $\cos x = -1$.",
                r"3. Max denominator $= 3 - (-1) = 4$.",
                r"4. Min $y = 10 / 4 = 2.5$."
            ],
            "solution_steps_zh": [
                r"1. 要使 $y$ 最小，需使分母 $3 - \cos x$ 最大。",
                r"2. 當 $\cos x = -1$ 時，$3 - \cos x$ 最大。",
                r"3. 最大分母 $= 4$。",
                r"4. 最小 $y = 10 / 4 = 2.5$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_24",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 6,
            "question": r"Find the maximum value of the function $y = \frac{6}{\sin^2 x + 2}$.",
            "question_zh": r"求函數 $y = \frac{6}{\sin^2 x + 2}$ 的最大值。",
            "answer": "3",
            "correct_answer": "3",
            "solution_steps": [
                r"1. To maximize $y$, minimize the denominator $\sin^2 x + 2$.",
                r"2. The minimum value of $\sin^2 x$ is 0.",
                r"3. Min denominator $= 0 + 2 = 2$.",
                r"4. Max $y = 6 / 2 = 3$."
            ],
            "solution_steps_zh": [
                r"1. 要使 $y$ 最大，需使分母 $\sin^2 x + 2$ 最小。",
                r"2. $\sin^2 x$ 的最小值為 0。",
                r"3. 最小分母 $= 2$。",
                r"4. 最大 $y = 6 / 2 = 3$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_25",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 6,
            "question": r"Solve $3\sin\theta = 2\cos^2\theta$ for $0^\circ \le \theta < 360^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $3\sin\theta = 2\cos^2\theta$（$0^\circ \le \theta < 360^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "30, 150",
            "correct_answer": "30, 150",
            "solution_steps": [
                r"1. $3\sin\theta = 2(1 - \sin^2\theta)$.",
                r"2. $2\sin^2\theta + 3\sin\theta - 2 = 0$.",
                r"3. $(2\sin\theta - 1)(\sin\theta + 2) = 0$.",
                r"4. $\sin\theta = 0.5 \implies \theta = 30^\circ, 150^\circ$.",
                r"5. $\sin\theta = -2$ (No solution)."
            ],
            "solution_steps_zh": [
                r"1. $3\sin\theta = 2(1 - \sin^2\theta) \implies 2\sin^2\theta + 3\sin\theta - 2 = 0$。",
                r"2. $(2\sin\theta - 1)(\sin\theta + 2) = 0$。",
                r"3. $\sin\theta = 0.5 \implies \theta = 30^\circ, 150^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_26",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 5,
            "question": r"Find the maximum value of $f(x) = |4\cos(x) - 3|$.",
            "question_zh": r"求 $f(x) = |4\cos(x) - 3|$ 的最大值。",
            "answer": "7",
            "correct_answer": "7",
            "solution_steps": [
                r"1. $4\cos(x)$ ranges from -4 to 4.",
                r"2. $4\cos(x) - 3$ ranges from -7 to 1.",
                r"3. $|4\cos(x) - 3|$ ranges from 0 to 7.",
                r"4. Max value is 7."
            ],
            "solution_steps_zh": [
                r"1. $4\cos(x)$ 範圍為 -4 至 4。",
                r"2. $4\cos(x) - 3$ 範圍為 -7 至 1。",
                r"3. $|4\cos(x) - 3|$ 範圍為 0 至 7。",
                r"4. 最大值為 7。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_27",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 6,
            "question": r"Solve $\tan\theta + 1 / \tan\theta = 2$ for $0^\circ < \theta < 180^\circ$.",
            "question_zh": r"解方程 $\tan\theta + 1 / \tan\theta = 2$（$0^\circ < \theta < 180^\circ$）。",
            "answer": "45",
            "correct_answer": "45",
            "solution_steps": [
                r"1. Let $t = \tan\theta$. $t + 1/t = 2 \implies t^2 - 2t + 1 = 0$.",
                r"2. $(t - 1)^2 = 0 \implies \tan\theta = 1$.",
                r"3. $\theta = 45^\circ$."
            ],
            "solution_steps_zh": [
                r"1. 設 $t = \tan\theta$ 得 $t^2 - 2t + 1 = 0$。",
                r"2. $(t - 1)^2 = 0 \implies \tan\theta = 1$。",
                r"3. $\theta = 45^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_28",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 6,
            "question": r"What is the number of real roots for $\sin^2 x - 1.5\sin x + 0.5 = 0$ in $0^\circ \le x < 360^\circ$?",
            "question_zh": r"方程 $\sin^2 x - 1.5\sin x + 0.5 = 0$ 在 $0^\circ \le x < 360^\circ$ 共有多少個實根？",
            "answer": "3",
            "correct_answer": "3",
            "solution_steps": [
                r"1. $2\sin^2 x - 3\sin x + 1 = 0$.",
                r"2. $(2\sin x - 1)(\sin x - 1) = 0$.",
                r"3. $\sin x = 0.5 \implies x = 30^\circ, 150^\circ$.",
                r"4. $\sin x = 1 \implies x = 90^\circ$.",
                r"5. Total roots = 3."
            ],
            "solution_steps_zh": [
                r"1. 方程可化為 $(2\sin x - 1)(\sin x - 1) = 0$。",
                r"2. $\sin x = 0.5$ 有 2 個根（$30^\circ, 150^\circ$）。",
                r"3. $\sin x = 1$ 有 1 個根（$90^\circ$）。",
                r"4. 總根數為 3。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_29",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 6,
            "question": r"Solve $\cos^2\theta - \sin^2\theta = 0$ for $0^\circ \le \theta < 180^\circ$. (Separate by comma, smallest first)",
            "question_zh": r"解方程 $\cos^2\theta - \sin^2\theta = 0$（$0^\circ \le \theta < 180^\circ$）。（以逗號分隔，由小到大排列）",
            "answer": "45, 135",
            "correct_answer": "45, 135",
            "solution_steps": [
                r"1. $\cos^2\theta = \sin^2\theta \implies \tan^2\theta = 1$.",
                r"2. $\tan\theta = 1$ or $\tan\theta = -1$.",
                r"3. For $0^\circ \le \theta < 180^\circ$, $\theta = 45^\circ$ or $135^\circ$."
            ],
            "solution_steps_zh": [
                r"1. $\cos^2\theta = \sin^2\theta \implies \tan^2\theta = 1$。",
                r"2. $\tan\theta = 1$ 或 $-1$。",
                r"3. 在 $0^\circ \le \theta < 180^\circ$ 範圍內，$\theta = 45^\circ$ 或 $135^\circ$。"
            ],
            "visual": None
        },
        {
            "id": "trig_func_30",
            "topic_id": "math_geo_trig_func",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 6,
            "question": r"Find the maximum value of $y = 4 - 3\sin^2(5x)$.",
            "question_zh": r"求 $y = 4 - 3\sin^2(5x)$ 的最大值。",
            "answer": "4",
            "correct_answer": "4",
            "solution_steps": [
                r"1. The minimum value of $\sin^2(5x)$ is 0.",
                r"2. Maximum value of $y = 4 - 3(0) = 4$."
            ],
            "solution_steps_zh": [
                r"1. $\sin^2(5x)$ 的最小值為 0。",
                r"2. 最大值為 $4 - 3(0) = 4$。"
            ],
            "visual": None
        }
    ]


    # Save to file
    output_path = os.path.join("backend", "data", "math_content", "math_geo_trig_func_questions.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"Successfully generated 30 questions at {output_path}")

if __name__ == "__main__":
    generate_questions()
