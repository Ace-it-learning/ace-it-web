#!/usr/bin/env python3
"""
Fix LaTeX errors and replace ___USD___ markers in integrated_batch_1.json
"""

import json
import os
from pathlib import Path

def main():
    data_path = Path(__file__).parent.parent / "data" / "maths" / "integrated_batch_1.json"
    
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} questions")
    
    for i, q in enumerate(data):
        # Fix ___USD___ in question_en
        if 'question_en' in q and '___USD___' in q['question_en']:
            q['question_en'] = q['question_en'].replace('___USD___', 'US$')
            print(f"Fixed USD in question_en of {q.get('id')}")
        
        # Fix ___USD___ in question_zh
        if 'question_zh' in q and '___USD___' in q['question_zh']:
            q['question_zh'] = q['question_zh'].replace('___USD___', '')
            print(f"Fixed USD in question_zh of {q.get('id')}")
        
        # Fix ___USD___ in solution_steps_en
        if 'solution_steps_en' in q:
            for j, step in enumerate(q['solution_steps_en']):
                if '___USD___' in step:
                    q['solution_steps_en'][j] = step.replace('___USD___', 'US$')
                    print(f"Fixed USD in solution_steps_en[{j}] of {q.get('id')}")
        
        # Fix ___USD___ in solution_steps_zh
        if 'solution_steps_zh' in q:
            for j, step in enumerate(q['solution_steps_zh']):
                if '___USD___' in step:
                    q['solution_steps_zh'][j] = step.replace('___USD___', '')
                    print(f"Fixed USD in solution_steps_zh[{j}] of {q.get('id')}")
        
        # Fix LaTeX over-escaped \\text to \text
        for field in ['question_en', 'question_zh']:
            if field in q:
                # Replace \\\\text with \\text (reduce double escapes)
                original = q[field]
                # This is tricky because JSON already has escapes
                # We'll just ensure proper LaTeX
                if '\\\\text{' in original:
                    q[field] = original.replace('\\\\text{', '\\text{')
                    print(f"Fixed LaTeX \\\\text in {field} of {q.get('id')}")
    
    # Write back
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Successfully fixed {len(data)} questions")
    print(f"Saved to {data_path}")

if __name__ == '__main__':
    main()