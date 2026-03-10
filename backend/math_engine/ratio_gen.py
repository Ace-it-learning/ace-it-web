import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_canvas(ax, title, x_range=(0, 10), y_range=(0, 10)):
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    ax.axis('off')
    ax.set_title(title, fontsize=14, fontweight='bold', pad=20)

def gen_combining_ratios(output_path):
    fig, ax = plt.subplots(figsize=(10, 4))
    setup_canvas(ax, "Combining Ratios: The LCM Bridge")
    
    # a:b = 2:3, b:c = 4:5
    ax.text(0.1, 0.7, r"$a : b = 2 : 3$", fontsize=15, color='blue', fontweight='bold')
    ax.text(0.1, 0.5, r"$b : c = 4 : 5$", fontsize=15, color='green', fontweight='bold')
    
    # Bridge
    ax.annotate("Common term $b$", xy=(0.3, 0.6), xytext=(0.5, 0.6), 
                arrowprops=dict(arrowstyle='<->', lw=2, color='red'))
    
    ax.text(0.6, 0.6, r"LCM of 3 and 4 is $\mathbf{12}$", fontsize=12, bbox=dict(facecolor='yellow', alpha=0.3))
    
    # Unified
    ax.text(0.1, 0.2, r"Scaled: $8 : 12$ and $12 : 15$", fontsize=14, color='orange')
    ax.text(0.6, 0.2, r"$\to a:b:c = 8:12:15$", fontsize=16, fontweight='bold', color='darkred')
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_similar_figures_ratio(output_path):
    fig, ax = plt.subplots(figsize=(10, 6))
    setup_canvas(ax, "Similar Figures: $k \to k^2 \to k^3$")
    
    # Triangle 1 (Base 2)
    t1 = plt.Polygon([[1, 2], [3, 2], [2, 4]], color='blue', alpha=0.3, label="Linear ($k=1$)")
    ax.add_patch(t1)
    ax.text(2, 1.5, "Length $l$", ha='center')
    ax.text(2, 2.5, "Area $A$", ha='center', fontweight='bold')

    # Triangle 2 (Base 4) - Scale factor k=2
    t2 = plt.Polygon([[5, 2], [9, 2], [7, 6]], color='red', alpha=0.3, label="Linear ($k=2$)")
    ax.add_patch(t2)
    ax.text(7, 1.5, "Length $2l$", ha='center')
    ax.text(7, 3.5, "Area $4A$\n($2^2$)", ha='center', fontweight='bold')

    # Arrows
    ax.annotate("Scale $k=2$", xy=(4.5, 3), xytext=(3.5, 3), 
                arrowprops=dict(arrowstyle='->', lw=2))
    
    ax.text(5, 8, r"Area Ratio = $k^2 = 2^2 = 4$", fontsize=12, color='red', fontweight='bold')
    ax.text(5, 7, r"Volume Ratio = $k^3 = 2^3 = 8$", fontsize=12, color='darkred')
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_map_scale_logic(output_path):
    fig, ax = plt.subplots(figsize=(10, 4))
    setup_canvas(ax, "Map Scale Reasoning")
    
    ax.text(0.1, 0.8, "Map Scale 1 : 20,000", fontsize=15, fontweight='bold')
    
    # Length row
    ax.text(0.1, 0.5, "Length Ratio", fontsize=12)
    ax.text(0.4, 0.5, r"1 cm (Map) $\to$ 20,000 cm (Real)", color='blue')
    
    # Area row
    ax.text(0.1, 0.3, "Area Ratio ($k^2$)", fontsize=12)
    ax.text(0.4, 0.3, r"1 cm$^2$ (Map) $\to$ 400,000,000 cm$^2$ (Real)", color='red', fontweight='bold')
    
    ax.text(0.4, 0.1, r"$= 40,000$ m$^2$ or $0.04$ km$^2$", fontsize=10, color='gray')
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_combining_ratios(os.path.join(out_dir, "ratio_combining_premium.png"))
    gen_similar_figures_ratio(os.path.join(out_dir, "ratio_similar_premium.png"))
    gen_map_scale_logic(os.path.join(out_dir, "ratio_map_scale_premium.png"))
    
    print("Successfully generated 3 premium Ratio diagrams.")
