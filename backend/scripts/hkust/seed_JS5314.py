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

# JS5314 - BBA in Information Systems / 工商管理學士（資訊系統學）
programme = {
    "code": "JS5314",
    "nameEn": "BBA in Information Systems",
    "nameZh": "工商管理學士（資訊系統學）",
    "name": "BBA in Information Systems",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 31,
    "band_a": 34,
    "category": "business"
}

details = {
    "code": "JS5314",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Best 5 typically 31-34 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is highly recommended. Information and Communication Technology (ICT) at Level 4+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Programming experience, tech project work, hackathon participation, and interest in business-technology intersection strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Programming, database management, business fundamentals, and information systems introduction.",
                    "**Year 2 - Core IS**: Systems analysis, software engineering, data analytics, network management, and e-commerce.",
                    "**Year 3 - Advanced Topics**: Enterprise systems, cybersecurity, cloud computing, AI in business, and IT project management.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in FinTech, data analytics, or digital transformation. Complete industry project.",
                    "**Business-Technology Bridge**: Unique blend of business acumen and technical skills for digital business leadership.",
                    "**Practical Training**: Hands-on projects with real companies, coding bootcamps, and industry certification preparation."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Technology Consulting**: IT strategy, digital transformation, and systems implementation at Accenture, Deloitte Digital, and IBM.",
                    "**Product Management**: Product manager for software products, SaaS platforms, and digital services at tech companies.",
                    "**Data Analytics**: Business intelligence analyst, data analyst, and analytics consultant leveraging technical and business skills.",
                    "**FinTech**: Product development, platform operations, and strategy at digital banks, payment companies, and insurtech firms.",
                    "**Corporate IT**: IT manager, systems analyst, and digital transformation lead at multinational corporations.",
                    "**Entrepreneurship**: Tech startup founder combining business strategy with technology execution."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Technology Labs**: Dedicated IS labs with cloud platforms, database servers, and development environments.",
                    "**Research Centers**: HKUST Center for Business Analytics and Digital Innovation.",
                    "**Industry Projects**: Real consulting projects with companies seeking digital transformation solutions.",
                    "**Certification Support**: Preparation for AWS, Azure, Salesforce, and other industry certifications.",
                    "**Student Community**: Active IS Society, coding clubs, and tech entrepreneurship groups."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Growing demand due to digital transformation trends.",
                    "**Academic Requirements**: Best 5 around 31-34. Strong mathematics performance is important.",
                    "**Band A Competition**: Competitive. Band A placement recommended.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong mathematics plus demonstrated interest in both business and technology.",
                    "**Trend**: Rapidly increasing demand as all industries undergo digital transformation."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Tech Consultants**: Alumni at top consulting firms leading digital transformation projects.",
                    "**Product Leaders**: Graduates as product managers at Google, Meta, and leading tech companies.",
                    "**FinTech Pioneers**: Alumni founding and leading digital banking and payment startups.",
                    "**Corporate Innovators**: Digital transformation leaders at banks, retailers, and logistics companies.",
                    "**Faculty Excellence**: HKUST IS faculty includes researchers in business analytics, digital platforms, and information economics."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong academic records.",
                    "**IS Excellence Awards**: Merit-based scholarships for students with technology aptitude.",
                    "**Industry-Sponsored Scholarships**: From tech companies and consulting firms.",
                    "**Certification Grants**: Funding for industry certification exams.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Information Systems Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 32+. Mathematics at Level 5 is highly recommended.",
                    "**Learn to Code**: Python, SQL, and JavaScript are essential. Start building projects before university.",
                    "**Understand Business**: Read business cases and understand how technology drives business value.",
                    "**Explore Cloud Platforms**: Familiarize yourself with AWS, Azure, or Google Cloud basics.",
                    "**Build a Tech Portfolio**: Create apps, websites, or data analysis projects to demonstrate skills."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。最佳五科通常31-34分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上高度建議。資訊及通訊科技（ICT）達4級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：編程經驗、科技項目工作、黑客松參與及對商業與科技交叉點的興趣可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：編程、數據庫管理、商業基礎及資訊系統導論。",
                    "**第二年 - 資訊系統核心**：系統分析、軟件工程、數據分析、網絡管理及電子商務。",
                    "**第三年 - 高級課題**：企業系統、網絡安全、雲端運算、商業人工智能及資訊科技項目管理。",
                    "**第四年 - 專修及專題**：選擇金融科技、數據分析或數碼轉型專修。完成產業項目。",
                    "**商業與科技橋樑**：商業觸覺與技術技能的獨特融合，培養數碼商業領導力。",
                    "**實踐培訓**：與真實公司的動手項目、編程訓練營及業界認證準備。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**科技顧問**：於埃森哲、德勤數碼及IBM擔任資訊科技策略、數碼轉型及系統實施。",
                    "**產品管理**：於科技公司擔任軟件產品、SaaS平台及數碼服務產品經理。",
                    "**數據分析**：利用技術及商業技能擔任商業智能分析師、數據分析師及分析顧問。",
                    "**金融科技**：於數碼銀行、支付公司及保險科技公司擔任產品開發、平台營運及策略。",
                    "**企業資訊科技**：於跨國企業擔任資訊科技經理、系統分析師及數碼轉型主管。",
                    "**創業**：結合商業策略與科技執行的科技初創企業創辦人。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**科技實驗室**：配備雲端平台、數據庫伺服器及開發環境的專門資訊系統實驗室。",
                    "**研究中心**：科大商業分析及數碼創新中心。",
                    "**產業項目**：與尋求數碼轉型解決方案的公司的真實顧問項目。",
                    "**認證支援**：AWS、Azure、Salesforce及其他業界認證的準備。",
                    "**學生社群**：活躍的資訊系統學會、編程學會及科技創業小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。由於數碼轉型趨勢，需求持續增長。",
                    "**學術要求**：最佳五科約31-34分。優異數學表現很重要。",
                    "**Band A競爭**：競爭激烈。建議Band A選擇。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異數學加上對商業及科技的展示興趣。",
                    "**趨勢**：隨著各行業經歷數碼轉型，需求迅速增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**科技顧問**：校友於頂尖顧問公司領導數碼轉型項目。",
                    "**產品領袖**：畢業生於Google、Meta及領先科技公司擔任產品經理。",
                    "**金融科技先驅**：校友創立及領導數碼銀行及支付初創企業。",
                    "**企業創新者**：銀行、零售商及物流公司的數碼轉型領導者。",
                    "**教職員卓越**：科大資訊系統教職員包括商業分析、數碼平台及資訊經濟學研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**資訊系統卓越獎**：按科技能力頒予學生的優異獎。",
                    "**業界贊助獎學金**：科技公司及顧問公司的獎學金。",
                    "**認證資助**：業界認證考試資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大資訊系統學攻略",
                "content": [
                    "**分數目標**：最佳五科目標32分以上。數學達5級高度建議。",
                    "**學習編程**：Python、SQL及JavaScript為必需。大學前開始建立項目。",
                    "**了解商業**：閱讀商業案例及了解科技如何創造商業價值。",
                    "**探索雲端平台**：熟悉AWS、Azure或Google Cloud基礎知識。",
                    "**建立科技作品集**：創建應用程式、網站或數據分析項目以展示技能。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
