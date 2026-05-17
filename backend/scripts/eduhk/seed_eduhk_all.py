#!/usr/bin/env python3
"""
Unified batch seed script for all EdUHK JUPAS programmes.
Reads from eduhk_programmes.json and upserts all programmes to Cosmos DB.

Usage:
    cd backend && python scripts/eduhk/seed_eduhk_all.py
    cd backend && python scripts/eduhk/seed_eduhk_all.py --dry-run  # Validate only, no upsert
    cd backend && python scripts/eduhk/seed_eduhk_all.py --codes JS8001,JS8002  # Seed specific codes only
"""

import json
import os
import sys
import argparse
import subprocess

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
from azure.cosmos import CosmosClient

COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")
COSMOS_DATABASE = os.getenv("AZURE_COSMOS_DATABASE", "aceit")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MASTER_FILE = os.path.join(SCRIPT_DIR, "eduhk_programmes.json")
VALIDATE_SCRIPT = os.path.join(SCRIPT_DIR, "..", "jupas", "validateProgramme.js")


def build_admission_section(prog, lang):
    """Auto-build the admission section from structured JUPAS data."""
    j = prog.get("jupas", {})
    subjects = prog.get("subjects", {})
    weighting = prog.get("subjectWeighting", "")
    
    if lang == "en":
        content = [
            f"**Admission Score Formula**: {prog['formula']}.",
            f"**Subject Weighting**: {weighting}",
            f"**Median Admission Score**: {prog['median']} (2025 JUPAS data).",
            f"**Lower Quartile**: {prog['band_a']} (2025 JUPAS data).",
        ]
        
        # Subject breakdown from PDF
        subj_lines = []
        subj_map = {
            "chin": "Chinese Language",
            "engl": "English Language", 
            "math": "Mathematics",
            "csd": "Citizenship and Social Development",
            "elec1": "Elective 1",
            "elec2": "Elective 2",
            "elec3": "Elective 3",
            "elec4": "Elective 4"
        }
        
        for key, label in subj_map.items():
            s = subjects.get(key, {})
            med = s.get("median", "")
            lq = s.get("lq", "")
            if med or lq:
                parts = []
                if med: parts.append(f"Median {med}")
                if lq: parts.append(f"LQ {lq}")
                subj_lines.append(f"**{label}**: {', '.join(parts)}")
        
        if subj_lines:
            content.append("**Subject Breakdown (2025 JUPAS admitted students)**:")
            content.extend([f"- {line}" for line in subj_lines])
        
        # Interview
        if j.get("interview"):
            content.append("**Interview**: Yes. Interview required for admission consideration.")
        else:
            content.append("**Interview**: No interview required for standard JUPAS admission.")
        
        # Stats
        if j.get("bandA"):
            content.append(
                f"**2025 Application Statistics**: Band A {j.get('bandA', 'N/A')} applicants, "
                f"Band B {j.get('bandB', 'N/A')}. "
                f"Total {j.get('allBands', 'N/A')} applicants."
            )
        
        # Remarks
        if j.get("remarks"):
            content.append(f"**Remarks**: {j['remarks']}")
        
        # Intake, duration, tuition
        if j.get("intake"):
            content.append(f"**First Year Intake**: {j['intake']} places.")
        if prog.get("duration"):
            content.append(f"**Duration**: {prog['duration']} full-time.")
        if prog.get("tuition"):
            content.append(f"**First Year Tuition**: {prog['tuition']} (local students).")
        
        return {
            "title": "Eligibility & Admission Criteria (DSE)",
            "content": content
        }
    
    else:  # zh
        # Translate formula to Chinese
        formula_zh = prog['formula']
        formula_zh = formula_zh.replace('Best 5 subjects', '最佳五科')
        formula_zh = formula_zh.replace('Best 4 subjects', '最佳四科')
        formula_zh = formula_zh.replace('Best 6 subjects', '最佳六科')
        
        # Translate weighting
        weighting_zh = weighting
        weighting_zh = weighting_zh.replace('Chinese Language', '中國語文')
        weighting_zh = weighting_zh.replace('English Language', '英國語文')
        weighting_zh = weighting_zh.replace('Chinese Literature', '中國文學')
        weighting_zh = weighting_zh.replace('Literature in English', '英國文學')
        weighting_zh = weighting_zh.replace('Chinese History', '中國歷史')
        weighting_zh = weighting_zh.replace('History', '歷史')
        weighting_zh = weighting_zh.replace('Visual Arts', '視覺藝術')
        weighting_zh = weighting_zh.replace('Music', '音樂')
        weighting_zh = weighting_zh.replace('Physical Education', '體育')
        weighting_zh = weighting_zh.replace('Biology', '生物')
        weighting_zh = weighting_zh.replace('Chemistry', '化學')
        weighting_zh = weighting_zh.replace('Physics', '物理')
        weighting_zh = weighting_zh.replace('Geography', '地理')
        weighting_zh = weighting_zh.replace('Math', '數學')
        weighting_zh = weighting_zh.replace('ICT', '資訊及通訊科技')
        weighting_zh = weighting_zh.replace('DAT', '設計與應用科技')
        weighting_zh = weighting_zh.replace('BAFS', '企業、會計與財務概論')
        weighting_zh = weighting_zh.replace('Economics', '經濟')
        weighting_zh = weighting_zh.replace('Specified ApL', '指定應用學習')
        weighting_zh = weighting_zh.replace('Combined Science', '組合科學')
        weighting_zh = weighting_zh.replace('Integrated Science', '綜合科學')
        weighting_zh = weighting_zh.replace('No subject weighting', '無科目比重')
        weighting_zh = weighting_zh.replace('subject(s)', '科目')
        weighting_zh = weighting_zh.replace('subjects', '科目')
        
        content = [
            f"**入學計分公式**：{formula_zh}。",
            f"**科目比重**：{weighting_zh}",
            f"**入學中位數**：{prog['median']}分（2025年聯招數據）。",
            f"**下四分位數**：{prog['band_a']}分（2025年聯招數據）。",
        ]
        
        # Subject breakdown in Chinese
        subj_map_zh = {
            "chin": "中國語文",
            "engl": "英國語文", 
            "math": "數學",
            "csd": "公民與社會發展",
            "elec1": "選修科1",
            "elec2": "選修科2",
            "elec3": "選修科3",
            "elec4": "選修科4"
        }
        
        subj_lines = []
        for key, label in subj_map_zh.items():
            s = subjects.get(key, {})
            med = s.get("median", "")
            lq = s.get("lq", "")
            if med or lq:
                parts = []
                if med: parts.append(f"中位數 {med}")
                if lq: parts.append(f"下四分位數 {lq}")
                subj_lines.append(f"**{label}**：{', '.join(parts)}")
        
        if subj_lines:
            content.append("**科目分數詳情（2025年聯招收生數據）**：")
            content.extend([f"- {line}" for line in subj_lines])
        
        if j.get("interview"):
            content.append("**面試**：需要。入學須經面試甄選。")
        else:
            content.append("**面試**：標準聯招入學不需要面試。")
        
        if j.get("bandA"):
            content.append(
                f"**2025年申請統計**：Band A申請者{j.get('bandA', 'N/A')}人、"
                f"Band B {j.get('bandB', 'N/A')}人。"
                f"總申請者{j.get('allBands', 'N/A')}人。"
            )
        
        if j.get("remarks"):
            remarks_zh = j['remarks']
            # Translate common remark patterns to Traditional Chinese
            remarks_zh = remarks_zh.replace('Satisfactory performance in an audition is required.', '須通過試音/試奏考核。')
            remarks_zh = remarks_zh.replace('Applicants who obtain Level 4 or above in HKDSE Music will be exempted from the audition.', '香港中學文憑考試音樂科達第4級或以上可獲豁免試音。')
            remarks_zh = remarks_zh.replace('Satisfactory performance in a practical test is required.', '須通過實務測試考核。')
            remarks_zh = remarks_zh.replace('Applicants who obtain Level 4 or above in HKDSE Visual Arts will be exempted from the practical test.', '香港中學文憑考試視覺藝術科達第4級或以上可獲豁免實務測試。')
            remarks_zh = remarks_zh.replace('This programme requires high Chinese language proficiency. The HKDSE Chinese Language requirement cannot be substituted.', '此課程要求較高中文語文能力，香港中學文憑考試中國語文科成績不可以其他科目替代。')
            remarks_zh = remarks_zh.replace('This programme requires high English language proficiency. The HKDSE English Language requirement cannot be substituted.', '此課程要求較高英文語文能力，香港中學文憑考試英國語文科成績不可以其他科目替代。')
            remarks_zh = remarks_zh.replace('Satisfactory performance in the written examination, physical fitness test and aquatic test is also required.', '須通過筆試、體能測試及游泳測試。')
            remarks_zh = remarks_zh.replace('Priority consideration will be given to applicants who have taken HKDSE Physical Education.', '曾修讀香港中學文憑考試體育科之申請人將獲優先考慮。')
            remarks_zh = remarks_zh.replace('Reference scores with 2026 entry weightings', '2026年入學參考分數（已計算科目比重）')
            remarks_zh = remarks_zh.replace('Lower Quartile', '下四分位數')
            remarks_zh = remarks_zh.replace('Median', '中位數')
            remarks_zh = remarks_zh.replace('Applicants who have obtained Level 2 or above in HKDSE Chinese Literature will have an advantage.', '香港中學文憑考試中國文學科達第2級或以上者將獲優先考慮。')
            remarks_zh = remarks_zh.replace('The \'Attained\' level for Citizenship and Social Development is accepted as satisfying level 2 of one of the three other subjects, but is excluded in the admissions score calculation.', '公民與社會發展科「達標」可視作符合其中一科選修科之第2級要求，但不計入入學分數。')
            remarks_zh = remarks_zh.replace('Applicants must be able to communicate effectively and fluently in both Cantonese and English.', '申請人須能流利以廣東話及英語溝通。')
            remarks_zh = remarks_zh.replace('Priority consideration will be given to applicants who have taken more than one of the HKDSE subjects listed in Elective 1.', '曾修讀多於一科選修科1所列之香港中學文憑考試科目之申請人將獲優先考慮。')
            content.append(f"**備註**：{remarks_zh}")
        
        if j.get("intake"):
            content.append(f"**首年學額**：{j['intake']}人。")
        if prog.get("duration"):
            duration_zh = prog['duration']
            duration_zh = duration_zh.replace('4 years', '4年')
            duration_zh = duration_zh.replace('5 years', '5年')
            duration_zh = duration_zh.replace('2 years', '2年')
            duration_zh = duration_zh.replace('years', '年')
            duration_zh = duration_zh.replace('year', '年')
            content.append(f"**修讀年期**：{duration_zh}全日制。")
        if prog.get("tuition"):
            tuition_zh = prog['tuition'].replace('HK$', '港幣') + '元'
            content.append(f"**首年學費**：{tuition_zh}（本地學生）。")
        
        return {
            "title": "入學要求與計分詳情 (DSE)",
            "content": content
        }


