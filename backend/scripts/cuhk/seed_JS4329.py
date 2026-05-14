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
    "code": "JS4329",
    "nameEn": "Physical Education, Exercise Science and Wellness",
    "nameZh": "體育、運動科學與健康",
    "name": "體育、運動科學與健康",
    "university": "香港中文大學",
    "faculty": "教育學院",
    "median": 19,
    "band_a": 21,
    "category": "education",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Physical Education, Exercise Science and Wellness is moderately competitive. The median admission score is typically Best 5 = 17-19 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: PE, Biology, or any science subject are advantageous. Strong sports background and coaching interest are essential.",
            "**Interview**: Practical assessment in sports skills plus individual interview assessing coaching philosophy, sports involvement, and understanding of physical education.",
            "**Non-Academic Factors**: Sports team leadership, coaching certifications, refereeing experience, fitness instruction, and athletic achievements at school or district level are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Human movement science, sports pedagogy, health and wellness, and foundation coaching across multiple sports.",
            "**Year 2 - Core Disciplines**: Exercise physiology, sports psychology, biomechanics, curriculum design for PE, and adapted physical activity.",
            "**Year 3 - Specialisation & Teaching Practice**: Students choose streams (PE Teaching, Sports Coaching, or Wellness Management) and complete teaching practice in schools.",
            "**Year 4 - Professional Integration**: Advanced coaching methods, sports administration, wellness programme design, and capstone project.",
            "**Practical Training**: Extensive sports skill development, coaching practicum, teaching practice in primary and secondary schools, and fitness instruction certification.",
            "**Unique Features**: Comprehensive programme preparing PE teachers, sports coaches, and wellness professionals with strong scientific foundation and practical skills."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Physical Education Teaching**: PE teachers at primary and secondary schools, curriculum leaders, and sports programme coordinators.",
            "**Sports Coaching**: Elite coaches in the Hong Kong Sports Institute system, school team coaches, and private sports academy coaches.",
            "**Sports Administration**: Sports development officers at the Leisure and Cultural Services Department, National Sports Associations, and private sports organisations.",
            "**Wellness Industry**: Corporate wellness managers, fitness centre directors, and health promotion specialists.",
            "**Recreation Management**: Recreation managers at country parks, sports complexes, and community centres.",
            "**Further Studies**: Master's programmes in sports science, physical education, and coaching at universities worldwide."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Sports Facilities**: Extensive facilities including Olympic-standard swimming pool, athletics track, tennis courts, and multi-purpose sports halls.",
            "**Teaching Practice**: Structured teaching practice at partner schools across Hong Kong under experienced mentor teachers.",
            "**Student Societies**: PE Society organises sports tournaments, coaching workshops, and inter-university competitions.",
            "**Industry Partnerships**: Collaborations with the Hong Kong Sports Institute, LCSD, and school sports associations for internships and employment.",
            "**Global Exposure**: Exchange programmes with top PE and sports science programmes at Loughborough, University of Sydney, and University of Alberta."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Appeals to students with strong sports backgrounds who want to become PE teachers or coaches.",
            "**Academic Requirements**: Best 5 around 17-19. Sports ability and coaching potential are as important as academic grades.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Sports achievements and coaching experience are decisive factors.",
            "**Practical Assessment**: High. The sports skills assessment and interview evaluate athletic ability, coaching potential, and teaching aptitude.",
            "**What Differentiates Winners**: Strong sports skills, coaching experience, leadership in sports teams, and genuine passion for physical education.",
            "**Trend**: Steady demand as Hong Kong invests in school sports development and community wellness programmes."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Stephen Wong**: Expert in physical activity promotion and health education in Asian populations.",
            "**Professor Amy Ha**: Leading researcher in sports psychology and mental skills training for athletes.",
            "**Alumni Network**: Graduates include Hong Kong team coaches, PE curriculum leaders, sports development officers, and fitness industry entrepreneurs.",
            "**Research Excellence**: CUHK is recognised for research in physical education pedagogy, sports coaching science, and youth sports development.",
            "**Sports Impact**: Faculty and alumni have shaped Hong Kong's school sports policies, coaching education, and community sports programmes."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Education Scholarships**: Merit-based awards for outstanding academic performance in education programmes.",
            "**Elite Athlete Scholarships**: Special support for student-athletes competing at national or international level.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Coaching Certification Grants**: Funding for coaching licences, referee certifications, and professional development courses."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK PE, Exercise Science & Wellness Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 19+. Sports ability matters as much as academic grades for this programme.",
            "**Develop Sports Skills**: Excel in multiple sports. The practical assessment evaluates your athletic ability across different disciplines.",
            "**Get Coaching Experience**: Coach school teams, volunteer at sports camps, or assist PE teachers to demonstrate coaching potential.",
            "**Show Leadership**: Captain sports teams, organise sports events, or lead fitness activities to show leadership in sports settings.",
            "**Understand PE Teaching**: Be prepared to discuss why physical education matters for child development and how you would inspire students to be active."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大體育、運動科學與健康競爭程度中等。中位數入學成績通常為最佳五科17-19分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：體育、生物或任何理科均有優勢。強大的運動背景及教練興趣至關重要。",
            "**面試**：運動技巧的實務評估加上個人面試，評估教練理念、運動參與及對體育教育的理解。",
            "**非學術因素**：運動隊領導、教練認證、裁判經驗、健身指導及學校或區域級運動成就均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：人體運動科學、體育教學法、健康與養生及多項運動的基礎教練。",
            "**第二年 - 核心學科**：運動生理學、運動心理學、生物力學、體育課程設計及適應體育活動。",
            "**第三年 - 專修與教學實習**：學生選擇專修方向（體育教學、運動教練或健康管理）並在學校完成教學實習。",
            "**第四年 - 專業整合**：高級教練方法、體育行政、養生計劃設計及畢業專題。",
            "**實務訓練**：廣泛的運動技巧發展、教練實習、中小學教學實踐及健身指導認證。",
            "**課程特色**：全面的課程培養體育教師、運動教練及養生專業人員，具穩固科學基礎及實用技巧。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**體育教學**：中小學體育教師、課程領導及運動計劃統籌。",
            "**運動教練**：香港體育學院系統的精英教練、學校隊教練及私人體育學院教練。",
            "**體育行政**：康樂及文化事務署、國家體育總會及私人體育組織的體育發展主任。",
            "**養生行業**：企業健康經理、健身中心總監及健康推廣專員。",
            "**康樂管理**：郊野公園、體育館及社區中心的康樂經理。",
            "**深造**：全球大學的運動科學、體育教育及教練學碩士課程。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**體育設施**：豐富的設施包括奧運標準游泳池、田徑跑道、網球場及多用途體育館。",
            "**教學實習**：在有經驗導師教師的監督下，於香港各夥伴學校進行結構化教學實習。",
            "**學生組織**：體育學會舉辦運動比賽、教練工作坊及大學間比賽。",
            "**業界夥伴**：與香港體育學院、康文署及學校體育會合作提供實習及就業機會。",
            "**國際視野**：與拉夫堡大學、悉尼大學及阿爾伯塔大學等頂尖體育及運動科學課程進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。吸引具強大運動背景並希望成為體育教師或教練的學生。",
            "**學術要求**：最佳五科約17-19分。運動能力及教練潛質與學術成績同樣重要。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。運動成就及教練經驗是決定性因素。",
            "**實務評估**：高。運動技巧評估及面試評估運動能力、教練潛質及教學天賦。",
            "**成功申請者特質**：強勁運動技巧、教練經驗、運動隊中的領導力及對體育教育的真誠熱情。",
            "**趨勢**：隨著香港投資學校體育發展及社區健康計劃，需求穩定。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**黃永森教授**：亞洲人群體力活動推廣及健康教育的專家。",
            "**夏秀禎教授**：運動心理學及運動員心理技能訓練的領先研究者。",
            "**校友網絡**：畢業生包括香港隊教練、體育課程領導、體育發展主任及健身行業創業家。",
            "**研究卓越**：中大在體育教育教學法、運動教練科學及青少年體育發展方面的研究獲得認可。",
            "**體育影響**：教職員及校友塑造香港的學校體育政策、教練教育及社區體育計劃。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**教育學院獎學金**：根據教育學院課程的優異學術表現頒發的獎學金。",
            "**精英運動員獎學金**：為國家或國際級比賽的學生運動員提供的特別支援。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**教練認證資助**：教練牌照、裁判認證及專業發展課程的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大體育、運動科學與健康攻略",
        "content": [
            "**分數目標**：最佳五科目標19分以上。運動能力與學術成績對此課程同樣重要。",
            "**發展運動技巧**：精通多項運動。實務評估評估你在不同學科的運動能力。",
            "**獲取教練經驗**：指導學校隊、在運動營做義工或協助體育教師以展示教練潛質。",
            "**展示領導力**：擔任運動隊隊長、組織運動活動或帶領健身活動以展示體育環境中的領導力。",
            "**理解體育教學**：準備討論為何體育教育對兒童發展重要及如何激勵學生積極活動。"
        ]
    }
}

details = {
    "code": "JS4329",
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
