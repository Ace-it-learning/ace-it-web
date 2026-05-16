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

# JS5250 - Department of Electronic and Computer Engineering / 電子及計算機工程學系
programme = {
    "code": "JS5250",
    "nameEn": "Department of Electronic and Computer Engineering",
    "nameZh": "電子及計算機工程學系",
    "name": "Electronic and Computer Engineering",
    "university": "香港科技大學",
    "faculty": "工學院",
    "median": 32,
    "band_a": 35,
    "category": "engineering"
}

details = {
    "code": "JS5250",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Strong demand for electronics and communications. Best 5 typically 32-35 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Physics at Level 4+ is highly preferred. Mathematics Extended Part (M1/M2) is strongly recommended. Information and Communication Technology (ICT) is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Electronics projects, robotics experience, programming skills, and technology competition participation strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Engineering Foundation**: Mathematics, physics, programming, circuits, and introduction to electronic engineering.",
                    "**Year 2 - Core ECE**: Signals and systems, digital logic, microprocessors, electromagnetics, and electronic circuits.",
                    "**Year 3 - Advanced Topics**: Communication systems, control systems, VLSI design, embedded systems, and optoelectronics.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in communications, microelectronics, or intelligent systems. Complete design project.",
                    "**Available Majors**: Electronic Engineering, Computer Engineering (select in Year 2).",
                    "**Laboratory Training**: Hands-on experience with oscilloscopes, spectrum analyzers, FPGA boards, and communication system prototypes."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Semiconductor & Chip Design**: IC design, verification, and testing at MediaTek, Qualcomm, and local fabless design houses.",
                    "**Telecommunications**: 5G/6G R&D, RF engineering, and network infrastructure at Huawei, Ericsson, and telecom operators.",
                    "**Consumer Electronics**: Hardware design at Apple, Samsung, Sony, and Xiaomi for smartphones, wearables, and IoT devices.",
                    "**Automotive Electronics**: EV power electronics, autonomous driving systems, and vehicle communication at BYD, Tesla suppliers.",
                    "**Embedded Systems**: Firmware development, IoT solutions, and real-time systems for industrial and consumer applications.",
                    "**Graduate Studies**: MPhil/PhD in electronic engineering, communications, or microelectronics at top universities."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Engineering Labs**: RF and microwave lab, VLSI design lab, communications lab, and embedded systems lab with industry-standard equipment.",
                    "**Research Centers**: HKUST Integrated Circuits Design Center, Wireless Communications Research Center, and photonics labs.",
                    "**Prototyping Facilities**: PCB fabrication, soldering stations, and testing equipment for student projects.",
                    "**Industry Partnerships**: Collaborations with semiconductor, telecom, and electronics companies for internships and joint projects.",
                    "**Student Community**: Active IEEE student branch, robotics and drone teams, and electronics hobbyist groups."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: High (★★★★☆). Strong demand driven by semiconductor and telecommunications industries.",
                    "**Academic Requirements**: Best 5 around 32-35. Physics at Level 5 is important.",
                    "**Band A Competition**: Strong competition. Band A placement significantly improves chances.",
                    "**Interview Weighting**: Low. Academic-based admission.",
                    "**What Differentiates Winners**: Strong physics and mathematics grades with interest in electronics and technology.",
                    "**Trend**: Growing demand due to global chip shortage, 5G rollout, and Hong Kong's push for innovation and technology."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Semiconductor Industry**: Alumni in chip design and R&D at NVIDIA, AMD, and TSMC.",
                    "**Telecommunications Leaders**: Graduates at Huawei, ZTE, and Ericsson in 5G and wireless communications.",
                    "**Tech Entrepreneurs**: Founders of hardware startups in IoT, robotics, and wearable technology.",
                    "**Academic Excellence**: Alumni pursuing graduate studies at MIT, Stanford, and Berkeley in electrical engineering.",
                    "**Faculty Recognition**: HKUST ECE faculty includes IEEE Fellows and researchers with extensive industry experience."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong physics and mathematics grades.",
                    "**Engineering Excellence Awards**: Merit-based scholarships for top engineering students.",
                    "**Industry-Sponsored Scholarships**: From electronics and semiconductor companies supporting talent development.",
                    "**Innovation Grants**: Funding for student-led electronics projects and competition participation.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Electronic & Computer Engineering Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 33+. Physics at Level 5 is the key subject.",
                    "**Master Physics & Math**: These are fundamental for understanding circuits, signals, and electromagnetics.",
                    "**Take M1/M2**: Mathematics Extended Part helps with signal processing, control systems, and communications theory.",
                    "**Build Electronics Projects**: Start with Arduino, Raspberry Pi, or simple circuit projects to demonstrate hands-on interest.",
                    "**Follow Tech Trends**: Stay informed about semiconductor industry, 5G/6G development, and AI chip innovations."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。電子及通訊領域需求殷切。最佳五科通常32-35分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：物理達4級或以上高度優先考慮。數學延伸部分（M1/M2）強烈建議。資訊及通訊科技（ICT）有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：電子項目、機械人經驗、編程技能及科技競賽參與可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 工程基礎**：數學、物理、編程、電路及電子工程導論。",
                    "**第二年 - 電子及計算機工程核心**：信號與系統、數碼邏輯、微處理器、電磁學及電子電路。",
                    "**第三年 - 高級課題**：通訊系統、控制系統、超大規模集成電路設計、嵌入式系統及光電子學。",
                    "**第四年 - 專修及專題**：選擇通訊、微電子或智能系統專修。完成設計項目。",
                    "**可選主修**：電子工程、計算機工程（第二年選擇）。",
                    "**實驗室培訓**：使用示波器、頻譜分析儀、FPGA板及通訊系統原型的實踐經驗。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**半導體及芯片設計**：於聯發科、高通及本地無廠房設計公司擔任集成電路設計、驗證及測試。",
                    "**電訊**：於華為、愛立信及電訊營運商從事5G/6G研發、射頻工程及網絡基礎設施。",
                    "**消費電子**：於蘋果、三星、索尼及小米為智能手機、可穿戴設備及物聯網設備進行硬件設計。",
                    "**汽車電子**：於比亞迪、特斯拉供應商從事電動車電力電子、自動駕駛系統及車輛通訊。",
                    "**嵌入式系統**：工業及消費應用的固件開發、物聯網解決方案及實時系統。",
                    "**研究生課程**：於頂尖大學攻讀電子工程、通訊或微電子哲學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**工程實驗室**：射頻及微波實驗室、超大規模集成電路設計實驗室、通訊實驗室及配備業界標準設備的嵌入式系統實驗室。",
                    "**研究中心**：科大集成電路設計中心、無線通訊研究中心及光子學實驗室。",
                    "**原型設施**：學生項目的印刷電路板製作、焊接站及測試設備。",
                    "**產業夥伴關係**：與半導體、電訊及電子公司合作提供實習及聯合項目。",
                    "**學生社群**：活躍的IEEE學生分會、機械人及無人機隊伍及電子愛好者小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：高（★★★★☆）。由於半導體及電訊行業，需求強勁。",
                    "**學術要求**：最佳五科約32-35分。物理達5級很重要。",
                    "**Band A競爭**：競爭激烈。Band A選擇可顯著提升機會。",
                    "**面試比重**：低。以學術成績為基礎入學。",
                    "**成功申請者特質**：優異物理及數學成績，對電子及科技感興趣。",
                    "**趨勢**：由於全球芯片短缺、5G推出及香港推動創新科技，需求持續增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**半導體行業**：校友於NVIDIA、AMD及台積電擔任芯片設計及研發。",
                    "**電訊領袖**：畢業生於華為、中興及愛立信從事5G及無線通訊。",
                    "**科技創業家**：創立物聯網、機械人及可穿戴技術硬件初創企業。",
                    "**學術卓越**：校友於麻省理工學院、史丹福大學及伯克利大學攻讀電機工程研究生課程。",
                    "**教職員認可**：科大電子及計算機工程教職員包括IEEE院士及具備豐富業界經驗的研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且物理及數學成績優異的學生。",
                    "**工程卓越獎**：頒予頂尖工程學生的優異獎學金。",
                    "**業界贊助獎學金**：電子及半導體公司支持人才發展的獎學金。",
                    "**創新資助**：學生主導電子項目及競賽參與的資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大電子及計算機工程學攻略",
                "content": [
                    "**分數目標**：最佳五科目標33分以上。物理達5級為關鍵科目。",
                    "**掌握物理及數學**：這些是理解電路、信號及電磁學的基礎。",
                    "**修讀M1/M2**：數學延伸部分有助於信號處理、控制系統及通訊理論。",
                    "**建立電子項目**：以Arduino、樹莓派或簡單電路項目開始展示動手興趣。",
                    "**追蹤科技趨勢**：了解半導體行業、5G/6G發展及人工智能芯片創新。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
