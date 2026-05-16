"""Fix jupas_scores_2025.json when UQ < median (column order error)."""
import json
import os

path = os.path.join(os.path.dirname(__file__), "jupas_scores_2025.json")
data = json.load(open(path, encoding="utf-8"))
fixed = 0
for code, row in data["programmes"].items():
    med, uq, lq = row["median"], row["uq"], row["lq"]
    if uq < med:
        row["median"], row["uq"] = uq, med
        fixed += 1
    if lq > row["median"]:
        row["lq"] = row["median"]
data["_columnOrder"] = "median, uq, lq — auto-corrected when uq < median"
json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"Fixed {fixed} programmes")
