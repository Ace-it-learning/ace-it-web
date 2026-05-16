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

# JS5181 - Science (Group A) with Extended Major in Artificial Intelligence / 理學Ａ組–人工智能延伸主修
programme = {
    "code": "JS5181",
    "nameEn": "Science (Group A) with Extended Major in Artificial Intelligence",
    "nameZh": "理學Ａ組–人工智能延伸主修",
    "name": "Science (Group A) with Extended Major in AI",
    "university": "香港科技大學",
    "faculty": "理學院",
    "median": 34,
    "band_a": 37,
    "category": "science"
}

details = {
    "code": "JS5181",
    "university": "香港科技大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Academic Threshold**: HIGHLY COMPETITIVE. Strong demand from students interested in both science and AI. Best 5 typically 34-37 points.",
                    "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 3+), and a pass in Citizenship and Social Development.",
                    "**Required Electives**: Mathematics Extended Part (M1/M2) at Level 5 or above is STRONGLY RECOMMENDED. At least one science subject (Physics, Chemistry, or Biology) at Level 4+.",
                    "**Interview**: Not typically required. Admission primarily based on HKDSE academic performance.",
                    "**Non-Academic Factors**: Programming experience, AI/ML project work, mathematics competition participation, and tech-related extracurriculars are beneficial."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Year 1 - Foundation**: Core science courses plus programming fundamentals, linear algebra, and introduction to artificial intelligence.",
                    "**Year 2 - Science Major + AI Core**: Choose science major (Chemistry, Mathematics, Physics, or Environmental Science) while taking machine learning, data structures, and algorithms.",
                    "**Year 3 - Advanced AI**: Deep learning, computer vision, natural language processing, and AI ethics. Integration with science major applications.",
                    "**Year 4 - Capstone**: AI-driven research project combining science domain expertise with machine learning techniques.",
                    "**Extended Major Requirements**: Additional 30+ credits in AI-related courses beyond the standard science degree requirements.",
                    "**Interdisciplinary Focus**: Apply AI techniques to scientific problems in chemistry, physics, environmental modeling, and mathematical optimization."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**AI & Machine Learning**: ML engineer, AI researcher, and data scientist positions at tech giants (Google, Meta, Microsoft, ByteDance).",
                    "**Quantitative Finance**: Algorithmic trading, quantitative research, and risk modeling at investment banks and hedge funds.",
                    "**Scientific Computing**: Computational chemistry, physics simulation, and environmental modeling using AI at research institutions.",
                    "**Healthcare AI**: Medical imaging, drug discovery, and personalized medicine roles at biotech and pharma companies.",
                    "**PhD Studies**: Research-oriented graduates pursue PhDs in AI, machine learning, or interdisciplinary science at top universities.",
                    "**Tech Entrepreneurship**: Startups in AI applications, ed-tech, fintech, and scientific software development."
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**AI Computing Facilities**: Access to GPU clusters, high-performance computing resources, and specialized AI labs.",
                    "**Research Centers**: HKUST Big Data Institute, AI Research Center, and interdisciplinary labs combining science with machine learning.",
                    "**Collaboration Spaces**: Dedicated spaces for AI project teams, hackathons, and coding competitions.",
                    "**Industry Partnerships**: Close ties with AI labs at Tencent, Alibaba, SenseTime, and NVIDIA for internships and projects.",
                    "**Student Community**: Active AI and data science student societies, coding clubs, and regular tech talks by industry leaders."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Very High (★★★★★). One of the most sought-after programmes combining science with AI.",
                    "**Academic Requirements**: Best 5 around 34-37. Level 5* in Mathematics and M1/M2 strongly preferred.",
                    "**Band A Competition**: Intense competition from students interested in both science and technology careers.",
                    "**Interview Weighting**: Low. Academic-based admission with emphasis on mathematics performance.",
                    "**What Differentiates Winners**: Strong mathematics foundation (especially M1/M2) plus demonstrated interest in programming or AI.",
                    "**Trend**: Rapidly increasing demand due to AI industry boom and cross-disciplinary career opportunities."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Tech Industry Leaders**: Alumni at Google DeepMind, OpenAI, Meta AI, and leading Chinese tech companies in research roles.",
                    "**Finance Sector**: Graduates in quantitative trading and AI-driven investment strategies at top hedge funds.",
                    "**Academic Excellence**: Alumni pursuing PhDs in AI and machine learning at CMU, Berkeley, Stanford, and MIT.",
                    "**Entrepreneurs**: Founders of AI startups in computer vision, NLP, and scientific computing.",
                    "**Faculty Recognition**: HKUST AI faculty includes IEEE Fellows, top conference organizers, and highly cited researchers in deep learning."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**HKUST Admission Scholarships**: For outstanding HKDSE performers with strong mathematics and science grades.",
                    "**AI Excellence Scholarship**: Special scholarship for students with exceptional aptitude in mathematics and computing.",
                    "**Industry-Sponsored Awards**: Scholarships from tech companies supporting AI talent development.",
                    "**Research Grants**: Funding for AI research projects and participation in international competitions.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's HKUST Science + AI Strategy",
                "content": [
                    "**Score Targeting**: Aim for Best 5 of 35+. Mathematics (including M1/M2) at 5* or above is crucial.",
                    "**Master Mathematics**: M1/M2 is essential. Strong calculus, statistics, and linear algebra foundation powers AI learning.",
                    "**Learn Programming Early**: Python is the lingua franca of AI. Start coding before university for a head start.",
                    "**Build AI Projects**: Create simple ML projects (image classifier, sentiment analysis) to demonstrate genuine interest.",
                    "**Follow AI Trends**: Stay updated with breakthroughs like LLMs, diffusion models, and multimodal AI."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**學術門檻**：競爭激烈。深受對科學及人工智能感興趣的學生歡迎。最佳五科通常34-37分。",
                    "**核心科目**：英文（Level 4+）、數學（必修部分，Level 3+）及公民與社會發展科合格。",
                    "**必需選修科**：數學延伸部分（M1/M2）達5級或以上強烈建議。至少一科科學科目（物理、化學或生物）達4級或以上。",
                    "**面試**：通常不需要。入學主要基於香港中學文憑考試學術成績。",
                    "**非學術因素**：編程經驗、人工智能/機器學習項目工作、數學競賽參與及科技相關課外活動有益。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**第一年 - 基礎**：核心科學課程加上編程基礎、線性代數及人工智能導論。",
                    "**第二年 - 科學主修+人工智能核心**：選擇科學主修（化學、數學、物理或環境科學），同時修讀機器學習、數據結構及演算法。",
                    "**第三年 - 高級人工智能**：深度學習、電腦視覺、自然語言處理及人工智能倫理。與科學主修應用整合。",
                    "**第四年 - 專題研習**：結合科學領域專業知識與機器學習技術的人工智能驅動研究項目。",
                    "**延伸主修要求**：標準理學位要求以外額外30+學分的人工智能相關課程。",
                    "**跨學科專注**：將人工智能技術應用於化學、物理、環境建模及數學優化等科學問題。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**人工智能及機器學習**：於科技巨頭（Google、Meta、微軟、字節跳動）擔任機器學習工程師、人工智能研究員及數據科學家。",
                    "**量化金融**：於投資銀行及對沖基金從事算法交易、量化研究及風險建模。",
                    "**科學計算**：於研究機構利用人工智能進行計算化學、物理模擬及環境建模。",
                    "**醫療人工智能**：於生物科技公司及製藥公司從事醫學成像、藥物發現及個人化醫療。",
                    "**博士課程**：研究導向畢業生於頂尖大學攻讀人工智能、機器學習或跨學科科學博士。",
                    "**科技創業**：人工智能應用、教育科技、金融科技及科學軟件開發初創企業。"
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**人工智能計算設施**：可使用GPU集群、高性能計算資源及專門人工智能實驗室。",
                    "**研究中心**：科大大數據研究所、人工智能研究中心及結合科學與機器學習的跨學科實驗室。",
                    "**協作空間**：專門供人工智能項目團隊、黑客松及編程競賽使用的空間。",
                    "**產業夥伴關係**：與騰訊、阿里巴巴、商湯科技及NVIDIA人工智能實驗室緊密聯繫，提供實習及項目機會。",
                    "**學生社群**：活躍的人工智能及數據科學學生學會、編程學會及定期業界領袖科技講座。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。結合科學與人工智能的最受追捧課程之一。",
                    "**學術要求**：最佳五科約34-37分。數學及M1/M2達5*級強烈優先考慮。",
                    "**Band A競爭**：來自對科學及科技事業感興趣學生的激烈競爭。",
                    "**面試比重**：低。以學術成績為基礎入學，重視數學表現。",
                    "**成功申請者特質**：強大數學基礎（尤其是M1/M2）加上對編程或人工智能的展示興趣。",
                    "**趨勢**：由於人工智能行業蓬勃及跨學科職業機會，需求迅速增長。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**科技業領袖**：校友於Google DeepMind、OpenAI、Meta AI及中國領先科技公司擔任研究職位。",
                    "**金融業**：畢業生於頂尖對沖基金從事量化交易及人工智能驅動投資策略。",
                    "**學術卓越**：校友於卡內基梅隆大學、伯克利大學、史丹福大學及麻省理工學院攻讀人工智能及機器學習博士。",
                    "**創業家**：創立電腦視覺、自然語言處理及科學計算人工智能初創企業。",
                    "**教職員認可**：科大人工智能教職員包括IEEE院士、頂尖會議組織者及深度學習高被引研究人員。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**科大入學獎學金**：適用於香港中學文憑考試成績卓越且數學及科學成績優異的學生。",
                    "**人工智能卓越獎學金**：專為數學及計算能力卓越的學生而設的特別獎學金。",
                    "**業界贊助獎項**：科技公司支持人工智能人才發展的獎學金。",
                    "**研究資助**：人工智能研究項目及參與國際競賽的資金。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 科大理學+人工智能攻略",
                "content": [
                    "**分數目標**：最佳五科目標35分以上。數學（包括M1/M2）達5*級至關重要。",
                    "**掌握數學**：M1/M2為必需。強大的微積分、統計及線性代數基礎推動人工智能學習。",
                    "**及早學習編程**：Python是人工智能的通用語言。大學前開始編程以取得先機。",
                    "**建立人工智能項目**：創建簡單機器學習項目（圖像分類器、情感分析）以展示 genuine 興趣。",
                    "**追蹤人工智能趨勢**：了解大型語言模型、擴散模型及多模態人工智能等突破。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
