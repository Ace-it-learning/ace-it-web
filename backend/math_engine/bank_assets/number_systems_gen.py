import random
import json
import sys

def generate_number_system_seeds(count=5):
    seeds = []
    
    for _ in range(count):
        choice = random.choice([1, 2, 3])
        
        if choice == 1:
            # Type 1: Decimal Polynomial to Binary (e.g., 2^11 + 2^6 + 5)
            high_pow = random.randint(10, 14)
            low_pow = random.randint(4, 8)
            integer_val = random.randint(3, 15) # Small number to convert
            dec_val = (2**high_pow) + (2**low_pow) + integer_val
            bin_str = bin(dec_val)[2:]
            seeds.append(f"Decimal Polynomial to Binary: Expression is $2^{{{high_pow}}} + 2^{{{low_pow}}} + {integer_val}$. Convert to binary. Answer: ${bin_str}_{{2}}$")

        elif choice == 2:
            # Type 2: Hexadecimal to Decimal Polynomial Expansion
            hex_chars = "ABCDEF"
            char1 = random.choice(hex_chars)
            char2 = random.choice(hex_chars)
            hex_str = f"{char1}00{char2}5"
            # In Hex notation, powers are 16^4, 16^3, 16^2, 16^1, 16^0
            # Exp: char1 * 16^4 + 0 * 16^3 + 0 * 16^2 + char2 * 16^1 + 5 * 16^0
            seeds.append(f"Hex to Expansion: String is ${hex_str}_{{16}}$. Express in expanded decimal polynomial form. Answer: $16^4 \\times \\mathrm{{{char1}}} + 16^1 \\times \\mathrm{{{char2}}} + 5$")

        else:
            # Type 3: Binary Polynomial to Hexadecimal (Classic DSE trick)
            pow1 = random.choice([12, 13, 14, 15]) 
            pow2 = random.choice([7, 8, 9, 10])
            pow3 = random.choice([2, 3, 4, 5])
            dec_val = (2**pow1) + (2**pow2) + (2**pow3)
            hex_str = hex(dec_val)[2:].upper()
            seeds.append(f"Binary Polynomial to Hex: Expression is $2^{{{pow1}}} + 2^{{{pow2}}} + 2^{{{pow3}}}$. Convert to hexadecimal. Answer: ${hex_str}_{{16}}$")

    return seeds

if __name__ == "__main__":
    # Internal runner to handle calls from MathEngineBridge
    try:
        # Version 3.1: Support BOM-encoded input (PowerShell standard)
        raw_input = sys.stdin.buffer.read().decode('utf-8-sig').strip()
        params = json.loads(raw_input) if raw_input else {}
        count = params.get('count', 5)
        
        seeds = generate_number_system_seeds(count)
        print(json.dumps(seeds))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
