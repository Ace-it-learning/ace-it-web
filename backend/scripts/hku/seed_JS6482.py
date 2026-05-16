import os
from dotenv import load_dotenv
from azure.cosmos import CosmosClient

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
endpoint = os.getenv("AZURE_COSMOS_ENDPOINT")
key = os.getenv("AZURE_COSMOS_KEY")
client = CosmosClient(endpoint, credential=key)
db = client.get_database_client(os.getenv("AZURE_COSMOS_DATABASE", "aceit"))
container = db.get_container_client("jupas_programmes")

programme = {
    "code": "JS6482",
    "nameEn": "Bachelor of Chinese Medicine",
    "nameZh": "中醫全科學士",
    "name": "Bachelor of Chinese Medicine",
    "university": "香港大學",
    "faculty": "醫學院",
    "median": 34,
    "band_a": 33,
    "uq": 31,
    "category": "medicine"
}

en_admission = [
    "**JUPAS Code:** JS6482 | **University:** The University of Hong Kong (HKU)",
    "**Programme:** Bachelor of Chinese Medicine (BChinMed) | **Faculty:** Faculty of Medicine (School of Chinese Medicine)",
    "**Duration:** 6 years (full-time) | **First Year Intake:** 25 students",
    "**Funding:** UGC-funded",
    "",
    "**Minimum DSE Entry Requirements:**",
    "- Chinese Language: Level 3",
    "- English Language: Level 3",
    "- Mathematics (Compulsory Part): Level 2",
    "- Citizenship and Social Development: Attained",
    "- Two Elective Subjects: Level 3 in BOTH, with one being Biology, Chemistry, Physics, Combined Science, or Integrated Science",
    "- Mathematics Extended Part (M1/M2) can substitute as a full elective subject",
    "",
    "**Additional Requirements:** Good command of written and spoken Chinese (Cantonese and Putonghua) is required.",
    "",
    "**Scoring Formula:** Best 5 HKDSE subjects + 0.5 × 6th best subject (may include M1/M2 or Category C subject, whichever is higher)",
    "",
    "**Interview:** Yes — conducted on a selective basis. Interview performance is a key consideration factor alongside academic results.",
    "",
    "**2025 Admission Statistics:**",
    "- Band A applicants: 145",
    "- Total applicants: 1,212",
    "- Offers made: 25 (100% from Band A)",
    "",
    "**Admissions Scores (2025 admitted students):**",
    "- Median: 34 points",
    "- Upper Quartile (UQ): 31 points",
    "- Lower Quartile (LQ): 33 points"
]

en_curriculum = [
    "The BChinMed curriculum is a comprehensive **6-year programme**, including a Mainland China-based clinical clerkship in Year 6 (Final Year).",
    "",
    "**Curriculum Components:**",
    "1. **Chinese Medicine Foundation Courses** — Fundamentals of Chinese medicine theory, diagnostics, and treatment principles",
    "2. **Chinese Medicine Classical Texts Courses** — Study of classical Chinese medicine literature including Huangdi Neijing and Shang Han Lun",
    "3. **Chinese Medicine Clinical Courses** — Acupuncture, herbal medicine, tuina massage, and clinical diagnostics",
    "4. **Biomedical Sciences Courses** — Including Western medicine bedside training, taught by the School of Biomedical Sciences, School of Clinical Medicine, and School of Public Health",
    "5. **Disciplinary Elective Courses** — Allowing students to explore specialised areas of interest",
    "6. **Field Trip and Chinese Medicine Dispensary Practicum** — Hands-on experience in herbal dispensing and preparation",
    "7. **Chinese Medicine Clinical Attachments, Junior Clerkship and Clinical Clerkship** — Progressive clinical training from Year 2 through Year 6",
    "8. **Common Core Curriculum Courses** — HKU's interdisciplinary general education",
    "9. **Language Enhancement Courses** — Academic English and professional Chinese",
    "",
    "**Clinical Training Highlights:**",
    "- **Year 2–3:** Clinical attachments at eight Chinese Medicine Clinical Centres for Teaching and Research under the School of Chinese Medicine",
    "- **Year 4:** Four-week junior clerkship at the University of Hong Kong-Shenzhen Hospital",
    "- **Year 6:** 40-week clinical clerkship at teaching hospitals of distinguished Traditional Chinese Medicine universities in Shanghai and/or other Mainland China cities",
    "- State-of-the-art Clinical Skills Training Centre for comprehensive skills training before real clinical practice",
    "",
    "**Teaching Approach:**",
    "- Outcome-based learning with multidisciplinary approaches including problem-based learning and clinical case discussions",
    "- Integration of theory and practical skills through experiential learning",
    "- Bi-literacy and tri-lingualism: English for Common Core and Biomedical Sciences; Putonghua and Cantonese for Chinese Medicine courses and clinical training"
]

