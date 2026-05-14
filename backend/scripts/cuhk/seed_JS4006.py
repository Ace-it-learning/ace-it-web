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

# Programme metadata
programme = {
    "code": "JS4006",
    "nameEn": "Anthropology",
    "nameZh": "人類學",
    "name": "人類學",
    "university": "香港中文大學",
    "faculty": "文學院",
    "median": 22,
    "band_a": 24,
    "category": "arts",
    "type": "programme"
}

# Details with 8 sections
en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Anthropology is moderately competitive. The median admission score is typically Best 5 = 20-22 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Chinese History, History, Geography, and Economics are advantageous. Strong reading and writing skills are valued.",
            "**Interview**: Individual interview assessing cultural awareness, critical thinking, curiosity about human societies, and communication skills.",
            "**Non-Academic Factors**: Participation in cultural exchange programmes, volunteer work with diverse communities, museum visits, and independent research projects are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Introduction to anthropology, cultural anthropology, biological anthropology, and archaeological methods.",
            "**Year 2 - Core Methods**: Ethnographic fieldwork techniques, anthropological theory, research methods, and regional studies (Asia, Africa, Oceania).",
            "**Year 3 - Specialisation & Fieldwork**: Students choose streams (Cultural Anthropology, Archaeology, or Museum Studies) and conduct ethnographic fieldwork.",
            "**Year 4 - Capstone & Thesis**: Independent research project, honours thesis, and preparation for graduate studies or professional careers.",
            "**Practical Training**: Hands-on experience in archaeological digs, museum curation, and community-based research projects.",
            "**Unique Features**: CUHK Anthropology is one of the strongest in Asia with extensive fieldwork opportunities in Hong Kong, mainland China, and Southeast Asia."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Museum & Heritage**: Curators, heritage officers, and cultural programme coordinators at museums and heritage organisations.",
            "**NGO & Development Work**: Programme officers at international NGOs, community development workers, and cultural mediators.",
            "**Education & Research**: Teaching positions, academic researchers, and postgraduate studies (MPhil/PhD) in anthropology or related fields.",
            "**Media & Publishing**: Cultural journalists, documentary filmmakers, editors, and content creators focusing on social issues.",
            "**Government & Policy**: Cultural policy advisors, urban planners with cultural expertise, and civil servants in heritage conservation.",
            "**Business & Consulting**: User researchers, market analysts with cultural insights, and corporate diversity consultants."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Small, close-knit department with strong mentorship from professors who are leading researchers in Asian anthropology.",
            "**Fieldwork Opportunities**: Regular organised field trips to rural villages in Hong Kong, mainland China, and Southeast Asian communities.",
            "**Museum Resources**: Access to the CUHK Art Museum and collaborations with the Hong Kong Museum of History for internships.",
            "**Student Societies**: Anthropology Society organises film screenings, cultural festivals, and guest lectures by visiting scholars.",
            "**Global Exposure**: Exchange programmes with top anthropology departments at University of Tokyo, ANU, and University College London."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Less competitive than business or medicine but requires genuine interest in the subject.",
            "**Academic Requirements**: Best 5 around 20-22. No specific elective requirements, making it accessible to arts and science students alike.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Many applicants are genuinely passionate about culture and society.",
            "**Interview Weighting**: High. The interview assesses whether applicants have genuine curiosity about human diversity and social issues.",
            "**What Differentiates Winners**: Demonstrated interest through reading anthropology books, attending cultural events, or independent research distinguishes successful applicants.",
            "**Trend**: Growing interest in recent years as students recognise anthropology's relevance to understanding globalisation and cultural diversity."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Gordon Mathews**: Renowned expert on globalisation and cultural identity in Hong Kong and Japan.",
            "**Professor Sidney Cheung**: Leading researcher in food anthropology and heritage studies in East Asia.",
            "**Alumni Network**: Graduates hold positions at the Hong Kong Museum of History, Leisure and Cultural Services Department, and international NGOs.",
            "**Research Excellence**: CUHK Anthropology department consistently ranks among the top in Asia for research output and fieldwork innovation.",
            "**Community Connections**: Strong ties with local communities in Hong Kong's New Territories, providing unique research opportunities for students."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Fieldwork Grants**: Department-specific funding to support student research and fieldwork expenses.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Overseas Fieldwork Scholarships**: Special funding for students conducting ethnographic research abroad during their studies."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Anthropology Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 22+ with solid English. No specific electives required, but humanities subjects help.",
            "**Read Widely**: Read introductory anthropology books (e.g., 'Small Places, Large Issues' by Thomas Hylland Eriksen) before the interview.",
            "**Show Curiosity**: Demonstrate genuine interest in understanding different cultures and societies. Ask thoughtful questions.",
            "**Engage with Culture**: Visit museums, attend cultural festivals, or volunteer with ethnic minority communities in Hong Kong.",
            "**Think Critically**: Be prepared to discuss how anthropology helps us understand contemporary social issues like migration and globalisation."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大人類學競爭程度中等。中位數入學成績通常為最佳五科20-22分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：中國歷史、歷史、地理及經濟均有優勢。良好的閱讀及寫作能力受重視。",
            "**面試**：個人面試，評估文化意識、批判思維、對人類社會的好奇心及溝通技巧。",
            "**非學術因素**：參與文化交流計劃、多元社群義工服務、博物館參觀及獨立研究項目均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：人類學導論、文化人類學、生物人類學及考古學方法。",
            "**第二年 - 核心方法**：民族誌田野調查技巧、人類學理論、研究方法及區域研究（亞洲、非洲、大洋洲）。",
            "**第三年 - 專修與田野調查**：學生選擇專修方向（文化人類學、考古學或博物館研究）並進行民族誌田野調查。",
            "**第四年 - 畢業專題與論文**：獨立研究項目、榮譽學位論文及為升學或就業作準備。",
            "**實務訓練**：考古發掘、博物館策展及社區研究項目的實踐經驗。",
            "**課程特色**：中大的人類學是亞洲最強之一，提供香港、中國內地及東南亞的豐富田野調查機會。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**博物館及文物**：博物館館長、文物主任及文化機構的節目統籌。",
            "**非政府組織及發展工作**：國際非政府組織的項目主任、社區發展工作者及文化調解員。",
            "**教育及研究**：教學職位、學術研究員及人類學或相關領域的研究院課程（哲學碩士/博士）。",
            "**媒體及出版**：文化記者、紀錄片製作人、編輯及專注社會議題的內容創作者。",
            "**政府及政策**：文化政策顧問、具文化專長的城市規劃師及文物保育公務員。",
            "**商業及顧問**：用戶研究員、具文化洞察力的市場分析師及企業多元文化顧問。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：規模小而緊密的學系，教授均為亞洲人類學研究的領先學者，提供強大的指導。",
            "**田野調查機會**：定期組織前往香港鄉村、中國內地及東南亞社區的田野考察。",
            "**博物館資源**：可使用中大文物館，並與香港歷史博物館合作提供實習機會。",
            "**學生組織**：人類學學會舉辦電影放映、文化節及訪問學者講座。",
            "**國際視野**：與東京大學、澳洲國立大學及倫敦大學學院等頂尖人類學系進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。競爭程度低於商科或醫科，但需要對學科有真正興趣。",
            "**學術要求**：最佳五科約20-22分。無特定選修科要求，文科及理科學生均可報讀。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。許多申請者對文化及社會有真誠熱情。",
            "**面試比重**：高。面試評估申請者是否真正對人類多樣性及社會議題有好奇心。",
            "**成功申請者特質**：透過閱讀人類學書籍、參與文化活動或獨立研究展示興趣的申請者較易成功。",
            "**趨勢**：近年興趣增加，因學生認識到人類學對理解全球化及文化多元性的重要性。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**麥高登教授**：全球化和香港及日本文化身份研究的著名專家。",
            "**張展鴻教授**：東亞飲食人類學及文化遺產研究的領先學者。",
            "**校友網絡**：畢業生任職於香港歷史博物館、康樂及文化事務署及國際非政府組織。",
            "**研究卓越**：中大的人類學系在研究產出及田野調查創新方面持續位居亞洲前列。",
            "**社區聯繫**：與香港新界本地社區有緊密聯繫，為學生提供獨特的研究機會。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**田野調查資助**：學系特定的資金，支持學生的研究及田野調查開支。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**海外田野調查獎學金**：為在學期間進行海外民族誌研究的學生提供特別資助。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大人類學攻略",
        "content": [
            "**分數目標**：最佳五科目標22分以上，英文穩固。無特定選修科要求，但人文科目有幫助。",
            "**廣泛閱讀**：面試前閱讀人類學入門書籍（例如Thomas Hylland Eriksen的《Small Places, Large Issues》）。",
            "**展示好奇心**：展示對理解不同文化及社會的真正興趣。提出深思熟慮的問題。",
            "**參與文化活動**：參觀博物館、參與文化節或與香港少數族裔社群做義工。",
            "**批判思考**：準備討論人類學如何幫助我們理解移民及全球化等當代社會議題。"
        ]
    }
}

details = {
    "code": "JS4006",
    "university": "香港中文大學",
    "en": {"sections": en_sections},
    "zh": {"sections": zh_sections}
}

# Upsert programme
prog_doc = {
    "id": f"prog_{programme['code']}",
    "pk": "programmes",
    "type": "programme",
    **programme,
    "updatedAt": "2026-05-14T12:00:00Z"
}
container.upsert_item(body=prog_doc)
print(f"[Seed] Upserted programme {programme['code']}")

# Upsert details
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
