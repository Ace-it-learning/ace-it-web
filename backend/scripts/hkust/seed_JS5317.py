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

# JS5317 - BBA in Operations Management / 工商管理學士（營運管理學）
programme = {
    "code": "JS5317",
    "nameEn": "BBA in Operations Management",
    "nameZh": "工商管理學士（營運管理學）",
    "name": "BBA in Operations Management",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 29,
    "band_a": 32,
    "category": "business"
}

details = {
    "code": "JS5317",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: MODERATELY COMPETITIVE. Best 5 typically 29-32 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is highly recommended. Physics or BAFS at Level 3+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Interest in process optimization, logistics, supply chain, and analytical problem-solving strengthens applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Business fundamentals, calculus, statistics, and introduction to operations management.",
                    "**Year 2 - Core OM**: Operations strategy, supply chain management, quality management, and service operations.",
                    "**Year 3 - Advanced Topics**: Logistics, inventory management, process analytics, project management, and lean operations.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in supply chain, service operations, or analytics. Complete industry consulting project.",
                    "**Available Tracks**: Supply Chain Management, Service Operations, Operations Analytics (select in Year 3).",
                    "**Practical Training**: Case studies, simulation software, site visits to logistics hubs and manufacturing facilities."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Supply Chain & Logistics**: Supply chain analyst, logistics manager, and procurement specialist at retailers, manufacturers, and 3PLs.",
                    "**Consulting**: Operations consulting at McKinsey, BCG, Deloitte, and specialized operations consultancies.",
                    "**Technology**: Operations analyst, program manager, and business operations at tech companies.",
                    "**Manufacturing**: Production planning, operations manager, and plant management at manufacturing firms.",
                    "**E-commerce**: Fulfillment operations, inventory planning, and last-mile logistics at e-commerce platforms.",
                    "**Aviation & Transport**: Operations control, route planning, and fleet management at airlines and logistics companies."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Analytics Labs**: Operations simulation lab with supply chain software, optimization solvers, and data visualization tools.",
                    "**Research Centers**: HKUST Logistics and Supply Chain Management Institute.",
                    "**Industry Visits**: Regular site visits to HKIA cargo terminal, container ports, and distribution centers.",
                    "**Case Competitions**: Operations and supply chain case competitions with industry sponsorship.",
                    "**Student Community**: Active OM Society, logistics interest groups, and consulting preparation teams."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate to High (★★★☆☆). Growing demand due to e-commerce and supply chain importance.",
                    "**Academic Requirements**: Best 5 around 29-32. Strong mathematics performance is important.",
                    "**Band A Competition**: Moderate competition. Band A placement improves chances.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong mathematics and analytical skills with interest in operations.",
                    "**Trend**: Increasing demand as companies prioritize supply chain resilience and operational efficiency."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Supply Chain Leaders**: Alumni managing global supply chains at Apple, Amazon, and major retailers.",
                    "**Consultants**: Operations consultants advising on supply chain and operational transformation.",
                    "**Logistics Executives**: Senior roles at DHL, FedEx, and regional logistics companies.",
                    "**E-commerce Operators**: Operations leaders at Alibaba, JD.com, and Southeast Asian e-commerce platforms.",
                    "**Faculty Excellence**: HKUST OM faculty includes experts in supply chain optimization, revenue management, and service operations."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong academic records.",
                    "**OM Excellence Awards**: Merit-based scholarships for analytical and quantitative aptitude.",
                    "**Industry-Sponsored Scholarships**: From logistics and supply chain companies.",
                    "**Case Competition Grants**: Funding for operations and supply chain competitions.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Operations Management Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 30+. Mathematics (including M1/M2) at Level 5 is highly recommended.",
                    "**Strengthen Quantitative Skills**: Statistics, optimization, and data analysis are core to operations management.",
                    "**Understand Supply Chains**: Follow news about global supply chains, logistics, and e-commerce operations.",
                    "**Learn Excel and Analytics**: Proficiency in Excel, Python, or R for data analysis is valuable.",
                    "**Think Process-Oriented**: Show interest in how businesses can operate more efficiently and effectively."
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
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上高度建議。物理或企業、會計與財務概論達3級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：對過程優化、物流、供應鏈及分析解難的興趣可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：商業基礎、微積分、統計及營運管理導論。",
                    "**第二年 - 營運管理核心**：營運策略、供應鏈管理、品質管理及服務營運。",
                    "**第三年 - 高級課題**：物流、庫存管理、過程分析、項目管理及精益營運。",
                    "**第四年 - 專修及專題**：選擇供應鏈、服務營運或分析專修。完成產業顧問項目。",
                    "**可選方向**：供應鏈管理、服務營運、營運分析（第三年選擇）。",
                    "**實踐培訓**：案例研究、模擬軟件、物流樞紐及製造設施實地考察。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**供應鏈及物流**：於零售商、製造商及第三方物流公司擔任供應鏈分析師、物流經理及採購專員。",
                    "**顧問**：於麥肯錫、波士頓諮詢、德勤及專門營運顧問公司從事營運顧問。",
                    "**科技界**：於科技公司擔任營運分析師、項目經理及商業營運。",
                    "**製造業**：於製造企業擔任生產規劃、營運經理及廠房管理。",
                    "**電子商務**：於電子商務平台擔任履行營運、庫存規劃及最後一里物流。",
                    "**航空及運輸**：於航空公司及物流公司擔任營運控制、航線規劃及車隊管理。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**分析實驗室**：配備供應鏈軟件、優化求解器及數據可視化工具的營運模擬實驗室。",
                    "**研究中心**：科大物流及供應鏈管理研究所。",
                    "**產業考察**：定期實地考察香港國際機場貨運站、貨櫃碼頭及配送中心。",
                    "**案例競賽**：具業界贊助的營運及供應鏈案例競賽。",
                    "**學生社群**：活躍的營運管理學會、物流興趣小組及顧問準備隊伍。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中至高（★★★☆☆）。由於電子商務及供應鏈重要性，需求持續增長。",
                    "**學術要求**：最佳五科約29-32分。優異數學表現很重要。",
                    "**Band A競爭**：中等競爭。Band A選擇可提升機會。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異數學及分析能力，對營運感興趣。",
                    "**趨勢**：隨著公司優先考慮供應鏈韌性及營運效率，需求持續增加。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**供應鏈領袖**：校友於蘋果、亞馬遜及主要零售商管理全球供應鏈。",
                    "**顧問**：就供應鏈及營運轉型提供建議的營運顧問。",
                    "**物流高管**：於DHL、聯邦快遞及區域物流公司擔任高級職位。",
                    "**電子商務營運者**：阿里巴巴、京東及東南亞電子商務平台的營運領導者。",
                    "**教職員卓越**：科大營運管理教職員包括供應鏈優化、收益管理及服務營運專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**營運管理卓越獎**：按分析及量化能力頒發的優異獎學金。",
                    "**業界贊助獎學金**：物流及供應鏈公司的獎學金。",
                    "**案例競賽資助**：營運及供應鏈競賽資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大營運管理學攻略",
                "content": [
                    "**分數目標**：最佳五科目標30分以上。數學（包括M1/M2）達5級高度建議。",
                    "**加強量化技能**：統計、優化及數據分析是營運管理的核心。",
                    "**了解供應鏈**：追蹤全球供應鏈、物流及電子商務營運的新聞。",
                    "**學習Excel及分析**：精通Excel、Python或R進行數據分析很有價值。",
                    "**以過程為導向思考**：展示對企業如何更有效率及有效營運的興趣。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
