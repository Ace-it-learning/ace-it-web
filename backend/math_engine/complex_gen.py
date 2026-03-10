import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_argand(ax, title, x_range=(-5, 5), y_range=(-5, 5)):
    ax.spines['left'].set_position('zero')
    ax.spines['bottom'].set_position('zero')
    ax.spines['right'].set_color('none')
    ax.spines['top'].set_color('none')
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    ax.grid(True, linestyle='--', alpha=0.3)
    ax.set_title(title, fontsize=14, fontweight='bold', pad=20)
    ax.set_xlabel("Re", loc='right')
    ax.set_ylabel("Im", loc='top', rotation=0)

def gen_argand_basics(output_path):
    fig, ax = plt.subplots(figsize=(8, 8))
    setup_argand(ax, "Argand Diagram: $z$ vs $\\bar{z}$", x_range=(-1, 5), y_range=(-4, 4))
    
    z = complex(3, 2)
    z_bar = z.conjugate()
    
    # Plot z
    ax.plot(z.real, z.imag, 'bo', ms=8, label="$z = 3 + 2i$")
    ax.annotate("", xy=(z.real, z.imag), xytext=(0, 0), arrowprops=dict(arrowstyle='->', color='blue', lw=2))
    
    # Plot z_bar
    ax.plot(z_bar.real, z_bar.imag, 'ro', ms=8, label="$\\bar{z} = 3 - 2i$")
    ax.annotate("", xy=(z_bar.real, z_bar.imag), xytext=(0, 0), arrowprops=dict(arrowstyle='->', color='red', lw=2))
    
    # Reflection line indicator
    ax.text(z.real + 0.2, z.imag, "$z$", fontsize=12, color='blue')
    ax.text(z_bar.real + 0.2, z_bar.imag, "$\\bar{z}$", fontsize=12, color='red')
    
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_complex_addition(output_path):
    fig, ax = plt.subplots(figsize=(8, 8))
    setup_argand(ax, "Vector Addition: $z_1 + z_2$", x_range=(-1, 6), y_range=(-1, 6))
    
    z1 = complex(4, 1)
    z2 = complex(1, 3)
    z3 = z1 + z2
    
    # Arrows
    ax.annotate("", xy=(z1.real, z1.imag), xytext=(0, 0), arrowprops=dict(arrowstyle='->', color='green', lw=2, label="$z_1$"))
    ax.annotate("", xy=(z2.real, z2.imag), xytext=(0, 0), arrowprops=dict(arrowstyle='->', color='orange', lw=2, label="$z_2$"))
    ax.annotate("", xy=(z3.real, z3.imag), xytext=(0, 0), arrowprops=dict(arrowstyle='->', color='blue', lw=3, label="$z_1+z_2$"))
    
    # Parallelogram dashed lines
    ax.plot([z1.real, z3.real], [z1.imag, z3.imag], 'gray', linestyle='--')
    ax.plot([z2.real, z3.real], [z2.imag, z3.imag], 'gray', linestyle='--')
    
    ax.text(z1.real, z1.imag - 0.5, "$z_1$", color='green', fontweight='bold')
    ax.text(z2.real - 0.5, z2.imag, "$z_2$", color='orange', fontweight='bold')
    ax.text(z3.real + 0.2, z3.imag + 0.2, "$z_1+z_2$", color='blue', fontweight='bold')
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_i_rotation(output_path):
    fig, ax = plt.subplots(figsize=(8, 8))
    setup_argand(ax, "Multiplication by $i$ = $90^\circ$ Rotation", x_range=(-4, 4), y_range=(-4, 4))
    
    # Cycle: 1 -> i -> -1 -> -i -> 1
    points = [complex(3, 0), complex(0, 3), complex(-3, 0), complex(0, -3)]
    labels = ["$z$", "$zi$", "$zi^2 = -z$", "$zi^3 = -zi$"]
    colors = ['blue', 'green', 'red', 'orange']
    
    for i in range(4):
        p = points[i]
        next_p = points[(i+1)%4]
        ax.plot(p.real, p.imag, 'o', color=colors[i], ms=8)
        ax.annotate("", xy=(p.real, p.imag), xytext=(0, 0), arrowprops=dict(arrowstyle='->', color=colors[i], lw=2))
        ax.text(p.real*1.2, p.imag*1.2, labels[i], ha='center', va='center', fontweight='bold', color=colors[i])
        
        # Arc for rotation
        theta = np.linspace(i*np.pi/2, (i+1)*np.pi/2, 50)
        ax.plot(2*np.cos(theta), 2*np.sin(theta), 'k:', alpha=0.5)
        
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_argand_basics(os.path.join(out_dir, "complex_argand_premium.png"))
    gen_complex_addition(os.path.join(out_dir, "complex_vector_add.png"))
    gen_i_rotation(os.path.join(out_dir, "complex_rotation_i.png"))
    
    print("Successfully generated 3 premium Complex diagrams.")
