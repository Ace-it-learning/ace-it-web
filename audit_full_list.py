import json
import os

base_path = r"c:\Users\user\Documents\ace-it-web\backend\data\grammar_labs"
files = [f for f in os.listdir(base_path) if f.endswith('.json')]

with open('full_picked_audit.txt', 'w', encoding='utf-8') as out:
    for filename in files:
        filepath = os.path.join(base_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            out.write(f"FILE: {filename}\n")
            tasks = data.get('head_noun_tasks', [])
            for i, task in enumerate(tasks):
                tokens = task.get('sentence_tokens', [])
                indices = task.get('head_noun_indices', [])
                picked = [f"[{idx}]{tokens[idx]}" if idx < len(tokens) else "ERR" for idx in indices]
                out.write(f"  Task {i}: {' '.join(picked)}\n")
            out.write("\n")
