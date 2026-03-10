import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_canvas(ax, title, x_range=(0, 10), y_range=(0, 2000)):
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    ax.grid(True, linestyle='--', alpha=0.3)
    ax.set_title(title, fontsize=14, fontweight='bold')

def gen_growth_decay_multiplier(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, "Growth vs Decay Multipliers", x_range=(0, 10), y_range=(0, 3000))
    
    t = np.linspace(0, 10, 100)
    p = 1000
    r_g = 0.12 # 12% growth
    r_d = 0.12 # 12% decay
    
    growth = p * (1 + r_g)**t
    decay = p * (1 - r_d)**t
    
    ax.plot(t, growth, 'b-', lw=3, label=r"Growth ($1 + r$)")
    ax.plot(t, decay, 'r-', lw=3, label=r"Decay ($1 - r$)")
    
    ax.fill_between(t, growth, 1000, color='blue', alpha=0.1)
    ax.fill_between(t, decay, 1000, color='red', alpha=0.1)
    
    ax.axhline(1000, color='black', linestyle='--')
    ax.text(0.5, 1050, "Original (100%)", fontsize=10)
    
    ax.legend()
    ax.set_xlabel("Time (n)")
    ax.set_ylabel("Value")
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_compounding_frequency(output_path):
    fig, ax = plt.subplots(figsize=(8, 6))
    setup_canvas(ax, "Compounding Frequency Effect", x_range=(0, 5), y_range=(1000, 1500))
    
    t = np.linspace(0, 5, 100)
    p = 1000
    r = 0.08
    
    # Yearly
    yearly = p * (1 + r)**t
    # Monthly
    monthly = p * (1 + r/12)**(12*t)
    # Daily
    daily = p * (1 + r/365)**(365*t)
    
    ax.plot(t, yearly, 'r--', label="Yearly (k=1)")
    ax.plot(t, monthly, 'g-', label="Monthly (k=12)")
    ax.plot(t, daily, 'b-', lw=2, label="Daily (k=365)")
    
    ax.legend()
    ax.set_xlabel("Years")
    ax.set_ylabel("Amount ($)")
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_business_stack(output_path):
    fig, ax = plt.subplots(figsize=(10, 4))
    ax.axis('off')
    
    # Draw a flow diagram: Cost -> Marked Price -> Selling Price
    nodes = ["Cost\n(Base)", "Marked Price", "Selling Price"]
    pos = [0, 1, 2]
    
    for i, txt in enumerate(nodes):
        ax.text(pos[i], 0.5, txt, ha='center', va='center', 
                bbox=dict(boxstyle='round,pad=1', facecolor='azure', edgecolor='blue'),
                fontsize=12, fontweight='bold')
        
    ax.annotate("Markup", xy=(0.85, 0.5), xytext=(0.15, 0.5),
                arrowprops=dict(arrowstyle='->', lw=2, color='green'))
    
    ax.annotate("Discount", xy=(1.85, 0.5), xytext=(1.15, 0.5),
                arrowprops=dict(arrowstyle='->', lw=2, color='red'))
    
    ax.text(0.5, 0.6, r"Markup % = $\frac{MP-C}{C}$", ha='center', color='green')
    ax.text(1.5, 0.6, r"Discount % = $\frac{MP-SP}{MP}$", ha='center', color='red')
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_growth_decay_multiplier(os.path.join(out_dir, "pct_growth_decay_premium.png"))
    gen_compounding_frequency(os.path.join(out_dir, "pct_compounding_premium.png"))
    gen_business_stack(os.path.join(out_dir, "pct_business_flow.png"))
    
    print("Successfully generated 3 premium Percentages diagrams.")
