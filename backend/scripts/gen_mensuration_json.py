import json
import sys
import os

# Add math_engine to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'math_engine'))
from mensuration_gen import MensurationGenerator

def generate_json():
    gen = MensurationGenerator()
    raw_questions = gen.generate_all()
    
    formatted_questions = []
    
    for i, q in enumerate(raw_questions):
        level_map = {"Easy": 3, "Medium": 4, "DSE Standard": 5, "Elite": 7}
        
        formatted = {
            "id": f"v1_mensuration_{i+1}",
            "topic_id": "math_mensuration",
            "subject": "Maths",
            "level": level_map.get(q["difficulty"], 3),
            "type": "short_answer",
            "marks": 3 if q["difficulty"] == "Easy" else 4,
            "is_factory": True,
            "is_released": True,
            "standard_version": "3.0",
            "meta": { "topic": "math_mensuration", "syllabus_layer": "DSE Level" if level_map.get(q["difficulty"], 3) > 3 else "Foundational" },
            "sub_topic": "Mensuration",
            "difficulty": q["difficulty"].lower(),
            "question": q["question"],
            "question_zh": q["question_zh"],
            "answer": q["final_answer"].replace("approx", "≈"),
            "correct_answer": q["final_answer"],
            "solution_steps": q["solution_steps"],
            "solution_steps_zh": q["solution_steps_zh"],
            "grading_rubric": [f"M1: Correct substitution", f"A1: Final answer {q['final_answer']}"],
            "is_approved": False,
            "diagram_svg": q["diagram_svg"]
        }
        formatted_questions.append(formatted)
    
    output_path = os.path.join(os.path.dirname(__file__), '..', 'math_engine', 'mensuration_validation.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(formatted_questions, f, indent=2, ensure_ascii=False)
    
    return formatted_questions

if __name__ == "__main__":
    questions = generate_json()
    print(json.dumps(questions))
