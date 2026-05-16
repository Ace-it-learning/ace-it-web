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

# JS5230 - Department of Civil and Environmental Engineering / 土木及環境工程學系
programme = {
    "code": "JS5230",
    "nameEn": "Department of Civil and Environmental Engineering",
    "nameZh": "土木及環境工程學系",
    "name": "Civil and Environmental Engineering",
    "university": "香港科技大學",
    "faculty": "工學院",
    "median": 27,
    "band_a": 30,
    "category": "engineering"
}

details = {
    "code": "JS5230",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: MODERATELY COMPETITIVE. Best 5 typically 27-30 points.",
                    "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Physics at Level 4+ is highly preferred. Chemistry or Biology at Level 3+ is beneficial. Mathematics Extended Part (M1/M2) is advantageous for structural analysis.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Interest in infrastructure, sustainability, and community development. Participation in engineering-related activities is beneficial."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Engineering Foundation**: Mathematics, physics, mechanics, programming, and introduction to civil engineering.",
                    "**Year 2 - Core CE**: Structural analysis, soil mechanics, fluid mechanics, construction materials, and surveying.",
                    "**Year 3 - Advanced Topics**: Structural design, geotechnical engineering, transportation engineering, and environmental engineering.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in structural engineering, geotechnical engineering, environmental engineering, or infrastructure management. Complete design project.",
                    "**Available Majors**: Civil Engineering, Environmental Engineering (select in Year 2).",
                    "**Field Work**: Site visits, surveying camps, and laboratory testing of construction materials."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Construction & Infrastructure**: Structural engineer, project manager, and site engineer at construction firms and developers.",
                    "**Government & Public Works**: Civil engineers at Housing Department, Drainage Services Department, and Architectural Services Department.",
                    "**Consulting Engineering**: Design and consulting roles at Arup, AECOM, and local engineering consultancies.",
                    "**Environmental Engineering**: Waste management, water treatment, air quality, and sustainability consulting.",
                    "**Transportation**: Traffic engineering, transport planning, and railway infrastructure at MTR and Transport Department.",
                    "**Graduate Studies**: MPhil/PhD in structural engineering, geotechnics, or environmental engineering."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Engineering Labs**: Structural testing lab, geotechnical lab, hydraulics lab, and environmental engineering lab.",
                    "**Field Equipment**: Surveying instruments, soil testing equipment, and concrete testing facilities.",
                    "**Research Centers**: HKUST Sustainable Energy Research Center and environmental research facilities.",
                    "**Industry Connections**: Partnerships with major contractors, consultants, and government departments for internships.",
                    "**Student Community**: Active civil engineering student society, concrete canoe competition team, and site visit programs."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate (★★★☆☆). Steady demand with strong employment prospects.",
                    "**Academic Requirements**: Best 5 around 27-30. Physics at Level 4+ is important.",
                    "**Band A Competition**: Moderate competition. Band A placement improves chances.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong physics and mathematics grades with interest in infrastructure.",
                    "**Trend**: Stable demand driven by Hong Kong's ongoing infrastructure projects and sustainability initiatives."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Industry Leaders**: Alumni in senior positions at major construction firms and engineering consultancies in Hong Kong and Asia.",
                    "**Government Engineers**: Graduates serving in government departments managing public infrastructure projects.",
                    "**Environmental Consultants**: Alumni leading sustainability and environmental impact assessment projects.",
                    "**Academic Researchers**: Graduates pursuing advanced degrees at MIT, Stanford, and Imperial College in civil engineering.",
                    "**Faculty Excellence**: HKUST CEE faculty includes experts in earthquake engineering, wind engineering, and sustainable construction."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong science and mathematics grades.",
                    "**Engineering Scholarships**: Merit-based awards for academic excellence in engineering disciplines.",
                    "**Industry-Sponsored Awards**: From construction and engineering companies supporting civil engineering students.",
                    "**Research Grants**: Funding for undergraduate research in civil and environmental engineering.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Civil & Environmental Engineering Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 28+. Physics at Level 4+ is the key subject.",
                    "**Strengthen Physics & Math**: These are fundamental for structural analysis, mechanics, and design calculations.",
                    "**Take M1/M2**: Mathematics Extended Part is highly beneficial for advanced structural and geotechnical analysis.",
                    "**Show Interest in Infrastructure**: Demonstrate awareness of Hong Kong's major construction projects and urban development challenges.",
                    "**Consider Sustainability**: Environmental engineering is a growing field. Show interest in green building and climate resilience."
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
                    "**必需選修科**：物理達4級或以上高度優先考慮。化學或生物達3級或以上有益。數學延伸部分（M1/M2）對結構分析有優勢。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：對基礎設施、可持續發展及社區發展的興趣。參與工程相關活動有益。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 工程基礎**：數學、物理、力學、編程及土木工程導論。",
                    "**第二年 - 土木工程核心**：結構分析、土力學、流體力學、建築材料及測量。",
                    "**第三年 - 高級課題**：結構設計、岩土工程、運輸工程及環境工程。",
                    "**第四年 - 專修及專題**：選擇結構工程、岩土工程、環境工程或基礎設施管理專修。完成設計項目。",
                    "**可選主修**：土木工程、環境工程（第二年選擇）。",
                    "**實地考察**：實地考察、測量營及建築材料實驗室測試。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**建築及基礎設施**：於建築公司及發展商擔任結構工程師、項目經理及工地工程師。",
                    "**政府及公共工程**：於房屋署、渠務署及建築署擔任土木工程師。",
                    "**工程顧問**：於奧雅納、艾奕康及本地工程顧問公司擔任設計及顧問職位。",
                    "**環境工程**：廢物管理、污水處理、空氣質素及可持續發展顧問。",
                    "**運輸**：於港鐵及運輸署從事交通工程、運輸規劃及鐵路基礎設施。",
                    "**研究生課程**：攻讀結構工程、岩土工程或環境工程哲學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**工程實驗室**：結構測試實驗室、土力學實驗室、水力學實驗室及環境工程實驗室。",
                    "**實地設備**：測量儀器、土壤測試設備及混凝土測試設施。",
                    "**研究中心**：科大可持續能源研究中心及環境研究設施。",
                    "**產業聯繫**：與主要承建商、顧問公司及政府部門合作提供實習。",
                    "**學生社群**：活躍的土木工程學生學會、混凝土獨木舟競賽隊伍及實地考察項目。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中等（★★★☆☆）。需求穩定，就業前景良好。",
                    "**學術要求**：最佳五科約27-30分。物理達4級或以上很重要。",
                    "**Band A競爭**：中等競爭。Band A選擇可提升機會。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異物理及數學成績，對基礎設施感興趣。",
                    "**趨勢**：由於香港持續進行的基礎設施項目及可持續發展倡議，需求穩定。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**業界領袖**：校友於香港及亞洲主要建築公司及工程顧問公司擔任高級職位。",
                    "**政府工程師**：畢業生於政府部門服務，管理公共基礎設施項目。",
                    "**環境顧問**：校友領導可持續發展及環境影響評估項目。",
                    "**學術研究人員**：畢業生於麻省理工學院、史丹福大學及倫敦帝國學院攻讀土木工程高級學位。",
                    "**教職員卓越**：科大土木及環境工程教職員包括地震工程、風工程及可持續建築專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且科學及數學成績優異的學生。",
                    "**工程獎學金**：按工程學科學術卓越頒發的優異獎。",
                    "**業界贊助獎項**：建築及工程公司支持土木工程學生的獎項。",
                    "**研究資助**：土木及環境工程本科生研究資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大土木及環境工程學攻略",
                "content": [
                    "**分數目標**：最佳五科目標28分以上。物理達4級或以上為關鍵科目。",
                    "**加強物理及數學**：這些是結構分析、力學及設計計算的基礎。",
                    "**修讀M1/M2**：數學延伸部分對高級結構及岩土分析高度有益。",
                    "**展示對基礎設施的興趣**：了解香港主要建築項目及城市發展挑戰。",
                    "**考慮可持續發展**：環境工程是增長中的領域。展示對綠色建築及氣候適應力的興趣。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
