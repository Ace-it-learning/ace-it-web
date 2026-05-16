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

# JS5318 - BBA in Professional Accounting / 工商管理學士（專業會計學）
programme = {
    "code": "JS5318",
    "nameEn": "BBA in Professional Accounting",
    "nameZh": "工商管理學士（專業會計學）",
    "name": "BBA in Professional Accounting",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 32,
    "band_a": 35,
    "category": "business"
}

details = {
    "code": "JS5318",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Best 5 typically 32-35 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: BAFS (Business, Accounting and Financial Studies) at Level 4+ is highly preferred. Mathematics Extended Part (M1/M2) at Level 4+ is recommended.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Accounting competition participation, interest in finance and business, and attention to detail strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Financial accounting, management accounting, economics, business law, and business communication.",
                    "**Year 2 - Core Accounting**: Intermediate financial accounting, cost accounting, taxation, auditing principles, and corporate governance.",
                    "**Year 3 - Advanced Topics**: Advanced financial reporting, tax planning, audit practice, financial management, and accounting information systems.",
                    "**Year 4 - Professional Preparation**: Capstone project, professional exam preparation (HKICPA, ACCA), and internship at accounting firms.",
                    "**Professional Accreditation**: Curriculum accredited by HKICPA, ACCA, and CPA Australia for maximum exam exemptions.",
                    "**Practical Training**: Case studies using real financial statements, audit simulation, and tax return preparation exercises."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Big Four Audit**: Audit associate at Deloitte, PwC, EY, and KPMG with clear path to partnership.",
                    "**Corporate Accounting**: Financial reporting, management accounting, and FP&A roles at listed companies.",
                    "**Tax Advisory**: Tax consultant at Big Four and specialized tax advisory firms.",
                    "**Investment Banking**: Financial due diligence, valuation, and transaction advisory at investment banks.",
                    "**Forensic Accounting**: Fraud investigation, dispute resolution, and litigation support.",
                    "**Government & Regulatory**: Accountant positions at government departments and regulatory bodies."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Accounting Labs**: Computer labs with accounting software (SAP, Oracle, QuickBooks) and financial databases.",
                    "**Research Centers**: HKUST Center for Accounting and Corporate Governance Research.",
                    "**Professional Partnerships**: Strong relationships with Big Four firms for internships, scholarships, and recruitment.",
                    "**Student Community**: Active Accounting Society, case competition teams, and professional exam study groups.",
                    "**Career Support**: Dedicated career counseling for accounting profession, networking events with partners and alumni."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Strong demand due to guaranteed professional qualification pathway.",
                    "**Academic Requirements**: Best 5 around 32-35. Strong performance in mathematics and BAFS is important.",
                    "**Band A Competition**: Competitive. Band A placement recommended.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong mathematics and accounting foundation with attention to detail.",
                    "**Trend**: Stable demand due to consistent career prospects and professional qualification prestige."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Big Four Partners**: Alumni who made partner at Deloitte, PwC, EY, and KPMG.",
                    "**CFOs**: Graduates as CFOs and financial controllers at listed companies.",
                    "**Regulatory Leaders**: Alumni at HKICPA, SFC, and HKEX in regulatory and policy roles.",
                    "**Entrepreneurs**: Founders of accounting firms and financial advisory practices.",
                    "**Faculty Excellence**: HKUST accounting faculty includes leading researchers in financial reporting, auditing, and corporate governance."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong academic records.",
                    "**Big Four Scholarships**: Sponsored by Deloitte, PwC, EY, and KPMG for promising accounting students.",
                    "**Professional Body Awards**: From HKICPA, ACCA, and CPA Australia.",
                    "**Accounting Excellence Grants**: For students with exceptional aptitude in accounting and finance.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Professional Accounting Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 33+. Mathematics and BAFS at Level 5 are highly recommended.",
                    "**Master Accounting Fundamentals**: Strong understanding of debits, credits, and financial statements is essential.",
                    "**Take BAFS**: This elective provides excellent foundation for university accounting studies.",
                    "**Develop Attention to Detail**: Accounting requires precision. Practice careful, methodical work.",
                    "**Plan for Professional Exams**: Understand the HKICPA qualification pathway and exam requirements early."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。最佳五科通常32-35分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：企業、會計與財務概論（BAFS）達4級或以上高度優先考慮。數學延伸部分（M1/M2）達4級或以上建議。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：會計競賽參與、對金融及商業的興趣及注重細節可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：財務會計、管理會計、經濟、商業法及商業傳播。",
                    "**第二年 - 會計核心**：中級財務會計、成本會計、稅務、審計原理及企業管治。",
                    "**第三年 - 高級課題**：高級財務報告、稅務規劃、審計實務、財務管理及會計資訊系統。",
                    "**第四年 - 專業準備**：專題項目、專業考試準備（香港會計師公會、ACCA）及會計師事務所實習。",
                    "**專業認可**：課程獲香港會計師公會、ACCA及澳洲會計師公會認可，可獲最多考試豁免。",
                    "**實踐培訓**：使用真實財務報表的案例研究、審計模擬及報稅練習。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**四大審計**：於德勤、羅兵咸永道、安永及畢馬威擔任審計助理，具清晰晉升合夥人途徑。",
                    "**企業會計**：於上市公司擔任財務報告、管理會計及財務規劃與分析職位。",
                    "**稅務顧問**：於四大及專門稅務顧問公司擔任稅務顧問。",
                    "**投資銀行**：於投資銀行從事財務盡職審查、估值及交易顧問。",
                    "**法證會計**：欺詐調查、爭議解決及訴訟支援。",
                    "**政府及監管**：於政府部門及監管機構擔任會計師職位。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**會計實驗室**：配備會計軟件（SAP、Oracle、QuickBooks）及財務數據庫的電腦實驗室。",
                    "**研究中心**：科大會計及企業管治研究中心。",
                    "**專業夥伴關係**：與四大會計師事務所建立強大聯繫，提供實習、獎學金及招聘機會。",
                    "**學生社群**：活躍的會計學會、案例競賽隊伍及專業考試學習小組。",
                    "**職業支援**：專門為會計專業提供的職業輔導、與合夥人及校友的交流活動。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。由於保證專業資格途徑，需求強勁。",
                    "**學術要求**：最佳五科約32-35分。數學及企業、會計與財務概論的優異表現很重要。",
                    "**Band A競爭**：競爭激烈。建議Band A選擇。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異數學及會計基礎，注重細節。",
                    "**趨勢**：由於穩定職業前景及專業資格聲望，需求穩定。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**四大合夥人**：校友晉升為德勤、羅兵咸永道、安永及畢馬威合夥人。",
                    "**財務總監**：畢業生於上市公司擔任財務總監及財務總監。",
                    "**監管領袖**：校友於香港會計師公會、證監會及港交所擔任監管及政策職位。",
                    "**創業家**：創立會計師事務所及財務顧問業務。",
                    "**教職員卓越**：科大會計教職員包括財務報告、審計及企業管治領域的領先研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**四大獎學金**：德勤、羅兵咸永道、安永及畢馬威贊助有潛質會計學生的獎學金。",
                    "**專業機構獎項**：香港會計師公會、ACCA及澳洲會計師公會的獎項。",
                    "**會計卓越資助**：適用於會計及金融能力卓越學生的資助。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大專業會計學攻略",
                "content": [
                    "**分數目標**：最佳五科目標33分以上。數學及企業、會計與財務概論達5級高度建議。",
                    "**掌握會計基礎**：對借貸及財務報表的穩固理解至關重要。",
                    "**修讀企業、會計與財務概論**：此選修科為大學會計學習提供極佳基礎。",
                    "**培養注重細節**：會計需要精確。練習仔細、有條理的工作。",
                    "**規劃專業考試**：及早了解香港會計師公會資格途徑及考試要求。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
