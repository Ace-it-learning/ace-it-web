import matplotlib.pyplot as plt
import numpy as np
import os
import sys

def setup_canvas(ax, title, x_range=(0, 10), y_range=(0, 10)):
    ax.set_xlim(x_range)
    ax.set_ylim(y_range)
    ax.axis('off')
    ax.set_title(title, fontsize=14, fontweight='bold', pad=20)

def gen_substitution_logic(output_path):
    fig, ax = plt.subplots(figsize=(10, 5))
    setup_canvas(ax, "The Substitution Principle")
    
    # Expression
    ax.text(0.1, 0.7, r"$y = 3x^2 - 5x + 2$", fontsize=18, color='black')
    ax.text(0.1, 0.5, r"Given $x = \mathbf{-2}$", fontsize=15, color='red', fontweight='bold')
    
    # Step 1
    ax.text(0.1, 0.25, r"Step: $y = 3(\mathbf{-2})^2 - 5(\mathbf{-2}) + 2$", fontsize=16, color='blue', bbox=dict(facecolor='azure', alpha=0.5))
    
    # Arrows and Labels
    ax.annotate("Always use brackets\nfor negative numbers!", xy=(0.4, 0.2), xytext=(0.4, 0.05),
                arrowprops=dict(arrowstyle='->', color='red', lw=2), ha='center', color='red')
    
    ax.text(0.7, 0.25, r"$\to y = 12 + 10 + 2 = 24$", fontsize=15, color='darkgreen', fontweight='bold')
    
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

def gen_subject_change_flow(output_path):
    fig, ax = plt.subplots(figsize=(10, 6))
    setup_canvas(ax, "Changing the Subject: The 'Unwrapping' Method")
    
    steps = [
        r"Target: Make $x$ the subject of $y = \frac{ax + b}{c}$",
        r"1. Multiply by $c$: $cy = ax + b$",
        r"2. Subtract $b$: $cy - b = ax$",
        r"3. Divide by $a$: $x = \frac{cy - b}{a}$"
    ]
    
    for i, txt in enumerate(steps):
        ax.text(0.5, 0.8 - i*0.2, txt, ha='center', fontsize=14, 
                bbox=dict(boxstyle='round,pad=1', facecolor='white', edgecolor='gray'))
    
    # Arrows between steps
    for i in range(3):
        ax.annotate("", xy=(0.5, 0.65 - i*0.2), xytext=(0.5, 0.73 - i*0.2),
                    arrowprops=dict(arrowstyle='->', lw=2, color='blue'))
        
    plt.savefig(output_path, bbox_inches='tight', dpi=150)
    plt.close()

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "output"
    if not os.path.exists(out_dir): os.makedirs(out_dir)
    
    gen_substitution_logic(os.path.join(out_dir, "form_substitution_premium.png"))
    gen_subject_change_flow(os.path.join(out_dir, "form_subject_flow_premium.png"))
    
    print("Successfully generated 2 premium Formulas diagrams.")
