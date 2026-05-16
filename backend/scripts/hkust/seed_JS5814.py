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

# JS5814 - BSc in Risk Management and Business Intelligence / 理學士（風險管理及商業智能學）
programme = {
    "code": "JS5814",
    "nameEn": "BSc in Risk Management and Business Intelligence",
    "nameZh": "理學士（風險管理及商業智能學）",
    "name": "BSc in Risk Management and Business Intelligence",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 31,
    "band_a": 34,
    "category": "business"
}

details = {
    "code": "JS5814",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Best 5 typically 31-34 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 5 or above is STRONGLY RECOMMENDED. BAFS or Economics at Level 4+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Interest in data analytics, statistics, finance, and programming strengthens applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Statistics, programming, calculus, business fundamentals, and introduction to risk management.",
                    "**Year 2 - Core RMBI**: Probability, statistical modeling, database management, data mining, and financial risk management.",
                    "**Year 3 - Advanced Topics**: Machine learning, predictive analytics, credit risk, operational risk, enterprise risk management, and business intelligence systems.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in risk management or business analytics. Complete industry project.",
                    "**Dual Focus**: Combines rigorous statistical training with business applications for data-driven risk management.",
                    "**Certification Preparation**: Curriculum aligned with FRM (Financial Risk Manager) and SAS certifications."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Risk Management**: Risk analyst and risk manager at banks, insurance companies, and corporations.",
                    "**Data Analytics**: Business intelligence analyst, data analyst, and analytics consultant at tech and consulting firms.",
                    "**Consulting**: Risk consulting and analytics advisory at Big Four and specialized consultancies.",
                    "**FinTech**: Data scientist and risk modeler at digital banks and financial technology companies.",
                    "**Insurance**: Actuarial analyst, underwriter, and claims analyst at insurance firms.",
                    "**Graduate Studies**: MSc in data science, risk management, or financial engineering at top universities."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Analytics Labs**: Computer labs with SAS, R, Python, SQL, and business intelligence platforms.",
                    "**Research Centers**: HKUST Center for Business Intelligence and Risk Management Research.",
                    "**Industry Software**: Access to Bloomberg, Refinitiv, and risk management software used in industry.",
                    "**Case Competitions**: Risk management and analytics case competitions with industry partners.",
                    "**Student Community**: Active RMBI Society, data analytics clubs, and professional certification study groups."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Growing demand for risk and analytics professionals.",
                    "**Academic Requirements**: Best 5 around 31-34. Strong mathematics performance is essential.",
                    "**Band A Competition**: Competitive. Band A placement recommended.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong mathematics (especially M1/M2) plus interest in data and risk.",
                    "**Trend**: Rapidly increasing demand due to regulatory requirements and data-driven business transformation."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Risk Managers**: Alumni in senior risk roles at HSBC, Standard Chartered, and major banks.",
                    "**Data Scientists**: Graduates at tech companies and financial institutions in analytics roles.",
                    "**Consultants**: Risk and analytics consultants at Deloitte, KPMG, and Accenture.",
                    "**Actuaries**: Alumni pursuing actuarial careers at insurance companies.",
                    "**Faculty Excellence**: HKUST RMBI faculty includes experts in statistical modeling, machine learning, and financial risk."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong mathematics grades.",
                    "**RMBI Excellence Awards**: Merit-based scholarships for quantitative and analytical talent.",
                    "**Industry-Sponsored Scholarships**: From banks, insurance companies, and tech firms.",
                    "**Certification Grants**: Funding for FRM, SAS, and other professional certifications.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Risk Management & Business Intelligence Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 32+. Mathematics (including M1/M2) at 5* is highly recommended.",
                    "**Master Statistics**: Probability, regression, and statistical modeling are core to risk management.",
                    "**Learn Programming**: Python, R, and SQL are essential tools for business intelligence.",
                    "**Understand Finance**: Basic understanding of financial markets and instruments is important.",
                    "**Pursue Certifications**: Consider FRM or SAS certifications to enhance employability."
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
                    "**必需選修科**：數學延伸部分（M1/M2）達5級或以上強烈建議。企業、會計與財務概論或經濟達4級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：對數據分析、統計、金融及編程的興趣可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：統計、編程、微積分、商業基礎及風險管理導論。",
                    "**第二年 - 風險管理及商業智能核心**：概率、統計建模、數據庫管理、數據挖掘及金融風險管理。",
                    "**第三年 - 高級課題**：機器學習、預測分析、信貸風險、營運風險、企業風險管理及商業智能系統。",
                    "**第四年 - 專修及專題**：選擇風險管理或商業分析專修。完成產業項目。",
                    "**雙重專注**：結合嚴謹統計培訓與商業應用進行數據驅動風險管理。",
                    "**認證準備**：課程與金融風險管理師（FRM）及SAS認證接軌。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**風險管理**：於銀行、保險公司及企業擔任風險分析師及風險經理。",
                    "**數據分析**：於科技及顧問公司擔任商業智能分析師、數據分析師及分析顧問。",
                    "**顧問**：於四大及專門顧問公司從事風險顧問及分析諮詢。",
                    "**金融科技**：於數碼銀行及金融科技公司擔任數據科學家及風險建模師。",
                    "**保險**：於保險公司擔任精算分析師、核保人及理賠分析師。",
                    "**研究生課程**：於頂尖大學攻讀數據科學、風險管理或金融工程理學碩士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**分析實驗室**：配備SAS、R、Python、SQL及商業智能平台的電腦實驗室。",
                    "**研究中心**：科大商業智能及風險管理研究中心。",
                    "**業界軟件**：可使用彭博、路孚特及業界使用的風險管理軟件。",
                    "**案例競賽**：與業界夥伴的風險管理及分析案例競賽。",
                    "**學生社群**：活躍的風險管理及商業智能學會、數據分析學會及專業認證學習小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。風險及分析專業人士需求持續增長。",
                    "**學術要求**：最佳五科約31-34分。優異數學表現至關重要。",
                    "**Band A競爭**：競爭激烈。建議Band A選擇。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異數學（尤其是M1/M2）加上對數據及風險的興趣。",
                    "**趨勢**：由於監管要求及數據驅動商業轉型，需求迅速增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**風險經理**：校友於滙豐、渣打及主要銀行擔任高級風險職位。",
                    "**數據科學家**：畢業生於科技公司及金融機構擔任分析職位。",
                    "**顧問**：於德勤、畢馬威及埃森哲擔任風險及分析顧問。",
                    "**精算師**：校友於保險公司追求精算事業。",
                    "**教職員卓越**：科大風險管理及商業智能教職員包括統計建模、機器學習及金融風險專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且數學成績優異的學生。",
                    "**風險管理及商業智能卓越獎**：按量化及分析才能頒發的優異獎學金。",
                    "**業界贊助獎學金**：銀行、保險公司及科技公司的獎學金。",
                    "**認證資助**：金融風險管理師、SAS及其他專業認證資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大風險管理及商業智能學攻略",
                "content": [
                    "**分數目標**：最佳五科目標32分以上。數學（包括M1/M2）達5*級高度建議。",
                    "**掌握統計學**：概率、回歸及統計建模是風險管理的核心。",
                    "**學習編程**：Python、R及SQL是商業智能的必需工具。",
                    "**了解金融**：對金融市場及工具的基本了解很重要。",
                    "**追求認證**：考慮金融風險管理師或SAS認證以提升就業能力。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
