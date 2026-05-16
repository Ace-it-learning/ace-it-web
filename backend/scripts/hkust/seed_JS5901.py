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

# JS5901 - BEng/BSc & BBA Dual Degree Program in Technology & Management / 科技及管理學雙學位課程
programme = {
    "code": "JS5901",
    "nameEn": "BEng/BSc & BBA Dual Degree Program in Technology & Management",
    "nameZh": "科技及管理學雙學位課程",
    "name": "Technology & Management Dual Degree",
    "university": "香港科技大學",
    "faculty": "跨學院",
    "median": 35,
    "band_a": 38,
    "category": "engineering"
}

details = {
    "code": "JS5901",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: EXTREMELY COMPETITIVE. HKUST's most selective programme. Best 5 typically 35-38 points.",
                    "**Core Subjects**: English (Level 5 or above is highly preferred), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 5* or above is ESSENTIAL. Physics or Chemistry at Level 5 is highly preferred.",
                    "**Interview**: Required. Assesses leadership potential, communication skills, motivation for dual-degree study, and career aspirations.",
                    "**Non-Academic Factors**: Exceptional leadership record, extracurricular achievements, business competition experience, and demonstrated ability to handle demanding workloads are essential."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1-2 - Foundation**: Intensive foundation in chosen engineering/science discipline AND business fundamentals simultaneously.",
                    "**Year 3 - Integration**: Technology management courses bridging engineering and business. Summer internship mandatory.",
                    "**Year 4-5 - Advanced Study**: Complete remaining requirements for BOTH degrees. Capstone projects in technology and business.",
                    "**Dual Degree**: Graduate with TWO degrees: BEng or BSc in chosen engineering/science field AND BBA in General Business Management.",
                    "**Available Engineering Majors**: Computer Science, Electronic Engineering, Mechanical Engineering, Chemical Engineering, Civil Engineering, etc.",
                    "**Extended Duration**: 5-year programme (vs standard 4 years) due to dual degree requirements."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Tech Leadership**: Product manager, engineering manager, and tech lead roles combining technical and business skills.",
                    "**Management Consulting**: Top-tier consulting firms (McKinsey, BCG, Bain) highly value the dual technical-business background.",
                    "**Entrepreneurship**: Founder of technology startups with ability to handle both product development and business operations.",
                    "**Investment Banking**: Tech-focused investment banking and private equity roles requiring technical understanding.",
                    "**Corporate Strategy**: Strategy and business development roles at technology companies.",
                    "**Graduate Studies**: MBA, MSc, or PhD in engineering or business at top universities."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Small Cohort**: Very selective intake (~30 students) creating tight-knit community and strong alumni network.",
                    "**Dual School Access**: Full access to both School of Engineering and Business School resources, facilities, and faculty.",
                    "**Executive Mentorship**: Dedicated mentorship from C-suite executives and technology leaders.",
                    "**Leadership Development**: Specialized leadership training, overseas expeditions, and team-building programs.",
                    "**Student Community**: Exclusive T&M Society with strong alumni network, networking events, and international trips."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Extremely High (★★★★★). HKUST's most competitive and prestigious undergraduate programme.",
                    "**Academic Requirements**: Best 5 around 35-38. Level 5** in multiple subjects typically required.",
                    "**Band A Competition**: Fierce competition. Only top applicants admitted.",
                    "**Interview Weighting**: Very High. Interview performance is critical for admission.",
                    "**What Differentiates Winners**: Exceptional academics, outstanding leadership, clear career vision, and ability to articulate why dual degree.",
                    "**Trend**: Consistently the most selective programme with highest graduate starting salaries and career prospects."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Tech Entrepreneurs**: Alumni founders of successful technology startups and unicorns.",
                    "**Corporate Leaders**: Graduates in C-suite positions at technology and multinational corporations.",
                    "**Consulting Partners**: Alumni who made partner at McKinsey, BCG, and Bain.",
                    "**Investment Professionals**: Alumni in leadership roles at investment banks and private equity firms.",
                    "**Faculty Excellence**: T&M faculty drawn from top engineering and business professors with industry experience."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: Full tuition scholarships for top DSE performers.",
                    "**T&M Prestige Scholarship**: Most prestigious award specifically for T&M students.",
                    "**Industry-Sponsored Scholarships**: From technology and consulting companies supporting T&M talent.",
                    "**Overseas Study Grants**: Additional funding for international experiences and exchanges.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST T&M Dual Degree Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 36+. Excellence across ALL subjects is expected.",
                    "**Demonstrate Leadership**: Show significant leadership impact in school, clubs, or community.",
                    "**Prepare for Interview**: Practice articulating why you want BOTH technical and business training.",
                    "**Show Work Ethic**: The programme is demanding. Demonstrate you can handle intensive workloads.",
                    "**Have Clear Vision**: Know what you want to do with the dual degree - tech entrepreneurship, consulting, etc."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：極度競爭。科大最選擇性的課程。最佳五科通常35-38分。",
                    "**核心科目**：英文（達5級或以上高度優先考慮）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達5*級或以上為必需。物理或化學達5級高度優先考慮。",
                    "**面試**：必須。評估領導潛能、溝通技巧、雙學位學習動機及職業抱負。",
                    "**非學術因素**：卓越的領導記錄、課外成就、商業競賽經驗及展示處理高要求工作量的能力至關重要。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一至二年 - 基礎**：同時進行選定工程/科學學科及商業基礎的密集基礎課程。",
                    "**第三年 - 整合**：連接工程與商業的科技管理課程。必修暑期實習。",
                    "**第四至五年 - 高級研習**：完成兩個學位的剩餘要求。科技及商業專題項目。",
                    "**雙學位**：畢業時獲頒兩個學位：選定工程/科學領域的工學士或理學士，以及一般商業管理工商管理學士。",
                    "**可選工程主修**：計算機科學、電子工程、機械工程、化學工程、土木工程等。",
                    "**延長修讀期**：由於雙學位要求，為五年制課程（標準四年）。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**科技領導**：結合技術及商業技能的產品經理、工程經理及技術主管職位。",
                    "**管理顧問**：頂尖顧問公司（麥肯錫、波士頓諮詢、貝恩）高度重視雙重技術-商業背景。",
                    "**創業**：能夠同時處理產品開發及商業營運的科技初創企業創辦人。",
                    "**投資銀行**：需要技術理解的科技專注投資銀行及私募股權職位。",
                    "**企業策略**：科技公司策略及業務發展職位。",
                    "**研究生課程**：於頂尖大學攻讀工商管理碩士、理學碩士或工程/商業博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**小班教學**：非常選擇性的收生（約30名學生），創造緊密社群及強大校友網絡。",
                    "**雙學院使用權**：完全使用工程學院及商學院的資源、設施及教職員。",
                    "**行政指導**：來自行政總裁及科技領袖的專門指導。",
                    "**領導才能發展**：專門領導培訓、海外遠征及團隊建設項目。",
                    "**學生社群**：獨家的科技及管理學會，擁有強大校友網絡、交流活動及國際旅行。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。科大最競爭及最負盛名的本科課程。",
                    "**學術要求**：最佳五科約35-38分。多科通常需達5**級。",
                    "**Band A競爭**：激烈競爭。僅錄取頂尖申請人。",
                    "**面試比重**：極高。面試表現對入學至關重要。",
                    "**成功申請者特質**：卓越學術成績、傑出領導才能、清晰職業視野及闡述為何選擇雙學位的能力。",
                    "**趨勢**：持續為最選擇性的課程，畢業生起薪及職業前景最高。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**科技創業家**：成功科技初創企業及獨角獸的校友創辦人。",
                    "**企業領袖**：畢業生於科技及跨國企業擔任行政總裁職位。",
                    "**顧問合夥人**：校友晉升為麥肯錫、波士頓諮詢及貝恩合夥人。",
                    "**投資專業人士**：校友於投資銀行及私募股權公司擔任領導職位。",
                    "**教職員卓越**：科技及管理教職員來自頂尖工程及商業教授，具備業界經驗。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：為頂尖香港中學文憑考試成績者提供全額學費獎學金。",
                    "**科技及管理聲望獎學金**：專為科技及管理學生而設的最負盛名獎項。",
                    "**業界贊助獎學金**：科技及顧問公司支持科技及管理人才的獎學金。",
                    "**海外學習資助**：國際體驗及交流的額外資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大科技及管理學雙學位攻略",
                "content": [
                    "**分數目標**：最佳五科目標36分以上。所有科目卓越表現為預期。",
                    "**展示領導才能**：於學校、學會或社區展示重大領導影響力。",
                    "**準備面試**：練習闡述為何你同時需要技術及商業培訓。",
                    "**展示工作態度**：課程要求很高。展示你能處理密集工作量。",
                    "**擁有清晰視野**：了解你想用雙學位做什麼 - 科技創業、顧問等。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
