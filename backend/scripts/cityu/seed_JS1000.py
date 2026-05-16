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

# JS1000 - BSc Computational Finance and Financial Technology / 理學士(計算金融及金融科技)
# Data sources:
# - JUPAS 2025 Admissions Scores PDF (af_2025_JUPAS.pdf): Median 24.5, Lower Quartile 23.5
# - JUPAS Website: Entry requirements, application/offer statistics
# - CityU CFFT Programme Page (prog.cb.cityu.edu.hk/academics/cfft): Programme features, careers

programme = {
    "code": "JS1000",
    "nameEn": "BSc Computational Finance and Financial Technology",
    "nameZh": "理學士(計算金融及金融科技)",
    "name": "BSc Computational Finance and Financial Technology",
    "university": "香港城市大學",
    "faculty": "商學院",
    "median": 24.5,
    "band_a": 23.5,
    "category": "business"
}

details = {
    "code": "JS1000",
    "university": "香港城市大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Admission Score Formula**: Best 5 subjects (include English and Mathematics). All subjects weighted ×1.",
                    "**Median Admission Score**: 24.5 (2025 JUPAS data).",
                    "**Lower Quartile**: 23.5 (2025 JUPAS data).",
                    "**Core Subjects Minimum Level**: Chinese Language 3, English Language 3, Mathematics (Compulsory Part) 4, Citizenship and Social Development Attained.",
                    "**Elective Subjects**: ANY 2 SUBJECTS at Level 3. M1/M2 can be used to meet elective requirement (counted as one subject only if both taken). Applied Learning (ApL) subjects are NOT counted as elective subjects.",
                    "**2025 Application Statistics**: Band A 84 applicants, Total 1,290 applicants, 7 offers made.",
                    "**First Year Tuition**: HK$47,000."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Programme Overview**: BSc Computational Finance and Financial Technology (CFFT) is an interdisciplinary programme launched in 2016, offering state-of-the-art training in finance, mathematics, statistics, and computer programming.",
                    "**Two Streams**: (1) Computational Finance Stream — focuses on quantitative finance, mathematical modeling, and financial analytics; (2) Financial Technology Stream — focuses on FinTech innovation, blockchain, and digital finance.",
                    "**Computational Finance Stream**: Covers quantitative trading, risk management, derivatives pricing, portfolio optimization, and financial econometrics. Prepares students for careers requiring high-caliber quantitative and analytical skills.",
                    "**Financial Technology Stream**: Covers blockchain technology, algorithmic trading, digital banking, payment systems, and financial data analytics. Prepares students for the burgeoning world of FinTech.",
                    "**CityUHK Financial Simulation Lab**: A futuristic gateway where finance meets technology, equipped with state-of-the-art trading and analytics platforms.",
                    "**Professional Examination Support**: Programme provides support for professional qualifications in finance and technology.",
                    "**Duration**: 4 years full-time."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Quantitative Trading/Research**: Creating and implementing mathematical models to identify profitable trading opportunities using algorithms and sophisticated programming (Python, R).",
                    "**Asset Management**: Managing client portfolios, offering investment advice, working with equities, bonds, commodities, hedge funds, pension plans, mutual funds, and ETFs.",
                    "**Investment Banking**: Working with companies to raise capital, mergers and acquisitions, underwriting, and securities trading.",
                    "**Risk Management**: Risk analyst, risk manager, or risk consultant roles — developing risk management strategies and analyzing financial data.",
                    "**FinTech Development**: Software engineering and product development roles at digital banks, payment companies, and blockchain startups.",
                    "**Data Science**: Data analyst and machine learning engineer positions leveraging finance domain expertise."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Financial Simulation Lab**: High-performance computing facility with financial databases, trading platforms, and development environments.",
                    "**Industry Partnerships**: Collaborations with banks, fintech companies, and financial data providers.",
                    "**Student Community**: Active CFFT Society, coding competitions, and fintech hackathons.",
                    "**Professional Networks**: Access to alumni working in quantitative finance and fintech globally."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Strong demand for quantitative finance and fintech talent.",
                    "**Academic Requirements**: Median 24.5, Lower Quartile 23.5. Mathematics (Compulsory Part) Level 4 required.",
                    "**Band A Competition**: 84 Band A applicants for 7 places in 2025 — approximately 12:1 ratio.",
                    "**What Differentiates Winners**: Strong mathematics foundation and programming interest.",
                    "**Trend**: Surging demand due to fintech boom and quantitative finance growth."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Quantitative Analysts**: Alumni at investment banks and hedge funds in Hong Kong and globally.",
                    "**FinTech Professionals**: Graduates at digital banks, payment companies, and blockchain startups.",
                    "**Data Scientists**: Alumni in tech companies applying machine learning to financial problems.",
                    "**Faculty Excellence**: CFFT faculty includes experts in computational finance, blockchain, and financial machine learning."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**CityUHK Admission Scholarships**: For outstanding HKDSE performers with strong mathematics grades.",
                    "**CFFT Excellence Awards**: Merit-based scholarships for quantitative and programming talent.",
                    "**Industry-Sponsored Scholarships**: From banks and fintech companies supporting talent development.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's CityU CFFT Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 25+. Mathematics (Compulsory Part) at Level 4 is the minimum requirement.",
                    "**Master Mathematics**: Strong foundation in calculus, probability, and linear algebra is essential.",
                    "**Learn Programming**: Python and R are essential tools for computational finance.",
                    "**Choose Your Stream Early**: Understand the difference between Computational Finance (quant-focused) and FinTech (tech-focused) streams.",
                    "**Build Projects**: Create trading algorithms or financial models to demonstrate practical skills."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**入學計分公式**：最佳五科（包括英文及數學）。所有科目加權×1。",
                    "**入學中位數**：24.5分（2025年聯招數據）。",
                    "**下四分位數**：23.5分（2025年聯招數據）。",
                    "**核心科目最低要求**：中國語文第3級、英國語文第3級、數學（必修部分）第4級、公民與社會發展科達標。",
                    "**選修科目**：任何2科達第3級。數學延伸部分（M1/M2）可滿足選修要求（如兩科皆修則只計一科）。應用學習科目不計入選修科目。",
                    "**2025年申請統計**：Band A申請者84人，總申請者1,290人，錄取7人。",
                    "**首年學費**：港幣47,000元。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**課程概覽**：理學士（計算金融及金融科技）是2016年推出的跨學科課程，提供金融、數學、統計及電腦編程的尖端培訓。",
                    "**兩個專修**：(1) 計算金融專修——專注量化金融、數學建模及金融分析；(2) 金融科技專修——專注金融科技創新、區塊鏈及數碼金融。",
                    "**計算金融專修**：涵蓋量化交易、風險管理、衍生工具定價、投資組合優化及金融計量經濟學。為需要高階量化及分析技能的金融職業做好準備。",
                    "**金融科技專修**：涵蓋區塊鏈技術、算法交易、數碼銀行、支付系統及金融數據分析。為蓬勃發展的金融科技世界做好準備。",
                    "**城大金融模擬實驗室**：配備尖端交易及分析平台的未來設施，讓金融與科技相遇。",
                    "**專業考試支援**：課程為金融及科技專業資格提供支援。",
                    "**修讀年期**：4年全日制。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**量化交易／研究**：創建及實施數學模型，利用算法及複雜編程（Python、R）識別有利可圖的交易機會。",
                    "**資產管理**：管理客戶投資組合、提供投資建議，從事股票、債券、商品、對沖基金、退休金計劃、互惠基金及交易所買賣基金。",
                    "**投資銀行**：協助公司籌集資金、併購、承銷及證券交易。",
                    "**風險管理**：風險分析師、風險經理或風險顧問職位——制定風險管理策略及分析金融數據。",
                    "**金融科技開發**：於數碼銀行、支付公司及區塊鏈初創企業擔任軟件工程及產品開發職位。",
                    "**數據科學**：利用金融領域專業知識擔任數據分析師及機器學習工程師。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**金融模擬實驗室**：配備金融數據庫、交易平台及開發環境的高性能計算設施。",
                    "**產業夥伴關係**：與銀行、金融科技公司及金融數據供應商合作。",
                    "**學生社群**：活躍的計算金融及金融科技學會、編程競賽及金融科技黑客松。",
                    "**專業網絡**：接觸於全球量化金融及金融科技領域工作的校友。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。量化金融及金融科技人才需求強勁。",
                    "**學術要求**：中位數24.5分，下四分位數23.5分。數學（必修部分）需達第4級。",
                    "**Band A競爭**：2025年84名Band A申請者競爭7個學額——約12:1比率。",
                    "**成功申請者特質**：優異數學基礎及編程興趣。",
                    "**趨勢**：由於金融科技蓬勃及量化金融增長，需求激增。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**量化分析師**：校友於香港及全球投資銀行及對沖基金。",
                    "**金融科技專業人士**：畢業生於數碼銀行、支付公司及區塊鏈初創企業。",
                    "**數據科學家**：校友於科技公司應用機器學習解決金融問題。",
                    "**教職員卓越**：計算金融及金融科技教職員包括計算金融、區塊鏈及金融機器學習專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**城大入學獎學金**：適用於香港中學文憑考試成績卓越且數學成績優異的學生。",
                    "**計算金融及金融科技卓越獎**：按量化及編程才能頒發的優異獎。",
                    "**業界贊助獎學金**：銀行及金融科技公司支持人才發展的獎學金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 城大計算金融及金融科技攻略",
                "content": [
                    "**分數目標**：最佳五科目標25分以上。數學（必修部分）第4級為最低要求。",
                    "**掌握數學**：微積分、概率及線性代數的穩固基礎至關重要。",
                    "**學習編程**：Python及R是計算金融的必需工具。",
                    "**及早選擇專修**：了解計算金融（量化導向）與金融科技（科技導向）專修的分別。",
                    "**建立項目**：創建交易算法或金融模型以展示實踐技能。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
print(f"[Seed] Updated median: {programme['median']}, band_a (LQ): {programme['band_a']}")
