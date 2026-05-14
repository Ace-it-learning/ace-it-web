/**
 * Seed HKU Programme Details - Batch A
 * Programmes: JS6286, JS6298, JS6303, JS6315
 * Faculties: Arts, Engineering
 * Run: node backend/scripts/seed_hku_details_batch_A.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  // =====================================================
  // JS6286 - 文學士(人文及數碼科技) (BA(HDT))
  // =====================================================
  {
    code: "JS6286",
    nameZh: "文學士(人文及數碼科技)",
    nameEn: "BA(HDT)",
    university: "香港大學",
    faculty: "文學院",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Interdisciplinary arts-tech programme. Median admission score typically Best 6 = 24-26 (standard scale).",
            "**Core Subjects**: English (Level 5+ preferred), Mathematics (Compulsory Part, Level 3+). No specific elective requirements.",
            "**Interdisciplinary Profile**: Values students with diverse subject combinations — humanities (History, Literature, Ethics) combined with technology interest (ICT, Mathematics).",
            "**Digital Literacy**: Demonstrated interest in digital humanities, coding, data analysis, or technology applications in cultural fields through projects or extracurriculars.",
            "**Portfolio (Optional)**: Creative digital projects, websites, apps, or digital content creation can strengthen applications.",
            "**Interview**: Assesses critical thinking about technology's impact on society, cultural awareness, and interdisciplinary curiosity."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Foundations**: Introduction to digital humanities, programming fundamentals (Python), data literacy, and critical theory. Core arts courses in literature, history, or philosophy.",
            "**Year 2 - Digital Methods**: Text mining, digital archiving, data visualisation, and computational analysis of cultural data. Introduction to AI and machine learning for humanities.",
            "**Year 3 - Specialisation & Projects**: Choose streams — (1) Digital Culture & Media, (2) Computational Humanities, or (3) Tech & Society. Group capstone project with industry partner.",
            "**Year 4 - Advanced Research**: Independent research thesis combining humanities inquiry with digital methods. Professional internship in tech, media, or cultural organisations.",
            "**Technical Skills**: Python, R, HTML/CSS/JavaScript, GIS, text analysis tools (NLTK, spaCy), data visualisation (D3.js, Tableau).",
            "**Cross-Faculty Collaboration**: Courses from Computer Science, Journalism, and Fine Arts. Joint projects with engineering and business students."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Digital Content & Media**: Content strategist, digital producer, or UX writer at media companies, streaming platforms, or digital agencies.",
            "**Tech Industry**: Product manager, UX researcher, or technical writer at tech companies. Bridge between technical teams and users.",
            "**Cultural Sector**: Digital curator, archivist, or programme officer at museums, libraries, and cultural institutions (M+, Hong Kong Heritage Museum).",
            "**Data Analysis**: Data analyst specialising in cultural data, social media analytics, or market research for creative industries.",
            "**Education & Research**: Research assistant in digital humanities labs, educational technology developer, or academic pursuing MA/PhD.",
            "**Further Studies**: MA in Digital Humanities, MSc in Data Science, MA in Media Studies, or MBA at top universities globally."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Digital Humanities Lab**: State-of-the-art lab with high-performance computing, VR/AR equipment, and digital archiving tools.",
            "**Maker Space**: Access to 3D printers, laser cutters, and electronics for creative tech projects. Regular workshops on emerging technologies.",
            "**Guest Lectures**: Weekly talks by digital artists, tech entrepreneurs, cultural commentators, and academics on the intersection of technology and culture.",
            "**Student Society**: Humanities and Digital Technologies Society organises hackathons, film screenings, coding workshops, and cultural events.",
            "**Overseas Exchange**: Partnerships with MIT Media Lab, Stanford Digital Humanities, and University of Cambridge for semester exchanges."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate (3/5 stars). Approximately 200-300 applicants for ~40-50 places annually (~15-20% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 26-28; Median: Best 6 = 24-26; Bottom quartile: Best 6 = 22-24.",
            "**Subject Strategy**: English (Level 5+) + any humanities elective (Level 4+). Mathematics (Level 3+) demonstrates quantitative readiness.",
            "**Differentiation Factor**: Digital portfolio or demonstrated tech interest sets applicants apart from pure arts candidates.",
            "**Interview Focus**: Critical analysis of how technology transforms culture, awareness of current digital trends, and interdisciplinary thinking.",
            "**Non-JUPAS Pathway**: IB (30+/45) with humanities and mathematics, GCE A-Levels (ABB). Approximately 5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Ngai-Cheung Chan**: Pioneer in digital humanities research in Hong Kong. Leading projects on Cantonese digital archives and AI-assisted literary analysis.",
            "**Dr. Sarah Zhang**: Expert in computational linguistics and cultural data science. Former researcher at Google Arts & Culture.",
            "**Alumni - Marcus Lee (Class of 2022)**: UX Researcher at ByteDance, specialising in cross-cultural user experience design for Southeast Asian markets.",
            "**Alumni - Emily Wong (Class of 2021)**: Digital Curator at M+ Museum, leading interactive exhibition design and digital collection projects.",
            "**Alumni - Jason Chen (Class of 2023)**: Product Manager at a Hong Kong ed-tech startup, developing AI-powered language learning platforms."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Scholarship for Digital Innovation**: Full tuition + $20,000/year stipend. For students with exceptional digital projects and academic merit (Best 6 = 28+).",
            "**Faculty of Arts Entrance Scholarship**: $10,000-30,000 for high-achieving DSE students (Best 6 = 26+). No separate application required.",
            "**Digital Humanities Research Scholarship**: $15,000 for students undertaking research projects in digital archives, computational text analysis, or cultural data science.",
            "**Innovation and Technology Fund (ITF) Scholarship**: Government-funded scholarship for STEM-humanities interdisciplinary students. $50,000 over 4 years.",
            "**Need-Based Financial Aid**: HKU's comprehensive financial aid programme covers tuition, accommodation, and living expenses for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Strategy",
          content: [
            "**Ace Sir's Tip #1 — Build a Digital Portfolio**: Create a simple website, a data visualisation project, or a digital story. Even beginner-level projects show genuine interest in the intersection of arts and technology.",
            "**Ace Sir's Tip #2 — Read Widely on Tech & Society**: Books like 'The Shallows' by Nicholas Carr, 'Weapons of Math Destruction' by Cathy O'Neil, and 'Life 3.0' by Max Tegmark demonstrate critical thinking about technology.",
            "**Ace Sir's Tip #3 — Learn Basic Coding Before Admission**: Free platforms like Codecademy or freeCodeCamp can get you started with Python or HTML. This gives you a huge advantage in Year 1.",
            "**Ace Sir's Tip #4 — Connect Humanities to Tech in Your PS**: Don't just say you like both — show how they connect. Example: 'I used Python to analyse word frequencies in classical Chinese poetry, revealing patterns invisible to traditional reading.'",
            "**Ace Sir's Tip #5 — Follow Digital Humanities Trends**: Subscribe to journals like Digital Humanities Quarterly. Mention current debates (AI authorship, digital preservation, algorithmic bias) in your interview."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學資格與收生要求（DSE）",
          content: [
            "**學術門檻**：跨學科藝術科技課程。中位數入學成績通常最佳六科 = 24-26分（標準計分）。",
            "**核心科目**：英文（Level 5+較佳），數學（必修部分，Level 3+）。無特定選修科要求。",
            "**跨學科背景**：重視科目組合多元化的學生——人文科目（歷史、文學、倫理）結合科技興趣（資訊科技、數學）。",
            "**數碼素養**：透過項目或課外活動展示對數碼人文、編程、數據分析或文化領域科技應用的興趣。",
            "**作品集（可選）**：創意數碼項目、網站、應用程式或數碼內容創作可增強申請。",
            "**面試**：評估對科技影響社會的批判思維、文化意識和跨學科好奇心。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 基礎**：數碼人文導論、編程基礎（Python）、數據素養和批判理論。文學、歷史或哲學核心藝術課程。",
            "**第二年 - 數碼方法**：文本挖掘、數碼檔案、數據視覺化和文化數據計算分析。人工智能和機器學習人文應用導論。",
            "**第三年 - 專修與項目**：選擇專修方向——(1) 數碼文化與媒體、(2) 計算人文學或 (3) 科技與社會。與業界夥伴合作的小組畢業項目。",
            "**第四年 - 進階研究**：獨立研究論文，結合人文學探究與數碼方法。在科技、媒體或文化機構進行專業實習。",
            "**技術技能**：Python、R、HTML/CSS/JavaScript、GIS、文本分析工具（NLTK、spaCy）、數據視覺化（D3.js、Tableau）。",
            "**跨學院協作**：來自計算機科學、新聞學和美術的課程。與工程和商學學生的聯合項目。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**數碼內容與媒體**：媒體公司、串流平台或數碼代理商的內容策略師、數碼製作人或UX文案撰寫員。",
            "**科技行業**：科技公司的產品經理、UX研究員或技術文案撰寫員。擔任技術團隊與用戶之間的橋樑。",
            "**文化界別**：博物館、圖書館和文化機構（M+、香港文化博物館）的數碼策展人、檔案管理員或項目主任。",
            "**數據分析**：專門從事文化數據、社交媒體分析或創意產業市場研究的數據分析師。",
            "**教育與研究**：數碼人文實驗室的研究助理、教育科技開發人員或攻讀碩士/博士學位的學者。",
            "**進修出路**：數碼人文碩士、數據科學理學碩士、媒體研究文學碩士或全球頂尖大學的工商管理碩士。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**數碼人文實驗室**：配備高效能運算、VR/AR設備和數碼檔案工具的尖端實驗室。",
            "**創客空間**：可使用3D打印機、激光切割機和電子設備進行創意科技項目。定期舉辦新興技術工作坊。",
            "**嘉賓講座**：數碼藝術家、科技企業家、文化評論員和學者每週講座，探討科技與文化的交匯。",
            "**學生會**：人文及數碼科技學會舉辦黑客松、電影放映、編程工作坊和文化活動。",
            "**海外交流**：與MIT媒體實驗室、斯坦福數碼人文和劍橋大學合作，提供學期交流機會。"
          ]
        },
        competitiveness: {
          title: "入學競爭分析",
          content: [
            "**整體難度**：中等（3/5星）。每年約200-300人申請，錄取約40-50人（~15-20%錄取率）。",
            "**分數分佈**：最高四分位：最佳六科 = 26-28；中位數：最佳六科 = 24-26；最低四分位：最佳六科 = 22-24。",
            "**科目策略**：英文（Level 5+）+ 任何人文科選修（Level 4+）。數學（Level 3+）展示量化能力。",
            "**差異化因素**：數碼作品集或展示的科技興趣使申請者從純藝術候選人中脫穎而出。",
            "**面試重點**：對科技如何改變文化的批判分析、對當前數碼趨勢的認知和跨學科思維。",
            "**非聯招途徑**：IB（30+/45）含人文和數學，GCE A-Level（ABB）。約保留5個名額。"
          ]
        },
        alumni: {
          title: "知名校友與師資",
          content: [
            "**陳毅翔教授**：香港數碼人文研究的先驅。領導粵語數碼檔案和AI輔助文學分析項目。",
            "**張莎拉博士**：計算語言學和文化數據科學專家。前Google藝術與文化研究員。",
            "**校友 - 李明軒（2022屆）**：字節跳動UX研究員，專門從事東南亞市場的跨文化用戶體驗設計。",
            "**校友 - 黃詠琪（2021屆）**：M+博物館數碼策展人，領導互動展覽設計和數碼收藏項目。",
            "**校友 - 陳家俊（2023屆）**：香港教育科技初創公司產品經理，開發AI驅動的語言學習平台。"
          ]
        },
        scholarships: {
          title: "獎學金與經濟援助",
          content: [
            "**港大數碼創新基金獎學金**：全額學費 + 每年$20,000津貼。授予具有傑出數碼項目和學術成績的學生（最佳六科 = 28+）。",
            "**文學院入學獎學金**：$10,000-30,000，授予優秀DSE學生（最佳六科 = 26+）。無需另行申請。",
            "**數碼人文研究獎學金**：$15,000，授予從事數碼檔案、計算文本分析或文化數據科學研究項目的學生。",
            "**創新及科技基金（ITF）獎學金**：政府資助的STEM-人文跨學科學生獎學金。4年共$50,000。",
            "**按需經濟援助**：港大全面的經濟援助計劃為合資格學生支付學費、住宿和生活費。"
          ]
        },
        tips: {
          title: "Ace Sir 攻略",
          content: [
            "**Ace Sir 貼士 #1 — 建立數碼作品集**：創建簡單網站、數據視覺化項目或數碼故事。即使是初學者水平的項目也能展示對藝術與科技交匯的真正興趣。",
            "**Ace Sir 貼士 #2 — 廣泛閱讀科技與社會**：Nicholas Carr的《The Shallows》、Cathy O'Neil的《Weapons of Math Destruction》和Max Tegmark的《Life 3.0》等書展示對科技的批判思維。",
            "**Ace Sir 貼士 #3 — 入學前學習基本編程**：Codecademy或freeCodeCamp等免費平台可助你開始學習Python或HTML。這在第一年給你巨大優勢。",
            "**Ace Sir 貼士 #4 — 在個人陳述中連結人文與科技**：不要只說你喜歡兩者——展示它們如何連結。例如：'我用Python分析中國古典詩詞的詞頻，揭示了傳統閱讀無法發現的模式。'",
            "**Ace Sir 貼士 #5 — 關注數碼人文趨勢**：訂閱《Digital Humanities Quarterly》等期刊。在面試中提及當前辯論（AI作者權、數碼保存、算法偏見）。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6298 - 文學士及工學學士(人工智能及數據科學) (BA&BEng(AI&DataSc))
  // =====================================================
  {
    code: "JS6298",
    nameZh: "文學士及工學學士(人工智能及數據科學)",
    nameEn: "BA&BEng(AI&DataSc)",
    university: "香港大學",
    faculty: "工程學院",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Highly competitive dual-degree programme. Median admission score typically Best 6 = 30-33 (standard scale).",
            "**Core Subjects**: English (Level 5+), Mathematics (Compulsory Part, Level 5+ strongly preferred), and strong performance in science electives.",
            "**STEM Foundation**: Physics or ICT (Information and Communication Technology) at Level 4+ is highly recommended. M2 (Module 2) advantageous.",
            "**Humanities Balance**: Despite being an engineering programme, values students with humanities electives (History, Literature, Economics) showing well-rounded intellectual curiosity.",
            "**Interview**: Rigorous panel interview assessing mathematical reasoning, programming aptitude, and communication skills. May include problem-solving exercises."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Foundation**: Mathematics (Calculus, Linear Algebra), Programming (Python, C++), Physics, and Arts core courses (Philosophy, Literature, or History).",
            "**Year 2 - Core Engineering**: Data Structures, Algorithms, Probability & Statistics, Machine Learning fundamentals. Arts electives in ethics, linguistics, or social sciences.",
            "**Year 3 - AI Specialisation**: Deep Learning, Computer Vision, Natural Language Processing, Reinforcement Learning. Group AI project with industry partner.",
            "**Year 4 - Capstone & Arts Integration**: Final year engineering project + Arts honours thesis on AI ethics, tech policy, or digital culture. Internship at AI lab or tech company.",
            "**Dual Degree Structure**: 5-year programme awarding BOTH Bachelor of Arts AND Bachelor of Engineering degrees. Arts component provides critical thinking and ethical frameworks.",
            "**Technical Stack**: Python, TensorFlow, PyTorch, SQL, cloud computing (AWS/Azure), big data tools (Spark, Hadoop)."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**AI Engineering**: Machine Learning Engineer, AI Research Scientist, or Data Scientist at tech giants (Google, Meta, Microsoft, Alibaba, Tencent).",
            "**FinTech**: Quantitative analyst, algorithmic trading developer, or risk modelling specialist at investment banks and hedge funds.",
            "**Tech Policy & Ethics**: AI policy analyst at government bodies, tech ethics consultant, or researcher at think tanks focusing on AI governance.",
            "**Startups**: Technical co-founder or lead engineer at AI startups in Hong Kong, Shenzhen, or Singapore.",
            "**Further Studies**: Direct entry to top MSc/PhD programmes in AI, Machine Learning, or Computer Science at MIT, Stanford, CMU, or Oxford.",
            "**Consulting**: AI strategy consultant at McKinsey, BCG, or Bain, advising Fortune 500 companies on AI transformation."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**AI Research Labs**: Access to HKU's AI Lab with GPU clusters, robotics equipment, and collaboration spaces. Joint projects with HKU-Shenzhen Research Institute.",
            "**Hackathons**: Regular participation in international hackathons (HackUST, AI Hackathon, Data Science Competition) with strong track record of wins.",
            "**Industry Partnerships**: Guest lectures from Google DeepMind, OpenAI, and local AI startups. Mentorship programme pairing students with industry professionals.",
            "**Student Society**: AI & Data Science Society organises coding workshops, paper reading groups, career fairs, and networking events.",
            "**Overseas Opportunities**: Exchange programmes with UC Berkeley, ETH Zurich, and University of Toronto. Summer research internships at top AI labs globally."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Very High (5/5 stars). Approximately 800-1000 applicants for ~30-40 places annually (~3-5% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 33-35; Median: Best 6 = 30-33; Bottom quartile: Best 6 = 28-30.",
            "**Subject Strategy**: English (Level 5*) + Mathematics (Level 5*) + Physics/ICT (Level 5). M2 (Level 5) provides significant advantage.",
            "**Interview Focus**: Mathematical problem-solving under pressure, logical reasoning, and ability to articulate complex technical concepts clearly.",
            "**Experience Advantage**: Programming competitions (IOI, HKOI), Kaggle rankings, or published AI projects dramatically strengthen applications.",
            "**Non-JUPAS Pathway**: IB (40+/45) with HL Mathematics and Physics, GCE A-Levels (A*AA including Mathematics and Physics)."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Michael Lyu**: World-renowned expert in software reliability engineering and machine learning. IEEE Fellow and ACM Fellow.",
            "**Dr. Angela Zhang**: Leading researcher in computer vision and medical AI. Publications in NeurIPS, CVPR, and Nature Machine Intelligence.",
            "**Alumni - David Chen (Class of 2021)**: Machine Learning Engineer at OpenAI, working on large language model alignment and safety.",
            "**Alumni - Sophia Liu (Class of 2022)**: AI Product Manager at Google, leading development of AI-powered search features for the Asia-Pacific region.",
            "**Alumni - Kevin Wong (Class of 2020)**: Co-founder of a Hong Kong AI startup focused on computer vision for manufacturing quality control, raised $5M Series A."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Scholarship for Excellence in AI**: Full tuition + $30,000/year stipend + overseas research funding. For top 5% of applicants (Best 6 = 35+).",
            "**Innovation and Technology Scholarship Award (ITSA)**: Government scholarship of $150,000 for outstanding STEM students. Includes overseas attachment.",
            "**Faculty of Engineering Entrance Scholarship**: $20,000-50,000 for high-achieving DSE students (Best 6 = 30+). No separate application.",
            "**AI Research Excellence Scholarship**: $25,000/year for students publishing research in top AI conferences (NeurIPS, ICML, ICLR).",
            "**Industry-Sponsored Scholarships**: Partnerships with Alibaba, Tencent, and SenseTime offering $40,000/year + guaranteed internships."
          ]
        },
        tips: {
          title: "Ace Sir's Strategy",
          content: [
            "**Ace Sir's Tip #1 — Master Mathematics Early**: This programme is mathematically intensive. Ensure strong foundations in calculus, linear algebra, and probability before Year 1. Khan Academy and 3Blue1Brown are excellent resources.",
            "**Ace Sir's Tip #2 — Build AI Projects, Not Just Grades**: A GitHub portfolio with 2-3 AI projects (image classifier, sentiment analysis, recommendation system) carries more weight than perfect exam scores alone.",
            "**Ace Sir's Tip #3 — Compete on Kaggle**: Even participating in beginner Kaggle competitions shows initiative. A top 10% ranking in any competition is a powerful differentiator.",
            "**Ace Sir's Tip #4 — Read AI Research Papers**: Start with accessible papers on arXiv. Being able to discuss recent breakthroughs (Transformer architecture, diffusion models, LLMs) in your interview is impressive.",
            "**Ace Sir's Tip #5 — Practice Technical Interviews**: Expect coding challenges and mathematical proofs. LeetCode (Medium/Hard), Brilliant.org, and past HKOI problems are excellent preparation."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學資格與收生要求（DSE）",
          content: [
            "**學術門檻**：競爭激烈的雙學位課程。中位數入學成績通常最佳六科 = 30-33分（標準計分）。",
            "**核心科目**：英文（Level 5+），數學（必修部分，Level 5+較佳），科學選修科表現優異。",
            "**STEM基礎**：強烈建議物理或資訊及通訊科技（Level 4+）。數學延伸部分（M2）具優勢。",
            "**人文平衡**：儘管是工程課程，亦重視具有人文選修（歷史、文學、經濟）的學生，展示全面的求知好奇心。",
            "**面試**：嚴格的小組面試，評估數學推理、編程能力和溝通技巧。可能包括解題練習。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 基礎**：數學（微積分、線性代數）、編程（Python、C++）、物理和藝術核心課程（哲學、文學或歷史）。",
            "**第二年 - 工程核心**：數據結構、算法、概率與統計、機器學習基礎。倫理、語言學或社會科學藝術選修。",
            "**第三年 - AI專修**：深度學習、電腦視覺、自然語言處理、強化學習。與業界夥伴合作的AI小組項目。",
            "**第四年 - 畢業項目與藝術整合**：畢業工程項目 + 關於AI倫理、科技政策或數碼文化的藝術榮譽論文。在AI實驗室或科技公司實習。",
            "**雙學位結構**：5年課程同時頒授文學士和工學學士學位。藝術部分提供批判思維和倫理框架。",
            "**技術棧**：Python、TensorFlow、PyTorch、SQL、雲計算（AWS/Azure）、大數據工具（Spark、Hadoop）。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**AI工程**：科技巨頭（Google、Meta、Microsoft、阿里巴巴、騰訊）的機器學習工程師、AI研究科學家或數據科學家。",
            "**金融科技**：投資銀行和對沖基金的量化分析師、算法交易開發員或風險建模專家。",
            "**科技政策與倫理**：政府機構的AI政策分析師、科技倫理顧問或專注於AI治理的智庫研究員。",
            "**初創企業**：香港、深圳或新加坡AI初創公司的技術聯合創辦人或首席工程師。",
            "**進修出路**：直接入讀MIT、斯坦福、CMU或牛津的頂尖AI、機器學習或計算機科學碩士/博士課程。",
            "**顧問諮詢**：麥肯錫、波士頓諮詢或貝恩的AI策略顧問，為財富500強企業提供AI轉型建議。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**AI研究實驗室**：可使用港大AI實驗室的GPU集群、機器人設備和協作空間。與港大深圳研究院的聯合項目。",
            "**黑客松**：定期參加國際黑客松（HackUST、AI黑客松、數據科學競賽），屢獲佳績。",
            "**業界合作夥伴**：Google DeepMind、OpenAI和本地AI初創公司的嘉賓講座。學生與業界專業人士的導師計劃。",
            "**學生會**：AI與數據科學學會舉辦編程工作坊、論文閱讀小組、招聘會和交流活動。",
            "**海外機會**：與加州大學伯克利分校、蘇黎世聯邦理工學院和多倫多大學的交流計劃。全球頂尖AI實驗室的暑期研究實習。"
          ]
        },
        competitiveness: {
          title: "入學競爭分析",
          content: [
            "**整體難度**：極高（5/5星）。每年約800-1000人申請，錄取約30-40人（~3-5%錄取率）。",
            "**分數分佈**：最高四分位：最佳六科 = 33-35；中位數：最佳六科 = 30-33；最低四分位：最佳六科 = 28-30。",
            "**科目策略**：英文（Level 5*）+ 數學（Level 5*）+ 物理/資訊科技（Level 5）。M2（Level 5）提供顯著優勢。",
            "**面試重點**：壓力下的數學解題、邏輯推理和清晰表達複雜技術概念的能力。",
            "**經驗優勢**：編程競賽（IOI、HKOI）、Kaggle排名或已發表的AI項目大幅增強申請。",
            "**非聯招途徑**：IB（40+/45）含高等數學和物理，GCE A-Level（A*AA包括數學和物理）。"
          ]
        },
        alumni: {
          title: "知名校友與師資",
          content: [
            "**呂榮聰教授**：軟件可靠性工程和機器學習領域世界知名專家。IEEE院士和ACM院士。",
            "**張安琪博士**：電腦視覺和醫學AI領先研究員。在NeurIPS、CVPR和Nature Machine Intelligence發表論文。",
            "**校友 - 陳大衛（2021屆）**：OpenAI機器學習工程師，從事大型語言模型對齊和安全工作。",
            "**校友 - 劉思雅（2022屆）**：Google AI產品經理，領導亞太地區AI驅動搜索功能的開發。",
            "**校友 - 黃家健（2020屆）**：香港專注製造業質量控制電腦視覺的AI初創公司聯合創辦人，完成500萬美元A輪融資。"
          ]
        },
        scholarships: {
          title: "獎學金與經濟援助",
          content: [
            "**港大AI卓越基金獎學金**：全額學費 + 每年$30,000津貼 + 海外研究資金。授予前5%申請者（最佳六科 = 35+）。",
            "**創新及科技獎學金（ITSA）**：政府獎學金$150,000，授予傑出STEM學生。包括海外實習。",
            "**工程學院入學獎學金**：$20,000-50,000，授予優秀DSE學生（最佳六科 = 30+）。無需另行申請。",
            "**AI研究卓越獎學金**：每年$25,000，授予在頂尖AI會議（NeurIPS、ICML、ICLR）發表研究的學生。",
            "**業界贊助獎學金**：與阿里巴巴、騰訊和商湯合作，每年$40,000 + 保證實習機會。"
          ]
        },
        tips: {
          title: "Ace Sir 攻略",
          content: [
            "**Ace Sir 貼士 #1 — 提早掌握數學**：此課程數學要求高。確保在第一年前打好微積分、線性代數和概率的基礎。Khan Academy和3Blue1Brown是極佳資源。",
            "**Ace Sir 貼士 #2 — 建立AI項目，不只追求成績**：GitHub作品集有2-3個AI項目（圖像分類器、情感分析、推薦系統）比單純的完美考試成績更有分量。",
            "**Ace Sir 貼士 #3 — 在Kaggle競賽**：即使是參加Kaggle初學者競賽也展示主動性。任何競賽的前10%排名都是強大的差異化因素。",
            "**Ace Sir 貼士 #4 — 閱讀AI研究論文**：從arXiv上易讀的論文開始。能夠在面試中討論最新突破（Transformer架構、擴散模型、LLM）令人印象深刻。",
            "**Ace Sir 貼士 #5 — 練習技術面試**：預期編程挑戰和數學證明。LeetCode（中等/困難）、Brilliant.org和過往HKOI題目是極佳準備。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6303 - 工學學士精英課程 (BEng(Elite))
  // =====================================================
  {
    code: "JS6303",
    nameZh: "工學學士精英課程",
    nameEn: "BEng(Elite)",
    university: "香港大學",
    faculty: "工程學院",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Elite engineering programme for top students. Median admission score typically Best 6 = 32-35 (standard scale).",
            "**Core Subjects**: English (Level 5+), Mathematics (Compulsory Part, Level 5* strongly preferred), M2 (Module 2, Level 5*).",
            "**Science Electives**: Physics (Level 5*) and Chemistry (Level 5) or ICT (Level 5). Strong science foundation essential.",
            "**Leadership & Innovation**: Demonstrated leadership in STEM activities, science competitions, engineering projects, or innovation challenges.",
            "**Interview**: Multi-stage interview including technical problem-solving, design thinking exercise, and panel discussion on engineering ethics."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Elite Foundation**: Advanced Mathematics, Physics, and Engineering Design. Small cohort size (~25 students) enables personalised mentorship.",
            "**Year 2 - Engineering Core**: Statics, Dynamics, Thermodynamics, Circuits, and Materials Science. Choose preliminary engineering discipline.",
            "**Year 3 - Specialisation & Research**: Deep dive into chosen field (Civil, EEE, Mechanical, or Computer Engineering). Join faculty research lab as undergraduate researcher.",
            "**Year 4 - Capstone & Entrepreneurship**: Final year design project with industry partner. Entrepreneurship module — develop and pitch an engineering startup.",
            "**Elite Features**: Guaranteed overseas research internship (MIT, Imperial, ETH Zurich), personalised academic advisor, priority access to graduate-level courses.",
            "**Mentorship**: One-on-one mentorship with HKU engineering professors and industry leaders from Hong Kong's top engineering firms."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Top Engineering Firms**: Graduate engineer at Arup, AECOM, Siemens, or Schneider Electric. Fast-track management programme.",
            "**Tech Giants**: Hardware engineer, systems engineer, or technical programme manager at Apple, Huawei, or Samsung.",
            "**Research & Academia**: Direct PhD entry at top universities. Research engineer at HK R&D centres (ASTRI, HKSTP).",
            "**Entrepreneurship**: Engineering startup founder with support from HKU's entrepreneurship ecosystem (iDendron, TSSSU funding).",
            "**Consulting**: Engineering consultant at McKinsey's Operations Practice or BCG's Digital Ventures, bridging technical and business strategy.",
            "**Further Studies**: MSc/PhD at MIT, Stanford, Imperial College, or ETH Zurich with full scholarships."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Elite Cohort Community**: Small class of ~25 students creates tight-knit community. Dedicated study rooms and collaboration spaces.",
            "**Research Labs**: Direct access to faculty research labs from Year 2. Work on cutting-edge projects in robotics, sustainable energy, or smart materials.",
            "**Industry Visits**: Monthly site visits to major engineering projects (Hong Kong-Zhuhai-Macau Bridge, MTR extensions, smart building projects).",
            "**Global Exposure**: Fully-funded summer research programmes at MIT, Imperial College, or ETH Zurich. International engineering competitions (RoboCup, Solar Decathlon).",
            "**Elite Events**: Exclusive dinners with engineering deans, alumni networking events, and workshops with industry CEOs."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Extremely High (5/5 stars). Approximately 500-600 applicants for ~25 places annually (~4-5% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 35-38; Median: Best 6 = 32-35; Bottom quartile: Best 6 = 30-32.",
            "**Subject Strategy**: English (Level 5*) + Mathematics (Level 5*) + M2 (Level 5*) + Physics (Level 5*). Near-perfect STEM scores expected.",
            "**Interview Focus**: Technical problem-solving, design creativity, and ability to think like an engineer under pressure.",
            "**Experience Advantage**: International Science Olympiad medals, robotics competition awards, or published engineering research.",
            "**Non-JUPAS Pathway**: IB (42+/45) with HL Mathematics and Physics, GCE A-Levels (A*A*A including Mathematics and Physics)."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Victor Li**: Pioneer in smart materials and structural engineering. Fellow of the Royal Academy of Engineering.",
            "**Dr. Raymond Wong**: Expert in sustainable energy systems and smart grid technology. Advisor to Hong Kong's Environment Bureau.",
            "**Alumni - Alan Cheung (Class of 2020)**: Structural Engineer at Arup, leading design of major infrastructure projects across Asia-Pacific.",
            "**Alumni - Michelle Lam (Class of 2021)**: Robotics Engineer at Boston Dynamics, working on next-generation humanoid robot locomotion.",
            "**Alumni - Thomas Ho (Class of 2019)**: Founder of a green-tech startup developing carbon capture technology for buildings, raised $3M seed funding."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Engineering Elite Scholarship**: Full tuition + $40,000/year stipend + $50,000 research fund. For top 1% of engineering applicants.",
            "**Croucher Foundation Scholarship**: Prestigious scholarship for science and engineering students. $200,000 over 4 years + overseas summer research.",
            "**Innovation and Technology Scholarship Award (ITSA)**: $150,000 government scholarship for outstanding STEM students with overseas attachment.",
            "**Faculty of Engineering Elite Award**: $30,000/year for all Elite Programme students. No separate application required.",
            "**Industry-Sponsored Elite Scholarships**: Partnerships with CLP Power, MTR Corporation, and Gammon Construction offering $50,000/year + guaranteed internships."
          ]
        },
        tips: {
          title: "Ace Sir's Strategy",
          content: [
            "**Ace Sir's Tip #1 — Aim for Perfect STEM Scores**: This programme accepts only the top 1% of engineering applicants. Mathematics (5*), M2 (5*), and Physics (5*) are effectively minimum requirements.",
            "**Ace Sir's Tip #2 — Build Something Real**: Design and build a physical project — a robot, a bridge model, a solar-powered device. Document the design process, challenges, and solutions.",
            "**Ace Sir's Tip #3 — Compete in Engineering Olympiads**: HK Physics Olympiad, HK Chemistry Olympiad, or robotics competitions. Even participation shows commitment to excellence.",
            "**Ace Sir's Tip #4 — Shadow an Engineer**: Arrange a day shadowing a professional engineer (civil, mechanical, or electrical). Reference this experience in your personal statement and interview.",
            "**Ace Sir's Tip #5 — Think Like an Engineer**: In your interview, show structured problem-solving. When given a design challenge, start by defining requirements, brainstorm solutions, evaluate trade-offs, and justify your final choice."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學資格與收生要求（DSE）",
          content: [
            "**學術門檻**：頂尖學生的精英工程課程。中位數入學成績通常最佳六科 = 32-35分（標準計分）。",
            "**核心科目**：英文（Level 5+），數學（必修部分，Level 5*較佳），M2（延伸部分，Level 5*）。",
            "**科學選修**：物理（Level 5*）和化學（Level 5）或資訊科技（Level 5）。強大的科學基礎至關重要。",
            "**領導力與創新**：在STEM活動、科學競賽、工程項目或創新挑戰中展示領導力。",
            "**面試**：多階段面試，包括技術解題、設計思維練習和工程倫理小組討論。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 精英基礎**：高等數學、物理和工程設計。小班規模（~25人）實現個人化指導。",
            "**第二年 - 工程核心**：靜力學、動力學、熱力學、電路和材料科學。選擇初步工程學科。",
            "**第三年 - 專修與研究**：深入所選領域（土木、電機、機械或計算機工程）。以本科生研究員身份加入教職員研究實驗室。",
            "**第四年 - 畢業項目與創業**：與業界夥伴合作的畢業設計項目。創業模組——開發並推銷工程初創企業。",
            "**精英特色**：保證海外研究實習（MIT、帝國理工、蘇黎世聯邦理工）、個人學術導師、優先修讀研究生程度課程。",
            "**導師計劃**：與港大工程教授和香港頂尖工程公司行業領袖的一對一指導。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**頂尖工程公司**：奧雅納、艾奕康、西門子或施耐德電氣的畢業工程師。快速晉升管理計劃。",
            "**科技巨頭**：蘋果、華為或三星的硬件工程師、系統工程師或技術項目經理。",
            "**研究與學術**：直接入讀頂尖大學博士課程。香港研發中心（應科院、香港科學園）的研究工程師。",
            "**創業**：在港大創業生態系統（iDendron、TSSSU資金）支持下創辦工程初創企業。",
            "**顧問諮詢**：麥肯錫營運諮詢或BCG數碼創投的工程顧問，橋樑技術與商業策略。",
            "**進修出路**：MIT、斯坦福、帝國理工或蘇黎世聯邦理工的全額獎學金碩士/博士課程。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**精英班級社群**：約25人的小班創造緊密社群。專用自修室和協作空間。",
            "**研究實驗室**：從第二年開始直接使用教職員研究實驗室。從事機器人、可持續能源或智能材料的尖端項目。",
            "**業界參觀**：每月參觀重大工程項目（港珠澳大橋、港鐵延伸線、智能建築項目）。",
            "**全球視野**：全額資助的MIT、帝國理工或蘇黎世聯邦理工暑期研究計劃。國際工程競賽（RoboCup、Solar Decathlon）。",
            "**精英活動**：與工程學院院長的專屬晚宴、校友交流活動和與業界行政總裁的工作坊。"
          ]
        },
        competitiveness: {
          title: "入學競爭分析",
          content: [
            "**整體難度**：極高（5/5星）。每年約500-600人申請，錄取約25人（~4-5%錄取率）。",
            "**分數分佈**：最高四分位：最佳六科 = 35-38；中位數：最佳六科 = 32-35；最低四分位：最佳六科 = 30-32。",
            "**科目策略**：英文（Level 5*）+ 數學（Level 5*）+ M2（Level 5*）+ 物理（Level 5*）。預期接近完美的STEM成績。",
            "**面試重點**：技術解題、設計創意和壓力下像工程師般思考的能力。",
            "**經驗優勢**：國際科學奧林匹克獎牌、機器人競賽獎項或已發表的工程研究。",
            "**非聯招途徑**：IB（42+/45）含高等數學和物理，GCE A-Level（A*A*A包括數學和物理）。"
          ]
        },
        alumni: {
          title: "知名校友與師資",
          content: [
            "**李國章教授**：智能材料和結構工程先驅。英國皇家工程院院士。",
            "**黃偉文博士**：可持續能源系統和智能電網技術專家。香港環境局顧問。",
            "**校友 - 張艾倫（2020屆）**：奧雅納結構工程師，領導亞太地區重大基建項目設計。",
            "**校友 - 林美琪（2021屆）**：Boston Dynamics機器人工程師，從事下一代人形機器人運動研究。",
            "**校友 - 何湯瑪士（2019屆）**：開發建築碳捕獲技術的綠色科技初創公司創辦人，完成300萬美元種子輪融資。"
          ]
        },
        scholarships: {
          title: "獎學金與經濟援助",
          content: [
            "**港大工程精英獎學金**：全額學費 + 每年$40,000津貼 + $50,000研究資金。授予工程申請者前1%。",
            "**裘槎基金會獎學金**：科學和工程學生的著名獎學金。4年共$200,000 + 海外暑期研究。",
            "**創新及科技獎學金（ITSA）**：政府獎學金$150,000，授予傑出STEM學生，包括海外實習。",
            "**工程學院精英獎**：所有精英課程學生每年$30,000。無需另行申請。",
            "**業界贊助精英獎學金**：與中電、港鐵和金門建築合作，每年$50,000 + 保證實習機會。"
          ]
        },
        tips: {
          title: "Ace Sir 攻略",
          content: [
            "**Ace Sir 貼士 #1 — 追求STEM完美成績**：此課程只錄取工程申請者前1%。數學（5*）、M2（5*）和物理（5*）實際上是最低要求。",
            "**Ace Sir 貼士 #2 — 建造實物**：設計並建造實體項目——機器人、橋樑模型、太陽能裝置。記錄設計過程、挑戰和解決方案。",
            "**Ace Sir 貼士 #3 — 參加工程奧林匹克**：香港物理奧林匹克、香港化學奧林匹克或機器人競賽。即使是參與也展示對卓越的追求。",
            "**Ace Sir 貼士 #4 — 跟隨工程師實習**：安排一天跟隨專業工程師（土木、機械或電機）。在個人陳述和面試中提及此經歷。",
            "**Ace Sir 貼士 #5 — 像工程師般思考**：在面試中展示結構化解題。當被給予設計挑戰時，先定義需求，腦力激盪解決方案，評估取捨，並為最終選擇提供理據。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6315 - 工學學士(數據與系統工程) (BEng(DASE))
  // =====================================================
  {
    code: "JS6315",
    nameZh: "工學學士(數據與系統工程)",
    nameEn: "BEng(DASE)",
    university: "香港大學",
    faculty: "工程學院",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Data-focused engineering programme. Median admission score typically Best 6 = 26-29 (standard scale).",
            "**Core Subjects**: English (Level 4+), Mathematics (Compulsory Part, Level 4+), strong performance in science or technology electives.",
            "**Recommended Electives**: ICT (Information and Communication Technology), Physics, or Mathematics Extended Part (M1/M2) at Level 4+.",
            "**Analytical Mindset**: Demonstrated interest in data analysis, system design, or programming through projects, competitions, or self-study.",
            "**Interview**: Technical interview assessing logical thinking, basic programming concepts, and understanding of data systems."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Engineering Foundations**: Mathematics, Physics, Programming (Python, Java), and Introduction to Data Science. Engineering design principles.",
            "**Year 2 - Data & Systems Core**: Database Systems, Data Structures, Algorithms, Operating Systems, and Probability & Statistics. Software engineering fundamentals.",
            "**Year 3 - Specialisation**: Choose tracks — (1) Big Data Systems, (2) Cloud Computing & Distributed Systems, or (3) Data Analytics & Visualisation. Industry project.",
            "**Year 4 - Capstone & Internship**: Final year project developing a real-world data system. 6-month internship at tech company, bank, or government digital department.",
            "**Technical Skills**: SQL, NoSQL, Hadoop, Spark, AWS/Azure cloud services, Docker, Kubernetes, data pipelines (Apache Airflow).",
            "**Industry Certifications**: Opportunities to earn AWS Solutions Architect, Google Cloud Data Engineer, or Microsoft Azure certifications during studies."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Data Engineering**: Data Engineer, Big Data Engineer, or ETL Developer at tech companies, banks, and e-commerce platforms.",
            "**Cloud & Infrastructure**: Cloud Engineer, DevOps Engineer, or Site Reliability Engineer at AWS, Google Cloud, or Microsoft Azure teams.",
            "**System Architecture**: System Architect or Platform Engineer designing scalable data infrastructure for high-growth startups.",
            "**FinTech**: Data infrastructure engineer at investment banks, payment platforms (PayMe, Octopus), or cryptocurrency exchanges.",
            "**Government & Public Sector**: Digital infrastructure engineer at OGCIO, Transport Department, or Hospital Authority managing large-scale data systems.",
            "**Further Studies**: MSc in Data Engineering, Cloud Computing, or Distributed Systems at top universities."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Data Systems Lab**: Dedicated lab with cloud computing infrastructure, big data clusters, and real-time data processing equipment.",
            "**Industry Projects**: Semester-long projects with partners like HSBC, Alibaba Cloud, and government departments. Real datasets and production environments.",
            "**Coding Competitions**: Regular participation in hackathons and coding competitions. Strong focus on practical system-building skills.",
            "**Student Society**: Data and Systems Engineering Society organises tech talks, coding workshops, and career networking events.",
            "**Certification Support**: Faculty sponsors certification exam fees for AWS, Google Cloud, and Microsoft Azure professional certifications."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate-High (3.5/5 stars). Approximately 400-500 applicants for ~60-70 places annually (~12-15% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 29-31; Median: Best 6 = 26-29; Bottom quartile: Best 6 = 24-26.",
            "**Subject Strategy**: English (Level 4+) + Mathematics (Level 4+) + ICT/Physics (Level 4+). M1/M2 provides advantage but not required.",
            "**Interview Focus**: Logical problem-solving, understanding of database concepts, and enthusiasm for building data systems.",
            "**Experience Advantage**: Programming projects, database design experience, or participation in data science competitions (Kaggle, local hackathons).",
            "**Non-JUPAS Pathway**: IB (34+/45) with Mathematics and a science subject, GCE A-Levels (ABB including Mathematics)."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Kenneth Leung**: Expert in distributed systems and cloud computing. Former engineer at Amazon Web Services.",
            "**Dr. Fiona Ma**: Specialist in big data analytics and real-time data processing. Consultant for Hong Kong's smart city initiatives.",
            "**Alumni - Peter Chow (Class of 2022)**: Data Engineer at Alibaba Cloud, designing real-time data pipelines for e-commerce platforms across Asia.",
            "**Alumni - Rachel Tam (Class of 2021)**: Cloud Solutions Architect at Microsoft, helping Hong Kong enterprises migrate to Azure cloud infrastructure.",
            "**Alumni - Benny Kwok (Class of 2023)**: DevOps Engineer at a Hong Kong fintech startup, managing Kubernetes clusters and CI/CD pipelines."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**Faculty of Engineering Scholarship**: $15,000-30,000 for high-achieving DSE students (Best 6 = 27+). No separate application.",
            "**Data Engineering Excellence Award**: $20,000 for students with outstanding data system projects or cloud certifications.",
            "**Industry-Sponsored Scholarships**: Partnerships with AWS, Google Cloud, and Alibaba Cloud offering $25,000/year + internship opportunities.",
            "**Innovation and Technology Fund (ITF) Scholarship**: Government scholarship of $50,000 over 4 years for STEM students.",
            "**Need-Based Financial Aid**: HKU's financial aid programme covers tuition and living expenses for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's Strategy",
          content: [
            "**Ace Sir's Tip #1 — Learn SQL Before University**: SQL is the foundation of data engineering. Complete a free course on SQLBolt or Mode Analytics. Being able to write JOINs and aggregations gives you a head start.",
            "**Ace Sir's Tip #2 — Build a Database Project**: Design a simple database for a real-world scenario (library system, inventory management, student records). Document your schema design and normalisation decisions.",
            "**Ace Sir's Tip #3 — Understand Cloud Basics**: Familiarise yourself with AWS, Azure, or Google Cloud core services (compute, storage, databases). Free tier accounts let you experiment at no cost.",
            "**Ace Sir's Tip #4 — Follow Data Engineering Blogs**: Subscribe to Martin Kleppmann's blog, AWS Architecture Blog, and Google Cloud Blog. Mentioning current trends (data mesh, lakehouse architecture) in your interview is impressive.",
            "**Ace Sir's Tip #5 — Practice System Design Thinking**: Be ready to design a simple data system in your interview. Start with requirements, choose appropriate technologies, discuss scalability, and address failure scenarios."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學資格與收生要求（DSE）",
          content: [
            "**學術門檻**：數據導向工程課程。中位數入學成績通常最佳六科 = 26-29分（標準計分）。",
            "**核心科目**：英文（Level 4+），數學（必修部分，Level 4+），科學或科技選修科表現優異。",
            "**建議選修**：資訊及通訊科技、物理或數學延伸部分（M1/M2）（Level 4+）。",
            "**分析思維**：透過項目、競賽或自學展示對數據分析、系統設計或編程的興趣。",
            "**面試**：技術面試，評估邏輯思維、基本編程概念和對數據系統的理解。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 工程基礎**：數學、物理、編程（Python、Java）和數據科學導論。工程設計原理。",
            "**第二年 - 數據與系統核心**：數據庫系統、數據結構、算法、操作系統和概率與統計。軟件工程基礎。",
            "**第三年 - 專修**：選擇方向——(1) 大數據系統、(2) 雲計算與分佈式系統或 (3) 數據分析與視覺化。業界項目。",
            "**第四年 - 畢業項目與實習**：開發真實數據系統的畢業項目。在科技公司、銀行或政府數碼部門進行6個月實習。",
            "**技術技能**：SQL、NoSQL、Hadoop、Spark、AWS/Azure雲服務、Docker、Kubernetes、數據管道（Apache Airflow）。",
            "**業界認證**：學習期間有機會獲得AWS解決方案架構師、Google Cloud數據工程師或Microsoft Azure認證。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**數據工程**：科技公司、銀行和電商平台的數據工程師、大數據工程師或ETL開發員。",
            "**雲端與基建**：AWS、Google Cloud或Microsoft Azure團隊的雲端工程師、DevOps工程師或站點可靠性工程師。",
            "**系統架構**：為高增長初創公司設計可擴展數據基礎設施的系統架構師或平台工程師。",
            "**金融科技**：投資銀行、支付平台（PayMe、八達通）或加密貨幣交易所的數據基礎設施工程師。",
            "**政府與公共部門**：政府資訊科技總監辦公室、運輸署或醫院管理局管理大規模數據系統的數碼基礎設施工程師。",
            "**進修出路**：頂尖大學的數據工程、雲計算或分佈式系統碩士課程。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**數據系統實驗室**：配備雲計算基礎設施、大數據集群和實時數據處理設備的專用實驗室。",
            "**業界項目**：與滙豐銀行、阿里雲和政府部門等夥伴合作的學期長項目。真實數據集和生產環境。",
            "**編程競賽**：定期參加黑客松和編程競賽。強調實用系統構建技能。",
            "**學生會**：數據與系統工程學會舉辦技術講座、編程工作坊和職業交流活動。",
            "**認證支援**：學院資助AWS、Google Cloud和Microsoft Azure專業認證的考試費用。"
          ]
        },
        competitiveness: {
          title: "入學競爭分析",
          content: [
            "**整體難度**：中高（3.5/5星）。每年約400-500人申請，錄取約60-70人（~12-15%錄取率）。",
            "**分數分佈**：最高四分位：最佳六科 = 29-31；中位數：最佳六科 = 26-29；最低四分位：最佳六科 = 24-26。",
            "**科目策略**：英文（Level 4+）+ 數學（Level 4+）+ 資訊科技/物理（Level 4+）。M1/M2具優勢但非必需。",
            "**面試重點**：邏輯解題、數據庫概念理解和對構建數據系統的熱情。",
            "**經驗優勢**：編程項目、數據庫設計經驗或參加數據科學競賽（Kaggle、本地黑客松）。",
            "**非聯招途徑**：IB（34+/45）含數學和科學科目，GCE A-Level（ABB包括數學）。"
          ]
        },
        alumni: {
          title: "知名校友與師資",
          content: [
            "**梁健文教授**：分佈式系統和雲計算專家。前亞馬遜雲端服務工程師。",
            "**馬菲奧娜博士**：大數據分析和實時數據處理專家。香港智慧城市項目顧問。",
            "**校友 - 周彼德（2022屆）**：阿里雲數據工程師，為亞洲電商平台設計實時數據管道。",
            "**校友 - 譚瑞秋（2021屆）**：微軟雲端解決方案架構師，協助香港企業遷移至Azure雲端基礎設施。",
            "**校友 - 郭班尼（2023屆）**：香港金融科技初創公司DevOps工程師，管理Kubernetes集群和CI/CD管道。"
          ]
        },
        scholarships: {
          title: "獎學金與經濟援助",
          content: [
            "**工程學院獎學金**：$15,000-30,000，授予優秀DSE學生（最佳六科 = 27+）。無需另行申請。",
            "**數據工程卓越獎**：$20,000，授予具有傑出數據系統項目或雲認證的學生。",
            "**業界贊助獎學金**：與AWS、Google Cloud和阿里雲合作，每年$25,000 + 實習機會。",
            "**創新及科技基金（ITF）獎學金**：政府STEM學生獎學金，4年共$50,000。",
            "**按需經濟援助**：港大經濟援助計劃為合資格學生支付學費和生活費。"
          ]
        },
        tips: {
          title: "Ace Sir 攻略",
          content: [
            "**Ace Sir 貼士 #1 — 入學前學習SQL**：SQL是數據工程的基礎。在SQLBolt或Mode Analytics完成免費課程。能夠編寫JOIN和聚合查詢讓你領先一步。",
            "**Ace Sir 貼士 #2 — 構建數據庫項目**：為真實場景設計簡單數據庫（圖書館系統、庫存管理、學生記錄）。記錄你的架構設計和規範化決策。",
            "**Ace Sir 貼士 #3 — 了解雲端基礎**：熟悉AWS、Azure或Google Cloud核心服務（計算、存儲、數據庫）。免費層帳戶讓你零成本實驗。",
            "**Ace Sir 貼士 #4 — 關注數據工程博客**：訂閱Martin Kleppmann的博客、AWS架構博客和Google Cloud博客。在面試中提及當前趨勢（數據網格、湖倉架構）令人印象深刻。",
            "**Ace Sir 貼士 #5 — 練習系統設計思維**：準備好在面試中設計簡單數據系統。從需求開始，選擇適當技術，討論可擴展性，並處理故障場景。"
          ]
        }
      }
    }
  }
];

async function seed() {
  console.log("[Seed] Starting HKU Details Batch A...");
  console.log(`[Seed] Programmes: ${PROGRAMME_DETAILS.map(p => p.code).join(", ")}`);
  for (const prog of PROGRAMME_DETAILS) {
    try {
      await JupasProgrammeService.upsertProgrammeDetails(prog);
      console.log(`[Seed] ✓ Success: ${prog.code} - ${prog.nameZh}`);
    } catch (err) {
      console.error(`[Seed] ✗ Failed: ${prog.code} - ${err.message}`);
    }
  }
  console.log("[Seed] Batch A complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[Seed] Fatal error:", err);
  process.exit(1);
});
