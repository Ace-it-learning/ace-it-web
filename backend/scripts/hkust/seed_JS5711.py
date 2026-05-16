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

# JS5711 - BSc in Innovation, Design and Technology / 理學士（創新設計與科技）
programme = {
    "code": "JS5711",
    "nameEn": "BSc in Innovation, Design and Technology",
    "nameZh": "理學士（創新設計與科技）",
    "name": "BSc in Innovation, Design and Technology",
    "university": "香港科技大學",
    "faculty": "工學院",
    "median": 29,
    "band_a": 32,
    "category": "engineering"
}

details = {
    "code": "JS5711",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: MODERATELY COMPETITIVE. Best 5 typically 29-32 points.",
                    "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Physics or Design and Applied Technology (DAT) at Level 4+ is highly preferred. Mathematics Extended Part (M1/M2) is beneficial.",
                    "**Interview**: May be required. Assesses creativity, design thinking, and innovation potential.",
                    "**Non-Academic Factors**: Design portfolio, maker projects, robotics experience, and creative problem-solving skills are highly valued."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Design thinking, prototyping, programming, electronics, and materials science.",
                    "**Year 2 - Core IDT**: Product design, user experience (UX), mechanical design, and embedded systems.",
                    "**Year 3 - Advanced Topics**: IoT, robotics, AI hardware, sustainable design, and entrepreneurship.",
                    "**Year 4 - Capstone & Startup**: Final year innovation project with potential for commercialization. Startup incubator support.",
                    "**Interdisciplinary**: Combines engineering, design, business, and entrepreneurship for holistic innovation education.",
                    "**Hands-On Learning**: Extensive workshop time with 3D printing, laser cutting, CNC, and electronics fabrication."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Product Design**: Product designer and UX designer at technology companies and design consultancies.",
                    "**Hardware Engineering**: Hardware engineer and IoT developer at consumer electronics and smart device companies.",
                    "**Innovation Consulting**: Design consultant and innovation strategist at IDEO, Frog Design, and local consultancies.",
                    "**Entrepreneurship**: Founder of hardware startups, design studios, and technology ventures.",
                    "**Manufacturing**: Design engineer and manufacturing engineer at product companies.",
                    "**Graduate Studies**: MSc/PhD in design, engineering, or innovation management at top universities."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Maker Space**: Fully equipped fabrication lab with 3D printers, laser cutters, CNC machines, and electronics workbenches.",
                    "**Design Studios**: Collaborative design studios with sketching, modeling, and presentation facilities.",
                    "**Startup Incubator**: Access to HKUST Entrepreneurship Center for student ventures and prototype development.",
                    "**Industry Partnerships**: Collaborations with hardware companies, design firms, and manufacturing partners.",
                    "**Student Community**: Active IDT Society, maker clubs, and design competition teams."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate to High (★★★☆☆). Growing interest in innovation and design.",
                    "**Academic Requirements**: Best 5 around 29-32. Physics or DAT background is advantageous.",
                    "**Band A Competition**: Moderate. Band A placement improves chances.",
                    "**Interview Weighting**: Moderate. Portfolio and creative thinking may be assessed.",
                    "**What Differentiates Winners**: Creative portfolio plus strong STEM foundation with maker mindset.",
                    "**Trend**: Increasing demand as Hong Kong pushes for innovation and technology development."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Product Designers**: Alumni at Apple, Dyson, and leading design-led companies.",
                    "**Hardware Entrepreneurs**: Founders of successful consumer electronics and IoT startups.",
                    "**Innovation Consultants**: Design thinking consultants helping corporations innovate.",
                    "**UX Leaders**: Graduates leading user experience design at tech companies.",
                    "**Faculty Excellence**: HKUST IDT faculty includes award-winning designers and engineers with industry experience."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers.",
                    "**Innovation Awards**: Scholarships for creative and entrepreneurial potential.",
                    "**Maker Grants**: Funding for student projects and prototype development.",
                    "**Industry-Sponsored Scholarships**: From technology and design companies.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Innovation, Design & Technology Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 30+. Physics or DAT at Level 4+ is helpful.",
                    "**Build a Portfolio**: Document your design projects, maker builds, and creative work.",
                    "**Learn Basic Tools**: Familiarize yourself with CAD software, basic electronics, and 3D modeling.",
                    "**Think Like a Designer**: Practice design thinking methodology - empathize, define, ideate, prototype, test.",
                    "**Start Making**: Build something! Physical projects demonstrate passion and capability."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：中等競爭。最佳五科通常29-32分。",
                    "**核心科目**：英文（Level 3+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：物理或設計與應用科技（DAT）達4級或以上高度優先考慮。數學延伸部分（M1/M2）有益。",
                    "**面試**：可能需要。評估創意、設計思維及創新潛能。",
                    "**非學術因素**：設計作品集、創客項目、機械人經驗及創意解難技能極受重視。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：設計思維、原型設計、編程、電子學及材料科學。",
                    "**第二年 - 創新設計與科技核心**：產品設計、用戶體驗（UX）、機械設計及嵌入式系統。",
                    "**第三年 - 高級課題**：物聯網、機械人、人工智能硬件、可持續設計及創業。",
                    "**第四年 - 專題及初創**：具商業化潛能的畢業年創新項目。初創孵化器支援。",
                    "**跨學科**：結合工程、設計、商業及創業進行整全創新教育。",
                    "**實踐學習**：使用3D打印、激光切割、數控及電子製作的廣泛工作坊時間。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**產品設計**：於科技公司及設計顧問公司擔任產品設計師及用戶體驗設計師。",
                    "**硬件工程**：於消費電子及智能設備公司擔任硬件工程師及物聯網開發人員。",
                    "**創新顧問**：於IDEO、Frog Design及本地顧問公司擔任設計顧問及創新策略師。",
                    "**創業**：硬件初創企業、設計工作室及科技企業的創辦人。",
                    "**製造業**：於產品公司擔任設計工程師及製造工程師。",
                    "**研究生課程**：於頂尖大學攻讀設計、工程或創新管理理學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**創客空間**：配備3D打印機、激光切割機、數控機床及電子工作台的全面製作實驗室。",
                    "**設計工作室**：具素描、建模及演示設施的協作設計工作室。",
                    "**初創孵化器**：可使用科大創業中心進行學生企業及原型開發。",
                    "**產業夥伴關係**：與硬件公司、設計公司及製造夥伴合作。",
                    "**學生社群**：活躍的創新設計與科技學會、創客學會及設計競賽隊伍。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中至高（★★★☆☆）。創新及設計領域興趣持續增長。",
                    "**學術要求**：最佳五科約29-32分。物理或設計與應用科技背景有優勢。",
                    "**Band A競爭**：中等。Band A選擇可提升機會。",
                    "**面試比重**：中等。可能評估作品集及創意思維。",
                    "**成功申請者特質**：創意作品集加上強大STEM基礎及創客思維。",
                    "**趨勢**：隨著香港推動創新科技發展，需求持續增加。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**產品設計師**：校友於蘋果、戴森及領先設計主導公司。",
                    "**硬件創業家**：成功消費電子及物聯網初創企業的創辦人。",
                    "**創新顧問**：協助企業創新的設計思維顧問。",
                    "**用戶體驗領袖**：畢業生於科技公司領導用戶體驗設計。",
                    "**教職員卓越**：科大創新設計與科技教職員包括具備業界經驗的獲獎設計師及工程師。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**創新獎項**：創意及創業潛能獎學金。",
                    "**創客資助**：學生項目及原型開發資金。",
                    "**業界贊助獎學金**：科技及設計公司的獎學金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大創新設計與科技攻略",
                "content": [
                    "**分數目標**：最佳五科目標30分以上。物理或設計與應用科技達4級有幫助。",
                    "**建立作品集**：記錄你的設計項目、創客作品及創意工作。",
                    "**學習基本工具**：熟悉電腦輔助設計軟件、基本電子學及3D建模。",
                    "**像設計師般思考**：練習設計思維方法 - 同理心、定義、構思、原型、測試。",
                    "**開始製作**：建造一些東西！實體項目展示熱誠及能力。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
