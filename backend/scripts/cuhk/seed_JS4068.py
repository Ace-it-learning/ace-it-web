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
    "code": "JS4068",
    "nameEn": "Japanese Studies",
    "nameZh": "日本研究",
    "name": "日本研究",
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
            "**Academic Threshold**: CUHK Japanese Studies is moderately competitive. The median admission score is typically Best 5 = 21-23 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Any humanities or language subjects are advantageous. Prior Japanese language experience is helpful but not required.",
            "**Interview**: Individual interview assessing interest in Japanese culture, language aptitude, critical thinking about Japan's role in Asia, and communication skills.",
            "**Non-Academic Factors**: Japanese language proficiency (JLPT), participation in Japan-related cultural activities, anime/manga clubs, and exchange experience are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Language & Culture**: Intensive Japanese language training (beginner to intermediate), introduction to Japanese culture, society, and history.",
            "**Year 2 - Advanced Language & Society**: Intermediate to advanced Japanese, Japanese popular culture, political economy, and social structures.",
            "**Year 3 - Specialisation & Exchange**: Students choose streams (Language, Culture, or Politics/Economy) and participate in year-long exchange at Japanese universities.",
            "**Year 4 - Research & Capstone**: Honours thesis on Japan-related topic, advanced language seminars, and professional portfolio development.",
            "**Practical Training**: Translation practicum, interpreting workshops, internship opportunities in Japanese companies in Hong Kong.",
            "**Unique Features**: Mandatory year-abroad programme at partner universities in Japan including Waseda, Keio, and Osaka University."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Translation & Interpretation**: Professional Japanese translators, interpreters, and localization specialists for businesses and government.",
            "**Japanese Companies**: Business development, marketing, and administrative roles at Japanese corporations operating in Hong Kong and Asia.",
            "**Education**: Japanese language teachers at schools and language centres, lecturers at tertiary institutions.",
            "**Media & Publishing**: Editors, writers, and producers for Japan-related media content, publishing, and digital platforms.",
            "**Tourism & Hospitality**: Tourism specialists, cultural programme coordinators, and hospitality managers focusing on Japanese markets.",
            "**Government & NGOs**: Policy researchers, trade officers, and programme coordinators at organisations dealing with Japan-Hong Kong relations."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Dynamic department with native Japanese faculty and strong emphasis on immersive language learning and cultural understanding.",
            "**Language Environment**: Regular Japanese conversation sessions, cultural workshops (tea ceremony, calligraphy, cooking), and film screenings.",
            "**Student Societies**: Japanese Culture Society organises anime nights, manga discussions, cultural festivals, and conversation practice.",
            "**Exchange Programme**: All students spend a year at partner universities in Japan, providing total immersion and life-changing experience.",
            "**Career Support**: Strong connections with Japanese businesses in Hong Kong for internships and graduate recruitment."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Popular among students interested in Japanese culture and language.",
            "**Academic Requirements**: Best 5 around 21-23. No specific elective requirements, making it accessible to students from diverse backgrounds.",
            "**Band A Competition**: Typically 2-2.5 applicants per place. Many applicants have self-studied Japanese or participated in cultural activities.",
            "**Interview Weighting**: High. The interview assesses genuine interest in Japan, cultural awareness, and language learning motivation.",
            "**What Differentiates Winners**: Demonstrated passion through Japanese language study, cultural engagement, or clear career goals related to Japan.",
            "**Trend**: Growing interest driven by Japanese pop culture, business opportunities, and Hong Kong's strong cultural ties with Japan."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Lai Chiu-lan**: Renowned expert in Japanese linguistics and language pedagogy.",
            "**Professor Ng Wai-ming**: Leading scholar in Japanese popular culture, manga, and media studies.",
            "**Alumni Network**: Graduates work at Japanese trading companies (sogo shosha), airlines, tourism boards, and as professional translators.",
            "**Research Excellence**: CUHK Japanese Studies is recognised for research in Japanese linguistics, popular culture, and Japan-Hong Kong cultural exchange.",
            "**Cultural Impact**: Faculty regularly contribute to public understanding of Japan through media commentary, cultural events, and community outreach."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Japanese Government Scholarships**: JASSO scholarships for study abroad in Japan and cultural exchange programmes.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Exchange Support**: Special funding to cover living expenses during the mandatory year-abroad programme in Japan."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Japanese Studies Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 23+. No specific electives required but humanities background helps.",
            "**Start Learning Japanese**: Begin self-study before admission. Even basic proficiency (hiragana/katakana) shows commitment.",
            "**Engage with Culture**: Watch Japanese films, read manga, follow Japanese news, and participate in cultural events.",
            "**Understand Japan's Role**: Be prepared to discuss Japan's economic, political, and cultural significance in Asia and globally.",
            "**Plan Your Year Abroad**: The mandatory exchange is a highlight. Research partner universities and plan how to maximise the experience."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大日本研究競爭程度中等。中位數入學成績通常為最佳五科21-23分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 3+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：任何人文或語言科目均有優勢。具日語經驗有幫助但非必要。",
            "**面試**：個人面試，評估對日本文化的興趣、語言天賦、對日本在亞洲角色的批判思維及溝通技巧。",
            "**非學術因素**：日語能力（JLPT）、參與日本相關文化活動、動漫學會及交流經驗均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 語言與文化**：密集日語訓練（初級至中級）、日本文化、社會及歷史導論。",
            "**第二年 - 高級語言與社會**：中級至高級日語、日本流行文化、政治經濟及社會結構。",
            "**第三年 - 專修與交流**：學生選擇專修方向（語言、文化或政治/經濟）並參與日本大學的全年交流。",
            "**第四年 - 研究與畢業專題**：日本相關題目的榮譽學位論文、高級語言研討班及專業作品集發展。",
            "**實務訓練**：翻譯實習、傳譯工作坊及香港日本公司的實習機會。",
            "**課程特色**：必修的海外交流計劃，夥伴大學包括早稻田、慶應及大阪大學。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**翻譯及傳譯**：專業日語翻譯員、傳譯員及企業和政府的本地化專員。",
            "**日本公司**：香港及亞洲日本企業的業務發展、市場推廣及行政職位。",
            "**教育**：學校及語言中心日語教師、大專院校講師。",
            "**媒體及出版**：日本相關媒體內容、出版及數碼平台的編輯、作家及製作人。",
            "**旅遊及酒店業**：專注日本市場的旅遊專員、文化節目統籌及酒店經理。",
            "**政府及非政府組織**：處理日港關係組織的政策研究員、貿易主任及節目統籌。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：充滿活力的學系，擁有日籍教職員，強調沉浸式語言學習及文化理解。",
            "**語言環境**：定期日語會話練習、文化工作坊（茶道、書法、烹飪）及電影放映。",
            "**學生組織**：日本文化學會舉辦動漫之夜、漫畫討論、文化節及會話練習。",
            "**交流計劃**：所有學生在日本夥伴大學進行一年交流，提供全面沉浸及改變人生的經驗。",
            "**就業支援**：與香港日本企業有緊密聯繫，提供實習及畢業生招聘機會。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。受對日本文化及語言有興趣的學生歡迎。",
            "**學術要求**：最佳五科約21-23分。無特定選修科要求，不同背景的學生均可報讀。",
            "**Band A競爭**：通常每個學額有2-2.5名申請人。許多申請者自學日語或參與文化活動。",
            "**面試比重**：高。面試評估對日本的真正興趣、文化意識及語言學習動機。",
            "**成功申請者特質**：透過日語學習、文化參與或與日本相關的明確職業目標展示熱情的申請者。",
            "**趨勢**：受日本流行文化、商業機會及香港與日本緊密文化聯繫推動，興趣增加。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**黎照蘭教授**：日語語言學及語言教學法的著名專家。",
            "**吳偉明教授**：日本流行文化、漫畫及媒體研究的領先學者。",
            "**校友網絡**：畢業生任職於日本貿易公司（綜合商社）、航空公司、旅遊局及專業翻譯員。",
            "**研究卓越**：中大日本研究在日語語言學、流行文化及日港文化交流方面的研究獲得認可。",
            "**文化影響**：教職員定期透過媒體評論、文化活動及社區外展促進公眾對日本的理解。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**日本政府獎學金**：JASSO獎學金支持日本留學及文化交流計劃。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**交流支援**：特別資助涵蓋日本必修交流年期的生活開支。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大日本研究攻略",
        "content": [
            "**分數目標**：最佳五科目標23分以上。無特定選修科要求，但人文背景有幫助。",
            "**開始學習日語**：入學前開始自學。即使基礎能力（平假名/片假名）也展示承擔。",
            "**參與文化活動**：觀看日本電影、閱讀漫畫、追蹤日本新聞及參與文化活動。",
            "**理解日本角色**：準備討論日本在亞洲及全球的經濟、政治及文化重要性。",
            "**計劃海外交流**：必修交流是課程亮點。研究夥伴大學並計劃如何最大化體驗。"
        ]
    }
}

details = {
    "code": "JS4068",
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
