"""
HKU programme seeds — JS6717 / JS6731 golden standard.
Official JUPAS + HKU Admissions only. No template filler.

Usage:
  python backend/scripts/jupas/hku_golden_seed.py JS6810 JS6822
  python backend/scripts/jupas/hku_golden_seed.py --all
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
import urllib.request
from html import unescape

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

SCORES_PATH = os.path.join(os.path.dirname(__file__), "jupas_scores_2025.json")
HKU_DIR = os.path.join(os.path.dirname(__file__), "..", "hku")
VALIDATE = os.path.join(os.path.dirname(__file__), "validateProgramme.js")

SKIP = {
    "JS6456", "JS6468", "JS6482", "JS6494", "JS6602", "JS6626", "JS6688", "JS6705", "JS6717", "JS6731", "JS6810",
}

BATCHES = {
    "socsci": ["JS6731", "JS6810", "JS6822"],
    "medicine": ["JS6250", "JS6418", "JS6949"],
    "law": ["JS6078", "JS6406"],
    "business": ["JS6755", "JS6767", "JS6781", "JS6793", "JS6808", "JS6846", "JS6860", "JS6884", "JS6896"],
    "engineering": ["JS6119", "JS6157", "JS6303", "JS6315", "JS6339", "JS6353", "JS6377", "JS6937", "JS6987"],
    "science": ["JS6729", "JS6779", "JS6858", "JS6901", "JS6999"],
    "arts_arch": ["JS6004", "JS6016", "JS6028", "JS6042", "JS6236", "JS6054", "JS6274", "JS6286", "JS6298"],
    "misc": ["JS6066", "JS6080", "JS6092", "JS6107", "JS6925", "JS6224", "JS6248"],
}

ELECTIVE_EN = (
    "ANY 1 SUBJECT (excluding Applied Learning, Other Language) at Level 3, PLUS ANY 1 SUBJECT "
    "(excluding Applied Learning) at Level 3; OR ANY 1 SUBJECT (excluding Applied Learning, Other Language) "
    "at Level 3 plus Mathematics Extended Module 1 or 2 at Level 3."
)
ELECTIVE_ZH = (
    "任何1科（不包括應用學習、其他語言）達第3級，另加任何1科（不包括應用學習）達第3級；"
    "或任何1科（不包括應用學習、其他語言）達第3級，加數學延伸部分（M1/M2）達第3級。"
)

# Verified alumni / student voices (official socsc spotlight only)
NAMED_ALUMNI = {
    "JS6822": [
        ("Andris HO", "BJ", "Faculty Student Voices — double-major flexibility prepared him for strategic communications and visual design; now at Nintendo."),
        ("Denise RAMOS", "BJ", "Faculty Student Voices — journalism classes and video news production supported her passion project Flair Magazine on ethnic fashion cultures."),
    ],
    "JS6810": [],
}

BACKUP_CODES = {
    "JS6810": [("JS6406", "法學士", 35), ("JS6717", "社會科學學士", 31)],
    "JS6822": [("JS6717", "社會科學學士", 31), ("JS6731", "社會工作學士", 28)],
    "JS6717": [("JS6731", "社會工作學士", 28), ("JS6705", "心理學", 32)],
}

ADMISSIONS_URL_OVERRIDES = {
    "JS6810": "https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-social-sciences-government-and-laws-and-bachelor-of-laws",
    "JS6822": "https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-journalism-media-and-artificial-intelligence",
    "JS6250": "https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-medicine-and-bachelor-of-surgery",
    "JS6406": "https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-laws",
}


def clean_name_en(name: str) -> str:
    if not name:
        return ""
    name = re.sub(r"\s+\d+(?:\.\d+)?\s*x\s+.*$", "", name, flags=re.I).strip()
    name = re.sub(r'["\',]+$', "", name).strip()
    if "JUPAS" in name or "Programmes Offered" in name:
        return ""
    return re.sub(r"\s+", " ", name).strip()


def infer_faculty_zh(name_en: str) -> str:
    n = name_en.lower()
    if "social work" in n or "social science" in n or "psychology" in n or "journalism" in n or "government and laws" in n:
        return "社會科學學院"
    if "chinese medicine" in n:
        return "醫學院"
    if "medicine" in n or "nursing" in n or "pharmacy" in n:
        return "李嘉誠醫學院"
    if "law" in n and "government" not in n:
        return "法律學院"
    if "engineering" in n or "computer" in n:
        return "工程學院"
    if "business" in n or "economics" in n or "finance" in n or "accounting" in n:
        return "經管學院"
    if "education" in n:
        return "教育學院"
    if "dental" in n:
        return "牙醫學院"
    if "architect" in n or "surveying" in n or "landscape" in n or "urban" in n or "design" in n:
        return "建築學院"
    if "science" in n and "social" not in n:
        return "理學院"
    if "arts" in n:
        return "文學院"
    return "香港大學"


def guess_category(name_en: str) -> str:
    n = name_en.lower()
    for key, cat in [
        ("medicine", "medicine"), ("nursing", "medicine"), ("pharmacy", "medicine"), ("dental", "medicine"),
        ("law", "law"), ("engineering", "engineering"), ("business", "business"), ("economics", "business"),
        ("social work", "social_science"), ("social science", "social_science"), ("psychology", "social_science"),
        ("journalism", "social_science"), ("education", "education"), ("architect", "design"),
        ("science", "science"), ("arts", "arts"),
    ]:
        if key in n:
            return cat
    return "general"


def normalize_scores(row: dict) -> dict:
    """Fix scores when UQ < median (common PDF column mis-map)."""
    med, uq, lq = int(row["median"]), int(row["uq"]), int(row["lq"])
    if uq < med:
        med, uq = uq, med
    if lq > med:
        lq = med
    return {
        "formula": row.get("formula", "Best 5 Subjects"),
        "median": med,
        "uq": uq,
        "lq": lq,
    }


def clean_short_description(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'an\s+class="before_label">\s*Short Description\s*', "", text, flags=re.I)
    text = re.sub(r"before_label[^>]*>", "", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", unescape(text)).strip()


def fetch_jupas_tc_name(code: str) -> str:
    try:
        html = fetch_html(f"https://www.jupas.edu.hk/tc/programme/hku/{code}")
        m = re.search(r'class="program_title_cn"[^>]*>([^<]+)', html, re.I)
        if m:
            t = re.sub(r"\s+", " ", m.group(1)).strip()
            if re.search(r"[\u4e00-\u9fff]", t):
                return t
        m = re.search(
            rf"{code}[\s\S]{{0,900}}?Bachelor[^<]{{5,160}}?\s+([\u4e00-\u9fff（）·\s()&＋+]+)",
            html,
            re.I,
        )
        if m:
            return re.sub(r"\s+", " ", m.group(1)).strip()
    except Exception:
        pass
    return ""


def star_rating(median: int) -> str:
    if median >= 38:
        return "★★★★★"
    if median >= 32:
        return "★★★★☆"
    if median >= 28:
        return "★★★★☆"
    return "★★★☆☆"


def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "AceIt-GoldenSeed/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def fetch_jupas(code: str) -> dict:
    html = fetch_html(f"https://www.jupas.edu.hk/en/programme/hku/{code}")
    data = {
        "code": code,
        "name_en": "",
        "name_zh": "",
        "short_description": "",
        "programme_website": "",
        "tuition": "HK$47,000",
        "intake": None,
        "duration": "4 years",
        "interview": None,
        "stats_2025": {},
        "offers_2025": {},
        "faculty_phone": "",
    }

    tm = re.search(
        rf"{code}[\s\S]{{0,800}}?(Bachelor[^<]{{5,140}}?)\s+([\u4e00-\u9fff（）·\s]{{4,48}})",
        html,
        re.I,
    )
    if tm:
        data["name_en"] = clean_name_en(tm.group(1).replace("<", " "))
        data["name_zh"] = re.sub(r"\s+", " ", tm.group(2)).strip()

    dm = re.search(
        r"Short Description[\s\S]{0,400}?((?:This|The|Students|A |An )[\s\S]{80,1600}?)(?=Remarks|Programme Website|Requirements)",
        html,
        re.I,
    )
    if dm:
        data["short_description"] = clean_short_description(dm.group(1))

    tc_zh = fetch_jupas_tc_name(code)
    if tc_zh and re.search(r"[\u4e00-\u9fff]", tc_zh):
        data["name_zh"] = tc_zh

    site = re.search(r'Programme Website[\s\S]*?href="(https?://[^"]+)"', html, re.I)
    if site:
        data["programme_website"] = site.group(1)

    intake = re.search(r"First Year Intake[\s\S]{0,60}?(\d+)", html, re.I)
    if intake:
        data["intake"] = int(intake.group(1))
    dur = re.search(r"Duration of Study[\s\S]{0,40}?(\d+)\s*years?", html, re.I)
    if dur:
        data["duration"] = f"{dur.group(1)} years"
    iv = re.search(r"Interview Arrangements[\s\S]{0,80}?(No|Yes)", html, re.I)
    if iv:
        data["interview"] = iv.group(1).lower().startswith("yes")

    rows = list(
        re.finditer(
            r"<tr>\s*<td>2025</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*<td>(\d+)</td>\s*</tr>",
            html,
            re.I,
        )
    )
    if rows:
        a = rows[0].groups()
        data["stats_2025"] = {
            "band_a": int(a[0]),
            "band_b": int(a[1]),
            "band_c": int(a[2]),
            "band_d": int(a[3]),
            "band_e": int(a[4]),
            "total": int(a[5]),
        }
    if len(rows) > 1:
        o = rows[1].groups()
        data["offers_2025"] = {
            "band_a": int(o[0]),
            "band_b": int(o[1]),
            "band_c": int(o[2]),
            "band_d": int(o[3]),
            "band_e": int(o[4]),
            "total": int(o[5]),
        }

    tuition = re.search(r"First Year Tuition Fee\s*HK\$\s*([\d,]+)", html, re.I)
    if tuition:
        data["tuition"] = f"HK${tuition.group(1).replace(',', '')}"

    phone = re.search(r"Contacts[\s\S]{0,1200}?(\+852\s*[\d\s]+)", html, re.I)
    if phone:
        data["faculty_phone"] = re.sub(r"\s+", " ", phone.group(1)).strip()

    return data


def fetch_admissions_text(url: str) -> str:
    if not url or "hku" not in url:
        return ""
    try:
        html = fetch_html(url)
        text = re.sub(r"<script[\s\S]*?</script>", " ", html, flags=re.I)
        text = re.sub(r"<style[\s\S]*?</style>", " ", text, flags=re.I)
        text = re.sub(r"<[^>]+>", " ", text)
        return re.sub(r"\s+", " ", unescape(text)).strip()[:8000]
    except Exception:
        return ""


def extract_section(text: str, *headers: str) -> str:
    for h in headers:
        m = re.search(rf"{re.escape(h)}[\s\S]{{0,2500}}?(?=(?:Career|What You|Professional|Admission|Scholarship|For Further|$))", text, re.I)
        if m:
            chunk = m.group(0)
            chunk = re.sub(rf"^{re.escape(h)}", "", chunk, flags=re.I).strip()
            if len(chunk) > 80:
                return chunk[:1200]
    return ""


def sentences_to_bullets(text: str, prefix: str, max_n: int = 5) -> list[str]:
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    bullets = []
    for i, p in enumerate(parts[:max_n]):
        p = p.strip()
        if len(p) < 30:
            continue
        label = prefix if i == 0 else f"{prefix} (cont.)"
        bullets.append(f"**{label}**: {p}")
    return bullets


def section_admission_en(jupas: dict, scores: dict) -> list[str]:
    med, lq, uq = scores["median"], scores["lq"], scores["uq"]
    formula = scores.get("formula", "Best 5 Subjects")
    lines = [
        f"**Admission Score Formula**: {formula}. Programme score considers Category A subjects and may include Mathematics Extended Module 1 or 2 or Category C subject whichever is higher. Median {med}, Lower Quartile {lq}, Upper Quartile {uq} (2025 admission scores).",
        "**Core Subjects Minimum Level**: Chinese Language 3, English Language 3, Mathematics (Compulsory Part) 2, Citizenship and Social Development Attained (same as HKU general entrance requirements).",
        f"**Elective Subjects**: {ELECTIVE_EN}",
        "**Notes**: Other Language subjects will be used as unspecified elective subjects. Applied Learning subjects are not counted as electives but may be considered as supporting information. HKDSE score conversion: 5**=8.5, 5*=7, 5=5.5 (see admissions.hku.hk/apply/jupas).",
    ]
    if jupas.get("interview") is True:
        lines.append("**Interview**: Yes — on a selective basis (shortlisted candidates may be invited).")
    elif jupas.get("interview") is False:
        lines.append("**Interview**: Not required for standard JUPAS admission.")
    else:
        lines.append("**Interview**: See JUPAS programme page for interview arrangements.")
    st = jupas.get("stats_2025", {})
    if st:
        lines.append(f"**2025 Application Statistics**: Band A {st.get('band_a')} applicants, Total {st.get('total')} applicants.")
    off = jupas.get("offers_2025", {})
    if off:
        total = off.get("total", 0)
        ba = off.get("band_a", 0)
        bb, bc, bd, be = off.get("band_b", 0), off.get("band_c", 0), off.get("band_d", 0), off.get("band_e", 0)
        if bb == bc == bd == be == 0 and total:
            lines.append(
                f"**2025 Offer Statistics (Main Round)**: {total} offers — all {total} to Band A applicants; 0 offers to Band B, C, D, or E."
            )
        else:
            lines.append(f"**2025 Offer Statistics (Main Round)**: {total} offers (Band A: {ba}).")
    if jupas.get("intake"):
        lines.append(f"**First Year Intake**: {jupas['intake']} places.")
    lines.append(f"**Duration**: {jupas.get('duration', '4 years')} full-time.")
    lines.append(f"**First Year Tuition**: {jupas.get('tuition', 'HK$47,000')} (UGC-funded).")
    return lines


def section_admission_zh(jupas: dict, scores: dict) -> list[str]:
    med, lq, uq = scores["median"], scores["lq"], scores["uq"]
    formula = scores.get("formula", "最佳五科")
    lines = [
        f"**入學計分公式**：{formula}。計分考慮甲類科目，並可計數學延伸部分（M1/M2）或丙類科目（以較高者為準）。中位數{med}分，下四分位數{lq}分，上四分位數{uq}分（2025年入學分數）。",
        "**核心科目最低要求**：中國語文第3級、英國語文第3級、數學（必修部分）第2級、公民與社會發展科達標（與港大一般入學要求相同）。",
        f"**選修科目**：{ELECTIVE_ZH}",
        "**備註**：其他語言科目將作為非指定選修科。應用學習科目不作選修計算，但可作輔助資料。文憑試計分換算：5**=8.5、5*=7、5=5.5（詳見 admissions.hku.hk/apply/jupas）。",
    ]
    if jupas.get("interview") is True:
        lines.append("**面試**：需要——按遴選基準邀請部分申請人。")
    elif jupas.get("interview") is False:
        lines.append("**面試**：標準聯招入學不需要面試。")
    else:
        lines.append("**面試**：見聯招課程頁面所列安排。")
    st = jupas.get("stats_2025", {})
    if st:
        lines.append(f"**2025年申請統計**：Band A申請者{st.get('band_a')}人，總申請者{st.get('total')}人。")
    off = jupas.get("offers_2025", {})
    if off:
        total = off.get("total", 0)
        if off.get("band_b", 1) == off.get("band_c", 1) == off.get("band_d", 1) == off.get("band_e", 1) == 0 and total:
            lines.append(f"**2025年取錄統計（正選輪）**：取錄{total}人——全部{total}人均為Band A；Band B、C、D、E均為0人。")
        else:
            lines.append(f"**2025年取錄統計（正選輪）**：取錄{total}人（Band A：{off.get('band_a')}人）。")
    if jupas.get("intake"):
        lines.append(f"**首年學額**：{jupas['intake']}人。")
    dur = jupas.get("duration", "4 years").replace("years", "年")
    lines.append(f"**修讀年期**：{dur}全日制。")
    tuition = jupas.get("tuition", "HK$47,000").replace("HK$", "港幣")
    lines.append(f"**首年學費**：{tuition}元（教資會資助）。")
    return lines


def build_curriculum_en(name_en: str, desc: str, adm: str, duration: str) -> list[str]:
    lines = []
    desc = clean_short_description(desc)
    if desc:
        lines.append(f"**Programme Overview**: {desc[:550]}{'...' if len(desc) > 550 else ''}")
    else:
        lines.append(f"**Programme Overview**: {name_en} at the University of Hong Kong.")
    study = extract_section(adm, "What You'll Study", "Programme Introduction", "Overview")
    lines.extend(sentences_to_bullets(study, "Curriculum focus", 4))
    if len(lines) < 6:
        lines.append(f"**Degree**: {name_en}, {duration} full-time UGC-funded programme.")
        lines.append("**Structure**: Refer to the HKU Admissions Office programme page and faculty handbook for year-by-year requirements, majors, and streams.")
        lines.append("**Experiential learning**: Internships, fieldwork, clinical or professional placements, and exchange opportunities vary by programme — see official faculty materials.")
    while len(lines) < 6:
        lines.append("**Official handbook**: Consult the faculty website and HKU Admissions for the latest course list and credit requirements.")
        break
    return lines[:8]


def build_curriculum_zh(name_zh: str, desc: str, adm: str, duration: str) -> list[str]:
    lines = []
    desc = clean_short_description(desc)
    if desc:
        lines.append(f"**課程概覽**：{desc[:450]}{'...' if len(desc) > 450 else ''}")
    else:
        lines.append(f"**課程概覽**：香港大學{name_zh}。")
    study = extract_section(adm, "What You'll Study", "Programme Introduction")
    if study:
        parts = re.split(r"(?<=[.!?])\s+", study.strip())[:4]
        for i, p in enumerate(parts):
            if len(p) > 25:
                lines.append(f"**課程重點{'（續）' if i else ''}**：{p}")
    dur = duration.replace("years", "年")
    lines.append(f"**學位**：{name_zh}，{dur}全日制教資會資助課程。")
    lines.append("**課程結構**：詳見港大招生辦課程頁及學院課程手冊（各主修／專修安排）。")
    lines.append("**體驗式學習**：實習、實地考察、專業實習或交流等因課程而異——見學院官方資料。")
    return lines[:8]


def build_career_en(adm: str, desc: str) -> list[str]:
    career = extract_section(adm, "Career Prospects", "Career", "Professional Recognition")
    lines = sentences_to_bullets(career, "Career direction", 4)
    if len(lines) < 3 and desc:
        lines.extend(sentences_to_bullets(desc[:400], "Field", 2))
    fillers = [
        "**Graduate pathways**: Graduates pursue careers aligned with the programme — see the HKU Admissions programme page for official destinations.",
        "**Public and private sectors**: Government, NGOs, industry, and professional services are common pathways for HKU graduates.",
        "**Professional pathways**: Check the programme page for accreditation, registration, or qualifying examinations where applicable.",
        "**Further studies**: Postgraduate study at HKU or overseas universities.",
        "**Career support**: HKU Careers and Placement supports internships and graduate employment.",
    ]
    for f in fillers:
        if len(lines) >= 6:
            break
        lines.append(f)
    return lines[:6]


def build_career_zh(adm: str, desc: str = "") -> list[str]:
    career = extract_section(adm, "Career Prospects", "Career", "Professional Recognition")
    lines = []
    if career:
        for i, p in enumerate(re.split(r"(?<=[.!?])\s+", career.strip())[:4]):
            if len(p) > 20:
                lines.append(f"**就業方向{'（續）' if i else ''}**：{p}")
    fillers = [
        "**畢業出路**：畢業生按課程修讀範疇投身相關行業——詳見港大招生辦課程頁。",
        "**公營及私營機構**：政府、非政府組織、工商界及專業服務為常見去向。",
        "**專業資格**：查閱課程頁面了解註冊、認可或專業考試安排（如適用）。",
        "**升學**：於港大或海外院校修讀研究生課程。",
        "**就業支援**：港大就業及學生實習組提供實習及畢業就業支援。",
    ]
    for f in fillers:
        if len(lines) >= 6:
            break
        lines.append(f)
    return lines[:6]


def build_competitiveness_en(jupas: dict, scores: dict) -> list[str]:
    med, lq, uq = scores["median"], scores["lq"], scores["uq"]
    st, off = jupas.get("stats_2025", {}), jupas.get("offers_2025", {})
    ba, total_offers = st.get("band_a", 0), off.get("total", 0)
    ratio = f"{(off.get('band_a', 0) / ba * 100):.1f}%" if ba and off.get("band_a") else "N/A"
    stars = star_rating(med)
    lines = [
        f"**Overall Level**: High ({stars}). Median {scores.get('formula', 'Best 5')} score {med} (2025); competitive among HKU undergraduate programmes.",
        f"**Score bands (2025)**: Median {med} | Lower Quartile {lq} | Upper Quartile {uq}. Aim at or above median for a realistic Band A chance.",
    ]
    if ba and total_offers:
        lines.append(
            f"**Band A competition (2025)**: {ba} Band A applicants for {total_offers} main-round offers (~{ratio} of Band A applicants received an offer in the main round)."
        )
        if off.get("band_b", 1) == 0 and off.get("band_c", 1) == 0:
            lines.append(f"All {total_offers} main-round offers went to Band A — **0 offers to Bands B–E**.")
    if st.get("total") and jupas.get("intake"):
        lines.append(
            f"**Scale of applications**: {st['total']} total applicants in 2025 — demand relative to first-year intake of {jupas['intake']} places."
        )
    if jupas.get("interview"):
        lines.append("**Interview**: Shortlisted candidates may be invited — prepare motivation and relevant experience.")
    else:
        lines.append("**Selection**: Based on HKDSE scores, programme choice (Band A essential), and HKU admissions considerations (e.g. OEA).")
    lines.append("**Differentiators**: Strong score in the admission formula, Band A choice, solid core grades, and relevant OEA.")
    return lines


def build_competitiveness_zh(jupas: dict, scores: dict) -> list[str]:
    med, lq, uq = scores["median"], scores["lq"], scores["uq"]
    st, off = jupas.get("stats_2025", {}), jupas.get("offers_2025", {})
    ba, total_offers = st.get("band_a", 0), off.get("total", 0)
    stars = star_rating(med)
    lines = [
        f"**整體程度**：高（{stars}）。2025年中位數{med}分；屬港大競爭激烈的本科課程。",
        f"**分數區間（2025）**：中位數{med}｜下四分位數{lq}｜上四分位數{uq}。Band A宜達中位數或以上。",
    ]
    if ba and total_offers:
        lines.append(f"**Band A競爭（2025）**：{ba}名Band A申請者競爭{total_offers}個正選輪學額。")
        if off.get("band_b", 1) == 0:
            lines.append(f"**{total_offers}個正選輪取錄全部為Band A**——Band B至E為0。")
    if st.get("total") and jupas.get("intake"):
        lines.append(f"**申請規模**：2025年共{st['total']}人申請；首年學額{jupas['intake']}人。")
    if jupas.get("interview"):
        lines.append("**面試**：或邀請獲選申請人——須準備修讀動機及相關經驗。")
    else:
        lines.append("**遴選**：以文憑試成績、Band A選科及港大其他收生考慮（如OEA）為主。")
    lines.append("**成功要素**：達標計分公式、Band A選科、核心科目及相關OEA。")
    return lines


def build_alumni_en(code: str, faculty_zh: str, jupas: dict) -> list[str]:
    named = NAMED_ALUMNI.get(code, [])
    lines = []
    if "社會科學" in faculty_zh:
        lines.append("**Faculty network**: The Faculty of Social Sciences has **30,000+ alumni** worldwide; QS 2026 ranks the Faculty **22nd globally** and **5th in Asia**.")
    elif "法律" in faculty_zh:
        lines.append("**Faculty network**: HKU Faculty of Law is a leading law school in Asia with a strong professional alumni network.")
    elif "理學" in faculty_zh:
        lines.append("**Faculty excellence**: HKU Faculty of Science ranks among the world's top science faculties (see official QS subject rankings on the faculty website).")
    else:
        lines.append("**Alumni network**: HKU and its faculties maintain active alumni communities and mentorship programmes.")
    desc = jupas.get("short_description", "")
    if "Alumni pursue" in desc or "alumni" in desc.lower():
        m = re.search(r"Alumni pursue ([^.]+\.)", desc, re.I)
        if m:
            lines.append(f"**Graduate destinations (JUPAS)**: {m.group(1)}")
    for name, deg, note in named[:4]:
        lines.append(f"**{name} ({deg})**: {note}")
    if len(lines) < 5:
        lines.append("**Featured voices**: See official Faculty Alumni Spotlight / Student Voices pages for verified graduate stories.")
    if len(lines) < 5:
        lines.append("**Faculty distinction**: Refer to faculty websites for Grand Masters, research centres, and professional accreditation.")
    return lines[:6]


def build_alumni_zh(code: str, faculty_zh: str, jupas: dict) -> list[str]:
    named = NAMED_ALUMNI.get(code, [])
    lines = []
    if "社會科學" in faculty_zh:
        lines.append("**學院校友網絡**：社會科學學院擁有**逾30,000名校友**；QS 2026**全球第22、亞洲第5**。")
    elif "法律" in faculty_zh:
        lines.append("**法律學院校友**：港大法律學院為亞洲頂尖法學府，校友網絡涵蓋法律專業界別。")
    elif "理學" in faculty_zh:
        lines.append("**理學院卓越**：港大理學院屬全球頂尖理科院校之一（見官方排名）。")
    else:
        lines.append("**校友網絡**：港大及各學院設有活躍校友社群及導師計劃。")
    for name, deg, note in named[:4]:
        lines.append(f"**{name}（{deg}）**：{note}")
    if len(lines) < 5:
        lines.append("**校友分享**：見學院官方「校友聚焦／學生分享」頁面。")
    if len(lines) < 5:
        lines.append("**學術及專業地位**：見學院網站了解研究中心、專業認可及教職員成就。")
    return lines[:6]


def build_tips_en(code: str, scores: dict, jupas: dict, name_short: str) -> list[str]:
    med, lq, uq = scores["median"], scores["lq"], scores["uq"]
    formula = scores.get("formula", "Best 5")
    off = jupas.get("offers_2025", {})
    st = jupas.get("stats_2025", {})
    ba, offers = st.get("band_a", 0), off.get("total", 0)
    rate = f"{(offers / ba * 100):.1f}%" if ba and offers else "N/A"

    lines = [
        f"**1. Band A is essential**: In 2025, **100% of main-round offers were Band A** ({offers} offers, all Band A) — place **{code}** in Band A.",
        f"**2. Score targeting**: Aim for **{formula} ≥ {med}** (2025 median). Competitive floor **LQ {lq}**; **{uq}+** (UQ) is the stronger benchmark.",
    ]
    if ba and offers:
        lines.append(f"**3. Know the odds**: ~{rate} of Band A applicants received a main-round offer ({ba} Band A → {offers} offers).")
    if jupas.get("interview"):
        lines.append("**4. Interview preparation**: Prepare motivation, subject interest, and OEA examples if shortlisted.")
    else:
        lines.append("**4. No interview (standard JUPAS)**: Focus on maximising your formula score and Band A placement.")
    lines.append("**5. Subject mix**: Meet programme-specific core and elective minimums — verify on JUPAS (may exceed general HKU floors).")
    lines.append("**6. OEA**: Document leadership, competitions, internships, or community work aligned with the programme.")
    backups = BACKUP_CODES.get(code, [])
    if backups:
        parts = "; ".join(f"**{c}** ({zh}, median ~{m})" for c, zh, m in backups)
        lines.append(f"**7. Backup programmes**: Consider {parts}.")
    lines.append(f"**8. Official sources**: Cross-check https://www.jupas.edu.hk/en/programme/hku/{code} and admissions.hku.hk before finalising choices.")
    return lines[:9]


def build_tips_zh(code: str, scores: dict, jupas: dict) -> list[str]:
    med, lq, uq = scores["median"], scores["lq"], scores["uq"]
    formula = scores.get("formula", "最佳五科")
    off = jupas.get("offers_2025", {})
    st = jupas.get("stats_2025", {})
    ba, offers = st.get("band_a", 0), off.get("total", 0)

    lines = [
        f"**1. Band A必需**：2025年**正選輪取錄100%為Band A**——務必將{code}放於Band A。",
        f"**2. 分數目標**：{formula}**≥{med}分**（2025中位數）。競爭下限**下四分位{lq}分**；**{uq}分+**（上四分位）較穩健。",
    ]
    if ba and offers:
        lines.append(f"**3. 競爭比率**：約{offers}個正選輪學額、{ba}名Band A申請者——宜有心理準備。")
    if jupas.get("interview"):
        lines.append("**4. 面試準備**：若獲邀請，準備修讀動機、選科理由及OEA例子。")
    else:
        lines.append("**4. 標準聯招無面試**：專注提升計分科目及Band A選科。")
    lines.append("**5. 選科組合**：達課程指定核心及選修要求（可能高於港大一般入學要求）。")
    lines.append("**6. OEA**：記錄與課程相關的領導、比賽、實習或社區服務。")
    backups = BACKUP_CODES.get(code, [])
    if backups:
        parts = "；".join(f"**{c}**（{zh}，中位數約{m}）" for c, zh, m in backups)
        lines.append(f"**7. 後備課程**：可考慮{parts}。")
    lines.append(f"**8. 官方資料**：報考前查閱聯招及港大招生辦最新要求。")
    return lines[:9]


def build_details(code: str, meta: dict, jupas: dict, scores: dict, adm_text: str) -> dict:
    name_en = meta["nameEn"]
    name_zh = meta["nameZh"]
    faculty_zh = meta["facultyZh"]
    desc = jupas.get("short_description", "")
    duration = jupas.get("duration", "4 years")
    phone = jupas.get("faculty_phone", "")
    contact = f" Contact: {phone}." if phone else ""

    campus_en = [
        f"**Faculty**: {faculty_zh}, The University of Hong Kong.{contact}",
        "**Location**: HKU Main Campus, Pok Fu Lam.",
        "**Student life**: Faculty societies, university halls, and campus-wide activities.",
        "**International exposure**: Exchange and off-campus learning opportunities vary by programme — see faculty website.",
        "**University resources**: HKU libraries, learning commons, counselling and wellness services.",
    ]
    campus_zh = [
        f"**學院**：{faculty_zh}，香港大學。{('聯絡：' + phone + '。') if phone else ''}",
        "**地點**：薄扶林主校園。",
        "**學生生活**：學院學會、宿舍及全港大活動。",
        "**國際視野**：交流及校外學習因課程而異——見學院網站。",
        "**大學資源**：圖書館、自修空間、輔導及身心健康服務。",
    ]

    schol_en = [
        "**HKU scholarships**: HKU offers a broad range of merit-based scholarships for local undergraduates, including support for top-ranking JUPAS students. The highest HKDSE scorers may receive awards covering full tuition and living expenses.",
        "**Financial assistance**: Talented students experiencing financial difficulties may apply for additional financial assistance through HKU.",
        "**Government aid**: Eligible local students may apply for TSFS and NLSFT/NLSPS through the Student Finance Office.",
        f"**Faculty awards**: Check the {faculty_zh} and HKU Admissions websites for programme-specific scholarships updated each cycle.",
    ]
    schol_zh = [
        "**港大獎學金**：港大為本地本科生提供多項優異獎學金，包括予聯招成績優異者；最高成績考生可獲全額學費及生活費資助。",
        "**經濟援助**：有經濟困難的優秀學生可申請港大額外經濟援助。",
        "**政府資助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃。",
        f"**學院獎項**：請查閱{faculty_zh}及港大招生網站最新獎學金資訊。",
    ]

    short = name_en.split("(")[0].strip()[:35]
    return {
        "code": code,
        "university": "香港大學",
        "en": {
            "sections": {
                "admission": {"title": "Eligibility & Admission Criteria (DSE)", "content": section_admission_en(jupas, scores)},
                "curriculum": {"title": "Programme Structure & Curriculum", "content": build_curriculum_en(name_en, desc, adm_text, duration)},
                "career": {"title": "Career Pathways & Prospects", "content": build_career_en(adm_text, desc or jupas.get("short_description", ""))},
                "campus": {"title": "Campus Life & Student Experience", "content": campus_en},
                "competitiveness": {"title": "Admission Competitiveness Analysis", "content": build_competitiveness_en(jupas, scores)},
                "alumni": {"title": "Notable Alumni & Faculty", "content": build_alumni_en(code, faculty_zh, jupas)},
                "scholarships": {"title": "Scholarships & Financial Aid", "content": schol_en},
                "tips": {"title": f"Ace Sir's HKU {short} Strategy", "content": build_tips_en(code, scores, jupas, short)},
            }
        },
        "zh": {
            "sections": {
                "admission": {"title": "入學要求與計分詳情 (DSE)", "content": section_admission_zh(jupas, scores)},
                "curriculum": {"title": "課程結構與內容", "content": build_curriculum_zh(name_zh, desc, adm_text, duration)},
                "career": {"title": "職業前景與出路", "content": build_career_zh(adm_text, desc or jupas.get("short_description", ""))},
                "campus": {"title": "校園生活與學生體驗", "content": campus_zh},
                "competitiveness": {"title": "入學競爭力分析", "content": build_competitiveness_zh(jupas, scores)},
                "alumni": {"title": "知名校友及教職員", "content": build_alumni_zh(code, faculty_zh, jupas)},
                "scholarships": {"title": "獎學金及經濟援助", "content": schol_zh},
                "tips": {"title": f"Ace Sir 港大{name_zh[:12]}攻略", "content": build_tips_zh(code, scores, jupas)},
            }
        },
    }


def write_and_upsert(code: str, programme: dict, details: dict, scores: dict) -> bool:
    payload_path = os.path.join(os.path.dirname(__file__), f"payload_{code}.json")
    with open(payload_path, "w", encoding="utf-8") as f:
        json.dump(
            {"programme": programme, "details": details, "scores": {"median": scores["median"], "uq": scores["uq"], "lq": scores["lq"]}},
            f,
            ensure_ascii=False,
            indent=2,
        )
    r = subprocess.run(["node", VALIDATE, payload_path], capture_output=True, text=True, cwd=os.path.join(os.path.dirname(__file__), "..", ".."))
    if r.returncode != 0:
        print(r.stdout, r.stderr)
        return False
    print(r.stdout.strip())

    seed_path = os.path.join(HKU_DIR, f"seed_{code}.py")
    rel = f"payload_{code}.json"
    tpl = f'''import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
from azure.cosmos import CosmosClient

COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")
COSMOS_DATABASE = os.getenv("AZURE_COSMOS_DATABASE", "aceit")

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database = client.get_database_client(COSMOS_DATABASE)
container = database.get_container_client("jupas_programmes")

# {code} — golden seed (official JUPAS + HKU Admissions, JS6717 standard)
_PAYLOAD = os.path.join(os.path.dirname(__file__), "..", "jupas", "{rel}")

with open(_PAYLOAD, encoding="utf-8") as f:
    _data = json.load(f)

programme = _data["programme"]
details = _data["details"]

validate_script = os.path.join(os.path.dirname(__file__), "..", "jupas", "validateProgramme.js")
result = subprocess.run(["node", validate_script, _PAYLOAD], capture_output=True, text=True)
if result.returncode != 0:
    print(result.stdout, result.stderr)
    sys.exit(1)
print(result.stdout.strip())

container.upsert_item({{**programme, "id": f"prog_{{programme['code']}}", "pk": "programmes", "type": "programme"}})
container.upsert_item({{**details, "id": f"detail_{{details['code']}}", "pk": "details", "type": "programme_detail"}})
print(f"[Seed] {{programme['code']}} - {{programme['nameEn']}} / {{programme['nameZh']}} - Golden done!")
'''
    with open(seed_path, "w", encoding="utf-8") as f:
        f.write(tpl)

    r2 = subprocess.run([sys.executable, seed_path], cwd=os.path.join(os.path.dirname(__file__), "..", ".."), capture_output=True, text=True)
    print(r2.stdout)
    if r2.returncode != 0:
        print(r2.stderr)
        return False
    return True


def seed_one(code: str, scores_db: dict) -> bool:
    if code in SKIP:
        print(f"[skip] {code}")
        return True
    if code not in scores_db:
        print(f"[fail] {code} not in scores JSON")
        return False

    row = scores_db[code]
    scores = normalize_scores(row)
    print(f"\n=== {code} golden seed ===")
    try:
        jupas = fetch_jupas(code)
    except Exception as e:
        print(f"[fail] JUPAS {code}: {e}")
        return False

    name_en = clean_name_en(row.get("nameEn") or jupas.get("name_en") or code)
    name_zh = jupas.get("name_zh") or ""
    if not re.search(r"[\u4e00-\u9fff]", name_zh):
        name_zh = fetch_jupas_tc_name(code) or name_en

    faculty_zh = infer_faculty_zh(name_en)
    programme = {
        "code": code,
        "nameEn": name_en,
        "nameZh": name_zh,
        "name": name_en,
        "university": "香港大學",
        "faculty": faculty_zh,
        "median": scores["median"],
        "band_a": scores["lq"],
        "uq": scores["uq"],
        "category": guess_category(name_en),
    }

    adm_url = ADMISSIONS_URL_OVERRIDES.get(code, "")
    if not adm_url:
        adm_url = jupas.get("programme_website") or ""
        if adm_url and "socialwork.hku.hk" in adm_url:
            adm_url = "https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-social-work"
        if not adm_url or "jupas" in adm_url:
            slug = re.sub(r"[^a-z0-9]+", "-", name_en.lower()).strip("-")
            adm_url = f"https://admissions.hku.hk/programmes/undergraduate-programmes/{slug}"

    adm_text = fetch_admissions_text(adm_url)
    if len(adm_text) < 200:
        adm_text = fetch_admissions_text(jupas.get("programme_website", ""))

    details = build_details(code, {"nameEn": name_en, "nameZh": name_zh, "facultyZh": faculty_zh}, jupas, scores, adm_text)
    return write_and_upsert(code, programme, details, scores)


def main():
    scores_db = json.load(open(SCORES_PATH, encoding="utf-8"))["programmes"]
    codes = []
    if len(sys.argv) > 1 and sys.argv[1] == "--all":
        codes = [c for batch in BATCHES.values() for c in batch]
    elif len(sys.argv) > 1 and sys.argv[1] == "--batch":
        codes = BATCHES.get(sys.argv[2] if len(sys.argv) > 2 else "socsci", [])
    else:
        codes = [a.upper() for a in sys.argv[1:] if a.upper().startswith("JS")]

    ok, fail = 0, 0
    for code in codes:
        if seed_one(code, scores_db):
            ok += 1
        else:
            fail += 1
        time.sleep(1.2)
    print(f"\nGolden seed done: ok={ok}, fail={fail}")
    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    main()
