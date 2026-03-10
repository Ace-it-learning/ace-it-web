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

def gen_domain_range(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Domain and Range: $f(x) = \sqrt{x+2}$", x_range=(-3, 8), y_range=(-1, 4))
    
    x = np.linspace(-2, 8, 400)
    y = np.sqrt(x + 2)
    ax.plot(x, y, 'b-', lw=3)
    
    # Domain indicator
    ax.plot([-2, 8], [-0.5, -0.5], 'r-', lw=5, alpha=0.3)
    ax.text(3, -0.8, r"Domain: $x \geq -2$", color='red', fontweight='bold', ha='center')
    
    # Range indicator
    ax.plot([-2.5, -2.5], [0, 3.16], 'g-', lw=5, alpha=0.3)
    ax.text(-2.8, 1.5, r"Range: $y \geq 0$", color='green', fontweight='bold', rotation=90, va='center')
    
    ax.plot(-2, 0, 'ro')
    ax.set_xlabel("x", loc='right')
    ax.set_ylabel("y", loc='top')
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_transformations(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Transformations: $f(x) \rightarrow f(x-2)+3$")
    
    x = np.linspace(-4, 4, 400)
    y1 = x**2
    y2 = (x-2)**2 + 3
    
    ax.plot(x, y1, 'k--', alpha=0.3, label=r"Original $f(x) = x^2$")
    ax.plot(x + 2, y2, 'r-', lw=3, label=r"Shifted $f(x-2)+3$")
    
    # Movement arrows
    ax.annotate('', xy=(2, 3), xytext=(0, 0),
                arrowprops=dict(arrowstyle='->', lw=2, color='blue'))
    ax.text(1.2, 1.2, "Right 2, Up 3", color='blue', rotation=35, fontweight='bold')
    
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_even_odd(output_path):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Even
    setup_canvas(ax1, r"Even Function: $f(x) = f(-x)$")
    x = np.linspace(-3, 3, 400)
    ax1.plot(x, x**2, 'b-', lw=2)
    ax1.axvline(0, color='r', linestyle=':', lw=2, label="Reflect Line")
    ax1.set_title("Even (Y-axis Symmetry)")
    
    # Odd
    setup_canvas(ax2, r"Odd Function: $f(-x) = -f(x)$", y_range=(-10, 10))
    ax2.plot(x, x**3, 'g-', lw=2)
    ax2.plot(0, 0, 'ro', label="Origin Symmetry")
    ax2.set_title("Odd (Origin Symmetry)")
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_domain_range(os.path.join(out_dir, "func_domain_range_premium.png"))
    gen_transformations(os.path.join(out_dir, "func_transform_premium.png"))
    gen_even_odd(os.path.join(out_dir, "func_even_odd_premium.png"))
    
    print("Successfully generated 3 premium Functions diagrams.")
