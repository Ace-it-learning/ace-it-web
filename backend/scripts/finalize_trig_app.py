import json
import re

def finalize_module():
    file_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_trig_app_questions.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # 1. FIXED SVGS FOR Q18 & Q19
    q18_svg = """<svg viewBox='0 0 400 300' xmlns='http://www.w3.org/2000/svg'><circle cx='200' cy='150' r='100' fill='#f8f9fa' stroke='#333' stroke-width='2'/><circle cx='200' cy='150' r='3' fill='#333'/><text x='195' y='145' font-size='12'>O</text><line x1='200' y1='150' x2='113' y2='100' stroke='#333' stroke-width='1.5'/><line x1='200' y1='150' x2='287' y2='100' stroke='#333' stroke-width='1.5'/><line x1='113' y1='100' x2='287' y2='100' stroke='#007bff' stroke-width='2.5'/><text x='100' y='95' font-weight='bold'>A</text><text x='290' y='95' font-weight='bold'>B</text><path d='M 183,140 A 20,20 0 0 1 217,140' fill='none' stroke='#ffc107' stroke-width='2'/><text x='190' y='130' font-size='12' fill='#ffc107'>120°</text><path d='M 113,100 A 100,100 0 0 1 287,100' fill='#007bff' opacity='0.2'/><text x='200' y='270' font-size='12' fill='#6c757d'>Radius = 6 cm</text></svg>"""
    
    q19_svg = """<svg viewBox='0 0 500 250' xmlns='http://www.w3.org/2000/svg'><line x1='50' y1='200' x2='450' y2='200' stroke='#333' stroke-width='2'/><line x1='400' y1='200' x2='400' y2='50' stroke='#333' stroke-width='6'/><text x='410' y='45' font-weight='bold'>Cliff</text><line x1='400' y1='50' x2='100' y2='200' stroke='#007bff' stroke-width='2'/><line x1='400' y1='50' x2='250' y2='200' stroke='#dc3545' stroke-width='2'/><text x='90' y='220' font-weight='bold'>P</text><text x='255' y='220' font-weight='bold'>Q</text><text x='175' y='215' font-size='12'>50m</text><path d='M 130,200 A 30,30 0 0 0 120,187' fill='none' stroke='#007bff'/><text x='135' y='190' font-size='12' fill='#007bff'>25°</text><path d='M 280,200 A 30,30 0 0 0 270,183' fill='none' stroke='#dc3545'/><text x='285' y='190' font-size='12' fill='#dc3545'>40°</text></svg>"""

    for q in questions:
        if q['id'] == 'trig_app_18': q['visual'] = q18_svg
        if q['id'] == 'trig_app_19': q['visual'] = q19_svg
        
        # 2. KATEX HARDENING
        def fix_math(text):
            if not isinstance(text, str): return text
            # Ensure degree symbols in math blocks are consistent
            text = text.replace('^\\circ', '^°').replace('\\circ', '°')
            # Protect existing $ blocks but ensure internal variables are italicized if standalone?
            # Actually, the user wants "No AI Lazy", so I'll manually ensure labels are $...$
            # Fix standalone A, B, C, P, Q, R, X, Y, h, x
            vars_to_wrap = ['A', 'B', 'C', 'P', 'Q', 'R', 'X', 'Y', 'h', 'x', 'a', 'b', 'c', 'PQ', 'QR', 'PR', 'AB', 'BC', 'AC', 'VA', 'VB', 'VC', 'VO']
            for v in vars_to_wrap:
                # Regex for standalone variables (not inside $ and not part of a larger word or chemical symbol)
                # Word boundary \b is useful here
                pattern = f'(?<![\\$\\w]){v}(?![\\$\\w])'
                text = re.sub(pattern, f'${v}$', text)
            
            # Ensure triangles are $\triangle ABC$
            text = text.replace('triangle ABC', '$\\triangle ABC$').replace('Triangle ABC', '$\\triangle ABC$')
            text = text.replace('triangle PQR', '$\\triangle PQR$')
            
            # Remove redundant $$ (Double dollar fix)
            text = text.replace('$$', '$')
            # Fix double-escaping for JSON (backend needs \\sin but stored as \sin in memory)
            # Actually json.dump handles \ to \\ escaping automatically.
            return text

        q['question'] = fix_math(q.get('question', ''))
        q['question_zh'] = fix_math(q.get('question_zh', ''))

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("Success: Q18/Q19 SVGs corrected and KaTeX hardened.")

if __name__ == "__main__":
    finalize_module()
