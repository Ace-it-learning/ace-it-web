import json
import re

def repair_module():
    file_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_trig_app_questions.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # 1. Improved Q12 Diagram
    q12_svg = """<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><line x1='50' y1='220' x2='450' y2='220' stroke='#333' stroke-width='2'/><text x='45' y='235' font-size='14'>B</text><line x1='100' y1='220' x2='250' y2='80' stroke='#333' stroke-width='3'/><text x='245' y='75' font-weight='bold'>A</text><path d='M 125,220 A 25,25 0 0 0 115,200' fill='none' stroke='#333' stroke-width='2'/><text x='130' y='210' font-size='14' font-weight='600'>35°</text><line x1='250' y1='80' x2='150' y2='220' stroke='#dc3545' stroke-width='2.5'/><text x='125' y='235' font-size='16' fill='#dc3545' font-weight='bold'>C (Obtuse)</text><line x1='250' y1='80' x2='350' y2='220' stroke='#6c757d' stroke-width='2' stroke-dasharray='5,3'/><text x='355' y='235' font-size='14' fill='#6c757d'>C' (Acute)</text><text x='140' y='140' font-size='14' font-weight='bold'>c = 8</text><text x='230' y='140' font-size='14' fill='#dc3545' font-weight='bold'>a = 6</text></svg>"""

    for q in questions:
        if q['id'] == 'trig_app_12':
            q['visual'] = q12_svg
            
        def clean_katex(text):
            if not isinstance(text, str): return text
            # Step 1: Remove double-nested $
            # Fix $\$\\triangle ABC$ -> $\triangle ABC$
            text = text.replace('$\\$\\triangle ABC$', '$\\triangle ABC$')
            text = text.replace('$\\angle $A$', '$\\angle A$')
            text = text.replace('$\\angle $C$', '$\\angle C$')
            
            # Step 2: Global Cleanup of double dollars created by aggressive regex
            text = text.replace('$$', '$')
            
            # Step 3: FIX the caret degree symbols. Revert to ^\circ for KaTeX inside $ blocks
            # But the user saw ^^ \circ. This means the caret was outside or double.
            # I will standardize to ^\circ for KaTeX blocks.
            text = text.replace('^°', '^\\circ')
            text = text.replace('^^ \\circ', '^\\circ')
            text = text.replace('^ \\circ', '^\\circ')
            text = text.replace('^\\circ', '^\\circ')

            # Final check: Remove any trailing/dangling $ marks if they look lonely
            # Only if they were accidental residues.
            
            # Additional cleanup for the specific broken line in Q12
            if "and \\angle A = 35" in text:
                text = "In $\\triangle ABC$, $a = 6$, $c = 8$, and $\\angle A = 35^\\circ$. There are two possible values for $\\angle C$. Find the obtuse value correct to 1 decimal place."
            
            return text

        # Apply to question and question_zh
        q['question'] = clean_katex(q.get('question', ''))
        q['question_zh'] = clean_katex(q.get('question_zh', ''))

        # Also Fix degree symbols in solution_steps
        if 'solution_steps' in q:
            q['solution_steps'] = [s.replace('^°', '^\\circ').replace('°', '^\\circ').replace('^^\\circ', '^\\circ') for s in q['solution_steps']]
        if 'solution_steps_zh' in q:
            q['solution_steps_zh'] = [s.replace('^°', '^\\circ').replace('°', '^\\circ').replace('^^\\circ', '^\\circ') for s in q['solution_steps_zh']]

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("Success: KaTeX sanitized and Q12 diagram polished.")

if __name__ == "__main__":
    repair_module()
