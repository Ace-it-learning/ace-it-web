import json

def generate_questions():
    questions = []
    topic_id = "math_geo_trig_app"
    subject = "maths"

    # --- 5 EASY (Level 3) ---
    # 1. Sine Rule (Find Side)
    questions.append({
        "id": "trig_app_01",
        "topic_id": topic_id,
        "subject": subject,
        "level": 3,
        "type": "short_answer",
        "marks": 2,
        "question": r"In $\triangle ABC$, $A = 40^\circ$, $B = 60^\circ$, and $a = 10$. Find side $b$ correct to 1 decimal place.",
        "question_zh": r"在 $\triangle ABC$ 中，$A = 40^\circ$，$B = 60^\circ$ 且 $a = 10$。求邊 $b$，答案準確至 1 位小數。",
        "answer": "13.5",
        "correct_answer": "13.5",
        "solution_steps": r"1. Use Sine Rule: $\frac{b}{\sin B} = \frac{a}{\sin A}$.\n2. $\frac{b}{\sin 60^\circ} = \frac{10}{\sin 40^\circ}$.\n3. $b = \frac{10 \cdot \sin 60^\circ}{\sin 40^\circ} \approx \frac{10 \cdot 0.8660}{0.6428} \approx 13.4729 \approx 13.5$.",
        "solution_steps_zh": r"1. 使用正弦定理：$\frac{b}{\sin B} = \frac{a}{\sin A}$。\n2. $\frac{b}{\sin 60^\circ} = \frac{10}{\sin 40^\circ}$。\n3. $b = \frac{10 \cdot \sin 60^\circ}{\sin 40^\circ} \approx \frac{10 \cdot 0.8660}{0.6428} \approx 13.4729 \approx 13.5$。",
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><polygon points='100,200 400,200 280,80' fill='none' stroke='#333' stroke-width='3'/><text x='70' y='210' font-size='18'>A (40^\\circ)</text><text x='410' y='210' font-size='18'>B (60^\\circ)</text><text x='270' y='70' font-size='18'>C</text><text x='340' y='140' font-size='18'>a=10</text><text x='180' y='140' font-size='18'>b=?</text></svg>"
    })

    # 2. Cosine Rule (Find Side)
    questions.append({
        "id": "trig_app_02",
        "topic_id": topic_id,
        "subject": subject,
        "level": 3,
        "type": "short_answer",
        "marks": 2,
        "question": r"In $\triangle ABC$, $a = 5$, $b = 8$, and $\angle C = 120^\circ$. Find side $c$ correct to 1 decimal place.",
        "question_zh": r"在 $\triangle ABC$ 中，$a = 5$，$b = 8$ 且 $\angle C = 120^\circ$。求邊 $c$，答案準確至 1 位小數。",
        "answer": "11.4",
        "correct_answer": "11.4",
        "solution_steps": r"1. Use Cosine Rule: $c^2 = a^2 + b^2 - 2ab \cos C$.\n2. $c^2 = 5^2 + 8^2 - 2(5)(8) \cos 120^\circ$.\n3. $c^2 = 25 + 64 - 80(-0.5) = 89 + 40 = 129$.\n4. $c = \sqrt{129} \approx 11.3578 \approx 11.4$.",
        "solution_steps_zh": r"1. 使用餘弦定理：$c^2 = a^2 + b^2 - 2ab \cos C$。\n2. $c^2 = 5^2 + 8^2 - 2(5)(8) \cos 120^\circ$。\n3. $c^2 = 25 + 64 - 80(-0.5) = 89 + 40 = 129$。\n4. $c = \sqrt{129} \approx 11.3578 \approx 11.4$。",
        "visual": "<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><polygon points='100,200 450,200 200,80' fill='none' stroke='#333' stroke-width='3'/><text x='190' y='70' font-size='18'>C (120^\\circ)</text><text x='110' y='140' font-size='18'>b=8</text><text x='340' y='140' font-size='18'>a=5</text><text x='250' y='220' font-size='18'>c=?</text></svg>"
    })

    # 3. Area of Triangle (Direct)
    questions.append({
        "id": "trig_app_03",
        "topic_id": topic_id,
        "subject": subject,
        "level": 3,
        "type": "short_answer",
        "marks": 2,
        "question": r"Find the area of $\triangle ABC$ if $b = 12$ cm, $c = 15$ cm, and $A = 30^\circ$.",
        "question_zh": r"若 $b = 12$ cm，$c = 15$ cm 且 $A = 30^\circ$，求 $\triangle ABC$ 的面積。",
        "answer": "45",
        "correct_answer": "45",
        "solution_steps": r"1. Area = $\frac{1}{2}bc \sin A$.\n2. Area = $\frac{1}{2}(12)(15) \sin 30^\circ$.\n3. Area = $90 \cdot 0.5 = 45$.",
        "solution_steps_zh": r"1. 面積 = $\frac{1}{2}bc \sin A$。\n2. 面積 = $\frac{1}{2}(12)(15) \sin 30^\circ$。\n3. 面積 = $90 \cdot 0.5 = 45$。",
        "visual": None
    })

    # 4. Sine Rule (Find Angle)
    questions.append({
        "id": "trig_app_04",
        "topic_id": topic_id,
        "subject": subject,
        "level": 3,
        "type": "short_answer",
        "marks": 3,
        "question": r"In $\triangle ABC$, $a = 7$, $b = 10$, and $A = 35^\circ$. Find the acute angle $B$ correct to the nearest degree.",
        "question_zh": r"在 $\triangle ABC$ 中，$a = 7$，$b = 10$ 且 $A = 35^\circ$。求銳角 $B$，至最接近的整數度。",
        "answer": "55",
        "correct_answer": "55",
        "solution_steps": r"1. $\frac{\sin B}{b} = \frac{\sin A}{a} \implies \frac{\sin B}{10} = \frac{\sin 35^\circ}{7}$.\n2. $\sin B = \frac{10 \sin 35^\circ}{7} \approx 0.8194$.\n3. $B = \arcsin(0.8194) \approx 55.03^\circ \approx 55^\circ$.",
        "solution_steps_zh": r"1. $\frac{\sin B}{b} = \frac{\sin A}{a} \implies \frac{\sin B}{10} = \frac{\sin 35^\circ}{7}$。\n2. $\sin B = \frac{10 \sin 35^\circ}{7} \approx 0.8194$。\n3. $B = \arcsin(0.8194) \approx 55.03^\circ \approx 55^\circ$。",
        "visual": None
    })

    # 5. Cosine Rule (Find Angle)
    questions.append({
        "id": "trig_app_05",
        "topic_id": topic_id,
        "subject": subject,
        "level": 3,
        "type": "short_answer",
        "marks": 3,
        "question": r"A triangle has sides 6, 8, and 12. Find its smallest angle correct to the nearest $0.1^\circ$.",
        "question_zh": r"一個三角形的邊長分別為 6、8 和 12。求其最小角，答案準確至最接近的 $0.1^\circ$。",
        "answer": "26.4",
        "correct_answer": "26.4",
        "solution_steps": r"1. Smallest angle is opposite the shortest side (6).\n2. $\cos \theta = \frac{8^2 + 12^2 - 6^2}{2(8)(12)} = \frac{64 + 144 - 36}{192} = \frac{172}{192} \approx 0.8958$.\n3. $\theta = \arccos(0.8958) \approx 26.38^\circ \approx 26.4^\circ$.",
        "solution_steps_zh": r"1. 最小角對著最短邊 (6)。\n2. $\cos \theta = \frac{8^2 + 12^2 - 6^2}{2(8)(12)} = \frac{64 + 144 - 36}{192} = \frac{172}{192} \approx 0.8958$。\n3. $\theta = \arccos(0.8958) \approx 26.38^\circ \approx 26.4^\circ$。",
        "visual": None
    })

    # --- 5 MEDIUM (Level 4) ---
    # 6. Heron's Formula
    questions.append({
        "id": "trig_app_06",
        "topic_id": topic_id,
        "subject": subject,
        "level": 4,
        "type": "short_answer",
        "marks": 4,
        "question": r"Use Heron's formula to find the area of a triangle with sides 7, 10, and 13. (Correct to 1 decimal place)",
        "question_zh": r"使用海倫公式求邊長為 7、10 和 13 的三角形面積。（準確至 1 位小數）",
        "answer": "34.6",
        "correct_answer": "34.6",
        "solution_steps": r"1. $s = \frac{7+10+13}{2} = 15$.\n2. Area = $\sqrt{15(15-7)(15-10)(15-13)} = \sqrt{15 \cdot 8 \cdot 5 \cdot 2} = \sqrt{1200}$.\n3. Area $\approx 34.641 \approx 34.6$.",
        "solution_steps_zh": r"1. $s = \frac{7+10+13}{2} = 15$。\n2. 面積 = $\sqrt{15(15-7)(15-10)(15-13)} = \sqrt{15 \cdot 8 \cdot 5 \cdot 2} = \sqrt{1200}$。\n3. 面積 $\approx 34.641 \approx 34.6$。",
        "visual": None
    })

    # 7. Simple Bearing
    questions.append({
        "id": "trig_app_07",
        "topic_id": topic_id,
        "subject": subject,
        "level": 4,
        "type": "short_answer",
        "marks": 3,
        "question": r"Ship $A$ is 20 km due North of Ship $B$. Ship $C$ is 15 km from Ship $B$ on a bearing of $120^\circ$. Find the distance $AC$ correct to 1 decimal place.",
        "question_zh": r"船 $A$ 位於船 $B$ 正北 20 km 處。船 $C$ 距離船 $B$ 15 km，方位角為 $120^\circ$。求 $AC$ 的距離，準確至 1 位小數。",
        "answer": "30.4",
        "correct_answer": "30.4",
        "solution_steps": r"1. In $\triangle ABC$, $AB = 20, BC = 15$, and $\angle ABC = 120^\circ$.\n2. Use Cosine Rule: $AC^2 = 20^2 + 15^2 - 2(20)(15)\cos 120^\circ$.\n3. $AC^2 = 400 + 225 - 600(-0.5) = 625 + 300 = 925$.\n4. $AC = \sqrt{925} \approx 30.41 \approx 30.4$ km.",
        "solution_steps_zh": r"1. 在 $\triangle ABC$ 中，$AB = 20, BC = 15$ 且 $\angle ABC = 120^\circ$。\n2. 使用餘弦定理：$AC^2 = 20^2 + 15^2 - 2(20)(15)\cos 120^\circ$。\n3. $AC^2 = 400 + 225 - 600(-0.5) = 625 + 300 = 925$。\n4. $AC = \sqrt{925} \approx 30.41 \approx 30.4$ km。",
        "visual": None
    })

    # 8. Angles from 3 sides
    questions.append({
        "id": "trig_app_08",
        "topic_id": topic_id,
        "subject": subject,
        "level": 4,
        "type": "short_answer",
        "marks": 3,
        "question": r"In a triangle where $a = 15, b = 20, c = 25$, find the largest angle. (Type the value only)",
        "question_zh": r"在一個 $a = 15, b = 20, c = 25$ 的三角形中，求最大角。（僅輸入數值）",
        "answer": "90",
        "correct_answer": "90",
        "solution_steps": r"1. $15^2 + 20^2 = 225 + 400 = 625$.\n2. $25^2 = 625$.\n3. Since $a^2 + b^2 = c^2$, it is a right-angled triangle with largest angle $90^\circ$.",
        "solution_steps_zh": r"1. $15^2 + 20^2 = 225 + 400 = 625$。\n2. $25^2 = 625$。\n3. 由於 $a^2 + b^2 = c^2$，這是一個最大角為 $90^\circ$ 的直角三角形。",
        "visual": None
    })

    # 9. Simple multi-step area
    questions.append({
        "id": "trig_app_09",
        "topic_id": topic_id,
        "subject": subject,
        "level": 4,
        "type": "short_answer",
        "marks": 4,
        "question": r"In $\triangle ABC$, $A = 45^\circ$, $B = 30^\circ$, and side $c = 10$. Find the area of the triangle correct to 1 decimal place.",
        "question_zh": r"在 $\triangle ABC$ 中，$A = 45^\circ$，$B = 30^\circ$ 且邊 $c = 10$。求三角形面積，準確至 1 位小數。",
        "answer": "18.3",
        "correct_answer": "18.3",
        "solution_steps": r"1. $C = 180^\circ - 45^\circ - 30^\circ = 105^\circ$.\n2. Use Sine Rule to find side $a$: $\frac{a}{\sin 45^\circ} = \frac{10}{\sin 105^\circ} \implies a \approx 7.3205$.\n3. Area = $\frac{1}{2}ac \sin B = \frac{1}{2}(7.3205)(10) \sin 30^\circ \approx 18.3$.",
        "solution_steps_zh": r"1. $C = 180^\circ - 45^\circ - 30^\circ = 105^\circ$。\n2. 使用正弦定理求邊 $a$：$\frac{a}{\sin 45^\circ} = \frac{10}{\sin 105^\circ} \implies a \approx 7.3205$。\n3. 面積 = $\frac{1}{2}ac \sin B = \frac{1}{2}(7.3205)(10) \sin 30^\circ \approx 18.3$。",
        "visual": None
    })

    # 10. Simple Distance Bearing
    questions.append({
        "id": "trig_app_10",
        "topic_id": topic_id,
        "subject": subject,
        "level": 4,
        "type": "short_answer",
        "marks": 3,
        "question": r"A plane flies 100 km on a bearing of $040^\circ$. How far North has it traveled? (Correct to 1 decimal place)",
        "question_zh": r"一架飛機以 $040^\circ$ 的方位飛行了 100 km。它向北行駛了多少距離？（準確至 1 位小數）",
        "answer": "76.6",
        "correct_answer": "76.6",
        "solution_steps": r"1. North displacement = $100 \cdot \cos 40^\circ$.\n2. $100 \cdot 0.7660 \approx 76.6$ km.",
        "solution_steps_zh": r"1. 北向位移 = $100 \cdot \cos 40^\circ$。\n2. $100 \cdot 0.7660 \approx 76.6$ km。",
        "visual": None
    })

    # --- 10 DSE STANDARD (Level 5) ---
    # 11. Multi-triangle height
    questions.append({
        "id": "trig_app_11",
        "topic_id": topic_id,
        "subject": subject,
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": r"Two points $X$ and $Y$ are on level ground. A tower $h$ is observed from $X$ and $Y$ with angles of elevation $30^\circ$ and $45^\circ$ respectively. If $X, Y$ and the base of tower are collinear, and $XY = 50$ m, find $h$ (nearest m).",
        "question_zh": r"在水準地面上有兩點 $X$ 和 $Y$。從 $X$ 和 $Y$ 觀察塔 $h$ 的仰角分別為 $30^\circ$ 和 $45^\circ$。若 $X, Y$ 和塔底共線，且 $XY = 50$ m，求 $h$（取至最接近的整數）。",
        "answer": "68",
        "correct_answer": "68",
        "solution_steps": r"1. Let tower base be $B$. $h/XB = \tan 30^\circ \implies XB = h\sqrt{3}$.\n2. $h/YB = \tan 45^\circ \implies YB = h$.\n3. $XB - YB = 50 \implies h\sqrt{3} - h = 50$.\n4. $h(\sqrt{3} - 1) = 50 \implies h \approx 68.3$ m.",
        "solution_steps_zh": r"1. 設塔底為 $B$。$XB = h\sqrt{3}$， $YB = h$。\n2. $h\sqrt{3} - h = 50 \implies h \approx 68.3$ m。",
        "visual": None
    })

    # 12. Ambiguous Case (SSA)
    questions.append({
        "id": "trig_app_12",
        "topic_id": topic_id,
        "subject": subject,
        "level": 5,
        "type": "short_answer",
        "marks": 4,
        "question": r"In $\triangle ABC$, $a = 6$, $c = 8$, and $\angle A = 35^\circ$. There are two possible values for $\angle C$. Find the obtuse value correct to 1 decimal place.",
        "question_zh": r"在 $\triangle ABC$ 中，$a = 6, c = 8$ 且 $\angle A = 35^\circ$。$\angle C$ 有兩個可能的值。求鈍角值，準確至 1 位小數。",
        "answer": "130.1",
        "correct_answer": "130.1",
        "solution_steps": r"1. $\frac{\sin C}{8} = \frac{\sin 35^\circ}{6} \implies \sin C = \frac{8 \sin 35^\circ}{6} \approx 0.7648$.\n2. Acute $C \approx 49.9^\circ$. Obtuse $C = 180^\circ - 49.9^\circ = 130.1^\circ$.",
        "solution_steps_zh": r"1. $\sin C \approx 0.7648$。\n2. 銳角 $C \approx 49.9^\circ$。鈍角 $C = 130.1^\circ$。",
        "visual": None
    })

    # 13. Shortest Distance
    questions.append({
        "id": "trig_app_13",
        "topic_id": topic_id,
        "subject": subject,
        "level": 5,
        "type": "short_answer",
        "marks": 4,
        "question": r"In $\triangle PQR$, $PQ = 13, QR = 14, PR = 15$. Find the shortest distance from $Q$ to side $PR$. (Correct to 1 decimal place)",
        "question_zh": r"在 $\triangle PQR$ 中，$PQ = 13, QR = 14, PR = 15$。求 $Q$ 到邊 $PR$ 的最短距離。（準確至 1 位小數）",
        "answer": "11.2",
        "correct_answer": "11.2",
        "solution_steps": r"1. Use Heron's formula: $s = 21$. Area = $\sqrt{21 \cdot 8 \cdot 7 \cdot 6} = 84$.\n2. $84 = 0.5 \cdot 15 \cdot h \implies h = 11.2$.",
        "solution_steps_zh": r"1. 使用海倫公式：面積 = 84。\n2. $84 = 0.5 \cdot 15 \cdot h \implies h = 11.2$。",
        "visual": None
    })

    # 14. pilot sees two landmarks
    questions.append({
        "id": "trig_app_14",
        "topic_id": topic_id,
        "subject": subject,
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": r"A pilot sees two landmarks $A$ and $B$. $A$ is West of $B$. The angle of depression to $A$ is $40^\circ$ and to $B$ is $30^\circ$. If the plane's altitude is 2000m, find the distance $AB$ correct to the nearest m.",
        "question_zh": r"一名飛行員看到兩個地標 $A$ 和 $B$。$A$ 在 $B$ 的西方。到 $A$ 的俯角為 $40^\circ$，到 $B$ 的俯角為 $30^\circ$。若飛機高度為 2000m，求 $AB$ 的距離（答案取至最接近的整數）。",
        "answer": "1081",
        "correct_answer": "1081",
        "solution_steps": r"1. Distance to $B$ = $2000 / \tan 30^\circ \approx 3464$. Distance to $A$ = $2000 / \tan 40^\circ \approx 2383$.\n2. $AB = 3464 - 2383 = 1081$ m.",
        "solution_steps_zh": r"1. 到 $B$ 的距離 $\approx 3464$。到 $A$ 的距離 $\approx 2383$。\n2. $AB = 1081$ m。",
        "visual": None
    })

    # 15. Quadrilateral Area
    questions.append({
        "id": "trig_app_15",
        "topic_id": topic_id,
        "subject": subject,
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": r"A quadrilateral $ABCD$ has $AB=3, BC=4, CD=5, DA=6$ and $\angle B = 90^\circ$. Find its area correct to 1 decimal place.",
        "question_zh": r"四邊形 $ABCD$ 中，$AB=3, BC=4, CD=5, DA=6$ 且 $\angle B = 90^\circ$。求其面積，準確至 1 位小數。",
        "answer": "18",
        "correct_answer": "18",
        "solution_steps": r"1. $AC = 5$. Area $\triangle ABC = 6$.\n2. $\triangle ACD$ is 5, 5, 6 triangle. Area = 12.\n3. Total = $6 + 12 = 18$.",
        "solution_steps_zh": r"1. $AC = 5$。$\triangle ABC$ 面積 = 6。\n2. $\triangle ACD$ 面積 = 12。\n3. 總面積 = 18。",
        "visual": None
    })

    # 16. Bearing of P from Q
    questions.append({
        "id": "trig_app_16",
        "topic_id": topic_id,
        "subject": subject,
        "level": 5,
        "type": "short_answer",
        "marks": 4,
        "question": r"The bearing of $P$ from $Q$ is $075^\circ$. $R$ is 12 km due South of $Q$. If $P$ is 10 km from $Q$, find the bearing of $R$ from $P$ correct to the nearest degree.",
        "question_zh": r"$P$ 相對於 $Q$ 的方位是 $075^\circ$。$R$ 在 $Q$ 正南方 12 km 處。若 $P$ 距離 $Q$ 10 km，求 $R$ 相對於 $P$ 的方位，答案取至最接近的整數度。",
        "answer": "214",
        "correct_answer": "214",
        "solution_steps": r"1. In $\triangle PQR$, $PQ=10, QR=12, \angle PQR = 105^\circ$.\n2. $PR \approx 17.5, \angle QPR \approx 41.5^\circ$.\n3. Bearing calculation $\approx 214^\circ$.",
        "solution_steps_zh": r"1. $\angle PQR = 105^\circ$。\n2. $PR \approx 17.5, \angle QPR \approx 41.5^\circ$。\n3. 方位角計算 $\approx 214^\circ$。",
        "visual": None
    })

    # 17. Finding non-right triangle perimeter
    questions.append({
        "id": "trig_app_17",
        "topic_id": topic_id,
        "subject": subject,
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": r"In $\triangle ABC$, the area is $20\sqrt{3}$ cm$^2$, $c = 10$ cm, and $B = 60^\circ$. Find the perimeter of the triangle.",
        "question_zh": r"在 $\triangle ABC$ 中，面積為 $20\sqrt{3}$ cm$^2$，$c = 10$ cm 且 $B = 60^\circ$。求三角形的周界。",
        "answer": "27.2",
        "correct_answer": "27.2",
        "solution_steps": r"1. Area formula gives $a = 8$.\n2. Cosine Rule gives $b \approx 9.17$.\n3. Perimeter = $8 + 10 + 9.17 \approx 27.2$.",
        "solution_steps_zh": r"1. $a = 8$。\n2. $b \approx 9.17$。\n3. 周界 $\approx 27.2$。",
        "visual": None
    })

    # 18. Area of a segment
    questions.append({
        "id": "trig_app_18",
        "topic_id": topic_id,
        "subject": subject,
        "level": 5,
        "type": "short_answer",
        "marks": 4,
        "question": r"A chord $AB$ subtends an angle of $120^\circ$ at the center $O$ of a circle with radius 6 cm. Find the area of the minor segment bounded by the chord $AB$. (Correct to 1 decimal place)",
        "question_zh": r"弦 $AB$ 在半徑為 6 cm 的圓心 $O$ 處所對的圓心角為 $120^\circ$。求由弦 $AB$ 圍成的較小弓形的面積。（準確至 1 位小數）",
        "answer": "22.1",
        "correct_answer": "22.1",
        "solution_steps": r"1. Sector Area $\approx 37.70$. Triangle Area $\approx 15.59$.\n2. Segment Area = $37.70 - 15.59 \approx 22.1$.",
        "solution_steps_zh": r"1. 扇形面積 $\approx 37.70$。三角形面積 $\approx 15.59$。\n2. 弓形面積 $\approx 22.1$。",
        "visual": None
    })

    # 19. Elevation problem
    questions.append({
        "id": "trig_app_19",
        "topic_id": topic_id,
        "subject": subject,
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": r"From a point $P$ on the ground, the angle of elevation of the top of a cliff is $25^\circ$. After walking 50m closer to the cliff to point $Q$, the angle of elevation is $40^\circ$. Find the height of the cliff. (Nearest m)",
        "question_zh": r"從地面上的一點 $P$ 觀察懸崖頂部的仰角為 $25^\circ$。向懸崖走近 50m 到點 $Q$ 後，仰角變為 $40^\circ$。求懸崖的高度（取至最接近的整數）。",
        "answer": "52",
        "correct_answer": "52",
        "solution_steps": r"1. $h / \tan 25 - h / \tan 40 = 50 \implies h \approx 52$.",
        "solution_steps_zh": r"1. $h / \tan 25 - h / \tan 40 = 50 \implies h \approx 52$。",
        "visual": None
    })

    # 20. Bearing change
    questions.append({
        "id": "trig_app_20",
        "topic_id": topic_id,
        "subject": subject,
        "level": 5,
        "type": "short_answer",
        "marks": 5,
        "question": r"A hiker walks 4 km on a bearing of $060^\circ$ and then 6 km on a bearing of $150^\circ$. Find the direct distance from the starting point to the final position. (Correct to 1 decimal place)",
        "question_zh": r"一名遠足者向 $060^\circ$ 方位步行 4 km，然後向 $150^\circ$ 方位步行 6 km。求從起點到終點的直線距離（準確至 1 位小數）。",
        "answer": "7.2",
        "correct_answer": "7.2",
        "solution_steps": r"1. Use Pythagoras: $d = \sqrt{4^2 + 6^2} = \sqrt{52} \approx 7.2$.",
        "solution_steps_zh": r"1. 使用勾股定理：$d = \sqrt{52} \approx 7.2$。",
        "visual": None
    })

    # --- 10 ELITE (Level 7) ---
    # 21. Pyramid Angle
    questions.append({
        "id": "trig_app_21",
        "topic_id": topic_id,
        "subject": subject,
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": r"In a right pyramid with a square base of side 10 cm and height 12 cm, find the angle between a slant edge and the base correct to 1 decimal place.",
        "question_zh": r"一個正四角錐體，底面正方形邊長為 10 cm，高度為 12 cm。求側棱與底面之間的夾角，準確至 1 位小數。",
        "answer": "59.5",
        "correct_answer": "59.5",
        "solution_steps": r"1. $\tan \theta = 12 / (5\sqrt{2}) \approx 1.697$.\n2. $\theta \approx 59.5^\circ$.",
        "solution_steps_zh": r"1. $\tan \theta \approx 1.697$。\n2. $\theta \approx 59.5^\circ$。",
        "visual": None
    })

    # 22. Angle between faces
    questions.append({
        "id": "trig_app_22",
        "topic_id": topic_id,
        "subject": subject,
        "level": 7,
        "type": "short_answer",
        "marks": 8,
        "question": r"In a pyramid (side 10, height 12), find the angle between two adjacent lateral faces (approx).",
        "question_zh": r"在同一個錐體中（邊 10，高 12），求兩個相鄰側向面之間的夾角（約值）。",
        "answer": "67",
        "correct_answer": "67",
        "solution_steps": r"1. Logic involving projection and Cosine Rule on the face normals. $\theta \approx 67^\circ$.",
        "solution_steps_zh": r"1. 涉及法面投影和餘弦定理，$\theta \approx 67^\circ$。",
        "visual": None
    })

    # 23. Tetrahedral Angle
    questions.append({
        "id": "trig_app_23",
        "topic_id": topic_id,
        "subject": subject,
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": r"In a regular tetrahedron, find the angle between any two faces correct to 1 decimal place.",
        "question_zh": r"在一個正四面體中，求任意兩個面之間的夾角，準確至 1 位小數。",
        "answer": "70.5",
        "correct_answer": "70.5",
        "solution_steps": r"1. $\cos \theta = 1/3$. $\theta \approx 70.5^\circ$.",
        "solution_steps_zh": r"1. $\cos \theta = 1/3$。 $\theta \approx 70.5^\circ$。",
        "visual": None
    })

    # 24. Complex Bearing Vector
    questions.append({
        "id": "trig_app_24",
        "topic_id": topic_id,
        "subject": subject,
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": r"Airplane 400 km/h bearing $030^\circ$. Wind 50 km/h from West. Find actual speed (nearest km/h).",
        "question_zh": r"飛機 400 km/h 方位 $030^\circ$。風速 50 km/h 從西吹來。求實際速度（最接近整數）。",
        "answer": "427",
        "correct_answer": "427",
        "solution_steps": r"1. $|\vec{V}_g| = \sqrt{250^2 + 346.4^2} \approx 427$ km/h.",
        "solution_steps_zh": r"1. 實際速度 $\approx 427$ km/h。",
        "visual": None
    })

    # 25. 3D Shortest Path
    questions.append({
        "id": "trig_app_25",
        "topic_id": topic_id,
        "subject": subject,
        "level": 7,
        "type": "short_answer",
        "marks": 8,
        "question": r"Cuboid 3x4x5. Shortest path corner to corner on surface. (Correct to 2 dp)",
        "question_zh": r"長方體 3x4x5。表面對角最短路徑。（準確至 2 位小數）",
        "answer": "8.60",
        "correct_answer": "8.60",
        "solution_steps": r"1. $\sqrt{(3+4)^2 + 5^2} = \sqrt{74} \approx 8.60$.",
        "solution_steps_zh": r"1. $\sqrt{74} \approx 8.60$。",
        "visual": None
    })

    # 26. Angle line-plane complex
    questions.append({
        "id": "trig_app_26",
        "topic_id": topic_id,
        "subject": subject,
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": r"In cuboid AB=3, BC=4, AE=12, find angle between AG and plane ABCD.",
        "question_zh": r"在長方體 AB=3, BC=4, AE=12 中，求 AG 與平面 ABCD 的夾角。",
        "answer": "67.4",
        "correct_answer": "67.4",
        "solution_steps": r"1. $AC = 5$. $\tan \theta = 12/5 \implies \theta \approx 67.4^\circ$.",
        "solution_steps_zh": r"1. $AC = 5$。 $\tan \theta = 12/5 \implies \theta \approx 67.4^\circ$。",
        "visual": None
    })

    # 27. Volume of Pyramid
    questions.append({
        "id": "trig_app_27",
        "topic_id": topic_id,
        "subject": subject,
        "level": 7,
        "type": "short_answer",
        "marks": 6,
        "question": r"Pyramid base sides 6, 8, 10, height 9. Find volume.",
        "question_zh": r"錐體底邊 6, 8, 10，高 9。求體積。",
        "answer": "72",
        "correct_answer": "72",
        "solution_steps": r"1. Base area = 24. Vol = $1/3 \cdot 24 \cdot 9 = 72$.",
        "solution_steps_zh": r"1. 底面積 = 24。體積 = 72。",
        "visual": None
    })

    # 28. Space diagonal
    questions.append({
        "id": "trig_app_28",
        "topic_id": topic_id,
        "subject": subject,
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": r"Prism base AB=8, BC=5, B=60, height 10. Find diagonal BC'.",
        "question_zh": r"棱柱底面 AB=8, BC=5, B=60，高 10。求對角線 BC'。",
        "answer": "11.2",
        "correct_answer": "11.2",
        "solution_steps": r"1. $BC' = \sqrt{5^2 + 10^2} \approx 11.2$.",
        "solution_steps_zh": r"1. $BC' = \sqrt{125} \approx 11.2$。",
        "visual": None
    })

    # 29. Equilateral Pyramid Slant Angle
    questions.append({
        "id": "trig_app_29",
        "topic_id": topic_id,
        "subject": subject,
        "level": 7,
        "type": "short_answer",
        "marks": 7,
        "question": r"Regular triangular pyramid base side 6, height 4, find slant face slope.",
        "question_zh": r"正三棱錐底邊 6, 高 4，求側面傾斜角。",
        "answer": "66.6",
        "correct_answer": "66.6",
        "solution_steps": r"1. $r = \sqrt{3}$. $\tan \theta = 4/\sqrt{3} \implies \theta \approx 66.6^\circ$.",
        "solution_steps_zh": r"1. $r = \sqrt{3}$。$\theta \approx 66.6^\circ$。",
        "visual": None
    })

    # 30. Ambiguous Case + Bearing
    questions.append({
        "id": "trig_app_30",
        "topic_id": topic_id,
        "subject": subject,
        "level": 7,
        "type": "short_answer",
        "marks": 10,
        "question": r"Port O, Ship P bearing $040^\circ$, Ship Q bearing $100^\circ$ and 20km away. If PQ=18km, find OP (shorter).",
        "question_zh": r"港口 O，船 P 方位 $040^\circ$，船 Q 方位 $100^\circ$ 且距離 20km。若 PQ=18km，求 OP（較短）。",
        "answer": "5.1",
        "correct_answer": "5.1",
        "solution_steps": r"1. $x^2 - 20x + 76 = 0 \implies x = 10 \pm \sqrt{24}$. Shorter $\approx 5.1$.",
        "solution_steps_zh": r"1. $x \approx 10 - 4.9 = 5.1$。",
        "visual": None
    })

    with open('../data/math_content/math_trig_app_questions.json', 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print("Successfully generated 30 questions in math_trig_app_questions.json")

if __name__ == "__main__":
    generate_questions()
