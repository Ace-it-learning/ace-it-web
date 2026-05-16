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

# JS5412 - BSc in Quantitative Social Analysis / 理學士（定量社會數據分析）
programme = {
    "code": "JS5412",
    "nameEn": "BSc in Quantitative Social Analysis",
    "nameZh": "理學士（定量社會數據分析）",
    "name": "BSc in Quantitative Social Analysis",
    "university": "香港科技大學",
    "faculty": "人文社會科學學院",
    "median": 29,
    "band_a": 32,
    "category": "social_science"
}

details = {
    "code": "JS5412",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: MODERATELY COMPETITIVE. Best 5 typically 29-32 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is highly recommended. Any social science elective is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Interest in data analysis, social research, statistics, and programming strengthens applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Statistics, programming (R/Python), research methods, and introduction to social science.",
                    "**Year 2 - Core QSA**: Data analysis, regression modeling, survey methods, social statistics, and database management.",
                    "**Year 3 - Advanced Topics**: Machine learning for social science, big data analytics, geographic information systems, and causal inference.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in social data science, policy analytics, or computational social science. Complete research project.",
                    "**Quantitative Focus**: BSc structure emphasizing statistical methods, computational tools, and data-driven social research.",
                    "**Interdisciplinary**: Applies quantitative methods to sociology, economics, political science, and urban studies."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Data Analytics**: Data analyst and business intelligence analyst at tech companies, consulting firms, and government.",
                    "**Policy Research**: Policy analyst and researcher at think tanks, government departments, and international organizations.",
                    "**Market Research**: Quantitative researcher at Nielsen, Kantar, and specialized research firms.",
                    "**Social Media Analytics**: Data scientist analyzing social trends, public opinion, and user behavior.",
                    "**Urban Planning**: Data analyst supporting smart city initiatives and urban policy development.",
                    "**Graduate Studies**: MSc/PhD in data science, statistics, or computational social science at top universities."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Data Labs**: Computer labs with statistical software (R, Python, Stata, SPSS), GIS software, and survey tools.",
                    "**Research Centers**: HKUST Center for Social Policy Studies and Institute for Emerging Market Studies.",
                    "**Data Resources**: Access to census data, social surveys, and international databases for research.",
                    "**Industry Projects**: Real-world data analysis projects with government departments and NGOs.",
                    "**Student Community**: Active QSA Society, data science clubs, and social research interest groups."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate to High (★★★☆☆). Growing demand for data analytics skills.",
                    "**Academic Requirements**: Best 5 around 29-32. Strong mathematics performance is important.",
                    "**Band A Competition**: Moderate. Band A placement improves chances.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong mathematics and statistics foundation with interest in social issues.",
                    "**Trend**: Increasing demand as organizations seek data-driven insights for policy and business decisions."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Data Scientists**: Alumni in data analytics roles across technology, finance, and consulting sectors.",
                    "**Policy Analysts**: Graduates at government departments and think tanks using data for policy recommendations.",
                    "**Researchers**: Alumni in social science PhD programmes and research institutions.",
                    "**Market Researchers**: Quantitative research specialists at leading market research firms.",
                    "**Faculty Excellence**: HKUST QSA faculty includes experts in computational social science, survey methodology, and statistical modeling."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers.",
                    "**Data Science Awards**: Merit-based scholarships for quantitative aptitude.",
                    "**Research Grants**: Funding for undergraduate data analysis projects.",
                    "**Industry-Sponsored Scholarships**: From tech and consulting companies supporting data talent.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Quantitative Social Analysis Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 30+. Mathematics (including M1/M2) at Level 5 is highly recommended.",
                    "**Learn Programming Early**: R and Python are essential tools. Start learning before university.",
                    "**Understand Statistics**: Strong foundation in probability, regression, and hypothesis testing.",
                    "**Follow Social Issues**: Stay informed about current social, economic, and political issues.",
                    "**Practice Data Analysis**: Work with real datasets, create visualizations, and draw insights."
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
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上高度建議。任何社會科學選修科有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：對數據分析、社會研究、統計及編程的興趣可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：統計、編程（R/Python）、研究方法及社會科學導論。",
                    "**第二年 - 定量社會數據分析核心**：數據分析、回歸建模、調查方法、社會統計及數據庫管理。",
                    "**第三年 - 高級課題**：社會科學機器學習、大數據分析、地理資訊系統及因果推斷。",
                    "**第四年 - 專修及專題**：選擇社會數據科學、政策分析或計算社會科學專修。完成研究項目。",
                    "**量化專注**：理學士結構強調統計方法、計算工具及數據驅動社會研究。",
                    "**跨學科**：將量化方法應用於社會學、經濟、政治學及城市研究。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**數據分析**：於科技公司、顧問公司及政府擔任數據分析師及商業智能分析師。",
                    "**政策研究**：於智庫、政府部門及國際組織擔任政策分析師及研究員。",
                    "**市場研究**：於尼爾森、凱度及專門研究公司擔任量化研究員。",
                    "**社交媒體分析**：分析社會趨勢、公眾輿論及用戶行為的數據科學家。",
                    "**城市規劃**：支持智慧城市倡議及城市政策發展的數據分析師。",
                    "**研究生課程**：於頂尖大學攻讀數據科學、統計或計算社會科學理學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**數據實驗室**：配備統計軟件（R、Python、Stata、SPSS）、地理資訊系統軟件及調查工具的電腦實驗室。",
                    "**研究中心**：科大社會政策研究中心及新興市場研究所。",
                    "**數據資源**：可使用人口普查數據、社會調查及國際數據庫進行研究。",
                    "**產業項目**：與政府部門及非政府組織的真實數據分析項目。",
                    "**學生社群**：活躍的定量社會數據分析學會、數據科學學會及社會研究興趣小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中至高（★★★☆☆）。數據分析技能需求持續增長。",
                    "**學術要求**：最佳五科約29-32分。優異數學表現很重要。",
                    "**Band A競爭**：中等。Band A選擇可提升機會。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異數學及統計基礎，對社會議題感興趣。",
                    "**趨勢**：隨著組織尋求數據驅動洞察以制定政策及商業決策，需求持續增加。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**數據科學家**：校友於科技、金融及顧問界別擔任數據分析職位。",
                    "**政策分析師**：畢業生於政府部門及智庫使用數據提供政策建議。",
                    "**研究人員**：校友於社會科學博士課程及研究機構。",
                    "**市場研究員**：領先市場研究公司的量化研究專家。",
                    "**教職員卓越**：科大量化社會數據分析教職員包括計算社會科學、調查方法及統計建模專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**數據科學獎項**：按量化能力頒發的優異獎學金。",
                    "**研究資助**：本科生數據分析項目資金。",
                    "**業界贊助獎學金**：科技及顧問公司支持數據人才的獎學金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大量化社會數據分析攻略",
                "content": [
                    "**分數目標**：最佳五科目標30分以上。數學（包括M1/M2）達5級高度建議。",
                    "**及早學習編程**：R及Python為必需工具。大學前開始學習。",
                    "**了解統計學**：概率、回歸及假設檢定的穩固基礎。",
                    "**追蹤社會議題**：了解當前社會、經濟及政治議題。",
                    "**練習數據分析**：處理真實數據集、創建可視化及得出洞察。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
