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

# JS1005 - BBA Management / 工商管理學士(管理學)
# Data sources:
# - JUPAS 2025 Admissions Scores PDF (af_2025_JUPAS.pdf): Median 22, Lower Quartile 21.5
# - JUPAS Website: Entry requirements, application/offer statistics
# - JUPAS Programme List: Streams (Human Resources Management / Strategy and International Management)
# - CityU Department of Management: Programme description

programme = {
    "code": "JS1005",
    "nameEn": "BBA Management",
    "nameZh": "工商管理學士(管理學)",
    "name": "BBA Management",
    "university": "香港城市大學",
    "faculty": "商學院",
    "median": 22,
    "band_a": 21.5,
    "category": "business"
}

details = {
    "code": "JS1005",
    "university": "香港城市大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Admission Score Formula**: Best 5 subjects (include Mathematics). All subjects weighted ×1.",
                    "**Median Admission Score**: 22 (2025 JUPAS data).",
                    "**Lower Quartile**: 21.5 (2025 JUPAS data).",
                    "**Core Subjects Minimum Level**: Chinese Language 3, English Language 3, Mathematics (Compulsory Part) 3, Citizenship and Social Development Attained.",
                    "**Elective Subjects**: ANY 2 SUBJECTS at Level 3. M1/M2 can be used to meet elective requirement (counted as one subject only if both taken). Applied Learning (ApL) subjects are NOT counted as elective subjects.",
                    "**Interview**: On a selective basis. When applicants have the same scores, Band Choices and Interview Performance are the most critical factors for the College of Business admission decision.",
                    "**2025 Application Statistics**: Band A 705 applicants, Total 5,346 applicants, 45 offers made.",
                    "**First Year Tuition**: HK$47,000."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Programme Overview**: The BBA Management programme equips students with the abilities and skills to successfully manage people and teams within an organisation and manage the organisation itself, in both local and international environments.",
                    "**Two Streams**: (1) Human Resources Management Stream — focuses on talent acquisition, employee development, and organisational behaviour; (2) Strategy and International Management Stream — focuses on strategic planning, international business operations, and cross-cultural management.",
                    "**Year 1 - Foundation**: Organisational behaviour, business communication, accounting, economics, and management principles.",
                    "**Year 2 - Core Management**: Human resource management, strategic management, operations management, and leadership.",
                    "**Year 3 - Advanced Topics**: Entrepreneurship, innovation management, international management, and organisational design.",
                    "**Year 4 - Specialisation & Capstone**: Choose stream in Human Resources Management or Strategy and International Management. Complete capstone project.",
                    "**Joint Bachelor's Degree Program with Columbia University**: Outstanding Year 1 students may apply to spend Years 3 and 4 at Columbia University (majoring in Psychology or Economics), graduating with dual bachelor's degrees from both CityUHK and Columbia University.",
                    "**Duration**: 4 years full-time."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Management Consulting**: Strategy and operations consulting at major firms.",
                    "**Corporate Management**: Management trainee programmes at multinational corporations.",
                    "**Human Resources**: HR business partner and talent acquisition at major employers.",
                    "**Entrepreneurship**: Startup founder or early employee at ventures.",
                    "**Technology**: Business operations and program management at tech companies.",
                    "**International Business**: Cross-border management roles in firms with global operations."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Leadership Development**: Spaces for team exercises and leadership simulations.",
                    "**Industry Mentorship**: Executive mentorship from senior business leaders.",
                    "**Student Community**: Active Management Society and entrepreneurship clubs.",
                    "**Global Exposure**: Opportunities for exchange and international study tours."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate (★★★☆☆). Accessible entry scores with steady demand.",
                    "**Academic Requirements**: Median 22, Lower Quartile 21.5. Well-rounded profile expected.",
                    "**Band A Competition**: 705 Band A applicants for 45 places in 2025 — approximately 16:1 ratio.",
                    "**Interview**: Selective basis. Band Choices and Interview Performance are critical when scores are tied.",
                    "**What Differentiates Winners**: Strong academics plus demonstrated leadership and communication skills.",
                    "**Trend**: Stable demand for management graduates with international exposure."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Corporate Leaders**: Alumni in management positions at major corporations.",
                    "**Entrepreneurs**: Founders of successful startups.",
                    "**HR Executives**: Alumni leading talent management at multinational companies.",
                    "**Faculty Excellence**: CityUHK management faculty includes experts in leadership and organisational behaviour."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**CityUHK Admission Scholarships**: For outstanding HKDSE performers.",
                    "**Management Excellence Awards**: For leadership potential.",
                    "**Columbia Joint Degree Scholarship**: Additional funding support for students admitted to the Columbia joint degree programme.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's CityU Management Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 22+. This is an accessible programme for well-rounded students.",
                    "**Mathematics Included**: Mathematics is counted in the Best 5 formula — ensure strong performance.",
                    "**Prepare for Interview**: Interview is on a selective basis and can be decisive. Practice discussing leadership experiences and career motivation.",
                    "**Develop Leadership**: Take on leadership roles in school organisations or community activities.",
                    "**Consider Columbia Option**: Outstanding Year 1 students can apply for the joint degree with Columbia University — plan early if interested.",
                    "**Build Communication Skills**: Management requires strong interpersonal and presentation abilities."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**入學計分公式**：最佳五科（包括數學）。所有科目加權×1。",
                    "**入學中位數**：22分（2025年聯招數據）。",
                    "**下四分位數**：21.5分（2025年聯招數據）。",
                    "**核心科目最低要求**：中國語文第3級、英國語文第3級、數學（必修部分）第3級、公民與社會發展科達標。",
                    "**選修科目**：任何2科達第3級。數學延伸部分（M1/M2）可滿足選修要求（如兩科皆修則只計一科）。應用學習科目不計入選修科目。",
                    "**面試**：選擇性面試。當申請者分數相同時，組別選擇及面試表現是商學院決定是否錄取的最關鍵因素。",
                    "**2025年申請統計**：Band A申請者705人，總申請者5,346人，錄取45人。",
                    "**首年學費**：港幣47,000元。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**課程概覽**：工商管理學士（管理學）培養學生成功管理組織內的人員及團隊，以及管理組織本身的能力，涵蓋本地及國際環境。",
                    "**兩個專修**：(1) 人力資源管理專修——專注人才招聘、員工發展及組織行為；(2) 策略及國際管理專修——專注策略規劃、國際商業營運及跨文化管理。",
                    "**第一年 - 基礎**：組織行為、商業傳播、會計、經濟及管理原理。",
                    "**第二年 - 管理學核心**：人力資源管理、策略管理、營運管理及領導才能。",
                    "**第三年 - 高級課題**：創業、創新管理、國際管理及組織設計。",
                    "**第四年 - 專修及專題**：選擇人力資源管理或策略及國際管理專修。完成專題項目。",
                    "**哥倫比亞大學雙聯學士學位**：表現優異的一年級學生，有機會申請在基本四年學制中，前往美國常春藤名校哥倫比亞大學就讀修讀第3、4年（可主修心理學或經濟學）。畢業時能同時獲得城大與哥倫比亞大學頒發的雙學士學位證書。",
                    "**修讀年期**：4年全日制。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**管理顧問**：於主要公司從事策略及營運顧問。",
                    "**企業管理**：跨國企業的管理培訓生計劃。",
                    "**人力資源**：於主要僱主擔任人力資源業務夥伴及人才招聘。",
                    "**創業**：初創企業創辦人或早期員工。",
                    "**科技界**：於科技公司擔任商業營運及項目管理。",
                    "**國際商業**：於具全球業務的企業擔任跨境管理職位。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**領導才能發展**：供團隊練習及領導模擬的空間。",
                    "**產業指導**：來自高級商業領袖的行政指導。",
                    "**學生社群**：活躍的管理學會及創業學會。",
                    "**環球視野**：交流及國際遊學的機會。"
                ]
            },
    "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中等（★★★☆☆）。入學分數要求較易達致，需求穩定。",
                    "**學術要求**：中位數22分，下四分位數21.5分。預期全面發展的背景。",
                    "**Band A競爭**：2025年705名Band A申請者競爭45個學額——約16:1比率。",
                    "**面試**：選擇性面試。分數相同時，組別選擇及面試表現至關重要。",
                    "**成功申請者特質**：優異學術成績加上展示的領導及溝通技巧。",
                    "**趨勢**：具國際視野的管理畢業生需求穩定。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**企業領袖**：校友於主要企業擔任管理職位。",
                    "**創業家**：成功初創企業的創辦人。",
                    "**人力資源高管**：校友於跨國公司領導人才管理。",
                    "**教職員卓越**：城大管理學教職員包括領導才能及組織行為專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**城大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**管理卓越獎**：按領導潛能頒發。",
                    "**哥倫比亞雙學位獎學金**：為獲錄取哥倫比亞雙學位課程的學生提供額外資助。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 城大管理學攻略",
                "content": [
                    "**分數目標**：最佳五科目標22分以上。這是對全面發展學生而言較易達致的課程。",
                    "**數學計入分數**：數學計入最佳五科公式——確保良好表現。",
                    "**準備面試**：面試為選擇性，可能具決定性。練習討論領導經驗及職業動機。",
                    "**培養領導才能**：於學校組織或社區活動擔任領導角色。",
                    "**考慮哥倫比亞選項**：表現優異的一年級學生可申請與哥倫比亞大學的雙學位——如感興趣請及早規劃。",
                    "**建立溝通技巧**：管理學需要強大人際及演示能力。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
print(f"[Seed] Updated median: {programme['median']}, band_a (LQ): {programme['band_a']}")
