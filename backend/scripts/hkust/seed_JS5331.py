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

# JS5331 - BSc in Economics and Finance / 理學士（經濟及金融學）
programme = {
    "code": "JS5331",
    "nameEn": "BSc in Economics and Finance",
    "nameZh": "理學士（經濟及金融學）",
    "name": "BSc in Economics and Finance",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 32,
    "band_a": 35,
    "category": "business"
}

details = {
    "code": "JS5331",
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
                    "**Non-Academic Factors**: Investment competition experience, economics research interest, and quantitative aptitude strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Microeconomics, macroeconomics, calculus, statistics, and introduction to finance.",
                    "**Year 2 - Core ECOF**: Intermediate economics, financial economics, econometrics, corporate finance, and investments.",
                    "**Year 3 - Advanced Topics**: Derivatives, international finance, monetary economics, behavioral finance, and financial econometrics.",
                    "**Year 4 - Specialization & Research**: Choose specialization in financial economics, economic policy, or quantitative finance. Complete research thesis.",
                    "**Quantitative Focus**: BSc structure emphasizes mathematical and statistical methods for economic and financial analysis.",
                    "**Research Training**: Econometric software training (Stata, R, Python) and data analysis projects."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Investment Banking**: Analyst positions in M&A, equity research, and fixed income at global investment banks.",
                    "**Asset Management**: Research analyst and portfolio analyst roles at mutual funds, hedge funds, and pension funds.",
                    "**Economic Research**: Economist positions at banks, think tanks, and government agencies.",
                    "**Consulting**: Economic consulting and strategy advisory at McKinsey, BCG, and specialized firms.",
                    "**Quantitative Finance**: Quantitative analyst roles requiring strong mathematical and programming skills.",
                    "**Graduate Studies**: MSc/PhD in economics or finance at top universities (LSE, MIT, Chicago, Stanford)."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Research Facilities**: Economics and finance computer lab with Bloomberg terminals, econometric software, and financial databases.",
                    "**Research Centers**: HKUST Institute for Emerging Market Studies and Center for Economic Policy.",
                    "**Student Investment Fund**: Hands-on portfolio management experience with real capital.",
                    "**Seminars**: Regular research seminars featuring leading economists and finance academics.",
                    "**Student Community**: Active Economics and Finance Society, investment clubs, and research interest groups."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Strong demand from quantitatively inclined students.",
                    "**Academic Requirements**: Best 5 around 32-35. Level 5* in Mathematics and M1/M2 strongly preferred.",
                    "**Band A Competition**: Competitive. Band A placement recommended.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong mathematics (especially M1/M2) plus interest in economics and financial markets.",
                    "**Trend**: Growing demand due to quantitative finance trend and data-driven decision making in markets."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Finance Professionals**: Alumni in investment banking, asset management, and hedge funds globally.",
                    "**Policy Economists**: Graduates at central banks, government treasuries, and international organizations.",
                    "**Academic Researchers**: Alumni pursuing doctoral studies and academic careers at top universities.",
                    "**Quantitative Analysts**: Graduates at quantitative hedge funds and proprietary trading firms.",
                    "**Faculty Excellence**: HKUST ECOF faculty includes renowned researchers in financial economics and econometrics."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with exceptional mathematics grades.",
                    "**ECOF Excellence Awards**: Merit-based scholarships for quantitative aptitude.",
                    "**Industry-Sponsored Scholarships**: From banks and asset managers supporting finance talent.",
                    "**Research Grants**: Funding for undergraduate economic and finance research.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Economics & Finance Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 33+. Mathematics (including M1/M2) at 5* is crucial.",
                    "**Master Mathematics**: M1/M2 is essential. Calculus, linear algebra, and probability are core tools.",
                    "**Learn Programming**: Python and R for data analysis and econometric modeling.",
                    "**Follow Markets**: Read financial news daily and understand economic indicators.",
                    "**Build Quantitative Foundation**: Strong math skills differentiate you in finance careers."
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
                    "**非學術因素**：投資競賽經驗、經濟研究興趣及量化能力可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：微觀經濟學、宏觀經濟學、微積分、統計及金融導論。",
                    "**第二年 - 經濟及金融核心**：中級經濟學、金融經濟學、計量經濟學、公司金融及投資學。",
                    "**第三年 - 高級課題**：衍生工具、國際金融、貨幣經濟學、行為金融及金融計量經濟學。",
                    "**第四年 - 專修及研究**：選擇金融經濟學、經濟政策或量化金融專修。完成研究論文。",
                    "**量化專注**：理學士結構強調經濟及金融分析的數學及統計方法。",
                    "**研究培訓**：計量經濟學軟件培訓（Stata、R、Python）及數據分析項目。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**投資銀行**：於全球投資銀行擔任併購、股票研究及固定收益分析師職位。",
                    "**資產管理**：於互惠基金、對沖基金及退休基金擔任研究分析師及投資組合分析師。",
                    "**經濟研究**：於銀行、智庫及政府機構擔任經濟學家。",
                    "**顧問**：於麥肯錫、波士頓諮詢及專門公司從事經濟顧問及策略諮詢。",
                    "**量化金融**：需要強大數學及編程技能的量化分析師職位。",
                    "**研究生課程**：於頂尖大學（倫敦政經、麻省理工、芝加哥、史丹福）攻讀經濟或金融理學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**研究設施**：配備彭博終端、計量經濟學軟件及金融數據庫的經濟及金融電腦實驗室。",
                    "**研究中心**：科大新興市場研究所及經濟政策中心。",
                    "**學生投資基金**：以真實資金進行投資組合管理的實踐經驗。",
                    "**研討會**：定期研究研討會，邀請領先經濟學家及金融學者。",
                    "**學生社群**：活躍的經濟及金融學會、投資學會及研究興趣小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。深受具量化傾向學生歡迎。",
                    "**學術要求**：最佳五科約32-35分。數學及M1/M2達5*級強烈優先考慮。",
                    "**Band A競爭**：競爭激烈。建議Band A選擇。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：強大數學（尤其是M1/M2）加上對經濟及金融市場的興趣。",
                    "**趨勢**：由於量化金融趨勢及市場數據驅動決策，需求持續增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**金融專業人士**：校友於全球投資銀行、資產管理及對沖基金。",
                    "**政策經濟學家**：畢業生於中央銀行、政府財政部及國際組織。",
                    "**學術研究人員**：校友於頂尖大學攻讀博士及學術事業。",
                    "**量化分析師**：畢業生於量化對沖基金及自營交易公司。",
                    "**教職員卓越**：科大經濟及金融教職員包括金融經濟學及計量經濟學領域著名研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且數學成績優異的學生。",
                    "**經濟及金融卓越獎**：按量化能力頒發的優異獎學金。",
                    "**業界贊助獎學金**：銀行及資產管理公司支持金融人才的獎學金。",
                    "**研究資助**：本科生經濟及金融研究資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大經濟及金融學攻略",
                "content": [
                    "**分數目標**：最佳五科目標33分以上。數學（包括M1/M2）達5*級至關重要。",
                    "**掌握數學**：M1/M2為必需。微積分、線性代數及概率是核心工具。",
                    "**學習編程**：用於數據分析及計量經濟建模的Python及R。",
                    "**追蹤市場**：每日閱讀金融新聞及了解經濟指標。",
                    "**建立量化基礎**：強大數學技能讓你在金融事業中脫穎而出。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
