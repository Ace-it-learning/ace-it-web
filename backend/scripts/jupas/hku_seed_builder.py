"""
Build and upsert HKU programme seeds from official JUPAS pages + scores JSON.
Usage: python backend/scripts/jupas/hku_seed_builder.py JS6731 JS6810
       python backend/scripts/jupas/hku_seed_builder.py --batch socsci
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.request
from html import unescape

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

SCORES_PATH = os.path.join(os.path.dirname(__file__), "jupas_scores_2025.json")
HKU_DIR = os.path.join(os.path.dirname(__file__), "..", "hku")
JUPAS_DIR = os.path.join(os.path.dirname(__file__), "jupas")

SKIP_RESEED = {
    "JS6468", "JS6482", "JS6494", "JS6602", "JS6626", "JS6688", "JS6705", "JS6717",
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

FACULTY_ZH = {
    "Architecture": "建築學院",
    "Arts": "文學院",
    "Business": "經管學院",
    "Dentistry": "牙醫學院",
    "Education": "教育學院",
    "Engineering": "工程學院",
    "Law": "法律學院",
    "Medicine": "醫學院",
    "Science": "理學院",
    "Social Sciences": "社會科學學院",
    "Biomedical": "生物醫學工程學系",
    "Computing": "計算與數據科學學院",
}

CATEGORY_MAP = {
    "medicine": "medicine",
    "nursing": "medicine",
    "law": "law",
    "engineering": "engineering",
    "business": "business",
    "science": "science",
    "social": "social_science",
    "education": "education",
    "dentistry": "medicine",
    "architecture": "design",
    "arts": "arts",
}


def guess_category(name_en: str) -> str:
    n = name_en.lower()
    for key, cat in [
        ("medicine", "medicine"), ("nursing", "medicine"), ("dental", "medicine"),
        ("pharmacy", "medicine"), ("biomedical", "science"), ("chinese medicine", "medicine"),
        ("law", "law"), ("engineering", "engineering"), ("business", "business"),
        ("economics", "business"), ("finance", "business"), ("social work", "social_science"),
        ("social science", "social_science"), ("psychology", "social_science"),
        ("journalism", "social_science"), ("education", "education"),
        ("architecture", "design"), ("science", "science"), ("arts", "arts"),
    ]:
        if key in n:
            return cat
    return "general"


def fetch_jupas(code: str) -> dict:
    url = f"https://www.jupas.edu.hk/en/programme/hku/{code}"
    req = urllib.request.Request(url, headers={"User-Agent": "AceIt-JUPAS-SeedBuilder/1.0"})
    with urllib.request.urlopen(req, timeout=25) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    data = {
        "code": code,
        "url": url,
        "name_en": "",
        "name_zh": "",
        "short_description": "",
        "requirements_core": [],
        "requirements_electives": "",
        "tuition": "HK$47,000",
        "intake": None,
        "duration": "4 years",
        "interview": None,
        "stats_2025": {},
        "offers_2025": {},
    }

    # Programme title on JUPAS: "Bachelor of ... 中文名" near programme code
    m = re.search(
        rf"{code}\s*#?\s*(Bachelor[^<\n#]+?)\s+([\u4e00-\u9fff（）·\s]+?)(?:\s*##|\s*<|$)",
        html,
        re.DOTALL,
    )
    if not m:
        m = re.search(
            r"(Bachelor of[A-Za-z0-9 ,()&'\-]+?)\s+([\u4e00-\u9fff（）·\s]{2,40})",
            html,
        )
    if m:
        data["name_en"] = unescape(re.sub(r"\s+", " ", m.group(1)).strip())
        data["name_zh"] = unescape(re.sub(r"\s+", " ", m.group(2)).strip())
    if "JUPAS" in data["name_en"] or "Programmes Offered" in data["name_en"]:
        data["name_en"] = ""
        data["name_zh"] = ""

    desc = re.search(r"Short Description\s*</[^>]+>\s*<[^>]+>(.*?)</", html, re.DOTALL | re.I)
    if desc:
        data["short_description"] = re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", desc.group(1)))).strip()[:1200]

    for label, key in [
        (r"CHINESE LANGUAGE", "Chinese Language 3"),
        (r"ENGLISH LANGUAGE", "English Language"),
        (r"MATHEMATICS COMPULSORY", "Mathematics (Compulsory Part)"),
        (r"CITIZENSHIP", "Citizenship and Social Development Attained"),
    ]:
        if re.search(label, html, re.I):
            pass

    intake = re.search(r"First Year Intake\s*(\d+)", html, re.I)
    if intake:
        data["intake"] = int(intake.group(1))
    dur = re.search(r"Duration of Study\s*(\d+)\s*years?", html, re.I)
    if dur:
        data["duration"] = f"{dur.group(1)} years"
    iv = re.search(r"Interview Arrangements\s*(No|Yes)", html, re.I)
    if iv:
        data["interview"] = iv.group(1).lower() == "yes"

    app = re.search(r"2025\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)", html)
    if app:
        data["stats_2025"] = {"band_a": int(app.group(1)), "total": int(app.group(6))}
    offers = list(re.finditer(r"\|\s*2025\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|", html))
    if offers:
        o = offers[-1]
        data["offers_2025"] = {
            "band_a": int(o.group(1)),
            "total": int(o.group(6)),
        }

    tuition = re.search(r"First Year Tuition Fee\s*HK\$\s*([\d,]+)", html, re.I)
    if tuition:
        data["tuition"] = f"HK${tuition.group(1).replace(',', '')}"

    return data


def section_admission_en(jupas: dict, scores: dict) -> list[str]:
    med, lq, uq = scores["median"], scores["lq"], scores["uq"]
    formula = scores.get("formula", "See JUPAS programme page")
    lines = [
        f"**Admission Score Formula**: {formula}. Median {med}, Lower Quartile {lq}, Upper Quartile {uq} (2025 admission scores).",
        "**Core Subjects Minimum Level**: Chinese Language 3, English Language 3, Mathematics (Compulsory Part) 2, Citizenship and Social Development Attained (unless programme specifies higher — see JUPAS).",
        "**Elective Subjects**: As listed on the JUPAS programme page for this code (typically two electives at Level 3, with programme-specific options).",
        "**Notes**: Category A subjects; M1/M2 or Category C may be counted per HKU JUPAS scoring rules. HKDSE conversion: 5**=8.5, 5*=7, 5=5.5.",
    ]
    if jupas.get("interview") is False:
        lines.append("**Interview**: Not required for standard JUPAS admission.")
    elif jupas.get("interview") is True:
        lines.append("**Interview**: Required or selective — see JUPAS programme page.")
    st = jupas.get("stats_2025", {})
    if st:
        lines.append(f"**2025 Application Statistics**: Band A {st.get('band_a', 'N/A')} applicants, Total {st.get('total', 'N/A')} applicants.")
    off = jupas.get("offers_2025", {})
    if off:
        lines.append(f"**2025 Offer Statistics (Main Round)**: {off.get('total', 'N/A')} offers (Band A: {off.get('band_a', 'N/A')}).")
    if jupas.get("intake"):
        lines.append(f"**First Year Intake**: {jupas['intake']} places.")
    lines.append(f"**Duration**: {jupas.get('duration', '4 years')} full-time.")
    lines.append(f"**First Year Tuition**: {jupas.get('tuition', 'HK$47,000')} (UGC-funded).")
    return lines


def section_admission_zh(jupas: dict, scores: dict) -> list[str]:
    med, lq, uq = scores["median"], scores["lq"], scores["uq"]
    formula = scores.get("formula", "見聯招課程頁")
    lines = [
        f"**入學計分公式**：{formula}。中位數{med}分，下四分位數{lq}分，上四分位數{uq}分（2025年入學分數）。",
        "**核心科目最低要求**：中國語文第3級、英國語文第3級、數學（必修部分）第2級、公民與社會發展科達標（部分課程或有更高要求，見聯招）。",
        "**選修科目**：以聯招本課程頁所列為準（一般為兩科選修達第3級）。",
        "**備註**：甲類科目計分；M1/M2或丙類科目按港大聯招規則。文憑試換算：5**=8.5、5*=7、5=5.5。",
    ]
    if jupas.get("interview") is False:
        lines.append("**面試**：標準聯招入學不需要面試。")
    elif jupas.get("interview") is True:
        lines.append("**面試**：需要或按條件邀請面試——見聯招課程頁。")
    st = jupas.get("stats_2025", {})
    if st:
        lines.append(f"**2025年申請統計**：Band A申請者{st.get('band_a')}人，總申請者{st.get('total')}人。")
    off = jupas.get("offers_2025", {})
    if off:
        lines.append(f"**2025年取錄統計（正選輪）**：取錄{off.get('total')}人（Band A：{off.get('band_a')}人）。")
    if jupas.get("intake"):
        lines.append(f"**首年學額**：{jupas['intake']}人。")
    lines.append(f"**修讀年期**：{jupas.get('duration', '4年').replace('years', '年')}全日制。".replace("4年", "4年"))
    if "年" not in lines[-1]:
        lines[-1] = f"**修讀年期**：{jupas.get('duration', '4 years')}全日制。"
    lines.append(f"**首年學費**：{jupas.get('tuition', 'HK$47,000').replace('HK$', '港幣').replace(',', '')}元（教資會資助）。")
    return lines


def build_details(code: str, meta: dict, jupas: dict, scores: dict) -> dict:
    name_en = jupas.get("name_en") or meta.get("nameEn", code)
    name_zh = jupas.get("name_zh") or name_en
    faculty_zh = meta.get("facultyZh", "香港大學")
    desc = jupas.get("short_description", "")

    curriculum_en = [
        f"**Programme Overview**: {desc[:500] + ('...' if len(desc) > 500 else '')}" if desc else f"**Programme Overview**: {name_en} at the University of Hong Kong.",
        f"**Degree**: {name_en}.",
        f"**Duration**: {jupas.get('duration', '4 years')} full-time UGC-funded programme.",
        "**Structure**: Refer to the HKU Admissions Office programme page and faculty handbook for year-by-year curriculum and major/stream requirements.",
        "**Experiential learning**: Internships, exchange, or capstone requirements vary by major — see official faculty materials.",
    ]
    curriculum_zh = [
        f"**課程概覽**：{desc[:400] + ('...' if len(desc) > 400 else '')}" if desc else f"**課程概覽**：香港大學{name_zh}。",
        f"**學位**：{name_zh}。",
        f"**修讀年期**：{jupas.get('duration', '4 years').replace('years', '年')}全日制教資會資助課程。",
        "**課程結構**：詳見港大招生辦課程頁及學院課程手冊（各主修／專修安排）。",
        "**體驗式學習**：實習、交流或畢業專題要求因主修而異——見學院官方資料。",
    ]

    career_en = [
        "**Career directions**: Graduates pursue careers in sectors aligned with their major — see the HKU Admissions programme page for official destinations.",
        "**Public and private sectors**: Government, NGOs, industry, and professional services are common pathways for HKU graduates.",
        "**Further studies**: Postgraduate study at HKU or overseas universities.",
    ]
    career_zh = [
        "**就業方向**：畢業生按主修投身相關行業——詳見港大招生辦課程頁所列出路。",
        "**公營及私營機構**：政府、非政府組織、工商界及專業服務為常見去向。",
        "**升學**：於港大或海外院校修讀研究生課程。",
    ]

    med = scores["median"]
    st = jupas.get("stats_2025", {})
    off = jupas.get("offers_2025", {})
    band_a = st.get("band_a", 0)
    offers = off.get("total", 0)
    ratio = f"{(offers / band_a * 100):.1f}%" if band_a and offers else "N/A"

    comp_en = [
        f"**Overall Level**: Competitive. Median score {med} (2025, {scores.get('formula', 'see JUPAS')}).",
        f"**Score bands (2025)**: Median {med} | Lower Quartile {scores['lq']} | Upper Quartile {scores['uq']}.",
    ]
    if band_a and offers:
        comp_en.append(f"**Band A competition (2025)**: {band_a} Band A applicants, {offers} main-round offers (~{ratio} of Band A).")
    comp_en += [
        "**Band A**: Place this programme in Band A for the best chance — check offer statistics on JUPAS.",
        "**Differentiators**: Strong HKDSE score, relevant OEA, and meeting all programme-specific subject minimums.",
    ]

    comp_zh = [
        f"**整體程度**：競爭激烈。2025年中位數{med}分（{scores.get('formula', '見聯招')}）。",
        f"**分數區間（2025）**：中位數{med}｜下四分位數{scores['lq']}｜上四分位數{scores['uq']}。",
    ]
    if band_a and offers:
        comp_zh.append(f"**Band A競爭（2025）**：{band_a}名Band A申請者，正選輪取錄{offers}人。")
    comp_zh += [
        "**Band A**：宜將本課程放於Band A以獲最佳機會——見聯招取錄統計。",
        "**成功要素**：優異文憑試成績、相關其他經驗與成就（OEA）及達標選修科目。",
    ]

    alumni_en = [
        "**Alumni network**: HKU and its faculties maintain active alumni communities and mentorship programmes.",
        "**Featured voices**: The Faculty of Social Sciences and other units publish graduate stories on official Alumni Spotlight pages — search by programme on the faculty website.",
        "**Note**: Only verified alumni names from official HKU pages are listed in premium programme notes; refer to faculty alumni pages for current stories.",
    ]
    alumni_zh = [
        "**校友網絡**：港大及各學院設有活躍校友社群及導師計劃。",
        "**校友分享**：社會科學學院等單位於官方「校友聚焦」頁面刊登畢業生分享——可按課程於學院網站搜尋。",
        "**備註**：知名校友僅收錄於港大官方頁面核實者；詳見學院校友專頁。",
    ]

    # Programme-specific alumni overrides
    if code in ("JS6731", "JS6717", "JS6705", "JS6810", "JS6822"):
        alumni_en = [
            "**Alumni network**: The Faculty of Social Sciences has **30,000+ alumni** worldwide.",
            "**BSW / BSocSc graduates**: Featured on web.socsc.hku.hk Alumni Spotlight — social work, policy, media, and public service pathways.",
            "**More stories**: See the Faculty Alumni Spotlight for named graduate profiles.",
        ]
        alumni_zh = [
            "**校友網絡**：社會科學學院擁有**逾30,000名校友**遍布全球。",
            "**社會工作／社會科學畢業生**：見學院「校友聚焦」專頁——涵蓋社工、政策、傳媒及公共服務等出路。",
            "**更多個案**：詳見學院官方「校友聚焦」頁面。",
        ]

    return {
        "code": code,
        "university": "香港大學",
        "en": {
            "sections": {
                "admission": {"title": "Eligibility & Admission Criteria (DSE)", "content": section_admission_en(jupas, scores)},
                "curriculum": {"title": "Programme Structure & Curriculum", "content": curriculum_en},
                "career": {"title": "Career Pathways & Prospects", "content": career_en},
                "campus": {
                    "title": "Campus Life & Student Experience",
                    "content": [
                        f"**Faculty**: {faculty_zh} / The University of Hong Kong.",
                        "**Location**: HKU Main Campus, Pok Fu Lam.",
                        "**Student life**: Faculty societies, university halls, and campus-wide activities.",
                        "**Support**: Libraries, counselling, career services, and exchange programmes.",
                    ],
                },
                "competitiveness": {"title": "Admission Competitiveness Analysis", "content": comp_en},
                "alumni": {"title": "Notable Alumni & Faculty", "content": alumni_en},
                "scholarships": {
                    "title": "Scholarships & Financial Aid",
                    "content": [
                        "**HKU scholarships**: Merit-based awards for outstanding JUPAS applicants; top scorers may receive tuition and living-expense support.",
                        "**Government aid**: TSFS and NLSPS for eligible local students.",
                        "**Faculty awards**: Check faculty and HKU Admissions websites for programme-specific scholarships.",
                    ],
                },
                "tips": {
                    "title": f"Ace Sir's {name_en.split('(')[0].strip()[:40]} Strategy",
                    "content": [
                        f"**Score targeting**: Aim for Best-subject total at or above **{med}** (2025 median).",
                        f"**Competitive floor**: Lower quartile **{scores['lq']}**; upper quartile **{scores['uq']}** indicates a stronger profile.",
                        "**Band A**: Essential for competitive HKU programmes — review JUPAS offer stats.",
                        "**Check JUPAS**: Confirm exact elective requirements and any interview for this code.",
                        "**OEA**: Document leadership, service, or achievements relevant to your intended major.",
                    ],
                },
            }
        },
        "zh": {
            "sections": {
                "admission": {"title": "入學要求與計分詳情 (DSE)", "content": section_admission_zh(jupas, scores)},
                "curriculum": {"title": "課程結構與內容", "content": curriculum_zh},
                "career": {"title": "職業前景與出路", "content": career_zh},
                "campus": {
                    "title": "校園生活與學生體驗",
                    "content": [
                        f"**學院**：{faculty_zh}／香港大學。",
                        "**地點**：薄扶林主校園。",
                        "**學生生活**：學院學會、宿舍及全港大活動。",
                        "**支援**：圖書館、輔導、就業及交流服務。",
                    ],
                },
                "competitiveness": {"title": "入學競爭力分析", "content": comp_zh},
                "alumni": {"title": "知名校友及教職員", "content": alumni_zh},
                "scholarships": {
                    "title": "獎學金及經濟援助",
                    "content": [
                        "**港大獎學金**：聯招成績優異者享優異獎學金；最高成績考生可獲學費及生活費資助。",
                        "**政府資助**：合資格本地學生可申請專上學生資助計劃及免入息審查貸款計劃。",
                        "**學院獎項**：見學院及港大招生網站最新獎學金資訊。",
                    ],
                },
                "tips": {
                    "title": f"Ace Sir {name_zh[:20]}攻略",
                    "content": [
                        f"**分數目標**：宜達**{med}分**或以上（2025中位數）。",
                        f"**競爭參考**：下四分位**{scores['lq']}分**；上四分位**{scores['uq']}分**較穩健。",
                        "**Band A**：競爭激烈課程務必放Band A——參考聯招取錄統計。",
                        "**查核聯招**：確認選修要求及是否須面試。",
                        "**OEA**：記錄與擬申主修相關的領導、服務或成就。",
                    ],
                },
            }
        },
    }


def write_seed_file(code: str, programme: dict, details: dict, scores: dict) -> str:
    path = os.path.join(HKU_DIR, f"seed_{code}.py")
    prog_json = json.dumps(programme, ensure_ascii=False, indent=4)
    det_json = json.dumps(details, ensure_ascii=False, indent=4)
    scores_json = json.dumps(
        {"median": scores["median"], "uq": scores["uq"], "lq": scores["lq"]},
        ensure_ascii=False,
    )
    content = f'''import json
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

# {code} — official JUPAS + 2025 admission scores
# Re-build: python backend/scripts/jupas/hku_seed_builder.py {code}

programme = {prog_json}

details = {det_json}

payload_path = os.path.join(os.path.dirname(__file__), "..", "jupas", "payload_{code}.json")
with open(payload_path, "w", encoding="utf-8") as f:
    json.dump({{"programme": programme, "details": details, "scores": {scores_json}}}, f, ensure_ascii=False, indent=2)

validate_script = os.path.join(os.path.dirname(__file__), "..", "jupas", "validateProgramme.js")
result = subprocess.run(["node", validate_script, payload_path], capture_output=True, text=True)
if result.returncode != 0:
    print(result.stdout, result.stderr)
    sys.exit(1)
print(result.stdout.strip())

container.upsert_item({{**programme, "id": f"prog_{{programme['code']}}", "pk": "programmes", "type": "programme", "updatedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z"}})
container.upsert_item({{**details, "id": f"detail_{{details['code']}}", "pk": "details", "type": "programme_detail", "updatedAt": __import__("datetime").datetime.utcnow().isoformat() + "Z"}})
print(f"[Seed] {{programme['code']}} - {{programme['nameEn']}} / {{programme['nameZh']}} - Done!")
print("[Seed] Restart backend OR wait up to 1h for programme list cache to refresh.")
'''
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return path


def infer_faculty_zh(name_en: str) -> str:
    n = name_en.lower()
    if "social work" in n or "social science" in n or "psychology" in n or "journalism" in n or "government and laws" in n:
        return "社會科學學院"
    if "medicine" in n or "nursing" in n or "pharmacy" in n or "chinese medicine" in n or "biomedical" in n:
        return "李嘉誠醫學院" if "medicine" in n and "chinese" not in n else "醫學院"
    if "law" in n:
        return "法律學院"
    if "engineering" in n or "computer" in n or "civil" in n or "mechanical" in n:
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


def load_name_zh_map() -> dict:
    mapping = {}
    rem_path = os.path.join(os.path.dirname(__file__), "..", "seed_hku_remaining_programmes.js")
    if os.path.isfile(rem_path):
        text = open(rem_path, encoding="utf-8").read()
        for m in re.finditer(r'code:\s*"(JS\d{4})"[^}]*?nameZh:\s*"([^"]+)"', text, re.DOTALL):
            mapping[m.group(1)] = m.group(2)
    return mapping


NAME_ZH = load_name_zh_map()


def clean_name_en(name: str) -> str:
    if not name:
        return ""
    name = re.sub(r"\s+\d+(?:\.\d+)?\s*x\s+.*$", "", name, flags=re.I).strip()
    name = re.sub(r"\s+Eng\s*\+.*$", "", name, flags=re.I).strip()
    name = re.sub(r"\s+Math\s*\+.*$", "", name, flags=re.I).strip()
    name = re.sub(r"\s+/\s+.*$", "", name).strip()
    if "JUPAS" in name or "Programmes Offered" in name:
        return ""
    return name


def seed_one(code: str, scores_db: dict) -> bool:
    if code not in scores_db:
        print(f"[Skip] {code} not in scores JSON")
        return False
    scores = scores_db[code].copy()
    meta = scores.copy()
    meta["nameEn"] = clean_name_en(meta.get("nameEn", ""))
    fac = infer_faculty_zh(meta.get("nameEn", ""))
    rem_path = os.path.join(os.path.dirname(__file__), "..", "seed_hku_remaining_programmes.js")
    if os.path.isfile(rem_path):
        block = re.search(rf'code:\s*"{code}"[^}}]+}}', open(rem_path, encoding="utf-8").read(), re.DOTALL)
        if block and "faculty:" in block.group(0):
            fm = re.search(r'faculty:\s*"([^"]+)"', block.group(0))
            if fm:
                fac = fm.group(1)
    meta["facultyZh"] = fac
    try:
        jupas = fetch_jupas(code)
    except Exception as e:
        print(f"[Error] JUPAS fetch {code}: {e}")
        return False

    jupas["name_en"] = clean_name_en(jupas.get("name_en", ""))
    name_en = meta.get("nameEn") or jupas.get("name_en") or code
    name_zh = NAME_ZH.get(code) or jupas.get("name_zh") or name_en

    programme = {
        "code": code,
        "nameEn": name_en,
        "nameZh": name_zh,
        "name": name_en,
        "university": "香港大學",
        "faculty": meta.get("facultyZh", "香港大學"),
        "median": scores["median"],
        "band_a": scores["lq"],
        "uq": scores["uq"],
        "category": guess_category(name_en),
    }
    details = build_details(code, meta, jupas, scores)
    path = write_seed_file(code, programme, details, scores)
    r = subprocess.run([sys.executable, path], cwd=os.path.join(os.path.dirname(__file__), "..", ".."), capture_output=True, text=True)
    print(r.stdout)
    if r.returncode != 0:
        print(r.stderr)
        return False
    return True


def main():
    scores_data = json.load(open(SCORES_PATH, encoding="utf-8"))
    scores_db = scores_data["programmes"]

    codes = []
    if len(sys.argv) > 1 and sys.argv[1] == "--batch":
        batch = sys.argv[2] if len(sys.argv) > 2 else "socsci"
        codes = BATCHES.get(batch, [])
    else:
        codes = [c.upper() for c in sys.argv[1:] if c.upper().startswith("JS")]

    ok, fail = 0, 0
    for code in codes:
        if code in SKIP_RESEED:
            print(f"\\n=== {code} === [skip] already manually verified")
            continue
        print(f"\\n=== {code} ===")
        if seed_one(code, scores_db):
            ok += 1
        else:
            fail += 1
    print(f"\\nDone: ok={ok}, fail={fail}")


if __name__ == "__main__":
    main()
