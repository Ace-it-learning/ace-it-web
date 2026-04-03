import random
import json
import sys

def generate_retail_discount_question():
    """
    Generates a Level 3 (DSE Level) Percentages question:
    Markup -> Damaged Goods -> Target Profit -> Required Discount.
    Guarantees clean, integer percentage answers.
    """
    # 1. Start with clean, realistic base numbers
    total_items = random.choice([100, 200, 500])
    unit_cost = random.choice([40, 50, 80, 100])
    total_cost = total_items * unit_cost
    
    # 2. Pick a clean Target Profit (e.g., 8%, 10%, 15%, 20%)
    profit_pct = random.choice([0.08, 0.10, 0.15, 0.20])
    target_revenue = total_cost * (1 + profit_pct)
    
    # 3. Pick a clean Damage Percentage (e.g., 5%, 10%, 20%)
    damage_pct = random.choice([0.05, 0.10, 0.20])
    sellable_items = int(total_items * (1 - damage_pct))
    
    # 4. We need: sellable_items * selling_price = target_revenue
    required_selling_price = target_revenue / sellable_items
    
    # 5. Pick a clean Final Discount (e.g., 10%, 20%, 25%)
    discount_pct = random.choice([0.10, 0.20, 0.25])
    
    # 6. Reverse-engineer the Markup needed to allow that discount
    # marked_price * (1 - discount_pct) = required_selling_price
    marked_price = required_selling_price / (1 - discount_pct)
    
    # Calculate what the markup percentage was
    markup_pct = (marked_price - unit_cost) / unit_cost
    
    # Return a Seed string for the AI Prompt
    return f"Retailer buys {total_items} items at HKD {unit_cost} each. Markup by {round(markup_pct * 100)}%. {round(damage_pct * 100)}% damaged. Target overall profit {round(profit_pct * 100)}%. Find discount % offered. Answer: {round(discount_pct * 100)}%"

if __name__ == "__main__":
    try:
        # Support BOM-encoded input (PowerShell standard)
        raw_input = sys.stdin.buffer.read().decode('utf-8-sig').strip()
        params = json.loads(raw_input) if raw_input else {}
        count = params.get('count', 5)
        
        seeds = [generate_retail_discount_question() for _ in range(count)]
        print(json.dumps(seeds))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
