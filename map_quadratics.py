import json
import os

def map_quadratics():
    input_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_alg_quadratics_questions.json'
    
    with open(input_path, 'r', encoding='utf-16') as f:
        data = json.load(f)
        
    mapped_data = []
    for i, q in enumerate(data):
        level = q['level']
        # Assign marks: 2 for level 3, 3 for level 4, 4 for levels 5 and 7
        if level == 3:
            marks = 2
        elif level == 4:
            marks = 3
        else: # level 5 or 7
            marks = 4
            
        mapped_q = {
            "id": f"quad_eq_{(i + 1):02d}",
            "topic_id": "math_alg_quadratics",
            "subject": "maths",
            "level": level,
            "type": "short_answer",
            "marks": marks,
            "question": q['question'],
            "question_zh": q['question_zh'],
            "answer": q['answer'],
            "correct_answer": q['answer'],
            "solution_steps": q['steps'],
            "solution_steps_zh": q['steps_zh']
        }
        mapped_data.append(mapped_q)
        
    output_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_alg_quadratics_final_mapped.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(mapped_data, f, indent=2, ensure_ascii=False)
    print(f"Mapped data saved to {output_path}")

if __name__ == "__main__":
    map_quadratics()
