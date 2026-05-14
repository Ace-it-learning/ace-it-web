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
    "code": "JS4320",
    "nameEn": "Exercise Science and Health Education",
    "nameZh": "運動科學與健康教育",
    "name": "運動科學與健康教育",
    "university": "香港中文大學",
    "faculty": "教育學院",
    "median": 20,
    "band_a": 22,
    "category": "education",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Exercise Science and Health Education is moderately competitive. The median admission score is typically Best 5 = 18-20 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Biology, PE, or any science subject are advantageous. Interest in sports, fitness, and health promotion is essential.",
            "**Interview**: Individual interview assessing interest in exercise science, understanding of health education, sports involvement, and communication skills.",
            "**Non-Academic Factors**: Sports team participation, coaching experience, fitness certifications, volunteering in health promotion, and athletic achievements are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Human anatomy, physiology, biomechanics, motor learning, and introduction to health education and promotion.",
            "**Year 2 - Core Science**: Exercise physiology, sports nutrition, strength and conditioning, research methods, and health assessment.",
            "**Year 3 - Specialisation & Practicum**: Students choose streams (Clinical Exercise Physiology, Health Promotion, or Sports Coaching) and complete supervised practicum in hospitals, fitness centres, or schools.",
            "**Year 4 - Professional Integration**: Advanced exercise prescription, epidemiology, programme design, and capstone research project in exercise science or health education.",
            "**Practical Training**: Laboratory sessions in exercise physiology, fitness assessment practicum, coaching certifications, and teaching practice in schools.",
            "**Unique Features**: Strong integration of scientific research with practical application in health and fitness settings, with partnerships with Hong Kong's leading sports and medical institutions."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Clinical Exercise Physiology**: Cardiac rehabilitation specialists, exercise physiologists in hospitals, and clinical exercise consultants.",
            "**Health Promotion**: Health education officers in government, NGOs, and corporate wellness programmes.",
            "**Sports Coaching**: Elite sports coaches, strength and conditioning coaches, and talent development officers at sports organisations.",
            "**Fitness Industry**: Fitness centre managers, personal trainers, and corporate wellness consultants.",
            "**Education**: PE teachers at schools, lecturers at tertiary institutions, and curriculum developers in health and physical education.",
            "**Research & Academia**: Research assistants, PhD candidates, and postdoctoral researchers in exercise science, public health, and sports medicine."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Sports Facilities**: Access to CUHK's extensive sports facilities including swimming pools, fitness centres, sports halls, and outdoor fields.",
            "**Research Labs**: Exercise physiology laboratory, biomechanics lab, and health assessment centre equipped with advanced testing equipment.",
            "**Student Societies**: Sports and Exercise Science Society organises fitness events, sports competitions, and health promotion campaigns.",
            "**Industry Partnerships**: Collaborations with the Hong Kong Sports Institute, Hospital Authority, and major fitness chains for internships and research.",
            "**Global Exposure**: Exchange programmes with top exercise science schools at Loughborough University, University of Queensland, and University of British Columbia."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Appeals to students passionate about sports, fitness, and health promotion.",
            "**Academic Requirements**: Best 5 around 18-20. Science background (Biology) is helpful but not mandatory.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Sports involvement and health-related experience are valued.",
            "**Interview Weighting**: High. The interview assesses genuine interest in exercise science, sports participation, and communication ability.",
            "**What Differentiates Winners**: Demonstrated commitment to sports or fitness, leadership in teams, and understanding of health education principles.",
            "**Trend**: Growing demand as Hong Kong prioritises public health, sports development, and ageing population wellness programmes."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Stephen Wong**: Renowned expert in physical activity epidemiology and health promotion in Chinese populations.",
            "**Professor Cindy Sit**: Leading researcher in adapted physical activity and exercise for special populations.",
            "**Alumni Network**: Graduates work at the Hong Kong Sports Institute, Hospital Authority, Leisure and Cultural Services Department, and leading fitness companies.",
            "**Research Excellence**: CUHK is recognised for research in exercise physiology, physical activity promotion, and sports psychology in Asian populations.",
            "**Community Impact**: Faculty and students contribute to Hong Kong's public health through community fitness programmes, school health initiatives, and sports development."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Education Scholarships**: Merit-based awards for outstanding academic performance in education programmes.",
            "**Sports Scholarships**: Special awards for student-athletes with exceptional sporting achievements.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Professional Certification Grants**: Funding for fitness certifications (ACSM, NSCA) and coaching licences."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Exercise Science & Health Education Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 20+. Academic grades matter but sports involvement and health passion are equally important.",
            "**Stay Active**: Participate in sports teams, fitness activities, or health promotion volunteering. Demonstrate genuine commitment to an active lifestyle.",
            "**Learn the Science**: Read introductory texts on exercise physiology, nutrition, and biomechanics to show academic interest.",
            "**Get Certified**: Consider fitness certifications (personal trainer, first aid) to demonstrate professional commitment.",
            "**Think Holistically**: Be prepared to discuss how exercise science, nutrition, psychology, and education combine to promote public health."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大運動科學與健康教育競爭程度中等。中位數入學成績通常為最佳五科18-20分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：生物、體育或任何理科均有優勢。對運動、健身及健康推廣的興趣至關重要。",
            "**面試**：個人面試，評估對運動科學的興趣、對健康教育的理解、運動參與及溝通技巧。",
            "**非學術因素**：運動隊參與、教練經驗、健身認證、健康推廣義工服務及運動成就均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：人體解剖學、生理學、生物力學、動作學習及健康教育與推廣導論。",
            "**第二年 - 核心科學**：運動生理學、運動營養學、力量與體能訓練、研究方法及健康評估。",
            "**第三年 - 專修與實習**：學生選擇專修方向（臨床運動生理學、健康推廣或運動教練）並在醫院、健身中心或學校完成監督實習。",
            "**第四年 - 專業整合**：高級運動處方、流行病學、計劃設計及運動科學或健康教育的畢業研究項目。",
            "**實務訓練**：運動生理學實驗室課程、健身評估實習、教練認證及學校教學實踐。",
            "**課程特色**：科學研究與健康及健身環境實務應用的強大整合，與香港頂尖體育及醫療機構有夥伴關係。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**臨床運動生理學**：醫院的心臟康復專員、運動生理學家及臨床運動顧問。",
            "**健康推廣**：政府、非政府組織及企業健康計劃的健康教育主任。",
            "**運動教練**：體育組織的精英運動教練、力量與體能教練及人才發展主任。",
            "**健身行業**：健身中心經理、私人教練及企業健康顧問。",
            "**教育**：學校體育教師、大專院校講師及健康與體育課程發展專員。",
            "**研究及學術**：運動科學、公共衛生及運動醫學的研究助理、博士候選人及博士後研究員。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**體育設施**：可使用中大豐富的體育設施，包括游泳池、健身中心、體育館及戶外運動場。",
            "**研究實驗室**：運動生理學實驗室、生物力學實驗室及配備先進測試設備的健康評估中心。",
            "**學生組織**：運動科學學會舉辦健身活動、運動比賽及健康推廣活動。",
            "**業界夥伴**：與香港體育學院、醫院管理局及主要健身連鎖店的實習及研究合作。",
            "**國際視野**：與拉夫堡大學、昆士蘭大學及英屬哥倫比亞大學等頂尖運動科學學院進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。吸引對運動、健身及健康推廣有熱情的學生。",
            "**學術要求**：最佳五科約18-20分。理科背景（生物）有幫助但非必要。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。運動參與及健康相關經驗受重視。",
            "**面試比重**：高。面試評估對運動科學的真正興趣、運動參與及溝通能力。",
            "**成功申請者特質**：展示對運動或健身的承擔、團隊中的領導力及對健康教育原則的理解。",
            "**趨勢**：隨著香港優先考慮公共衛生、體育發展及人口老化健康計劃，需求增加。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**黃永森教授**：華人社群體力活動流行病學及健康推廣的著名專家。",
            "**薛慧萍教授**：適應體育活動及特殊群體運動的領先研究者。",
            "**校友網絡**：畢業生在香港體育學院、醫院管理局、康樂及文化事務署及領先健身公司工作。",
            "**研究卓越**：中大在運動生理學、體力活動推廣及亞洲人群運動心理學方面的研究獲得認可。",
            "**社區影響**：教職員及學生透過社區健身計劃、學校健康計劃及體育發展為香港公共衛生作出貢獻。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**教育學院獎學金**：根據教育學院課程的優異學術表現頒發的獎學金。",
            "**體育獎學金**：頒予具卓越運動成就的學生運動員的特別獎項。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**專業認證資助**：健身認證（ACSM、NSCA）及教練牌照的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大運動科學與健康教育攻略",
        "content": [
            "**分數目標**：最佳五科目標20分以上。學術成績重要，但運動參與及健康熱情同樣重要。",
            "**保持活躍**：參與運動隊、健身活動或健康推廣義工服務。展示對積極生活方式的真正承擔。",
            "**學習科學**：閱讀運動生理學、營養學及生物力學入門文本以展示學術興趣。",
            "**獲取認證**：考慮健身認證（私人教練、急救）以展示專業承擔。",
            "**整體思考**：準備討論運動科學、營養學、心理學及教育如何結合推廣公共衛生。"
        ]
    }
}

details = {
    "code": "JS4320",
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
