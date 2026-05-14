/**
 * Seed HKU Batch 4 Programme Details - Batch 3 (3 programmes)
 * Run: node backend/scripts/seed_hku_batch4_details_3.js
 *
 * Programmes:
 * JS6200 - 計算與數據科學(港滬科技菁英) (BSc(Comp&DS))
 * JS6224 - 文理學士(應用人工智能) (BASc(AI))
 * JS6250 - 文理學士(環球衞生及發展) (BASc(GHD))
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  // =====================================================
  // JS6200 - 計算與數據科學(港滬科技菁英) (BSc(Comp&DS))
  // =====================================================
  {
    code: "JS6200",
    name: "計算與數據科學(港滬科技菁英) (BSc(Comp&DS))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Competitive STEM programme with dual-city immersion. Median admission score typically Best 6 = 30-32 (standard scale).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 5+ mandatory), and strong performance in science/technology electives.",
            "**Mathematics - Critical**: M1/M2 (Calculus & Statistics) strongly recommended. Advanced mathematical thinking essential for data science and algorithms.",
            "**Science/Technology Electives**: Physics, Chemistry, ICT, or Economics at Level 4+ preferred. Programming experience is a significant advantage.",
            "**Interview**: Individual interview assessing logical reasoning, basic programming aptitude, understanding of data science applications, and motivation for the Hong Kong-Shanghai dual-campus experience."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - HKU Foundation**: Computer programming (Python, Java), discrete mathematics, linear algebra, and probability theory. Introduction to data structures and algorithms.",
            "**Year 2 - Core Data Science**: Machine learning fundamentals, database systems, statistical modelling, and data visualisation. First data science project with real datasets.",
            "**Year 3 - Shanghai Immersion**: Study at Fudan University or Shanghai Jiao Tong University (partner institutions). Advanced courses in big data analytics, cloud computing, and AI applications in Chinese tech ecosystem.",
            "**Year 4 - Capstone & Specialisation**: Final year project combining computational theory with practical data science. Specialisations: AI/ML, Financial Data Science, or Bioinformatics.",
            "**Dual-City Advantage**: Graduate with exposure to BOTH Hong Kong's international finance hub AND Shanghai's tech innovation ecosystem. Unique cross-border network.",
            "**Industry Projects**: Collaborations with Tencent, Alibaba, HSBC, and HKSTP for capstone projects and internships."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Tech Giants**: Data scientist, machine learning engineer, or software engineer at Tencent, Alibaba, ByteDance, or Huawei.",
            "**Finance Sector**: Quantitative analyst, risk modeller, or algorithmic trader at investment banks (Goldman Sachs, Morgan Stanley) and hedge funds.",
            "**Consulting**: Data consultant at McKinsey, BCG, or Bain, helping clients leverage data for strategic decisions.",
            "**Startups**: Technical co-founder or data lead at Hong Kong or Greater Bay Area tech startups.",
            "**Further Studies**: MSc in Data Science (Stanford, CMU, Imperial), MSc in Computer Science (MIT, Berkeley), or PhD in machine learning.",
            "**Cross-Border Roles**: Unique positioning for roles requiring both Hong Kong financial expertise and mainland China tech market understanding."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**HKU Campus (Years 1-2, 4)**: Access to HKU's high-performance computing clusters, AI labs, and data science research centres at the Faculty of Engineering.",
            "**Shanghai Campus (Year 3)**: Immersion at Fudan University or SJTU with dedicated dormitories, Mandarin support, and cultural integration programmes.",
            "**Coding Communities**: Active participation in HKU CodeHub, Data Science Society, and ACM programming competitions.",
            "**Hackathons**: Regular participation in HKU Hackathon, Shanghai TechCrunch Disrupt, and Alibaba Cloud competitions.",
            "**Mentorship**: Matched with data scientists and engineers from partner companies in BOTH Hong Kong and Shanghai."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: High (4/5 stars). Approximately 600-800 applicants compete for ~50-60 places annually (~8% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 33-35; Median: Best 6 = 30-32; Bottom quartile: Best 6 = 28-30.",
            "**Subject Strategy**: Mathematics (M1/M2 strongly preferred, Level 5+) + Physics/ICT + English. A student with 5* in Maths, 5 in Physics, and 4 in English achieves ~30 points.",
            "**Interview Focus**: Logical puzzles, basic coding problems, and questions about data science trends (AI ethics, big data privacy, generative AI).",
            "**Programming Portfolio**: GitHub projects, Kaggle competition rankings, or coding bootcamp certificates significantly strengthen applications.",
            "**Non-JUPAS Pathway**: IB (34+/45) with HL Mathematics, GCE A-Levels (AAB including Mathematics and a science). Approximately 5-8 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Reynold Cheng**: Leading researcher in big data analytics and spatial databases. Published extensively in top-tier data science conferences.",
            "**Professor Michael Lyu**: World-renowned expert in software reliability engineering and machine learning systems.",
            "**Alumni at Tencent**: Graduates placed in WeChat AI Lab, Tencent Cloud, and gaming data analytics divisions.",
            "**Alumni at Alibaba**: Data scientists and engineers in Alipay, Taobao recommendation systems, and DAMO Academy.",
            "**Fintech Founders**: Several alumni have founded data-driven startups in Hong Kong and Shenzhen."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with exceptional DSE results, especially strong Mathematics and science performance.",
            "**Tech Industry Scholarships**: Sponsored by Tencent, Alibaba Cloud, and HSBC. Include internship guarantees and mentorship.",
            "**Shanghai Immersion Grant**: Special funding for Year 3 living expenses in Shanghai (up to HKD 50,000).",
            "**Innovation & Technology Scholarship**: Government-funded scheme supporting STEM students with outstanding academic performance.",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Means-tested grants available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Comp&DS Strategy",
          content: [
            "**Mathematics Mastery**: Target 5** in Mathematics (Compulsory + M1/M2). Data science is fundamentally applied mathematics.",
            "**Learn Python Early**: Start coding in Python before university. Practice on LeetCode, HackerRank, or Kaggle Learn.",
            "**Build a Data Project**: Create a project analysing real data (e.g., HK weather data, MTR ridership, or stock prices). Show curiosity.",
            "**Understand Both Ecosystems**: Read about Hong Kong's fintech scene AND Shanghai's tech giants. This programme values cross-border awareness.",
            "**Mandarin Preparation**: Start learning Putonghua. Year 3 in Shanghai requires daily communication in Mandarin."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：具競爭力的 STEM 雙城沉浸課程。中位數收生分數通常為 Best 6 = 30-32 分 (標準計分)。",
            "**核心科目**：英文 (Level 4 或以上)、數學 (必修部分，必須 Level 5 或以上)，以及理科/科技選修科的優異表現。",
            "**數學 - 關鍵**：強烈建議修讀 M1/M2 (微積分與統計)。進階數學思維對數據科學及算法至關重要。",
            "**理科/科技選修科**：物理、化學、資訊及通訊科技或經濟達 Level 4+ 較佳。編程經驗是顯著優勢。",
            "**面試**：個人面試，考核邏輯推理、基本編程能力、對數據科學應用的理解，以及對港滬雙校園體驗的動機。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 港大基礎**：電腦編程 (Python、Java)、離散數學、線性代數及概率論。數據結構與算法導論。",
            "**第二年 - 核心數據科學**：機器學習基礎、數據庫系統、統計建模及數據可視化。首個使用真實數據集的數據科學項目。",
            "**第三年 - 上海沉浸**：於復旦大學或上海交通大學 (伙伴院校) 學習。大數據分析、雲端運算及中國科技生態系統人工智能應用進階課程。",
            "**第四年 - 畢業專題及專修**：結合運算理論與實務數據科學的畢業專題。專修方向：人工智能/機器學習、金融數據科學或生物資訊學。",
            "**雙城優勢**：畢業時具備香港國際金融中心及上海科技創新生態系統的雙重 exposure。獨特的跨境網絡。",
            "**業界項目**：與騰訊、阿里巴巴、滙豐及香港科技園合作畢業專題及實習。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**科技巨頭**：於騰訊、阿里巴巴、字節跳動或華為擔任數據科學家、機器學習工程師或軟件工程師。",
            "**金融業界**：於投資銀行 (高盛、摩根士丹利) 及對沖基金擔任量化分析師、風險建模師或算法交易員。",
            "**顧問業**：於麥肯錫、波士頓顧問或貝恩擔任數據顧問，協助客戶利用數據作出策略決策。",
            "**初創企業**：於香港或大灣區科技初創擔任技術聯合創辦人或數據主管。",
            "**進修深造**：數據科學碩士 (史丹福、卡內基梅隆、帝國理工)、電腦科學碩士 (麻省理工、柏克萊) 或機器學習博士。",
            "**跨境崗位**：獨特定位於需要香港金融專業知識及中國內地科技市場理解的崗位。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**港大校園 (第一、二、四年)**：使用港大工程學院的高效能運算叢集、人工智能實驗室及數據科學研究中心。",
            "**上海校園 (第三年)**：於復旦大學或上海交大沉浸學習，配備專用宿舍、普通話支援及文化融合計劃。",
            "**編程社群**：積極參與港大 CodeHub、數據科學學會及 ACM 編程比賽。",
            "**黑客松**：定期參與港大黑客松、上海 TechCrunch Disrupt 及阿里巴巴雲計算比賽。",
            "**師友計劃**：與香港及上海伙伴公司的數據科學家及工程師配對。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：高 (4/5星)。每年約600-800人競爭~50-60個學額 (入學率約8%)。",
            "**分數分佈**：最高四分位數：Best 6 = 33-35分；中位數：Best 6 = 30-32分；最低四分位數：Best 6 = 28-30分。",
            "**科目策略**：數學 (強烈建議 M1/M2，Level 5+) + 物理/資訊及通訊科技 + 英文。數學達5*、物理達5、英文達4的學生約有30分。",
            "**面試重點**：邏輯謎題、基本編程問題及關於數據科學趨勢的提問 (人工智能倫理、大數據私隱、生成式人工智能)。",
            "**編程作品集**：GitHub 項目、Kaggle 比賽排名或編程訓練營證書能顯著強化申請。",
            "**非聯招途徑**：國際文憑 (IB 34+/45) 修讀高等數學、GCE A-Level (AAB 包括數學及理科)。約5-8個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**鄭國彬教授**：大數據分析及空間數據庫領域的頂尖研究者。於頂級數據科學會議發表大量論文。",
            "**呂榮聰教授**：軟件可靠性工程及機器學習系統領域世界知名專家。",
            "**騰訊校友**：畢業生獲聘於微信人工智能實驗室、騰訊雲及遊戲數據分析部門。",
            "**阿里巴巴校友**：於支付寶、淘寶推薦系統及達摩院的數據科學家及工程師。",
            "**金融科技創辦人**：多位校友於香港及深圳創立數據驅動初創企業。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績卓越者，尤其數學及理科成績優異者。",
            "**科技業界獎學金**：由騰訊、阿里雲及滙豐贊助。包括實習保證及師友指導。",
            "**上海沉浸資助**：第三年上海生活費的特別資助 (最多港幣50,000元)。",
            "**創新及科技獎學金**：政府資助計劃，支援學術成績卓越的 STEM 學生。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請入息審查資助。"
          ]
        },
        tips: {
          title: "Ace Sir 計算與數據科學攻略",
          content: [
            "**數學精通**：數學 (必修 + M1/M2) 目標5**。數據科學本質上是應用數學。",
            "**及早學習 Python**：在大學前開始編寫 Python。於 LeetCode、HackerRank 或 Kaggle Learn 練習。",
            "**建立數據項目**：創建分析真實數據的項目 (如香港天氣數據、港鐵載客量或股價)。展示好奇心。",
            "**理解兩個生態系統**：閱讀香港金融科技發展及上海科技巨頭的資訊。此課程重視跨境認知。",
            "**普通話準備**：開始學習普通話。第三年於上海需要以普通話日常溝通。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6224 - 文理學士(應用人工智能) (BASc(AI))
  // =====================================================
  {
    code: "JS6224",
    name: "文理學士(應用人工智能) (BASc(AI))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Highly competitive interdisciplinary AI programme. Median admission score typically Best 6 = 31-33 (standard scale).",
            "**Core Subjects**: English (Level 5+), Mathematics (Compulsory Part, Level 5+ mandatory), and strong performance in science/technology electives.",
            "**Mathematics - Critical**: M1/M2 (Calculus & Statistics) essential. Linear algebra, calculus, and probability form the mathematical foundation of machine learning.",
            "**Science/Technology Electives**: Physics, Chemistry, ICT, or Biology at Level 4+ preferred. Programming experience (Python, C++) is highly advantageous.",
            "**Interview**: Technical interview assessing logical reasoning, basic algorithmic thinking, understanding of AI applications, and ethical awareness of AI technology."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - AI Foundations**: Programming (Python, C++), data structures, linear algebra, probability, and introduction to artificial intelligence. Mathematics for machine learning.",
            "**Year 2 - Core AI**: Machine learning, deep learning, computer vision, natural language processing, and robotics. First AI project with real-world dataset.",
            "**Year 3 - Specialisation Tracks**: Choose from — (1) AI in Healthcare, (2) AI in Finance, (3) AI in Creative Industries, or (4) AI Ethics & Policy. Industry internship with AI companies.",
            "**Year 4 - Capstone & Research**: Final year project developing an AI system from scratch. Options to publish at conferences (NeurIPS, ICML, CVPR) or patent innovations.",
            "**Interdisciplinary Core**: Courses from Engineering, Science, Arts, and Business faculties. AI is not just coding — it requires understanding of domain applications.",
            "**Industry Partnerships**: Collaborations with SenseTime,商湯, NVIDIA, Microsoft Research, and local AI startups for projects and internships."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**AI Research**: Machine learning researcher at DeepMind, OpenAI, Meta AI, or university research labs (HKU, CUHK, HKUST).",
            "**Tech Companies**: AI engineer at Google, Microsoft, Amazon, or ByteDance working on recommendation systems, search, or generative AI.",
            "**Healthcare AI**: Medical AI specialist at hospitals, biotech companies, or healthtech startups developing diagnostic tools and drug discovery platforms.",
            "**Fintech AI**: Algorithmic trading, fraud detection, or credit scoring at banks and fintech companies using machine learning.",
            "**Further Studies**: PhD in Machine Learning (Stanford, MIT, CMU), MSc in AI (Imperial, ETH Zurich), or specialised AI programmes (Mila, Vector Institute).",
            "**AI Entrepreneurship**: Found AI startups in computer vision, NLP, or robotics. Hong Kong's AI startup ecosystem is rapidly growing with government support."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**AI Laboratory**: State-of-the-art GPU clusters, robotics lab, and computer vision research facilities at HKU's Faculty of Engineering.",
            "**Maker Space**: 3D printing, drone assembly, IoT development kits, and hardware prototyping for AI-robotics integration projects.",
            "**Coding Communities**: Active HKU AI Society, competitive programming team, and regular Kaggle competition study groups.",
            "**Industry Talks**: Weekly seminars by AI researchers and engineers from SenseTime, NVIDIA, Google, and local unicorns.",
            "**Overseas Opportunities**: Summer research at MIT CSAIL, Stanford HAI, or Toronto Vector Institute. Exchange programmes with ETH Zurich and CMU."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Very High (4.5/5 stars). Approximately 800-1,000 applicants compete for ~40-50 places annually (~5% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 34-36; Median: Best 6 = 31-33; Bottom quartile: Best 6 = 29-31.",
            "**Subject Strategy**: Mathematics (M1/M2 essential, Level 5**) + Physics/ICT (Level 5+) + English (Level 5+). A student with 5** in Maths, 5* in Physics, and 5 in English achieves ~33 points.",
            "**Interview Focus**: Algorithmic problem-solving, AI ethics scenarios, and discussion of recent AI breakthroughs (ChatGPT, diffusion models, reinforcement learning).",
            "**Portfolio Advantage**: Kaggle rankings, GitHub AI projects, or participation in robotics/AI competitions (RoboCon, AI Challenge) significantly strengthen applications.",
            "**Non-JUPAS Pathway**: IB (36+/45) with HL Mathematics and Physics, GCE A-Levels (A*AA including Mathematics and Physics). Approximately 5-8 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Yu Yizhou**: World-leading researcher in computer vision and deep learning. Published extensively at CVPR, ICCV, and NeurIPS.",
            "**Professor Kenneth Leung**: Pioneer in AI for healthcare, developing diagnostic systems for medical imaging and drug discovery.",
            "**SenseTime Founders**: HKU alumni who co-founded SenseTime, one of the world's most valuable AI unicorns specialising in computer vision.",
            "**DeepMind Researchers**: Graduates working on reinforcement learning and generative AI at DeepMind's London and Paris labs.",
            "**AI Startup Founders**: Alumni who have founded successful startups in NLP, autonomous systems, and AI-powered education technology."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with exceptional DSE results, especially 5** in Mathematics and science subjects.",
            "**AI Industry Scholarships**: Sponsored by SenseTime, NVIDIA, and Microsoft. Include guaranteed internships and research mentorship.",
            "**Innovation & Technology Scholarship**: Government-funded scheme for top STEM students with innovation potential (up to HKD 150,000).",
            "**Overseas Research Grants**: Funding for summer research at top AI labs worldwide (up to HKD 50,000).",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Means-tested grants available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's AI Strategy",
          content: [
            "**Mathematics First**: Master calculus, linear algebra, and probability. AI is 90% mathematics dressed up as code.",
            "**Code Daily**: Build projects on GitHub. Start with simple classifiers, then move to neural networks using PyTorch or TensorFlow.",
            "**Follow AI Research**: Read papers on arXiv. Understand transformers, diffusion models, and reinforcement learning at a conceptual level.",
            "**Ethics Matter**: AI is not neutral. Be ready to discuss bias, privacy, and job displacement. Show you care about responsible AI.",
            "**Kaggle Competitions**: Participate in Kaggle competitions even if you don't win. The learning process and portfolio building matter most."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：極具競爭力的跨學科人工智能課程。中位數收生分數通常為 Best 6 = 31-33 分 (標準計分)。",
            "**核心科目**：英文 (Level 5 或以上)、數學 (必修部分，必須 Level 5 或以上)，以及理科/科技選修科的優異表現。",
            "**數學 - 關鍵**：必須修讀 M1/M2 (微積分與統計)。線性代數、微積分及概率是機器學習的數學基礎。",
            "**理科/科技選修科**：物理、化學、資訊及通訊科技或生物達 Level 4+ 較佳。編程經驗 (Python、C++) 極具優勢。",
            "**面試**：技術面試，考核邏輯推理、基本算法思維、對人工智能應用的理解，以及人工智能技術的倫理意識。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 人工智能基礎**：編程 (Python、C++)、數據結構、線性代數、概率及人工智能導論。機器學習數學。",
            "**第二年 - 核心人工智能**：機器學習、深度學習、電腦視覺、自然語言處理及機械人學。首個使用真實數據集的人工智能項目。",
            "**第三年 - 專修方向**：選擇 — (1) 醫療人工智能、(2) 金融人工智能、(3) 創意產業人工智能，或 (4) 人工智能倫理與政策。於人工智能公司實習。",
            "**第四年 - 畢業專題及研究**：從零開發人工智能系統的畢業專題。可選擇於會議 (NeurIPS、ICML、CVPR) 發表或申請專利。",
            "**跨學科核心**：工程、理學、文學及商學院的課程。人工智能不只是編程 — 需要理解領域應用。",
            "**業界伙伴**：與商湯、NVIDIA、微軟研究院及本地人工智能初創合作項目及實習。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**人工智能研究**：於 DeepMind、OpenAI、Meta AI 或大學研究實驗室 (港大、中大、科大) 擔任機器學習研究員。",
            "**科技公司**：於 Google、微軟、亞馬遜或字節跳動擔任人工智能工程師，從事推薦系統、搜尋或生成式人工智能。",
            "**醫療人工智能**：於醫院、生物科技公司或健康科技初創擔任醫療人工智能專家，開發診斷工具及藥物發現平台。",
            "**金融科技人工智能**：於銀行及金融科技公司使用機器學習進行算法交易、詐騙檢測或信用評分。",
            "**進修深造**：機器學習博士 (史丹福、麻省理工、卡內基梅隆)、人工智能碩士 (帝國理工、蘇黎世聯邦理工) 或專門人工智能計劃 (Mila、Vector Institute)。",
            "**人工智能創業**：創立電腦視覺、自然語言處理或機械人學的人工智能初創。香港人工智能初創生態系統在政府支持下快速增長。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**人工智能實驗室**：港大工程學院配備最先進的 GPU 叢集、機械人實驗室及電腦視覺研究設施。",
            "**創客空間**：3D 打印、無人機組裝、物聯網開發套件及硬件原型製作，供人工智能與機械人學整合項目使用。",
            "**編程社群**：活躍的港大人工智能學會、競技編程隊及定期 Kaggle 比賽學習小組。",
            "**業界講座**：商湯、NVIDIA、Google 及本地獨角獸的人工智能研究員及工程師每週舉辦研討會。",
            "**海外機會**：於麻省理工 CSAIL、史丹福 HAI 或多倫多 Vector Institute 進行暑期研究。與蘇黎世聯邦理工及卡內基梅隆設有交流計劃。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：極高 (4.5/5星)。每年約800-1,000人競爭~40-50個學額 (入學率約5%)。",
            "**分數分佈**：最高四分位數：Best 6 = 34-36分；中位數：Best 6 = 31-33分；最低四分位數：Best 6 = 29-31分。",
            "**科目策略**：數學 (必須 M1/M2，Level 5**) + 物理/資訊及通訊科技 (Level 5+) + 英文 (Level 5+)。數學達5**、物理達5*、英文達5的學生約有33分。",
            "**面試重點**：算法解難、人工智能倫理情境及近期人工智能突破的討論 (ChatGPT、擴散模型、強化學習)。",
            "**作品集優勢**：Kaggle 排名、GitHub 人工智能項目或參與機械人/人工智能比賽 (RoboCon、AI Challenge) 能顯著強化申請。",
            "**非聯招途徑**：國際文憑 (IB 36+/45) 修讀高等數學及物理、GCE A-Level (A*AA 包括數學及物理)。約5-8個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**俞益洲教授**：電腦視覺及深度學習領域世界頂尖研究者。於 CVPR、ICCV 及 NeurIPS 發表大量論文。",
            "**梁耀彰教授**：醫療人工智能先驅，開發醫學影像診斷系統及藥物發現平台。",
            "**商湯創辦人**：港大校友共同創辦商湯科技，這是全球最有價值的人工智能獨角獸之一，專注於電腦視覺。",
            "**DeepMind 研究員**：畢業生於 DeepMind 倫敦及巴黎實驗室從事強化學習及生成式人工智能研究。",
            "**人工智能初創創辦人**：校友創立自然語言處理、自動系統及人工智能教育科技的成功初創企業。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績卓越者，尤其數學及理科達5**者。",
            "**人工智能業界獎學金**：由商湯、NVIDIA 及微軟贊助。包括保證實習及研究師友指導。",
            "**創新及科技獎學金**：政府資助計劃，頒予具創新潛質的頂尖 STEM 學生 (最多港幣150,000元)。",
            "**海外研究資助**：資助於全球頂尖人工智能實驗室進行暑期研究 (最多港幣50,000元)。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請入息審查資助。"
          ]
        },
        tips: {
          title: "Ace Sir 應用人工智能攻略",
          content: [
            "**數學優先**：精通微積分、線性代數及概率。人工智能90%是披着編程外衣的數學。",
            "**每日編程**：於 GitHub 建立項目。從簡單分類器開始，然後使用 PyTorch 或 TensorFlow 建立神經網絡。",
            "**追蹤人工智能研究**：於 arXiv 閱讀論文。從概念層面理解變壓器、擴散模型及強化學習。",
            "**倫理重要**：人工智能並非中立。準備討論偏見、私隱及就業替代。展示你關注負責任的人工智能。",
            "**Kaggle 比賽**：即使未能勝出也參與 Kaggle 比賽。學習過程及作品集建立最為重要。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6250 - 文理學士(環球衞生及發展) (BASc(GHD))
  // =====================================================
  {
    code: "JS6250",
    name: "文理學士(環球衞生及發展) (BASc(GHD))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Competitive interdisciplinary global health programme. Median admission score typically Best 6 = 27-29 (standard scale).",
            "**Core Subjects**: English (Level 5+ strongly preferred), Mathematics (Compulsory Part, Level 4+), and strong performance in humanities or science electives.",
            "**Interdisciplinary Profile**: Values students with diverse subject combinations — sciences (Biology, Chemistry) AND humanities (Geography, Economics, History) both welcomed.",
            "**Global Awareness**: Demonstrated interest in global issues (poverty, health inequity, climate change, development) through extracurriculars, volunteering, or independent research.",
            "**Interview**: Panel interview assessing global citizenship mindset, ethical reasoning about health disparities, and understanding of sustainable development goals (SDGs)."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Global Health Foundations**: Introduction to public health, epidemiology, global health policy, and development studies. Statistics and research methods.",
            "**Year 2 - Health Systems & Diseases**: Infectious disease control, non-communicable diseases, health economics, and health systems in low/middle-income countries.",
            "**Year 3 - Field Experience**: Overseas field placement (4-6 months) at partner organisations in Africa, Southeast Asia, or Latin America (e.g., WHO, MSF, UNICEF projects).",
            "**Year 4 - Capstone & Policy**: Research project on a global health topic. Policy analysis, programme evaluation, and preparation for graduate studies or global health careers.",
            "**Cross-Faculty Curriculum**: Courses from Medicine, Social Sciences, Business, and Science faculties. Unique blend of biomedical and social science perspectives.",
            "**Language Training**: Mandatory foreign language component (French, Spanish, or Putonghua) to prepare for international fieldwork."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**International Organisations**: Programme officer at WHO, UNICEF, World Bank, or Gavi Alliance working on global health initiatives.",
            "**NGOs**: Field coordinator or policy advisor at Médecins Sans Frontières (MSF), Oxfam, Save the Children, or local health NGOs.",
            "**Public Health**: Epidemiologist, health policy analyst, or programme evaluator at Centre for Health Protection, Department of Health, or Hospital Authority.",
            "**Research & Academia**: Research assistant at HKU's School of Public Health or pursue MSc/MPH at Johns Hopkins, Harvard, or London School of Hygiene & Tropical Medicine.",
            "**Social Enterprise**: Found health-focused social enterprises addressing health inequity in Hong Kong or Greater Bay Area.",
            "**Further Studies**: Master of Public Health (MPH), MSc in Global Health, or PhD in health policy at top global health institutions."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Global Health Hub**: Access to HKU's School of Public Health research centres, including the WHO Collaborating Centre for Infectious Disease Epidemiology and Control.",
            "**Fieldwork Preparation**: Pre-departure training in cultural sensitivity, safety protocols, research ethics, and community engagement.",
            "**Student Society**: Global Health Society organises documentary screenings, speaker series with field workers, and fundraising for health projects.",
            "**Mentorship**: Matched with global health professionals — doctors who have worked in refugee camps, epidemiologists who tracked Ebola, or policy advisors at WHO.",
            "**Overseas Networks**: Semester exchange at partner universities with strong global health programmes (Johns Hopkins, Harvard, LSHTM, University of Cape Town)."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: High (4/5 stars). Approximately 400-500 applicants compete for ~40-50 places annually (~10% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 30-32; Median: Best 6 = 27-29; Bottom quartile: Best 6 = 25-27.",
            "**Subject Strategy**: English (Level 5+) + Biology/Geography/Economics (Level 4+). A well-rounded profile with both science and humanities is preferred.",
            "**Interview Weighting**: Interview carries ~30% of admission decision. Panel looks for genuine global citizenship, not just 'I want to help people'.",
            "**Experience Advantage**: International volunteering, Model UN, or independent research on global issues significantly strengthens applications.",
            "**Non-JUPAS Pathway**: IB (32+/45) with strong essay subjects, GCE A-Levels (ABB including a science and humanities). Approximately 5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Gabriel Leung**: Former Dean of Medicine, renowned epidemiologist who led Hong Kong's COVID-19 response. Global health policy expert.",
            "**Professor Keiji Fukuda**: Former Assistant Director-General of WHO. Leading expert on pandemic preparedness and health security.",
            "**MSF Field Workers**: Alumni serving as medical coordinators and programme managers in conflict zones and refugee camps worldwide.",
            "**WHO Officers**: Graduates working at WHO headquarters in Geneva and regional offices on disease control and health policy.",
            "**Public Health Researchers**: Alumni pursuing doctoral studies and research careers at Johns Hopkins, Harvard, and LSHTM."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with strong DSE results and demonstrated commitment to global issues.",
            "**Global Health Fieldwork Grants**: Special funding for Year 3 overseas field placements (up to HKD 40,000 for travel and living expenses).",
            "**Li Ka Shing Faculty of Medicine Scholarships**: Merit-based awards for students in health-related programmes.",
            "**Overseas Study Awards**: Funding for semester exchange at partner global health institutions (up to HKD 50,000).",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's GHD Strategy",
          content: [
            "**Read Widely**: Follow global health news (Lancet, WHO bulletins, Devex). Understand current challenges — malaria, maternal health, antimicrobial resistance.",
            "**Get Field Experience**: Volunteer at local health organisations, elderly centres, or ethnic minority health projects. Any health-related service counts.",
            "**Learn a Language**: Start French, Spanish, or Putonghua. Fieldwork often happens in non-English speaking regions.",
            "**Understand SDGs**: Read the UN Sustainable Development Goals. Be ready to discuss how health intersects with poverty, education, and climate.",
            "**Be Realistic**: Global health work is challenging — remote locations, limited resources, cultural barriers. Show you understand the reality, not just the idealism."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：具競爭力的跨學科環球健康課程。中位數收生分數通常為 Best 6 = 27-29 分 (標準計分)。",
            "**核心科目**：英文 (強烈建議 Level 5 或以上)、數學 (必修部分，Level 4 或以上)，以及人文或理科選修科的優異表現。",
            "**跨學科背景**：重視具有多元學科組合的學生 — 理科 (生物、化學) 及人文 (地理、經濟、歷史) 均受歡迎。",
            "**環球視野**：通過課外活動、義工服務或獨立研究，展示對環球議題 (貧窮、健康不平等、氣候變化、發展) 的興趣。",
            "**面試**：小組面試，考核環球公民意識、對健康差距的道德推理，以及對可持續發展目標 (SDGs) 的理解。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 環球健康基礎**：公共衛生導論、流行病學、環球健康政策及發展研究。統計學及研究方法。",
            "**第二年 - 醫療系統與疾病**：傳染病控制、非傳染病、衛生經濟學及中低收入國家的醫療系統。",
            "**第三年 - 實地體驗**：於非洲、東南亞或拉丁美洲的伙伴機構進行海外實地安置 (4-6個月) (如世界衛生組織、無國界醫生、聯合國兒童基金會項目)。",
            "**第四年 - 畢業專題及政策**：環球健康議題研究項目。政策分析、項目評估及研究生學習或環球健康事業準備。",
            "**跨學院課程**：醫學院、社會科學學院、商學院及理學院的課程。生物醫學與社會科學視角的獨特結合。",
            "**語言訓練**：必修外語部分 (法文、西班牙文或普通話)，為國際實地考察作準備。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**國際組織**：於世界衛生組織、聯合國兒童基金會、世界銀行或全球疫苗免疫聯盟擔任項目幹事，從事環球健康倡議。",
            "**非政府組織**：於無國界醫生、樂施會、救助兒童會或本地健康非政府組織擔任實地統籌或政策顧問。",
            "**公共衛生**：於衛生防護中心、衛生署或醫管局擔任流行病學家、衛生政策分析師或項目評估員。",
            "**研究及學術**：於港大公共衛生學院擔任研究助理，或於約翰霍普金斯、哈佛或倫敦衛生與熱帶醫學院修讀碩士/公共衛生碩士。",
            "**社會企業**：創立以健康為本的社會企業，解決香港或大灣區的健康不平等問題。",
            "**進修深造**：公共衛生碩士 (MPH)、環球健康碩士或頂尖環球健康機構的衛生政策博士。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**環球健康中心**：使用港大公共衛生學院研究中心，包括世界衛生組織傳染病流行病學及控制合作中心。",
            "**實地考察準備**：出發前進行文化敏感度、安全協議、研究倫理及社區參與培訓。",
            "**學生組織**：環球健康學會舉辦紀錄片放映、實地工作者講座系列及健康項目籌款活動。",
            "**師友計劃**：與環球健康專業人士配對 — 曾於難民營工作的醫生、追蹤伊波拉的流行病學家，或世界衛生組織政策顧問。",
            "**海外網絡**：於設有強大環球健康課程的伙伴大學 (約翰霍普金斯、哈佛、倫敦衛生與熱帶醫學院、開普敦大學) 進行交流學期。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：高 (4/5星)。每年約400-500人競爭~40-50個學額 (入學率約10%)。",
            "**分數分佈**：最高四分位數：Best 6 = 30-32分；中位數：Best 6 = 27-29分；最低四分位數：Best 6 = 25-27分。",
            "**科目策略**：英文 (Level 5+) + 生物/地理/經濟 (Level 4+)。兼具理科及人文的均衡背景較受青睞。",
            "**面試比重**：面試佔入學決定約30%。面試小組尋求真誠的環球公民意識，而非僅「我想幫助人」。",
            "**經驗優勢**：國際義工、模擬聯合國或環球議題獨立研究能顯著強化申請。",
            "**非聯招途徑**：國際文憑 (IB 32+/45) 修讀論文科目、GCE A-Level (ABB 包括理科及人文)。約5個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**梁卓偉教授**：前醫學院院長，著名流行病學家，領導香港 COVID-19 抗疫工作。環球健康政策專家。",
            "**福田敬二教授**：前世界衛生組織助理總幹事。大流行防範及衛生安全頂尖專家。",
            "**無國界醫生實地工作者**：校友於全球衝突地區及難民營擔任醫療統籌及項目經理。",
            "**世界衛生組織官員**：畢業生於日內瓦世界衛生組織總部及區域辦事處從事疾病控制及衛生政策工作。",
            "**公共衛生研究員**：校友於約翰霍普金斯、哈佛及倫敦衛生與熱帶醫學院從事博士學習及研究事業。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績優異及展現環球議題承諾的學生。",
            "**環球健康實地考察資助**：第三年海外實地安置的特別資助 (最多港幣40,000元作旅費及生活費)。",
            "**李嘉誠醫學院獎學金**：頒予健康相關課程學生的 merit-based 獎項。",
            "**海外學習獎項**：資助於伙伴環球健康機構進行交流學期 (最多港幣50,000元)。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請專上學生資助計劃。"
          ]
        },
        tips: {
          title: "Ace Sir 環球衞生及發展攻略",
          content: [
            "**廣泛閱讀**：追蹤環球健康新聞 (Lancet、世界衛生組織公報、Devex)。理解當前挑戰 — 瘧疾、孕婦健康、抗菌素耐藥性。",
            "**獲取實地經驗**：於本地健康機構、護老中心或少數族裔健康項目當義工。任何健康相關服務都有價值。",
            "**學習語言**：開始學習法文、西班牙文或普通話。實地考察常於非英語地區進行。",
            "**理解可持續發展目標**：閱讀聯合國可持續發展目標。準備討論健康如何與貧窮、教育及氣候相交。",
            "**保持現實**：環球健康工作充滿挑戰 — 偏遠地區、有限資源、文化障礙。展示你理解現實，而非僅有理想主義。"
          ]
        }
      }
    }
  }
];

async function seedBatch() {
  console.log("[Seed] Starting HKU Batch 4 - Batch 3 programme details seeding...");
  console.log("[Seed] Total programmes in this batch:", PROGRAMME_DETAILS.length);

  for (const details of PROGRAMME_DETAILS) {
    try {
      console.log(`[Seed] Seeding details for ${details.code} - ${details.name}...`);
      const result = await JupasProgrammeService.upsertProgrammeDetails(details);
      console.log(`[Seed] ✓ Success: ${result.code} (id: ${result.id})`);
    } catch (error) {
      console.error(`[Seed] ✗ Failed for ${details.code}:`, error.message);
    }
  }

  console.log("[Seed] Batch 3 seeding complete.");
  process.exit(0);
}

seedBatch().catch((error) => {
  console.error("[Seed] Fatal error:", error);
  process.exit(1);
});
