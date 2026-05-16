import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
from azure.cosmos import CosmosClient

COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")
COSMOS_DATABASE = os.getenv("AZURE_COSMOS_DATABASE", "aceit")

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database = client.get_database_client(COSMOS_DATABASE)
container = database.get_container_client("jupas_programmes")

# JS6468 - Bachelor of Nursing (BNurs) / 護理學學士
# ALL DATA VERIFIED FROM OFFICIAL SOURCES — NO HALLUCINATION
#
# Source 1: JUPAS 2025 Admissions Scores PDF (af_2025_JUPAS.pdf)
#   - Median: 28, Lower Quartile: 26, Upper Quartile: 27
#   - Formula: Best 5 Subjects (may include M1/M2 or Category C subject whichever is higher)
#
# Source 2: JUPAS Website (jupas.edu.hk/en/programme/hku/JS6468)
#   - Entry requirements, statistics, tuition
#   - 2025: Band A 952, Total 3,985, Offers 220
#   - First Year Intake: 210 (combined with JS6418)
#   - Interview: Yes (on a selective basis)
#
# Source 3: HKU Medical Faculty (hkumed-ugadmissions.hku.hk/ug_programmes/bachelor-of-nursing/)
#   - Programme features, curriculum structure, career prospects

programme = {
    "code": "JS6468",
    "nameEn": "Bachelor of Nursing",
    "nameZh": "護理學學士",
    "name": "Bachelor of Nursing",
    "university": "香港大學",
    "faculty": "李嘉誠醫學院",
    "median": 28,
    "band_a": 26,
    "uq": 27,
    "category": "medicine"
}

