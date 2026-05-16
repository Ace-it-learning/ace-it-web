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

# JS5118 - BSc in Biomedical and Health Sciences / 理學士（生物醫學及健康科學）
programme = {
    "code": "JS5118",
    "nameEn": "BSc in Biomedical and Health Sciences",
    "nameZh": "理學士（生物醫學及健康科學）",
    "name": "BSc in Biomedical and Health Sciences",
    "university": "香港科技大學",
    "faculty": "理學院",
    "median": 33,
    "band_a": 36,
    "category": "science"
}

details = {
    "code": "JS5118",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: VERY COMPETITIVE. Popular among students aspiring to medical and health professions. Best 5 typically 33-36 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Biology AND Chemistry at Level 5 or above strongly preferred. Both subjects are essential for the curriculum.",
                    "**Interview**: May be required for borderline cases. Assesses motivation for healthcare careers and understanding of biomedical field.",
                    "**Non-Academic Factors**: Healthcare volunteering, medical shadowing, science research experience, and leadership in health-related activities are highly valued."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundations**: Human physiology, cell biology, biochemistry, genetics, and introduction to biomedical sciences.",
                    "**Year 2 - Core Biomedical**: Molecular biology, immunology, microbiology, pharmacology, and laboratory techniques.",
                    "**Year 3 - Specialization**: Choose track in Biomedical Research, Health Sciences, or Pre-Medical Preparation. Advanced coursework and lab training.",
                    "**Year 4 - Capstone Research**: Independent research project under faculty supervision. Opportunity for publication and conference presentation.",
                    "**Laboratory Training**: Hands-on experience in cell culture, molecular diagnostics, microscopy, and biochemical analysis.",
                    "**Clinical Exposure**: Collaboration with teaching hospitals for clinical observation and understanding of healthcare delivery."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Medical Professions**: Pathway to medical school (MBBS, MD) for graduates who meet additional requirements. Strong foundation for healthcare careers.",
                    "**Biomedical Research**: Research positions at universities, hospitals, and research institutes in Hong Kong and globally.",
                    "**Pharmaceutical Industry**: Drug development, clinical trials, regulatory affairs, and medical affairs roles at pharma and biotech companies.",
                    "**Public Health**: Positions in government health departments, CDC-equivalent agencies, and international health organizations.",
                    "**Medical Technology**: Diagnostic equipment, medical devices, and digital health companies.",
                    "**Allied Health**: Medical laboratory technologist, clinical research coordinator, and health science educator roles."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Biomedical Labs**: Modern life science building with cell culture facilities, molecular biology labs, and confocal microscopy centers.",
                    "**Research Centers**: Access to HKUST Division of Life Science research centers and core facilities.",
                    "**Teaching Hospital Links**: Collaboration with nearby hospitals for clinical observation, internships, and guest lectures by practicing clinicians.",
                    "**Science Library**: Extensive biomedical and health sciences journal collections with quiet study spaces.",
                    "**Student Community**: Active life science student society, health-related interest groups, and regular seminars by biomedical researchers."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Very High (★★★★★). Highly sought after by pre-med and health science oriented students.",
                    "**Academic Requirements**: Best 5 around 33-36. Level 5* in Biology and Chemistry typically required for competitive admission.",
                    "**Band A Competition**: Intense competition. Band A placement strongly recommended for this high-demand programme.",
                    "**Interview Weighting**: Moderate. May be used for borderline cases to assess healthcare motivation.",
                    "**What Differentiates Winners**: Exceptional science grades combined with genuine healthcare exposure and clear career motivation.",
                    "**Trend**: Increasing demand due to growing healthcare sector and interest in medical careers post-pandemic."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Medical School Admissions**: Alumni admitted to HKU, CUHK, and overseas medical schools (UK, Australia, US).",
                    "**Research Careers**: Graduates as researchers at Hospital Authority, Department of Health, and university medical schools.",
                    "**PhD Pursuits**: Alumni in PhD programmes at Johns Hopkins, Oxford, Cambridge, and other top biomedical institutions.",
                    "**Health-Tech Entrepreneurs**: Alumni founders of innovative medical device and digital health startups.",
                    "**Faculty Excellence**: HKUST biomedical faculty includes leaders in cancer biology, neuroscience, stem cell research, and infectious diseases."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers. Full or half tuition coverage for top achievers.",
                    "**School of Science Scholarships**: Merit-based awards recognizing academic excellence in science subjects.",
                    "**Healthcare Professional Scholarship**: For students demonstrating commitment to healthcare careers.",
                    "**Research Grants**: Funding for undergraduate research projects in biomedical sciences.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Biomedical Sciences Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 34+. Level 5* in BOTH Biology and Chemistry is crucial.",
                    "**Get Healthcare Experience**: Volunteer at hospitals, shadow doctors, or work at clinics. Genuine exposure is essential.",
                    "**Maintain Strong Science Grades**: Biology and Chemistry are the most important subjects for this programme.",
                    "**Consider M1/M2**: Mathematics Extended Part strengthens analytical skills valuable for biomedical research.",
                    "**Articulate Your Motivation**: Be ready to explain why you want a career in biomedical or health sciences."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：非常競爭。深受有志從事醫療及健康專業的學生歡迎。最佳五科通常33-36分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：生物及化學達5級或以上強烈優先考慮。兩科對課程均為必需。",
                    "**面試**：邊緣個案可能需要。評估醫療保健事業動機及對生物醫學領域的了解。",
                    "**非學術因素**：醫療保健義工、醫學見習、科學研究經驗及健康相關活動領導角色極受重視。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：人體生理學、細胞生物學、生物化學、遺傳學及生物醫學科學導論。",
                    "**第二年 - 核心生物醫學**：分子生物學、免疫學、微生物學、藥理學及實驗室技術。",
                    "**第三年 - 專修**：選擇生物醫學研究、健康科學或醫學預備方向。高級課程及實驗室培訓。",
                    "**第四年 - 專題研究**：在教授指導下進行獨立研究項目。有機會出版及於學術會議發表。",
                    "**實驗室培訓**：細胞培養、分子診斷、顯微鏡及生化分析的實踐經驗。",
                    "**臨床接觸**：與教學醫院合作進行臨床觀察及了解醫療服務提供。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**醫療專業**：為符合額外要求的畢業生提供醫學院（內外全科醫學士、醫學博士）升學途徑。為醫療保健事業奠定穩固基礎。",
                    "**生物醫學研究**：於香港及全球大學、醫院及研究機構擔任研究職位。",
                    "**製藥業**：於製藥及生物科技公司擔任藥物開發、臨床試驗、監管事務及醫學事務職位。",
                    "**公共衛生**：於政府衛生部門、類似疾控中心的機構及國際衛生組織擔任職位。",
                    "**醫療技術**：診斷設備、醫療器械及數碼健康公司。",
                    "**專職醫療**：醫務化驗師、臨床研究協調員及健康科學教育工作者職位。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**生物醫學實驗室**：現代生命科學大樓設有細胞培養設施、分子生物學實驗室及共聚焦顯微鏡中心。",
                    "**研究中心**：可使用科大生命科學部研究中心及核心設施。",
                    "**教學醫院聯繫**：與附近醫院合作進行臨床觀察、實習及執業醫師客席講座。",
                    "**科學圖書館**：藏有大量生物醫學及健康科學期刊，設有寧靜自修空間。",
                    "**學生社群**：活躍的生命科學學生學會、健康相關興趣小組及定期生物醫學研究人員研討會。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。深受醫學預備及健康科學導向學生追捧。",
                    "**學術要求**：最佳五科約33-36分。生物及化學通常需達5*級方可具競爭力入學。",
                    "**Band A競爭**：競爭激烈。強烈建議將課程放於Band A選擇。",
                    "**面試比重**：中等。可能用於邊緣個案評估醫療保健動機。",
                    "**成功申請者特質**：卓越科學成績結合 genuine 醫療保健接觸及清晰職業動機。",
                    "**趨勢**：由於醫療保健行業增長及疫情後對醫學事業的興趣增加，需求持續上升。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**醫學院錄取**：校友獲香港大學、中文大學及海外醫學院（英國、澳洲、美國）錄取。",
                    "**研究事業**：畢業生於醫院管理局、衛生署及大學醫學院擔任研究人員。",
                    "**博士深造**：校友於約翰霍普金斯大學、牛津大學、劍橋大學及其他頂尖生物醫學機構攻讀博士。",
                    "**健康科技創業家**：校友創立創新醫療器械及數碼健康初創企業。",
                    "**教職員卓越**：科大学生物醫學教職員包括癌症生物學、神經科學、幹細胞研究及傳染病領域的領導者。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。頂尖成績者涵蓋全額或半額學費。",
                    "**理學院獎學金**：按科學科目學術卓越頒發的優異獎。",
                    "**醫療專業獎學金**：適用於展示從事醫療保健事業承諾的學生。",
                    "**研究資助**：生物醫學科學本科生研究項目資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大生物醫學及健康科學攻略",
                "content": [
                    "**分數目標**：最佳五科目標34分以上。生物及化學兩科均必須達5*級。",
                    "**獲得醫療保健經驗**：於醫院做義工、跟隨醫生見習或於診所工作。Genuine 接觸至關重要。",
                    "**保持優異科學成績**：生物及化學是此課程最重要的科目。",
                    "**考慮M1/M2**：數學延伸部分可加強對生物醫學研究有價值的分析能力。",
                    "**闡述你的動機**：準備解釋為何你想從事生物醫學或健康科學事業。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
