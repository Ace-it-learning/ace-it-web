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
    "code": "JS4136",
    "nameEn": "Chinese Studies",
    "nameZh": "中國研究",
    "name": "中國研究",
    "university": "香港中文大學",
    "faculty": "文學院",
    "median": 23,
    "band_a": 25,
    "category": "arts",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK Chinese Studies is moderately competitive. The median admission score is typically Best 5 = 21-23 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: Chinese Language (Level 4+), English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Chinese History, History, Geography, Economics, or Politics are advantageous. Strong interest in contemporary China is essential.",
            "**Interview**: Individual interview assessing knowledge of China, analytical thinking about Chinese society and culture, and motivation for interdisciplinary China-focused study.",
            "**Non-Academic Factors**: China-related research projects, Mandarin proficiency (HSK), participation in mainland exchange programmes, and engagement with Chinese current affairs are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Introduction to Chinese civilisation, modern Chinese history, Chinese politics and economy, and research methods for China studies.",
            "**Year 2 - Thematic Studies**: Chinese society and culture, economic development, foreign policy, environmental issues, and regional development in China.",
            "**Year 3 - Specialisation & Fieldwork**: Students choose streams (Politics & Economy, Society & Culture, or History) and conduct field research in mainland China.",
            "**Year 4 - Capstone & Thesis**: Honours thesis on a China-related topic, advanced seminars, and preparation for careers in China-focused fields or graduate studies.",
            "**Practical Training**: Fieldwork in mainland China, internship at China-related organisations, data analysis workshops, and Mandarin enhancement courses.",
            "**Unique Features**: Interdisciplinary approach combining humanities and social sciences with mandatory mainland fieldwork and strong connections to Chinese universities."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Business & Trade**: China business consultants, market researchers, and trade specialists for companies operating in Greater China.",
            "**Government & Policy**: Policy researchers, China affairs officers, and diplomats in government and think tanks.",
            "**Media & Journalism**: China correspondents, editors, and analysts for news organisations and think tanks.",
            "**Education & Research**: China studies lecturers, researchers at universities, and educators at international schools.",
            "**NGO & Development**: Programme officers at NGOs working in China, development workers, and human rights researchers.",
            "**Cultural Industries**: Cultural consultants, museum specialists, and programme coordinators for China-Hong Kong cultural exchange."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Interdisciplinary community with faculty from history, politics, sociology, economics, and literature specialising in China.",
            "**Research Centres**: Access to the Centre for China Studies and collaborations with mainland Chinese research institutions.",
            "**Student Societies**: Chinese Studies Society organises seminars, film screenings, cultural events, and networking with China professionals.",
            "**Mainland Connections**: Regular study tours, summer programmes, and exchange opportunities at top Chinese universities.",
            "**Global Exposure**: Exchange programmes with Harvard Fairbank Center, SOAS, Australian National University, and other leading China studies programmes."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Appeals to students interested in understanding China from multiple disciplinary perspectives.",
            "**Academic Requirements**: Best 5 around 21-23. Diverse subject backgrounds welcome; interest in China is most important.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Demonstrated engagement with China-related issues is valued.",
            "**Interview Weighting**: High. The interview assesses knowledge of China, critical thinking, and motivation for interdisciplinary study.",
            "**What Differentiates Winners**: Genuine interest in China, awareness of current affairs, and clear vision for applying China expertise.",
            "**Trend**: Growing demand as Hong Kong and the world seek professionals with deep China knowledge and cultural literacy."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Willy Lam**: Renowned China political analyst and commentator on Chinese politics and governance.",
            "**Professor Helen Siu**: Leading anthropologist specialising in Chinese society, culture, and rural development.",
            "**Alumni Network**: Graduates work in China business consulting, government China desks, international media, and academia worldwide.",
            "**Research Excellence**: CUHK China Studies is recognised for interdisciplinary research combining social science methods with deep cultural understanding.",
            "**Public Impact**: Faculty regularly contribute to public discourse on China-Hong Kong relations, China's global role, and Greater Bay Area development."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**China Studies Grants**: Funding for mainland fieldwork, summer programmes at Chinese universities, and China-related research projects.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Exchange Scholarships**: Special funding for semester or year-long exchanges at partner universities in mainland China and overseas."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Chinese Studies Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 23+. Diverse subject background is fine; China interest matters most.",
            "**Follow China News**: Read quality China coverage daily. Understand key issues: economy, politics, society, and international relations.",
            "**Learn Mandarin**: HSK certification demonstrates commitment. Even basic Mandarin opens doors for fieldwork and research.",
            "**Think Interdisciplinary**: Be prepared to discuss how history, politics, economics, and culture combine to shape contemporary China.",
            "**Show Engagement**: Demonstrate interest through China-related reading, documentaries, travel, or independent research projects."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大中國研究競爭程度中等。中位數入學成績通常為最佳五科21-23分（標準計分，5**=7分）。",
            "**核心科目**：中國語文（Level 4+）、英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：中國歷史、歷史、地理、經濟或政治均有優勢。對當代中國的強烈興趣至關重要。",
            "**面試**：個人面試，評估中國知識、對中國社會及文化的分析思維及跨學科中國研究的動機。",
            "**非學術因素**：中國相關研究項目、普通話能力（HSK）、參與內地交流計劃及接觸中國時事均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：中華文明導論、現代中國歷史、中國政治經濟及中國研究方法。",
            "**第二年 - 專題研究**：中國社會與文化、經濟發展、外交政策、環境議題及中國區域發展。",
            "**第三年 - 專修與田野調查**：學生選擇專修方向（政治與經濟、社會與文化或歷史）並在中國內地進行田野研究。",
            "**第四年 - 畢業專題與論文**：中國相關題目的榮譽學位論文、高級研討班及為中國相關領域就業或升學作準備。",
            "**實務訓練**：中國內地田野調查、中國相關組織實習、數據分析工作坊及普通話提升課程。",
            "**課程特色**：結合人文學及社會科學的跨學科方法，必修內地田野調查，與中國大學有緊密聯繫。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**商業及貿易**：在大中華區經營公司的中國商業顧問、市場研究員及貿易專員。",
            "**政府及政策**：政府及智庫的政策研究員、中國事務主任及外交官。",
            "**媒體及新聞**：新聞機構及智庫的中國特派員、編輯及分析員。",
            "**教育及研究**：大學中國研究講師、研究員及國際學校教育工作者。",
            "**非政府組織及發展**：在中國工作的非政府組織項目主任、發展工作者及人權研究員。",
            "**文化產業**：文化顧問、博物館專員及中港文化交流節目統籌。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：跨學科社群，教職員來自歷史、政治、社會學、經濟及文學，專研中國。",
            "**研究中心**：可使用中國研究中心及與中國內地研究機構的合作。",
            "**學生組織**：中國研究學會舉辦研討會、電影放映、文化活動及與中國專業人士聯繫。",
            "**內地聯繫**：定期學習團、暑期計劃及中國頂尖大學的交流機會。",
            "**國際視野**：與哈佛費正清中心、亞非學院、澳洲國立大學及其他領先中國研究計劃進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。吸引有興趣從多學科角度理解中國的學生。",
            "**學術要求**：最佳五科約21-23分。歡迎不同學科背景；對中國的興趣最重要。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。展示的中國相關議題參與受重視。",
            "**面試比重**：高。面試評估中國知識、批判思維及跨學科學習的動機。",
            "**成功申請者特質**：對中國的真正興趣、對時事的認識及應用中國專長的清晰願景。",
            "**趨勢**：隨著香港及世界尋求具深厚中國知識及文化素養的專業人士，需求增加。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**林和立教授**：著名的中國政治分析員及中國政治與管治評論員。",
            "**蕭鳳霞教授**：專研中國社會、文化及農村發展的領先人類學家。",
            "**校友網絡**：畢業生在中國商業顧問、政府中國事務部門、國際媒體及全球學術界工作。",
            "**研究卓越**：中大中國研究在結合社會科學方法與深厚文化理解的跨學科研究方面獲得認可。",
            "**公眾影響**：教職員定期就中港關係、中國全球角色及大灣區發展向公眾論述作出貢獻。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**中國研究資助**：內地田野調查、中國大學暑期計劃及中國相關研究項目的資金。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**交流獎學金**：中國內地及海外夥伴大學學期或全年交流的特別資助。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大中國研究攻略",
        "content": [
            "**分數目標**：最佳五科目標23分以上。不同學科背景均可；中國興趣最重要。",
            "**追蹤中國新聞**：每日閱讀優質中國報道。理解關鍵議題：經濟、政治、社會及國際關係。",
            "**學習普通話**：HSK認證展示承擔。即使基礎普通話也為田野調查及研究打開大門。",
            "**跨學科思考**：準備討論歷史、政治、經濟及文化如何結合塑造當代中國。",
            "**展示參與**：透過中國相關閱讀、紀錄片、旅行或獨立研究項目展示興趣。"
        ]
    }
}

details = {
    "code": "JS4136",
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
