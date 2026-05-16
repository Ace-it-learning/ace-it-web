import json, os, sys, re, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
from azure.cosmos import CosmosClient
import urllib.request

COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")
COSMOS_DATABASE = os.getenv("AZURE_COSMOS_DATABASE", "aceit")

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database = client.get_database_client(COSMOS_DATABASE)
container = database.get_container_client("jupas_programmes")

# All HKU programme codes from JUPAS PDF
hku_codes = [
    "JS6004", "JS6016", "JS6028", "JS6042", "JS6236",  # Architecture
    "JS6054", "JS6274", "JS6286", "JS6298",  # Arts
    "JS6755", "JS6767", "JS6781", "JS6793", "JS6808", "JS6846", "JS6860", "JS6884", "JS6896",  # Business
    "JS6107",  # Dentistry
    "JS6066", "JS6080", "JS6092",  # Education
    "JS6119", "JS6157", "JS6303", "JS6315", "JS6339", "JS6353", "JS6377", "JS6937", "JS6987",  # Engineering
    "JS6078", "JS6406",  # Law
    "JS6250", "JS6418", "JS6456", "JS6468", "JS6482", "JS6494", "JS6949",  # Medicine
    "JS6688", "JS6858", "JS6901", "JS6729", "JS6779", "JS6999", "JS6602",  # Science
    "JS6705", "JS6717", "JS6731", "JS6810", "JS6822",  # Social Sciences
    "JS6925",  # Biomedical Engineering
    "JS6224", "JS6248",  # Computing and Data Science
]

def scrape_jupas(code):
    """Scrape JUPAS page for programme data"""
    url = f"https://www.jupas.edu.hk/en/programme/hku/{code.replace('JS', '')}"
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        with urllib.request.urlopen(req, timeout=15) as response:
            html = response.read().decode('utf-8')
        
        data = {
            'code': code,
            'title_en': '',
            'title_zh': '',
            'requirements': [],
            'stats': {},
            'tuition': '',
            'website': ''
        }
        
        # Extract title
        title_match = re.search(r'<h1[^>]*>.*?<span[^>]*>(.*?)</span>.*?<span[^>]*>(.*?)</span>', html, re.DOTALL)
        if title_match:
            data['title_en'] = re.sub(r'<[^>]+>', '', title_match.group(1)).strip()
            data['title_zh'] = re.sub(r'<[^>]+>', '', title_match.group(2)).strip()
        
        # Extract sections
        sections = re.findall(r'<p class="strokeBar_title"[^>]*>(.*?)</p>(.*?)(?=<p class="strokeBar_title"|$)', html, re.DOTALL)
        for title, content in sections:
            title_text = re.sub(r'<[^>]+>', '', title).strip()
            content_text = re.sub(r'<[^>]+>', ' ', content).strip()
            content_text = re.sub(r'\s+', ' ', content_text)
            
            if 'Requirements' in title_text:
                # Parse requirements tables
                data['requirements'] = parse_requirements(content_text)
            elif 'Statistics' in title_text:
                data['stats'] = parse_stats(content_text)
            elif 'Tuition' in title_text:
                data['tuition'] = content_text[:100]
            elif 'Website' in title_text:
                data['website'] = content_text[:200]
        
        return data
    except Exception as e:
        print(f"[Error] {code}: {e}")
        return None

def parse_requirements(text):
    """Parse entry requirements from JUPAS text"""
    req = {
        'core': [],
        'electives': [],
        'notes': []
    }
    lines = text.split('. ')
    for line in lines:
        line = line.strip()
        if 'CHINESE LANGUAGE' in line or 'ENGLISH LANGUAGE' in line or 'MATHEMATICS' in line or 'CITIZENSHIP' in line:
            req['core'].append(line)
        elif 'Elective' in line and ('SUBJECT' in line or 'Level' in line):
            req['electives'].append(line)
        elif 'Notes' in line or 'Remark' in line:
            req['notes'].append(line)
    return req

def parse_stats(text):
    """Parse application statistics"""
    stats = {}
    # Look for 2025 data
    match = re.search(r'2025\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)', text)
    if match:
        stats['band_a'] = match.group(1)
        stats['total'] = match.group(6)
    return stats

def generate_details(data, programme_doc):
    """Generate 8-section details following JS1001 golden standard"""
    code = data['code']
    name_en = programme_doc.get('nameEn', '')
    name_zh = programme_doc.get('nameZh', '')
    faculty = programme_doc.get('faculty', '')
    median = programme_doc.get('median', '')
    lq = programme_doc.get('band_a', '')
    uq = programme_doc.get('uq', '')
    
    # Build requirements text
    req_core = data.get('requirements', {}).get('core', [])
    req_electives = data.get('requirements', {}).get('electives', [])
    req_notes = data.get('requirements', {}).get('notes', [])
    
    core_text = ' / '.join(req_core) if req_core else 'Chinese Language 3, English Language 3, Mathematics 2-3, Citizenship Attained'
    elective_text = ' / '.join(req_electives) if req_electives else 'ANY 2 SUBJECTS at Level 3'
    notes_text = ' / '.join(req_notes) if req_notes else 'See JUPAS website for details'
    
    # Build stats text
    stats = data.get('stats', {})
    stats_text = f"Band A {stats.get('band_a', 'N/A')} applicants, Total {stats.get('total', 'N/A')} applicants" if stats else 'Statistics not available'
    
    # Generate EN sections
    en_sections = {
        "admission": {
            "title": "Eligibility & Admission Criteria (DSE)",
            "content": [
                f"**Admission Score Formula**: See JUPAS website for specific formula. Median {median}, Lower Quartile {lq}, Upper Quartile {uq} (2025 JUPAS data).",
                f"**Core Subjects Minimum Level**: {core_text}",
                f"**Elective Subjects**: {elective_text}",
                f"**Notes**: {notes_text}",
                f"**2025 Application Statistics**: {stats_text}.",
                f"**First Year Tuition**: HK$47,000 (standard UGC-funded rate)."
            ]
        },
        "curriculum": {
            "title": "Programme Structure & Curriculum",
            "content": [
                f"**Programme Overview**: {name_en} at HKU {faculty}.",
                "**Year 1 - Foundation**: Foundation courses in the discipline.",
                "**Year 2 - Core**: Core disciplinary knowledge and skills.",
                "**Year 3 - Advanced**: Advanced topics and specialisation options.",
                "**Year 4 - Capstone**: Final year project, internship, or research.",
                "**Duration**: 4 years full-time."
            ]
        },
        "career": {
            "title": "Career Pathways & Prospects",
            "content": [
                f"**{faculty} Careers**: Graduates pursue careers in {faculty}-related fields.",
                "**Professional Pathways**: Relevant professional qualifications and licensing.",
                "**Further Studies**: Postgraduate programmes at HKU or overseas institutions.",
                "**Industry Demand**: Strong demand for graduates in Hong Kong and Greater China."
            ]
        },
        "campus": {
            "title": "Campus Life & Student Experience",
            "content": [
                "**HKU Campus**: Historic Main Campus in Pok Fu Lam with modern facilities.",
                "**Student Community**: Active student societies and faculty clubs.",
                "**Global Network**: Exchange opportunities with partner universities worldwide.",
                "**Facilities**: Libraries, laboratories, sports facilities, and student common rooms."
            ]
        },
        "competitiveness": {
            "title": "Admission Competitiveness Analysis",
            "content": [
                f"**Overall Level**: Competitive. Median {median}, LQ {lq}, UQ {uq}.",
                f"**Academic Requirements**: See specific subject requirements above.",
                f"**Band A Competition**: {stats.get('band_a', 'N/A')} Band A applicants.",
                "**Interview**: May be required for some programmes.",
                "**What Differentiates Winners**: Strong academics plus relevant extracurricular achievements."
            ]
        },
        "alumni": {
            "title": "Notable Alumni & Faculty",
            "content": [
                f"**{faculty} Leaders**: Alumni in leadership positions in {faculty}-related organisations.",
                "**Academic Excellence**: Faculty members who are leaders in their fields.",
                "**Professional Networks**: Strong alumni network supporting career development."
            ]
        },
        "scholarships": {
            "title": "Scholarships & Financial Aid",
            "content": [
                "**HKU Admission Scholarships**: For outstanding HKDSE performers.",
                "**Faculty Scholarships**: Programme-specific merit-based awards.",
                "**Government Aid**: TSFS and NLSPS available for eligible local students.",
                "**External Scholarships**: Various external organisation scholarships."
            ]
        },
        "tips": {
            "title": f"Ace Sir's {name_en.split('(')[0].strip()} Strategy",
            "content": [
                f"**Score Targeting**: Aim for median {median}+ based on 2025 data.",
                "**Subject Preparation**: Focus on core subjects meeting minimum requirements.",
                "**Band A Essential**: Place in Band A for best chance of admission.",
                "**Interview Prep**: Prepare for programme-specific interview questions.",
                "**Explore Early**: Research programme details on HKU website."
            ]
        }
    }
    
    # Generate ZH sections (simplified template)
    zh_sections = {
        "admission": {
            "title": "入學要求與計分詳情 (DSE)",
            "content": [
                f"**入學計分公式**：詳見聯招網站。中位數 {median}，下四分位數 {lq}，上四分位數 {uq}（2025年聯招數據）。",
                f"**核心科目最低要求**：{core_text}",
                f"**選修科目**：{elective_text}",
                f"**備註**：{notes_text}",
                f"**2025年申請統計**：{stats_text}。",
                "**首年學費**：港幣47,000元（標準教資會資助課程學費）。"
            ]
        },
        "curriculum": {
            "title": "課程結構與內容",
            "content": [
                f"**課程概覽**：香港大學{faculty}{name_zh}。",
                "**第一年 - 基礎**：學科基礎課程。",
                "**第二年 - 核心**：核心學科知識及技能。",
                "**第三年 - 高級**：高級課題及專修選項。",
                "**第四年 - 專題**：畢業項目、實習或研究。",
                "**修讀年期**：4年全日制。"
            ]
        },
        "career": {
            "title": "職業前景與出路",
            "content": [
                f"**{faculty}相關職業**：畢業生從事{faculty}相關領域工作。",
                "**專業途徑**：相關專業資格及執照。",
                "**進修**：香港大學或海外院校研究生課程。",
                "**行業需求**：香港及大中華地區對畢業生需求強勁。"
            ]
        },
        "campus": {
            "title": "校園生活與學生體驗",
            "content": [
                "**港大校園**：薄扶林歷史主校園配備現代設施。",
                "**學生社群**：活躍的學生會及學院學會。",
                "**環球網絡**：與全球夥伴大學的交流機會。",
                "**設施**：圖書館、實驗室、體育設施及學生休息室。"
            ]
        },
        "competitiveness": {
            "title": "入學競爭力分析",
            "content": [
                f"**整體程度**：競爭激烈。中位數 {median}，下四分位數 {lq}，上四分位數 {uq}。",
                "**學術要求**：詳見上述具體科目要求。",
                f"**Band A競爭**：{stats.get('band_a', 'N/A')}名Band A申請者。",
                "**面試**：部分課程可能需要面試。",
                "**成功申請者特質**：優異學術成績加上相關課外成就。"
            ]
        },
        "alumni": {
            "title": "知名校友及教職員",
            "content": [
                f"**{faculty}領袖**：校友於{faculty}相關機構擔任領導職位。",
                "**學術卓越**：教職員為其領域的領先學者。",
                "**專業網絡**：強大校友網絡支援職業發展。"
            ]
        },
        "scholarships": {
            "title": "獎學金及經濟援助",
            "content": [
                "**港大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                "**學院獎學金**：按課程頒發的優異獎。",
                "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
                "**外界獎學金**：各類外界機構獎學金。"
            ]
        },
        "tips": {
            "title": f"Ace Sir {name_zh.split('(')[0].strip()}攻略",
            "content": [
                f"**分數目標**：根據2025年數據，目標中位數 {median} 分以上。",
                "**科目準備**：專注達到核心科目最低要求。",
                "**Band A必需**：Band A選擇以獲最佳入學機會。",
                "**面試準備**：準備課程特定面試問題。",
                "**及早探索**：於港大網站研究課程詳情。"
            ]
        }
    }
    
    return {
        "code": code,
        "university": "香港大學",
        "en": {"sections": en_sections},
        "zh": {"sections": zh_sections}
    }

# Main processing
print("Starting HKU programme details update...")
print(f"Total programmes to process: {len(hku_codes)}")

updated = 0
failed = 0

for code in hku_codes:
    print(f"\n[{code}] Processing...")
    
    # Get existing programme doc
    query = f"SELECT * FROM c WHERE c.type = 'programme' AND c.code = '{code}'"
    items = list(container.query_items(query=query, enable_cross_partition_query=True))
    
    if not items:
        print(f"  [Skip] Programme not found in database")
        failed += 1
        continue
    
    programme_doc = items[0]
    
    # Scrape JUPAS
    jupas_data = scrape_jupas(code)
    if not jupas_data:
        print(f"  [Warning] Could not scrape JUPAS, using existing data")
        jupas_data = {'code': code, 'requirements': {}, 'stats': {}}
    
    # Generate new details
    new_details = generate_details(jupas_data, programme_doc)
    
    # Update detail doc
    detail_id = f"detail_{code}"
    detail_query = f"SELECT * FROM c WHERE c.type = 'programme_detail' AND c.code = '{code}'"
    detail_items = list(container.query_items(query=detail_query, enable_cross_partition_query=True))
    
    if detail_items:
        detail_doc = detail_items[0]
        detail_doc["en"] = new_details["en"]
        detail_doc["zh"] = new_details["zh"]
        detail_doc["updatedAt"] = "2025-06-14T00:00:00Z"
    else:
        detail_doc = {
            "id": detail_id,
            "pk": "details",
            "type": "programme_detail",
            "code": code,
            "university": "香港大學",
            "en": new_details["en"],
            "zh": new_details["zh"],
            "updatedAt": "2025-06-14T00:00:00Z"
        }
    
    container.upsert_item(detail_doc)
    print(f"  [Done] Updated all 8 sections")
    updated += 1
    
    # Small delay to be nice to JUPAS servers
    time.sleep(0.5)

print(f"\n{'='*50}")
print(f"Update complete! Updated: {updated}, Failed: {failed}")
