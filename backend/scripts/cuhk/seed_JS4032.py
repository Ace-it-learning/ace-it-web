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
    "code": "JS4032",
    "nameEn": "English",
    "nameZh": "英文",
    "name": "英文",
    "university": "香港中文大學",
    "faculty": "文學院",
    "median": 24,
    "band_a": 26,
    "category": "arts",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK English is moderately competitive. The median admission score is typically Best 5 = 22-24 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English Language (Level 5+ strongly preferred), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: English Literature, History, and any humanities subject are advantageous. Strong analytical and writing skills are essential.",
            "**Interview**: Individual interview assessing English proficiency, literary analysis skills, critical thinking, and passion for language and literature.",
            "**Non-Academic Factors**: English writing competitions, debate experience, drama participation, and extensive reading of English literature are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Introduction to literary studies, English linguistics, academic writing, and critical theory.",
            "**Year 2 - Literary Periods**: British literature, American literature, world literature in English, and Shakespeare studies.",
            "**Year 3 - Specialisation**: Students choose streams (Literature, Linguistics, or Professional Communication) and conduct research projects.",
            "**Year 4 - Capstone & Thesis**: Honours thesis, advanced seminars, and preparation for teaching, publishing, or graduate studies.",
            "**Practical Training**: Teaching practicum for education stream, editorial internships, and professional writing workshops.",
            "**Unique Features**: Strong emphasis on both literary criticism and applied linguistics with opportunities for creative writing and translation."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Education**: English Language teachers at primary and secondary schools, lecturers at tertiary institutions, and curriculum developers.",
            "**Media & Publishing**: Editors, writers, and content creators at English-language media outlets, publishing houses, and digital platforms.",
            "**Corporate Communications**: Corporate communications specialists, copywriters, and public relations officers at multinational companies.",
            "**Government & Civil Service**: Administrative officers, policy researchers, and international liaison officers.",
            "**Research & Academia**: Research fellows, PhD candidates, and postdoctoral researchers in English studies at universities worldwide.",
            "**Translation & Interpretation**: Professional translators, interpreters, and localization specialists for global businesses."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Vibrant department with internationally renowned scholars in literary theory, linguistics, and creative writing.",
            "**Literary Events**: Regular poetry readings, author visits, Shakespeare performances, and film screenings organised by the department.",
            "**Student Societies**: English Society organises debate competitions, creative writing workshops, and theatre productions.",
            "**Global Exposure**: Exchange programmes with University of Oxford, Cambridge, University College London, and other top English departments.",
            "**Creative Opportunities**: Annual creative writing anthology, student-run literary magazine, and drama productions in English."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate to High (★★★★☆). Popular among students with strong English language backgrounds.",
            "**Academic Requirements**: Best 5 around 22-24. English Language at Level 5+ is strongly preferred for success.",
            "**Band A Competition**: Typically 2-3 applicants per place. Many applicants have excelled in English writing and speech competitions.",
            "**Interview Weighting**: Very High. The interview assesses spoken English, literary analysis, and critical thinking on the spot.",
            "**What Differentiates Winners**: Extensive reading, strong writing skills, and genuine passion for English literature and language distinguish top candidates.",
            "**Trend**: Consistently popular; graduates are in high demand for teaching positions and corporate communications roles."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Stephen Owen**: World-renowned scholar of Chinese poetry and comparative literature at Harvard University (former CUHK faculty).",
            "**Professor David Parker**: Leading expert in postcolonial literature and cultural studies.",
            "**Alumni Network**: Graduates include prominent English teachers, published authors, journalists, and communications directors at major corporations.",
            "**Research Excellence**: CUHK English Department consistently ranks among the top in Asia for literary and linguistic research.",
            "**Cultural Impact**: Faculty members regularly contribute to public discourse on language policy, literature, and cultural criticism."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**English Department Awards**: Special recognition for students demonstrating exceptional aptitude in literary analysis and creative writing.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Overseas Study Grants**: Funding for student exchange programmes, summer schools at Oxford/Cambridge, and international conferences."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK English Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 24+ with English Language at Level 5 or above. Strong humanities electives help.",
            "**Read Extensively**: Read widely across genres and periods — Shakespeare, Victorian novels, modernist poetry, and postcolonial fiction.",
            "**Practise Analysis**: Develop skills in close reading and literary analysis. Be prepared to analyse unseen texts in the interview.",
            "**Engage with Literature**: Join book clubs, attend literary events, and participate in creative writing competitions.",
            "**Think Critically**: Be ready to discuss how literature reflects and shapes culture, identity, and society."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大英文競爭程度中等至激烈。中位數入學成績通常為最佳五科22-24分（標準計分，5**=7分）。",
            "**核心科目**：英國語文（Level 5+強烈建議）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：英語文學、歷史及任何人文科均有優勢。強大的分析及寫作技巧至關重要。",
            "**面試**：個人面試，評估英語能力、文學分析技巧、批判思維及對語言和文學的熱情。",
            "**非學術因素**：英語寫作比賽、辯論經驗、戲劇參與及廣泛閱讀英語文學均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：文學研究導論、英語語言學、學術寫作及批判理論。",
            "**第二年 - 文學時期**：英國文學、美國文學、英語世界文學及莎士比亞研究。",
            "**第三年 - 專修**：學生選擇專修方向（文學、語言學或專業傳播）並進行研究項目。",
            "**第四年 - 畢業專題與論文**：榮譽學位論文、高級研討班及為教學、出版或升學作準備。",
            "**實務訓練**：教育流的教學實習、編輯實習及專業寫作工作坊。",
            "**課程特色**：強調文學批評及應用語言學，提供創意寫作及翻譯機會。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**教育**：中小學英語科教師、大專院校講師及課程發展專員。",
            "**媒體及出版**：英語媒體、出版社及數碼平台的編輯、作家及內容創作者。",
            "**企業傳訊**：跨國公司的企業傳訊專員、文案撰寫員及公共關係主任。",
            "**政府及公務員**：行政主任、政策研究員及國際聯絡主任。",
            "**研究及學術**：全球大學英語研究的研究生、博士候選人及博士後研究員。",
            "**翻譯及傳譯**：全球企業的專業翻譯員、傳譯員及本地化專員。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：充滿活力的學系，擁有文學理論、語言學及創意寫作方面國際知名的學者。",
            "**文學活動**：定期舉辦詩歌朗誦、作家探訪、莎士比亞表演及電影放映。",
            "**學生組織**：英文學會舉辦辯論比賽、創意寫作工作坊及戲劇製作。",
            "**國際視野**：與牛津大學、劍橋大學、倫敦大學學院等頂尖英文系進行交換計劃。",
            "**創意機會**：年度創意寫作文集、學生文學雜誌及英語戲劇製作。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等至激烈（★★★★☆）。受英語語言背景強勁的學生歡迎。",
            "**學術要求**：最佳五科約22-24分。英國語文科達Level 5+強烈建議。",
            "**Band A競爭**：通常每個學額有2-3名申請人。許多申請者在英語寫作及演講比賽中表現優異。",
            "**面試比重**：非常高。面試評估英語口語、文學分析及即場批判思維。",
            "**成功申請者特質**：廣泛閱讀、強勁寫作技巧及對英語文學和語言的真誠熱情使頂尖候選人脫穎而出。",
            "**趨勢**：持續受歡迎；畢業生在教學職位及企業傳訊角色方面需求甚殷。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**宇文所安教授**：世界知名的中國詩歌及比較文學學者（前中大教職員）。",
            "**大衛·帕克教授**：後殖民文學及文化研究的領先專家。",
            "**校友網絡**：畢業生包括傑出英語科教師、出版作家、記者及大型企業的傳訊總監。",
            "**研究卓越**：中大英文系在文學及語言學研究方面持續位居亞洲前列。",
            "**文化影響**：教職員定期就語言政策、文學及文化批評向公眾論述作出貢獻。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**英文系獎項**：特別嘉許在文學分析及創意寫作展現卓越才能的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**海外學習資助**：學生交換計劃、牛津/劍橋暑期學校及國際會議的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大英文攻略",
        "content": [
            "**分數目標**：最佳五科目標24分以上，英國語文達Level 5或以上。強勁的人文選修科有幫助。",
            "**廣泛閱讀**：廣泛閱讀各類型及時期——莎士比亞、維多利亞小說、現代主義詩歌及後殖民小說。",
            "**練習分析**：培養細讀及文學分析技巧。準備在面試中分析未見過的文本。",
            "**參與文學活動**：加入讀書會、參加文學活動及參與創意寫作比賽。",
            "**批判思考**：準備討論文學如何反映及塑造文化、身份及社會。"
        ]
    }
}

details = {
    "code": "JS4032",
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
