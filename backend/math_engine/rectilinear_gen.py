import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_canvas(ax, title, x_range=(-1, 11), y_range=(-1, 11)):
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    ax.set_title(title, fontsize=14, fontweight='bold', pad=10)

def gen_triangle_angle_sum(output_path):
    fig, ax = plt.subplots(figsize=(6, 5))
    setup_canvas(ax, "Angle Sum of Triangle: $180^\circ$")
    
    # Vertices
    v = np.array([[1, 1], [9, 1], [4, 8]])
    triangle = plt.Polygon(v, fill=True, color='#C7D2FE', alpha=0.3, ec='k', lw=2)
    ax.add_patch(triangle)
    
    # Angles
    ax.text(1.8, 1.4, r"$A$", fontsize=16, fontweight='bold')
    ax.text(8.2, 1.4, r"$B$", fontsize=16, fontweight='bold')
    ax.text(4, 6.8, r"$C$", fontsize=16, fontweight='bold', ha='center')
    
    # Formula box
    ax.text(5, -0.5, r"$A + B + C = 180^\circ$", fontsize=18, fontweight='bold', 
            ha='center', bbox=dict(facecolor='white', edgecolor='purple', boxstyle='round,pad=0.5'))
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_exterior_angle(output_path):
    fig, ax = plt.subplots(figsize=(7, 5))
    setup_canvas(ax, "Exterior Angle of Triangle")
    
    # Triangle Vertices + Extension
    v = np.array([[1, 1], [6, 1], [3, 7]])
    ext = np.array([9, 1])
    
    triangle = plt.Polygon(v, fill=True, color='#6EE7B7', alpha=0.3, ec='k', lw=2)
    ax.add_patch(triangle)
    
    # Base line extension
    ax.plot([6, 9], [1, 1], 'k--', lw=2)
    
    # Label interior angles
    ax.text(1.8, 1.4, r"$a$", fontsize=16)
    ax.text(3, 5.8, r"$b$", fontsize=16, ha='center')
    
    # Label exterior angle
    ax.text(6.8, 1.4, r"$x$", fontsize=18, fontweight='bold', color='red')
    
    # Formula label
    ax.text(5, 4, r"$x = a + b$", fontsize=20, fontweight='bold', color='red',
            bbox=dict(facecolor='white', alpha=0.8, boxstyle='round,pad=0.3'))
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_polygon_angle_sum(output_path):
    fig, ax = plt.subplots(figsize=(6, 6))
    setup_canvas(ax, "Interior Angle Sum of Polygons")
    
    # Pentagon vertices
    v = np.array([[3, 1], [8, 3], [7, 8], [3, 9], [1, 5]])
    poly = plt.Polygon(v, fill=True, color='#FDE047', alpha=0.3, ec='k', lw=2)
    ax.add_patch(poly)
    
    # Diagonals
    p1 = v[0]
    ax.plot([p1[0], v[2][0]], [p1[1], v[2][1]], 'gray', linestyle='--', alpha=0.6)
    ax.plot([p1[0], v[3][0]], [p1[1], v[3][1]], 'gray', linestyle='--', alpha=0.6)
    
    # Labels
    ax.text(5, 5, r"3 Triangles" + "\n" + r"$(5-2) \times 180^\circ$", fontsize=12, ha='center', fontweight='bold')
    ax.text(5, -0.5, r"$\text{Sum} = (n-2) \times 180^\circ$", fontsize=18, ha='center',
            bbox=dict(facecolor='white', edgecolor='orange', boxstyle='round,pad=0.5'))
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_polygon_exterior_sum(output_path):
    fig, ax = plt.subplots(figsize=(6, 6))
    setup_canvas(ax, "Exterior Angle Sum = $360^\circ$")
    
    # Quadrilateral with extended sides
    v = np.array([[2, 2], [7, 2], [8, 7], [3, 8]])
    poly = plt.Polygon(v, fill=True, color='#FCA5A5', alpha=0.3, ec='k', lw=2)
    ax.add_patch(poly)
    
    # Extensions
    ax.plot([7, 10], [2, 2], 'k--', alpha=0.8) # Bottom
    ax.plot([8, 8.5], [7, 9.5], 'k--', alpha=0.8) # Right
    ax.plot([3, 0], [8, 8.5], 'k--', alpha=0.8) # Top
    ax.plot([2, 1.5], [2, 0], 'k--', alpha=0.8) # Left
    
    # Exterior labels
    ax.text(7.5, 1.4, r"$d$", fontsize=16)
    ax.text(8.4, 7.8, r"$a$", fontsize=16)
    ax.text(2, 8.4, r"$b$", fontsize=16)
    ax.text(1, 1, r"$c$", fontsize=16)
    
    ax.text(5, -0.5, r"$a+b+c+d = 360^\circ$", fontsize=18, ha='center',
            bbox=dict(facecolor='white', edgecolor='red', boxstyle='round,pad=0.5'))
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_parallel_lines(output_path):
    fig, ax = plt.subplots(figsize=(7, 5))
    setup_canvas(ax, "Parallel Line Properties")
    
    # Lines
    ax.plot([0, 10], [2, 2], 'k', lw=2)
    ax.plot([0, 10], [6, 6], 'k', lw=2)
    ax.plot([2, 8], [0, 8], 'r', lw=2) # Transversal
    
    # Parallel arrows
    ax.text(3, 1.8, ">>", fontsize=15, fontweight='bold', ha='center')
    ax.text(3, 5.8, ">>", fontsize=15, fontweight='bold', ha='center')
    
    # Angle labels
    # Corr
    ax.text(4.2, 2.2, r"$x$", fontsize=14, color='blue')
    ax.text(7.2, 6.2, r"$x$", fontsize=14, color='blue')
    ax.text(9, 2, r"Corr. $\angle$s", fontsize=10, color='blue')
    
    # Alt
    ax.text(5.5, 5.5, r"$y$", fontsize=14, color='green')
    ax.text(2.5, 2.5, r"$y$", fontsize=14, color='green')
    ax.text(9, 6, r"Alt. $\angle$s", fontsize=10, color='green')
    
    # Interior
    ax.text(6.8, 5.2, r"$a$", fontsize=14, color='orange')
    ax.text(3.8, 2.2, r"$b$", fontsize=14, color='orange')
    ax.text(1, 4, r"$a+b=180^\circ$" + "\n" + r"Int. $\angle$s", fontsize=10, color='orange', ha='center')
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_rectilinear_pythagoras(output_path):
    fig, ax = plt.subplots(figsize=(6, 6))
    setup_canvas(ax, "Pythagoras' Theorem")
    
    # Right-angled triangle
    v = np.array([[1, 1], [7, 1], [1, 5]])
    tri = plt.Polygon(v, fill=True, color='teal', alpha=0.2, ec='k', lw=2)
    ax.add_patch(tri)
    
    # Right angle mark
    ax.plot([1, 1.5, 1.5], [1.5, 1.5, 1], 'k', lw=1)
    
    # Labels
    ax.text(4, 0.5, r"$a$", fontsize=16)
    ax.text(0.5, 3, r"$b$", fontsize=16)
    ax.text(4.2, 3.2, r"$c$", fontsize=16, fontweight='bold')
    
    ax.text(5, 5, r"$a^2 + b^2 = c^2$", fontsize=22, ha='center',
            bbox=dict(facecolor='white', edgecolor='teal', boxstyle='round,pad=0.5'))
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_similar_figures_ratio(output_path):
    fig, ax = plt.subplots(figsize=(8, 5))
    setup_canvas(ax, "Area Ratio of Similar Figures", x_range=(-1, 15))
    
    # Triangle 1
    v1 = np.array([[1, 1], [4, 1], [2, 4]])
    poly1 = plt.Polygon(v1, fill=True, color='blue', alpha=0.2, ec='k')
    ax.add_patch(poly1)
    ax.text(2.5, 0.5, r"Length $l_1$", fontsize=10, ha='center')
    ax.text(2.5, 2, r"Area $A_1$", fontsize=12, ha='center', fontweight='bold')
    
    # Triangle 2 (k=2)
    v2 = np.array([[7, 1], [13, 1], [9, 7]])
    poly2 = plt.Polygon(v2, fill=True, color='red', alpha=0.2, ec='k')
    ax.add_patch(poly2)
    ax.text(10, 0.5, r"Length $l_2$", fontsize=10, ha='center')
    ax.text(10, 3, r"Area $A_2$", fontsize=14, ha='center', fontweight='bold')
    
    # Ratio formula
    text = r"$\frac{A_1}{A_2} = \left( \frac{l_1}{l_2} \right)^2$"
    ax.text(7, 9, text, fontsize=22, ha='center', bbox=dict(facecolor='#f8f9fa', boxstyle='round,pad=0.5'))
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_congruence_tests(output_path):
    fig, ax = plt.subplots(figsize=(10, 6))
    setup_canvas(ax, "Tests for Congruent Triangles ($\cong$)", x_range=(-1, 21), y_range=(-1, 11))
    
    # Draw two congruent triangles (SSS example)
    v1 = np.array([[1, 2], [6, 2], [3, 7]])
    v2 = np.array([[9, 2], [14, 2], [11, 7]])
    
    ax.add_patch(plt.Polygon(v1, fill=True, color='purple', alpha=0.1, ec='k', lw=2))
    ax.add_patch(plt.Polygon(v2, fill=True, color='purple', alpha=0.1, ec='k', lw=2))
    
    # Tick marks for SSS
    ax.plot([3.5, 3.5], [1.8, 2.2], 'k', lw=1.5) # Side 1
    ax.plot([11.5, 11.5], [1.8, 2.2], 'k', lw=1.5)
    
    # Labels for all 5 tests
    tests = ["SSS", "SAS", "ASA", "AAS", "RHS"]
    for i, test in enumerate(tests):
        ax.text(17, 8 - i*1.5, rf"$\bullet$ {test}", fontsize=16, fontweight='bold', color='purple')
    
    ax.text(7.5, -0.5, r"$\triangle ABC \cong \triangle DEF$", fontsize=18, ha='center',
            bbox=dict(facecolor='white', edgecolor='purple', boxstyle='round,pad=0.5'))
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_similarity_tests(output_path):
    fig, ax = plt.subplots(figsize=(10, 6))
    setup_canvas(ax, "Tests for Similar Triangles ($\sim$)", x_range=(-1, 21), y_range=(-1, 11))
    
    # Draw two similar triangles (AAA example)
    v1 = np.array([[1, 2], [5, 2], [3, 6]])
    v2 = np.array([[8, 2], [14, 2], [11, 8]]) # k=1.5
    
    ax.add_patch(plt.Polygon(v1, fill=True, color='blue', alpha=0.1, ec='k', lw=2))
    ax.add_patch(plt.Polygon(v2, fill=True, color='blue', alpha=0.1, ec='k', lw=2))
    
    # Angle marks (AAA)
    ax.text(1.8, 2.2, r"$\alpha$", color='red', fontsize=12)
    ax.text(8.8, 2.2, r"$\alpha$", color='red', fontsize=12)
    
    # Labels for tests
    tests = [r"AAA", r"3 sides prop.", r"ratio of 2 sides, inc. $\angle$"]
    for i, test in enumerate(tests):
        ax.text(16, 7 - i*1.8, rf"$\bullet$ {test}", fontsize=14, fontweight='bold', color='blue')
    
    ax.text(7.5, -0.5, r"$\triangle ABC \sim \triangle DEF$", fontsize=18, ha='center',
            bbox=dict(facecolor='white', edgecolor='blue', boxstyle='round,pad=0.5'))
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_triangle_angle_sum(os.path.join(out_dir, "rectilinear_triangle_sum.png"))
    gen_exterior_angle(os.path.join(out_dir, "rectilinear_exterior_angle.png"))
    gen_polygon_angle_sum(os.path.join(out_dir, "rectilinear_polygon_sum.png"))
    gen_polygon_exterior_sum(os.path.join(out_dir, "rectilinear_polygon_exterior.png"))
    gen_parallel_lines(os.path.join(out_dir, "rectilinear_parallel_lines.png"))
    gen_similar_figures_ratio(os.path.join(out_dir, "rectilinear_similar_ratio.png"))
    gen_congruence_tests(os.path.join(out_dir, "rectilinear_congruence.png"))
    gen_similarity_tests(os.path.join(out_dir, "rectilinear_similarity.png"))
    gen_rectilinear_pythagoras(os.path.join(out_dir, "rectilinear_pythagoras.png"))
    
    print("Successfully generated 9 Rectilinear Figures diagrams.")
