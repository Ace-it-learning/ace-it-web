/**
 * Seed HKU Batch 4 Programme Details - Batch 2 (3 programmes)
 * Run: node backend/scripts/seed_hku_batch4_details_2.js
 *
 * Programmes:
 * JS6080 - 文學士及教育學士(語文教育)-中文教育 (BA&BEd(LangEd)-Chi)
 * JS6092 - 教育學士(幼兒教育及特殊教育) (BEd(ECE&SE))
 * JS6157 - 理學士(言語及語言病理學) (BSc(SLP))
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const JupasProgrammeService = require("../services/JupasProgrammeService");

const PROGRAMME_DETAILS = [
  // =====================================================
  // JS6080 - 文學士及教育學士(語文教育)-中文教育 (BA&BEd(LangEd)-Chi)
  // =====================================================
  {
    code: "JS6080",
    name: "文學士及教育學士(語文教育)-中文教育 (BA&BEd(LangEd)-Chi)",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Competitive dual-degree teacher education programme. Median admission score typically Best 6 = 26-28 (standard scale).",
            "**Core Subjects**: Chinese Language (Level 5+ mandatory — this is a Chinese teacher training programme), English (Level 4+), Mathematics (Compulsory Part, Level 3+).",
            "**Chinese - Critical**: As a Chinese language education programme, exceptional Chinese proficiency is essential. Level 5** in Chinese strongly preferred. Classical Chinese and modern literature knowledge valued.",
            "**Relevant Electives**: Chinese Literature, Chinese History, or humanities electives at Level 4+ preferred.",
            "**Interview**: Panel interview assessing Chinese communication skills (Cantonese and Putonghua), teaching aptitude, understanding of Chinese language education, and cultural knowledge."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1-2 - Foundation**: Classical Chinese literature, modern Chinese literature, linguistics, and educational psychology. School observation visits begin in Year 2.",
            "**BA Component**: Major in Chinese Studies (classical literature, modern literature, cultural studies) or choose a second teaching subject.",
            "**Education Component**: Curriculum and instruction, classroom management, assessment methods, and special educational needs. Micro-teaching practice in Chinese.",
            "**Year 3-4 - Professional Development**: Teaching practicum (8-12 weeks) at local secondary schools. Advanced Chinese teaching methodology, classical text instruction, and Putonghua teaching techniques.",
            "**Year 5 - Integration**: Final teaching practicum, action research project, and BA honours thesis. Preparation for teacher registration.",
            "**Putonghua Requirement**: Students must achieve Putonghua proficiency (typically PSC Level 2B or above) for graduation and teacher registration."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Secondary School Teaching**: Chinese Language teacher at Band 1-3 secondary schools. High demand for qualified Chinese teachers with strong classical and modern literature background.",
            "**Putonghua Teaching**: Teach Putonghua as a subject or co-curricular activity in schools with strong language programmes.",
            "**International Schools**: Teach at international schools with Chinese programmes (ISF, YCIS, HKIS) focusing on heritage language learners.",
            "**Curriculum Development**: Work at EDB, textbook publishers (Modern, Ling Kee, Aristo), or assessment organisations (HKEAA) on Chinese language curriculum.",
            "**Further Studies**: MA in Chinese Language Education, Classical Chinese Literature, or Applied Linguistics at HKU, PKU, or Taiwan Normal University.",
            "**Cultural Sector**: Museum education, cultural heritage preservation, or publishing houses specialising in Chinese literature and culture."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Faculty of Education Facilities**: Modern teaching laboratories with smart classrooms, Chinese language resource centres, and calligraphy studios.",
            "**Chinese Library**: Access to HKU's extensive Chinese collection, including rare classical texts and modern literary works.",
            "**School Partnerships**: Strong network with 100+ partner schools across Hong Kong for practicum placements, including traditional Chinese schools.",
            "**Student Society**: Chinese Language Education Society organises teaching workshops, calligraphy competitions, and cultural activities.",
            "**Exchange Programmes**: Semester abroad at mainland China universities (PKU, Fudan, Tsinghua) or Taiwan (NTU, NTNU) for immersion."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate (3/5 stars). Approximately 250-350 applicants compete for ~50-60 places annually (~17% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 29-31; Median: Best 6 = 26-28; Bottom quartile: Best 6 = 24-26.",
            "**Chinese Requirement**: Chinese MUST be Level 5+. Level 5** virtually guarantees an interview. Classical Chinese knowledge is a significant advantage.",
            "**Interview Weighting**: Interview carries ~25% of admission decision. Panel looks for cultural knowledge, communication clarity, and passion for Chinese language education.",
            "**Teaching Experience**: Any tutoring, volunteering, or mentoring experience with children/youth significantly strengthens applications.",
            "**Non-JUPAS Pathway**: IB (30+/45) with strong Chinese, GCE A-Levels (ABB including Chinese). Approximately 5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor T'sou Ka-yin**: Renowned scholar in Chinese language education and curriculum development. Former Dean of Education.",
            "**Professor Chan Shui-duen**: Leading researcher in classical Chinese literature and its pedagogical applications in secondary education.",
            "**Award-Winning Teachers**: Numerous alumni have received the Chief Executive's Award for Teaching Excellence in Chinese Language.",
            "**School Principals**: Many graduates have risen to become principals of top Chinese-medium schools across Hong Kong.",
            "**Textbook Authors**: Alumni who have authored widely-used Chinese language textbooks for Hong Kong secondary schools."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with strong DSE results, especially excellent Chinese performance.",
            "**Faculty of Education Scholarships**: Merit-based awards for academic achievement and teaching potential in Chinese language education.",
            "**Teacher Training Scholarship**: Government-funded scheme covering tuition fees for students committed to teaching careers.",
            "**Chinese Language Education Fund**: Special scholarships for students demonstrating exceptional classical Chinese or Putonghua proficiency.",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available."
          ]
        },
        tips: {
          title: "Ace Sir's Chinese Education Strategy",
          content: [
            "**Chinese Excellence**: Target Level 5** in Chinese. Read classical texts (論語, 孟子) AND modern literature. Build strong essay-writing skills.",
            "**Putonghua Preparation**: Start preparing for Putonghua proficiency early. Practice PSC-style oral tests. Consider summer immersion in Beijing or Taipei.",
            "**Teaching Experience**: Tutor younger students in Chinese, volunteer at community centres, or help at temple fairs. Any experience working with children counts.",
            "**Cultural Knowledge**: Show deep understanding of Chinese culture — festivals, philosophy, history. A good Chinese teacher is also a cultural ambassador.",
            "**Interview Practice**: Practice explaining classical texts in simple terms. Show you can make ancient wisdom relevant to modern students."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：具競爭力的雙學位教師教育課程。中位數收生分數通常為 Best 6 = 26-28 分 (標準計分)。",
            "**核心科目**：中國語文 (必須達 Level 5 或以上 — 這是中文教師培訓課程)、英文 (Level 4 或以上)、數學 (必修部分，Level 3 或以上)。",
            "**中文 - 關鍵**：作為中文教育課程，卓越的中文能力至關重要。強烈建議中文達5**。重視文言文及現代文學知識。",
            "**相關選修科**：中國文學、中國歷史或人文選修科達 Level 4+ 較佳。",
            "**面試**：小組面試，考核中文溝通技巧 (廣東話及普通話)、教學潛能、對中文教育的理解及文化知識。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一至二年 - 基礎**：中國古典文學、現代文學、語言學及教育心理學。第二年開始學校觀課。",
            "**文學士部分**：主修中國研究 (古典文學、現代文學、文化研究) 或選擇第二教學科目。",
            "**教育部分**：課程與教學、課堂管理、評估方法及特殊教育需要。中文微格教學實踐。",
            "**第三至四年 - 專業發展**：於本地中學進行教學實習 (8-12週)。進階中文教學法、文言文教學及普通話教學技巧。",
            "**第五年 - 整合**：最後教學實習、行動研究項目及文學士榮譽論文。準備教師註冊。",
            "**普通話要求**：學生畢業及教師註冊必須達到普通話水平 (通常 PSC 二級乙等或以上)。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**中學教學**：於 Band 1-3 中學擔任中文教師。具備深厚古典及現代文學背景的合資格中文教師需求甚殷。",
            "**普通話教學**：於語文課程強大的學校教授普通話科目或課外活動。",
            "**國際學校**：於設有中文課程的國際學校 (弘立書院、耀中、香港國際學校) 任教，專注於傳承語言學習者。",
            "**課程發展**：於教育局、教科書出版社 (現代、齡記、雅集) 或評估機構 (考評局) 從事中文課程工作。",
            "**進修深造**：於港大、北京大學或台灣師範大學修讀中文教育、古典文學或應用語言學碩士。",
            "**文化界別**：博物館教育、文化遺產保育或專營中國文學及文化的出版社。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**教育學院設施**：現代化教學實驗室，配備智能課室、中文語言資源中心及書法室。",
            "**中文圖書館**：使用港大豐富的中文藏書，包括珍貴古典文獻及現代文學作品。",
            "**學校伙伴網絡**：與香港100多間伙伴學校建立強大網絡，包括傳統中文學校，提供實習安排。",
            "**學生組織**：中文教育學會舉辦教學工作坊、書法比賽及文化活動。",
            "**交流計劃**：於內地大學 (北京大學、復旦、清華) 或台灣 (台大、師大) 進行交流學期以沉浸學習。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：中等 (3/5星)。每年約250-350人競爭~50-60個學額 (入學率約17%)。",
            "**分數分佈**：最高四分位數：Best 6 = 29-31分；中位數：Best 6 = 26-28分；最低四分位數：Best 6 = 24-26分。",
            "**中文要求**：中文必須達 Level 5+。達5**基本上確保獲得面試機會。文言文知識是顯著優勢。",
            "**面試比重**：面試佔入學決定約25%。面試小組尋求文化知識、溝通清晰度及對中文教育的熱情。",
            "**教學經驗**：任何補習、義工服務或與兒童/青少年相處的導師經驗都能顯著強化申請。",
            "**非聯招途徑**：國際文憑 (IB 30+/45) 中文成績優異、GCE A-Level (ABB 包括中文)。約5個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**鄒嘉彥教授**：中文教育及課程發展領域的知名學者。前教育學院院長。",
            "**陳瑞端教授**：文言文文學及其在中學教育應用的頂尖研究者。",
            "**得獎教師**：多位校友獲頒行政長官卓越教學獎 (中國語文教育)。",
            "**學校校長**：不少畢業生晉升為香港頂尖中文中學的校長。",
            "**教科書作者**：多位校友編著香港中學廣泛使用的中文教科書。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績優異者，尤其中文表現卓越者。",
            "**教育學院獎學金**：頒予中文教育學術成就及教學潛能的 merit-based 獎項。",
            "**教師培訓獎學金**：政府資助計劃，涵蓋承諾從事教學事業學生的學費。",
            "**中文教育基金**：特別獎學金，頒予展現卓越文言文或普通話能力的學生。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。專上學生資助計劃可供申請。"
          ]
        },
        tips: {
          title: "Ace Sir 中文教育攻略",
          content: [
            "**中文卓越**：中文目標5**。閱讀古典文本 (論語、孟子) 及現代文學。建立強大的寫作能力。",
            "**普通話準備**：及早準備普通話水平測試。練習 PSC 口試形式。考慮到北京或台北暑期沉浸學習。",
            "**教學經驗**：為較年幼學生補習中文、於社區中心當義工，或於廟會幫忙。任何與兒童相處的經驗都有價值。",
            "**文化知識**：展示對中國文化的深入理解 — 節慶、哲學、歷史。優秀中文教師也是文化大使。",
            "**面試練習**：練習以簡單語言解釋古典文本。展示你能讓古老智慧與現代學生產生共鳴。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6092 - 教育學士(幼兒教育及特殊教育) (BEd(ECE&SE))
  // =====================================================
  {
    code: "JS6092",
    name: "教育學士(幼兒教育及特殊教育) (BEd(ECE&SE))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Specialized teacher education programme. Median admission score typically Best 6 = 24-26 (standard scale).",
            "**Core Subjects**: English (Level 4+), Chinese (Level 4+), Mathematics (Compulsory Part, Level 3+), and Liberal Studies / Citizenship and Social Development.",
            "**Personal Qualities**: Genuine passion for working with young children and children with special needs is essential. Empathy, patience, and creativity highly valued.",
            "**Relevant Experience**: Any volunteering, tutoring, or work experience with young children (kindergarten, childcare, special education centres) significantly strengthens applications.",
            "**Interview**: Panel interview assessing communication with children, understanding of child development, inclusive education philosophy, and motivation for special education."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Child Development Foundations**: Child psychology, early childhood development theories, play-based learning, and introduction to special educational needs (SEN).",
            "**Year 2 - Teaching Methods**: Curriculum design for early childhood, inclusive classroom strategies, assessment for young learners, and observation practicum at kindergartens.",
            "**Year 3 - Special Education Focus**: Specific learning difficulties (dyslexia, ADHD, autism), behavioural intervention strategies, assistive technology, and Individual Education Plan (IEP) development.",
            "**Year 4 - Professional Integration**: Extended teaching practicum (16 weeks) in both mainstream kindergartens and special child care centres. Action research project.",
            "**Dual Certification**: Graduate qualified for BOTH kindergarten teaching registration AND special child care worker registration — unique dual qualification in Hong Kong.",
            "**Practical Training**: On-campus simulation kindergarten, sensory integration room, and assistive technology lab for hands-on practice."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Kindergarten Teaching**: Class teacher or subject teacher at local kindergartens (including international kindergartens with inclusive programmes).",
            "**Special Child Care Centres**: Special child care worker at government-funded or NGO special child care centres serving children with diverse needs.",
            "**Early Intervention**: Work at early education and training centres (EETCs) providing intervention services for children aged 0-6 with developmental delays.",
            "**Inclusive Education Support**: Learning support teacher at mainstream kindergartens implementing inclusive education policies.",
            "**Further Studies**: MSc in Special Education, Early Childhood Education, or Educational Psychology at HKU, CUHK, or overseas universities.",
            "**NGO Sector**: Programme coordinator at child-focused NGOs (Society for the Protection of Children, Heep Hong Society, Watchdog)."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Simulation Kindergarten**: On-campus mock kindergarten classroom with age-appropriate learning materials, sensory play equipment, and observation facilities.",
            "**SEN Resource Centre**: Dedicated space with assistive technology, sensory integration equipment, and therapeutic play materials for special education training.",
            "**Strong Industry Links**: Partnerships with 150+ kindergartens and 30+ special child care centres across Hong Kong for practicum placements.",
            "**Student Society**: Early Childhood Education Society organises visits to innovative kindergartens, SEN awareness campaigns, and alumni mentoring.",
            "**Community Engagement**: Regular volunteering at special education centres, inclusive playgroups, and parent support programmes."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: Moderate (3/5 stars). Approximately 200-300 applicants compete for ~40-50 places annually (~17% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 27-29; Median: Best 6 = 24-26; Bottom quartile: Best 6 = 22-24.",
            "**Experience Advantage**: Unlike academic programmes, relevant experience with children carries significant weight. A student with lower scores but strong volunteering experience may be preferred.",
            "**Interview Weighting**: Interview carries ~30% of admission decision. Panel looks for genuine warmth, patience, and realistic understanding of special education challenges.",
            "**Personal Statement**: Must clearly articulate WHY early childhood AND special education. Generic 'I love children' statements are insufficient.",
            "**Non-JUPAS Pathway**: IB (28+/45), GCE A-Levels (BBB). Approximately 3-5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Nirmala Rao**: Internationally recognised expert in early childhood education and development. Former Associate Dean of Education.",
            "**Professor Cynthia Leung**: Leading researcher in inclusive education and teacher preparation for diverse classrooms in Asian contexts.",
            "**Outstanding Educators**: Alumni who have received the Chief Executive's Award for Teaching Excellence in Early Childhood Education.",
            "**SEN Advocates**: Graduates who have founded or lead special education NGOs, making significant impact on Hong Kong's inclusive education landscape.",
            "**Kindergarten Principals**: Many graduates have risen to leadership positions in prestigious kindergartens and early childhood education organisations."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with strong overall DSE results and demonstrated commitment to education.",
            "**Faculty of Education Scholarships**: Merit-based awards for academic achievement and practical teaching performance.",
            "**Teacher Training Scholarship**: Government-funded scheme covering tuition fees for students committed to teaching careers in early childhood or special education.",
            "**SEN Education Fund**: Special scholarships for students showing exceptional dedication to special educational needs.",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's ECE&SE Strategy",
          content: [
            "**Get Experience NOW**: Volunteer at kindergartens, special child care centres, or inclusive playgroups. Document your experiences and reflections.",
            "**Understand SEN**: Read about autism, ADHD, dyslexia, and speech delays. Show you understand the REAL challenges — not just stereotypes.",
            "**Interview Authenticity**: Be genuine, not performative. Panels can spot fake enthusiasm. Show your natural warmth and patience.",
            "**Physical Stamina**: Early childhood teaching is physically demanding. Mention sports, dance, or activities showing you can keep up with energetic children.",
            "**Parent Communication**: Acknowledge that working with parents (especially of SEN children) is a huge part of the job. Show empathy for families."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：專門教師教育課程。中位數收生分數通常為 Best 6 = 24-26 分 (標準計分)。",
            "**核心科目**：英文 (Level 4 或以上)、中文 (Level 4 或以上)、數學 (必修部分，Level 3 或以上)，以及通識教育/公民與社會發展科。",
            "**個人質素**：對與幼兒及有特殊需要兒童工作的真誠熱情至關重要。高度重視同理心、耐心及創意。",
            "**相關經驗**：任何與幼兒相處的義工、補習或工作經驗 (幼稚園、幼兒中心、特殊教育中心) 都能顯著強化申請。",
            "**面試**：小組面試，考核與兒童溝通、對兒童發展的理解、融合教育理念及特殊教育動機。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 兒童發展基礎**：兒童心理學、幼兒發展理論、遊戲為本學習及特殊教育需要 (SEN) 導論。",
            "**第二年 - 教學方法**：幼兒課程設計、融合課堂策略、幼兒評估及幼稚園觀課實習。",
            "**第三年 - 特殊教育聚焦**：特定學習困難 (讀寫障礙、專注力失調、自閉症)、行為介入策略、輔助科技及個別學習計劃 (IEP) 制定。",
            "**第四年 - 專業整合**：於主流幼稚園及特殊幼兒中心進行延長教學實習 (16週)。行動研究項目。",
            "**雙重認證**：畢業時符合幼稚園教師註冊及特殊幼兒工作員註冊資格 — 香港獨特的雙重資格。",
            "**實務訓練**：校內模擬幼稚園、感覺統合室及輔助科技實驗室供實踐練習。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**幼稚園教學**：於本地幼稚園 (包括設有融合課程的國際幼稚園) 擔任班主任或科教。",
            "**特殊幼兒中心**：於政府資助或非政府組織特殊幼兒中心擔任特殊幼兒工作員，服務多元需要兒童。",
            "**早期介入**：於早期教育及訓練中心 (EETC) 為0-6歲發展遲緩兒童提供介入服務。",
            "**融合教育支援**：於主流幼稚園擔任學習支援教師，實施融合教育政策。",
            "**進修深造**：於港大、中大或海外大學修讀特殊教育、幼兒教育或教育心理學碩士。",
            "**非政府組織界別**：於兒童為本的非政府組織 (保護兒童會、協康會、童軍總會) 擔任項目統籌。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**模擬幼稚園**：校內模擬幼稚園課室，配備適齡學習材料、感官遊戲設備及觀察設施。",
            "**特殊教育資源中心**：專用空間配備輔助科技、感覺統合設備及治療性遊戲材料供特殊教育訓練。",
            "**強大業界聯繫**：與香港150多間幼稚園及30多間特殊幼兒中心建立伙伴關係，提供實習安排。",
            "**學生組織**：幼兒教育學會舉辦創新幼稚園參觀、特殊教育意識活動及校友師友計劃。",
            "**社區參與**：定期於特殊教育中心、融合遊戲小組及家長支援計劃當義工。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：中等 (3/5星)。每年約200-300人競爭~40-50個學額 (入學率約17%)。",
            "**分數分佈**：最高四分位數：Best 6 = 27-29分；中位數：Best 6 = 24-26分；最低四分位數：Best 6 = 22-24分。",
            "**經驗優勢**：與學術課程不同，與兒童相處的相關經驗佔重要比重。分數較低但義工經驗豐富的學生可能更受青睞。",
            "**面試比重**：面試佔入學決定約30%。面試小組尋求真誠的溫暖、耐心及對特殊教育挑戰的現實理解。",
            "**個人陳述**：必須清楚闡述為何選擇幼兒教育及特殊教育。籠統的「我喜歡小朋友」陳述並不足夠。",
            "**非聯招途徑**：國際文憑 (IB 28+/45)、GCE A-Level (BBB)。約3-5個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**Rao Nirmala 教授**：幼兒教育及發展領域國際知名專家。前教育學院副院長。",
            "**梁慧敏教授**：融合教育及亞洲脈絡下多元課堂教師培訓的頂尖研究者。",
            "**傑出教育工作者**：多位校友獲頒行政長官卓越教學獎 (幼兒教育)。",
            "**特殊教育倡導者**：畢業生創立或領導特殊教育非政府組織，對香港融合教育發展產生重大影響。",
            "**幼稚園校長**：不少畢業生晉升為知名幼稚園及幼兒教育機構的領導層。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予整體 DSE 成績優異及展現教育承諾的學生。",
            "**教育學院獎學金**：頒予學術成就及實務教學表現的 merit-based 獎項。",
            "**教師培訓獎學金**：政府資助計劃，涵蓋承諾從事幼兒教育或特殊教育事業學生的學費。",
            "**特殊教育基金**：特別獎學金，頒予展現卓越特殊教育奉獻的學生。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請專上學生資助計劃。"
          ]
        },
        tips: {
          title: "Ace Sir 幼兒教育及特殊教育攻略",
          content: [
            "**立即獲取經驗**：於幼稚園、特殊幼兒中心或融合遊戲小組當義工。記錄你的經驗及反思。",
            "**理解特殊教育**：閱讀自閉症、專注力失調、讀寫障礙及語言發展遲緩的資料。展示你理解真正的挑戰 — 而非僅有刻板印象。",
            "**面試真誠**：真誠而非表演。面試小組能察覺虛假熱情。展示你自然的溫暖及耐心。",
            "**體能耐力**：幼兒教學對體能要求高。提及運動、舞蹈或展示你能跟上精力充沛兒童的活動。",
            "**家長溝通**：承認與家長 (尤其是特殊教育兒童家長) 合作是工作的重要部分。展示對家庭的同理心。"
          ]
        }
      }
    }
  },

  // =====================================================
  // JS6157 - 理學士(言語及語言病理學) (BSc(SLP))
  // =====================================================
  {
    code: "JS6157",
    name: "理學士(言語及語言病理學) (BSc(SLP))",
    university: "香港大學",
    en: {
      sections: {
        admission: {
          title: "Eligibility & Admission Criteria (DSE)",
          content: [
            "**Academic Threshold**: Highly competitive allied health programme. Median admission score typically Best 6 = 28-30 (standard scale).",
            "**Core Subjects**: English (Level 5+ strongly preferred), Chinese (Level 4+), Mathematics (Compulsory Part, Level 4+), and strong science performance.",
            "**Science Subjects - Critical**: Biology strongly preferred. Understanding of human anatomy, physiology, and neurology essential for speech-language pathology.",
            "**Language Skills**: Bilingual proficiency (English and Cantonese) is essential. Putonghua proficiency is an advantage for serving diverse client populations.",
            "**Interview**: Multiple Mini Interview (MMI) format assessing communication skills, empathy, ethical reasoning, and understanding of speech therapy profession."
          ]
        },
        curriculum: {
          title: "Programme Structure & Curriculum",
          content: [
            "**Year 1 - Foundation Sciences**: Anatomy and physiology of speech mechanisms, linguistics, phonetics, and psychology. Introduction to communication disorders.",
            "**Year 2 - Clinical Foundations**: Speech and language development, hearing science, neuroanatomy, and first clinical observation placements.",
            "**Year 3 - Assessment & Intervention**: Diagnostic methods for speech, language, voice, and swallowing disorders. Clinical practicum (100+ supervised hours) at HKU clinics and hospitals.",
            "**Year 4 - Advanced Practice**: Complex cases (aphasia, dysarthria, dysphagia, autism spectrum disorders). Extended clinical practicum (200+ hours) at diverse settings.",
            "**Accreditation**: Programme accredited by the Hong Kong Institute of Speech Therapists (HKIST). Graduates eligible for full membership and registration.",
            "**Interprofessional Education**: Collaborative training with occupational therapy, physiotherapy, and audiology students for holistic patient care."
          ]
        },
        career: {
          title: "Career Pathways & Prospects",
          content: [
            "**Hospital Authority**: Speech therapist at public hospitals (Queen Mary, Prince of Wales, Pamela Youde) serving acute, rehabilitation, and paediatric cases.",
            "**Special Schools**: Speech therapist at special schools for children with hearing impairment, intellectual disabilities, or autism spectrum disorders.",
            "**Private Practice**: Establish private speech therapy clinics serving children with speech delays, stuttering, or language disorders. Growing private market.",
            "**Early Intervention**: Work at early education and training centres (EETCs) or child assessment centres providing early speech and language intervention.",
            "**Further Studies**: MSc in Speech and Language Sciences, MSc in Neuroscience, or PhD in Communication Sciences at top universities (UCL, Northwestern, Sydney).",
            "**Academic & Research**: Join HKU's Division of Speech and Hearing Sciences as research staff or pursue academic careers in communication disorders."
          ]
        },
        campus: {
          title: "Campus Life & Student Experience",
          content: [
            "**Speech and Hearing Clinic**: On-campus clinic serving real clients from the community. Students conduct assessments and therapy under supervision from Year 2.",
            "**Anatomy Laboratory**: Access to HKU's medical anatomy lab for detailed study of head and neck structures, brain anatomy, and speech mechanisms.",
            "**Simulation Suites**: Virtual reality simulation for clinical scenarios, video recording rooms for self-analysis, and dedicated therapy rooms with specialised equipment.",
            "**Professional Networks**: Active Hong Kong Speech and Hearing Association student chapter. Regular workshops by practising speech therapists.",
            "**Overseas Placements**: Optional clinical placements at overseas institutions (UK, Australia, Canada) for exposure to different healthcare systems."
          ]
        },
        competitiveness: {
          title: "Admission Competitiveness Analysis",
          content: [
            "**Overall Difficulty**: High (4/5 stars). Approximately 400-500 applicants compete for ~30-35 places annually (~7% admission rate).",
            "**Score Distribution**: Top quartile: Best 6 = 31-33; Median: Best 6 = 28-30; Bottom quartile: Best 6 = 26-28.",
            "**Subject Strategy**: Biology (Level 5+) + English (Level 5+) + Mathematics (Level 4+). A student with 5* in Biology, 5 in English, and 4 in Maths achieves ~28 points.",
            "**MMI Format**: 4-6 stations (10 min each) assessing clinical reasoning, empathy, ethical judgment, and communication with simulated patients.",
            "**Experience Advantage**: Volunteering at special schools, hospitals, or elderly centres with communication-impaired individuals significantly strengthens applications.",
            "**Non-JUPAS Pathway**: IB (34+/45) with Biology HL, GCE A-Levels (AAB including Biology). Approximately 3-5 places reserved."
          ]
        },
        alumni: {
          title: "Notable Alumni & Faculty",
          content: [
            "**Professor Anthony Pak-Hin Kong**: Internationally renowned researcher in bilingual aphasia and neurolinguistics. Director of the Division of Speech and Hearing Sciences.",
            "**Professor Kathy Lee**: Leading expert in swallowing disorders (dysphagia) and clinical management of complex feeding cases.",
            "**Hospital Authority Leaders**: Alumni serving as senior speech therapists and department heads across major public hospitals in Hong Kong.",
            "**Private Practice Pioneers**: Graduates who have established successful private speech therapy clinics with multi-disciplinary teams.",
            "**Research Fellows**: Alumni pursuing doctoral studies and postdoctoral research at UCL, Northwestern University, and University of Sydney."
          ]
        },
        scholarships: {
          title: "Scholarships & Financial Aid",
          content: [
            "**HKU Foundation Entrance Scholarships**: For students with exceptional DSE results, especially strong Biology and English performance.",
            "**Health Care Professions Scholarship**: Government-funded scheme supporting students in allied health programmes including speech therapy.",
            "**Speech Therapy Professional Association Awards**: Merit-based scholarships from the Hong Kong Association of Speech Therapists.",
            "**Overseas Clinical Placement Grants**: Funding for optional overseas clinical placements (up to HKD 30,000).",
            "**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme available for eligible students."
          ]
        },
        tips: {
          title: "Ace Sir's SLP Strategy",
          content: [
            "**Biology Foundation**: Excel in Biology. Understanding of anatomy, neurology, and physiology is the backbone of speech therapy.",
            "**Bilingual Proficiency**: Strengthen BOTH English and Cantonese. Speech therapists in Hong Kong serve clients in both languages daily.",
            "**Get Clinical Exposure**: Volunteer at hospitals, special schools, or elderly centres. Observe how communication disorders affect daily life.",
            "**MMI Preparation**: Practice ethical scenarios (patient confidentiality, resource allocation). Show empathy and clinical reasoning under pressure.",
            "**Understand the Scope**: Speech therapy covers speech, language, voice, AND swallowing. Show awareness of the full professional scope, not just 'helping kids speak'."
          ]
        }
      }
    },
    zh: {
      sections: {
        admission: {
          title: "入學要求與計分詳情 (DSE)",
          content: [
            "**學術門檻**：極具競爭力的專職醫療課程。中位數收生分數通常為 Best 6 = 28-30 分 (標準計分)。",
            "**核心科目**：英文 (強烈建議 Level 5 或以上)、中文 (Level 4 或以上)、數學 (必修部分，Level 4 或以上)，以及優異的理科成績。",
            "**理科科目 - 關鍵**：強烈建議修讀生物。理解人體解剖學、生理學及神經學對言語治療至關重要。",
            "**語言能力**：必須具備雙語能力 (英文及廣東話)。普通話能力對服務多元客戶群體是優勢。",
            "**面試**：迷你面試 (MMI) 形式，考核溝通技巧、同理心、道德推理及對言語治療專業的理解。"
          ]
        },
        curriculum: {
          title: "課程結構與內容",
          content: [
            "**第一年 - 基礎科學**：言語機制的解剖學及生理學、語言學、語音學及心理學。溝通障礙導論。",
            "**第二年 - 臨床基礎**：言語及語言發展、聽力科學、神經解剖學及首次臨床觀察實習。",
            "**第三年 - 評估與介入**：言語、語言、嗓音及吞嚥障礙的診斷方法。於港大診所及醫院進行臨床實習 (100+ 督導小時)。",
            "**第四年 - 進階實踐**：複雜個案 (失語症、構音障礙、吞嚥困難、自閉症譜系障礙)。於多元環境進行延長臨床實習 (200+ 小時)。",
            "**專業認證**：課程獲香港言語治療師公會 (HKIST) 認證。畢業生符合正式會員及註冊資格。",
            "**跨專業教育**：與職業治療、物理治療及聽力學學生協作培訓，以提供整全病人護理。"
          ]
        },
        career: {
          title: "職業前景與出路",
          content: [
            "**醫院管理局**：於公立醫院 (瑪麗醫院、威爾斯親王醫院、東區尤德夫人那打素醫院) 擔任言語治療師，服務急性、復康及兒科個案。",
            "**特殊學校**：於聽障、智障或自閉症譜系障礙兒童特殊學校擔任言語治療師。",
            "**私人執業**：開設私人言語治療診所，服務言語發展遲緩、口吃或語言障礙兒童。私人市場日益增長。",
            "**早期介入**：於早期教育及訓練中心 (EETC) 或兒童評估中心提供早期言語及語言介入服務。",
            "**進修深造**：於頂尖大學 (倫敦大學學院、西北大學、悉尼大學) 修讀言語及語言科學碩士、神經科學碩士或溝通科學博士。",
            "**學術及研究**：加入港大言語及聽覺科學部擔任研究人員，或從事溝通障礙學術事業。"
          ]
        },
        campus: {
          title: "校園生活與學生體驗",
          content: [
            "**言語及聽覺診所**：校內診所服務社區真實客戶。學生從第二年開始在督導下進行評估及治療。",
            "**解剖學實驗室**：使用港大醫學解剖實驗室詳細學習頭頸結構、腦部解剖及言語機制。",
            "**模擬套房**：虛擬實境臨床情境模擬、錄影室供自我分析，以及配備專業設備的專用治療室。",
            "**專業網絡**：活躍的香港言語及聽覺協會學生分會。執業言語治療師定期舉辦工作坊。",
            "**海外實習**：可選擇於海外機構 (英國、澳洲、加拿大) 進行臨床實習，接觸不同醫療體系。"
          ]
        },
        competitiveness: {
          title: "入學競爭力分析",
          content: [
            "**整體難度**：高 (4/5星)。每年約400-500人競爭~30-35個學額 (入學率約7%)。",
            "**分數分佈**：最高四分位數：Best 6 = 31-33分；中位數：Best 6 = 28-30分；最低四分位數：Best 6 = 26-28分。",
            "**科目策略**：生物 (Level 5+) + 英文 (Level 5+) + 數學 (Level 4+)。生物達5*、英文達5、數學達4的學生約有28分。",
            "**MMI 形式**：4-6個站 (每站10分鐘)，考核臨床推理、同理心、道德判斷及與模擬病人溝通。",
            "**經驗優勢**：於特殊學校、醫院或護老中心義工服務，協助溝通障礙人士能顯著強化申請。",
            "**非聯招途徑**：國際文憑 (IB 34+/45) 修讀高等生物、GCE A-Level (AAB 包括生物)。約3-5個學額預留。"
          ]
        },
        alumni: {
          title: "知名校友及教職員",
          content: [
            "**江柏軒教授**：雙語失語症及神經語言學領域國際知名研究者。言語及聽覺科學部主任。",
            "**李月裳教授**：吞嚥障礙 (吞嚥困難) 及複雜餵飼個案臨床管理的頂尖專家。",
            "**醫管局領袖**：校友於香港主要公立醫院擔任高級言語治療師及部門主管。",
            "**私人執業先驅**：畢業生開設成功的私人言語治療診所，設有跨專業團隊。",
            "**研究員**：校友於倫敦大學學院、西北大學及悉尼大學攻讀博士及博士後研究。"
          ]
        },
        scholarships: {
          title: "獎學金及經濟援助",
          content: [
            "**港大基金入學獎學金**：頒予 DSE 成績卓越者，尤其生物及英文成績優異者。",
            "**醫療專業獎學金**：政府資助計劃，支援包括言語治療在內的專職醫療課程學生。",
            "**香港言語治療師公會獎項**：香港言語治療師協會頒發的 merit-based 獎學金。",
            "**海外臨床實習資助**：資助可選擇的海外臨床實習 (最多港幣30,000元)。",
            "**政府資助及貸款**：免入息審查資助計劃 (NMTSS) 每年提供最多港幣33,200元。合資格學生可申請專上學生資助計劃。"
          ]
        },
        tips: {
          title: "Ace Sir 言語及語言病理學攻略",
          content: [
            "**生物基礎**：生物取得卓越成績。解剖學、神經學及生理學的理解是言語治療的骨幹。",
            "**雙語能力**：強化英文及廣東話。香港言語治療師每天以兩種語言服務客戶。",
            "**獲取臨床 exposure**：於醫院、特殊學校或護老中心當義工。觀察溝通障礙如何影響日常生活。",
            "**MMI 準備**：練習倫理情境 (病人私隱、資源分配)。展示同理心及壓力下的臨床推理。",
            "**理解專業範疇**：言語治療涵蓋言語、語言、嗓音及吞嚥。展示對完整專業範疇的認知，而非僅「幫助小朋友說話」。"
          ]
        }
      }
    }
  }
];

async function seedBatch() {
  console.log("[Seed] Starting HKU Batch 4 - Batch 2 programme details seeding...");
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

  console.log("[Seed] Batch 2 seeding complete.");
  process.exit(0);
}

seedBatch().catch((error) => {
  console.error("[Seed] Fatal error:", error);
  process.exit(1);
});
