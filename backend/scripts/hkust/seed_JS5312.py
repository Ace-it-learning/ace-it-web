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

# JS5312 - BBA in Finance / 工商管理學士（金融學）
programme = {
    "code": "JS5312",
    "nameEn": "BBA in Finance",
    "nameZh": "工商管理學士（金融學）",
    "name": "BBA in Finance",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 33,
    "band_a": 36,
    "category": "business"
}

details = {
    "code": "JS5312",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: VERY COMPETITIVE. One of the most competitive business programmes. Best 5 typically 33-36 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 5 or above is STRONGLY RECOMMENDED. BAFS or Economics at Level 4+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Investment competition participation, finance club involvement, and demonstrated interest in financial markets strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Financial accounting, economics, statistics, business communication, and introduction to finance.",
                    "**Year 2 - Core Finance**: Corporate finance, investments, financial markets, derivatives, and financial statement analysis.",
                    "**Year 3 - Advanced Topics**: Portfolio management, risk management, fixed income, international finance, and alternative investments.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in investment banking, asset management, or financial technology. Complete industry project.",
                    "**Available Tracks**: Investment Banking, Asset Management, FinTech, Risk Management (select in Year 3).",
                    "**Practical Training**: Bloomberg terminal certification, trading simulations, and case-based learning."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Investment Banking**: Front-office analyst positions at Goldman Sachs, Morgan Stanley, JP Morgan, and boutique investment banks.",
                    "**Asset Management**: Research analyst, portfolio manager, and trader at BlackRock, Fidelity, and local asset managers.",
                    "**Private Equity & VC**: Analyst and associate positions at PE firms and venture capital funds.",
                    "**Sales & Trading**: Equities, fixed income, and derivatives trading at global investment banks.",
                    "**Corporate Finance**: Treasury, FP&A, and M&A roles at multinational corporations.",
                    "**FinTech**: Product development, quantitative analysis, and strategy at financial technology companies."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Trading Room**: State-of-the-art trading floor with Bloomberg terminals, Reuters Eikon, and real-time market data.",
                    "**Research Centers**: HKUST Center for Investing and Finance Research, behavioral finance lab.",
                    "**Student Investment Fund**: Student-managed investment fund providing real portfolio management experience.",
                    "**Industry Connections**: Regular guest lectures by investment bankers, fund managers, and CFOs.",
                    "**Student Community**: Active Finance Society, investment clubs, and case competition teams."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Very High (★★★★★). The most competitive finance undergraduate programme in Hong Kong.",
                    "**Academic Requirements**: Best 5 around 33-36. Level 5* in Mathematics and M1/M2 strongly preferred.",
                    "**Band A Competition**: Intense competition. Band A placement essential.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Exceptional mathematics grades plus demonstrated interest in finance and markets.",
                    "**Trend**: Consistently highest demand due to lucrative career prospects and strong employer network."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Investment Bankers**: Alumni in MD and partner positions at global investment banks.",
                    "**Hedge Fund Managers**: Graduates managing billions at top hedge funds and asset managers.",
                    "**CFOs & Treasurers**: Alumni as CFOs at listed companies and multinational corporations.",
                    "**FinTech Entrepreneurs**: Founders of successful fintech startups in payments, lending, and wealth management.",
                    "**Faculty Excellence**: HKUST finance faculty includes leading researchers in asset pricing, corporate finance, and market microstructure."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers. Full tuition scholarships for top achievers.",
                    "**Finance Excellence Awards**: Merit-based scholarships for students with exceptional quantitative aptitude.",
                    "**Industry-Sponsored Scholarships**: From banks, asset managers, and financial institutions.",
                    "**Trading Competition Grants**: Funding for participation in international trading and investment competitions.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Finance Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 34+. Mathematics (including M1/M2) at 5* is crucial.",
                    "**Master Quantitative Skills**: Strong calculus, statistics, and probability are essential for finance theory.",
                    "**Follow Markets**: Read financial news daily, understand market movements, and follow economic indicators.",
                    "**Get Bloomberg Certified**: Bloomberg Market Concepts (BMC) certification gives you a head start.",
                    "**Network Early**: Attend finance society events, alumni talks, and industry networking sessions."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：非常競爭。最競爭的商學課程之一。最佳五科通常33-36分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達5級或以上強烈建議。企業、會計與財務概論或經濟達4級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：投資競賽參與、金融學會 involvement 及對金融市場的展示興趣可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：財務會計、經濟、統計、商業傳播及金融導論。",
                    "**第二年 - 金融核心**：公司金融、投資學、金融市場、衍生工具及財務報表分析。",
                    "**第三年 - 高級課題**：投資組合管理、風險管理、固定收益、國際金融及另類投資。",
                    "**第四年 - 專修及專題**：選擇投資銀行、資產管理或金融科技專修。完成產業項目。",
                    "**可選方向**：投資銀行、資產管理、金融科技、風險管理（第三年選擇）。",
                    "**實踐培訓**：彭博終端認證、交易模擬及案例學習。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**投資銀行**：於高盛、摩根士丹利、摩根大通及精品投資銀行擔任前台分析師職位。",
                    "**資產管理**：於貝萊德、富達及本地資產管理公司擔任研究分析師、投資組合經理及交易員。",
                    "**私募股權及創投**：於私募股權公司及創投基金擔任分析師及經理職位。",
                    "**銷售及交易**：於全球投資銀行從事股票、固定收益及衍生工具交易。",
                    "**企業金融**：於跨國企業擔任財資、財務規劃與分析及併購職位。",
                    "**金融科技**：於金融科技公司擔任產品開發、量化分析及策略。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**交易室**：配備彭博終端、路透Eikon及實時市場數據的先進交易廳。",
                    "**研究中心**：科大投資及金融研究中心、行為金融實驗室。",
                    "**學生投資基金**：學生管理投資基金提供真實投資組合管理經驗。",
                    "**產業聯繫**：定期邀請投資銀行家、基金經理及財務總監客席講座。",
                    "**學生社群**：活躍的金融學會、投資學會及案例競賽隊伍。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。香港最競爭的金融本科課程。",
                    "**學術要求**：最佳五科約33-36分。數學及M1/M2達5*級強烈優先考慮。",
                    "**Band A競爭**：競爭激烈。Band A選擇至關重要。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：卓越數學成績加上對金融及市場的展示興趣。",
                    "**趨勢**：由於豐厚職業前景及強大僱主網絡，需求持續最高。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**投資銀行家**：校友於全球投資銀行擔任董事總經理及合夥人職位。",
                    "**對沖基金經理**：畢業生於頂尖對沖基金及資產管理公司管理數十億資金。",
                    "**財務總監及財資主管**：校友於上市公司及跨國企業擔任財務總監。",
                    "**金融科技創業家**：創立支付、借貸及財富管理領域成功的金融科技初創企業。",
                    "**教職員卓越**：科大金融教職員包括資產定價、公司金融及市場微觀結構領域的領先研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。頂尖成績者提供全額學費獎學金。",
                    "**金融卓越獎**：專為量化能力卓越的學生而設的優異獎學金。",
                    "**業界贊助獎學金**：銀行、資產管理公司及金融機構的獎學金。",
                    "**交易競賽資助**：參與國際交易及投資競賽的資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大金融學攻略",
                "content": [
                    "**分數目標**：最佳五科目標34分以上。數學（包括M1/M2）達5*級至關重要。",
                    "**掌握量化技能**：強大的微積分、統計及概率對金融理論至關重要。",
                    "**追蹤市場**：每日閱讀金融新聞、了解市場走勢及追蹤經濟指標。",
                    "**獲得彭博認證**：彭博市場概念（BMC）認證讓你取得先機。",
                    "**及早建立人脈**：參加金融學會活動、校友講座及業界交流活動。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
