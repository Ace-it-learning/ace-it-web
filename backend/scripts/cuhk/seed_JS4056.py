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
    "code": "JS4056",
    "nameEn": "History",
    "nameZh": "歷史",
    "name": "歷史",
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
            "**Academic Threshold**: CUHK History is moderately competitive. The median admission score is typically Best 5 = 20-22 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: History, Chinese History, and Geography are highly advantageous. Strong reading and analytical skills are essential.",
            "**Interview**: Individual interview assessing historical knowledge, critical thinking, ability to analyse primary sources, and passion for understanding the past.",
            "**Non-Academic Factors**: History essay competitions, museum visits, participation in historical societies, and independent research projects are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Introduction to historical methods, world history, and historiography. Development of research and writing skills.",
            "**Year 2 - Thematic Studies**: Political history, social history, economic history, cultural history, and history of science and technology.",
            "**Year 3 - Regional Specialisation**: Students choose focus areas (Chinese History, European History, Asian History, or Comparative History) and conduct research.",
            "**Year 4 - Capstone & Thesis**: Honours thesis based on original research using primary sources, advanced seminars, and preparation for graduate studies.",
            "**Practical Training**: Archival research training, museum internships, oral history projects, and digital humanities workshops.",
            "**Unique Features**: Strong emphasis on primary source analysis and research methodology. Access to rare Chinese historical documents and archives."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Education**: History teachers at primary and secondary schools, lecturers at tertiary institutions, and curriculum developers.",
            "**Museums & Heritage**: Curators, heritage officers, archivists, and museum educators at cultural institutions.",
            "**Media & Publishing**: Editors, writers, and researchers for history documentaries, publishing houses, and digital media platforms.",
            "**Government & Civil Service**: Administrative officers, policy researchers, and diplomats with historical expertise.",
            "**Research & Academia**: Research fellows, PhD candidates, and postdoctoral researchers in history at universities worldwide.",
            "**Business & Consulting**: Market researchers, corporate strategists, and consultants who value analytical and research skills."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Vibrant intellectual community with renowned historians specialising in Chinese, European, and global history.",
            "**Library Resources**: Access to the CUHK Library's extensive collection of historical documents, rare books, and digital archives.",
            "**Student Societies**: History Society organises academic seminars, film screenings, historical site visits, and guest lectures.",
            "**Research Opportunities**: Participation in faculty research projects, oral history initiatives, and digital humanities collaborations.",
            "**Global Exposure**: Exchange programmes with top history departments at Oxford, Cambridge, Harvard, and leading Asian universities."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Popular among students with strong humanities backgrounds and analytical skills.",
            "**Academic Requirements**: Best 5 around 20-22. History or Chinese History electives are strongly preferred.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Many applicants have demonstrated passion through competitions and projects.",
            "**Interview Weighting**: High. The interview assesses historical thinking, source analysis, and ability to construct historical arguments.",
            "**What Differentiates Winners**: Extensive reading, strong essay-writing skills, and genuine intellectual curiosity about the past.",
            "**Trend**: Consistently popular; history graduates are valued for their research and analytical abilities across many sectors."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Lai Ming-yiu**: Renowned expert in Ming-Qing history and Chinese social history.",
            "**Professor Poon Shuk-wah**: Leading scholar in Chinese religious history and cultural history.",
            "**Alumni Network**: Graduates include prominent history teachers, museum curators, published historians, and cultural policy advisors.",
            "**Research Excellence**: CUHK History Department is recognised for research in Chinese history, comparative history, and historical methodology.",
            "**Cultural Impact**: Faculty members regularly contribute to public history projects, documentary consultations, and heritage preservation."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**History Department Awards**: Special recognition for students with exceptional research skills and historical writing ability.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Research Grants**: Funding for student research projects, archive visits, conference attendance, and overseas fieldwork."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK History Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 22+ with strong History or Chinese History. English writing skills are crucial.",
            "**Read Widely**: Read beyond the syllabus — academic history books, primary sources, and historiographical debates.",
            "**Develop Arguments**: Practise constructing historical arguments with evidence. The interview may include source analysis.",
            "**Engage with History**: Visit museums, historical sites, and archives. Join history competitions and essay contests.",
            "**Think Critically**: Be prepared to discuss how history helps us understand contemporary issues and different perspectives."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大歷史競爭程度中等。中位數入學成績通常為最佳五科20-22分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：歷史、中國歷史及地理均非常有優勢。強大的閱讀及分析技巧至關重要。",
            "**面試**：個人面試，評估歷史知識、批判思維、分析一手資料的能力及對理解過去的熱情。",
            "**非學術因素**：歷史論文比賽、博物館參觀、參與歷史學會及獨立研究項目均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：歷史方法導論、世界歷史及史學史。培養研究及寫作技巧。",
            "**第二年 - 專題研究**：政治史、社會史、經濟史、文化史及科技史。",
            "**第三年 - 區域專修**：學生選擇重點方向（中國歷史、歐洲歷史、亞洲歷史或比較歷史）並進行研究。",
            "**第四年 - 畢業專題與論文**：基於一手資料原創研究的榮譽學位論文、高級研討班及為升學作準備。",
            "**實務訓練**：檔案研究培訓、博物館實習、口述歷史項目及數碼人文工作坊。",
            "**課程特色**：強調一手資料分析及研究方法論。可使用珍貴中文歷史文獻及檔案。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**教育**：中小學歷史科教師、大專院校講師及課程發展專員。",
            "**博物館及文物**：文化機構的策展人、文物主任、檔案管理員及博物館教育工作者。",
            "**媒體及出版**：歷史紀錄片、出版社及數碼媒體平台的編輯、作家及研究員。",
            "**政府及公務員**：具歷史專長的行政主任、政策研究員及外交官。",
            "**研究及學術**：全球大學歷史研究的研究生、博士候選人及博士後研究員。",
            "**商業及顧問**：重視分析及研究技巧的市場研究員、企業策略師及顧問。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：充滿活力的知識社群，擁有專研中國、歐洲及全球歷史的著名歷史學家。",
            "**圖書館資源**：可使用中大圖書館豐富的歷史文獻、珍本及數碼檔案收藏。",
            "**學生組織**：歷史學會舉辦學術研討會、電影放映、歷史景點參觀及嘉賓講座。",
            "**研究機會**：參與教職員研究項目、口述歷史計劃及數碼人文合作。",
            "**國際視野**：與牛津、劍橋、哈佛及頂尖亞洲大學的歷史系進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。受人文背景強勁及分析技巧佳的學生歡迎。",
            "**學術要求**：最佳五科約20-22分。強烈建議修讀歷史或中國歷史選修科。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。許多申請者透過比賽及項目展示熱情。",
            "**面試比重**：高。面試評估歷史思維、資料分析及建構歷史論證的能力。",
            "**成功申請者特質**：廣泛閱讀、強勁論文寫作技巧及對過去的真正求知慾。",
            "**趨勢**：持續受歡迎；歷史畢業生的研究及分析能力在多個行業均受重視。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**黎明釗教授**：明清歷史及中國社會史研究的著名專家。",
            "**潘淑華教授**：中國宗教史及文化史研究的領先學者。",
            "**校友網絡**：畢業生包括傑出歷史教師、博物館策展人、出版歷史學家及文化政策顧問。",
            "**研究卓越**：中大歷史系在中國歷史、比較歷史及歷史方法論方面的研究獲得認可。",
            "**文化影響**：教職員定期參與公共歷史項目、紀錄片顧問及文物保育工作。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**歷史系獎項**：特別嘉許具卓越研究技巧及歷史寫作能力的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**研究資助**：學生研究項目、檔案參觀、會議出席及海外田野調查的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大歷史攻略",
        "content": [
            "**分數目標**：最佳五科目標22分以上，歷史或中國歷史成績強勁。英文寫作技巧至關重要。",
            "**廣泛閱讀**：超越課程閱讀——學術歷史書籍、一手資料及史學辯論。",
            "**發展論證**：練習以證據建構歷史論證。面試可能包括資料分析。",
            "**參與歷史活動**：參觀博物館、歷史景點及檔案館。參加歷史比賽及論文競賽。",
            "**批判思考**：準備討論歷史如何幫助我們理解當代議題及不同觀點。"
        ]
    }
}

details = {
    "code": "JS4056",
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
