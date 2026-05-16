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

# JS5101 - International Research Enrichment / 國際科研
programme = {
    "code": "JS5101",
    "nameEn": "International Research Enrichment",
    "nameZh": "國際科研",
    "name": "International Research Enrichment",
    "university": "香港科技大學",
    "faculty": "理學院",
    "median": 37,
    "band_a": 40,
    "category": "science"
}

details = {
    "code": "JS5101",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: EXTREMELY COMPETITIVE. One of the most competitive programmes at HKUST with very limited intake. Best 5 typically 37-40 points (5**=7, 5*=6, 5=5).",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: At least one science subject (Biology, Chemistry, or Physics) at Level 5 or above is essential. Two science electives strongly preferred.",
                    "**Interview**: Required. Assesses research aptitude, scientific thinking, motivation for research career, and communication skills.",
                    "**Non-Academic Factors**: Science competition awards, research project experience, science fair participation, and demonstrated passion for scientific discovery are highly valued."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Core science courses in Mathematics, Physics, Chemistry, and Biology plus research methodology and scientific communication.",
                    "**Year 2 - Specialization**: Begin focused study in chosen science discipline with laboratory rotations in different research labs.",
                    "**Year 3 - Research Immersion**: Full-time research placement under faculty mentorship. Opportunity for overseas research exchange at partner universities.",
                    "**Year 4 - Advanced Research**: Independent research project with potential for conference presentations and journal publications. Thesis submission required.",
                    "**International Exchange**: Guaranteed exchange opportunities with UC Berkeley, Imperial College London, ETH Zurich, and other top research universities.",
                    "**PhD Fast Track**: Eligible students can apply for early admission to HKUST PhD programmes with scholarship support."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**PhD & Research**: Majority of graduates pursue PhD programmes at MIT, Stanford, Cambridge, Oxford, and other top institutions with full scholarships.",
                    "**Research Scientist**: Positions at CERN, NIH, Max Planck Institutes, and other world-renowned research institutions.",
                    "**Biotech & Pharma**: Research roles at Roche, Pfizer, and emerging biotech startups in Hong Kong and globally.",
                    "**Data Science & AI**: Quantitative research positions at tech companies and financial institutions leveraging strong analytical training.",
                    "**Academia**: University professors and researchers at leading science and engineering faculties worldwide.",
                    "**Deep Tech Entrepreneurship**: Alumni have founded successful startups in biotech, AI, and advanced materials."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Research Facilities**: Access to HKUST Jockey Club Institute for Advanced Study, electron microscopes, NMR spectrometers, and high-performance computing clusters.",
                    "**Laboratories**: Specialized research labs in nanotechnology, quantum science, biotechnology, and environmental science.",
                    "**Housing**: On-campus accommodation guaranteed for IRE students in their first two years.",
                    "**Science Park Proximity**: Close to Hong Kong Science Park for industry collaboration, internships, and joint research projects.",
                    "**Student Community**: Small cohort size fosters close relationships with peers and faculty mentors. Active science student societies and research interest groups."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Extremely High (★★★★★). The most competitive science programme at HKUST.",
                    "**Academic Requirements**: Best 5 around 37-40. Level 5** in core subjects and science electives typically required.",
                    "**Band A Competition**: Only top 1-2% of JUPAS applicants admitted each year. Very limited places.",
                    "**Interview Weighting**: High. Technical questions on science concepts and research methodology expected.",
                    "**What Differentiates Winners**: Exceptional academics plus genuine research passion demonstrated through competitions, projects, or publications.",
                    "**Trend**: Consistently high demand due to guaranteed research opportunities and fast-track PhD pathway."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**PhD Placements**: Alumni admitted to MIT, Stanford, Caltech, Cambridge, and Oxford with full scholarships.",
                    "**Research Awards**: Multiple recipients of Hong Kong PhD Fellowship and Croucher Scholarships.",
                    "**Industry Leaders**: Graduates at CERN, NIH, and Max Planck Institutes as research scientists.",
                    "**Entrepreneurs**: Alumni founders of biotech and deep-tech startups in Hong Kong and Silicon Valley.",
                    "**Faculty Mentors**: World-renowned scientists including Nobel laureate collaborators and top-cited researchers in their fields."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**IRE Scholarship**: Full tuition plus living allowance for outstanding students. Most prestigious scholarship at HKUST School of Science.",
                    "**Admission Scholarships**: For exceptional HKDSE results (5** in multiple subjects). Covers full or half tuition.",
                    "**Research Internship Support**: Funding for overseas research internships at partner universities worldwide.",
                    "**Conference Travel Grants**: Support for presenting research at international conferences.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST IRE Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 38+. Level 5** in Mathematics and at least one science subject is essential.",
                    "**Build Research Profile**: Participate in science olympiads, science fairs, or independent research projects. Document everything.",
                    "**Prepare for Technical Interview**: Review core science concepts and be ready to discuss research interests and methodology.",
                    "**Get Strong References**: Science teachers who know your research potential can write powerful recommendation letters.",
                    "**Read Research Papers**: Familiarize yourself with recent advances in your field of interest. Shows genuine research commitment."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：極度競爭。科大最競爭的課程之一，收生名額非常有限。最佳五科通常37-40分（5**=7分，5*=6分，5=5分）。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：至少一科科學科目（生物、化學或物理）達5級或以上。兩科科學選修科強烈建議。",
                    "**面試**：必須。評估研究潛能、科學思維、研究事業動機及溝通技巧。",
                    "**非學術因素**：科學競賽獎項、研究項目經驗、科學展覽參與及對科學發現的熱誠極受重視。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：數學、物理、化學及生物核心科學課程，加上研究方法及科學傳播。",
                    "**第二年 - 專修**：開始專注於選定科學學科，於不同研究實驗室進行輪轉。",
                    "**第三年 - 研究沉浸**：全職研究實習，由教授指導。有機會於夥伴大學進行海外研究交流。",
                    "**第四年 - 高級研究**：獨立研究項目，有機會於學術會議發表及期刊出版。須提交論文。",
                    "**國際交流**：保證與加州大學伯克利分校、倫敦帝國學院、蘇黎世聯邦理工學院等頂尖研究型大學的交流機會。",
                    "**博士快捷通道**：合資格學生可申請科大博士課程提前錄取及獎學金支持。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**博士及研究**：大部分畢業生入讀麻省理工學院、史丹福大學、劍橋大學、牛津大學等頂尖院校博士課程，獲全額獎學金。",
                    "**研究科學家**：於歐洲核子研究中心、美國國立衛生研究院、馬普研究所等世界知名研究機構擔任職位。",
                    "**生物科技及製藥**：於羅氏、輝瑞及香港與全球新興生物技術初創企業擔任研究職位。",
                    "**數據科學及人工智能**：利用強大分析培訓於科技公司及金融機構擔任量化研究職位。",
                    "**學術界**：於全球領先科學及工程學院擔任大學教授及研究人員。",
                    "**深科技創業**：校友創立成功的生物技術、人工智能及先進材料初創企業。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**研究設施**：可使用科大賽馬會高等研究院、電子顯微鏡、核磁共振光譜儀及高性能計算集群。",
                    "**實驗室**：納米技術、量子科學、生物技術及環境科學專門研究實驗室。",
                    "**住宿**：所有國際科研學生首兩年保證入住校園宿舍。",
                    "**科學園鄰近**：鄰近香港科學園，便於進行產業合作、實習及聯合研究項目。",
                    "**學生社群**：小班規模促進與同儕及教授導師的緊密關係。活躍的科學學生學會及研究興趣小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。科大最競爭的理學課程。",
                    "**學術要求**：最佳五科約37-40分。核心科目及科學選修科通常需達5**級。",
                    "**Band A競爭**：每年僅錄取聯招申請人中最頂尖的1-2%。名額非常有限。",
                    "**面試比重**：高。預期會有關於科學概念及研究方法的技術性問題。",
                    "**成功申請者特質**：卓越學術成績加上透過競賽、項目或出版物展示的 genuine 研究熱誠。",
                    "**趨勢**：由於保證研究機會及博士快捷通道，需求持續高企。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**博士錄取**：校友獲麻省理工學院、史丹福大學、加州理工學院、劍橋大學及牛津大學全額獎學金錄取。",
                    "**研究獎項**：多位香港博士研究生獎學金計劃及裘槎獎學金得主。",
                    "**業界領袖**：畢業生於歐洲核子研究中心、美國國立衛生研究院及馬普研究所擔任研究科學家。",
                    "**創業家**：校友於香港及矽谷創立成功的生物技術及深科技初創企業。",
                    "**教授導師**：世界知名科學家，包括諾貝爾獎得主合作者及各自領域高被引研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**國際科研獎學金**：為優秀學生提供全額學費及生活津貼。科大理學院最負盛名的獎學金。",
                    "**入學獎學金**：適用於香港中學文憑考試成績卓越的學生（多科達5**級）。涵蓋全額或半額學費。",
                    "**研究實習支援**：為全球夥伴大學海外研究實習提供資助。",
                    "**會議旅費資助**：支持於國際會議發表研究。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大國際科研攻略",
                "content": [
                    "**分數目標**：最佳五科目標38分以上。數學及至少一科科學科目必須達5**級。",
                    "**建立研究履歷**：參加科學奧林匹克、科學展覽或獨立研究項目。記錄所有經歷。",
                    "**準備技術面試**：複習核心科學概念，準備討論研究興趣及方法。",
                    "**獲得強力推薦**：了解你研究潛能的科學教師可撰寫有力的推薦信。",
                    "**閱讀研究論文**：熟悉感興趣領域的最新進展。展示 genuine 的研究承諾。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
