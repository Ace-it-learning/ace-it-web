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

# JS5260 - Department of Industrial Engineering and Decision Analytics / 工業工程及決策分析學系
programme = {
    "code": "JS5260",
    "nameEn": "Department of Industrial Engineering and Decision Analytics",
    "nameZh": "工業工程及決策分析學系",
    "name": "Industrial Engineering and Decision Analytics",
    "university": "香港科技大學",
    "faculty": "工學院",
    "median": 29,
    "band_a": 32,
    "category": "engineering"
}

details = {
    "code": "JS5260",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: MODERATELY COMPETITIVE. Best 5 typically 29-32 points.",
                    "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is highly recommended. Physics or Chemistry at Level 3+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Interest in data analysis, optimization, and business operations. Participation in mathematics competitions or business-related activities is beneficial."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Mathematics, statistics, programming, economics, and introduction to industrial engineering.",
                    "**Year 2 - Core IEDA**: Operations research, probability, data analytics, supply chain management, and quality control.",
                    "**Year 3 - Advanced Topics**: Machine learning for business, financial engineering, logistics, project management, and simulation.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in analytics, operations, or financial engineering. Complete industry project.",
                    "**Available Majors**: Industrial Engineering, Decision Analytics, Logistics Management (select in Year 2).",
                    "**Interdisciplinary Focus**: Combines engineering, mathematics, statistics, and business for data-driven decision making."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Consulting**: Management consultant, operations consultant, and data strategist at McKinsey, BCG, Bain, and local consultancies.",
                    "**Technology**: Data analyst, business analyst, and product manager at tech companies and startups.",
                    "**Finance**: Quantitative analyst, risk analyst, and operations analyst at investment banks and asset management firms.",
                    "**Supply Chain & Logistics**: Supply chain manager, operations manager, and logistics planner at manufacturing and retail companies.",
                    "**Healthcare Operations**: Hospital operations, healthcare analytics, and medical resource planning.",
                    "**Graduate Studies**: MSc in analytics, operations research, or MBA at top business schools."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Analytics Labs**: Data analytics lab with statistical software (R, Python, SAS), optimization solvers, and simulation tools.",
                    "**Research Centers**: HKUST Logistics and Supply Chain Management Institute and business analytics research groups.",
                    "**Industry Projects**: Real-world consulting projects with companies like Cathay Pacific, HKIA, and logistics firms.",
                    "**Collaboration Spaces**: Team rooms for case study discussions, data analysis projects, and business plan competitions.",
                    "**Student Community**: Active IEDA student society, case competition teams, and networking events with industry professionals."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate to High (★★★☆☆). Growing demand due to data analytics and consulting career paths.",
                    "**Academic Requirements**: Best 5 around 29-32. Mathematics at Level 5 is important.",
                    "**Band A Competition**: Moderate competition. Band A placement improves admission chances.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong mathematics grades (especially M1/M2) plus interest in business and data analysis.",
                    "**Trend**: Increasing popularity due to versatile career options spanning consulting, tech, finance, and operations."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Consulting**: Alumni at McKinsey, BCG, and Deloitte in strategy and operations consulting roles.",
                    "**Tech Industry**: Graduates at Google, Amazon, and local tech companies in data and operations roles.",
                    "**Finance Sector**: Alumni in quantitative analysis and risk management at Goldman Sachs, Morgan Stanley, and hedge funds.",
                    "**Operations Leaders**: Supply chain and logistics managers at major retail and manufacturing companies.",
                    "**Faculty Excellence**: HKUST IEDA faculty includes experts in optimization, stochastic modeling, and supply chain research."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong mathematics grades.",
                    "**Engineering Scholarships**: Merit-based awards for academic excellence in engineering.",
                    "**Industry-Sponsored Awards**: From consulting and logistics companies supporting IEDA students.",
                    "**Case Competition Grants**: Funding for participating in international operations and analytics competitions.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST IEDA Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 30+. Mathematics (including M1/M2) at Level 5 is highly recommended.",
                    "**Master Mathematics & Statistics**: These are the core tools for optimization, simulation, and data analytics.",
                    "**Learn Programming**: Python and R are essential for data analysis. Start learning before university.",
                    "**Explore Business Interest**: Read business cases, follow industry trends, and understand how companies make decisions.",
                    "**Develop Communication Skills**: IEDA graduates need to explain complex analyses to non-technical stakeholders."
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
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上高度建議。物理或化學達3級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：對數據分析、優化及商業營運的興趣。參與數學競賽或商業相關活動有益。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：數學、統計學、編程、經濟學及工業工程導論。",
                    "**第二年 - 工業工程及決策分析核心**：運籌學、概率論、數據分析、供應鏈管理及品質控制。",
                    "**第三年 - 高級課題**：商業機器學習、金融工程、物流、項目管理及模擬。",
                    "**第四年 - 專修及專題**：選擇分析、營運或金融工程專修。完成產業項目。",
                    "**可選主修**：工業工程、決策分析、物流管理（第二年選擇）。",
                    "**跨學科專注**：結合工程、數學、統計及商業進行數據驅動決策。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**顧問**：於麥肯錫、波士頓諮詢、貝恩及本地顧問公司擔任管理顧問、營運顧問及數據策略師。",
                    "**科技界**：於科技公司及初創企業擔任數據分析師、商業分析師及產品經理。",
                    "**金融業**：於投資銀行及資產管理公司擔任量化分析師、風險分析師及營運分析師。",
                    "**供應鏈及物流**：於製造及零售公司擔任供應鏈經理、營運經理及物流規劃師。",
                    "**醫療保健營運**：醫院營運、醫療保健分析及醫療資源規劃。",
                    "**研究生課程**：於頂尖商學院攻讀分析學、運籌學理學碩士或工商管理碩士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**分析實驗室**：配備統計軟件（R、Python、SAS）、優化求解器及模擬工具的數據分析實驗室。",
                    "**研究中心**：科大物流及供應鏈管理研究所及商業分析研究小組。",
                    "**產業項目**：與國泰航空、香港機場管理局及物流公司的真實顧問項目。",
                    "**協作空間**：案例研究討論、數據分析項目及商業計劃競賽的團隊房間。",
                    "**學生社群**：活躍的工業工程及決策分析學生學會、案例競賽隊伍及與業界專業人士的交流活動。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中至高（★★★☆☆）。由於數據分析及顧問職業路徑，需求持續增長。",
                    "**學術要求**：最佳五科約29-32分。數學達5級很重要。",
                    "**Band A競爭**：中等競爭。Band A選擇可提升入學機會。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異數學成績（尤其是M1/M2）加上對商業及數據分析的興趣。",
                    "**趨勢**：由於橫跨顧問、科技、金融及營運的多樣化職業選擇，越來越受歡迎。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**顧問業**：校友於麥肯錫、波士頓諮詢及德勤擔任策略及營運顧問職位。",
                    "**科技業**：畢業生於Google、亞馬遜及本地科技公司擔任數據及營運職位。",
                    "**金融業**：校友於高盛、摩根士丹利及對沖基金擔任量化分析及風險管理。",
                    "**營運領袖**：主要零售及製造公司的供應鏈及物流經理。",
                    "**教職員卓越**：科大工業工程及決策分析教職員包括優化、隨機建模及供應鏈研究專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且數學成績優異的學生。",
                    "**工程獎學金**：按工程學科學術卓越頒發的優異獎。",
                    "**業界贊助獎項**：顧問及物流公司支持工業工程及決策分析學生的獎項。",
                    "**案例競賽資助**：參與國際營運及分析競賽的資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大工業工程及決策分析學攻略",
                "content": [
                    "**分數目標**：最佳五科目標30分以上。數學（包括M1/M2）達5級高度建議。",
                    "**掌握數學及統計學**：這些是優化、模擬及數據分析的核心工具。",
                    "**學習編程**：Python及R對數據分析至關重要。大學前開始學習。",
                    "**探索商業興趣**：閱讀商業案例、追蹤行業趨勢及了解公司如何決策。",
                    "**培養溝通技巧**：工業工程及決策分析畢業生需要向非技術持份者解釋複雜分析。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
