const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  {
    code: "JS6688",
    nameZh: "科研專才啟導課程",
    nameEn: "Science Master Class",
    university: "HKU",
    faculty: "Science",
    en: {
      sections: {
        admission: [
          "**Elite cohort** of only ~30 students per year, selected through a rigorous interview process.",
          "**Exceptional DSE performance** required; typically Level 5** or above in core subjects.",
          "**Research aptitude assessment** includes a personal statement and faculty panel interview.",
          "**Early research immersion** begins in Year 1 under a dedicated faculty mentor.",
          "**International exchange** opportunities at top-tier universities are strongly encouraged."
        ],
        curriculum: [
          "**Customised study plan** tailored to each student's research interests from Year 1.",
          "**Direct PhD pathway** available for students demonstrating outstanding research potential.",
          "**Advanced research methods** and scientific communication training are core components.",
          "**Cross-disciplinary exposure** across Physics, Chemistry, Biological Sciences, and Earth Sciences.",
          "**Capstone research project** spans multiple semesters with publication-level expectations."
        ],
        career: [
          "**Doctoral programmes** at HKU or overseas institutions are the primary destination.",
          "**Research scientists** in government labs, biotech, and pharmaceutical industries.",
          "**Academic career track** supported by strong faculty mentorship and networking.",
          "**R&D leadership roles** in technology-driven enterprises and startups.",
          "**Science policy and communication** paths for broader impact beyond the lab."
        ],
        campus: [
          "**Swire Hall** and other residential colleges offer tight-knit scholarly communities.",
          "**State-of-the-art laboratories** in the Kadoorie Biological Sciences Building.",
          "**24/7 research access** to specialised equipment for enrolled students.",
          "**Science Common Room** serves as a hub for peer collaboration and seminars.",
          "**HKU Main Campus** location provides proximity to the University Library and research centres."
        ],
        competitiveness: [
          "**Extremely competitive** with an admission rate below 5% of applicants.",
          "**Top 1% of Science applicants** typically receive interview invitations.",
          "**Strong M1/M2 performance** significantly strengthens the application profile.",
          "**Research experience** at the secondary level is a notable differentiator.",
          "**Demonstrated passion** for science through competitions or projects is highly valued."
        ],
        alumni: [
          "**PhD graduates** at MIT, Stanford, Cambridge, and other leading institutions.",
          "**Published researchers** in high-impact journals before completing their undergraduate degree.",
          "**Award recipients** of the Hong Kong PhD Fellowship Scheme and similar prestigious grants.",
          "**Faculty members** at HKU and other universities who returned after doctoral training.",
          "**Industry innovators** who founded science-based startups in Hong Kong and abroad."
        ],
        scholarships: [
          "**Full-tuition scholarships** available for the duration of the programme.",
          "**Living allowance grants** provided to support research-focused students.",
          "**Overseas research attachment** funding for summer programmes at partner universities.",
          "**Conference travel grants** to present findings at international symposia.",
          "**Admission Scholarships** automatically considered for all shortlisted candidates."
        ],
        tips: [
          "**Prepare thoroughly** for the faculty interview by reading recent faculty publications.",
          "**Articulate a clear research interest** even if it evolves later during the programme.",
          "**Highlight any independent projects** or science fair participation in your application.",
          "**Seek a strong reference** from a teacher who can comment on your research potential.",
          "**Demonstrate curiosity** and intellectual humility during the selection process."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**精英小班**，每年僅錄取約30名學生，須通過嚴格的入學面試。",
          "**要求傑出的DSE成績**，核心科目通常需達5**或以上。",
          "**研究潛能評估**包括個人陳述及教授小組面試。",
          "**大一即開始科研沉浸**，由指定教授擔任導師。",
          "**鼓勵參與國際交流**，前往頂尖海外大學進行研究實習。"
        ],
        curriculum: [
          "**度身訂造的學習計劃**，從大一開始按學生研究興趣設計。",
          "**直博通道**為展現卓越研究潛能的學生而設。",
          "**進階研究方法**與科學傳播訓練為核心課程。",
          "**跨學科涉獵**涵蓋物理、化學、生物科學及地球科學。",
          "**畢業專題研究**橫跨多個學期，要求達發表水平。"
        ],
        career: [
          "**主要升學方向**為香港大學或海外院校的博士課程。",
          "**科研人員**就職於政府實驗室、生物科技及製藥企業。",
          "**學術職涯路徑**獲強大的教授指導及人脈網絡支持。",
          "**研發領導崗位**於科技驅動的企業及初創公司。",
          "**科學政策與傳播**方向，讓影響力超越實驗室。"
        ],
        campus: [
          "**施樂堂**及其他住宿書院提供緊密的學術社群。",
          "**先進實驗室**設於嘉道理生物科學大樓。",
          "**24小時研究設施使用權**，供入讀學生使用專門儀器。",
          "**科學系公共休息室**是學生協作及研討會的樞紐。",
          "**港大本部校園**毗鄰大學圖書館及各研究中心。"
        ],
        competitiveness: [
          "**競爭極為激烈**，錄取率低於5%。",
          "**通常只有理學院申請者中首1%**獲邀面試。",
          "**M1/M2成績優異**能顯著提升申請競爭力。",
          "**中學階段的研究經驗**是重要的區分因素。",
          "**透過比賽或項目展現對科學的熱誠**備受重視。"
        ],
        alumni: [
          "**博士畢業生**入讀麻省理工、斯坦福、劍橋等頂尖學府。",
          "**發表研究論文的畢業生**，在本科階段已見於高影響力期刊。",
          "**獲頒香港博士研究生獎學金計劃**及其他知名獎學金。",
          "**回流任教的校友**於香港大學及其他院校擔任教授。",
          "**業界創新者**在香港及海外創辦科學初創企業。"
        ],
        scholarships: [
          "**全額學費獎學金**涵蓋整個課程修讀期。",
          "**生活津貼資助**支持專注研究的學生。",
          "**海外研究實習經費**資助夥伴大學的暑期項目。",
          "**會議旅費資助**支持在國際研討會發表成果。",
          "**入學獎學金**所有入圍候選人均會自動獲得考慮。"
        ],
        tips: [
          "**充分準備教授面試**，提前閱讀相關教授的最新論文。",
          "**清晰表達研究興趣**，即使日後可能有所轉變。",
          "**強調任何獨立項目**或科學展覽參與經驗。",
          "**尋求強而有力的推薦信**，由能評論你研究潛能的老師撰寫。",
          "**在遴選過程中展現好奇心**與求知若渴的態度。"
        ]
      }
    }
  },
  {
    code: "JS6729",
    nameZh: "理學士(精算學)",
    nameEn: "Bachelor of Science in Actuarial Science",
    university: "HKU",
    faculty: "Science",
    en: {
      sections: {
        admission: [
          "**Strong mathematics foundation** required; M1/M2 at Level 5 or above is highly preferred.",
          "**Competitive entry** with admission based primarily on DSE best 5 subjects performance.",
          "**Analytical mindset** demonstrated through mathematics competition results is advantageous.",
          "**English proficiency** essential for professional exam preparation and global career pathways.",
          "**Personal statement** should reflect understanding of the actuarial profession and career goals."
        ],
        curriculum: [
          "**SOA/CAS exam exemptions** for several preliminary exams through accredited coursework.",
          "**Probability and statistics** form the mathematical backbone of the programme.",
          "**Financial mathematics** and risk theory are covered in depth from Year 2.",
          "**Programming skills** in R, Python, and Excel VBA are integrated throughout.",
          "**Capstone project** applies actuarial methods to real-world insurance or pension problems."
        ],
        career: [
          "**Actuarial analysts** in life, health, and general insurance companies across Asia.",
          "**Consulting firms** such as the Big Four hire graduates for risk and pension advisory.",
          "**Investment banking** roles in quantitative analysis and structured products.",
          "**Fintech startups** value actuarial graduates for data-driven risk modelling.",
          "**Government actuarial posts** in the Hong Kong SAR and regulatory bodies."
        ],
        campus: [
          "**Main Campus** classes held in the Run Run Shaw Building and Knowles Building.",
          "**Quantitative Finance Lab** provides Bloomberg terminals and financial data access.",
          "**Actuarial Science Society** organises networking events with industry professionals.",
          "**Study rooms** in the Main Library support intensive exam preparation periods.",
          "**Career fairs** on campus attract major insurers and consulting firms annually."
        ],
        competitiveness: [
          "**High competitiveness** with median admission score among the top Science programmes.",
          "**Mathematics performance** is the single strongest predictor of admission success.",
          "**Relevant work experience** or internships strengthen borderline applications.",
          "**Professional awareness** of the actuarial field distinguishes serious applicants.",
          "**Steady demand** for actuarial graduates keeps admission consistently competitive."
        ],
        alumni: [
          "**Fellows of the Society of Actuaries** (FSA) and Institute and Faculty of Actuaries (FIA).",
          "**Chief actuaries** and senior executives at major Hong Kong insurance companies.",
          "**Partners** at global consulting firms leading actuarial practices in Asia-Pacific.",
          "**Academics** who pursued doctoral studies and now teach at universities worldwide.",
          "**Entrepreneurs** who founded insurtech and risk analytics startups."
        ],
        scholarships: [
          "**Actuarial Science Scholarships** recognise academic excellence in quantitative subjects.",
          "**Professional body sponsorships** from the Actuarial Society of Hong Kong.",
          "**Internship stipends** available through industry partnerships during summer terms.",
          "**Overseas exchange grants** for actuarial-focused semesters at partner universities.",
          "**Entrance Scholarships** awarded to top-performing JUPAS admittees automatically."
        ],
        tips: [
          "**Start exam preparation early** by familiarising yourself with SOA preliminary exam syllabi.",
          "**Develop Excel and programming proficiency** before entering the programme.",
          "**Join the Actuarial Science Society** in Year 1 to build your professional network.",
          "**Seek summer internships** at insurance companies even before graduation.",
          "**Balance breadth and depth** by complementing actuarial studies with finance or data science electives."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**要求紮實的數學基礎**；M1/M2達5級或以上者獲優先考慮。",
          "**入學競爭激烈**，主要根據DSE最佳五科成績取錄。",
          "**數學比賽成績**可展示分析思維，對申請有利。",
          "**英語能力**對專業考試準備及全球職涯路徑至關重要。",
          "**個人陳述**應反映對精算專業的理解及職業目標。"
        ],
        curriculum: [
          "**SOA/CAS考試豁免**課程獲認可，可豁免若干基礎考試。",
          "**概率與統計**構成課程的數學骨幹。",
          "**金融數學**及風險理論從第二年開始深入講授。",
          "**編程技能**包括R、Python及Excel VBA，貫穿整個課程。",
          "**畢業專題項目**將精算方法應用於實際保險或退休金問題。"
        ],
        career: [
          "**精算分析師**就職於亞洲各地的人壽、健康及一般保險公司。",
          "**四大諮詢公司**聘請畢業生從事風險及退休金顧問工作。",
          "**投資銀行**的量化分析及結構性產品崗位。",
          "**金融科技初創**重視精算畢業生的數據驅動風險建模能力。",
          "**政府精算職位**於香港特區政府及監管機構。"
        ],
        campus: [
          "**本部校園**課堂於邵仁枚樓及鈕魯詩樓進行。",
          "**量化金融實驗室**提供彭博終端機及金融數據查閱。",
          "**精算學會**舉辦與業界專業人士的交流活動。",
          "**主圖書館自修室**支援密集考試準備期。",
          "**校園招聘會**每年吸引主要保險公司及諮詢企業參與。"
        ],
        competitiveness: [
          "**競爭性高**，入學中位數成績屬理學院頂尖課程之列。",
          "**數學成績**是入學成功與否的最強預測指標。",
          "**相關工作經驗**或實習能強化邊緣申請個案。",
          "**對精算領域的專業認知**能區分認真的申請者。",
          "**畢業生需求穩定**，使入學競爭持續激烈。"
        ],
        alumni: [
          "**北美精算學會(FSA)**及英國精算師學會(FIA)的資深會員。",
          "**首席精算師**及香港主要保險公司的高級行政人員。",
          "**環球諮詢公司合夥人**，領導亞太區精算業務。",
          "**學術界校友**攻讀博士後於世界各地大學任教。",
          "**創業家**創立保險科技及風險分析初創企業。"
        ],
        scholarships: [
          "**精算學獎學金**嘉許量化科目的優異學術表現。",
          "**香港精算學會專業團體贊助**。",
          "**暑期實習津貼**透過業界夥伴合作提供。",
          "**海外交流資助**支持於夥伴大學修讀精算相關學期。",
          "**入學獎學金**自動頒予表現最優秀的JUPAS入學者。"
        ],
        tips: [
          "**及早開始考試準備**，提前熟悉SOA基礎考試大綱。",
          "**入學前掌握Excel及編程能力**。",
          "**大一即加入精算學會**，建立專業人脈。",
          "**畢業前即尋求保險公司暑期實習**。",
          "**平衡廣度與深度**，以金融或數據科學選修課輔助精算學習。"
        ]
      }
    }
  },
  {
    code: "JS6779",
    nameZh: "統計決策科學",
    nameEn: "Statistical Decision Sciences",
    university: "HKU",
    faculty: "Science",
    en: {
      sections: {
        admission: [
          "**Mathematics competency** required; M1/M2 background is strongly recommended.",
          "**Moderate competitiveness** relative to other HKU Science quantitative programmes.",
          "**Logical reasoning skills** assessed through DSE mathematics and science subject performance.",
          "**Interest in data analysis** should be evident in the personal statement or activities.",
          "**Broad intake** welcomes students from diverse secondary school subject backgrounds."
        ],
        curriculum: [
          "**Statistical theory** and applied methods taught with real-world case studies.",
          "**Decision science** modules cover operations research and optimisation techniques.",
          "**Data science toolkit** includes R, Python, SQL, and machine learning fundamentals.",
          "**Industry projects** in Year 3 and 4 with corporate partners and government agencies.",
          "**Flexible electives** allow specialisation in biostatistics, finance, or social analytics."
        ],
        career: [
          "**Data analysts** in banking, retail, telecom, and technology sectors.",
          "**Business intelligence** roles translating data into strategic recommendations.",
          "**Government statisticians** in the Census and Statistics Department and policy bureaux.",
          "**Market research** professionals designing surveys and interpreting consumer data.",
          "**Graduate studies** in statistics, data science, or operations research at top universities."
        ],
        campus: [
          "**Main Campus** instruction in the Run Run Shaw Building and Chong Yuet Ming Building.",
          "**Computer laboratories** equipped with statistical software and large datasets.",
          "**Data Science Society** hosts hackathons, workshops, and alumni sharing sessions.",
          "**Library data services** provide access to proprietary databases and GIS tools.",
          "**Collaborative spaces** in the Chi Wah Learning Commons support group project work."
        ],
        competitiveness: [
          "**Moderate competitiveness** with a balanced admission score profile.",
          "**Mathematics subjects** remain the most important factor in selection.",
          "**Steady programme growth** reflects rising demand for data-literate graduates.",
          "**Less saturated** than actuarial or computer science programmes at HKU.",
          "**Strong career outcomes** make this an increasingly popular choice."
        ],
        alumni: [
          "**Senior data scientists** at multinational technology and e-commerce companies.",
          "**Government statisticians** who rose to directorate ranks in Hong Kong.",
          "**Analytics consultants** at global firms serving Asia-Pacific clients.",
          "**Academic researchers** publishing in top-tier statistics and machine learning journals.",
          "**Entrepreneurs** who built data analytics consultancies and SaaS platforms."
        ],
        scholarships: [
          "**Faculty of Science Scholarships** available for students with strong mathematics grades.",
          "**Data Science Industry Awards** sponsored by corporate partners for outstanding projects.",
          "**Summer research grants** support independent data analysis projects.",
          "**Exchange scholarships** for semesters at statistics departments overseas.",
          "**Entrance Scholarships** considered for all JUPAS applicants meeting the threshold."
        ],
        tips: [
          "**Build a portfolio** of data projects using publicly available datasets online.",
          "**Learn R or Python** before starting the programme to ease the transition.",
          "**Participate in data competitions** such as Kaggle or local hackathons.",
          "**Develop communication skills** to present statistical findings to non-technical audiences.",
          "**Explore internship opportunities** early in government statistics or corporate analytics teams."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**要求具備數學能力**；強烈建議具備M1/M2背景。",
          "**相對其他港大量化課程**，競爭程度屬中等。",
          "**邏輯推理能力**透過DSE數學及理科成績評估。",
          "**個人陳述或課外活動**應展現對數據分析的興趣。",
          "**廣泛收生**，歡迎來自不同中學科目背景的學生。"
        ],
        curriculum: [
          "**統計理論**與應用方法配合真實案例教學。",
          "**決策科學**單元涵蓋運籌學及優化技術。",
          "**數據科學工具**包括R、Python、SQL及機器學習基礎。",
          "**業界項目**於第三及第四年與企業夥伴及政府機構合作。",
          "**靈活選修**可專攻生物統計、金融或社會分析方向。"
        ],
        career: [
          "**數據分析師**就職於銀行、零售、電訊及科技界。",
          "**商業智能**崗位將數據轉化為策略建議。",
          "**政府統計師**於政府統計處及政策局工作。",
          "**市場研究**專業人員設計調查及解讀消費者數據。",
          "**深造方向**為頂尖大學的統計學、數據科學或運籌學。"
        ],
        campus: [
          "**本部校園**課堂於邵仁枚樓及莊月明樓進行。",
          "**電腦實驗室**配備統計軟件及大型數據集。",
          "**數據科學學會**舉辦黑客松、工作坊及校友分享會。",
          "**圖書館數據服務**提供專有數據庫及地理資訊系統工具。",
          "**志華學習共享空間**的協作空間支援小組項目工作。"
        ],
        competitiveness: [
          "**競爭程度中等**，入學成績要求平衡。",
          "**數學科目**仍然是遴選中最重要的因素。",
          "**課程穩定增長**反映市場對數據人才的需求上升。",
          "**相較精算或電腦科學課程**，競爭飽和度較低。",
          "**良好的就業前景**使其成為日益受歡迎的選擇。"
        ],
        alumni: [
          "**資深數據科學家**任職跨國科技及電商公司。",
          "**政府統計師**晉升至香港首長級職位。",
          "**分析顧問**於環球企業服務亞太區客戶。",
          "**學術研究人員**於頂尖統計及機器學習期刊發表論文。",
          "**創業家**創立數據分析顧問公司及SaaS平台。"
        ],
        scholarships: [
          "**理學院獎學金**頒予數學成績優異的學生。",
          "**數據科學業界獎項**由企業夥伴贊助，嘉許傑出項目。",
          "**暑期研究資助**支持獨立數據分析項目。",
          "**交流獎學金**資助海外統計學系交流學期。",
          "**入學獎學金**所有達標的JUPAS申請人均獲考慮。"
        ],
        tips: [
          "**建立數據項目組合**，利用網上公開數據集進行練習。",
          "**入學前學習R或Python**，有助順利過渡。",
          "**參與數據比賽**如Kaggle或本地黑客松。",
          "**培養溝通技巧**，向非技術聽眾呈現統計發現。",
          "**及早探索實習機會**，包括政府統計或企業分析團隊。"
        ]
      }
    }
  },
  {
    code: "JS6999",
    nameZh: "計算與數據科學",
    nameEn: "Computing and Data Science",
    university: "HKU",
    faculty: "Science",
    en: {
      sections: {
        admission: [
          "**Strong mathematics and science background** essential; M1/M2 and ICT/IS are advantageous.",
          "**High competitiveness** driven by booming demand for computing and AI talent.",
          "**Problem-solving aptitude** assessed through mathematics and science subject grades.",
          "**Programming experience** at the secondary level is helpful but not mandatory.",
          "**Personal projects** or coding portfolios strengthen competitive applications."
        ],
        curriculum: [
          "**Computer science fundamentals** including algorithms, data structures, and software engineering.",
          "**Data science specialisation** with machine learning, deep learning, and big data analytics.",
          "**AI and NLP modules** prepare students for cutting-edge research and industry roles.",
          "**Capstone projects** often involve industry partners such as tech firms and research labs.",
          "**Ethics in AI** and responsible data use are woven into the curriculum."
        ],
        career: [
          "**Software engineers** at global technology companies and local unicorns.",
          "**Machine learning engineers** building production AI systems.",
          "**Data scientists** in finance, healthcare, logistics, and government sectors.",
          "**Research scientists** in AI labs pursuing postgraduate and doctoral studies.",
          "**Tech entrepreneurs** launching startups in Hong Kong's growing innovation ecosystem."
        ],
        campus: [
          "**Main Campus** and the new Tech Landmark building house modern computing facilities.",
          "**High-performance computing clusters** available for machine learning coursework.",
          "**Computer Science Society** runs coding competitions, tech talks, and mentorship programmes.",
          "**Innovation Wing** supports student startups with co-working space and funding advice.",
          "**24/7 coding labs** in the Chow Yei Ching Building for project-based learning."
        ],
        competitiveness: [
          "**Highly competitive** with admission scores among the highest in the Faculty of Science.",
          "**Rising demand** for AI and data science graduates intensifies competition year on year.",
          "**Mathematics and ICT performance** are critical differentiators in the selection process.",
          "**Coding competition achievements** such as HKOI or IOI provide a significant edge.",
          "**Well-rounded applicants** with both technical skill and extracurricular leadership are preferred."
        ],
        alumni: [
          "**Engineers at FAANG** and other top-tier global technology companies.",
          "**AI researchers** at DeepMind, OpenAI, and leading university labs.",
          "**Founders** of Hong Kong-based startups that achieved Series A funding or beyond.",
          "**Professors** in computer science departments at prestigious universities worldwide.",
          "**Chief technology officers** driving digital transformation in traditional industries."
        ],
        scholarships: [
          "**HKU Foundation Scholarships** for outstanding entrants with exceptional academic records.",
          "**Tech industry sponsorships** from companies recruiting computing talent early.",
          "**Innovation and Technology Commission** funding for student-led projects.",
          "**Overseas research internships** supported by the University's global partnerships.",
          "**Entrance Scholarships** and talent-based awards for JUPAS top scorers."
        ],
        tips: [
          "**Start coding early** and build a GitHub portfolio with diverse projects.",
          "**Participate in programming contests** to sharpen algorithmic thinking.",
          "**Explore online courses** in machine learning before university to get a head start.",
          "**Collaborate on team projects** to develop software engineering and communication skills.",
          "**Stay curious** about emerging technologies and follow developments in AI research."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**要求具備紮實的數學及理科基礎**；修讀M1/M2及資訊科技/資訊系統者佔優。",
          "**競爭性高**，受惠於電腦及人工智能人才的蓬勃需求。",
          "**解難能力**透過數學及理科成績評估。",
          "**中學階段的編程經驗**有幫助但非必要。",
          "**個人項目**或編程作品集能強化具競爭力的申請。"
        ],
        curriculum: [
          "**電腦科學基礎**包括演算法、數據結構及軟件工程。",
          "**數據科學專修**涵蓋機器學習、深度學習及大數據分析。",
          "**人工智能及自然語言處理單元**為學生投身前沿研究及業界做好準備。",
          "**畢業專題項目**常與科技企業及研究實驗室等業界夥伴合作。",
          "**人工智能倫理**及負責任數據使用融入課程設計。"
        ],
        career: [
          "**軟件工程師**任職環球科技企業及本地獨角獸公司。",
          "**機器學習工程師**構建生產級人工智能系統。",
          "**數據科學家**服務金融、醫療、物流及政府界別。",
          "**研究科學家**於人工智能實驗室從事研究生及博士研究。",
          "**科技創業家**在香港日益壯大的創科生態圈創辦初創企業。"
        ],
        campus: [
          "**本部校園**及新建Tech Landmark大樓設有現代化電腦設施。",
          "**高性能運算集群**供機器學習課程使用。",
          "**電腦科學學會**舉辦編程比賽、技術講座及師友計劃。",
          "**創新翼**為學生初創提供共享工作空間及融資建議。",
          "**周亦卿樓24小時編程實驗室**支援項目導向學習。"
        ],
        competitiveness: [
          "**競爭性極高**，入學成績屬理學院最高之列。",
          "**人工智能及數據科學畢業生需求上升**，競爭逐年加劇。",
          "**數學及資訊科技成績**是遴選過程中的關鍵區分因素。",
          "**編程比賽成就**如香港電腦奧林匹克或國際奧林匹克提供顯著優勢。",
          "**兼備技術能力與課外領導才能**的全面發展申請者更受青睞。"
        ],
        alumni: [
          "**FAANG等頂尖環球科技企業的工程師**。",
          "**DeepMind、OpenAI及頂尖大學實驗室的人工智能研究員**。",
          "**香港初創企業創辦人**，公司獲A輪或更高融資。",
          "**世界各地知名大學電腦科學系的教授**。",
          "**首席技術官**推動傳統行業的數碼轉型。"
        ],
        scholarships: [
          "**香港大學基金獎學金**頒予成績卓越的入學者。",
          "**科技業界贊助**由提前招募電腦人才的企業提供。",
          "**創新及科技基金**資助學生主導的項目。",
          "**海外研究實習**獲大學全球夥伴關係支持。",
          "**入學獎學金**及人才為本獎項頒予JUPAS頂尖成績者。"
        ],
        tips: [
          "**及早開始編程**，在GitHub建立涵蓋多元項目的作品集。",
          "**參與編程比賽**以磨練演算法思維。",
          "**入學前探索網上機器學習課程**，搶佔先機。",
          "**參與團隊項目**，培養軟件工程及溝通技巧。",
          "**保持對新興科技的好奇心**，緊貼人工智能研究的最新發展。"
        ]
      }
    }
  }
];

async function seed() {
  console.log("[Seed] Starting HKU Details Batch D...");
  for (const prog of PROGRAMME_DETAILS) {
    await JupasProgrammeService.upsertProgrammeDetails(prog);
    console.log(`[Seed] ✓ Success: ${prog.code}`);
  }
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });
