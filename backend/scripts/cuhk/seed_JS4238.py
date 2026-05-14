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
    "code": "JS4238",
    "nameEn": "Integrated BBA in Asset Management",
    "nameZh": "資產管理",
    "name": "資產管理",
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
            "**Academic Threshold**: CUHK Asset Management is highly competitive. The median admission score is typically Best 5 = 26-28 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 4+ strongly preferred), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: BAFS, Economics, Mathematics (Extended Part), or Physics are highly advantageous. Strong quantitative skills are essential.",
            "**Interview**: Group discussion and individual interview assessing financial acumen, analytical thinking, investment knowledge, and career commitment to asset management.",
            "**Non-Academic Factors**: Investment club participation, stock trading simulations, financial modelling competitions, and internship at financial institutions are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Business Foundations**: Financial accounting, economics, statistics, business law, and introduction to financial markets and investment principles.",
            "**Year 2 - Core Finance**: Corporate finance, investment analysis, portfolio management, derivatives, and financial modelling using Excel and Python.",
            "**Year 3 - Asset Management Specialisation**: Equity analysis, fixed income, alternative investments, risk management, and ESG investing. Students manage a real investment portfolio.",
            "**Year 4 - Professional Integration**: Advanced portfolio strategies, wealth management, hedge fund strategies, and capstone project with industry partners.",
            "**Practical Training**: Bloomberg Terminal certification, CFA Level 1 preparation, stock pitch competitions, and internship at asset management firms.",
            "**Unique Features**: Student-managed investment fund providing hands-on portfolio management experience with real capital. Strong CFA programme partnership."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Asset Management**: Investment analysts, portfolio managers, and fund managers at asset management firms managing billions in AUM.",
            "**Investment Banking**: Equity research analysts, M&A advisors, and capital markets specialists at global investment banks.",
            "**Private Banking**: Relationship managers, investment advisors, and wealth planners serving high-net-worth clients.",
            "**Hedge Funds & Private Equity**: Analysts and associates at alternative investment firms seeking alpha through diverse strategies.",
            "**Risk Management**: Risk analysts and compliance officers at financial institutions managing market, credit, and operational risks.",
            "**Fintech**: Product managers, data analysts, and strategists at fintech companies developing investment platforms and robo-advisors."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Trading Room**: State-of-the-art financial trading lab with Bloomberg Terminals, Reuters Eikon, and real-time market data feeds.",
            "**Student Investment Fund**: Manage a real portfolio with actual capital, making investment decisions and presenting to industry advisors.",
            "**Industry Connections**: Regular guest lectures by fund managers, CFA charterholders, and executives from BlackRock, Fidelity, and local asset managers.",
            "**Competitions**: Active participation in CFA Research Challenge, stock pitch competitions, and case competitions against global business schools.",
            "**Global Exposure**: Exchange programmes with Wharton, LSE, NYU Stern, and other top finance schools; international study tours to financial centres."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: High (★★★★☆). One of the most competitive business programmes at CUHK.",
            "**Academic Requirements**: Best 5 around 26-28. Mathematics at Level 4+ is almost essential for the quantitative curriculum.",
            "**Band A Competition**: Typically 3-4 applicants per place. Many applicants have demonstrated interest in finance and investing.",
            "**Interview Weighting**: Very High. The interview assesses financial knowledge, analytical thinking, and genuine passion for asset management.",
            "**What Differentiates Winners**: Investment experience (even simulated), strong quantitative skills, and clear understanding of the asset management profession.",
            "**Trend**: Extremely high demand as Hong Kong positions itself as Asia's leading asset management and wealth management hub."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Chu Zhang**: Renowned expert in asset pricing, behavioural finance, and investment management.",
            "**Professor Joseph Cheng**: Leading scholar in corporate finance and governance with extensive industry consultancy experience.",
            "**Alumni Network**: Graduates work at top asset managers (BlackRock, Fidelity, Value Partners), investment banks (Goldman Sachs, Morgan Stanley), and hedge funds.",
            "**Research Excellence**: CUHK Finance is consistently ranked among Asia's top finance departments with research in asset pricing and portfolio management.",
            "**Industry Impact**: Faculty serve on boards of listed companies, regulatory advisory panels, and as expert witnesses in financial disputes."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Business Scholarships**: Merit-based awards for outstanding academic performance in business programmes.",
            "**CFA Programme Scholarships**: Special recognition for students pursuing CFA charter with exam fee subsidies.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Industry Sponsorships**: Asset management firms sponsor top students with internship guarantees and recruitment fast-tracks."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Asset Management Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 28+ with Mathematics at Level 4 or above. Quantitative strength is essential.",
            "**Learn Investing**: Open a paper trading account, follow financial news, and practise analysing stocks using fundamental and technical analysis.",
            "**Understand Markets**: Read about asset classes (equities, bonds, alternatives), portfolio theory, and risk management before the interview.",
            "**Build Financial Literacy**: Familiarise yourself with financial statements, valuation methods (DCF, multiples), and economic indicators.",
            "**Show Passion**: Be prepared to discuss your investment philosophy, favourite stocks, and why you want to pursue asset management as a career."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大資產管理競爭程度激烈。中位數入學成績通常為最佳五科26-28分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 4+）、數學（必修部分，Level 4+強烈建議）及公民與社會發展科合格。",
            "**優先選修科**：企業、會計與財務概論、經濟、數學（延伸部分）或物理均非常有優勢。強大的量化技巧至關重要。",
            "**面試**：小組討論及個人面試，評估金融觸覺、分析思維、投資知識及對資產管理的職業承擔。",
            "**非學術因素**：投資學會參與、股票交易模擬、金融建模比賽及金融機構實習均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 商業基礎**：財務會計、經濟、統計、商業法及金融市場與投資原則導論。",
            "**第二年 - 核心金融**：公司金融、投資分析、投資組合管理、衍生工具及使用Excel和Python的金融建模。",
            "**第三年 - 資產管理專修**：股票分析、固定收益、另類投資、風險管理及ESG投資。學生管理真實投資組合。",
            "**第四年 - 專業整合**：高級投資組合策略、財富管理、對沖基金策略及與業界夥伴的畢業專題。",
            "**實務訓練**：彭博終端認證、CFA一級準備、股票推介比賽及資產管理公司實習。",
            "**課程特色**：學生管理投資基金提供真實資本的實務投資組合管理經驗。強大的CFA課程夥伴關係。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**資產管理**：資產管理公司的投資分析員、投資組合經理及基金經理，管理數十億資產。",
            "**投資銀行**：全球投資銀行的股票研究分析員、併購顧問及資本市場專員。",
            "**私人銀行**：服務高淨值客戶的客戶關係經理、投資顧問及財富規劃師。",
            "**對沖基金及私募股權**：另類投資公司的分析員及助理，透過多元策略尋求超額回報。",
            "**風險管理**：金融機構管理市場、信貸及營運風險的風險分析員及合規主任。",
            "**金融科技**：金融科技公司的產品經理、數據分析員及策略師，開發投資平台及智能投顧。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**交易室**：配備彭博終端、路透Eikon及實時市場數據的先进金融交易實驗室。",
            "**學生投資基金**：管理真實資本的投資組合，做出投資決策並向業界顧問展示。",
            "**業界聯繫**：貝萊德、富達及本地資產管理公司的基金經理、CFA持證人及高管定期嘉賓講座。",
            "**比賽**：積極參與CFA研究挑戰賽、股票推介比賽及與全球商學院的個案比賽。",
            "**國際視野**：與沃頓商學院、倫敦政治經濟學院、紐約大學斯特恩商學院等頂尖金融學院的交換計劃；金融中心國際學習團。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：激烈（★★★★☆）。中大最具競爭力的商學院課程之一。",
            "**學術要求**：最佳五科約26-28分。數學達Level 4+幾乎是量化課程的必要條件。",
            "**Band A競爭**：通常每個學額有3-4名申請人。許多申請者已展示對金融及投資的興趣。",
            "**面試比重**：非常高。面試評估金融知識、分析思維及對資產管理的真正熱情。",
            "**成功申請者特質**：投資經驗（即使是模擬的）、強大量化技巧及對資產管理專業的清晰理解。",
            "**趨勢**：隨著香港定位為亞洲領先的資產管理及財富管理中心，需求極高。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**張處教授**：資產定價、行為金融學及投資管理的著名專家。",
            "**鄭會榮教授**：公司金融及管治的領先學者，擁有豐富業界顧問經驗。",
            "**校友網絡**：畢業生在頂尖資產管理公司（貝萊德、富達、惠理基金）、投資銀行（高盛、摩根士丹利）及對沖基金工作。",
            "**研究卓越**：中大金融學在資產定價及投資組合管理方面的研究持續位居亞洲頂尖金融學系之列。",
            "**業界影響**：教職員擔任上市公司董事、監管諮詢委員會成員及金融糾紛的專家證人。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**商學院獎學金**：根據商學院課程的優異學術表現頒發的獎學金。",
            "**CFA課程獎學金**：嘉許追求CFA持證的學生，提供考試費用補貼。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**業界贊助**：資產管理公司贊助頂尖學生，提供實習保證及招聘快速通道。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大資產管理攻略",
        "content": [
            "**分數目標**：最佳五科目標28分以上，數學達Level 4或以上。量化能力至關重要。",
            "**學習投資**：開設模擬交易賬戶，追蹤財經新聞，練習使用基本面及技術分析分析股票。",
            "**理解市場**：面試前閱讀資產類別（股票、債券、另類投資）、投資組合理論及風險管理。",
            "**建立金融素養**：熟悉財務報表、估值方法（DCF、倍數）及經濟指標。",
            "**展示熱情**：準備討論你的投資理念、喜愛的股票及為何想追求資產管理職業。"
        ]
    }
}

details = {
    "code": "JS4238",
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