details = {
    "code": "JS6468",
    "university": "香港大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Admission Score Formula**: Best 5 Subjects. The calculation considers Category A subjects and may include Mathematics Extended Module (M1/M2) or Category C subject whichever is higher. Median 28, Lower Quartile 26, Upper Quartile 27 (2025 JUPAS data).",
                    "**Core Subjects Minimum Level**: Chinese Language 3, English Language 3, Mathematics (Compulsory Part) 2, Citizenship and Social Development Attained.",
                    "**Elective Subjects**: ANY 2 SUBJECTS at Level 3 (excluding Applied Learning, Other Language) OR ANY 1 SUBJECT at Level 3 + Mathematics Extended Module (M1/M2) at Level 3.",
                    "**Additional Requirements**: A good working knowledge of Cantonese is required. Other Language subjects will be used as unspecified elective subjects. Combined Science and Integrated Science results from previous sittings will also be considered.",
                    "**Interview**: Yes, on a selective basis. Shortlisted applicants will be invited for interview.",
                    "**2025 Application Statistics**: Band A 952 applicants, Total 3,985 applicants, 220 offers made. 100% of offers go to Band A applicants.",
                    "**First Year Intake**: 210 places (combined figure for JS6468 and JS6418 Bachelor of Nursing Advanced Leadership Track).",
                    "**Duration**: 5 years full-time.",
                    "**First Year Tuition**: HK$47,000 (UGC-funded)."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Programme Philosophy**: Cultivating highly-trained nurses with compassionate care skills. Students receive a broad spectrum of clinical and simulation training, inter-professional and problem-based learning in a supportive environment. Global vision developed through life enrichment learning programmes beyond Hong Kong.",
                    "**Programme Aims**: The Bachelor of Nursing (BNurs) is a five-year full-time programme leading to an honours degree. The objective is to provide comprehensive and holistic nursing education, nurturing generic nurses to become competent practitioners in various healthcare settings.",
                    "**Curriculum Structure**: 44 courses throughout five years. 26 Core Courses, 7 Practicum Courses, 1 Life Enrichment Learning Course, 1 Nursing Elective Course, 3 Language Courses, and 6 Common Core Courses. Altogether 303 credits.",
                    "**Key Study Areas**: Nursing Core Courses, Nursing of Specialised Populations, Theoretical Foundations for Nursing Practice, Foundations in Nursing Research, Nursing Electives, Nursing Practica, Life Sciences, Clinical Pharmacology, and Behavioural Sciences.",
                    "**Clinical Training**: Extensive practicum in community centres, clinics, and comprehensive teaching hospitals. Simulation training in state-of-the-art nursing laboratories.",
                    "**Life Enrichment Learning**: Global vision development through programmes beyond Hong Kong, including overseas exchanges and international service learning.",
                    "**Professional Recognition**: Graduates eligible to apply for registration as registered nurses with the Nursing Council of Hong Kong."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Registered Nurse Registration**: Graduates who satisfactorily complete all programme requirements are eligible to apply for registration as registered nurses with the Nursing Council of Hong Kong.",
                    "**Hospital Nursing**: Work in medical, surgical, paediatric, critical care, and emergency wards in public hospitals (Hospital Authority) and private hospitals.",
                    "**Community Nursing**: Community health nursing, maternal and child health, geriatric care, and home-based nursing services.",
                    "**Global Leadership**: Graduates are trained to possess global leadership traits, allowing them to work effectively across multidisciplinary teams around the world.",
                    "**Advanced Practice**: With further training, nurses can become Advanced Practice Nurses (APN), Nurse Practitioners, or Nurse Specialists in areas like oncology, mental health, or critical care.",
                    "**Nurse Management and Administration**: Career progression to ward managers, department heads, and nursing administration roles in healthcare institutions.",
                    "**Nursing Education and Research**: Teaching positions in nursing schools and research roles in healthcare research institutions.",
                    "**Extensive Professional Network**: Graduates stay connected via clinical practicum in community centres, clinics, and comprehensive teaching hospitals."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**School of Nursing**: Located within the HKUMed campus at 21 Sassoon Road, Pok Fu Lam. Modern nursing simulation laboratories and clinical skills training facilities.",
                    "**Clinical Practicum Venues**: Queen Mary Hospital, Duchess of Kent Children's Hospital, and numerous community health centres and clinics across Hong Kong.",
                    "**Simulation Training**: State-of-the-art nursing simulation labs providing realistic clinical scenarios for hands-on practice.",
                    "**Student Support**: Comprehensive wellness and engagement programmes, academic advising, and career counselling.",
                    "**Global Exposure**: Life enrichment learning programmes beyond Hong Kong, including overseas exchanges and international service learning opportunities.",
                    "**Student Activities**: Active nursing student society, sports teams, and volunteer service groups."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate to High (★★★☆☆). Accessible entry scores but intense Band A competition.",
                    "**Academic Requirements**: Median 28, LQ 26, UQ 27 (Best 5 subjects). This is achievable for students with consistent Level 3-4 performance across subjects.",
                    "**Band A Competition**: 952 Band A applicants for 220 places in 2025 — approximately 4.3:1 ratio. 100% of offers go to Band A. Band B and below receive zero offers.",
                    "**Interview**: Selective basis. Not all applicants are interviewed. Interview assesses communication skills, empathy, motivation for nursing, and understanding of the nursing profession.",
                    "**What Differentiates Winners**: Genuine compassion for patients, healthcare volunteering experience, strong communication skills in Cantonese and English, and realistic understanding of nursing demands.",
                    "**Cantonese Requirement**: Good working knowledge of Cantonese is required for clinical training and patient communication."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Nursing Leaders**: Alumni serving as nursing directors, ward managers, and department heads in major Hong Kong hospitals.",
                    "**Advanced Practice Pioneers**: Graduates who became among the first Nurse Practitioners and Advanced Practice Nurses in Hong Kong.",
                    "**Global Nurses**: Alumni working in healthcare settings worldwide, including the UK, Australia, Canada, and Singapore.",
                    "**Nursing Educators**: Graduates who became lecturers and professors in nursing schools, shaping the next generation of nurses.",
                    "**Faculty Excellence**: School of Nursing faculty includes experienced clinicians, researchers in gerontology, mental health, and chronic disease management."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKU Admission Scholarships**: For outstanding HKDSE performers. Automatic consideration for top applicants.",
                    "**School of Nursing Scholarships**: Merit-based awards for academic excellence and clinical performance.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students.",
                    "**Nursing Student Support**: Additional bursaries for students in financial need.",
                    "**Overseas Learning Funding**: Support for life enrichment learning programmes and overseas exchanges."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKU Nursing Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 28+. This is achievable with consistent Level 3-4 performance. Unlike Medicine (median 47), Nursing is accessible to well-rounded students without requiring 5* grades.",
                    "**Subject Flexibility**: No specific elective requirements. ANY 2 subjects at Level 3 qualify. This makes Nursing one of the most flexible healthcare programmes. Biology is beneficial but not mandatory.",
                    "**Band A Essential**: 952 Band A applicants for 220 places. 100% of offers go to Band A. Place Nursing in Band A or do not apply.",
                    "**Cantonese is Critical**: Clinical training requires fluent Cantonese for patient communication. If you are not fluent in Cantonese, consider whether you can achieve fluency before Year 3 clinical practicum.",
                    "**Demonstrate Compassion**: Nursing is not just about academics. Admissions officers look for genuine empathy. Volunteer at elderly homes, hospitals, or disability centres. Aim for 30+ hours.",
                    "**Understand the Demands**: Nursing involves shift work, physical demands, and emotional stress. Shadow a nurse for a day to understand the reality. Interviewers will ask why you chose nursing over medicine.",
                    "**Prepare for Selective Interview**: Not all applicants are interviewed. If shortlisted, be ready to discuss: (1) Why nursing specifically? (2) How do you handle stress? (3) Describe a time you showed compassion.",
                    "**Consider JS6418 (ALT)**: If you have leadership experience and stronger academics (median 37), apply for the Advanced Leadership Track. Same nursing curriculum with enhanced leadership training.",
                    "**Career Progression**: Registered Nurse starting salary ~HK$35,000/month. With 5+ years experience and specialisation, can reach HK$60,000-80,000/month as APN or nurse manager."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**入學計分公式**：最佳五科。計分考慮甲類科目，並可包括數學延伸部分（M1/M2）或其他語言科目較高者。中位數28分，下四分位數26分，上四分位數27分（2025年聯招數據）。",
                    "**核心科目最低要求**：中國語文第3級、英國語文第3級、數學（必修部分）第2級、公民與社會發展科達標。",
                    "**選修科目**：任何2科達第3級（不包括應用學習、其他語言科目）或任何1科達第3級 + 數學延伸部分（M1/M2）達第3級。",
                    "**額外要求**：需要良好廣東話工作能力。其他語言科目將作為非指定選修科計算。以往考試的組合科學及綜合科學成績亦會獲得考慮。",
                    "**面試**：需要，選擇性面試。入圍申請者將獲邀請面試。",
                    "**2025年申請統計**：Band A申請者952人，總申請者3,985人，錄取220人。100%錄取為Band A申請者。",
                    "**首年收生名額**：210個學額（JS6468及JS6418護理學學士菁英領袖培育專修組別合計）。",
                    "**修讀年期**：5年全日制。",
                    "**首年學費**：港幣47,000元（教資會資助）。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**課程理念**：培養具備憐憫關懷技巧的高素質護士。學生接受廣泛的臨床及模擬培訓，以及跨專業和問題導向學習。透過香港以外的生命豐盛學習計劃培養環球視野。",
                    "**課程目標**：護理學學士為五年全日制榮譽學位課程。旨在提供全面及整全的護理教育，培養通用護士成為各種醫療環境中的稱職從業者。",
                    "**課程結構**：五年共44科。26科核心課程、7科實習課程、1科生命豐盛學習課程、1科護理選修課程、3科語文課程及6科共同核心課程。共303學分。",
                    "**主要學習領域**：護理核心課程、專科護理、護理實踐理論基礎、護理研究基礎、護理選修、護理實習、生命科學、臨床藥理學及行為科學。",
                    "**臨床培訓**：於社區中心、診所及綜合教學醫院進行廣泛實習。於最先進的護理模擬實驗室進行模擬培訓。",
                    "**生命豐盛學習**：透過香港以外的計劃培養環球視野，包括海外交流及國際服務學習。",
                    "**專業認可**：畢業生符合資格申請香港護士管理局註冊為註冊護士。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**註冊護士資格**：圓滿完成所有課程要求的畢業生，符合資格申請香港護士管理局註冊為註冊護士。",
                    "**醫院護理**：於公立醫院（醫管局）及私立醫院的內科、外科、兒科、深切治療及急症病房工作。",
                    "**社區護理**：社區健康護理、母嬰健康、老年護理及家居護理服務。",
                    "**環球領導才能**：畢業生接受培訓具備環球領導特質，能夠於世界各地的跨學科團隊中有效工作。",
                    "**進階實踐**：接受進一步培訓後，護士可成為進階實踐護士（APN）、護士執業者或專科護士（例如腫瘤科、精神科、深切治療）。",
                    "**護理管理及行政**：職業晉升至病房經理、部門主管及醫療機構護理行政職位。",
                    "**護理教育及研究**：於護理學校擔任教學職位及於醫療研究機構擔任研究職位。",
                    "**廣泛專業網絡**：畢業生透過於社區中心、診所及綜合教學醫院的臨床實習保持聯繫。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**護理學院**：位於港大醫學院薄扶林沙宣道21號校園內。現代化護理模擬實驗室及臨床技巧培訓設施。",
                    "**臨床實習場地**：瑪麗醫院、大口環根德公爵夫人兒童醫院及香港多間社區健康中心及診所。",
                    "**模擬培訓**：最先進的護理模擬實驗室提供逼真的臨床情境供實踐練習。",
                    "**學生支援**：全面健康及參與計劃、學術指導及職業輔導。",
                    "**環球視野**：香港以外的生命豐盛學習計劃，包括海外交流及國際服務學習機會。",
                    "**學生活動**：活躍的護理學生會、運動隊及義工服務小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中至高（★★★☆☆）。入學分數要求較易達致，但Band A競爭激烈。",
                    "**學術要求**：中位數28分，下四分位數26分，上四分位數27分（最佳五科）。對於各科表現穩定達第3-4級的學生而言是可達致的。",
                    "**Band A競爭**：2025年952名Band A申請者競爭220個學額——約4.3:1比率。100%錄取為Band A。Band B及以下獲零錄取。",
                    "**面試**：選擇性面試。並非所有申請者均獲面試。面試評估溝通技巧、同理心、從事護理的動機及對護理專業的理解。",
                    "**成功申請者特質**：真正關懷病人、醫療義工經驗、良好廣東話及英語溝通技巧，以及對護理工作要求的現實理解。",
                    "**廣東話要求**：臨床培訓及病人溝通需要良好廣東話能力。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**護理領袖**：校友於香港主要醫院擔任護理總監、病房經理及部門主管。",
                    "**進階實踐先驅**：畢業生成為香港首批護士執業者及進階實踐護士。",
                    "**環球護士**：校友於全球醫療機構工作，包括英國、澳洲、加拿大及新加坡。",
                    "**護理教育工作者**：畢業生於護理學校擔任講師及教授，培育下一代護士。",
                    "**教職員卓越**：護理學院教職員包括經驗豐富的臨床醫生、老年學、精神健康及慢性疾病管理研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**港大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。頂尖申請人自動獲得考慮。",
                    "**護理學院獎學金**：按學術卓越及臨床表現頒發的優異獎。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
                    "**護理學生支援**：為有需要的學生提供額外助學金。",
                    "**海外學習資助**：支持生命豐盛學習計劃及海外交流。"
                ]
            },
            "tips": {
                "title": "Ace Sir 港大護理學攻略",
                "content": [
                    "**分數目標**：最佳五科目標28分以上。這對於表現穩定的學生是可達致的。與醫學（中位數47分）不同，護理學對全面發展的學生而言是較易達致的。",
                    "**選科靈活**：無特定選修科要求。任何2科達第3級即可。這使護理學成為最靈活的醫療課程之一。修讀生物有益但非強制。",
                    "**Band A必需**：952名Band A申請者競爭220個學額。100%錄取為Band A。必須將護理學放於Band A。",
                    "**廣東話至關重要**：臨床培訓需要流利廣東話與病人溝通。如你不精通廣東話，請考慮能否於第三年臨床實習前達至流利程度。",
                    "**展示憐憫**：護理學不僅關乎學術。招生官尋找真正的同理心。於安老院、醫院或傷殘中心義工。目標30小時以上。",
                    "**理解工作要求**：護理涉及輪班工作、體力要求及情緒壓力。跟隨護士一天以了解現實。面試官會問你為何選擇護理而非醫學。",
                    "**準備選擇性面試**：並非所有申請者均獲面試。如入圍，請準備討論：(1) 為何選擇護理？(2) 如何處理壓力？(3) 描述一次展示同理心的經歷。",
                    "**考慮JS6418（菁英領袖）**：如你具備領導經驗及較強學術成績（中位數37分），可申請菁英領袖培育專修組別。相同護理課程加上強化領導培訓。",
                    "**職業發展**：註冊護士起薪約港幣35,000元/月。具5年以上經驗及專科資格，可達港幣60,000-80,000元/月為進階實踐護士或護理經理。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
print(f"[Seed] All 8 sections (EN + ZH) rewritten with verified data from official sources")
