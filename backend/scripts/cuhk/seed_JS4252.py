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
    "code": "JS4252",
    "nameEn": "Quantitative Finance",
    "nameZh": "計量金融學",
    "name": "計量金融學",
    "university": "香港中文大學",
    "faculty": "商學院",
    "median": 29,
    "band_a": 31,
    "category": "business",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Quantitative Finance is highly competitive. The median admission score is typically Best 5 = 27-29 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 5+ strongly preferred), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Mathematics (Extended Part M1/M2), Physics, BAFS, or Economics are highly advantageous. Exceptional mathematical ability is essential.",
            "**Interview**: Individual interview assessing mathematical maturity, programming aptitude, understanding of financial markets, and motivation for quantitative finance.",
            "**Non-Academic Factors**: Mathematics competition awards, programming experience (Python, R, C++), quantitative trading simulations, and research projects are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Mathematical Foundations**: Advanced calculus, linear algebra, probability theory, statistics, and introduction to financial economics.",
            "**Year 2 - Core Quantitative Methods**: Stochastic calculus, numerical methods, time series analysis, derivative pricing models, and programming for finance (Python, R, MATLAB).",
            "**Year 3 - Advanced Finance**: Risk management, algorithmic trading, machine learning in finance, fixed income modelling, and credit derivatives.",
            "**Year 4 - Research & Practice**: Capstone quantitative research project, advanced econometrics, and preparation for graduate studies or quant roles.",
            "**Practical Training**: Quantitative trading simulations, financial data analysis projects, internship at investment banks or hedge funds, and CFA/FRM preparation.",
            "**Unique Features**: One of Asia's most rigorous quantitative finance programmes with strong emphasis on mathematical theory and computational implementation."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Quantitative Analyst (Quant)**: Front-office quants at investment banks developing pricing models and trading strategies.",
            "**Algorithmic Trading**: Quantitative traders and strategists designing automated trading systems at hedge funds and prop trading firms.",
            "**Risk Quant**: Risk modellers and quantitative risk analysts at banks and asset managers managing complex financial risks.",
            "**Data Science in Finance**: Data scientists and machine learning engineers applying AI to financial prediction and portfolio optimisation.",
            "**Structuring & Derivatives**: Derivatives structurers and exotic product specialists at investment banks.",
            "**Graduate Studies**: PhD programmes in financial engineering, operations research, or statistics at top universities worldwide."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Quant Lab**: Dedicated computational finance lab with high-performance computing, Bloomberg Terminals, and specialised quantitative software.",
            "**Programming Training**: Intensive coding bootcamps in Python, R, C++, and SQL specifically designed for financial applications.",
            "**Student Competitions**: Active participation in quantitative trading competitions, mathematical modelling contests, and CFA Research Challenge.",
            "**Industry Connections**: Recruitment partnerships with Goldman Sachs Quant, Morgan Stanley Strats, Two Sigma, and other top quant employers.",
            "**Global Exposure**: Exchange programmes with CMU Computational Finance, Baruch MFE, Princeton ORFE, and other elite quant programmes."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Very High (★★★★★). One of CUHK's most competitive programmes requiring exceptional mathematical ability.",
            "**Academic Requirements**: Best 5 around 27-29. Mathematics (Extended) at Level 5+ is strongly preferred; many successful applicants have M1/M2 backgrounds.",
            "**Band A Competition**: Typically 4-5 applicants per place. The programme attracts Hong Kong's strongest mathematics students.",
            "**Interview Weighting**: Very High. The interview tests mathematical thinking, problem-solving under pressure, and genuine passion for quantitative methods.",
            "**What Differentiates Winners**: Exceptional mathematics competition results, programming skills, and clear understanding of what quantitative finance entails.",
            "**Trend**: Extremely high demand as algorithmic trading, fintech, and data-driven finance transform the industry."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Hoi Ying Wong**: Renowned expert in financial mathematics, derivative pricing, and quantitative risk management.",
            "**Professor Xianhua Peng**: Leading scholar in stochastic processes and their applications to financial modelling.",
            "**Alumni Network**: Graduates work as quants at top investment banks (Goldman Sachs, JPMorgan, Deutsche Bank), hedge funds (Two Sigma, Citadel, D.E. Shaw), and fintech companies.",
            "**Research Excellence**: CUHK is internationally recognised for research in financial mathematics, stochastic analysis, and computational finance.",
            "**Industry Impact**: Faculty research informs derivative pricing models, risk management frameworks, and regulatory standards in Hong Kong's financial markets."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Business Scholarships**: Merit-based awards for outstanding academic performance in business programmes.",
            "**Quantitative Excellence Awards**: Special recognition for students with exceptional mathematical and programming abilities.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Industry Sponsorships**: Quantitative trading firms and investment banks sponsor top students with guaranteed internships."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Quantitative Finance Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 29+ with Mathematics (Extended) at Level 5 or above. This is a programme for mathematical elites.",
            "**Master Advanced Mathematics**: Excel in calculus, linear algebra, probability, and statistics. Mathematics competition experience (HKMO, AIMO) is a major advantage.",
            "**Learn Programming**: Start learning Python and R now. Build projects analysing financial data, backtesting strategies, or implementing pricing models.",
            "**Understand Quant Finance**: Read about Black-Scholes, Monte Carlo simulation, and algorithmic trading to show you understand what the field involves.",
            "**Practise Problem-Solving**: The interview may include mathematical puzzles and quantitative reasoning questions. Practise thinking under pressure."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大計量金融學競爭程度非常激烈。中位數入學成績通常為最佳五科27-29分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 4+）、數學（必修部分，Level 5+強烈建議）及公民與社會發展科合格。",
            "**優先選修科**：數學（延伸部分M1/M2）、物理、企會財或經濟均非常有優勢。卓越的數學能力至關重要。",
            "**面試**：個人面試，評估數學成熟度、編程天賦、對金融市場的理解及對計量金融的動機。",
            "**非學術因素**：數學比賽獎項、編程經驗（Python、R、C++）、量化交易模擬及研究項目均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 數學基礎**：高等微積分、線性代數、概率論、統計學及金融經濟學導論。",
            "**第二年 - 核心量化方法**：隨機微積分、數值方法、時間序列分析、衍生工具定價模型及金融編程（Python、R、MATLAB）。",
            "**第三年 - 高級金融**：風險管理、算法交易、金融機器學習、固定收益建模及信貸衍生工具。",
            "**第四年 - 研究與實踐**：畢業量化研究項目、高級計量經濟學及為升學或量化職位作準備。",
            "**實務訓練**：量化交易模擬、金融數據分析項目、投資銀行或對沖基金實習及CFA/FRM準備。",
            "**課程特色**：亞洲最嚴謹的計量金融課程之一，強調數學理論及計算實施。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**量化分析師**：投資銀行前台量化分析師，開發定價模型及交易策略。",
            "**算法交易**：對沖基金及自營交易公司的量化交易員及策略師，設計自動交易系統。",
            "**風險量化**：銀行及資產管理公司的風險建模師及量化風險分析員，管理複雜金融風險。",
            "**金融數據科學**：應用人工智能於金融預測及投資組合優化的數據科學家及機器學習工程師。",
            "**結構化及衍生工具**：投資銀行的衍生工具結構師及奇異產品專員。",
            "**深造**：全球頂尖大學的金融工程、運籌學或統計學博士課程。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**量化實驗室**：配備高性能計算、彭博終端及專業量化軟件的專用計算金融實驗室。",
            "**編程培訓**：專為金融應用設計的Python、R、C++及SQL密集編程訓練營。",
            "**學生比賽**：積極參與量化交易比賽、數學建模競賽及CFA研究挑戰賽。",
            "**業界聯繫**：與高盛量化、摩根士丹利策略部、Two Sigma及其他頂尖量化僱主的招聘夥伴關係。",
            "**國際視野**：與卡內基梅隆計算金融、巴魯克金融工程、普林斯頓運籌學與金融工程及其他精英量化課程進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：非常高（★★★★★）。中大最具競爭力的課程之一，需要卓越的數學能力。",
            "**學術要求**：最佳五科約27-29分。數學（延伸）達Level 5+強烈建議；許多成功申請者具M1/M2背景。",
            "**Band A競爭**：通常每個學額有4-5名申請人。課程吸引香港最強的數學學生。",
            "**面試比重**：非常高。面試測試數學思維、壓力下的解難能力及對量化方法的真正熱情。",
            "**成功申請者特質**：卓越的數學比賽成績、編程技巧及對計量金融內容的清晰理解。",
            "**趨勢**：隨著算法交易、金融科技及數據驅動金融改變行業，需求極高。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**王海燕教授**：金融數學、衍生工具定價及量化風險管理的著名專家。",
            "**彭獻華教授**：隨機過程及其金融建模應用的領先學者。",
            "**校友網絡**：畢業生在頂尖投資銀行（高盛、摩根大通、德意志銀行）、對沖基金（Two Sigma、Citadel、D.E. Shaw）及金融科技公司擔任量化分析師。",
            "**研究卓越**：中大在金融數學、隨機分析及計算金融方面的研究獲國際認可。",
            "**業界影響**：教職員研究為香港金融市場的衍生工具定價模型、風險管理框架及監管標準提供資訊。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**商學院獎學金**：根據商學院課程的優異學術表現頒發的獎學金。",
            "**量化卓越獎**：特別嘉許具卓越數學及編程能力的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**業界贊助**：量化交易公司及投資銀行贊助頂尖學生，提供保證實習。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大計量金融學攻略",
        "content": [
            "**分數目標**：最佳五科目標29分以上，數學（延伸）達Level 5或以上。這是數學精英的課程。",
            "**精通高等數學**：精通微積分、線性代數、概率及統計。數學比賽經驗（香港數學奧林匹克、亞洲數學奧林匹克）是重大優勢。",
            "**學習編程**：現在開始學習Python及R。建立分析金融數據、回測策略或實施定價模型的項目。",
            "**理解計量金融**：閱讀Black-Scholes、蒙特卡羅模擬及算法交易，展示你理解該領域的內容。",
            "**練習解難**：面試可能包括數學謎題及量化推理問題。練習在壓力下思考。"
        ]
    }
}

details = {
    "code": "JS4252",
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
