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
    "code": "JS4094",
    "nameEn": "Philosophy",
    "nameZh": "哲學",
    "name": "哲學",
    "university": "香港中文大學",
    "faculty": "文學院",
    "median": 22,
    "band_a": 24,
    "category": "arts",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Philosophy is moderately competitive. The median admission score is typically Best 5 = 20-22 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 4+ strongly preferred), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Any humanities subject, Ethics and Religious Studies, or Literature are advantageous. Strong logical reasoning and writing skills are essential.",
            "**Interview**: Individual interview assessing philosophical thinking, ability to construct arguments, intellectual curiosity, and engagement with philosophical questions.",
            "**Non-Academic Factors**: Philosophy essay competitions, debate experience, reading of philosophical texts, and participation in discussion groups are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Introduction**: Introduction to philosophy, logic, ethics, and critical thinking. Development of analytical and argumentative skills.",
            "**Year 2 - Core Areas**: Epistemology, metaphysics, philosophy of mind, political philosophy, and history of philosophy (ancient to modern).",
            "**Year 3 - Specialisation**: Students choose streams (Analytic Philosophy, Continental Philosophy, Chinese Philosophy, or Applied Ethics) and conduct research.",
            "**Year 4 - Capstone & Thesis**: Honours thesis on a philosophical topic, advanced seminars, and preparation for graduate studies or professional careers.",
            "**Practical Training**: Logic workshops, argumentation training, ethics case analysis, and internship in policy think tanks or NGOs.",
            "**Unique Features**: Strong emphasis on both Western and Chinese philosophical traditions with opportunities for comparative philosophical research."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Education**: Philosophy teachers at schools, lecturers at tertiary institutions, and curriculum developers in critical thinking education.",
            "**Law**: Many philosophy graduates pursue law degrees (JD/PCLL) and become barristers or solicitors due to strong analytical training.",
            "**Civil Service & Policy**: Administrative officers, policy analysts, and ethics advisors in government departments.",
            "**Business & Consulting**: Management consultants, strategic planners, and analysts valued for critical thinking and problem-solving abilities.",
            "**Media & Publishing**: Editors, writers, and commentators on social and ethical issues for newspapers, magazines, and digital platforms.",
            "**Research & Academia**: Research fellows, PhD candidates, and postdoctoral researchers in philosophy at universities worldwide."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Intellectually rigorous environment with faculty specialising in analytic philosophy, Chinese philosophy, and ethics.",
            "**Philosophy Society**: Active student society organising reading groups, debate tournaments, philosophy cafes, and guest lectures.",
            "**Research Seminars**: Regular departmental seminars where students engage with cutting-edge philosophical research presented by visiting scholars.",
            "**Interdisciplinary Connections**: Collaborations with law, medicine, and business faculties on applied ethics and critical thinking.",
            "**Global Exposure**: Exchange programmes with top philosophy departments at Oxford, Cambridge, UC Berkeley, and leading Asian universities."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Appeals to students with analytical minds and intellectual curiosity.",
            "**Academic Requirements**: Best 5 around 20-22. Strong English skills are essential for reading and writing philosophical texts.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Many applicants are self-motivated thinkers.",
            "**Interview Weighting**: High. The interview assesses philosophical thinking, argument construction, and intellectual engagement.",
            "**What Differentiates Winners**: Demonstrated interest through reading philosophy, participation in debates, or engagement with philosophical questions.",
            "**Trend**: Growing recognition of philosophy's value for developing critical thinking skills applicable across many professions."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Donald L. M. Baxter**: Renowned expert in metaphysics and philosophy of logic.",
            "**Professor Lao Sze-kwang**: Leading scholar in Chinese philosophy and intellectual history (former faculty).",
            "**Alumni Network**: Graduates include lawyers, civil servants, published philosophers, and business leaders who credit philosophy for their analytical skills.",
            "**Research Excellence**: CUHK Philosophy is recognised for research in Chinese philosophy, ethics, and philosophy of mind.",
            "**Public Engagement**: Faculty regularly contribute to public discourse on ethics, politics, and social issues through media and community outreach."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Philosophy Department Awards**: Recognition for exceptional philosophical writing and analytical ability.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Research Grants**: Funding for student research projects, conference attendance, and philosophy essay competitions."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Philosophy Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 22+ with strong English. Humanities electives help develop relevant skills.",
            "**Read Philosophy**: Start with accessible introductions by authors like Bertrand Russell, Nigel Warburton, or Simon Blackburn.",
            "**Practise Arguing**: Engage in debates, join discussion groups, and practise constructing clear, logical arguments.",
            "**Think Critically**: Be prepared to analyse arguments, identify assumptions, and evaluate evidence during the interview.",
            "**Show Intellectual Curiosity**: Be ready to discuss philosophical questions that genuinely interest you and explain why they matter."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大哲學競爭程度中等。中位數入學成績通常為最佳五科20-22分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 4+強烈建議）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：任何人文科目、倫理與宗教研究或文學均有優勢。強大的邏輯推理及寫作技巧至關重要。",
            "**面試**：個人面試，評估哲學思維、建構論證的能力、求知慾及對哲學問題的參與。",
            "**非學術因素**：哲學論文比賽、辯論經驗、閱讀哲學文本及參與討論小組均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 導論**：哲學導論、邏輯學、倫理學及批判思維。培養分析及論證技巧。",
            "**第二年 - 核心領域**：知識論、形而上學、心靈哲學、政治哲學及哲學史（古代至現代）。",
            "**第三年 - 專修**：學生選擇專修方向（分析哲學、歐陸哲學、中國哲學或應用倫理學）並進行研究。",
            "**第四年 - 畢業專題與論文**：哲學題目的榮譽學位論文、高級研討班及為升學或就業作準備。",
            "**實務訓練**：邏輯工作坊、論證訓練、倫理個案分析及政策智庫或非政府組織實習。",
            "**課程特色**：強調西方及中國哲學傳統，提供比較哲學研究機會。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**教育**：學校哲學教師、大專院校講師及批判思維教育的課程發展專員。",
            "**法律**：許多哲學畢業生攻讀法律學位（JD/PCLL），成為大律師或律師，受益於強大的分析訓練。",
            "**公務員及政策**：政府部門的行政主任、政策分析員及倫理顧問。",
            "**商業及顧問**：管理顧問、策略規劃師及分析員，受重視其批判思維及解難能力。",
            "**媒體及出版**：報章、雜誌及數碼平台有關社會及倫理議題的編輯、作家及評論員。",
            "**研究及學術**：全球大學哲學研究的研究生、博士候選人及博士後研究員。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：智力嚴謹的環境，教職員專研分析哲學、中國哲學及倫理學。",
            "**哲學學會**：活躍的學生學會，舉辦讀書會、辯論比賽、哲學咖啡館及嘉賓講座。",
            "**研究研討會**：定期學系研討會，學生與訪問學者交流前沿哲學研究。",
            "**跨學科聯繫**：與法律、醫學及商學院合作應用倫理學及批判思維。",
            "**國際視野**：與牛津、劍橋、加州大學伯克利分校及頂尖亞洲大學的哲學系進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。吸引具分析頭腦及求知慾的學生。",
            "**學術要求**：最佳五科約20-22分。強勁英文技巧對閱讀及撰寫哲學文本至關重要。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。許多申請者是自學的思考者。",
            "**面試比重**：高。面試評估哲學思維、論證建構及智力參與。",
            "**成功申請者特質**：透過閱讀哲學、參與辯論或接觸哲學問題展示興趣的申請者。",
            "**趨勢**：哲學對培養適用於多種職業的批判思維技巧的價值日益獲得認可。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**Donald L. M. Baxter教授**：形而上學及邏輯哲學的著名專家。",
            "**勞思光教授**：中國哲學及思想史的領先學者（前教職員）。",
            "**校友網絡**：畢業生包括律師、公務員、出版哲學家及將分析能力歸功於哲學訓練的商界領袖。",
            "**研究卓越**：中大哲學在中國哲學、倫理學及心靈哲學方面的研究獲得認可。",
            "**公眾參與**：教職員定期透過媒體及社區外展就倫理、政治及社會議題向公眾論述作出貢獻。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**哲學系獎項**：嘉許卓越哲學寫作及分析能力的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**研究資助**：學生研究項目、會議出席及哲學論文比賽的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大哲學攻略",
        "content": [
            "**分數目標**：最佳五科目標22分以上，英文強勁。人文選修科有助培養相關技巧。",
            "**閱讀哲學**：從Bertrand Russell、Nigel Warburton或Simon Blackburn等作者的入門書開始。",
            "**練習論證**：參與辯論、加入討論小組，練習建構清晰、邏輯的論證。",
            "**批判思考**：準備在面試中分析論證、識別假設及評估證據。",
            "**展示求知慾**：準備討論真正引起你興趣的哲學問題，並解釋為何它們重要。"
        ]
    }
}

details = {
    "code": "JS4094",
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
