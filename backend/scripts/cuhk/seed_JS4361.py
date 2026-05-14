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
    "code": "JS4361",
    "nameEn": "Mathematics and Mathematics Education",
    "nameZh": "數學與數學教育",
    "name": "數學與數學教育",
    "university": "香港中文大學",
    "faculty": "教育學院",
    "median": 26,
    "band_a": 28,
    "category": "education",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Mathematics and Mathematics Education is highly competitive. The median admission score is typically Best 5 = 24-26 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: Mathematics (Compulsory Part, Level 5+ strongly preferred), English (Level 3+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Mathematics (Extended Part M1/M2), Physics, or any science subject are highly advantageous. Exceptional mathematical ability is essential.",
            "**Interview**: Individual interview assessing mathematical thinking, teaching aptitude, problem-solving ability, and commitment to mathematics education.",
            "**Non-Academic Factors**: Mathematics competition awards (HKMO, AIMO), tutoring experience, participation in maths olympiad training, and teaching assistant roles are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Years 1-2 - Mathematics Foundations**: Calculus, linear algebra, abstract algebra, real analysis, probability, and statistics. Foundation education courses.",
            "**Years 3-4 - Education Core**: Mathematics pedagogy, curriculum design, problem-solving strategies, educational psychology, and assessment methods.",
            "**Years 5-6 - Professional Integration**: Advanced mathematics topics, action research in mathematics education, school-based practicum (16 weeks), and teaching registration preparation.",
            "**Practical Training**: Micro-teaching, peer teaching, mathematics olympiad coaching, school visits, and two teaching practicums at primary and secondary schools.",
            "**Professional Qualification**: Graduates are eligible for registration as qualified Mathematics teachers in Hong Kong schools.",
            "**Unique Features**: Dual degree combining rigorous pure and applied mathematics with professional teacher training, producing highly knowledgeable Mathematics teachers."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**School Teaching**: Mathematics teachers at primary and secondary schools, including EMI schools and gifted education programmes.",
            "**School Leadership**: Mathematics panel heads, curriculum leaders, and STEM coordinators in schools.",
            "**Education Administration**: Officers at the Education Bureau, textbook publishers, and curriculum development institutes.",
            "**Private Tutoring**: Founders of Mathematics tutoring centres, online education platforms, and educational content creators.",
            "**Further Studies**: Master's and PhD programmes in mathematics, mathematics education, and STEM education at universities worldwide.",
            "**STEM Education**: STEM programme developers, coding instructors, and educational technology specialists."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Strong community of future Mathematics teachers with mentorship from mathematicians and experienced educators.",
            "**Teaching Practice**: Extensive school placements across Hong Kong with structured supervision by mentor teachers and university tutors.",
            "**Student Societies**: Mathematics Education Society organises problem-solving workshops, maths competitions, teaching seminars, and school visits.",
            "**Research Opportunities**: Participation in mathematics education research projects and collaborations with the Hong Kong Mathematical Society.",
            "**Global Exposure**: Exchange programmes with top mathematics education programmes at University of Cambridge, University of Michigan, and East China Normal University."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: High (★★★★☆). Popular among students with strong mathematics backgrounds who want to teach.",
            "**Academic Requirements**: Best 5 around 24-26. Mathematics at Level 5+ is strongly preferred; M1/M2 background is a major advantage.",
            "**Band A Competition**: Typically 2-3 applicants per place. Mathematics competition experience distinguishes top candidates.",
            "**Interview Weighting**: Very High. The interview assesses mathematical thinking, teaching potential, and passion for mathematics education.",
            "**What Differentiates Winners**: Exceptional mathematics ability, competition achievements, teaching experience, and genuine love for the subject.",
            "**Trend**: High demand as Hong Kong prioritises STEM education and faces shortages of qualified Mathematics teachers."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Ngai-ching Wong**: Renowned mathematician and expert in functional analysis and operator theory.",
            "**Professor Allen Leung**: Leading researcher in mathematics education, dynamic geometry, and technology-enhanced learning.",
            "**Alumni Network**: Graduates include award-winning Mathematics teachers, school principals, textbook authors, and mathematics education researchers.",
            "**Research Excellence**: CUHK is recognised for research in pure mathematics, mathematics pedagogy, and STEM curriculum development.",
            "**Educational Impact**: Alumni shape mathematics education in Hong Kong through teaching, curriculum development, and competition training."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Education Scholarships**: Merit-based awards for outstanding academic performance in education programmes.",
            "**Teacher Training Scholarships**: Government scholarships for students committed to teaching careers in Hong Kong schools.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Mathematics Competition Grants**: Funding for mathematics olympiad training, competition participation, and teaching resource development."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Mathematics Education Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 26+ with Mathematics at Level 5 or above. Mathematical excellence is the foundation.",
            "**Compete in Maths**: Participate in HKMO, AIMO, or other mathematics competitions. Awards significantly strengthen your application.",
            "**Practise Teaching**: Tutor younger students in Mathematics, assist in maths classes, or coach maths olympiad teams.",
            "**Think Deeply**: Be prepared to solve mathematical problems during the interview and explain your reasoning clearly.",
            "**Show Passion**: Articulate why Mathematics fascinates you and how you plan to inspire students to appreciate its beauty and power."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大數學與數學教育競爭程度激烈。中位數入學成績通常為最佳五科24-26分（標準計分，5**=7分）。",
            "**核心科目**：數學（必修部分，Level 5+強烈建議）、英文（Level 3+）及公民與社會發展科合格。",
            "**優先選修科**：數學（延伸部分M1/M2）、物理或任何理科均非常有優勢。卓越的數學能力至關重要。",
            "**面試**：個人面試，評估數學思維、教學天賦、解難能力及對數學教育的承擔。",
            "**非學術因素**：數學比賽獎項（香港數學奧林匹克、亞洲數學奧林匹克）、補習經驗、參與數學奧林匹克培訓及教學助理角色均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一至二年 - 數學基礎**：微積分、線性代數、抽象代數、實分析、概率及統計。基礎教育課程。",
            "**第三至四年 - 教育核心**：數學教學法、課程設計、解難策略、教育心理學及評估方法。",
            "**第五至六年 - 專業整合**：高級數學專題、數學教育行動研究、學校實習（16週）及教學註冊準備。",
            "**實務訓練**：微格教學、同儕教學、數學奧林匹克教練、學校參觀及中小學兩次教學實習。",
            "**專業資格**：畢業生符合資格註冊為香港學校的合資格數學科教師。",
            "**課程特色**：雙學位結合嚴謹的純粹及應用數學與專業教師培訓，培養高素質數學科教師。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**學校教學**：中小學數學科教師，包括英文中學及資優教育計劃。",
            "**學校領導**：數學科主任、課程領導及學校的STEM統籌。",
            "**教育行政**：教育局、教科書出版社及課程發展機構的主任。",
            "**私人補習**：數學補習中心創辦人、網上教育平台及教育內容創作者。",
            "**深造**：全球大學的數學、數學教育及STEM教育碩士及博士課程。",
            "**STEM教育**：STEM計劃開發員、編程導師及教育科技專員。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：未來數學教師的強大社群，由數學家及經驗豐富的教育工作者指導。",
            "**教學實習**：香港各學校的廣泛學校實習，由導師教師及大學導師進行結構化監督。",
            "**學生組織**：數學教育學會舉辦解難工作坊、數學比賽、教學研討會及學校參觀。",
            "**研究機會**：參與數學教育研究項目及與香港數學學會的合作。",
            "**國際視野**：與劍橋大學、密歇根大學及華東師範大學等頂尖數學教育課程進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：激烈（★★★★☆）。受具強大數學背景並希望教學的學生歡迎。",
            "**學術要求**：最佳五科約24-26分。數學達Level 5+強烈建議；M1/M2背景是重大優勢。",
            "**Band A競爭**：通常每個學額有2-3名申請人。數學比賽經驗使頂尖候選人脫穎而出。",
            "**面試比重**：非常高。面試評估數學思維、教學潛質及對數學教育的熱情。",
            "**成功申請者特質**：卓越的數學能力、比賽成就、教學經驗及對學科的真正熱愛。",
            "**趨勢**：隨著香港優先考慮STEM教育及面臨合資格數學科教師短缺，需求高企。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**黃毅青教授**：泛函分析及算子理論的著名數學家。",
            "**梁子傑教授**：數學教育、動態幾何及科技增強學習的領先研究者。",
            "**校友網絡**：畢業生包括獲獎數學教師、學校校長、教科書作者及數學教育研究員。",
            "**研究卓越**：中大在純粹數學、數學教學法及STEM課程發展方面的研究獲得認可。",
            "**教育影響**：校友透過教學、課程發展及比賽培訓塑造香港的數學教育。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**教育學院獎學金**：根據教育學院課程的優異學術表現頒發的獎學金。",
            "**師資培訓獎學金**：政府獎學金，頒予致力於香港學校教學職業的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**數學比賽資助**：數學奧林匹克培訓、比賽參與及教學資源開發的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大數學教育攻略",
        "content": [
            "**分數目標**：最佳五科目標26分以上，數學達Level 5或以上。數學卓越是基礎。",
            "**參與數學比賽**：參與香港數學奧林匹克、亞洲數學奧林匹克或其他數學比賽。獎項顯著增強你的申請。",
            "**練習教學**：為較年幼學生補習數學、協助數學課堂或指導數學奧林匹克隊伍。",
            "**深入思考**：準備在面試中解決數學問題並清晰解釋你的推理。",
            "**展示熱情**：闡明為何數學令你著迷及如何計劃激勵學生欣賞其美麗與力量。"
        ]
    }
}

details = {
    "code": "JS4361",
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
