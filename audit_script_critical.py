import json
import os
import re

base_path = r"c:\Users\user\Documents\ace-it-web\backend\data\grammar_labs"
files = [f for f in os.listdir(base_path) if f.endswith('.json')]

audit_report = []

def check_task(filename, topic_id, level, task_idx, tokens, indices, explanation):
    picked = [tokens[idx] for idx in indices]
    issues = []
    
    # 1. Punctuation/Empty Check
    for p in picked:
        if p in [".", ",", ";", ":", "!", "?", "(", ")", "-"]:
            issues.append(f"Picked punctuation: '{p}'")
        if not p.strip():
            issues.append(f"Picked empty/whitespace token: '{p}'")
        if p.startswith(" ") or p.endswith(" "):
            issues.append(f"Sloppy tokenization (whitespace): '{p}'")

    # 2. Topic-Specific Logic
    picked_lower = [p.strip().lower() for p in picked]
    
    if "sva" in topic_id:
        # Should be nouns. If picking "is", "are", "of", "in" - suspicious.
        sus_words = ["is", "are", "was", "were", "has", "have", "of", "in", "at", "on", "with"]
        for p in picked_lower:
            if p in sus_words:
                issues.append(f"SVA: Picking suspect word '{p}' instead of head noun")

    if "countable" in topic_id:
        # Should be quantifiers or nouns.
        pass

    if "tense" in topic_id:
        # Should be verbs or markers.
        pass
        
    if "pronoun" in topic_id:
        # Should be pronouns or antecedents.
        pass

    # 3. Instruction alignment
    # If multiple indices are picked, does it make sense?
    if len(indices) > 5:
         issues.append(f"High number of picked tokens ({len(indices)}) - check if intentional")

    return issues

for filename in files:
    filepath = os.path.join(base_path, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            topic_id = data.get('topic_id', filename)
            level = data.get('level', 'N/A')
            
            tasks = data.get('head_noun_tasks', [])
            for i, task in enumerate(tasks):
                tokens = task.get('sentence_tokens', [])
                indices = task.get('head_noun_indices', [])
                explanation = task.get('explanation', '')
                
                issues = check_task(filename, topic_id, level, i, tokens, indices, explanation)
                if issues:
                    audit_report.append({
                        "file": filename,
                        "task_idx": i,
                        "sentence": " ".join(tokens),
                        "picked": [tokens[idx] for idx in indices],
                        "issues": issues,
                        "explanation": explanation
                    })
                    
            # Audit MCQ consistency
            drills = data.get('drill_tasks', [])
            for i, drill in enumerate(drills):
                if drill.get('type') == 'MCQ':
                    if drill['answer'] not in drill['options']:
                        audit_report.append({
                            "file": filename,
                            "drill_idx": i,
                            "error": f"MCQ answer '{drill['answer']}' not in options {drill['options']}"
                        })

        except Exception as e:
            audit_report.append({
                "file": filename,
                "error": f"JSON Load Error: {str(e)}"
            })

with open('grammar_audit_report.json', 'w', encoding='utf-8') as f:
    json.dump(audit_report, f, indent=2)
