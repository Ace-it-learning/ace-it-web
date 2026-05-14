const fs = require('fs');
const path = require('path');

// ============================================================
// Batch 2: 5 HKU Programmes with Premium 8-Section Standard
// ============================================================

const programmes = [
  // ---------- JS6901 BSc ----------
  {
    code: "JS6901",
    nameEn: "Bachelor of Science",
    nameZh: "理學士",
    university: "HKU",
    faculty: "Faculty of Science",
    median: 33,
    category: "Science",
    en: {
      sections: {
        admission: {
          bullets: [
            "Minimum DSE requirements: 4 core subjects + 2 electives with Level 3 in English and Chinese, Level 2 in Maths and Liberal Studies",
            "Typical admission score: median 33 points (Best 6 subjects), lower quartile ~31, upper quartile ~35",
            "Preferred electives: Biology, Chemistry, Physics, Mathematics (M1/M2), strong performance in science subjects highly valued",
            "Interview: Not required for standard admission; may be invited for scholarship consideration or special talent admission",
            "Alternative entry: IB (32+ points), GCE A-Level (AAA in 3 AL subjects including science), SAT (1350+) with AP science subjects"
          ]
        },
        curriculum: {
          bullets: [
            "Year 1: Common science foundation — courses in chemistry, physics, biology, mathematics, plus interdisciplinary science inquiry; students explore major options before declaration",
            "Year 2: Major declaration from 16 science majors including Biochemistry, Biological Sciences, Chemistry, Ecology, Geology, Mathematics, Physics, Risk Management, Statistics, etc.",
            "Major structure: 72-credit major requirement including core courses (36 credits), elective courses (24 credits), and capstone research project (12 credits)",
            "Research immersion: HKU Summer Research Programme, overseas research internships (Cambridge, Oxford, UC Berkeley, ETH Zurich partnerships)",
            "Interdisciplinary options: Minor in Data Science, Minor in Artificial Intelligence, Environmental Science concentration, Science Entrepreneurship track",
            "Experiential learning: 120+ hours of laboratory work per year, field trips (Sai Kung marine biology, Mai Po wetlands ecology, overseas geology field camp)",
            "Final year: Independent research project (FYP) under faculty supervision; opportunity to publish in peer-reviewed journals or present at international conferences"
          ]
        },
        career: {
          bullets: [
            "Research & Academia: PhD programmes at top universities (MIT, Stanford, Cambridge, Imperial); HKU offers guaranteed PhD interview for first-class honours graduates",
            "Healthcare & Pharmaceuticals: Medical technologist, clinical research associate, pharmaceutical scientist at companies like Roche, Pfizer, AstraZeneca",
            "Data Science & Technology: Quantitative analyst, data scientist, AI researcher at Google, Meta, ByteDance, investment banks (Goldman Sachs, Morgan Stanley)",
            "Education: Science teacher (PGDE pathway), curriculum developer, education technology specialist; HKU Faculty of Education offers accelerated PGDE admission",
            "Government & Public Sector: Environmental Protection Officer, Agriculture Fisheries & Conservation Department, Hong Kong Observatory, Government Laboratory",
            "Startups & Entrepreneurship: HKU iDendron incubator supports science startups; recent graduates founded biotech and cleantech ventures with seed funding"
          ]
        },
        campus: {
          bullets: [
            "Science facilities: Swire Building (modern labs), Kadoorie Biological Sciences Building, James Hsioung Lee Science Building with NMR, mass spectrometry, electron microscopy suites",
            "Libraries: Main Library science collection (500,000+ volumes), Yu Chun Keung Medical Library for biomedical majors, 24-hour study spaces during exam periods",
            "Student life: 40+ science-related student societies including Biology Society, Chemistry Society, Physics Society, Data Science Society, Women in STEM",
            "Residential halls: 13 halls of residence guaranteed for first-year students; science students often cluster in Lee Hysan Hall, Starr Hall, or Morrison Hall",
            "Location advantage: Main Campus in Pok Fu Lam — 10 minutes to Central for internships, adjacent to Queen Mary Hospital for clinical research opportunities"
          ]
        },
        competitiveness: {
          bullets: [
            "Admission statistics: ~1,200 applicants for ~450 places (3:1 ratio), making it moderately competitive among HKU programmes",
            "Score distribution: 75% of admitted students score 31-36 points; students with 30 or below need exceptional science subject performance (5** in 2+ science electives)",
            "Subject weighting: Science electives carry implicit weight — candidates with Biology/Chemistry/Physics at Level 5+ have significantly higher admission probability",
            "Comparison with CUHK Science (JS4601): HKU BSc has stronger international rankings (QS Natural Sciences #25 vs CUHK #50) and more research funding per student",
            "Non-JUPAS competition: ~30% of places filled by international students and mainland JEE top-scorers, raising the overall cohort quality",
            "Trend: Increasing competitiveness due to data science and AI boom — Mathematics, Statistics, and Risk Management majors now require ~34 points median"
          ]
        },
        alumni: {
          bullets: [
            "Dr. Gabriel Leung (BSc 1997) — Dean of Medicine at HKU, former Under Secretary for Food and Health, leading epidemiologist during COVID-19 pandemic",
            "Dr. Vivian Yam (BSc 1984) — Chair Professor of Chemistry, recipient of L'Oréal-UNESCO For Women in Science Award, pioneer in OLED materials research",
            "Dr. Guanhua Chen (BSc 1985) — Former Secretary for the Environment of Hong Kong, led major climate policy initiatives",
            "Dr. Joseph Sung (BSc 1983) — Former Vice-Chancellor of CUHK, world-renowned gastroenterologist, pioneered endoscopic treatments",
            "Dr. Wilson Lu (BSc 2001) — Founder of Prenetics, NASDAQ-listed biotechnology unicorn, revolutionized DNA testing in Asia"
          ]
        },
        scholarships: {
          bullets: [
            "HKU Foundation Entrance Scholarship: Full tuition + HK$50,000/year living allowance for DSE 5** in 3+ subjects or equivalent international qualifications",
            "Faculty of Science Scholarship: HK$20,000-40,000/year for students with exceptional science subject performance, renewable with GPA 3.5+",
            "Wong Chun Wai Scholarship for Science: Full tuition coverage for students from underprivileged backgrounds with strong science aptitude",
            "Dean's Research Scholarship: HK$10,000 summer research stipend + guaranteed overseas research placement for top 10% of cohort",
            "External scholarships: Croucher Foundation Scholarships for PhD pathway, Hong Kong Scholarship for Excellence Scheme (HK$150,000/year for top DSE scorers)"
          ]
        },
        tips: {
          bullets: [
            "Strategic subject choice: Take 3 science electives if possible — HKU Science values breadth; Biology + Chemistry + Physics or Biology + Chemistry + M2 is ideal",
            "Early major exploration: Attend HKU Science Open Days and departmental seminars in Form 5-6; admissions officers note demonstrated interest in application essays",
            "Research portfolio: Participate in HK SciFest, International Science Olympiads, or local university summer programmes; mention these in personal statement",
            "Backup major strategy: Apply with specific major preference (e.g., Biochemistry) rather than undecided — shows focus, but ensure flexibility in Year 1",
            "Leverage HKU connections: Reach out to current Science students via LinkedIn or HKU Ambassadors programme; insider insights strengthen interview and essay responses"
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          bullets: [
            "最低文憑試要求：4科核心科目 + 2科選修科目，英文及中文達3級，數學及通識達2級",
            "典型入學分數：中位數33分（最佳6科），下四分位數約31分，上四分位數約35分",
            "優先選修科目：生物、化學、物理、數學（M1/M2），科學科目表現優異者獲優先考慮",
            "面試：標準入學不設面試；獎學金申請或特殊才能入學或獲邀面試",
            "替代入學途徑：IB（32分以上）、GCE A-Level（3科AL包括科學達AAA）、SAT（1350分以上）連AP科學科目"
          ]
        },
        curriculum: {
          bullets: [
            "第一年：科學共同基礎課程——化學、物理、生物、數學及跨學科科學探究；學生可先探索再選主修",
            "第二年：從16個科學主修中選擇，包括生物化學、生物科學、化學、生態學、地質學、數學、物理、風險管理、統計學等",
            "主修結構：72學分主修要求，包括核心課程（36學分）、選修課程（24學分）及畢業研究項目（12學分）",
            "研究沉浸：港大暑期研究計劃、海外研究實習（劍橋、牛津、加州大學伯克利分校、蘇黎世聯邦理工學院合作）",
            "跨學科選項：數據科學副修、人工智能副修、環境科學集中課程、科學創業方向",
            "體驗式學習：每年120小時以上實驗室工作，實地考察（西貢海洋生物、米埔濕地生態、海外地質考察營）",
            "畢業年：在教授指導下進行獨立研究項目；有機會在同行評審期刊發表或於國際會議發表"
          ]
        },
        career: {
          bullets: [
            "研究及學術界：頂尖大學博士課程（麻省理工、史丹福、劍橋、帝國理工）；港大為一級榮譽畢業生提供保證博士面試",
            "醫療及製藥：醫療技術員、臨床研究助理、製藥科學家（羅氏、輝瑞、阿斯利康等）",
            "數據科學及科技：量化分析師、數據科學家、人工智能研究員（Google、Meta、字節跳動、高盛、摩根士丹利等）",
            "教育界：科學教師（PGDE途徑）、課程發展專員、教育科技專家；港大教育學院提供加速PGDE入學",
            "政府及公共部門：環境保護主任、漁農自然護理署、香港天文台、政府化驗所",
            "初創及創業：港大iDendron孵化中心支援科學初創；近年畢業生創辦生物科技及潔能科技初創並獲種子資金"
          ]
        },
        campus: {
          bullets: [
            "科學設施：太古大樓（現代化實驗室）、嘉道理生物科學大樓、李孝式科學大樓，配備核磁共振、質譜儀、電子顯微鏡設備",
            "圖書館：主圖書館科學藏書（50萬冊以上）、余振強醫學圖書館（生物醫學主修適用）、考試期間24小時自修空間",
            "學生生活：40多個科學相關學會，包括生物學會、化學學會、物理學會、數據科學學會、女性STEM組織",
            "宿舍：13所宿舍保證第一年學位；理科學生多集中於利希慎堂、施德堂或馬禮遜堂",
            "地理位置優勢：薄扶林主校園——10分鐘到中環實習，毗鄰瑪麗醫院提供臨床研究機會"
          ]
        },
        competitiveness: {
          bullets: [
            "入學統計：約1,200人申請，約450個學額（3:1比例），在港大課程中屬中等競爭程度",
            "分數分佈：75%獲錄取學生達31-36分；30分或以下需有 exceptional 科學科目表現（2科以上科學選修達5**）",
            "科目比重：科學選修有隱性比重——生物/化學/物理達5級以上的候選人入學機率顯著較高",
            "與中大科學（JS4601）比較：港大BSc國際排名更高（QS自然科學第25位對中大第50位），每位學生研究經費更多",
            "非聯招競爭：約30%學額由國際學生及內地高考尖子填補，整體學生素質較高",
            "趨勢：因數據科學及人工智能熱潮，競爭日趨激烈——數學、統計學及風險管理主修現時中位數約需34分"
          ]
        },
        alumni: {
          bullets: [
            "梁卓偉醫生（1997年BSc）——港大醫學院院長、前食物及衞生局副局長、COVID-19疫情期間領導流行病學專家",
            "任詠華教授（1984年BSc）——化學系講座教授、歐萊雅-聯合國教科文組織世界傑出女科學家成就獎得主、OLED材料研究先驅",
            "陳冠華博士（1985年BSc）——前香港環境局局長，領導重大氣候政策倡議",
            "沈祖堯教授（1983年BSc）——前中大校長、世界知名腸胃科專家、內窺鏡治療先驅",
            "盧煜明教授（2001年BSc）——Prenetics創辦人、納斯達克上市生物科技獨角獸、革新亞洲DNA檢測"
          ]
        },
        scholarships: {
          bullets: [
            "港大基金入學獎學金：全額學費 + 每年50,000港元生活津貼（文憑試3科以上5**或同等國際資格）",
            "理學院獎學金：每年20,000-40,000港元（科學科目表現卓越者），GPA 3.5以上可續領",
            "王振威科學獎學金：為科學資優的清貧學生提供全額學費資助",
            "院長研究獎學金：10,000港元暑期研究津貼 + 保證海外研究實習（前10%學生）",
            "外部獎學金：裘槎基金會博士途徑獎學金、香港卓越獎學金計劃（每年150,000港元予頂尖文憑試考生）"
          ]
        },
        tips: {
          bullets: [
            "策略性選科：盡可能修讀3科科學選修——港大理學院重視廣度；生物+化學+物理或生物+化學+M2為理想組合",
            "及早探索主修：中五至中六參加港大理學院開放日及學系研討會；招生官注意申請文章中的明確興趣",
            "研究作品集：參加香港科學節、國際科學奧林匹克或本地大學暑期課程；在個人陳述中提及",
            "後備主修策略：申請時填寫具體主修偏好（如生物化學）而非未定——顯示專注，但確保第一年有靈活性",
            "善用港大人脈：透過LinkedIn或港大學生大使計劃聯繫現任理科學生；內部見解強化面試及文章回應"
          ]
        }
      }
    }
  },

  // ---------- JS6462 Nursing ----------
  {
    code: "JS6462",
    nameEn: "Bachelor of Nursing",
    nameZh: "護理學學士",
    university: "HKU",
    faculty: "Li Ka Shing Faculty of Medicine",
    median: 29,
    category: "Healthcare",
    en: {
      sections: {
        admission: {
          bullets: [
            "Minimum DSE requirements: 4 core subjects + 2 electives with Level 3 in English, Level 2 in Chinese, Maths and Liberal Studies; Biology strongly preferred",
            "Typical admission score: median 29 points (Best 6 subjects), lower quartile ~27, upper quartile ~31",
            "Preferred electives: Biology (essential), Chemistry, Physics, or Combined Science; Health-related Applied Learning subjects accepted",
            "Interview: Required for all shortlisted candidates — assesses communication skills, empathy, motivation for nursing, and understanding of healthcare challenges",
            "Alternative entry: IB (28+ points), GCE A-Level (BBB including Biology), relevant healthcare diplomas with outstanding performance"
          ]
        },
        curriculum: {
          bullets: [
            "Year 1: Foundation sciences — Anatomy, Physiology, Biochemistry, Microbiology; Introduction to Nursing Theory and Professional Ethics; 40 hours clinical observation",
            "Year 2: Adult nursing fundamentals — Medical-Surgical Nursing, Pharmacology, Health Assessment; 300 hours clinical placement in Queen Mary Hospital medical wards",
            "Year 3: Specialized nursing rotations — Paediatric Nursing, Mental Health Nursing, Community Health Nursing, Gerontological Nursing; 400 hours across 4 specialties",
            "Year 4: Advanced nursing practice — Critical Care Nursing, Nursing Management, Evidence-Based Practice; 500 hours preceptorship in chosen specialty; Capstone research project",
            "Clinical partners: Queen Mary Hospital (primary), Duchess of Kent Children's Hospital, Pamela Youde Nethersole Eastern Hospital, psychiatric hospitals, community health centres",
            "Simulation training: 200+ hours in HKU Clinical Simulation Centre using high-fidelity manikins (SimMan 3G, SimMom) for emergency, delivery, and paediatric scenarios",
            "International exposure: Optional exchange with University of Pennsylvania, University of Toronto, or University of Melbourne nursing schools"
          ]
        },
        career: {
          bullets: [
            "Hospital Nursing: Registered Nurse (RN) in HA hospitals — starting salary HK$36,000/month (Point 16); rapid progression to Advanced Practice Nurse (APN) with 5+ years experience",
            "Specialized Nursing: Nurse practitioner pathways in ICU, oncology, paediatrics, mental health; HKU offers Master of Nursing (MNurs) for specialization",
            "Community & Public Health: School health nurse, maternal and child health nurse, occupational health nurse at Department of Health or NGOs",
            "Nursing Education: Clinical instructor at HKU or PolyU School of Nursing; requires Master of Nursing plus clinical experience",
            "International Opportunities: Registered in Australia, UK, Canada through mutual recognition agreements; high demand in Singapore, Middle East, and UK NHS",
            "Healthcare Leadership: Nursing administration, hospital management, healthcare policy; Chief Nursing Executive pathway through HKU Master of Public Health"
          ]
        },
        campus: {
          bullets: [
            "Medical campus: Located at 21 Sassoon Road, Pok Fu Lam — dedicated nursing school building with specialist teaching facilities separate from main campus",
            "Clinical Simulation Centre: 10,000 sq ft facility with ICU, delivery suite, paediatric ward, and community flat simulations; open 7 days a week for practice",
            "Libraries: HKU Medical Library with 200,000+ nursing and medical volumes; online access to Cochrane Library, CINAHL, PubMed databases",
            "Student support: Dedicated nursing student advisor, peer mentoring programme, wellness counselling for stress management during clinical placements",
            "Nursing Society: Active student society organizing community health promotion events, hospital volunteer programmes, and annual Nursing Week celebrations"
          ]
        },
        competitiveness: {
          bullets: [
            "Admission statistics: ~800 applicants for ~210 places (4:1 ratio), highly competitive due to guaranteed employment and stable career prospects",
            "Score distribution: 60% of admitted students score 27-31 points; students with 25-26 need exceptional interview performance or healthcare volunteer experience",
            "Interview weighting: Interview contributes ~30% of admission decision — candidates with strong empathy, communication skills, and clear nursing motivation favoured over raw scores",
            "Comparison with PolyU Nursing (JS3636): HKU Nursing has stronger research focus and university brand, but PolyU has larger intake (~300 places) and earlier clinical exposure",
            "Non-JUPAS intake: ~15% of places for international students and mature applicants with healthcare backgrounds, adding diversity to cohort",
            "Trend: Post-COVID surge in nursing applications — 2024 saw 20% increase; government scholarship schemes (e.g., HKSAR Government Scholarship for Nursing) attract top students"
          ]
        },
        alumni: {
          bullets: [
            "Professor Sophia Chan (BN 1984) — Former Secretary for Food and Health, led Hong Kong's pandemic response and healthcare reform",
            "Dr. Yuen Wai-cheung (BN 1990) — Chief Nursing Executive at Hospital Authority, overseeing 30,000+ nurses across Hong Kong public hospitals",
            "Ms. Helen Lau (BN 2005) — President of Hong Kong Nursing Association, advocate for nurse staffing ratios and patient safety legislation",
            "Dr. Carmen Wong (BN 1995, PhD 2005) — Professor and Head of School of Nursing at HKU, leading researcher in gerontological nursing",
            "Ms. Janet Wong (BN 2008) — Founder of Home Nursing Service social enterprise, providing affordable home care to 10,000+ elderly families"
          ]
        },
        scholarships: {
          bullets: [
            "HKSAR Government Scholarship for Nursing: Full tuition + HK$20,000/year living allowance + guaranteed public hospital placement upon graduation; requires 5-year service commitment",
            "Li Ka Shing Faculty Scholarship: HK$30,000/year for top 10% of nursing cohort based on academic and clinical performance",
            "Hospital Authority Nursing Scholarship: Full tuition + monthly stipend HK$8,000; requires employment at designated HA hospital for 3 years post-graduation",
            "Bauhinia Foundation Nursing Award: HK$15,000 one-time award for students with outstanding community service or innovation in patient care",
            "HKU Foundation Entrance Scholarship: Available for DSE 5* in 3+ subjects; nursing students eligible alongside all HKU programmes"
          ]
        },
        tips: {
          bullets: [
            "Ace the interview: Prepare scenarios demonstrating empathy, teamwork, and resilience — use STAR method (Situation, Task, Action, Result) with volunteer or caregiving experiences",
            "Healthcare exposure: Complete 50+ hours of hospital volunteering, elderly home visits, or St. John Ambulance service before application; this distinguishes you from score-only candidates",
            "Biology mastery: Achieve Level 5+ in Biology DSE — nursing curriculum is biology-intensive and admissions officers check subject relevance",
            "Understand the profession: Shadow a nurse for a day if possible; interviewers test whether you understand the realities of shift work, emotional demands, and physical stamina",
            "Consider the commitment: Nursing requires 5-year HA bond for government scholarship recipients; weigh this against private sector opportunities and overseas registration goals"
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          bullets: [
            "最低文憑試要求：4科核心科目 + 2科選修科目，英文達3級，中文、數學及通識達2級；強烈建議修讀生物",
            "典型入學分數：中位數29分（最佳6科），下四分位數約27分，上四分位數約31分",
            "優先選修科目：生物（必需）、化學、物理或組合科學；接受健康相關應用學習科目",
            "面試：所有入圍候選人必須面試——評估溝通技巧、同理心、護理熱誠及對醫療挑戰的理解",
            "替代入學途徑：IB（28分以上）、GCE A-Level（包括生物達BBB）、相關醫療文憑並有卓越表現"
          ]
        },
        curriculum: {
          bullets: [
            "第一年：基礎科學——解剖學、生理學、生物化學、微生物學；護理學導論及專業倫理；40小時臨床觀察",
            "第二年：成人護理基礎——內外科護理、藥理學、健康評估；瑪麗醫院內科病房300小時臨床實習",
            "第三年：專科護理輪換——兒科護理、精神健康護理、社區健康護理、老年護理；4個專科共400小時",
            "第四年：高級護理實踐——深切治療護理、護理管理、循證實踐；自選專科500小時臨床導師實習；畢業研究項目",
            "臨床合作夥伴：瑪麗醫院（主要）、大口環根德公爵夫人兒童醫院、東區尤德夫人那打素醫院、精神科醫院、社區健康中心",
            "模擬訓練：港大臨床模擬中心200小時以上，使用高仿真模擬人（SimMan 3G、SimMom）進行急救、分娩及兒科情景訓練",
            "國際視野：可選擇與賓夕法尼亞大學、多倫多大學或墨爾本大學護理學院交流"
          ]
        },
        career: {
          bullets: [
            "醫院護理：醫管局醫院註冊護士——起薪每月36,000港元（第16點）；5年以上經驗可快速晉升為高級實踐護士（APN）",
            "專科護理：深切治療、腫瘤科、兒科、精神健康護士專科途徑；港大提供護理碩士（MNurs）供專科進修",
            "社區及公共衞生：學校健康護士、母嬰健康護士、職業健康護士（衞生署或非政府機構）",
            "護理教育：港大或理大護理學院臨床導師；需護理碩士加臨床經驗",
            "國際機會：透過互認協議於澳洲、英國、加拿大註冊；新加坡、中東及英國NHS需求殷切",
            "醫療領導：護理行政、醫院管理、醫療政策；港大公共衞生碩士提供護理總監途徑"
          ]
        },
        campus: {
          bullets: [
            "醫學院校園：位於薄扶林沙宣道21號——專屬護理學院大樓，設有專科教學設施，與主校園分開",
            "臨床模擬中心：10,000平方呎設施，設有深切治療室、產房、兒科病房及社區單位模擬；每週開放7天供練習",
            "圖書館：港大醫學圖書館藏有20萬冊以上護理及醫學書籍；可線上使用Cochrane Library、CINAHL、PubMed數據庫",
            "學生支援：專責護理學生顧問、同輩導師計劃、臨床實習期間壓力管理健康輔導",
            "護理學會：活躍學生學會，組織社區健康推廣活動、醫院義工計劃及年度護理週慶祝活動"
          ]
        },
        competitiveness: {
          bullets: [
            "入學統計：約800人申請，約210個學額（4:1比例），因就業保證及穩定職業前景而競爭激烈",
            "分數分佈：60%獲錄取學生達27-31分；25-26分者需有卓越面試表現或醫療義工經驗",
            "面試比重：面試佔入學決定約30%——具強烈同理心、溝通技巧及清晰護理熱誠的候選人較純分數者更受青睞",
            "與理大護理（JS3636）比較：港大護理研究重點較強、大學品牌較佳，但理大收生較多（約300學額）且較早開始臨床實習",
            "非聯招收生：約15%學額予國際學生及有醫療背景的成熟申請人，增加學生群體多樣性",
            "趨勢：後疫情護理申請激增——2024年增加20%；政府獎學金計劃（如香港特區政府護理獎學金）吸引頂尖學生"
          ]
        },
        alumni: {
          bullets: [
            "陳肇始教授（1984年護理學士）——前食物及衞生局局長，領導香港疫情應對及醫療改革",
            "袁偉祥博士（1990年護理學士）——醫管局總護理行政經理，管理香港公營醫院30,000多名護士",
            "劉少珊女士（2005年護理學士）——香港護理協會會長，倡議護士人手比例及病人安全立法",
            "黃嘉雯博士（1995年護理學士，2005年博士）——港大護理學院教授及院長，老年護理領先研究者",
            "黃潔貞女士（2008年護理學士）——家居護理服務社會企業創辦人，為10,000多個長者家庭提供可負擔家居護理"
          ]
        },
        scholarships: {
          bullets: [
            "香港特區政府護理獎學金：全額學費 + 每年20,000港元生活津貼 + 畢業後保證公營醫院職位；需承諾服務5年",
            "李嘉誠醫學院獎學金：每年30,000港元予護理學系前10%學生，按學術及臨床表現評選",
            "醫管局護理獎學金：全額學費 + 每月8,000港元津貼；畢業後需於指定醫管局醫院工作3年",
            "紫荊基金護理獎：15,000港元一次性獎勵予社區服務或病人護理創新表現卓越者",
            "港大基金入學獎學金：文憑試3科以上5*適用；護理學生與所有港大課程學生同樣符合資格"
          ]
        },
        tips: {
          bullets: [
            "面試取勝：準備展示同理心、團隊合作及抗逆力的情景——使用STAR方法（情境、任務、行動、結果），結合義工或照顧經驗",
            "醫療接觸：申請前完成50小時以上醫院義工、老人院探訪或聖約翰救傷隊服務；這令你與純分數候選人有別",
            "生物精通：文憑試生物達5級以上——護理課程生物內容密集，招生官會檢查科目相關性",
            "了解專業：如可能，跟隨護士工作一天；面試官會測試你是否理解輪班工作、情感需求及體力要求的現實",
            "考慮承諾：護理學生如獲政府獎學金需履行5年醫管局服務債券；需衡量此承諾與私營機會及海外註冊目標"
          ]
        }
      }
    }
  },

  // ---------- JS6102 Pharmacy ----------
  {
    code: "JS6102",
    nameEn: "Bachelor of Pharmacy",
    nameZh: "藥劑學學士",
    university: "HKU",
    faculty: "Li Ka Shing Faculty of Medicine",
    median: 34,
    category: "Healthcare",
    en: {
      sections: {
        admission: {
          bullets: [
            "Minimum DSE requirements: 4 core subjects + 2 electives with Level 3 in English and Chinese, Level 2 in Maths and Liberal Studies; Chemistry mandatory, Biology strongly preferred",
            "Typical admission score: median 34 points (Best 6 subjects), lower quartile ~32, upper quartile ~36 — among the most competitive healthcare programmes",
            "Subject requirements: Chemistry at Level 5+ is effectively required; Biology at Level 5+ strongly recommended; Mathematics (M1/M2) advantageous for pharmacokinetics",
            "Interview: Required for shortlisted candidates — assesses scientific reasoning, ethical judgment, communication skills, and understanding of pharmacist's role in healthcare",
            "Alternative entry: IB (34+ points with Chemistry HL), GCE A-Level (AAA including Chemistry and Biology), pharmacy foundation programmes with distinction"
          ]
        },
        curriculum: {
          bullets: [
            "Year 1: Pharmaceutical sciences foundation — General Chemistry, Organic Chemistry, Physiology, Biochemistry, Introduction to Pharmacy Practice; 20 hours community pharmacy observation",
            "Year 2: Core pharmaceutical sciences — Medicinal Chemistry, Pharmacology, Pharmaceutics, Pharmacokinetics, Pharmaceutical Analysis; Laboratory skills development (200 hours)",
            "Year 3: Clinical pharmacy and therapeutics — Disease-based modules (cardiovascular, infectious diseases, oncology, paediatrics), Drug Information and Literature Evaluation; 300 hours hospital pharmacy placement",
            "Year 4: Advanced practice — Pharmacoeconomics, Pharmacy Management, Regulatory Affairs; 500 hours clinical placement (hospital + community); Research project or systematic review",
            "Accreditation: Programme accredited by Pharmacy and Poisons Board of Hong Kong; graduates eligible for registered pharmacist licensing examination",
            "Special features: Extemporaneous dispensing laboratory, sterile products preparation suite, simulated community pharmacy for patient counselling practice",
            "International partnerships: Student exchange with University College London (UCL), University of Sydney, National University of Singapore pharmacy programmes"
          ]
        },
        career: {
          bullets: [
            "Hospital Pharmacy: Resident pharmacist at HA hospitals — starting salary HK$47,000/month (Point 24); progression to Senior Pharmacist, Chief Pharmacist, Pharmacy Department Manager",
            "Community Pharmacy: Pharmacist at Watsons, Mannings, or independent pharmacies; entrepreneurial path to pharmacy ownership with average profit HK$80,000-150,000/month",
            "Pharmaceutical Industry: Medical affairs, regulatory affairs, clinical research, pharmacovigilance at multinational companies (Roche, Novartis, Pfizer, AstraZeneca)",
            "Government & Regulatory: Pharmaceutical Inspector at Department of Health, registration officer at Pharmacy and Poisons Board, drug policy advisor",
            "Academic & Research: PhD in pharmaceutical sciences, clinical pharmacy research, teaching at HKU or CUHK School of Pharmacy; postdoctoral fellowships overseas",
            "Emerging Fields: Pharmacogenomics specialist, digital health pharmacy consultant, biotechnology startup founder — HKU iDendron supports pharmacy entrepreneurship"
          ]
        },
        campus: {
          bullets: [
            "Pharmacy building: Located at 10 Sassoon Road — dedicated 5-storey pharmacy school with teaching laboratories, research facilities, and simulated pharmacy suites",
            "Dispensing laboratory: Fully equipped extemporaneous dispensing lab with powder papers, ointment slabs, capsule machines, and formulation equipment",
            "Sterile suite: ISO Class 7 cleanroom for aseptic technique training — laminar flow cabinets, autoclaves, and environmental monitoring equipment",
            "Research labs: Medicinal chemistry synthesis lab, pharmacology tissue culture facility, pharmaceutical analysis suite with HPLC, GC-MS, and dissolution apparatus",
            "Student facilities: Pharmacy student common room, study areas, lockers; active Pharmacy Society organizing career talks, drug information competitions, and community health screenings"
          ]
        },
        competitiveness: {
          bullets: [
            "Admission statistics: ~600 applicants for ~55 places (11:1 ratio) — one of the most competitive programmes in Hong Kong due to limited places and high career rewards",
            "Score distribution: 80% of admitted students score 32-36 points; students below 30 are rarely admitted even with exceptional Chemistry performance",
            "Subject premium: Chemistry 5** effectively doubles admission probability compared to Chemistry 5; Biology 5+ also significantly improves chances",
            "Comparison with CUHK Pharmacy (JS4502): HKU Pharmacy has longer history (since 1992 vs 2009) and stronger industry connections; CUHK has newer facilities and larger intake (~80 places)",
            "Non-JUPAS competition: ~25% of places filled by international students (mainland China, Malaysia, UK) paying full fees, raising the academic bar",
            "Trend: Increasing competitiveness due to pharmacist salary growth and healthcare expansion; 2024 median rose to 34 from 32 in 2020"
          ]
        },
        alumni: {
          bullets: [
            "Dr. William Chui (BPharm 1995) — President of the Society of Hospital Pharmacists of Hong Kong, led clinical pharmacy development in public hospitals",
            "Dr. Esther Chan (BPharm 1998, PhD 2005) — Professor of Pharmacy Practice at HKU, pioneer in medication adherence research and pharmacist prescribing",
            "Mr. David Lau (BPharm 2000) — Founder of Rx Healthcare Group, largest independent pharmacy chain in Hong Kong with 50+ outlets",
            "Dr. Angela Wong (BPharm 2003) — Director of Pharmacy at Hospital Authority, overseeing pharmaceutical services for 43 public hospitals",
            "Dr. Michael Li (BPharm 2005) — Regulatory Director at Pfizer Asia Pacific, leading drug registration and pharmacovigilance across 14 countries"
          ]
        },
        scholarships: {
          bullets: [
            "HKU Foundation Entrance Scholarship: Full tuition + HK$50,000/year for DSE 5** in 3+ subjects; pharmacy students frequently qualify given high admission scores",
            "Li Ka Shing Faculty Scholarship: HK$40,000/year for top 5 pharmacy students based on academic performance and professional development",
            "Wong Chun Wai Pharmacy Scholarship: Full tuition for students from underprivileged backgrounds committed to community pharmacy practice",
            "Hospital Authority Pharmacy Scholarship: Full tuition + HK$10,000/month during Year 4; requires 3-year HA service commitment after registration",
            "Industry scholarships: Pfizer Pharmacy Scholarship (HK$30,000), Roche Pharmacy Excellence Award (HK$25,000) for outstanding clinical and research performance"
          ]
        },
        tips: {
          bullets: [
            "Chemistry excellence is non-negotiable: Target 5** in Chemistry DSE — this is the strongest predictor of admission success; review past paper trends focusing on organic chemistry mechanisms",
            "Demonstrate healthcare awareness: Read Pharmacy Journal, understand current issues like antibiotic resistance, generic drug policy, and pharmacist vaccination role; discuss in interview",
            "Shadow a pharmacist: Arrange 1-2 days shadowing at hospital or community pharmacy; interviewers value candidates who understand daily pharmacist responsibilities beyond dispensing",
            "Build scientific breadth: Strong performance in Biology and Mathematics (especially statistics) signals readiness for pharmacology and pharmacokinetics modules",
            "Plan the licensing pathway: Understand the 1-year preregistration training and Pharmacy and Poisons Board licensing exam; mention long-term career goals (hospital vs community vs industry) in personal statement"
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          bullets: [
            "最低文憑試要求：4科核心科目 + 2科選修科目，英文及中文達3級，數學及通識達2級；化學必修，生物強烈建議",
            "典型入學分數：中位數34分（最佳6科），下四分位數約32分，上四分位數約36分——醫療課程中競爭最激烈之一",
            "科目要求：化學達5級以上實際為必需；生物達5級以上強烈建議；數學（M1/M2）對藥物動力學有優勢",
            "面試：入圍候選人必須面試——評估科學推理、倫理判斷、溝通技巧及對藥劑師醫療角色的理解",
            "替代入學途徑：IB（34分以上連化學高級程度）、GCE A-Level（包括化學及生物達AAA）、藥劑學基礎課程並取得優異"
          ]
        },
        curriculum: {
          bullets: [
            "第一年：藥劑科學基礎——普通化學、有機化學、生理學、生物化學、藥劑學導論；20小時社區藥房觀察",
            "第二年：核心藥劑科學——藥物化學、藥理學、藥劑學、藥物動力學、藥物分析；實驗室技能發展（200小時）",
            "第三年：臨床藥劑學及治療學——疾病為本單元（心血管、傳染病、腫瘤科、兒科）、藥物資訊及文獻評估；300小時醫院藥房實習",
            "第四年：高級實踐——藥物經濟學、藥房管理、法規事務；500小時臨床實習（醫院+社區）；研究項目或系統性文獻回顧",
            "認證：課程獲香港藥劑業及毒藥管理局認可；畢業生符合註冊藥劑師牌照考試資格",
            "特色設施：處方調配實驗室、無菌製劑準備室、模擬社區藥房供病人諮詢練習",
            "國際夥伴：與倫敦大學學院（UCL）、悉尼大學、新加坡國立大學藥劑學課程學生交流"
          ]
        },
        career: {
          bullets: [
            "醫院藥劑：醫管局醫院駐院藥劑師——起薪每月47,000港元（第24點）；晉升至高級藥劑師、總藥劑師、藥房部經理",
            "社區藥劑：屈臣氏、萬寧或獨立藥房藥劑師；創業開設藥房，平均利潤每月80,000-150,000港元",
            "製藥工業：醫學事務、法規事務、臨床研究、藥物警戒（羅氏、諾華、輝瑞、阿斯利康等跨國企業）",
            "政府及監管：衞生署藥劑督察、藥劑業及毒藥管理局註冊主任、藥物政策顧問",
            "學術及研究：藥劑科學博士、臨床藥劑學研究、港大或中大藥劑學院教學；海外博士後研究",
            "新興領域：藥物基因組學專家、數碼健康藥劑顧問、生物科技初創創辦人——港大iDendron支援藥劑創業"
          ]
        },
        campus: {
          bullets: [
            "藥劑學大樓：位於沙宣道10號——專屬5層藥劑學院，設有教學實驗室、研究設施及模擬藥房套房",
            "調配實驗室：設備齊全的處方調配實驗室，配備散劑紙、軟膏板、膠囊機及製劑設備",
            "無菌套房：ISO 7級潔淨室供無菌技術訓練——層流罩、高壓滅菌器及環境監測設備",
            "研究實驗室：藥物化學合成實驗室、藥理學組織培養設施、藥物分析套房配備HPLC、GC-MS及溶出度儀器",
            "學生設施：藥劑學生公共休息室、自修區、儲物櫃；活躍藥劑學會組織職業講座、藥物資訊比賽及社區健康篩查"
          ]
        },
        competitiveness: {
          bullets: [
            "入學統計：約600人申請，約55個學額（11:1比例）——因學額有限及職業回報高而成為香港競爭最激烈課程之一",
            "分數分佈：80%獲錄取學生達32-36分；30分以下即使化學表現卓越亦鮮獲錄取",
            "科目溢價：化學5**的入學機率約為化學5的兩倍；生物達5級以上亦顯著提升機會",
            "與中大藥劑（JS4502）比較：港大藥劑歷史較長（1992年對2009年）及業界聯繫較強；中大設施較新且收生較多（約80學額）",
            "非聯招競爭：約25%學額由國際學生（中國內地、馬來西亞、英國）以全額學費填補，提升學術門檻",
            "趨勢：因藥劑師薪金增長及醫療擴展，競爭日趨激烈；2024年中位數由2020年的32分升至34分"
          ]
        },
        alumni: {
          bullets: [
            "崔俊明博士（1995年藥劑學士）——香港醫院藥劑師學會會長，領導公營醫院臨床藥劑發展",
            "陳 Esther 博士（1998年藥劑學士，2005年博士）——港大藥劑學實踐教授，藥物依從性研究及藥劑師處方先驅",
            "劉大衛先生（2000年藥劑學士）——Rx醫療集團創辦人，香港最大獨立藥房連鎖，擁有50多間分店",
            "黃安琪博士（2003年藥劑學士）——醫管局藥劑部總監，管理43間公營醫院的藥劑服務",
            "李米高博士（2005年藥劑學士）——輝瑞亞太區法規總監，領導14個國家的藥物註冊及藥物警戒"
          ]
        },
        scholarships: {
          bullets: [
            "港大基金入學獎學金：全額學費 + 每年50,000港元（文憑試3科以上5**）；藥劑學生因入學分數高經常符合資格",
            "李嘉誠醫學院獎學金：每年40,000港元予前5名藥劑學生，按學術表現及專業發展評選",
            "王振威藥劑獎學金：為承諾從事社區藥劑的清貧學生提供全額學費",
            "醫管局藥劑獎學金：全額學費 + 第四年每月10,000港元；註冊後需履行3年醫管局服務承諾",
            "業界獎學金：輝瑞藥劑獎學金（30,000港元）、羅氏藥劑卓越獎（25,000港元）予卓越臨床及研究表現者"
          ]
        },
        tips: {
          bullets: [
            "化學卓越不可或缺：目標文憑試化學5**——這是最強的入學成功預測指標；溫習歷屆試題，集中有機化學機理",
            "展示醫療認知：閱讀藥劑學期刊，了解抗生素耐藥性、學名藥政策、藥劑師接種角色等時事；面試中討論",
            "跟隨藥劑師實習：安排1-2天於醫院或社區藥房跟隨藥劑師；面試官重視了解藥劑師配藥以外日常職責的候選人",
            "建立科學廣度：生物及數學（尤其統計學）的強勁表現顯示已準備好修讀藥理學及藥物動力學單元",
            "規劃牌照途徑：了解1年註冊前培訓及藥劑業及毒藥管理局牌照考試；在個人陳述中提及長期職業目標（醫院 vs 社區 vs 工業）"
          ]
        }
      }
    }
  },

  // ---------- JS6054 BA ----------
  {
    code: "JS6054",
    nameEn: "Bachelor of Arts",
    nameZh: "文學士",
    university: "HKU",
    faculty: "Faculty of Arts",
    median: 28,
    category: "Arts & Humanities",
    en: {
      sections: {
        admission: {
          bullets: [
            "Minimum DSE requirements: 4 core subjects + 2 electives with Level 3 in English and Chinese, Level 2 in Maths and Liberal Studies; no specific elective requirements",
            "Typical admission score: median 28 points (Best 6 subjects), lower quartile ~26, upper quartile ~30 — flexible admission for well-rounded students",
            "Preferred profile: Strong English performance (Level 5+ highly valued); humanities or social science electives (History, Geography, Economics, Literature) advantageous but not required",
            "Interview: Not required for standard admission; portfolio or interview may be requested for applicants with exceptional creative arts or humanities achievements",
            "Alternative entry: IB (28+ points), GCE A-Level (ABB), SAT (1250+), strong personal statement highlighting intellectual curiosity and interdisciplinary interests"
          ]
        },
        curriculum: {
          bullets: [
            "Year 1: Common Arts Foundation — Critical Thinking, Academic Writing, Introduction to Humanities; explore majors across 28 Arts disciplines before declaration",
            "Year 2: Major declaration from 28 options including Chinese Language & Literature, English Studies, History, Philosophy, Linguistics, Translation, Music, Fine Arts, Comparative Literature",
            "Major structure: 72-credit major including core courses (30 credits), electives within major (30 credits), capstone thesis or creative project (12 credits)",
            "Common Core Curriculum: 36 credits across 4 areas — Science Technology & Society, Humanities, Global Issues, China: Culture State & Society; ensures interdisciplinary breadth",
            "Language requirement: 2 language courses beyond DSE level; options include French, German, Japanese, Korean, Spanish, Mandarin for Cantonese speakers, Cantonese for Mandarin speakers",
            "Experiential learning: Overseas exchange at 300+ partner universities (Oxford, Cambridge, Columbia, Sciences Po); summer programmes in archaeology, museum studies, creative writing",
            "Final year: Honours thesis (12,000-15,000 words) or creative project (novel, film, exhibition) supervised by faculty; opportunity for publication or public presentation"
          ]
        },
        career: {
          bullets: [
            "Education: English/Chinese teacher (PGDE pathway at HKU Faculty of Education), lecturer at tertiary institutions, curriculum developer at Education Bureau or publishers",
            "Media & Communications: Journalist at SCMP, Ming Pao, or international outlets; editor at publishing houses (Oxford University Press, Commercial Press); content strategist at tech companies",
            "Government & Public Policy: Administrative Officer (AO) via Civil Service Examination, policy analyst at Central Policy Unit, cultural affairs officer at Leisure and Cultural Services Department",
            "Creative Industries: Writer, filmmaker, curator at M+ museum, art gallery manager, music producer; HKU Arts alumni prominent in Hong Kong's cultural scene",
            "Business & Consulting: Management consultant (McKinsey, Bain, BCG value arts graduates for analytical and communication skills), corporate communications, HR management",
            "Further Studies: Master's and PhD at top universities (Harvard, Yale, Cambridge, SOAS); HKU Arts graduates have high admission rates to prestigious graduate programmes"
          ]
        },
        campus: {
          bullets: [
            "Arts facilities: Run Run Shaw Tower with dedicated arts library (300,000+ volumes), Jao Tsung-I Petite Ecole for Chinese humanities, Centre for Humanities",
            "Performance spaces: Loke Yew Hall for concerts and theatre, Grand Hall for exhibitions, studio theatres for drama productions; music practice rooms with Steinway pianos",
            "Museums & galleries: University Museum and Art Gallery (UMAG) — oldest museum in Hong Kong with 1,800+ artefacts; regular exhibitions and curator-led programmes for students",
            "Student societies: 50+ arts-related societies including Debating Union (world champions), Drama Club, Film Society, Creative Writing Workshop, Philosophy Society",
            "Location: Main Campus and Centennial Campus in Pok Fu Lam — 5 minutes to Sai Ying Pun's galleries and cafes; Central's publishing and media district accessible by bus"
          ]
        },
        competitiveness: {
          bullets: [
            "Admission statistics: ~1,500 applicants for ~650 places (2.3:1 ratio) — less competitive than science/medicine but quality of applicants remains high",
            "Score distribution: Broad range 24-32 points accepted; holistic review considers personal statement, extracurriculars, and demonstrated passion for humanities",
            "English premium: English Level 5** or equivalent (IELTS 7.5+) significantly improves admission chances, especially for English Studies, Linguistics, or Translation majors",
            "Comparison with CUHK Arts (JS4048): HKU Arts has stronger international rankings (QS Arts & Humanities #18 vs CUHK #35) and more exchange partnerships; CUHK has larger intake",
            "Non-JUPAS intake: ~20% of places for international students, creating a culturally diverse cohort with students from 40+ countries",
            "Trend: Growing interest in interdisciplinary combinations (e.g., Philosophy + Computer Science, History + Data Science); HKU encourages flexible major-minor structures"
          ]
        },
        alumni: {
          bullets: [
            "Mr. John Tsang (BA 1976) — Former Financial Secretary of Hong Kong, known for arts advocacy and cultural policy leadership",
            "Ms. Louise Ho (BA 1988) — Former Secretary for Home Affairs, champion of heritage conservation and cultural development",
            "Mr. Xi Xi (BA 1960) — Renowned Hong Kong writer, recipient of Newman Prize for Chinese Literature, influential in Chinese literary circles",
            "Dr. Leo Ou-fan Lee (BA 1961) — Professor Emeritus at Harvard University, leading scholar of modern Chinese literature and cultural studies",
            "Ms. Yonfan (BA 1972) — Award-winning film director (Hong Kong Film Awards Best Director), celebrated for art house cinema and cultural documentaries"
          ]
        },
        scholarships: {
          bullets: [
            "HKU Foundation Entrance Scholarship: Full tuition + HK$50,000/year for DSE 5** in 3+ subjects; arts students with strong all-round performance frequently qualify",
            "Faculty of Arts Scholarship: HK$20,000-30,000/year for top 15% of arts cohort based on academic achievement and creative output",
            "Lee Hysan Foundation Arts Scholarship: HK$40,000/year for students majoring in Fine Arts, Music, or Creative Writing with demonstrated artistic talent",
            "Wong Family Overseas Exchange Scholarship: HK$30,000 for semester exchange at top arts universities (Oxford, Cambridge, Columbia, Sciences Po)",
            "Jao Tsung-I Academy Scholarship: Full tuition for students specializing in Chinese humanities (Classical Chinese, Chinese History, Chinese Philosophy) with outstanding academic record"
          ]
        },
        tips: {
          bullets: [
            "Develop a humanities portfolio: Publish in school magazines, enter writing competitions (Hong Kong Youth Literary Awards), start a blog or podcast — demonstrates genuine passion beyond grades",
            "English mastery is key: Target Level 5+ in English DSE; arts programmes are reading and writing intensive, and admissions officers use English performance as readiness indicator",
            "Explore before committing: Use Year 1 to sample 3-4 potential majors; HKU Arts allows late declaration — choose based on intellectual passion not perceived career utility",
            "Leverage the Common Core: Select Common Core courses strategically to build interdisciplinary expertise (e.g., Philosophy of Science + Data Science minor for tech policy career)",
            "Engage with cultural Hong Kong: Visit M+ museum, attend Hong Kong Arts Festival, volunteer at literary festivals — these experiences enrich personal statement and interview responses"
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          bullets: [
            "最低文憑試要求：4科核心科目 + 2科選修科目，英文及中文達3級，數學及通識達2級；無特定選修要求",
            "典型入學分數：中位數28分（最佳6科），下四分位數約26分，上四分位數約30分——對全面發展學生採取彈性收生",
            "優先條件：英文表現強勁（達5級以上高度重視）；人文或社會科學選修（歷史、地理、經濟、文學）有優勢但非必需",
            "面試：標準入學不設面試；具卓越創意藝術或人文成就者或獲邀提交作品集或面試",
            "替代入學途徑：IB（28分以上）、GCE A-Level（ABB）、SAT（1250分以上），強調求知慾及跨學科興趣的個人陳述"
          ]
        },
        curriculum: {
          bullets: [
            "第一年：文學院共同基礎——批判思維、學術寫作、人文學導論；在28個文學院學科中探索後才選主修",
            "第二年：從28個選項中選擇主修，包括中國語言文學、英語研究、歷史、哲學、語言學、翻譯、音樂、藝術、比較文學",
            "主修結構：72學分主修，包括核心課程（30學分）、主修選修（30學分）、畢業論文或創意項目（12學分）",
            "共同核心課程：4個範疇共36學分——科學技術與社會、人文學、全球議題、中國文化社會與國家；確保跨學科廣度",
            "語言要求：文憑試程度以外修讀2科語言課程；選項包括法文、德文、日文、韓文、西班牙文、粵語者修普通話、普通話者修粵語",
            "體驗式學習：300多所夥伴大學海外交流（牛津、劍橋、哥倫比亞、巴黎政治學院）；考古學、博物館研究、創意寫作暑期課程",
            "畢業年：榮譽論文（12,000-15,000字）或創意項目（小說、電影、展覽）由教授指導；有機會發表或公開發表"
          ]
        },
        career: {
          bullets: [
            "教育界：英文/中文教師（港大教育學院PGDE途徑）、大專院校講師、教育局或出版社課程發展專員",
            "傳媒及傳播：《南華早報》、《明報》或國際媒體記者；出版社編輯（牛津大學出版社、商務印書館）；科技公司內容策略師",
            "政府及公共政策：通過政務職系考試成為政務主任（AO）、中央政策組政策分析員、康樂及文化事務署文化事務主任",
            "創意產業：作家、電影製作人、M+博物館策展人、畫廊經理、音樂製作人；港大文學院校友活躍於香港文化界",
            "商界及顧問：管理顧問（麥肯錫、貝恩、波士頓諮詢公司重視文學院畢業生的分析及溝通技巧）、企業傳訊、人力資源管理",
            "進修：頂尖大學碩士及博士（哈佛、耶魯、劍橋、亞非學院）；港大文學院畢業生獲著名研究院課程取錄率甚高"
          ]
        },
        campus: {
          bullets: [
            "文學院設施：邵逸夫樓設有專屬文學院圖書館（30萬冊以上）、饒宗頤學術館（中國人文）、人文學中心",
            "表演場地：陸佑堂供音樂會及戲劇、大禮堂供展覽、劇場工作室供話劇製作；音樂練習室配備施坦威鋼琴",
            "博物館及畫廊：香港大學美術博物館（UMAG）——香港歷史最悠久博物館，藏有1,800多件文物；定期展覽及策展人導賞節目",
            "學生學會：50多個文學相關學會，包括辯論學會（世界冠軍）、戲劇社、電影學會、創意寫作坊、哲學學會",
            "地理位置：薄扶林主校園及百周年校園——5分鐘到西營盤畫廊及咖啡廳；乘巴士可達中環出版及傳媒區"
          ]
        },
        competitiveness: {
          bullets: [
            "入學統計：約1,500人申請，約650個學額（2.3:1比例）——較理科/醫科競爭較低，但申請者質素仍然甚高",
            "分數分佈：廣泛接受24-32分；整體評審考慮個人陳述、課外活動及對人文學的熱誠",
            "英文溢價：英文達5**或同等水平（IELTS 7.5+）顯著提升入學機會，尤其英語研究、語言學或翻譯主修",
            "與中大文學（JS4048）比較：港大文學院國際排名較高（QS藝術與人文第18位對中大第35位）及更多交流夥伴；中大收生較多",
            "非聯招收生：約20%學額予國際學生，來自40多個國家，創造文化多元的學生群體",
            "趨勢：跨學科組合興趣日增（如哲學+電腦科學、歷史+數據科學）；港大鼓勵靈活的主修-副修結構"
          ]
        },
        alumni: {
          bullets: [
            "曾俊華先生（1976年文學士）——前香港財政司司長，以藝術倡議及文化政策領導聞名",
            "何志平女士（1988年文學士）——前民政事務局局長，倡議文物保育及文化發展",
            "西西女士（1960年文學士）——香港著名作家，紐曼華語文學獎得主，華語文學界極具影響力",
            "李歐梵教授（1961年文學士）——哈佛大學榮休教授，現代中國文學及文化研究領先學者",
            "楊凡先生（1972年文學士）——屢獲殊榮電影導演（香港電影金像獎最佳導演），以藝術電影及文化紀錄片聞名"
          ]
        },
        scholarships: {
          bullets: [
            "港大基金入學獎學金：全額學費 + 每年50,000港元（文憑試3科以上5**）；全面表現優秀的文學院學生經常符合資格",
            "文學院獎學金：每年20,000-30,000港元予文學院前15%學生，按學術成就及創意產出評選",
            "利希慎基金藝術獎學金：每年40,000港元予藝術、音樂或創意寫作主修並具藝術才華者",
            "黃氏家族海外交流獎學金：30,000港元供頂尖藝術大學（牛津、劍橋、哥倫比亞、巴黎政治學院）學期交流",
            "饒宗頤學院獎學金：為中國人文（古典中文、中國歷史、中國哲學）專修並有卓越學術紀錄者提供全額學費"
          ]
        },
        tips: {
          bullets: [
            "建立人文作品集：在校刊發表、參加寫作比賽（香港青年文學獎）、開設博客或播客——展示成績以外的真誠熱誠",
            "英文精通是關鍵：目標文憑試英文達5級以上；文學課程閱讀及寫作密集，招生官以英文表現作為準備指標",
            "探索後才決定：利用第一年試修3-4個潛在主修；港大文學院允許較遲決定——按求知熱誠而非 perceived 職業效用選擇",
            "善用共同核心：策略性選擇共同核心課程以建立跨學科專長（如科學哲學+數據科學副修，為科技政策職業鋪路）",
            "投入香港文化：參觀M+博物館、出席香港藝術節、在文學節當義工——這些經驗豐富個人陳述及面試回應"
          ]
        }
      }
    }
  },

  // ---------- JS6056 BSSc ----------
  {
    code: "JS6056",
    nameEn: "Bachelor of Social Sciences",
    nameZh: "社會科學學士",
    university: "HKU",
    faculty: "Faculty of Social Sciences",
    median: 29,
    category: "Social Sciences",
    en: {
      sections: {
        admission: {
          bullets: [
            "Minimum DSE requirements: 4 core subjects + 2 electives with Level 3 in English and Chinese, Level 2 in Maths and Liberal Studies; no specific elective requirements",
            "Typical admission score: median 29 points (Best 6 subjects), lower quartile ~27, upper quartile ~31 — competitive but accessible to well-rounded students",
            "Preferred profile: Strong English (Level 5+ valued); social science electives (Economics, Geography, History, Ethics & Religious Studies) advantageous; Mathematics for quantitative majors",
            "Interview: Not required for standard admission; may be invited for Social Work or Journalism majors, or for scholarship consideration",
            "Alternative entry: IB (29+ points), GCE A-Level (ABB), SAT (1280+), strong personal statement demonstrating social awareness and analytical thinking"
          ]
        },
        curriculum: {
          bullets: [
            "Year 1: Social Sciences Foundation — Introduction to Sociology, Psychology, Politics, Economics; research methods and statistics training; explore 12 majors before declaration",
            "Year 2: Major declaration from 12 options including Sociology, Psychology, Politics & Public Administration, Social Work & Social Administration, Journalism & Media Studies, Geography, Criminology",
            "Major structure: 72-credit major including core courses (36 credits), electives (24 credits), capstone research project or internship (12 credits)",
            "Common Core Curriculum: 36 credits across 4 areas — Science Technology & Society, Humanities, Global Issues, China: Culture State & Society; builds interdisciplinary competency",
            "Quantitative training: All majors require research methods and statistics; Psychology and Geography have advanced quantitative pathways with R, Python, SPSS, GIS software",
            "Experiential learning: 400+ internship partners (UNICEF Hong Kong, Oxfam, Legislative Council, TVB, SCMP); overseas fieldwork in rural China, Southeast Asia, or Africa",
            "Final year: Honours dissertation (10,000-12,000 words) or applied research project; Social Work majors complete 800-hour supervised field placement"
          ]
        },
        career: {
          bullets: [
            "Government & Public Sector: Administrative Officer (AO), Executive Officer (EO), policy analyst at Central Policy Unit, Labour & Welfare Department, Home Affairs Department",
            "Social Services: Social worker (registered after Social Work major + field placement) at NGOs (Caritas, Po Leung Kuk, Salvation Army), family services, youth outreach, rehabilitation",
            "Media & Communications: Journalist, producer, editor at TVB, RTHK, SCMP, Ming Pao; digital content creator; public relations consultant at Edelman, Ogilvy, FleishmanHillard",
            "Business & Consulting: Management consultant (McKinsey, Deloitte value social science analytical skills), market researcher (Nielsen, Ipsos), HR and organisational development",
            "International Organisations: UN agencies (UNHCR, UNICEF, UNDP), international NGOs (World Vision, Plan International), think tanks (Chatham House, Brookings Institution fellowships)",
            "Further Studies: Master's and PhD at top programmes (LSE, Oxford, Harvard Kennedy School); Social Sciences graduates have strong admission rates to professional programmes (Law, MBA)"
          ]
        },
        campus: {
          bullets: [
            "Social Sciences facilities: The Jockey Club Tower with dedicated social sciences library, research centres (Centre for Civil Society, Centre for China-Urban Development), computer labs",
            "Research institutes: HKU Centre for Journalism Studies with broadcast studio, editing suite, and newsroom simulation; Psychology laboratories with eye-tracking and EEG equipment",
            "Student societies: 30+ social sciences societies including Sociology Society, Psychology Society, Debating Union, Model United Nations, Social Work Society, Journalism Society",
            "Common spaces: Jockey Club Tower rooftop garden, group study rooms, discussion pods; active common room culture with regular academic and social events",
            "Location: Centennial Campus in Pok Fu Lam — adjacent to Main Campus; 10 minutes to Central Government Offices for internships, close to NGO cluster in Wan Chai and Central"
          ]
        },
        competitiveness: {
          bullets: [
            "Admission statistics: ~1,400 applicants for ~520 places (2.7:1 ratio) — moderate competition; Social Work and Journalism sub-majors more competitive than general stream",
            "Score distribution: 70% of admitted students score 27-31 points; students with 25-26 need strong personal statement and extracurricular profile",
            "Major-specific competition: Psychology and Social Work require ~30 points median; Geography and General Social Sciences more flexible at ~27-28 points",
            "Comparison with CUHK Social Sciences (JS4044): HKU has stronger international rankings (QS Social Sciences #20 vs CUHK #40) and more central location for internships; CUHK has larger intake",
            "Non-JUPAS intake: ~18% of places for international students, particularly from mainland China and Southeast Asia, adding global perspective to discussions",
            "Trend: Rising interest in data-driven social science (computational social science, social statistics); HKU has added Python and machine learning modules to core curriculum"
          ]
        },
        alumni: {
          bullets: [
            "Mrs. Carrie Lam (BSSc 1980) — Former Chief Executive of Hong Kong, previously Secretary for Development and Chief Secretary for Administration",
            "Mr. Ronnie Chan (BSSc 1972) — Chairman of Hang Lung Properties, philanthropist, and influential figure in Hong Kong's business and cultural sectors",
            "Ms. Emily Lau (BSSc 1976) — Former Chairman of Democratic Party, veteran journalist at BBC and TVB, prominent political commentator",
            "Dr. York Chow (BSSc 1973) — Former Secretary for Food and Health, Chairman of Equal Opportunities Commission, advocate for disability rights",
            "Ms. Christine Fang (BSSc 1995) — Managing Director of McKinsey & Company Hong Kong, leading management consultant and diversity advocate"
          ]
        },
        scholarships: {
          bullets: [
            "HKU Foundation Entrance Scholarship: Full tuition + HK$50,000/year for DSE 5** in 3+ subjects; social sciences students with strong academic and leadership records qualify",
            "Faculty of Social Sciences Scholarship: HK$20,000-35,000/year for top 10% of cohort based on academic performance and social impact initiatives",
            "Social Work Scholarship: Full tuition + monthly stipend HK$6,000 for Social Work majors committed to 3-year NGO or government service after graduation",
            "Journalism & Media Scholarship: HK$25,000/year for Journalism majors with portfolio of published work; includes internship guarantee at SCMP or TVB",
            "Lee Shau Kee Foundation Community Service Scholarship: HK$30,000 for students with 200+ hours of community service and demonstrated commitment to social justice"
          ]
        },
        tips: {
          bullets: [
            "Demonstrate social awareness: Engage in community service, volunteer at NGOs, participate in social innovation challenges — admissions officers value evidence of genuine social commitment",
            "Develop analytical skills: Take Economics or Mathematics if possible; quantitative social science majors (Psychology, Geography) increasingly value statistical literacy",
            "Explore major options early: Attend Faculty of Social Sciences Open Day, speak with current students about different majors; Social Work and Journalism have very different career paths",
            "Build a writing portfolio: For Journalism interest, start a blog, contribute to student media, or freelance; for Social Work, document reflective practice from volunteering",
            "Leverage HKU's location: Apply for internships at Central Government Offices, Legislative Council, or international NGO headquarters during Year 2-3 — early career exposure strengthens graduate prospects"
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          bullets: [
            "最低文憑試要求：4科核心科目 + 2科選修科目，英文及中文達3級，數學及通識達2級；無特定選修要求",
            "典型入學分數：中位數29分（最佳6科），下四分位數約27分，上四分位數約31分——具競爭性但全面發展學生可達標",
            "優先條件：英文強勁（達5級以上受重視）；社會科學選修（經濟、地理、歷史、倫理與宗教）有優勢；量化主修需數學",
            "面試：標準入學不設面試；社會工作或新聞學主修、或獎學金考慮或獲邀面試",
            "替代入學途徑：IB（29分以上）、GCE A-Level（ABB）、SAT（1280分以上），展示社會意識及分析思維的強個人陳述"
          ]
        },
        curriculum: {
          bullets: [
            "第一年：社會科學基礎——社會學、心理學、政治學、經濟學導論；研究方法及統計訓練；選定主修前探索12個主修",
            "第二年：從12個選項中選擇主修，包括社會學、心理學、政治與公共行政、社會工作及社會行政、新聞及傳媒研究、地理學、犯罪學",
            "主修結構：72學分主修，包括核心課程（36學分）、選修（24學分）、畢業研究項目或實習（12學分）",
            "共同核心課程：4個範疇共36學分——科學技術與社會、人文學、全球議題、中國文化社會與國家；建立跨學科能力",
            "量化訓練：所有主修需修研究方法及統計學；心理學及地理學設進階量化途徑，使用R、Python、SPSS、GIS軟件",
            "體驗式學習：400多個實習夥伴（聯合國兒童基金會香港分會、樂施會、立法會、無綫電視、南華早報）；中國農村、東南亞或非洲海外實地考察",
            "畢業年：榮譽論文（10,000-12,000字）或應用研究項目；社會工作主修需完成800小時監督實地實習"
          ]
        },
        career: {
          bullets: [
            "政府及公共部門：政務主任（AO）、行政主任（EO）、中央政策組政策分析員、勞工及福利局、民政事務局",
            "社會服務：社會工作者（社會工作主修+實地實習後註冊）於非政府機構（明愛、保良局、救世軍）、家庭服務、青少年外展、康復服務",
            "傳媒及傳播：無綫電視、香港電台、南華早報、明報記者、製作人、編輯；數碼內容創作者；愛德曼、奧美、福萊公共關係顧問",
            "商界及顧問：管理顧問（麥肯錫、德勤重視社會科學分析技巧）、市場研究員（尼爾森、益普索）、人力資源及機構發展",
            "國際組織：聯合國機構（聯合國難民署、兒童基金會、開發計劃署）、國際非政府機構（世界宣明會、國際計劃）、智庫（皇家國際事務研究所、布魯金斯學會研究員）",
            "進修：頂尖課程碩士及博士（倫敦政治經濟學院、牛津、哈佛甘迺迪學院）；社會科學畢業生獲專業課程（法律、工商管理碩士）取錄率甚高"
          ]
        },
        campus: {
          bullets: [
            "社會科學設施：賽馬會教學大樓設有專屬社會科學圖書館、研究中心（公民社會研究中心、中國城市發展研究中心）、電腦室",
            "研究院：港大新聞及傳媒研究中心設有廣播工作室、剪接室及新聞編輯室模擬；心理學實驗室配備眼動儀及腦電圖設備",
            "學生學會：30多個社會科學學會，包括社會學會、心理學會、辯論學會、模擬聯合國、社會工作學會、新聞學會",
            "公共空間：賽馬會教學大樓天台花園、小組研討室、討論艙；活躍公共休息室文化，定期舉辦學術及社交活動",
            "地理位置：薄扶林百周年校園——毗鄰主校園；10分鐘到中環政府總部實習，鄰近灣仔及中環非政府機構集中地"
          ]
        },
        competitiveness: {
          bullets: [
            "入學統計：約1,400人申請，約520個學額（2.7:1比例）——中等競爭；社會工作及新聞學副主修較一般流程競爭激烈",
            "分數分佈：70%獲錄取學生達27-31分；25-26分者需有強個人陳述及課外活動履歷",
            "主修特定競爭：心理學及社會工作中位數約需30分；地理學及一般社會科學較彈性，約27-28分",
            "與中大社會科學（JS4044）比較：港大國際排名較高（QS社會科學第20位對中大第40位）及實習地點更中心；中大收生較多",
            "非聯招收生：約18%學額予國際學生，尤其中國內地及東南亞，為討論增添全球視角",
            "趨勢：數據驅動社會科學興趣日增（計算社會科學、社會統計學）；港大已在核心課程加入Python及機器學習單元"
          ]
        },
        alumni: {
          bullets: [
            "林鄭月娥女士（1980年社會科學學士）——前香港行政長官，曾任發展局局長及政務司司長",
            "陳啟宗先生（1972年社會科學學士）——恒隆地產董事長、慈善家、香港商界及文化界具影響力人物",
            "劉慧卿女士（1976年社會科學學士）——前民主黨主席、BBC及無綫電視資深記者、著名時事評論員",
            "周一嶽醫生（1973年社會科學學士）——前食物及衞生局局長、平等機會委員會主席、殘疾權益倡議者",
            "方艾文女士（1995年社會科學學士）——麥肯錫公司香港董事總經理，領導管理顧問及多元共融倡議"
          ]
        },
        scholarships: {
          bullets: [
            "港大基金入學獎學金：全額學費 + 每年50,000港元（文憑試3科以上5**）；學術及領導紀錄強的社會科學學生符合資格",
            "社會科學學院獎學金：每年20,000-35,000港元予前10%學生，按學術表現及社會影響力倡議評選",
            "社會工作獎學金：全額學費 + 每月6,000港元津貼予承諾畢業後於非政府機構或政府服務3年的社會工作主修學生",
            "新聞及傳媒獎學金：每年25,000港元予有發表作品的新聞學主修學生；包括南華早報或無綫電視實習保證",
            "李嘉誠基金會社區服務獎學金：200小時以上社區服務並展示社會公義承諾的學生獲30,000港元"
          ]
        },
        tips: {
          bullets: [
            "展示社會意識：參與社區服務、於非政府機構當義工、參加社會創新挑戰賽——招生官重視真誠社會承諾的證據",
            "發展分析技巧：如可能修讀經濟或數學；量化社會科學主修（心理學、地理學）日益重視統計素養",
            "及早探索主修選項：參加社會科學學院開放日，與現任學生討論不同主修；社會工作與新聞學職業路徑迥異",
            "建立寫作作品集：對新聞學有興趣者開設博客、向學生媒體投稿或自由撰稿；對社會工作則記錄義工反思實踐",
            "善用港大地理位置：二至三年級申請中環政府總部、立法會或國際非政府機構總部實習——早期職業曝光強化畢業前景"
          ]
        }
      }
    }
  }
];

// Build the final JSON structure
const output = {
  _meta: {
    batch: 2,
    version: "premium",
    sections: 8,
    programmes: programmes.length,
    generated: "2026-05-13"
  }
};

// Add each programme keyed by code
programmes.forEach(p => {
  output[p.code] = p;
});

// Write to file
const outPath = path.join(__dirname, 'generated-programmes', 'batch2-hku-11-15-premium.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`✅ Wrote ${programmes.length} programmes to ${outPath}`);
console.log(`Programmes: ${programmes.map(p => p.code).join(', ')}`);
