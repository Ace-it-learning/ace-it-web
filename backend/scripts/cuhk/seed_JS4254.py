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
    "code": "JS4254",
    "nameEn": "Global Economics and Finance",
    "nameZh": "環球經濟與金融",
    "name": "環球經濟與金融",
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
            "**Academic Threshold**: CUHK Global Economics and Finance is highly competitive. The median admission score is typically Best 5 = 26-28 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 4+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Economics, BAFS, Mathematics (Extended Part), or Geography are advantageous. Strong analytical and writing skills are essential.",
            "**Interview**: Group discussion and individual interview assessing economic reasoning, global awareness, financial literacy, and communication skills.",
            "**Non-Academic Factors**: Economics essay competitions, investment club participation, Model UN or debate experience, and awareness of global economic issues are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Microeconomics, macroeconomics, calculus, statistics, and introduction to global financial systems.",
            "**Year 2 - Core Economics & Finance**: Intermediate economics, econometrics, international trade and finance, corporate finance, and financial markets.",
            "**Year 3 - Global Specialisation**: Development economics, monetary economics, global banking, emerging markets, and exchange rate economics. Students study abroad at partner universities.",
            "**Year 4 - Research & Policy**: Applied econometrics, economic policy analysis, financial regulation, and capstone research project on global economic issues.",
            "**Practical Training**: Economic data analysis using Stata and R, central bank simulations, policy brief writing, and internship at financial institutions or government.",
            "**Unique Features**: Mandatory semester abroad at top economics departments worldwide with strong focus on policy-relevant research and global economic literacy."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Investment Banking**: Analysts at global investment banks covering macro research, FX strategy, and emerging markets.",
            "**Economic Consulting**: Consultants at firms like McKinsey, BCG, and specialised economic consultancies advising on policy and strategy.",
            "**Central Banking & Policy**: Economists at HKMA, IMF, World Bank, and government economic bureaus shaping monetary and fiscal policy.",
            "**Asset Management**: Macro strategists, emerging market analysts, and ESG investment researchers at global asset managers.",
            "**International Organisations**: Analysts at UN agencies, OECD, and regional development banks working on global development.",
            "**Graduate Studies**: PhD programmes in economics at top universities (MIT, Harvard, Chicago, LSE) for academic careers."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Research Culture**: Strong emphasis on research-led teaching with faculty who are active researchers in international economics and finance.",
            "**Study Abroad**: Mandatory semester at partner universities including LSE, UC Berkeley, University of Toronto, and NUS for global perspective.",
            "**Student Societies**: Economics Society and Finance Society organise speaker series, case competitions, and networking with alumni in banking and policy.",
            "**Policy Engagement**: Opportunities to engage with HKMA, Financial Services Development Council, and think tanks through internships and seminars.",
            "**Global Network**: Alumni network spanning central banks, international organisations, investment banks, and top economics PhD programmes worldwide."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: High (★★★★☆). Popular among students interested in economics, policy, and global finance.",
            "**Academic Requirements**: Best 5 around 26-28. Economics background and strong mathematics are important for the analytical curriculum.",
            "**Band A Competition**: Typically 3-4 applicants per place. Many applicants have demonstrated interest in economics and current affairs.",
            "**Interview Weighting**: High. The interview assesses economic reasoning, global awareness, and ability to articulate complex ideas clearly.",
            "**What Differentiates Winners**: Strong writing skills, awareness of global economic issues, and clear career goals in economics or finance.",
            "**Trend**: Growing demand as Hong Kong strengthens its position as a global financial centre and policy hub for Asia."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Terence Chong**: Renowned economist specialising in Chinese economy, financial development, and behavioural economics.",
            "**Professor Travis Ng**: Leading scholar in industrial organisation, competition policy, and applied microeconomics.",
            "**Alumni Network**: Graduates work at HKMA, IMF, Goldman Sachs, McKinsey, and top economics PhD programmes worldwide.",
            "**Research Excellence**: CUHK Economics is ranked among Asia's top economics departments with research in international trade, development, and financial economics.",
            "**Policy Impact**: Faculty serve as advisors to government, central banks, and international organisations on economic policy."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Business Scholarships**: Merit-based awards for outstanding academic performance in business programmes.",
            "**Economics Department Awards**: Recognition for exceptional economic analysis and research potential.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Study Abroad Grants**: Funding for mandatory semester abroad at partner universities including living expenses."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Global Economics & Finance Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 28+ with strong Economics and Mathematics. Writing skills matter for policy analysis.",
            "**Follow Global Economics**: Read The Economist, Financial Times, and IMF reports daily. Understand key issues: inflation, trade wars, monetary policy.",
            "**Practise Economic Reasoning**: Be able to explain supply and demand, market failures, and trade-offs using real-world examples.",
            "**Develop Writing Skills**: Economics requires clear written communication. Practise writing policy briefs and economic essays.",
            "**Show Global Awareness**: Be prepared to discuss how global events (pandemics, geopolitics, climate change) affect economies and financial markets."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大環球經濟與金融競爭程度激烈。中位數入學成績通常為最佳五科26-28分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 4+）、數學（必修部分，Level 4+）及公民與社會發展科合格。",
            "**優先選修科**：經濟、企會財、數學（延伸部分）或地理均有優勢。強大的分析及寫作技巧至關重要。",
            "**面試**：小組討論及個人面試，評估經濟推理、全球視野、金融素養及溝通技巧。",
            "**非學術因素**：經濟論文比賽、投資學會參與、模擬聯合國或辯論經驗及對全球經濟議題的認識均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：微觀經濟學、宏觀經濟學、微積分、統計學及全球金融體系導論。",
            "**第二年 - 核心經濟與金融**：中級經濟學、計量經濟學、國際貿易與金融、公司金融及金融市場。",
            "**第三年 - 全球專修**：發展經濟學、貨幣經濟學、全球銀行業、新興市場及匯率經濟學。學生在夥伴大學海外學習。",
            "**第四年 - 研究與政策**：應用計量經濟學、經濟政策分析、金融監管及全球經濟議題的畢業研究項目。",
            "**實務訓練**：使用Stata及R的經濟數據分析、央行模擬、政策簡報撰寫及金融機構或政府實習。",
            "**課程特色**：在全球頂尖經濟學系的必修海外學期，強調政策相關研究及全球經濟素養。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**投資銀行**：全球投資銀行的宏觀研究、外滙策略及新興市場分析員。",
            "**經濟顧問**：麥肯錫、波士頓顧問公司及專業經濟顧問公司的顧問，就政策及策略提供建議。",
            "**央行及政策**：香港金融管理局、國際貨幣基金組織、世界銀行及政府經濟局的經濟學家，制定貨幣及財政政策。",
            "**資產管理**：全球資產管理公司的宏觀策略師、新興市場分析員及ESG投資研究員。",
            "**國際組織**：聯合國機構、經合組織及區域發展銀行從事全球發展的分析員。",
            "**深造**：頂尖大學（麻省理工、哈佛、芝加哥、倫敦政治經濟學院）的經濟學博士課程，從事學術職業。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**研究文化**：強調研究主導教學，教職員均為國際經濟學及金融學的活躍研究者。",
            "**海外學習**：在倫敦政治經濟學院、加州大學伯克利分校、多倫多大學及新加坡國立大學等夥伴大學的必修學期。",
            "**學生組織**：經濟學會及金融學會舉辦講者系列、個案比賽及與銀行業及政策界校友的聯繫活動。",
            "**政策參與**：透過實習及研討會與香港金融管理局、金融發展局及智庫接觸的機會。",
            "**全球網絡**：遍布央行、國際組織、投資銀行及全球頂尖經濟學博士課程的校友網絡。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：激烈（★★★★☆）。受對經濟學、政策及全球金融有興趣的學生歡迎。",
            "**學術要求**：最佳五科約26-28分。經濟學背景及強大數學對分析課程很重要。",
            "**Band A競爭**：通常每個學額有3-4名申請人。許多申請者已展示對經濟學及時事的興趣。",
            "**面試比重**：高。面試評估經濟推理、全球視野及清晰闡述複雜概念的能力。",
            "**成功申請者特質**：強勁寫作技巧、對全球經濟議題的認識及在經濟學或金融的明確職業目標。",
            "**趨勢**：隨著香港強化其作為全球金融中心及亞洲政策樞紐的地位，需求增加。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**莊太量教授**：中國經濟、金融發展及行為經濟學的著名經濟學家。",
            "**吳廷輝教授**：產業組織、競爭政策及應用微觀經濟學的領先學者。",
            "**校友網絡**：畢業生在香港金融管理局、國際貨幣基金組織、高盛、麥肯錫及全球頂尖經濟學博士課程工作。",
            "**研究卓越**：中大經濟學在國際貿易、發展及金融經濟學方面的研究位居亞洲頂尖經濟學系之列。",
            "**政策影響**：教職員擔任政府、央行及國際組織的經濟政策顧問。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**商學院獎學金**：根據商學院課程的優異學術表現頒發的獎學金。",
            "**經濟學系獎項**：嘉許卓越經濟分析及研究潛質的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**海外學習資助**：夥伴大學必修海外學期的生活開支資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大環球經濟與金融攻略",
        "content": [
            "**分數目標**：最佳五科目標28分以上，經濟及數學強勁。寫作技巧對政策分析很重要。",
            "**追蹤全球經濟**：每日閱讀《經濟學人》、《金融時報》及國際貨幣基金組織報告。理解關鍵議題：通脹、貿易戰、貨幣政策。",
            "**練習經濟推理**：能夠使用現實例子解釋供求、市場失靈及取捨。",
            "**培養寫作技巧**：經濟學需要清晰的書面溝通。練習撰寫政策簡報及經濟論文。",
            "**展示全球視野**：準備討論全球事件（疫情、地緣政治、氣候變化）如何影響經濟及金融市場。"
        ]
    }
}

details = {
    "code": "JS4254",
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
