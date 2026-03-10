#!/usr/bin/env python3
"""
render_circle_geometry.py — Specialized Matplotlib-based circle geometry renderer.
Supports drawing circles, chords, arcs, tangents, and labeling angles.
"""

import sys
import json
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Arc, Circle, Wedge, Polygon
import matplotlib.patheffects as path_effects

# --- Aesthetics Configuration ---
DPI = 150
FIG_SIZE = (6, 6)
LINE_COLOR = '#333333'
LINE_WIDTH = 2.0
FONT_SANS = ['Arial', 'sans-serif']
LABEL_FONT_SIZE = 12
ANNOTATION_COLOR = '#D32F2F' # DSE Red for labels/marks

def sanitize_label(label):
    r"""Convert LaTeX-style labels to Matplotlib TeX-safe format.
    JSON.loads produces single-backslash strings, e.g. '110\\degree' -> '110\degree' in Python.
    Matplotlib needs dollar-wrapped TeX: '$110^\circ$'.
    """
    if not label:
        return label
    # Use explicit chr(92) comparisons to avoid escape sequence confusion
    bs = chr(92)  # backslash character
    label = label.replace(bs + 'degree', '^' + bs + 'circ')
    label = label.replace(bs + 'deg', '^' + bs + 'circ')
    # If label contains TeX commands (backslash, caret, underscore), wrap in $ for math mode
    if bs in label or '^' in label or '_' in label:
        if not label.startswith('$'):
            label = f"${label}$"
    return label

def get_point_on_circle(center, radius, angle_deg):
    angle_rad = np.radians(angle_deg)
    return (center[0] + radius * np.cos(angle_rad), center[1] + radius * np.sin(angle_rad))

