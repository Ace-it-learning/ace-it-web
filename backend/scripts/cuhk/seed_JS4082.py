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
    "code": "JS4082",
    "nameEn": "Music",
    "nameZh": "音樂",
    "name": "音樂",
    "university": "香港中文大學",
    "faculty": "文學院",
    "median": 20,
    "band_a": 22,
    "category": "arts",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Music is moderately competitive. The median admission score is typically Best 5 = 18-20 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Music, any humanities subject. ABRSM Grade 8 or equivalent performance standard is strongly preferred.",
            "**Audition & Interview**: Applicants must pass a performance audition (two contrasting pieces) and an interview assessing musical knowledge, theory understanding, and career goals.",
            "**Non-Academic Factors**: Music competition prizes, ensemble experience, composition portfolio, and music theory qualifications (ABRSM Theory Grade 5+) are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Music theory, aural training, music history (Western and Chinese), and individual instrumental/vocal lessons.",
            "**Year 2 - Core Studies**: Harmony, counterpoint, orchestration, music analysis, and introduction to music education and therapy.",
            "**Year 3 - Specialisation**: Students choose streams (Performance, Composition, Musicology, or Music Education) and develop advanced skills.",
            "**Year 4 - Capstone & Recital**: Final recital for performers, composition portfolio for composers, or research thesis for musicologists.",
            "**Practical Training**: Ensemble participation (orchestra, choir, chamber groups), teaching practicum, and internship with music organisations.",
            "**Unique Features**: Strong Chinese music component alongside Western classical tradition. Access to professional concert hall and recording studio."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Performance**: Professional musicians, orchestral players, opera singers, and chamber musicians.",
            "**Education**: Music teachers at schools, private studio instructors, and lecturers at conservatories and universities.",
            "**Composition & Arranging**: Composers for film, television, games, and concert music; arrangers for ensembles and recordings.",
            "**Arts Administration**: Programme directors at concert halls, orchestra managers, and festival organisers.",
            "**Music Therapy**: Registered music therapists working in hospitals, rehabilitation centres, and special education settings.",
            "**Media & Technology**: Sound engineers, music producers, and developers of music software and applications."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Performance Facilities**: Professional concert hall, recital hall, practice rooms with grand pianos, and recording studio.",
            "**Ensembles**: CUHK Orchestra, Choir, Chinese Orchestra, and numerous chamber groups with regular public performances.",
            "**Department Culture**: Supportive community with masterclasses by visiting artists, composition workshops, and musicology seminars.",
            "**Student Societies**: Music Society organises concerts, jam sessions, music appreciation events, and outreach programmes.",
            "**Global Exposure**: Exchange programmes with Juilliard, Royal College of Music, Sibelius Academy, and top Asian conservatories."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Audition performance is as important as academic grades.",
            "**Academic Requirements**: Best 5 around 18-20. Music background and performance standard are crucial.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Portfolio and audition performance are decisive factors.",
            "**Audition Weighting**: Very High. The audition demonstrates technical proficiency, musicality, and performance experience.",
            "**What Differentiates Winners**: Strong performance skills, clear musical identity, and demonstrated commitment through competitions and ensembles.",
            "**Trend**: Steady demand; graduates benefit from Hong Kong's position as a cultural hub with world-class performance venues."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Chan Hing-yan**: Renowned composer and expert in Chinese orchestral music.",
            "**Professor Yu Siu-wah**: Leading scholar in Chinese music history and ethnomusicology.",
            "**Alumni Network**: Graduates include orchestral musicians in the Hong Kong Philharmonic, music educators, and award-winning composers.",
            "**Research Excellence**: CUHK Music is recognised for research in Chinese music, music education, and interdisciplinary music studies.",
            "**Cultural Impact**: Faculty and alumni contribute to Hong Kong's cultural scene through performances, compositions, and music education."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Music Performance Scholarships**: Special awards for students demonstrating exceptional musical talent through audition.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Instrument & Competition Grants**: Funding for instrument purchase, competition entry fees, and masterclass participation."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Music Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 20+. Academic grades matter but audition performance is paramount.",
            "**Prepare Your Audition**: Choose two contrasting pieces that showcase technical skill and musical expression. Practise extensively.",
            "**Build Performance Experience**: Participate in ensembles, competitions, and public performances to develop stage presence.",
            "**Study Music Theory**: ABRSM Theory Grade 5+ is expected. Strong theory foundation helps with harmony and analysis courses.",
            "**Show Commitment**: Demonstrate dedication through consistent practice, ensemble participation, and engagement with diverse musical styles."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大音樂競爭程度中等。中位數入學成績通常為最佳五科18-20分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：音樂、任何人文科目。強烈建議達ABRSM八級或同等演奏水平。",
            "**試音及面試**：申請者必須通過演奏試音（兩首對比曲目）及評估音樂知識、樂理理解及職業目標的面試。",
            "**非學術因素**：音樂比賽獎項、合奏經驗、作曲作品集及音樂理論資格（ABRSM樂理五級+）均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：樂理、聽音訓練、音樂史（西方及中國）及個人樂器/聲樂課。",
            "**第二年 - 核心研習**：和聲學、對位法、管弦樂法、音樂分析及音樂教育與治療導論。",
            "**第三年 - 專修**：學生選擇專修方向（演奏、作曲、音樂學或音樂教育）並發展高級技巧。",
            "**第四年 - 畢業專題與演奏會**：演奏者的畢業演奏會、作曲者的作品集或音樂學者的研究論文。",
            "**實務訓練**：合奏參與（管弦樂團、合唱團、室樂組）、教學實習及音樂機構實習。",
            "**課程特色**：西方古典傳統以外強調中國音樂元素。可使用專業音樂廳及錄音室。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**演奏**：專業音樂家、管弦樂團樂師、歌劇演唱家及室樂演奏家。",
            "**教育**：學校音樂教師、私人工作室導師及音樂學院和大學講師。",
            "**作曲及編曲**：電影、電視、遊戲及音樂會音樂的作曲家；合奏及錄音的編曲家。",
            "**藝術行政**：音樂廳節目總監、管弦樂團經理及藝術節統籌。",
            "**音樂治療**：在醫院、康復中心及特殊教育工作的註冊音樂治療師。",
            "**媒體及科技**：音響工程師、音樂製作人及音樂軟件和應用程式開發員。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**演奏設施**：專業音樂廳、演奏廳、配備三角鋼琴的練習室及錄音室。",
            "**合奏團體**：中大管弦樂團、合唱團、中樂團及眾多定期公開演出的室樂組。",
            "**學系文化**：支持性社群，舉辦訪問藝術家大師班、作曲工作坊及音樂學研討會。",
            "**學生組織**：音樂學會舉辦音樂會、即興演奏、音樂欣賞活動及外展計劃。",
            "**國際視野**：與茱莉亞學院、皇家音樂學院、西貝流士學院及頂尖亞洲音樂學院進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。試音表現與學術成績同樣重要。",
            "**學術要求**：最佳五科約18-20分。音樂背景及演奏水平至關重要。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。作品集及試音表現是決定性因素。",
            "**試音比重**：非常高。試音展示技巧熟練度、音樂感及演奏經驗。",
            "**成功申請者特質**：強勁演奏技巧、清晰音樂身份及透過比賽和合奏展示的承擔。",
            "**趨勢**：需求穩定；畢業生受益於香港作為擁有世界級演出場地的文化樞紐地位。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**陳慶恩教授**：著名作曲家及中樂團音樂專家。",
            "**余少華教授**：中國音樂史及民族音樂學的領先學者。",
            "**校友網絡**：畢業生包括香港管弦樂團樂師、音樂教育工作者及獲獎作曲家。",
            "**研究卓越**：中大音樂系在中國音樂、音樂教育及跨學科音樂研究方面的研究獲得認可。",
            "**文化影響**：教職員及校友透過演奏、作曲及音樂教育為香港文化界作出貢獻。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**音樂演奏獎學金**：頒予透過試音展示卓越音樂才能學生的特別獎項。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**樂器及比賽資助**：樂器購買、比賽報名費及大師班參與的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大音樂攻略",
        "content": [
            "**分數目標**：最佳五科目標20分以上。學術成績重要，但試音表現至關重要。",
            "**準備試音**：選擇兩首展示技巧及音樂表達的對比曲目。廣泛練習。",
            "**建立演奏經驗**：參與合奏、比賽及公開演出以發展台風。",
            "**學習樂理**：預期達ABRSM樂理五級。穩固樂理基礎有助和聲及分析課程。",
            "**展示承擔**：透過持續練習、合奏參與及接觸多元音樂風格展示奉獻精神。"
        ]
    }
}

details = {
    "code": "JS4082",
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
