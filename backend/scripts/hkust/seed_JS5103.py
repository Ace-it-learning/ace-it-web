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

# JS5103 - Science (Group B) / 理學Ｂ組
programme = {
    "code": "JS5103",
    "nameEn": "Science (Group B)",
    "nameZh": "理學Ｂ組",
    "name": "Science (Group B)",
    "university": "香港科技大學",
    "faculty": "理學院",
    "median": 31,
    "band_a": 34,
    "category": "science"
}

details = {
    "code": "JS5103",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Strong demand from students interested in life sciences. Best 5 typically 31-34 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Biology and/or Chemistry at Level 4 or above strongly preferred. Two science electives ideal for life science focus.",
                    "**Interview**: Not typically required. Admission based primarily on HKDSE academic performance.",
                    "**Non-Academic Factors**: Biology or chemistry competition experience, science project work, and healthcare volunteering are beneficial."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Common foundation in Biology, Chemistry, Mathematics, and scientific methods.",
                    "**Year 2 - Major Selection**: Choose major from Biological Science, Biotechnology, Chemistry, or Environmental Science.",
                    "**Year 3 - Advanced Study**: Upper-division courses with extensive laboratory work in molecular biology, cell culture, and analytical chemistry.",
                    "**Year 4 - Capstone**: Research project, advanced electives, and industry internship or overseas exchange option.",
                    "**Available Majors**: Biological Science, Biotechnology, Chemistry, Environmental Science (select at end of Year 1).",
                    "**Laboratory Training**: Modern molecular biology, genomics, proteomics, and cell imaging facilities."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Biotechnology & Pharma**: Research and development roles at Pfizer, Roche, and local biotech companies.",
                    "**Environmental Sector**: Environmental consulting, conservation work with government departments and NGOs like WWF.",
                    "**Healthcare**: Medical laboratory positions in hospitals, clinical diagnostic centers, and healthcare institutions.",
                    "**Food & Agriculture**: Food safety, quality assurance, and agricultural technology roles.",
                    "**Postgraduate Studies**: Many graduates pursue MSc or PhD in life sciences at top universities worldwide.",
                    "**Education**: Science teachers specializing in biology and chemistry at secondary schools."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Life Science Facilities**: Dedicated laboratories for molecular biology, genomics, proteomics, and cell imaging.",
                    "**Marine Science Lab**: Access to HKUST Marine Science Laboratory and environmental research stations.",
                    "**Library & Resources**: Science library with comprehensive life sciences journal collections and study spaces.",
                    "**Science Commons**: Collaborative study areas for group projects, peer learning, and science society meetings.",
                    "**Industry Connections**: Proximity to Hong Kong Science Park facilitates internships and joint research with biotech companies."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Strong demand from life science and pre-med oriented students.",
                    "**Academic Requirements**: Best 5 around 31-34. Level 5 in Biology and Chemistry strengthens application significantly.",
                    "**Band A Competition**: Competitive among science students. Band A placement essential for admission.",
                    "**Interview Weighting**: Low. Academic-based admission for most applicants.",
                    "**What Differentiates Winners**: Strong life science grades plus science project or competition experience.",
                    "**Trend**: Growing demand due to biotechnology industry growth and increased interest in healthcare careers."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Biotech Industry**: Alumni as senior scientists at global pharmaceutical and biotech firms.",
                    "**Research Excellence**: Graduates accepted into PhD programs at Harvard, Johns Hopkins, and Imperial College.",
                    "**Entrepreneurs**: Alumni founders of health-tech and biotech ventures in Hong Kong and Asia.",
                    "**Conservation Leaders**: Alumni in environmental policy and conservation at WWF, Greenpeace, and government agencies.",
                    "**Faculty Recognition**: HKUST life science faculty includes leading researchers in stem cells, neuroscience, and marine biology."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong science grades.",
                    "**School of Science Scholarships**: Merit-based awards for academic excellence in science subjects.",
                    "**Research Internship Awards**: Funding for overseas laboratory placements at partner institutions.",
                    "**Exchange Support**: Student Exchange Support Scheme for semester abroad programs.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Science Group B Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 32+. Level 5 in Biology and Chemistry is highly recommended.",
                    "**Take Both Bio & Chem**: These electives build essential foundation for all life science majors.",
                    "**Explore Majors Early**: Research Biological Science, Biotechnology, Chemistry, and Environmental Science options.",
                    "**Consider BIBU**: If interested in business, check JS5811 (Biotechnology and Business) as an alternative.",
                    "**Get Lab Experience**: Volunteer in research labs or join science clubs to demonstrate practical interest."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。深受對生命科學感興趣的學生歡迎。最佳五科通常31-34分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：生物及/或化學達4級或以上強烈優先考慮。兩科科學選修科對生命科學專注理想。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：生物或化學競賽經驗、科學項目工作及醫療保健義工經驗有益。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：生物、化學、數學及科學方法的共同基礎。",
                    "**第二年 - 選擇主修**：從生物科學、生物科技、化學或環境科學選擇主修。",
                    "**第三年 - 高級研習**：高階課程，於分子生物學、細胞培養及分析化學進行廣泛實驗室工作。",
                    "**第四年 - 專題研習**：研究項目、高級選修科及產業實習或海外交流選項。",
                    "**可選主修**：生物科學、生物科技、化學、環境科學（第一年結束時選擇）。",
                    "**實驗室培訓**：現代分子生物學、基因組學、蛋白質組學及細胞成像設施。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**生物科技及製藥**：於輝瑞、羅氏及本地生物科技公司擔任研發職位。",
                    "**環境界別**：環境顧問、與政府部門及世界自然基金會等非政府組織的保育工作。",
                    "**醫療保健**：於醫院、臨床診斷中心及醫療機構擔任醫學實驗室職位。",
                    "**食品及農業**：食品安全、品質保證及農業技術職位。",
                    "**研究生課程**：許多畢業生於全球頂尖大學攻讀生命科學理學碩士或博士。",
                    "**教育**：於中學擔任生物及化學專科科學教師。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**生命科學設施**：專用分子生物學、基因組學、蛋白質組學及細胞成像實驗室。",
                    "**海洋科學實驗室**：可使用科大海洋科學實驗室及環境研究站。",
                    "**圖書館及資源**：科學圖書館藏有全面的生命科學期刊及自修空間。",
                    "**科學共享空間**：小組項目、同儕學習及科學學會會議的協作學習區域。",
                    "**產業聯繫**：鄰近香港科學園，便於與生物科技公司進行實習及聯合研究。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。深受生命科學及醫學預備導向學生歡迎。",
                    "**學術要求**：最佳五科約31-34分。生物及化學達5級可顯著加強申請。",
                    "**Band A競爭**：理科學生之間競爭激烈。Band A選擇對入學至關重要。",
                    "**面試比重**：低。大部分申請人以學術成績為基礎入學。",
                    "**成功申請者特質**：優異生命科學成績加上科學項目或競賽經驗。",
                    "**趨勢**：由於生物科技行業增長及醫療保健事業興趣增加，需求持續增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**生物科技業**：校友於全球製藥及生物科技公司擔任高級科學家。",
                    "**研究卓越**：畢業生獲哈佛大學、約翰霍普金斯大學及倫敦帝國學院博士課程錄取。",
                    "**創業家**：校友於香港及亞洲創立健康科技及生物技術企業。",
                    "**保育領袖**：校友於世界自然基金會、綠色和平及政府機構從事環境政策及保育工作。",
                    "**教職員認可**：科大生命科學部教職員包括幹細胞、神經科學及海洋生物學領先研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且科學成績優異的學生。",
                    "**理學院獎學金**：按科學科目學術卓越頒發的優異獎。",
                    "**研究實習獎**：為夥伴機構海外實驗室實習提供資助。",
                    "**交流支援**：學生交流支援計劃支持海外學期項目。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大理學Ｂ組攻略",
                "content": [
                    "**分數目標**：最佳五科目標32分以上。生物及化學達5級強烈建議。",
                    "**同時修讀生物及化學**：這些選修科為所有生命科學主修建立必要基礎。",
                    "**及早探索主修**：研究生物科學、生物科技、化學及環境科學選項。",
                    "**考慮生物科技及商學**：如對商業感興趣，可了解JS5811（生物科技及商學）作為替代選擇。",
                    "**獲得實驗室經驗**：於研究實驗室做義工或加入科學學會以展示實踐興趣。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
