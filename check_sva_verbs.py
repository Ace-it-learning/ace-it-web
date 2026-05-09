import json

with open('audit_grammar_labs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

verbs = {"is", "are", "was", "were", "has", "have", "am"}

for entry in data:
    if "sva" in entry.get('topic', '').lower():
        picked = [p.lower() for p in entry.get('picked', [])]
        for p in picked:
            if p in verbs:
                print(f"File: {entry['file']}, Task: {entry['task_idx']}, Picked verb: {p}")