en_career = [
    "Graduates of the Bachelor of Chinese Medicine programme are eligible to sit for the **Chinese Medicine Practitioners Licensing Examination** in Hong Kong.",
    "",
    "**Professional Registration:**",
    "- Upon passing the licensing examination, graduates can register as **Registered Chinese Medicine Practitioners (RCMP)** with the Chinese Medicine Council of Hong Kong",
    "- Registration enables independent practice in both public and private Chinese Medicine clinics",
    "",
    "**Career Pathways:**",
    "1. **Clinical Practice** — Work in Chinese Medicine clinics in the public sector (Hospital Authority Chinese Medicine clinics) or private practice",
    "2. **Research & Development** — Positions in Chinese Medicine pharmaceutical trading and manufacturing companies, or biotechnology companies",
    "3. **Healthcare Management** — Managerial, marketing, sales, insurance, or advertising roles in Chinese Medicine-related businesses",
    "4. **Academia** — Pursue postgraduate studies (MPhil, PhD) and become academics in tertiary institutions",
    "5. **Integrative Medicine** — Work in hospitals or clinics offering both Western and Chinese medicine services",
    "",
    "**Further Studies:**",
    "- MPhil/PhD in Chinese Medicine at HKU or other institutions",
    "- Specialised training in acupuncture, herbal medicine, or tuina",
    "- Postgraduate programmes in public health or healthcare management"
]

en_campus = [
    "**Campus & Facilities:**",
    "- The programme is based at HKU's Main Campus in Pok Fu Lam and the School of Chinese Medicine facilities",
    "- Eight Chinese Medicine Clinical Centres for Teaching and Research provide authentic clinical learning environments",
    "- Clinical Skills Training Centre with state-of-the-art simulation facilities",
    "",
    "**Student Life:**",
    "- Small cohort of approximately 25 students per year fosters close peer relationships",
    "- Opportunities for international exchange (e.g., University of Rostock, Germany for palliative care and acupuncture studies)",
    "- Research interest groups in collaboration with the School of Biomedical Sciences",
    "- Laboratory experiments in Chinese Medicine and Biomedical Sciences courses",
    "",
    "**Mainland China Experience:**",
    "- Year 4: Junior clerkship at HKU-Shenzhen Hospital",
    "- Year 6: 40-week clinical clerkship at prestigious TCM universities in Shanghai and other Mainland cities",
    "- Exposure to different healthcare systems and patient populations",
    "",
    "**Student Testimonial:**",
    "'The cultural exchange to the University of Rostock, Germany, was a memorable trip where I witnessed stark differences in healthcare and culture. Palliative care highlighted the value of life and the ethics of medical practitioners. Local professors' insights on acupuncture inspired me to integrate Eastern and Western medicine.' — Yuen Oi Sin, BChinMed Year 4"
]

