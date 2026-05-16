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
# Data sources:
# - JUPAS 2025 Admissions Scores PDF: Median 47, Lower Quartile 42, Upper Quartile 44
# - JUPAS Website (jupas.edu.hk/en/programme/hku/JS6456): Entry requirements, statistics
# - HKU Medical Faculty (hkumed-ugadmissions.hku.hk): Programme features, curriculum, careers, interview

programme = {
    "code": "JS6456",
    "nameEn": "Bachelor of Medicine and Bachelor of Surgery",
    "nameZh": "內外全科醫學士",
    "name": "Bachelor of Medicine and Bachelor of Surgery",
    "university": "香港大學",
    "faculty": "醫學院",
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
                    "**Programme Overview**: The MBBS curriculum trains doctors who are forward-thinking, well-informed, and capable of delivering humane and ethical medical care with dedication to serve the community. HKUMed nurtures life-long learners prepared to excel in their careers.",
                    "**Year 1-2 (Pre-clinical Curriculum)**: Foundation biomedical sciences, anatomy, physiology, biochemistry, and introduction to clinical medicine. Problem-based, small-group tutorials require active participation.",
                    "**Year 3 (Enrichment Year)**: Students engage in research, overseas exchange, or intercalation programmes. Opportunities for personal development and exploration of medical specialties.",
                    "**Year 4-6 (Clinical Curriculum)**: Intensive clinical training in hospitals and community settings. Rotations through medicine, surgery, paediatrics, obstetrics & gynaecology, psychiatry, and family medicine.",
                    "**Community-Based Learning**: First-hand experience in family physicians, maternal and child health services, hospices, and patient support groups.",
                    "**Distinguished MedScholar (DMS) Track**: Offered from 2023/24 to nurture students to become scholars and leaders. Alternative pathway for ultra-talented students.",
                    "**Professional Recognition**: MBBS is a registrable primary qualification with the Medical Council of Hong Kong."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Medical Registration**: MBBS enables application for registration with the Medical Council of Hong Kong. Graduates must complete a 3-week Enhanced Pre-internship Block followed by a 1-year internship in an accredited hospital.",
                    "**Internship**: Rotations through different specialties under supervision of experienced doctors. Completion opens doors to multitude of career options.",
                    "**Hospital Practice**: Medical officer in public hospitals (HA) or private hospitals. Specialisation pathways available.",
                    "**Specialist Training**: Further years of postgraduate training and examinations required to become a specialist (e.g., surgery, medicine, paediatrics, psychiatry).",
                    "**Academic Medicine**: Teaching and research positions at medical schools and research institutions.",
                    "**Public Health**: Roles in Department of Health, Centre for Health Protection, and WHO.",
                    "**Leadership Roles**: Many HKUMed graduates become leaders in medicine, academia, public service, and healthcare administration."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**HKUMed Campus**: Located at 21 Sassoon Road, Pok Fu Lam. State-of-the-art medical education facilities.",
                    "**Teaching Hospitals**: Queen Mary Hospital (main teaching hospital), Duchess of Kent Children's Hospital, and numerous affiliated hospitals.",
                    "**Student Wellness & Engagement**: Comprehensive support services including counselling, mentorship, and wellness programmes.",
                    "**Scholarships and Prizes**: Numerous merit-based and need-based awards for medical students.",
                    "**Student Societies**: Active medical student societies, sports teams, and interest groups.",
                    "**Global Exposure**: Overseas electives and exchange opportunities with partner medical schools worldwide."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Extremely High (★★★★★). The most competitive undergraduate programme in Hong Kong.",
                    "**Academic Requirements**: Median 47, LQ 42, UQ 44 (Best 6 subjects). English Level 4 is critical.",
                    "**Band A Competition**: 587 Band A applicants for 170 places in 2025 — approximately 3.5:1 ratio. Nearly ALL offers go to Band A.",
                    "**Interview**: Mandatory. Individual Interview (English and Chinese) + Group Interview (English). Assesses communication skills, motivation, empathy, and ethical reasoning.",
                    "**What Differentiates Winners**: Exceptional academics (especially English and sciences), demonstrated commitment to medicine, strong communication skills, and ethical awareness.",
                    "**Cantonese Requirement**: Good working knowledge of Cantonese required for clinical training — important consideration for non-Cantonese speakers."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Medical Leaders**: Alumni serving as Hospital Authority chief executives, department heads, and medical school deans.",
                    "**Specialist Pioneers**: Graduates who established new specialties and treatment protocols in Hong Kong.",
                    "**Academic Excellence**: Faculty members who are world-renowned researchers in cancer, infectious diseases, neuroscience, and public health.",
                    "**Public Service**: Alumni in senior positions at Department of Health, Food and Health Bureau, and WHO.",
                    "**Global Impact**: HKUMed research ranked among top in Asia with global influence in medical science."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKU Admission Scholarships**: For outstanding HKDSE performers.",
                    "**HKUMed Scholarships and Prizes**: Faculty-specific merit-based awards for academic excellence.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students.",
                    "**Medical Student Support**: Additional bursaries and emergency funds for medical students in need.",
                    "**Overseas Elective Funding**: Support for international clinical electives and exchanges."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKU MBBS Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 6 of 47+. English Level 4 is minimum — aim for Level 5* or above. Biology and Chemistry at Level 5* strongly preferred.",
                    "**Band A Essential**: With 587 Band A applicants for 170 places, Band A placement is absolutely critical. No offers go to Band B or below.",
                    "**Cantonese Assessment**: Ensure you have working Cantonese for clinical training. Non-Cantonese speakers should assess this carefully.",
                    "**Interview Preparation**: Practice medical ethics scenarios, current healthcare issues, and personal motivation for medicine. Both English and Chinese interviews required.",
                    "**Gain Healthcare Experience**: Volunteer at hospitals, clinics, or elderly care homes to demonstrate commitment.",
                    "**Stay Updated**: Follow medical news and HKUMed research developments. Interviewers may ask about current health issues.",
                    "**Consider DMS Track**: Ultra-talented students can apply for the Distinguished MedScholar track for enhanced research and leadership training."
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
                    "**課程概覽**：內外全科醫學士課程培養具前瞻性、知識淵博的醫生，能夠提供人道及合乎道德的醫療服務，並致力服務社會。港大醫學院培養終身學習者，為其職業生涯做好準備。",
                    "**第一至二年（臨床前課程）**：基礎生物醫學科學、解剖學、生理學、生物化學及臨床醫學導論。採用問題導向小組教學，要求學生積極參與。",
                    "**第三年（充實年）**：學生參與研究、海外交流或插班課程。提供個人發展及探索醫學專科的機會。",
                    "**第四至六年（臨床課程）**：於醫院及社區進行密集臨床培訓。輪轉內科、外科、兒科、婦產科、精神科及家庭醫學。",
                    "**社區為本學習**：於家庭醫生、母嬰健康院、寧養院及病人支援小組獲得第一手經驗。",
                    "**傑出醫學學者（DMS）課程**：自2023/24年度起開設，進一步培養學生成為學者及領袖，為極具才華學生提供另類途徑。",
                    "**專業認可**：內外全科醫學士為香港醫務委員會註冊認可的初級資格。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**醫療註冊**：內外全科醫學士可申請香港醫務委員會註冊。畢業生必須完成三星期強化實習前培訓，並於認可醫院進行一年實習。",
                    "**實習**：於經驗豐富醫生監督下輪轉不同專科。完成後開啟醫療專業的多種職業選擇。",
                    "**醫院執業**：於公立醫院（醫管局）或私立醫院擔任駐院醫生。可選擇專科培訓途徑。",
                    "**專科培訓**：成為專科醫生需接受多年研究生培訓及通過進階考試（例如外科、內科、兒科、精神科）。",
                    "**學術醫學**：於醫學院及研究機構擔任教學及研究職位。",
                    "**公共衞生**：於衞生署、衞生防護中心及世界衞生組織擔任職位。",
                    "**領導角色**：許多港大醫學院畢業生成為醫學、學術、公共服務及醫療行政領域的領袖。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**港大醫學院校園**：位於薄扶林沙宣道21號，配備最先進的醫學教育設施。",
                    "**教學醫院**：瑪麗醫院（主要教學醫院）、大口環根德公爵夫人兒童醫院及多間聯繫醫院。",
                    "**學生健康與參與**：全面支援服務，包括輔導、指導及健康計劃。",
                    "**獎學金及獎項**：為醫科學生設立的眾多優異及經濟需要獎項。",
                    "**學生學會**：活躍的醫科學生會、運動隊及興趣小組。",
                    "**環球視野**：與全球夥伴醫學院的海外選修及交流機會。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。香港最競爭的本科課程。",
                    "**學術要求**：中位數47分，下四分位數42分，上四分位數44分（最佳六科）。英國語文第4級為關鍵要求。",
                    "**Band A競爭**：2025年587名Band A申請者競爭170個學額——約3.5:1比率。幾乎所有錄取均為Band A。",
                    "**面試**：必須。個人面試（英文及中文）+ 小組面試（英文）。評估溝通技巧、動機、同理心及道德推理。",
                    "**成功申請者特質**：卓越學術成績（尤其是英文及理科）、展示對醫學的承擔、良好溝通技巧及道德意識。",
                    "**廣東話要求**：臨床培訓需要良好廣東話能力——非廣東話使用者需仔細考慮。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**醫療領袖**：校友擔任醫管局行政總裁、部門主管及醫學院院長。",
                    "**專科先驅**：畢業生於香港開創新專科及治療方案。",
                    "**學術卓越**：教職員為癌症、傳染病、神經科學及公共衞生領域世界知名研究人員。",
                    "**公共服務**：校友於衞生署、食物及衞生局及世界衞生組織擔任高級職位。",
                    "**環球影響**：港大醫學院研究排名亞洲頂尖，於醫學科學具有全球影響力。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**港大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**港大醫學院獎學金及獎項**：學院特定的學術卓越優異獎。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
                    "**醫科學生支援**：為有需要的醫科學生提供額外助學金及緊急基金。",
                    "**海外選修資助**：支持國際臨床選修及交流。"
                ]
            },
            "tips": {
                "title": "Ace Sir 港大內外全科醫學士攻略",
                "content": [
                    "**分數目標**：最佳六科目標47分以上。英國語文第4級為最低要求——目標第5*級或以上。生物及化學達第5*級強烈優先。",
                    "**Band A必需**：587名Band A申請者競爭170個學額，Band A選擇絕對關鍵。沒有Band B或以下獲錄取。",
                    "**廣東話評估**：確保具備廣東話工作能力以進行臨床培訓。非廣東話使用者應仔細評估。",
                    "**面試準備**：練習醫療道德情境、當前醫療議題及個人從醫動機。需接受英文及中文面試。",
                    "**獲取醫療經驗**：於醫院、診所或安老院義工以展示承擔。",
                    "**緊貼時事**：關注醫療新聞及港大醫學院研究發展。面試官可能詢問當前健康議題。",
                    "**考慮DMS課程**：極具才華的學生可申請傑出醫學學者課程，獲得強化研究及領導培訓。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
print(f"[Seed] Updated median: {programme['median']}, band_a (LQ): {programme['band_a']}, uq: {programme['uq']}")
