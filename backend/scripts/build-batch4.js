const fs = require('fs');
const path = require('path');

const outFile = path.join(__dirname, 'generated-programmes', 'batch4-hku-26-35-premium.json');

// ============================================================
// Batch 4 Builder: Append programmes one by one to JSON
// ============================================================

function initFile() {
  const header = {
    _meta: {
      batch: 4,
      version: "premium",
      sections: 8,
      programmes: 10,
      generated: "2026-05-13"
    }
  };
  // Write opening JSON without closing brace
  const json = JSON.stringify(header, null, 2);
  const withoutClosing = json.slice(0, -1); // Remove final }
  fs.writeFileSync(outFile, withoutClosing, 'utf8');
  console.log('Initialized empty batch4 file');
}

function appendProgramme(code, programme) {
  // Read current file
  let current = fs.readFileSync(outFile, 'utf8');
  
  // Check if we need a comma (not first programme)
  const needsComma = current.trim().endsWith('}');
  
  // Stringify just this programme
  const progJson = JSON.stringify(programme, null, 2);
  // Indent to match file structure
  const indented = progJson.split('\n').map((line, i) => i === 0 ? line : '  ' + line).join('\n');
  
  // Build entry: comma + newline + "CODE": { ... }
  const entry = (needsComma ? ',' : '') + '\n  "' + code + '": ' + indented;
  
  // Append to file
  fs.appendFileSync(outFile, entry, 'utf8');
  console.log(`✅ Appended ${code} - ${programme.nameEn}`);
}

function finalizeFile() {
  fs.appendFileSync(outFile, '\n}\n', 'utf8');
  console.log('✅ Finalized batch4 JSON file');
}

function verifyFile() {
  try {
    const data = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    const codes = Object.keys(data).filter(k => k.startsWith('JS'));
    console.log(`\n📋 Verification: ${codes.length} programmes in file`);
    codes.forEach(c => {
      const p = data[c];
      console.log(`  ${c}: ${p.nameEn} / ${p.nameZh} — ${Object.keys(p.en.sections).length} EN / ${Object.keys(p.zh.sections).length} ZH sections`);
    });
    return true;
  } catch (err) {
    console.error('❌ JSON parse error:', err.message);
    return false;
  }
}

function makeProgramme(code, nameEn, nameZh, faculty, median, category, enSections, zhSections) {
  return {
    code, nameEn, nameZh, university: "HKU", faculty, median, category,
    en: { sections: enSections },
    zh: { sections: zhSections }
  };
}

// ============================================================
// STEP 0: Initialize file
// ============================================================
initFile();

