import matplotlib.pyplot as plt
import numpy as np
import os

# Configure Matplotlib for Chinese font support (Windows)
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei', 'Arial Unicode MS']
plt.rcParams['axes.unicode_minus'] = False # Fix for minus sign in CJK fonts

def generate_interest_chart():
    principal = 10000
    rate = 10
    years = 10
    
    t = np.linspace(0, years, 100)
    simple_interest = principal * (1 + (rate/100) * t)
    compound_interest = principal * ((1 + (rate/100)) ** t)
    
    plt.figure(figsize=(7, 5))
    plt.plot(t, simple_interest, label='Simple Interest (單利)', color='#4A90E2', linewidth=3)
    plt.plot(t, compound_interest, label='Compound Interest (複利)', color='#82B366', linewidth=3)
    plt.fill_between(t, simple_interest, compound_interest, color='#82B366', alpha=0.1)
    
    plt.title('Simple vs Compound Interest Growth', fontsize=14, fontweight='bold', pad=15)
    plt.xlabel('Years (年)', fontsize=11)
    plt.ylabel('Amount (金額 HK$)', fontsize=11)
    plt.legend(fontsize=10)
    plt.grid(True, linestyle='--', alpha=0.4)
    
    # Highlight the divergence
    plt.annotate('Exponential Growth', xy=(9, compound_interest[-10]), xytext=(5, compound_interest[-10]+2000),
                 arrowprops=dict(facecolor='black', shrink=0.05, width=1, headwidth=5),
                 fontsize=10, fontweight='bold')
    
    plt.tight_layout()
    output_path = r'c:\Users\user\Documents\ace-it-web\frontend\public\images\math\chart_interest.png'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"Generated: {output_path}")

def generate_discount_chart():
    marked_price = 1000
    d1 = 10
    d2 = 20
    
    p1 = marked_price * (1 - d1/100)
    p2 = p1 * (1 - d2/100)
    
    labels = ['Marked Price\n(標價)', f'After {d1}% Off\n(九折)', f'Final Price\n(再八折)']
    values = [marked_price, p1, p2]
    colors = ['#D3D3D3', '#F5D0A9', '#82B366']
    
    plt.figure(figsize=(7, 5))
    bars = plt.bar(labels, values, color=colors, edgecolor='black', alpha=0.8, width=0.6)
    
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + 20,
                 f'HK${height:,.0f}', ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    plt.title('Successive Discounts Breakdown', fontsize=14, fontweight='bold', pad=20)
    plt.ylabel('Price (價格 HK$)', fontsize=11)
    plt.ylim(0, 1200)
    
    # Indicate total reduction
    plt.annotate('Total Discount: 28%', xy=(2, p2), xytext=(2.2, p2 + 100),
                 arrowprops=dict(arrowstyle='->', lw=1.5), fontsize=10, fontweight='bold', color='red')
    
    plt.tight_layout()
    output_path = r'c:\Users\user\Documents\ace-it-web\frontend\public\images\math\successive_discount.png'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"Generated: {output_path}")

def generate_simple_interest_chart():
    principal = 1000
    rate = 10
    years = 10
    t = np.linspace(0, years, 11)
    interest = principal * (rate/100) * t
    amount = principal + interest

    plt.figure(figsize=(7, 5))
    plt.bar(t, amount, color='#4A90E2', alpha=0.7, label='Total Amount (本利和)')
    plt.plot(t, amount, color='#4A90E2', marker='o')
    
    plt.title('Simple Interest: Linear Growth', fontsize=14, fontweight='bold')
    plt.xlabel('Years (年)')
    plt.ylabel('Amount (金額 HK$)')
    plt.grid(True, axis='y', linestyle='--', alpha=0.3)
    plt.legend()
    
    plt.tight_layout()
    output_path = r'c:\Users\user\Documents\ace-it-web\frontend\public\images\math\simple_interest.png'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"Generated: {output_path}")

