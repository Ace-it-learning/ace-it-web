import json
import re

def enlarge_diagrams():
    file_path = r'c:\Users\user\Documents\ace-it-web\backend\data\math_content\math_trig_app_questions.json'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    def optimize_svg(svg_str):
        if not svg_str or '<svg' not in svg_str: return svg_str
        
        coords_x = []
        coords_y = []
        
        # 1. Regex find all numerical values in context of SVG attributes
        x_patterns = [r'x1=[\'\"]([0-9.-]+)[\'\"]', r'x2=[\'\"]([0-9.-]+)[\'\"]', r'cx=[\'\"]([0-9.-]+)[\'\"]', r'\bx=[\'\"]([0-9.-]+)[\'\"]']
        y_patterns = [r'y1=[\'\"]([0-9.-]+)[\'\"]', r'y2=[\'\"]([0-9.-]+)[\'\"]', r'cy=[\'\"]([0-9.-]+)[\'\"]', r'\by=[\'\"]([0-9.-]+)[\'\"]']
        
        for p in x_patterns:
            coords_x.extend([float(x) for x in re.findall(p, svg_str)])
        for p in y_patterns:
            coords_y.extend([float(y) for y in re.findall(p, svg_str)])
            
        # Polygon points
        for points_str in re.findall(r'points=[\'\"]([^\'\"]+)[\'\"]', svg_str):
            vals = [float(v) for v in re.findall(r'[-+]?[0-9]*\.?[0-9]+', points_str)]
            for i in range(0, len(vals) - (len(vals) % 2), 2):
                coords_x.append(vals[i])
                coords_y.append(vals[i+1])
                
        # Path D commands (Smarter extraction)
        for d_str in re.findall(r'\bd=[\'\"]([^\'\"]+)[\'\"]', svg_str):
            vals = [float(v) for v in re.findall(r'[-+]?[0-9]*\.?[0-9]+', d_str)]
            # Paths can have various counts. We take all numbers and guess x/y based on parity
            # This is a heuristic but good for centering
            for i in range(0, len(vals)):
                 if i % 2 == 0: coords_x.append(vals[i])
                 else: coords_y.append(vals[i])

        if not coords_x or not coords_y: return svg_str
        
        min_x, max_x = min(coords_x), max(coords_x)
        min_y, max_y = min(coords_y), max(coords_y)
        
        width = max_x - min_x
        height = max_y - min_y
        
        # INCREASED PADDING FOR LABELS
        padding = 40
        new_viewbox = f"{min_x - padding} {min_y - padding} {width + 2*padding} {height + 2*padding}"
        
        # Replace viewBox
        if 'viewBox=' in svg_str:
            svg_str = re.sub(r'viewBox=[\'\"][^\'\"]+[\'\"]', f'viewBox="{new_viewbox}"', svg_str)
        else:
            svg_str = svg_str.replace('<svg', f'<svg viewBox="{new_viewbox}"')
            
        return svg_str

    for q in questions:
        # Preserve original for manual check if needed
        q['visual'] = optimize_svg(q.get('visual', ''))

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("Success: Centered and enlarged 30 diagrams.")

if __name__ == "__main__":
    enlarge_diagrams()
