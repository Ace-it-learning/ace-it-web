import math
import random

def get_pt(cx, cy, r, angle_deg):
    rad = math.radians(angle_deg)
    return f"{cx + r * math.cos(rad):.1f},{cy - r * math.sin(rad):.1f}"

def generate_20_unique_circle_seeds():
    seeds = []
    cx, cy, r = 150, 150, 100

    # ================= LEVEL 3: EASY =================
    # 1. Angle at Center
    a = random.randint(35, 60)
    p1, p2, p3 = get_pt(cx,cy,r,90), get_pt(cx,cy,r,210), get_pt(cx,cy,r,330)
    svg1 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="3"/><polygon points="{p2} {p1} {p3}" fill="none" stroke="#333" stroke-width="2"/><polygon points="{p2} {cx},{cy} {p3}" fill="none" stroke="#333" stroke-width="2"/><text x="145" y="40">A</text><text x="45" y="220">B</text><text x="245" y="220">C</text><text x="145" y="140">O</text><text x="140" y="80">{a}&#176;</text><text x="145" y="170">x</text></svg>'
    seeds.append(f"[Easy] Topic: Angle at Center. Given: O is center, Angle BAC = {a}^\\circ. Find x (Angle BOC). Answer: {a*2}^\\circ. Steps: x = 2 \\times {a}^\\circ (angle at center = 2 \\times angle at circum.). SVG: {svg1}")

    # 2. Angle in Semicircle
    a = random.randint(25, 65)
    p1, p2, p3 = get_pt(cx,cy,r,180), get_pt(cx,cy,r,0), get_pt(cx,cy,r,60)
    svg2 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="3"/><line x1="{p1}" y1="{p2}" stroke="#333" stroke-width="2"/><polygon points="{p1} {p3} {p2}" fill="none" stroke="#333" stroke-width="2"/><text x="35" y="155">A</text><text x="260" y="155">B</text><text x="205" y="60">C</text><text x="60" y="145">{a}&#176;</text><text x="220" y="145">x</text></svg>'
    seeds.append(f"[Easy] Topic: Angle in Semicircle. Given: AB is diameter. Angle BAC = {a}^\\circ. Find x (Angle ABC). Answer: {90-a}^\\circ. Steps: Angle ACB = 90^\\circ (angle in semicircle). x = 180^\\circ - 90^\\circ - {a}^\\circ = {90-a}^\\circ. SVG: {svg2}")

    # 3. Angles in Same Segment
    a = random.randint(30, 70)
    p1, p2, p3, p4 = get_pt(cx,cy,r,135), get_pt(cx,cy,r,225), get_pt(cx,cy,r,315), get_pt(cx,cy,r,45)
    svg3 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><polygon points="{p1} {p3} {p2} {p4} {p1}" fill="none" stroke="#333" stroke-width="2"/><text x="70" y="80">A</text><text x="70" y="230">B</text><text x="220" y="230">C</text><text x="220" y="80">D</text><text x="90" y="105">{a}&#176;</text><text x="200" y="105">x</text></svg>'
    seeds.append(f"[Easy] Topic: Angles in Same Segment. Given: Angle BAC = {a}^\\circ. Find x (Angle BDC). Answer: {a}^\\circ. Steps: x = {a}^\\circ (angles in same segment). SVG: {svg3}")

    # 4. Cyclic Quad (Opposite Angles)
    a = random.randint(70, 110)
    p1, p2, p3, p4 = get_pt(cx,cy,r,120), get_pt(cx,cy,r,210), get_pt(cx,cy,r,330), get_pt(cx,cy,r,45)
    svg4 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><polygon points="{p1} {p2} {p3} {p4}" fill="none" stroke="#333" stroke-width="2"/><text x="90" y="60">A</text><text x="40" y="210">B</text><text x="250" y="210">C</text><text x="230" y="60">D</text><text x="110" y="90">{a}&#176;</text><text x="200" y="190">x</text></svg>'
    seeds.append(f"[Easy] Topic: Cyclic Quad Opp Angles. Given: ABCD is cyclic. Angle DAB = {a}^\\circ. Find x (Angle BCD). Answer: {180-a}^\\circ. Steps: x + {a}^\\circ = 180^\\circ (opp. angles, cyclic quad.). x = {180-a}^\\circ. SVG: {svg4}")

    # 5. Radius Bisects Chord (Pythagoras)
    rad, dist = 10, random.randint(5, 8)
    chord = 2 * int(math.sqrt(rad**2 - dist**2)) if math.sqrt(rad**2 - dist**2).is_integer() else 16
    svg5 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="3"/><line x1="70" y1="210" x2="230" y2="210" stroke="#333" stroke-width="2"/><line x1="{cx}" y1="{cy}" x2="150" y2="210" stroke="#333" stroke-width="2" stroke-dasharray="5,5"/><line x1="{cx}" y1="{cy}" x2="230" y2="210" stroke="#333" stroke-width="2"/><text x="140" y="140">O</text><text x="55" y="225">A</text><text x="240" y="225">B</text><text x="135" y="230">M</text><text x="180" y="170">{rad}</text><text x="120" y="180">x</text></svg>'
    seeds.append(f"[Easy] Topic: Chord and Radius. Given: Radius = 10, Chord AB = 16. OM is perpendicular to AB. Find x (OM). Answer: 6. Steps: AM = 16 / 2 = 8. x^2 + 8^2 = 10^2 (Pythagoras theorem). x = 6. SVG: {svg5}")

    # ================= LEVEL 4: MEDIUM =================
    # 6. Cyclic Quad Exterior Angle
    a = random.randint(75, 115)
    # Calculation for DAB = a
    # arc BCD = 2 * a. If B=225, C=315 (arc=90), then D = 315 + (2*a - 90)
    B_ang, C_ang = 225, 315
    D_ang = C_ang + (2*a - 90)
    A_ang = (D_ang + (B_ang + 360)) / 2 # Midpoint of major arc
    p1 = get_pt(cx, cy, r, A_ang)
    p2 = get_pt(cx, cy, r, B_ang)
    p3 = get_pt(cx, cy, r, C_ang)
    p4 = get_pt(cx, cy, r, D_ang)
    p3_ext = f"{cx + r * math.cos(math.radians(C_ang)) + 40:.1f},{cy - r * math.sin(math.radians(C_ang)):.1f}"
    svg6 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><polygon points="{p1} {p2} {p3} {p4}" fill="none" stroke="#333" stroke-width="2"/><line x1="{p3}" y1="{p3_ext}" stroke="#333" stroke-width="2"/><text x="55" y="85">A</text><text x="70" y="235">B</text><text x="215" y="235">C</text><text x="210" y="60">D</text><text x="270" y="225">E</text><text x="85" y="110">{a}&#176;</text><text x="230" y="215">y</text></svg>'
    seeds.append(f"[Medium] Topic: Cyclic Quad Ext Angle. Given: ABCD is cyclic. Line BC is extended to E. Angle DAB = {a}^\\circ. Find y (Angle DCE). Answer: {a}^\\circ. Steps: y = {a}^\\circ (ext. angle, cyclic quad.). SVG: {svg6}")

    # 7. Tangents from External Point
    a = random.randint(40, 70)
    svg7 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><line x1="150" y1="280" x2="63.4" y2="200" stroke="#333" stroke-width="2"/><line x1="150" y1="280" x2="236.6" y2="200" stroke="#333" stroke-width="2"/><line x1="63.4" y1="200" x2="236.6" y2="200" stroke="#333" stroke-width="2"/><text x="45" y="200">A</text><text x="245" y="200">B</text><text x="145" y="295">T</text><text x="140" y="260">{a}&#176;</text><text x="80" y="220">y</text></svg>'
    seeds.append(f"[Medium] Topic: Tangents from Ext Point. Given: TA and TB are tangents. Angle ATB = {a}^\\circ. Find y (Angle TAB). Answer: {(180-a)//2}^\\circ. Steps: TA = TB (tangent properties). Angle TAB = (180^\\circ - {a}^\\circ) / 2 (base angles, isosceles triangle) = {(180-a)//2}^\\circ. SVG: {svg7}")

    # 8. Alternate Segment Theorem
    a = random.randint(50, 80)
    p1, p2, p3 = get_pt(cx,cy,r,270), get_pt(cx,cy,r,340), get_pt(cx,cy,r,160)
    svg8 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><line x1="50" y1="250" x2="250" y2="250" stroke="#333" stroke-width="2"/><polygon points="{p1} {p2} {p3}" fill="none" stroke="#333" stroke-width="2"/><text x="145" y="270">A</text><text x="250" y="210">B</text><text x="40" y="110">C</text><text x="255" y="265">T</text><text x="180" y="240">{a}&#176;</text><text x="90" y="150">y</text></svg>'
    seeds.append(f"[Medium] Topic: Alternate Segment. Given: AT is tangent at A. Angle BAT = {a}^\\circ. Find y (Angle ACB). Answer: {a}^\\circ. Steps: y = {a}^\\circ (angle in alt. segment). SVG: {svg8}")

    # 9. Tangent Perpendicular to Radius
    a = random.randint(35, 55)
    svg9 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="3"/><line x1="70" y1="250" x2="250" y2="250" stroke="#333" stroke-width="2"/><line x1="150" y1="150" x2="150" y2="250" stroke="#333" stroke-width="2"/><line x1="150" y1="150" x2="250" y2="250" stroke="#333" stroke-width="2"/><text x="140" y="140">O</text><text x="145" y="270">A</text><text x="250" y="240">B</text><text x="210" y="240">{a}&#176;</text><text x="155" y="180">y</text></svg>'
    seeds.append(f"[Medium] Topic: Tangent and Radius. Given: AB is tangent at A. Angle OBA = {a}^\\circ. Find y (Angle AOB). Answer: {90-a}^\\circ. Steps: Angle OAB = 90^\\circ (tangent perpendicular to radius). y = 180^\\circ - 90^\\circ - {a}^\\circ = {90-a}^\\circ. SVG: {svg9}")

    # 10. Reflex Angle at Center
    a = random.randint(100, 140)
    p1, p2, p3 = get_pt(cx,cy,r,210), get_pt(cx,cy,r,330), get_pt(cx,cy,r,90)
    svg10 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="3"/><polygon points="{p1} {p3} {p2}" fill="none" stroke="#333" stroke-width="2"/><polygon points="{p1} {cx},{cy} {p2}" fill="none" stroke="#333" stroke-width="2"/><text x="45" y="220">B</text><text x="245" y="220">C</text><text x="145" y="40">A</text><text x="145" y="140">O</text><text x="135" y="180">{a}&#176;</text><text x="145" y="70">y</text></svg>'
    seeds.append(f"[Medium] Topic: Reflex Angle at Center. Given: Angle BOC = {a}^\\circ. Find y (Angle BAC). Answer: {a//2}^\\circ. Steps: y = {a}^\\circ / 2 (angle at center = 2 \\times angle at circum.) = {a//2}^\\circ. SVG: {svg10}")

    # ================= LEVEL 5: DSE STANDARD =================
    # 11. Isosceles Triangle formed by Radii
    a = random.randint(100, 130)
    p1, p2 = get_pt(cx,cy,r,210), get_pt(cx,cy,r,330)
    svg11 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="3"/><polygon points="{cx},{cy} {p1} {p2}" fill="none" stroke="#333" stroke-width="2"/><text x="140" y="140">O</text><text x="45" y="220">A</text><text x="245" y="220">B</text><text x="140" y="180">{a}&#176;</text><text x="80" y="205">z</text></svg>'
    seeds.append(f"[DSE Standard] Topic: Radii Isosceles. Given: O is center. Angle AOB = {a}^\\circ. Find z (Angle OAB). Answer: {(180-a)//2}^\\circ. Steps: OA = OB (radii). z = (180^\\circ - {a}^\\circ) / 2 (base angles, isosceles triangle) = {(180-a)//2}^\\circ. SVG: {svg11}")

    # 12. Tangent + Angle in Semicircle
    a = random.randint(25, 50)
    p1, p2, p3 = get_pt(cx,cy,r,180), get_pt(cx,cy,r,0), get_pt(cx,cy,r,270)
    svg12 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><line x1="50" y1="250" x2="250" y2="250" stroke="#333" stroke-width="2"/><line x1="{p1}" y1="{p2}" stroke="#333" stroke-width="2"/><polygon points="{p1} {p3} {p2}" fill="none" stroke="#333" stroke-width="2"/><text x="35" y="150">B</text><text x="260" y="150">C</text><text x="145" y="240">A</text><text x="250" y="265">T</text><text x="60" y="170">{a}&#176;</text><text x="170" y="240">z</text></svg>'
    seeds.append(f"[DSE Standard] Topic: Tangent and Semicircle. Given: BC is diameter. AT is tangent at A. Angle ABC = {a}^\\circ. Find z (Angle CAT). Answer: {a}^\\circ. Steps: z = {a}^\\circ (angle in alt. segment). SVG: {svg12}")

    # 13. Parallel Chords + Alt Angles
    a = random.randint(40, 70)
    p1, p2, p3, p4 = get_pt(cx,cy,r,150), get_pt(cx,cy,r,30), get_pt(cx,cy,r,210), get_pt(cx,cy,r,330)
    svg13 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><line x1="{p1}" y1="{p2}" stroke="#333" stroke-width="2"/><line x1="{p3}" y1="{p4}" stroke="#333" stroke-width="2"/><polygon points="{p1} {p4} {p3}" fill="none" stroke="#333" stroke-width="2"/><text x="50" y="90">A</text><text x="240" y="90">B</text><text x="50" y="220">C</text><text x="240" y="220">D</text><text x="80" y="115">{a}&#176;</text><text x="210" y="195">z</text></svg>'
    seeds.append(f"[DSE Standard] Topic: Parallel Chords. Given: AB || CD. Angle BAD = {a}^\\circ. Find z (Angle ADC). Answer: {a}^\\circ. Steps: z = {a}^\\circ (alt. angles, AB || CD). SVG: {svg13}")

    # 14. Cyclic Quad Diagonal Angle Sum
    a, b = random.randint(30, 50), random.randint(40, 60)
    p1, p2, p3, p4 = get_pt(cx,cy,r,135), get_pt(cx,cy,r,225), get_pt(cx,cy,r,315), get_pt(cx,cy,r,45)
    svg14 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><polygon points="{p1} {p2} {p3} {p4}" fill="none" stroke="#333" stroke-width="2"/><line x1="{p1}" y1="{p3}" stroke="#333" stroke-width="2"/><text x="70" y="80">A</text><text x="70" y="230">B</text><text x="220" y="230">C</text><text x="220" y="80">D</text><text x="90" y="110">{a}&#176;</text><text x="110" y="95">{b}&#176;</text><text x="200" y="210">z</text></svg>'
    seeds.append(f"[DSE Standard] Topic: Cyclic Quad Diagonals. Given: ABCD cyclic. Angle BAC = {a}^\\circ, Angle CAD = {b}^\\circ. Find z (Angle BCD). Answer: {180-(a+b)}^\\circ. Steps: Angle BAD = {a}^\\circ + {b}^\\circ = {a+b}^\\circ. z = 180^\\circ - {a+b}^\\circ (opp. angles, cyclic quad.) = {180-(a+b)}^\\circ. SVG: {svg14}")

    # 15. Tangent parallel to Chord
    a = random.randint(55, 80)
    p1, p2, p3 = get_pt(cx,cy,r,270), get_pt(cx,cy,r,210), get_pt(cx,cy,r,330)
    svg15 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><line x1="50" y1="250" x2="250" y2="250" stroke="#333" stroke-width="2"/><line x1="{p2}" y1="{p3}" stroke="#333" stroke-width="2"/><polygon points="{p1} {p2} {p3}" fill="none" stroke="#333" stroke-width="2"/><text x="145" y="270">A</text><text x="250" y="265">T</text><text x="45" y="220">B</text><text x="245" y="220">C</text><text x="180" y="240">{a}&#176;</text><text x="80" y="200">z</text></svg>'
    seeds.append(f"[DSE Standard] Topic: Tangent Parallel Chord. Given: AT is tangent at A. AT || BC. Angle BAT = {a}^\\circ. Find z (Angle ABC). Answer: {a}^\\circ. Steps: Angle BCA = {a}^\\circ (angle in alt. segment). z = Angle BCA = {a}^\\circ (alt. angles, AT || BC). SVG: {svg15}")

    # ================= LEVEL 7: ELITE =================
    # 16. Two Tangents + Angle at Center
    a = random.randint(40, 60)
    p1, p2 = get_pt(cx,cy,r,225), get_pt(cx,cy,r,315)
    svg16 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="3"/><line x1="150" y1="280" x2="79.3" y2="220.7" stroke="#333" stroke-width="2"/><line x1="150" y1="280" x2="220.7" y2="220.7" stroke="#333" stroke-width="2"/><polygon points="{p1} {cx},{cy} {p2}" fill="none" stroke="#333" stroke-width="2"/><text x="60" y="220">A</text><text x="230" y="220">B</text><text x="145" y="295">T</text><text x="140" y="140">O</text><text x="140" y="260">{a}&#176;</text><text x="140" y="170">w</text></svg>'
    seeds.append(f"[Elite] Topic: Tangents and Center. Given: TA, TB are tangents. Angle ATB = {a}^\\circ. Find w (Angle AOB). Answer: {180-a}^\\circ. Steps: Angle OAT = Angle OBT = 90^\\circ (tangent perpendicular to radius). w = 360^\\circ - 90^\\circ - 90^\\circ - {a}^\\circ (angle sum of polygon) = {180-a}^\\circ. SVG: {svg16}")

    # 17. Tangent + Isosceles Triangle
    a = random.randint(50, 70)
    p1, p2, p3 = get_pt(cx,cy,r,270), get_pt(cx,cy,r,340), get_pt(cx,cy,r,200)
    svg17 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><line x1="50" y1="250" x2="250" y2="250" stroke="#333" stroke-width="2"/><polygon points="{p1} {p2} {p3}" fill="none" stroke="#333" stroke-width="2"/><line x1="190" y1="210" x2="200" y2="220" stroke="#333"/><line x1="100" y1="220" x2="110" y2="210" stroke="#333"/><text x="145" y="270">A</text><text x="250" y="210">B</text><text x="40" y="210">C</text><text x="255" y="265">T</text><text x="180" y="240">{a}&#176;</text><text x="145" y="180">w</text></svg>'
    seeds.append(f"[Elite] Topic: Alt Segment Isosceles. Given: AT is tangent. AB = AC. Angle BAT = {a}^\\circ. Find w (Angle BAC). Answer: {180-2*a}^\\circ. Steps: Angle ACB = {a}^\\circ (angle in alt. segment). Angle ABC = {a}^\\circ (base angles, isosceles triangle). w = 180^\\circ - 2 \\times {a}^\\circ = {180-2*a}^\\circ. SVG: {svg17}")

    # 18. Intersecting Chords (Interior Angles)
    a, b = random.randint(30, 50), random.randint(40, 60)
    p1, p2, p3, p4 = get_pt(cx,cy,r,135), get_pt(cx,cy,r,315), get_pt(cx,cy,r,45), get_pt(cx,cy,r,225)
    svg18 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><line x1="{p1}" y1="{p2}" stroke="#333" stroke-width="2"/><line x1="{p3}" y1="{p4}" stroke="#333" stroke-width="2"/><polygon points="{p1} {p3}" fill="none" stroke="#333" stroke-width="2"/><text x="70" y="80">A</text><text x="220" y="230">B</text><text x="220" y="80">C</text><text x="70" y="230">D</text><text x="140" y="130">E</text><text x="100" y="95">{a}&#176;</text><text x="180" y="95">{b}&#176;</text><text x="145" y="170">w</text></svg>'
    seeds.append(f"[Elite] Topic: Intersecting Chords. Given: Chords AB and CD intersect at E. Angle ACD = {a}^\\circ, Angle CAB = {b}^\\circ. Find w (Angle CEB). Answer: {a+b}^\\circ. Steps: Angle CEB = {a}^\\circ + {b}^\\circ (ext. angle of triangle ACE) = {a+b}^\\circ. SVG: {svg18}")

    # 19. Extended Secants (Exterior intersection)
    a, b = random.randint(25, 40), random.randint(30, 45)
    svg19 = f'<svg viewBox="0 0 300 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><polygon points="79.3,79.3 220.7,220.7 280,150" fill="none" stroke="#333" stroke-width="2"/><polygon points="220.7,79.3 79.3,220.7 280,150" fill="none" stroke="#333" stroke-width="2"/><text x="60" y="70">A</text><text x="60" y="240">C</text><text x="230" y="240">D</text><text x="230" y="70">B</text><text x="285" y="155">E</text><text x="110" y="110">{a}&#176;</text><text x="250" y="155">{b}&#176;</text><text x="110" y="200">w</text></svg>'
    seeds.append(f"[Elite] Topic: Extended Secants. Given: Chords AB and CD extended meet at E. Angle CAB = {a}^\\circ, Angle AEC = {b}^\\circ. Find w (Angle ACD). Answer: {a+b}^\\circ. Steps: Angle ACD = {a}^\\circ + {b}^\\circ (ext. angle of triangle ACE) = {a+b}^\\circ. SVG: {svg19}")

    # 20. Tangent + Diameter extended
    a = random.randint(20, 40) # BTC
    cot = 90 - a
    # OC / OT = cos(cot) => OT = OC / cos(cot)
    ot_len = r / math.cos(math.radians(cot))
    T_x, T_y = cx + ot_len, cy
    # C is at angle -cot (360 - cot)
    c_ang = -cot
    p1 = get_pt(cx, cy, r, 180) # A
    p2 = get_pt(cx, cy, r, 0)   # B
    p3 = get_pt(cx, cy, r, c_ang) # C
    T_pt = f"{T_x:.1f},{T_y:.1f}"

    svg20 = f'<svg viewBox="0 0 450 300"><circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#333" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="3"/><line x1="{p1.split(",")[0]}" y1="{p1.split(",")[1]}" x2="{T_x:.1f}" y2="{T_y:.1f}" stroke="#333" stroke-width="2"/><line x1="{p3.split(",")[0]}" y1="{p3.split(",")[1]}" x2="{T_x:.1f}" y2="{T_y:.1f}" stroke="#333" stroke-width="2"/><line x1="{p1.split(",")[0]}" y1="{p1.split(",")[1]}" x2="{p3.split(",")[0]}" y2="{p3.split(",")[1]}" stroke="#333" stroke-width="2"/><text x="35" y="150">A</text><text x="250" y="140">B</text><text x="{p3.split(",")[0]}" y="{float(p3.split(",")[1])+20:.1f}">C</text><text x="{T_x:.1f}" y="{T_y - 10:.1f}">T</text><text x="140" y="140">O</text><text x="{T_x - 40:.1f}" y="{T_y + 15:.1f}">{a}&#176;</text><text x="70" y="165">w</text></svg>'
    seeds.append(f"[Elite] Topic: Tangent and Extended Diameter. Given: AB is diameter extended to T. CT is tangent at C. Angle BTC = {a}^\\circ. Find w (Angle BAC). Answer: {(90-a)//2}^\\circ. Steps: Angle OCT = 90^\\circ (tangent perpendicular to radius). Angle COT = 180^\\circ - 90^\\circ - {a}^\\circ = {90-a}^\\circ. w = {90-a}^\\circ / 2 (angle at center = 2 \\times angle at circum.) = {(90-a)//2}^\\circ. SVG: {svg20}")

    return seeds

for i, seed in enumerate(generate_20_unique_circle_seeds()):
    print(f"{i+1}. {seed}")
