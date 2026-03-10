import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_canvas(ax, title, x_range=(-5, 5), y_range=(-10, 10)):
    ax.spines['left'].set_position('zero')
    ax.spines['bottom'].set_position('zero')
    ax.spines['right'].set_color('none')
    ax.spines['top'].set_color('none')
    ax.set_aspect('auto')
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
    ax.grid(True, linestyle='--', alpha=0.3)

def gen_cubic_roots(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Factor Theorem: $f(x) = (x+2)(x-1)(x-3)$", x_range=(-4, 5), y_range=(-15, 10))
    
    x = np.linspace(-3.5, 4.5, 400)
    y = (x + 2) * (x - 1) * (x - 3)
    ax.plot(x, y, 'b-', lw=3)
    
    # Intercepts
    roots = [-2, 1, 3]
    for r in roots:
        ax.plot(r, 0, 'ro')
        ax.text(r, 0.8, f"$x={r}$", ha='center', color='red', fontweight='bold')
        ax.text(r, -2, f"$(x{'+' if r<0 else '-'}{abs(r)})$ is factor", ha='center', fontsize=9)
        
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_remainder_theorem(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Remainder Theorem: $f(a) = \text{Remainder}$", x_range=(-2, 5), y_range=(-5, 15))
    
    x = np.linspace(-1, 5, 400)
    y = 0.5*x**3 - 2*x + 4
    ax.plot(x, y, 'g-', lw=2)
    
    # Let divisor be (x-3), substitute x=3
    a = 3
    fa = 0.5*3**3 - 2*3 + 4 # 13.5 - 6 + 4 = 11.5
    
    ax.plot(a, fa, 'ro')
    ax.vlines(a, 0, fa, color='red', linestyle='--')
    ax.hlines(fa, 0, a, color='red', linestyle='--')
    
    ax.text(a + 0.2, fa, f"$f(3) = 11.5$", fontweight='bold', color='red')
    ax.text(a, -1, r"Divisor $(x-3)$", ha='center', color='blue')
    ax.text(-1, fa, r"Remainder", va='center', color='blue', rotation=90)
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_division_algorithm(output_path):
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.axis('off')
    
    # Visual Box for P(x) = D(x)Q(x) + R
    rect_style = dict(boxstyle='round', facecolor='white', edgecolor='black', alpha=0.8)
    
    ax.text(0.5, 0.8, "Polynomial Division Architecture", ha='center', fontsize=14, fontweight='bold')
    
    # Equation components
    ax.text(0.1, 0.4, r"$P(x)$", bbox=dict(boxstyle='round,pad=1', facecolor='azure'), fontsize=15)
    ax.text(0.25, 0.4, r"$=$", fontsize=20)
    ax.text(0.4, 0.4, r"$D(x)$", bbox=dict(boxstyle='round,pad=1', facecolor='lavender'), fontsize=15)
    ax.text(0.55, 0.4, r"$\times$", fontsize=20)
    ax.text(0.7, 0.4, r"$Q(x)$", bbox=dict(boxstyle='round,pad=1', facecolor='honeydew'), fontsize=15)
    ax.text(0.85, 0.4, r"$+$", fontsize=20)
    ax.text(0.95, 0.4, r"$R$", bbox=dict(boxstyle='round,pad=1', facecolor='mistyrose'), fontsize=15)
    
    # Labels
    ax.text(0.1, 0.2, "Dividend", ha='center', fontsize=12)
    ax.text(0.4, 0.2, "Divisor", ha='center', fontsize=12)
    ax.text(0.7, 0.2, "Quotient", ha='center', fontsize=12)
    ax.text(0.95, 0.2, "Remainder", ha='center', fontsize=12)
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_cubic_roots(os.path.join(out_dir, "poly_cubic_roots.png"))
    gen_remainder_theorem(os.path.join(out_dir, "poly_remainder_point.png"))
    gen_division_algorithm(os.path.join(out_dir, "poly_div_algorithm.png"))
    
    print("Successfully generated 3 premium Polynomial diagrams.")
