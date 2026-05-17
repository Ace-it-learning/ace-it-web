#!/usr/bin/env python3
"""
Deepseek-powered content generator for HKBU JUPAS programmes.
Generates the 7 narrative sections (curriculum, career, campus, competitiveness, alumni, scholarships, tips)
for a batch of programmes and appends them to hkbu_programmes.json.

Usage:
    cd backend && python scripts/hkbu/generate_hkbu_batch.py --codes JS2020,JS2110,JS2120
    cd backend && python scripts/hkbu/generate_hkbu_batch.py --batch batch1  # predefined batch
"""

import json
import os
import sys
import argparse
import re

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
backend_env = os.path.join(os.path.dirname(__file__), "..", "..", "backend", ".env")
if os.path.exists(backend_env):
    load_dotenv(backend_env)

import requests

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/chat/completions")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MASTER_FILE = os.path.join(SCRIPT_DIR, "hkbu_programmes.json")

# Predefined batches for 21 HKBU programmes
BATCHES = {
    "batch1": ["JS2020", "JS2025", "JS2060", "JS2110", "JS2120"],
    "batch2": ["JS2310", "JS2330", "JS2340", "JS2370", "JS2410"],
    "batch3": ["JS2420", "JS2510", "JS2610", "JS2620", "JS2660"],
    "batch4": ["JS2810", "JS2910", "JS2920", "JS2930", "JS2940"],
    "batch5": ["JS2950", "JS2960"],
}


def call_deepseek(prompt, model="deepseek-chat", temperature=0.4, max_tokens=8192, timeout=180):
    """Call Deepseek API and return the generated text."""
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    
    try:
        response = requests.post(
            DEEPSEEK_BASE_URL,
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json"
            },
            json=payload,
            timeout=timeout
        )
        response.raise_for_status()
        data = response.json()
        text = data["choices"][0]["message"]["content"]
        print(f"[Deepseek] OK | model={model} | tokens={data.get('usage', {}).get('total_tokens', 'N/A')}")
        return text
    except Exception as e:
        print(f"[Deepseek] FAILED: {e}")
        raise


