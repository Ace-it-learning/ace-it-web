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
    "code": "JS4331",
    "nameEn": "BA(Chinese) and BEd(Chinese Language Education)",
    "nameZh": "中文教育雙學位",
    "name": "中文教育雙學位",
    "university": "香港中文大學",
    "faculty": "教育學院",
    "median": 24,
    "band_a": 26,
    "category": "education",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Chinese Language Education is moderately to highly competitive. The median admission score is typically Best 5 = 22-24 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: Chinese Language (Level 5+ strongly preferred), English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Chinese Literature, Chinese History, or any humanities subject are highly advantageous. Strong Chinese writing and reading skills are essential.",
            "**Interview**: Individual interview assessing Chinese language proficiency, teaching aptitude, understanding of Chinese education, and commitment to the teaching profession.",
            "**Non-Academic Factors**: Chinese writing competitions, tutoring experience, participation in Chinese cultural activities, and school teaching assistant roles are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Years 1-2 - Chinese Studies**: Classical Chinese literature, modern Chinese literature, linguistics, Chinese history, and cultural studies. Foundation education courses.",
            "**Years 3-4 - Education Core**: Chinese language pedagogy, curriculum design, assessment methods, educational psychology, and special educational needs.",
            "**Years 5-6 - Professional Integration**: Advanced teaching methods, action research, school-based practicum (16 weeks), and preparation for PGDE or direct teaching registration.",
            "**Practical Training**: Micro-teaching, peer teaching, school visits, and two teaching practicums at primary and secondary schools.",
            "**Professional Qualification**: Graduates are eligible for registration as qualified Chinese Language teachers in Hong Kong schools.",
            "**Unique Features**: Dual degree combining in-depth Chinese studies with professional teacher training, producing highly qualified Chinese Language teachers."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**School Teaching**: Chinese Language teachers at primary and secondary schools, including EMI and CMI schools.",
            "**School Leadership**: Chinese panel heads, curriculum leaders, and vice principals specialising in Chinese education.",
            "**Education Administration**: Officers at the Education Bureau, textbook publishers, and curriculum development institutes.",
            "**Private Tutoring**: Founders of Chinese tutoring centres, online education platforms, and educational content creators.",
            "**Further Studies**: Master's and PhD programmes in Chinese language education, linguistics, and curriculum studies.",
            "**Media & Publishing**: Editors at Chinese publishers, writers, and cultural commentators focusing on Chinese language and literature."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Strong community of future Chinese teachers with mentorship from experienced educators and scholars.",
            "**Teaching Practice**: Extensive school placements across Hong Kong with supervision by mentor teachers and university tutors.",
            "**Student Societies**: Chinese Education Society organises teaching workshops, calligraphy sessions, cultural events, and school visits.",
            "**Library Resources**: Access to extensive Chinese classical texts, teaching resources, and digital archives for lesson preparation.",
            "**Global Exposure**: Exchange programmes with mainland Chinese normal universities (Beijing Normal, East China Normal) for teaching immersion."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate to High (★★★★☆). Popular among students passionate about Chinese language and teaching.",
            "**Academic Requirements**: Best 5 around 22-24. Chinese Language at Level 5+ is almost essential for success.",
            "**Band A Competition**: Typically 2-3 applicants per place. Many applicants have excelled in Chinese writing and speech competitions.",
            "**Interview Weighting**: Very High. The interview assesses Chinese proficiency, teaching potential, and commitment to education.",
            "**What Differentiates Winners**: Exceptional Chinese language skills, teaching experience, and genuine passion for nurturing the next generation.",
            "**Trend**: Consistently high demand as Hong Kong schools face shortages of qualified Chinese Language teachers."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Tse Shek-kam**: Renowned expert in Chinese language education and reading comprehension research.",
            "**Professor Ho Che-wah**: Leading scholar in classical Chinese literature and its pedagogical applications.",
            "**Alumni Network**: Graduates include award-winning Chinese teachers, school principals, textbook authors, and education policy advisors.",
            "**Research Excellence**: CUHK is recognised for research in Chinese language pedagogy, literacy development, and classical text teaching methods.",
            "**Educational Impact**: Alumni shape Chinese language education in Hong Kong through teaching, curriculum development, and policy influence."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Education Scholarships**: Merit-based awards for outstanding academic performance in education programmes.",
            "**Teacher Training Scholarships**: Government scholarships for students committed to teaching careers in Hong Kong schools.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Teaching Practicum Grants**: Funding for teaching materials, school visits, and professional development during practicum."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Chinese Education Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 24+ with Chinese Language at Level 5 or above. Language proficiency is paramount.",
            "**Master Classical Texts**: Read extensively from the Four Books and Five Classics, Tang poetry, and selected vernacular novels.",
            "**Practise Teaching**: Tutor younger students, assist in Chinese classes, or volunteer at community centres to develop teaching skills.",
            "**Engage with Culture**: Participate in calligraphy, poetry recitation, and Chinese cultural activities to deepen cultural understanding.",
            "**Show Commitment**: Articulate why you want to teach Chinese and how you plan to inspire students to love the language and culture."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大中文教育雙學位競爭程度中等至激烈。中位數入學成績通常為最佳五科22-24分（標準計分，5**=7分）。",
            "**核心科目**：中國語文（Level 5+強烈建議）、英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：中國文學、中國歷史或任何人文科目均非常有優勢。強大的中文寫作及閱讀技巧至關重要。",
            "**面試**：個人面試，評估中文語言能力、教學天賦、對中文教育的理解及對教學專業的承擔。",
            "**非學術因素**：中文寫作比賽、補習經驗、參與中國文化活動及學校教學助理角色均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一至二年 - 中文研究**：古典中文文學、現代中文文學、語言學、中國歷史及文化研究。基礎教育課程。",
            "**第三至四年 - 教育核心**：中文語言教學法、課程設計、評估方法、教育心理學及特殊教育需要。",
            "**第五至六年 - 專業整合**：高級教學方法、行動研究、學校實習（16週）及為教育文憑或直接教學註冊作準備。",
            "**實務訓練**：微格教學、同儕教學、學校參觀及中小學兩次教學實習。",
            "**專業資格**：畢業生符合資格註冊為香港學校的合資格中文科教師。",
            "**課程特色**：雙學位結合深入中文研究與專業教師培訓，培養高素質中文科教師。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**學校教學**：中小學中文科教師，包括英文中學及中文中學。",
            "**學校領導**：中文科主任、課程領導及專注中文教育的副校長。",
            "**教育行政**：教育局、教科書出版社及課程發展機構的主任。",
            "**私人補習**：中文補習中心創辦人、網上教育平台及教育內容創作者。",
            "**深造**：中文語言教育、語言學及課程研究的碩士及博士課程。",
            "**媒體及出版**：中文出版社的編輯、作家及專注中文語言及文學的文化評論員。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：未來中文教師的強大社群，由經驗豐富的教育工作者及學者指導。",
            "**教學實習**：香港各學校的廣泛學校實習，由導師教師及大學導師監督。",
            "**學生組織**：中文教育學會舉辦教學工作坊、書法練習、文化活動及學校參觀。",
            "**圖書館資源**：可使用豐富的中文古典文本、教學資源及備課數碼檔案。",
            "**國際視野**：與中國內地師範大學（北京師範大學、華東師範大學）進行教學沉浸交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等至激烈（★★★★☆）。受對中文語言及教學有熱情的學生歡迎。",
            "**學術要求**：最佳五科約22-24分。中國語文達Level 5+幾乎是成功的必要條件。",
            "**Band A競爭**：通常每個學額有2-3名申請人。許多申請者在中文寫作及演講比賽中表現優異。",
            "**面試比重**：非常高。面試評估中文能力、教學潛質及對教育的承擔。",
            "**成功申請者特質**：卓越的中文語言技巧、教學經驗及培育下一代的真誠熱情。",
            "**趨勢**：隨著香港學校面臨合資格中文科教師短缺，需求持續高企。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**謝錫金教授**：中文語言教育及閱讀理解研究的著名專家。",
            "**何志華教授**：古典中文文學及其教學應用的領先學者。",
            "**校友網絡**：畢業生包括獲獎中文教師、學校校長、教科書作者及教育政策顧問。",
            "**研究卓越**：中大在中文語言教學法、讀寫能力發展及古典文本教學方法方面的研究獲得認可。",
            "**教育影響**：校友透過教學、課程發展及政策影響塑造香港的中文語言教育。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**教育學院獎學金**：根據教育學院課程的優異學術表現頒發的獎學金。",
            "**師資培訓獎學金**：政府獎學金，頒予致力於香港學校教學職業的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**教學實習資助**：教學材料、學校參觀及實習期間專業發展的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大中文教育攻略",
        "content": [
            "**分數目標**：最佳五科目標24分以上，中國語文達Level 5或以上。語言能力至關重要。",
            "**精通古典文本**：廣泛閱讀四書五經、唐詩及選定白話小說。",
            "**練習教學**：為較年幼學生補習、協助中文課堂或在社區中心做義工以培養教學技巧。",
            "**參與文化活動**：參與書法、詩歌朗誦及中國文化活動以深化文化理解。",
            "**展示承擔**：闡明為何你想教授中文及如何計劃激勵學生熱愛語言及文化。"
        ]
    }
}

details = {
    "code": "JS4331",
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
