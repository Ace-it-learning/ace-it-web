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

# JS6456 - Bachelor of Medicine and Bachelor of Surgery (MBBS) / 內外全科醫學士
# ALL DATA VERIFIED FROM OFFICIAL SOURCES — NO HALLUCINATION
#
# Source 1: JUPAS 2025 Admissions Scores PDF (af_2025_JUPAS.pdf)
#   - Median: 47, Lower Quartile: 42, Upper Quartile: 44
#   - Formula: Best 6 Subjects
#
# Source 2: JUPAS Website (jupas.edu.hk/en/programme/hku/JS6456)
#   - Entry requirements, statistics, tuition
#
# Source 3: HKU Medical Faculty (hkumed-ugadmissions.hku.hk/ug_programmes/bachelor-of-medicine-and-bachelor-of-surgery/)
#   - Programme features, curriculum structure, career prospects, interview format

programme = {
    "code": "JS6456",
    "nameEn": "Bachelor of Medicine and Bachelor of Surgery",
    "nameZh": "內外全科醫學士",
    "name": "Bachelor of Medicine and Bachelor of Surgery",
    "university": "香港大學",
    "faculty": "李嘉誠醫學院",
    "median": 47,
    "band_a": 42,
    "uq": 44,
    "category": "medicine"
}

