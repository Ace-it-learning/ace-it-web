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

# JS5332 - BSc in Quantitative Finance / 理學士（量化金融學）
programme = {
    "code": "JS5332",
    "nameEn": "BSc in Quantitative Finance",
    "nameZh": "理學士（量化金融學）",
    "name": "BSc in Quantitative Finance",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 34,
    "band_a": 37,
    "category": "business"
}

details = {
    "code": "JS5332",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: VERY COMPETITIVE. One of the most quantitative programmes at HKUST. Best 5 typically 34-37 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 5* or above is ESSENTIAL. Physics at Level 5 is highly preferred.",
                    "**Interview**: May be required for borderline cases. Assesses quantitative aptitude and motivation.",
                    "**Non-Academic Factors**: Mathematics competition awards, programming skills, and interest in financial modeling strengthen applications significantly."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Mathematical Foundation**: Advanced calculus, linear algebra, probability theory, statistics, and programming (Python/C++).",
                    "**Year 2 - Core QFIN**: Stochastic processes, financial derivatives, numerical methods, econometrics, and data structures.",
                    "**Year 3 - Advanced Topics**: Option pricing models, risk management, machine learning in finance, algorithmic trading, and fixed income modeling.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in derivatives pricing, risk management, or algorithmic trading. Complete quantitative research project.",
                    "**Mathematical Rigor**: BSc structure with heavy emphasis on probability theory, stochastic calculus, and numerical analysis.",
                    "**Programming Intensive**: C++, Python, and R for financial modeling, simulation, and algorithmic trading strategies."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Quantitative Trading**: Quantitative trader and strategist at hedge funds and proprietary trading firms (Two Sigma, Citadel, Jane Street).",
                    "**Derivatives Pricing**: Quantitative analyst structuring and pricing complex derivatives at investment banks.",
                    "**Risk Management**: Quantitative risk analyst at banks, hedge funds, and asset managers using advanced statistical models.",
                    "**Algorithmic Trading**: Developer of automated trading systems and execution algorithms.",
                    "**Financial Engineering**: Structuring exotic products and designing quantitative investment strategies.",
                    "**Graduate Studies**: MSc/PhD in financial engineering, mathematics, or statistics at top universities (CMU, Berkeley, Princeton, Oxford)."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Quantitative Labs**: High-performance computing lab with financial modeling software, trading simulators, and market data feeds.",
                    "**Research Centers**: HKUST Center for Quantitative Finance and Risk Management.",
                    "**Trading Competitions**: Participation in international quantitative trading and case competitions.",
                    "**Industry Projects**: Real-world quantitative projects with hedge funds and investment banks.",
                    "**Student Community**: Active Quantitative Finance Society, coding clubs, and math competition teams."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Very High (★★★★★). The most quantitative and selective finance programme at HKUST.",
                    "**Academic Requirements**: Best 5 around 34-37. Level 5** in Mathematics and M1/M2 typically required.",
                    "**Band A Competition**: Intense competition. Band A placement essential.",
                    "**Interview Weighting**: Moderate. May assess quantitative problem-solving ability.",
                    "**What Differentiates Winners**: Exceptional mathematics ability (especially M1/M2 at 5**), programming skills, and genuine interest in quantitative methods.",
                    "**Trend**: Surging demand due to growth of quantitative hedge funds and algorithmic trading."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Quantitative Traders**: Alumni at Two Sigma, Citadel, Jane Street, and other top quantitative firms.",
                    "**Investment Bank Quants**: Graduates structuring derivatives and developing pricing models at Goldman Sachs, Morgan Stanley.",
                    "**Risk Managers**: Senior quantitative risk roles at major banks and asset managers.",
                    "**Academic Researchers**: Alumni in PhD programmes and faculty positions in quantitative finance.",
                    "**Faculty Excellence**: HKUST QFIN faculty includes experts in stochastic calculus, derivative pricing, and financial econometrics."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with exceptional mathematics grades.",
                    "**QFIN Excellence Awards**: Prestigious scholarships for top quantitative talent.",
                    "**Industry-Sponsored Scholarships**: From hedge funds and investment banks supporting quant talent.",
                    "**Competition Grants**: Funding for mathematics and quantitative finance competitions.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Quantitative Finance Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 35+. M1/M2 at 5** is essentially required.",
                    "**Master Advanced Mathematics**: Stochastic calculus, probability theory, and numerical methods are core. M1/M2 is just the beginning.",
                    "**Learn C++ and Python**: Programming is as important as math in quantitative finance.",
                    "**Compete in Math Olympiads**: HKMO, AIMO, or other math competitions demonstrate your quantitative ability.",
                    "**Understand Financial Markets**: Read about derivatives, options pricing, and quantitative strategies."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：非常競爭。科大最量化的課程之一。最佳五科通常34-37分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達5*級或以上為必需。物理達5級高度優先考慮。",
                    "**面試**：邊緣個案可能需要。評估量化解難能力及動機。",
                    "**非學術因素**：數學競賽獎項、編程技能及對金融建模的興趣可顯著加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 數學基礎**：高等微積分、線性代數、概率論、統計及編程（Python/C++）。",
                    "**第二年 - 量化金融核心**：隨機過程、金融衍生工具、數值方法、計量經濟學及數據結構。",
                    "**第三年 - 高級課題**：期權定價模型、風險管理、金融機器學習、算法交易及固定收益建模。",
                    "**第四年 - 專修及專題**：選擇衍生工具定價、風險管理或算法交易專修。完成量化研究項目。",
                    "**數學嚴謹性**：理學士結構強調概率論、隨機微積分及數值分析。",
                    "**密集編程**：用於金融建模、模擬及算法交易策略的C++、Python及R。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**量化交易**：於對沖基金及自營交易公司（Two Sigma、Citadel、Jane Street）擔任量化交易員及策略師。",
                    "**衍生工具定價**：於投資銀行擔任量化分析師，結構及定價複雜衍生工具。",
                    "**風險管理**：於銀行、對沖基金及資產管理公司使用高級統計模型擔任量化風險分析師。",
                    "**算法交易**：自動交易系統及執行算法開發人員。",
                    "**金融工程**：結構奇異產品及設計量化投資策略。",
                    "**研究生課程**：於頂尖大學（卡內基梅隆、伯克利、普林斯頓、牛津）攻讀金融工程、數學或統計理學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**量化實驗室**：配備金融建模軟件、交易模擬器及市場數據饋送的高性能計算實驗室。",
                    "**研究中心**：科大量化金融及風險管理中心。",
                    "**交易競賽**：參與國際量化交易及案例競賽。",
                    "**產業項目**：與對沖基金及投資銀行的真實量化項目。",
                    "**學生社群**：活躍的量化金融學會、編程學會及數學競賽隊伍。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。科大最量化及選擇性的金融課程。",
                    "**學術要求**：最佳五科約34-37分。數學及M1/M2通常需達5**級。",
                    "**Band A競爭**：競爭激烈。Band A選擇至關重要。",
                    "**面試比重**：中等。可能評估量化解難能力。",
                    "**成功申請者特質**：卓越數學能力（尤其是M1/M2達5**級）、編程技能及對量化方法的 genuine 興趣。",
                    "**趨勢**：由於量化對沖基金及算法交易增長，需求激增。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**量化交易員**：校友於Two Sigma、Citadel、Jane Street及其他頂尖量化公司。",
                    "**投資銀行量化分析師**：畢業生於高盛、摩根士丹利結構衍生工具及開發定價模型。",
                    "**風險經理**：於主要銀行及資產管理公司擔任高級量化風險職位。",
                    "**學術研究人員**：校友於量化金融攻讀博士課程及教職。",
                    "**教職員卓越**：科大量化金融教職員包括隨機微積分、衍生工具定價及金融計量經濟學專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且數學成績優異的學生。",
                    "**量化金融卓越獎**：頒予頂尖量化人才的負盛名獎學金。",
                    "**業界贊助獎學金**：對沖基金及投資銀行支持量化人才的獎學金。",
                    "**競賽資助**：數學及量化金融競賽資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大量化金融學攻略",
                "content": [
                    "**分數目標**：最佳五科目標35分以上。M1/M2達5**級基本上為必需。",
                    "**掌握高等數學**：隨機微積分、概率論及數值方法為核心。M1/M2只是開始。",
                    "**學習C++及Python**：編程在量化金融中與數學同等重要。",
                    "**參加數學奧林匹克**：香港數學奧林匹克、亞洲國際數學奧林匹克或其他數學競賽展示你的量化能力。",
                    "**了解金融市場**：閱讀關於衍生工具、期權定價及量化策略。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
