import json
import subprocess
import os

def test_robustness(template, iterations=50):
    print(f"\n[TEST] Stress-testing template: {template} ({iterations} iterations)")
    script_path = os.path.join('backend', 'services', 'maths', 'math_engine', 'percentage_gen.py')
    python_path = 'C:\\Users\\user\\AppData\\Local\\Programs\\Python\\Python312\\python.exe'
    
    failures = 0
    duplicate_errors = 0
    precision_errors = 0
    
    for i in range(iterations):
        input_data = json.dumps({"template": template, "difficulty": 3})
        process = subprocess.Popen([python_path, script_path], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate(input=input_data)
        
        if process.returncode != 0:
            print(f"Iteration {i} failed: {stderr}")
            failures += 1
            continue
            
        try:
            quest = json.loads(stdout)
            options = quest.get('options', [])
            explanation = quest.get('explanation', '')
            
            # Check for exactly 4 unique options
            if len(options) != 4 or len(set(options)) != 4:
                print(f"Duplicate Error in {i}: {options}")
                duplicate_errors += 1
                
            # Check for floating point artifacts (e.g., .000000 or .999999)
            if '000000' in explanation or '99999' in explanation:
                print(f"Precision Error in {i}: {explanation}")
                precision_errors += 1
                
        except Exception as e:
            print(f"Parse error in iteration {i}: {e}")
            failures += 1

    print(f"Results for {template}:")
    print(f"  - Failures: {failures}")
    print(f"  - Duplicate Option Errors: {duplicate_errors}")
    print(f"  - Precision Errors: {precision_errors}")
    return duplicate_errors == 0 and precision_errors == 0

if __name__ == "__main__":
    success_interest = test_robustness("interest")
    success_discount = test_robustness("discount")
    
    if success_interest and success_discount:
        print("\n[SUCCESS] Generator is robust!")
    else:
        print("\n[FAIL] Robustness check failed.")
        exit(1)
