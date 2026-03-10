import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_number_line(ax, x_range=(-5, 10)):
    ax.spines['left'].set_color('none')
    ax.spines['right'].set_color('none')
    ax.spines['top'].set_color('none')
    ax.spines['bottom'].set_position('zero')
    ax.set_yticks([])
    ax.set_xlim(x_range)
    ax.set_xticks(range(x_range[0], x_range[1] + 1))
    ax.grid(False)

def gen_number_line_compound(output_path):
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 6))
    
    # CASE 1: AND (Intersection) 2 < x < 5
    setup_number_line(ax1)
    ax1.set_title("AND Condition: $x > 2$ and $x \leq 5$", fontweight='bold')
    # x > 2
    ax1.plot([2, 9], [0.5, 0.5], 'b-', lw=3)
    ax1.plot(2, 0.5, 'bo', mfc='white', ms=8) # hollow
    # x <= 5
    ax1.plot([-4, 5], [1, 1], 'g-', lw=3)
    ax1.plot(5, 1, 'go', ms=8) # solid
    # Overlap
    ax1.fill_between([2, 5], 0, 1.5, color='yellow', alpha=0.3)
    ax1.text(3.5, 1.6, "Intersection", ha='center', color='darkorange', fontweight='bold')

    # CASE 2: OR (Union) x < -2 or x > 3
    setup_number_line(ax2)
    ax2.set_title("OR Condition: $x < -2$ or $x > 3$", fontweight='bold')
    # x < -2
    ax2.plot([-4.5, -2], [0.5, 0.5], 'r-', lw=3)
    ax2.plot(-2, 0.5, 'ro', mfc='white', ms=8)
    # x > 3
    ax2.plot([3, 9], [0.5, 0.5], 'r-', lw=3)
    ax2.plot(3, 0.5, 'ro', mfc='white', ms=8)
    
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_quad_inequality_premium(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.spines['left'].set_position('zero')
    ax.spines['bottom'].set_position('zero')
    ax.spines['right'].set_color('none')
    ax.spines['top'].set_color('none')
    ax.set_xlim(-4, 6)
    ax.set_ylim(-10, 15)
    
    x = np.linspace(-3, 5, 400)
    # y = (x+1)(x-4) = x^2 - 3x - 4
    y = (x + 1) * (x - 4)
    ax.plot(x, y, 'b-', lw=3)
    
    # Roots
    ax.plot([-1, 4], [0, 0], 'ro')
    ax.text(-1, 0.5, "-1", ha='center', fontweight='bold')
    ax.text(4, 0.5, "4", ha='center', fontweight='bold')
    
    # Shading for f(x) < 0
    x_mid = np.linspace(-1, 4, 100)
    y_mid = (x_mid + 1) * (x_mid - 4)
    ax.fill_between(x_mid, y_mid, 0, color='red', alpha=0.2, label=r"$x^2 - 3x - 4 < 0$")
    
    # Shading for f(x) > 0
    x_left = np.linspace(-3, -1, 50)
    ax.fill_between(x_left, (x_left+1)*(x_left-4), 0, color='green', alpha=0.1, label=r"$> 0$ (Wings)")
    x_right = np.linspace(4, 5, 50)
    ax.fill_between(x_right, (x_right+1)*(x_right-4), 0, color='green', alpha=0.1)
    
    ax.set_title("Quadratic: $f(x) < 0$ (Between) vs $f(x) > 0$ (Beyond)", pad=20)
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_linear_region_2v(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.spines['left'].set_position('zero')
    ax.spines['bottom'].set_position('zero')
    ax.set_xlim(-2, 6)
    ax.set_ylim(-2, 6)
    ax.grid(True, linestyle='--', alpha=0.5)
    
    # Inequality: 2x + 3y <= 12  =>  y <= -2/3x + 4
    x = np.linspace(-2, 6, 400)
    y = -2/3 * x + 4
    ax.plot(x, y, 'r-', lw=2, label=r"$2x + 3y = 12$")
    
    # Fill region below
    ax.fill_between(x, -2, y, where=(y > -2), color='blue', alpha=0.1, label="Solution Region")
    
    # Intercepts
    ax.plot([0, 6], [4, 0], 'ko')
    ax.text(0.2, 4.2, "(0, 4)", fontweight='bold')
    ax.text(5.5, 0.3, "(6, 0)", fontweight='bold')
    
    ax.set_title("Linear Inequality in 2 Variables (Shaded Region)", pad=20)
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_number_line_compound(os.path.join(out_dir, "ineq_number_line.png"))
    gen_quad_inequality_premium(os.path.join(out_dir, "ineq_quad_shading.png"))
    gen_linear_region_2v(os.path.join(out_dir, "ineq_linear_2v.png"))
    
    print("Successfully generated 3 premium Inequalities diagrams.")
