"""
Build cuhk_jupas_scores_2025.json from af_2025_JUPAS.pdf (CUHK section).
Columns: UQ | M (Median) | LQ — Programme Weighted Total + per-subject grades.
"""
import json
import os
import re

OUT = os.path.join(os.path.dirname(__file__), "cuhk_jupas_scores_2025.json")
PDF = os.path.join(os.path.dirname(__file__), "..", "..", "data", "JUPAS", "af_2025_JUPAS.pdf")

PERCENTILE_KEYS = ("UQ", "M", "LQ")
SUBJECT_KEYS = ("chi", "eng", "math", "csd", "ls", "m1m2", "e1", "e2", "e3", "e4")


def parse_total(val):
    if val is None or str(val).strip() == "":
        return None
    s = str(val).strip().replace(",", "")
    try:
        return float(s) if "." in s else int(s)
    except ValueError:
        return None


def row_to_percentile(cells):
    """Map table row cells to percentile dict (16-col CUHK layout)."""
    if len(cells) < 14:
        return None
    pct = (cells[2] or "").strip().upper()
    if pct not in PERCENTILE_KEYS:
        return None
    total = parse_total(cells[13])
    return {
        "percentile": pct,
        "chi": (cells[3] or "").strip(),
        "eng": (cells[4] or "").strip(),
        "math": (cells[5] or "").strip(),
        "csd": (cells[6] or "").strip(),
        "ls": (cells[7] or "").strip(),
        "m1m2": (cells[8] or "").strip(),
        "e1": (cells[9] or "").strip(),
        "e2": (cells[10] or "").strip(),
        "e3": (cells[11] or "").strip(),
        "e4": (cells[12] or "").strip(),
        "total": total,
    }


def merge_programme_row(prog, cells):
    code_cell = (cells[0] or "").strip()
    if re.match(r"^JS\d{4}$", code_cell):
        prog["code"] = code_cell
        name = (cells[1] or "").strip().replace("\n", " ")
        if name:
            prog["nameEn"] = name
    elif not prog.get("nameEn") and cells[1] and (cells[1] or "").strip():
        extra = (cells[1] or "").strip().replace("\n", " ")
        if extra and not re.match(r"^(UQ|M|LQ)$", extra, re.I):
            prog["nameEn"] = (prog.get("nameEn", "") + " " + extra).strip()

    p = row_to_percentile(cells)
    if p:
        key = p.pop("percentile")
        grades = {k: v for k, v in p.items()}
        pcts = prog.setdefault("percentiles", {})
        # CUHK tables: UQ → M → LQ per programme; next programme often starts with UQ before JS code row
        if key == "UQ" and "UQ" in pcts:
            return "finalize"
        pcts[key] = grades

    if len(cells) > 14 and (cells[14] or "").strip():
        prog["formula"] = (cells[14] or "").strip().replace("\n", " ")
    if len(cells) > 15 and (cells[15] or "").strip():
        sw = (cells[15] or "").strip().replace("\n", " ")
        if sw and sw != "--":
            prog["subjectWeighting"] = sw


def finalize_programme(prog):
    pct = prog.get("percentiles", {})
    m = pct.get("M", {})
    uq = pct.get("UQ", {})
    lq = pct.get("LQ", {})
    prog["median"] = m.get("total")
    prog["uq"] = uq.get("total")
    prog["lq"] = lq.get("total")
    if not prog.get("formula"):
        prog["formula"] = "Best 5"
    return prog


def extract_cuhk_programmes():
    import pdfplumber

    programmes = {}
    current = None

    with pdfplumber.open(PDF) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            if "The Chinese University of Hong Kong" not in text and "JS4" not in text:
                continue
            for table in page.extract_tables() or []:
                for row in table:
                    if not row:
                        continue
                    cells = [(c or "").strip() for c in row]
                    if not any(cells):
                        continue
                    first = cells[0]
                    if first and "Faculty of" in first and not re.match(r"^JS", first):
                        if current and current.get("code"):
                            programmes[current["code"]] = finalize_programme(current)
                        current = None
                        continue
                    if re.match(r"^JS\d{4}$", first):
                        if current and current.get("code"):
                            programmes[current["code"]] = finalize_programme(current)
                        current = {"code": first, "percentiles": {}}
                    if current is None:
                        continue
                    action = merge_programme_row(current, cells)
                    if action == "finalize" and current.get("code"):
                        programmes[current["code"]] = finalize_programme(current)
                        p = row_to_percentile(cells)
                        if p:
                            key = p.pop("percentile")
                            current = {
                                "percentiles": {key: {k: v for k, v in p.items()}},
                            }
                        else:
                            current = None

    if current and current.get("code"):
        programmes[current["code"]] = finalize_programme(current)

    return programmes


def main():
    programmes = extract_cuhk_programmes()
    out = {
        "_source": "af_2025_JUPAS.pdf (CUHK section, pdfplumber tables)",
        "_columnOrder": "UQ | M (Median) | LQ — Programme Weighted Total",
        "programmes": programmes,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"[extract] Wrote {len(programmes)} CUHK programmes to {OUT}")
    if "JS4006" in programmes:
        p = programmes["JS4006"]
        print(f"  JS4006: median={p.get('median')} lq={p.get('lq')} uq={p.get('uq')}")


if __name__ == "__main__":
    main()
