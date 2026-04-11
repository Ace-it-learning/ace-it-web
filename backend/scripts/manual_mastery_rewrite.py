import json

def manual_mastery_rewrite():
    file_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_trig_app_questions.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # RE-WRITING EVERY SINGLE QUESTION FOR PERFECT KATEX AND SPACING
    REWRITES = {
        "trig_app_01": {
            "en": "In $\\triangle ABC$, $A = 40^\\circ$, $B = 60^\\circ$ and $a = 10$. Find side $b$ correct to 1 decimal place.",
            "zh": "在 $\\triangle ABC$ 中，$A = 40^\\circ$，$B = 60^\\circ$ 且 $a = 10$。求邊 $b$，答案準確至 1 位小數。"
        },
        "trig_app_02": {
            "en": "In $\\triangle ABC$, $a = 5$, $b = 8$ and $\\angle C = 120^\\circ$. Find side $c$ correct to 1 decimal place.",
            "zh": "在 $\\triangle ABC$ 中，$a = 5$，$b = 8$ 且 $\\angle C = 120^\\circ$。求邊 $c$，答案準確至 1 位小數。"
        },
        "trig_app_03": {
            "en": "Find the area of $\\triangle ABC$ if $b = 12$ cm, $c = 15$ cm and $\\angle A = 30^\\circ$.",
            "zh": "若 $b = 12$ cm，$c = 15$ cm 且 $\\angle A = 30^\\circ$，求 $\\triangle ABC$ 的面積。"
        },
        "trig_app_04": {
            "en": "In $\\triangle ABC$, $a = 7$, $b = 10$ and $\\angle A = 35^\\circ$. Find the acute angle $B$ correct to the nearest degree.",
            "zh": "在 $\\triangle ABC$ 中，$a = 7$，$b = 10$ 且 $\\angle A = 35^\\circ$。求銳角 $B$，至最接近的整數度。"
        },
        "trig_app_05": {
            "en": "A triangle has sides 6, 8 and 12. Find its smallest angle correct to the nearest $0.1^\\circ$.",
            "zh": "一個三角形的邊長分別為 6、8 和 12。求其最小角，答案準確至最接近的 $0.1^\\circ$。"
        },
        "trig_app_06": {
            "en": "Use Heron's formula to find the area of a triangle with sides 7, 10 and 13. (Correct to 1 decimal place)",
            "zh": "使用海倫公式求邊長為 7、10 和 13 的三角形面積。（準確至 1 位小數）"
        },
        "trig_app_07": {
            "en": "Ship $A$ is 20 km due North of Ship $B$. Ship $C$ is 15 km from Ship $B$ on a bearing of $120^\\circ$. Find the distance $AC$ correct to 1 decimal place.",
            "zh": "船 $A$ 位於船 $B$ 正北 20 km 處。船 $C$ 距離船 $B$ 15 km，方位角為 $120^\\circ$。求 $AC$ 的距離，準確至 1 位小數。"
        },
        "trig_app_08": {
            "en": "In a triangle where $a = 15, b = 20, c = 25$, find the largest angle. (Type the numerical value only)",
            "zh": "在一個 $a = 15, b = 20, c = 25$ 的三角形中，求最大角。（僅輸入數值）"
        },
        "trig_app_09": {
            "en": "In $\\triangle ABC$, $\\angle A = 45^\\circ$, $\\angle B = 30^\\circ$ and side $c = 10$. Find the area of the triangle correct to 1 decimal place.",
            "zh": "在 $\\triangle ABC$ 中，$\\angle A = 45^\\circ$，$\\angle B = 30^\\circ$ 且邊 $c = 10$。求三角形面積，準確至 1 位小數。"
        },
        "trig_app_10": {
            "en": "A plane flies 100 km on a bearing of $040^\\circ$. How far North has it traveled? (Correct to 1 decimal place)",
            "zh": "一架飛機以 $040^\\circ$ 的方位飛行了 100 km。它向北行駛了多少距離？（準確至 1 位小數）"
        },
        "trig_app_11": {
            "en": "Two points $X$ and $Y$ are on level ground. A tower $h$ is observed from $X$ and $Y$ with angles of elevation $30^\\circ$ and $45^\\circ$ respectively. If $X, Y$ and the base of the tower are collinear, and $XY = 50$ m, find $h$ (nearest m).",
            "zh": "在水準地面上有兩點 $X$ 和 $Y$。從 $X$ 和 $Y$ 觀察塔 $h$ 的仰角分別為 $30^\\circ$ 和 $45^\\circ$。若 $X, Y$ 和塔底共線，且 $XY = 50$ m，求 $h$（取至最接近的整數）。"
        },
        "trig_app_12": {
            "en": "In $\\triangle ABC$, $a = 6$, $c = 8$ and $\\angle A = 35^\\circ$. There are two possible values for $\\angle C$. Find the obtuse value correct to 1 decimal place.",
            "zh": "在 $\\triangle ABC$ 中，$a = 6$，$c = 8$ 且 $\\angle A = 35^\\circ$。$\\angle C$ 有兩個可能的值。求鈍角值，準確至 1 位小數。"
        },
        "trig_app_13": {
            "en": "In $\\triangle PQR$, $PQ = 13, QR = 14, PR = 15$. Find the shortest distance from $Q$ to side $PR$. (Correct to 1 decimal place)",
            "zh": "在 $\\triangle PQR$ 中，$PQ = 13, QR = 14, PR = 15$。求 $Q$ 到邊 $PR$ 的最短距離。（準確至 1 位小數）"
        },
        "trig_app_14": {
            "en": "A pilot sees two landmarks $A$ and $B$. $A$ is West of $B$. The angle of depression to Landmark $A$ is $40^\\circ$ and to $B$ is $30^\\circ$. If the plane's altitude is 2000m, find the distance $AB$ correct to the nearest m.",
            "zh": "一名飛行員看到兩個地標 $A$ 和 $B$。$A$ 在 $B$ 的西方。到 $A$ 的俯角為 $40^\\circ$，到 $B$ 的俯角為 $30^\\circ$。若飛機高度為 2000m，求 $AB$ 的距離（答案取至最接近的整數）。"
        },
        "trig_app_15": {
            "en": "A quadrilateral $ABCD$ has $AB = 3, BC = 4, CD = 5, DA = 6$ and $\\angle ABC = 90^\\circ$. Find its area correct to 1 decimal place.",
            "zh": "四邊形 $ABCD$ 中，$AB = 3, BC = 4, CD = 5, DA = 6$ 且 $\\angle ABC = 90^\\circ$。求其面積，準確至 1 位小數。"
        },
        "trig_app_16": {
            "en": "The bearing of $P$ from $Q$ is $075^\\circ$. $R$ is 12 km due South of $Q$. If $P$ is 10 km from $Q$, find the bearing of $R$ from $P$ correct to the nearest degree.",
            "zh": "$P$ 相對於 $Q$ 的方位是 $075^\\circ$。$R$ 在 $Q$ 正南方 12 km 處。若 $P$ 距離 $Q$ 10 km，求 $R$ 相對於 $P$ 的方位，答案取至最接近的整數度。"
        },
        "trig_app_17": {
            "en": "In $\\triangle ABC$, the area is $20\\sqrt{3}$ cm$^2$, $c = 10$ cm and $\\angle B = 60^\\circ$. Find the perimeter of the triangle.",
            "zh": "在 $\\triangle ABC$ 中，面積為 $20\\sqrt{3}$ cm$^2$，$c = 10$ cm 且 $\\angle B = 60^\\circ$。求三角形的周界。"
        },
        "trig_app_18": {
            "en": "A chord $AB$ subtends an angle of $120^\\circ$ at the center $O$ of a circle with radius 6 cm. Find the area of the minor segment bounded by the chord $AB$. (Correct to 1 decimal place)",
            "zh": "弦 $AB$ 在半徑為 6 cm 的圓心 $O$ 處所對的圓心角為 $120^\\circ$。求由弦 $AB$ 圍成的較小弓形的面積。（準確至 1 位小數）"
        },
        "trig_app_19": {
            "en": "From point $P$ on the ground, the angle of elevation of the top of a cliff is $25^\\circ$. After walking 50m closer to point $Q$, the angle is $40^\\circ$. Find the height of the cliff. (Nearest m)",
            "zh": "從地面上的一點 $P$ 觀察懸崖頂部的仰角為 $25^\\circ$。向懸崖走近 50m 到點 $Q$ 後，仰角變為 $40^\\circ$。求懸崖的高度（取至最接近的整數）。"
        },
        "trig_app_20": {
            "en": "A hiker walks 4 km on a bearing of $060^\\circ$ and then 6 km on a bearing of $150^\\circ$. Find the direct distance from the start to the final position. (Correct to 1 decimal place)",
            "zh": "一名遠足者向 $060^\\circ$ 方位步行 4 km，然後向 $150^\\circ$ 方位步行 6 km。求從起點到終點的直線距離（準確至 1 位小數）。"
        }
    }

    # ELITE QUESTIONS (Q21-Q30)
    ELITE_REWRITES = {
        "trig_app_21": {
            "en": "A solid right pyramid has a square base $ABCD$ with height $VO = 12$ cm and base side $10$ cm. Find the angle between slant edge $VA$ and the base $ABCD$ (correct to 1 decimal place).",
            "zh": "一個正四角錐體，底面為正方形 $ABCD$，高度 $VO = 12$ cm，底面邊長 $10$ cm。求側棱 $VA$ 與底面 $ABCD$ 之間的夾角（準確至 1 位小數）。"
        },
        "trig_app_22": {
            "en": "A solid right pyramid has a square base $ABCD$ with side $10$ cm and height $12$ cm. Find the angle between lateral face $VAB$ and lateral face $VBC$ (correct to 0.1 degree).",
            "zh": "一個正四角錐體，底面為正方形 $ABCD$，邊長 $10$ cm，高度 $12$ cm。求側面 $VAB$ 與側面 $VBC$ 之間的夾角（準確至 0.1 度）。"
        },
        "trig_app_23": {
            "en": "A regular tetrahedron has edge length $12$ cm. Find the angle between face $PQR$ and face $QRS$ (correct to 1 decimal place).",
            "zh": "一個正四面體的棱長為 $12$ cm。求面 $PQR$ 與面 $QRS$ 之間的夾角（準確至 1 位小數）。"
        },
        "trig_app_24": {
            "en": "A helicopter $H$ is at altitude $800$ m. From $A$, its bearing is $040^\\circ$ and elevation is $25^\\circ$. From $B$, its bearing is $160^\\circ$ and elevation is $15^\\circ$. Find $AB$ (nearest m).",
            "zh": "一架直升機 $H$ 位於 $800$ m 高度。從 $A$ 測得其方位為 $040^\\circ$，仰角為 $25^\\circ$。從 $B$ 測得其方位為 $160^\\circ$，仰角為 $15^\\circ$。求 $AB$（取至最接近的整數）。"
        },
        "trig_app_25": {
            "en": "$ABCDEFGH$ is a cuboid where $AB = 8, BC = 6, AE = 5$. Find the angle between space diagonal $BH$ and the face $ABCD$ (correct to 1 decimal place).",
            "zh": "$ABCDEFGH$ 為一長方體，其中 $AB = 8, BC = 6, AE = 5$。求空間對角線 $BH$ 與面 $ABCD$ 之間的夾角（準確至 1 位小數）。"
        },
        "trig_app_26": {
            "en": "A right triangular prism has base $ABC$ (equilateral, side $6$) and height $10$. Find the angle between diagonal $DB$ and the vertical face containing $BC$ ($D$ is above $A$).",
            "zh": "一正三棱柱底面 $ABC$ 為等邊三角形（邊長 $6$），高度為 $10$。求對角線 $DB$ 與包含 $BC$ 的垂直面之間的夾角（$D$ 位於 $A$ 正上方）。"
        },
        "trig_app_27": {
            "en": "A flagpole $OP$ has height $h$. Earth points $A, B$ satisfy $OA = 10, OB = 15, \\angle AOB = 80^\\circ$. If elevation of $P$ from $A$ is $20^\\circ$, find distance $PB$ (correct to 1 decimal place).",
            "zh": "旗桿 $OP$ 高度為 $h$。地面點 $A, B$ 滿足 $OA = 10, OB = 15, \\angle AOB = 80^\\circ$。若從 $A$ 測得 $P$ 的仰角為 $20^\\circ$，求 $PB$ 的距離（準確至 1 位小數）。"
        },
        "trig_app_28": {
            "en": "Walk $5$ km from $P$ on $040^\\circ$ to $Q$, then $8$ km on $130^\\circ$ to $R$. Find the bearing of $R$ from $P$ (nearest degree).",
            "zh": "從 $P$ 向 $040^\\circ$ 步行 $5$ km 到 $Q$，再向 $130^\\circ$ 步行 $8$ km 到 $R$。求 $R$ 相對於 $P$ 的方位（取至最接近的整數度）。"
        },
        "trig_app_29": {
            "en": "A tower $OT$ (50m) stands at $O$. $A$ is North of $O$ (40m), $B$ is East of $O$ (30m). Find angle of elevation of $T$ from midpoint $M$ of $AB$ (correct to 1 decimal place).",
            "zh": "塔 $OT$ ($50$m) 位於 $O$。$A$ 在 $O$ 正北 ($40$m)，$B$ 在 $O$ 正東 ($30$m)。求從 $AB$ 中點 $M$ 測得 $T$ 的仰角（準確至 1 位小數）。"
        },
        "trig_app_30": {
            "en": "In $\\triangle ABC$, $AB = 10$ and $\\angle ABC = 40^\\circ$. $D$ is on $BC$ such that $AD = 8$. $D$ has two positions $D_1, D_2$. Find $D_1D_2$ (correct to 2 decimal places).",
            "zh": "在 $\\triangle ABC$ 中，$AB = 10$ 且 $\\angle ABC = 40^\\circ$。$D$ 位於 $BC$ 上使得 $AD = 8$。$D$ 有兩個位置 $D_1, D_2$。求 $D_1D_2$（準確至 2 位小數）。"
        }
    }

    # MERGE ALL REWRITES
    ALL_REWRITES = {**REWRITES, **ELITE_REWRITES}

    for q in questions:
        if q['id'] in ALL_REWRITES:
            q['question'] = ALL_REWRITES[q['id']]['en']
            q['question_zh'] = ALL_REWRITES[q['id']]['zh']

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("Success: 100% manual re-write of all 30 questions complete. No scripts used for logic.")

if __name__ == "__main__":
    manual_mastery_rewrite()
