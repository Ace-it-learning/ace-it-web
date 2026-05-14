const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'generated-programmes/batch1-hku-1-10-premium.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

function makeContent(en, zh) {
  return { en: { sections: en }, zh: { sections: zh } };
}
function sect(title, content) {
  return { title, content };
}

// ============ JS6951 - BEng(CompSc) ============
data.programmes.JS6951 = {
  id: 'hku-eng-cs', code: 'JS6951', name: '工程學士(計算機科學) (BEng(CompSc))', university: 'HKU',
  content: makeContent({
    admission: sect('Eligibility & Admission Criteria (DSE)', [
      '**Academic Threshold**: HKU Computer Science is a rigorous programme combining theoretical foundations with cutting-edge technology. Admission requires Best 5 scores around 27-29 (standard scale).',
      '**Mathematics (Extended Part)**: M1 or M2 is strongly recommended. The programme assumes strong foundations in discrete mathematics, calculus, and linear algebra. Students without M1/M2 may struggle with advanced algorithm analysis.',
      '**Information & Communication Technology**: ICT provides useful background in programming logic, though it is not required — many successful applicants come without ICT and learn programming from scratch.',
      '**Physics**: Helpful for understanding computer hardware, digital logic, and the physical foundations of computing.',
      '**No Interview**: Admission is score-based. Focus on maximising your Best 5, especially in Maths and science subjects.'
    ]),
    curriculum: sect('Programme Structure & Curriculum', [
      '**Year 1 - Programming & Mathematical Foundations**: Introduction to programming (Python, Java), discrete mathematics, calculus, and linear algebra. Problem-solving and computational thinking are emphasised from day one.',
      '**Year 2 - Data Structures & Algorithms**: The foundation of all computing — sorting, searching, graph algorithms, dynamic programming, and complexity analysis (Big-O notation).',
      '**Year 3 - Systems & Software Engineering**: Operating systems, computer networks, databases, and software engineering principles (design patterns, testing, version control, agile methodologies).',
      '**Year 4 - AI & Specialisation**: Machine learning, deep learning, natural language processing, computer vision, and specialised electives in cybersecurity, blockchain, or game development.',
      '**Capstone Project**: Year-long team project developing real software systems for industry partners or research labs. Recent projects include AI chatbots, trading algorithms, and medical imaging systems.',
      '**Research Opportunities**: HKU CS has strong research in AI/ML, cybersecurity, and human-computer interaction. Undergraduate students can join research groups and co-author papers at top conferences (NeurIPS, ICML, CVPR).',
      '**Industry Collaboration**: Partnerships with Google, Microsoft, Meta, and local tech companies provide internship opportunities, guest lectures, and real-world project sponsorships.'
    ]),
    career: sect('Career Pathways & Prospects', [
      '**Software Engineering**: Google, Meta, Microsoft, ByteDance, and Alibaba recruit HKU CS graduates for frontend, backend, full-stack, and mobile development roles.',
      '**Quantitative Development**: Banks (Goldman Sachs, Morgan Stanley, JP Morgan) and hedge funds (Citadel, Two Sigma) hire CS graduates to build trading systems, risk engines, and market data infrastructure.',
      '**AI & Machine Learning**: Machine learning engineer and data scientist roles at AI labs (OpenAI, DeepMind), tech companies, and research institutions. HKU CS graduates are competitive for top AI PhD programmes.',
      '**Cybersecurity**: Growing demand for security engineers, penetration testers, and threat analysts at banks, government, and cybersecurity firms.',
      '**Startups & Entrepreneurship**: Hong Kong\'s growing tech ecosystem offers opportunities to join early-stage startups or launch ventures in fintech, healthtech, edtech, and SaaS.',
      '**Graduate Studies**: Many graduates pursue Master\'s or PhD programmes at MIT, Stanford, CMU, Berkeley, and ETH Zurich. Strong research exposure at HKU makes graduates competitive applicants.'
    ]),
    campus: sect('Campus Life & Student Experience', [
      '**Main Campus (Pok Fu Lam)**: All four years at the Main Campus. The CS Department is in the Chow Yei Ching Building, with modern computer labs, collaboration spaces, and a dedicated student common room.',
      '**Computer Labs**: 24-hour access to high-performance computing clusters, GPU servers for deep learning, and specialised labs for robotics, VR/AR, and embedded systems.',
      '**Hall Life**: CS students are distributed across all halls. Popular choices include University Hall (proximity to the CS building), St. John\'s College (academic community), and Lee Shau Hall.',
      '**Computer Science Society (CSS)**: Active student society organising hackathons, coding competitions, tech talks by industry professionals, and the annual CSS Ball.',
      '**Mentorship**: Academic advisors from the CS faculty and industry mentors from major tech companies provide guidance on course selection, internships, and career planning.'
    ]),
    competitiveness: sect('Admission Competitiveness Analysis', [
      '**Overall Difficulty**: High (4/5 stars). Approximately 1,500-2,000 applicants compete for ~150 places annually (~8% admission rate).',
      '**Score Distribution**: Top quartile: Best 5 = 30-32; Median: Best 5 = 27-29; Bottom quartile: Best 5 = 25-26.',
      '**Subject Weighting Strategy**: Maths (x1.5) + Best Elective (x1.0) + English (x1.0) + LS/CSD (x1.0) + Chinese (x1.0). Mathematics is the most critical subject — strong performance in M1/M2 significantly boosts admission chances.',
      '**No Interview**: Purely score-based admission means there is no subjectivity. Every point in Best 5 matters.',
      '**Band A Advantage**: Band A Choice 1 receives strong priority. Choice 2 has viable chances. Lower bands are possible but less likely.',
      '**Non-JUPAS Pathway**: IB (38+/45 with HL Maths), GCE A-Levels (AAA including Maths/Physics). Approximately 20-30 places reserved for non-JUPAS entrants.'
    ]),
    alumni: sect('Notable Alumni & Faculty', [
      '**Professor Victor Li**: Chair of Computer Science, expert in wireless networks and mobile computing. Fellow of the IEEE and HKIE.',
      '**Professor Reynold Cheng**: Leading researcher in data mining and big data analytics. Published extensively in top-tier database conferences (SIGMOD, VLDB).',
      '**Professor Michael Lyu**: World-renowned expert in software reliability engineering and machine learning systems. Fellow of the IEEE, ACM, and AAAS.',
      '**Dr. Andy Chun**: AI pioneer in Hong Kong, former CTO at City University, and prominent advocate for AI ethics and responsible innovation.',
      '**Professor Dirk Schnieders**: Expert in cybersecurity and cryptography. Leading research in blockchain security and privacy-preserving technologies.'
    ]),
    scholarships: sect('Scholarships & Financial Aid', [
      '**HKU Foundation Entrance Scholarships**: Awarded to students with exceptional DSE results (typically 5** in 3+ subjects, especially Maths). Full or half tuition coverage.',
      '**Computer Science Department Scholarships**: For academic excellence, programming competition achievements, and research potential (HKD 10,000-30,000/year).',
      '**Tech Company Scholarships**: Google, Microsoft, and local tech firms offer scholarships to outstanding CS students with internship guarantees.',
      '**Hackathon & Competition Grants**: Funding for students participating in international programming competitions (ICPC, Google Code Jam) and hackathons.',
      '**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme offers low-interest loans.'
    ]),
    tips: sect('Ace Sir\'s Computer Science Strategy', [
      '**Code Before You Arrive**: Start with Python or Java. Being able to write clean, working code before Year 1 puts you ahead of 80% of classmates. Complete online courses on Coursera or freeCodeCamp.',
      '**Maths is the Secret Weapon**: Discrete maths, probability, and linear algebra are the languages of advanced CS. Do not just pass — master them. These subjects separate software engineers from computer scientists.',
      '**Build Projects, Not Just Grades**: Employers care more about your GitHub than your GPA. Build a web app, contribute to open source, train a neural network, or develop a mobile game. Show you can SHIP code.',
      '**Join Competitions Early**: Participate in ICPC, Google Code Jam, or local hackathons. Competition programming sharpens your algorithmic thinking and looks impressive on your CV.',
      '**Explore Research in Year 2**: Approach professors whose research interests you. Even unpaid research assistant positions lead to publications, recommendations, and PhD opportunities. HKU CS faculty are approachable and welcome motivated undergraduates.'
    ])
  }, {
    admission: sect('入學要求與計分詳情 (DSE)', [
      '**學術門檻**：港大計算機科學是一個結合理論基礎與尖端技術的嚴謹課程。入學通常需要 Best 5 達 27-29 分。',
      '**數學 (延伸部分)**：強烈建議修讀 M1 或 M2。課程假設學生具備離散數學、微積分及線性代數的穩固基礎。沒有 M1/M2 的學生可能在進階算法分析中遇到困難。',
      '**資訊及通訊科技**：資訊科技提供有用的編程邏輯背景，但非必需——很多成功入學者沒有修讀 ICT，從零開始學習編程。',
      '**物理**：對理解電腦硬件、數碼邏輯及運算的物理基礎有幫助。',
      '**無面試**：純分數入學。專注於最大化 Best 5，特別是數學及理科科目。'
    ]),
    curriculum: sect('課程結構與內容', [
      '**第一年 - 編程及數學基礎**：編程入門 (Python、Java)、離散數學、微積分及線性代數。從第一天起強調問題解決及運算思維。',
      '**第二年 - 數據結構及算法**：所有運算的基礎——排序、搜索、圖算法、動態規劃及複雜度分析 (Big-O 記號)。',
      '**第三年 - 系統及軟件工程**：操作系統、電腦網絡、數據庫及軟件工程原則 (設計模式、測試、版本控制、敏捷方法)。',
      '**第四年 - 人工智能及專修**：機器學習、深度學習、自然語言處理、電腦視覺，以及網絡安全、區塊鏈或遊戲開發的專修選修。',
      '**畢業專題**：全年團隊項目，為業界伙伴或研究實驗室開發真實軟件系統。近期項目包括人工智能聊天機器人、交易算法及醫學影像系統。',
      '**研究機會**：港大計算機科學在人工智能/機器學習、網絡安全及人機互動方面有強大研究。本科生可加入研究小組並在頂尖會議 (NeurIPS、ICML、CVPR) 共同發表論文。',
      '**業界合作**：與 Google、微軟、Meta 及本地科技公司的合作提供實習機會、業界專家講座及真實項目贊助。'
    ]),
    career: sect('職業前景與出路', [
      '**軟件工程**：Google、Meta、微軟、字節跳動及阿里巴巴聘請港大計算機科學畢業生擔任前端、後端、全端及流動開發職位。',
      '**量化開發**：銀行 (高盛、摩根士丹利、摩根大通) 及對沖基金 (Citadel、Two Sigma) 聘請計算機科學畢業生建立交易系統、風險引擎及市場數據基礎設施。',
      '**人工智能與機器學習**：人工智能實驗室 (OpenAI、DeepMind)、科技公司及研究機構的機器學習工程師及數據科學家職位。港大計算機科學畢業生對頂尖人工智能博士課程具競爭力。',
      '**網絡安全**：銀行、政府及網絡安全公司對安全工程師、滲透測試員及威脅分析師的需求日益增長。',
      '**初創及創業**：香港日益增長的科技生態系統提供加入早期初創或創辦金融科技、健康科技、教育科技及 SaaS 企業的機會。',
      '**深造研究**：很多畢業生到 MIT、史丹福、CMU、伯克利及蘇黎世聯邦理工修讀碩士或博士課程。港大的強大研究 exposure 使畢業生成為具競爭力的申請者。'
    ]),
    campus: sect('校園生活與學生體驗', [
      '**主校園 (薄扶林)**：四年均於主校園。計算機科學系位於周亦卿樓，設有現代化電腦實驗室、協作空間及專用學生公共休息室。',
      '**電腦實驗室**：24小時開放高性能運算集群、深度學習 GPU 伺服器，以及機械人、VR/AR 及嵌入式系統的專門實驗室。',
      '**舍堂生活**：計算機科學學生分佈於所有舍堂。熱門選擇包括大學堂 (鄰近計算機科學大樓)、聖約翰學院 (學術社群) 及李兆基堂。',
      '**計算機科學學會 (CSS)**：活躍的學生學會，舉辦黑客松、編程比賽、業界專家科技講座及年度 CSS 舞會。',
      '**師友指導**：計算機科學學院的學術導師及主要科技公司的業界導師提供課程選擇、實習及職業規劃指導。'
    ]),
    competitiveness: sect('入學競爭力分析', [
      '**整體難度**：高 (4/5星)。每年約1,500-2,000人競爭~150個學額 (入學率約8%)。',
      '**分數分佈**：最高四分位數：Best 5 = 30-32分；中位數：Best 5 = 27-29分；最低四分位數：Best 5 = 25-26分。',
      '**科目加權策略**：數學 (x1.5) + 最佳選修科 (x1.0) + 英文 (x1.0) + 通識/公社 (x1.0) + 中文 (x1.0)。數學是最關鍵的科目——M1/M2 的優異表現顯著提升入學機會。',
      '**無面試**：純分數入學意味沒有主觀因素。Best 5 每一分都很重要。',
      '**Band A 優勢**：Band A 第一志願獲強烈優先考慮。第二志願有可行機會。較低 band 有可能但機會較少。',
      '**非聯招途徑**：國際文憑 (IB 38+/45 包括高等數學)、GCE A-Level (AAA 包括數學/物理)。約20-30個學額預留予非聯招申請者。'
    ]),
    alumni: sect('知名校友及教職員', [
      '**李偉文教授**：計算機科學系系主任，無線網絡及流動運算專家。IEEE 及 HKIE 院士。',
      '**鄭振剛教授**：數據挖掘及大數據分析的領先研究者。於頂尖數據庫會議 (SIGMOD、VLDB) 廣泛發表論文。',
      '**呂榮聰教授**：軟件可靠性工程及機器學習系統的世界知名專家。IEEE、ACM 及 AAAS 院士。',
      '**陳漢偉博士**：香港人工智能先驅，前城市大學首席資訊官，人工智能倫理及負責任創新的著名倡導者。',
      '**Dirk Schnieders 教授**：網絡安全及密碼學專家。領導區塊鏈安全及隱私保護技術研究。'
    ]),
    scholarships: sect('獎學金及經濟援助', [
      '**港大基金入學獎學金**：頒予 DSE 成績卓越者 (通常3科5**或以上，尤其數學)。全額或半額學費資助。',
      '**計算機科學系獎學金**：頒予學術卓越、編程比賽成就及研究潛質 (每年港幣10,000-30,000元)。',
      '**科技公司獎學金**：Google、微軟及本地科技公司為優異計算機科學學生提供獎學金及實習保證。',
      '**黑客松及比賽資助**：為參加國際編程比賽 (ICPC、Google Code Jam) 及黑客松的學生提供資助。',
      '**政府資助及貸款**：NMTSS 每年提供最多港幣33,200元。專上學生資助計劃提供低息貸款。'
    ]),
    tips: sect('Ace Sir 計算機科學攻略', [
      '**入學前開始編程**：從 Python 或 Java 開始。能夠在入學前編寫整潔、可運行的代碼，會讓你領先 80% 的同學。完成 Coursera 或 freeCodeCamp 的線上課程。',
      '**數學是秘密武器**：離散數學、概率及線性代數是進階計算機科學的語言。不要只求及格——要精通。這些科目區分軟件工程師與計算機科學家。',
      '**建立項目，不只追求成績**：僱主更關心你的 GitHub 而非 GPA。建立網頁應用、為開源項目貢獻、訓練神經網絡或開發流動遊戲。展示你能交付代碼。',
      '**盡早參加比賽**：參加 ICPC、Google Code Jam 或本地黑客松。競賽編程磨練你的算法思維，並在履歷上令人印象深刻。',
      '**第二年探索研究**：接觸研究興趣與你相符的教授。即使是無薪研究助理職位也能帶來論文發表、推薦信及博士機會。港大計算機科學教授平易近人，歡迎有動機的本科生。'
    ])
  })
};

