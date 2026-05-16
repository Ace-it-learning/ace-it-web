import json, os, sys
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

# JS5811 - BSc in Biotechnology and Business / 理學士（生物科技及商學）
programme = {
    "code": "JS5811",
    "nameEn": "BSc in Biotechnology and Business",
    "nameZh": "理學士（生物科技及商學）",
    "name": "BSc in Biotechnology and Business",
    "university": "香港科技大學",
    "faculty": "理學院",
    "median": 30,
    "band_a": 33,
    "category": "science"
}

details = {
    "code": "JS5811",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Best 5 typically 30-33 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Biology AND Chemistry at Level 4+ are highly preferred. Mathematics Extended Part (M1/M2) is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Science project experience, interest in biotech industry, and business awareness strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Cell biology, biochemistry, genetics, business fundamentals, and accounting.",
                    "**Year 2 - Core BIBU**: Molecular biology, microbiology, organic chemistry, marketing, and finance.",
                    "**Year 3 - Advanced Topics**: Bioprocessing, drug development, bioinformatics, entrepreneurship, and strategic management.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in biotech R&D or biotech business. Complete industry project.",
                    "**Dual Focus**: Unique programme combining deep biotechnology training with solid business education.",
                    "**Industry Exposure**: Internships at biotech companies, pharmaceutical firms, and venture capital funds."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Biotech Industry**: Business development, product management, and marketing at biotech and pharmaceutical companies.",
                    "**Pharmaceuticals**: Commercial roles in drug development, clinical trials management, and regulatory affairs.",
                    "**Healthcare Consulting**: Healthcare and life sciences consulting at McKinsey, BCG, and specialized firms.",
                    "**Venture Capital**: Analyst and associate roles at VC funds focusing on biotech and healthcare investments.",
                    "**Entrepreneurship**: Founder of biotech startups combining scientific innovation with business acumen.",
                    "**Graduate Studies**: MSc/PhD in biotechnology, MBA, or combined MD-MBA programmes."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Biotech Labs**: State-of-the-art molecular biology, cell culture, and bioprocessing laboratories.",
                    "**Business Facilities**: Access to HKUST Business School resources, case rooms, and entrepreneurship programs.",
                    "**Industry Connections**: Partnerships with GenScript, WuXi AppTec, and local biotech startups.",
                    "**Research Opportunities**: Undergraduate research in HKUST's biotechnology and life science research centers.",
                    "**Student Community**: Active BIBU Society bridging science and business student communities."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Unique programme attracting science and business oriented students.",
                    "**Academic Requirements**: Best 5 around 30-33. Biology and Chemistry at Level 5 are important.",
                    "**Band A Competition**: Competitive. Band A placement recommended.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong science grades plus demonstrated interest in business applications of biotechnology.",
                    "**Trend**: Growing demand as biotech industry expands and needs business-savvy scientists."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Biotech Business Leaders**: Alumni in business development and strategy at pharmaceutical and biotech firms.",
                    "**Healthcare Consultants**: Graduates advising on biotech strategy and market access.",
                    "**VC Professionals**: Alumni evaluating biotech investments at venture capital firms.",
                    "**Entrepreneurs**: Founders of successful biotech and health-tech startups.",
                    "**Faculty Excellence**: HKUST BIBU faculty includes leading biologists and business professors collaborating on industry-relevant research."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong science grades.",
                    "**BIBU Excellence Awards**: Merit-based scholarships for students excelling in both science and business.",
                    "**Industry-Sponsored Scholarships**: From biotech and pharmaceutical companies.",
                    "**Research Grants**: Funding for undergraduate biotechnology research projects.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Biotechnology & Business Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 31+. Biology and Chemistry at Level 5 are crucial.",
                    "**Master Science Fundamentals**: Strong biology and chemistry foundation is essential for the biotechnology curriculum.",
                    "**Understand Business Basics**: Read business cases and understand how biotech companies operate commercially.",
                    "**Follow Biotech Industry**: Stay informed about drug approvals, biotech IPOs, and industry trends.",
                    "**Develop Both Sides**: Balance scientific rigor with business communication and presentation skills."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。最佳五科通常30-33分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：生物及化學達4級或以上高度優先考慮。數學延伸部分（M1/M2）有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：科學項目經驗、對生物科技行業的興趣及商業意識可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：細胞生物學、生物化學、遺傳學、商業基礎及會計。",
                    "**第二年 - 生物科技及商學核心**：分子生物學、微生物學、有機化學、市場學及金融。",
                    "**第三年 - 高級課題**：生物加工、藥物開發、生物資訊學、創業及策略管理。",
                    "**第四年 - 專修及專題**：選擇生物科技研發或生物科技商業專修。完成產業項目。",
                    "**雙重專注**：結合深入生物科技培訓與穩固商業教育的獨特課程。",
                    "**產業接觸**：於生物科技公司、製藥公司及創投基金的實習。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**生物科技行業**：於生物科技公司及製藥公司擔任業務發展、產品管理及市場學。",
                    "**製藥業**：藥物開發、臨床試驗管理及監管事務的商業職位。",
                    "**醫療保健顧問**：於麥肯錫、波士頓諮詢及專門公司從事醫療保健及生命科學顧問。",
                    "**創投**：於專注生物科技及醫療保健投資的創投基金擔任分析師及經理。",
                    "**創業**：結合科學創新與商業觸覺的生物科技初創企業創辦人。",
                    "**研究生課程**：生物科技理學碩士/博士、工商管理碩士或聯合醫學博士-工商管理碩士課程。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**生物科技實驗室**：最先進的分子生物學、細胞培養及生物加工實驗室。",
                    "**商業設施**：可使用科大商學院資源、案例房間及創業項目。",
                    "**產業聯繫**：與金斯瑞、藥明康德及本地生物科技初創企業合作。",
                    "**研究機會**：於科大的生物技術及生命科學研究中心進行本科生研究。",
                    "**學生社群**：活躍的生物科技及商學學會，連接科學及商業學生社群。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。吸引科學及商業導向學生的獨特課程。",
                    "**學術要求**：最佳五科約30-33分。生物及化學達5級很重要。",
                    "**Band A競爭**：競爭激烈。建議Band A選擇。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異科學成績加上對生物科技商業應用的展示興趣。",
                    "**趨勢**：隨著生物科技行業擴展及需要具商業觸覺的科學家，需求持續增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**生物科技商業領袖**：校友於製藥及生物科技公司擔任業務發展及策略。",
                    "**醫療保健顧問**：就生物科技策略及市場准入提供建議的畢業生。",
                    "**創投專業人士**：校友於創投公司評估生物科技投資。",
                    "**創業家**：成功生物科技及健康科技初創企業的創辦人。",
                    "**教職員卓越**：科大生物科技及商學教職員包括合作進行業界相關研究的領先生物學家及商學教授。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且科學成績優異的學生。",
                    "**生物科技及商學卓越獎**：按科學及商業兩方面卓越表現頒發的優異獎。",
                    "**業界贊助獎學金**：生物科技及製藥公司的獎學金。",
                    "**研究資助**：本科生生物科技研究項目資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大生物科技及商學攻略",
                "content": [
                    "**分數目標**：最佳五科目標31分以上。生物及化學達5級至關重要。",
                    "**掌握科學基礎**：強大的生物及化學基礎對生物科技課程至關重要。",
                    "**了解商業基礎**：閱讀商業案例及了解生物科技公司如何商業運作。",
                    "**追蹤生物科技行業**：了解藥物審批、生物科技上市及行業趨勢。",
                    "**發展兩方面**：平衡科學嚴謹性與商業溝通及演講技巧。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
