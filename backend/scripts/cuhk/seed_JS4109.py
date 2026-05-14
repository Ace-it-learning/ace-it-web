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
    "code": "JS4109",
    "nameEn": "Religion",
    "nameZh": "宗教研究",
    "name": "宗教研究",
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
            "**Academic Threshold**: CUHK Religion is moderately competitive. The median admission score is typically Best 5 = 18-20 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Ethics and Religious Studies, History, or any humanities subject are advantageous. Open-mindedness and critical thinking are essential.",
            "**Interview**: Individual interview assessing understanding of religious studies as an academic discipline, critical thinking about religion in society, and intellectual curiosity.",
            "**Non-Academic Factors**: Participation in interfaith dialogue, community service through religious organisations, reading in religious studies, and cultural exchange are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Introduction**: Introduction to religious studies, world religions (Buddhism, Christianity, Islam, Hinduism, Taoism), and theories of religion.",
            "**Year 2 - Methods & Traditions**: Comparative religion, sociology of religion, psychology of religion, and textual studies of sacred texts.",
            "**Year 3 - Specialisation & Fieldwork**: Students choose streams (Buddhist Studies, Christian Studies, Chinese Religions, or Sociology of Religion) and conduct field research.",
            "**Year 4 - Capstone & Thesis**: Honours thesis on a religious studies topic, advanced seminars, and preparation for graduate studies or careers in related fields.",
            "**Practical Training**: Fieldwork at religious sites, ethnographic methods, textual analysis workshops, and internship at cultural or religious organisations.",
            "**Unique Features**: Strong focus on Chinese religions and Buddhism with fieldwork opportunities at temples, monasteries, and religious communities in Hong Kong and Asia."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Education**: Religious studies teachers, lecturers at tertiary institutions, and educators in religious organisations.",
            "**NGO & Social Services**: Programme officers at faith-based NGOs, community workers, and counsellors in religious social service agencies.",
            "**Cultural Heritage**: Heritage officers, museum curators, and cultural programme coordinators specialising in religious heritage.",
            "**Media & Publishing**: Writers, editors, and content creators focusing on religion, culture, and spirituality.",
            "**Research & Academia**: Research fellows, PhD candidates, and postdoctoral researchers in religious studies at universities worldwide.",
            "**Counselling & Chaplaincy**: Pastoral counsellors, chaplains in hospitals and schools, and spiritual care professionals."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Intellectually open environment studying religion from academic, historical, and social scientific perspectives.",
            "**Fieldwork Opportunities**: Regular visits to temples, churches, mosques, and monasteries in Hong Kong as part of coursework.",
            "**Research Resources**: Access to the Centre for the Study of Religion and Chinese Society and collaborations with religious institutions.",
            "**Student Societies**: Religion Society organises interfaith dialogues, meditation sessions, academic talks, and cultural visits.",
            "**Global Exposure**: Exchange programmes with top religious studies departments at Harvard, University of Chicago, SOAS, and leading Asian universities."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Appeals to students with intellectual curiosity about religion and culture.",
            "**Academic Requirements**: Best 5 around 18-20. Diverse backgrounds welcome; no specific religious affiliation required.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Genuine interest in understanding religion academically is key.",
            "**Interview Weighting**: High. The interview assesses open-mindedness, critical thinking, and understanding of religious studies as an academic field.",
            "**What Differentiates Winners**: Demonstrated interest through reading, interfaith engagement, or reflection on religion's role in society.",
            "**Trend**: Growing interest as society recognises the importance of religious literacy for understanding global affairs and multicultural communities."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Tam Wai-lun**: Renowned scholar in Chinese Buddhism and religious history.",
            "**Professor John Lai**: Leading expert in biblical studies and religion in Chinese contexts.",
            "**Alumni Network**: Graduates work in education, social services, cultural heritage, and religious organisations across Hong Kong and Asia.",
            "**Research Excellence**: CUHK Religious Studies is recognised for research in Chinese religions, Buddhism, and religion in contemporary society.",
            "**Community Engagement**: Faculty and students contribute to interfaith understanding and cultural preservation through research and outreach."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Religious Studies Awards**: Recognition for exceptional research and writing in religious studies.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Fieldwork Grants**: Funding for research at religious sites, conference attendance, and overseas study tours."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Religion Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 20+. Academic grades matter but intellectual openness and curiosity are equally important.",
            "**Understand the Discipline**: Religious studies is academic, not devotional. Be prepared to discuss religion from historical, sociological, and comparative perspectives.",
            "**Read Broadly**: Explore introductory texts on world religions and religious studies theory before the interview.",
            "**Engage Respectfully**: Show willingness to understand diverse religious traditions without personal bias or advocacy.",
            "**Think Critically**: Be ready to discuss how religion intersects with politics, culture, and society in Hong Kong and globally."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大宗教研究競爭程度中等。中位數入學成績通常為最佳五科18-20分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：倫理與宗教研究、歷史或任何人文科目均有優勢。開放思維及批判思考至關重要。",
            "**面試**：個人面試，評估對宗教研究作為學術學科的理解、對社會中宗教的批判思維及求知慾。",
            "**非學術因素**：參與跨信仰對話、透過宗教組織的社區服務、宗教研究閱讀及文化交流均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 導論**：宗教研究導論、世界宗教（佛教、基督教、伊斯蘭教、印度教、道教）及宗教理論。",
            "**第二年 - 方法與傳統**：比較宗教學、宗教社會學、宗教心理學及神聖文本的文本研究。",
            "**第三年 - 專修與田野調查**：學生選擇專修方向（佛教研究、基督教研究、中國宗教或宗教社會學）並進行田野研究。",
            "**第四年 - 畢業專題與論文**：宗教研究題目的榮譽學位論文、高級研討班及為升學或相關領域就業作準備。",
            "**實務訓練**：宗教場所的田野調查、民族誌方法、文本分析工作坊及文化或宗教機構實習。",
            "**課程特色**：強調中國宗教及佛教，提供香港及亞洲寺廟、修道院及宗教社群的田野調查機會。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**教育**：宗教研究教師、大專院校講師及宗教組織的教育工作者。",
            "**非政府組織及社會服務**：信仰為本的非政府組織的項目主任、社區工作者及宗教社會服務機構的輔導員。",
            "**文化遺產**：專注宗教遺產的文物主任、博物館策展人及文化節目統籌。",
            "**媒體及出版**：專注宗教、文化及靈性的作家、編輯及內容創作者。",
            "**研究及學術**：全球大學宗教研究的研究生、博士候選人及博士後研究員。",
            "**輔導及牧靈**：醫院及學校的牧靈輔導員、牧師及靈性關懷專業人員。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：從學術、歷史及社會科學角度研究宗教的開放智力環境。",
            "**田野調查機會**：定期參觀香港的寺廟、教堂、清真寺及修道院作為課程一部分。",
            "**研究資源**：可使用宗教與中國社會研究中心及與宗教機構的合作。",
            "**學生組織**：宗教學會舉辦跨信仰對話、冥想練習、學術講座及文化參觀。",
            "**國際視野**：與哈佛、芝加哥大學、亞非學院及頂尖亞洲大學的宗教研究系進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。吸引對宗教及文化有求知慾的學生。",
            "**學術要求**：最佳五科約18-20分。歡迎不同背景；無特定宗教信仰要求。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。對學術上理解宗教的真正興趣是關鍵。",
            "**面試比重**：高。面試評估開放思維、批判思考及對宗教研究作為學術領域的理解。",
            "**成功申請者特質**：透過閱讀、跨信仰參與或反思宗教在社會中的角色展示興趣的申請者。",
            "**趨勢**：隨著社會認識宗教素養對理解全球事務及多元文化社區的重要性，興趣增加。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**譚偉倫教授**：中國佛教及宗教史研究的著名學者。",
            "**黎子鵬教授**：聖經研究及中國處境中宗教的領先專家。",
            "**校友網絡**：畢業生在香港及亞洲的教育、社會服務、文化遺產及宗教組織工作。",
            "**研究卓越**：中大宗教研究在中國宗教、佛教及當代社會宗教方面的研究獲得認可。",
            "**社區參與**：教職員及學生透過研究及外展促進跨信仰理解及文化保育。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**宗教研究獎項**：嘉許宗教研究卓越研究及寫作的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**田野調查資助**：宗教場所研究、會議出席及海外學習團的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大宗教研究攻略",
        "content": [
            "**分數目標**：最佳五科目標20分以上。學術成績重要，但智力開放及好奇心同樣重要。",
            "**理解學科**：宗教研究是學術性的，非信仰性的。準備從歷史、社會學及比較角度討論宗教。",
            "**廣泛閱讀**：面試前探索世界宗教及宗教研究理論的入門文本。",
            "**尊重參與**：展示願意理解多元宗教傳統，不帶個人偏見或倡導。",
            "**批判思考**：準備討論宗教如何與香港及全球的社會、文化及政治交織。"
        ]
    }
}

details = {
    "code": "JS4109",
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
