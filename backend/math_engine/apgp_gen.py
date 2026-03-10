import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_canvas(ax, title, x_range=(0, 10), y_range=(0, 20)):
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    ax.grid(True, linestyle='--', alpha=0.3)
    ax.set_title(title, fontsize=14, fontweight='bold')

def gen_ap_seq(output_path):
    fig, ax = plt.subplots(figsize=(8, 5))
    setup_canvas(ax, r"Arithmetic Progression: $T_n = a + (n-1)d$")
    
    n = np.arange(1, 11)
    a, d = 2, 1.5
    tn = a + (n-1)*d
    
    ax.bar(n, tn, color='skyblue', alpha=0.7, ec='b')
    ax.step(n, tn, where='mid', color='blue', lw=2, linestyle='--')
    
    for i, val in enumerate(tn):
        ax.text(n[i], val + 0.5, f"{val:.1f}", ha='center', fontsize=10)
        
    ax.set_xlabel("Term (n)")
    ax.set_ylabel("Value (Tn)")
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_gp_seq(output_path):
    fig, ax = plt.subplots(figsize=(8, 5))
    setup_canvas(ax, r"Geometric Progression: $T_n = a r^{n-1}$", y_range=(0, 50))
    
    n = np.arange(1, 8)
    a, r = 2, 1.6
    tn = a * (r**(n-1))
    
    ax.bar(n, tn, color='salmon', alpha=0.7, ec='r')
    ax.plot(n, tn, 'ro-', lw=2)
    
    for i, val in enumerate(tn):
        ax.text(n[i], val + 1, f"{val:.1f}", ha='center', fontsize=10)
        
    ax.set_xlabel("Term (n)")
    ax.set_ylabel("Value (Tn)")
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_sum_inf(output_path):
    fig, ax = plt.subplots(figsize=(8, 5))
    setup_canvas(ax, r"Sum to Infinity: $S_\infty = \frac{a}{1-r}$ $(|r| < 1)$", x_range=(0, 15), y_range=(0, 12))
    
    n = np.arange(1, 15)
    a, r = 5, 0.5
    sn = a * (1 - r**n) / (1 - r)
    s_inf = a / (1 - r)
    
    ax.plot(n, sn, 'go-', lw=2, label="Partial Sum $S_n$")
    ax.axhline(s_inf, color='red', linestyle='--', lw=2, label=r"Limit $S_\infty = 10$")
    
    ax.fill_between(n, sn, s_inf, color='green', alpha=0.1)
    
    ax.legend()
    ax.set_xlabel("Number of terms (n)")
    ax.set_ylabel("Sum")
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_apgp_apps(output_path):
    fig, ax = plt.subplots(figsize=(8, 5))
    setup_canvas(ax, "Banking App: Compound vs Simple Growth", x_range=(0, 20), y_range=(0, 4000))
    
    years = np.arange(0, 21)
    p = 1000
    r = 0.07
    
    simple = p * (1 + r * years) # AP
    compound = p * (1 + r)**years # GP
    
    ax.plot(years, simple, 'b--', lw=2, label="Simple (Linear/AP)")
    ax.plot(years, compound, 'r-', lw=3, label="Compound (Exp/GP)")
    
    ax.fill_between(years, simple, compound, color='yellow', alpha=0.2)
    
    ax.legend()
    ax.set_xlabel("Years")
    ax.set_ylabel("Amount ($)")
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_ap_seq(os.path.join(out_dir, "apgp_ap_seq.png"))
    gen_gp_seq(os.path.join(out_dir, "apgp_gp_seq.png"))
    gen_sum_inf(os.path.join(out_dir, "apgp_sum_inf.png"))
    gen_apgp_apps(os.path.join(out_dir, "apgp_apps.png"))
    
    print("Successfully generated 4 AP & GP diagrams.")
