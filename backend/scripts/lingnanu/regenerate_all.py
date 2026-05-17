#!/usr/bin/env python3
"""Regenerate all missing Lingnan University programmes sequentially."""
import json
import os
import sys
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MASTER_FILE = os.path.join(SCRIPT_DIR, "lingnanu_programmes.json")

def get_missing():
    with open(MASTER_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    missing = []
    for p in data:
        has_curriculum = 'sections' in p and 'curriculum' in p['sections'].get('en', {})
        if not has_curriculum:
            missing.append(p['code'])
    return missing

# Get initial missing list
missing = get_missing()
print(f"Missing programmes: {missing}")
print(f"Total missing: {len(missing)}")

if not missing:
    print("All programmes complete!")
    sys.exit(0)

# Generate each one sequentially
for code in missing:
    print(f"\n{'='*50}")
    print(f"Generating {code}...")
    result = subprocess.run(
        [sys.executable, os.path.join(SCRIPT_DIR, "generate_lingnanu_batch.py"), "--codes", code],
        capture_output=True,
        text=True,
        cwd=os.path.join(SCRIPT_DIR, "..", "..")
    )
    print(result.stdout)
    if result.returncode != 0:
        print(f"ERROR: {result.stderr}")

# Final check
missing = get_missing()
print(f"\n{'='*50}")
print(f"Final check - Missing: {len(missing)}")
if missing:
    print(f"Still missing: {missing}")
else:
    print("All programmes complete!")
