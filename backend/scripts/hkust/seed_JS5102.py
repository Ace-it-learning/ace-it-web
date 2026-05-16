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

# JS5102 - Science (Group A) / 理學Ａ組
programme = {
    "code": "JS5102",
    "nameEn": "Science (Group A)",
    "nameZh": "理學Ａ組",
    "name": "Science (Group A)",
    "university": "香港科技大學",
    "faculty": "理學院",
    "median": 32,
    "band_a": 35,
    "category": "science"
}

details = {
    "code": "JS5102",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Popular programme with strong demand from science students. Best 5 typically 32-35 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: At least one science subject (Physics, Chemistry, or Biology) at Level 4 or above. Two science electives preferred.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Science competition participation, science club involvement, and demonstrated interest in physical sciences are beneficial."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Common science foundation courses in Mathematics, Physics, Chemistry, and introductory programming.",
                    "**Year 2 - Major Selection**: Choose major from Chemistry, Mathematics, Physics, or Environmental Science. Begin specialized coursework.",
                    "**Year 3 - Advanced Study**: Upper-division courses in chosen major. Option to begin UROP research project.",
                    "**Year 4 - Capstone**: Final year project, advanced electives, and preparation for graduate studies or employment.",
                    "**Available Majors**: Chemistry, Mathematics, Physics, Environmental Science (choose one at end of Year 1).",
                    "**Flexibility**: Students can take courses across disciplines and even from Engineering or Business schools."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Education**: Science teachers in secondary schools and lecturers at tertiary institutions. Strong demand for physics and chemistry teachers.",
                    "**Government & Public Sector**: Research roles at Environmental Protection Department, Hong Kong Observatory, and other government agencies.",
                    "**Finance & Consulting**: Data analytics, quantitative analysis, and risk modeling positions at banks and consulting firms.",
                    "**Technology Sector**: Software development, AI/ML engineering, and semiconductor industry roles leveraging strong mathematical foundation.",
                    "**Postgraduate Studies**: Many graduates pursue MSc, MPhil, or PhD at HKUST or overseas universities (MIT, Imperial, ETH Zurich).",
                    "**Research & Development**: R&D positions in materials science, environmental technology, and applied physics companies."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Science Facilities**: Dedicated laboratories for Physics, Chemistry, and Mathematics with advanced instrumentation and computing resources.",
                    "**Library**: HKUST Library with extensive science journal collections, study spaces, and 24-hour access during exam periods.",
                    "**Science Commons**: Collaborative spaces for group projects, peer tutoring, and science society activities.",
                    "**Housing**: On-campus accommodation available with priority for non-local and first-year students.",
                    "**Student Life**: Active science student societies, sports teams, and interest groups. Regular academic seminars and industry talks."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Popular programme with consistent strong demand.",
                    "**Academic Requirements**: Best 5 around 32-35. Level 5 in Mathematics and science subjects expected.",
                    "**Band A Competition**: Strong competition among science students. Band A placement significantly improves chances.",
                    "**Interview Weighting**: Low. Purely academic-based admission for most applicants.",
                    "**What Differentiates Winners**: Strong science grades plus Mathematics Extended Part (M1/M2) performance.",
                    "**Trend**: Steady demand due to flexible curriculum and strong graduate outcomes across multiple industries."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Tech Industry**: Alumni at Google, Microsoft, Apple, and Huawei in technical and research roles.",
                    "**Education Leaders**: Graduates serving as principals and award-winning teachers at top Hong Kong schools.",
                    "**Research Excellence**: Alumni pursuing doctoral studies at Ivy League and top European universities.",
                    "**Finance Sector**: Graduates in quantitative trading, risk management, and data science at major banks.",
                    "**Faculty Recognition**: HKUST science faculty includes Fellows of major scientific academies and highly cited researchers."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE results (multiple 5* or 5**). Full or half tuition coverage.",
                    "**School of Science Scholarships**: Merit-based awards for academic excellence and research potential.",
                    "**Reaching Out Award**: For students demonstrating leadership, community service, and extracurricular achievement.",
                    "**Exchange Support**: Funding for semester abroad at partner universities worldwide.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Science Group A Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 33+. Level 5 in Mathematics and at least one science subject is important.",
                    "**Take M1/M2**: Mathematics Extended Part strengthens your application and prepares you for quantitative majors.",
                    "**Explore Majors Early**: Research Chemistry, Mathematics, Physics, and Environmental Science before committing.",
                    "**Consider AI Option**: If interested in AI, check JS5181 (Science Group A with Extended Major in AI).",
                    "**Join Science Competitions**: Physics Olympiad, Chemistry Olympiad, or Mathematics competitions boost your profile."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。深受理科學生歡迎的課程。最佳五科通常32-35分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：至少一科科學科目（物理、化學或生物）達4級或以上。兩科科學選修科優先考慮。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：科學競賽參與、科學學會 involvement 及對物理科學的興趣有益。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：數學、物理、化學及編程入門共同科學基礎課程。",
                    "**第二年 - 選擇主修**：從化學、數學、物理或環境科學選擇主修。開始專門課程。",
                    "**第三年 - 高級研習**：選定主修的高階課程。可選擇開始本科生研究機會計劃（UROP）研究項目。",
                    "**第四年 - 專題研習**：畢業專題項目、高級選修科及為研究生學習或就業作準備。",
                    "**可選主修**：化學、數學、物理、環境科學（第一年結束時選擇一項）。",
                    "**靈活性**：學生可跨學科修讀課程，甚至可修讀工程學院或商學院的課程。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**教育**：於中學擔任科學教師及於高等院校擔任講師。物理及化學教師需求殷切。",
                    "**政府及公共部門**：於環境保護署、香港天文台及其他政府機構擔任研究職位。",
                    "**金融及顧問**：於銀行及顧問公司擔任數據分析、量化分析及風險建模職位。",
                    "**科技界**：利用強大數學基礎從事軟件開發、人工智能/機器學習工程及半導體行業。",
                    "**研究生課程**：許多畢業生於科大或海外大學（麻省理工學院、倫敦帝國學院、蘇黎世聯邦理工學院）攻讀理學碩士、哲學碩士或博士。",
                    "**研究及發展**：於材料科學、環境技術及應用物理公司擔任研發職位。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**科學設施**：專用物理、化學及數學實驗室，配備先進儀器及計算資源。",
                    "**圖書館**：科大圖書館藏有大量科學期刊、自修空間，考試期間24小時開放。",
                    "**科學共享空間**：小組項目、同儕輔導及科學學會活動的協作空間。",
                    "**住宿**：提供校園住宿，非本地學生及一年級學生獲優先考慮。",
                    "**學生生活**：活躍的科學學生學會、運動隊及興趣小組。定期學術研討會及業界講座。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。深受歡迎的課程，需求持續強勁。",
                    "**學術要求**：最佳五科約32-35分。數學及科學科目預期達5級。",
                    "**Band A競爭**：理科學生之間競爭激烈。Band A選擇可顯著提升機會。",
                    "**面試比重**：低。大部分申請人純粹以學術成績為基礎入學。",
                    "**成功申請者特質**：優異科學成績加上數學延伸部分（M1/M2）表現。",
                    "**趨勢**：由於課程靈活及畢業生於多個行業的強勁出路，需求穩定。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**科技業**：校友於Google、微軟、蘋果及華為擔任技術及研究職位。",
                    "**教育領袖**：畢業生於香港頂尖學校擔任校長及獲獎教師。",
                    "**研究卓越**：校友於常春藤盟校及頂尖歐洲大學攻讀博士課程。",
                    "**金融業**：畢業生於主要銀行擔任量化交易、風險管理及數據科學職位。",
                    "**教職員認可**：科大理學院教職員包括主要科學學院院士及高被引研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生（多科達5*或5**級）。涵蓋全額或半額學費。",
                    "**理學院獎學金**：按學術卓越及研究潛能頒發的優異獎。",
                    "**展才獎**：授予展現領導才能、社區服務及課外成就的學生。",
                    "**交流支援**：為全球夥伴大學海外學期提供資助。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大理學Ａ組攻略",
                "content": [
                    "**分數目標**：最佳五科目標33分以上。數學及至少一科科學科目達5級很重要。",
                    "**修讀M1/M2**：數學延伸部分可加強申請並為量化主修作好準備。",
                    "**及早探索主修**：選擇前研究化學、數學、物理及環境科學。",
                    "**考慮人工智能選項**：如對人工智能感興趣，可了解JS5181（理學Ａ組–人工智能延伸主修）。",
                    "**參加科學競賽**：物理奧林匹克、化學奧林匹克或數學競賽可提升你的背景。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
