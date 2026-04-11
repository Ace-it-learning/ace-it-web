import json
import os

def patch_trig_data():
    file_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_trig_app_questions.json'
    
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    patched_count = 0
    for q in questions:
        # 1. Convert solution_steps to array
        if isinstance(q.get('solution_steps'), str):
            q['solution_steps'] = [step.strip() for step in q['solution_steps'].split('\n') if step.strip()]
        
        if isinstance(q.get('solution_steps_zh'), str):
            q['solution_steps_zh'] = [step.strip() for step in q['solution_steps_zh'].split('\n') if step.strip()]
            
        # 2. Fix SVG degree symbols
        if q.get('visual'):
            q['visual'] = q['visual'].replace('^\\\\circ', '°').replace('\\\\circ', '°').replace('^\\circ', '°')
            
        patched_count += 1

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print(f"Successfully patched {patched_count} questions in {file_path}.")

if __name__ == "__main__":
    patch_trig_data()
