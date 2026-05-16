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

# JS5212 - BEng in Computer Engineering / 工學士（計算機工程學）
programme = {
    "code": "JS5212",
    "nameEn": "BEng in Computer Engineering",
    "nameZh": "工學士（計算機工程學）",
    "name": "BEng in Computer Engineering",
    "university": "香港科技大學",
    "faculty": "工學院",
    "median": 33,
    "band_a": 36,
    "category": "engineering"
}

details = {
    "code": "JS5212",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Strong demand from students interested in hardware-software integration. Best 5 typically 33-36 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 4+ is STRONGLY RECOMMENDED. Physics at Level 4+ highly preferred. Information and Communication Technology (ICT) is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Programming projects, robotics competitions, hardware tinkering experience, and tech-related extracurriculars strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Engineering Foundation**: Mathematics, physics, programming, digital logic, and introduction to computer engineering.",
                    "**Year 2 - Core CE**: Computer architecture, data structures, algorithms, circuits and systems, and signals and systems.",
                    "**Year 3 - Advanced Topics**: VLSI design, embedded systems, computer networks, operating systems, and machine learning hardware.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in IC design, embedded AI, or networking. Complete final year project.",
                    "**Hardware-Software Integration**: Unique focus on both digital hardware design and software systems, bridging the gap between EE and CS.",
                    "**Laboratory Training**: Extensive hands-on work with FPGA boards, microcontroller systems, and circuit design tools."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Semiconductor Industry**: IC design, verification, and testing roles at MediaTek, Qualcomm, AMD, and local chip design companies.",
                    "**Hardware Engineering**: Embedded systems, IoT device development, and consumer electronics at Apple, Samsung, and Huawei.",
                    "**Software Development**: Full-stack development, systems programming, and firmware engineering at tech companies.",
                    "**AI Hardware**: Accelerator design, edge AI deployment, and neural network optimization at AI chip startups.",
                    "**Telecommunications**: 5G/6G infrastructure, network engineering, and wireless systems at Ericsson, Nokia, and telecom providers.",
                    "**Graduate Studies**: MPhil/PhD in computer engineering, VLSI design, or embedded systems at top universities."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Engineering Labs**: State-of-the-art VLSI design lab, embedded systems lab, and networking lab with industry-standard equipment.",
                    "**FPGA & Hardware**: Access to Xilinx and Intel FPGA boards, ARM development kits, and oscilloscopes for hands-on learning.",
                    "**Maker Spaces**: 3D printing, PCB fabrication, and prototyping facilities for student projects and competitions.",
                    "**Industry Partnerships**: Collaborations with semiconductor companies for internships, guest lectures, and sponsored projects.",
                    "**Student Community**: Active IEEE student branch, robotics team, and programming competitions. Regular hackathons and coding challenges."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Very High (★★★★★). High demand due to booming semiconductor and AI hardware industries.",
                    "**Academic Requirements**: Best 5 around 33-36. Level 5 in Mathematics and Physics strongly preferred.",
                    "**Band A Competition**: Intense competition. Band A placement essential for admission.",
                    "**Interview Weighting**: Low. Primarily academic-based selection.",
                    "**What Differentiates Winners**: Strong mathematics and physics grades plus M1/M2 performance. ICT background is a plus.",
                    "**Trend**: Surging demand driven by global chip shortage, AI hardware boom, and Hong Kong's push for semiconductor industry development."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Semiconductor Leaders**: Alumni in chip design and verification roles at NVIDIA, Intel, and TSMC.",
                    "**Tech Giants**: Graduates at Apple, Google, and Microsoft in hardware and systems engineering positions.",
                    "**Startups**: Founders of hardware startups in IoT, robotics, and AI accelerators.",
                    "**Academia**: Alumni pursuing graduate studies at MIT, Stanford, Berkeley, and ETH Zurich in computer engineering.",
                    "**Faculty Excellence**: HKUST CE faculty includes IEEE Fellows, ACM Distinguished Scientists, and researchers with industry experience at major tech companies."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong mathematics and science grades.",
                    "**Engineering Excellence Awards**: Merit-based scholarships for top engineering students.",
                    "**Industry-Sponsored Scholarships**: From semiconductor and tech companies supporting engineering talent.",
                    "**Innovation Grants**: Funding for student-led hardware projects and competition participation.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Computer Engineering Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 34+. Mathematics (including M1/M2) and Physics at 5 or above is crucial.",
                    "**Master Mathematics & Physics**: These form the foundation of circuit analysis, signal processing, and algorithm design.",
                    "**Learn to Code**: Python and C/C++ are essential. Start with Arduino or Raspberry Pi projects for hardware exposure.",
                    "**Build Hardware Projects**: Create simple circuits, LED displays, or sensor projects to demonstrate hands-on interest.",
                    "**Follow Chip Industry**: Stay informed about semiconductor trends, AI chips, and Hong Kong's tech development initiatives."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。深受對軟硬件整合感興趣的學生歡迎。最佳五科通常33-36分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達4級或以上強烈建議。物理達4級或以上高度優先考慮。資訊及通訊科技（ICT）有幫助。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：編程項目、機械人競賽、硬件動手經驗及科技相關課外活動可加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 工程基礎**：數學、物理、編程、數碼邏輯及計算機工程導論。",
                    "**第二年 - 計算機工程核心**：計算機架構、數據結構、演算法、電路與系統及信號與系統。",
                    "**第三年 - 高級課題**：超大規模集成電路設計、嵌入式系統、計算機網絡、操作系統及機器學習硬件。",
                    "**第四年 - 專修及專題**：選擇集成電路設計、嵌入式人工智能或網絡專修。完成畢業專題項目。",
                    "**軟硬件整合**：獨特專注於數碼硬件設計及軟件系統兩者，連接電機工程與計算機科學之間的橋樑。",
                    "**實驗室培訓**：使用FPGA板、微控制器系統及電路設計工具進行廣泛實踐工作。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**半導體行業**：於聯發科、高通、AMD及本地芯片設計公司擔任集成電路設計、驗證及測試職位。",
                    "**硬件工程**：於蘋果、三星及華為從事嵌入式系統、物聯網設備開發及消費電子產品。",
                    "**軟件開發**：於科技公司擔任全端開發、系統編程及固件工程。",
                    "**人工智能硬件**：於人工智能芯片初創企業擔任加速器設計、邊緣人工智能部署及神經網絡優化。",
                    "**電訊**：於愛立信、諾基亞及電訊供應商從事5G/6G基礎設施、網絡工程及無線系統。",
                    "**研究生課程**：於頂尖大學攻讀計算機工程、超大規模集成電路設計或嵌入式系統哲學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**工程實驗室**：最先進的超大規模集成電路設計實驗室、嵌入式系統實驗室及配備業界標準設備的網絡實驗室。",
                    "**FPGA及硬件**：可使用Xilinx及Intel FPGA板、ARM開發套件及示波器進行實踐學習。",
                    "**創客空間**：3D打印、印刷電路板製作及學生項目和競賽的原型設施。",
                    "**產業夥伴關係**：與半導體公司合作進行實習、客席講座及贊助項目。",
                    "**學生社群**：活躍的IEEE學生分會、機械人隊伍及編程競賽。定期黑客松及編程挑戰。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。由於半導體及人工智能硬件行業蓬勃，需求殷切。",
                    "**學術要求**：最佳五科約33-36分。數學及物理達5級強烈優先考慮。",
                    "**Band A競爭**：競爭激烈。Band A選擇對入學至關重要。",
                    "**面試比重**：低。主要以學術成績為基礎遴選。",
                    "**成功申請者特質**：優異數學及物理成績加上M1/M2表現。ICT背景為加分項。",
                    "**趨勢**：由於全球芯片短缺、人工智能硬件蓬勃及香港推動半導體行業發展，需求激增。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**半導體領袖**：校友於NVIDIA、英特爾及台積電擔任芯片設計及驗證職位。",
                    "**科技巨頭**：畢業生於蘋果、Google及微軟擔任硬件及系統工程職位。",
                    "**初創企業**：創立物聯網、機械人及人工智能加速器硬件初創企業。",
                    "**學術界**：校友於麻省理工學院、史丹福大學、伯克利大學及蘇黎世聯邦理工學院攻讀計算機工程研究生課程。",
                    "**教職員卓越**：科大計算機工程教職員包括IEEE院士、ACM傑出科學家及於主要科技公司具備業界經驗的研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且數學及科學成績優異的學生。",
                    "**工程卓越獎**：頒予頂尖工程學生的優異獎學金。",
                    "**業界贊助獎學金**：半導體及科技公司支持工程人才的獎學金。",
                    "**創新資助**：學生主導硬件項目及競賽參與的資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大計算機工程學攻略",
                "content": [
                    "**分數目標**：最佳五科目標34分以上。數學（包括M1/M2）及物理達5級至關重要。",
                    "**掌握數學及物理**：這些構成電路分析、信號處理及演算法設計的基礎。",
                    "**學習編程**：Python及C/C++為必需。以Arduino或樹莓派項目開始獲得硬件接觸經驗。",
                    "**建立硬件項目**：創建簡單電路、LED顯示屏或傳感器項目以展示動手興趣。",
                    "**追蹤芯片行業**：了解半導體趨勢、人工智能芯片及香港科技發展倡議。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
