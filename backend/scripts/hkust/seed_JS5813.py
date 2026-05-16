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

# JS5813 - BSc in Mathematics and Economics / 理學士（數學與經濟學）
programme = {
    "code": "JS5813",
    "nameEn": "BSc in Mathematics and Economics",
    "nameZh": "理學士（數學與經濟學）",
    "name": "BSc in Mathematics and Economics",
    "university": "香港科技大學",
    "faculty": "理學院",
    "median": 32,
    "band_a": 35,
    "category": "science"
}

details = {
    "code": "JS5813",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Best 5 typically 32-35 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 5 or above is STRONGLY RECOMMENDED. Economics at Level 4+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Mathematics competition experience, interest in economic modeling, and strong analytical skills strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Mathematical Foundation**: Calculus, linear algebra, proof techniques, and introduction to economics.",
                    "**Year 2 - Core MAEC**: Real analysis, differential equations, microeconomics, macroeconomics, and econometrics.",
                    "**Year 3 - Advanced Topics**: Optimization, game theory, financial mathematics, stochastic processes, and advanced econometrics.",
                    "**Year 4 - Specialization & Research**: Choose specialization in pure mathematics, applied mathematics, or mathematical economics. Complete research thesis.",
                    "**Mathematical Rigor**: BSc structure with heavy emphasis on proof-based mathematics and rigorous economic theory.",
                    "**Quantitative Economics**: Apply advanced mathematical techniques to economic modeling and policy analysis."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Quantitative Finance**: Quantitative analyst, risk analyst, and structurer at investment banks and hedge funds.",
                    "**Data Science**: Data scientist and machine learning engineer leveraging strong mathematical foundation.",
                    "**Economic Research**: Economist and policy researcher at central banks, government, and international organizations.",
                    "**Consulting**: Strategy and analytics consultant at McKinsey, BCG, and quantitative consulting firms.",
                    "**Technology**: Algorithm developer, optimization engineer, and research scientist at tech companies.",
                    "**Graduate Studies**: PhD in economics, mathematics, or operations research at top universities (MIT, Stanford, Princeton, Cambridge)."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Math Labs**: Dedicated mathematics computer lab with MATLAB, Mathematica, and statistical software.",
                    "**Research Centers**: HKUST Center for Economic Development and Institute for Advanced Study mathematics programs.",
                    "**Seminars**: Regular mathematics and economics research seminars with visiting scholars.",
                    "**Study Groups**: Active student-led study groups for advanced mathematics and economics courses.",
                    "**Student Community**: Active Mathematics Society, Economics Society, and joint MAEC interest group."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Strong demand from mathematically inclined students.",
                    "**Academic Requirements**: Best 5 around 32-35. Level 5* in Mathematics and M1/M2 strongly preferred.",
                    "**Band A Competition**: Competitive. Band A placement recommended.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Exceptional mathematics ability plus interest in economic applications.",
                    "**Trend**: Growing demand due to quantitative finance and data science career opportunities."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Quantitative Analysts**: Alumni at top hedge funds and investment banks.",
                    "**Data Scientists**: Graduates at Google, Meta, and leading tech companies.",
                    "**Academic Economists**: Alumni in PhD programmes and faculty positions at top universities.",
                    "**Consultants**: Strategy consultants at top-tier firms.",
                    "**Faculty Excellence**: HKUST MAEC faculty includes renowned mathematicians and economists with joint research programs."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with exceptional mathematics grades.",
                    "**Mathematics Excellence Awards**: Merit-based scholarships for mathematical talent.",
                    "**Research Grants**: Funding for undergraduate mathematics and economics research.",
                    "**Competition Grants**: Support for mathematics and economics competitions.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Mathematics & Economics Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 33+. M1/M2 at 5* is highly recommended.",
                    "**Master Proof-Based Math**: This programme requires rigorous mathematical thinking. Practice proofs and logical reasoning.",
                    "**Learn to Code**: Python and MATLAB are essential for mathematical modeling and data analysis.",
                    "**Read Economics Papers**: Familiarize yourself with how mathematics is applied in economic research.",
                    "**Compete in Math Olympiads**: Mathematics competitions demonstrate your aptitude and strengthen your application."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。最佳五科通常32-35分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達5級或以上強烈建議。經濟達4級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：數學競賽經驗、對經濟建模的興趣及強大分析能力可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 數學基礎**：微積分、線性代數、證明技巧及經濟學導論。",
                    "**第二年 - 數學與經濟學核心**：實分析、微分方程、微觀經濟學、宏觀經濟學及計量經濟學。",
                    "**第三年 - 高級課題**：優化、博弈論、金融數學、隨機過程及高級計量經濟學。",
                    "**第四年 - 專修及研究**：選擇純數學、應用數學或數學經濟學專修。完成研究論文。",
                    "**數學嚴謹性**：理學士結構強調基於證明的數學及嚴謹經濟理論。",
                    "**量化經濟學**：將高等數學技術應用於經濟建模及政策分析。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**量化金融**：於投資銀行及對沖基金擔任量化分析師、風險分析師及結構師。",
                    "**數據科學**：利用強大數學基礎擔任數據科學家及機器學習工程師。",
                    "**經濟研究**：於中央銀行、政府及國際組織擔任經濟學家及政策研究員。",
                    "**顧問**：於麥肯錫、波士頓諮詢及量化顧問公司擔任策略及分析顧問。",
                    "**科技界**：於科技公司擔任算法開發人員、優化工程師及研究科學家。",
                    "**研究生課程**：於頂尖大學（麻省理工、史丹福、普林斯頓、劍橋）攻讀經濟、數學或運籌學博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**數學實驗室**：配備MATLAB、Mathematica及統計軟件的專門數學電腦實驗室。",
                    "**研究中心**：科大經濟發展中心及高等研究院數學項目。",
                    "**研討會**：定期數學及經濟學研究研討會，邀請訪問學者。",
                    "**學習小組**：高級數學及經濟學課程的活躍學生主導學習小組。",
                    "**學生社群**：活躍的數學學會、經濟學會及聯合數學與經濟學興趣小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。深受具數學傾向學生歡迎。",
                    "**學術要求**：最佳五科約32-35分。數學及M1/M2達5*級強烈優先考慮。",
                    "**Band A競爭**：競爭激烈。建議Band A選擇。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：卓越數學能力加上對經濟應用的興趣。",
                    "**趨勢**：由於量化金融及數據科學職業機會，需求持續增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**量化分析師**：校友於頂尖對沖基金及投資銀行。",
                    "**數據科學家**：畢業生於Google、Meta及領先科技公司。",
                    "**學術經濟學家**：校友於頂尖大學攻讀博士課程及教職。",
                    "**顧問**：頂尖顧問公司的策略顧問。",
                    "**教職員卓越**：科大數學與經濟學教職員包括著名數學家及具備聯合研究項目的經濟學家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且數學成績優異的學生。",
                    "**數學卓越獎**：按數學才能頒發的優異獎學金。",
                    "**研究資助**：本科生數學及經濟學研究資金。",
                    "**競賽資助**：數學及經濟學競賽支援。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大數學與經濟學攻略",
                "content": [
                    "**分數目標**：最佳五科目標33分以上。M1/M2達5*級高度建議。",
                    "**掌握基於證明的數學**：此課程需要嚴謹數學思維。練習證明及邏輯推理。",
                    "**學習編程**：Python及MATLAB對數學建模及數據分析至關重要。",
                    "**閱讀經濟學論文**：熟悉數學如何應用於經濟研究。",
                    "**參加數學奧林匹克**：數學競賽展示你的才能並加強申請。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
