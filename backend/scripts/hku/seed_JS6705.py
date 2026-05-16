import os
import sys
from dotenv import load_dotenv
from azure.cosmos import CosmosClient

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

endpoint = os.getenv("AZURE_COSMOS_ENDPOINT")
key = os.getenv("AZURE_COSMOS_KEY")
client = CosmosClient(endpoint, credential=key)
db = client.get_database_client(os.getenv("AZURE_COSMOS_DATABASE", "aceit"))
container = db.get_container_client("jupas_programmes")

# ── Programme doc ──────────────────────────────────────────────────────────
programme = {
    "code": "JS6705",
    "nameEn": "Bachelor of Psychology",
    "nameZh": "心理學學士",
    "name": "Bachelor of Psychology",
    "university": "香港大學",
    "faculty": "社會科學學院",
    "duration": "4年",
    "durationEn": "4 years",
    "intake": 70,
    "median": 32,
    "band_a": 30,
    "uq": 34,
    "category": "social_science",
    "subCategory": "psychology",
    "funding": "UGC-funded",
    "interview": False,
    "jupasUrl": "https://www.jupas.edu.hk/en/programme/hku/JS6705",
    "updatedAt": "2026-05-15"
}

# ── Detail doc ─────────────────────────────────────────────────────────────
details = {
    "code": "JS6705",
    "nameEn": "Bachelor of Psychology",
    "nameZh": "心理學學士",
    "university": "香港大學",
    "faculty": "社會科學學院",
    "facultyEn": "Faculty of Social Sciences",
    "duration": "4年",
    "durationEn": "4 years",
    "intake": 70,
    "credits": 240,
    "funding": "教資會資助",
    "fundingEn": "UGC-funded",
    "jupasUrl": "https://www.jupas.edu.hk/en/programme/hku/JS6705",
    "officialUrl": "https://www.socsc.hku.hk/bpsych/",
    "departmentUrl": "https://psychology.hku.hk/admission-undergraduate/",
    "contactPhone": "3917 5867",
    "contactEmail": "ugpsyc@hku.hk",

    # ── English Sections ──────────────────────────────────────────────────
    "overviewEn": (
        "The Bachelor of Psychology (BPsych) at HKU is an up-to-date and innovative programme "
        "that emphasizes hands-on experience, research-intensive learning, and multi-disciplinary approaches. "
        "Psychology is a broad and diverse field that taps into different aspects of the mind and behaviour — "
        "including human thought processes, personality, psychopathology, social interaction, biological processes, "
        "and how we grow, develop, and adapt at different life stages. "
        "The programme addresses Hong Kong's pressing social challenges such as aging population, "
        "income inequality, public health, and social support. "
        "There is an urgent need for psychology and mental health professionals in Hong Kong, "
        "making this degree highly relevant to today's society. "
        "HKU's psychology programme is consistently ranked as one of the best in Asia, "
        "offering students top-grade teaching, contemporary knowledge, and world-class facilities."
    ),

    "admissionEn": (
        "**2025 JUPAS Admission Scores (Best 5)**\n"
        "- Median: 32 points | Lower Quartile (Band A): 30 points | Upper Quartile: 34 points\n\n"
        "**Minimum Entry Requirements**\n"
        "- Chinese Language: Level 3\n"
        "- English Language: Level 3\n"
        "- Mathematics Compulsory Part: Level 2\n"
        "- Citizenship and Social Development: Attained\n"
        "- Any 1 Subject (excluding Applied Learning, Other Language): Level 3\n"
        "- Any 1 Subject (excluding Applied Learning): Level 3\n"
        "- OR: Any 1 Subject (excluding Applied Learning, Other Language): Level 3 + Mathematics Extended Module 1 or 2: Level 3\n\n"
        "**Score Calculation**\n"
        "- Best 5 among Category A or C subjects\n"
        "- M1 or M2 recognised as a full elective, on condition that one of the elective subjects must be a Category A subject\n\n"
        "**Admission Statistics**\n"
        "| Year | Band A | Band B | Band C | Band D | Band E | Total Applicants |\n"
        "|------|--------|--------|--------|--------|--------|------------------|\n"
        "| 2025 | 227    | 278    | 593    | 878    | 882    | 2,858            |\n"
        "| 2024 | 247    | 292    | 611    | 955    | 947    | 3,052            |\n"
        "| 2023 | 315    | 348    | 686    | 1,064  | 993    | 3,406            |\n"
        "| 2022 | 295    | 317    | 581    | 806    | 754    | 2,753            |\n\n"
        "**Offer Statistics**\n"
        "| Year | Band A Offers | Total Offers |\n"
        "|------|---------------|--------------|\n"
        "| 2025 | 38            | 38           |\n"
        "| 2024 | 34            | 35           |\n"
        "| 2023 | 48            | 48           |\n"
        "| 2022 | 58            | 58           |\n\n"
        "**Key Insight**: Admissions are to Band A choice applicants only. With nearly 3,000 applicants annually "
        "and only ~38 offers, the programme is highly competitive — approximately 1 in 75 Band A applicants receive an offer."
    ),

    "curriculumEn": (
        "**Total Programme: 240 Credits | 4 Years**\n\n"
        "**University Requirements (54 credits)**\n"
        "- Core University English Course (Introductory): 6 credits\n"
        "- English in the Discipline Course (Advanced): 6 credits\n"
        "- Chinese Enhancement Course (Introductory): 6 credits\n"
        "- Common Core Courses (Introductory): 36 credits\n\n"
        "**Major in Psychology (84 credits)**\n"
        "- Introductory Disciplinary Courses (Introductory): 12 credits\n"
        "- Social Sciences Pre-requisites Course (Introductory): 6 credits\n"
        "- Advanced Disciplinary Core Courses (Advanced): 36 credits\n"
        "- Advanced Disciplinary Elective Courses (Advanced): 18 credits\n"
        "- Capstone (Advanced): 12 credits\n\n"
        "**Social Innovation and Global Citizenship (Advanced): 24 credits**\n\n"
        "**Second Major / Minor(s) / Free Electives (Advanced/Introductory): 78 credits**\n\n"
        "**Special Features**\n"
        "1. **Experiential Learning Projects** — Students plan and design their own projects, applying psychology knowledge to solve real-life problems and reflect upon the experience.\n"
        "2. **Interdisciplinary Thesis** — Advanced research training in multi-disciplinary areas with two co-supervisors from different psychology subfields.\n"
        "3. **Advanced Quantitative Methods** — Research method skills training with emphasis on quantitative methods, data science, and multidisciplinary approaches.\n"
        "4. **Second Major / Minor Flexibility** — Students can pursue a second major or minor in other disciplines matching personal interests or career goals.\n"
        "5. **Clear Professional Pathways** — Structured pathways to Educational Psychology, Clinical Psychology, counselling, and advanced research in Cognitive Science and Neuroscience.\n\n"
        "**Exchange Opportunities** — Students can study abroad for a semester or year at distinguished universities including NUS, UBC, UCLA, McGill, Yale, Toronto, Lund, Beijing, and Tsinghua."
    ),

    "careerEn": (
        "**Employment Sectors**\n"
        "Recent survey findings indicate the vast majority of psychology graduates are employed in Educational Institutions, "
        "with others in Commerce & Industry, Community, Social Services, and Civil Services.\n\n"
        "**Career Options by Discipline**\n"
        "| Discipline | Career Examples | Further Education |\n"
        "|------------|-----------------|-------------------|\n"
        "| **Business** | Business Development Analyst, Talent Management Officer, HR Officer, PR Executive, Marketing Consultant | MBA, MSc Marketing |\n"
        "| **Education** | SEN Instructor, Teacher, Educational Psychologist | Master of Education, PGDE, MSocSc in Educational Psychology |\n"
        "| **Healthcare** | Behavioral Therapist, Clinical Psychologist, Social Worker, Counsellor | MSocSc in Clinical Psychology, Master of Social Work, MSocSc in Counselling |\n"
        "| **Law** | Lawyer | Juris Doctor, PCLL |\n"
        "| **Research** | I/O Psychologist, Researcher | MPhil/PhD in Psychology, Cognitive Science, Neuroscience |\n"
        "| **Technology** | Engineering Psychologist, Data Analyst | Master of Data Science |\n\n"
        "**Postgraduate Pathways**\n"
        "- **Professional Training**: Clinical Psychology, Educational Psychology, Counselling (UGC-funded, accredited programmes at HKU)\n"
        "- **Research Training**: MPhil/PhD in Psychology, Cognitive Science, Neuroscience\n"
        "- **Overseas Programmes**: Alumni have pursued postgraduate studies at Columbia, Illinois, Oxford, Waterloo, and York\n"
        "- **Academic Careers**: Graduates have secured post-doctoral fellowships and teaching positions at universities in Hong Kong, Mainland China, Singapore, Australia, Europe, and North America\n\n"
        "**Note**: Working experience of 3–5 years is often helpful for graduates to identify their passion areas before determining further studies."
    ),

    "campusEn": (
        "**Main Campus**: The University of Hong Kong, Pokfulam Road, Hong Kong\n\n"
        "**Faculty Location**: Faculty of Social Sciences, The Jockey Club Tower, Centennial Campus\n\n"
        "**Department**: Department of Psychology, Room 639, 6/F, The Jockey Club Tower, Centennial Campus\n\n"
        "**Facilities**\n"
        "- State-of-the-art research laboratories for cognitive, clinical, developmental, and social psychology\n"
        "- Neuroimaging and psychophysiology equipment\n"
        "- Dedicated tutorial rooms for small-group learning (10–20 students per tutorial)\n"
        "- Access to HKU's comprehensive library system and online databases\n\n"
        "**Contact**\n"
        "- Tel: 3917 5867\n"
        "- Email: ugpsyc@hku.hk\n"
        "- Programme Website: https://www.socsc.hku.hk/bpsych/"
    ),

    "competitivenessEn": (
        "**Competition Level: HIGH**\n\n"
        "With approximately 2,800–3,400 JUPAS applicants annually and only ~38 offers, "
        "the Bachelor of Psychology is one of the most competitive social science programmes at HKU. "
        "The admission median of 32 points (Best 5) places it firmly in the upper tier of HKU programmes.\n\n"
        "**What Makes It Competitive**\n"
        "- **Band A Only**: Admissions are restricted to Band A choice applicants, intensifying competition\n"
        "- **High Demand**: Growing awareness of mental health importance drives increasing applicant numbers\n"
        "- **Limited Places**: Only 70 first-year places with most offers going to Band A applicants\n"
        "- **No Interview**: Selection is purely based on academic merit, making every DSE point count\n\n"
        "**Ace Sir Strategy**\n"
        "1. **Target 34+ points** to be comfortably above the median — aim for at least 5* in 3 subjects\n"
        "2. **Prioritize English** — Level 3 is minimum but Level 5 or above strengthens your profile for this communication-intensive field\n"
        "3. **Take Biology or Chemistry** — Understanding biological processes gives you an edge in neuroscience and biological psychology courses\n"
        "4. **Consider M1/M2** — Recognised as a full elective; strong math skills help with quantitative research methods\n"
        "5. **Demonstrate genuine interest** — Read psychology books, follow psychology podcasts, or volunteer in mental health organizations; mention these in your personal statement if applicable\n"
        "6. **Apply strategically** — Place BPsych as your FIRST choice (Band A, Choice 1); the data shows virtually all offers go to Band A applicants"
    ),

    "alumniEn": (
        "**Student Voices**\n\n"
        "*Julie Erika Hui, BPsych Year 2:*\n"
        "'I have always been keen on understanding people on a deeper level, but studying psychology at HKU has grown my interest "
        "beyond what I expected. Its supportive learning environment and quality education make learning both enjoyable and enriching. "
        "The programme offers numerous opportunities in learning and the freedom to explore various branches and topics within and "
        "even beyond psychology, making our experience much more meaningful and rewarding.'\n\n"
        "*Lok Yin Abby Cao, BPsych Year 3:*\n"
        "'I chose BPsych at HKU because it is the most prestigious psychology programme in Hong Kong, with great teachers and "
        "many opportunities for exchange and internships. Although the programme places more emphasis on psychology's scientific foundations "
        "than I initially anticipated, it is still fun and interesting. I am currently aiming to work on an independent study as my capstone project.'\n\n"
        "*Seng Ying Amber Wong, BPsych Year 3:*\n"
        "'I ultimately chose HKU because of its access to opportunities from both the East and the West. The BPsych programme "
        "allows me to dive straight into courses I find interesting, compared to the broader Bachelor of Social Sciences programme.'\n\n"
        "**Notable Alumni Achievements**\n"
        "- Graduates have secured post-doctoral fellowships and teaching positions at universities worldwide\n"
        "- Alumni are leaders in Clinical Psychology and Educational Psychology professions in Hong Kong\n"
        "- Many have pursued advanced research at top institutions including Columbia, Oxford, and Yale"
    ),

    "scholarshipsEn": (
        "**HKU Entrance Scholarships**\n"
        "- Available for students with outstanding HKDSE results (typically 5** in multiple subjects)\n"
        "- Covers full or partial tuition fees plus living allowance\n\n"
        "**Faculty of Social Sciences Scholarships**\n"
        "- Merit-based scholarships for academic excellence\n"
        "- Awards for outstanding performance in psychology courses\n\n"
        "**Exchange Scholarships**\n"
        "- Financial support for semester/year abroad at partner universities\n"
        "- Includes NUS, UBC, UCLA, McGill, Yale, Toronto, Lund, Beijing, Tsinghua\n\n"
        "**Research Scholarships**\n"
        "- Opportunities for undergraduate research assistants in departmental laboratories\n"
        "- Funding support for conference presentations and research projects\n\n"
        "**External Scholarships**\n"
        "- Students are encouraged to apply for external scholarships such as the Sir Edward Youde Memorial Fund\n"
        "- Various charitable foundations offer scholarships for psychology students"
    ),

    "tipsEn": (
        "**Ace Sir's Top 5 Tips for Aspiring Psychology Students**\n\n"
        "1. **Start Reading Psychology NOW** — Pick up introductory books like 'Thinking, Fast and Slow' by Daniel Kahneman or "
        "'The Man Who Mistook His Wife for a Hat' by Oliver Sacks. This shows genuine interest and prepares you for the scientific nature of the course.\n\n"
        "2. **Build Your Quantitative Skills** — Psychology at HKU emphasizes scientific foundations and quantitative methods. "
        "Strong math and statistics skills will give you a significant advantage in research methods courses.\n\n"
        "3. **Volunteer in Mental Health Settings** — Gain practical exposure by volunteering at mental health NGOs, counselling centres, "
        "or community support organisations. This experience is invaluable for your personal statement and future career.\n\n"
        "4. **Follow Psychology in the News** — Stay updated on psychology-related news (e.g., mental health policy, cognitive science breakthroughs). "
        "Being able to discuss current trends demonstrates maturity and genuine interest during any informal interactions.\n\n"
        "5. **Plan Your Postgraduate Path Early** — If you aim to become a Clinical or Educational Psychologist, understand that "
        "you'll need postgraduate professional training. Use your undergraduate years to build strong academic credentials, research experience, "
        "and relevant internships to secure a place in these highly competitive programmes."
    ),

    # ── Chinese Sections ──────────────────────────────────────────────────
    "overviewZh": (
        "香港大學心理學學士（BPsych）課程是一個與時並進、創新的課程，強調實踐經驗、研究密集的學習體驗及跨學科方法。"
        "心理學是一個廣闊而多元的領域，涵蓋人類思維過程、人格、精神病理學、社交互動、影響心智與行為的生物過程，"
        "以及我們在不同人生階段的成長、發展與適應。"
        "課程針對香港迫切的社會挑戰，包括人口老化、收入不平等、公共衛生及社會支援。"
        "香港對心理學及心理健康專業人員的需求殷切，使這個學位與當今社會高度相關。"
        "香港大學的心理學課程持續被評為亞洲最佳之一，為學生提供頂尖教學、當代知識及世界級設施。"
    ),

    "admissionZh": (
        "**2025年JUPAS入學分數（最佳5科）**\n"
        "- 中位數：32分 | 下四分位數（Band A）：30分 | 上四分位數：34分\n\n"
        "**最低入學要求**\n"
        "- 中國語文科：第3級\n"
        "- 英國語文科：第3級\n"
        "- 數學必修部分：第2級\n"
        "- 公民與社會發展科：達標\n"
        "- 任何1科（不包括應用學習、其他語言）：第3級\n"
        "- 任何1科（不包括應用學習）：第3級\n"
        "- 或：任何1科（不包括應用學習、其他語言）：第3級 + 數學延伸單元一或二：第3級\n\n"
        "**計分方法**\n"
        "- 最佳5科甲類或丙類科目\n"
        "- M1或M2可獲承認為完整選修科，條件是其中一科選修科必須為甲類科目\n\n"
        "**入學統計**\n"
        "| 年份 | Band A | Band B | Band C | Band D | Band E | 申請總數 |\n"
        "|------|--------|--------|--------|--------|--------|----------|\n"
        "| 2025 | 227    | 278    | 593    | 878    | 882    | 2,858    |\n"
        "| 2024 | 247    | 292    | 611    | 955    | 947    | 3,052    |\n"
        "| 2023 | 315    | 348    | 686    | 1,064  | 993    | 3,406    |\n"
        "| 2022 | 295    | 317    | 581    | 806    | 754    | 2,753    |\n\n"
        "**取錄統計**\n"
        "| 年份 | Band A取錄 | 總取錄人數 |\n"
        "|------|-----------|-----------|\n"
        "| 2025 | 38        | 38        |\n"
        "| 2024 | 34        | 35        |\n"
        "| 2023 | 48        | 48        |\n"
        "| 2022 | 58        | 58        |\n\n"
        "**重要提示**：只取錄Band A選擇的申請人。每年近3,000名申請者，僅約38個名額，"
        "競爭非常激烈——大約每75名Band A申請者中只有1人獲得取錄。"
    ),

    "curriculumZh": (
        "**課程總覽：240學分 | 4年**\n\n"
        "**大學核心課程（54學分）**\n"
        "- 大學核心英語課程（基礎）：6學分\n"
        "- 學科英語課程（進階）：6學分\n"
        "- 中文增潤課程（基礎）：6學分\n"
        "- 共同核心課程（基礎）：36學分\n\n"
        "**心理學主修（84學分）**\n"
        "- 學科導論課程（基礎）：12學分\n"
        "- 社會科學先修課程（基礎）：6學分\n"
        "- 進階學科核心課程（進階）：36學分\n"
        "- 進階學科選修課程（進階）：18學分\n"
        "- 畢業專題研究（進階）：12學分\n\n"
        "**社會創新與全球公民（進階）：24學分**\n\n"
        "**第二主修／副修／自由選修（進階／基礎）：78學分**\n\n"
        "**課程特色**\n"
        "1. **體驗式學習項目** — 學生有機會規劃和設計自己的項目，應用心理學知識解決現實問題並反思經驗。\n"
        "2. **跨學科畢業論文** — 在跨學科領域進行進階研究訓練，由兩位來自不同心理學分支的導師共同指導。\n"
        "3. **進階心理學量化方法** — 提供研究方法技能訓練，重點在於量化方法、數據科學及跨學科方法。\n"
        "4. **第二主修／副修靈活性** — 學生可根據個人興趣或職業目標，修讀其他學科的第二主修或副修。\n"
        "5. **清晰專業路徑** — 結構化路徑通往教育心理學、臨床心理學、輔導學，以及認知科學和神經科學的進階研究。\n\n"
        "**交流機會** — 學生可赴海外合作大學交流一學期或一學年，包括新加坡國立大學、英屬哥倫比亞大學、加州大學洛杉磯分校、"
        "麥基爾大學、耶魯大學、多倫多大學、隆德大學、北京大學及清華大學。"
    ),

    "careerZh": (
        "**就業領域**\n"
        "近期調查顯示，絕大多數心理學畢業生受僱於教育機構，其他則分佈於工商界、社區、社會服務及政府部門。\n\n"
        "**按學科分類的職業選擇**\n"
        "| 學科 | 職業例子 | 進修方向 |\n"
        "|------|---------|---------|\n"
        "| **商界** | 業務發展分析員、人才管理主任、人力資源主任、公關主任、市場顧問 | MBA、市場學碩士 |\n"
        "| **教育** | 特殊教育需要導師、教師、教育心理學家 | 教育碩士、教育文憑、教育心理學社會科學碩士 |\n"
        "| **醫療** | 行為治療師、臨床心理學家、社工、輔導員 | 臨床心理學社會科學碩士、社會工作碩士、輔導學社會科學碩士 |\n"
        "| **法律** | 律師 | 法律博士、法學專業證書 |\n"
        "| **研究** | 工業及組織心理學家、研究員 | 心理學／認知科學／神經科學哲學碩士／博士 |\n"
        "| **科技** | 工程心理學家、數據分析師 | 數據科學碩士 |\n\n"
        "**深造途徑**\n"
        "- **專業培訓**：臨床心理學、教育心理學、輔導學（香港大學教資會資助認可課程）\n"
        "- **研究培訓**：心理學、認知科學、神經科學哲學碩士／博士\n"
        "- **海外課程**：校友曾於哥倫比亞大學、伊利諾伊大學、牛津大學、滑鐵盧大學及約克大學深造\n"
        "- **學術事業**：畢業生於香港、中國內地、新加坡、澳洲、歐洲及北美的大學取得博士後獎學金及教職\n\n"
        "**注意**：3至5年工作經驗通常有助畢業生確定感興趣的領域，再決定進修方向。"
    ),

    "campusZh": (
        "**主校園**：香港薄扶林道香港大學\n\n"
        "**學院位置**：社會科學學院，賽馬會樓，百周年校園\n\n"
        "**學系**：心理學系，賽馬會樓6樓639室，百周年校園\n\n"
        "**設施**\n"
        "- 認知、臨床、發展及社會心理學的尖端研究實驗室\n"
        "- 神經影像及心理生理學設備\n"
        "- 專為小組學習設計的導修室（每班10–20人）\n"
        "- 可使用香港大學全面的圖書館系統及網上數據庫\n\n"
        "**聯絡**\n"
        "- 電話：3917 5867\n"
        "- 電郵：ugpsyc@hku.hk\n"
        "- 課程網站：https://www.socsc.hku.hk/bpsych/"
    ),

    "competitivenessZh": (
        "**競爭程度：高**\n\n"
        "每年約有2,800至3,400名JUPAS申請者，僅約38個取錄名額，"
        "心理學學士是香港大學競爭最激烈的社會科學課程之一。"
        "入學中位數32分（最佳5科）將其穩固置於港大課程的上游位置。\n\n"
        "**競爭激烈的原因**\n"
        "- **只取錄Band A**：取錄僅限於Band A選擇的申請人，競爭更為激烈\n"
        "- **需求殷切**：大眾對心理健康重要性的認知提高，申請人數持續增加\n"
        "- **名額有限**：僅70個第一年學額，大部分取錄給予Band A申請人\n"
        "- **不設面試**：篩選純粹基於學術成績，每個DSE分數都至關重要\n\n"
        "**Ace Sir策略**\n"
        "1. **目標34分以上** — 確保穩居於中位數之上，爭取至少3科5*\n"
        "2. **優先提升英文** — 第3級為最低要求，但第5級或以上能加強你在這個重視溝通的領域的競爭力\n"
        "3. **修讀生物或化學** — 對生物過程的理解有助你在神經科學及生物心理學課程中佔優\n"
        "4. **考慮M1／M2** — 獲承認為完整選修科；強大的數學能力有助掌握量化研究方法\n"
        "5. **展示真誠興趣** — 閱讀心理學書籍、追蹤心理學播客，或於心理健康機構做義工；如適用請在個人陳述中提及\n"
        "6. **策略性申請** — 將心理學學士列為第一選擇（Band A，選擇1）；數據顯示幾乎所有取錄均給予Band A申請人"
    ),

    "alumniZh": (
        "**學生心聲**\n\n"
        "*許詠琪，心理學學士二年級：*\n"
        "『我一直渴望深入了解人，但在港大修讀心理學讓我的興趣超乎預期地增長。"
        "這裡支持性的學習環境和優質教育使學習既愉快又充實。"
        "課程提供豐富的學習機會，並可自由探索心理學內外各個分支和主題，"
        "使我們的體驗更加有意義和豐富。』\n\n"
        "*曹樂妍，心理學學士三年級：*\n"
        "『我選擇港大心理學學士是因為它是香港最負盛名的心理學課程，"
        "擁有優秀的教師和豐富的交流及實習機會。"
        "雖然課程比我最初預期更強調心理學的科學基礎，但仍然有趣。"
        "我現正計劃以獨立研究作為畢業專題。』\n\n"
        "*黃丞盈，心理學學士三年級：*\n"
        "『我最終選擇港大是因為它能同時提供東西方的機會。"
        "心理學學士課程讓我直接修讀感興趣的課程，"
        "相比較廣泛的社會科學學士課程更為聚焦。』\n\n"
        "**傑出校友成就**\n"
        "- 畢業生於世界各地大學取得博士後獎學金及教職\n"
        "- 校友為香港臨床心理學及教育心理學專業的領袖\n"
        "- 多人於哥倫比亞大學、牛津大學及耶魯大學等頂尖學府深造"
    ),

    "scholarshipsZh": (
        "**香港大學入學獎學金**\n"
        "- 授予DSE成績優異的學生（通常多科5**）\n"
        "- 涵蓋全額或部分學費加生活津貼\n\n"
        "**社會科學學院獎學金**\n"
        "- 學業成績優異的獎學金\n"
        "- 心理學課程傑出表現獎\n\n"
        "**交流獎學金**\n"
        "- 資助赴海外合作大學交流一學期或一學年\n"
        "- 包括新加坡國立大學、英屬哥倫比亞大學、加州大學洛杉磯分校、麥基爾大學、耶魯大學等\n\n"
        "**研究獎學金**\n"
        "- 學系實驗室本科生研究助理機會\n"
        "- 會議發表及研究項目的資助\n\n"
        "**外部獎學金**\n"
        "- 鼓勵學生申請尤德爵士紀念基金等外部獎學金\n"
        "- 多個慈善基金會提供心理學學生獎學金"
    ),

    "tipsZh": (
        "**Ace Sir給準心理學學生的五大貼士**\n\n"
        "1. **現在開始閱讀心理學** — 閱讀入門書籍如丹尼爾·卡尼曼的《思考，快與慢》"
        "或奧利弗·薩克斯的《錯把太太當帽子的人》。這展示真誠興趣並為課程的科學性質作好準備。\n\n"
        "2. **建立量化技能** — 港大心理學強調科學基礎和量化方法。"
        "強大的數學和統計技能將在研究方法課程中給你顯著優勢。\n\n"
        "3. **於心理健康機構做義工** — 透過於心理健康非政府組織、輔導中心或社區支援機構做義工獲得實踐經驗。"
        "這段經驗對個人陳述和未來事業都極具價值。\n\n"
        "4. **追蹤心理學新聞** — 緊貼心理學相關新聞（例如心理健康政策、認知科學突破）。"
        "能夠討論時事趨勢顯示你的成熟度和真誠興趣。\n\n"
        "5. **及早規劃深造路徑** — 如果你目標成為臨床或教育心理學家，須知你需要接受研究生專業培訓。"
        "利用本科年間建立強大的學術資歷、研究經驗及相關實習，以在這些競爭激烈的課程中取得一席之地。"
    ),

    "updatedAt": "2026-05-15"
}

# ── Upsert ─────────────────────────────────────────────────────────────────
container.upsert_item({
    **programme,
    "id": f"prog_{programme['code']}",
    "pk": "programmes",
    "type": "programme"
})
print(f"Upserted programme: {programme['code']}")

container.upsert_item({
    **details,
    "id": f"detail_{details['code']}",
    "pk": "details",
    "type": "programme_detail"
})
print(f"Upserted details: {details['code']}")
print("Done!")