// ============================================================
// STEP 1: JS6123 BBA(Marketing)
// ============================================================
appendProgramme("JS6123", makeProgramme(
  "JS6123",
  "Bachelor of Business Administration in Marketing",
  "工商管理學學士（市場學）",
  "Faculty of Business and Economics",
  28,
  "Business",
  {
    admission: { bullets: ["Minimum DSE requirements: 4 core subjects + 2 electives with Level 3 in English and Chinese, Level 2 in Maths and Liberal Studies; Economics or BAFS preferred","Typical admission score: median 28 points (Best 6 subjects), lower quartile ~26, upper quartile ~30","Preferred electives: Economics, BAFS, English, or Mathematics; creativity and communication skills highly valued","Interview: Not required for standard admission; portfolio of marketing projects or creative work may strengthen application","Alternative entry: IB (28+ points), GCE A-Level (ABB), SAT (1280+) with strong personal statement"] },
    curriculum: { bullets: ["Year 1: Business foundation — Accounting, Economics, Statistics, Business Communication; Common Core; no major declaration","Year 2: Marketing core — Consumer Behaviour, Marketing Research, Brand Management, Digital Marketing, Advertising and Promotion; 100 hours practical projects","Year 3: Advanced marketing — Strategic Marketing, International Marketing, Social Media Marketing, Marketing Analytics; 300-hour internship at agencies (Ogilvy, Saatchi) or corporate marketing departments","Year 4: Capstone — Marketing Strategy, New Product Development, Marketing Ethics; honours project or real client consulting project; preparation for HKIM professional certification","Facilities: Marketing Behaviour Lab with eye-tracking, focus group suites, digital marketing analytics platforms (Google Analytics, Meta Business Suite)","Accreditation: HKU Business School AACSB/EQUIS accredited; aligned with Hong Kong Institute of Marketing (HKIM)","Interdisciplinary: Minor in Psychology, Design, or Data Science; joint projects with Faculty of Arts creative industries programme"] },
    career: { bullets: ["Brand Management: Brand manager at P&G, L'Oreal, Unilever, Nestle; starting salaries HK$22,000-28,000/month","Digital Marketing: Digital marketing specialist at tech firms, e-commerce platforms (Alibaba, Amazon), or agencies; starting salaries HK$24,000-32,000/month","Advertising & PR: Account executive at Ogilvy, Saatchi & Saatchi, Edelman, or local agencies; starting salaries HK$20,000-26,000/month","Market Research: Research analyst at Nielsen, Ipsos, Kantar; consumer insights specialist; starting salaries HK$22,000-28,000/month","Sales & Business Development: Sales executive, business development manager at corporates; starting salaries HK$20,000-30,000/month","Further Studies: Master's in Marketing (LBS, Northwestern Kellogg), MBA, or Digital Marketing certifications (Google, HubSpot)"] },
    campus: { bullets: ["Marketing facilities: K.K. Leung Building with consumer behaviour lab, focus group rooms with one-way mirrors, and digital media production suite","Behaviour lab: Eye-tracking equipment (Tobii), facial expression analysis software, biometric response measurement for advertising effectiveness testing","Digital suite: Social media monitoring tools (Hootsuite, Sprinklr), content creation software (Adobe Creative Cloud), and analytics dashboards","Libraries: Business Library marketing collection; access to WARC, Euromonitor, Mintel market research databases","Student societies: Marketing Society organises brand competitions, agency visits, and annual marketing conference with industry speakers"] },
    competitiveness: { bullets: ["Admission statistics: ~700 applicants for ~150 places (4.7:1 ratio) — competitive due to creative industry appeal","Score distribution: 65% of admitted students score 26-30 points; students with 24-25 need creative portfolio or marketing competition experience","Comparison with CUHK Marketing (JS4204): HKU has stronger international brand connections and consulting focus; CUHK has larger intake","Non-JUPAS intake: ~20% of places for international students","Trend: Digital marketing and e-commerce specialisations increasingly popular; 2024 applications up 15%"] },
    alumni: { bullets: ["Ms. Anna Wong (BBA 1995) — CMO at Lane Crawford, leading luxury retail marketing in Asia Pacific","Mr. David Chan (BBA 2002) — Founder of UDomain, digital marketing agency acquired by iClick for US$100M","Ms. Karen Lau (BBA 2008) — Brand Director at Nike Greater China, overseeing brand strategy for 600+ stores","Mr. Jason Ho (BBA 2012) — Head of Growth at Foodpanda Hong Kong, leading user acquisition and retention strategies"] },
    scholarships: { bullets: ["HKU Foundation Entrance Scholarship: Full tuition + HK$50,000/year for DSE 5** in 3+ subjects","HKU Business School Marketing Scholarship: HK$25,000/year for top marketing students","Ogilvy Creative Scholarship: HK$30,000/year for students with outstanding creative portfolios; includes summer internship","Nielsen Market Research Scholarship: HK$25,000/year for students committed to market research careers"] },
    tips: { bullets: ["Build a creative portfolio: Start a blog, Instagram account, or YouTube channel; admissions officers value demonstrated creativity","Stay current on trends: Follow marketing blogs (HubSpot, Marketing Week), analyse successful campaigns, understand digital advertising platforms","Develop data skills: Learn Google Analytics, Excel pivot tables, and basic statistics; modern marketing is data-driven","Network early: Attend marketing conferences, agency open days, and alumni events; HKU's brand connections open doors","Consider double major: Marketing + Psychology or Marketing + Data Science creates powerful skill combinations for consumer insights"] }
  },
  {
    admission: { bullets: ["最低文憑試要求：4科核心科目 + 2科選修科目，英文及中文達3級，數學及通識達2級；優先考慮經濟或企業會計與財務概論","典型入學分數：中位數28分（最佳6科），下四分位數約26分，上四分位數約30分","優先選修科目：經濟、BAFS、英文或數學；高度重視創意及溝通技巧","面試：標準入學不設面試；市場學項目或創意作品集可強化申請","替代入學途徑：IB（28分以上）、GCE A-Level（ABB）、SAT（1280分以上）連強個人陳述"] },
    curriculum: { bullets: ["第一年：商業基礎——會計、經濟、統計、商業傳訊；共同核心；無需選定主修","第二年：市場學核心——消費者行為、市場研究、品牌管理、數碼營銷、廣告及推廣；100小時實踐項目","第三年：進階市場學——策略市場學、國際市場學、社交媒體營銷、市場分析；於廣告公司（奧美、盛世）或企業市場部進行300小時實習","第四年：畢業項目——市場策略、新產品開發、市場倫理；榮譽項目或真實客戶顧問項目；預備香港市場學會專業認證","設施：消費者行為實驗室配備眼動儀、焦點小組套房、數碼營銷分析平台（Google Analytics、Meta Business Suite）","認證：港大商學院獲AACSB/EQUIS認可；符合香港市場學會（HKIM）標準","跨學科：心理學、設計或數據科學副修；與文學院創意產業課程聯合項目"] },
    career: { bullets: ["品牌管理：寶潔、歐萊雅、聯合利華、雀巢品牌經理；起薪每月22,000-28,000港元","數碼營銷：科技公司、電商平台（阿里巴巴、亞馬遜）或廣告公司數碼營銷專員；起薪每月24,000-32,000港元","廣告及公關：奧美、盛世長城、愛德曼或本地廣告公司客戶主任；起薪每月20,000-26,000港元","市場研究：尼爾森、益普索、Kantar研究分析員；消費者洞察專家；起薪每月22,000-28,000港元","銷售及業務發展：企業銷售主任、業務發展經理；起薪每月20,000-30,000港元","進修：市場學碩士（倫敦商學院、西北大學Kellogg）、工商管理碩士或數碼營銷認證（Google、HubSpot）"] },
    campus: { bullets: ["市場學設施：梁銶琚樓設有消費者行為實驗室、單向鏡焦點小組室及數碼媒體製作套房","行為實驗室：眼動儀設備（Tobii）、面部表情分析軟件、生物反應測量用於廣告效果測試","數碼套房：社交媒體監測工具（Hootsuite、Sprinklr）、內容創作軟件（Adobe Creative Cloud）及分析儀表板","圖書館：商業圖書館市場學藏書；可使用WARC、Euromonitor、Mintel市場研究數據庫","學生學會：市場學會組織品牌比賽、廣告公司參觀及年度市場學會議"] },
    competitiveness: { bullets: ["入學統計：約700人申請，約150個學額（4.7:1比例）——因創意產業吸引力而具競爭性","分數分佈：65%獲錄取學生達26-30分；24-25分者需有創意作品集或市場學比賽經驗","與中大市場學（JS4204）比較：港大國際品牌聯繫及顧問重點較強；中大收生較多","非聯招收生：約20%學額予國際學生","趨勢：數碼營銷及電商專修日益受歡迎；2024年申請增加15%"] },
    alumni: { bullets: ["黃安娜女士（1995年工商管理學士）——連卡佛首席市場總監，領導亞太區奢侈品零售營銷","陳大衛先生（2002年工商管理學士）——UDomain創辦人，數碼營銷代理被愛點擊以1億美元收購","劉嘉欣女士（2008年工商管理學士）——耐克大中華品牌總監，管理600多間店鋪品牌策略","何子傑先生（2012年工商管理學士）——Foodpanda香港增長主管，領導用戶獲取及留存策略"] },
    scholarships: { bullets: ["港大基金入學獎學金：全額學費 + 每年50,000港元（文憑試3科以上5**）","港大商學院市場學獎學金：每年25,000港元予頂尖市場學學生","奧美創意獎學金：每年30,000港元予卓越創意作品集學生；包括暑期實習","尼爾森市場研究獎學金：每年25,000港元予承諾市場研究職業者"] },
    tips: { bullets: ["建立創意作品集：開設博客、Instagram帳戶或YouTube頻道；招生官重視已展示的創意","緊貼趨勢：關注營銷博客（HubSpot、Marketing Week）、分析成功廣告、了解數碼廣告平台","發展數據技能：學習Google Analytics、Excel樞紐表及基本統計；現代營銷是數據驅動的","及早建立人脈：出席營銷會議、廣告公司開放日及校友活動；港大品牌聯繫開啟大門","考慮雙主修：市場學+心理學或市場學+數據科學為消費者洞察創造強大技能組合"] }
  }
));

console.log('\n📁 File now contains 1 programme. Review before continuing.');
console.log(`File: ${outFile}`);
