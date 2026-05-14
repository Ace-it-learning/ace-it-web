const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  {
    code: "JS6858",
    nameZh: "理學士及法學士",
    nameEn: "Bachelor of Science and Bachelor of Laws",
    university: "HKU",
    faculty: "理學院/法律學院",
    en: {
      sections: {
        admission: [
          "**Exceptional academic record** required — this is one of HKU’s most competitive dual-degree programmes.",
          "**Band A only** in JUPAS; applicants are expected to have top-tier DSE predicted grades across core and elective subjects.",
          "**Strong English proficiency** is essential, as law modules demand advanced reading, writing, and oral argumentation skills.",
          "**Science background preferred** — Biology, Chemistry, or Physics at high level strengthens the application.",
          "**Personal statement and interview** carry significant weight; demonstrate clear motivation for both science and law.",
          "**Limited intake** — only a small cohort is admitted each year, making early preparation critical."
        ],
        curriculum: [
          "**Integrated five-year structure** combining BSc and LLB requirements without extending total study duration.",
          "**Core science training** in Year 1–2, followed by foundational law courses such as Contract and Constitutional Law.",
          "**Advanced law electives** in Years 3–5, including International Law, Corporate Law, and Intellectual Property.",
          "**Science specialisation options** span Chemistry, Biological Sciences, Mathematics, and Physics.",
          "**Capstone research project** in the final year bridges scientific inquiry with legal analysis.",
          "**Mooting and mock trials** are embedded to develop courtroom advocacy from early stages."
        ],
        career: [
          "**Dual qualification** opens doors to both scientific research and legal practice sectors.",
          "**Law firm training contracts** are commonly pursued, especially in intellectual property and environmental law.",
          "**Patent attorney** pathways benefit strongly from the combined science-law credential.",
          "**Government and regulatory roles** in health, environment, and technology policy are popular destinations.",
          "**Further postgraduate study** (PCLL or science research degrees) is well supported by the programme foundation.",
          "**International organisations** such as WIPO and UN agencies value this interdisciplinary profile."
        ],
        campus: [
          "**Classes span both the Main Campus** (science laboratories) and the Centennial Campus (law facilities).",
          "**Law Library** at the Cheng Yu Tung Tower provides extensive common-law and comparative law resources.",
          "**Science labs** are equipped with modern instrumentation for undergraduate research projects.",
          "**Moot courtrooms** simulate real trial settings for advocacy training and competitions.",
          "**Residential hall life** is encouraged to build interdisciplinary peer networks across faculties."
        ],
        competitiveness: [
          "**Extremely high admission bar** — typically requires Level 5** or above in multiple DSE subjects.",
          "**Small cohort size** intensifies competition; only top percentile JUPAS applicants are admitted.",
          "**Band A first choice strongly advised**; very few offers are made to Band B or lower choices.",
          "**Interview shortlisting** is highly selective and focuses on analytical thinking and communication clarity.",
          "**Comparable to Medicine and Dentistry** in terms of JUPAS entry score requirements."
        ],
        alumni: [
          "**Graduates practise at leading Hong Kong and international law firms** including magic circle and local top tiers.",
          "**Alumni network spans science research institutes**, government policy units, and technology startups.",
          "**Strong mentorship culture** connects current students with senior professionals in both fields.",
          "**Annual reunions and career talks** facilitate ongoing professional development and recruitment.",
          "**Notable alumni** have contributed to landmark IP and biotech policy cases in Hong Kong."
        ],
        scholarships: [
          "**HKU Foundation Entrance Scholarships** are available for outstanding JUPAS applicants with top DSE results.",
          "**Faculty-specific awards** from both Science and Law may be combined for dual-degree students.",
          "**Need-based bursaries** support students facing financial hardship throughout the programme.",
          "**Overseas exchange scholarships** help fund study at partner law and science institutions globally.",
          "**Research and mooting prizes** recognise excellence in capstone projects and advocacy competitions."
        ],
        tips: [
          "**Start early** — build a strong academic profile in both sciences and humanities from Secondary 4 onwards.",
          "**Practise structured arguments** — law interviews reward logical reasoning and concise expression.",
          "**Read widely** — follow science policy news and legal case summaries to demonstrate interdisciplinary interest.",
          "**Join debating or mooting clubs** to develop the oral advocacy skills expected in law modules.",
          "**Seek shadowing opportunities** in law firms or research labs to confirm genuine career interest.",
          "**Prepare for a demanding workload** — time management across two rigorous disciplines is essential."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**學術成績要求極高** — 此為港大競爭最激烈的雙學位課程之一。",
          "**JUPAS 必須放於 Band A**；申請人須在核心科目及選修科目均取得頂尖預測成績。",
          "**英語能力至關重要**，法律科目要求高階閱讀、寫作及口頭辯論技巧。",
          "**理科背景較佳** — 生物、化學或物理成績優異可增強競爭力。",
          "**個人陳述及面試佔分甚重**；須清楚表達對科學與法律的雙重熱誠。",
          "**收生名額極少** — 每年僅錄取小量學生，及早準備尤為關鍵。"
        ],
        curriculum: [
          "**五年整合課程結構**，同時涵蓋理學士及法學士要求，無須額外延長修業年期。",
          "**首兩年集中理科訓練**，隨後修讀合約法、憲法等法律基礎科目。",
          "**第三至五年修讀進階法律選修科**，包括國際法、公司法及知識產權法。",
          "**理科專修選擇涵蓋**化學、生物科學、數學及物理。",
          "**畢業年專題研究項目**結合科學探究與法律分析。",
          "**模擬法庭及辯論訓練**融入課程，從早期階段培養庭審辯論技巧。"
        ],
        career: [
          "**雙學位資格**同時開啟科學研究及法律執業兩大領域的發展機會。",
          "**多數畢業生投身律師事務所實習**，尤其專注知識產權及環境法範疇。",
          "**專利律師**發展路徑極受惠於科學與法律的結合背景。",
          "**政府及監管機構**如衞生、環境及科技政策部門為熱門出路。",
          "**深造進修**（PCLL 或科研學位）獲課程基礎充分支持。",
          "**國際組織**如世界知識產權組織及聯合國機構重視此跨學科背景。"
        ],
        campus: [
          "**課堂橫跨本部校園**（理科實驗室）及百周年校園（法律設施）。",
          "**鄭裕彤教學樓法律圖書館**提供豐富的普通法及比較法資源。",
          "**理科實驗室配備現代儀器**，支援本科生研究項目。",
          "**模擬法庭**仿真真實審訊環境，供辯論訓練及比賽使用。",
          "**鼓勵入住舍堂**，建立跨學院同儕網絡。"
        ],
        competitiveness: [
          "**收生門檻極高** — 通常要求多科 DSE 取得 5** 或以上成績。",
          "**收生名額極少**，競爭異常激烈；僅頂尖百分位 JUPAS 申請人獲錄取。",
          "**強烈建議放於 Band A 首選**；極少向 Band B 或更低志願發出錄取。",
          "**面試篩選極為嚴格**，重點評估分析思維及溝通清晰度。",
          "**JUPAS 入學分數要求與內外全科醫學及牙醫學相若**。"
        ],
        alumni: [
          "**畢業生於香港及國際頂尖律師事務所執業**，包括魔圈所及本地龍頭律所。",
          "**校友網絡涵蓋科研機構**、政府政策單位及科技初創企業。",
          "**濃厚師友文化**連繫在學生與兩大領域的資深專業人士。",
          "**年度聚會及職業講座**促進持續專業發展及招聘機會。",
          "**傑出校友**曾參與香港知識產權及生物科技政策的標誌性案件。"
        ],
        scholarships: [
          "**香港大學基金入學獎學金**授予 DSE 成績卓越的 JUPAS 申請人。",
          "**理學院及法律學院專屬獎項**可同時頒發予雙學位學生。",
          "**按需要發放的助學金**支援經濟困難學生完成課程。",
          "**海外交流獎學金**資助學生前往全球夥伴法律及科學院校進修。",
          "**研究及辯論獎項**表揚專題項目及辯論比賽的優異表現。"
        ],
        tips: [
          "**及早準備** — 從中四起同時建立理科及人文科的強大學術基礎。",
          "**鍛鍊結構化論證** — 法律面試重視邏輯推理及簡潔表達。",
          "**廣泛閱讀** — 追蹤科學政策新聞及法律案例摘要，展示跨學科興趣。",
          "**參加辯論或模擬法庭學會**，培養法律科目所需的口頭辯論技巧。",
          "**尋求律師樓或研究實驗室的影子實習機會**，確認真正的職業興趣。",
          "**預備應對繁重課業** — 同時修讀兩個嚴謹學科的時間管理至為重要。"
        ]
      }
    }
  },
  {
    code: "JS6705",
    nameZh: "心理學學士",
    nameEn: "Bachelor of Psychology",
    university: "HKU",
    faculty: "社會科學學院",
    en: {
      sections: {
        admission: [
          "**Solid DSE results** in core subjects and at least one science or humanities elective are expected.",
          "**Band A placement strongly recommended** to maximise offer probability in this popular programme.",
          "**Interest in human behaviour and mental processes** should be evident in the personal statement.",
          "**No specific subject prerequisite**, but Biology or Mathematics background is advantageous.",
          "**Interview may be required** for shortlisted candidates to assess motivation and communication skills.",
          "**Competitive but accessible** compared to Medicine or Law; consistent academic performance matters."
        ],
        curriculum: [
          "**Foundational courses** cover cognitive, developmental, social, and biological psychology.",
          "**Research methods and statistics** are core components, training students in empirical investigation.",
          "**Laboratory sessions** provide hands-on experience with experimental design and data collection.",
          "**Applied psychology electives** include clinical, educational, organisational, and health psychology.",
          "**Final-year thesis** allows students to conduct original research under faculty supervision.",
          "**Internship opportunities** in hospitals, schools, and NGOs integrate theory with real-world practice."
        ],
        career: [
          "**Clinical psychology** postgraduate training is a common path for graduates seeking practitioner status.",
          "**Human resources and organisational consulting** roles value psychological assessment expertise.",
          "**Education sector** positions include school counselling, special educational needs support, and teaching.",
          "**Market research and user experience** careers leverage consumer behaviour and data analysis skills.",
          "**Social service and NGO roles** span mental health outreach, rehabilitation, and community programmes.",
          "**Academic and research careers** progress through MPhil and PhD programmes locally or overseas."
        ],
        campus: [
          "**Taught primarily at the Centennial Campus** with modern lecture theatres and seminar rooms.",
          "**Psychology laboratories** include eye-tracking, EEG, and behavioural observation suites.",
          "**Library resources** support both scientific journal access and clinical case literature.",
          "**Collaborative study spaces** encourage group projects and peer learning among psychology students.",
          "**Close proximity** to the University Health Service and counselling centre for applied learning exposure."
        ],
        competitiveness: [
          "**Moderately high competition** — popular among students interested in people-oriented professions.",
          "**Band A first choice advisable**; programme fills quickly with well-qualified applicants.",
          "**Balanced subject profile preferred** — strong results in languages, sciences, and humanities all help.",
          "**Relevant extracurriculars** such as volunteering with youth or elderly boost application strength.",
          "**Steady upward grade trend** can offset slightly lower individual subject scores in holistic review."
        ],
        alumni: [
          "**Alumni work as registered clinical and educational psychologists** across Hong Kong’s public and private sectors.",
          "**Strong presence in HR leadership** at multinational corporations and local enterprises.",
          "**Active mentorship programme** connects students with graduates in diverse psychology-related fields.",
          "**Annual career seminars** feature alumni sharing pathways from undergraduate study to specialisation.",
          "**International alumni network** extends to universities and healthcare systems in the UK, Australia, and North America."
        ],
        scholarships: [
          "**HKU Entrance Scholarships** recognise outstanding JUPAS academic achievement.",
          "**Faculty of Social Sciences awards** support students with strong academic and community engagement records.",
          "**Research assistantship funding** is available for students assisting faculty laboratory projects.",
          "**Exchange scholarships** enable semester abroad at partner psychology departments worldwide.",
          "**Hardship grants** ensure financial circumstances do not interrupt degree progression."
        ],
        tips: [
          "**Read introductory psychology texts** before admission to confirm genuine interest in the discipline.",
          "**Develop statistical literacy early** — research methods modules assume comfort with numbers.",
          "**Volunteer with vulnerable populations** to gain relevant experience and strengthen personal statements.",
          "**Attend public psychology lectures** at HKU or online to explore subfields before specialising.",
          "**Practise academic writing** — essays and lab reports form a large portion of assessment.",
          "**Build relationships with professors** in Year 1–2 to secure strong thesis supervision later."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**核心科目及至少一科理科或人文選修科成績穩健**為基本期望。",
          "**強烈建議放於 Band A**，以提高此熱門課程的錄取機會。",
          "**個人陳述須展現對人類行為及心理過程的興趣**。",
          "**無特定科目先修要求**，但具生物或數學背景較有優勢。",
          "**入圍申請人或須參加面試**，以評估學習動機及溝通技巧。",
          "**競爭程度中等偏高**，較內外全科醫學或法律容易；持續穩定的學業表現至為重要。"
        ],
        curriculum: [
          "**基礎課程涵蓋**認知、發展、社會及生物心理學。",
          "**研究方法及統計學為核心科目**，培養學生實證研究能力。",
          "**實驗室課程**提供實際操作經驗，包括實驗設計及數據收集。",
          "**應用心理學選修科**包括臨床、教育、組織及健康心理學。",
          "**畢業年論文**讓學生在教授指導下進行原創研究。",
          "**醫院、學校及非政府機構的實習機會**結合理論與實務應用。"
        ],
        career: [
          "**臨床心理學深造訓練**是畢業生追求執業資格的常見路徑。",
          "**人力資源及機構顧問**職位重視心理評估專業知識。",
          "**教育界崗位**包括學校輔導、特殊教育需要支援及教學。",
          "**市場研究及用戶體驗**職業善用消費者行為及數據分析技巧。",
          "**社會服務及非政府機構角色**涵蓋精神健康外展、復康及社區計劃。",
          "**學術及研究事業**透過本地或海外哲學碩士及博士課程繼續發展。"
        ],
        campus: [
          "**主要在百周年校園授課**，設有現代化演講廳及研討室。",
          "**心理學實驗室**配備眼動追蹤、腦電圖及行為觀察設備。",
          "**圖書館資源**支援科學期刊查閱及臨床案例文獻。",
          "**協作學習空間**促進心理學學生的小組項目及同儕學習。",
          "**鄰近大學保健處及輔導中心**，方便接觸應用學習環境。"
        ],
        competitiveness: [
          "**競爭程度中等偏高** — 深受有志於以人為本專業的學生歡迎。",
          "**建議放於 Band A 首選**；課程迅速額滿，申請人質素普遍優秀。",
          "**偏好均衡的科目組合** — 語文、理科及人文科成績俱佳均有幫助。",
          "**相關課外活動**如青年或長者義工服務可增強申請優勢。",
          "**成績持續進步的趨勢**可在整體評審中彌補個別科目稍遜的分數。"
        ],
        alumni: [
          "**校友於香港公私營機構擔任註冊臨床及教育心理學家**。",
          "**於跨國企業及本地公司的人力資源管理層佔重要席位**。",
          "**活躍的師友計劃**連繫在學生與心理學相關領域的畢業生。",
          "**年度職業講座**邀請校友分享從本科到專業化的發展路徑。",
          "**國際校友網絡**延伸至英國、澳洲及北美的大學及醫療體系。"
        ],
        scholarships: [
          "**香港大學入學獎學金**表彰 JUPAS 學業成績卓越的申請人。",
          "**社會科學學院獎項**支持學業及社區參與表現優秀的學生。",
          "**研究助理資助**供協助教授實驗室項目的學生申請。",
          "**交流獎學金**資助學生前往全球夥伴心理學系進行學期交流。",
          "**經濟援助金**確保財政狀況不會影響學位進度。"
        ],
        tips: [
          "**入學前閱讀心理學入門書籍**，確認對該學科的真正興趣。",
          "**及早培養統計思維** — 研究方法科目假設學生對數字有一定掌握。",
          "**參與弱勢社群義工服務**，獲取相關經驗並豐富個人陳述。",
          "**參加港大或網上的公開心理學講座**，在專修前探索各子領域。",
          "**練習學術寫作** — 論文及實驗報告佔評估比重甚大。",
          "**首兩年與教授建立良好關係**，以便日後獲得優秀的論文指導。"
        ]
      }
    }
  },
  {
    code: "JS6717",
    nameZh: "社會科學學士",
    nameEn: "Bachelor of Social Sciences",
    university: "HKU",
    faculty: "社會科學學院",
    en: {
      sections: {
        admission: [
          "**Broad academic profile welcomed** — applicants from arts, science, and commerce backgrounds are all considered.",
          "**Band A placement recommended** for the best chance of admission in this flexible programme.",
          "**Personal statement should demonstrate** curiosity about society, policy, and human relationships.",
          "**No strict subject prerequisites**, though Economics or Liberal Studies background is helpful.",
          "**Holistic review process** considers academic results, extracurricular involvement, and personal qualities.",
          "**Moderate competitiveness** — accessible to students with consistent Level 4–5 subject grades."
        ],
        curriculum: [
          "**Flexible major system** allows students to choose from disciplines such as Sociology, Politics, Geography, and Social Policy.",
          "**Common core curriculum** in Year 1 builds foundational social science research and critical thinking skills.",
          "**Quantitative and qualitative methods** training prepares students for evidence-based analysis.",
          "**Interdisciplinary electives** encourage combining majors with minors across faculties.",
          "**Capstone project or internship** in the final year applies academic knowledge to real social issues.",
          "**Global learning opportunities** include exchange semesters at partner universities worldwide."
        ],
        career: [
          "**Civil service and policy research** are common destinations for graduates passionate about governance.",
          "**Media and journalism** careers benefit from strong analytical and communication training.",
          "**NGO and community development** roles leverage social policy and programme evaluation expertise.",
          "**Market research and public opinion polling** firms recruit graduates with strong methodology skills.",
          "**Further study** in law, public administration, or international relations is well supported.",
          "**Corporate social responsibility** and sustainability roles value the broad social awareness cultivated here."
        ],
        campus: [
          "**Centennial Campus is the main teaching hub** with dedicated social sciences facilities.",
          "**Chi Wah Learning Commons** provides collaborative spaces for group discussions and project work.",
          "**Specialist research centres** on China studies, urban studies, and public policy enrich the learning environment.",
          "**Library collections** include extensive government reports, census data, and international development archives.",
          "**Active student societies** run policy debates, mock UN events, and community outreach programmes."
        ],
        competitiveness: [
          "**Moderate competition** — large intake makes it more accessible than niche professional programmes.",
          "**Band A strongly advised** despite larger cohort, as demand consistently exceeds supply.",
          "**Well-rounded applicants** with diverse interests often succeed over narrowly focused profiles.",
          "**Community involvement** and leadership experience strengthen holistic application reviews.",
          "**Predicted grades at Level 4 or above** in core and elective subjects are generally competitive."
        ],
        alumni: [
          "**Alumni serve in senior civil service positions** across Hong Kong government bureaux and departments.",
          "**Prominent journalists and editors** at major local and international media outlets are graduates.",
          "**Social enterprise founders** credit the programme’s flexibility for enabling innovative cross-sector careers.",
          "**Active alumni mentoring** connects current students with professionals in policy, media, and NGOs.",
          "**Global alumni chapters** in London, New York, and Beijing support international career mobility."
        ],
        scholarships: [
          "**HKU Entrance Scholarships** reward strong JUPAS academic performance.",
          "**Faculty of Social Sciences merit awards** recognise academic excellence and leadership.",
          "**Overseas exchange funding** supports semester-long study at international partner institutions.",
          "**Research and internship grants** assist students undertaking capstone projects or summer placements.",
          "**Financial aid schemes** ensure equitable access for students from diverse economic backgrounds."
        ],
        tips: [
          "**Explore multiple disciplines** in Year 1 before committing to a major — flexibility is a strength.",
          "**Engage with current affairs** daily to build the contextual awareness expected in essays and seminars.",
          "**Develop data literacy** — social science increasingly relies on quantitative evidence and visualisation.",
          "**Join student societies early** to build networks and discover career paths outside the classroom.",
          "**Seek summer internships** in government, NGOs, or media to test career interests before graduation.",
          "**Consider a minor** in a complementary field such as Journalism, Law, or Data Science to differentiate your profile."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**歡迎廣泛學術背景的申請人** — 文科、理科及商科學生均獲考慮。",
          "**建議放於 Band A**，以增加入讀此靈活課程的機會。",
          "**個人陳述應展現對社會、政策及人際關係的好奇心**。",
          "**無嚴格科目先修要求**，但具經濟或通識背景較有幫助。",
          "**整體評審過程**綜合考慮學業成績、課外參與及個人質素。",
          "**競爭程度中等** — 學業成績持續達 Level 4–5 的學生一般具競爭力。"
        ],
        curriculum: [
          "**靈活主修制度**讓學生選修社會學、政治學、地理學及社會政策等學科。",
          "**第一年共同核心課程**建立社會科學研究及批判思維的基礎技巧。",
          "**定量及定性方法訓練**培養學生以實證為基礎的分析能力。",
          "**跨學科選修科**鼓勵跨學院組合主修及副修。",
          "**畢業年專題項目或實習**將學術知識應用於真實社會議題。",
          "**全球學習機會**包括於全球夥伴大學進行學期交流。"
        ],
        career: [
          "**公務員及政策研究**是熱衷治理的畢業生的常見出路。",
          "**傳媒及新聞事業**受惠於課程培養的強大分析及溝通技巧。",
          "**非政府機構及社區發展**崗位善用社會政策及計劃評估專業。",
          "**市場研究及民意調查機構**招聘具備紮實方法論技巧的畢業生。",
          "**深造進修**如法律、公共行政或國際關係獲課程充分支持。",
          "**企業社會責任及可持續發展**職位重視此處培養的廣闊社會意識。"
        ],
        campus: [
          "**百周年校園為主要教學樞紐**，設有社會科學專屬設施。",
          "**智華館學習共享空間**提供小組討論及項目工作的協作場地。",
          "**中國研究、城市研究及公共政策等專門研究中心**豐富學習環境。",
          "**圖書館館藏**包括大量政府報告、人口普查數據及國際發展檔案。",
          "**活躍的學生學會**舉辦政策辯論、模擬聯合國及社區外展計劃。"
        ],
        competitiveness: [
          "**競爭程度中等** — 收生名額較多，較小眾專業課程容易入讀。",
          "**儘管收生較多，仍強烈建議放於 Band A**，因需求持續超過供應。",
          "**興趣廣泛的全人申請人**往往較單一專注的profile更為成功。",
          "**社區參與及領導經驗**可增強整體申請評審的優勢。",
          "**核心及選修科目預測成績達 Level 4 或以上**一般具競爭力。"
        ],
        alumni: [
          "**校友於香港政府各局及部門擔任高級公務員職位**。",
          "**本地及國際主要媒體的知名記者及編輯均為畢業生**。",
          "**社會企業創辦人**讚揚課程的靈活性促成創新的跨界事業。",
          "**活躍的校友師友計劃**連繫在學生與政策、傳媒及非政府機構的專業人士。",
          "**倫敦、紐約及北京的全球校友分會**支持國際事業流動性。"
        ],
        scholarships: [
          "**香港大學入學獎學金**獎勵 JUPAS 學業成績優異的申請人。",
          "**社會科學學院優異獎項**表彰學業卓越及領導才能。",
          "**海外交流資助**支持於國際夥伴院校進行學期交流。",
          "**研究及實習資助**協助學生進行專題項目或暑期實習。",
          "**經濟援助計劃**確保不同經濟背景的學生均有公平入學機會。"
        ],
        tips: [
          "**第一年探索多個學科後再決定主修** — 靈活性是本課程的優勢。",
          "**每日關注時事**，建立論文及研討課所要求的背景認知。",
          "**培養數據素養** — 社會科學日益依賴定量證據及數據視覺化。",
          "**及早加入學生學會**，建立人脈並發掘課堂以外的職業路徑。",
          "**尋求政府、非政府機構或傳媒的暑期實習**，在畢業前試驗職業興趣。",
          "**考慮副修互補領域**如新聞學、法律或數據科學，以突顯個人優勢。"
        ]
      }
    }
  },
  {
    code: "JS6731",
    nameZh: "社會工作學學士",
    nameEn: "Bachelor of Social Work",
    university: "HKU",
    faculty: "社會科學學院",
    en: {
      sections: {
        admission: [
          "**Genuine commitment to social justice and community service** is essential and should shine through the personal statement.",
          "**Band A placement strongly advised**; the programme seeks students with clear vocational motivation.",
          "**Solid DSE results** in core subjects expected; no specific elective prerequisites.",
          "**Volunteer or service experience** with elderly, youth, or disadvantaged groups strengthens the application.",
          "**Interview typically required** to assess interpersonal skills, empathy, and resilience.",
          "**Moderate competition** — passion and relevant experience can offset slightly lower grades."
        ],
        curriculum: [
          "**Professionally accredited** by the Social Workers Registration Board for direct registration upon graduation.",
          "**Foundational social work theory** covers casework, group work, community work, and social policy analysis.",
          "**Fieldwork placements** in Years 3 and 4 provide supervised practice in agencies across Hong Kong.",
          "**Skills labs** train interviewing, counselling, crisis intervention, and programme planning techniques.",
          "**Law and policy modules** cover child protection, mental health ordinance, and welfare service administration.",
          "**Reflective practice seminars** help students process fieldwork experiences and develop professional identity."
        ],
        career: [
          "**Registered social worker** status enables immediate practice in government and NGO settings.",
          "**Family and child welfare** roles include child protection, foster care coordination, and family counselling.",
          "**Medical and psychiatric social work** positions serve in hospitals and community mental health teams.",
          "**School social work** supports student wellbeing, crisis response, and inclusive education programmes.",
          "**Elderly and rehabilitation services** address Hong Kong’s ageing population and disability support needs.",
          "**Policy advocacy and programme management** roles progress into senior NGO and government leadership."
        ],
        campus: [
          "**Centennial Campus hosts** dedicated social work simulation rooms and skills training suites.",
          "**Fieldwork coordination office** maintains partnerships with over 200 agency placement sites.",
          "**Social work library collection** includes practice manuals, case law, and local welfare policy documents.",
          "**Peer support networks** among cohort members mirror the collaborative ethos of the profession.",
          "**Regular guest lectures** by practising social workers and service users enrich classroom learning."
        ],
        competitiveness: [
          "**Moderate competition with vocational focus** — commitment often weighs as heavily as grades.",
          "**Band A essential** for serious consideration; few offers extend to lower-band choices.",
          "**Relevant service experience** can distinguish applicants with similar academic profiles.",
          "**Interview performance** is decisive; empathy, self-awareness, and communication are closely evaluated.",
          "**Resilience and emotional maturity** are sought, given the demanding nature of frontline social work."
        ],
        alumni: [
          "**Alumni lead major NGOs** including family service centres, mental health organisations, and rehabilitation agencies.",
          "**Senior government social welfare administrators** across district and central bureaux are graduates.",
          "**Strong professional community** with regular CPD events, supervision training, and peer consultation groups.",
          "**Alumni mentorship** pairs students with experienced practitioners before graduation.",
          "**International alumni** practise social work in Australia, Canada, and the UK under mutual recognition agreements."
        ],
        scholarships: [
          "**HKU Entrance Scholarships** available for strong academic achievers entering the programme.",
          "**Social Work-specific bursaries** support students undertaking unpaid fieldwork placements.",
          "**Agency-sponsored awards** recognise outstanding fieldwork performance and community initiative.",
          "**Emergency hardship funds** assist students facing unexpected financial difficulties during study.",
          "**Post-graduation retention scholarships** are offered by some NGOs to attract top graduates."
        ],
        tips: [
          "**Gain hands-on experience early** — sustained volunteering is more impressive than one-off events.",
          "**Reflect deeply on your motivation** — interviewers value self-awareness about why social work, not just what it is.",
          "**Develop emotional resilience** — frontline work is rewarding but can be emotionally taxing.",
          "**Read local social policy news** to demonstrate awareness of Hong Kong’s welfare challenges.",
          "**Practise active listening** — it is the core skill assessed in interviews and throughout the degree.",
          "**Build a support system** — peer relationships and supervision are vital to thriving in this profession."
        ]
      }
    },
    zh: {
      sections: {
        admission: [
          "**對社會公義及社區服務的真誠承擔至為重要**，須在個人陳述中充分展現。",
          "**強烈建議放於 Band A**；課程尋找具備明確職業志向的學生。",
          "**核心科目成績穩健為期望**；無特定選修科先修要求。",
          "**長者、青年或弱勢群體的義工或服務經驗**可增強申請優勢。",
          "**通常須參加面試**，以評估人際技巧、同理心及抗逆能力。",
          "**競爭程度中等** — 熱誠及相關經驗可彌補成績稍遜之處。"
        ],
        curriculum: [
          "**獲社會工作者註冊局專業認可**，畢業後可直接申請註冊。",
          "**社會工作基礎理論**涵蓋個案工作、小組工作、社區工作及社會政策分析。",
          "**第三及第四年實習安排**，於香港各機構進行督導實務訓練。",
          "**技巧實驗室**培訓會談、輔導、危機介入及計劃策劃技巧。",
          "**法律及政策科目**涵蓋兒童保護、精神健康條例及福利服務行政。",
          "**反思實務研討課**協助學生整理實習經驗，建立專業身份認同。"
        ],
        career: [
          "**註冊社會工作者資格**容許畢業後立即於政府及非政府機構執業。",
          "**家庭及兒童福利崗位**包括兒童保護、寄養協調及家庭輔導。",
          "**醫務及精神健康社會工作**職位服務於醫院及社區精神健康團隊。",
          "**學校社會工作**支援學生福祉、危機應變及融合教育計劃。",
          "**長者及復康服務**應對香港人口老化及殘疾人士支援需求。",
          "**政策倡議及計劃管理**角色可晉升至非政府機構及政府領導層。"
        ],
        campus: [
          "**百周年校園設有**社會工作專用模擬室及技巧培訓室。",
          "**實習統籌辦公室**與超過 200 個機構實習點保持夥伴關係。",
          "**社會工作圖書館館藏**包括實務手冊、案例法及本地福利政策文件。",
          "**同儕支援網絡**體現專業協作精神，同班同學之間互相支持。",
          "**定期邀請執業社工及服務使用者**擔任客席講者，豐富課堂學習。"
        ],
        competitiveness: [
          "**競爭程度中等，重視職業志向** — 承擔感往往與成績同等重要。",
          "**Band A 為必要條件**；極少向較低志願發出錄取。",
          "**相關服務經驗**可令學術成績相若的申請人脫穎而出。",
          "**面試表現具決定性**；同理心、自我覺察及溝通技巧均受嚴格評估。",
          "**尋求抗逆力及情緒成熟度**，鑒於前線社會工作的嚴苛性質。"
        ],
        alumni: [
          "**校友領導主要非政府機構**，包括家庭服務中心、精神健康組織及復康機構。",
          "**各區及中央福利局的高級政府社會福利行政人員均為畢業生**。",
          "**強大的專業社群**，定期舉辦持續專業發展活動、督導培訓及同儕諮詢小組。",
          "**校友師友計劃**於畢業前為學生配對經驗豐富的執業者。",
          "**國際校友**根據互認協議於澳洲、加拿大及英國執行社會工作。"
        ],
        scholarships: [
          "**香港大學入學獎學金**供學業成績優秀的入學學生申請。",
          "**社會工作專屬助學金**支援進行無薪實習的學生。",
          "**機構贊助獎項**表彰實習表現卓越及具社區創新精神的學生。",
          "**緊急經濟援助基金**協助學習期間面對突發財政困難的學生。",
          "**部分非政府機構提供畢業後留任獎學金**，以吸引頂尖畢業生。"
        ],
        tips: [
          "**及早獲取實務經驗** — 持續義工服務較一次性活動更令人印象深刻。",
          "**深入反思個人動機** — 面試官重視自我覺察，了解為何選擇社工而非僅知其為何物。",
          "**培養情緒抗逆力** — 前線工作雖有意義，但可能帶來情緒壓力。",
          "**閱讀本地社會政策新聞**，展示對香港福利挑戰的認知。",
          "**練習積極聆聽** — 此為面試及整個學位課程評估的核心技巧。",
          "**建立支援系統** — 同儕關係及督導對在這專業中茁壯成長至關重要。"
        ]
      }
    }
  }
];

async function seed() {
  console.log("[Seed] Starting HKU Details Batch E...");
  for (const prog of PROGRAMME_DETAILS) {
    await JupasProgrammeService.upsertProgrammeDetails(prog);
    console.log(`[Seed] ✓ Success: ${prog.code}`);
  }
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });
