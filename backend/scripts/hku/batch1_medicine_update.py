import json, os, sys, re
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
from azure.cosmos import CosmosClient

COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")
COSMOS_DATABASE = os.getenv("AZURE_COSMOS_DATABASE", "aceit")

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database = client.get_database_client(COSMOS_DATABASE)
container = database.get_container_client("jupas_programmes")

# Batch 1: Medicine & Dentistry programmes with verified data from:
# - JUPAS 2025 PDF (scores)
# - JUPAS Website (entry requirements, statistics)
# - HKU Medical Faculty Website (programme features, careers)

programmes_data = {
    "JS6107": {
        "nameEn": "Bachelor of Dental Surgery",
        "nameZh": "牙醫學士",
        "faculty": "牙醫學院",
        "median": 50, "band_a": 47, "uq": 48,
        "category": "medicine",
        "requirements": {
            "core": "Chinese Language 3, English Language 4, Mathematics 2, Citizenship Attained",
            "electives": "ANY 1 SUBJECT at Level 3 (excluding Applied Learning), PLUS Biology OR Chemistry at Level 3",
            "notes": "Good working knowledge of Cantonese required. Score calculation considers Category A subjects and M1/M2 only."
        },
        "stats": {"band_a": "N/A", "total": "N/A", "offers": "N/A"},
        "features": [
            "The BDS programme trains students to become competent dental practitioners with strong clinical skills and professional ethics.",
            "Comprehensive curriculum covering basic medical sciences, dental sciences, and extensive clinical training.",
            "State-of-the-art dental simulation laboratories and clinics for hands-on learning.",
            "Clinical training at the Prince Philip Dental Hospital and community dental service settings."
        ],
        "careers": [
            "Registration with the Dental Council of Hong Kong upon graduation.",
            "Dental practitioner in private practice or public dental service.",
            "Specialist training in orthodontics, oral surgery, periodontology, or paediatric dentistry.",
            "Academic and research positions in dental schools."
        ],
        "interview": "Required. Assess manual dexterity, communication skills, and motivation for dentistry.",
        "duration": "6 years"
    },
    "JS6418": {
        "nameEn": "Bachelor of Nursing (Advanced Leadership Track)",
        "nameZh": "護理學學士（菁英領袖培育專修組別）",
        "faculty": "醫學院",
        "median": 37, "band_a": 36, "uq": 37,
        "category": "medicine",
        "requirements": {
            "core": "Chinese Language 3, English Language 3, Mathematics 2, Citizenship Attained",
            "electives": "ANY 2 SUBJECTS at Level 3 (excluding Applied Learning, Other Language)",
            "notes": "Good working knowledge of Cantonese required. Score calculation considers Category A subjects and may include M1/M2 or Category C subject whichever is higher."
        },
        "stats": {"band_a": "N/A", "total": "N/A", "offers": "N/A"},
        "features": [
            "Enhanced leadership training track within the Bachelor of Nursing programme.",
            "Additional mentorship, research opportunities, and leadership development activities.",
            "Same nursing curriculum as BNurs (JS6468) with added leadership components.",
            "Designed for students with demonstrated leadership potential and academic excellence."
        ],
        "careers": [
            "Registered Nurse with enhanced leadership capabilities.",
            "Nurse manager and leadership roles in healthcare settings.",
            "Advanced practice nursing and specialist nursing pathways.",
            "Healthcare administration and policy development."
        ],
        "interview": "Required for shortlisted applicants.",
        "duration": "5 years"
    },
    "JS6468": {
        "nameEn": "Bachelor of Nursing",
        "nameZh": "護理學學士",
        "faculty": "醫學院",
        "median": 28, "band_a": 26, "uq": 27,
        "category": "medicine",
        "requirements": {
            "core": "Chinese Language 3, English Language 3, Mathematics 2, Citizenship Attained",
            "electives": "ANY 2 SUBJECTS at Level 3 (excluding Applied Learning, Other Language) OR ANY 1 SUBJECT at Level 3 + M1/M2 at Level 3",
            "notes": "Good working knowledge of Cantonese required. Score calculation considers Category A subjects and may include M1/M2 or Category C subject whichever is higher."
        },
        "stats": {"band_a": "952", "total": "3985", "offers": "220"},
        "features": [
            "Cultivating highly-trained nurses with compassionate care skills.",
            "Broad spectrum of clinical and simulation training in a supportive environment.",
            "Inter-professional and problem-based learning approach.",
            "Global vision developed through life enrichment learning programmes beyond Hong Kong.",
            "44 courses over 5 years: 26 Core Courses and 7 Practicum Courses."
        ],
        "careers": [
            "Registration as registered nurses with the Nursing Council of Hong Kong.",
            "Hospital nursing in medical, surgical, paediatric, and critical care wards.",
            "Community nursing, public health nursing, and home care services.",
            "Advanced practice nursing and nurse specialist roles with further training."
        ],
        "interview": "Required for shortlisted applicants.",
        "duration": "5 years"
    },
    "JS6482": {
        "nameEn": "Bachelor of Chinese Medicine",
        "nameZh": "中醫學學士",
        "faculty": "醫學院",
        "median": 34, "band_a": 31, "uq": 33,
        "category": "medicine",
        "requirements": {
            "core": "Chinese Language 3, English Language 3, Mathematics 2, Citizenship Attained",
            "electives": "ANY 1 SUBJECT at Level 3 (excluding Applied Learning), PLUS Biology OR Chemistry OR Physics at Level 3",
            "notes": "Good working knowledge of Cantonese required. Score calculation considers Category A subjects and M1/M2 only."
        },
        "stats": {"band_a": "N/A", "total": "N/A", "offers": "N/A"},
        "features": [
            "Integrates traditional Chinese medicine theory with modern biomedical sciences.",
            "Comprehensive training in acupuncture, herbal medicine, and tui na.",
            "Clinical training at the School of Chinese Medicine clinics and affiliated hospitals.",
            "Research opportunities in evidence-based Chinese medicine."
        ],
        "careers": [
            "Registration with the Chinese Medicine Council of Hong Kong.",
            "Chinese medicine practitioner in private clinics or public Chinese medicine centres.",
            "Acupuncture and herbal medicine specialist.",
            "Research and teaching positions in Chinese medicine institutions."
        ],
        "interview": "Required for shortlisted applicants.",
        "duration": "6 years"
    },
    "JS6494": {
        "nameEn": "Bachelor of Pharmacy",
        "nameZh": "藥劑學學士",
        "faculty": "醫學院",
        "median": 41, "band_a": 38, "uq": 39,
        "category": "medicine",
        "requirements": {
            "core": "Chinese Language 3, English Language 3, Mathematics 2, Citizenship Attained",
            "electives": "ANY 1 SUBJECT at Level 3 (excluding Applied Learning), PLUS Chemistry at Level 3",
            "notes": "Score calculation considers Category A subjects and M1/M2 only."
        },
        "stats": {"band_a": "N/A", "total": "N/A", "offers": "N/A"},
        "features": [
            "Comprehensive training in pharmaceutical sciences, pharmacology, and clinical pharmacy.",
            "Extensive laboratory training in drug formulation and analysis.",
            "Clinical pharmacy training in hospital and community settings.",
            "Research opportunities in drug development and pharmacotherapy."
        ],
        "careers": [
            "Registration as a pharmacist with the Pharmacy and Poisons Board of Hong Kong.",
            "Hospital pharmacist in public and private hospitals.",
            "Community pharmacist in retail pharmacies.",
            "Pharmaceutical industry in drug development, quality control, and regulatory affairs."
        ],
        "interview": "Required for shortlisted applicants.",
        "duration": "4 years"
    },
    "JS6949": {
        "nameEn": "Bachelor of Biomedical Sciences",
        "nameZh": "生物醫學學士",
        "faculty": "醫學院",
        "median": 41, "band_a": 39, "uq": 40,
        "category": "science",
        "requirements": {
            "core": "Chinese Language 3, English Language 3, Mathematics 2, Citizenship Attained",
            "electives": "ANY 2 SUBJECTS at Level 3 (excluding Applied Learning, Other Language)",
            "notes": "Score calculation considers Category A subjects and M1/M2 only."
        },
        "stats": {"band_a": "N/A", "total": "N/A", "offers": "N/A"},
        "features": [
            "Interdisciplinary programme covering biology, chemistry, and medical sciences.",
            "Strong foundation for postgraduate studies in medicine, dentistry, and research.",
            "Laboratory training in molecular biology, genetics, and physiology.",
            "Research opportunities in biomedical and translational research."
        ],
        "careers": [
            "Postgraduate studies in medicine (MBBS), dentistry (BDS), or research (MPhil/PhD).",
            "Research scientist in universities, hospitals, and biotechnology companies.",
            "Medical laboratory technologist and diagnostic services.",
            "Pharmaceutical and biotechnology industry roles."
        ],
        "interview": "May be required for shortlisted applicants.",
        "duration": "4 years"
    }
}

def generate_details(code, data):
    """Generate 8-section details following JS1001 golden standard"""
    name_en = data["nameEn"]
    name_zh = data["nameZh"]
    faculty = data["faculty"]
    median = data["median"]
    lq = data["band_a"]
    uq = data["uq"]
    duration = data["duration"]
    
    req = data["requirements"]
    stats = data["stats"]
    features = data["features"]
    careers = data["careers"]
    interview = data["interview"]
    
    stats_text = f"Band A {stats['band_a']} applicants, Total {stats['total']} applicants, {stats['offers']} offers" if stats['band_a'] != 'N/A' else 'Statistics not available'
    
    en_sections = {
        "admission": {
            "title": "Eligibility & Admission Criteria (DSE)",
            "content": [
                f"**Admission Score Formula**: See JUPAS website for specific formula. Median {median}, Lower Quartile {lq}, Upper Quartile {uq} (2025 JUPAS data).",
                f"**Core Subjects Minimum Level**: {req['core']}.",
                f"**Elective Subjects**: {req['electives']}.",
                f"**Notes**: {req['notes']}",
                f"**Interview**: {interview}",
                f"**2025 Application Statistics**: {stats_text}.",
                f"**Duration**: {duration} full-time.",
                "**First Year Tuition**: HK$47,000 (UGC-funded)."
            ]
        },
        "curriculum": {
            "title": "Programme Structure & Curriculum",
            "content": [f"**{f}**" for f in features] + [f"**Duration**: {duration} full-time."]
        },
        "career": {
            "title": "Career Pathways & Prospects",
            "content": [f"**{c}**" for c in careers]
        },
        "campus": {
            "title": "Campus Life & Student Experience",
            "content": [
                "**HKUMed Campus**: Located at 21 Sassoon Road, Pok Fu Lam with state-of-the-art facilities.",
                "**Teaching Facilities**: Modern laboratories, simulation centres, and clinical training venues.",
                "**Student Support**: Comprehensive wellness and engagement programmes.",
                "**Global Exposure**: Overseas electives and exchange opportunities.",
                "**Scholarships**: Numerous merit-based and need-based awards available."
            ]
        },
        "competitiveness": {
            "title": "Admission Competitiveness Analysis",
            "content": [
                f"**Overall Level**: High to Very High (★★★★☆). Median {median}, LQ {lq}, UQ {uq}.",
                "**Academic Requirements**: Strong performance in sciences and English essential.",
                f"**Band A Competition**: {stats['band_a']} Band A applicants for {stats['offers']} places." if stats['band_a'] != 'N/A' else "**Band A Competition**: Competitive. Band A placement strongly recommended.",
                f"**Interview**: {interview}",
                "**What Differentiates Winners**: Strong academics, communication skills, and demonstrated commitment to healthcare."
            ]
        },
        "alumni": {
            "title": "Notable Alumni & Faculty",
            "content": [
                f"**{faculty} Leaders**: Graduates in leadership positions across Hong Kong healthcare system.",
                "**Research Excellence**: Faculty members conducting world-class biomedical and clinical research.",
                "**Professional Networks**: Strong alumni network supporting career development."
            ]
        },
        "scholarships": {
            "title": "Scholarships & Financial Aid",
            "content": [
                "**HKU Admission Scholarships**: For outstanding HKDSE performers.",
                "**HKUMed Scholarships**: Faculty-specific merit-based awards.",
                "**Government Aid**: TSFS and NLSPS available for eligible local students.",
                "**External Awards**: Various professional body and charitable trust scholarships."
            ]
        },
        "tips": {
            "title": f"Ace Sir's {name_en.split('(')[0].strip()} Strategy",
            "content": [
                f"**Score Targeting**: Aim for median {median}+ based on 2025 data.",
                "**Science Focus**: Excel in Biology and Chemistry for healthcare programmes.",
                "**Band A Essential**: Place in Band A for best chance of admission.",
                "**Interview Prep**: Prepare for programme-specific questions and healthcare ethics scenarios.",
                "**Gain Experience**: Volunteer in healthcare settings to demonstrate commitment."
            ]
        }
    }
    
    zh_sections = {
        "admission": {
            "title": "入學要求與計分詳情 (DSE)",
            "content": [
                f"**入學計分公式**：詳見聯招網站。中位數 {median}，下四分位數 {lq}，上四分位數 {uq}（2025年聯招數據）。",
                f"**核心科目最低要求**：{req['core']}。",
                f"**選修科目**：{req['electives']}。",
                f"**備註**：{req['notes']}",
                f"**面試**：{interview}",
                f"**2025年申請統計**：{stats_text}。",
                f"**修讀年期**：{duration}全日制。",
                "**首年學費**：港幣47,000元（教資會資助）。"
            ]
        },
        "curriculum": {
            "title": "課程結構與內容",
            "content": [f"**{f}**" for f in features] + [f"**修讀年期**：{duration}全日制。"]
        },
        "career": {
            "title": "職業前景與出路",
            "content": [f"**{c}**" for c in careers]
        },
        "campus": {
            "title": "校園生活與學生體驗",
            "content": [
                "**港大醫學院校園**：位於薄扶林沙宣道21號，配備最先進設施。",
                "**教學設施**：現代化實驗室、模擬中心及臨床培訓場地。",
                "**學生支援**：全面健康及參與計劃。",
                "**環球視野**：海外選修及交流機會。",
                "**獎學金**：眾多優異及經濟需要獎項。"
            ]
        },
        "competitiveness": {
            "title": "入學競爭力分析",
            "content": [
                f"**整體程度**：高至極高（★★★★☆）。中位數 {median}，下四分位數 {lq}，上四分位數 {uq}。",
                "**學術要求**：理科及英文表現優異至關重要。",
                f"**Band A競爭**：{stats['band_a']}名Band A申請者競爭{stats['offers']}個學額。" if stats['band_a'] != 'N/A' else "**Band A競爭**：競爭激烈。強烈建議Band A選擇。",
                f"**面試**：{interview}",
                "**成功申請者特質**：優異學術成績、溝通技巧及展示對醫療的承擔。"
            ]
        },
        "alumni": {
            "title": "知名校友及教職員",
            "content": [
                f"**{faculty}領袖**：畢業生於香港醫療系統擔任領導職位。",
                "**研究卓越**：教職員進行世界級生物醫學及臨床研究。",
                "**專業網絡**：強大校友網絡支援職業發展。"
            ]
        },
        "scholarships": {
            "title": "獎學金及經濟援助",
            "content": [
                "**港大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                "**港大醫學院獎學金**：學院特定的優異獎。",
                "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
                "**外界獎項**：各類專業團體及慈善信託獎學金。"
            ]
        },
        "tips": {
            "title": f"Ace Sir {name_zh.split('(')[0].strip()}攻略",
            "content": [
                f"**分數目標**：根據2025年數據，目標中位數 {median} 分以上。",
                "**理科專注**：醫療課程需於生物及化學表現卓越。",
                "**Band A必需**：Band A選擇以獲最佳入學機會。",
                "**面試準備**：準備課程特定問題及醫療道德情境。",
                "**獲取經驗**：於醫療機構義工以展示承擔。"
            ]
        }
    }
    
    return {"en": {"sections": en_sections}, "zh": {"sections": zh_sections}}

