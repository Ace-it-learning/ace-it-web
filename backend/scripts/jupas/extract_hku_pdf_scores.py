"""
Build jupas_scores_2025.json for all HKU programmes.
Primary source: update_hku_scores.py (median, UQ, LQ verified column order).
Supplements names/formulas from af_2025_JUPAS.pdf where parseable.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

OUT = os.path.join(os.path.dirname(__file__), "jupas_scores_2025.json")
UPDATE_PY = os.path.join(os.path.dirname(__file__), "..", "hku", "update_hku_scores.py")

COMPLETED_SKIP_SEED = {
    "JS6468", "JS6482", "JS6494", "JS6602", "JS6626", "JS6688", "JS6705", "JS6717",
}


def load_from_update_py():
    text = open(UPDATE_PY, encoding="utf-8").read()
    programmes = {}
    for m in re.finditer(
        r'\("?(JS\d{4})"?\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)\s*,\s*#\s*(.+)',
        text,
    ):
        code, median, uq, lq, name = m.groups()
        programmes[code] = {
            "code": code,
            "nameEn": name.strip(),
            "formula": "Best 5 Subjects",
            "median": int(median),
            "uq": int(uq),
            "lq": int(lq),
        }
    return programmes


def supplement_formula_from_pdf(programmes):
    """Update formula only — never overwrite nameEn from PDF (names stay from update_hku_scores.py)."""
    pdf_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "JUPAS", "af_2025_JUPAS.pdf")
    try:
        from pypdf import PdfReader
    except ImportError:
        return programmes

    text = "".join((p.extract_text() or "") for p in PdfReader(pdf_path).pages)
    start = text.find("Faculty of Architecture")
    end = text.find("The Chinese University", start)
    if end < 0:
        end = start + 20000
    chunk = text[start:end]

    # Line-by-line: code at start, last three numbers are UQ median LQ
    buf = ""
    for line in chunk.split("\n"):
        line = line.strip()
        if re.match(r"^\d{4}\b", line):
            buf = line
        elif buf and line:
            buf += " " + line
        m = re.search(r"^(\d{4})\s+(.+?)\s+(Best\s+\d+\s+Subjects[^0-9]*|1\.5\s+x\s+Eng[^0-9]*|Best\s+\d+\s+[^0-9]+?)\s*([a-z])?\s*(\d+)\s+(\d+)\s+(\d+)\s*$", buf)
        if m:
            code = "JS" + m.group(1)
            if code in programmes:
                formula_part = re.sub(r"\s+", " ", m.group(2).strip())
                if formula_part.lower().startswith("best") or "x eng" in formula_part.lower():
                    programmes[code]["formula"] = formula_part
            buf = ""
    return programmes


def main():
    programmes = load_from_update_py()
    programmes = supplement_formula_from_pdf(programmes)

    # Fix formulas from update_hku_scores known entries
    formula_overrides = {
        "JS6078": "1.5 x Eng + Best 5 Subjects",
        "JS6822": "1.5 x Eng + Best 4 Subjects",
        "JS6810": "Best 6 Subjects",
        "JS6456": "Best 6 Subjects",
        "JS6808": "Best 6 Subjects",
        "JS6858": "Best 6 Subjects",
        "JS6494": "Best 6 Subjects",
        "JS6949": "Best 6 Subjects",
        "JS6107": "Best 6 Subjects",
        "JS6119": "Best 5 Subjects",
        "JS6224": "Best 5 Subjects",
        "JS6248": "Best 5 Subjects",
        "JS6602": "Best 5 Subjects",
        "JS6999": "Best 5 Subjects",
        "JS6729": "1.2 x Eng + 1.2 x Math + 1.2 x M1/M2 + Best 2 Subjects",
        "JS6779": "1.5 x Math + Best 4 Subjects",
        "JS6274": "2 x Eng + Best 4 Subjects",
        "JS6157": "Best 5 Subjects",
        "JS6303": "Eng + Math + Best 3 Subjects",
        "JS6315": "Eng + Math + Best 3 Subjects",
        "JS6339": "Eng + Math + Best 3 Subjects",
        "JS6353": "Eng + Math + Best 3 Subjects",
        "JS6377": "Eng + Math + Best 3 Subjects",
        "JS6937": "Eng + Math + Best 3 Subjects",
        "JS6987": "Eng + Math + Best 3 Subjects",
        "JS6925": "Eng + Math + Best 3 Subjects",
        "JS6248": "Eng + Math + Best 3 Subjects",
        "JS6080": "1.5 x Chin + Best 5 Subjects",
        "JS6406": "Best 5 Subjects",
    }
    for code, formula in formula_overrides.items():
        if code in programmes:
            programmes[code]["formula"] = formula

    # Sanitize formulas polluted by PDF name parsing
    for code, p in programmes.items():
        f = p.get("formula", "")
        if "Bachelor" in f or "Eng +" in f and not f.lower().startswith("best"):
            p["formula"] = formula_overrides.get(code, "Best 5 Subjects")

    out = {
        "_source": "af_2025_JUPAS.pdf + update_hku_scores.py (columns: UQ | Median | LQ)",
        "_columnOrder": "PDF: Upper Quartile | Median | Lower Quartile → stored as median, uq, lq",
        "programmes": programmes,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"[extract] Wrote {len(programmes)} programmes to {OUT}")


if __name__ == "__main__":
    main()
