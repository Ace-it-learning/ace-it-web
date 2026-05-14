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
    "code": "JS4100",
    "nameEn": "Public Humanities",
    "nameZh": "公共人文學",
    "name": "公共人文學",
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
            "**Academic Threshold**: CUHK Public Humanities is moderately competitive. The median admission score is typically Best 5 = 19-21 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Any humanities subject, Visual Arts, or History are advantageous. Interest in public engagement and cultural issues is essential.",
            "**Interview**: Individual interview assessing understanding of public humanities, communication skills, creativity in cultural projects, and commitment to community engagement.",
            "**Non-Academic Factors**: Participation in cultural projects, community arts programmes, museum volunteering, and creative writing or media production are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Introduction to public humanities, cultural studies, digital storytelling, and community engagement theories.",
            "**Year 2 - Core Skills**: Cultural heritage management, public history, museum studies, digital humanities tools, and project design.",
            "**Year 3 - Specialisation & Internship**: Students choose streams (Cultural Heritage, Digital Humanities, or Community Arts) and complete internships at museums, NGOs, or cultural organisations.",
            "**Year 4 - Capstone Project**: Major public-facing project such as an exhibition, documentary, digital archive, or community programme with real-world impact.",
            "**Practical Training**: Hands-on experience in curating exhibitions, producing media content, managing cultural projects, and facilitating community workshops.",
            "**Unique Features**: Interdisciplinary programme combining humanities scholarship with practical skills for public engagement and cultural sector careers."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Museums & Heritage**: Curators, education officers, exhibition designers, and heritage managers at museums and cultural sites.",
            "**Arts Administration**: Programme managers, festival coordinators, and cultural policy advisors at arts councils and cultural organisations.",
            "**Media & Digital Content**: Documentary producers, podcast creators, digital archivists, and content strategists for cultural platforms.",
            "**Community Engagement**: Community arts organisers, cultural mediators, and outreach coordinators for NGOs and government.",
            "**Education**: Humanities educators, museum educators, and programme developers in informal learning settings.",
            "**Creative Industries**: Cultural entrepreneurs, creative project managers, and consultants for cultural tourism and place-making."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Innovative and interdisciplinary environment bridging academic humanities and public cultural practice.",
            "**Project-Based Learning**: Students work on real cultural projects from Year 1, building portfolios of exhibitions, digital content, and community programmes.",
            "**Industry Partnerships**: Collaborations with Hong Kong Museum of History, M+, Tai Kwun, and numerous community arts organisations.",
            "**Student Societies**: Public Humanities Society organises cultural events, film screenings, and community engagement projects.",
            "**Global Exposure**: Study tours to cultural institutions in Taiwan, Japan, and Europe; exchange programmes with universities strong in public humanities."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Appeals to students passionate about making humanities relevant to society.",
            "**Academic Requirements**: Best 5 around 19-21. Diverse backgrounds welcome; no specific elective requirements.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Portfolio of cultural engagement activities is important.",
            "**Interview Weighting**: High. The interview assesses creativity, communication skills, and genuine commitment to public cultural work.",
            "**What Differentiates Winners**: Demonstrated engagement with cultural projects, creative portfolio, and clear vision for how humanities can serve communities.",
            "**Trend**: Growing interest as Hong Kong invests in cultural infrastructure and recognises the value of humanities in public life."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Leo Ou-fan Lee**: Cultural critic and public intellectual who bridges academic scholarship and public engagement.",
            "**Professor Ng Chun-hung**: Expert in cultural studies and public history with extensive museum consultancy experience.",
            "**Alumni Network**: Graduates work at major Hong Kong museums, cultural NGOs, and media organisations as programme directors and content creators.",
            "**Research Excellence**: Faculty research in public humanities, cultural memory, and digital heritage informs public policy and museum practice.",
            "**Community Impact**: Students and alumni have created impactful community projects addressing Hong Kong's cultural identity and heritage."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Public Humanities Project Grants**: Funding for student-led cultural projects, exhibitions, and community engagement initiatives.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Internship Support**: Stipends for unpaid internships at museums, NGOs, and cultural organisations."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Public Humanities Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 21+. Academic grades matter but demonstrated cultural engagement is equally important.",
            "**Build a Portfolio**: Document your involvement in cultural projects, exhibitions, community events, or creative work.",
            "**Engage with Culture**: Visit museums, attend cultural festivals, volunteer at community arts programmes, and reflect on these experiences.",
            "**Think Creatively**: Be prepared to discuss how you would make a humanities topic accessible and engaging to the public.",
            "**Show Commitment**: Demonstrate genuine interest in using humanities knowledge to serve communities and address social issues."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大公共人文學競爭程度中等。中位數入學成績通常為最佳五科19-21分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：任何人文科目、視覺藝術或歷史均有優勢。對公共參與及文化議題的興趣至關重要。",
            "**面試**：個人面試，評估對公共人文學的理解、溝通技巧、文化項目的創意及對社區參與的承擔。",
            "**非學術因素**：參與文化項目、社區藝術計劃、博物館義工服務及創意寫作或媒體製作均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：公共人文學導論、文化研究、數碼敘事及社區參與理論。",
            "**第二年 - 核心技巧**：文化遺產管理、公共歷史、博物館研究、數碼人文工具及項目設計。",
            "**第三年 - 專修與實習**：學生選擇專修方向（文化遺產、數碼人文學或社區藝術）並在博物館、非政府組織或文化機構完成實習。",
            "**第四年 - 畢業專題**：重大面向公眾的項目，如展覽、紀錄片、數碼檔案或具實際影響的社區計劃。",
            "**實務訓練**：策展展覽、製作媒體內容、管理文化項目及促進社區工作坊的實踐經驗。",
            "**課程特色**：跨學科課程結合人文學術與公共參與及文化界職業的實用技巧。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**博物館及文物**：博物館及文化景點的策展人、教育主任、展覽設計師及文物經理。",
            "**藝術行政**：藝術發展局及文化機構的節目經理、藝術節統籌及文化政策顧問。",
            "**媒體及數碼內容**：文化平台的紀錄片製作人、播客創作者、數碼檔案管理員及內容策略師。",
            "**社區參與**：非政府組織及政府的社區藝術統籌、文化調解員及外展主任。",
            "**教育**：非正式學習環境的人文學教育工作者、博物館教育工作者及節目開發員。",
            "**創意產業**：文化創業家、創意項目經理及文化旅遊和地區營造的顧問。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：創新及跨學科環境，連接學術人文學與公共文化實踐。",
            "**項目為本學習**：學生從第一年開始參與真實文化項目，建立展覽、數碼內容及社區計劃的作品集。",
            "**業界夥伴**：與香港歷史博物館、M+、大館及眾多社區藝術組織合作。",
            "**學生組織**：公共人文學學會舉辦文化活動、電影放映及社區參與項目。",
            "**國際視野**：參觀台灣、日本及歐洲文化機構的學習團；與公共人文學強項的大學進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。吸引對使人文學與社會相關有熱情的學生。",
            "**學術要求**：最佳五科約19-21分。歡迎不同背景；無特定選修科要求。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。文化參與活動的作品集很重要。",
            "**面試比重**：高。面試評估創意、溝通技巧及對公共文化工作的真正承擔。",
            "**成功申請者特質**：展示文化項目參與、創意作品集及人文學如何服務社區的清晰願景。",
            "**趨勢**：隨著香港投資文化基建及認識人文學在公共生活的價值，興趣增加。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**李歐梵教授**：連接學術研究與公共參與的文化評論員及公共知識分子。",
            "**吳俊雄教授**：文化研究及公共歷史專家，擁有豐富博物館顧問經驗。",
            "**校友網絡**：畢業生在主要香港博物館、文化非政府組織及媒體機構擔任節目總監及內容創作者。",
            "**研究卓越**：教職員在公共人文學、文化記憶及數碼遺產方面的研究為公共政策及博物館實踐提供資訊。",
            "**社區影響**：學生及校友創建了應對香港文化身份及遺產的有影響力社區項目。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**公共人文學項目資助**：學生主導文化項目、展覽及社區參與計劃的資金。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**實習支援**：博物館、非政府組織及文化機構無薪實習的津貼。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大公共人文學攻略",
        "content": [
            "**分數目標**：最佳五科目標21分以上。學術成績重要，但展示的文化參與同樣重要。",
            "**建立作品集**：記錄你在文化項目、展覽、社區活動或創意工作的參與。",
            "**參與文化活動**：參觀博物館、參與文化節、在社區藝術計劃做義工，並反思這些經驗。",
            "**創意思維**：準備討論如何使人文學主題對公眾而言易於理解且引人入勝。",
            "**展示承擔**：展示利用人文學知識服務社區及解決社會問題的真正興趣。"
        ]
    }
}

details = {
    "code": "JS4100",
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
