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

# JS5282 - Engineering with Extended Major in Artificial Intelligence / 工程學–人工智能延伸主修
programme = {
    "code": "JS5282",
    "nameEn": "Engineering with Extended Major in Artificial Intelligence",
    "nameZh": "工程學–人工智能延伸主修",
    "name": "Engineering with Extended Major in AI",
    "university": "香港科技大學",
    "faculty": "工學院",
    "median": 33,
    "band_a": 36,
    "category": "engineering"
}

details = {
    "code": "JS5282",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Strong demand for engineering combined with AI. Best 5 typically 33-36 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 5 or above is STRONGLY RECOMMENDED. Physics at Level 4+ is highly preferred.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Programming experience, robotics projects, AI/ML interest, and engineering-related extracurriculars strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Engineering Foundation**: Common engineering core plus programming, linear algebra, and AI fundamentals.",
                    "**Year 2 - Major Selection**: Choose engineering major (Civil, Chemical, Computer, Electronic, Industrial, or Mechanical) while taking AI core courses.",
                    "**Year 3 - AI Integration**: Machine learning, deep learning, computer vision, and NLP applied to engineering domains.",
                    "**Year 4 - Capstone**: AI-driven engineering project combining domain expertise with intelligent systems.",
                    "**Extended Major Requirements**: Additional AI coursework beyond standard engineering degree (30+ credits).",
                    "**Cross-Disciplinary**: Apply AI to structural health monitoring, process optimization, autonomous systems, and smart manufacturing."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**AI Engineering**: ML engineer, AI systems architect, and intelligent systems developer at tech companies.",
                    "**Smart Manufacturing**: Industry 4.0, predictive maintenance, and quality control using AI at manufacturing firms.",
                    "**Autonomous Systems**: Self-driving vehicles, drones, and robotics with AI perception and control.",
                    "**Infrastructure Intelligence**: Smart city, structural health monitoring, and intelligent transportation systems.",
                    "**Energy & Environment**: AI for energy optimization, smart grid, and environmental monitoring.",
                    "**Graduate Studies**: MPhil/PhD in AI applications for engineering at top research universities."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**AI Computing Resources**: GPU clusters, robotics labs, and AI development environments across engineering departments.",
                    "**Interdisciplinary Labs**: Shared facilities combining engineering hardware with AI software platforms.",
                    "**Industry Projects**: Collaborative projects with engineering firms integrating AI solutions.",
                    "**Competition Teams**: Robotics competitions, AI hackathons, and engineering design challenges.",
                    "**Student Community**: Cross-departmental AI interest groups, engineering societies, and tech entrepreneurship clubs."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Very High (★★★★★). High demand for AI-equipped engineering graduates.",
                    "**Academic Requirements**: Best 5 around 33-36. Level 5* in Mathematics and M1/M2 strongly preferred.",
                    "**Band A Competition**: Intense competition. Band A placement essential.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong mathematics and physics plus demonstrated interest in both engineering and AI.",
                    "**Trend**: Rapidly growing demand as industries adopt AI across all engineering disciplines."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**AI Engineers**: Alumni developing intelligent systems at tech giants and AI startups.",
                    "**Industry Innovators**: Graduates leading digital transformation at engineering and manufacturing companies.",
                    "**Researchers**: Alumni in AI+engineering research at top universities and corporate labs.",
                    "**Entrepreneurs**: Founders of AI-powered engineering solution startups.",
                    "**Faculty Excellence**: HKUST engineering faculty pioneering AI applications in civil, mechanical, and chemical engineering."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong STEM grades.",
                    "**AI Talent Scholarships**: Special awards for students pursuing AI-related engineering studies.",
                    "**Industry-Sponsored Awards**: From tech and engineering companies supporting AI talent.",
                    "**Innovation Grants**: Funding for AI+engineering projects and competitions.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Engineering + AI Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 34+. Mathematics (including M1/M2) at 5* is crucial.",
                    "**Build Both Foundations**: Strong engineering physics AND programming skills are both essential.",
                    "**Learn Python Early**: Python is the primary language for AI engineering applications.",
                    "**Explore AI Applications**: Understand how AI is transforming your chosen engineering discipline.",
                    "**Stay Current**: Follow AI breakthroughs and their engineering applications (smart cities, autonomous systems, etc.)."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。工程結合人工智能需求殷切。最佳五科通常33-36分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達5級或以上強烈建議。物理達4級或以上高度優先考慮。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：編程經驗、機械人項目、人工智能/機器學習興趣及工程相關課外活動可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 工程基礎**：共同工程核心加上編程、線性代數及人工智能基礎。",
                    "**第二年 - 選擇主修**：選擇工程主修（土木、化學、計算機、電子、工業或機械），同時修讀人工智能核心課程。",
                    "**第三年 - 人工智能整合**：應用於工程領域的機器學習、深度學習、電腦視覺及自然語言處理。",
                    "**第四年 - 專題**：結合領域專業知識與智能系統的人工智能驅動工程項目。",
                    "**延伸主修要求**：標準工程學位以外額外人工智能課程（30+學分）。",
                    "**跨學科**：將人工智能應用於結構健康監測、過程優化、自主系統及智能制造。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**人工智能工程**：於科技公司擔任機器學習工程師、人工智能系統架構師及智能系統開發人員。",
                    "**智能制造**：於製造企業從事工業4.0、預測性維護及使用人工智能的品質控制。",
                    "**自主系統**：具備人工智能感知及控制的自動駕駛車輛、無人機及機械人。",
                    "**基礎設施智能**：智慧城市、結構健康監測及智能交通系統。",
                    "**能源及環境**：人工智能用於能源優化、智能電網及環境監測。",
                    "**研究生課程**：於頂尖研究型大學攻讀工程應用人工智能哲學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**人工智能計算資源**：工程學系共享的GPU集群、機械人實驗室及人工智能開發環境。",
                    "**跨學科實驗室**：結合工程硬件與人工智能軟件平台的共享設施。",
                    "**產業項目**：與整合人工智能解決方案的工程公司合作項目。",
                    "**競賽隊伍**：機械人競賽、人工智能黑客松及工程設計挑戰。",
                    "**學生社群**：跨學系人工智能興趣小組、工程學會及科技創業學會。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。具備人工智能能力的工程畢業生需求殷切。",
                    "**學術要求**：最佳五科約33-36分。數學及M1/M2達5*級強烈優先考慮。",
                    "**Band A競爭**：競爭激烈。Band A選擇至關重要。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異數學及物理加上對工程及人工智能的展示興趣。",
                    "**趨勢**：隨著各行業於所有工程學科採用人工智能，需求迅速增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**人工智能工程師**：校友於科技巨頭及人工智能初創企業開發智能系統。",
                    "**業界創新者**：畢業生於工程及製造公司領導數碼轉型。",
                    "**研究人員**：校友於頂尖大學及企業實驗室從事人工智能+工程研究。",
                    "**創業家**：創立人工智能驅動工程解決方案初創企業。",
                    "**教職員卓越**：科大工程教職員開創人工智能於土木、機械及化學工程的應用。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且STEM成績優異的學生。",
                    "**人工智能人才獎學金**：專為攻讀人工智能相關工程研究的學生而設的特別獎項。",
                    "**業界贊助獎項**：科技及工程公司支持人工智能人才的獎項。",
                    "**創新資助**：人工智能+工程項目及競賽的資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大工程學+人工智能攻略",
                "content": [
                    "**分數目標**：最佳五科目標34分以上。數學（包括M1/M2）達5*級至關重要。",
                    "**建立雙重基礎**：強大的工程物理及編程技能兩者均為必需。",
                    "**及早學習Python**：Python是人工智能工程應用的主要語言。",
                    "**探索人工智能應用**：了解人工智能如何改變你選擇的工程學科。",
                    "**保持時事觸覺**：追蹤人工智能突破及其工程應用（智慧城市、自主系統等）。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
