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
    "code": "JS4123",
    "nameEn": "Translation",
    "nameZh": "翻譯",
    "name": "翻譯",
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
            "**Academic Threshold**: CUHK Translation is moderately to highly competitive. The median admission score is typically Best 5 = 22-24 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 5+ strongly preferred), Chinese Language (Level 4+), Mathematics (Compulsory Part, Level 2+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: English Literature, Chinese Literature, or any language subject are highly advantageous. Bilingual proficiency is essential.",
            "**Interview**: Individual interview assessing bilingual competence, cultural awareness, translation aptitude, and understanding of translation as a profession.",
            "**Non-Academic Factors**: Translation competition experience, bilingual writing samples, interpretation practice, and exposure to professional translation work are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Year 1 - Foundations**: Introduction to translation studies, bilingual writing, contrastive analysis of Chinese and English, and basic translation theory.",
            "**Year 2 - Core Skills**: Practical translation (general, business, legal, media), interpreting fundamentals, computer-assisted translation tools, and terminology management.",
            "**Year 3 - Specialisation**: Students choose streams (Literary Translation, Business Translation, Legal Translation, or Conference Interpreting) and complete advanced practice.",
            "**Year 4 - Professional Integration**: Capstone translation project, professional internship, preparation for certification exams (e.g., HKSTI, NAATI), and portfolio development.",
            "**Practical Training**: Translation practicum with real clients, interpreting simulations, subtitling workshops, and localization projects.",
            "**Unique Features**: Strong industry connections with translation companies, government translation services, and international organisations in Hong Kong."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Professional Translation**: In-house translators and freelance translators working in legal, medical, business, and literary fields.",
            "**Conference Interpreting**: Simultaneous and consecutive interpreters for government, international organisations, and corporate events.",
            "**Localization**: Localization specialists and project managers for software, games, and website globalisation.",
            "**Government & Public Service**: Government translators and interpreters at the Civil Service Bureau and Legislative Council.",
            "**Media & Publishing**: Subtitlers, dubbing scriptwriters, editors, and translators for publishing houses and media companies.",
            "**Corporate Communications**: Bilingual communications specialists, copywriters, and corporate translators at multinational companies."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Department Culture**: Professional and academically rigorous environment with faculty who are practising translators, interpreters, and translation scholars.",
            "**Translation Labs**: Dedicated interpreting booths, computer labs with CAT tools, and multimedia facilities for subtitling and audiovisual translation.",
            "**Student Societies**: Translation Society organises translation competitions, guest lectures by professional translators, and industry visits.",
            "**Industry Connections**: Regular networking events, mentorship programmes, and recruitment fairs with leading translation companies.",
            "**Global Exposure**: Exchange programmes with top translation schools at Monterey Institute, University of Manchester, and leading European universities."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Moderate to High (★★★★☆). Popular among bilingual students seeking professional translation careers.",
            "**Academic Requirements**: Best 5 around 22-24. Strong bilingual skills in Chinese and English are essential.",
            "**Band A Competition**: Typically 2-3 applicants per place. Many applicants have demonstrated translation experience.",
            "**Interview Weighting**: High. The interview assesses bilingual fluency, cultural knowledge, and aptitude for translation work.",
            "**What Differentiates Winners**: Strong bilingual writing skills, cultural sensitivity, and clear career goals in the translation industry.",
            "**Trend**: Growing demand as Hong Kong's role as a bilingual hub for Greater Bay Area and international business expands."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Martha Cheung**: Renowned translation scholar and theorist in Chinese translation studies (former faculty).",
            "**Professor Sin-wai Chan**: Leading expert in computer-assisted translation and translation technology.",
            "**Alumni Network**: Graduates work as certified interpreters at the United Nations, EU, and major international organisations; many run successful translation agencies.",
            "**Research Excellence**: CUHK Translation is recognised for research in translation theory, interpreting studies, and translation technology.",
            "**Industry Impact**: Faculty and alumni have shaped translation standards, certification systems, and professional practice in Hong Kong and Asia."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Automatically considered for top DSE performers (5+ subjects at Level 5 or above).",
            "**Faculty of Arts Scholarships**: Merit-based awards for outstanding academic performance in arts programmes.",
            "**Translation Excellence Awards**: Recognition for outstanding translation and interpreting work by students.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Professional Certification Grants**: Funding for certification exam fees, conference interpreting equipment, and professional development workshops."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK Translation Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 24+ with strong English and Chinese. Bilingual excellence is the key differentiator.",
            "**Practise Bilingual Writing**: Translate news articles, short stories, or speeches regularly. Compare your work with professional translations.",
            "**Build Cultural Knowledge**: Read widely in both languages — literature, news, and academic texts. Understand cultural nuances and idioms.",
            "**Try Interpreting**: Practise shadowing speeches, consecutive interpreting with podcasts, and note-taking techniques.",
            "**Learn CAT Tools**: Familiarise yourself with translation memory software like SDL Trados or MemoQ to gain a competitive edge."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大翻譯競爭程度中等至激烈。中位數入學成績通常為最佳五科22-24分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 5+強烈建議）、中國語文（Level 4+）、數學（必修部分，Level 2+）及公民與社會發展科合格。",
            "**優先選修科**：英語文學、中國文學或任何語言科目均非常有優勢。雙語能力至關重要。",
            "**面試**：個人面試，評估雙語能力、文化意識、翻譯天賦及對翻譯作為職業的理解。",
            "**非學術因素**：翻譯比賽經驗、雙語寫作樣本、傳譯練習及專業翻譯工作接觸均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一年 - 基礎**：翻譯研究導論、雙語寫作、中英對比分析及基礎翻譯理論。",
            "**第二年 - 核心技巧**：實務翻譯（通用、商業、法律、媒體）、傳譯基礎、電腦輔助翻譯工具及術語管理。",
            "**第三年 - 專修**：學生選擇專修方向（文學翻譯、商業翻譯、法律翻譯或會議傳譯）並完成高級實踐。",
            "**第四年 - 專業整合**：畢業翻譯項目、專業實習、為認證考試（如香港翻譯學會、NAATI）作準備及作品集發展。",
            "**實務訓練**：真實客戶的翻譯實習、傳譯模擬、字幕工作坊及本地化項目。",
            "**課程特色**：與翻譯公司、政府翻譯服務及香港國際組織的強大行業聯繫。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**專業翻譯**：法律、醫學、商業及文學領域的內部翻譯員及自由翻譯員。",
            "**會議傳譯**：政府、國際組織及企業活動的同步及接續傳譯員。",
            "**本地化**：軟件、遊戲及網站全球化的本地化專員及項目經理。",
            "**政府及公共服務**：公務員事務局及立法會的政府翻譯員及傳譯員。",
            "**媒體及出版**：出版社及媒體公司的字幕員、配音編劇、編輯及翻譯員。",
            "**企業傳訊**：跨國公司的雙語傳訊專員、文案撰寫員及企業翻譯員。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**學系文化**：專業及學術嚴謹的環境，教職員均為執業翻譯員、傳譯員及翻譯學者。",
            "**翻譯實驗室**：專用傳譯室、配備CAT工具的電腦室及字幕和視聽翻譯的多媒體設施。",
            "**學生組織**：翻譯學會舉辦翻譯比賽、專業翻譯員嘉賓講座及業界參觀。",
            "**業界聯繫**：與領先翻譯公司的定期社交活動、導師計劃及招聘會。",
            "**國際視野**：與蒙特雷國際研究學院、曼徹斯特大學及頂尖歐洲大學的頂尖翻譯學院進行交換計劃。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：中等至激烈（★★★★☆）。受尋求專業翻譯職業的雙語學生歡迎。",
            "**學術要求**：最佳五科約22-24分。中英文的強勁雙語技巧至關重要。",
            "**Band A競爭**：通常每個學額有2-3名申請人。許多申請者已展示翻譯經驗。",
            "**面試比重**：高。面試評估雙語流利度、文化知識及翻譯工作天賦。",
            "**成功申請者特質**：強勁雙語寫作技巧、文化敏感度及翻譯行業的明確職業目標。",
            "**趨勢**：隨著香港作為大灣區及國際商業雙語樞紐的角色擴展，需求增加。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**張佩瑤教授**：中國翻譯研究中著名的翻譯學者及理論家（前教職員）。",
            "**陳善偉教授**：電腦輔助翻譯及翻譯科技的領先專家。",
            "**校友網絡**：畢業生在聯合國、歐盟及主要國際組織擔任認證傳譯員；許多人經營成功的翻譯公司。",
            "**研究卓越**：中大翻譯在翻譯理論、傳譯研究及翻譯科技方面的研究獲得認可。",
            "**業界影響**：教職員及校友塑造香港及亞洲的翻譯標準、認證系統及專業實踐。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：頂尖DSE成績者自動獲考慮（5科以上Level 5或以上）。",
            "**文學院獎學金**：根據文學院課程的優異學術表現頒發的獎學金。",
            "**翻譯卓越獎**：嘉許學生卓越翻譯及傳譯工作的獎項。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**專業認證資助**：認證考試費用、會議傳譯設備及專業發展工作坊的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大翻譯攻略",
        "content": [
            "**分數目標**：最佳五科目標24分以上，英文及中文強勁。雙語卓越是關鍵區別因素。",
            "**練習雙語寫作**：定期翻譯新聞文章、短篇小說或演講。將你的作品與專業翻譯比較。",
            "**建立文化知識**：廣泛閱讀兩種語言——文學、新聞及學術文本。理解文化細微差別及成語。",
            "**嘗試傳譯**：練習跟讀演講、接續傳譯播客及筆記技巧。",
            "**學習CAT工具**：熟悉SDL Trados或MemoQ等翻譯記憶軟件以獲得競爭優勢。"
        ]
    }
}

details = {
    "code": "JS4123",
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