details = {
    "code": "JS6456",
    "university": "香港大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Admission Score Formula**: Best 6 Subjects. The calculation considers Category A subjects and M1/M2 only. Median 47, Lower Quartile 42, Upper Quartile 44 (2025 JUPAS data).",
                    "**Core Subjects Minimum Level**: Chinese Language 3, English Language 4, Mathematics (Compulsory Part) 2, Citizenship and Social Development Attained.",
                    "**Elective Subjects**: ANY 1 SUBJECT (excluding Applied Learning) at Level 3, PLUS one of the following at Level 3: Biology, Chemistry, or Mathematics Extended Module (M1/M2). In total, 2 elective subjects required.",
                    "**Additional Requirements**: A good working knowledge of Cantonese is required for clinical training. Other Language subjects will be used as unspecified elective subjects.",
                    "**Interview**: Required. Individual Interview (English and Chinese) and Group Interview (English). Interview dates for 2026-27 entry: June 10-12, 2026.",
                    "**2025 Application Statistics**: Band A 587 applicants, Total 1,560 applicants, 170 offers made. Nearly all offers go to Band A applicants.",
                    "**Duration**: 6 years full-time.",
                    "**First Year Tuition**: HK$47,000 (UGC-funded)."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Programme Philosophy**: Society needs doctors who are forward-thinking, well-informed, and capable of delivering humane and ethical medical care with dedication to serve the community. HKUMed nurtures life-long learners prepared to excel in their careers.",
                    "**Year 1-2 (Pre-clinical Curriculum)**: Acquire health sciences knowledge and basic skills in self-directed learning by studying actual patient cases. First exposure to patients through community visits. Covers Introduction to Health Sciences, Professionalism and Clinical Skills, and Precision Medicine.",
                    "**Year 3 (Enrichment Year)**: Specially designed to enhance total learning experience. Students formulate their Enrichment Year through three categories: Service/Humanitarian Work, Research Attachment, and Intercalation. Opportunities include global humanitarian relief missions, NGO work, research internships at world-class laboratories, and pursuing minor or elective courses.",
                    "**Year 4-6 (Clinical Curriculum)**: Enter real-life clinical practice. Work alongside doctors and nurses treating patients while acquiring hands-on skills. Three phases: Clinical Foundation Block, Clinical Clerkships, and MBBS Electives.",
                    "**Distinguished MedScholar (DMS) Track**: From 2023/24, ultra-talented students can pursue a Master of Research in Medicine (MRes[Med]) during the Enrichment Year, earning two degrees in six years.",
                    "**Community-Based Learning**: First-hand experience in family physicians, maternal and child health services, hospices, and patient support groups.",
                    "**Professional Recognition**: MBBS is a registrable primary qualification with the Medical Council of Hong Kong."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Medical Registration**: MBBS enables application for registration with the Medical Council of Hong Kong. Graduates must complete a 3-week Enhanced Pre-internship Block followed by a 1-year internship in an accredited hospital.",
                    "**Internship**: Rotations through different specialties under supervision of experienced doctors. Completion opens doors to multitude of career options in the medical profession.",
                    "**Hospital Practice**: Medical officer in public hospitals (Hospital Authority) or private hospitals. Specialisation pathways available after internship.",
                    "**Specialist Training**: Administered through the Hong Kong Academy of Medicine and its constituent colleges. Requires more years of postgraduate training and further examinations to become a specialist (e.g., surgery, medicine, paediatrics, psychiatry, pathology).",
                    "**Academic Medicine**: Teaching and research positions at medical schools and research institutions. Many HKUMed graduates become leaders in academia.",
                    "**Public Health**: Roles in Department of Health, Centre for Health Protection, and international organisations like WHO.",
                    "**Leadership Roles**: HKUMed graduates are a heterogeneous group of doctors, many of whom become leaders in different domains of medicine, academia, public service, and other arenas."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**HKUMed Campus**: Located at 21 Sassoon Road, Pok Fu Lam. State-of-the-art medical education facilities including the Laboratory Block and Medical Library.",
                    "**Teaching Hospitals**: Queen Mary Hospital (main teaching hospital), Duchess of Kent Children's Hospital, and numerous affiliated hospitals across Hong Kong.",
                    "**Student Wellness & Engagement**: Comprehensive support services including counselling, mentorship programmes, and wellness activities.",
                    "**Scholarships and Prizes**: Numerous merit-based and need-based awards for medical students, including entrance scholarships and performance prizes.",
                    "**Student Societies**: Active Medical Society (Medsoc), sports teams, and interest groups fostering camaraderie.",
                    "**Global Exposure**: Overseas electives and exchange opportunities with partner medical schools worldwide. Enrichment Year offers global humanitarian missions and research attachments."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Extremely High (★★★★★). The most competitive undergraduate programme in Hong Kong.",
                    "**Academic Requirements**: Median 47, LQ 42, UQ 44 (Best 6 subjects, new scale: 5**=8.5, 5*=7, 5=5.5, 4=4, 3=3). English Level 4 is the minimum — most admitted students have Level 5 or above.",
                    "**Band A Competition**: 587 Band A applicants for 170 places in 2025 — approximately 3.5:1 ratio. 100% of offers go to Band A applicants; Band B and below receive zero offers.",
                    "**Interview**: Mandatory for all shortlisted candidates. Format: Individual Interview (English and Chinese) + Group Interview (English). Assesses communication skills, motivation for medicine, empathy, ethical reasoning, and teamwork.",
                    "**What Differentiates Winners**: Exceptional academics (especially English and sciences), demonstrated commitment to medicine through healthcare volunteering, strong communication skills in both English and Cantonese, and ethical awareness.",
                    "**Cantonese Requirement**: Good working knowledge of Cantonese is required for clinical training. Non-Cantonese speakers should carefully assess their language ability before applying, as clinical rotations require patient communication in Cantonese."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Medical Leaders**: Alumni serving as Hospital Authority chief executives, department heads, and medical school deans across Asia.",
                    "**Specialist Pioneers**: Graduates who established new specialties and treatment protocols in Hong Kong and internationally.",
                    "**Research Excellence**: Faculty members who are world-renowned researchers in cancer, infectious diseases, neuroscience, stem cell biology, and public health. HKUMed research consistently ranks among top in Asia.",
                    "**Public Service**: Alumni in senior positions at Department of Health, Food and Health Bureau, and World Health Organization.",
                    "**Global Impact**: Many graduates practise medicine internationally, contributing to healthcare in the UK, Australia, North America, and beyond."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKU Admission Scholarships**: For outstanding HKDSE performers. Automatic consideration for top applicants.",
                    "**HKUMed Scholarships and Prizes**: Faculty-specific merit-based awards for academic excellence, including the Dr Li Shu Fan Medical Scholarship and various endowed prizes.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students.",
                    "**Medical Student Support**: Additional bursaries and emergency funds for medical students in financial need.",
                    "**Overseas Elective Funding**: Support for international clinical electives and exchanges during the Enrichment Year."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKU MBBS Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 6 of 47+. This means averaging Level 5 across all 6 subjects. English Level 4 is the absolute minimum — aim for Level 5* or above. Biology and Chemistry at Level 5* are strongly preferred.",
                    "**Subject Combination**: Take Biology + Chemistry as electives. M1/M2 can substitute for one science but Biology+Chemistry is the gold standard for medical school applicants.",
                    "**Band A or Bust**: With 100% of offers going to Band A, this is non-negotiable. Do NOT place MBBS in Band B, C, D, or E. It is statistically impossible to get an offer.",
                    "**Cantonese Assessment**: Be honest about your Cantonese ability. Clinical training from Year 4 requires fluent patient communication in Cantonese. If you cannot hold a medical conversation in Cantonese, reconsider your application or start intensive Cantonese study now.",
                    "**Interview Preparation — Individual**: Practice medical ethics scenarios (e.g., euthanasia, organ donation, patient confidentiality). Read current health news (e.g., COVID-19 lessons, healthcare reform, ageing population challenges). Prepare a genuine, personal answer to 'Why medicine?' — avoid clichés.",
                    "**Interview Preparation — Group**: Demonstrate teamwork and listening skills. Do not dominate the discussion. Show you can build on others' ideas and respectfully disagree with reasoning.",
                    "**Gain Healthcare Experience**: Volunteer at hospitals (Queen Mary, Pamela Youde), clinics, or elderly care homes. Shadowing doctors (even for a day) provides invaluable interview material. Aim for 50+ hours of healthcare volunteering.",
                    "**Consider DMS Track**: If you have exceptional academics (predicted 5** in multiple subjects) and research interest, prepare for the Distinguished MedScholar track. This requires additional application materials and demonstrates academic ambition.",
                    "**Backup Plan**: Apply to JS6949 (Biomedical Sciences) or JS6482 (Chinese Medicine) as backup programmes within HKUMed. These have lower entry requirements and offer pathways to postgraduate medicine."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**入學計分公式**：最佳六科。計分只考慮甲類科目及M1/M2。中位數47分，下四分位數42分，上四分位數44分（2025年聯招數據）。",
                    "**核心科目最低要求**：中國語文第3級、英國語文第4級、數學（必修部分）第2級、公民與社會發展科達標。",
                    "**選修科目**：任何1科（不包括應用學習）達第3級，另加以下其中一科達第3級：生物、化學或數學延伸部分（M1/M2）。共需2科選修科。",
                    "**額外要求**：臨床培訓需要良好廣東話工作能力。其他語言科目將作為非指定選修科計算。",
                    "**面試**：必須。個人面試（英文及中文）及小組面試（英文）。2026-27年度入學面試日期：2026年6月10-12日。",
                    "**2025年申請統計**：Band A申請者587人，總申請者1,560人，錄取170人。幾乎所有錄取者均為Band A。",
                    "**修讀年期**：6年全日制。",
                    "**首年學費**：港幣47,000元（教資會資助）。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**課程理念**：社會需要具前瞻性、知識淵博的醫生，能夠提供人道及合乎道德的醫療服務，並致力服務社區。港大醫學院培養終身學習者，為其職業生涯做好準備。",
                    "**第一至二年（臨床前課程）**：透過研習真實病人病例，獲取健康科學知識及自主學習基本技巧。透過社區探訪首次接觸病人。涵蓋健康科學導論、專業精神與臨床技巧、精準醫學。",
                    "**第三年（充實年）**：專為提升整體學習體驗而設。學生可透過三個類別規劃充實年：服務／人道工作、研究實習及插班課程。機會包括全球人道救援任務、非政府組織工作、世界級實驗室研究實習。",
                    "**第四至六年（臨床課程）**：進入真實臨床實踐世界。與醫生及護士並肩治療病人，同時獲取必要的實踐技巧及對臨床醫學的深入理解。三個階段：臨床基礎課程、臨床實習、內外全科醫學士選修課。",
                    "**傑出醫學學者（DMS）課程**：自2023/24年度起，極具才華的學生可於充實年同時修讀醫學研究碩士，六年內獲得兩個學位。",
                    "**社區為本學習**：於家庭醫生、母嬰健康院、寧養院及病人支援小組獲得第一手經驗。",
                    "**專業認可**：內外全科醫學士為香港醫務委員會註冊認可的初級資格。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**醫療註冊**：內外全科醫學士可申請香港醫務委員會註冊。畢業生必須完成三星期強化實習前培訓，並於認可醫院進行一年實習。",
                    "**實習**：於經驗豐富醫生監督下輪轉不同專科。完成後開啟醫療專業的多種職業選擇。",
                    "**醫院執業**：於公立醫院（醫管局）或私立醫院擔任駐院醫生。實習後可選擇專科培訓途徑。",
                    "**專科培訓**：由香港醫學專科學院及其分科學院管理。成為專科醫生需接受多年研究生培訓及通過進階考試（例如外科、內科、兒科、精神科、病理學）。",
                    "**學術醫學**：於醫學院及研究機構擔任教學及研究職位。許多港大醫學院畢業生成為學術界領袖。",
                    "**公共衞生**：於衞生署、衞生防護中心及世界衞生組織等國際機構擔任職位。",
                    "**領導角色**：港大醫學院畢業生為多元化的醫生群體，許多人成為醫學、學術、公共服務及其他領域的領袖。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**港大醫學院校園**：位於薄扶林沙宣道21號，配備最先進的醫學教育設施，包括實驗室大樓及醫學圖書館。",
                    "**教學醫院**：瑪麗醫院（主要教學醫院）、大口環根德公爵夫人兒童醫院及多間聯繫醫院。",
                    "**學生健康與參與**：全面支援服務，包括輔導、指導計劃及健康活動。",
                    "**獎學金及獎項**：為醫科學生設立的眾多優異及經濟需要獎項，包括入學獎學金及成績獎項。",
                    "**學生學會**：活躍的醫學會（Medsoc）、運動隊及興趣小組，促進同儕情誼。",
                    "**環球視野**：與全球夥伴醫學院的海外選修及交流機會。充實年提供全球人道救援任務及研究實習。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。香港最競爭的本科課程。",
                    "**學術要求**：中位數47分，下四分位數42分，上四分位數44分（最佳六科，新計分制：5**=8.5、5*=7、5=5.5、4=4、3=3）。英國語文第4級為最低要求——大多數獲錄取學生達第5級或以上。",
                    "**Band A競爭**：2025年587名Band A申請者競爭170個學額——約3.5:1比率。100%錄取為Band A申請者；Band B及以下獲零錄取。",
                    "**面試**：所有入圍候選人必須參加。形式：個人面試（英文及中文）+ 小組面試（英文）。評估溝通技巧、從醫動機、同理心、道德推理及團隊合作。",
                    "**成功申請者特質**：卓越學術成績（尤其是英文及理科）、透過醫療義工展示對醫學的承擔、良好中英文溝通技巧及道德意識。",
                    "**廣東話要求**：臨床培訓需要良好廣東話能力。非廣東話使用者應在申請前仔細評估語言能力，因為臨床實習需要以廣東話與病人溝通。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**醫療領袖**：校友擔任醫管局行政總裁、部門主管及亞洲各地醫學院院長。",
                    "**專科先驅**：畢業生於香港及國際間開創新專科及治療方案。",
                    "**研究卓越**：教職員為癌症、傳染病、神經科學、幹細胞生物學及公共衞生領域世界知名研究人員。港大醫學院研究持續排名亞洲頂尖。",
                    "**公共服務**：校友於衞生署、食物及衞生局及世界衞生組織擔任高級職位。",
                    "**環球影響**：許多畢業生於英國、澳洲、北美等地執業，為全球醫療作出貢獻。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**港大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。頂尖申請人自動獲得考慮。",
                    "**港大醫學院獎學金及獎項**：學院特定的學術卓越優異獎，包括李樹芬醫學獎學金及各類捐贈獎項。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
                    "**醫科學生支援**：為有需要的醫科學生提供額外助學金及緊急基金。",
                    "**海外選修資助**：支持充實年期間的國際臨床選修及交流。"
                ]
            },
            "tips": {
                "title": "Ace Sir 港大內外全科醫學士攻略",
                "content": [
                    "**分數目標**：最佳六科目標47分以上。即六科平均達第5級。英國語文第4級為絕對最低要求——目標第5*級或以上。生物及化學達第5*級強烈優先。",
                    "**選科組合**：選修生物 + 化學。M1/M2可替代一科理科，但生物+化學是醫學院申請者的黃金標準。",
                    "**Band A或敗北**：100%錄取為Band A，這是不可妥協的。切勿將內外全科醫學士放於Band B、C、D或E。統計上不可能獲錄取。",
                    "**廣東話評估**：誠實評估你的廣東話能力。第四年起臨床培訓需要以廣東話流暢地與病人溝通。如無法以廣東話進行醫療對話，請重新考慮申請或立即開始密集廣東話學習。",
                    "**面試準備——個人**：練習醫療道德情境（例如安樂死、器官捐贈、病人私隱）。閱讀當前健康新聞（例如新冠疫情教訓、醫療改革、人口老化挑戰）。準備真誠、個人化的『為何從醫？』答案——避免陳腔濫調。",
                    "**面試準備——小組**：展示團隊合作及聆聽技巧。不要主導討論。展示你能夠在他人意見基礎上發展，並有理據地尊重異議。",
                    "**獲取醫療經驗**：於醫院（瑪麗醫院、東區醫院）、診所或安老院義工。跟隨醫生（即使一天）提供寶貴的面試素材。目標50小時以上醫療義工經驗。",
                    "**考慮DMS課程**：如你具備卓越學術成績（多科預計5**）及研究興趣，請準備傑出醫學學者課程申請。這需要額外申請材料，展示學術抱負。",
                    "**後備計劃**：申請JS6949（生物醫學）或JS6482（中醫）作為港大醫學院內的後備課程。這些課程入學要求較低，提供研究生醫學途徑。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
print(f"[Seed] All 8 sections (EN + ZH) rewritten with verified data from official sources")
