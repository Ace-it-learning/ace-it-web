#!/usr/bin/env python3
"""
Unified batch seed script for all Lingnan University JUPAS programmes.
Reads from lingnanu_programmes.json and upserts all programmes to Cosmos DB.

Usage:
    cd backend && python scripts/lingnanu/seed_lingnanu_all.py
    cd backend && python scripts/lingnanu/seed_lingnanu_all.py --dry-run  # Validate only, no upsert
    cd backend && python scripts/lingnanu/seed_lingnanu_all.py --codes JS7101,JS7211  # Seed specific codes only
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
MASTER_FILE = os.path.join(SCRIPT_DIR, "lingnanu_programmes.json")
VALIDATE_SCRIPT = os.path.join(SCRIPT_DIR, "..", "jupas", "validateProgramme.js")


def build_admission_section(prog, lang):
    """Auto-build the admission section from structured JUPAS data."""
    j = prog.get("jupas", {})
    subjects = prog.get("subjects", {})
    
    if lang == "en":
        content = [
            f"**Admission Score Formula**: {prog['formula']}.",
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
        formula_zh = formula_zh.replace('include English and Mathematics', '包括英文及數學')
        formula_zh = formula_zh.replace('include English', '包括英文')
        formula_zh = formula_zh.replace('include Mathematics', '包括數學')
        
        content = [
            f"**入學計分公式**：{formula_zh}。",
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
        
        if j.get("intake"):
            content.append(f"**首年學額**：{j['intake']}人。")
        if prog.get("duration"):
            duration_zh = prog['duration']
            duration_zh = duration_zh.replace('4 years', '4年')
            duration_zh = duration_zh.replace('5 years', '5年')
            duration_zh = duration_zh.replace('6 years', '6年')
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
        "university": "嶺南大學",
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
        "university": "嶺南大學",
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
    parser = argparse.ArgumentParser(description="Seed Lingnan University JUPAS programmes to Cosmos DB")
    parser.add_argument("--dry-run", action="store_true", help="Validate only, no upsert")
    parser.add_argument("--codes", type=str, help="Comma-separated list of programme codes to seed (e.g., JS7101,JS7211)")
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
    
    print(f"[Start] Processing {len(programmes)} Lingnan University programmes...")
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