def generate_growth_decay_charts():
    # Growth Factor
    t = np.linspace(0, 10, 100)
    growth = 100 * (1.2 ** t)
    
    plt.figure(figsize=(7, 5))
    plt.plot(t, growth, color='#82B366', linewidth=3, label='Growth (r > 0)')
    plt.fill_between(t, growth, color='#82B366', alpha=0.1)
    plt.title('Exponential Growth (增長因子)', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    output_path_growth = r'c:\Users\user\Documents\ace-it-web\frontend\public\images\math\growth_factor.png'
    plt.savefig(output_path_growth, dpi=150)
    plt.close()
    print(f"Generated: {output_path_growth}")

    # Depreciation
    decay = 100 * (0.8 ** t)
    plt.figure(figsize=(7, 5))
    plt.plot(t, decay, color='#E15B64', linewidth=3, label='Depreciation (r < 0)')
    plt.fill_between(t, decay, color='#E15B64', alpha=0.1)
    plt.title('Exponential Decay (折舊)', fontsize=14, fontweight='bold')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    output_path_decay = r'c:\Users\user\Documents\ace-it-web\frontend\public\images\math\depreciation.png'
    plt.savefig(output_path_decay, dpi=150)
    plt.close()
    print(f"Generated: {output_path_decay}")

def generate_pct_change_chart():
    old_val = 100
    new_val = 125
    
    plt.figure(figsize=(7, 5))
    plt.bar(['Original (原值)', 'New (新值)'], [old_val, new_val], color=['#D3D3D3', '#4A90E2'], width=0.5)
    
    # Arrow for change
    plt.annotate('', xy=(1, new_val), xytext=(0, old_val),
                 arrowprops=dict(facecolor='black', shrink=0.05, width=2))
    plt.text(0.5, (old_val+new_val)/2 + 5, '+25%', ha='center', fontweight='bold', color='green', fontsize=12)
    
    plt.title('Percentage Change (百分數變動)', fontsize=14, fontweight='bold')
    plt.ylim(0, 150)
    plt.tight_layout()
    output_path = r'c:\Users\user\Documents\ace-it-web\frontend\public\images\math\pct_change.png'
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"Generated: {output_path}")

def generate_profit_loss_chart():
    cost = 100
    profit = 30
    selling = cost + profit
    
    plt.figure(figsize=(7, 5))
    plt.bar(['Cost (成本)', 'Selling Price (售價)'], [cost, selling], color=['#4A90E2', '#82B366'], width=0.5)
    
    plt.bar(['Selling Price (售價)'], [profit], bottom=cost, color='#50E3C2', label='Profit (盈利)')
    
    plt.title('Profit & Loss Structure', fontsize=14, fontweight='bold')
    plt.legend()
    plt.tight_layout()
    output_path = r'c:\Users\user\Documents\ace-it-web\frontend\public\images\math\profit_loss.png'
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"Generated: {output_path}")

def generate_discount_basic_chart():
    marked = 1000
    discount = 200
    selling = marked - discount
    
    plt.figure(figsize=(7, 5))
    plt.bar(['Marked Price (標價)'], [marked], color='#4A90E2', width=0.5)
    plt.bar(['Selling Price (售價)'], [selling], color='#82B366', width=0.5)
    plt.bar(['Selling Price (售價)'], [discount], bottom=selling, color='#E15B64', label='Discount (折扣)')
    
    plt.title('Discount Structure', fontsize=14, fontweight='bold')
    plt.legend()
    plt.tight_layout()
    output_path = r'c:\Users\user\Documents\ace-it-web\frontend\public\images\math\discount_basic.png'
    plt.savefig(output_path, dpi=150)
    plt.close()
    print(f"Generated: {output_path}")

if __name__ == "__main__":
    generate_interest_chart()
    generate_discount_chart()
    generate_simple_interest_chart()
    generate_growth_decay_charts()
    generate_pct_change_chart()
    generate_profit_loss_chart()
    generate_discount_basic_chart()
