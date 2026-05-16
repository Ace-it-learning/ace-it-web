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

# JS5812 - BSc in Environmental Management and Technology / 理學士（環境管理及科技）
programme = {
    "code": "JS5812",
    "nameEn": "BSc in Environmental Management and Technology",
    "nameZh": "理學士（環境管理及科技）",
    "name": "BSc in Environmental Management and Technology",
    "university": "香港科技大學",
    "faculty": "理學院",
    "median": 27,
    "band_a": 30,
    "category": "science"
}

details = {
    "code": "JS5812",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: MODERATELY COMPETITIVE. Best 5 typically 27-30 points.",
                    "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Chemistry or Biology at Level 3+ is preferred. Physics or Geography at Level 3+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Environmental volunteering, sustainability projects, and interest in climate change strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Environmental science, chemistry, ecology, statistics, and sustainability principles.",
                    "**Year 2 - Core EVMT**: Environmental chemistry, atmospheric science, water quality, waste management, and environmental law.",
                    "**Year 3 - Advanced Topics**: Climate change, renewable energy, environmental impact assessment, green technology, and corporate sustainability.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in environmental technology or environmental management. Complete research project.",
                    "**Available Tracks**: Environmental Technology, Environmental Management, Sustainable Development (select in Year 3).",
                    "**Field Work**: Environmental monitoring, site assessments, and visits to treatment facilities and renewable energy installations."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Environmental Consulting**: Environmental consultant at ERM, AECOM, and local environmental consultancies.",
                    "**Government & Regulatory**: Environmental protection officer at EPD, AFCD, and other government departments.",
                    "**Corporate Sustainability**: Sustainability manager and ESG analyst at corporations and listed companies.",
                    "**Renewable Energy**: Project developer and energy analyst at solar, wind, and clean tech companies.",
                    "**Waste Management**: Operations and planning at waste treatment and recycling facilities.",
                    "**Graduate Studies**: MSc/PhD in environmental science, environmental engineering, or sustainability management."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Environmental Labs**: Water quality lab, air quality monitoring station, and environmental chemistry facilities.",
                    "**Research Centers**: HKUST Institute for the Environment and Sustainable Energy Research Center.",
                    "**Field Stations**: Access to marine research stations and environmental monitoring sites.",
                    "**Industry Connections**: Partnerships with CLP, HK Electric, and environmental NGOs for internships.",
                    "**Student Community**: Active Environmental Society, sustainability initiatives, and green campus programs."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate (★★★☆☆). Growing interest due to climate change awareness.",
                    "**Academic Requirements**: Best 5 around 27-30. Science background is beneficial.",
                    "**Band A Competition**: Moderate. Band A placement improves chances.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Science foundation plus genuine interest in environmental issues.",
                    "**Trend**: Increasing demand as ESG investing and sustainability become corporate priorities."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Environmental Consultants**: Alumni at major environmental consulting firms in Hong Kong and Asia.",
                    "**Government Officers**: Graduates in environmental protection and conservation roles.",
                    "**Sustainability Leaders**: Corporate sustainability managers at MNCs and local listed companies.",
                    "**Researchers**: Alumni in environmental science graduate programs at top universities.",
                    "**Faculty Excellence**: HKUST EVMT faculty includes experts in atmospheric science, oceanography, and environmental policy."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers.",
                    "**Environmental Awards**: Scholarships for students committed to environmental causes.",
                    "**Research Grants**: Funding for undergraduate environmental research.",
                    "**Industry-Sponsored Scholarships**: From energy and environmental companies.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Environmental Management & Technology Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 28+. Chemistry or Biology at Level 4+ is helpful.",
                    "**Stay Informed on Climate**: Follow climate news, COP conferences, and environmental policy developments.",
                    "**Get Involved**: Volunteer with environmental NGOs, beach cleanups, or sustainability initiatives.",
                    "**Understand ESG**: Learn about Environmental, Social, and Governance frameworks increasingly important in business.",
                    "**Develop Scientific Skills**: Laboratory skills and data analysis are important for environmental monitoring careers."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：中等競爭。最佳五科通常27-30分。",
                    "**核心科目**：英文（Level 3+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：化學或生物達3級或以上優先考慮。物理或地理達3級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：環保義工、可持續發展項目及對氣候變化的興趣可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：環境科學、化學、生態學、統計及可持續發展原理。",
                    "**第二年 - 環境管理及科技核心**：環境化學、大氣科學、水質、廢物管理及環境法。",
                    "**第三年 - 高級課題**：氣候變化、可再生能源、環境影響評估、綠色科技及企業可持續發展。",
                    "**第四年 - 專修及專題**：選擇環境科技或環境管理專修。完成研究項目。",
                    "**可選方向**：環境科技、環境管理、可持續發展（第三年選擇）。",
                    "**實地考察**：環境監測、場地評估及處理設施和可再生能源設施考察。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**環境顧問**：於ERM、艾奕康及本地環境顧問公司擔任環境顧問。",
                    "**政府及監管**：於環保署、漁農自然護理署及其他政府部門擔任環境保護主任。",
                    "**企業可持續發展**：於企業及上市公司擔任可持續發展經理及ESG分析師。",
                    "**可再生能源**：於太陽能、風能及潔淨科技公司擔任項目開發人員及能源分析師。",
                    "**廢物管理**：於廢物處理及回收設施擔任營運及規劃。",
                    "**研究生課程**：攻讀環境科學、環境工程或可持續發展管理理學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**環境實驗室**：水質實驗室、空氣質素監測站及環境化學設施。",
                    "**研究中心**：科大環境研究所及可持續能源研究中心。",
                    "**實地考察站**：可使用海洋研究站及環境監測站點。",
                    "**產業聯繫**：與中電、港燈及環保非政府組織合作提供實習。",
                    "**學生社群**：活躍的環境學會、可持續發展倡議及綠色校園項目。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中等（★★★☆☆）。由於氣候變化意識，興趣持續增長。",
                    "**學術要求**：最佳五科約27-30分。科學背景有益。",
                    "**Band A競爭**：中等。Band A選擇可提升機會。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：科學基礎加上對環境議題的 genuine 興趣。",
                    "**趨勢**：隨著ESG投資及可持續發展成為企業優先事項，需求持續增加。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**環境顧問**：校友於香港及亞洲主要環境顧問公司。",
                    "**政府官員**：畢業生於環境保護及保育角色。",
                    "**可持續發展領袖**：跨國企業及本地上市公司的企業可持續發展經理。",
                    "**研究人員**：校友於頂尖大學攻讀環境科學研究生課程。",
                    "**教職員卓越**：科大環境管理及科技教職員包括大氣科學、海洋學及環境政策專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越的學生。",
                    "**環境獎項**：致力環保事業學生的獎學金。",
                    "**研究資助**：本科生環境研究資金。",
                    "**業界贊助獎學金**：能源及環境公司的獎學金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大環境管理及科技攻略",
                "content": [
                    "**分數目標**：最佳五科目標28分以上。化學或生物達4級有幫助。",
                    "**了解氣候動態**：追蹤氣候新聞、聯合國氣候變化大會及環境政策發展。",
                    "**參與其中**：於環保非政府組織、海灘清潔或可持續發展倡議做義工。",
                    "**了解ESG**：學習對商業越來越重要的環境、社會及管治框架。",
                    "**培養科學技能**：實驗室技能及數據分析對環境監測事業很重要。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
