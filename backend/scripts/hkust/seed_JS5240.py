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

# JS5240 - Department of Computer Science and Engineering / 計算機科學及工程學系
programme = {
    "code": "JS5240",
    "nameEn": "Department of Computer Science and Engineering",
    "nameZh": "計算機科學及工程學系",
    "name": "Computer Science and Engineering",
    "university": "香港科技大學",
    "faculty": "工學院",
    "median": 34,
    "band_a": 37,
    "category": "engineering"
}

details = {
    "code": "JS5240",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: VERY COMPETITIVE. One of the most popular engineering programmes. Best 5 typically 34-37 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 5 or above is STRONGLY RECOMMENDED. Physics or Information and Communication Technology (ICT) at Level 4+ is beneficial.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Programming projects, coding competition experience (HKOI, ICPC), and tech-related extracurriculars significantly strengthen applications."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Programming fundamentals, discrete mathematics, linear algebra, and computer systems.",
                    "**Year 2 - Core CS**: Data structures, algorithms, object-oriented programming, computer organization, and software engineering.",
                    "**Year 3 - Advanced Topics**: Operating systems, databases, computer networks, AI/machine learning, and cybersecurity.",
                    "**Year 4 - Specialization & Capstone**: Choose specialization in AI, data science, cybersecurity, or software engineering. Complete final year project.",
                    "**Available Majors**: Computer Science (BSc) and Computer Engineering (BEng) tracks available.",
                    "**Practical Training**: Extensive coding assignments, team software projects, and industry internship opportunities."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Software Engineering**: Software developer, backend engineer, and full-stack developer at tech giants (Google, Meta, Microsoft, ByteDance, Tencent).",
                    "**AI & Machine Learning**: ML engineer, AI researcher, and data scientist at AI labs and research institutions.",
                    "**Quantitative Finance**: Algorithmic trading, quantitative research, and fintech development at investment banks and hedge funds.",
                    "**Cybersecurity**: Security engineer, penetration tester, and security analyst at banks, government, and tech companies.",
                    "**Cloud & Infrastructure**: Site reliability engineer, DevOps engineer, and cloud architect at AWS, Azure, and GCP.",
                    "**Graduate Studies**: MPhil/PhD in computer science at MIT, Stanford, CMU, and other top institutions."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**Computing Facilities**: High-performance computing clusters, GPU servers, and dedicated programming labs with Linux workstations.",
                    "**Research Centers**: HKUST Big Data Institute, AI Research Center, and Cybersecurity Lab.",
                    "**Collaboration Spaces**: 24/7 coding spaces, hackathon venues, and project team rooms.",
                    "**Industry Partnerships**: Close ties with Google, Microsoft, Alibaba, Tencent, and local tech startups for internships.",
                    "**Student Community**: Active ACM student chapter, programming competition team, and open-source development groups."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Very High (★★★★★). One of the most competitive and popular engineering programmes.",
                    "**Academic Requirements**: Best 5 around 34-37. Level 5* in Mathematics and M1/M2 strongly preferred.",
                    "**Band A Competition**: Intense competition. Band A placement is essential.",
                    "**Interview Weighting**: Low. Academic-based admission with emphasis on mathematics and logical reasoning.",
                    "**What Differentiates Winners**: Strong mathematics (especially M1/M2) plus demonstrated coding ability and programming interest.",
                    "**Trend**: Consistently highest demand due to tech industry growth, AI boom, and excellent salary prospects."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Tech Giants**: Alumni in senior engineering roles at Google, Meta, Apple, and Microsoft worldwide.",
                    "**AI Leaders**: Graduates at OpenAI, DeepMind, Anthropic, and leading Chinese AI companies.",
                    "**Entrepreneurs**: Founders of successful tech startups including unicorns in fintech, SaaS, and AI.",
                    "**Academia**: Alumni as professors at top universities and researchers at prestigious labs.",
                    "**Faculty Excellence**: HKUST CSE faculty includes ACM Fellows, IEEE Fellows, and researchers with top conference publications."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with exceptional mathematics grades.",
                    "**CSE Excellence Scholarship**: Special awards for students with demonstrated programming aptitude.",
                    "**Industry-Sponsored Awards**: From tech companies supporting CS talent development.",
                    "**Competition Grants**: Funding for participating in programming competitions and hackathons.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Computer Science & Engineering Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 35+. Mathematics (including M1/M2) at 5* or above is crucial.",
                    "**Master Mathematics**: M1/M2 is essential. Algorithms and AI require strong mathematical foundation.",
                    "**Code Early and Often**: Start programming in Python, C++, or Java before university. Build projects, not just tutorials.",
                    "**Compete in HKOI**: Hong Kong Olympiad in Informatics is excellent preparation and strengthens your application.",
                    "**Build a Portfolio**: Create GitHub projects, contribute to open source, or develop apps to demonstrate skills."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：非常競爭。最受歡迎的工程課程之一。最佳五科通常34-37分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達5級或以上強烈建議。物理或資訊及通訊科技（ICT）達4級或以上有益。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：編程項目、編程競賽經驗（香港電腦奧林匹克、ICPC）及科技相關課外活動可顯著加強申請。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：編程基礎、離散數學、線性代數及計算機系統。",
                    "**第二年 - 計算機科學核心**：數據結構、演算法、物件導向編程、計算機組織及軟件工程。",
                    "**第三年 - 高級課題**：操作系統、數據庫、計算機網絡、人工智能/機器學習及網絡安全。",
                    "**第四年 - 專修及專題**：選擇人工智能、數據科學、網絡安全或軟件工程專修。完成畢業專題項目。",
                    "**可選主修**：計算機科學（理學士）及計算機工程（工學士）方向可供選擇。",
                    "**實踐培訓**：廣泛編程作業、團隊軟件項目及產業實習機會。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**軟件工程**：於科技巨頭（Google、Meta、微軟、字節跳動、騰訊）擔任軟件開發人員、後端工程師及全端開發人員。",
                    "**人工智能及機器學習**：於人工智能實驗室及研究機構擔任機器學習工程師、人工智能研究員及數據科學家。",
                    "**量化金融**：於投資銀行及對沖基金從事算法交易、量化研究及金融科技開發。",
                    "**網絡安全**：於銀行、政府及科技公司擔任安全工程師、滲透測試員及安全分析師。",
                    "**雲端及基礎設施**：於AWS、Azure及GCP擔任站點可靠性工程師、DevOps工程師及雲端架構師。",
                    "**研究生課程**：於麻省理工學院、史丹福大學、卡內基梅隆大學及其他頂尖機構攻讀計算機科學哲學碩士/博士。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**計算設施**：高性能計算集群、GPU伺服器及配備Linux工作站的專門編程實驗室。",
                    "**研究中心**：科大大數據研究所、人工智能研究中心及網絡安全實驗室。",
                    "**協作空間**：24小時編程空間、黑客松場地及項目團隊房間。",
                    "**產業夥伴關係**：與Google、微軟、阿里巴巴、騰訊及本地科技初創企業緊密聯繫，提供實習機會。",
                    "**學生社群**：活躍的ACM學生分會、編程競賽隊伍及開源開發小組。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。最競爭及最受歡迎的工程課程之一。",
                    "**學術要求**：最佳五科約34-37分。數學及M1/M2達5*級強烈優先考慮。",
                    "**Band A競爭**：競爭激烈。Band A選擇至關重要。",
                    "**面試比重**：低。以學術成績為基礎入學，重視數學及邏輯推理。",
                    "**成功申請者特質**：強大數學（尤其是M1/M2）加上展示的編程能力及編程興趣。",
                    "**趨勢**：由於科技行業增長、人工智能蓬勃及優厚薪酬前景，需求持續最高。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**科技巨頭**：校友於全球Google、Meta、蘋果及微軟擔任高級工程職位。",
                    "**人工智能領袖**：畢業生於OpenAI、DeepMind、Anthropic及中國領先人工智能公司。",
                    "**創業家**：創立成功的科技初創企業，包括金融科技、SaaS及人工智能獨角獸。",
                    "**學術界**：校友於頂尖大學擔任教授及於著名實驗室擔任研究人員。",
                    "**教職員卓越**：科大計算機科學及工程教職員包括ACM院士、IEEE院士及頂尖會議出版物研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且數學成績優異的學生。",
                    "**計算機科學及工程卓越獎學金**：專為展示編程能力的學生而設的特別獎項。",
                    "**業界贊助獎項**：科技公司支持計算機科學人才發展的獎項。",
                    "**競賽資助**：參與編程競賽及黑客松的資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大計算機科學及工程學攻略",
                "content": [
                    "**分數目標**：最佳五科目標35分以上。數學（包括M1/M2）達5*級至關重要。",
                    "**掌握數學**：M1/M2為必需。演算法及人工智能需要強大數學基礎。",
                    "**及早及經常編程**：大學前開始以Python、C++或Java編程。建立項目，不僅是教程。",
                    "**參加香港電腦奧林匹克**：香港電腦奧林匹克是極佳準備並可加強你的申請。",
                    "**建立作品集**：創建GitHub項目、貢獻開源或開發應用程式以展示技能。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
