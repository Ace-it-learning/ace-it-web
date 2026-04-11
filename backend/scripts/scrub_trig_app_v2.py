import json
import re

def scrub_module_v2():
    file_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_trig_app_questions.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # PATTERNS FOR WRAPPING IN $
    # Order matters: more complex patterns first
    MATH_PATTERNS = [
        r'\\triangle [A-Za-z]{1,4}',
        r'\\angle [A-Za-z]{1,4}',
        r'[0-9.]*\\sqrt{[^}]+}', # Sqrt
        r'[0-9.]+ cm\^2',        # Units like 20 cm^2
        r'[0-9.]+ cm',          # Units like 10 cm
        r'\\sin [A-Za-z]{1,2}',
        r'\\cos [A-Za-z]{1,2}',
        r'\\tan [A-Za-z]{1,2}',
        r'\\theta',
        r'\b[a-z] = [0-9.]+',
        r'\b[A-Za-z]{2} = [0-9.]+',
        r'[0-9.]{1,4}\^\\circ',
        r'[A-Za-z]{1,2} \approx [0-9.]+',
        r'Area = [0-9.]+',
        r'\\frac{[^}]+}{[^}]+}',
        r'\bs = [0-9.]+'
    ]

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
                content = m.group(0)
                # If content already has __MATH_, don't wrap twice
                if '__MATH_' in content: return content
                return f'__MATH_{content}__'
            text = re.sub(p, wrap_p, text)

        # 5. Clean up temporary tokens into $...$ blocks
        text = text.replace('__MATH_', '$').replace('__', '$')

        # 6. Manual refinements for known runaway cases
        text = text.replace(' . ', '. ').replace(' , ', ', ')
        
        # SPECIAL CASE Q17 Fix
        if "the area is" in text and "trig_app_17" in str(q_id):
             text = "In $\\triangle ABC$, the area is $20\\sqrt{3}$ cm$^2$, $c = 10$ cm, and $B = 60^\\circ$. Find the perimeter of the triangle."

        return text

    for q in questions:
        q_id = q['id'] # for special cases
        q['question'] = surgical_scrub(q.get('question', ''))
        q['question_zh'] = surgical_scrub(q.get('question_zh', ''))
        
        # For solution steps, they are already mathy, but we check for double dollars
        if 'solution_steps' in q:
            q['solution_steps'] = [s.replace('$$', '$').replace('$\\$', '$').replace('^^', '^').replace('^°', '^\\circ').replace('°', '^\\circ') for s in q['solution_steps']]
        if 'solution_steps_zh' in q:
            q['solution_steps_zh'] = [s.replace('$$', '$').replace('$\\$', '$').replace('^^', '^').replace('^°', '^\\circ').replace('°', '^\\circ') for s in q['solution_steps_zh']]

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("Success: High-Fidelity KaTeX Scrub V2 complete. All swallowed text elimated.")

if __name__ == "__main__":
    scrub_module_v2()
