import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_canvas(ax, title, x_range=(-2, 6), y_range=(-1, 10)):
    ax.spines['left'].set_position('zero')
    ax.spines['bottom'].set_position('zero')
    ax.spines['right'].set_color('none')
    ax.spines['top'].set_color('none')
    ax.set_aspect('auto')
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    ax.grid(True, linestyle='--', alpha=0.3)
    ax.set_title(title, fontsize=14, fontweight='bold', pad=20)

def gen_exp_growth(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Exponential Growth: $y = a^x$ $(a > 1)$")
    
    x = np.linspace(-2, 4, 200)
    y = 2**x
    ax.plot(x, y, 'b-', lw=3, label=r"$y = 2^x$")
    
    # Key points
    ax.plot(0, 1, 'ro')
    ax.text(0.2, 1.2, r"$(0, 1)$ y-int", fontsize=12, fontweight='bold')
    
    # Asymptote labeling
    ax.text(-1.8, 0.2, r"Asymptote: $y=0$", fontsize=10, color='gray')
    
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_exp_decay(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Exponential Decay: $y = a^x$ $(0 < a < 1)$")
    
    x = np.linspace(-2, 4, 200)
    y = 0.5**x
    ax.plot(x, y, 'r-', lw=3, label=r"$y = (1/2)^x$")
    
    # Key points
    ax.plot(0, 1, 'bo')
    ax.text(0.2, 1.2, r"$(0, 1)$ y-int", fontsize=12, fontweight='bold')
    
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_log_graph(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Logarithmic Function: $y = \log_a x$ $(a > 1)$", x_range=(-1, 10), y_range=(-3, 4))
    
    x = np.linspace(0.1, 10, 200)
    y = np.log2(x)
    ax.plot(x, y, 'g-', lw=3, label=r"$y = \log_2 x$")
    
    # Key points
    ax.plot(1, 0, 'ro')
    ax.text(1.2, 0.2, r"$(1, 0)$ x-int", fontsize=12, fontweight='bold')
    
    # Vertical asymptote
    ax.axvline(0, color='gray', linestyle='--', alpha=0.5)
    ax.text(0.2, -2.5, r"Asymptote: $x=0$", fontsize=10, color='gray', rotation=90)
    
    ax.legend()
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_linearization_exp(output_path):
    """y = Ab^x  =>  log y = x log b + log A"""
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Linearization: $\log y$ vs $x$", x_range=(-1, 6), y_range=(-1, 8))
    
    # Linear plot
    x = np.linspace(0, 5, 200)
    y = 1.2 * x + 2 # log y = 1.2x + 2
    ax.plot(x, y, 'purple', lw=3)
    
    # Intercept
    ax.plot(0, 2, 'ko')
    ax.text(0.2, 1.8, r"Intercept = $\log A$", fontsize=12, color='purple')
    
    # Slope indicator
    ax.annotate(r"Slope = $\log b$", xy=(3, 5.6), xytext=(4, 4),
                arrowprops=dict(facecolor='black', shrink=0.05),
                fontsize=12)
    
    ax.set_xlabel(r"$x$", loc='right', fontsize=14)
    ax.set_ylabel(r"$\log y$", loc='top', fontsize=14)
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_linearization_power(output_path):
    """y = Ax^n  =>  log y = n log x + log A"""
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, r"Linearization: $\log y$ vs $\log x$", x_range=(-1, 6), y_range=(-1, 8))
    
    # Linear plot
    lx = np.linspace(0, 5, 200)
    ly = 0.8 * lx + 3 # log y = 0.8 log x + 3
    ax.plot(lx, ly, 'orange', lw=3)
    
    # Intercept
    ax.plot(0, 3, 'ko')
    ax.text(0.2, 2.8, r"Intercept = $\log A$", fontsize=12, color='orange')
    
    # Slope
    ax.annotate(r"Slope = $n$", xy=(3, 5.4), xytext=(4, 4),
                arrowprops=dict(facecolor='black', shrink=0.05),
                fontsize=12)
    
    ax.set_xlabel(r"$\log x$", loc='right', fontsize=14)
    ax.set_ylabel(r"$\log y$", loc='top', fontsize=14)
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_exp_growth(os.path.join(out_dir, "logexp_growth.png"))
    gen_exp_decay(os.path.join(out_dir, "logexp_decay.png"))
    gen_log_graph(os.path.join(out_dir, "logexp_log_graph.png"))
    gen_linearization_exp(os.path.join(out_dir, "logexp_linear_exp.png"))
    gen_linearization_power(os.path.join(out_dir, "logexp_linear_power.png"))
    
    print("Successfully generated 5 Log & Exp diagrams.")
