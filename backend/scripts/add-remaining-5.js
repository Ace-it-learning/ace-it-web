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

// ============ JS6411 - Architecture ============
data.programmes.JS6411 = {
  id: 'hku-arch', code: 'JS6411', name: '建築學士 (BArch)', university: 'HKU',
  content: makeContent({
    admission: sect('Eligibility & Admission Criteria (DSE)', [
      '**Academic Threshold**: HKU Architecture is the only accredited architecture programme in Hong Kong leading directly to professional qualification. Admission requires Best 5 scores around 29-31 (standard scale).',
      '**Portfolio**: While not required at application, shortlisted candidates may be asked to submit creative work demonstrating spatial thinking, design sensibility, and visual communication skills.',
      '**Mathematics & Physics**: Both are useful — mathematics for structural calculations and physics for understanding forces, materials, and environmental performance.',
      '**English**: Level 4+ in English is expected. The programme involves extensive design critiques, written essays on architectural theory, and presentation of design proposals.',
      '**Interview**: Candidates discuss their interest in architecture, awareness of built environment issues, creative problem-solving approach, and understanding of the profession\'s demands.'
    ]),
    curriculum: sect('Programme Structure & Curriculum', [
      '**Year 1 - Design Fundamentals**: Introduction to architectural design, drawing, model-making, and visual communication. Design studios focus on small-scale projects — pavilions, installations, and furniture.',
      '**Year 2 - Building Technology & History**: Structural systems, construction materials, environmental design, and architectural history from ancient civilisations to modernism. Design projects increase in scale and complexity.',
      '**Year 3 - Urban Context & Professional Practice**: Urban design principles, site analysis, building regulations, and contract administration. Design studios tackle mixed-use buildings and urban interventions.',
      '**Year 4 - Advanced Design & Research**: Independent design thesis on a self-selected topic. Options to specialise in sustainable design, digital fabrication, heritage conservation, or housing.',
      '**Year 5 - Professional Practice & Final Project**: Advanced design project equivalent to a real-world commission. Professional practice courses prepare students for ARB registration and running an architectural practice.',
      '**Design Studio**: The heart of the programme. Students work on architectural projects from conceptual design to detailed construction drawings, with regular desk crits and pin-up reviews.',
      '**Technology Integration**: Courses in structural engineering, building services, environmental systems, and construction technology ensure designs are buildable and sustainable.'
    ]),
    career: sect('Career Pathways & Prospects', [
      '**Architectural Practice**: Join established firms like Foster + Partners, Rocco Design Architects, Ronald Lu & Partners, or local practices. Path to ARB registration requires 2+ years of practical experience post-graduation.',
      '**Urban Design & Planning**: Work on master planning, urban renewal, and smart city initiatives for government (Planning Department, URA) or private consultancies (AECOM, Arup, SOM).',
      '**Interior & Exhibition Design**: Apply spatial design skills to retail, hospitality, museum, and exhibition projects. Many architects transition into interior design or branded environments.',
      '**Sustainable Design Consulting**: Specialise in green building certification (BEAM Plus, LEED), energy modelling, and sustainable design strategies for developers and corporations.',
      '**Academia & Research**: Pursue Master\'s (MArch, MDes, MSc) and PhD programmes at leading institutions (MIT, ETH Zurich, Bartlett UCL, AA School). HKU Architecture has strong research in digital fabrication and Asian urbanism.',
      '**Construction & Project Management**: Apply architectural knowledge to construction management, quantity surveying, or development management roles at major contractors and developers.'
    ]),
    campus: sect('Campus Life & Student Experience', [
      '**Main Campus (Pok Fu Lam)**: All five years at the Main Campus. The Architecture Department occupies the historic Main Building and the Knowles Building, with dedicated studio spaces for each year group.',
      '**Fabrication Lab**: State-of-the-art digital fabrication facility with laser cutters, CNC routers, 3D printers, and robotics. Students build physical models and prototype architectural components.',
      '**Architecture Library**: Specialised collection of architectural drawings, monographs, and periodicals. Subscriptions to Domus, Architectural Review, and A+U.',
      '**Hall Life**: Architecture students often choose St. John\'s College or Lady Ho Tung Hall for their creative communities. Many students live in studio flats near campus for all-night design work.',
      '**Architecture Society (ArchSoc)**: Organises design workshops, firm visits, charity build projects, and the annual ArchBall. Strong alumni network includes partners at major Hong Kong and international firms.'
    ]),
    competitiveness: sect('Admission Competitiveness Analysis', [
      '**Overall Difficulty**: High (4/5 stars). Approximately 800-1,000 applicants compete for ~80 places annually (~10% admission rate).',
      '**Score Distribution**: Top quartile: Best 5 = 32-34; Median: Best 5 = 29-31; Bottom quartile: Best 5 = 27-28.',
      '**Subject Weighting Strategy**: Best Elective (x1.0) + Maths (x1.0) + English (x1.0) + LS/CSD (x1.0) + Chinese (x1.0). No specific subject weighting — the programme values well-rounded candidates with creative and analytical abilities.',
      '**Portfolio & Interview Weighting**: For shortlisted candidates, the portfolio and interview carry approximately 30-40% of the final decision. Creative potential can compensate for slightly lower scores.',
      '**Band A Advantage**: Band A Choice 1 receives priority. Choice 2 has viable chances. Lower bands are possible but less likely.',
      '**Non-JUPAS Pathway**: IB (36+/45), GCE A-Levels (AAA including Art/Design/Maths). Approximately 10-15 places reserved for non-JUPAS entrants, many with international art school backgrounds.'
    ]),
    alumni: sect('Notable Alumni & Faculty', [
      '**Professor Rocco Yim Sen-kee**: Founding partner of Rocco Design Architects, one of Hong Kong\'s most influential architecture firms. Designed the Guangdong Museum and the Xiqu Centre.',
      '**Ronald Lu**: Founding partner of Ronald Lu & Partners, pioneer of sustainable design in Hong Kong. Designed the Zero Carbon Building and numerous BEAM Plus Platinum projects.',
      '**Professor John Lin**: Award-winning architect known for rural reconstruction projects in China. Recipient of the Architectural Review Emerging Architecture Award.',
      '**Professor Joshua Bolchover**: Co-founder of Rural Urban Framework, internationally recognised for community-based architectural interventions in rural China.',
      '**Professor Nasrine Seraji**: Former Head of Architecture at HKU, renowned for her theoretical work on architecture and urbanism. Previously taught at Columbia University and the AA School.'
    ]),
    scholarships: sect('Scholarships & Financial Aid', [
      '**HKU Foundation Entrance Scholarships**: Awarded to students with strong DSE results. Full or half tuition coverage.',
      '**Architecture Department Scholarships**: For design excellence, academic performance, and contribution to the studio culture (HKD 10,000-30,000/year).',
      '**Travel Grants for Overseas Study Trips**: Funding for architecture study trips to cities like Tokyo, Barcelona, Rome, and New York (up to HKD 15,000 per trip).',
      '**Model-Making & Material Subsidies**: Support for students undertaking ambitious physical models and material experiments (up to HKD 5,000 per project).',
      '**Government Grants & Loans**: NMTSS provides up to HKD 33,200/year. Tertiary Student Finance Scheme offers low-interest loans.'
    ]),
    tips: sect('Ace Sir\'s Architecture Strategy', [
      '**Build a Portfolio Early**: Sketch buildings, photograph interesting spaces, build physical models, and experiment with digital design tools. Architecture is about SHOWING, not just telling. Start collecting work from Year 10.',
      '**Visit Buildings Critically**: Go to PMQ, Tai Kwun, the West Kowloon Cultural District, and the HSBC Main Building. Do not just look — analyse WHY the space works, how light enters, how people move through it. Develop your architectural eye.',
      '**Learn Basic Software**: SketchUp, Rhino, or even hand drafting. Showing you can visualise spatial ideas sets you apart from candidates who just talk about "loving buildings." Free tutorials are available on YouTube.',
      '**Understand the Profession**: Architecture is not just about designing beautiful buildings. It involves long hours, tight budgets, complex regulations, and difficult clients. Shadow an architect for a few days to understand the reality.',
      '**Read Architecture**: Start with "Towards a New Architecture" by Le Corbusier, "Complexity and Contradiction in Architecture" by Robert Venturi, and "The Eyes of the Skin" by Juhani Pallasmaa. These will change how you see buildings.'
    ])
  }, {
    admission: sect('入學要求與計分詳情 (DSE)', [
      '**學術門檻**：港大建築學系是香港唯一可直接取得專業資格的認可建築課程。入學通常需要 Best 5 達 29-31 分。',
      '**作品集**：申請時雖非必需，但入圍考生可能被要求提交創作，展示空間思維、設計感及視覺傳達技巧。',
      '**數學與物理**：兩科均有用——數學用於結構計算，物理用於理解力學、材料及環境表現。',
      '**英國語文**：預期英文達 4 級或以上。課程涉及大量設計評論、建築理論文章及設計方案報告。',
      '**面試**：考生需討論對建築的興趣、對建成環境議題的認識、創意解難方法及對行業要求的理解。'
    ]),
    curriculum: sect('課程結構與內容', [
      '**第一年 - 設計基礎**：建築設計、繪圖、模型製作及視覺傳達入門。設計工作室專注於小規模項目——亭閣、裝置及家具。',
      '**第二年 - 建築科技與歷史**：結構系統、建築材料、環境設計及從古代文明到現代主義的建築歷史。設計項目規模及複雜度增加。',
      '**第三年 - 城市脈絡與專業實務**：城市設計原則、基地分析、建築法規及合約管理。設計工作室處理混合用途建築及城市介入。',
      '**第四年 - 進階設計與研究**：自選題目的獨立設計論文。可專修可持續設計、數碼製造、文物保育或房屋設計。',
      '**第五年 - 專業實務及畢業設計**：相當於真實委託的進階設計項目。專業實務課程為 ARB 註冊及經營建築事務所做好準備。',
      '**設計工作室**：課程核心。學生從概念設計到詳細施工圖進行建築項目，定期接受桌面評圖及圖板評審。',
      '**科技整合**：結構工程、建築設備、環境系統及建築科技課程確保設計可建造且可持續。'
    ]),
    career: sect('職業前景與出路', [
      '**建築事務所**：加入 Foster + Partners、嚴迅奇建築師事務所、呂元祥建築師事務所或本地公司。畢業後取得建築師註冊資格需時 2 年以上實務經驗。',
      '**城市設計與規劃**：為政府 (規劃署、市建局) 或私人顧問公司 (AECOM、奧雅納、SOM) 從事總體規劃、市區重建及智慧城市項目。',
      '**室內及展覽設計**：將空間設計技能應用於零售、酒店、博物館及展覽項目。很多建築師轉型室內設計或品牌環境設計。',
      '**可持續設計顧問**：專修綠建認證 (BEAM Plus、LEED)、能源建模及為發展商和企業提供可持續設計策略。',
      '**學術與研究**：到頂尖學府 (MIT、蘇黎世聯邦理工、Bartlett UCL、AA School) 修讀建築碩士 (MArch、MDes、MSc) 及博士課程。港大建築系在數碼製造及亞洲城市主義研究方面實力雄厚。',
      '**建造及項目管理**：將建築知識應用於主要承建商及發展商的建造管理、工料測量或發展管理職位。'
    ]),
    campus: sect('校園生活與學生體驗', [
      '**主校園 (薄扶林)**：五年均於主校園。建築系位於歷史悠久的主樓及 Knowles 樓，每年級有專用工作室空間。',
      '**製造實驗室**：最先進的數碼製造設施，配備激光切割機、CNC 路由器、3D 打印機及機械人。學生製作實體模型及建築構件原型。',
      '**建築圖書館**：建築圖則、專著及期刊的專門館藏。訂閱 Domus、Architectural Review 及 A+U。',
      '**舍堂生活**：建築學生常選擇聖約翰學院或何東夫人紀念堂，因其創意社群。很多學生為通宵設計工作而在校園附近租住工作室單位。',
      '**建築學會 (ArchSoc)**：舉辦設計工作坊、事務所參觀、慈善建築項目及年度 ArchBall。強大的校友網絡包括香港及國際大型事務所的合伙人。'
    ]),
    competitiveness: sect('入學競爭力分析', [
      '**整體難度**：高 (4/5星)。每年約800-1,000人競爭~80個學額 (入學率約10%)。',
      '**分數分佈**：最高四分位數：Best 5 = 32-34分；中位數：Best 5 = 29-31分；最低四分位數：Best 5 = 27-28分。',
      '**科目加權策略**：最佳選修科 (x1.0) + 數學 (x1.0) + 英文 (x1.0) + 通識/公社 (x1.0) + 中文 (x1.0)。沒有特定科目加權——課程重視具創意及分析能力的全面發展考生。',
      '**作品集及面試比重**：對入圍考生，作品集及面試佔最終決定約30-40%。創意潛質可彌補稍低的分數。',
      '**Band A 優勢**：Band A 第一志願獲優先考慮。第二志願有可行機會。較低 band 有可能但機會較少。',
      '**非聯招途徑**：國際文憑 (IB 36+/45)、GCE A-Level (AAA 包括藝術/設計/數學)。約10-15個學額預留予非聯招申請者，很多具有國際藝術學校背景。'
    ]),
    alumni: sect('知名校友及教職員', [
      '**嚴迅奇教授**：嚴迅奇建築師事務所創始合伙人，香港最具影響力的建築師之一。設計廣東省博物館及戲曲中心。',
      '**呂元祥**：呂元祥建築師事務所創始合伙人，香港可持續設計先驅。設計零碳天地及多個 BEAM Plus 白金級項目。',
      '**林君翰教授**：屢獲殊榮的建築師，以中國鄉村重建項目聞名。獲得 Architectural Review Emerging Architecture Award。',
      '**Joshua Bolchover 教授**：Rural Urban Framework 聯合創始人，以中國農村的社區為本建築介入享譽國際。',
      '**Nasrine Seraji 教授**：前港大建築系系主任，以建築及城市主義的理論工作聞名。曾於哥倫比亞大學及 AA School 任教。'
    ]),
    scholarships: sect('獎學金及經濟援助', [
      '**港大基金入學獎學金**：頒予 DSE 成績優異者。全額或半額學費資助。',
      '**建築系獎學金**：頒予設計卓越、學術表現及對工作室文化貢獻 (每年港幣10,000-30,000元)。',
      '**海外考察旅行資助**：為到東京、巴塞隆拿、羅馬及紐約等城市的建築考察旅行提供資助 (每次最多港幣15,000元)。',
      '**模型製作及材料補貼**：支持學生進行大型實體模型及材料實驗 (每個項目最多港幣5,000元)。',
      '**政府資助及貸款**：NMTSS 每年提供最多港幣33,200元。專上學生資助計劃提供低息貸款。'
    ]),
    tips: sect('Ace Sir 建築學攻略', [
      '**盡早建立作品集**：素描建築物、拍攝有趣空間、製作實體模型、嘗試數碼設計工具。建築是關於展示，不只是說。從中四開始收集作品。',
      '**批判性參觀建築物**：去 PMQ、大館、西九文化區及滙豐總行大廈。不要只看——分析為什麼空間有效、光線如何進入、人們如何穿梭其中。培養你的建築眼光。',
      '**學習基本軟件**：SketchUp、Rhino 或手繪。能夠將空間意念視覺化，會讓你從只會說「喜歡建築」的考生中脫穎而出。YouTube 上有免費教程。',
      '**了解行業現實**：建築不只是設計漂亮建築物。它涉及長工時、緊迫預算、複雜法規及難纏客戶。跟隨建築師實習幾天以了解現實。',
      '**閱讀建築經典**：從 Le Corbusier 的《走向新建築》、Robert Venturi 的《建築的複雜性與矛盾性》及 Juhani Pallasmaa 的《肌膚之眼》開始。這些書會改變你看建築的方式。'
    ])
  })
};

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Added JS6411. Total:', Object.keys(data.programmes).length);