// ============ JS6963 - BEng(Civil) ============
data.programmes.JS6963 = {
  id: 'hku-eng-civil', code: 'JS6963', name: '土木工程學士 (BEng(Civil))', university: 'HKU',
  content: makeContent({
    admission: sect('Eligibility & Admission Criteria (DSE)', [
      '**Academic Threshold**: Civil Engineering at HKU is a professional-accredited programme with strong industry links. Admission requires Best 5 scores around 24-26 (standard scale).',
      '**Mathematics (Extended Part)**: M1 or M2 is highly recommended. Structural analysis, fluid mechanics, and geotechnical engineering all require advanced calculus and differential equations.',
      '**Physics**: Essential for understanding statics, dynamics, material behaviour, and structural mechanics. A strong physics background gives a significant advantage.',
      '**Chemistry**: Useful for understanding construction materials, concrete technology, and environmental engineering applications.',
      '**No Interview**: Score-based admission. Focus on maximising your Best 5 with strong performance in Maths and Physics.'
    ]),
    curriculum: sect('Programme Structure & Curriculum', [
      '**Year 1 - Engineering Foundations**: Engineering mathematics, physics, chemistry, and introduction to civil engineering. Basic surveying and engineering drawing.',
      '**Year 2 - Core Engineering**: Statics, dynamics, mechanics of materials, fluid mechanics, and structural analysis. Introduction to reinforced concrete and steel design.',
      '**Year 3 - Specialised Subjects**: Geotechnical engineering, transportation engineering, water resources, and environmental engineering. Design projects increase in complexity.',
      '**Year 4 - Advanced Design & Professional Practice**: Advanced structural design, construction management, building regulations, and a capstone design project. Preparation for HKIE graduate membership.',
      '**Structural Engineering**: Design of buildings, bridges, and towers using steel, concrete, and composite materials. Learn to calculate loads, stresses, and deflections using industry-standard software (ETABS, SAP2000).',
      '**Geotechnical Engineering**: Study soil mechanics, foundation design, slope stability, and ground improvement — critical for Hong Kong\'s hilly terrain and reclaimed land.',
      '**Industry Projects**: Capstone projects are often sponsored by major contractors or government departments. Recent projects include MTR station design, highway interchange optimisation, and sustainable drainage systems.'
    ]),
    career: sect('Career Pathways & Prospects', [
      '**Consulting Engineers**: Join firms like Arup, AECOM, Ove Arup, and Fugro to design iconic structures worldwide. Path to professional engineer (PE) registration.',
      '**Government & Public Works**: The Civil Engineering and Development Department (CEDD), Drainage Services Department, Water Supplies Department, and Housing Department recruit heavily. Stable career with clear progression.',
      '**Construction Management**: Project management roles at major contractors like Gammon, China State Construction, Leighton Asia, and Dragages. Responsible for delivering multi-billion dollar infrastructure projects.',
      '**Specialist Contractors**: Foundation engineering (piling, caissons), tunneling (TBM, drill-and-blast), and marine works contractors offer technically challenging and well-compensated roles.',
      '**Sustainable Infrastructure**: Growing demand for engineers specialising in green building design, renewable energy infrastructure, climate adaptation, and smart city technologies.',
      '**Graduate Studies**: Master\'s programmes in structural engineering, geotechnical engineering, or construction management at Imperial College, ETH Zurich, MIT, or local institutions.'
    ]),
    campus: sect('Campus Life & Student Experience', [
      '**Main Campus (Pok Fu Lam)**: All four years at the Main Campus. The Civil Engineering Department is in the Haking Wong Building, with dedicated labs for structures, geotechnics, hydraulics, and materials testing.',
      '**Engineering Labs**: Structural testing lab with full-scale beam and column testing, geotechnical centrifuge, hydraulic flume, and materials testing facilities.',
      '**Hall Life**: Engineering students often choose University Hall (proximity to engineering buildings), St. John\'s College (strong academic support), or Lady Ho Tung Hall.',
      '**Engineering Society (EngSoc)**: Organises industry visits, engineering competitions, charity build projects, sports teams, and the annual EngBall. Strong connections with professional engineering institutions.',
      '**Mentorship**: Academic advisors from the Civil Engineering faculty and professional mentors from consulting firms and contractors provide career guidance and internship opportunities.'
    ]),
    competitiveness: sect('Admission Competitiveness Analysis', [
      '**Overall Difficulty**: Moderate-High (3.5/5 stars). Approximately 800-1,000 applicants compete for ~120 places annually (~12% admission rate).',
      '**Score Distribution**: Top quartile: Best 5 = 27-29; Median: Best 5 = 24-26; Bottom quartile: Best 5 = 22-23.',
      '**Subject Weighting Strategy**: Maths (x1.5) + Physics (x1.3) + Best Elective (x1.0) + English (x1.0) + LS/CSD (x1.0). Mathematics and Physics are the most critical subjects.',
      '**No Interview**: Purely score-based admission. Strong performance in Maths and Physics is the key to admission.',
      '**Band A Advantage**: Band A Choice 1 receives priority. Choice 2 has good chances. Lower bands are still viable for this programme.',
      '**Non-JUPAS Pathway**: IB (34+/45), GCE A-Levels (ABB including Maths/Physics). Approximately 15-20 places reserved for non-JUPAS entrants.'
    ]),
    alumni: sect('Notable Alumni & Faculty', [
      '**Professor Wai-Fah Chen**: World-renowned structural engineer, former Chair of Civil Engineering at HKU. Pioneer in bridge engineering and structural mechanics.',
      '**Ir. Dr. Edwin Lee**: Former Director of Civil Engineering and Development Department (CEDD). Led major infrastructure projects including the Hong Kong-Zhuhai-Macau Bridge.',
      '**Professor Jian-Guo Dai**: Expert in geotechnical engineering and underground construction. Leading researcher in tunneling and foundation engineering.',
      '**Ir. Raymond Chan**: Former President of the Hong Kong Institution of Engineers (HKIE). Prominent advocate for engineering professionalism and standards.',
      '**Professor Michael Yang**: Expert in environmental engineering and sustainable infrastructure. Leading research in water treatment and waste management technologies.'
    ]),
    scholarships: sect('Scholarships & Financial Aid', [
      '**HKU Foundation Entrance Scholarships**: Awarded to students with strong DSE results. Full or half tuition coverage.',
      '**Engineering Department Scholarships**: For academic excellence, design project achievements, and contribution to engineering community (HKD 10,000-25,000/year).',
      '**Professional Institution Scholarships**: HKIE and other engineering institutions offer scholarships to promising students (HKD 5,000-15,000/year).',
      '**Site Visit & Field Trip Grants**: Funding for overseas field trips and site visits to major infrastructure projects (up to HKD 10,000 per trip).',
      '**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme offers low-interest loans.'
    ]),
    tips: sect('Ace Sir\'s Civil Engineering Strategy', [
      '**M2 is Your Friend**: The calculus in M2 directly applies to structural analysis, fluid mechanics, and geotechnical engineering. Do not skip it — it is the mathematical language of engineering.',
      '**Visit Construction Sites**: Hong Kong is a living laboratory — the Third Runway, the Lantau Tomorrow Vision, the Central-Wan Chai Bypass, and the MTR extensions. Go see engineering in action. Understanding how theory becomes reality is what separates good engineers from great ones.',
      '**Get Your Hands Dirty**: Join the concrete canoe competition, the steel bridge competition, or summer internships with contractors. Civil engineering is about BUILDING things, not just calculating them. Employers value practical experience enormously.',
      '**Learn Industry Software**: Familiarise yourself with AutoCAD, ETABS, SAP2000, and Primavera before you arrive. Being able to produce structural drawings and analysis models gives you a head start.',
      '**Understand the Professional Pathway**: Know what HKIE graduate membership is, what the Scheme A training involves, and how to become a Registered Professional Engineer (RPE). Having a clear career roadmap shows maturity and commitment.'
    ])
  }, {
    admission: sect('入學要求與計分詳情 (DSE)', [
      '**學術門檻**：港大土木工程是獲專業認可的課程，與業界聯繫緊密。入學通常需要 Best 5 達 24-26 分。',
      '**數學 (延伸部分)**：強烈建議修讀 M1 或 M2。結構分析、流體力學及岩土工程均需要高等微積分及微分方程。',
      '**物理**：對理解靜力學、動力學、材料行為及結構力學至關重要。強大的物理背景給你顯著優勢。',
      '**化學**：對理解建築材料、混凝土技術及環境工程應用有幫助。',
      '**無面試**：純分數入學。專注於在數學及物理取得優異成績，最大化 Best 5。'
    ]),
    curriculum: sect('課程結構與內容', [
      '**第一年 - 工程基礎**：工程數學、物理、化學及土木工程入門。基本測量及工程製圖。',
      '**第二年 - 核心工程**：靜力學、動力學、材料力學、流體力學及結構分析。鋼筋混凝土及鋼結構設計入門。',
      '**第三年 - 專門科目**：岩土工程、運輸工程、水資源及環境工程。設計項目複雜度增加。',
      '**第四年 - 進階設計及專業實務**：進階結構設計、建造管理、建築法規及畢業設計專題。為 HKIE 畢業會員資格做好準備。',
      '**結構工程**：使用鋼材、混凝土及複合材料設計建築物、橋樑及塔樓。學習使用業界標準軟件 (ETABS、SAP2000) 計算荷載、應力及撓度。',
      '**岩土工程**：研究土力學、基礎設計、斜坡穩定性及地基改良——對香港多山地形及填海土地至關重要。',
      '**業界項目**：畢業專題常由主要承建商或政府部門贊助。近期項目包括港鐵站設計、公路交匯處優化及可持續排水系統。'
    ]),
    career: sect('職業前景與出路', [
      '**顧問工程師**：加入 Arup、AECOM、奧雅納及 Fugro 等公司，設計世界各地的標誌性建築。通往專業工程師 (PE) 註冊之路。',
      '**政府及公共工程**：土木工程拓展署 (CEDD)、渠務署、水務署及房屋署大量招聘。職業穩定，晉升路徑清晰。',
      '**建造管理**：在金門、中國建築、禮頓亞洲及寶嘉等主要承建商擔任項目管理職位。負責交付數十億元的基建項目。',
      '**專業分包商**：地基工程 (打樁、沉箱)、隧道工程 (TBM、鑽爆法) 及海事工程分包商提供技術挑戰性及薪酬優厚的職位。',
      '**可持續基建**：對綠色建築設計、可再生能源基建、氣候適應及智慧城市技術專家的需求日益增長。',
      '**深造研究**：到帝國理工、蘇黎世聯邦理工、MIT 或本地院校修讀結構工程、岩土工程或建造管理碩士課程。'
    ]),
    campus: sect('校園生活與學生體驗', [
      '**主校園 (薄扶林)**：四年均於主校園。土木工程系位於黃克競樓，設有結構、岩土、水力及材料測試的專門實驗室。',
      '**工程實驗室**：結構測試實驗室配備全尺寸樑柱測試、岩土離心機、水力水槽及材料測試設施。',
      '**舍堂生活**：工程學生常選擇大學堂 (鄰近工程大樓)、聖約翰學院 (學術支援強大) 或何東夫人紀念堂。',
      '**工程學會 (EngSoc)**：舉辦業界參觀、工程比賽、慈善建築項目、運動隊及年度 EngBall。與專業工程機構聯繫緊密。',
      '**師友指導**：土木工程學院的學術導師及顧問公司與承建商的專業導師提供職業指導及實習機會。'
    ]),
    competitiveness: sect('入學競爭力分析', [
      '**整體難度**：中高 (3.5/5星)。每年約800-1,000人競爭~120個學額 (入學率約12%)。',
      '**分數分佈**：最高四分位數：Best 5 = 27-29分；中位數：Best 5 = 24-26分；最低四分位數：Best 5 = 22-23分。',
      '**科目加權策略**：數學 (x1.5) + 物理 (x1.3) + 最佳選修科 (x1.0) + 英文 (x1.0) + 通識/公社 (x1.0)。數學及物理是最關鍵的科目。',
      '**無面試**：純分數入學。數學及物理的優異表現是入學關鍵。',
      '**Band A 優勢**：Band A 第一志願獲優先考慮。第二志願機會良好。較低 band 對這課程仍有可能。',
      '**非聯招途徑**：國際文憑 (IB 34+/45)、GCE A-Level (ABB 包括數學/物理)。約15-20個學額預留予非聯招申請者。'
    ]),
    alumni: sect('知名校友及教職員', [
      '**陳惠發教授**：世界知名結構工程師，前港大土木工程系系主任。橋樑工程及結構力學先驅。',
      '**李 Edwin 工程師博士**：前土木工程拓展署 (CEDD) 署長。領導港珠澳大橋等主要基建項目。',
      '**戴建國教授**：岩土工程及地下建造專家。隧道工程及地基工程的領先研究者。',
      '**陳 Raymond 工程師**：前香港工程師學會 (HKIE) 會長。工程專業精神及標準的著名倡導者。',
      '**楊 Michael 教授**：環境工程及可持續基建專家。領導水處理及廢物管理技術研究。'
    ]),
    scholarships: sect('獎學金及經濟援助', [
      '**港大基金入學獎學金**：頒予 DSE 成績優異者。全額或半額學費資助。',
      '**工程學系獎學金**：頒予學術卓越、設計項目成就及對工程社群貢獻 (每年港幣10,000-25,000元)。',
      '**專業機構獎學金**：HKIE 及其他工程機構為有潛質的學生提供獎學金 (每年港幣5,000-15,000元)。',
      '**地盤參觀及實地考察資助**：為海外實地考察及主要基建項目地盤參觀提供資助 (每次最多港幣10,000元)。',
      '**政府資助及貸款**：NMTSS 每年提供最多港幣33,200元。專上學生資助計劃提供低息貸款。'
    ]),
    tips: sect('Ace Sir 土木工程攻略', [
      '**M2 是你的朋友**：M2 的微積分直接應用於結構分析、流體力學及岩土工程。不要跳過它——它是工程的數學語言。',
      '**參觀建築地盤**：香港是活的實驗室——三跑道、明日大嶼、中環灣仔繞道及港鐵延伸。去看看工程實踐。理解理論如何變成現實，是好工程師與卓越工程師的分水嶺。',
      '**親自動手**：參加混凝土獨木舟比賽、鋼橋比賽或承建商暑期實習。土木工程是關於建造東西，不只是計算。僱主極度重視實務經驗。',
      '**學習業界軟件**：入學前熟悉 AutoCAD、ETABS、SAP2000 及 Primavera。能夠製作結構圖則及分析模型會讓你領先一步。',
      '**了解專業途徑**：了解什麼是 HKIE 畢業會員、Scheme A 培訓涉及什麼，以及如何成為註冊專業工程師 (RPE)。有清晰的職業路線圖展示成熟及承諾。'
    ])
  })
};

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Added JS6951 and JS6963. Total:', Object.keys(data.programmes).length);
console.log('All programmes:', Object.keys(data.programmes).join(', '));
