import json
import os
import re

def fix_trig_json():
    file_path = os.path.join('backend', 'data', 'math_content', 'math_trig_ratios_questions.json')
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # Question mapping based on user description vs actual IDs
    # User Question 19 (Distance between cars, altitude 100m) -> trig_v3_19
    # User Question 9 (5m ladder) -> trig_v3_08
    # User Question 10 (50m tower) -> trig_v3_09
    visual_null_ids = {"trig_v3_08", "trig_v3_09", "trig_v3_19"}

    for q in questions:
        # 1. Remove Hallucinated SVGs
        if q['id'] in visual_null_ids:
            q['visual'] = "" # Setting to empty string as per current schema pattern, or null if preferred.
            print(f"🚫 Nullified visual for {q['id']}")

        # 2. Fix SVG LaTeX (Replace with Unicode)
        if q.get('visual'):
            # Replace degree symbol variants
            q['visual'] = q['visual'].replace('^\\circ', '°').replace('^\\circ', '°').replace('^{\\circ}', '°')
            # Replace theta variants
            q['visual'] = q['visual'].replace('\\\\theta', 'θ').replace('\\theta', 'θ')

        # 3. Fix Empty $$ Answer Bug (Strip delimiters)
        if q.get('answer'):
            q['answer'] = q['answer'].replace('$', '').strip()
        if q.get('correct_answer'):
            q['correct_answer'] = q['correct_answer'].replace('$', '').strip()

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Successfully patched {len(questions)} questions in {file_path}")

if __name__ == "__main__":
    fix_trig_json()