def build_prompt(prog):
    """Build the prompt for Deepseek to generate programme content."""
    
    code = prog["code"]
    name_en = prog["nameEn"]
    name_zh = prog.get("nameZh", "")
    faculty = prog.get("faculty", "")
    median = prog["median"]
    lq = prog["band_a"]
    formula = prog["formula"]
    
    # Format subject breakdown
    subjects = prog.get("subjects", {})
    subjects_text = ""
    if subjects:
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
            lq_val = s.get("lq", "")
            if med or lq_val:
                parts = []
                if med: parts.append(f"Median {med}")
                if lq_val: parts.append(f"LQ {lq_val}")
                subj_lines.append(f"- {label}: {', '.join(parts)}")
        if subj_lines:
            subjects_text = "Subject Breakdown (2025 JUPAS):\n" + "\n".join(subj_lines)
    
    # Format JUPAS stats
    j = prog.get("jupas", {})
    stats_text = ""
    if j:
        stats_text = f"""
JUPAS 2025 Statistics:
- Band A applicants: {j.get('bandA', 'N/A')}
- Band B applicants: {j.get('bandB', 'N/A')}
- Total applicants: {j.get('allBands', 'N/A')}
- First year intake: {j.get('intake', 'N/A')} places
- Interview required: {'Yes' if j.get('interview') else 'No'}
"""
    
    prompt = f"""You are an expert education consultant writing detailed programme guides for Hong Kong university applicants. 

Generate the following 7 sections for Hong Kong Baptist University (HKBU) programme {code}: {name_en} / {name_zh}

PROGRAMME DATA:
- Faculty: {faculty}
- Admission Score Formula: {formula}
- Median Score (2025): {median}
- Lower Quartile (2025): {lq}
{subjects_text}
{stats_text}

HKBU CONTEXT:
- HKBU is a leading liberal arts university in Hong Kong, known for its whole-person education
- Located in Kowloon Tong with a scenic Shaw Campus
- Strong programmes in communication, arts, Chinese medicine, and business
- Emphasis on creativity, critical thinking, and global citizenship
- Notable for its School of Communication (top-ranked in Asia) and Academy of Visual Arts
- HKBU has a strong tradition in film, journalism, and creative industries
- The university offers extensive exchange opportunities and international collaborations

OUTPUT FORMAT:
Return a JSON object with this exact structure (NOTE: lang first, then section):
{{
  "en": {{
    "curriculum": {{ "title": "...", "content": ["...", "..."] }},
    "career": {{ "title": "...", "content": ["...", "..."] }},
    "campus": {{ "title": "...", "content": ["...", "..."] }},
    "competitiveness": {{ "title": "...", "content": ["...", "..."] }},
    "alumni": {{ "title": "...", "content": ["...", "..."] }},
    "scholarships": {{ "title": "...", "content": ["...", "..."] }},
    "tips": {{ "title": "Ace Sir's {code} Strategy — 9 Actionable Tips", "content": ["**1. ...", "", "- ...", ...] }}
  }},
  "zh": {{
    "curriculum": {{ "title": "...", "content": ["...", "..."] }},
    "career": {{ "title": "...", "content": ["...", "..."] }},
    "campus": {{ "title": "...", "content": ["...", "..."] }},
    "competitiveness": {{ "title": "...", "content": ["...", "..."] }},
    "alumni": {{ "title": "...", "content": ["...", "..."] }},
    "scholarships": {{ "title": "...", "content": ["...", "..."] }},
    "tips": {{ "title": "Ace Sir {code} 攻略 — 9 個實用貼士", "content": ["**1. ...", "", "- ...", ...] }}
  }}
}}

RULES:
1. Each section must have at least 4-6 bullet points in the content array
2. EN and ZH versions must have matching structure and content
3. Use **bold** for key terms
4. Include specific numbers and data from the programme information
5. CRITICAL — Bold sub-title format for ALL sections (curriculum, career, campus, competitiveness, alumni, scholarships):
   - EVERY bullet point must start with a **bold sub-title** followed by a colon
   - Example EN: "**Programme Overview**: ...", "**Two Streams**: ...", "**Year 1**: ..."
   - Example ZH: "**課程概覽**：...", "**兩個專修**：...", "**第一年**：..."
   - This applies to curriculum, career, campus, competitiveness, alumni, scholarships sections
   - The sub-titles should be descriptive and programme-specific
   - For curriculum section, include year-by-year breakdown if available: "**Year 1**: ...", "**Year 2**: ...", "**Year 3**: ...", "**Year 4**: ..."
   - For ZH curriculum: "**第一年**：...", "**第二年**：...", "**第三年**：...", "**第四年**：..."
6. Competitiveness section MUST include star rating:
   - EN: "**Overall Level**: High (★★★★☆)" or "**Overall Level**: Moderate to High (★★★☆☆)"
   - ZH: "**整體程度**：高（★★★★☆）" or "**整體程度**：中至高（★★★☆☆）"
   - Use 5-star scale: ★★★★★ = Very High, ★★★★☆ = High, ★★★☆☆ = Moderate to High, ★★☆☆☆ = Moderate, ★☆☆☆☆ = Low
7. Alumni section MUST include 4-6 named, verifiable alumni with specific achievements:
   - Format: "**Name (中文名)**: Position/Achievement, Company/Organisation. Graduation year if known."
   - Example: "**John Smith (史密斯)**: Marketing Director, P&G Hong Kong. 2015 graduate."
   - Do NOT use generic descriptions like "alumni work in leading companies"
   - Use Google Search to find real notable alumni who graduated from this specific programme at HKBU
   - If specific named alumni cannot be found, use faculty excellence or programme reputation instead
   - For HKBU communication programmes, mention alumni who became journalists, TV hosts, filmmakers
   - For HKBU business programmes, mention alumni in accounting firms, banks, corporations
   - For HKBU arts programmes, mention alumni who became artists, writers, performers
8. For the "tips" section, follow this EXACT format (JS1000 golden standard):
   - 9 numbered tips: "**1. Title**", "**2. Title**", etc.
   - Blank line "" between each tip
   - Bullet points with "-" under each tip
   - Concrete numbers and actionable advice
   - Both EN and ZH must have exactly 9 tips with matching structure
9. Do NOT include any text outside the JSON object
10. All content must be factual based on the provided data — no hallucination
11. CRITICAL: Do NOT mention "DeepMind", "Google DeepMind", or any AI company names anywhere in the content

Return ONLY the JSON object."""
    
    return prompt


