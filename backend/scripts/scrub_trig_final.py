import json
import re

def scrub_trig_final():
    file_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_trig_app_questions.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # RULE 1: Remove SVGs for word problems, 3D shapes, bearings
    # SHIP, PLANE, HIKER, TOWER, CLIFF, LADDER, PYRAMID, CUBOID, PRISM, BEARING
    REMOVAL_KEYWORDS = [
        'ship', 'plane', 'hiker', 'tower', 'cliff', 'ladder', 
        'pyramid', 'cuboid', 'prism', 'bearing', 'pilot', 'helicopter',
        '船', '飛機', '遠足者', '塔', '懸崖', '梯子', '錐體', '長方體', '棱柱', '方位'
    ]

    for q in questions:
        q_text = (q.get('question', '') + ' ' + q.get('question_zh', '')).lower()
        if any(keyword in q_text for keyword in REMOVAL_KEYWORDS):
            q['visual'] = None

        # RULE 2: Fix Remaining SVGs (LaTeX to Unicode)
        if q['visual']:
            # Replace ^\circ, ^{\circ}, ^\\circ with °
            q['visual'] = re.sub(r'(\^\\?circ|\^\{\\?circ\})', '°', q['visual'])
            # Replace \theta, \\theta with θ
            q['visual'] = re.sub(r'\\+theta', 'θ', q['visual'])

        # RULE 3: Fix Answer Bug (Strip math delimiters)
        for field in ['answer', 'correct_answer']:
            if q.get(field):
                q[field] = q[field].replace('$', '').strip()

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("Success: Final surgical scrub applied to 30 math questions.")

if __name__ == "__main__":
    scrub_trig_final()
