import random
import json
import sys

def generate_ratio_proportion_questions():
    questions = []
    
    # helper for GCD
    def gcd(a, b):
        while b:
            a, b = b, a % b
        return a

    # helper for LCM
    def lcm(a, b):
        if a == 0 or b == 0: return 0
        return abs(a * b) // gcd(a, b)

    def simplify_ratio(a, b, c=None):
        if c is None:
            common = gcd(a, b)
            return a // common, b // common
        else:
            common = gcd(a, gcd(b, c))
            return a // common, b // common, c // common

    # Level 3: Basic & Combined Ratios (Q1-Q8)
    for i in range(1, 9):
        q_type = random.choice(['combine', 'evaluate'])
        if q_type == 'combine':
            # a:b and b:c find a:b:c
            a_val = random.randint(2, 5)
            b1_val = random.randint(2, 5)
            while gcd(a_val, b1_val) != 1: a_val = random.randint(2, 5)
            
            b2_val = random.randint(2, 5)
            c_val = random.randint(2, 7)
            while gcd(b2_val, c_val) != 1: b2_val = random.randint(2, 5)
            
            # common b should be different in the two ratios to make it interesting
            if b1_val == b2_val: b2_val += 1
            
            # Link via LCM of b
            L = lcm(b1_val, b2_val)
            final_a = a_val * (L // b1_val)
            final_b = L
            final_c = c_val * (L // b2_val)
            
            questions.append({
                "id": f"math_num_ratio_{i:02d}",
                "topic_id": "math_num_ratio",
                "subject": "maths",
                "level": 3,
                "type": "short_answer",
                "marks": 2,
                "question": f"Given that $a:b = {a_val}:{b1_val}$ and $b:c = {b2_val}:{c_val}$. Find $a:b:c$.",
                "question_zh": f"已知 $a:b = {a_val}:{b1_val}$ 及 $b:c = {b2_val}:{c_val}$。求 $a:b:c$。",
                "answer": f"${final_a}:{final_b}:{final_c}$",
                "correct_answer": f"${final_a}:{final_b}:{final_c}$",
                "solution_steps": [
                    f"To combine the ratios, find the LCM of the shared variable $b$.",
                    f"LCM of ${b1_val}$ and ${b2_val}$ is ${L}$.",
                    f"Scale the first ratio: $a:b = {a_val} \\\\times {L // b1_val} : {b1_val} \\\\times {L // b1_val} = {final_a}:{L}$.",
                    f"Scale the second ratio: $b:c = {b2_val} \\\\times {L // b2_val} : {c_val} \\\\times {L // b2_val} = {L}:{final_c}$.",
                    f"Thus, $a:b:c = {final_a}:{L}:{final_c}$."
                ],
                "solution_steps_zh": [
                    f"要合併比例，先求共同項 $b$ 的最小公倍數 (LCM)。",
                    f"${b1_val}$ 和 ${b2_val}$ 的最小公倍數是 ${L}$。",
                    f"縮放第一個比：$a:b = {a_val} \\\\times {L // b1_val} : {b1_val} \\\\times {L // b1_val} = {final_a}:{L}$。",
                    f"縮放第二個比：$b:c = {b2_val} \\\\times {L // b2_val} : {c_val} \\\\times {L // b2_val} = {L}:{final_c}$。",
                    f"因此，$a:b:c = {final_a}:{L}:{final_c}$。"
                ]
            })
        else:
            # x:y = a:b, find (mx + ny) / (px + qy)
            x_ratio = random.randint(1, 3)
            y_ratio = random.randint(2, 5)
            while gcd(x_ratio, y_ratio) != 1: y_ratio += 1
            
            m, n = random.randint(2, 5), random.randint(1, 4)
            p, q_val = random.randint(1, 3), random.randint(1, 3)
            
            num = m * x_ratio + n * y_ratio
            den = p * x_ratio - q_val * y_ratio
            if den == 0: den = 1
            
            # simplify fraction
            if den < 0:
                num, den = -num, -den
            
            common = gcd(abs(num), abs(den))
            final_num, final_den = num // common, den // common
            
            ans_str = f"\\\\frac{{{final_num}}}{{{final_den}}}" if final_den != 1 else f"{final_num}"
            
            questions.append({
                "id": f"math_num_ratio_{i:02d}",
                "topic_id": "math_num_ratio",
                "subject": "maths",
                "level": 3,
                "type": "short_answer",
                "marks": 3,
                "question": f"If $x:y = {x_ratio}:{y_ratio}$, find the value of $\\\\frac{{{m}x + {n}y}}{{{p}x - {q_val}y}}$.",
                "question_zh": f"若 $x:y = {x_ratio}:{y_ratio}$，求 $\\\\frac{{{m}x + {n}y}}{{{p}x - {q_val}y}}$ 的值。",
                "answer": f"${ans_str}$",
                "correct_answer": f"${ans_str}$",
                "solution_steps": [
                    f"Let $x = {x_ratio}k$ and $y = {y_ratio}k$, where $k \\\\neq 0$.",
                    f"Substitute into the expression: $\\\\frac{{{m}({x_ratio}k) + {n}({y_ratio}k)}}{{{p}({x_ratio}k) - {q_val}({y_ratio}k)}}$.",
                    f"Simplifying: $\\\\frac{{{m * x_ratio}k + {n * y_ratio}k}}{{{p * x_ratio}k - {q_val * y_ratio}k}} = \\\\frac{{{m * x_ratio + n * y_ratio}k}}{{{p * x_ratio - q_val * y_ratio}k}}$.",
                    f"Cancel $k$: $\\\\frac{{{m * x_ratio + n * y_ratio}}}{{{p * x_ratio - q_val * y_ratio}}} = {ans_str}$."
                ],
                "solution_steps_zh": [
                    f"設 $x = {x_ratio}k$ 及 $y = {y_ratio}k$，其中 $k \\\\neq 0$。",
                    f"代入算式：$\\\\frac{{{m}({x_ratio}k) + {n}({y_ratio}k)}}{{{p}({x_ratio}k) - {q_val}({y_ratio}k)}}$。",
                    f"化簡：$\\\\frac{{{m * x_ratio}k + {n * y_ratio}k}}{{{p * x_ratio}k - {q_val * y_ratio}k}} = \\\\frac{{{m * x_ratio + n * y_ratio}k}}{{{p * x_ratio - q_val * y_ratio}k}}$。",
                    f"消去 $k$：$\\\\frac{{{m * x_ratio + n * y_ratio}}}{{{p * x_ratio - q_val * y_ratio}}} = {ans_str}$。"
                ]
            })

    # Level 4: Ratio Word Problems (Q9-Q16)
    # Business profit, Alloys, Inheritance
    contexts = [
        {"type": "profit", "name_en": "partners", "name_zh": "合夥人"},
        {"type": "alloy", "name_en": "metals", "name_zh": "金屬"},
        {"type": "inheritance", "name_en": "heirs", "name_zh": "繼承人"}
    ]
    
    for i in range(9, 17):
        ctx = random.choice(contexts)
        r1, r2, r3 = random.randint(2, 3), random.randint(3, 5), random.randint(5, 7)
        total_parts = r1 + r2 + r3
        
        if ctx['type'] == 'profit':
            base = random.randint(50, 200) * 100
            total_sum = base * total_parts
            share1 = base * r1
            share2 = base * r2
            share3 = base * r3
            
            questions.append({
                "id": f"math_num_ratio_{i:02d}",
                "topic_id": "math_num_ratio",
                "subject": "maths",
                "level": 4,
                "type": "short_answer",
                "marks": 3,
                "question": f"Three business partners share a total profit of ${total_sum}$ in the ratio ${r1}:{r2}:{r3}$. Find the share of the partner who receives the largest portion.",
                "question_zh": f"三位合夥人按 ${r1}:{r2}:{r3}$ 的比例分配總利潤 ${total_sum}$。求獲利最多的一位合夥人所得的利潤。",
                "answer": f"${share3}$",
                "correct_answer": f"${share3}$",
                "solution_steps": [
                    f"Total number of parts = ${r1} + {r2} + {r3} = {total_parts}$.",
                    f"Value of one part = ${total_sum} \\\\div {total_parts} = {base}$.",
                    f"The largest portion corresponds to the part with ratio ${r3}$.",
                    f"Largest share = ${r3} \\\\times {base} = {share3}$."
                ],
                "solution_steps_zh": [
                    f"總份數 = ${r1} + {r2} + {r3} = {total_parts}$。",
                    f"每份的價值 = ${total_sum} \\\\div {total_parts} = {base}$。",
                    f"比例最大的部分為 ${r3}$。",
                    f"所得最多的利潤 = ${r3} \\\\times {base} = {share3}$。"
                ]
            })
        elif ctx['type'] == 'alloy':
            weight_base = random.randint(5, 20)
            total_weight = weight_base * total_parts
            w1 = weight_base * r1
            w2 = weight_base * r2
            w3 = weight_base * r3
            
            questions.append({
                "id": f"math_num_ratio_{i:02d}",
                "topic_id": "math_num_ratio",
                "subject": "maths",
                "level": 4,
                "type": "short_answer",
                "marks": 3,
                "question": f"A metal alloy consists of Copper, Zinc, and Nickel in the ratio ${r1}:{r2}:{r3}$ by weight. If the total weight of the alloy is ${total_weight}\\text{{ g}}$, find the weight of Zinc in the alloy.",
                "question_zh": f"某合金由銅、鋅、鎳組成，其重量比為 ${r1}:{r2}:{r3}$。若該合金的總重量為 ${total_weight}\\text{{ 克}}$，求合金中鋅的重量。",
                "answer": f"${w2}\\text{{ g}}$",
                "correct_answer": f"${w2}\\text{{ g}}$",
                "solution_steps": [
                    f"Total weight ratio parts = ${r1} + {r2} + {r3} = {total_parts}$.",
                    f"Weight of each part = ${total_weight} \\\\div {total_parts} = {weight_base}\\\\text{{ g}}$.",
                    f"Zinc corresponds to the middle term in the ratio which is ${r2}$.",
                    f"Weight of Zinc = ${r2} \\\\times {weight_base} = {w2}\\\\text{{ g}}$."
                ],
                "solution_steps_zh": [
                    f"總重量比例份數 = ${r1} + {r2} + {r3} = {total_parts}$。",
                    f"每份的重量 = ${total_weight} \\\\div {total_parts} = {weight_base}\\\\text{{ 克}}$。",
                    f"鋅對應比例中的中間項，即 ${r2}$。",
                    f"鋅的重量 = ${r2} \\\\times {weight_base} = {w2}\\\\text{{ 克}}$。"
                ]
            })
        else:
            # inheritance change: A has more than B
            r1 = random.randint(5, 8)
            r2 = random.randint(2, 4)
            # A:B = r1:r2, diff = (r1-r2)*k
            k = random.randint(2, 5) * 10
            diff = (r1 - r2) * k
            s1 = r1 * k
            s2 = r2 * k
            give_amt = random.randint(2, 5) * 5
            new_s1 = s1 - give_amt
            new_s2 = s2 + give_amt
            c = gcd(new_s1, new_s2)
            n_r1, n_r2 = new_s1 // c, new_s2 // c
            
            questions.append({
                "id": f"math_num_ratio_{i:02d}",
                "topic_id": "math_num_ratio",
                "subject": "maths",
                "level": 4,
                "type": "short_answer",
                "marks": 4,
                "question": f"The ratio of money held by $A$ and $B$ is initially ${r1}:{r2}$. $A$ has ${diff}$ more than $B$. If $A$ gives ${give_amt}$ to $B$, find the new ratio of their money.",
                "question_zh": f"$A$ 與 $B$ 擁有的金錢之比最初為 ${r1}:{r2}$。已知 $A$ 比 $B$ 多 ${diff}$。若 $A$ 給予 $B$ ${give_amt}$，求他們金錢的新比例。",
                "answer": f"${n_r1}:{n_r2}$",
                "correct_answer": f"${n_r1}:{n_r2}$",
                "solution_steps": [
                    f"Let the amounts held by $A$ and $B$ be ${r1}k$ and ${r2}k$.",
                    f"Given $A - B = {diff}$, so $({r1} - {r2})k = {diff}$.",
                    f"${r1 - r2}k = {diff} \\\\implies k = {k}$.",
                    f"Initial amounts: $A = {r1}({k}) = {s1}$, $B = {r2}({k}) = {s2}$.",
                    f"After giving ${give_amt}$: $A = {s1} - {give_amt} = {new_s1}$, $B = {s2} + {give_amt} = {new_s2}$.",
                    f"New ratio = ${new_s1}:{new_s2} = {n_r1}:{n_r2}$."
                ],
                "solution_steps_zh": [
                    f"設 $A$ 與 $B$ 擁有的金額為 ${r1}k$ 及 ${r2}k$。",
                    f"已知 $A - B = {diff}$，即 $({r1} - {r2})k = {diff}$。",
                    f"${r1 - r2}k = {diff} \\\\implies k = {k}$。",
                    f"最初金額：$A = {r1}({k}) = {s1}，B = {r2}({k}) = {s2}$。",
                    f"在 $A$ 給予 $B$ ${give_amt}$ 後：$A = {s1} - {give_amt} = {new_s1}，B = {s2} + {give_amt} = {new_s2}$。",
                    f"新比例 = ${new_s1}:{new_s2} = {n_r1}:{n_r2}$。"
                ]
            })

    # Level 5: Map Scales - Linear (Q17-Q24)
    for i in range(17, 25):
        # 1:n scale
        scale_n = random.choice([10000, 20000, 25000, 50000, 100000])
        map_cm = random.randint(4, 15)
        # 1 cm map = scale_n cm real
        # K km real = Map_cm * scale_n / 100000
        real_km = (map_cm * scale_n) / 100000.0
        
        questions.append({
            "id": f"math_num_ratio_{i:02d}",
            "topic_id": "math_num_ratio",
            "subject": "maths",
            "level": 5,
            "type": "short_answer",
            "marks": 3,
            "question": f"A map is drawn to a scale of $1:{scale_n}$. If the distance between two towns on the map is ${map_cm}\\\\text{{ cm}}$, find the actual distance between them in $\\\\text{{km}}$.",
            "question_zh": f"某地圖的比例尺為 $1:{scale_n}$。若地圖上兩鎮之間的距離為 ${map_cm}\\\\text{{ 厘米}}$，求兩鎮之間的實際距離（以 $\\\\text{{公里}}$ 為單位）。",
            "answer": f"${real_km}\\\\text{{ km}}$",
            "correct_answer": f"${real_km}\\\\text{{ km}}$",
            "solution_steps": [
                f"Scale $1:{scale_n}$ means $1\\\\text{{ cm}}$ on map = ${scale_n}\\\\text{{ cm}}$ in reality.",
                f"Actual distance in cm = ${map_cm} \\\\times {scale_n} = {map_cm * scale_n}\\\\text{{ cm}}$.",
                f"Convert cm to km: ${map_cm * scale_n} \\\\div 100\\\\,000 = {real_km}\\\\text{{ km}}$."
            ],
            "solution_steps_zh": [
                f"比例尺 $1:{scale_n}$ 表示地圖上的 $1\\\\text{{ 厘米}} = $ 實際的 ${scale_n}\\\\text{{ 厘米}}$。",
                f"實際距離（厘米）= ${map_cm} \\\\times {scale_n} = {map_cm * scale_n}\\\\text{{ 厘米}}$。",
                f"將厘米轉換為公里：${map_cm * scale_n} \\\\div 100\\\\,000 = {real_km}\\\\text{{ 公里}}$。"
            ]
        })

    # Level 7: Elite Map Area Scales (Q25-Q30)
    for i in range(25, 31):
        scale_n = random.choice([20000, 40000, 50000])
        # Actual Area in km^2
        real_km2 = random.choice([2.0, 4.0, 8.0, 10.0])
        # 1 km = 100,000 cm
        # 1 km^2 = (10^5)^2 = 10^10 cm^2
        real_cm2 = real_km2 * (10**10)
        # Map Area = real_cm2 / (scale_n^2)
        map_cm2 = real_cm2 / (scale_n**2)
        
        questions.append({
            "id": f"math_num_ratio_{i:02d}",
            "topic_id": "math_num_ratio",
            "subject": "maths",
            "level": 7,
            "type": "short_answer",
            "marks": 4,
            "question": f"A map has a scale of $1:{scale_n}$. The actual area of a reservoir is ${real_km2}\\\\text{{ km}}^2$. Find the area of the reservoir on the map in $\\\\text{{cm}}^2$.",
            "question_zh": f"某地圖的比例尺為 $1:{scale_n}$。一個水庫的實際面積為 ${real_km2}\\\\text{{ 公里}}^2$。求該水庫在地圖上的面積（以 $\\\\text{{厘米}}^2$ 為單位）。",
            "answer": f"${int(map_cm2) if map_cm2 == int(map_cm2) else map_cm2}\\\\text{{ cm}}^2$",
            "correct_answer": f"${int(map_cm2) if map_cm2 == int(map_cm2) else map_cm2}\\\\text{{ cm}}^2$",
            "solution_steps": [
                f"The length scale is $1:k$ where $k = {scale_n}$.",
                f"The area scale is $1:k^2 = 1:{scale_n}^2 = 1:{scale_n**2}$.",
                f"Actual area in $\\\\text{{cm}}^2 = {real_km2} \\\\times (10^5)^2 = {real_km2} \\\\times 10^{{10}} = {int(real_cm2):,}\\\\text{{ cm}}^2$.",
                f"Map area = Actual Area $\\\\div k^2 = {int(real_cm2):,} \\\\div {scale_n**2} = {map_cm2}\\\\text{{ cm}}^2$."
            ],
            "solution_steps_zh": [
                f"長度比例尺為 $1:k$，其中 $k = {scale_n}$。",
                f"面積比例尺為 $1:k^2 = 1:{scale_n}^2 = 1:{scale_n**2}$。",
                f"實際面積（\\\\text{{厘米}}^2$）= ${real_km2} \\\\times (10^5)^2 = {real_km2} \\\\times 10^{{10}} = {int(real_cm2):,}\\\\text{{ 厘米}}^2$。",
                f"地圖面積 = 實際面積 \\\\div k^2 = {int(real_cm2):,} \\\\div {scale_n**2} = {map_cm2}\\\\text{{ 厘米}}^2$。"
            ]
        })

    return questions

if __name__ == "__main__":
    try:
        questions = generate_ratio_proportion_questions()
        # Double escape backslashes for JSON output to match the frontend requirement
        json_output = json.dumps(questions, indent=2, ensure_ascii=False)
        print(json_output)
    except Exception as e:
        import traceback
        print(json.dumps({"error": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)