def parse_response(text):
    """Parse Deepseek response to extract JSON."""
    # Try to find JSON in the response
    # Look for code blocks first
    json_match = re.search(r'```json\s*(\{[\s\S]*?\})\s*```', text)
    if json_match:
        return json.loads(json_match.group(1))
    
    # Try to find raw JSON
    json_match = re.search(r'(\{[\s\S]*\})', text)
    if json_match:
        return json.loads(json_match.group(1))
    
    raise ValueError("Could not parse JSON from response")


def generate_programme_content(prog):
    """Generate content for a single programme using Deepseek."""
    prompt = build_prompt(prog)
    
    print(f"[Generate] {prog['code']} — Calling Deepseek...")
    response_text = call_deepseek(prompt, max_tokens=8192, timeout=180)
    
    print(f"[Generate] {prog['code']} — Parsing response...")
    sections = parse_response(response_text)
    
    return sections


def main():
    parser = argparse.ArgumentParser(description="Generate HKBU programme content via Deepseek")
    parser.add_argument("--codes", type=str, help="Comma-separated list of programme codes")
    parser.add_argument("--batch", type=str, choices=list(BATCHES.keys()), help="Predefined batch name")
    parser.add_argument("--dry-run", action="store_true", help="Generate but don't save to JSON")
    args = parser.parse_args()
    
    # Determine which codes to process
    if args.batch:
        codes = BATCHES[args.batch]
        print(f"[Batch] Using predefined batch: {args.batch} ({len(codes)} programmes)")
    elif args.codes:
        codes = args.codes.split(",")
        print(f"[Batch] Processing specific codes: {', '.join(codes)}")
    else:
        print("[Error] Please specify --codes or --batch")
        sys.exit(1)
    
    # Load master data
    with open(MASTER_FILE, "r", encoding="utf-8") as f:
        master = json.load(f)
    
    # Create code-to-index mapping
    code_map = {p["code"]: i for i, p in enumerate(master)}
    
    generated = []
    failed = []
    
    for code in codes:
        if code not in code_map:
            print(f"[Skip] {code} — Not found in hkbu_programmes.json")
            failed.append(code)
            continue
        
        prog = master[code_map[code]]
        
        # Skip if already has sections
        if prog.get("sections") and prog["sections"].get("en"):
            print(f"[Skip] {code} — Already has content sections")
            continue
        
        try:
            sections = generate_programme_content(prog)
            
            if args.dry_run:
                print(f"[Dry Run] {code} — Generated {len(sections)} sections")
                generated.append(code)
                continue
            
            # Update master data
            master[code_map[code]]["sections"] = sections
            
            # Save after each programme (checkpoint)
            with open(MASTER_FILE, "w", encoding="utf-8") as f:
                json.dump(master, f, ensure_ascii=False, indent=2)
            
            print(f"[Save] {code} — Saved to hkbu_programmes.json")
            generated.append(code)
            
        except Exception as e:
            print(f"[Error] {code} — {e}")
            failed.append(code)
    
    print()
    print("=" * 50)
    print(f"[Summary] Generated: {len(generated)} | Failed: {len(failed)}")
    if generated:
        print(f"[Generated] {', '.join(generated)}")
    if failed:
        print(f"[Failed] {', '.join(failed)}")
    print("=" * 50)


if __name__ == "__main__":
    main()
