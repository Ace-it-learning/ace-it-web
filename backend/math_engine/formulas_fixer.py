import json
import os

# Official Schema Keys:
# id, topic_id, subject, level, type, marks, question, question_zh, answer, correct_answer, solution_steps, solution_steps_zh

def fix_math_delimiters(s):
    # This is a bit tricky to automate fully without regex, but let's try to ensure $ wrapping
    # The user specifically mentioned Lens Formula steps having missing $
    # Also ensuring double backslashes for JSON. 
    # Python's json.dumps handles the transition from string to JSON.
    # So if the string has \frac, json.dumps produces \\frac.
    return s

def process_questions():
    input_file = 'formulas_questions.json'
    output_file = 'formulas_questions_final.json'
    
    with open(input_file, 'r', encoding='utf-8') as f:
        questions = json.load(f)
    
    final_questions = []
    
    # Mapping old levels to new integer levels
    level_map = {
        "Easy": 3,
        "Medium": 4,
        "DSE Standard": 5,
        "Elite": 7
    }
    
    # Mapping levels to marks
    mark_map = {
        3: 2,
        4: 3,
        5: 4,
        7: 4
    }

    for i, q in enumerate(questions):
        idx = i + 1
        q_id = f"formula_sub_{idx:02d}"
        
        # Fresh Concepts for Duplicates
        if idx == 16:
            # Replace Q16 (Duplicate of Q14) with: Make x the subject of y = (3x - 2) / (x + 5)
            q = {
                "difficulty": "DSE Standard",
                "question": "Make $x$ the subject of the formula $y = \\frac{3x - 2}{x + 5}$.",
                "question_zh": "將 $x$ 設為公式 $y = \\frac{3x - 2}{x + 5}$ 的主項。",
                "solution_steps": [
                    "Multiply both sides by $(x + 5)$:",
                    "$y(x + 5) = 3x - 2$",
                    "Expand the bracket:",
                    "$yx + 5y = 3x - 2$",
                    "Group $x$ terms on the left side:",
                    "$yx - 3x = -5y - 2$",
                    "Factor out $x$:",
                    "$x(y - 3) = -5y - 2$",
                    "Isolate $x$:",
                    "$x = \\frac{-5y - 2}{y - 3}$ or $x = \\frac{5y + 2}{3 - y}$"
                ],
                "solution_steps_zh": [
                    "等式兩邊同時乘以 $(x + 5)$：",
                    "$y(x + 5) = 3x - 2$",
                    "展開括號：",
                    "$yx + 5y = 3x - 2$",
                    "將含 $x$ 的項歸到左邊：",
                    "$yx - 3x = -5y - 2$",
                    "提取公因式 $x$：",
                    "$x(y - 3) = -5y - 2$",
                    "獨立出 $x$：",
                    "$x = \\frac{-5y - 2}{y - 3}$ 或 $x = \\frac{5y + 2}{3 - y}$"
                ],
                "final_answer": "x = \\frac{5y + 2}{3 - y}"
            }
        elif idx == 27:
            # Q27: Make u subject of v^2 = u^2 + 2as (Assume u > 0)
            q = {
                "difficulty": "Elite",
                "question": "Make $u$ the subject of the kinematics formula $v^2 = u^2 + 2as$ (Assume $u > 0$).",
                "question_zh": "將 $u$ 設為運動學公式 $v^2 = u^2 + 2as$ 的主項（假設 $u > 0$）。",
                "solution_steps": [
                    "Subtract $2as$ from both sides:",
                    "$v^2 - 2as = u^2$",
                    "Swap the sides:",
                    "$u^2 = v^2 - 2as$",
                    "Take the square root of both sides (Since $u > 0$):",
                    "$u = \\sqrt{v^2 - 2as}$"
                ],
                "solution_steps_zh": [
                    "等式兩邊同時減去 $2as$：",
                    "$v^2 - 2as = u^2$",
                    "左右對調：",
                    "$u^2 = v^2 - 2as$",
                    "兩邊同時取平方根（由於 $u > 0$）：",
                    "$u = \\sqrt{v^2 - 2as}$"
                ],
                "final_answer": "u = \\sqrt{v^2 - 2as}"
            }
        elif idx == 28:
            # Q28: Make h the subject of A = 2*pi*r^2 + 2*pi*r*h
            q = {
                "difficulty": "Elite",
                "question": "Make $h$ the subject of the cylinder surface area formula $A = 2\\pi r^2 + 2\\pi rh$.",
                "question_zh": "將 $h$ 設為圓柱體表面積公式 $A = 2\\pi r^2 + 2\\pi rh$ 的主項。",
                "solution_steps": [
                    "Subtract $2\\pi r^2$ from both sides:",
                    "$A - 2\\pi r^2 = 2\\pi rh$",
                    "Isolate the $h$ term by dividing both sides by $2\\pi r$:",
                    "$h = \\frac{A - 2\\pi r^2}{2\\pi r}$",
                    "Simplify the fraction (optional):",
                    "$h = \\frac{A}{2\\pi r} - r$"
                ],
                "solution_steps_zh": [
                    "等式兩邊同時減去 $2\\pi r^2$：",
                    "$A - 2\\pi r^2 = 2\\pi rh$",
                    "兩邊同時除以 $2\\pi r$ 以獨立出 $h$：",
                    "$h = \\frac{A - 2\\pi r^2}{2\\pi r}$",
                    "化簡分數（可選）：",
                    "$h = \\frac{A}{2\\pi r} - r$"
                ],
                "final_answer": "h = \\frac{A - 2\\pi r^2}{2\\pi r}"
            }
        elif idx == 30:
            # Q30: Make R_1 subject of 1/R = 1/R1 + 1/R2
            q = {
                "difficulty": "Elite",
                "question": "Make $R_1$ the subject of the parallel resistance formula $\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2}$.",
                "question_zh": "將 $R_1$ 設為並聯電阻公式 $\\frac{1}{R} = \\frac{1}{R_1} + \\frac{1}{R_2}$ 的主項。",
                "solution_steps": [
                    "Isolate the term with $R_1$:",
                    "$\\frac{1}{R_1} = \\frac{1}{R} - \\frac{1}{R_2}$",
                    "Combine the fractions on the right using a common denominator ($RR_2$):",
                    "$\\frac{1}{R_1} = \\frac{R_2 - R}{RR_2}$",
                    "Reciprocate both sides:",
                    "$R_1 = \\frac{RR_2}{R_2 - R}$"
                ],
                "solution_steps_zh": [
                    "獨立出含 $R_1$ 的項：",
                    "$\\frac{1}{R_1} = \\frac{1}{R} - \\frac{1}{R_2}$",
                    "使用通分（公分母為 $RR_2$）將右邊的分數合併：",
                    "$\\frac{1}{R_1} = \\frac{R_2 - R}{RR_2}$",
                    "將等式兩邊同時取倒數：",
                    "$R_1 = \\frac{RR_2}{R_2 - R}$"
                ],
                "final_answer": "R_1 = \\frac{RR_2}{R_2 - R}"
            }

        # Fix missing delimiters in Lens Formula (originally ~Q28-30, now Q29 after replacements)
        # We'll just generic fix any steps containing \frac or variables to ensure $ wrapping
        
        def wrap_math(steps):
            wrapped = []
            for s in enumerate(steps):
                # Basic heuristic: if it looks like math (has =, \, ^, or letters but no $), wrap it
                # But let's stay focused on what the user said: "broken tags in the Lens Formula"
                # and "Ensure EVERY equation and variable is properly wrapped"
                line = s[1]
                if "=" in line or "\\" in line or "^" in line:
                    if "$" not in line:
                        line = f"${line}$"
                    elif line.count("$") % 2 != 0:
                        # Fix broken tags (missing opening or closing $)
                        line = line.strip()
                        if line.endswith("$") and not line.startswith("$"):
                             line = f"${line}"
                        elif line.startswith("$") and not line.endswith("$"):
                             line = f"{line}$"
                
                wrapped.append(line)
            return wrapped

        level = level_map.get(q["difficulty"], 5)
        new_q = {
            "id": q_id,
            "topic_id": "math_alg_formula",
            "subject": "maths",
            "level": level,
            "type": "short_answer",
            "marks": mark_map.get(level, 4),
            "question": q["question"],
            "question_zh": q["question_zh"],
            "answer": q["final_answer"],
            "correct_answer": q["final_answer"],
            "solution_steps": wrap_math(q["solution_steps"]),
            "solution_steps_zh": wrap_math(q["solution_steps_zh"])
        }
        final_questions.append(new_q)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_questions, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    process_questions()
