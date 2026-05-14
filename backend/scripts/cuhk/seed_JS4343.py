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
    "code": "JS4343",
    "nameEn": "BA(English) and BEd(English Language Education)",
    "nameZh": "英文教育雙學位",
    "name": "英文教育雙學位",
    "university": "香港中文大學",
    "faculty": "教育學院",
    "median": 25,
    "band_a": 27,
    "category": "education",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK English Language Education is moderately to highly competitive. The median admission score is typically Best 5 = 23-25 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English Language (Level 5+ strongly preferred), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: English Literature, any humanities subject, or a second language are advantageous. Exceptional English proficiency is essential.",
            "**Interview**: Individual interview assessing English language proficiency, teaching aptitude, understanding of English language education, and commitment to teaching.",
            "**Non-Academic Factors**: English speech and writing competitions, debate experience, tutoring English, and participation in English drama or public speaking are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Years 1-2 - English Studies**: British and American literature, linguistics, sociolinguistics, world Englishes, and academic writing. Foundation education courses.",
            "**Years 3-4 - Education Core**: English language pedagogy, second language acquisition, curriculum design, assessment for learning, and educational psychology.",
            "**Years 5-6 - Professional Integration**: Advanced teaching methods, classroom management, action research, school-based practicum (16 weeks), and preparation for teaching registration.",
            "**Practical Training**: Micro-teaching, peer teaching, school visits, and two teaching practicums at primary and secondary schools with mentor supervision.",
            "**Professional Qualification**: Graduates are eligible for registration as qualified English Language teachers in Hong Kong schools.",
            "**Unique Features**: Dual degree combining comprehensive English studies with professional teacher training, producing highly competent English Language teachers."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**School Teaching**: English Language teachers at primary and secondary schools, including EMI and international schools.",
            "**School Leadership**: English panel heads, curriculum leaders, and vice principals specialising in language education.",
            "**Education Administration**: Officers at the Education Bureau, textbook publishers, and examination boards (HKEAA).",
            "**Private Tutoring**: Founders of English tutoring centres, online education platforms, and educational content creators.",
            "**Further Studies**: Master's and PhD programmes in TESOL, applied linguistics, and language education at universities worldwide.",
            "**Media & Publishing**: Editors at English publishers, writers, and content developers for educational materials."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Vibrant community of future English teachers with strong support from experienced educators and native English-speaking faculty.",
            "**Teaching Practice**: Extensive school placements across Hong Kong with structured supervision by mentor teachers and university tutors.",
            "**Student Societies**: English Education Society organises drama productions, debate tournaments, teaching workshops, and school visits.",
            "**Language Environment**: English-medium activities, conversation programmes with international students, and immersion opportunities.",
            "**Global Exposure**: Exchange programmes with UK and US education schools (IOE London, Columbia Teachers College) for teaching immersion."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate to High (★★★★☆). Popular among students passionate about English and teaching.",
            "**Academic Requirements**: Best 5 around 23-25. English Language at Level 5+ is strongly preferred.",
            "**Band A Competition**: Typically 2-3 applicants per place. Many applicants have excelled in English speech and writing competitions.",
            "**Interview Weighting**: Very High. The interview assesses English proficiency, teaching potential, and commitment to education.",
            "**What Differentiates Winners**: Exceptional English skills, teaching experience, and genuine passion for language education.",
            "**Trend**: Consistently high demand as Hong Kong schools face ongoing demand for qualified English Language teachers."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor David Coniam**: Renowned expert in language assessment and English language education in Hong Kong.",
            "**Professor Peter Falvey**: Leading scholar in English language curriculum development and teacher education.",
            "**Alumni Network**: Graduates include award-winning English teachers, school principals, textbook authors, and HKEAA examiners.",
            "**Research Excellence**: CUHK is recognised for research in TESOL, language assessment, and bilingual education in Hong Kong contexts.",
            "**Educational Impact**: Alumni shape English language education policy and practice through teaching, curriculum development, and assessment design."
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
        "title": "Ace Sir's CUHK English Education Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 25+ with English Language at Level 5 or above. English proficiency is critical.",
            "**Read Extensively**: Read widely in English — literature, news, academic articles. Develop sophisticated vocabulary and expression.",
            "**Practise Teaching**: Tutor younger students, assist in English classes, or volunteer to teach English to develop teaching skills.",
            "**Develop Communication Skills**: Join debate clubs, drama societies, or public speaking competitions to hone presentation skills.",
            "**Show Commitment**: Articulate why you want to teach English and how you plan to inspire students to become confident communicators."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大英文教育雙學位競爭程度中等至激烈。中位數入學成績通常為最佳五科23-25分（標準計分，5**=7分）。",
            "**核心科目**：英國語文（Level 5+強烈建議）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：英語文學、任何人文科目或第二語言均有優勢。卓越的英語能力至關重要。",
            "**面試**：個人面試，評估英語語言能力、教學天賦、對英文語言教育的理解及對教學的承擔。",
            "**非學術因素**：英語演講及寫作比賽、辯論經驗、英語補習及參與英語戲劇或公開演講均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一至二年 - 英語研究**：英國及美國文學、語言學、社會語言學、世界英語及學術寫作。基礎教育課程。",
            "**第三至四年 - 教育核心**：英語語言教學法、第二語言習得、課程設計、促進學習的評估及教育心理學。",
            "**第五至六年 - 專業整合**：高級教學方法、課堂管理、行動研究、學校實習（16週）及為教學註冊作準備。",
            "**實務訓練**：微格教學、同儕教學、學校參觀及中小學兩次教學實習，由導師監督。",
            "**專業資格**：畢業生符合資格註冊為香港學校的合資格英語科教師。",
            "**課程特色**：雙學位結合全面英語研究與專業教師培訓，培養高能力英語科教師。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**學校教學**：中小學英語科教師，包括英文中學及國際學校。",
            "**學校領導**：英文科主任、課程領導及專注語言教育的副校長。",
            "**教育行政**：教育局、教科書出版社及考試局（考評局）的主任。",
            "**私人補習**：英語補習中心創辦人、網上教育平台及教育內容創作者。",
            "**深造**：全球大學的對外英語教學、應用語言學及語言教育碩士及博士課程。",
            "**媒體及出版**：英語出版社的編輯、作家及教育材料的內容開發員。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：未來英語教師的充滿活力社群，由經驗豐富的教育工作者及英語母語教職員提供強大支援。",
            "**教學實習**：香港各學校的廣泛學校實習，由導師教師及大學導師進行結構化監督。",
            "**學生組織**：英文教育學會舉辦戲劇製作、辯論比賽、教學工作坊及學校參觀。",
            "**語言環境**：英語活動、與國際學生的會話計劃及沉浸機會。",
            "**國際視野**：與英國及美國教育學院（倫敦大學學院教育學院、哥倫比亞大學師範學院）進行教學沉浸交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等至激烈（★★★★☆）。受對英語及教學有熱情的學生歡迎。",
            "**學術要求**：最佳五科約23-25分。英國語文達Level 5+強烈建議。",
            "**Band A競爭**：通常每個學額有2-3名申請人。許多申請者在英語演講及寫作比賽中表現優異。",
            "**面試比重**：非常高。面試評估英語能力、教學潛質及對教育的承擔。",
            "**成功申請者特質**：卓越的英語技巧、教學經驗及對語言教育的真誠熱情。",
            "**趨勢**：隨著香港學校持續需求合資格英語科教師，需求持續高企。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**David Coniam教授**：香港語言評估及英語語言教育的著名專家。",
            "**Peter Falvey教授**：英語語言課程發展及教師教育的領先學者。",
            "**校友網絡**：畢業生包括獲獎英語教師、學校校長、教科書作者及考評局評卷員。",
            "**研究卓越**：中大在對外英語教學、語言評估及香港處境的雙語教育方面的研究獲得認可。",
            "**教育影響**：校友透過教學、課程發展及評估設計塑造英語語言教育政策及實踐。"
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
        "title": "Ace Sir 中大英文教育攻略",
        "content": [
            "**分數目標**：最佳五科目標25分以上，英國語文達Level 5或以上。英語能力至關重要。",
            "**廣泛閱讀**：廣泛閱讀英語——文學、新聞、學術文章。培養精緻的詞彙及表達。",
            "**練習教學**：為較年幼學生補習、協助英語課堂或自願教授英語以培養教學技巧。",
            "**培養溝通技巧**：加入辯論學會、戲劇學會或公開演講比賽以磨練表達技巧。",
            "**展示承擔**：闡明為何你想教授英語及如何計劃激勵學生成為自信的溝通者。"
        ]
    }
}

details = {
    "code": "JS4343",
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
