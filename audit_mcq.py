import json
import os

base_path = r"c:\Users\user\Documents\ace-it-web\backend\data\grammar_labs"
files = [f for f in os.listdir(base_path) if f.endswith('.json')]

mcq_audit = []

for filename in files:
    filepath = os.path.join(base_path, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    drills = data.get('drill_tasks', [])
    for i, drill in enumerate(drills):
        if drill.get('type') == 'MCQ':
            answer = drill.get('answer', '').lower()
            explanation = drill.get('explanation', '').lower()
            options = [o.lower() for o in drill.get('options', [])]
            
            # 1. Answer in options check
            if answer not in options:
                mcq_audit.append(f"{filename} Drill {i}: Answer '{answer}' not in options {options}")
            
            # 2. Contradiction check (e.g. answer is singular, explanation says plural)
            singular_words = ["is", "has", "was", "does", "singular"]
            plural_words = ["are", "have", "were", "do", "plural"]
            
            # This is tricky fuzzy logic, let's just look for direct contradictions
            if answer == "is" and "plural" in explanation and "singular" not in explanation:
                mcq_audit.append(f"{filename} Drill {i}: Answer 'is' but explanation mentions 'plural'")
            if answer == "are" and "singular" in explanation and "plural" not in explanation:
                mcq_audit.append(f"{filename} Drill {i}: Answer 'are' but explanation mentions 'singular'")
                
            # 3. Check if the answer itself is mentioned in the explanation (should usually be)
            # if answer not in explanation and len(answer) > 2:
            #    mcq_audit.append(f"{filename} Drill {i}: Answer '{answer}' not mentioned in explanation")

with open('mcq_audit.txt', 'w', encoding='utf-8') as out:
    for line in mcq_audit:
        out.write(line + "\n")
