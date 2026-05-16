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

# JS5313 - BBA in Global Business / 工商管理學士（環球商業管理）
programme = {
    "code": "JS5313",
    "nameEn": "BBA in Global Business",
    "nameZh": "工商管理學士（環球商業管理）",
    "name": "BBA in Global Business",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 35,
    "band_a": 38,
    "category": "business"
}

details = {
    "code": "JS5313",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: EXTREMELY COMPETITIVE. One of HKUST's flagship programmes. Best 5 typically 35-38 points.",
                    "**Core Subjects**: English (Level 5 or above is highly preferred), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is highly recommended. Any additional language is beneficial.",
                    "**Interview**: May be required. Assesses global awareness, leadership potential, communication skills, and motivation.",
                    "**Non-Academic Factors**: International exposure, leadership roles, community service, business competition experience, and extracurricular excellence are highly valued."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Business fundamentals, economics, accounting, and global business environment.",
                    "**Year 2 - Core GB**: International business strategy, cross-cultural management, global marketing, and corporate finance.",
                    "**Year 3 - Global Immersion**: Mandatory semester abroad at partner business schools (Wharton, LSE, Bocconi, etc.).",
                    "**Year 4 - Capstone & Specialization**: Global consulting project, strategic management, and specialization in chosen region or function.",
                    "**Language Requirement**: Third language proficiency encouraged (Mandarin, Japanese, Spanish, etc.).",
                    "**Small Cohort**: Intimate class size (~50 students) ensuring personalized attention and strong peer network."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Management Consulting**: Top-tier consulting firms (McKinsey, BCG, Bain) highly recruit GB graduates for global projects.",
                    "**Investment Banking**: Front-office positions at global investment banks leveraging international perspective.",
                    "**Multinational Corporations**: Management trainee programmes at Fortune 500 companies with global rotation.",
                    "**Global Marketing**: Brand management and market expansion roles at consumer goods and luxury brands.",
                    "**Entrepreneurship**: Founders of cross-border startups and international business ventures.",
                    "**International Organizations**: Roles at UN, World Bank, and multinational NGOs."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Global Network**: Access to HKUST's extensive partner university network across 6 continents.",
                    "**Cultural Diversity**: Cohort includes local and international students creating a multicultural learning environment.",
                    "**Executive Mentorship**: One-on-one mentorship from C-suite executives and global business leaders.",
                    "**Leadership Development**: Dedicated leadership training, outdoor expeditions, and team-building programs.",
                    "**Student Community**: Tight-knit GB Society with exclusive networking events, alumni gatherings, and international trips."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Extremely High (★★★★★). HKUST's most prestigious undergraduate business programme.",
                    "**Academic Requirements**: Best 5 around 35-38. Level 5* in multiple subjects typically required.",
                    "**Band A Competition**: Fierce competition. Only top applicants admitted.",
                    "**Interview Weighting**: High. Interview performance can be decisive for borderline candidates.",
                    "**What Differentiates Winners**: Exceptional academics combined with global mindset, leadership, and well-rounded profile.",
                    "**Trend**: Consistently the most selective business programme with highest graduate starting salaries."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Global Leaders**: Alumni in senior management at multinational corporations across Asia, Europe, and Americas.",
                    "**Consulting Partners**: Graduates who made partner at McKinsey, BCG, and Bain within record time.",
                    "**Finance Executives**: Alumni in leadership roles at Goldman Sachs, JP Morgan, and private equity firms.",
                    "**Entrepreneurs**: Founders of successful cross-border e-commerce, fintech, and service companies.",
                    "**Faculty Excellence**: HKUST GB faculty includes professors with experience at Harvard, Wharton, and INSEAD."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: Full and half tuition scholarships for top DSE performers.",
                    "**Global Business Scholarship**: Prestigious award specifically for GB students with exceptional potential.",
                    "**Exchange Support**: Additional funding for semester abroad living expenses.",
                    "**Leadership Awards**: For students demonstrating outstanding leadership and community impact.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Global Business Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 36+. Excellence across all subjects is expected.",
                    "**Develop Global Mindset**: Show interest in international affairs, different cultures, and global business trends.",
                    "**Build Leadership Record**: Take on significant leadership roles in school, clubs, or community organizations.",
                    "**Prepare for Interview**: Practice discussing global issues, your leadership experiences, and career aspirations.",
                    "**Learn a Third Language**: Mandarin, Japanese, or Spanish significantly strengthens your global profile."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：極度競爭。科大的旗艦課程之一。最佳五科通常35-38分。",
                    "**核心科目**：英文（達5級或以上高度優先考慮）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上高度建議。任何額外語言有益。",
                    "**面試**：可能需要。評估全球視野、領導潛能、溝通技巧及動機。",
                    "**非學術因素**：國際 exposure、領導角色、社區服務、商業競賽經驗及課外卓越表現極受重視。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：商業基礎、經濟、會計及全球商業環境。",
                    "**第二年 - 環球商業核心**：國際商業策略、跨文化管理、全球市場學及公司金融。",
                    "**第三年 - 全球沉浸**：必須於夥伴商學院（沃頓、倫敦政經、博科尼等）進行海外學期。",
                    "**第四年 - 專題及專修**：全球顧問項目、策略管理及選定地區或職能專修。",
                    "**語言要求**：鼓勵第三語言能力（普通話、日語、西班牙語等）。",
                    "**小班教學**：親密班級規模（約50名學生）確保個人化關注及強大同儕網絡。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**管理顧問**：頂尖顧問公司（麥肯錫、波士頓諮詢、貝恩）高度招聘環球商業畢業生從事全球項目。",
                    "**投資銀行**：利用國際視野於全球投資銀行擔任前台職位。",
                    "**跨國企業**：財富500強公司的管理培訓生計劃，具全球輪調。",
                    "**全球市場學**：於消費品及奢侈品牌擔任品牌管理及市場擴展職位。",
                    "**創業**：創立跨境初創企業及國際商業企業。",
                    "**國際組織**：於聯合國、世界銀行及跨國非政府組織擔任職位。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**全球網絡**：可使用科大遍佈6大洲的廣泛夥伴大學網絡。",
                    "**文化多樣性**：班級包括本地及國際學生，創造多元文化學習環境。",
                    "**高管指導**：與行政總裁及全球商業領袖的一對一指導。",
                    "**領導才能發展**：專門領導培訓、戶外遠征及團隊建設項目。",
                    "**學生社群**：緊密的環球商業學會，舉辦獨家交流活動、校友聚會及國際旅行。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。科大最負盛名的本科商學課程。",
                    "**學術要求**：最佳五科約35-38分。多科通常需達5*級。",
                    "**Band A競爭**：激烈競爭。僅錄取頂尖申請人。",
                    "**面試比重**：高。面試表現對邊緣候選人可能具決定性。",
                    "**成功申請者特質**：卓越學術成績結合全球思維、領導才能及全面發展的履歷。",
                    "**趨勢**：持續為最選擇性的商學課程，畢業生起薪最高。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**全球領袖**：校友於亞洲、歐洲及美洲跨國企業擔任高級管理職位。",
                    "**顧問合夥人**：畢業生創紀錄時間內晉升為麥肯錫、波士頓諮詢及貝恩合夥人。",
                    "**金融高管**：校友於高盛、摩根大通及私募股權公司擔任領導職位。",
                    "**創業家**：創立成功的跨境電子商務、金融科技及服務公司。",
                    "**教職員卓越**：科大環球商業教職員包括具備哈佛、沃頓及歐洲工商管理學院經驗的教授。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：為頂尖香港中學文憑考試成績者提供全額及半額學費獎學金。",
                    "**環球商業獎學金**：專為具卓越潛能的環球商業學生而設的負盛名獎項。",
                    "**交流支援**：海外學期生活費的額外資助。",
                    "**領導才能獎項**：授予展示傑出領導才能及社區影響力的學生。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大環球商業管理攻略",
                "content": [
                    "**分數目標**：最佳五科目標36分以上。所有科目卓越表現為預期。",
                    "**培養全球思維**：展示對國際事務、不同文化及全球商業趨勢的興趣。",
                    "**建立領導記錄**：於學校、學會或社區組織擔任重要領導角色。",
                    "**準備面試**：練習討論全球議題、你的領導經驗及職業抱負。",
                    "**學習第三語言**：普通話、日語或西班牙語可顯著加強你的全球背景。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
