import json

# The high-quality questions for Q21-Q30
new_questions = [
  {
    "id": "trig_app_21",
    "topic_id": "math_geo_trig_app",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 6,
    "question": "A solid right pyramid has a square base $ABCD$ with center $O$. The length of each side of the base is $10$ cm and the height of the pyramid $VO$ is $12$ cm, where $V$ is the vertex. Find the angle between the slant edge $VA$ and the base $ABCD$, correct to 1 decimal place.",
    "question_zh": "一個正四角錐體，底面為正方形 $ABCD$，中心為 $O$。底面每邊長度為 $10$ cm，錐體高度 $VO$ 為 $12$ cm，其中 $V$ 為頂點。求側棱 $VA$ 與底面 $ABCD$ 之間的夾角，準確至 1 位小數。",
    "answer": "59.5",
    "correct_answer": "59.5",
    "solution_steps": "1. In the square base $ABCD$, find the diagonal $AC = \\sqrt{10^2 + 10^2} = 10\\sqrt{2}$ cm.\n2. Calculate the distance from the center to a vertex: $AO = \\frac{1}{2}AC = 5\\sqrt{2}$ cm.\n3. In the right-angled triangle $\\triangle VAO$, $\\tan \\angle VAO = \\frac{VO}{AO} = \\frac{12}{5\\sqrt{2}}$.\n4. $\\angle VAO = \\arctan\\left(\\frac{12}{5\\sqrt{2}}\\right) \\approx \\arctan(1.6971) \\approx 59.489^\\circ$.\n5. The angle is $59.5^\\circ$.",
    "solution_steps_zh": "1. 在正方形底面 $ABCD$ 中，對角線 $AC = \\sqrt{10^2 + 10^2} = 10\\sqrt{2}$ cm。\n2. 計算從中心到頂點的距離：$AO = \\frac{1}{2}AC = 5\\sqrt{2}$ cm。\n3. 在直角三角形 $\\triangle VAO$ 中，$\\tan \\angle VAO = \\frac{VO}{AO} = \\frac{12}{5\\sqrt{2}}$。\n4. $\\angle VAO = \\arctan\\left(\\frac{12}{5\\sqrt{2}}\\right) \\approx \\arctan(1.6971) \\approx 59.489^\\circ$。\n5. 夾角為 $59.5^\\circ$。",
    "visual": None
  },
  {
    "id": "trig_app_22",
    "topic_id": "math_geo_trig_app",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 8,
    "question": "A solid right pyramid has a square base $ABCD$ with side length $10$ cm and vertical height $12$ cm. Let $V$ be the vertex of the pyramid. Find the angle between the lateral face $VAB$ and the lateral face $VBC$, correct to the nearest $0.1^\\circ$.",
    "question_zh": "一個正四角錐體，底面為正方形 $ABCD$，邊長為 $10$ cm，垂直高度為 $12$ cm。設 $V$ 為錐體頂點。求側面 $VAB$ 與側面 $VBC$ 之間的夾角，準確至最接近的 $0.1^\\circ$。",
    "answer": "98.5",
    "correct_answer": "98.5",
    "solution_steps": "1. Let $M$ be the midpoint of $AB$. In $\\triangle VAB$, the slant height $VM = \\sqrt{12^2 + 5^2} = 13$ cm.\n2. Calculate the slant edge $VA = \\sqrt{VM^2 + AM^2} = \\sqrt{13^2 + 5^2} = \\sqrt{194}$ cm.\n3. Let $H$ be the foot of the perpendicular from $B$ to $VA$. The area of $\\triangle VAB = \\frac{1}{2} \\cdot 10 \\cdot 13 = 65$ cm$^2$.\n4. Also, Area $= \\frac{1}{2} \\cdot VA \\cdot BH$, so $65 = \\frac{1}{2} \\cdot \\sqrt{194} \\cdot BH \\implies BH = \\frac{130}{\\sqrt{194}}$ cm.\n5. By symmetry, $DH = BH = \\frac{130}{\\sqrt{194}}$ cm. In $\\triangle BDH$, $BD = 10\\sqrt{2}$ cm.\n6. Use the Cosine Rule: $\\cos \\angle BHD = \\frac{BH^2 + DH^2 - BD^2}{2 \\cdot BH \\cdot DH} = \\frac{\\frac{16900}{194} + \\frac{16900}{194} - 200}{2 \\cdot \\frac{16900}{194}} \\approx -0.147929$.\n7. $\\angle BHD = \\arccos(-0.147929) \\approx 98.508^\\circ$.",
    "solution_steps_zh": "1. 設 $M$ 為 $AB$ 的中點。在 $\\triangle VAB$ 中，斜高 $VM = \\sqrt{12^2 + 5^2} = 13$ cm。\n2. 計算側棱 $VA = \\sqrt{VM^2 + AM^2} = \\sqrt{13^2 + 5^2} = \\sqrt{194}$ cm。\n3. 設 $H$ 為從 $B$ 到 $VA$ 的垂足。$\\triangle VAB$ 的面積 $= \\frac{1}{2} \\cdot 10 \\cdot 13 = 65$ cm$^2$。\n4. 同時，面積 $= \\frac{1}{2} \\cdot VA \\cdot BH$，因此 $65 = \\frac{1}{2} \\cdot \\sqrt{194} \\cdot BH \\implies BH = \\frac{130}{\\sqrt{194}}$ cm。\n5. 由對稱性可知，$DH = BH = \\frac{130}{\\sqrt{194}}$ cm。在 $\\triangle BDH$ 中，$BD = 10\\sqrt{2}$ cm。\n6. 使用餘弦定理：$\\cos \\angle BHD = \\frac{BH^2 + DH^2 - BD^2}{2 \\cdot BH \\cdot DH} = \\frac{\\frac{16900}{194} + \\frac{16900}{194} - 200}{2 \\cdot \\frac{16900}{194}} \\approx -0.147929$。\n7. $\\angle BHD = \\arccos(-0.147929) \\approx 98.508^\\circ$。",
    "visual": None
  },
  {
    "id": "trig_app_23",
    "topic_id": "math_geo_trig_app",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 6,
    "question": "$P, Q, R$ and $S$ are the vertices of a regular tetrahedron with edge length $12$ cm. Find the angle between the face $PQR$ and the face $QRS$, correct to 1 decimal place.",
    "question_zh": "$P, Q, R$ 與 $S$ 為一正四面體的頂點，其棱長為 $12$ cm。求面 $PQR$ 與面 $QRS$ 之間的夾角，準確至 1 位小數。",
    "answer": "70.5",
    "correct_answer": "70.5",
    "solution_steps": "1. Let $M$ be the midpoint of $QR$. In equilateral $\\triangle PQR$ and $\\triangle QRS$, $PM \\perp QR$ and $SM \\perp QR$.\n2. The angle between the faces is $\\angle PMS$.\n3. Calculate the height of the equilateral triangular faces: $PM = SM = 12 \\cdot \\sin 60^\\circ = 6\\sqrt{3}$ cm.\n4. In $\\triangle PMS$, $PM = 6\\sqrt{3}$, $SM = 6\\sqrt{3}$, and $PS = 12$ cm.\n5. Use the Cosine Rule: $\\cos \\angle PMS = \\frac{(6\\sqrt{3})^2 + (6\\sqrt{3})^2 - 12^2}{2(6\\sqrt{3})(6\\sqrt{3})} = \\frac{108 + 108 - 144}{2 \\cdot 108} = \\frac{72}{216} = \\frac{1}{3}$.\n6. $\\angle PMS = \\arccos(1/3) \\approx 70.528^\\circ$.",
    "solution_steps_zh": "1. 設 $M$ 為 $QR$ 的中點。在等邊 $\\triangle PQR$ 與 $\\triangle QRS$ 中，$PM \\perp QR$ 且 $SM \\perp QR$。\n2. 兩面之間的夾角為 $\\angle PMS$。\n3. 計算等邊三角形面的高度：$PM = SM = 12 \\cdot \\sin 60^\\circ = 6\\sqrt{3}$ cm。\n4. 在 $\\triangle PMS$ 中，$PM = 6\\sqrt{3}$，$SM = 6\\sqrt{3}$ 且 $PS = 12$ cm。\n5. 使用餘弦定理：$\\cos \\angle PMS = \\frac{(6\\sqrt{3})^2 + (6\\sqrt{3})^2 - 12^2}{2(6\\sqrt{3})(6\\sqrt{3})} = \\frac{108 + 108 - 144}{2 \\cdot 108} = \\frac{72}{216} = \\frac{1}{3}$。\n6. $\\angle PMS = \\arccos(1/3) \\approx 70.528^\\circ$。",
    "visual": None
  },
  {
    "id": "trig_app_24",
    "topic_id": "math_geo_trig_app",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 7,
    "question": "A helicopter $H$ is hovering at a constant altitude of $800$ m. From a point $A$ on the ground, the bearing of the helicopter is $040^\\circ$ and its angle of elevation is $25^\\circ$. From another point $B$ on the ground, the bearing of the helicopter is $160^\\circ$ and its angle of elevation is $15^\\circ$. Find the distance $AB$, correct to the nearest meter.",
    "question_zh": "一架直升機 $H$ 在 $800$ m 的固定高度懸停。從地面上一點 $A$ 測得直升機的方位為 $040^\\circ$，仰角為 $25^\\circ$。從地面上另一點 $B$ 測得直升機的方位為 $160^\\circ$，仰角為 $15^\\circ$。求 $AB$ 之間的距離，答案取至最接近的整數米。",
    "answer": "4121",
    "correct_answer": "4121",
    "solution_steps": "1. Let $O$ be the point on the ground vertically below $H$. Calculate the horizontal distances $OA$ and $OB$.\n2. $OA = \\frac{800}{\\tan 25^\\circ} \\approx 1715.61$ m and $OB = \\frac{800}{\\tan 15^\\circ} \\approx 2985.64$ m.\n3. The horizontal angle $\\angle AOB = 160^\\circ - 40^\\circ = 120^\\circ$.\n4. Use the Cosine Rule in $\\triangle AOB$ to find $AB$: $AB^2 = 1715.61^2 + 2985.64^2 - 2(1715.61)(2985.64) \\cos 120^\\circ$.\n5. $AB^2 = 2943315.68 + 8914046.21 - 2(1715.61)(2985.64)(-0.5) \\approx 16979407.2$.\n6. $AB = \\sqrt{16979407.2} \\approx 4120.6$ m.",
    "solution_steps_zh": "1. 設 $O$ 為地面上直升機 $H$ 正下方的一點。計算水平距離 $OA$ 與 $OB$。\n2. $OA = \\frac{800}{\\tan 25^\\circ} \\approx 1715.61$ m 且 $OB = \\frac{800}{\\tan 15^\\circ} \\approx 2985.64$ m。\n3. 水平角 $\\angle AOB = 160^\\circ - 40^\\circ = 120^\\circ$。\n4. 在 $\\triangle AOB$ 中使用餘弦定理求 $AB$：$AB^2 = 1715.61^2 + 2985.64^2 - 2(1715.61)(2985.64) \\cos 120^\\circ$。\n5. $AB^2 = 2943315.68 + 8914046.21 - 2(1715.61)(2985.64)(-0.5) \\approx 16979407.2$。\n6. $AB = \\sqrt{16979407.2} \\approx 4120.6$ m。",
    "visual": None
  },
  {
    "id": "trig_app_25",
    "topic_id": "math_geo_trig_app",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 6,
    "question": "$ABCDEFGH$ is a cuboid where $AB = 8$ cm, $BC = 6$ cm and $AE = 5$ cm. Find the angle between the space diagonal $BH$ and the face $ABCD$, correct to 1 decimal place.",
    "question_zh": "$ABCDEFGH$ 為一長方體，其中 $AB = 8$ cm，$BC = 6$ cm 且 $AE = 5$ cm。求空間對角線 $BH$ 與面 $ABCD$ 之間的夾角，準確至 1 位小數。",
    "answer": "26.6",
    "correct_answer": "26.6",
    "solution_steps": "1. Calculate the length of the diagonal $BD$ on the face $ABCD$: $BD = \\sqrt{8^2 + 6^2} = 10$ cm.\n2. Identify the right-angled triangle $\\triangle BDH$, where $DH$ is the vertical edge ($DH = AE = 5$ cm).\n3. The angle between $BH$ and face $ABCD$ is $\\angle HBD$.\n4. $\\tan \\angle HBD = \\frac{DH}{BD} = \\frac{5}{10} = 0.5$.\n5. $\\angle HBD = \\arctan(0.5) \\approx 26.565^\\circ \\approx 26.6^\\circ$.",
    "solution_steps_zh": "1. 計算面 $ABCD$ 上的對角線 $BD$ 的長度：$BD = \\sqrt{8^2 + 6^2} = 10$ cm。\n2. 識別直角三角形 $\\triangle BDH$，其中 $DH$ 為垂直棱 ($DH = AE = 5$ cm)。\n3. $BH$ 與面 $ABCD$ 之間的夾角為 $\\angle HBD$。\n4. $\\tan \\angle HBD = \\frac{DH}{BD} = \\frac{5}{10} = 0.5$。\n5. $\\angle HBD = \\arctan(0.5) \\approx 26.565^\\circ \\approx 26.6^\\circ$。",
    "visual": None
  },
  {
    "id": "trig_app_26",
    "topic_id": "math_geo_trig_app",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 7,
    "question": "A right triangular prism has a horizontal base $ABC$ and a height of $10$ cm. $\\triangle ABC$ is an equilateral triangle with side length $6$ cm. Let $D$ be the vertex vertically above $A$. Find the angle between the diagonal $DB$ and the vertical face containing $BC$, correct to 1 decimal place.",
    "question_zh": "一正三棱柱有一水平底面 $ABC$，高度為 $10$ cm。$\\triangle ABC$ 為一等邊三角形，其邊長為 $6$ cm。設 $D$ 為位於 $A$ 正上方的頂點。求對角線 $DB$ 與包含 $BC$ 的垂直面之間的夾角，準確至 1 位小數。",
    "answer": "26.5",
    "correct_answer": "26.5",
    "solution_steps": "1. Let $M$ be the midpoint of $BC$. The perpendicular distance from $A$ to $BC$ is $AM = 6 \\sin 60^\\circ = 3\\sqrt{3}$ cm.\n2. Since $D$ is vertically above $A$, the perpendicular distance from $D$ to the face containing $BC$ is also $3\\sqrt{3}$ cm.\n3. Calculate the length of $DB$ using Pythagoras: $DB = \\sqrt{AD^2 + AB^2} = \\sqrt{10^2 + 6^2} = \\sqrt{136}$ cm.\n4. Let $\\theta$ be the required angle. Then $\\sin \\theta = \\frac{3\\sqrt{3}}{\\sqrt{136}}$.\n5. $\\theta = \\arcsin\\left(\\frac{3\\sqrt{3}}{\\sqrt{136}}\\right) \\approx \\arcsin(0.44558) \\approx 26.459^\\circ$.",
    "solution_steps_zh": "1. 設 $M$ 為 $BC$ 的中點。從 $A$ 到 $BC$ 的垂直距離為 $AM = 6 \\sin 60^\\circ = 3\\sqrt{3}$ cm。\n2. 由於 $D$ 位於 $A$ 正上方，從 $D$ 到包含 $BC$ 的面的垂直距離也是 $3\\sqrt{3}$ cm。\n3. 使用勾股定理計算 $DB$ 的長度：$DB = \\sqrt{AD^2 + AB^2} = \\sqrt{10^2 + 6^2} = \\sqrt{136}$ cm。\n4. 設 $\\theta$ 為所求夾角。則 $\\sin \\theta = \\frac{3\\sqrt{3}}{\\sqrt{136}}$。\n5. $\\theta = \\arcsin\\left(\\frac{3\\sqrt{3}}{\\sqrt{136}}\\right) \\approx \\arcsin(0.44558) \\approx 26.459^\\circ$。",
    "visual": None
  },
  {
    "id": "trig_app_27",
    "topic_id": "math_geo_trig_app",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 7,
    "question": "A vertical flagpole $OP$ of height $h$ stands at point $O$ on a horizontal ground. $A$ and $B$ are two points on the ground such that $OA = 10$ m, $OB = 15$ m and $\\angle AOB = 80^\\circ$. If the angle of elevation of the top $P$ of the flagpole from $A$ is $20^\\circ$, find the distance between $P$ and $B$, correct to 1 decimal place.",
    "question_zh": "一垂直旗桿 $OP$ 高度為 $h$，置於水平地面上的 $O$ 點。地面上有兩點 $A$ 與 $B$，使得 $OA = 10$ m，$OB = 15$ m 且 $\\angle AOB = 80^\\circ$。若從 $A$ 測得旗桿頂部 $P$ 的仰角為 $20^\\circ$，求 $P$ 與 $B$ 之間的距離，準確至 1 位小數。",
    "answer": "15.4",
    "correct_answer": "15.4",
    "solution_steps": "1. In right-angled $\\triangle OAP$, calculate the height $h = OA \\tan 20^\\circ = 10 \\tan 20^\\circ \\approx 3.6397$ m.\n2. Triangle $\\triangle OPB$ is right-angled at $O$ because the flagpole is vertical.\n3. Use Pythagoras theorem in $\\triangle OPB$: $PB = \\sqrt{OB^2 + h^2} = \\sqrt{15^2 + 3.6397^2}$.\n4. $PB = \\sqrt{225 + 13.2474} = \\sqrt{238.2474} \\approx 15.435$ m.\n5. The distance is $15.4$ m.",
    "solution_steps_zh": "1. 在直角三角形 $\\triangle OAP$ 中，計算高度 $h = OA \\tan 20^\\circ = 10 \\tan 20^\\circ \\approx 3.6397$ m。\n2. 由於旗桿是垂直的，三角形 $\\triangle OPB$ 在 $O$ 點處為直角。\n3. 在 $\\triangle OPB$ 中使用勾股定理：$PB = \\sqrt{OB^2 + h^2} = \\sqrt{15^2 + 3.6397^2}$。\n4. $PB = \\sqrt{225 + 13.2474} = \\sqrt{238.2474} \\approx 15.435$ m。\n5. 距離為 $15.4$ m。",
    "visual": None
  },
  {
    "id": "trig_app_28",
    "topic_id": "math_geo_trig_app",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 7,
    "question": "A man walks from point $P$ for $5$ km on a bearing of $040^\\circ$ to reach point $Q$. He then walks for $8$ km on a bearing of $130^\\circ$ to reach point $R$. Find the bearing of $R$ from $P$, correct to the nearest degree.",
    "question_zh": "一人從 $P$ 點出發，向方位 $040^\\circ$ 步行 $5$ km 到達 $Q$ 點。接著向方位 $130^\\circ$ 步行 $8$ km 到達 $R$ 點。求 $R$ 相對於 $P$ 的方位，答案取至最接近的整數度。",
    "answer": "098",
    "correct_answer": "098",
    "solution_steps": "1. In $\\triangle PQR$, calculate the internal angle $\\angle PQR$. The bearing from $Q$ to $R$ is $130^\\circ$ and the bearing from $P$ to $Q$ is $040^\\circ$, so $\\angle PQR = 180^\\circ - (130^\\circ - 40^\\circ) = 90^\\circ$.\n2. Since $\\triangle PQR$ is right-angled at $Q$, $\\tan \\angle QPR = \\frac{QR}{PQ} = \\frac{8}{5} = 1.6$.\n3. $\\angle QPR = \\arctan(1.6) \\approx 57.995^\\circ$.\n4. The bearing of $R$ from $P$ is the bearing of $Q$ plus the internal angle: $40^\\circ + 57.995^\\circ = 97.995^\\circ$.\n5. The bearing is $098^\\circ$ (to the nearest degree).",
    "solution_steps_zh": "1. 在 $\\triangle PQR$ 中，計算內角 $\\angle PQR$。從 $Q$ 到 $R$ 的方位為 $130^\\circ$，且從 $P$ 到 $Q$ 的方位為 $040^\\circ$，因此 $\\angle PQR = 180^\\circ - (130^\\circ - 40^\\circ) = 90^\\circ$。\n2. 由於 $\\triangle PQR$ 在 $Q$ 點處為直角，$\\tan \\angle QPR = \\frac{QR}{PQ} = \\frac{8}{5} = 1.6$。\n3. $\\angle QPR = \\arctan(1.6) \\approx 57.995^\\circ$。\n4. $R$ 相對於 $P$ 的方位是 $Q$ 的方位加上內角：$40^\\circ + 57.995^\\circ = 97.995^\\circ$。\n5. 方位為 $098^\\circ$（取至最接近的整數度）。",
    "visual": None
  },
  {
    "id": "trig_app_29",
    "topic_id": "math_geo_trig_app",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 7,
    "question": "A vertical tower $OT$ of height $50$ m stands at point $O$ on level ground. $A$ is a point due North of $O$ and $B$ is a point due East of $O$. If $OA = 40$ m and $OB = 30$ m, find the angle of elevation of the top $T$ of the tower from the midpoint $M$ of $AB$, correct to 1 decimal place.",
    "question_zh": "一高 $50$ m 的垂直塔 $OT$ 置於水平地面上的 $O$ 點。$A$ 點在 $O$ 點正北方，$B$ 點在 $O$ 點正東方。若 $OA = 40$ m 且 $OB = 30$ m，求從 $AB$ 的中點 $M$ 測得塔頂 $T$ 的仰角，準確至 1 位小數。",
    "answer": "63.4",
    "correct_answer": "63.4",
    "solution_steps": "1. In the right-angled triangle $\\triangle OAB$ on the ground, $AB = \\sqrt{OA^2 + OB^2} = \\sqrt{40^2 + 30^2} = 50$ m.\n2. Since $M$ is the midpoint of the hypotenuse $AB$ in right-angled $\\triangle OAB$, the distance $OM = \\frac{1}{2}AB = 25$ m.\n3. Consider the right-angled triangle $\\triangle OMT$ in the vertical plane.\n4. $\\tan \\angle TMO = \\frac{OT}{OM} = \\frac{50}{25} = 2$.\n5. $\\angle TMO = \\arctan(2) \\approx 63.435^\\circ$.\n6. The angle of elevation is $63.4^\\circ$.",
    "solution_steps_zh": "1. 在地面的直角三角形 $\\triangle OAB$ 中，$AB = \\sqrt{OA^2 + OB^2} = \\sqrt{40^2 + 30^2} = 50$ m。\n2. 由於 $M$ 是直角 $\\triangle OAB$ 斜邊 $AB$ 的中點，距離 $OM = \\frac{1}{2}AB = 25$ m。\n3. 考慮垂直面內的直角三角形 $\\triangle OMT$。\n4. $\\tan \\angle TMO = \\frac{OT}{OM} = \\frac{50}{25} = 2$。\n5. $\\angle TMO = \\arctan(2) \\approx 63.435^\\circ$。\n6. 仰角為 $63.4^\\circ$。",
    "visual": None
  },
  {
    "id": "trig_app_30",
    "topic_id": "math_geo_trig_app",
    "subject": "maths",
    "level": 7,
    "type": "short_answer",
    "marks": 9,
    "question": "In $\\triangle ABC$, $AB = 10$ cm and $\\angle ABC = 40^\\circ$. A point $D$ lies on the line $BC$ such that $AD = 8$ cm. Given that there are two possible positions for $D$, namely $D_1$ and $D_2$, find the distance $D_1D_2$, correct to 2 decimal places.",
    "question_zh": "在 $\\triangle ABC$ 中，$AB = 10$ cm 且 $\\angle ABC = 40^\\circ$。一點 $D$ 位於直線 $BC$ 上，使得 $AD = 8$ cm。已知 $D$ 有兩個可能的位置，分別為 $D_1$ 與 $D_2$，求 $D_1D_2$ 之間的距離，準確至 2 位小數。",
    "answer": "9.53",
    "correct_answer": "9.53",
    "solution_steps": "1. Let $BD = x$. Use the Cosine Rule in $\\triangle ABD$: $AD^2 = AB^2 + BD^2 - 2(AB)(BD) \\cos B$.\n2. $8^2 = 10^2 + x^2 - 2(10)(x) \\cos 40^\\circ \\implies 64 = 100 + x^2 - 15.320888x$.\n3. Form the quadratic equation: $x^2 - 15.320888x + 36 = 0$.\n4. The roots $x_1$ and $x_2$ represent the distances $BD_1$ and $BD_2$.\n5. The distance $D_1D_2$ is $|x_1 - x_2| = \\frac{\\sqrt{b^2 - 4ac}}{a} = \\sqrt{(-15.320888)^2 - 4(1)(36)}$.\n6. $D_1D_2 = \\sqrt{234.730 - 144} = \\sqrt{90.730} \\approx 9.5252$ cm.\n7. The distance is $9.53$ cm.",
    "solution_steps_zh": "1. 設 $BD = x$。在 $\\triangle ABD$ 中使用餘弦定理：$AD^2 = AB^2 + BD^2 - 2(AB)(BD) \\cos B$。\n2. $8^2 = 10^2 + x^2 - 2(10)(x) \\cos 40^\\circ \\implies 64 = 100 + x^2 - 15.320888x$。\n3. 建立二次方程：$x^2 - 15.320888x + 36 = 0$。\n4. 根 $x_1$ 與 $x_2$ 代表距離 $BD_1$ 與 $BD_2$。\n5. 距離 $D_1D_2$ 為 $|x_1 - x_2| = \\sqrt{(-15.320888)^2 - 4(1)(36)}$。\n6. $D_1D_2 = \\sqrt{90.730} \\approx 9.5252$ cm。\n7. 距離為 $9.53$ cm。",
    "visual": None
  }
]

# Update the JSON file
path = '../data/math_content/math_trig_app_questions.json'
with open(path, 'r', encoding='utf-8') as f:
    questions = json.load(f)

# The first 20 questions are indexed 0 to 19
# We replace from index 20 onwards (which is Q21 to Q30)
final_questions = questions[:20] + new_questions

with open(path, 'w', encoding='utf-8') as f:
    json.dump(final_questions, f, ensure_ascii=False, indent=2)

print("Successfully merged 30 questions into math_trig_app_questions.json")
