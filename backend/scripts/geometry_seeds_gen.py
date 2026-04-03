import random
import json
import sys

def generate_v2_rectilinear_seeds():
    seeds = []
    
    # LEVEL 1: Easy (Basic Polygons) - 5 Questions
    # Testing (n-2)*180 and 360/n
    for _ in range(3):
        n = random.randint(5, 12)
        ans = (n - 2) * 180
        seeds.append(f"[Easy] Topic: Polygon Interior Angles. Given: A convex polygon has {n} sides. Find the sum of its interior angles. Answer: {ans}^\\circ. Steps: Sum = ({n}-2) \\times 180^\\circ = {ans}^\\circ. SVG: None")
    
    for _ in range(2):
        valid_n = [5, 6, 8, 9, 10, 12, 15, 18]
        n = random.choice(valid_n)
        ans = 360 // n
        seeds.append(f"[Easy] Topic: Regular Polygon Exterior. Given: A regular {n}-sided polygon. Find the size of one exterior angle. Answer: {ans}^\\circ. Steps: Ext angle = 360^\\circ / {n} = {ans}^\\circ. SVG: None")

    # LEVEL 2: Medium (Ratios & Algebra in Polygons) - 5 Questions
    # Testing DSE Ratio Traps and Reverse Algebra
    for _ in range(3):
        n = random.choice([5, 6])
        if n == 5:
            ratios = [2, 3, 4, 4, 5] # Sum = 18, 540/18 = 30
            largest_part = 5
            ans = 5 * 30
            ratio_str = "2:3:4:4:5"
        else:
            ratios = [3, 4, 4, 5, 5, 9] # Sum = 30, 720/30 = 24
            largest_part = 9
            ans = 9 * 24
            ratio_str = "3:4:4:5:5:9"
        
        seeds.append(f"[Medium] Topic: Polygon Angle Ratios. Given: The interior angles of an {n}-sided polygon are in the ratio {ratio_str}. Find the largest interior angle. Answer: {ans}^\\circ. Steps: Sum = ({n}-2) \\times 180^\\circ. Let angles be 2k, 3k, etc. Sum of parts = {sum(ratios)}. Largest = {largest_part}/{sum(ratios)} \\times sum. SVG: None")

    for _ in range(2):
        n = random.randint(8, 15)
        ext = 360 // n
        int_ang = 180 - ext
        seeds.append(f"[Medium] Topic: Finding Number of Sides. Given: Each interior angle of a regular polygon is {int_ang}^\\circ. Find the number of sides. Answer: {n}. Steps: Ext angle = 180^\\circ - {int_ang}^\\circ = {ext}^\\circ. Number of sides n = 360^\\circ / {ext}^\\circ = {n}. SVG: None")

    # LEVEL 3: DSE Standard (Similarity & Congruence Algebra) - 5 Questions
    # Testing Int = k * Ext (Classic DSE) and Similar Triangles Side Ratios
    for _ in range(3):
        k = random.randint(3, 6)
        n = 2 * k + 2
        seeds.append(f"[DSE Standard] Topic: Int vs Ext Sum. Given: The sum of the interior angles of a regular polygon is {k} times the sum of its exterior angles. Find the number of sides. Answer: {n}. Steps: (n-2) \\times 180^\\circ = {k} \\times 360^\\circ. n-2 = {k} \\times 2. n = {n}. SVG: None")

    for _ in range(2):
        scale = random.randint(2, 4)
        ab, bc = random.randint(3, 6), random.randint(4, 8)
        xy, yz = ab * scale, bc * scale
        seeds.append(f"[DSE Standard] Topic: Similar Triangles Sides. Given: \\triangle ABC \\sim \\triangle XYZ. AB = {ab} cm, BC = {bc} cm, XY = {xy} cm. Find YZ. Answer: {yz} cm. Steps: AB/XY = BC/YZ (corr. sides, \\sim \\triangle s). {ab}/{xy} = {bc}/YZ. YZ = {yz}. SVG: None")

    # LEVEL 4: Elite (Complex Ratios & Overlapping Triangles) - 5 Questions
    # Requires SVG diagrams for overlapping parallel lines
    for _ in range(3):
        # AX/AB = XY/BC -> AX/(AX+XB) = XY/BC
        ax = random.randint(2, 4)
        xb = random.randint(2, 4)
        scale = random.randint(2, 3)
        xy = ax * scale
        bc = (ax + xb) * scale
        
        svg = f"""<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg"><polygon points="150,30 50,220 250,220" fill="none" stroke="#333" stroke-width="2"/><line x1="100" y1="125" x2="200" y2="125" stroke="#333" stroke-width="2"/><polygon points="150,120 160,125 150,130" fill="#333"/><polygon points="150,215 160,220 150,225" fill="#333"/><text x="145" y="20">A</text><text x="30" y="230">B</text><text x="260" y="230">C</text><text x="80" y="125">X</text><text x="215" y="125">Y</text><text x="65" y="100">{ax}</text><text x="60" y="180">{xb}</text><text x="145" y="115">{xy}</text></svg>"""
        
        seeds.append(f"[Elite] Topic: Overlapping Similar Triangles. Given: In \\triangle ABC, XY \\parallel BC. AX = {ax}, XB = {xb}, XY = {xy}. Find BC. Answer: {bc}. Steps: \\triangle AXY \\sim \\triangle ABC. AX/AB = XY/BC. {ax}/({ax}+{xb}) = {xy}/BC. BC = {bc}. SVG: {svg}")

    # Area Ratio (Classic DSE tricky question)
    for _ in range(2):
        side_ratio_a, side_ratio_b = 2, 3
        area_a = 12
        area_b = int(area_a * (side_ratio_b ** 2) / (side_ratio_a ** 2)) # 12 * 9 / 4 = 27
        seeds.append(f"[Elite] Topic: Area Ratio of Similar Figures. Given: \\triangle ABC \\sim \\triangle PQR. The ratio of their corresponding sides is {side_ratio_a}:{side_ratio_b}. If the area of \\triangle ABC is {area_a} cm^2, find the area of \\triangle PQR. Answer: {area_b} cm^2. Steps: Area1/Area2 = (Side1/Side2)^2. {area_a}/Area2 = ({side_ratio_a}/{side_ratio_b})^2 = {side_ratio_a**2}/{side_ratio_b**2}. Area2 = {area_b}. SVG: None")

    return seeds

if __name__ == "__main__":
    count = 20
    if len(sys.argv) > 1:
        try:
            count = int(sys.argv[1])
        except ValueError:
            pass
            
    all_seeds = generate_v2_rectilinear_seeds()
    # If count is 20, we just return the pool which is exactly 20
    print(json.dumps(all_seeds[:count]))
