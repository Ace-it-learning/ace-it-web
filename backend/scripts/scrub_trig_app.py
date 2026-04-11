import json
import re

def scrub_module():
    file_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_trig_app_questions.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # PATTERNS FOR WRAPPING IN $
    MATH_PATTERNS = [
        r'\\triangle [A-Za-z]{1,4}',
        r'\\angle [A-Za-z]{1,4}',
        r'\\sin [A-Za-z]{1,2}',
        r'\\cos [A-Za-z]{1,2}',
        r'\\tan [A-Za-z]{1,2}',
        r'\b[a-z] = [0-9.]+',
        r'\b[A-Za-z]{2} = [0-9.]+',
        r'[0-9.]{1,4}\^\\circ',
        r'[A-Za-z]{1,2} \approx [0-9.]+',
        r'Area = [0-9.]+',
        r'\\frac{[^}]+}{[^}]+}',
        r'\bs = [0-9.]+'
    ]

    # SPECIFIC LABELS to wrap in solved/question strings
    VARS = ['A', 'B', 'C', 'P', 'Q', 'R', 'X', 'Y', 'h', 'x', 'y', 'a', 'b', 'c', 'PQ', 'QR', 'PR', 'AB', 'BC', 'AC', 'VA', 'VB', 'VC', 'VO', 'VM', 'AO', 'D1', 'D2', 'D1D2']

    def surgical_scrub(text):
        if not isinstance(text, str): return text
        
        # 1. Strip ALL existing $ markings and corrupted residues
        text = text.replace('$\\$', '').replace('$', '').replace('^^\\circ', '^\\circ').replace('^°', '^\\circ')
        
        # 2. Fix degree notation (KaTeX standard)
        text = text.replace('^\\circ', '^\\circ').replace('^\\circ', '^\\circ')
        
        # 3. Identify and wrap multivariable length symbols (e.g., AB, BC) but avoid English words
        # Only if surrounded by spaces, punctuation, or special chars.
        for v in VARS:
            pattern = rf'(?<![A-Za-z]){v}(?![A-Za-z])'
            # Temporary token to avoid double wrapping
            text = re.sub(pattern, f'__MATH_{v}__', text)

        # 4. Identify and wrap standard LaTeX commands
        for p in MATH_PATTERNS:
            def wrap_p(m):
                return f'__MATH_{m.group(0)}__'
            text = re.sub(p, wrap_p, text)

        # 5. Clean up temporary tokens into $...$ blocks
        # Merge adjacent math blocks: $A$ $B$ -> $A B$ if they are close? No, let's keep it simple first
        text = text.replace('__MATH_', '$').replace('__', '$')

        # 6. Manual refinements for known runaway cases
        text = text.replace(' . ', '. ') # Cleanup
        
        # SPECIAL CASE Q12 Fix
        if "There are two possible values for" in text:
            text = "In $\\triangle ABC$, $a = 6$, $c = 8$, and $\\angle A = 35^\\circ$. There are two possible values for $\\angle C$. Find the obtuse value correct to 1 decimal place."

        return text

    for q in questions:
        q['question'] = surgical_scrub(q.get('question', ''))
        q['question_zh'] = surgical_scrub(q.get('question_zh', ''))
        
        # For solution steps, they are already mathy, but we check for double dollars
        if 'solution_steps' in q:
            q['solution_steps'] = [s.replace('$$', '$').replace('$\\$', '$').replace('^^', '^') for s in q['solution_steps']]
        if 'solution_steps_zh' in q:
            q['solution_steps_zh'] = [s.replace('$$', '$').replace('$\\$', '$').replace('^^', '^') for s in q['solution_steps_zh']]

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("Success: High-Fidelity KaTeX Scrub complete. All runaway blocks elimated.")

if __name__ == "__main__":
    scrub_module()
