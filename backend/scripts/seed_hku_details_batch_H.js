const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  {
    code: "JS6755",
    nameZh: "工商管理學學士",
    nameEn: "BBA",
    university: "香港大學",
    faculty: "商學院",
    en: {
      sections: {
        admission: {
          title: "Admission",
          content: [
            "The programme requires **strong academic performance** in core subjects including English and Mathematics.",
            "Applicants with **leadership experience** in student societies or business competitions are highly valued.",
            "A good command of **English communication skills** is essential for case discussions and presentations.",
            "Students should demonstrate **analytical thinking** and a genuine interest in business management.",
            "Admission is **highly competitive**, with a strong emphasis on overall academic excellence.",
          ],
        },
        curriculum: {
          title: "Curriculum",
          content: [
            "The curriculum covers **core business disciplines** including accounting, finance, marketing, and management.",
            "Students can choose from **multiple majors** such as Entrepreneurship, Human Resource Management, or International Business.",
            "A **capstone project** in the final year integrates knowledge across all functional areas.",
            "Exchange programmes with **top business schools worldwide** provide global exposure.",
            "Practical learning through **internships and company projects** is strongly encouraged.",
          ],
        },
        career: {
          title: "Career Prospects",
          content: [
            "Graduates pursue careers in **consulting, banking, and corporate management** across diverse industries.",
            "Many join **multinational corporations** in management trainee programmes.",
            "The programme also prepares students for **entrepreneurship and start-up ventures**.",
            "Alumni networks provide **strong mentorship and job referral opportunities**.",
            "Further studies at **top MBA programmes** globally are a common path.",
          ],
        },
        campus: {
          title: "Campus & Facilities",
          content: [
            "Classes are held at the **main HKU campus** in Pokfulam with modern teaching facilities.",
            "The **Cyberport campus** provides additional space for innovation and entrepreneurship activities.",
            "Students have access to **state-of-the-art business simulation labs** and trading rooms.",
            "The university library offers **extensive business databases** and research resources.",
            "Collaborative spaces support **group projects and case study discussions**.",
          ],
        },
        competitiveness: {
          title: "Competitiveness",
          content: [
            "This is one of the **most popular business programmes** in Hong Kong with intense competition.",
            "Applicants typically have **excellent DSE results** across all core and elective subjects.",
            "Strong performance in **Mathematics and English** significantly boosts admission chances.",
            "Extra-curricular achievements in **business-related activities** are advantageous.",
            "Interview performance may be **a deciding factor** for borderline candidates.",
          ],
        },
        alumni: {
          title: "Alumni Network",
          content: [
            "The HKU Business School alumni network spans **over 40 countries** worldwide.",
            "Notable alumni hold **senior leadership positions** in Fortune 500 companies.",
            "Regular **networking events and mentorship programmes** connect students with industry leaders.",
            "The alumni association provides **career support and lifelong learning opportunities**.",
            "Many alumni actively **recruit HKU graduates** into their organisations.",
          ],
        },
        scholarships: {
          title: "Scholarships",
          content: [
            "Merit-based scholarships are available for **outstanding academic achievers**.",
            "The **HKU Foundation Scholarship** covers full tuition and living expenses.",
            "Entrance scholarships recognise **exceptional DSE performance** and leadership qualities.",
            "Need-based financial aid ensures **no talented student is left behind**.",
            "Industry-sponsored scholarships offer **internship placements** alongside funding.",
          ],
        },
        tips: {
          title: "Application Tips",
          content: [
            "Prepare a **well-structured personal statement** highlighting your business interests and achievements.",
            "Demonstrate **leadership and teamwork skills** through specific examples and experiences.",
            "Stay updated on **current business trends** to discuss intelligently during interviews.",
            "Participate in **business competitions or case challenges** to strengthen your profile.",
            "Show genuine passion for **learning and contributing to the business community**.",
          ],
        },
      },
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求",
          content: [
            "課程要求申請人在包括**英文及數學**在內的核心科目取得優異成績。",
            "具有**學生會或商業比賽領導經驗**的申請人會獲得高度重視。",
            "良好的**英語溝通能力**對個案討論及簡報至關重要。",
            "學生應展現**分析思維**及對商業管理的真正興趣。",
            "入學競爭**非常激烈**，非常重視整體學術表現。",
          ],
        },
        curriculum: {
          title: "課程結構",
          content: [
            "課程涵蓋**會計、金融、市場學及管理**等核心商業學科。",
            "學生可從**多個主修**中選擇，如創業學、人力資源管理或國際商務。",
            "畢業年的**頂點項目**整合所有功能領域的知識。",
            "與**全球頂尖商學院**的交換計劃提供國際視野。",
            "課程強烈鼓勵通過**實習及企業項目**進行實踐學習。",
          ],
        },
        career: {
          title: "就業前景",
          content: [
            "畢業生投身**顧問、銀行及企業管理**等多元行業。",
            "許多畢業生加入跨國企業的**管理培訓生計劃**。",
            "課程亦為學生準備**創業及初創企業發展**。",
            "校友網絡提供**強大的導師指導及工作推薦機會**。",
            "於全球頂尖**工商管理碩士課程**深造是常見出路。",
          ],
        },
        campus: {
          title: "校園及設施",
          content: [
            "課程於**薄扶林香港大學主校園**進行，配備現代化教學設施。",
            "**數碼港校園**為創新及創業活動提供額外空間。",
            "學生可使用**最先進的商業模擬實驗室**及交易室。",
            "大學圖書館提供**豐富的商業數據庫**及研究資源。",
            "協作空間支援**小組項目及個案研究討論**。",
          ],
        },
        competitiveness: {
          title: "競爭程度",
          content: [
            "這是香港**最受歡迎的商學課程之一**，競爭極為激烈。",
            "申請人通常在所有核心及選修科目取得**優異的文憑試成績**。",
            "在**數學及英文**表現出色可顯著提升入學機會。",
            "於**商業相關活動**的課外成就具優勢。",
            "面試表現可能是**邊緣申請人的決定性因素**。",
          ],
        },
        alumni: {
          title: "校友網絡",
          content: [
            "香港大學商學院校友網絡遍佈**全球超過40個國家**。",
            "傑出校友於**財富500強企業**擔任高級領導職位。",
            "定期舉辦的**交流活動及導師計劃**連繫學生與業界領袖。",
            "校友會提供**職業支援及終身學習機會**。",
            "許多校友積極**招聘香港大學畢業生**加入其機構。",
          ],
        },
        scholarships: {
          title: "獎學金",
          content: [
            "**學業成績優異的學生**可獲頒發獎學金。",
            "**香港大學基金獎學金**涵蓋全額學費及生活費。",
            "入學獎學金表彰**傑出的文憑試成績**及領導才能。",
            "按需要提供的經濟援助確保**有才華的學生不會被遺忘**。",
            "業界贊助獎學金除資助外亦提供**實習機會**。",
          ],
        },
        tips: {
          title: "申請貼士",
          content: [
            "準備**結構清晰的個人陳述**，突顯你的商業興趣及成就。",
            "通過具體例子及經驗展示**領導及團隊合作能力**。",
            "緊貼**最新商業趨勢**，以便在面試中深入討論。",
            "參與**商業比賽或個案挑戰**以強化個人履歷。",
            "展現對**學習及貢獻商業社群**的真正熱誠。",
          ],
        },
      },
    },
  },
  {
    code: "JS6793",
    nameZh: "工商管理學學士(商業分析)",
    nameEn: "BBA(BA)",
    university: "香港大學",
    faculty: "商學院",
    en: {
      sections: {
        admission: {
          title: "Admission",
          content: [
            "Strong performance in **Mathematics and Information Technology** is highly preferred.",
            "Applicants should demonstrate **proficiency in data analysis tools** or programming basics.",
            "A solid foundation in **logical reasoning and quantitative skills** is essential.",
            "Participation in **data science or coding competitions** strengthens your application.",
            "Good **English communication skills** are required for presenting analytical findings.",
          ],
        },
        curriculum: {
          title: "Curriculum",
          content: [
            "The programme combines **business knowledge with advanced analytics** and data science techniques.",
            "Core courses include **machine learning, statistical modelling, and big data management**.",
            "Students learn to use **Python, R, SQL, and Tableau** for real-world business problems.",
            "A **final-year analytics project** with industry partners provides hands-on experience.",
            "Electives span **marketing analytics, financial modelling, and operations research**.",
          ],
        },
        career: {
          title: "Career Prospects",
          content: [
            "Graduates work as **business analysts, data scientists, and analytics consultants**.",
            "Many are hired by **tech giants, banks, and consulting firms** seeking data-driven talent.",
            "The programme opens doors to **AI and fintech roles** in rapidly growing sectors.",
            "Strong demand exists for professionals who can **translate data into business insights**.",
            "Further studies in **data science or business analytics** at top universities are popular.",
          ],
        },
        campus: {
          title: "Campus & Facilities",
          content: [
            "Students have access to **dedicated data science labs** equipped with high-performance computing.",
            "The **Cyberport campus** supports tech-focused projects and start-up incubation.",
            "Collaboration spaces are designed for **team-based analytics challenges and hackathons**.",
            "The library provides access to **premium data analytics platforms** and datasets.",
            "Modern classrooms support **interactive coding sessions and live data visualisation**.",
          ],
        },
        competitiveness: {
          title: "Competitiveness",
          content: [
            "This programme is **increasingly popular** due to the growing demand for analytics talent.",
            "Competition is fierce among students with **strong STEM backgrounds**.",
            "High scores in **Mathematics and ICT** are often expected from successful applicants.",
            "Relevant **project experience or certifications** can differentiate your application.",
            "The programme seeks students who are **both business-minded and tech-savvy**.",
          ],
        },
        alumni: {
          title: "Alumni Network",
          content: [
            "Alumni work at leading **technology companies, investment banks, and global consultancies**.",
            "The network offers **mentorship in analytics career development** and skill building.",
            "Regular **industry talks and data challenges** connect current students with alumni.",
            "Many alumni hold **senior data and analytics positions** across Asia and beyond.",
            "The community fosters **knowledge sharing in emerging analytics technologies**.",
          ],
        },
        scholarships: {
          title: "Scholarships",
          content: [
            "Scholarships are awarded to students with **exceptional quantitative abilities**.",
            "The **HKU Business School Scholarship** supports high-achieving analytics students.",
            "Industry partners sponsor awards for **outstanding data analytics projects**.",
            "Financial aid is available for students **demonstrating need and potential**.",
            "Merit-based grants recognise **academic excellence and innovation in analytics**.",
          ],
        },
        tips: {
          title: "Application Tips",
          content: [
            "Showcase any **data analysis or coding projects** in your personal statement.",
            "Highlight your **problem-solving approach** using data-driven examples.",
            "Familiarise yourself with **basic analytics tools** before the interview.",
            "Demonstrate **curiosity about how data transforms business decisions**.",
            "Emphasise your **ability to communicate complex findings** to non-technical audiences.",
          ],
        },
      },
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求",
          content: [
            "在**數學及資訊科技**取得優異成績者會獲優先考慮。",
            "申請人應展示**數據分析工具或編程基礎**的熟練程度。",
            "穩固的**邏輯推理及量化技能**基礎至關重要。",
            "參與**數據科學或編程比賽**可強化申請。",
            "良好的**英語溝通能力**對呈現分析結果不可或缺。",
          ],
        },
        curriculum: {
          title: "課程結構",
          content: [
            "課程結合**商業知識與進階分析**及數據科學技術。",
            "核心課程包括**機器學習、統計建模及大數據管理**。",
            "學生學習使用**Python、R、SQL及Tableau**解決實際商業問題。",
            "與業界伙伴合作的**畢業年分析項目**提供實戰經驗。",
            "選修課涵蓋**市場分析、金融建模及營運研究**。",
          ],
        },
        career: {
          title: "就業前景",
          content: [
            "畢業生從事**商業分析師、數據科學家及分析顧問**等工作。",
            "許多畢業生獲**科技巨擘、銀行及顧問公司**聘用。",
            "課程為**人工智能及金融科技職位**打開大門。",
            "市場對能夠**將數據轉化為商業洞察**的專才需求殷切。",
            "於頂尖大學深造**數據科學或商業分析**頗受歡迎。",
          ],
        },
        campus: {
          title: "校園及設施",
          content: [
            "學生可使用配備高效能運算的**專屬數據科學實驗室**。",
            "**數碼港校園**支援科技項目及初創孵化。",
            "協作空間專為**團隊分析挑戰及編程馬拉松**而設計。",
            "圖書館提供**高級數據分析平台**及數據集的使用權。",
            "現代化課室支援**互動編程環節及即時數據可視化**。",
          ],
        },
        competitiveness: {
          title: "競爭程度",
          content: [
            "由於分析人才需求日增，此課程**越來越受歡迎**。",
            "擁有**強大STEM背景**的學生之間競爭激烈。",
            "成功申請者通常於**數學及資訊科技**取得高分。",
            "相關的**項目經驗或專業認證**可令申請脫穎而出。",
            "課程尋找**兼具商業頭腦及科技觸覺**的學生。",
          ],
        },
        alumni: {
          title: "校友網絡",
          content: [
            "校友於領先的**科技公司、投資銀行及全球顧問公司**工作。",
            "網絡提供**分析職業發展及技能建立**的導師指導。",
            "定期舉辦的**業界講座及數據挑戰**連繫在校生與校友。",
            "許多校友於亞洲及海外擔任**高級數據及分析職位**。",
            "社群促進**新興分析技術的知識交流**。",
          ],
        },
        scholarships: {
          title: "獎學金",
          content: [
            "獎學金頒發予具有**卓越量化能力**的學生。",
            "**香港大學商學院獎學金**支援成績優異的分析學生。",
            "業界伙伴贊助**傑出數據分析項目**的獎項。",
            "有需要的學生可申請**展示潛質的經濟援助**。",
            "按成績頒發的助學金表彰**學術卓越及分析創新**。",
          ],
        },
        tips: {
          title: "申請貼士",
          content: [
            "於個人陳述中展示任何**數據分析或編程項目**。",
            "以數據驅動的例子突顯你的**解難方法**。",
            "面試前熟悉**基本分析工具**。",
            "展示對**數據如何改變商業決策**的好奇心。",
            "強調你**向非技術受眾傳達複雜發現**的能力。",
          ],
        },
      },
    },
  },
  {
    code: "JS6846",
    nameZh: "理學士(營銷分析及科技)",
    nameEn: "BSc(MAT)",
    university: "香港大學",
    faculty: "商學院",
    en: {
      sections: {
        admission: {
          title: "Admission",
          content: [
            "Applicants should excel in **Mathematics and possess strong analytical abilities**.",
            "An interest in **consumer behaviour and digital marketing trends** is advantageous.",
            "Experience with **spreadsheet tools or basic statistics** is beneficial but not required.",
            "Good **English proficiency** is needed for reading academic marketing literature.",
            "A creative yet **data-driven mindset** sets successful candidates apart.",
          ],
        },
        curriculum: {
          title: "Curriculum",
          content: [
            "The programme blends **marketing principles with cutting-edge technology** and analytics.",
            "Students study **consumer psychology, digital marketing, and marketing research methods**.",
            "Technical training includes **data mining, A/B testing, and marketing automation tools**.",
            "Real-world projects with **brands and agencies** provide practical campaign experience.",
            "Electives cover **social media analytics, e-commerce strategy, and brand management**.",
          ],
        },
        career: {
          title: "Career Prospects",
          content: [
            "Graduates enter roles such as **marketing analyst, digital strategist, and CRM specialist**.",
            "Employers include **global brands, advertising agencies, and e-commerce platforms**.",
            "The rise of **MarTech creates strong demand** for tech-savvy marketing professionals.",
            "Skills in **data-driven campaign optimisation** are highly transferable across industries.",
            "Entrepreneurial graduates launch **digital marketing consultancies or analytics start-ups**.",
          ],
        },
        campus: {
          title: "Campus & Facilities",
          content: [
            "The programme utilises **modern marketing labs** with consumer behaviour tracking tools.",
            "Students access **digital marketing simulation platforms** for campaign planning practice.",
            "Collaboration spaces support **group projects with industry mentors**.",
            "The library subscribes to **leading marketing research journals** and databases.",
            "On-campus events feature **guest speakers from top global brands**.",
          ],
        },
        competitiveness: {
          title: "Competitiveness",
          content: [
            "This unique programme attracts students **passionate about both marketing and technology**.",
            "Admission is competitive, favouring those with **strong numeracy and communication skills**.",
            "Relevant experience in **social media management or content creation** is a plus.",
            "The programme values **innovation and adaptability** in a fast-evolving digital landscape.",
            "A well-rounded profile with **both creative and technical strengths** is ideal.",
          ],
        },
        alumni: {
          title: "Alumni Network",
          content: [
            "Alumni hold marketing and analytics roles at **Fortune 500 companies and unicorn start-ups**.",
            "The network provides **mentorship in navigating MarTech career paths**.",
            "Regular **alumni sharing sessions** cover emerging trends in digital marketing.",
            "Many alumni actively **recruit interns and graduates** from the programme.",
            "The community supports **entrepreneurial ventures in the marketing technology space**.",
          ],
        },
        scholarships: {
          title: "Scholarships",
          content: [
            "Scholarships recognise **academic merit and creative marketing project work**.",
            "The **HKU Business School Entrance Scholarship** is available for top performers.",
            "Industry sponsors offer awards for **innovative digital marketing campaigns**.",
            "Need-based aid ensures **access for talented students from all backgrounds**.",
            "Performance-based grants reward **outstanding achievement in analytics coursework**.",
          ],
        },
        tips: {
          title: "Application Tips",
          content: [
            "Highlight any **marketing or social media projects** you have led or contributed to.",
            "Demonstrate your **understanding of how data drives marketing decisions**.",
            "Show curiosity about **emerging technologies** like AI in marketing.",
            "Include examples of **creative problem solving** with measurable outcomes.",
            "Express enthusiasm for **bridging creativity and technology** in your career.",
          ],
        },
      },
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求",
          content: [
            "申請人應於**數學方面表現卓越並具備強大分析能力**。",
            "對**消費者行為及數碼營銷趨勢**有興趣者具優勢。",
            "具備**試算表工具或基礎統計**經驗有幫助但非必需。",
            "良好的**英語水平**對閱讀學術營銷文獻不可或缺。",
            "兼具創意及**數據驅動思維**的申請人會脫穎而出。",
          ],
        },
        curriculum: {
          title: "課程結構",
          content: [
            "課程融合**營銷原則與尖端科技**及分析技術。",
            "學生研習**消費者心理學、數碼營銷及市場研究方法**。",
            "技術培訓包括**數據挖掘、A/B測試及營銷自動化工具**。",
            "與**品牌及廣告公司**合作的實際項目提供實戰活動經驗。",
            "選修課涵蓋**社交媒體分析、電子商務策略及品牌管理**。",
          ],
        },
        career: {
          title: "就業前景",
          content: [
            "畢業生從事**營銷分析師、數碼策略師及客戶關係管理專員**等職位。",
            "僱主包括**國際品牌、廣告公司及電子商務平台**。",
            "**營銷科技的興起創造了對**具科技觸覺營銷專才的殷切需求。",
            "**數據驅動活動優化**的技能可跨行業轉移。",
            "具創業精神的畢業生開辦**數碼營銷顧問公司或分析初創企業**。",
          ],
        },
        campus: {
          title: "校園及設施",
          content: [
            "課程使用配備消費者行為追蹤工具的**現代化營銷實驗室**。",
            "學生可使用**數碼營銷模擬平台**練習活動策劃。",
            "協作空間支援**與業界導師合作的小組項目**。",
            "圖書館訂閱**領先營銷研究期刊**及數據庫。",
            "校園活動邀請**頂尖國際品牌的嘉賓講者**分享。",
          ],
        },
        competitiveness: {
          title: "競爭程度",
          content: [
            "這個獨特課程吸引**對營銷及科技同樣熱衷**的學生。",
            "入學競爭激烈，偏好具**強大數學及溝通能力**的申請人。",
            "具備**社交媒體管理或內容創作**相關經驗為加分項。",
            "課程重視瞬息萬變的數碼環境中的**創新及適應能力**。",
            "兼具**創意及技術優勢**的全面發展履歷最為理想。",
          ],
        },
        alumni: {
          title: "校友網絡",
          content: [
            "校友於**財富500強企業及獨角獸初創**擔任營銷及分析職位。",
            "網絡提供**指導如何開拓營銷科技職業路徑**的導師計劃。",
            "定期舉辦的**校友分享會**涵蓋數碼營銷新興趨勢。",
            "許多校友積極從課程中**招聘實習生及畢業生**。",
            "社群支援**營銷科技領域的創業項目**。",
          ],
        },
        scholarships: {
          title: "獎學金",
          content: [
            "獎學金表彰**學術成績及創意營銷項目作品**。",
            "成績頂尖的學生可獲頒**香港大學商學院入學獎學金**。",
            "業界贊助商為**創新數碼營銷活動**提供獎項。",
            "按需要提供的援助確保**來自不同背景的有才華學生**能入學。",
            "按表現頒發的助學金獎勵**分析課程的傑出成就**。",
          ],
        },
        tips: {
          title: "申請貼士",
          content: [
            "突顯你曾領導或參與的**任何營銷或社交媒體項目**。",
            "展示你對**數據如何推動營銷決策**的理解。",
            "表現對**人工智能應用於營銷**等新興科技的好奇心。",
            "加入具**可衡量成果的創意解難**例子。",
            "表達對於職業生涯中**連繫創意與科技**的熱誠。",
          ],
        },
      },
    },
  },
  {
    code: "JS6860",
    nameZh: "金融學學士(資產管理及私人銀行)",
    nameEn: "BFin(AMPB)",
    university: "香港大學",
    faculty: "商學院",
    en: {
      sections: {
        admission: {
          title: "Admission",
          content: [
            "Exceptional performance in **Mathematics and English** is strongly expected.",
            "An understanding of **basic finance and investment concepts** is highly advantageous.",
            "Applicants should demonstrate **strong numeracy and attention to detail**.",
            "Participation in **investment clubs or finance competitions** strengthens your profile.",
            "A genuine interest in **wealth management and financial markets** is essential.",
          ],
        },
        curriculum: {
          title: "Curriculum",
          content: [
            "The programme provides **specialised training in asset management and private banking**.",
            "Core subjects include **portfolio management, risk analysis, and financial derivatives**.",
            "Students gain practical skills in **Bloomberg terminals and financial modelling software**.",
            "A **mandatory internship** with a bank or asset management firm bridges theory and practice.",
            "Electives cover **alternative investments, ESG investing, and family office management**.",
          ],
        },
        career: {
          title: "Career Prospects",
          content: [
            "Graduates pursue careers as **portfolio managers, private bankers, and investment analysts**.",
            "Top employers include **global private banks, hedge funds, and asset management firms**.",
            "Hong Kong's status as a **global wealth management hub** creates abundant opportunities.",
            "The programme is recognised by **CFA Institute** as part of the University Recognition Programme.",
            "Many graduates advance to **prestigious finance graduate programmes** worldwide.",
          ],
        },
        campus: {
          title: "Campus & Facilities",
          content: [
            "Students train in **dedicated finance labs** with Bloomberg and Refinitiv workstations.",
            "The **Cyberport campus** hosts fintech innovation projects and industry partnerships.",
            "Seminar rooms are equipped for **real-time market analysis and trading simulations**.",
            "The library provides access to **capital market databases** and financial research tools.",
            "Networking lounges facilitate **connections with visiting industry professionals**.",
          ],
        },
        competitiveness: {
          title: "Competitiveness",
          content: [
            "This is one of the **most competitive finance programmes** in Asia.",
            "Successful applicants typically achieve **top-tier DSE scores** with excellence in Mathematics.",
            "Relevant **internships or investment experience** significantly boost competitiveness.",
            "The programme seeks students with **both intellectual rigour and professional polish**.",
            "Strong interview performance demonstrating **market awareness** is often decisive.",
          ],
        },
        alumni: {
          title: "Alumni Network",
          content: [
            "Alumni hold senior positions at **leading global banks and asset managers**.",
            "The network offers **exclusive mentorship and recruitment channels** for students.",
            "Annual **alumni dinners and industry forums** strengthen professional connections.",
            "Many alumni have become **CFA charterholders and recognised finance leaders**.",
            "The community actively supports **career placement in top-tier financial institutions**.",
          ],
        },
        scholarships: {
          title: "Scholarships",
          content: [
            "Prestigious scholarships are available for **top-performing finance students**.",
            "The **HKU Foundation Entrance Scholarship** covers tuition for exceptional candidates.",
            "Industry sponsors provide awards for **excellence in investment analysis projects**.",
            "Need-based grants ensure **talented students can access this elite programme**.",
            "Merit-based bursaries recognise **outstanding academic and extracurricular achievement**.",
          ],
        },
        tips: {
          title: "Application Tips",
          content: [
            "Demonstrate **knowledge of current financial markets** and major economic trends.",
            "Highlight any **investment simulations, trading competitions, or finance internships**.",
            "Show **quantitative reasoning skills** through academic or project achievements.",
            "Express a clear **career vision in asset management or private banking**.",
            "Prepare to discuss **ethical considerations in wealth management** during interviews.",
          ],
        },
      },
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求",
          content: [
            "強烈期望申請人於**數學及英文**取得卓越成績。",
            "對**基礎金融及投資概念**的理解極具優勢。",
            "申請人應展示**強大數學能力及注重細節**。",
            "參與**投資學會或金融比賽**可強化個人履歷。",
            "對**財富管理及金融市場**的真正興趣至關重要。",
          ],
        },
        curriculum: {
          title: "課程結構",
          content: [
            "課程提供**資產管理及私人銀行的專門培訓**。",
            "核心科目包括**投資組合管理、風險分析及金融衍生工具**。",
            "學生掌握**彭博終端機及金融建模軟件**的實務技能。",
            "與銀行或資產管理公司合作的**必修實習**連繫理論與實踐。",
            "選修課涵蓋**另類投資、ESG投資及家族辦公室管理**。",
          ],
        },
        career: {
          title: "就業前景",
          content: [
            "畢業生從事**投資組合經理、私人銀行家及投資分析師**等職業。",
            "頂尖僱主包括**國際私人銀行、對沖基金及資產管理公司**。",
            "香港作為**全球財富管理中心**的地位創造豐富機會。",
            "課程獲**CFA協會**認可為大學聯盟課程的一部分。",
            "許多畢業生晉身全球**知名金融畢業生培訓計劃**。",
          ],
        },
        campus: {
          title: "校園及設施",
          content: [
            "學生於配備彭博及路孚特工作站的**專屬金融實驗室**受訓。",
            "**數碼港校園**舉辦金融科技創新項目及業界合作。",
            "研討室配備**即時市場分析及交易模擬**設施。",
            "圖書館提供**資本市場數據庫**及金融研究工具的使用權。",
            "交誼廳促進**與來訪業界專業人士的聯繫**。",
          ],
        },
        competitiveness: {
          title: "競爭程度",
          content: [
            "這是亞洲**競爭最激烈的金融課程之一**。",
            "成功申請者通常取得**頂尖文憑試成績**，數學表現尤佳。",
            "相關的**實習或投資經驗**可顯著提升競爭力。",
            "課程尋找兼具**嚴謹思維及專業素養**的學生。",
            "展示**市場觸覺**的出色面試表現往往是決定性因素。",
          ],
        },
        alumni: {
          title: "校友網絡",
          content: [
            "校友於**領先國際銀行及資產管理公司**擔任高級職位。",
            "網絡為學生提供**獨家導師指導及招聘渠道**。",
            "年度**校友晚宴及業界論壇**加強專業聯繫。",
            "許多校友成為**CFA持證人及知名金融領袖**。",
            "社群積極支援**於頂尖金融機構的就業安排**。",
          ],
        },
        scholarships: {
          title: "獎學金",
          content: [
            "**成績頂尖的金融學生**可獲頒發享有盛譽的獎學金。",
            "**香港大學基金入學獎學金**涵蓋卓越申請人的學費。",
            "業界贊助商為**投資分析項目的卓越表現**提供獎項。",
            "按需要提供的助學金確保**有才華的學生能入讀這精英課程**。",
            "按成績頒發的助學金表彰**傑出的學術及課外成就**。",
          ],
        },
        tips: {
          title: "申請貼士",
          content: [
            "展示對**當前金融市場**及主要經濟趨勢的認識。",
            "突顯任何**投資模擬、交易比賽或金融實習**經驗。",
            "通過學術或項目成就展示**量化推理能力**。",
            "表達於**資產管理或私人銀行**的清晰職業願景。",
            "準備於面試中討論**財富管理中的道德考量**。",
          ],
        },
      },
    },
  },
];

async function seed() {
  console.log("[Seed] Starting HKU Details Batch H...");
  for (const prog of PROGRAMME_DETAILS) {
    await JupasProgrammeService.upsertProgrammeDetails(prog);
    console.log(`[Seed] ✓ Success: ${prog.code}`);
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