# Process all Batch 1 programmes
updated = 0
for code, data in programmes_data.items():
    print(f"\n[{code}] Processing {data['nameEn']}...")
    
    # Update programme doc
    query = f"SELECT * FROM c WHERE c.type = 'programme' AND c.code = '{code}'"
    items = list(container.query_items(query=query, enable_cross_partition_query=True))
    
    if items:
        doc = items[0]
        doc["median"] = data["median"]
        doc["band_a"] = data["band_a"]
        doc["uq"] = data["uq"]
        doc["nameEn"] = data["nameEn"]
        doc["nameZh"] = data["nameZh"]
        doc["faculty"] = data["faculty"]
        doc["updatedAt"] = "2025-06-14T00:00:00Z"
        container.upsert_item(doc)
    else:
        # Create new programme doc
        container.upsert_item({
            "id": f"prog_{code}", "pk": "programmes", "type": "programme",
            "code": code, "nameEn": data["nameEn"], "nameZh": data["nameZh"],
            "name": data["nameEn"], "university": "香港大學", "faculty": data["faculty"],
            "median": data["median"], "band_a": data["band_a"], "uq": data["uq"],
            "category": data["category"], "updatedAt": "2025-06-14T00:00:00Z"
        })
    
    # Update detail doc
    details = generate_details(code, data)
    detail_query = f"SELECT * FROM c WHERE c.type = 'programme_detail' AND c.code = '{code}'"
    detail_items = list(container.query_items(query=detail_query, enable_cross_partition_query=True))
    
    if detail_items:
        detail_doc = detail_items[0]
        detail_doc["en"] = details["en"]
        detail_doc["zh"] = details["zh"]
        detail_doc["updatedAt"] = "2025-06-14T00:00:00Z"
    else:
        detail_doc = {
            "id": f"detail_{code}", "pk": "details", "type": "programme_detail",
            "code": code, "university": "香港大學",
            "en": details["en"], "zh": details["zh"],
            "updatedAt": "2025-06-14T00:00:00Z"
        }
    
    container.upsert_item(detail_doc)
    print(f"  [Done] Updated all 8 sections (EN + ZH)")
    updated += 1

print(f"\n{'='*50}")
print(f"Batch 1 complete! Updated: {updated} programmes")
