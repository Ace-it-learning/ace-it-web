const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  {
    code: "JS6339",
    nameZh: "工學學士(機械工程)",
    nameEn: "Bachelor of Engineering in Mechanical Engineering",
    university: "HKU",
    faculty: "Engineering",
    en: {
      sections: {
        admission: [
          "**JUPAS prerequisite**: HKDSE 4 core + 2 electives with **Level 3 in English and Chinese**, **Level 2 in Mathematics and Liberal Studies**.",
          "**Preferred electives**: Physics or M1/M2 strongly recommended; Chemistry or ICT accepted.",
          "**Typical admission score**: ~25–27 points (Best 5) for Band A applicants.",
          "**Interview**: Shortlisted candidates may be invited for a **faculty admissions interview**.",
          "**Non-JUPAS**: IB 34+ / GCE A-Level AAB including Mathematics and Physics preferred."
        ],
        curriculum: [
          "**ABET-accredited** programme with a strong foundation in **thermodynamics, fluid mechanics, and solid mechanics**.",
          "**Core labs**: Hands-on training in the **HKU Design, Manufacturing and Services Laboratory**.",
          "**Specialisations**: Available in **aerospace, environmental, and energy engineering** in senior years.",
          "**Capstone project**: Year-long team project solving real industry problems, often with **local manufacturers**.",
          "**Internship**: Minimum **6-week engineering internship** typically completed in Year 3 summer.",
          "**Exchange opportunities**: Partnerships with **TU Munich, Imperial College, and University of Toronto**."
        ],
        career: [
          "**Graduate destinations**: MTR, CLP, HK Electric, Gammon Construction, and **global firms like Siemens**.",
          "**Starting salary**: Approximately **HK$22,000–28,000/month** for fresh graduates.",
          "**Licensing path**: Programme accredited by **HKIE** — graduates can pursue Chartered Engineer status.",
          "**Further study**: Many proceed to **MSc at HKU, MIT, or ETH Zürich**.",
          "**Emerging fields**: Growing demand in **robotics, HVAC design, and sustainable energy systems**."
        ],
        campus: [
          "**Main teaching venue**: **HKU Main Campus** in Pok Fu Lam and the **ZIRI Building** for engineering labs.",
          "**Key facilities**: Advanced **wind tunnel, 3D printing workshop, and CNC machining centre**.",
          "**Student life**: Active **HKU Mechanical Engineering Society** organising factory visits and mentorship.",
          "**Library access**: 24/7 access to **the Knowles Building study spaces** and digital journals.",
          "**Transport**: Well served by **MTR HKU Station** and frequent university shuttle buses."
        ],
        competitiveness: [
          "**Competition level**: **Moderate** — less oversubscribed than Computer Science or Medicine.",
          "**Band A strategy**: Strong performance in **Physics and Mathematics** is the key differentiator.",
          "**Alternative pathway**: Consider **JS6963 Engineering** for broader faculty admission with later specialisation.",
          "**Personal statement tip**: Highlight **practical projects, robotics competitions, or maker experience**.",
          "**Trend**: Slight increase in applicants due to **renewable energy and smart manufacturing trends**."
        ],
        alumni: [
          "**Notable alumni**: Engineers and executives at **MTR Corporation, Airport Authority, and AECOM**.",
          "**Mentorship programme**: Senior alumni paired with Year 2+ students for **career guidance**.",
          "**Industry network**: Strong ties with **HKIE, ASHRAE Hong Kong Chapter, and IoM3**.",
          "**Entrepreneurship**: Some graduates founded **start-ups in industrial automation and green tech**.",
          "**Global presence**: Alumni working in **Singapore, Germany, and the UK** in engineering consultancies."
        ],
        scholarships: [
          "**Dean's Scholarship**: Up to **HK$50,000/year** for top JUPAS entrants with 5** in core subjects.",
          "**HKU Foundation Scholarships**: Merit-based awards for outstanding academic performance.",
          "**Industry-sponsored**: **CLP Power Engineering Scholarship** and **Siemens FutureMakers Award**.",
          "**Financial aid**: **HKU Bursaries** available for students with demonstrated need.",
          "**Overseas exchange grants**: Funding for **summer research at partner universities**."
        ],
        tips: [
          "**Prepare for Physics**: A solid grasp of **mechanics and thermodynamics concepts** will give you a head start.",
          "**Join competitions**: **RoboCon, Formula Student, or EIE projects** strengthen your portfolio.",
          "**Learn CAD early**: Familiarity with **SolidWorks or AutoCAD** is highly valued in coursework.",
          "**Network in Year 1**: Attend **HKIE student chapter events** to build industry connections early.",
          "**Consider double major**: Options to combine with **Computer Science or Business Administration**."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**JUPAS入學要求**：文憑試4個核心科目加2個選修科目，**英文及中文達3級**，**數學及通識達2級**。**建議選修物理或M1/M2**；化學或資訊及通訊科技亦獲接受。**典型收生成績**：Band A申請人最佳5科約25–27分。**面試**：入圍者或獲邀參加**學院入學面試**。**非聯招**：IB 34+ / GCE A-Level AAB，包括數學及物理為佳。"
        ],
        curriculum: [
          "**ABET認證課程**，涵蓋**熱力學、流體力學及固體力學**等核心基礎。**核心實驗室**：在**港大設計、製造及服務實驗室**進行實務訓練。**專修方向**：高年級可選修**航空、環境及能源工程**。**畢業專題**：全年團隊項目，解決真實業界問題，常與**本地製造商**合作。**實習**：第三年暑假須完成最少**6星期工程實習**。**交換機會**：與**慕尼黑工業大學、帝國理工學院及多倫多大學**有合作。"
        ],
        career: [
          "**畢業生去向**：港鐵、中電、港燈、金門建築及**西門子等跨國企業**。**起薪點**：新畢業生約**每月22,000–28,000港元**。**專業資格**：課程獲**香港工程師學會(HKIE)**認證，畢業生可申請註冊工程師資格。**深造**：不少畢業生赴**港大、麻省理工或蘇黎世聯邦理工學院**修讀碩士。**新興領域**：**機械人、暖通空調設計及可持續能源系統**需求日增。"
        ],
        campus: [
          "**主要教學地點**：**港大本部校園**（薄扶林）及**ZIRI大樓**工程實驗室。**重點設施**：先進**風洞、3D打印工作坊及數控加工中心**。**學生活動**：活躍的**港大機械工程學會**，舉辦工廠參觀及師友計劃。**圖書館**：可24小時使用**諾爾斯大樓自修空間**及電子期刊。**交通**：**港鐵香港大學站**及校巴服務便利。"
        ],
        competitiveness: [
          "**競爭程度**：**中等**——較電腦科學或醫學少人競爭。**Band A策略**：**物理及數學**表現優異是關鍵。**替代途徑**：可考慮**JS6963工學**廣泛學院入學，日後再選專修。**個人陳述貼士**：強調**實務項目、機械人比賽或創客經驗**。**趨勢**：因**可再生能源及智慧製造**趨勢，申請人數略增。"
        ],
        alumni: [
          "**傑出校友**：任職於**港鐵公司、機場管理局及艾奕康**的工程師及高管。**師友計劃**：資深校友與二年級以上學生配對，提供**職業指導**。**業界網絡**：與**香港工程師學會、美國採暖製冷及空調工程師學會香港分會及英國材料、礦物和採礦學會**關係密切。**創業**：部分校友創立**工業自動化及綠色科技初創公司**。**國際網絡**：校友於**新加坡、德國及英國**的工程顧問公司工作。"
        ],
        scholarships: [
          "**院長獎學金**：頂尖聯招入學生，核心科目取得5**，每年可獲**港幣50,000元**。**港大基金獎學金**：按學業成績頒發的優異獎項。**業界贊助**：**中電電力工程獎學金**及**西門子未來創客獎**。**經濟援助**：有需要的學生可申請**港大助學金**。**海外交換資助**：資助**夥伴大學暑期研究**費用。"
        ],
        tips: [
          "**打好物理基礎**：掌握**力學及熱力學概念**能讓你更快適應課程。**參加比賽**：**機械人大賽、方程式賽車或電子及資訊工程項目**能豐富履歷。**早學CAD**：熟悉**SolidWorks或AutoCAD**對課業非常有幫助。**一年級開始建立人脈**：參加**香港工程師學會學生分會活動**，及早建立業界聯繫。**考慮雙主修**：可選擇與**計算機科學或工商管理**雙主修。"
        ]
      }
    }
  },
  {
    code: "JS6353",
    nameZh: "工學學士(土木工程)",
    nameEn: "Bachelor of Engineering in Civil Engineering",
    university: "HKU",
    faculty: "Engineering",
    en: {
      sections: {
        admission: [
          "**JUPAS prerequisite**: HKDSE 4 core + 2 electives with **Level 3 in English and Chinese**, **Level 2 in Mathematics and Liberal Studies**.",
          "**Strongly preferred**: Physics and M1/M2; Chemistry or Design & Applied Technology also considered.",
          "**Typical admission score**: ~25–27 points (Best 5) for competitive entry.",
          "**Interview**: Some applicants attend a **faculty interview** focusing on problem-solving interest.",
          "**Non-JUPAS**: IB 34+ / GCE A-Level AAB with Mathematics and a science subject preferred."
        ],
        curriculum: [
          "**HKIE-accredited** programme covering **structural, geotechnical, and environmental engineering**.",
          "**Core modules**: Structural analysis, concrete design, hydraulics, and **transportation engineering**.",
          "**Field trips**: Regular site visits to **MTR extensions, bridge projects, and reclamation sites**.",
          "**Capstone design**: Year-long project often collaborating with **Arup, AECOM, or government departments**.",
          "**Summer placement**: **6–8 week internship** with contractors or consultants strongly encouraged.",
          "**Exchange**: Opportunities at **Imperial College, TU Delft, and University of Illinois at Urbana-Champaign**."
        ],
        career: [
          "**Major employers**: Civil Engineering and Development Department, MTR, Arup, AECOM, and **Gammon**.",
          "**Starting salary**: Approximately **HK$22,000–28,000/month** for graduate engineers.",
          "**Professional qualification**: HKIE accreditation enables direct path to **Chartered Engineer**.",
          "**Further study**: MSc in Structural or Geotechnical Engineering at **HKU, Cambridge, or Stanford**.",
          "**Emerging demand**: **Infrastructure resilience, sustainable construction, and smart city projects**."
        ],
        campus: [
          "**Teaching locations**: **HKU Main Campus** and the **Haking Wong Building** for civil engineering labs.",
          "**Key labs**: **Structural dynamics lab, soils lab, and hydraulics flume** for experiments.",
          "**Student society**: **HKU Civil Engineering Society** organises site visits and networking dinners.",
          "**Library resources**: Access to **ICE, ASCE, and HKIE journals** via HKU Libraries.",
          "**Transport**: Convenient via **MTR HKU Station** and bus routes serving the western district."
        ],
        competitiveness: [
          "**Competition level**: **Moderate** — steady demand aligned with Hong Kong infrastructure pipeline.",
          "**Band A strategy**: Excellence in **Mathematics and Physics** is essential for admission.",
          "**Alternative route**: Apply via **JS6963 Engineering** for broader intake with later specialisation.",
          "**Personal statement tip**: Mention any **site visits, D&T projects, or interest in urban infrastructure**.",
          "**Trend**: Renewed interest due to **Northern Metropolis and Lantau Tomorrow Vision projects**."
        ],
        alumni: [
          "**Notable alumni**: Senior engineers at **Highways Department, Drainage Services, and major consultancies**.",
          "**Mentorship scheme**: Alumni mentors guide students through **summer placement and HKIE training**.",
          "**Industry links**: Strong partnerships with **HKIE, CIC, and professional institutions**.",
          "**Entrepreneurship**: Alumni have founded **construction-tech and surveying start-ups**.",
          "**Global careers**: Graduates working on projects in **Mainland China, Singapore, and the Middle East**."
        ],
        scholarships: [
          "**Dean's Scholarship**: Up to **HK$50,000/year** for top JUPAS entrants.",
          "**CIC scholarships**: **Construction Industry Council** awards for outstanding engineering students.",
          "**Arup/AECOM bursaries**: Industry-sponsored funding for students with placement offers.",
          "**HKU Foundation**: Merit-based scholarships for academic and extracurricular excellence.",
          "**Exchange grants**: Funding support for **overseas study at partner civil engineering schools**."
        ],
        tips: [
          "**Build spatial reasoning**: Practice **technical drawing and CAD** before university starts.",
          "**Site awareness**: Read about **local infrastructure projects** to discuss in interviews.",
          "**Join HKIE events**: Attend **student chapter talks** to learn about training and licensing.",
          "**Develop teamwork skills**: Civil projects are collaborative — **group work experience is valuable**.",
          "**Consider BIM skills**: Basic knowledge of **Building Information Modelling** is increasingly expected."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**JUPAS入學要求**：文憑試4個核心科目加2個選修科目，**英文及中文達3級**，**數學及通識達2級**。**強烈建議選修**：物理及M1/M2；化學或設計與應用科技亦獲考慮。**典型收生成績**：最佳5科約25–27分。**面試**：部分申請人須出席**學院面試**，了解其解難興趣。**非聯招**：IB 34+ / GCE A-Level AAB，包括數學及理科科目為佳。"
        ],
        curriculum: [
          "**香港工程師學會認證課程**，涵蓋**結構、岩土及環境工程**。**核心科目**：結構分析、混凝土設計、水力學及**運輸工程**。**實地考察**：定期參觀**港鐵延線、橋樑工程及填海工地**。**畢業設計**：全年項目，常與**奧雅納、艾奕康或政府部門**合作。**暑期實習**：強烈鼓勵到承建商或顧問公司實習**6–8星期**。**交換機會**：可赴**帝國理工學院、代爾夫特理工大學及伊利諾伊大學厄巴納-香檳分校**。"
        ],
        career: [
          "**主要僱主**：土木工程拓展署、港鐵、奧雅納、艾奕康及**金門**。**起薪點**：畢業工程師約**每月22,000–28,000港元**。**專業資格**：獲香港工程師學會認證，可直接邁向**註冊工程師**資格。**深造**：可於**港大、劍橋或史丹福**修讀結構或岩土工程碩士。**新興需求**：**基建韌性、可持續建造及智慧城市項目**。"
        ],
        campus: [
          "**教學地點**：**港大本部校園**及**黃克競樓**土木工程實驗室。**重點實驗室**：**結構動力學實驗室、土力實驗室及水力學水槽**。**學會**：**港大土木工程學會**舉辦工地參觀及聯誼晚宴。**圖書館資源**：可經港大圖書館查閱**英國土木工程師學會、美國土木工程師學會及香港工程師學會期刊**。**交通**：**港鐵香港大學站**及多條巴士線直達西區。"
        ],
        competitiveness: [
          "**競爭程度**：**中等**——需求穩定，與香港基建規劃掛鉤。**Band A策略**：**數學及物理**成績優異是入學關鍵。**替代途徑**：可經**JS6963工學**廣泛學院入學，日後再選專修。**個人陳述貼士**：提及**工地參觀、設計與應用科技項目或對城市基建的興趣**。**趨勢**：因**北部都會區及明日大嶼願景**項目，興趣回升。"
        ],
        alumni: [
          "**傑出校友**：任職於**路政署、渠務署及大型顧問公司**的高級工程師。**師友計劃**：校友導師指導學生完成**暑期實習及香港工程師學會培訓**。**業界聯繫**：與**香港工程師學會、建造業議會及專業團體**關係密切。**創業**：校友創立**建造科技及測量初創公司**。**國際事業**：畢業生參與**中國內地、新加坡及中東**的工程項目。"
        ],
        scholarships: [
          "**院長獎學金**：頂尖聯招入學生每年可獲**港幣50,000元**。**建造業議會獎學金**：頒予傑出工程學生。**奧雅納/艾奕康助學金**：業界贊助，予獲實習錄取的學生。**港大基金**：按學業及課外活動表現頒發的優異獎學金。**交換資助**：資助**夥伴土木工程學院海外學習**費用。"
        ],
        tips: [
          "**培養空間思維**：開學前練習**工程繪圖及電腦輔助設計**。**了解工地**：閱讀**本地基建項目**資料，以便面試時討論。**參加香港工程師學會活動**：出席**學生分會講座**，了解培訓及專業資格。**培養團隊合作能力**：土木項目講求協作，**小組工作經驗甚有價值**。**學習BIM技能**：具備**建築信息模擬**基礎知識日益重要。"
        ]
      }
    }
  },
  {
    code: "JS6377",
    nameZh: "工學學士與人工智能理學碩士聯合課程",
    nameEn: "Bachelor of Engineering and Master of Science in Artificial Intelligence in Engineering (5-Year Joint Programme)",
    university: "HKU",
    faculty: "Engineering",
    en: {
      sections: {
        admission: [
          "**JUPAS prerequisite**: HKDSE 4 core + 2 electives with **Level 3 in English and Chinese**, **Level 2 in Mathematics and Liberal Studies**.",
          "**Essential electives**: **Mathematics Extended (M1/M2) and Physics** are strongly required.",
          "**Typical admission score**: ~28–32 points (Best 5) — among the **most competitive engineering programmes**.",
          "**Interview**: Mandatory **faculty admissions interview** assessing analytical thinking and AI interest.",
          "**Non-JUPAS**: IB 38+ / GCE A-Level AAA including Mathematics and Further Mathematics preferred."
        ],
        curriculum: [
          "**5-year integrated programme**: Bachelor of Engineering + Master of Science in AI awarded upon completion.",
          "**AI core**: Machine learning, deep learning, **natural language processing, and computer vision**.",
          "**Engineering foundation**: Thermodynamics, circuits, and **systems design** alongside AI coursework.",
          "**Research immersion**: Students join **HKU AI Lab or partner research groups** from Year 3.",
          "**Capstone + thesis**: Final year combines **industry-sponsored engineering project with MSc dissertation**.",
          "**Summer research**: Funded **8–10 week research internships** at HKU or overseas partner labs."
        ],
        career: [
          "**Career edge**: Graduates earn **both BEng and MSc in 5 years**, accelerating entry to senior roles.",
          "**Top employers**: Google, Microsoft, **Huawei Noah's Ark Lab**, and **local AI start-ups**.",
          "**Starting salary**: Approximately **HK$30,000–40,000/month** given the advanced qualification.",
          "**Research track**: Direct pathway to **PhD at HKU, MIT, CMU, or ETH Zürich**.",
          "**Emerging roles**: **AI systems engineer, MLOps specialist, and robotics architect** in high demand."
        ],
        campus: [
          "**Primary hub**: **HKU Main Campus** and the **ZIRI Building** with dedicated AI computing clusters.",
          "**Computing resources**: Access to **NVIDIA DGX systems** and cloud credits for deep learning.",
          "**Research centres**: Affiliated with **HKU-SCF FinTech Academy** and **Institute of Data Science**.",
          "**Student community**: **HKU AI Society** hosts paper-reading groups and hackathons.",
          "**Collaboration spaces**: **InnoHub** and **iDendron** for AI entrepreneurship and prototyping."
        ],
        competitiveness: [
          "**Competition level**: **Very competitive** — attracts top STEM students across Hong Kong.",
          "**Band A strategy**: Secure **5* or above in Mathematics and M1/M2** to be competitive.",
          "**Differentiator**: Demonstrated interest in **programming, AI competitions, or research projects**.",
          "**Personal statement tip**: Discuss **Kaggle rankings, GitHub projects, or AI ethics essays**.",
          "**Trend**: Rapidly growing applicant pool due to **global AI boom and industry demand**."
        ],
        alumni: [
          "**Early cohorts**: Pioneer graduates entering **PhD programmes and AI leadership roles**.",
          "**Industry mentors**: Senior AI researchers at **SenseTime, Alibaba DAMO, and NVIDIA**.",
          "**Entrepreneurship**: Alumni founding **AI start-ups** supported by **HKU iDendron and Cyberport**.",
          "**Academic paths**: Graduates pursuing doctorates at **top-10 global CS programmes**.",
          "**Global network**: Connections to **Silicon Valley, Shenzhen, and Singapore AI ecosystems**."
        ],
        scholarships: [
          "**Dean's Scholarship**: Up to **HK$70,000/year** for exceptional JUPAS entrants.",
          "**HKU Foundation Excellence Awards**: Full or half tuition for top-performing students.",
          "**AI industry scholarships**: **NVIDIA, Microsoft, and local tech firms** sponsor high-potential students.",
          "**Research stipends**: Funding for **conference travel and publication fees** during the MSc phase.",
          "**Entrance scholarships**: Automatic consideration for **HKU Entrance Scholarship** based on DSE results."
        ],
        tips: [
          "**Master Python early**: Fluency in **Python, PyTorch/TensorFlow, and Git** is assumed from Year 1.",
          "**Build a portfolio**: Maintain a **GitHub profile** with ML projects and Kaggle notebooks.",
          "**Read research papers**: Follow **NeurIPS, ICML, and CVPR** proceedings to stay current.",
          "**Join AI competitions**: **HKU AI Hackathon, RoboMaster, or ICPC** strengthen your profile.",
          "**Plan finances**: Budget for **5 years of tuition** despite the accelerated dual degree advantage."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**JUPAS入學要求**：文憑試4個核心科目加2個選修科目，**英文及中文達3級**，**數學及通識達2級**。**必修選修**：強烈要求**數學延伸(M1/M2)及物理**。**典型收生成績**：最佳5科約28–32分——屬**工程學院競爭最激烈的課程之一**。**面試**：必須出席**學院入學面試**，評估分析思維及對人工智能的興趣。**非聯招**：IB 38+ / GCE A-Level AAA，包括數學及進階數學為佳。"
        ],
        curriculum: [
          "**5年整合課程**：完成後同時獲頒**工學學士及人工智能理學碩士**。**人工智能核心**：機器學習、深度學習、**自然語言處理及電腦視覺**。**工程基礎**：同時修讀熱力學、電路及**系統設計**。**研究沉浸**：學生自第三年加入**港大人工智能實驗室或夥伴研究團隊**。**畢業專題+論文**：最後一年結合**業界贊助工程項目及碩士論文**。**暑期研究**：資助**8–10星期研究實習**，於港大或海外夥伴實驗室進行。"
        ],
        career: [
          "**職業優勢**：畢業生**5年內獲雙學位**，更快晉升高級職位。**頂尖僱主**：Google、微軟、**華為諾亞方舟實驗室**及**本地人工智能初創**。**起薪點**：因高階學歷，約**每月30,000–40,000港元**。**研究路徑**：直通**港大、麻省理工、卡內基梅隆或蘇黎世聯邦理工學院**博士課程。**新興職位**：**人工智能系統工程師、MLOps專家及機械人架構師**需求殷切。"
        ],
        campus: [
          "**主要據點**：**港大本部校園**及**ZIRI大樓**，設有專用人工智能運算叢集。**運算資源**：可使用**NVIDIA DGX系統**及深度學習雲端額度。**研究中心**：與**港大-渣打金融科技學院**及**數據科學研究院**聯繫緊密。**學生社群**：**港大人工智能學會**舉辦論文研讀小組及黑客松。**協作空間**：**InnoHub**及**iDendron**供人工智能創業及原型製作。"
        ],
        competitiveness: [
          "**競爭程度**：**非常激烈**——吸引全港頂尖理科學生。**Band A策略**：**數學及M1/M2取得5*或以上**方具競爭力。**差異化因素**：展示對**編程、人工智能比賽或研究項目**的興趣。**個人陳述貼士**：討論**Kaggle排名、GitHub項目或人工智能倫理文章**。**趨勢**：因**全球人工智能熱潮及業界需求**，申請人數急增。"
        ],
        alumni: [
          "**早期畢業生**：先驅畢業生進入**博士課程及人工智能領導崗位**。**業界導師**：**商湯、阿里巴巴達摩院及NVIDIA**的資深人工智能研究員。**創業**：校友創立**人工智能初創公司**，獲**港大iDendron及數碼港**支持。**學術路徑**：畢業生赴**全球十大電腦科學課程**攻讀博士。**國際網絡**：聯繫**矽谷、深圳及新加坡人工智能生態圈**。"
        ],
        scholarships: [
          "**院長獎學金**：傑出聯招入學生每年可獲**港幣70,000元**。**港大基金卓越獎**：頒予頂尖學生全額或半額學費。**人工智能業界獎學金**：**NVIDIA、微軟及本地科技公司**贊助高潛質學生。**研究津貼**：碩士階段資助**會議差旅及論文發表費用**。**入學獎學金**：按文憑試成績自動考慮**港大入學獎學金**。"
        ],
        tips: [
          "**盡早掌握Python**：自一年級起已假設學生精通**Python、PyTorch/TensorFlow及Git**。**建立作品集**：維護**GitHub個人檔案**，展示機器學習項目及Kaggle筆記本。**閱讀研究論文**：追蹤**NeurIPS、ICML及CVPR**論文集，緊貼最新發展。**參加人工智能比賽**：**港大人工智能黑客松、RoboMaster或ICPC**能豐富履歷。**財務規劃**：雖獲雙學位優勢，仍需預算**5年學費**。"
        ]
      }
    }
  },
  {
    code: "JS6925",
    nameZh: "工學學士(生物醫學工程)",
    nameEn: "Bachelor of Engineering in Biomedical Engineering",
    university: "HKU",
    faculty: "Engineering",
    en: {
      sections: {
        admission: [
          "**JUPAS prerequisite**: HKDSE 4 core + 2 electives with **Level 3 in English and Chinese**, **Level 2 in Mathematics and Liberal Studies**.",
          "**Preferred electives**: Biology and Physics; Chemistry or M1/M2 also highly regarded.",
          "**Typical admission score**: ~26–29 points (Best 5) — **moderate-to-high competitiveness**.",
          "**Interview**: Selective **faculty interview** exploring motivation at the intersection of engineering and medicine.",
          "**Non-JUPAS**: IB 36+ / GCE A-Level AAB including Mathematics and Biology or Physics preferred."
        ],
        curriculum: [
          "**Interdisciplinary programme**: Combines **engineering principles with biology, medicine, and data science**.",
          "**Core modules**: Biomechanics, biomaterials, **medical imaging, and biosignal processing**.",
          "**Lab training**: Hands-on sessions at the **HKU Biomedical Engineering Core Facility**.",
          "**Clinical exposure**: Elective shadowing at **Queen Mary Hospital** and collaborations with HKU Medicine.",
          "**Capstone project**: Device or system design project, often with **clinical co-supervisors from HKU Medical School**.",
          "**Exchange**: Opportunities at **Johns Hopkins, ETH Zürich, and University of Toronto** biomedical programmes."
        ],
        career: [
          "**Industry roles**: Medical device R&D at **Siemens Healthineers, Philips, and local MedTech start-ups**.",
          "**Healthcare sector**: Clinical engineering positions at **Hospital Authority and private hospital groups**.",
          "**Starting salary**: Approximately **HK$24,000–30,000/month** for engineering roles in healthcare.",
          "**Further study**: MSc or PhD in **Biomedical Engineering at HKU, MIT, or Johns Hopkins**.",
          "**Emerging fields**: **Regenerative medicine, wearable health tech, and AI-assisted diagnostics**."
        ],
        campus: [
          "**Teaching base**: **HKU Main Campus** and the **Laboratory Block** near Queen Mary Hospital.",
          "**Specialist labs**: **Cell culture suite, biomechanics lab, and imaging instrumentation room**.",
          "**Clinical proximity**: Walking distance to **Queen Mary Hospital** enables unique clinical collaborations.",
          "**Student group**: **HKU Biomedical Engineering Society** runs MedTech talks and hospital visits.",
          "**Library access**: Biomedical databases including **PubMed, IEEE Xplore, and HKU Scholars Hub**."
        ],
        competitiveness: [
          "**Competition level**: **Moderate-to-high** — growing interest in health technology careers.",
          "**Band A strategy**: Strong grades in **Biology, Physics, and Mathematics** are critical.",
          "**Differentiator**: Experience in **science fairs, biology olympiads, or hospital volunteering** stands out.",
          "**Personal statement tip**: Explain **why engineering + medicine** appeals to you specifically.",
          "**Trend**: Rising demand driven by **aging population and Hong Kong's MedTech policy support**."
        ],
        alumni: [
          "**Career paths**: Engineers at **Hospital Authority, medical device firms, and pharmaceutical companies**.",
          "**Clinical engineering**: Alumni managing **medical equipment and health IT systems** in public hospitals.",
          "**Entrepreneurship**: Graduates launching **MedTech ventures** supported by **HKU iDendron and HKSTP**.",
          "**Academia**: PhD graduates joining **HKU Faculty of Medicine and overseas research institutes**.",
          "**Global network**: Alumni working in **Boston, Singapore, and Shenzhen biotech hubs**."
        ],
        scholarships: [
          "**Dean's Scholarship**: Up to **HK$50,000/year** for top JUPAS entrants.",
          "**Medical and Health scholarships**: Awards for students committed to healthcare technology careers.",
          "**Industry sponsorships**: **Siemens Healthineers and Philips** occasionally sponsor outstanding students.",
          "**Research grants**: Funding for **undergraduate research projects** in biomedical labs.",
          "**Exchange bursaries**: Support for **clinical or research placements at overseas partner institutions**."
        ],
        tips: [
          "**Strengthen biology basics**: A good grasp of **human physiology and cell biology** helps enormously.",
          "**Learn programming**: **MATLAB or Python** for data analysis is used extensively in coursework.",
          "**Volunteer clinically**: Experience at **hospitals or elderly care centres** deepens your understanding.",
          "**Stay curious about devices**: Read about **pacemakers, prosthetics, and imaging technology**.",
          "**Network early**: Connect with **HKU Medical School researchers** for potential capstone supervisors."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**JUPAS入學要求**：文憑試4個核心科目加2個選修科目，**英文及中文達3級**，**數學及通識達2級**。**建議選修**：生物及物理；化學或M1/M2亦極受重視。**典型收生成績**：最佳5科約26–29分——**競爭程度中至高**。**面試**：選擇性**學院面試**，探討學生對工程與醫學交叉領域的熱誠。**非聯招**：IB 36+ / GCE A-Level AAB，包括數學及生物或物理為佳。"
        ],
        curriculum: [
          "**跨學科課程**：結合**工程原理與生物學、醫學及數據科學**。**核心科目**：生物力學、生物材料、**醫學成像及生物信號處理**。**實驗室訓練**：於**港大生物醫學工程核心設施**進行實務訓練。**臨床接觸**：可選修到**瑪麗醫院**實習，並與港大醫學院合作。**畢業專題**：設計醫療設備或系統，常由**港大醫學院臨床導師共同指導**。**交換機會**：可赴**約翰霍普金斯大學、蘇黎世聯邦理工學院及多倫多大學**生物醫學課程。"
        ],
        career: [
          "**業界崗位**：於**西門子醫療、飛利浦及本地醫療科技初創**從事醫療器械研發。**醫療界別**：在**醫院管理局及私立醫院集團**擔任臨床工程師。**起薪點**：醫療界工程職位約**每月24,000–30,000港元**。**深造**：可於**港大、麻省理工或約翰霍普金斯大學**修讀生物醫學工程碩士或博士。**新興領域**：**再生醫學、可穿戴健康科技及人工智能輔助診斷**。"
        ],
        campus: [
          "**教學基地**：**港大本部校園**及鄰近瑪麗醫院的**實驗室大樓**。**專門實驗室**：**細胞培養室、生物力學實驗室及成像儀器室**。**臨床鄰近優勢**：步行可達**瑪麗醫院**，促成獨特的臨床合作。**學生組織**：**港大生物醫學工程學會**舉辦醫療科技講座及醫院參觀。**圖書館**：可使用**PubMed、IEEE Xplore及港大學術庫**等生物醫學數據庫。"
        ],
        competitiveness: [
          "**競爭程度**：**中至高**——健康科技事業日益受歡迎。**Band A策略**：**生物、物理及數學**成績優異至關重要。**差異化因素**：具備**科學展覽、生物奧林匹克或醫院義工經驗**尤為突出。**個人陳述貼士**：具體說明**工程+醫學**為何吸引你。**趨勢**：因**人口老化及香港醫療科技政策支援**，需求上升。"
        ],
        alumni: [
          "**事業路徑**：任職於**醫院管理局、醫療器械公司及藥廠**的工程師。**臨床工程**：校友於公立醫院管理**醫療設備及健康資訊科技系統**。**創業**：畢業生創立**醫療科技企業**，獲**港大iDendron及香港科學園**支持。**學術界**：博士畢業生加入**港大醫學院及海外研究機構**。**國際網絡**：校友於**波士頓、新加坡及深圳生物科技樞紐**工作。"
        ],
        scholarships: [
          "**院長獎學金**：頂尖聯招入學生每年可獲**港幣50,000元**。**醫療健康獎學金**：頒予矢志投身醫療科技事業的學生。**業界贊助**：**西門子醫療及飛利浦**間或贊助傑出學生。**研究資助**：資助生物醫學實驗室的**本科生研究項目**。**交換助學金**：支援**海外夥伴機構臨床或研究實習**費用。"
        ],
        tips: [
          "**鞏固生物基礎**：掌握**人體生理學及細胞生物學**對課業幫助甚大。**學習編程**：課業廣泛使用**MATLAB或Python**進行數據分析。**臨床義工經驗**：於**醫院或安老院**的經驗能深化理解。**保持對醫療器械的好奇**：閱讀有關**心臟起搏器、義肢及成像技術**的資料。**及早建立人脈**：聯繫**港大醫學院研究人員**，尋找潛在畢業專題導師。"
        ]
      }
    }
  }
];

async function seed() {
  console.log("[Seed] Starting HKU Details Batch B...");
  for (const prog of PROGRAMME_DETAILS) {
    await JupasProgrammeService.upsertProgrammeDetails(prog);
    console.log(`[Seed] ✓ Success: ${prog.code}`);
  }
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });
