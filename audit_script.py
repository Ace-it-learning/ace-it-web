import json
import os

base_path = r"c:\Users\user\Documents\ace-it-web\backend\data\grammar_labs"
files = [f for f in os.listdir(base_path) if f.endswith('.json')]

audit_results = []

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
                
                picked_words = [tokens[idx] if idx < len(tokens) else "OUT_OF_BOUNDS" for idx in indices]
                
                audit_results.append({
                    "file": filename,
                    "topic": topic_id,
                    "level": level,
                    "task_idx": i,
                    "tokens": tokens,
                    "indices": indices,
                    "picked": picked_words,
                    "explanation": explanation
                })
        except Exception as e:
            audit_results.append({
                "file": filename,
                "error": str(e)
            })

with open('audit_grammar_labs.json', 'w', encoding='utf-8') as f:
    json.dump(audit_results, f, indent=2)
