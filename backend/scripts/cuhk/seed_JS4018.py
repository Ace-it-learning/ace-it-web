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
    "code": "JS4018",
    "nameEn": "Chinese Language and Literature",
    "nameZh": "中國語言及文學",
    "name": "中國語言及文學",
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
            "**Academic Threshold**: CUHK Chinese Language and Literature is moderately competitive. The median admission score is typically Best 5 = 22-24 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: Chinese Language (Level 5+ strongly preferred), English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Chinese Literature, Chinese History, and History are highly advantageous. Strong classical Chinese foundation is essential.",
            "**Interview**: Individual interview assessing Chinese language proficiency, literary appreciation, critical analysis skills, and passion for Chinese culture.",
            "**Non-Academic Factors**: Chinese writing competitions, calligraphy, participation in Chinese cultural activities, and independent reading of classical texts are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Language Foundations**: Modern Chinese grammar, phonology, classical Chinese, and introduction to Chinese linguistics.",
            "**Year 2 - Literary Traditions**: Pre-Qin prose, Han fu, Tang poetry, Song ci, Yuan drama, and Ming-Qing fiction.",
            "**Year 3 - Specialisation & Research**: Students choose streams (Classical Literature, Modern Literature, or Linguistics) and conduct research projects.",
            "**Year 4 - Capstone & Thesis**: Honours thesis on a specialised topic, advanced seminars, and preparation for teaching or graduate studies.",
            "**Practical Training**: Teaching practicum for education stream, editorial internships, and research assistantships with faculty.",
            "**Unique Features**: CUHK is renowned for Chinese studies with one of the strongest departments in the Chinese-speaking world, extensive classical text collections."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Education**: Chinese Language teachers at primary and secondary schools, lecturers at tertiary institutions, and curriculum developers.",
            "**Media & Publishing**: Editors, writers, and content creators at Chinese-language media outlets, publishing houses, and digital platforms.",
            "**Cultural Institutions**: Programme officers at museums, cultural centres, and heritage organisations focusing on Chinese culture.",
            "**Government & Civil Service**: Administrative officers, cultural affairs officers, and policy researchers in education and culture bureaus.",
            "**Research & Academia**: Research fellows, PhD candidates, and postdoctoral researchers in Chinese studies at universities worldwide.",
            "**Business & Corporate**: Corporate communications specialists, copywriters, and cultural consultants for companies targeting Chinese markets."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Highly respected department with world-class scholars in classical Chinese literature, modern literature, and linguistics.",
            "**Library Resources**: Access to the CUHK Library's extensive collection of classical Chinese texts, rare books, and digital archives.",
            "**Student Societies**: Chinese Language and Literature Society organises poetry readings, calligraphy workshops, and academic seminars.",
            "**Cultural Activities**: Regular visits to cultural sites, classical music performances, and exchanges with mainland Chinese universities.",
            "**Global Exposure**: Exchange programmes with Peking University, Fudan University, National Taiwan University, and other top Chinese studies institutions."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate to High (★★★★☆). Popular among students with strong Chinese language backgrounds.",
            "**Academic Requirements**: Best 5 around 22-24. Chinese Language at Level 5+ is almost essential for success.",
            "**Band A Competition**: Typically 2-3 applicants per place. Many applicants have excelled in Chinese writing competitions.",
            "**Interview Weighting**: Very High. The interview includes reading and analysing classical texts on the spot.",
            "**What Differentiates Winners**: Deep knowledge of classical literature, strong writing skills, and genuine passion for Chinese culture distinguish top candidates.",
            "**Trend**: Consistently popular; graduates are in high demand for teaching positions in Hong Kong schools."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Leo Ou-fan Lee**: World-renowned scholar of modern Chinese literature and cultural studies.",
            "**Professor Chen Pingyuan**: Leading expert on modern Chinese literature and intellectual history.",
            "**Alumni Network**: Graduates include prominent Chinese Language teachers, published authors, and cultural commentators in Hong Kong and Taiwan.",
            "**Research Excellence**: CUHK Chinese Department consistently ranks among the top globally for Chinese literature and linguistics research.",
            "**Cultural Impact**: Faculty members regularly contribute to public discourse on Chinese culture, language policy, and literary criticism."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Chinese Studies Scholarships**: Special awards for students demonstrating exceptional aptitude in Chinese language and literature.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Research Grants**: Funding for student research projects, conference attendance, and fieldwork in mainland China or Taiwan."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Chinese Language & Literature Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 24+ with Chinese Language at Level 5 or above. English at Level 4+ is also important.",
            "**Master Classical Texts**: Read extensively from the Four Books and Five Classics, Tang poetry, and selected vernacular novels.",
            "**Practise Writing**: Develop strong Chinese writing skills through essay competitions, blogging, or creative writing.",
            "**Engage with Culture**: Attend classical music performances, visit museums, and participate in Chinese cultural activities.",
            "**Think Analytically**: Be prepared to analyse unseen classical texts during the interview and discuss their literary merits."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大中國語言及文學競爭程度中等至激烈。中位數入學成績通常為最佳五科22-24分（標準計分，5**=7分）。",
            "**核心科目**：中國語文（Level 5+強烈建議）、英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：中國文學、中國歷史及歷史均非常有優勢。穩固的古典中文基礎至關重要。",
            "**面試**：個人面試，評估中文語言能力、文學欣賞、批判分析技巧及對中國文化的熱情。",
            "**非學術因素**：中文寫作比賽、書法、參與中國文化活動及獨立閱讀古典文本均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 語言基礎**：現代中文語法、音韻學、古典中文及中文語言學導論。",
            "**第二年 - 文學傳統**：先秦散文、漢賦、唐詩、宋詞、元曲及明清小說。",
            "**第三年 - 專修與研究**：學生選擇專修方向（古典文學、現代文學或語言學）並進行研究項目。",
            "**第四年 - 畢業專題與論文**：專題榮譽學位論文、高級研討班及為教學或升學作準備。",
            "**實務訓練**：教育流的教學實習、編輯實習及與教職員的研究助理工作。",
            "**課程特色**：中大以中文研究聞名，擁有華語世界最強的學系之一及豐富的古典文本收藏。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**教育**：中小學中文科教師、大專院校講師及課程發展專員。",
            "**媒體及出版**：中文媒體、出版社及數碼平台的編輯、作家及內容創作者。",
            "**文化機構**：專注中國文化的博物館、文化中心及文物組織的節目主任。",
            "**政府及公務員**：行政主任、文化事務主任及教育文化局的政策研究員。",
            "**研究及學術**：全球大學中文研究的研究生、博士候選人及博士後研究員。",
            "**商業及企業**：企業傳訊專員、文案撰寫員及針對中國市場的公司的文化顧問。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：備受尊崇的學系，擁有世界級的古典中文文學、現代文學及語言學學者。",
            "**圖書館資源**：可使用中大圖書館豐富的古典中文文本、珍本及數碼檔案收藏。",
            "**學生組織**：中國語言及文學學會舉辦詩歌朗誦、書法工作坊及學術研討會。",
            "**文化活動**：定期參觀文化景點、古典音樂表演及與中國內地大學的交流。",
            "**國際視野**：與北京大學、復旦大學、國立台灣大學等頂尖中文研究機構進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等至激烈（★★★★☆）。受中文語言背景強勁的學生歡迎。",
            "**學術要求**：最佳五科約22-24分。中國語文科達Level 5+幾乎是成功的必要條件。",
            "**Band A競爭**：通常每個學額有2-3名申請人。許多申請者在中文寫作比賽中表現優異。",
            "**面試比重**：非常高。面試包括即場閱讀及分析古典文本。",
            "**成功申請者特質**：深厚的古典文學知識、強勁的寫作技巧及對中國文化的真誠熱情使頂尖候選人脫穎而出。",
            "**趨勢**：持續受歡迎；畢業生在香港學校的教學職位需求甚殷。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**李歐梵教授**：世界知名的現代中文文學及文化研究學者。",
            "**陳平原教授**：現代中文文學及思想史的領先專家。",
            "**校友網絡**：畢業生包括香港及台灣的傑出中文科教師、出版作家及文化評論員。",
            "**研究卓越**：中大中文系在中文文學及語言學研究方面持續位居全球前列。",
            "**文化影響**：教職員定期就中國文化、語言政策及文學批評向公眾論述作出貢獻。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**中文研究獎學金**：頒予展現卓越中文語言及文學才能學生的特別獎項。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**研究資助**：學生研究項目、會議出席及中國內地或台灣田野調查的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大中國語言及文學攻略",
        "content": [
            "**分數目標**：最佳五科目標24分以上，中國語文達Level 5或以上。英文達Level 4+亦很重要。",
            "**精通古典文本**：廣泛閱讀四書五經、唐詩及選定白話小說。",
            "**練習寫作**：透過作文比賽、博客或創意寫作培養強勁的中文寫作技巧。",
            "**參與文化活動**：參加古典音樂表演、參觀博物館及參與中國文化活動。",
            "**批判思考**：準備在面試中分析未見過的古典文本並討論其文學價值。"
        ]
    }
}

details = {
    "code": "JS4018",
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
