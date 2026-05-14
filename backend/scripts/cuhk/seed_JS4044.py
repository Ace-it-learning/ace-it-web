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
    "code": "JS4044",
    "nameEn": "Fine Arts",
    "nameZh": "藝術",
    "name": "藝術",
    "university": "香港中文大學",
    "faculty": "文學院",
    "median": 21,
    "band_a": 23,
    "category": "arts",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Fine Arts is moderately competitive. The median admission score is typically Best 5 = 19-21 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Visual Arts, Design and Applied Technology, and any humanities subject are advantageous. A strong portfolio is essential.",
            "**Portfolio & Interview**: Applicants must submit a portfolio of artwork and attend an interview assessing artistic vision, creativity, and commitment to art practice.",
            "**Non-Academic Factors**: Art competitions, exhibitions, community art projects, and independent creative practice are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundation Studio**: Drawing, painting, sculpture, printmaking, and introduction to art history and theory.",
            "**Year 2 - Media Exploration**: Photography, digital media, installation art, video art, and contemporary art practices.",
            "**Year 3 - Specialisation & Critique**: Students choose focus areas (Painting, Sculpture, Media Art, or Art History) and develop individual artistic voice.",
            "**Year 4 - Degree Show & Thesis**: Final degree exhibition, honours thesis on art theory or practice, and professional portfolio development.",
            "**Practical Training**: Studio practice, gallery internships, curatorial projects, and community art engagement programmes.",
            "**Unique Features**: CUHK Fine Arts is one of Hong Kong's premier art schools with excellent studio facilities and strong connections to the local art scene."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Professional Artist**: Painters, sculptors, photographers, and multimedia artists exhibiting in galleries and museums.",
            "**Gallery & Museum**: Curators, gallery managers, exhibition designers, and art educators at cultural institutions.",
            "**Design & Creative Industries**: Graphic designers, art directors, illustrators, and creative consultants.",
            "**Education**: Art teachers at schools, lecturers at art colleges, and workshop facilitators.",
            "**Art Administration**: Programme officers at arts councils, cultural centres, and non-profit art organisations.",
            "**Further Studies**: MFA programmes at top art schools worldwide including RCA, Yale, and Slade School of Fine Art."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Studio Facilities**: Excellent studios for painting, sculpture, printmaking, photography, and digital media with extended access hours.",
            "**Department Culture**: Creative and supportive environment with regular studio critiques, visiting artist talks, and peer collaboration.",
            "**Exhibition Opportunities**: Annual student exhibitions, degree show at major venues, and opportunities to exhibit at university galleries.",
            "**Art Community**: Strong connections to Hong Kong's vibrant art scene including galleries in Central, Wong Chuk Hang, and art fairs.",
            "**Global Exposure**: Exchange programmes with top art schools in Europe, America, and Asia including Slade, RISD, and Tokyo University of the Arts."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Portfolio quality and artistic potential are as important as academic grades.",
            "**Academic Requirements**: Best 5 around 19-21. No specific elective requirements but Visual Arts background is helpful.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Portfolio and interview performance are decisive factors.",
            "**Portfolio Weighting**: Very High. The portfolio demonstrates artistic skill, creativity, and commitment to art practice.",
            "**What Differentiates Winners**: Strong portfolio with original ideas, clear artistic vision, and genuine passion for creating art.",
            "**Trend**: Growing interest as Hong Kong's art market expands; graduates benefit from the city's position as Asia's art hub."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Josh Yiu**: Renowned curator and expert in Chinese art history, former director of CUHK Art Museum.",
            "**Professor Frank Vigneron**: Leading scholar in contemporary Chinese art and art theory.",
            "**Alumni Network**: Graduates include established artists exhibiting internationally, gallery directors, and cultural leaders in Hong Kong.",
            "**Research Excellence**: CUHK Fine Arts department is recognised for research in Hong Kong art history, contemporary Asian art, and curatorial studies.",
            "**Cultural Impact**: Faculty and alumni have shaped Hong Kong's art scene through exhibitions, publications, and cultural policy."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Artistic Achievement Awards**: Special recognition for students with exceptional artistic talent demonstrated through portfolio.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Exhibition & Material Grants**: Funding for student exhibitions, art material costs, and overseas residency programmes."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Fine Arts Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 21+. Academic grades matter but portfolio quality is paramount.",
            "**Build a Strong Portfolio**: Include 10-15 pieces showing range, originality, and technical skill across different media.",
            "**Develop Your Voice**: Show a coherent artistic vision. Interviewers want to see genuine passion and original thinking.",
            "**Engage with Art**: Visit galleries regularly, read art theory, and document your creative process in a sketchbook.",
            "**Be Prepared to Discuss**: Articulate your influences, artistic intentions, and why you want to study fine arts at CUHK."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大藝術競爭程度中等。中位數入學成績通常為最佳五科19-21分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：視覺藝術、設計與應用科技及任何人文科均有優勢。優秀的作品集至關重要。",
            "**作品集及面試**：申請者必須提交藝術作品集，並參加評估藝術視野、創意及對藝術實踐承擔的面試。",
            "**非學術因素**：藝術比賽、展覽、社區藝術項目及獨立創作實踐均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎工作室**：繪畫、雕塑、版畫、藝術史及理論導論。",
            "**第二年 - 媒介探索**：攝影、數碼媒介、裝置藝術、錄像藝術及當代藝術實踐。",
            "**第三年 - 專修與評論**：學生選擇重點方向（繪畫、雕塑、媒介藝術或藝術史）並發展個人藝術風格。",
            "**第四年 - 畢業展及論文**：畢業展覽、藝術理論或實踐榮譽學位論文及專業作品集發展。",
            "**實務訓練**：工作室實踐、畫廊實習、策展項目及社區藝術參與計劃。",
            "**課程特色**：中大藝術是香港頂尖藝術學院之一，擁有優秀的工作室設施及與本地藝術界的緊密聯繫。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**專業藝術家**：在畫廊及博物館展覽的畫家、雕塑家、攝影師及多媒體藝術家。",
            "**畫廊及博物館**：文化機構的策展人、畫廊經理、展覽設計師及藝術教育工作者。",
            "**設計及創意產業**：平面設計師、藝術總監、插畫師及創意顧問。",
            "**教育**：學校藝術教師、藝術學院講師及工作坊導師。",
            "**藝術行政**：藝術發展局、文化中心及非牟利藝術組織的節目主任。",
            "**深造**：全球頂尖藝術學院的藝術碩士課程，包括皇家藝術學院、耶魯大學及斯萊德美術學院。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**工作室設施**：優秀的繪畫、雕塑、版畫、攝影及數碼媒介工作室，提供延長開放時間。",
            "**學系文化**：創意及支持的環境，定期舉辦工作室評論、訪問藝術家講座及同儕合作。",
            "**展覽機會**：年度學生展覽、主要場地的畢業展及大學畫廊的展覽機會。",
            "**藝術社群**：與香港活躍的藝術界有緊密聯繫，包括中環、黃竹坑的畫廊及藝術博覽會。",
            "**國際視野**：與歐洲、美洲及亞洲頂尖藝術學院進行交換計劃，包括斯萊德、RISD及東京藝術大學。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。作品集質素及藝術潛能與學術成績同樣重要。",
            "**學術要求**：最佳五科約19-21分。無特定選修科要求，但視覺藝術背景有幫助。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。作品集及面試表現是決定性因素。",
            "**作品集比重**：非常高。作品集展示藝術技巧、創意及對藝術實踐的承擔。",
            "**成功申請者特質**：具有原創想法的強勁作品集、清晰的藝術視野及對創作藝術的真誠熱情。",
            "**趨勢**：隨著香港藝術市場擴展，興趣增加；畢業生受益於香港作為亞洲藝術樞紐的地位。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**姚進莊教授**：著名策展人及中國藝術史專家，前中大文物館館長。",
            "**韋一空教授**：當代中國藝術及藝術理論的領先學者。",
            "**校友網絡**：畢業生包括國際展覽的知名藝術家、畫廊總監及香港的文化領袖。",
            "**研究卓越**：中大藝術系在香港藝術史、當代亞洲藝術及策展研究方面的研究獲得認可。",
            "**文化影響**：教職員及校友透過展覽、出版物及文化政策塑造香港藝術界。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**藝術成就獎**：特別嘉許透過作品集展示卓越藝術才能的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**展覽及材料資助**：學生展覽、藝術材料費用及海外駐場計劃的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大藝術攻略",
        "content": [
            "**分數目標**：最佳五科目標21分以上。學術成績重要，但作品集質素至關重要。",
            "**建立強勁作品集**：包含10-15件展示不同媒介範圍、原創性及技巧的作品。",
            "**發展個人風格**：展示連貫的藝術視野。面試官希望看到真誠的熱情及原創思維。",
            "**參與藝術活動**：定期參觀畫廊、閱讀藝術理論，並在速寫簿記錄創作過程。",
            "**準備討論**：闡述你的影響、藝術意圖及為何想在中大修讀藝術。"
        ]
    }
}

details = {
    "code": "JS4044",
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
