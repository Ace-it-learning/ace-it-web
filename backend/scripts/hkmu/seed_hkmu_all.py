#!/usr/bin/env python3
"""
Unified batch seed script for all HKMU JUPAS programmes.
Reads from hkmu_programmes.json and upserts all programmes to Cosmos DB.

Usage:
    cd backend && python scripts/hkmu/seed_hkmu_all.py
    cd backend && python scripts/hkmu/seed_hkmu_all.py --dry-run  # Validate only, no upsert
    cd backend && python scripts/hkmu/seed_hkmu_all.py --codes JS9009,JS9010  # Seed specific codes only
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
MASTER_FILE = os.path.join(SCRIPT_DIR, "hkmu_programmes.json")
VALIDATE_SCRIPT = os.path.join(SCRIPT_DIR, "..", "jupas", "validateProgramme.js")


def build_admission_section(prog, lang):
    """Auto-build the admission section from structured JUPAS data."""
    j = prog.get("jupas", {})
    stats = j.get("stats2025", {})
    offers = j.get("offers2025", {})
    
    if lang == "en":
        content = [
            f"**Admission Score Formula**: {prog['formula']}." +
            (f" Subject weighting: {prog['subjectWeighting']}." if prog.get("subjectWeighting") else ""),
        ]
        
        if prog.get("median"):
            content.append(f"**Median Admission Score**: {prog['median']} (2025 JUPAS data).")
        if prog.get("band_a"):
            content.append(f"**Lower Quartile**: {prog['band_a']} (2025 JUPAS data).")
        
        # Core subjects
        core = j.get("coreSubjects", {})
        if core:
            core_parts = []
            if core.get("chineseLanguage"): core_parts.append(f"Chinese Language {core['chineseLanguage']}")
            if core.get("englishLanguage"): core_parts.append(f"English Language {core['englishLanguage']}")
            if core.get("mathematicsCompulsory"): core_parts.append(f"Mathematics (Compulsory Part) {core['mathematicsCompulsory']}")
            if core.get("citizenshipAndSocialDevelopment"): core_parts.append(f"Citizenship and Social Development {core['citizenshipAndSocialDevelopment']}")
            if core_parts:
                content.append(f"**Core Subjects Minimum Level**: {', '.join(core_parts)}.")
        
        # Elective subjects
        elective = j.get("electiveSubjects", "ANY 2 SUBJECTS at Level 2")
        content.append(f"**Elective Subjects**: {elective}.")
        
        # Interview
        if j.get("interview"):
            content.append(f"**Interview**: Yes. {j.get('interviewDetail', '')}")
        else:
            content.append("**Interview**: No interview required for standard JUPAS admission.")
        
        # Stats
        if stats and stats.get("total"):
            content.append(
                f"**2025 Application Statistics**: Band A {stats.get('bandA', 'N/A')} applicants, "
                f"Band B {stats.get('bandB', 'N/A')}, Band C {stats.get('bandC', 'N/A')}, "
                f"Band D {stats.get('bandD', 'N/A')}, Band E {stats.get('bandE', 'N/A')}. "
                f"Total {stats.get('total', 'N/A')} applicants."
            )
        
        if offers and offers.get("total"):
            content.append(
                f"**2025 Offer Statistics**: Band A {offers.get('bandA', 'N/A')} offers, "
                f"Band B {offers.get('bandB', 'N/A')}, Band C {offers.get('bandC', 'N/A')}, "
                f"Band D {offers.get('bandD', 'N/A')}, Band E {offers.get('bandE', 'N/A')}. "
                f"Total {offers.get('total', 'N/A')} offers."
            )
        
        # Intake, duration, tuition
        if j.get("intake"):
            content.append(f"**First Year Intake**: {j['intake']} places.")
        if j.get("duration"):
            content.append(f"**Duration**: {j['duration']} full-time.")
        if j.get("tuition"):
            content.append(f"**First Year Tuition**: {j['tuition']} (local students before subsidy).")
        
        # HKMU specific info
        content.append("**Government Subsidy**: NMTSS provides HK$35,120/year for eligible local students.")
        
        # Note for new programmes
        if prog.get("note"):
            content.append(f"**Note**: {prog['note']}")
        
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
        formula_zh = formula_zh.replace('include English and Mathematics', '包括英文及數學')
        formula_zh = formula_zh.replace('include English', '包括英文')
        formula_zh = formula_zh.replace('include Mathematics', '包括數學')
        formula_zh = formula_zh.replace('3 core + 2 elective subjects', '3科核心 + 2科選修')
        
        # Translate weighting to Chinese
        weighting_zh = prog.get("subjectWeighting", "")
        weighting_zh = weighting_zh.replace('English', '英文')
        weighting_zh = weighting_zh.replace('Chinese', '中文')
        weighting_zh = weighting_zh.replace('Mathematics', '數學')
        weighting_zh = weighting_zh.replace('other elective subjects', '其他選修科')
        weighting_zh = weighting_zh.replace('weighted', '加權')
        weighting_zh = weighting_zh.replace('Child Care & Education', '幼兒教育')
        weighting_zh = weighting_zh.replace('Child Care & Development', '幼兒發展')
        weighting_zh = weighting_zh.replace('Literature', '文學')
        
        content = [
            f"**入學計分公式**：{formula_zh}。" +
            (f"科目比重：{weighting_zh}。" if weighting_zh else ""),
        ]
        
        if prog.get("median"):
            content.append(f"**入學中位數**：{prog['median']}分（2025年聯招數據）。")
        if prog.get("band_a"):
            content.append(f"**下四分位數**：{prog['band_a']}分（2025年聯招數據）。")
        
        core = j.get("coreSubjects", {})
        if core:
            core_parts = []
            if core.get("chineseLanguage"): core_parts.append(f"中國語文第{core['chineseLanguage']}級")
            if core.get("englishLanguage"): core_parts.append(f"英國語文第{core['englishLanguage']}級")
            if core.get("mathematicsCompulsory"): core_parts.append(f"數學（必修部分）第{core['mathematicsCompulsory']}級")
            if core.get("citizenshipAndSocialDevelopment"):
                csd = core['citizenshipAndSocialDevelopment']
                if csd == 'Attained':
                    core_parts.append("公民與社會發展科達標")
                else:
                    core_parts.append(f"公民與社會發展科{csd}")
            if core_parts:
                content.append(f"**核心科目最低要求**：{'、'.join(core_parts)}。")
        
        elective = j.get("electiveSubjects", "任何2科達第2級")
        # Translate common elective patterns to Chinese
        elective_zh = elective
        elective_zh = elective_zh.replace('ANY 2 SUBJECTS at Level 3', '任何2科達第3級')
        elective_zh = elective_zh.replace('ANY 2 SUBJECTS at Level 2', '任何2科達第2級')
        elective_zh = elective_zh.replace('ANY 2 SUBJECTS', '任何2科')
        elective_zh = elective_zh.replace('at Level 3', '達第3級')
        elective_zh = elective_zh.replace('at Level 2', '達第2級')
        elective_zh = elective_zh.replace('One elective subject at Level 3', '一科選修達第3級')
        elective_zh = elective_zh.replace('One elective subject', '一科選修')
        elective_zh = elective_zh.replace('Two elective subjects', '兩科選修')
        elective_zh = elective_zh.replace('One relevant elective subject', '一科相關選修')
        elective_zh = elective_zh.replace('Two relevant elective subjects', '兩科相關選修')
        content.append(f"**選修科目**：{elective_zh}。")
        
        if j.get("interview"):
            content.append(f"**面試**：需要。{j.get('interviewDetail', '')}")
        else:
            content.append("**面試**：標準聯招入學不需要面試。")
        
        if stats and stats.get("total"):
            content.append(
                f"**2025年申請統計**：Band A申請者{stats.get('bandA', 'N/A')}人、"
                f"Band B {stats.get('bandB', 'N/A')}人、Band C {stats.get('bandC', 'N/A')}人、"
                f"Band D {stats.get('bandD', 'N/A')}人、Band E {stats.get('bandE', 'N/A')}人。"
                f"總申請者{stats.get('total', 'N/A')}人。"
            )
        
        if offers and offers.get("total"):
            content.append(
                f"**2025年取錄統計**：Band A取錄{offers.get('bandA', 'N/A')}人、"
                f"Band B {offers.get('bandB', 'N/A')}人、Band C {offers.get('bandC', 'N/A')}人、"
                f"Band D {offers.get('bandD', 'N/A')}人、Band E {offers.get('bandE', 'N/A')}人。"
                f"總取錄{offers.get('total', 'N/A')}人。"
            )
        
        if j.get("intake"):
            content.append(f"**首年學額**：{j['intake']}人。")
        if j.get("duration"):
            duration_zh = j['duration']
            duration_zh = duration_zh.replace('4 years', '4年')
            duration_zh = duration_zh.replace('5 years', '5年')
            duration_zh = duration_zh.replace('years', '年')
            duration_zh = duration_zh.replace('year', '年')
            content.append(f"**修讀年期**：{duration_zh}全日制。")
        if j.get("tuition"):
            tuition_zh = j['tuition'].replace('HK$', '港幣') + '元'
            content.append(f"**首年學費**：{tuition_zh}（本地學生，未扣除資助前）。")
        
        content.append("**政府資助**：合資格本地學生可獲免入息審查資助計劃（NMTSS）每年港幣35,120元資助。")
        
        if prog.get("note"):
            content.append(f"**備註**：{prog['note']}")
        
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
        "university": "香港都會大學",
        "faculty": prog.get("faculty", ""),
        "median": prog.get("median"),
        "band_a": prog.get("band_a"),
        "category": prog.get("category", ""),
    }
    
    # Build admission sections
    admission_en = build_admission_section(prog, "en")
    admission_zh = build_admission_section(prog, "zh")
    
    # Build details doc
    sections = prog.get("sections", {})
    
    details_doc = {
        "code": code,
        "university": "香港都會大學",
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
    scores = {"median": prog.get("median"), "lq": prog.get("band_a")}
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
    parser = argparse.ArgumentParser(description="Seed HKMU JUPAS programmes to Cosmos DB")
    parser.add_argument("--dry-run", action="store_true", help="Validate only, no upsert")
    parser.add_argument("--codes", type=str, help="Comma-separated list of programme codes to seed (e.g., JS9009,JS9010)")
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
    
    print(f"[Start] Processing {len(programmes)} HKMU programmes...")
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
