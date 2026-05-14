const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  {
    code: "JS6482",
    nameZh: "中醫全科學士",
    nameEn: "Bachelor of Chinese Medicine (BChinMed)",
    university: "香港大學",
    faculty: "醫學院",
    en: {
      sections: {
        admission: {
          title: "Admission Requirements",
          content: [
            "**HKDSE Core Subjects**: Minimum **Level 3** in Chinese Language, English Language, and Mathematics (Compulsory Part).",
            "**Science Electives**: **Biology or Chemistry** at Level 3 or above is highly preferred; both sciences strengthen the application significantly.",
            "**Chinese Language Proficiency**: A strong command of **Classical Chinese** is essential due to the programme's heavy reliance on traditional medical texts.",
            "**Expected DSE Score**: Competitive applicants typically achieve **28–30 points** or above in Best 5 subjects.",
            "**Interview Performance**: Shortlisted candidates are assessed on **communication skills**, **cultural sensitivity**, and **motivation for traditional medicine**."
          ]
        },
        curriculum: {
          title: "Curriculum Overview",
          content: [
            "**Six-Year Programme**: Combines **modern biomedical sciences** with **traditional Chinese medicine theory** and clinical practice.",
            "**Core TCM Subjects**: Covers **acupuncture**, **herbal medicine**, **tui na massage**, **diagnostics**, and **classical medical texts**.",
            "**Biomedical Integration**: Includes **anatomy**, **physiology**, **pathology**, and **pharmacology** to bridge Eastern and Western medicine.",
            "**Clinical Training**: Extensive **hospital and clinic placements** in HKU-affiliated Chinese medicine centres across Hong Kong.",
            "**Research Component**: Students complete a **final-year research project** in areas such as herbal pharmacology or integrative medicine.",
            "**Language of Instruction**: Lectures delivered in **Cantonese and Mandarin**, with English used for biomedical courses."
          ]
        },
        career: {
          title: "Career Prospects",
          content: [
            "**Registered Chinese Medicine Practitioner**: Graduates are eligible to sit for the **licensing examination** administered by the Chinese Medicine Council of Hong Kong.",
            "**Private Practice**: Many graduates establish their own **Chinese medicine clinics** or join established TCM groups.",
            "**Hospital Employment**: Opportunities in **public hospital Chinese medicine centres** and **integrated Chinese-Western medicine clinics**.",
            "**Research & Academia**: Graduates may pursue **MPhil or PhD** studies and contribute to **evidence-based TCM research**.",
            "**Health & Wellness Industry**: Roles in **herbal product development**, **wellness consulting**, and **corporate health programmes**."
          ]
        },
        campus: {
          title: "Campus & Facilities",
          content: [
            "**Main Campus**: Teaching primarily at the **Sassoon Road Campus** and **Faculty of Medicine buildings** in Pok Fu Lam.",
            "**Chinese Medicine Clinics**: On-campus **teaching clinics** provide supervised patient consultations and herbal dispensing practice.",
            "**Herbal Medicine Garden**: Dedicated **medicinal plant garden** for hands-on learning of herb identification and cultivation.",
            "**Library Resources**: Extensive collection of **classical Chinese medical texts**, modern journals, and digital databases.",
            "**Research Labs**: State-of-the-art laboratories for **herbal quality control**, **phytochemistry**, and **clinical trials**."
          ]
        },
        competitiveness: {
          title: "Competitiveness",
          content: [
            "**High Demand**: Consistently one of the **most competitive TCM programmes** in Hong Kong with limited intake.",
            "**Science Background Advantage**: Applicants with **both Biology and Chemistry** have a significantly higher chance of admission.",
            "**Interview Weighting**: The **admissions interview** carries substantial weight; cultural awareness and motivation are closely assessed.",
            "**Banding Impact**: **Band A choices** are essential; very few offers are made to Band B or lower applicants.",
            "**Alternative Pathways**: Consider **relevant associate degrees** or **sub-degree programmes** in health sciences as stepping stones."
          ]
        },
        alumni: {
          title: "Notable Alumni & Networks",
          content: [
            "**Pioneering Practitioners**: Alumni have founded **leading Chinese medicine clinic chains** across Hong Kong and Greater China.",
            "**Academic Leaders**: Graduates hold **professorships** at major universities in Hong Kong, mainland China, and overseas.",
            "**Policy Contributors**: Alumni serve on the **Chinese Medicine Council** and **Hospital Authority advisory committees**.",
            "**Global Network**: Strong connections with **mainland Chinese medicine universities** and **international TCM associations**.",
            "**Mentorship Programme**: Current students are paired with **practising alumni** for career guidance and clinical shadowing."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**Entrance Scholarships**: Merit-based awards for students with **outstanding DSE results** or exceptional interview performance.",
            "**TCM-specific Bursaries**: Donor-funded scholarships supporting students committed to **community TCM services**.",
            "**Clinical Excellence Awards**: Recognises outstanding performance during **final-year clinical internships**.",
            "**Research Grants**: Funding available for **undergraduate research projects** in herbal medicine and integrative health.",
            "**Government Financial Assistance**: Eligible students may apply for **TSFS** and **NLSPS** loans and grants."
          ]
        },
        tips: {
          title: "Application Tips",
          content: [
            "**Strengthen Chinese Language**: Read **classical Chinese texts** and medical literature to demonstrate readiness for the curriculum.",
            "**Gain Exposure**: Attend **public TCM seminars**, **herb exhibitions**, or **volunteer at community acupuncture clinics**.",
            "**Prepare for the Interview**: Be ready to discuss **why TCM appeals to you** and how you view its integration with modern medicine.",
            "**Highlight Science Grades**: Emphasise **Biology and Chemistry achievements** in your personal statement.",
            "**Show Long-term Commitment**: Admissions officers value applicants who demonstrate a **genuine, sustained interest** in Chinese medicine."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求",
          content: [
            "**文憑試核心科目**：中國語文、英國語文及數學（必修部分）須達**第3級**或以上。",
            "**理科選修科**：**生物或化學**達第3級或以上為高度優先；兩科兼修可顯著提升競爭力。",
            "**中文能力**：需具備良好的**文言文基礎**，課程涉及大量傳統中醫典籍閱讀。",
            "**預計文憑試分數**：具競爭力的申請人通常於最佳五科取得**28–30分**或以上。",
            "**面試表現**：入圍者將接受**溝通能力**、**文化敏感度**及**學習中醫的動機**評估。"
          ]
        },
        curriculum: {
          title: "課程概覽",
          content: [
            "**六年制課程**：結合**現代生物醫學**與**傳統中醫理論**及臨床實踐。",
            "**中醫核心科目**：涵蓋**針灸**、**中藥學**、**推拿**、**中醫診斷學**及**中醫經典**。",
            "**生物醫學整合**：包括**解剖學**、**生理學**、**病理學**及**藥理學**，貫通東西方醫學。",
            "**臨床培訓**：於港大附屬中醫教研中心進行**醫院及診所實習**。",
            "**研究項目**：學生須完成**畢業專題研究**，方向包括中藥藥理學或整合醫學。",
            "**授課語言**：中醫課程以**粵語及普通話**授課，生物醫學課程以英語授課。"
          ]
        },
        career: {
          title: "就業前景",
          content: [
            "**註冊中醫**：畢業生可報考**香港中醫藥管理委員會**舉辦的執業資格試。",
            "**私人執業**：不少畢業生開設**個人中醫診所**或加入大型中醫集團。",
            "**醫院就業**：可於**公營醫院中醫診所**及**中西醫結合診所**工作。",
            "**研究及學術**：畢業生可深造**哲學碩士或博士**，從事**實證中醫研究**。",
            "**健康產業**：從事**中藥產品開發**、**養生顧問**及**企業健康計劃**等工作。"
          ]
        },
        campus: {
          title: "校園及設施",
          content: [
            "**主校園**：主要於**沙宣道校園**及**薄扶林醫學院大樓**上課。",
            "**中醫診所**：校內設有**教學診所**，提供督導下的病人診症及配藥實習。",
            "**中草藥園**：設有**藥用植物園**，讓學生實地學習草藥辨識及種植。",
            "**圖書館資源**：館藏豐富的**中醫古典文獻**、現代期刊及電子數據庫。",
            "**研究實驗室**：配備先進設備，進行**中藥質量控制**、**植物化學**及**臨床試驗**。"
          ]
        },
        competitiveness: {
          title: "競爭程度",
          content: [
            "**需求甚高**：此為香港**競爭最激烈的中醫課程**之一，學額有限。",
            "**理科背景優勢**：具備**生物及化學**的申請人入讀機會顯著較高。",
            "**面試比重**：**入學面試**佔相當比重，文化認知及學習動機為評估重點。",
            "**Band影響**：必須放於**Band A**；極少向Band B或更低志願的申請人派發錄取。",
            "**替代途徑**：可考慮修讀**健康科學相關副學位課程**作為升學階梯。"
          ]
        },
        alumni: {
          title: "知名校友及網絡",
          content: [
            "**開創性執業者**：校友創辦了香港及大中華區**頂尖中醫診所連鎖**。",
            "**學術領袖**：畢業生於香港、內地及海外**主要大學擔任教授**。",
            "**政策貢獻者**：校友於**中醫藥管理委員會**及**醫管局諮詢委員會**服務。",
            "**全球網絡**：與**內地中醫藥大學**及**國際中醫藥組織**聯繫緊密。",
            "**師友計劃**：在校學生與**執業校友配對**，獲得職業指導及臨床見習機會。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**入學獎學金**：授予**文憑試成績優異**或面試表現突出的學生。",
            "**中醫專項助學金**：由捐款人設立，資助承諾**社區中醫服務**的學生。",
            "**臨床卓越獎**：表彰**畢業年臨床實習**表現傑出的學生。",
            "**研究資助**：為**中藥學及整合健康本科生研究項目**提供經費。",
            "**政府資助**：合資格學生可申請**專上學生資助計劃（TSFS）**及**免入息審查貸款計劃（NLSPS）**。"
          ]
        },
        tips: {
          title: "申請貼士",
          content: [
            "**強化中文能力**：多閱讀**文言文及中醫文獻**，展示應付課程的準備。",
            "**增加接觸**：參加**公開中醫講座**、**草藥展覽**或**社區針灸診所義工**。",
            "**準備面試**：準備討論**中醫吸引你的原因**，以及你如何看待其與現代醫學的結合。",
            "**突顯理科成績**：在個人陳述中強調**生物及化學的成就**。",
            "**展示長期承擔**：招生官重視對中醫有**真誠且持續興趣**的申請人。"
          ]
        }
      }
    }
  },
  {
    code: "JS6494",
    nameZh: "藥劑學學士",
    nameEn: "Bachelor of Pharmacy (BPharm)",
    university: "香港大學",
    faculty: "醫學院",
    en: {
      sections: {
        admission: {
          title: "Admission Requirements",
          content: [
            "**HKDSE Core Subjects**: Minimum **Level 3** in Chinese Language, English Language, and Mathematics (Compulsory Part); **Level 2** in Liberal Studies / Citizenship and Social Development.",
            "**Science Electives**: **Chemistry at Level 3 or above is mandatory**; Biology or Physics at Level 3 strongly preferred.",
            "**Mathematics Competency**: Strong performance in **Mathematics (Compulsory Part)** and **Mathematics Extended Part (M1/M2)** is advantageous.",
            "**Expected DSE Score**: Competitive applicants typically achieve **30–32 points** in Best 5 subjects.",
            "**Interview & Aptitude**: Some candidates may be invited for an **interview** or **aptitude assessment** focusing on scientific reasoning and ethics."
          ]
        },
        curriculum: {
          title: "Curriculum Overview",
          content: [
            "**Four-Year Programme**: Intensive training in **pharmaceutical sciences**, **clinical pharmacy**, and **patient care**.",
            "**Core Subjects**: Covers **medicinal chemistry**, **pharmacology**, **pharmaceutics**, **pharmacokinetics**, and **therapeutics**.",
            "**Clinical Pharmacy**: Extensive training in **hospital and community pharmacy practice**, including **medication therapy management**.",
            "**Dispensing & Compounding**: Hands-on laboratory sessions in **drug formulation**, **sterile preparation**, and **quality control**.",
            "**Research & Capstone**: Final-year **research project** or **industrial placement** in pharmaceutical companies or research institutes.",
            "**Accreditation**: Programme accredited by the **Pharmacy and Poisons Board of Hong Kong** for registration eligibility."
          ]
        },
        career: {
          title: "Career Prospects",
          content: [
            "**Registered Pharmacist**: Graduates complete **pre-registration training** and pass the **Registration Examination** to practise in Hong Kong.",
            "**Hospital Pharmacy**: Roles in **public and private hospitals**, managing **medication distribution**, **clinical trials**, and **antimicrobial stewardship**.",
            "**Community Pharmacy**: Manage **retail pharmacies**, provide **patient counselling**, **health screenings**, and **vaccination services**.",
            "**Pharmaceutical Industry**: Opportunities in **drug development**, **regulatory affairs**, **medical affairs**, and **pharmacovigilance**.",
            "**Academia & Research**: Pursue **MPharm, MSc, or PhD** and contribute to **pharmaceutical sciences research** and teaching."
          ]
        },
        campus: {
          title: "Campus & Facilities",
          content: [
            "**Main Campus**: Teaching based at the **Faculty of Medicine** in Pok Fu Lam and **laboratory facilities** on the main HKU campus.",
            "**Dispensing Laboratories**: Simulated **community and hospital pharmacy** environments for hands-on dispensing practice.",
            "**Research Labs**: Advanced laboratories for **drug synthesis**, **analytical chemistry**, **cell culture**, and **pharmacology studies**.",
            "**Library & Databases**: Access to **pharmaceutical databases** such as Micromedex, Lexicomp, and major scientific journals.",
            "**Collaboration Spaces**: Dedicated areas for **interprofessional education** with medical, nursing, and dental students."
          ]
        },
        competitiveness: {
          title: "Competitiveness",
          content: [
            "**Very High Competition**: Pharmacy is consistently among the **most competitive healthcare programmes** in Hong Kong with limited places.",
            "**Chemistry Essential**: **Chemistry is a strict requirement**; applicants without it are not considered regardless of overall score.",
            "**Science Combination**: Taking **Chemistry + Biology** or **Chemistry + Physics** significantly improves admission chances.",
            "**Band A Necessity**: Almost all offers go to **Band A applicants**; lower band choices have minimal chance.",
            "**Alternative Entry**: Consider **BSc in Biomedical Sciences** or **Chemistry** followed by **MPharm overseas** if direct entry is not achieved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Networks",
          content: [
            "**Hospital Pharmacy Leaders**: Alumni serve as **Chief Pharmacists** and **Directors of Pharmacy** in major public hospitals.",
            "**Industry Executives**: Graduates hold senior roles in **multinational pharmaceutical companies** in Asia-Pacific headquarters.",
            "**Community Pharmacy Pioneers**: Alumni have built **successful retail pharmacy chains** and **specialty compounding pharmacies**.",
            "**Academic Contributors**: Graduates teach at **HKU** and other institutions, advancing **pharmacy education and research**.",
            "**Professional Networks**: Active involvement in the **Hong Kong Pharmacists Association** and **international pharmacy federations**."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**Entrance Scholarships**: Awarded to students with **exceptional DSE results**, particularly in science subjects.",
            "**Pharmacy-specific Awards**: Industry-sponsored scholarships from **pharmaceutical companies** supporting outstanding students.",
            "**Clinical Practice Grants**: Funding for **overseas clinical electives** and **international pharmacy conferences**.",
            "**Research Scholarships**: Support for **undergraduate research** in drug discovery, pharmacology, and public health pharmacy.",
            "**Government Assistance**: Eligible students may apply for **TSFS**, **NLSPS**, and **non-means-tested loan schemes**."
          ]
        },
        tips: {
          title: "Application Tips",
          content: [
            "**Excel in Chemistry**: Achieve the **highest possible grade in Chemistry**; it is the single most important subject for admission.",
            "**Develop Scientific Curiosity**: Read **pharmaceutical news**, follow **drug approval updates**, and understand **healthcare policy**.",
            "**Gain Healthcare Exposure**: Volunteer at **hospitals**, **community pharmacies**, or **elderly care centres** to understand patient care.",
            "**Practise Ethical Reasoning**: Pharmacy involves **complex ethical decisions**; be prepared to discuss scenarios in interviews.",
            "**Consider Backup Plans**: If BPharm is extremely competitive, explore **related bioscience degrees** with pathways to pharmacy."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求",
          content: [
            "**文憑試核心科目**：中國語文、英國語文及數學（必修部分）須達**第3級**；通識教育／公民與社會發展須達**第2級**。",
            "**理科選修科**：**化學達第3級或以上為必修**；生物或物理達第3級為強烈優先。",
            "**數學能力**：**數學（必修部分）**及**數學延伸部分（M1/M2）**表現優異者更具優勢。",
            "**預計文憑試分數**：具競爭力的申請人通常於最佳五科取得**30–32分**。",
            "**面試及能力評估**：部分考生或獲邀參加**面試**或**能力評估**，重點考核科學推理及倫理判斷。"
          ]
        },
        curriculum: {
          title: "課程概覽",
          content: [
            "**四年制課程**：密集培訓**藥劑科學**、**臨床藥學**及**病人護理**。",
            "**核心科目**：涵蓋**藥物化學**、**藥理學**、**藥劑學**、**藥物動力學**及**治療學**。",
            "**臨床藥學**：於**醫院及社區藥房**進行廣泛實踐培訓，包括**藥物治療管理**。",
            "**配藥及製劑**：實驗室實習**藥物配方**、**無菌製劑**及**質量控制**。",
            "**研究及畢業專題**：畢業年進行**研究項目**或於**藥企及研究機構實習**。",
            "**專業認可**：課程獲**香港藥劑業及毒藥管理局**認可，畢業生具註冊資格。"
          ]
        },
        career: {
          title: "就業前景",
          content: [
            "**註冊藥劑師**：畢業生須完成**實習訓練**並通過**註冊考試**，方可在香港執業。",
            "**醫院藥劑**：於**公營及私立醫院**工作，管理**藥物分發**、**臨床試驗**及**抗菌素管理**。",
            "**社區藥房**：管理**零售藥房**，提供**病人諮詢**、**健康檢查**及**疫苗接種服務**。",
            "**製藥工業**：從事**藥物研發**、**法規事務**、**醫學事務**及**藥物警戒**。",
            "**學術及研究**：深造**藥劑學碩士、理學碩士或博士**，從事**藥劑科學研究及教學**。"
          ]
        },
        campus: {
          title: "校園及設施",
          content: [
            "**主校園**：於**薄扶林醫學院**及**港大主校園實驗室**上課。",
            "**配藥實驗室**：模擬**社區及醫院藥房**環境，進行實務配藥練習。",
            "**研究實驗室**：先進設備進行**藥物合成**、**分析化學**、**細胞培養**及**藥理研究**。",
            "**圖書館及數據庫**：可使用**Micromedex**、**Lexicomp**等藥劑數據庫及主要科學期刊。",
            "**協作空間**：專設區域供**跨專業教育**，與醫科、護理及牙科學生協作。"
          ]
        },
        competitiveness: {
          title: "競爭程度",
          content: [
            "**競爭極高**：藥劑學一直是香港**競爭最激烈的醫療課程**之一，學額有限。",
            "**化學為必修**：**化學為嚴格要求**；無論總分多高，未修讀化學者不予考慮。",
            "**理科組合**：修讀**化學+生物**或**化學+物理**可顯著提升入讀機會。",
            "**必須Band A**：幾乎所有錄取均派予**Band A申請人**；較低志願機會甚微。",
            "**替代途徑**：如未能直接入讀，可考慮**生物醫學或化學理學士**，再赴海外修讀藥劑學碩士。"
          ]
        },
        alumni: {
          title: "知名校友及網絡",
          content: [
            "**醫院藥劑領袖**：校友擔任主要公營醫院的**總藥劑師**及**藥劑部總監**。",
            "**藥業高管**：畢業生於**跨國藥企亞太區總部**擔任高級職位。",
            "**社區藥房先驅**：校友創辦**成功的零售藥房連鎖**及**專業配製藥房**。",
            "**學術貢獻者**：畢業生於**港大**及其他院校任教，推動**藥劑教育及研究**。",
            "**專業網絡**：積極參與**香港藥劑師學會**及**國際藥劑師聯會**。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**入學獎學金**：授予**文憑試成績卓越**的學生，尤以理科成績為重。",
            "**藥劑專項獎**：由**藥企**贊助，支持表現傑出的藥劑學學生。",
            "**臨床實習資助**：資助**海外臨床選修**及**國際藥學會議**。",
            "**研究獎學金**：支持**本科生研究**，方向包括藥物發現、藥理學及公共衛生藥學。",
            "**政府資助**：合資格學生可申請**專上學生資助計劃（TSFS）**、**免入息審查貸款計劃（NLSPS）**等。"
          ]
        },
        tips: {
          title: "申請貼士",
          content: [
            "**化學成績至上**：爭取**化學科最高成績**，此為入學最重要的單一科目。",
            "**培養科學好奇心**：閱讀**藥劑新聞**、追蹤**藥物審批動態**、了解**醫療政策**。",
            "**累積醫療經驗**：於**醫院**、**社區藥房**或**長者護理中心**義工，了解病人護理。",
            "**鍛鍊倫理推理**：藥劑涉及**複雜倫理決策**；面試時或需討論相關情境。",
            "**考慮後備方案**：如藥劑學競爭過大，可探索**相關生物科學學位**，再轉向藥劑學。"
          ]
        }
      }
    }
  },
  {
    code: "JS6626",
    nameZh: "內外全科醫學士 - 傑出醫科學人",
    nameEn: "Bachelor of Medicine and Bachelor of Surgery (MBBS) — Distinguished Medical Scholar",
    university: "香港大學",
    faculty: "醫學院",
    en: {
      sections: {
        admission: {
          title: "Admission Requirements",
          content: [
            "**HKDSE Core Subjects**: Minimum **Level 4** in Chinese Language, English Language, and Mathematics (Compulsory Part); **Level 2** in Liberal Studies / Citizenship and Social Development.",
            "**Science Electives**: **Chemistry and Biology at Level 3 or above are mandatory**; Physics or Combined Science may be considered.",
            "**Top Academic Performance**: Competitive entrants typically score **35–38 points** or above in Best 5 subjects.",
            "**Distinguished Medical Scholar (DMS) Track**: This elite stream requires **exceptional DSE results** and demonstrated **leadership potential**.",
            "**Interview & Assessment**: Rigorous **multiple mini-interviews (MMI)** assessing **empathy**, **ethical reasoning**, **communication**, and **teamwork**."
          ]
        },
        curriculum: {
          title: "Curriculum Overview",
          content: [
            "**Six-Year Programme**: Comprehensive medical education integrating **basic medical sciences**, **clinical skills**, and **professional development**.",
            "**DMS Enrichment**: Additional **mentorship from leading clinicians**, **overseas electives**, and **research opportunities** in top global institutions.",
            "**Systems-based Learning**: Organised around **body systems** rather than traditional disciplines, promoting **integrated clinical reasoning**.",
            "**Early Clinical Exposure**: Patient contact begins in **Year 1**, with progressive responsibility through **hospital and community placements**.",
            "**Research & Scholarship**: DMS students undertake a **structured research project** with potential for **publication and conference presentation**.",
            "**Professional Examinations**: Progress assessed through **written exams**, **OSCEs**, and **clinical workplace-based assessments**."
          ]
        },
        career: {
          title: "Career Prospects",
          content: [
            "**Internship (House Officer)**: One-year **probationary internship** in Hospital Authority hospitals before full registration.",
            "**Residency Training**: Specialised training in **medicine**, **surgery**, **paediatrics**, **obstetrics & gynaecology**, **psychiatry**, and more.",
            "**Academic Medicine**: DMS graduates are fast-tracked for **academic clinical fellowships** and **professorial tracks**.",
            "**Global Opportunities**: Alumni practise in **the UK**, **Australia**, **Canada**, **Singapore**, and **the US** (after licensing exams).",
            "**Healthcare Leadership**: Many graduates rise to **Hospital Chief Executives**, **Deans of Medical Schools**, and **health policy advisors**."
          ]
        },
        campus: {
          title: "Campus & Facilities",
          content: [
            "**Medical Campus**: Primary teaching at the **Sassoon Road Campus** and **Queen Mary Hospital** in Pok Fu Lam.",
            "**Simulation Centre**: State-of-the-art **clinical skills training centre** with high-fidelity manikins and simulated ward environments.",
            "**Anatomy Laboratory**: Modern **dissection suite** with **prosection resources** and **3D virtual anatomy tools**.",
            "**Research Institutes**: Access to **Li Ka Shing Faculty of Medicine** research hubs in **cancer**, **infectious diseases**, **neuroscience**, and **cardiology**.",
            "**Library & Learning Commons**: Dedicated **medical library** with clinical decision support tools and quiet study spaces."
          ]
        },
        competitiveness: {
          title: "Competitiveness",
          content: [
            "**Extremely Competitive**: HKU MBBS is one of the **most difficult programmes** to enter in Hong Kong; only top percentile students succeed.",
            "**DMS Track Even More Selective**: The **Distinguished Medical Scholar** stream admits a **very small cohort** with the highest academic achievers.",
            "**Perfect Science Grades Expected**: **Level 5* or 5** in Chemistry and Biology is effectively the baseline for serious consideration.",
            "**MMI Performance Critical**: Even with perfect grades, **poor MMI performance** can result in rejection; preparation is essential.",
            "**Alternative Pathways**: Consider **MBBS at CUHK**, **overseas medical schools** (UK, Australia), or **graduate entry medicine** if not admitted."
          ]
        },
        alumni: {
          title: "Notable Alumni & Networks",
          content: [
            "**Medical Pioneers**: Alumni include **renowned surgeons**, **Nobel Prize nominees**, and **leaders in global health organisations**.",
            "**Hospital Authority Leadership**: Many **Hospital Authority Chief Executives** and **Cluster Chief Executives** are HKU MBBS graduates.",
            "**Academic Deans**: Graduates serve as **Deans and Heads of Department** at medical schools worldwide.",
            "**Policy Shapers**: Alumni influence **Hong Kong health policy** as **Secretaries for Food and Health** and **advisors to the World Health Organization**.",
            "**DMS Network**: Exclusive **DMS alumni society** providing lifelong **mentorship**, **career support**, and **global networking events**."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**DMS Full Scholarships**: Comprehensive **tuition fee coverage** and **living allowances** for the most outstanding DMS entrants.",
            "**Medical Faculty Scholarships**: Merit-based awards for **academic excellence**, **clinical performance**, and **research achievement**.",
            "**Overseas Elective Grants**: Funding for **clinical electives** at **Harvard**, **Oxford**, **Johns Hopkins**, and other leading institutions.",
            "**Research Fellowships**: Support for **summer research programmes**, **conference attendance**, and **publication costs**.",
            "**Government Assistance**: Eligible students may apply for **TSFS**, **NLSPS**, and **non-means-tested loan schemes**."
          ]
        },
        tips: {
          title: "Application Tips",
          content: [
            "**Aim for Perfection**: Target **Level 5** or above in all core and elective subjects; there is little margin for error.",
            "**Master the MMI**: Practise **ethical scenarios**, **role-play communication**, and **team-based problem solving** extensively.",
            "**Demonstrate Leadership**: The DMS track values **student leadership**, **community service**, and **initiative** beyond academics.",
            "**Gain Healthcare Experience**: Shadow **doctors**, **volunteer in hospitals**, or work in **elderly care** to confirm your commitment.",
            "**Prepare for Rejection**: Even outstanding candidates are not guaranteed admission; have **strong backup plans** in place."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求",
          content: [
            "**文憑試核心科目**：中國語文、英國語文及數學（必修部分）須達**第4級**；通識教育／公民與社會發展須達**第2級**。",
            "**理科選修科**：**化學及生物達第3級或以上為必修**；物理或組合科學或獲考慮。",
            "**頂尖學術表現**：具競爭力的入學者通常於最佳五科取得**35–38分**或以上。",
            "**傑出醫科學人（DMS）課程**：此精英課程要求**卓越的文憑試成績**及**領導潛質**。",
            "**面試及評估**：嚴謹的**多站迷你面試（MMI）**，評估**同理心**、**倫理推理**、**溝通能力**及**團隊合作**。"
          ]
        },
        curriculum: {
          title: "課程概覽",
          content: [
            "**六年制課程**：全面醫學教育，整合**基礎醫學**、**臨床技能**及**專業發展**。",
            "**DMS深造課程**：額外獲**頂尖臨床醫生指導**、**海外選修**及**全球頂尖機構研究機會**。",
            "**系統式學習**：以**人體系統**而非傳統學科組織，促進**整合臨床推理**。",
            "**早期臨床接觸**：**第一年**開始接觸病人，透過**醫院及社區實習**逐步承擔責任。",
            "**研究及學術**：DMS學生須完成**系統性研究項目**，有機會**發表論文及出席學術會議**。",
            "**專業考試**：透過**筆試**、**客觀臨床試（OSCE）**及**臨床工作評估**評核進度。"
          ]
        },
        career: {
          title: "就業前景",
          content: [
            "**實習（駐院醫生）**：於醫管局醫院進行一年**試用實習**，方可正式註冊。",
            "**專科培訓**：於**內科**、**外科**、**兒科**、**婦產科**、**精神科**等進行專科培訓。",
            "**學術醫學**：DMS畢業生可獲快速通道進入**學術臨床研究員**及**教授軌道**。",
            "**全球機會**：校友於**英國**、**澳洲**、**加拿大**、**新加坡**及**美國**（通過執照考試後）執業。",
            "**醫療領導**：不少畢業生晉升為**醫院行政總監**、**醫學院院長**及**衛生政策顧問**。"
          ]
        },
        campus: {
          title: "校園及設施",
          content: [
            "**醫學院校園**：主要於**薄扶林沙宣道校園**及**瑪麗醫院**上課。",
            "**模擬中心**：先進的**臨床技能培訓中心**，配備高仿真模擬病人及模擬病房。",
            "**解剖實驗室**：現代化**解剖室**，設有**解剖標本資源**及**3D虛擬解剖工具**。",
            "**研究院**：可使用**李嘉誠醫學院**研究基地，專注**癌症**、**傳染病**、**神經科學**及**心臟病學**。",
            "**圖書館及學習共享空間**：專設**醫學圖書館**，提供臨床決策支援工具及寧靜自修空間。"
          ]
        },
        competitiveness: {
          title: "競爭程度",
          content: [
            "**競爭極為激烈**：港大內外全科醫學士是香港**最難入讀的課程**之一，僅頂尖百分位學生能成功入學。",
            "**DMS課程更為嚴選**：**傑出醫科學人**課程錄取**極少數學額**，僅取錄最高學術成就者。",
            "**理科成績近乎滿分**：化學及生物達**5*或5級**方為認真考慮的基準。",
            "**MMI表現至關重要**：即使成績滿分，**MMI表現欠佳**亦可導致拒絕；充分準備不可或缺。",
            "**替代途徑**：可考慮**中大內外全科醫學士**、**海外醫學院**（英國、澳洲）或**畢業後入學醫學課程**。"
          ]
        },
        alumni: {
          title: "知名校友及網絡",
          content: [
            "**醫學先驅**：校友包括**知名外科醫生**、**諾貝爾獎提名人**及**全球衛生組織領袖**。",
            "**醫管局領導層**：多位**醫管局行政總裁**及**聯網總監**均為港大內外全科醫學士畢業生。",
            "**學術院長**：畢業生於全球醫學院擔任**院長及學系主管**。",
            "**政策塑造者**：校友以**食物及衞生局局長**及**世界衛生組織顧問**身份影響香港衛生政策。",
            "**DMS網絡**：專屬**DMS校友會**，提供終身**指導**、**職業支援**及**全球聯誼活動**。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**DMS全額獎學金**：為最優秀的DMS入學者提供**全額學費資助**及**生活津貼**。",
            "**醫學院獎學金**：按**學術卓越**、**臨床表現**及**研究成就**頒發的優秀獎。",
            "**海外選修資助**：資助於**哈佛**、**牛津**、**約翰霍普金斯**等頂尖機構進行**臨床選修**。",
            "**研究獎學金**：支持**暑期研究計劃**、**學術會議出席**及**論文發表費用**。",
            "**政府資助**：合資格學生可申請**專上學生資助計劃（TSFS）**、**免入息審查貸款計劃（NLSPS）**等。"
          ]
        },
        tips: {
          title: "申請貼士",
          content: [
            "**追求卓越**：所有核心及選修科目均須達**第5級**或以上；容錯空間極小。",
            "**掌握MMI**：大量練習**倫理情境**、**角色扮演溝通**及**團隊解難**。",
            "**展示領導力**：DMS課程重視**學生領導**、**社區服務**及學業以外的**主動性**。",
            "**累積醫療經驗**：跟隨**醫生見習**、**醫院義工**或**長者護理工作**，確認你的承擔。",
            "**準備面對拒絕**：即使優秀申請人亦無保證獲錄取；須有**穩健後備計劃**。"
          ]
        }
      }
    }
  },
  {
    code: "JS6949",
    nameZh: "生物醫學學士",
    nameEn: "Bachelor of Biomedical Sciences (BBiomedSc)",
    university: "香港大學",
    faculty: "醫學院",
    en: {
      sections: {
        admission: {
          title: "Admission Requirements",
          content: [
            "**HKDSE Core Subjects**: Minimum **Level 3** in Chinese Language, English Language, and Mathematics (Compulsory Part).",
            "**Science Electives**: **Biology or Chemistry at Level 3 or above** is required; both sciences are strongly preferred.",
            "**Mathematics Competency**: Good performance in **Mathematics (Compulsory Part)** supports the quantitative aspects of the programme.",
            "**Expected DSE Score**: Competitive applicants typically achieve **26–29 points** in Best 5 subjects.",
            "**Interview**: Some applicants may be invited for an **interview** to assess motivation, scientific curiosity, and communication skills."
          ]
        },
        curriculum: {
          title: "Curriculum Overview",
          content: [
            "**Four-Year Programme**: Comprehensive study of **human biology**, **disease mechanisms**, and **modern biomedical research methods**.",
            "**Core Disciplines**: Covers **biochemistry**, **genetics**, **microbiology**, **immunology**, **physiology**, and **pathology**.",
            "**Laboratory Training**: Extensive **practical laboratory sessions** in molecular biology, cell culture, microscopy, and bioinformatics.",
            "**Specialisation Options**: Students may choose **majors or minors** in areas such as **cancer biology**, **neuroscience**, **stem cells**, or **bioinformatics**.",
            "**Research Project**: A **final-year honours project** conducted in **Li Ka Shing Faculty of Medicine** research laboratories.",
            "**Interdisciplinary Approach**: Integration with **public health**, **clinical medicine**, and **biotechnology** for broad career readiness."
          ]
        },
        career: {
          title: "Career Prospects",
          content: [
            "**Postgraduate Medicine**: A popular pathway to **graduate-entry MBBS** or **MBChB programmes** in Hong Kong and overseas.",
            "**Biomedical Research**: Roles in **university labs**, **research institutes**, and **biotechnology companies** focusing on drug discovery and disease understanding.",
            "**Healthcare Industry**: Positions in **pharmaceutical companies**, **medical device firms**, **diagnostics**, and **clinical trial management**.",
            "**Public Health & Government**: Careers in the **Department of Health**, **Hospital Authority research units**, and **public health policy**.",
            "**Further Studies**: Graduates pursue **MSc**, **MPhil**, or **PhD** in specialised biomedical fields or related disciplines."
          ]
        },
        campus: {
          title: "Campus & Facilities",
          content: [
            "**Medical Campus**: Teaching and research primarily at the **Sassoon Road Campus** and **Faculty of Medicine buildings**.",
            "**Research Laboratories**: Access to cutting-edge labs in **genomics**, **proteomics**, **imaging**, and **animal research facilities**.",
            "**Core Facility Support**: Shared equipment including **flow cytometry**, **confocal microscopy**, **next-generation sequencing**, and **mass spectrometry**.",
            "**Biomedical Library**: Extensive resources in **molecular biology**, **medical sciences**, and **bioinformatics databases**.",
            "**Collaboration Spaces**: Interdisciplinary research hubs connecting biomedical students with **clinical researchers** and **biotech entrepreneurs**."
          ]
        },
        competitiveness: {
          title: "Competitiveness",
          content: [
            "**Highly Competitive**: Strong demand due to its reputation as a **pathway to medicine** and **biomedical research careers**.",
            "**Science Grades Matter**: **Biology and Chemistry performance** is heavily weighted in admissions decisions.",
            "**Interest in Research**: Applicants who demonstrate **genuine research interest** through projects or competitions stand out.",
            "**Band A Recommended**: Placing the programme in **Band A** significantly improves the chance of receiving an offer.",
            "**Alternative Pathways**: Consider **BSc in Biological Sciences**, **Biotechnology**, or **Biochemistry** at other universities as alternatives."
          ]
        },
        alumni: {
          title: "Notable Alumni & Networks",
          content: [
            "**Medical Professionals**: Many alumni successfully enter **graduate medicine** and become **doctors** in Hong Kong and abroad.",
            "**Research Scientists**: Graduates lead **laboratories** at **HKU**, **CUHK**, **HKUST**, and **international research institutions**.",
            "**Biotech Entrepreneurs**: Alumni have founded **start-ups** in **genomics**, **diagnostics**, and **therapeutics**.",
            "**Industry Leaders**: Graduates hold senior positions in **pharmaceutical multinationals** and **global health organisations**.",
            "**Alumni Mentorship**: Active **mentorship programme** connecting current students with **medical school entrants** and **research professionals**."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**Entrance Scholarships**: Merit-based awards for students with **strong DSE results**, especially in science subjects.",
            "**Research Internship Grants**: Funding for **summer research placements** at HKU or **overseas partner universities**.",
            "**Biomedical Excellence Awards**: Recognises outstanding performance in **laboratory courses** and **research projects**.",
            "**Overseas Exchange Scholarships**: Support for **semester abroad** at partner institutions in **the UK**, **Australia**, or **North America**.",
            "**Government Assistance**: Eligible students may apply for **TSFS**, **NLSPS**, and **non-means-tested loan schemes**."
          ]
        },
        tips: {
          title: "Application Tips",
          content: [
            "**Strengthen Science Foundations**: Focus on achieving **top grades in Biology and Chemistry** to remain competitive.",
            "**Engage in Research Early**: Participate in **science competitions**, **summer research camps**, or **school science projects**.",
            "**Explore Biotech Trends**: Stay informed about **CRISPR**, **personalised medicine**, and **biotech industry developments**.",
            "**Clarify Career Goals**: Be ready to explain **why biomedical sciences** appeals to you and how it fits your **long-term plans**.",
            "**Build a Broad Profile**: Extracurricular activities in **science communication**, **volunteering**, or **leadership** strengthen your application."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求",
          content: [
            "**文憑試核心科目**：中國語文、英國語文及數學（必修部分）須達**第3級**或以上。",
            "**理科選修科**：須修讀**生物或化學達第3級或以上**；兩科兼修為強烈優先。",
            "**數學能力**：**數學（必修部分）**表現良好，有助應付課程中的量化內容。",
            "**預計文憑試分數**：具競爭力的申請人通常於最佳五科取得**26–29分**。",
            "**面試**：部分申請人或獲邀**面試**，評估學習動機、科學好奇心及溝通能力。"
          ]
        },
        curriculum: {
          title: "課程概覽",
          content: [
            "**四年制課程**：全面學習**人體生物學**、**疾病機制**及**現代生物醫學研究方法**。",
            "**核心學科**：涵蓋**生物化學**、**遺傳學**、**微生物學**、**免疫學**、**生理學**及**病理學**。",
            "**實驗室培訓**：大量**實務實驗室課程**，包括分子生物學、細胞培養、顯微鏡學及生物資訊學。",
            "**專修選項**：學生可選擇**主修或副修**，方向包括**癌症生物學**、**神經科學**、**幹細胞**或**生物資訊學**。",
            "**研究項目**：於**李嘉誠醫學院**研究實驗室進行**畢業榮譽專題研究**。",
            "**跨學科方法**：整合**公共衛生**、**臨床醫學**及**生物科技**，為廣泛就業作好準備。"
          ]
        },
        career: {
          title: "就業前景",
          content: [
            "**深造醫學**：為攻讀香港及海外**畢業後入學內外全科醫學士**的熱門途徑。",
            "**生物醫學研究**：於**大學實驗室**、**研究院**及**生物科技公司**從事藥物發現及疾病研究。",
            "**醫療產業**：於**製藥公司**、**醫療器械企業**、**診斷**及**臨床試驗管理**等領域工作。",
            "**公共衛生及政府**：於**衞生署**、**醫管局研究部門**及**公共衛生政策**領域發展。",
            "**進修深造**：畢業生攻讀**理學碩士**、**哲學碩士**或**博士**，專注生物醫學或相關領域。"
          ]
        },
        campus: {
          title: "校園及設施",
          content: [
            "**醫學院校園**：主要於**沙宣道校園**及**醫學院大樓**上課及進行研究。",
            "**研究實驗室**：可使用**基因組學**、**蛋白質組學**、**影像學**及**動物研究設施**等尖端實驗室。",
            "**核心設施支援**：共享設備包括**流式細胞儀**、**共聚焦顯微鏡**、**新一代測序**及**質譜儀**。",
            "**生物醫學圖書館**：館藏豐富的**分子生物學**、**醫學科學**及**生物資訊學數據庫**。",
            "**協作空間**：跨學科研究中心，連繫生物醫學學生與**臨床研究人員**及**生物科技創業家**。"
          ]
        },
        competitiveness: {
          title: "競爭程度",
          content: [
            "**競爭激烈**：因作為**升讀醫學**及**生物醫學研究事業**的途徑而需求甚高。",
            "**理科成績重要**：**生物及化學成績**於收生決定中佔重大比重。",
            "**研究興趣**：透過項目或比賽展示**真正研究興趣**的申請人更為突出。",
            "**建議放於Band A**：將課程放於**Band A**可顯著提高獲派錄取的機會。",
            "**替代途徑**：可考慮其他大學的**生物科學**、**生物科技**或**生物化學**理學士課程。"
          ]
        },
        alumni: {
          title: "知名校友及網絡",
          content: [
            "**醫療專業人員**：不少校友成功入讀**畢業後醫學課程**，成為香港及海外**醫生**。",
            "**研究科學家**：畢業生於**港大**、**中大**、**科大**及**國際研究機構**領導實驗室。",
            "**生物科技創業家**：校友創辦**基因組學**、**診斷**及**治療**領域的初創企業。",
            "**業界領袖**：畢業生於**跨國藥企**及**全球衛生組織**擔任高級職位。",
            "**校友指導計劃**：活躍的**師友計劃**，連繫在校學生與**醫學院入學者**及**研究專業人士**。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**入學獎學金**：授予**文憑試成績優異**的學生，尤以理科成績為重。",
            "**研究實習資助**：資助於港大或**海外夥伴大學**進行**暑期研究實習**。",
            "**生物醫學卓越獎**：表彰**實驗室課程**及**研究項目**表現傑出的學生。",
            "**海外交流獎學金**：支持於**英國**、**澳洲**或**北美**夥伴院校進行**學期交流**。",
            "**政府資助**：合資格學生可申請**專上學生資助計劃（TSFS）**、**免入息審查貸款計劃（NLSPS）**等。"
          ]
        },
        tips: {
          title: "申請貼士",
          content: [
            "**鞏固理科基礎**：專注爭取**生物及化學頂尖成績**，以保持競爭力。",
            "**及早參與研究**：參加**科學比賽**、**暑期研究營**或**校內科學項目**。",
            "**探索生物科技趨勢**：緊貼**CRISPR**、**個人化醫療**及**生物科技產業發展**。",
            "**明確職業目標**：準備解釋**生物醫學吸引你的原因**，以及它如何配合你的**長遠規劃**。",
            "**建立廣泛履歷**：**科學傳播**、**義工服務**或**領導**等課外活動可強化申請。"
          ]
        }
      }
    }
  }
];

async function seed() {
  console.log("[Seed] Starting HKU Details Batch G...");
  for (const prog of PROGRAMME_DETAILS) {
    await JupasProgrammeService.upsertProgrammeDetails(prog);
    console.log(`[Seed] ✓ Success: ${prog.code}`);
  }
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
