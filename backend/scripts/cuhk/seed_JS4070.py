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
    "code": "JS4070",
    "nameEn": "Linguistics",
    "nameZh": "語言學",
    "name": "語言學",
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
            "**Academic Threshold**: CUHK Linguistics is moderately competitive. The median admission score is typically Best 5 = 21-23 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 4+ strongly preferred), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: Any language subject, Literature, or humanities electives are advantageous. Strong analytical and logical thinking skills are essential.",
            "**Interview**: Individual interview assessing language awareness, analytical ability, interest in how languages work, and critical thinking.",
            "**Non-Academic Factors**: Participation in language competitions, self-study of foreign languages, debate, and interest in speech and communication are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Introduction to linguistics, phonetics, phonology, morphology, and syntax. Overview of language universals and variation.",
            "**Year 2 - Core Areas**: Semantics, pragmatics, sociolinguistics, psycholinguistics, and historical linguistics. Introduction to language acquisition.",
            "**Year 3 - Specialisation & Fieldwork**: Students choose streams (Theoretical Linguistics, Applied Linguistics, or Language Documentation) and conduct research.",
            "**Year 4 - Capstone & Thesis**: Honours thesis on a linguistic topic, advanced seminars in specialised areas, and preparation for graduate studies.",
            "**Practical Training**: Fieldwork methods, corpus linguistics workshops, computational linguistics labs, and internship in language-related industries.",
            "**Unique Features**: Strong emphasis on both theoretical and applied linguistics with opportunities to study endangered languages and work with speech technology."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Education**: Language teachers, curriculum developers, and educational researchers specialising in language pedagogy.",
            "**Speech Technology**: Computational linguists, natural language processing specialists, and speech recognition engineers at tech companies.",
            "**Translation & Interpretation**: Professional translators, interpreters, and localization specialists with deep understanding of language structure.",
            "**Publishing & Media**: Editors, lexicographers, and content developers for dictionaries, educational materials, and media platforms.",
            "**Research & Academia**: Research fellows, PhD candidates, and postdoctoral researchers in linguistics at universities worldwide.",
            "**Government & NGOs**: Policy advisors on language planning, literacy programmes, and minority language preservation."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Intellectually stimulating environment with faculty specialising in Chinese linguistics, theoretical linguistics, and language acquisition.",
            "**Research Labs**: Access to phonetics laboratory, psycholinguistics lab, and computational linguistics facilities.",
            "**Student Societies**: Linguistics Society organises talks by visiting scholars, language game nights, and fieldwork sharing sessions.",
            "**Fieldwork Opportunities**: Document endangered Chinese dialects in Hong Kong and Guangdong through funded fieldwork projects.",
            "**Global Exposure**: Exchange programmes with MIT, University of Edinburgh, Max Planck Institute, and leading linguistics departments worldwide."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate (★★★☆☆). Appeals to students with analytical minds and fascination with language.",
            "**Academic Requirements**: Best 5 around 21-23. Strong English skills are important; mathematics background is helpful for formal linguistics.",
            "**Band A Competition**: Typically 1.5-2 applicants per place. Many applicants are self-motivated language learners.",
            "**Interview Weighting**: High. The interview assesses analytical thinking, language awareness, and genuine intellectual curiosity.",
            "**What Differentiates Winners**: Demonstrated interest through language learning, reading linguistics books, or participation in language-related activities.",
            "**Trend**: Growing interest due to applications in AI, speech technology, and language education."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Virginia Yip**: World-renowned expert in bilingualism, language acquisition, and Cantonese linguistics.",
            "**Professor Stephen Matthews**: Leading scholar in typology, language contact, and Cantonese grammar.",
            "**Alumni Network**: Graduates work in speech technology companies, as language teachers, translators, and researchers at top universities.",
            "**Research Excellence**: CUHK Linguistics is internationally recognised for research in Chinese linguistics, bilingualism, and language acquisition.",
            "**Innovation Impact**: Faculty research contributes to speech recognition technology, language assessment tools, and bilingual education policy."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Linguistics Department Awards**: Recognition for exceptional analytical work and research potential in linguistics.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Research Grants**: Funding for student fieldwork, conference attendance, and research assistantships with faculty."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Linguistics Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 23+ with strong English. Mathematics background helps with formal analysis.",
            "**Explore Languages**: Learn about different languages and their structures. Try learning a new language to understand how they differ.",
            "**Read Introductory Texts**: Read popular linguistics books by authors like Steven Pinker or David Crystal before the interview.",
            "**Think Analytically**: Practise analysing sentence structures, identifying patterns, and thinking about how children acquire language.",
            "**Show Curiosity**: Be prepared to discuss why you find language fascinating and what linguistic questions intrigue you."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大語言學競爭程度中等。中位數入學成績通常為最佳五科21-23分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 4+強烈建議）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：任何語言科目、文學或人文選修科均有優勢。強大的分析及邏輯思維技巧至關重要。",
            "**面試**：個人面試，評估語言意識、分析能力、對語言運作方式的興趣及批判思維。",
            "**非學術因素**：參與語言比賽、自學外語、辯論及對言語和溝通的興趣均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：語言學導論、語音學、音韻學、構詞學及句法學。語言普遍性與變異概論。",
            "**第二年 - 核心領域**：語義學、語用學、社會語言學、心理語言學及歷史語言學。語言習得導論。",
            "**第三年 - 專修與田野調查**：學生選擇專修方向（理論語言學、應用語言學或語言記錄）並進行研究。",
            "**第四年 - 畢業專題與論文**：語言學題目的榮譽學位論文、專門領域高級研討班及為升學作準備。",
            "**實務訓練**：田野調查方法、語料庫語言學工作坊、計算語言學實驗室及語言相關行業實習。",
            "**課程特色**：強調理論及應用語言學，提供研究瀕危語言及從事語言科技工作的機會。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**教育**：語言教師、課程發展專員及專注語言教學法的研究員。",
            "**語言科技**：科技公司的計算語言學家、自然語言處理專員及語音識別工程師。",
            "**翻譯及傳譯**：具語言結構深入理解的專業翻譯員、傳譯員及本地化專員。",
            "**出版及媒體**：字典、教育材料及媒體平台的編輯、詞典編纂員及內容開發員。",
            "**研究及學術**：全球大學語言學研究的研究生、博士候選人及博士後研究員。",
            "**政府及非政府組織**：語言規劃政策顧問、識字計劃及少數族裔語言保育工作。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：智力刺激的環境，教職員專研中文語言學、理論語言學及語言習得。",
            "**研究實驗室**：可使用語音學實驗室、心理語言學實驗室及計算語言學設施。",
            "**學生組織**：語言學學會舉辦訪問學者講座、語言遊戲之夜及田野調查分享會。",
            "**田野調查機會**：透過資助田野調查項目記錄香港及廣東的瀕危漢語方言。",
            "**國際視野**：與麻省理工學院、愛丁堡大學、馬普研究所及全球領先語言學系進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等（★★★☆☆）。吸引具分析頭腦及對語言著迷的學生。",
            "**學術要求**：最佳五科約21-23分。強勁英文技巧重要；數學背景對形式語言學有幫助。",
            "**Band A競爭**：通常每個學額有1.5-2名申請人。許多申請者是自學語言的學習者。",
            "**面試比重**：高。面試評估分析思維、語言意識及真正求知慾。",
            "**成功申請者特質**：透過語言學習、閱讀語言學書籍或參與語言相關活動展示興趣的申請者。",
            "**趨勢**：受人工智能、語言科技及語言教育應用推動，興趣增加。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**葉彩燕教授**：雙語現象、語言習得及粵語語言學的世界知名專家。",
            "**馬詩帆教授**：類型學、語言接觸及粵語語法的領先學者。",
            "**校友網絡**：畢業生在語言科技公司、語言教師、翻譯員及頂尖大學研究員崗位工作。",
            "**研究卓越**：中大語言學在中文語言學、雙語現象及語言習得方面的研究獲國際認可。",
            "**創新影響**：教職員研究對語音識別技術、語言評估工具及雙語教育政策作出貢獻。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**語言學系獎項**：嘉許語言學卓越分析工作及研究潛質的學生。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**研究資助**：學生田野調查、會議出席及與教職員的研究助理工作的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大語言學攻略",
        "content": [
            "**分數目標**：最佳五科目標23分以上，英文強勁。數學背景對形式分析有幫助。",
            "**探索語言**：了解不同語言及其結構。嘗試學習新語言以理解它們的差異。",
            "**閱讀入門文本**：面試前閱讀Steven Pinker或David Crystal等作者的流行語言學書籍。",
            "**分析思維**：練習分析句子結構、識別模式及思考兒童如何習得語言。",
            "**展示好奇心**：準備討論為何你覺得語言迷人，以及哪些語言學問題引起你的興趣。"
        ]
    }
}

details = {
    "code": "JS4070",
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
