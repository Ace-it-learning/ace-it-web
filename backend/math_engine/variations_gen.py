import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_canvas(ax, title, x_range=(0, 10), y_range=(0, 10)):
    ax.spines['left'].set_position('zero')
    ax.spines['bottom'].set_position('zero')
    ax.spines['right'].set_color('none')
    ax.spines['top'].set_color('none')
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    ax.grid(True, linestyle='--', alpha=0.3)
    ax.set_title(title, fontsize=14, fontweight='bold', pad=20)

def gen_direct_variation(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, "Direct Variation: $y = kx$")
    
    x = np.linspace(0, 10, 100)
    k = 0.8
    y = k * x
    
    ax.plot(x, y, 'b-', lw=3, label=f"$y = {k}x$")
    ax.plot(5, 4, 'ro', label="Constant Ratio: $y/x = k$")
    ax.annotate("", xy=(5, 4), xytext=(5, 0), arrowprops=dict(arrowstyle='<->', color='red', linestyle='--'))
    ax.annotate("", xy=(5, 4), xytext=(0, 4), arrowprops=dict(arrowstyle='<->', color='red', linestyle='--'))
    
    ax.text(5.2, 2, "Passes through (0,0)", fontsize=10, color='gray')
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_inverse_variation(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, "Inverse Variation: $y = k/x$", x_range=(0, 10), y_range=(0, 20))
    
    x = np.linspace(0.5, 10, 200)
    k = 10
    y = k / x
    
    ax.plot(x, y, 'r-', lw=3, label=f"$y = {k}/x$")
    
    # Area xy = k
    rect = plt.Rectangle((0, 0), 2, 5, color='green', alpha=0.1, label="Area $xy = k$")
    ax.add_patch(rect)
    ax.plot(2, 5, 'go')
    
    ax.text(0.5, 12, "Hyperbola", fontsize=10, color='gray')
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_partial_variation(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, "Partial Variation: $y = k_1 + k_2x$", x_range=(0, 10), y_range=(0, 15))
    
    x = np.linspace(0, 10, 100)
    k1 = 4
    k2 = 0.6
    y = k1 + k2 * x
    
    ax.plot(x, y, 'g-', lw=3, label=f"$y = {k1} + {k2}x$")
    
    # Intrecept k1
    ax.plot(0, k1, 'ko')
    ax.text(0.2, k1 + 0.5, f"Constant Part $k_1 = {k1}$", fontweight='bold')
    
    # Slope k2
    ax.annotate("Varying Part $k_2x$", xy=(8, k1+k2*8), xytext=(8, k1), 
                arrowprops=dict(arrowstyle='<->', color='blue', lw=2))
    
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_direct_variation(os.path.join(out_dir, "var_direct_premium.png"))
    gen_inverse_variation(os.path.join(out_dir, "var_inverse_premium.png"))
    gen_partial_variation(os.path.join(out_dir, "var_partial_premium.png"))
    
    print("Successfully generated 3 premium Variations diagrams.")
