import json
import os

base_path = r"c:\Users\user\Documents\ace-it-web\backend\data\grammar_labs"
files = [f for f in os.listdir(base_path) if f.endswith('.json')]

for filename in files:
    filepath = os.path.join(base_path, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    
    # 1. Trim tokens
    if 'head_noun_tasks' in data:
        for task in data['head_noun_tasks']:
            tokens = task.get('sentence_tokens', [])
            new_tokens = [t.strip() for t in tokens]
            if tokens != new_tokens:
                task['sentence_tokens'] = new_tokens
                modified = True
                
    # 2. Specific fix for pronoun_level_7
    if filename == "grammar_accuracy_pronoun_level_7.json":
        # Task 1: change [7] to [6]
        if len(data['head_noun_tasks']) > 1:
            task = data['head_noun_tasks'][1]
            if task['head_noun_indices'] == [7]:
                task['head_noun_indices'] = [6]
                modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Fixed {filename}")
