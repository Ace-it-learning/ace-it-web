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

# JS5311 - BBA in Economics / 工商管理學士（經濟學）
programme = {
    "code": "JS5311",
    "nameEn": "BBA in Economics",
    "nameZh": "工商管理學士（經濟學）",
    "name": "BBA in Economics",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 31,
    "band_a": 34,
    "category": "business"
}

details = {
    "code": "JS5311",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Best 5 typically 31-34 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is highly recommended. Economics at Level 4+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Interest in economic analysis, policy debate participation, and quantitative reasoning skills are valued."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Microeconomics, macroeconomics, calculus, statistics, and business fundamentals.",
                    "**Year 2 - Core Economics**: Intermediate micro/macro, econometrics, game theory, and international economics.",
                    "**Year 3 - Advanced Topics**: Industrial organization, labor economics, public finance, behavioral economics, and financial economics.",
                    "**Year 4 - Specialization & Research**: Economic research project, policy analysis, and advanced electives.",
                    "**Quantitative Focus**: Strong emphasis on econometrics, data analysis, and mathematical modeling of economic phenomena.",
                    "**Business Integration**: BBA structure ensures exposure to accounting, finance, and management alongside economics."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Financial Services**: Economic research, strategy analysis, and risk assessment at banks and asset managers.",
                    "**Consulting**: Economic consulting, policy advisory, and market analysis at consulting firms.",
                    "**Government & Policy**: Economic analyst positions at HKMA, Census and Statistics Department, and think tanks.",
                    "**Technology**: Data analyst, business analyst, and strategy roles at tech companies leveraging economic modeling.",
                    "**Academia & Research**: Research assistant positions and PhD studies in economics at top universities.",
                    "**Corporate Strategy**: Market entry analysis, competitive intelligence, and strategic planning at corporations."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Research Facilities**: Economics computer lab with Stata, R, Python, and specialized econometrics software.",
                    "**Seminars**: Regular economics seminars featuring visiting professors and industry economists.",
                    "**Student Societies**: Economics Society, debate club, and investment clubs for intellectual engagement.",
                    "**Global Exposure**: Exchange opportunities with top economics departments worldwide.",
                    "**Industry Connections**: Alumni network in government, finance, and consulting providing mentorship."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Strong demand from students interested in analytical and policy careers.",
                    "**Academic Requirements**: Best 5 around 31-34. Strong mathematics performance is important.",
                    "**Band A Competition**: Competitive. Band A placement recommended.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong mathematics and economics grades with analytical thinking ability.",
                    "**Trend**: Stable demand due to versatile career options in finance, consulting, and policy."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Policy Makers**: Alumni in economic policy roles at HKMA, government bureaus, and international organizations.",
                    "**Finance Professionals**: Graduates in research and strategy at investment banks and asset management firms.",
                    "**Academic Economists**: Alumni pursuing PhDs and academic careers at leading universities.",
                    "**Consultants**: Economic and strategy consultants at top-tier consulting firms.",
                    "**Faculty Excellence**: HKUST economics faculty includes renowned researchers in international trade, finance, and development economics."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong academic records.",
                    "**Business School Scholarships**: Merit-based awards for economics students.",
                    "**Research Grants**: Funding for undergraduate economic research projects.",
                    "**Exchange Support**: For semester abroad at partner economics departments.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Economics Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 32+. Mathematics at Level 5 is highly recommended.",
                    "**Strengthen Quantitative Skills**: M1/M2 and strong statistics foundation are crucial for econometrics.",
                    "**Read Widely**: Follow economic news, understand policy debates, and read introductory economics books.",
                    "**Develop Analytical Thinking**: Practice logical reasoning and data interpretation skills.",
                    "**Consider PhD Path**: If interested in research, build relationships with professors and seek RA opportunities."
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
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上高度建議。經濟達4級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：對經濟分析、政策辯論參與及量化推理能力的興趣受重視。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：微觀經濟學、宏觀經濟學、微積分、統計學及商業基礎。",
                    "**第二年 - 經濟學核心**：中級微觀/宏觀經濟學、計量經濟學、博弈論及國際經濟學。",
                    "**第三年 - 高級課題**：產業組織、勞動經濟學、公共財政、行為經濟學及金融經濟學。",
                    "**第四年 - 專修及研究**：經濟研究項目、政策分析及高級選修科。",
                    "**量化專注**：強調計量經濟學、數據分析及經濟現象數學建模。",
                    "**商業整合**：工商管理學士結構確保經濟學以外接觸會計、金融及管理。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**金融服務**：於銀行及資產管理公司從事經濟研究、策略分析及風險評估。",
                    "**顧問**：於顧問公司從事經濟顧問、政策諮詢及市場分析。",
                    "**政府及政策**：於金管局、政府統計處及智庫擔任經濟分析師。",
                    "**科技界**：於科技公司利用經濟建模擔任數據分析師、商業分析師及策略職位。",
                    "**學術界及研究**：研究助理職位及於頂尖大學攻讀經濟學博士。",
                    "**企業策略**：於企業從事市場進入分析、競爭情報及策略規劃。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**研究設施**：配備Stata、R、Python及專門計量經濟學軟件的經濟學電腦實驗室。",
                    "**研討會**：定期經濟學研討會，邀請訪問教授及業界經濟學家。",
                    "**學生學會**：經濟學會、辯論學會及投資學會供智力交流。",
                    "**全球視野**：與全球頂尖經濟學系交流機會。",
                    "**產業聯繫**：政府、金融及顧問業校友網絡提供指導。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。深受對分析及政策事業感興趣的學生歡迎。",
                    "**學術要求**：最佳五科約31-34分。優異數學表現很重要。",
                    "**Band A競爭**：競爭激烈。建議Band A選擇。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異數學及經濟成績，具備分析思維能力。",
                    "**趨勢**：由於金融、顧問及政策方面多樣化職業選擇，需求穩定。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**政策制定者**：校友於金管局、政府決策局及國際組織擔任經濟政策職位。",
                    "**金融專業人士**：畢業生於投資銀行及資產管理公司從事研究及策略。",
                    "**學術經濟學家**：校友於領先大學攻讀博士及學術事業。",
                    "**顧問**：頂尖顧問公司的經濟及策略顧問。",
                    "**教職員卓越**：科大經濟學教職員包括國際貿易、金融及發展經濟學領域著名研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**商學院獎學金**：頒予經濟學學生的優異獎。",
                    "**研究資助**：本科生經濟研究項目資金。",
                    "**交流支援**：夥伴經濟學系海外學期支援。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大經濟學攻略",
                "content": [
                    "**分數目標**：最佳五科目標32分以上。數學達5級高度建議。",
                    "**加強量化技能**：M1/M2及穩固統計基礎對計量經濟學至關重要。",
                    "**廣泛閱讀**：追蹤經濟新聞、了解政策辯論及閱讀經濟學入門書籍。",
                    "**培養分析思維**：練習邏輯推理及數據詮釋技能。",
                    "**考慮博士途徑**：如對研究感興趣，與教授建立關係並尋求研究助理機會。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
