#!/usr/bin/env python3
"""
Deepseek-powered content generator for HKMU JUPAS programmes.
Generates the 7 narrative sections (curriculum, career, campus, competitiveness, alumni, scholarships, tips)
for a batch of programmes and appends them to hkmu_programmes.json.

Usage:
    cd backend && python scripts/hkmu/generate_hkmu_batch.py --codes JS9009,JS9010
    cd backend && python scripts/hkmu/generate_hkmu_batch.py --batch batch1  # predefined batch
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
MASTER_FILE = os.path.join(SCRIPT_DIR, "hkmu_programmes.json")

# Predefined batches
BATCHES = {
    "batch1": ["JS9009", "JS9010", "JS9011", "JS9013", "JS9016", "JS9019"],
    "batch2": ["JS9220", "JS9230", "JS9240", "JS9262", "JS9266", "JS9276"],
    "batch3": ["JS9280", "JS9291", "JS9294", "JS9520", "JS9530"],
    "batch4": ["JS9540", "JS9550", "JS9560", "JS9580", "JS9719", "JS9720"],
    "batch5": ["JS9731", "JS9732", "JS9733", "JS9775", "JS9776"],
}


def call_deepseek(prompt, model="deepseek-chat", temperature=0.4, max_tokens=4096, timeout=120):
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


def build_prompt(prog, jupas_stats, hkmu_info, alumni_list):
    """Build the prompt for Deepseek to generate programme content."""
    
    code = prog["code"]
    name_en = prog["nameEn"]
    name_zh = prog.get("nameZh", "")
    faculty = prog.get("faculty", "")
    median = prog.get("median", "N/A")
    lq = prog.get("band_a", "N/A")
    formula = prog.get("formula", "Best 5 subjects")
    weighting = prog.get("subjectWeighting", "")
    streams = prog.get("streams", [])
    
    # Format JUPAS stats
    stats_text = ""
    if jupas_stats:
        stats_text = f"""
JUPAS 2025 Statistics:
- Band A applicants: {jupas_stats.get('bandA', 'N/A')}
- Band B applicants: {jupas_stats.get('bandB', 'N/A')}
- Band C applicants: {jupas_stats.get('bandC', 'N/A')}
- Band D applicants: {jupas_stats.get('bandD', 'N/A')}
- Band E applicants: {jupas_stats.get('bandE', 'N/A')}
- Total applicants: {jupas_stats.get('total', 'N/A')}
"""
    
    # Format streams
    streams_text = ""
    if streams:
        streams_text = f"Streams/Specialisations: {', '.join(streams)}"
    
    # Format alumni
    alumni_text = ""
    if alumni_list:
        alumni_text = "Notable Alumni:\n" + "\n".join([f"- {a}" for a in alumni_list])
    
    prompt = f"""You are an expert education consultant writing detailed programme guides for Hong Kong university applicants. 

Generate the following 7 sections for Hong Kong Metropolitan University (HKMU) programme {code}: {name_en} / {name_zh}

PROGRAMME DATA:
- Faculty: {faculty}
- Admission Score Formula: {formula}
- Subject Weighting: {weighting}
- Median Score (2025): {median}
- Lower Quartile (2025): {lq}
{streams_text}
{stats_text}
{hkmu_info}
{alumni_text}

IMPORTANT CONTEXT ABOUT HKMU:
- HKMU (formerly Open University of Hong Kong) is a self-financing university with self-accrediting status
- It is the only self-financing university in Hong Kong granted self-accrediting status
- Programmes are practical and career-oriented with strong industry connections
- The university offers 4,000+ local and overseas internships annually
- Tuition is approximately HK$87,240 per year for most programmes (before government subsidy)
- Local students receive NMTSS subsidy of HK$35,120/year (non-means-tested)
- Some programmes receive SSSDP subsidy (higher amount for designated professions)
- HKMU has five schools: Arts & Social Sciences, Business & Administration, Education & Languages, Nursing & Health Sciences, Science & Technology
- The university emphasizes applied learning, internships, and industry collaboration
- Campus is located in Ho Man Tin, Kowloon

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
   - EN: "**Overall Level**: Low to Moderate (★★☆☆☆)" or "**Overall Level**: Moderate (★★★☆☆)"
   - ZH: "**整體程度**：低至中（★★☆☆☆）" or "**整體程度**：中等（★★★☆☆）"
   - Use 5-star scale: ★★★★★ = Very High, ★★★★☆ = High, ★★★☆☆ = Moderate, ★★☆☆☆ = Low to Moderate, ★☆☆☆☆ = Low
   - HKMU programmes generally have lower admission scores (median 14-23) compared to UGC-funded universities, so adjust ratings accordingly
7. Alumni section MUST include 4-6 named, verifiable alumni with specific achievements:
   - Format: "**Name (中文名)**: Position/Achievement, Company/Organisation. Graduation year if known."
   - Example: "**John Smith (史密斯)**: Marketing Director, XYZ Company. 2015 graduate."
   - Do NOT use generic descriptions like "alumni work in leading companies"
   - If specific named alumni cannot be found, use faculty excellence or programme reputation instead
   - For HKMU, focus on graduates who have succeeded in their fields through practical experience
8. For the "tips" section, follow this EXACT format:
   - 9 numbered tips: "**1. Title**", "**2. Title**", etc.
   - Blank line "" between each tip
   - Bullet points with "-" under each tip
   - Concrete numbers and actionable advice
   - Both EN and ZH must have exactly 9 tips with matching structure
   - Tips should be tailored to HKMU's applied learning focus and lower admission thresholds
9. Do NOT include any text outside the JSON object
10. All content must be factual based on the provided data — no hallucination

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


def generate_programme_content(prog, jupas_stats=None, hkmu_info="", alumni_list=None):
    """Generate content for a single programme using Deepseek."""
    prompt = build_prompt(prog, jupas_stats, hkmu_info, alumni_list or [])
    
    print(f"[Generate] {prog['code']} — Calling Deepseek...")
    response_text = call_deepseek(prompt, max_tokens=8192, timeout=180)
    
    print(f"[Generate] {prog['code']} — Parsing response...")
    sections = parse_response(response_text)
    
    return sections


def main():
    parser = argparse.ArgumentParser(description="Generate HKMU programme content via Deepseek")
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
            print(f"[Skip] {code} — Not found in hkmu_programmes.json")
            failed.append(code)
            continue
        
        prog = master[code_map[code]]
        
        # Skip if already has sections
        if prog.get("sections") and prog["sections"].get("en"):
            print(f"[Skip] {code} — Already has content sections")
            continue
        
        try:
            # Use data from the JSON file
            jupas_stats = prog.get("jupas", {}).get("stats2025", {})
            hkmu_info = ""
            alumni_list = []
            
            sections = generate_programme_content(prog, jupas_stats, hkmu_info, alumni_list)
            
            if args.dry_run:
                print(f"[Dry Run] {code} — Generated {len(sections)} sections")
                generated.append(code)
                continue
            
            # Update master data
            master[code_map[code]]["sections"] = sections
            
            # Save after each programme (checkpoint)
            with open(MASTER_FILE, "w", encoding="utf-8") as f:
                json.dump(master, f, ensure_ascii=False, indent=2)
            
            print(f"[Save] {code} — Saved to hkmu_programmes.json")
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