en_competitiveness = [
    "**Admission Competitiveness Analysis:**",
    "",
    "**Competition Level:** VERY HIGH — 48.5 Band A applicants per offer (145 Band A ÷ 25 offers)",
    "",
    "**Key Statistics (2025):**",
    "- Total applicants: 1,212 (down from 1,332 in 2024)",
    "- Band A applicants: 145 (down from 166 in 2024)",
    "- Offers: 25 (stable over recent years)",
    "- 100% of offers go to Band A applicants — no offers to Band B–E in recent years",
    "",
    "**Score Analysis:**",
    "- Median: 34 points (Best 5 + 0.5×6th)",
    "- This is equivalent to approximately 5*5555* or better in the best 5 subjects",
    "- The scoring formula rewards depth (Best 5) plus a small bonus for breadth (0.5×6th)",
    "",
    "**Critical Success Factors:**",
    "1. **Band A placement is ESSENTIAL** — No offers have been made to Band B–E in the past 8 years",
    "2. **Science elective is MANDATORY** — Must have Biology, Chemistry, Physics, Combined Science, or Integrated Science at Level 3+",
    "3. **Chinese proficiency** — Strong written and spoken Chinese (Cantonese + Putonghua) is required",
    "4. **Interview performance** — Selective interviews; strong performance can differentiate candidates with similar scores",
    "5. **Student learning profile** — Relevant experiences (e.g., Chinese medicine volunteering, science competitions) strengthen applications"
]

en_alumni = [
    "**Notable Alumni & Faculty:**",
    "",
    "**Faculty Leadership:**",
    "- **Professor Yibin Feng** — Director and Professor, School of Chinese Medicine. Leading researcher in Chinese medicine pharmacology and integrative medicine.",
    "",
    "**Distinguished Alumni:**",
    "- **Ms Yu Choi Fai** (BChinMed 2019) — 'HKU must be credited for being my best anchor. This is where I am supported and nurtured for knowledge building and development of professional network, as well as being moulded with humbleness and integrity.'",
    "",
    "**Research Excellence:**",
    "- The School of Chinese Medicine collaborates with the School of Biomedical Sciences on cutting-edge research in Chinese medicine pharmacology, acupuncture mechanisms, and integrative medicine",
    "- Research interest groups available for undergraduate students from early years",
    "",
    "**International Recognition:**",
    "- HKU Faculty of Medicine is ranked among the top medical schools globally",
    "- 135+ years of history in medical education",
    "- Leading research with global impacts in both Western and Chinese medicine"
]

en_scholarships = [
    "**HKU Entrance Scholarships:**",
    "- **HKU Foundation Entrance Scholarship** — For outstanding JUPAS applicants with exceptional DSE results",
    "- **HKU Outstanding Students Scholarship** — For students with all 5** in core and elective subjects",
    "",
    "**Faculty-Specific Scholarships:**",
    "- Various scholarships and prizes offered by the Faculty of Medicine for academic excellence",
    "- Research scholarships for students participating in Chinese medicine research projects",
    "",
    "**Government Financial Aid:**",
    "- Tertiary Student Finance Scheme (TSFS) — Means-tested grant and loan",
    "- Non-means-tested Loan Scheme (NLS) — Low-interest loan for all eligible students",
    "",
    "**Other Opportunities:**",
    "- Exchange scholarships for international study trips",
    "- Research grants for undergraduate research projects",
    "- Chinese Medicine Council of Hong Kong scholarships for outstanding students"
]

en_tips = [
    "**Ace Sir's HKU BChinMed Strategy — 9 Actionable Tips:**",
    "",
    "**1. Band A or Bust**",
    "100% of offers go to Band A applicants. If BChinMed is your dream, you MUST place it in Band A. No exceptions.",
    "",
    "**2. Nail the Science Elective**",
    "You MUST achieve Level 3+ in Biology, Chemistry, Physics, Combined Science, or Integrated Science. Biology is the most relevant and gives you foundational knowledge for Chinese medicine pharmacology. Aim for Level 4+ to be competitive.",
    "",
    "**3. Chinese is Critical — Both Language and Culture**",
    "The programme requires strong written and spoken Chinese (Cantonese + Putonghua). Classical Chinese medicine texts are in Literary Chinese. Read classical texts like Huangdi Neijing excerpts to build familiarity. Practice Putonghua — clinical training in Mainland China requires it.",
    "",
    "**4. Target 34+ Points**",
    "The median is 34 points. To be safe, aim for 35+ using the scoring formula (Best 5 + 0.5×6th). This means approximately 5*5555* or better. Every subject counts — the 6th subject bonus (0.5×) can make a difference.",
    "",
    "**5. Prepare for the Selective Interview**",
    "Not all applicants are interviewed. If selected, expect questions on:",
    "- Why Chinese medicine? (Not just 'I couldn't get into MBBS')",
    "- Your understanding of integrative medicine (East meets West)",
    "- Ethical scenarios in healthcare",
    "- Current issues in Hong Kong's Chinese medicine development",
    "Demonstrate genuine passion for Chinese medicine philosophy and practice.",
    "",
    "**6. Build a Chinese Medicine-Focused Student Learning Profile**",
    "- Volunteer at Chinese medicine clinics (e.g., Pok Oi Hospital Chinese Medicine Clinic)",
    "- Attend public lectures on Chinese medicine (HKU School of Chinese Medicine hosts regular seminars)",
    "- Read Chinese medicine classics in your spare time",
    "- Participate in science competitions (biology/chemistry focus)",
    "",
    "**7. Excel in Both Languages**",
    "The programme is bi-lingual: English for biomedical sciences, Chinese for TCM courses. You need strong English (Level 3 minimum, aim for 4+) AND strong Chinese (Level 4+ recommended). Weakness in either language will hinder your studies.",
    "",
    "**8. Understand the 6-Year Commitment**",
    "This is a 6-year programme with a full year (Year 6) spent in Mainland China. Consider:",
    "- Living away from family for 40 weeks",
    "- Adapting to Mainland China's healthcare environment",
    "- Financial planning for the extended duration",
    "- The programme is longer than MBBS (6 years vs 6 years) but with different career trajectories",
    "",
    "**9. Have a Backup Plan**",
    "With only 25 places and 145 Band A applicants, competition is fierce. Consider:",
    "- Chinese University of Hong Kong's Chinese Medicine programme (if available)",
    "- Biomedical Sciences as a related alternative",
    "- Pharmacy or Nursing with interest in complementary medicine",
    "- Remember: BChinMed graduates can also pursue research, management, or academia — not just clinical practice"
]

zh_admission = [
    "**JUPAS 編號：** JS6482 | **大學：** 香港大學",
    "**課程：** 中醫全科學士 (BChinMed) | **學院：** 醫學院（中醫藥學院）",
    "**修讀年期：** 6年（全日制）| **首年學額：** 25人",
    "**資助類別：** 教資會資助",
    "",
    "**最低 DSE 入學要求：**",
    "- 中國語文：第3級",
    "- 英國語文：第3級",
    "- 數學（必修部分）：第2級",
    "- 公民與社會發展：達標",
    "- 兩科選修科目：均達第3級，其中一科必須為生物、化學、物理、組合科學或綜合科學",
    "- 數學延伸部分（M1/M2）可視作一科完整選修科目",
    "",
    "**額外要求：** 須具備良好的中文書寫及口語能力（粵語及普通話）。",
    "",
    "**計分方法：** 最佳5科 DSE 成績 + 0.5 × 第6佳科目成績（可計算 M1/M2 或丙類科目，以較高者為準）",
    "",
    "**面試安排：** 設有選擇性面試。面試表現是入學考慮的重要因素之一。",
    "",
    "**2025年入學統計：**",
    "- Band A 申請人數：145人",
    "- 總申請人數：1,212人",
    "- 錄取名額：25人（100%來自 Band A）",
    "",
    "**2025年入學分數（已獲錄取學生）：**",
    "- 中位數：34分",
    "- 上四分位數：31分",
    "- 下四分位數：33分"
]

zh_curriculum = [
    "中醫全科學士課程為期 **6年**，包括第六學年（最後一年）於中國內地進行的臨床實習。",
    "",
    "**課程組成：**",
    "1. **中醫基礎課程** — 中醫理論、診斷學及治療原則的基礎",
    "2. **中醫經典課程** — 研讀《黃帝內經》、《傷寒論》等中醫經典文獻",
    "3. **中醫臨床課程** — 針灸、中藥、推拿及臨床診斷",
    "4. **生物醫學課程** — 包括西醫床邊教學，由生物醫學學院、臨床醫學學院及公共衛生學院教授",
    "5. **學科選修課程** — 讓學生探索感興趣的專門領域",
    "6. **實地考察及中藥房實習** — 中藥配劑及炮製的實踐經驗",
    "7. **中醫臨床見習、初級實習及臨床實習** — 由第二年至第六年的漸進式臨床培訓",
    "8. **核心課程** — 港大跨學科通識教育",
    "9. **語言增潤課程** — 學術英語及專業中文",
    "",
    "**臨床培訓重點：**",
    "- **第二至三年：** 於中醫藥學院轄下八間中醫臨床教研中心進行臨床見習",
    "- **第四年：** 於香港大學深圳醫院進行為期四星期的初級實習",
    "- **第六年：** 於上海及其他內地城市著名中醫藥大學的教學醫院進行為期40星期的臨床實習",
    "- 臨床技能培訓中心配備先進設施，讓學生在真實臨床環境前接受全面技能訓練",
    "",
    "**教學模式：**",
    "- 採用成果導向學習及跨學科教學方法，包括問題導向學習及臨床病例討論",
    "- 強調理論與實踐技能的結合",
    "- 兩文三語：核心課程及生物醫學課程以英語授課；中醫課程及臨床培訓以普通話及粵語進行"
]

zh_career = [
    "中醫全科學士畢業生符合資格參加香港 **中醫執業資格試**。",
    "",
    "**專業註冊：**",
    "- 通過執業資格試後，可向香港中醫藥管理委員會申請成為 **註冊中醫師**",
    "- 取得註冊後，可在公營或私營中醫診所執業，或自行開業",
    "",
    "**就業出路：**",
    "1. **臨床診療** — 於公營機構（醫管局中醫診所）或私營中醫診所工作",
    "2. **科研發展** — 於中藥貿易及製造公司、生物科技公司從事研發工作",
    "3. **醫療管理** — 於中醫藥相關企業擔任管理、市場推廣、銷售、保險或廣告職位",
    "4. **學術界** — 攻讀碩士或博士課程，成為大專院校學者",
    "5. **整合醫學** — 於提供中西醫結合服務的醫院或診所工作",
    "",
    "**進修途徑：**",
    "- 港大或其他院校的哲學碩士/博士（中醫藥）課程",
    "- 針灸、中藥或推拿的專科培訓",
    "- 公共衛生或醫療管理的研究生課程"
]

zh_campus = [
    "**校園及設施：**",
    "- 課程設於港大本部校園（薄扶林）及中醫藥學院設施",
    "- 八間中醫臨床教研中心提供真實的臨床學習環境",
    "- 臨床技能培訓中心配備先進模擬設施",
    "",
    "**學生生活：**",
    "- 每年約25人的小規模收生，促進緊密的同儕關係",
    "- 國際交流機會（例如德國羅斯托克大學的紓緩治療及針灸研習）",
    "- 與生物醫學學院合作的研究興趣小組",
    "- 中醫藥及生物醫學課程的實驗室研究機會",
    "",
    "**內地學習體驗：**",
    "- 第四年：於港大深圳醫院進行初級實習",
    "- 第六年：於上海及其他內地城市的著名中醫藥大學進行為期40星期的臨床實習",
    "- 接觸不同的醫療體系及病人群體",
    "",
    "**學生分享：**",
    "「到德國羅斯托克大學的文化交流是一次難忘的旅程，讓我見識到醫療及文化上的顯著差異。紓緩治療讓我體會到生命的價值及醫療從業員的專業操守。當地教授對針灸的見解啟發我將中西醫學結合。」— 袁愛善，中醫全科學士四年級"
]

zh_competitiveness = [
    "**入學競爭力分析：**",
    "",
    "**競爭程度：** 極高 — 每個學額有48.5位 Band A 申請者（145人 ÷ 25個名額）",
    "",
    "**主要數據（2025年）：**",
    "- 總申請人數：1,212人（較2024年的1,332人減少）",
    "- Band A 申請人數：145人（較2024年的166人減少）",
    "- 錄取名額：25人（近年維持穩定）",
    "- 近年100%錄取來自 Band A — Band B至E幾乎沒有錄取",
    "",
    "**分數分析：**",
    "- 中位數：34分（最佳5科 + 0.5×第6科）",
    "- 約相等於最佳5科達5*5555*或更佳成績",
    "- 計分方法重視深度（最佳5科）加少量廣度獎勵（0.5×第6科）",
    "",
    "**成功入讀的關鍵因素：**",
    "1. **必須放 Band A** — 近年沒有 Band B至E的錄取個案",
    "2. **必須修讀理科選修科** — 生物、化學、物理、組合科學或綜合科學須達第3級或以上",
    "3. **中文能力** — 良好的書寫及口語中文（粵語及普通話）是必要條件",
    "4. **面試表現** — 選擇性面試；出色表現可令同分申請者脫穎而出",
    "5. **學生學習概覽** — 相關經驗（如中醫診所義工、科學比賽）可增強申請優勢"
]

zh_alumni = [
    "**知名校友及教職員：**",
    "",
    "**學院領導：**",
    "- **馮奕斌教授** — 中醫藥學院院長及教授。中醫藥藥理學及整合醫學領域的頂尖研究者。",
    "",
    "**傑出校友：**",
    "- **余彩菲女士**（中醫全科學士2019）—「港大是我最好的根基。在這裡我獲得支持及培養，建立知識及專業人脈，同時被塑造出謙遜及正直的品格。」",
    "",
    "**研究卓越：**",
    "- 中醫藥學院與生物醫學學院合作，在中醫藥藥理學、針灸機理及整合醫學方面進行前沿研究",
    "- 本科生從低年級起即可參與研究興趣小組",
    "",
    "**國際認可：**",
    "- 港大醫學院位列全球頂尖醫學院之一",
    "- 擁有135年以上的醫學教育歷史",
    "- 在西醫及中醫領域均具全球影響力的領先研究"
]

zh_scholarships = [
    "**港大入學獎學金：**",
    "- **港大基金入學獎學金** — 頒予 DSE 成績卓越的 JUPAS 申請人",
    "- **港大傑出學生獎學金** — 頒予核心科目及選修科目均獲5**的學生",
    "",
    "**學院獎學金：**",
    "- 醫學院設有多項獎學金，獎勵學業成績優異的學生",
    "- 參與中醫藥研究項目的學生可獲研究獎學金",
    "",
    "**政府資助：**",
    "- 專上學生資助計劃（TSFS）— 經入息審查的助學金及貸款",
    "- 免入息審查貸款計劃（NLS）— 所有合資格學生均可申請的低息貸款",
    "",
    "**其他機會：**",
    "- 國際交流獎學金",
    "- 本科生研究項目資助",
    "- 香港中醫藥管理委員會獎學金"
]

zh_tips = [
    "**Ace Sir 港大中醫全科學士攻略 — 9個實戰貼士：**",
    "",
    "**1. 必須放 Band A**",
    "100%錄取來自 Band A 申請者。若中醫是你的夢想，必須將此課程放在 Band A，沒有例外。",
    "",
    "**2. 理科選修科是關鍵**",
    "必須在生物、化學、物理、組合科學或綜合科學中至少一科達第3級或以上。生物最為相關，能為中藥藥理學奠定基礎。建議目標為第4級或以上以增強競爭力。",
    "",
    "**3. 中文能力至關重要 — 語言與文化並重**",
    "課程要求良好的書寫及口語中文（粵語及普通話）。中醫經典文獻以文言文撰寫。建議閱讀《黃帝內經》節選以建立熟悉感。練習普通話 — 內地臨床實習必需使用。",
    "",
    "**4. 目標34分或以上**",
    "中位數為34分。為穩妥起見，建議目標為35分或以上（最佳5科 + 0.5×第6科）。約相等於最佳5科達5*5555*或更佳。每科都很重要 — 第6科的0.5倍獎勵可能成為關鍵。",
    "",
    "**5. 準備選擇性面試**",
    "並非所有申請者都獲面試機會。若被選中，預計會被問及：",
    "- 為何選擇中醫？（不要說「因為讀不到內外全科」）",
    "- 你對整合醫學（中西醫結合）的理解",
    "- 醫療倫理情境題",
    "- 香港中醫發展的現況議題",
    "展現對中醫哲學及實踐的真誠熱誠。",
    "",
    "**6. 建立中醫導向的學生學習概覽**",
    "- 於中醫診所當義工（如博愛醫院中醫診所）",
    "- 參加中醫公開講座（港大中醫藥學院定期舉辦）",
    "- 課餘閱讀中醫經典",
    "- 參與科學比賽（生物或化學方向）",
    "",
    "**7. 兩種語言都要出色**",
    "課程為雙語教學：生物醫學課程以英語授課，中醫課程以中文授課。英文須達第3級（建議第4級或以上），中文亦須達第4級或以上。任何一種語言薄弱都會影響學習。",
    "",
    "**8. 了解6年學制的承諾**",
    "這是6年制課程，第六年全年須於內地進行臨床實習。須考慮：",
    "- 離港40星期，與家人分開",
    "- 適應內地醫療環境",
    "- 延長學制的財務規劃",
    "- 與內外全科醫學士同為6年，但職業路徑不同",
    "",
    "**9. 要有後備方案**",
    "只有25個學額，145位 Band A 申請者，競爭非常激烈。建議考慮：",
    "- 香港中文大學的中醫課程（如有開辦）",
    "- 生物醫學作為相關替代選擇",
    "- 藥劑學或護理學，輔以補充醫學興趣",
    "- 記住：中醫畢業生亦可從事科研、管理或學術工作 — 不限於臨床診療"
]

details = {
    "code": "JS6482",
    "university": "香港大學",
    "en": {
        "sections": {
            "admission": {"title": "Eligibility & Admission Criteria (DSE)", "content": en_admission},
            "curriculum": {"title": "Programme Structure & Curriculum", "content": en_curriculum},
            "career": {"title": "Career Pathways & Prospects", "content": en_career},
            "campus": {"title": "Campus Life & Student Experience", "content": en_campus},
            "competitiveness": {"title": "Admission Competitiveness Analysis", "content": en_competitiveness},
            "alumni": {"title": "Notable Alumni & Faculty", "content": en_alumni},
            "scholarships": {"title": "Scholarships & Financial Aid", "content": en_scholarships},
            "tips": {"title": "Ace Sir's HKU BChinMed Strategy", "content": en_tips}
        }
    },
    "zh": {
        "sections": {
            "admission": {"title": "入學要求與計分詳情 (DSE)", "content": zh_admission},
            "curriculum": {"title": "課程結構與內容", "content": zh_curriculum},
            "career": {"title": "職業前景與出路", "content": zh_career},
            "campus": {"title": "校園生活與學生體驗", "content": zh_campus},
            "competitiveness": {"title": "入學競爭力分析", "content": zh_competitiveness},
            "alumni": {"title": "知名校友及教職員", "content": zh_alumni},
            "scholarships": {"title": "獎學金及經濟援助", "content": zh_scholarships},
            "tips": {"title": "Ace Sir 港大中醫全科學士攻略", "content": zh_tips}
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})
print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
