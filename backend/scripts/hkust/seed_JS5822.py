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

# JS5822 - BSc in Sustainable and Green Finance / 理學士（可持續發展及綠色金融）
programme = {
    "code": "JS5822",
    "nameEn": "BSc in Sustainable and Green Finance",
    "nameZh": "理學士（可持續發展及綠色金融）",
    "name": "BSc in Sustainable and Green Finance",
    "university": "香港科技大學",
    "faculty": "商學院",
    "median": 30,
    "band_a": 33,
    "category": "business"
}

details = {
    "code": "JS5822",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Best 5 typically 30-33 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is highly recommended. BAFS, Economics, or Geography at Level 4+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Interest in sustainability, ESG investing, climate finance, and environmental issues strengthens applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Finance, accounting, economics, environmental science, and sustainability principles.",
                    "**Year 2 - Core SGFN**: Corporate finance, investment analysis, ESG frameworks, green bonds, and sustainable business models.",
                    "**Year 3 - Advanced Topics**: Climate finance, carbon markets, impact investing, sustainability reporting, and green fintech.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in green finance or sustainable investing. Complete research or industry project.",
                    "**Interdisciplinary**: Combines finance, environmental science, and policy for comprehensive sustainability education.",
                    "**Industry Exposure**: Guest lectures from ESG practitioners, green bond issuers, and sustainability consultants."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**ESG Investing**: ESG analyst and sustainable investment analyst at asset managers and pension funds.",
                    "**Green Finance**: Green bond analyst, sustainability-linked loan structuring, and climate finance advisory at banks.",
                    "**Corporate Sustainability**: Sustainability manager and ESG reporting specialist at corporations.",
                    "**Consulting**: ESG and sustainability consulting at Big Four and specialized sustainability firms.",
                    "**Regulatory & Policy**: ESG policy analyst at regulatory bodies and international organizations.",
                    "**Impact Investing**: Investment analyst at impact funds and development finance institutions."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Research Centers**: HKUST Institute for the Environment and Center for Business Sustainability.",
                    "**Industry Partnerships**: Collaborations with HKEX, green bond issuers, and ESG data providers.",
                    "**Case Studies**: Real-world cases on green bonds, ESG integration, and climate risk assessment.",
                    "**Student Community**: Active Sustainability Society, ESG investment clubs, and green finance interest groups.",
                    "**Global Exposure**: Exchange opportunities with universities leading in sustainability and green finance."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Emerging field with strong growth potential.",
                    "**Academic Requirements**: Best 5 around 30-33. Well-rounded profile with interest in sustainability.",
                    "**Band A Competition**: Competitive. Band A placement recommended.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong academics plus genuine interest in sustainability and climate issues.",
                    "**Trend**: Rapidly growing demand as ESG becomes mainstream in global finance."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**ESG Professionals**: Alumni in ESG analysis and sustainable investing roles at major asset managers.",
                    "**Green Finance Specialists**: Graduates structuring green bonds and sustainability-linked loans.",
                    "**Sustainability Consultants**: Alumni advising corporations on ESG strategy and reporting.",
                    "**Policy Advisors**: Graduates working on climate finance policy at government and NGOs.",
                    "**Faculty Excellence**: HKUST SGFN faculty includes experts in climate finance, ESG metrics, and sustainable business."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers.",
                    "**Sustainability Awards**: Scholarships for students committed to environmental and social causes.",
                    "**Industry-Sponsored Scholarships**: From green finance and ESG data providers.",
                    "**Research Grants**: Funding for sustainability and green finance research projects.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Sustainable & Green Finance Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 31+. Well-rounded academic profile.",
                    "**Understand ESG**: Learn about Environmental, Social, and Governance frameworks and their importance in investing.",
                    "**Follow Climate Finance**: Stay informed about green bonds, carbon markets, and climate risk disclosure.",
                    "**Develop Finance Skills**: Basic understanding of corporate finance and investment analysis is essential.",
                    "**Show Sustainability Passion**: Demonstrate genuine interest through volunteering, projects, or following sustainability news."
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
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上高度建議。企業、會計與財務概論、經濟或地理達4級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：對可持續發展、ESG投資、氣候金融及環境議題的興趣可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：金融、會計、經濟、環境科學及可持續發展原理。",
                    "**第二年 - 可持續發展及綠色金融核心**：公司金融、投資分析、ESG框架、綠色債券及可持續商業模式。",
                    "**第三年 - 高級課題**：氣候金融、碳市場、影響力投資、可持續發展報告及綠色金融科技。",
                    "**第四年 - 專修及專題**：選擇綠色金融或可持續投資專修。完成研究或產業項目。",
                    "**跨學科**：結合金融、環境科學及政策進行全面可持續發展教育。",
                    "**產業接觸**：ESG從業員、綠色債券發行人及可持續發展顧問的客席講座。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**ESG投資**：於資產管理公司及退休基金擔任ESG分析師及可持續投資分析師。",
                    "**綠色金融**：於銀行擔任綠色債券分析師、可持續發展掛鉤貸款結構及氣候金融顧問。",
                    "**企業可持續發展**：於企業擔任可持續發展經理及ESG報告專家。",
                    "**顧問**：於四大及專門可持續發展公司從事ESG及可持續發展顧問。",
                    "**監管及政策**：於監管機構及國際組織擔任ESG政策分析師。",
                    "**影響力投資**：於影響力基金及發展金融機構擔任投資分析師。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**研究中心**：科大環境研究所及商業可持續發展中心。",
                    "**產業夥伴關係**：與港交所、綠色債券發行人及ESG數據供應商合作。",
                    "**案例研究**：綠色債券、ESG整合及氣候風險評估的真實案例。",
                    "**學生社群**：活躍的可持續發展學會、ESG投資學會及綠色金融興趣小組。",
                    "**全球視野**：與可持續發展及綠色金融領先大學的交流機會。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。新興領域，增長潛力強勁。",
                    "**學術要求**：最佳五科約30-33分。具備可持續發展興趣的全面發展背景。",
                    "**Band A競爭**：競爭激烈。建議Band A選擇。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異學術成績加上對可持續發展及氣候議題的 genuine 興趣。",
                    "**趨勢**：隨著ESG成為全球金融主流，需求迅速增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**ESG專業人士**：校友於主要資產管理公司擔任ESG分析及可持續投資職位。",
                    "**綠色金融專家**：畢業生結構綠色債券及可持續發展掛鉤貸款。",
                    "**可持續發展顧問**：校友就ESG策略及報告向企業提供建議。",
                    "**政策顧問**：於政府及非政府組織從事氣候金融政策的畢業生。",
                    "**教職員卓越**：科大可持續發展及綠色金融教職員包括氣候金融、ESG指標及可持續商業專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**可持續發展獎項**：致力環境及社會事業學生的獎學金。",
                    "**業界贊助獎學金**：綠色金融及ESG數據供應商的獎學金。",
                    "**研究資助**：可持續發展及綠色金融研究項目資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大可持續發展及綠色金融攻略",
                "content": [
                    "**分數目標**：最佳五科目標31分以上。全面發展的學術背景。",
                    "**了解ESG**：學習環境、社會及管治框架及其於投資的重要性。",
                    "**追蹤氣候金融**：了解綠色債券、碳市場及氣候風險披露。",
                    "**培養金融技能**：公司金融及投資分析的基本了解至關重要。",
                    "**展示可持續發展熱誠**：透過義工、項目或追蹤可持續發展新聞展示 genuine 興趣。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
