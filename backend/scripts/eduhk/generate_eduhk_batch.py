#!/usr/bin/env python3
"""
Deepseek-powered content generator for EdUHK JUPAS programmes.
Generates the 7 narrative sections (curriculum, career, campus, competitiveness, alumni, scholarships, tips)
for a batch of programmes and appends them to eduhk_programmes.json.

Usage:
    cd backend && python scripts/eduhk/generate_eduhk_batch.py --codes JS8001,JS8002
    cd backend && python scripts/eduhk/generate_eduhk_batch.py --batch batch1  # predefined batch
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
MASTER_FILE = os.path.join(SCRIPT_DIR, "eduhk_programmes.json")

# Predefined batches for 26 EdUHK programmes
BATCHES = {
    "batch1": ["JS8001", "JS8002", "JS8003", "JS8004", "JS8005"],
    "batch2": ["JS8006", "JS8007", "JS8008", "JS8009", "JS8010"],
    "batch3": ["JS8011", "JS8012", "JS8013", "JS8507", "JS8651"],
    "batch4": ["JS8663", "JS8674", "JS8675", "JS8685", "JS8686"],
    "batch5": ["JS8687", "JS8688", "JS8702", "JS8714", "JS8726"],
    "batch6": ["JS8727"],
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
    weighting = prog.get("subjectWeighting", "")
    
    # Format JUPAS stats
    j = prog.get("jupas", {})
    stats_text = ""
    if j:
        stats_text = """JUPAS 2025 Statistics:
- Band A applicants: """ + str(j.get('bandA', 'N/A')) + """
- Band B applicants: """ + str(j.get('bandB', 'N/A')) + """
- Total applicants: """ + str(j.get('allBands', 'N/A')) + """
- First year intake: """ + str(j.get('intake', 'N/A')) + """ places
- Interview required: """ + ('Yes' if j.get('interview') else 'No') + """
"""
    
    remarks = j.get('remarks', '')
    remarks_text = ""
    if remarks:
        remarks_text = "Remarks: " + remarks + "\n"
    
    prompt = """You are an expert education consultant writing detailed programme guides for Hong Kong university applicants. 

Generate the following 7 sections for The Education University of Hong Kong (EdUHK) programme """ + code + ": " + name_en + " / " + name_zh + """

PROGRAMME DATA:
- Faculty: """ + faculty + """
- Admission Score Formula: """ + formula + """
- Subject Weighting: """ + weighting + """
- Median Score (2025): """ + median + """
- Lower Quartile (2025): """ + lq + """
""" + stats_text + """
""" + remarks_text + """

EDUHK CONTEXT:
- EdUHK is Hong Kong's leading teacher education university, with a strong focus on nurturing educators and education professionals
- Located in Tai Po, New Territories with a modern campus
- Known for its 5-year integrated Bachelor of Education programmes that combine subject expertise with teacher training
- Strong programmes in early childhood education, special education, speech therapy, and educational technology
- All BEd programmes include teaching practicum in local schools
- Graduates are eligible for teacher registration in Hong Kong
- The university has a strong tradition in arts education, sports science, and environmental education
- EdUHK emphasizes hands-on learning, community engagement, and educational innovation
- Notable for its commitment to inclusive education and special educational needs

OUTPUT FORMAT:
Return a JSON object with this exact structure (NOTE: lang first, then section):
{
  "en": {
    "curriculum": { "title": "...", "content": ["...", "..."] },
    "career": { "title": "...", "content": ["...", "..."] },
    "campus": { "title": "...", "content": ["...", "..."] },
    "competitiveness": { "title": "...", "content": ["...", "..."] },
    "alumni": { "title": "...", "content": ["...", "..."] },
    "scholarships": { "title": "...", "content": ["...", "..."] },
    "tips": { "title": "Ace Sir's """ + code + """ Strategy — 9 Actionable Tips", "content": ["**1. ...", "", "- ...", "..."] }
  },
  "zh": {
    "curriculum": { "title": "...", "content": ["...", "..."] },
    "career": { "title": "...", "content": ["...", "..."] },
    "campus": { "title": "...", "content": ["...", "..."] },
    "competitiveness": { "title": "...", "content": ["...", "..."] },
    "alumni": { "title": "...", "content": ["...", "..."] },
    "scholarships": { "title": "...", "content": ["...", "..."] },
    "tips": { "title": "Ace Sir """ + code + """ 攻略 — 9 個實用貼士", "content": ["**1. ...", "", "- ...", "..."] }
  }
}

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
   - For curriculum section, include year-by-year breakdown if available: "**Year 1**: ...", "**Year 2**: ...", "**Year 3**: ...", "**Year 4**: ...", "**Year 5**: ..." (for 5-year programmes)
   - For ZH curriculum: "**第一年**：...", "**第二年**：...", "**第三年**：...", "**第四年**：...", "**第五年**：..."
6. Competitiveness section MUST include star rating:
   - EN: "**Overall Level**: High (★★★★☆)" or "**Overall Level**: Moderate to High (★★★☆☆)"
   - ZH: "**整體程度**：高（★★★★☆）" or "**整體程度**：中至高（★★★☆☆）"
   - Use 5-star scale: ★★★★★ = Very High, ★★★★☆ = High, ★★★☆☆ = Moderate to High, ★★☆☆☆ = Moderate, ★☆☆☆☆ = Low
7. Alumni section MUST include 4-6 named, verifiable alumni with specific achievements:
   - Format: "**Name (中文名)**: Position/Achievement, Company/Organisation. Graduation year if known."
   - Example: "**John Smith (史密斯)**: Principal, St. Paul's Co-educational College. 2015 graduate."
   - Do NOT use generic descriptions like "alumni work in leading schools"
   - Use Google Search to find real notable alumni who graduated from this specific programme at EdUHK
   - If specific named alumni cannot be found, use faculty excellence or programme reputation instead
   - For EdUHK education programmes, mention alumni who became school principals, teachers, education administrators
   - For EdUHK non-education programmes, mention alumni in relevant fields (psychology, speech therapy, arts, etc.)
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
    parser = argparse.ArgumentParser(description="Generate EdUHK programme content via Deepseek")
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
            print(f"[Skip] {code} — Not found in eduhk_programmes.json")
            failed.append(code)
            continue
        
        prog = master[code_map[code]]
        
        # Skip if already has sections with curriculum
        if prog.get("sections") and prog["sections"].get("en") and "curriculum" in prog["sections"]["en"]:
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
            
            print(f"[Save] {code} — Saved to eduhk_programmes.json")
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
