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

# JS1002 - BBA Accountancy / 工商管理學士(會計)
# Data sources:
# - JUPAS 2025 Admissions Scores PDF (af_2025_JUPAS.pdf): Median 22, Lower Quartile 21.5
# - JUPAS Website: Entry requirements, application/offer statistics
# - JUPAS Programme List: Streams (Professional Accounting / ESG and Tech)

programme = {
    "code": "JS1002",
    "nameEn": "BBA Accountancy",
    "nameZh": "工商管理學士(會計)",
    "name": "BBA Accountancy",
    "university": "香港城市大學",
    "faculty": "商學院",
    "median": 22,
    "band_a": 21.5,
    "category": "business"
}

details = {
    "code": "JS1002",
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
                    "**2025 Application Statistics**: Band A 1,030 applicants, Total 4,301 applicants, 122 offers made.",
                    "**First Year Tuition**: HK$47,000."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Programme Overview**: Known as the 'language of business,' accounting is vital knowledge for business excellence. The programme prepares students to practice the profession of accounting and perform related business functions amid growing demand in Hong Kong and Greater China.",
                    "**Two Streams**: (1) Professional Accounting Stream — traditional accounting pathway with professional accreditation; (2) ESG and Tech Stream — focuses on environmental, social, governance reporting and technology applications in accounting.",
                    "**Professional Accreditation**: Accredited by HKICPA, ACCA, and CPA Australia for maximum exam exemptions.",
                    "**Year 1 - Foundation**: Financial accounting, management accounting, economics, business law, and business communication.",
                    "**Year 2 - Core Accounting**: Intermediate financial accounting, cost accounting, taxation, auditing, and corporate governance.",
                    "**Year 3 - Advanced Topics**: Advanced financial reporting, tax planning, audit practice, and accounting information systems.",
                    "**Year 4 - Professional Preparation**: Capstone project, professional exam preparation (HKICPA, ACCA), and internship.",
                    "**Duration**: 4 years full-time."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Big Four Audit**: Audit associate at Deloitte, PwC, EY, and KPMG.",
                    "**Corporate Accounting**: Financial reporting and management accounting at listed companies.",
                    "**Tax Advisory**: Tax consultant at Big Four and specialized firms.",
                    "**ESG Reporting**: Sustainability and ESG analyst roles — growing field with increasing regulatory requirements.",
                    "**Forensic Accounting**: Fraud investigation and litigation support.",
                    "**Government & Regulatory**: Accountant positions at government departments.",
                    "**Business Consulting**: Accounting degree provides a doorway to almost every business opportunity including financial auditing and business consulting."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Accounting Labs**: Computer labs with accounting software and financial databases.",
                    "**Professional Partnerships**: Strong relationships with Big Four for internships and recruitment.",
                    "**Student Community**: Active Accountancy Society and professional exam study groups.",
                    "**Industry Connections**: Regular networking events with accounting professionals and alumni."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate to High (★★★☆☆). Very popular programme with large applicant pool.",
                    "**Academic Requirements**: Median 22, Lower Quartile 21.5. Accessible to a broad range of students.",
                    "**Band A Competition**: 1,030 Band A applicants for 122 places in 2025 — approximately 8:1 ratio.",
                    "**What Differentiates Winners**: Consistent academic performance across all subjects.",
                    "**Trend**: Stable demand with growing ESG and tech focus in accounting profession."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Big Four Partners**: Alumni who made partner at major accounting firms.",
                    "**CFOs**: Graduates as financial controllers at listed companies.",
                    "**ESG Leaders**: Alumni leading sustainability reporting initiatives.",
                    "**Faculty Excellence**: CityUHK accounting faculty includes leading researchers in financial reporting, auditing, and ESG."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**CityUHK Admission Scholarships**: For outstanding HKDSE performers.",
                    "**Big Four Scholarships**: Sponsored by Deloitte, PwC, EY, and KPMG.",
                    "**Professional Body Scholarships**: HKICPA, ACCA, and CPA Australia scholarship opportunities.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's CityU Accountancy Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 22+. This is an accessible programme for well-rounded students.",
                    "**Mathematics Matters**: Include Mathematics in your Best 5 — it is counted in the admission formula.",
                    "**Plan for Professional Exams**: Understand HKICPA, ACCA, and CPA Australia qualification pathways early.",
                    "**Choose Your Stream**: Decide between Professional Accounting (traditional pathway) and ESG and Tech (emerging field).",
                    "**Develop Attention to Detail**: Accounting requires precision and careful work.",
                    "**Seek Internships Early**: Big Four internships are highly valuable for career placement."
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
                    "**2025年申請統計**：Band A申請者1,030人，總申請者4,301人，錄取122人。",
                    "**首年學費**：港幣47,000元。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**課程概覽**：會計被稱為『商業語言』，是商業卓越的關鍵知識。課程培養學生從事會計專業及相關商業職能，應對香港及大中華地區日益增長的需求。",
                    "**兩個專修**：(1) 專業會計專修——傳統會計途徑，具專業認可；(2) 環境社會治理及科技專修——專注環境、社會、管治報告及會計科技應用。",
                    "**專業認可**：獲香港會計師公會、ACCA及澳洲會計師公會認可，可獲最多考試豁免。",
                    "**第一年 - 基礎**：財務會計、管理會計、經濟、商業法及商業傳播。",
                    "**第二年 - 會計核心**：中級財務會計、成本會計、稅務、審計及企業管治。",
                    "**第三年 - 高級課題**：高級財務報告、稅務規劃、審計實務及會計資訊系統。",
                    "**第四年 - 專業準備**：專題項目、專業考試準備（香港會計師公會、ACCA）及實習。",
                    "**修讀年期**：4年全日制。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**四大審計**：於德勤、羅兵咸永道、安永及畢馬威擔任審計助理。",
                    "**企業會計**：於上市公司擔任財務報告及管理會計。",
                    "**稅務顧問**：於四大及專門公司擔任稅務顧問。",
                    "**ESG報告**：可持續發展及ESG分析師職位——隨著監管要求增加，此領域不斷增長。",
                    "**法證會計**：欺詐調查及訴訟支援。",
                    "**政府及監管**：於政府部門擔任會計師職位。",
                    "**商業顧問**：會計學位為幾乎所有商業機會打開大門，包括財務審計及商業諮詢。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**會計實驗室**：配備會計軟件及財務數據庫的電腦實驗室。",
                    "**專業夥伴關係**：與四大建立強大聯繫，提供實習及招聘機會。",
                    "**學生社群**：活躍的會計學會及專業考試學習小組。",
                    "**產業聯繫**：定期與會計專業人士及校友舉辦交流活動。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中至高（★★★☆☆）。非常受歡迎的課程，申請者眾多。",
                    "**學術要求**：中位數22分，下四分位數21.5分。適合廣泛範圍的學生。",
                    "**Band A競爭**：2025年1,030名Band A申請者競爭122個學額——約8:1比率。",
                    "**成功申請者特質**：所有科目表現一致的學術成績。",
                    "**趨勢**：需求穩定，會計專業的ESG及科技專注持續增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**四大合夥人**：校友晉升為主要會計師事務所合夥人。",
                    "**財務總監**：畢業生於上市公司擔任財務總監。",
                    "**ESG領袖**：校友領導可持續發展報告倡議。",
                    "**教職員卓越**：城大會計教職員包括財務報告、審計及ESG領域的領先研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**城大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**四大獎學金**：德勤、羅兵咸永道、安永及畢馬威贊助。",
                    "**專業團體獎學金**：香港會計師公會、ACCA及澳洲會計師公會獎學金機會。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 城大會計攻略",
                "content": [
                    "**分數目標**：最佳五科目標22分以上。這是對全面發展學生而言較易達致的課程。",
                    "**數學重要**：將數學納入最佳五科——計分公式包含數學。",
                    "**規劃專業考試**：及早了解香港會計師公會、ACCA及澳洲會計師公會資格途徑。",
                    "**選擇專修**：決定專業會計（傳統途徑）或環境社會治理及科技（新興領域）。",
                    "**培養注重細節**：會計需要精確及仔細的工作。",
                    "**及早尋求實習**：四大實習對職業安置極有價值。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
print(f"[Seed] Updated median: {programme['median']}, band_a (LQ): {programme['band_a']}")
