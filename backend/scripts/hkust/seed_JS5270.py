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

# JS5270 - Department of Mechanical and Aerospace Engineering / 機械及航空航天工程學系
programme = {
    "code": "JS5270",
    "nameEn": "Department of Mechanical and Aerospace Engineering",
    "nameZh": "機械及航空航天工程學系",
    "name": "Mechanical and Aerospace Engineering",
    "university": "香港科技大學",
    "faculty": "工學院",
    "median": 28,
    "band_a": 31,
    "category": "engineering"
}

details = {
    "code": "JS5270",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: MODERATELY COMPETITIVE. Best 5 typically 28-31 points.",
                    "**Core Subjects**: English (Level 3+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Physics at Level 4+ is highly preferred. Mathematics Extended Part (M1/M2) is strongly recommended for advanced mechanics.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Interest in aviation, robotics, automotive technology, and mechanical design. Participation in robotics competitions or model aircraft clubs is beneficial."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Engineering Foundation**: Mathematics, physics, mechanics, materials science, and introduction to mechanical engineering.",
                    "**Year 2 - Core MAE**: Thermodynamics, fluid mechanics, solid mechanics, dynamics, and engineering design.",
                    "**Year 3 - Advanced Topics**: Aerodynamics, propulsion, control systems, mechatronics, and composite materials.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in aerospace, robotics, energy, or design. Complete design project.",
                    "**Available Majors**: Mechanical Engineering, Aerospace Engineering (select in Year 2).",
                    "**Laboratory Training**: Wind tunnel testing, engine testing, robotics lab, and CAD/CAM workshops."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Aerospace Industry**: Aircraft design, propulsion systems, and aerodynamics at Airbus, Boeing suppliers, and aviation companies.",
                    "**Automotive**: Vehicle design, powertrain development, and autonomous driving systems at EV manufacturers and suppliers.",
                    "**Robotics & Automation**: Robot design, industrial automation, and mechatronics at robotics companies and manufacturers.",
                    "**Energy Sector**: Turbine design, renewable energy systems, and thermal management at power companies.",
                    "**Product Design**: Consumer product design, industrial design, and manufacturing engineering.",
                    "**Graduate Studies**: MPhil/PhD in mechanical or aerospace engineering at top universities worldwide."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Engineering Labs**: Wind tunnel, engine test cell, robotics lab, materials testing lab, and 3D printing workshop.",
                    "**Research Centers**: HKUST Robotics Institute, Aerodynamics and Acoustics Facility, and Energy Research Center.",
                    "**Design Workshops**: CAD/CAM facilities, CNC machines, and rapid prototyping equipment for student projects.",
                    "**Industry Connections**: Partnerships with HAECO, Cathay Pacific Engineering, and automotive companies for internships.",
                    "**Student Community**: Active MAE student society, robotics competition team, and aerospace interest group."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Moderate to High (★★★☆☆). Steady demand with diverse career options.",
                    "**Academic Requirements**: Best 5 around 28-31. Physics at Level 4+ is important.",
                    "**Band A Competition**: Moderate competition. Band A placement improves admission chances.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong physics and mathematics grades with interest in mechanical systems and design.",
                    "**Trend**: Growing interest in aerospace and robotics due to Hong Kong's innovation and technology focus."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Aerospace Industry**: Alumni in aircraft engineering and design roles at aviation companies.",
                    "**Automotive Sector**: Graduates at EV manufacturers and automotive suppliers in design and R&D.",
                    "**Robotics Leaders**: Alumni founding robotics startups and working at drone and automation companies.",
                    "**Academic Researchers**: Graduates pursuing advanced degrees at MIT, Caltech, and Imperial College.",
                    "**Faculty Excellence**: HKUST MAE faculty includes experts in aerodynamics, combustion, and robotics research."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong physics and mathematics grades.",
                    "**Engineering Scholarships**: Merit-based awards for academic excellence in engineering.",
                    "**Industry-Sponsored Awards**: From aviation, automotive, and robotics companies supporting MAE students.",
                    "**Competition Grants**: Funding for robotics competitions, design challenges, and aerospace projects.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Mechanical & Aerospace Engineering Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 29+. Physics at Level 4+ is the key subject.",
                    "**Master Physics & Mathematics**: These are essential for understanding mechanics, thermodynamics, and aerodynamics.",
                    "**Take M1/M2**: Mathematics Extended Part is highly beneficial for advanced engineering mathematics.",
                    "**Explore Design Interest**: Show interest in how things work, mechanical systems, and aviation technology.",
                    "**Join Robotics or Aviation Clubs**: Hands-on experience with robots, drones, or model aircraft demonstrates practical interest."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：中等競爭。最佳五科通常28-31分。",
                    "**核心科目**：英文（Level 3+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：物理達4級或以上高度優先考慮。數學延伸部分（M1/M2）對高級力學強烈建議。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：對航空、機械人、汽車科技及機械設計的興趣。參與機械人競賽或模型飛機學會有益。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 工程基礎**：數學、物理、力學、材料科學及機械工程導論。",
                    "**第二年 - 機械及航空航天工程核心**：熱力學、流體力學、固體力學、動力學及工程設計。",
                    "**第三年 - 高級課題**：空氣動力學、推進系統、控制系統、機電一體化及複合材料。",
                    "**第四年 - 專修及專題**：選擇航空航天、機械人、能源或設計專修。完成設計項目。",
                    "**可選主修**：機械工程、航空航天工程（第二年選擇）。",
                    "**實驗室培訓**：風洞測試、引擎測試、機械人實驗室及電腦輔助設計/製造工作坊。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**航空航天業**：於空中巴士、波音供應商及航空公司從事飛機設計、推進系統及空氣動力學。",
                    "**汽車業**：於電動車製造商及供應商從事車輛設計、動力總成開發及自動駕駛系統。",
                    "**機械人及自動化**：於機械人公司及製造商從事機械人設計、工業自動化及機電一體化。",
                    "**能源界別**：於電力公司從事渦輪設計、可再生能源系統及熱管理。",
                    "**產品設計**：消費產品設計、工業設計及製造工程。",
                    "**研究生課程**：於全球頂尖大學攻讀機械或航空航天工程哲學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**工程實驗室**：風洞、引擎測試室、機械人實驗室、材料測試實驗室及3D打印工作坊。",
                    "**研究中心**：科大機械人研究所、空氣動力學及聲學設施及能源研究中心。",
                    "**設計工作坊**：電腦輔助設計/製造設施、數控機床及學生項目的快速原型設備。",
                    "**產業聯繫**：與香港飛機工程、國泰航空工程及汽車公司合作提供實習。",
                    "**學生社群**：活躍的機械及航空航天工程學生學會、機械人競賽隊伍及航空航天興趣小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：中至高（★★★☆☆）。需求穩定，職業選擇多樣。",
                    "**學術要求**：最佳五科約28-31分。物理達4級或以上很重要。",
                    "**Band A競爭**：中等競爭。Band A選擇可提升入學機會。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異物理及數學成績，對機械系統及設計感興趣。",
                    "**趨勢**：由於香港創新科技專注，航空航天及機械人領域興趣持續增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**航空航天業**：校友於航空公司擔任飛機工程及設計職位。",
                    "**汽車界別**：畢業生於電動車製造商及汽車供應商從事設計及研發。",
                    "**機械人領袖**：校友創立機械人初創企業及於無人機及自動化公司工作。",
                    "**學術研究人員**：畢業生於麻省理工學院、加州理工學院及倫敦帝國學院攻讀高級學位。",
                    "**教職員卓越**：科大機械及航空航天工程教職員包括空氣動力學、燃燒及機械人研究專家。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且物理及數學成績優異的學生。",
                    "**工程獎學金**：按工程學科學術卓越頒發的優異獎。",
                    "**業界贊助獎項**：航空、汽車及機械人公司支持機械及航空航天工程學生的獎項。",
                    "**競賽資助**：機械人競賽、設計挑戰及航空航天項目的資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大機械及航空航天工程學攻略",
                "content": [
                    "**分數目標**：最佳五科目標29分以上。物理達4級或以上為關鍵科目。",
                    "**掌握物理及數學**：這些對理解力學、熱力學及空氣動力學至關重要。",
                    "**修讀M1/M2**：數學延伸部分對高級工程數學高度有益。",
                    "**探索設計興趣**：展示對事物運作方式、機械系統及航空科技的興趣。",
                    "**加入機械人或航空學會**：機械人、無人機或模型飛機的動手經驗展示實踐興趣。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
