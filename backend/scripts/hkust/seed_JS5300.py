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

# JS5300 - Business and Management / 工商管理
programme = {
    "code": "JS5300",
    "nameEn": "Business and Management",
    "nameZh": "工商管理",
    "name": "Business and Management",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 32,
    "band_a": 35,
    "category": "business"
}

details = {
    "code": "JS5300",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. One of the most popular business programmes. Best 5 typically 32-35 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is highly recommended. BAFS (Business, Accounting and Financial Studies) or Economics at Level 4+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Leadership experience, business competition participation, entrepreneurship activities, and community service strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Business Foundation**: Accounting, economics, statistics, business communication, and introduction to business.",
                    "**Year 2 - Core Business**: Marketing, finance, organizational behavior, operations management, and business law.",
                    "**Year 3 - Specialization**: Choose concentration in Finance, Marketing, Management, Information Systems, or Operations Management.",
                    "**Year 4 - Advanced Studies**: Strategic management, international business, capstone project, and internship.",
                    "**Available Concentrations**: Accounting, Economics, Finance, Information Systems, Management, Marketing, Operations Management.",
                    "**Practical Experience**: Case studies, business simulations, consulting projects, and mandatory internship."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Investment Banking**: Analyst positions at Goldman Sachs, Morgan Stanley, JP Morgan, and local investment banks.",
                    "**Consulting**: Management consulting at McKinsey, BCG, Bain, and Big Four advisory practices.",
                    "**Corporate Management**: Management trainee programmes at multinational corporations and local conglomerates.",
                    "**Marketing & Brand Management**: Brand manager, digital marketing, and market research at FMCG and tech companies.",
                    "**Technology & Startups**: Product manager, business development, and operations roles at tech companies and startups.",
                    "**Accounting & Professional Services**: Big Four audit, tax, and advisory positions (with professional qualification pathway)."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Business Facilities**: State-of-the-art trading room with Bloomberg terminals, case study rooms, and presentation suites.",
                    "**Research Centers**: HKUST Business School research centers in finance, marketing, entrepreneurship, and Asian business.",
                    "**Industry Connections**: Strong alumni network, corporate partnerships, and regular CEO/executive guest lectures.",
                    "**Global Exposure**: Exchange programmes with top business schools worldwide (Wharton, LSE, INSEAD).",
                    "**Student Community**: Active business societies, investment clubs, consulting groups, and entrepreneurship competitions."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Very High (★★★★★). One of the most competitive business programmes in Hong Kong.",
                    "**Academic Requirements**: Best 5 around 32-35. Level 5 in English and Mathematics expected.",
                    "**Band A Competition**: Intense competition. Band A placement essential for admission.",
                    "**Interview Weighting**: Low. Academic-based admission for most applicants.",
                    "**What Differentiates Winners**: Strong all-round academics plus demonstrated leadership and business interest.",
                    "**Trend**: Consistently highest demand due to excellent career outcomes and strong employer reputation."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Finance Leaders**: Alumni in senior positions at investment banks, private equity, and hedge funds globally.",
                    "**Corporate Executives**: Graduates as CEOs, CFOs, and managing directors at Fortune 500 and local listed companies.",
                    "**Entrepreneurs**: Founders of successful startups and unicorns in fintech, e-commerce, and technology.",
                    "**Academia**: Alumni as professors at top business schools worldwide.",
                    "**Faculty Excellence**: HKUST Business School faculty includes world-renowned researchers and industry practitioners."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers. Full and half tuition scholarships available.",
                    "**Business School Scholarships**: Merit-based awards for academic excellence and leadership potential.",
                    "**Industry-Sponsored Awards**: From banks, consulting firms, and corporations supporting business talent.",
                    "**Entrepreneurship Grants**: Funding for student startup ventures and business plan competitions.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Business & Management Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 33+. English and Mathematics at Level 5 or above are crucial.",
                    "**Develop Leadership**: Take on leadership roles in student organizations, clubs, or community projects.",
                    "**Show Business Interest**: Participate in business competitions, stock investment games, or entrepreneurship activities.",
                    "**Take M1/M2**: Mathematics Extended Part strengthens your quantitative skills for finance and analytics.",
                    "**Build Communication Skills**: Strong English and presentation skills are essential for business success."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。最受歡迎的商學課程之一。最佳五科通常32-35分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上高度建議。企業、會計與財務概論（BAFS）或經濟達4級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：領導經驗、商業競賽參與、創業活動及社區服務可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 商業基礎**：會計、經濟、統計、商業傳播及商業導論。",
                    "**第二年 - 商業核心**：市場學、金融、組織行為、營運管理及商業法。",
                    "**第三年 - 專修**：選擇金融、市場學、管理學、資訊系統或營運管理專修。",
                    "**第四年 - 高級研習**：策略管理、國際商業、專題項目及實習。",
                    "**可選專修**：會計、經濟、金融、資訊系統、管理學、市場學、營運管理。",
                    "**實踐經驗**：案例研究、商業模擬、顧問項目及必修實習。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**投資銀行**：於高盛、摩根士丹利、摩根大通及本地投資銀行擔任分析師職位。",
                    "**顧問**：於麥肯錫、波士頓諮詢、貝恩及四大顧問業務擔任管理顧問。",
                    "**企業管理**：於跨國企業及本地集團的管理培訓生計劃。",
                    "**市場學及品牌管理**：於快速消費品及科技公司擔任品牌經理、數碼市場學及市場研究。",
                    "**科技及初創企業**：於科技公司及初創企業擔任產品經理、業務發展及營運職位。",
                    "**會計及專業服務**：四大審計、稅務及顧問職位（具專業資格途徑）。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**商業設施**：配備彭博終端的先進交易室、案例研究房間及演講廳。",
                    "**研究中心**：科大的金融、市場學、創業及亞洲商業商學院研究中心。",
                    "**產業聯繫**：強大的校友網絡、企業夥伴關係及定期行政總裁/高管客席講座。",
                    "**全球視野**：與全球頂尖商學院（沃頓、倫敦政經、歐洲工商管理學院）的交流項目。",
                    "**學生社群**：活躍的商業學會、投資學會、顧問小組及創業競賽。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。香港最競爭的商學課程之一。",
                    "**學術要求**：最佳五科約32-35分。英文及數學預期達5級。",
                    "**Band A競爭**：競爭激烈。Band A選擇對入學至關重要。",
                    "**面試比重**：低。大部分申請人以學術成績為基礎入學。",
                    "**成功申請者特質**：優異全面學術成績加上展示的領導才能及商業興趣。",
                    "**趨勢**：由於卓越職業出路及強大僱主聲譽，需求持續最高。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**金融領袖**：校友於全球投資銀行、私募股權及對沖基金擔任高級職位。",
                    "**企業高管**：畢業生於財富500強及本地上市公司擔任行政總裁、財務總監及董事總經理。",
                    "**創業家**：創立金融科技、電子商務及科技領域成功的初創企業及獨角獸。",
                    "**學術界**：校友於全球頂尖商學院擔任教授。",
                    "**教職員卓越**：科大商學院教職員包括世界知名研究人員及業界實踐者。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。提供全額及半額學費獎學金。",
                    "**商學院獎學金**：按學術卓越及領導潛能頒發的優異獎。",
                    "**業界贊助獎項**：銀行、顧問公司及企業支持商業人才的獎項。",
                    "**創業資助**：學生初創企業及商業計劃競賽的資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大工商管理攻略",
                "content": [
                    "**分數目標**：最佳五科目標33分以上。英文及數學達5級或以上至關重要。",
                    "**培養領導才能**：於學生組織、學會或社區項目擔任領導角色。",
                    "**展示商業興趣**：參與商業競賽、股票投資遊戲或創業活動。",
                    "**修讀M1/M2**：數學延伸部分可加強金融及分析方面的量化技能。",
                    "**建立溝通技巧**：強大的英文及演講技巧對商業成功至關重要。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