def validate_programme(programme_doc, details_doc, scores, code):
    """Write payload to temp JSON and run validateProgramme.js."""
    payload_path = os.path.join(SCRIPT_DIR, "..", "jupas", f"payload_{code}.json")
    
    with open(payload_path, "w", encoding="utf-8") as f:
        json.dump(
            {
                "programme": programme_doc,
                "details": details_doc,
                "scores": scores,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )
    
    result = subprocess.run(
        ["node", VALIDATE_SCRIPT, payload_path],
        capture_output=True,
        text=True,
    )
    
    return result.returncode == 0, result.stdout, result.stderr


def seed_programme(prog, container, dry_run=False):
    """Seed a single programme to Cosmos DB."""
    code = prog["code"]
    
    # Build programme doc
    programme_doc = {
        "code": code,
        "nameEn": prog["nameEn"],
        "nameZh": prog.get("nameZh", ""),
        "name": prog["nameEn"],
        "university": "香港教育大學",
        "faculty": prog.get("faculty", ""),
        "median": prog["median"],
        "band_a": prog["band_a"],
        "category": prog.get("category", ""),
    }
    
    # Build admission sections
    admission_en = build_admission_section(prog, "en")
    admission_zh = build_admission_section(prog, "zh")
    
    # Build details doc
    sections = prog.get("sections", {})
    
    details_doc = {
        "code": code,
        "university": "香港教育大學",
        "en": {
            "sections": {
                "admission": admission_en,
                **sections.get("en", {})
            }
        },
        "zh": {
            "sections": {
                "admission": admission_zh,
                **sections.get("zh", {})
            }
        },
    }
    
    # Validate
    scores = {"median": prog["median"], "lq": prog["band_a"]}
    is_valid, stdout, stderr = validate_programme(programme_doc, details_doc, scores, code)
    
    if not is_valid:
        print(f"[VALIDATION FAILED] {code}")
        print(stdout)
        print(stderr)
        return False
    
    print(f"[validate] OK — {code}")
    
    if dry_run:
        print(f"[DRY RUN] {code} — would upsert to Cosmos")
        return True
    
    # Upsert to Cosmos
    container.upsert_item({
        **programme_doc,
        "id": f"prog_{code}",
        "pk": "programmes",
        "type": "programme"
    })
    container.upsert_item({
        **details_doc,
        "id": f"detail_{code}",
        "pk": "details",
        "type": "programme_detail"
    })
    
    print(f"[Seed] {code} — Done!")
    return True


def main():
    parser = argparse.ArgumentParser(description="Seed EdUHK JUPAS programmes to Cosmos DB")
    parser.add_argument("--dry-run", action="store_true", help="Validate only, no upsert")
    parser.add_argument("--codes", type=str, help="Comma-separated list of programme codes to seed (e.g., JS8001,JS8002)")
    args = parser.parse_args()
    
    # Load master data
    with open(MASTER_FILE, "r", encoding="utf-8") as f:
        programmes = json.load(f)
    
    # Filter by codes if specified
    if args.codes:
        target_codes = set(args.codes.split(","))
        programmes = [p for p in programmes if p["code"] in target_codes]
        print(f"[Filter] Seeding {len(programmes)} specific programmes: {', '.join(target_codes)}")
    
    # Connect to Cosmos
    client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
    database = client.get_database_client(COSMOS_DATABASE)
    container = database.get_container_client("jupas_programmes")
    
    print(f"[Start] Processing {len(programmes)} EdUHK programmes...")
    print(f"[Mode] {'DRY RUN (validate only)' if args.dry_run else 'LIVE (validate + upsert)'}")
    print()
    
    success_count = 0
    fail_count = 0
    skipped_count = 0
    
    for prog in programmes:
        code = prog["code"]
        
        # Skip programmes without sections (stubs)
        if not prog.get("sections") or not prog["sections"].get("en"):
            print(f"[SKIP] {code} — No content sections yet (stub)")
            skipped_count += 1
            continue
        
        # Skip programmes without JUPAS data
        if not prog.get("jupas"):
            print(f"[SKIP] {code} — No JUPAS data yet")
            skipped_count += 1
            continue
        
        success = seed_programme(prog, container, dry_run=args.dry_run)
        if success:
            success_count += 1
        else:
            fail_count += 1
    
    print()
    print("=" * 50)
    print(f"[Summary] Success: {success_count} | Failed: {fail_count} | Skipped: {skipped_count}")
    print(f"[Total] {len(programmes)} programmes processed")
    print("=" * 50)


if __name__ == "__main__":
    main()
