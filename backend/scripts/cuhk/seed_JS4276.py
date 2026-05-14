import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

from azure.cosmos import CosmosClient

endpoint = os.getenv('AZURE_COSMOS_ENDPOINT')
key = os.getenv('AZURE_COSMOS_KEY')
client = CosmosClient(endpoint, key)
db = client.get_database_client('aceit')
container = db.get_container_client('jupas_programmes')

programme = {
    "code": "JS4276",
    "nameEn": "Quantitative Finance and Risk Management",
    "nameZh": "計量金融與風險管理",
    "name": "計量金融與風險管理",
    "university": "香港中文大學",
    "faculty": "商學院",
    "median": 28,
    "band_a": 30,
    "category": "business",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Quantitative Finance and Risk Management is highly competitive. The median admission score is typically Best 5 = 26-28 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 5+ strongly preferred), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Mathematics (Extended Part M1/M2), Physics, BAFS, or Economics are highly advantageous. Strong quantitative and analytical skills are essential.",
            "**Interview**: Individual interview assessing mathematical ability, understanding of financial risk, programming aptitude, and motivation for risk management careers.",
            "**Non-Academic Factors**: Mathematics competition awards, programming projects, financial risk analysis experience, and internship at banks or financial institutions are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Advanced calculus, linear algebra, probability, statistics, financial economics, and introduction to risk management.",
            "**Year 2 - Core Methods**: Stochastic processes, numerical methods, derivative pricing, financial econometrics, and programming for risk analysis (Python, R, MATLAB).",
            "**Year 3 - Risk Specialisation**: Credit risk modelling, market risk (VaR, ES), operational risk, liquidity risk, Basel regulations, and stress testing.",
            "**Year 4 - Professional Integration**: Enterprise risk management, regulatory compliance, machine learning for risk, and capstone project with industry partners.",
            "**Practical Training**: Risk modelling projects using real bank data, FRM Part I preparation, Bloomberg Terminal certification, and internship at risk management departments.",
            "**Unique Features**: Strong focus on regulatory risk management (Basel III/IV) with industry partnerships with major banks' risk departments in Hong Kong."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Market Risk**: Market risk analysts and managers at investment banks measuring and controlling trading portfolio risks.",
            "**Credit Risk**: Credit risk modellers and portfolio managers developing PD/LGD models and managing loan portfolios.",
            "**Operational Risk**: Operational risk analysts designing control frameworks and conducting risk assessments at financial institutions.",
            "**Model Risk**: Model validation quants reviewing and validating pricing and risk models used by trading desks.",
            "**Regulatory Risk**: Regulatory compliance officers and Basel implementation specialists ensuring banks meet capital requirements.",
            "**Consulting**: Risk management consultants at firms like McKinsey, Oliver Wyman, and Deloitte advising on risk transformation."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Risk Lab**: Dedicated risk analytics lab with Bloomberg Terminals, risk management software (Moody's, SAS), and real-time market data.",
            "**Industry Partnerships**: Collaboration with HSBC, Standard Chartered, and Bank of China risk departments for guest lectures and case studies.",
            "**Student Competitions**: Participation in risk management case competitions, FRM challenge, and quantitative finance competitions.",
            "**Professional Certification**: Programme prepares students for FRM (Financial Risk Manager) and PRM (Professional Risk Manager) certifications.",
            "**Global Exposure**: Exchange programmes with risk management programmes at LSE, NYU Stern, and Singapore Management University."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: High (★★★★☆). Appeals to students with strong mathematics who want to apply quantitative skills to financial risk.",
            "**Academic Requirements**: Best 5 around 26-28. Mathematics (Extended) at Level 5+ is strongly preferred for the quantitative curriculum.",
            "**Band A Competition**: Typically 3-4 applicants per place. Many applicants have strong mathematics and programming backgrounds.",
            "**Interview Weighting**: High. The interview assesses quantitative thinking, understanding of risk concepts, and career motivation.",
            "**What Differentiates Winners**: Strong mathematics foundation, programming skills, awareness of financial regulations, and clear interest in risk management.",
            "**Trend**: Growing demand as banks invest heavily in risk management following post-2008 regulatory reforms (Basel III/IV)."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Hoi Ying Wong**: Renowned expert in financial mathematics and quantitative risk management.",
            "**Professor Xianhua Peng**: Leading scholar in stochastic analysis with applications to credit and market risk modelling.",
            "**Alumni Network**: Graduates work in risk management at major banks (HSBC, JP Morgan, Deutsche Bank), rating agencies (Moody's, S&P), and consulting firms.",
            "**Research Excellence**: CUHK is recognised for research in financial risk modelling, Basel compliance, and stress testing methodologies.",
            "**Industry Impact**: Faculty research informs risk management practices and regulatory standards in Hong Kong's banking sector."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Business Scholarships**: Merit-based awards for outstanding academic performance in business programmes.",
            "**Risk Management Awards**: Special recognition for students with exceptional quantitative and risk analysis skills.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**FRM Certification Grants**: Funding for FRM exam fees and professional risk management certification programmes."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Quantitative Finance & Risk Management Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 28+ with Mathematics (Extended) at Level 5 or above. Quantitative strength is essential.",
            "**Master Probability & Statistics**: Risk management is built on probability theory. Excel in distributions, hypothesis testing, and regression.",
            "**Learn Programming**: Start with Python and R. Build projects analysing financial data and calculating risk metrics (VaR, volatility).",
            "**Understand Basel Regulations**: Read about Basel III capital requirements, stress testing, and regulatory frameworks for banks.",
            "**Follow Risk News**: Track banking risk events, regulatory changes, and how financial institutions manage different types of risk."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大計量金融與風險管理競爭程度激烈。中位數入學成績通常為最佳五科26-28分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 4+）、數學（必修部分，Level 5+強烈建議）及公民與社會發展科合格。",
            "**優先選修科**：數學（延伸部分M1/M2）、物理、企會財或經濟均非常有優勢。強大的量化及分析技巧至關重要。",
            "**面試**：個人面試，評估數學能力、對金融風險的理解、編程天賦及對風險管理職業的動機。",
            "**非學術因素**：數學比賽獎項、編程項目、金融風險分析經驗及銀行或金融機構實習均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：高等微積分、線性代數、概率、統計、金融經濟學及風險管理導論。",
            "**第二年 - 核心方法**：隨機過程、數值方法、衍生工具定價、金融計量經濟學及風險分析編程（Python、R、MATLAB）。",
            "**第三年 - 風險專修**：信貸風險建模、市場風險（VaR、ES）、營運風險、流動性風險、巴塞爾法規及壓力測試。",
            "**第四年 - 專業整合**：企業風險管理、監管合規、風險機器學習及與業界夥伴的畢業專題。",
            "**實務訓練**：使用真實銀行數據的風險建模項目、FRM一級準備、彭博終端認證及風險管理部門實習。",
            "**課程特色**：強調監管風險管理（巴塞爾III/IV），與香港主要銀行的風險部門有行業夥伴關係。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**市場風險**：投資銀行量度及控制交易投資組合風險的市場風險分析員及經理。",
            "**信貸風險**：開發違約概率/違約損失率模型及管理貸款組合的信貸風險建模師及投資組合經理。",
            "**營運風險**：設計控制框架及進行風險評估的金融機構營運風險分析員。",
            "**模型風險**：審查及驗證交易部門使用的定價及風險模型的模型驗證量化分析師。",
            "**監管風險**：確保銀行符合資本要求的監管合規主任及巴塞爾實施專員。",
            "**顧問**：麥肯錫、奧緯諮詢及德勤等公司的風險管理顧問，就風險轉型提供建議。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**風險實驗室**：配備彭博終端、風險管理軟件（穆迪、SAS）及實時市場數據的專用風險分析實驗室。",
            "**業界夥伴**：與滙豐、渣打及中國銀行風險部門合作進行嘉賓講座及個案研究。",
            "**學生比賽**：參與風險管理個案比賽、FRM挑戰賽及量化金融比賽。",
            "**專業認證**：課程為學生準備FRM（金融風險管理師）及PRM（專業風險管理師）認證。",
            "**國際視野**：與倫敦政治經濟學院、紐約大學斯特恩商學院及新加坡管理大學的風險管理課程進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：激烈（★★★★☆）。吸引具強大數學能力並希望將量化技巧應用於金融風險的學生。",
            "**學術要求**：最佳五科約26-28分。數學（延伸）達Level 5+強烈建議用於量化課程。",
            "**Band A競爭**：通常每個學額有3-4名申請人。許多申請者具強大數學及編程背景。",
            "**面試比重**：高。面試評估量化思維、對風險概念的理解及職業動機。",
            "**成功申請者特質**：穩固數學基礎、編程技巧、對金融法規的認識及對風險管理的明確興趣。",
            "**趨勢**：隨著銀行在2008年後監管改革（巴塞爾III/IV）後大量投資風險管理，需求增加。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**王海燕教授**：金融數學及量化風險管理的著名專家。",
            "**彭獻華教授**：隨機分析及其在信貸及市場風險建模應用的領先學者。",
            "**校友網絡**：畢業生在主要銀行（滙豐、摩根大通、德意志銀行）、評級機構（穆迪、標準普爾）及顧問公司從事風險管理。",
            "**研究卓越**：中大在金融風險建模、巴塞爾合規及壓力測試方法論方面的研究獲得認可。",
            "**業界影響**：教職員研究為香港銀行業的風險管理實踐及監管標準提供資訊。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**商學院獎學金**：根據商學院課程的優異學術表現頒發的獎學金。",
            "**風險管理獎項**：特別嘉許具卓越量化及風險分析技巧的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**FRM認證資助**：FRM考試費用及專業風險管理認證計劃的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大計量金融與風險管理攻略",
        "content": [
            "**分數目標**：最佳五科目標28分以上，數學（延伸）達Level 5或以上。量化能力至關重要。",
            "**精通概率與統計**：風險管理建基於概率理論。精通分佈、假設檢定及回歸。",
            "**學習編程**：從Python及R開始。建立分析金融數據及計算風險指標（VaR、波動率）的項目。",
            "**理解巴塞爾法規**：閱讀巴塞爾III資本要求、壓力測試及銀行監管框架。",
            "**追蹤風險新聞**：追蹤銀行風險事件、監管變化及金融機構如何管理不同類型的風險。"
        ]
    }
}

details = {
    "code": "JS4276",
    "university": "香港中文大學",
    "en": {"sections": en_sections},
    "zh": {"sections": zh_sections}
}

prog_doc = {
    "id": f"prog_{programme['code']}",
    "pk": "programmes",
    "type": "programme",
    **programme,
    "updatedAt": "2026-05-14T12:00:00Z"
}
container.upsert_item(body=prog_doc)
print(f"[Seed] Upserted programme {programme['code']}")

detail_doc = {
    "id": f"detail_{details['code']}",
    "pk": "details",
    "type": "programme_detail",
    **details,
    "updatedAt": "2026-05-14T12:00:00Z"
}
container.upsert_item(body=detail_doc)
print(f"[Seed] Upserted details {details['code']}")
print("[Seed] Done!")