def draw_geometry(spec, output_path):
    fig, ax = plt.subplots(figsize=FIG_SIZE, dpi=DPI)
    ax.set_aspect('equal')
    ax.axis('off')
    
    center = np.array(spec.get('center', [0, 0]))
    radius = spec.get('radius', 5)
    
    # 1. RESOLVE POINTS
    # We create a lookup map { "A": [x, y] }
    resolved_pts = {}
    points_data = spec.get('points', [])
    for pt in points_data:
        label = pt.get('label', '')
        # Support angle-based positioning: (r, theta)
        if 'angle' in pt:
            angle_deg = pt['angle']
            pos = get_point_on_circle(center, radius, angle_deg)
        else:
            pos = pt.get('pos', [0, 0])
        
        resolved_pts[label] = np.array(pos)
        
        # Draw the point marker
        ax.scatter([pos[0]], [pos[1]], color=LINE_COLOR, s=30, zorder=5)
        
        # Draw the label
        san_label = sanitize_label(label)
        offset = pt.get('offset', [0.3, 0.3])
        if label:
            ax.text(pos[0] + offset[0], pos[1] + offset[1], san_label, 
                    fontsize=LABEL_FONT_SIZE, fontweight='bold',
                    ha='center', va='center', zorder=6,
                    path_effects=[path_effects.withStroke(linewidth=3, foreground='white')])

    # 2. RESOLVE CENTER
    resolved_pts['O'] = center
    if spec.get('show_center', True):
        ax.scatter([center[0]], [center[1]], color=LINE_COLOR, s=40, zorder=5)
        ax.text(center[0], center[1] - 0.5, 'O', fontsize=LABEL_FONT_SIZE, 
                fontweight='bold', ha='center', zorder=6)

    # 3. DRAW MAIN CIRCLE
    main_circle = Circle(center, radius, color=LINE_COLOR, fill=False, linewidth=LINE_WIDTH, zorder=2)
    ax.add_patch(main_circle)
    
    # 4. DRAW LINES
    lines = spec.get('lines', [])
    for line in lines:
        pts_spec = line.get('pts', []) # ["A", "B"]
        raw_pts = line.get('points', []) # [[x,y], [x,y]]
        
        line_coords = []
        if pts_spec:
            # Resolve from label map
            for p_label in pts_spec:
                if p_label in resolved_pts:
                    line_coords.append(resolved_pts[p_label])
        elif raw_pts:
            line_coords = raw_pts
            
        if len(line_coords) >= 2:
            pts_array = np.array(line_coords)
            color = line.get('color', LINE_COLOR)
            style = line.get('style', '-')
            lw = line.get('linewidth', LINE_WIDTH)
            ax.plot(pts_array[:, 0], pts_array[:, 1], color=color, linestyle=style, linewidth=lw, zorder=3)
    
    # 5. DRAW ANGLES
    angles = spec.get('angles', [])
    for ang in angles:
        # Support label-based angle: pts=["A", "B", "C"] means angle ABC (B is vertex)
        ang_pts = ang.get('pts', [])
        label = sanitize_label(ang.get('label', ''))
        ang_radius = ang.get('radius', 0.8)
        
        if len(ang_pts) == 3:
            p1 = resolved_pts.get(ang_pts[0])
            v = resolved_pts.get(ang_pts[1])
            p2 = resolved_pts.get(ang_pts[2])
            
            if p1 is not None and v is not None and p2 is not None:
                # Calculate start/end angles relative to vertex
                v1 = p1 - v
                v2 = p2 - v
                # Use atan2 to get angles in range [-180, 180]
                start_angle = np.degrees(np.arctan2(v1[1], v1[0])) % 360
                end_angle = np.degrees(np.arctan2(v2[1], v2[0])) % 360
                
                # Sort angles to ensure Arc draws the smaller interior angle
                a1, a2 = min(start_angle, end_angle), max(start_angle, end_angle)
                if a2 - a1 > 180:
                    a1, a2 = a2, a1 + 360
                
                # Draw Arc
                arc = Arc(v, ang_radius*2, ang_radius*2, angle=0, 
                          theta1=a1, theta2=a2, 
                          color=ANNOTATION_COLOR, linewidth=1.5, zorder=4)
                ax.add_patch(arc)
                
                if label:
                    mid_angle = np.radians((a1 + a2) / 2)
                    label_pos = v + ang_radius * 1.8 * np.array([np.cos(mid_angle), np.sin(mid_angle)])
                    ax.text(label_pos[0], label_pos[1], label, color=ANNOTATION_COLOR, 
                            fontsize=LABEL_FONT_SIZE - 2, fontweight='bold', ha='center', va='center')
        else:
            # Fallback to direct spec
            vertex = ang.get('vertex', [0, 0])
            start_deg = ang.get('start_angle', 0)
            end_deg = ang.get('end_angle', 45)
            arc = Arc(vertex, ang_radius*2, ang_radius*2, angle=0, 
                      theta1=start_deg, theta2=end_deg, color=ANNOTATION_COLOR, linewidth=1.5)
            ax.add_patch(arc)
            if label:
                mid = np.radians((start_deg + end_deg) / 2)
                lpos = (vertex[0] + ang_radius * 1.5 * np.cos(mid), vertex[1] + ang_radius * 1.5 * np.sin(mid))
                ax.text(lpos[0], lpos[1], label, color=ANNOTATION_COLOR, 
                        fontsize=LABEL_FONT_SIZE - 2, fontweight='bold', ha='center', va='center')

    # 6. LIMITS
    all_x = [center[0] - radius, center[0] + radius]
    all_y = [center[1] - radius, center[1] + radius]
    for p in resolved_pts.values():
        all_x.append(p[0])
        all_y.append(p[1])
        
    padding_x = (max(all_x) - min(all_x)) * 0.1
    padding_y = (max(all_y) - min(all_y)) * 0.1
    padding = max(padding_x, padding_y, 1.0)
    
    ax.set_xlim(min(all_x) - padding, max(all_x) + padding)
    ax.set_ylim(min(all_y) - padding, max(all_y) + padding)
    
    plt.tight_layout()
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    fig.savefig(output_path, bbox_inches='tight', pad_inches=0.1)
    plt.close(fig)
    
    plt.tight_layout()
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    fig.savefig(output_path, bbox_inches='tight', pad_inches=0.1)
    plt.close(fig)

def main():
    if len(sys.argv) < 3:
        print("Usage: python render_circle_geometry.py '<json_spec>' '<output_path>'")
        sys.exit(1)
        
    spec_input = sys.argv[1]
    output_path = sys.argv[2]
    
    try:
        if os.path.isfile(spec_input):
            with open(spec_input, 'r', encoding='utf-8') as f:
                spec = json.load(f)
        else:
            spec = json.loads(spec_input)
            
        draw_geometry(spec, output_path)
        print(json.dumps({"success": True, "path": output_path}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
