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
    "code": "JS4226",
    "nameEn": "Hospitality and Real Estate",
    "nameZh": "酒店及房地產",
    "name": "酒店及房地產",
    "university": "香港中文大學",
    "faculty": "商學院",
    "median": 25,
    "band_a": 27,
    "category": "business",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Hospitality and Real Estate is moderately competitive. The median admission score is typically Best 5 = 23-25 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: BAFS, Economics, Geography, or Tourism and Hospitality Studies are advantageous. Strong numeracy and communication skills are essential.",
            "**Interview**: Group discussion and individual interview assessing interest in hospitality and real estate, teamwork skills, business acumen, and communication ability.",
            "**Non-Academic Factors**: Hotel or property industry internships, hospitality competitions, real estate investment simulations, and customer service experience are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Business Foundations**: Accounting, economics, statistics, business communication, and introduction to hospitality and real estate industries.",
            "**Year 2 - Core Disciplines**: Hotel operations management, property investment and valuation, facilities management, and service quality management.",
            "**Year 3 - Specialisation & Internship**: Students choose streams (Hospitality Management or Real Estate) and complete a 6-month industry internship at hotels or property firms.",
            "**Year 4 - Strategic Integration**: Revenue management, real estate finance, strategic hospitality management, and capstone project solving industry problems.",
            "**Practical Training**: Hotel front office and housekeeping practicum, property inspection tours, revenue management simulations, and case competitions.",
            "**Unique Features**: Dual focus on hospitality and real estate with strong industry partnerships with leading hotel chains and property developers in Hong Kong and Asia."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Hotel Management**: Management trainees at international hotel chains (Marriott, Hilton, Shangri-La, Rosewood) progressing to general manager roles.",
            "**Real Estate**: Property analysts, asset managers, and investment specialists at real estate firms, REITs, and property developers.",
            "**Hospitality Services**: Revenue managers, event planners, and food & beverage directors at hotels, resorts, and cruise lines.",
            "**Property Management**: Facilities managers, leasing managers, and property consultants at commercial and residential property management firms.",
            "**Consulting**: Hospitality and real estate consultants at firms like JLL, CBRE, and Deloitte advising on industry strategy.",
            "**Entrepreneurship**: Founders of boutique hotels, serviced apartments, hospitality tech startups, and property investment ventures."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Industry Partnerships**: Close ties with leading hotel chains, property developers, and hospitality groups for internships and recruitment.",
            "**Learning Facilities**: Mock hotel front desk, property valuation lab, and hospitality simulation software for practical training.",
            "**Student Societies**: Hospitality and Real Estate Society organises industry visits, networking events, and case competitions.",
            "**Global Exposure**: Exchange programmes with hospitality schools at Cornell, Ecole hoteliere de Lausanne, and Hong Kong Polytechnic University.",
            "**Career Support**: Dedicated career services with industry mentors, recruitment fairs, and alumni networking events."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate to High (★★★★☆). Popular among students interested in service industries and property markets.",
            "**Academic Requirements**: Best 5 around 23-25. Mathematics and English skills are important for finance and operations modules.",
            "**Band A Competition**: Typically 2-2.5 applicants per place. Industry experience and customer service orientation are valued.",
            "**Interview Weighting**: High. The interview assesses interpersonal skills, service mindset, and understanding of hospitality and real estate industries.",
            "**What Differentiates Winners**: Genuine passion for service excellence, awareness of industry trends, and demonstrated teamwork ability.",
            "**Trend**: Strong demand as Hong Kong's tourism recovers and real estate remains a key economic sector."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Basak Denizci Guillet**: Renowned expert in hospitality revenue management and consumer behaviour.",
            "**Professor Eddie Hui**: Leading scholar in real estate economics and property market analysis.",
            "**Alumni Network**: Graduates hold management positions at luxury hotels, major property developers (Sun Hung Kai, Henderson Land), and international consulting firms.",
            "**Research Excellence**: CUHK is recognised for research in hospitality management, real estate finance, and sustainable tourism.",
            "**Industry Impact**: Faculty research informs hospitality policy, property market regulation, and tourism development strategy in Hong Kong."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Business Scholarships**: Merit-based awards for outstanding academic performance in business programmes.",
            "**Industry Scholarships**: Sponsored by hotel chains and property companies for students with exceptional potential.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Overseas Study Grants**: Funding for exchange programmes at top hospitality schools and international internships."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Hospitality & Real Estate Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 25+ with strong Mathematics and English. BAFS or Economics background is helpful.",
            "**Understand Both Industries**: Read about hotel operations, revenue management, property cycles, and real estate investment trends.",
            "**Develop Service Skills**: Work in customer-facing roles (retail, F&B) to develop the service mindset essential for hospitality.",
            "**Follow Market Trends**: Track Hong Kong property prices, hotel occupancy rates, and tourism statistics to show industry awareness.",
            "**Show Teamwork**: Hospitality is team-based. Demonstrate your ability to work collaboratively and lead in group settings."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大酒店及房地產競爭程度中等至激烈。中位數入學成績通常為最佳五科23-25分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
            "**優先選修科**：企業、會計與財務概論、經濟、地理或旅遊與款待均有優勢。強大的數字及溝通技巧至關重要。",
            "**面試**：小組討論及個人面試，評估對酒店及房地產的興趣、團隊合作技巧、商業觸覺及溝通能力。",
            "**非學術因素**：酒店或地產行業實習、款待比賽、房地產投資模擬及客戶服務經驗均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 商業基礎**：會計、經濟、統計、商業溝通及酒店與房地產行業導論。",
            "**第二年 - 核心學科**：酒店營運管理、物業投資與估值、設施管理及服務質素管理。",
            "**第三年 - 專修與實習**：學生選擇專修方向（酒店管理或房地產）並在酒店或地產公司完成六個月行業實習。",
            "**第四年 - 策略整合**：收益管理、房地產金融、策略酒店管理及解決行業問題的畢業專題。",
            "**實務訓練**：酒店前堂及房務實習、物業考察、收益管理模擬及個案比賽。",
            "**課程特色**：酒店與房地產雙重專注，與香港及亞洲領先酒店集團及地產發展商有強大行業夥伴關係。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**酒店管理**：國際酒店集團（萬豪、希爾頓、香格里拉、瑰麗酒店）的管理培訓生，晉升至總經理職位。",
            "**房地產**：地產公司、房地產投資信託及地產發展商的物業分析員、資產經理及投資專員。",
            "**款待服務**：酒店、度假村及郵輪的收益經理、活動策劃師及餐飲總監。",
            "**物業管理**：商業及住宅物業管理公司的設施經理、租務經理及物業顧問。",
            "**顧問**：仲量聯行、世邦魏理仕及德勤等公司的酒店及房地產顧問，提供行業策略建議。",
            "**創業**：精品酒店、服務式公寓、款待科技初創公司及物業投資企業的創辦人。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**行業夥伴**：與領先酒店集團、地產發展商及款待集團的緊密聯繫，提供實習及招聘機會。",
            "**學習設施**：模擬酒店前台、物業估值實驗室及款待模擬軟件供實務培訓。",
            "**學生組織**：酒店及房地產學會舉辦業界參觀、聯誼活動及個案比賽。",
            "**國際視野**：與康奈爾大學、洛桑酒店管理學院及香港理工大學的酒店學院進行交換計劃。",
            "**就業支援**：專屬就業服務，設有業界導師、招聘會及校友聯誼活動。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等至激烈（★★★★☆）。受對服務行業及物業市場有興趣的學生歡迎。",
            "**學術要求**：最佳五科約23-25分。數學及英文技巧對金融及營運課程很重要。",
            "**Band A競爭**：通常每個學額有2-2.5名申請人。行業經驗及客戶服務導向受重視。",
            "**面試比重**：高。面試評估人際技巧、服務思維及對酒店與房地產行業的理解。",
            "**成功申請者特質**：對卓越服務的真正熱情、對行業趨勢的認識及展示的團隊合作能力。",
            "**趨勢**：隨著香港旅遊業復甦及房地產持續作為關鍵經濟板塊，需求強勁。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**Basak Denizci Guillet教授**：酒店收益管理及消費者行為的著名專家。",
            "**許敬文教授**：房地產經濟學及物業市場分析的領先學者。",
            "**校友網絡**：畢業生在豪華酒店、主要地產發展商（新鴻基、恒基）及國際顧問公司擔任管理職位。",
            "**研究卓越**：中大在酒店管理、房地產金融及可持續旅遊方面的研究獲得認可。",
            "**行業影響**：教職員研究為香港的款待政策、物業市場監管及旅遊發展策略提供資訊。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**商學院獎學金**：根據商學院課程的優異學術表現頒發的獎學金。",
            "**行業獎學金**：由酒店集團及地產公司贊助，頒予具卓越潛質的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**海外學習資助**：頂級酒店學院交換計劃及國際實習的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大酒店及房地產攻略",
        "content": [
            "**分數目標**：最佳五科目標25分以上，數學及英文強勁。企會財或經濟背景有幫助。",
            "**理解兩個行業**：閱讀酒店營運、收益管理、物業周期及房地產投資趨勢。",
            "**培養服務技巧**：在面向客戶的崗位（零售、餐飲）工作，培養款待業必需的服務思維。",
            "**追蹤市場趨勢**：追蹤香港樓價、酒店入住率及旅遊統計數據以展示行業認識。",
            "**展示團隊合作**：款待業以團隊為基礎。展示你在團隊環境中合作及領導的能力。"
        ]
    }
}

details = {
    "code": "JS4226",
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
