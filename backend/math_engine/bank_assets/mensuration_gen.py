import math
import random
import json

def get_sector_pt(cx, cy, r, angle_deg):
    rad = math.radians(angle_deg)
    return f"{cx + r * math.cos(rad):.1f},{cy - r * math.sin(rad):.1f}"

class MensurationGenerator:
    def __init__(self):
        self.questions = []
        self.cx, self.cy = 150, 150

    def generate_all(self):
        # 1-5 EASY
        self.q1_arc_length()
        self.q2_sector_area()
        self.q3_cylinder_volume()
        self.q4_sphere_surface_area()
        self.q5_pyramid_volume()
        
        # 6-10 MEDIUM
        self.q6_sector_perimeter()
        self.q7_hemisphere_surface_area()
        self.q8_cone_volume()
        self.q9_cylinder_csa()
        self.q10_inverse_sector()
        
        # 11-15 DSE STANDARD
        self.q11_similar_solids()
        self.q12_segment_area()
        self.q13_recasting_sphere()
        self.q14_frustum_volume()
        self.q15_shaded_area()
        
        # 16-20 ELITE
        self.q16_rotating_trapezium()
        self.q17_max_vol_cylinder()
        self.q18_tilted_cylinder()
        self.q19_pyramid_base_angle()
        self.q20_complex_interaction()
        
        return self.questions

    def _add_q(self, diff, topic, question, question_zh, svg, steps, steps_zh, answer):
        self.questions.append({
            "difficulty": diff,
            "topic": topic,
            "question": question,
            "question_zh": question_zh,
            "diagram_svg": svg,
            "solution_steps": steps,
            "solution_steps_zh": steps_zh,
            "final_answer": answer
        })

    # ================= EASY =================
    def q1_arc_length(self):
        r = random.randint(6, 15)
        angle = random.randint(40, 120)
        arc = (angle / 360) * 2 * math.pi * r
        p1 = get_sector_pt(self.cx, self.cy, 80, 0)
        p2 = get_sector_pt(self.cx, self.cy, 80, angle)
        svg = f'<svg viewBox="0 0 300 300"><path d="M {self.cx} {self.cy} L {p1} A 80 80 0 0 0 {p2} Z" fill="rgba(59,130,246,0.1)" stroke="#333" stroke-width="2"/><text x="160" y="145">{angle}^\circ</text><text x="180" y="170">r={r}</text></svg>'
        steps = [
            rf"Arc length formula: $L = 2 \pi r \times \frac{{\theta}}{{360^\circ}}$",
            rf"Substitute $r = {r}$ and $\theta = {angle}^\circ$",
            rf"$L = 2 \pi ({r}) \times \frac{{{angle}}}{{360}}$",
            rf"$L \approx {arc:.2f}$ cm"
        ]
        steps_zh = [
            rf"弧長公式：$L = 2 \pi r \times \frac{{\theta}}{{360^\circ}}$",
            rf"代入 $r = {r}$ 及 $\theta = {angle}^\circ$",
            rf"$L = 2 \pi ({r}) \times \frac{{{angle}}}{{360}}$",
            rf"$L \approx {arc:.2f}$ cm"
        ]
        self._add_q("Easy", "Arc Length", 
            f"Find the arc length of a sector with radius {r} cm and angle ${angle}^\circ$. (Take $\pi \\approx 3.14$)", 
            f"求半徑為 {r} cm，圓心角為 ${angle}^\circ$ 的扇形的弧長。(取 $\pi \\approx 3.14$)",
            svg, steps, steps_zh, f"{arc:.2f} cm")

    def q2_sector_area(self):
        r = random.randint(5, 12)
        angle = random.randint(60, 150)
        area = (angle / 360) * math.pi * r**2
        p1 = get_sector_pt(self.cx, self.cy, 80, 30)
        p2 = get_sector_pt(self.cx, self.cy, 80, 30+angle)
        svg = f'<svg viewBox="0 0 300 300"><path d="M {self.cx} {self.cy} L {p1} A 80 80 0 0 0 {p2} Z" fill="rgba(59,130,246,0.3)" stroke="#333" stroke-width="2"/><text x="140" y="130">{angle}^\circ</text><text x="180" y="160">{r} cm</text></svg>'
        steps = [
            rf"Sector Area formula: $A = \pi r^2 \times \frac{{\theta}}{{360^\circ}}$",
            rf"Substitute $r = {r}$ and $\theta = {angle}^\circ$",
            rf"$A = \pi ({r})^2 \times \frac{{{angle}}}{{360}}$",
            rf"$A \approx {area:.2f}$ cm$^2$"
        ]
        steps_zh = [
            rf"扇形面積公式：$A = \pi r^2 \times \frac{{\theta}}{{360^\circ}}$",
            rf"代入 $r = {r}$ 及 $\theta = {angle}^\circ$",
            rf"$A = \pi ({r})^2 \times \frac{{{angle}}}{{360}}$",
            rf"$A \approx {area:.2f}$ cm$^2$"
        ]
        self._add_q("Easy", "Sector Area", 
            f"Calculate the area of a sector with radius {r} cm and central angle ${angle}^\circ$.", 
            f"求半徑為 {r} cm，圓心角為 ${angle}^\circ$ 的扇形的面積。",
            svg, steps, steps_zh, f"{area:.2f} cm^2")

    def q3_cylinder_volume(self):
        r, h = random.randint(3, 7), random.randint(8, 15)
        vol = math.pi * r**2 * h
        svg = f'<svg viewBox="0 0 300 300"><ellipse cx="150" cy="80" rx="40" ry="15" fill="none" stroke="#333" stroke-width="2"/><ellipse cx="150" cy="220" rx="40" ry="15" fill="none" stroke="#333" stroke-width="2"/><line x1="110" y1="80" x2="110" y2="220" stroke="#333" stroke-width="2"/><line x1="190" y1="80" x2="190" y2="220" stroke="#333" stroke-width="2"/><text x="195" y="150">h={h}</text><text x="150" y="90">r={r}</text></svg>'
        steps = [
            rf"Cylinder Volume: $V = \pi r^2 h$",
            rf"Substitute $r = {r}, h = {h}$",
            rf"$V = \pi ({r})^2 ({h})$",
            rf"$V \approx {vol:.2f}$ cm$^3$"
        ]
        steps_zh = [
            rf"圓柱體體積：$V = \pi r^2 h$",
            rf"代入 $r = {r}, h = {h}$",
            rf"$V = \pi ({r})^2 ({h})$",
            rf"$V \approx {vol:.2f}$ cm$^3$"
        ]
        self._add_q("Easy", "Cylinder Volume", 
            f"A cylinder has radius {r} cm and height {h} cm. Find its volume.", 
            f"一直圓柱體，其半徑為 {r} cm 及高為 {h} cm。求其體積。",
            svg, steps, steps_zh, f"{vol:.2f} cm^3")

    def q4_sphere_surface_area(self):
        r = random.randint(4, 10)
        sa = 4 * math.pi * r**2
        svg = f'<svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="70" fill="none" stroke="#333" stroke-width="2"/><ellipse cx="150" cy="150" rx="70" ry="25" fill="none" stroke="#333" stroke-width="1" stroke-dasharray="5,5"/><text x="160" y="145">r={r}</text></svg>'
        steps = [
            rf"Sphere Surface Area: $A = 4 \pi r^2$",
            rf"Substitute $r = {r}$",
            rf"$A = 4 \pi ({r})^2$",
            rf"$A \approx {sa:.2f}$ cm$^2$"
        ]
        steps_zh = [
            rf"球體表面積：$A = 4 \pi r^2$",
            rf"代入 $r = {r}$",
            rf"$A = 4 \pi ({r})^2$",
            rf"$A \approx {sa:.2f}$ cm$^2$"
        ]
        self._add_q("Easy", "Sphere Surface Area", 
            f"Find the surface area of a sphere with radius {r} cm.", 
            f"求一個半徑為 {r} cm 的球體的表面積。",
            svg, steps, steps_zh, f"{sa:.2f} cm^2")

    def q5_pyramid_volume(self):
        base, h = random.randint(6, 12), random.randint(10, 18)
        vol = (1/3) * base**2 * h
        svg = f'<svg viewBox="0 0 300 300"><polygon points="150,50 80,220 220,220" fill="none" stroke="#333" stroke-width="2"/><line x1="150" y1="50" x2="150" y2="220" stroke="#333" stroke-dasharray="5,5"/><text x="155" y="140">h={h}</text><text x="140" y="240">base={base}</text></svg>'
        steps = [
            rf"Pyramid Volume: $V = \frac{{1}}{{3}} \times \text{{Base Area}} \times \text{{Height}}$",
            rf"Base is a square: $\text{{Base Area}} = {base}^2 = {base**2}$",
            rf"$V = \frac{{1}}{{3}} \times {base**2} \times {h}$",
            rf"$V \approx {vol:.2f}$ cm$^3$"
        ]
        steps_zh = [
            rf"棱錐體積：$V = \frac{{1}}{{3}} \times \text{{底面積}} \times \text{{高}}$",
            rf"底面為正方形：$\text{{底面積}} = {base}^2 = {base**2}$",
            rf"$V = \frac{{1}}{{3}} \times {base**2} \times {h}$",
            rf"$V \approx {vol:.2f}$ cm$^3$"
        ]
        self._add_q("Easy", "Pyramid Volume", 
            f"A square pyramid has a base side of {base} cm and a vertical height of {h} cm. Find its volume.", 
            f"一個正方形底棱錐，其底邊長為 {base} cm，垂直高為 {h} cm。求其體積。",
            svg, steps, steps_zh, f"{vol:.2f} cm^3")

    # ================= MEDIUM =================
    def q6_sector_perimeter(self):
        r, angle = random.randint(7, 15), random.randint(45, 135)
        arc = (angle / 360) * 2 * math.pi * r
        perim = arc + 2 * r
        svg = f'<svg viewBox="0 0 300 300"><path d="M 150 150 L 230 150 A 80 80 0 0 0 180 80 Z" fill="none" stroke="#333" stroke-width="2"/><text x="180" y="140">{angle}^\circ</text><text x="200" y="165">r={r}</text></svg>'
        steps = [
            rf"Perimeter of sector = Arc length + $2r$",
            rf"Arc length = $2 \pi ({r}) \times \frac{{{angle}}}{{360}} \approx {arc:.2f}$",
            rf"Perimeter $\approx {arc:.2f} + 2({r}) = {perim:.2f}$ cm"
        ]
        steps_zh = [
            rf"扇形周界 = 弧長 + $2r$",
            rf"弧長 = $2 \pi ({r}) \times \frac{{{angle}}}{{360}} \approx {arc:.2f}$",
            rf"周界 $\approx {arc:.2f} + 2({r}) = {perim:.2f}$ cm"
        ]
        self._add_q("Medium", "Sector Perimeter", 
            f"Find the perimeter of a sector with radius {r} cm and angle ${angle}^\circ$.", 
            f"求一個半徑為 {r} cm，圓心角為 ${angle}^\circ$ 的扇形的周界。",
            svg, steps, steps_zh, f"{perim:.2f} cm")

    def q7_hemisphere_surface_area(self):
        r = random.randint(5, 12)
        total_sa = 3 * math.pi * r**2
        svg = f'<svg viewBox="0 0 300 300"><path d="M 70 150 A 80 80 0 0 1 230 150 Z" fill="rgba(59,130,246,0.1)" stroke="#333" stroke-width="2"/><ellipse cx="150" cy="150" rx="80" ry="25" fill="none" stroke="#333" stroke-width="2"/><text x="160" y="140">r={r}</text></svg>'
        steps = [
            rf"Hemisphere Total SA = Curved SA + Base Area",
            rf"Total SA = $2 \pi r^2 + \pi r^2 = 3 \pi r^2$",
            rf"Substitute $r = {r}$: Total SA = $3 \pi ({r})^2$",
            rf"Total SA $\approx {total_sa:.2f}$ cm$^2$"
        ]
        steps_zh = [
            rf"半球體總表面積 = 曲面面積 + 底面積",
            rf"總表面積 = $2 \pi r^2 + \pi r^2 = 3 \pi r^2$",
            rf"代入 $r = {r}$：總表面積 = $3 \pi ({r})^2$",
            rf"總表面積 $\approx {total_sa:.2f}$ cm$^2$"
        ]
        self._add_q("Medium", "Hemisphere Surface Area", 
            f"A solid hemisphere has radius {r} cm. Find its total surface area.", 
            f"一個實心半球體的半徑為 {r} cm。求其總表面積。",
            svg, steps, steps_zh, f"{total_sa:.2f} cm^2")

    def q8_cone_volume(self):
        r, s = 6, 10 # 6-8-10 triangle
        h = math.sqrt(s**2 - r**2)
        vol = (1/3) * math.pi * r**2 * h
        svg = f'<svg viewBox="0 0 300 300"><ellipse cx="150" cy="220" rx="60" ry="20" fill="none" stroke="#333" stroke-width="2"/><line x1="90" y1="220" x2="150" y2="50" stroke="#333" stroke-width="2"/><line x1="210" y1="220" x2="150" y2="50" stroke="#333" stroke-width="2"/><text x="185" y="140">s={s}</text><text x="120" y="235">r={r}</text></svg>'
        steps = [
            rf"First find height $h$ using Pythagoras: $h = \sqrt{s^2 - r^2}$",
            rf"$h = \sqrt{{{s}^2 - {r}^2}} = \sqrt{{{s**2 - r**2}}} = {h}$",
            rf"Cone Volume $V = \frac{{1}}{{3}} \pi r^2 h$",
            rf"$V = \frac{{1}}{{3}} \pi ({r}^2) ({h}) \approx {vol:.2f} \text{{ cm}}^3$"
        ]
        steps_zh = [
            rf"首先利用勾股定理求高 $h$：$h = \sqrt{s^2 - r^2}$",
            rf"$h = \sqrt{{{s}^2 - {r}^2}} = \sqrt{{{s**2 - r**2}}} = {h}$",
            rf"圓錐體體積 $V = \frac{{1}}{{3}} \pi r^2 h$",
            rf"$V = \frac{{1}}{{3}} \pi ({r}^2) ({h}) \approx {vol:.2f} \text{{ cm}}^3$"
        ]
        self._add_q("Medium", "Cone Volume", 
            f"A right circular cone has radius {r} cm and slant height {s} cm. Find its volume.", 
            f"一個直圓錐體，其底半徑為 {r} cm，斜高為 {s} cm。求其體積。",
            svg, steps, steps_zh, f"{vol:.2f} \\text{{ cm}}^3")

    def q9_cylinder_csa(self):
        r, h = random.randint(4, 9), random.randint(12, 20)
        csa = 2 * math.pi * r * h
        svg = f'<svg viewBox="0 0 300 300"><ellipse cx="150" cy="80" rx="40" ry="15" fill="none" stroke="#333" stroke-width="2"/><path d="M 110 80 L 110 220 A 40 15 0 0 0 190 220 L 190 80" fill="none" stroke="#333" stroke-width="2" stroke-dasharray="5,5"/><text x="195" y="150">h={h}</text><text x="150" y="90">r={r}</text></svg>'
        steps = [
            rf"Curved Surface Area (CSA) of cylinder = $2 \pi r h$",
            rf"Substitute $r = {r}, h = {h}$",
            rf"CSA = $2 \pi ({r}) ({h}) \approx {csa:.2f}$ cm$^2$"
        ]
        steps_zh = [
            rf"圓柱體曲面面積 = $2 \pi r h$",
            rf"代入 $r = {r}, h = {h}$",
            rf"面積 = $2 \pi ({r}) ({h}) \approx {csa:.2f}$ cm$^2$"
        ]
        self._add_q("Medium", "Cylinder CSA", 
            f"Calculate the curved surface area of a cylinder with radius {r} cm and height {h} cm.", 
            f"求一個半徑為 {r} cm，高為 {h} cm 的圓柱體的曲面面積。",
            svg, steps, steps_zh, f"{csa:.2f} cm^2")

    def q10_inverse_sector(self):
        r = 10
        area = random.randint(40, 80)
        angle = (area * 360) / (math.pi * r**2)
        svg = f'<svg viewBox="0 0 300 300"><path d="M 150 150 L 230 150 A 80 80 0 0 0 200 90 Z" fill="rgba(59,130,246,0.3)" stroke="#333" stroke-width="2"/><text x="170" y="130">\\theta=?</text><text x="170" y="165">r={r}</text><text x="210" y="120">Area={area}</text></svg>'
        steps = [
            rf"Area = $\pi r^2 \times \frac{{\theta}}{{360^\circ}}$",
            rf"${area} = \pi ({r})^2 \times \frac{{\theta}}{{360}}$",
            rf"$\theta = \frac{{{area} \times 360}}{{100 \pi}} \approx {angle:.1f}^\circ$"
        ]
        steps_zh = [
            rf"面積 = $\pi r^2 \times \frac{{\theta}}{{360^\circ}}$",
            rf"${area} = \pi ({r})^2 \times \frac{{\theta}}{{360}}$",
            rf"$\theta = \frac{{{area} \times 360}}{{100 \pi}} \approx {angle:.1f}^\circ$"
        ]
        self._add_q("Medium", "Inverse Sector", 
            f"The area of a sector is {area} cm$^2$ and its radius is {r} cm. Find the central angle in degrees.", 
            f"一個扇形的面積為 {area} cm$^2$，半徑為 {r} cm。求其圓心角 (以度數表示)。",
            svg, steps, steps_zh, f"{angle:.1f}^\circ")

    # ================= DSE STANDARD =================
    def q11_similar_solids(self):
        v1, v2 = 27, 64
        r_v = (v2/v1)**(1/3)
        r_a = r_v**2
        a1 = 18
        a2 = a1 * r_a
        svg = f'<svg viewBox="0 0 300 300"><circle cx="100" cy="150" r="30" fill="none" stroke="#333"/><circle cx="200" cy="150" r="40" fill="none" stroke="#333"/><text x="80" y="200">V={v1}</text><text x="180" y="210">V={v2}</text><text x="80" y="100">Area={a1}</text></svg>'
        steps = [
            rf"Let the ratio of heights be $k$. Then $k^3 = \frac{{V_2}}{{V_1}} = \frac{{{v2}}}{{{v1}}}$",
            rf"$k = \sqrt[3]{{\frac{{{v2}}}{{{v1}}}}} = \frac{{4}}{{3}}$",
            rf"Ratio of Surface Areas = $k^2 = (\frac{{4}}{{3}})^2 = \frac{{16}}{{9}}$",
            rf"Surface Area of larger solid = ${a1} \times \frac{{16}}{{9}} = {a2}$ cm$^2$"
        ]
        steps_zh = [
            rf"設高的比例為 $k$。則 $k^3 = \frac{{V_2}}{{V_1}} = \frac{{{v2}}}{{{v1}}}$",
            rf"$k = \sqrt[3]{{\frac{{{v2}}}{{{v1}}}}} = \frac{{4}}{{3}}$",
            rf"表面積比例 = $k^2 = (\frac{{4}}{{3}})^2 = \frac{{16}}{{9}}$",
            rf"較大立體的表面積 = ${a1} \times \frac{{16}}{{9}} = {a2}$ cm$^2$"
        ]
        self._add_q("DSE Standard", "Similar Solids", 
            f"Two similar solid spheres have volumes {v1} cm$^3$ and {v2} cm$^3$. If the surface area of the smaller sphere is {a1} cm$^2$, find the surface area of the larger sphere.", 
            f"兩個相似實心球體的體積分別為 {v1} cm$^3$ 及 {v2} cm$^3$。若較小球體的表面積為 {a1} cm$^2$，求較大球體的表面積。",
            svg, steps, steps_zh, f"{a2} cm^2")

    def q12_segment_area(self):
        r, angle = 10, 90
        sector_area = (angle / 360) * math.pi * r**2
        tri_area = 0.5 * r * r * math.sin(math.radians(angle))
        seg_area = sector_area - tri_area
        svg = f'<svg viewBox="0 0 300 300"><path d="M 150 150 L 230 150 A 80 80 0 0 0 150 70 Z" fill="rgba(59,130,246,0.1)" stroke="#333"/><line x1="230" y1="150" x2="150" y2="70" stroke="#3b82f6" stroke-width="2"/><text x="160" y="140">90^\circ</text><text x="180" y="165">10 cm</text></svg>'
        steps = [
            rf"Area of segment = Area of sector - Area of triangle",
            rf"Area of sector = $\pi (10^2) \times \frac{{90^\circ}}{{360^\circ}} = 25 \pi \approx 78.54$",
            rf"Area of triangle = $\frac{{1}}{{2}} (10)(10) \sin(90^\circ) = 50$",
            rf"Area of segment $\approx 78.54 - 50 = {seg_area:.2f}$ cm$^2$"
        ]
        steps_zh = [
            rf"弓形面積 = 扇形面積 - 三角形面積",
            rf"扇形面積 = $\pi (10^2) \times \frac{{90^\circ}}{{360^\circ}} = 25 \pi \approx 78.54$",
            rf"三角形面積 = $\frac{{1}}{{2}} (10)(10) \sin(90^\circ) = 50$",
            rf"弓形面積 $\approx 78.54 - 50 = {seg_area:.2f}$ cm$^2$"
        ]
        self._add_q("DSE Standard", "Segment Area", 
            f"Find the area of the segment cut off by a chord of length $10\\sqrt{{2}}$ cm in a circle of radius 10 cm (subtending $90^\circ$ at center).", 
            f"在一個半徑為 10 cm 的圓中，有一長為 $10\\sqrt{{2}}$ cm 的弦 (對應圓心角為 $90^\circ$)。求該弦所截得之弓形的面積。",
            svg, steps, steps_zh, f"{seg_area:.2f} cm^2")

    def q13_recasting_sphere(self):
        r_sph, r_cyl = 6, 2
        vol_sph = (4/3) * math.pi * r_sph**3
        vol_cyl_base = math.pi * r_cyl**2
        num = 27
        h_cyl = vol_sph / (num * vol_cyl_base)
        svg = f'<svg viewBox="0 0 300 300"><circle cx="100" cy="150" r="50" fill="none" stroke="#333"/><text x="160" y="150">$\\rightarrow$</text><ellipse cx="230" cy="140" rx="15" ry="5"/><ellipse cx="230" cy="160" rx="15" ry="5"/><line x1="215" y1="140" x2="215" y2="160" stroke="#333"/></svg>'
        steps = [
            rf"Volume of sphere = $\frac{{4}}{{3}} \pi ({r_sph})^3 = 288 \pi$",
            rf"Volume of {num} cylinders = ${num} \times \pi ({r_cyl})^2 \times h = 108 \pi h$",
            rf"Equating volumes: $288 \pi = 108 \pi h$",
            rf"$h = \frac{{288}}{{108}} = {h_cyl:.2f}$ cm"
        ]
        steps_zh = [
            rf"球體體積 = $\frac{{4}}{{3}} \pi ({r_sph})^3 = 288 \pi$",
            rf"{num} 個圓柱體的體積 = ${num} \times \pi ({r_cyl})^2 \times h = 108 \pi h$",
            rf"體積相等：$288 \pi = 108 \pi h$",
            rf"$h = \frac{{288}}{{108}} = {h_cyl:.2f}$ cm"
        ]
        self._add_q("DSE Standard", "Recasting Solids", 
            f"A solid sphere of radius {r_sph} cm is melted and recast into {num} identical solid cylinders of radius {r_cyl} cm. Find the height of each cylinder.", 
            f"一個半徑為 {r_sph} cm 的實心球體被熔化，並重新鑄造成 {num} 個底半徑為 {r_cyl} cm 的相同實心圓柱體。求每個圓柱體的高。",
            svg, steps, steps_zh, f"{h_cyl:.2f} cm")

    def q14_frustum_volume(self):
        R, r, h = 10, 5, 12
        vol = (1/3) * math.pi * h * (R**2 + R*r + r**2)
        svg = f'<svg viewBox="0 0 300 300"><ellipse cx="150" cy="80" rx="30" ry="10" stroke="#333"/><ellipse cx="150" cy="220" rx="60" ry="20" stroke="#333"/><line x1="120" y1="80" x2="90" y2="220" stroke="#333"/><line x1="180" y1="80" x2="210" y2="220" stroke="#333"/><text x="150" y="70">r={r}</text><text x="150" y="250">R={R}</text><text x="180" y="150">h={h}</text></svg>'
        steps = [
            rf"Volume of Frustum $V = \frac{{1}}{{3}} \pi h (R^2 + Rr + r^2)$",
            rf"Substitute $R=10, r=5, h=12$",
            rf"$V = \frac{{1}}{{3}} \pi (12) (100 + 50 + 25) = 4 \pi (175) = 700 \pi$",
            rf"$V \approx {vol:.2f}$ cm$^3$"
        ]
        steps_zh = [
            rf"圓錐台體積 $V = \frac{{1}}{{3}} \pi h (R^2 + Rr + r^2)$",
            rf"代入 $R=10, r=5, h=12$",
            rf"$V = \frac{{1}}{{3}} \pi (12) (100 + 50 + 25) = 4 \pi (175) = 700 \pi$",
            rf"體積 $\approx {vol:.2f}$ cm$^3$"
        ]
        self._add_q("DSE Standard", "Frustum Volume", 
            f"A cone's top is cut off to form a frustum with base radii {R} cm and {r} cm, and height {h} cm. Find its volume.", 
            f"將一個圓錐的頂部切去，形成一個底半徑分別為 {R} cm 及 {r} cm，高為 {h} cm 的圓錐台。求其體積。",
            svg, steps, steps_zh, f"{vol:.2f} cm^3")

    def q15_shaded_area(self):
        side = 20
        r = side / 2
        area_sq = side**2
        area_cir = math.pi * r**2
        shaded = area_sq - area_cir
        svg = f'<svg viewBox="0 0 300 300"><rect x="75" y="75" width="150" height="150" fill="rgba(59,130,246,0.2)" stroke="#333"/><circle cx="150" cy="150" r="75" fill="white" stroke="#333"/><text x="150" y="240">side={side}</text></svg>'
        steps = [
            rf"Area of Square = ${side}^2 = {area_sq}$",
            rf"Radius of inscribed circle $r = \frac{{{side}}}{{2}} = {r}$",
            rf"Area of Circle = $\pi ({r})^2 = {r**2} \pi \approx {area_cir:.2f}$",
            rf"Shaded Area = ${area_sq} - {area_cir:.2f} \approx {shaded:.2f}$ cm$^2$"
        ]
        steps_zh = [
            rf"正方形面積 = ${side}^2 = {area_sq}$",
            rf"內切圓半徑 $r = \frac{{{side}}}{{2}} = {r}$",
            rf"圓形面積 = $\pi ({r})^2 = {r**2} \pi \approx {area_cir:.2f}$",
            rf"陰影部分面積 = ${area_sq} - {area_cir:.2f} \approx {shaded:.2f}$ cm$^2$"
        ]
        self._add_q("DSE Standard", "Shaded Area", 
            f"A circle is inscribed in a square of side {side} cm. Find the area of the shaded region (the corners of the square outside the circle).", 
            f"一個圓形內切於一個邊長為 {side} cm 的正方形。求正方形內但在圓形外的陰影部分面積。",
            svg, steps, steps_zh, f"{shaded:.2f} cm^2")

    # ================= ELITE =================
    def q16_rotating_trapezium(self):
        a, b, h = 4, 10, 8
        vol = (1/3) * math.pi * h * (a**2 + a*b + b**2)
        svg = f'<svg viewBox="0 0 300 300"><polygon points="100,50 180,50 250,250 100,250" fill="none" stroke="#3b82f6" stroke-width="2"/><line x1="100" y1="50" x2="100" y2="250" stroke="#333" stroke-dasharray="5,5"/><text x="110" y="150">Axis</text></svg>'
        steps = [
            rf"Rotating a right-angled trapezium about the height side $h$ forms a frustum.",
            rf"Top radius $r = {a}$, bottom radius $R = {b}$, height $h = {h}$",
            rf"Volume = $\frac{{1}}{{3}} \pi ({h}) ({a}^2 + {a}\times{b} + {b}^2)$",
            rf"Volume = $\frac{{8}}{{3}} \pi (16 + 40 + 100) = \frac{{8}}{{3}} \pi (156) = 416 \pi$",
            rf"Volume $\approx {416 * math.pi:.2f}$ cm$^3$"
        ]
        steps_zh = [
            rf"將一直角梯形繞其高的邊 $h$旋轉，會形成一個圓錐台。",
            rf"頂半徑 $r = {a}$，底半徑 $R = {b}$，高 $h = {h}$",
            rf"體積 = $\frac{{1}}{{3}} \pi ({h}) ({a}^2 + {a}\times{b} + {b}^2)$",
            rf"體積 = $\frac{{8}}{{3}} \pi (16 + 40 + 100) = \frac{{8}}{{3}} \pi (156) = 416 \pi$",
            rf"體積 $\approx {416 * math.pi:.2f}$ cm$^3$"
        ]
        self._add_q("Elite", "Rotating Figures", 
            f"A right-angled trapezium with parallel sides {a} cm and {b} cm, and height {h} cm, is rotated $360^\circ$ about the side of length {h} cm. Find the volume of the solid generated.", 
            f"一個直角梯形的平行邊長分別為 {a} cm 及 {b} cm，高為 {h} cm。若將該梯形繞長度為 {h} cm 的邊旋轉 $360^\circ$，求所得旋轉體的體積。",
            svg, steps, steps_zh, f"{416 * math.pi:.2f} cm^3")

    def q17_max_vol_cylinder(self):
        R = 12
        h = 2 * R / math.sqrt(3)
        r = R * math.sqrt(2/3)
        vol = math.pi * r**2 * h
        svg = f'<svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="80" fill="none" stroke="#333"/><rect x="110" y="100" width="80" height="100" fill="none" stroke="#3b82f6"/></svg>'
        steps = [
            rf"For a cylinder inscribed in a sphere of radius $R$ to have max volume:",
            rf"Height $h = \frac{{2R}}{{\sqrt{{3}}}}$, Cylinder radius $r = R \sqrt{{\frac{{2}}{{3}}}}$",
            rf"Substitution $R = {R}$",
            rf"$V = \pi (R^2 \frac{{2}}{{3}}) (\frac{{2R}}{{\sqrt{{3}}}}) = \frac{{4 \pi R^3}}{{3\sqrt{{3}}}}$",
            rf"$V \approx {vol:.2f}$ cm$^3$"
        ]
        steps_zh = [
            rf"當圓柱體內切於半徑為 $R$ 的球體且體積最大時：",
            rf"高度 $h = \frac{{2R}}{{\sqrt{{3}}}}$，圓柱半徑 $r = R \sqrt{{\frac{{2}}{{3}}}}$",
            rf"代入 $R = {R}$",
            rf"$V = \pi (R^2 \frac{{2}}{{3}}) (\frac{{2R}}{{\sqrt{{3}}}}) = \frac{{4 \pi R^3}}{{3\sqrt{{3}}}}$",
            rf"體積 $\approx {vol:.2f}$ cm$^3$"
        ]
        self._add_q("Elite", "Optimization", 
            f"Find the maximum volume of a right circular cylinder that can be inscribed in a sphere of radius {R} cm.", 
            f"求一個能內切於半徑為 {R} cm 的球體中的圓柱體的最大體積。",
            svg, steps, steps_zh, f"{vol:.2f} cm^3")

    def q18_tilted_cylinder(self):
        r, h, angle = 5, 20, 30
        avg_h = h - r * math.tan(math.radians(angle))
        vol = math.pi * r**2 * avg_h
        svg = f'<svg viewBox="0 0 300 300" transform="rotate(-30 150 150)"><rect x="120" y="50" width="60" height="200" stroke="#333" fill="none"/><line x1="120" y1="100" x2="180" y2=\"70\" stroke=\"#3b82f6\" stroke-width=\"2\"/></svg>'
        steps = [
            rf"The volume of a partially filled cylinder at a tilt is $V = \pi r^2 \times h_{{avg}}$",
            rf"Max height at edge $h_{{max}} = {h}$",
            rf"Height at center $h_{{avg}} = {h} - r \tan({angle}^\circ)$",
            rf"$h_{{avg}} = {h} - 5 \tan(30^\circ) \approx {avg_h:.2f}$",
            rf"$V \approx \pi (5^2) ({avg_h:.2f}) \approx {vol:.2f}$ cm$^3$"
        ]
        steps_zh = [
            rf"傾斜圓柱體中水的體積為 $V = \pi r^2 \times h_{{平均}}$",
            rf"邊緣最大高度 $h_{{最大}} = {h}$",
            rf"中心高度 $h_{{平均}} = {h} - r \tan({angle}^\circ)$",
            rf"$h_{{平均}} = {h} - 5 \tan(30^\circ) \approx {avg_h:.2f}$",
            rf"$V \approx \pi (5^2) ({avg_h:.2f}) \approx {vol:.2f}$ cm$^3$"
        ]
        self._add_q("Elite", "Tilted Container", 
            f"A cylinder of radius 5 cm and height {h} cm is tilted at $30^\circ$ to the vertical. Water is poured in until it just reaches the top rim. Find the volume of water.", 
            f"一個半徑為 5 cm，高為 {h} cm 的圓柱體向垂直方向傾斜了 $30^\circ$。現將水注入其中，直至水位剛好到達頂部邊緣。求水的體積。",
            svg, steps, steps_zh, f"{vol:.2f} cm^3")

    def q19_pyramid_base_angle(self):
        side, h = 10, 10
        theta = math.degrees(math.atan(math.sqrt(2)))
        svg = f'<svg viewBox="0 0 300 300"><path d="M 80 220 L 150 50 L 220 220 M 150 50 L 150 220" stroke="#333" fill="none"/><text x="145" y="200">\\theta</text></svg>'
        steps = [
            rf"The slant edge makes an angle $\theta$ with the base diagonal.",
            rf"Half diagonal of square base $d/2 = \frac{{\sqrt{{{side}^2 + {side}^2}}}}{{2}} = 5\sqrt{{2}} \approx 7.07$",
            rf"$\tan \theta = \frac{{\text{{Height}}}}{{d/2}} = \frac{{{h}}}{{7.07}} \approx 1.414$",
            rf"$\theta = \tan^{{-1}}(1.414) \approx {theta:.1f}^\circ$"
        ]
        steps_zh = [
            rf"斜邊與底面角線的夾角為 $\theta$。",
            rf"正方形底面對角線的一半 $d/2 = \frac{{\sqrt{{{side}^2 + {side}^2}}}}{{2}} = 5\sqrt{{2}} \approx 7.07$",
            rf"$\tan \theta = \frac{{\text{{高}}}}{{d/2}} = \frac{{{h}}}{{7.07}} \approx 1.414$",
            rf"$\theta = \tan^{{-1}}(1.414) \approx {theta:.1f}^\circ$"
        ]
        self._add_q("Elite", "3D Trigo-Geometry", 
            f"A square pyramid has base side {side} cm and height {h} cm. Find the angle between a slant edge and the base diagonal.", 
            f"一個正方形底棱錐的底邊長為 {side} cm，垂直高為 {h} cm。求一條斜邊與底面對角線之間的夾角。",
            svg, steps, steps_zh, f"{theta:.1f}^\circ")

    def q20_complex_interaction(self):
        r_sph, r_cyl = 10, 15
        vol_sph = (4/3) * math.pi * r_sph**3
        area_cyl = math.pi * r_cyl**2
        rise = vol_sph / area_cyl
        svg = f'<svg viewBox="0 0 300 300"><rect x="100" y="100" width="100" height="150" stroke="#333" fill="none"/><circle cx="150" cy=\"200\" r=\"30\" fill=\"rgba(59,130,246,0.3)\"/></svg>'
        steps = [
            rf"Volume of sphere $V_s = \frac{{4}}{{3}} \pi (10)^3 = \frac{{4000}}{{3}} \pi$",
            rf"Area of cylinder base $A = \pi (15)^2 = 225 \pi$",
            rf"Water level rise $h_{{rise}} = \frac{{V_s}}{{A}} = \frac{{4000 \pi / 3}}{{225 \pi}}$",
            rf"$h_{{rise}} = \frac{{4000}}{{675}} \approx 5.93$ cm"
        ]
        steps_zh = [
            rf"球體體積 $V_s = \frac{{4}}{{3}} \pi (10)^3 = \frac{{4000}}{{3}} \pi$",
            rf"圓柱底面積 $A = \pi (15)^2 = 225 \pi$",
            rf"水位上升高度 $h_{{\text{{上升}}}} = \frac{{V_s}}{{A}} = \frac{{4000 \pi / 3}}{{225 \pi}}$",
            rf"$h_{{\text{{上升}}}} = \frac{{4000}}{{675}} \approx 5.93$ cm"
        ]
        self._add_q("Elite", "Fluid Displacement", 
            f"A solid sphere of radius 10 cm is dropped into a cylindrical tank of radius 15 cm partially filled with water. Find the rise in water level.", 
            f"將一個半徑為 10 cm 的實心球體放入一個半徑為 15 cm 且部分裝有水的圓柱形水箱中。求水位上升的高度。",
            svg, steps, steps_zh, f"5.93 cm")

    def save_json(self, filename):
        with open(filename, 'w') as f:
            json.dump(self.questions, f, indent=2)

if __name__ == "__main__":
    gen = MensurationGenerator()
    questions = gen.generate_all()
    print(json.dumps(questions, indent=2))
