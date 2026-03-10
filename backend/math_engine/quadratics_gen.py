import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_canvas(ax, title, x_range=(-5, 5), y_range=(-5, 10)):
    ax.spines['left'].set_position('zero')
    ax.spines['bottom'].set_position('zero')
    ax.spines['right'].set_color('none')
    ax.spines['top'].set_color('none')
    ax.set_aspect('auto')
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    ax.grid(True, linestyle='--', alpha=0.3)
    ax.set_title(title, fontsize=14, fontweight='bold', pad=20)

def gen_delta_cases(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Nature of Roots: The Discriminant $\Delta$")
    
    x = np.linspace(-4, 4, 400)
    
    # Delta > 0 (2 distinct real roots)
    y1 = x**2 - 4
    ax.plot(x, y1, 'b-', lw=2, label=r"$\Delta > 0$ (2 intercepts)")
    
    # Delta = 0 (1 repeated root)
    y2 = x**2
    ax.plot(x, y2, 'g-', lw=2, label=r"$\Delta = 0$ (1 intercept)")
    
    # Delta < 0 (0 real roots)
    y3 = x**2 + 4
    ax.plot(x, y3, 'r-', lw=2, label=r"$\Delta < 0$ (0 intercepts)")
    
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_vertex_shift(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Vertex Form: $y = a(x - h)^2 + k$")
    
    x = np.linspace(-4, 6, 400)
    
    # Standard y = x^2
    ax.plot(x, x**2, 'k--', alpha=0.3, label=r"Parent: $y = x^2$")
    
    # shifted y = (x-2)^2 + 3
    h, k = 2, 3
    y = (x-h)**2 + k
    ax.plot(x, y, 'purple', lw=3, label=r"Shifted: $h=2, k=3$")
    ax.plot(h, k, 'ro')
    ax.annotate(r"Vertex $(h, k)$", xy=(h, k), xytext=(h+0.5, k-2),
                arrowprops=dict(facecolor='black', shrink=0.05))
    
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_roots_relations(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Sum & Product of Roots ($\alpha, \beta$)")
    
    x = np.linspace(-2, 5, 400)
    # Roots at 1 and 4 => y = (x-1)(x-4) = x^2 - 5x + 4
    y = (x-1)*(x-4)
    ax.plot(x, y, 'darkcyan', lw=3)
    
    ax.plot([1, 4], [0, 0], 'ro')
    ax.text(1, 0.5, r"$\alpha$", fontsize=15, color='red', ha='center')
    ax.text(4, 0.5, r"$\beta$", fontsize=15, color='red', ha='center')
    
    # Formula box
    textstr = '\n'.join((
        r'$\alpha + \beta = -b/a = 5$',
        r'$\alpha \beta = c/a = 4$'))
    props = dict(boxstyle='round', facecolor='wheat', alpha=0.5)
    ax.text(0.05, 0.95, textstr, transform=ax.transAxes, fontsize=12,
            verticalalignment='top', bbox=props)
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_delta_cases(os.path.join(out_dir, "quad_delta_cases.png"))
    gen_vertex_shift(os.path.join(out_dir, "quad_vertex_shift.png"))
    gen_roots_relations(os.path.join(out_dir, "quad_roots_relations.png"))
    
    print("Successfully generated 3 Quadratic diagrams.")
