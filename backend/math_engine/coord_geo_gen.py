import random
import json
import sys
import math

def generate_coord_geo_seeds(count=5):
    seeds = []
    
    # helper for SVG axis
    def get_axis_svg(width=400, height=400):
        mid = width // 2
        return f'<line x1="20" y1="{mid}" x2="{width-20}" y2="{mid}" stroke="#94a3b8" stroke-width="1"/><line x1="{mid}" y1="20" x2="{mid}" y2="{height-20}" stroke="#94a3b8" stroke-width="1"/>'

    def plot_point(x, y, label, width=400, height=400, scale=20):
        mid = width // 2
        px = mid + x * scale
        py = mid - y * scale
        return f'<circle cx="{px}" cy="{py}" r="4" fill="#6366f1"/><text x="{px+5}" y="{py-5}" font-size="12" fill="#475569">{label}({x}, {y})</text>'

    def plot_line(p1, p2, width=400, height=400, scale=20):
        mid = width // 2
        x1, y1 = mid + p1[0] * scale, mid - p1[1] * scale
        x2, y2 = mid + p2[0] * scale, mid - p2[1] * scale
        return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#6366f1" stroke-width="2"/>'

    # 1. EASY: Distance & Midpoint (1/4 of count)
    for _ in range(max(1, count // 4)):
        x1, y1 = random.randint(-5, 2), random.randint(-5, 5)
        dx, dy = random.choice([(3,4), (5,12), (8,15), (7,24)])
        if random.random() > 0.5: dx = -dx
        if random.random() > 0.5: dy = -dy
        x2, y2 = x1 + dx, y1 + dy
        dist = int(math.sqrt(dx**2 + dy**2))
        
        svg = f'<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">{get_axis_svg()}{plot_line((x1,y1), (x2,y2))}{plot_point(x1,y1,"A")}{plot_point(x2,y2,"B")}</svg>'
        seeds.append(f"[Easy] Topic: Distance Formula. Find distance between A({x1}, {y1}) and B({x2}, {y2}). Answer: {dist}. SVG: {svg}")

    # 2. MEDIUM: Section Formula & Slopes (1/4 of count)
    for _ in range(max(1, count // 4)):
        x1, y1 = random.randint(-4, 4), random.randint(-4, 4)
        m_num = random.randint(-3, 3)
        m_den = random.randint(1, 4)
        if m_num == 0: m_num = 1
        x2, y2 = x1 + m_den * 2, y1 + m_num * 2
        
        svg = f'<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">{get_axis_svg()}{plot_line((x1,y1), (x2,y2))}{plot_point(x1,y1,"P")}{plot_point(x2,y2,"Q")}</svg>'
        seeds.append(f"[Medium] Topic: Slope of Line. Find the slope of the line passing through P({x1}, {y1}) and Q({x2}, {y2}). Answer: {m_num}/{m_den}. SVG: {svg}")

    # 3. DSE STANDARD: Equations of lines (1/4 of count)
    for _ in range(max(1, count // 4)):
        x1, y1 = random.randint(-3, 3), random.randint(-3, 3)
        m_num = random.randint(-2, 2) or 1
        m_den = random.randint(1, 3)
        c = m_den * y1 - m_num * x1
        sign = "+" if c >= 0 else "-"
        eq = f"{m_num}x - {m_den}y {sign} {abs(c)} = 0".replace("- -", "+ ").replace("+ -", "- ")
        
        seeds.append(f"[DSE Standard] Topic: Equation of Line. Find the equation of line L passing through ({x1}, {y1}) with slope {m_num}/{m_den} in general form. Answer: {eq}. SVG: None")

    # 4. ELITE: Points of intersection / Perpendicular bisectors (1/4 of count)
    for _ in range(max(1, count - len(seeds))):
        seeds.append(f"[Elite] Topic: Point of Intersection. Line L1: 2x + 3y - 6 = 0. Line L2: x - y + 2 = 0. Find their intersection. Answer: (0, 2). SVG: None")

    random.shuffle(seeds)
    return seeds[:count]

if __name__ == "__main__":
    try:
        # Standard input pattern for MathEngineBridge
        raw_input = sys.stdin.buffer.read().decode('utf-8-sig').strip()
        params = json.loads(raw_input) if raw_input else {}
        count = params.get('count', 5)
        
        seeds = generate_coord_geo_seeds(count)
        print(json.dumps(seeds))
    except Exception as e:
        # Handle failures gracefully for the Bridge
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
