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

# JS5315 - BBA in Management / 工商管理學士（管理學）
programme = {
    "code": "JS5315",
    "nameEn": "BBA in Management",
    "nameZh": "工商管理學士（管理學）",
    "name": "BBA in Management",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 30,
    "band_a": 33,
    "category": "business"
}

details = {
    "code": "JS5315",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Best 5 typically 30-33 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is recommended. Any business-related elective is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Leadership experience, team activities, organizational skills, and community involvement strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Organizational behavior, business communication, accounting, economics, and management principles.",
                    "**Year 2 - Core Management**: Human resource management, strategic management, operations management, and leadership development.",
                    "**Year 3 - Advanced Topics**: Entrepreneurship, innovation management, international management, and organizational design.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in entrepreneurship, HR, or general management. Complete consulting project.",
                    "**Available Tracks**: Entrepreneurship, Human Resource Management, General Management (select in Year 3).",
                    "**Practical Experience**: Case studies, leadership workshops, company visits, and mandatory internship."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Management Consulting**: Strategy and operations consulting at McKinsey, BCG, Bain, and local consultancies.",
                    "**Corporate Management**: Management trainee programmes and leadership development tracks at multinational corporations.",
                    "**Human Resources**: HR business partner, talent acquisition, and organizational development at major employers.",
                    "**Entrepreneurship**: Startup founder or early employee at high-growth ventures.",
                    "**Technology**: Product operations, business operations, and program management at tech companies.",
                    "**Non-Profit & Social Enterprise**: Operations and strategy roles at NGOs and social enterprises."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Leadership Labs**: Dedicated spaces for team exercises, leadership simulations, and group projects.",
                    "**Research Centers**: HKUST Center for Entrepreneurship and Center for Leadership and Management.",
                    "**Industry Mentorship**: Executive mentorship programme pairing students with senior business leaders.",
                    "**Entrepreneurship Support**: Incubator access, startup competitions, and seed funding for student ventures.",
                    "**Student Community**: Active Management Society, entrepreneurship clubs, and leadership development groups."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Strong demand for versatile management graduates.",
                    "**Academic Requirements**: Best 5 around 30-33. Well-rounded academic profile expected.",
                    "**Band A Competition**: Competitive. Band A placement recommended.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong academics combined with demonstrated leadership and organizational skills.",
                    "**Trend**: Steady demand due to versatile career options and leadership development focus."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Corporate Leaders**: Alumni in general management and C-suite positions at major corporations.",
                    "**Entrepreneurs**: Founders of successful startups across technology, retail, and service industries.",
                    "**Consultants**: Management consultants at top-tier firms advising on strategy and operations.",
                    "**HR Executives**: Alumni leading talent and organizational development at Fortune 500 companies.",
                    "**Faculty Excellence**: HKUST management faculty includes experts in leadership, entrepreneurship, and organizational behavior."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong academic records.",
                    "**Management Excellence Awards**: Merit-based scholarships for leadership potential.",
                    "**Entrepreneurship Grants**: Funding for student startup ventures.",
                    "**Industry-Sponsored Scholarships**: From corporations supporting management talent.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Management Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 31+. Well-rounded academic performance across subjects.",
                    "**Develop Leadership**: Take on leadership roles in clubs, teams, or community projects.",
                    "**Build Team Skills**: Management is about people. Show you can work effectively in teams.",
                    "**Explore Entrepreneurship**: Participate in startup competitions or business plan contests.",
                    "**Stay Curious**: Read widely about business, psychology, and organizational behavior."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。最佳五科通常30-33分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上建議。任何商業相關選修科有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：領導經驗、團隊活動、組織技巧及社區參與可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：組織行為、商業傳播、會計、經濟及管理原理。",
                    "**第二年 - 管理學核心**：人力資源管理、策略管理、營運管理及領導才能發展。",
                    "**第三年 - 高級課題**：創業、創新管理、國際管理及組織設計。",
                    "**第四年 - 專修及專題**：選擇創業、人力資源或一般管理專修。完成顧問項目。",
                    "**可選方向**：創業、人力資源管理、一般管理（第三年選擇）。",
                    "**實踐經驗**：案例研究、領導才能工作坊、公司考察及必修實習。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**管理顧問**：於麥肯錫、波士頓諮詢、貝恩及本地顧問公司從事策略及營運顧問。",
                    "**企業管理**：跨國企業的管理培訓生計劃及領導才能發展軌道。",
                    "**人力資源**：於主要僱主擔任人力資源業務夥伴、人才招聘及組織發展。",
                    "**創業**：高增長企業的初創創辦人或早期員工。",
                    "**科技界**：於科技公司擔任產品營運、商業營運及項目管理。",
                    "**非牟利及社會企業**：於非政府組織及社會企業擔任營運及策略職位。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**領導才能實驗室**：專門供團隊練習、領導模擬及小組項目的空間。",
                    "**研究中心**：科大創業中心及領導與管理中心。",
                    "**產業指導**：將學生與高級商業領袖配對的行政指導計劃。",
                    "**創業支援**：孵化器使用權、初創競賽及學生企業種子資金。",
                    "**學生社群**：活躍的管理學會、創業學會及領導才能發展小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。對多才多藝的管理畢業生需求強勁。",
                    "**學術要求**：最佳五科約30-33分。預期全面發展的學術背景。",
                    "**Band A競爭**：競爭激烈。建議Band A選擇。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異學術成績結合展示的領導才能及組織技巧。",
                    "**趨勢**：由於多樣化職業選擇及領導才能發展專注，需求穩定。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**企業領袖**：校友於主要企業擔任一般管理及行政總裁職位。",
                    "**創業家**：科技、零售及服務行業成功初創企業的創辦人。",
                    "**顧問**：頂尖顧問公司就策略及營運提供建議的管理顧問。",
                    "**人力資源高管**：校友於財富500強公司領導人才及組織發展。",
                    "**教職員卓越**：科大管理學教職員包括領導才能、創業及組織行為專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**管理卓越獎**：按領導潛能頒發的優異獎學金。",
                    "**創業資助**：學生初創企業資金。",
                    "**業界贊助獎學金**：企業支持管理人才的獎學金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大管理學攻略",
                "content": [
                    "**分數目標**：最佳五科目標31分以上。各科目全面發展的學術表現。",
                    "**培養領導才能**：於學會、隊伍或社區項目擔任領導角色。",
                    "**建立團隊技巧**：管理關乎人。展示你能有效於團隊中工作。",
                    "**探索創業**：參與初創競賽或商業計劃比賽。",
                    "**保持好奇**：廣泛閱讀商業、心理學及組織行為。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
