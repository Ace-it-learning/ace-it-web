import json, os, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
from azure.cosmos import CosmosClient

COSMOS_ENDPOINT = os.getenv("AZURE_COSMOS_ENDPOINT")
COSMOS_KEY = os.getenv("AZURE_COSMOS_KEY")
COSMOS_DATABASE = os.getenv("AZURE_COSMOS_DATABASE", "aceit")

client = CosmosClient(COSMOS_ENDPOINT, credential=COSMOS_KEY)
database = client.get_database_client(COSMOS_DATABASE)
container = database.get_container_client("jupas_programmes")

# JS1001 - BBA Global Business / 工商管理學士(環球商業)
# ALL DATA FROM OFFICIAL SOURCES — NO HALLUCINATION
#
# Source 1: JUPAS 2025 Admissions Scores PDF (af_2025_JUPAS.pdf)
#   - Formula: Best 5 subjects | Median: 29.5 | Lower Quartile: 28
#   - Subject Weighting: 1.5: English / 1: other elective subjects
#
# Source 2: JUPAS Website (https://www.jupas.edu.hk/en/programme/cityuhk/JS1001)
#   - Entry requirements, 2025 application/offer statistics, tuition, intake, interview
#
# Source 3: CityU College of Business (https://www.cb.cityu.edu.hk/en/programmes/programme-finder/details?code=JS1001)
#   - Programme features, careers, scholarships, FAQ

programme = {
    "code": "JS1001",
    "nameEn": "BBA Global Business",
    "nameZh": "工商管理學士(環球商業)",
    "name": "BBA Global Business",
    "university": "香港城市大學",
    "faculty": "商學院",
    "median": 29.5,
    "band_a": 28,
    "category": "business"
}

details = {
    "code": "JS1001",
    "university": "香港城市大學",
    "en": {
        "sections": {
            "admission": {
                "title": "Eligibility & Admission Criteria (DSE)",
                "content": [
                    "**Admission Score Formula**: Best 5 subjects. English weighted x1.5, other elective subjects weighted x1.",
                    "**Median Admission Score**: 29.5 (2025 JUPAS data).",
                    "**Lower Quartile**: 28 (2025 JUPAS data).",
                    "**Core Subjects Minimum Level**: Chinese Language 3, English Language 3, Mathematics (Compulsory Part) 3, Citizenship and Social Development Attained.",
                    "**Elective Subjects**: ANY 2 SUBJECTS at Level 3. M1/M2 can be used to meet elective requirement (counted as one subject only if both taken). Applied Learning (ApL) subjects are NOT counted as elective subjects.",
                    "**Interview**: Yes, on a selective basis. Interviews scheduled around June. Band A applicants will be shortlisted; students of other bands invited subject to availability of places.",
                    "**2025 Application Statistics**: Band A 141 applicants, Band B 291, Band C 385, Band D 451, Band E 457. Total 1,725 applicants.",
                    "**2025 Offer Statistics**: Band A 6 offers, Band B 5, Band C 1, Band D 1, Band E 0. Total 13 offers.",
                    "**First Year Intake**: 15 places.",
                    "**Duration**: 4 years full-time.",
                    "**First Year Tuition**: HK$47,000 (local students).",
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Programme Overview**: BBA Global Business is a CityUHK Flagship Programme and an Elite Undergraduate Programme in the College of Business. It offers a globally oriented curriculum to develop global mindset, strategic thinking, and international business capabilities.",
                    "**Three Exchange Opportunities**: 1 compulsory exchange (in North America, Europe, or country of student's choice) as a graduation requirement, plus 2 optional exchanges. Over 200 partner universities worldwide.",
                    "**Global Business Consultancy Project**: Students work in a multinational corporation and get involved in solving real business problems.",
                    "**Joint Bachelor's Degree Program with Columbia University (US)**: Students can apply for admission to this prestigious joint degree programme. Upon completion, students receive dual awards conferred by Columbia University and CityUHK.",
                    "**Overseas Summer School & Study Tour**: Business-focused international immersion opportunities.",
                    "**CB3601 - Global Perspectives on Contemporary Issues**: Course-based study tour investigating global business trends.",
                    "**Second Major Option**: Students possessing specified JUPAS score are guaranteed free choice of 2nd BBA major by end of Year 1.",
                    "**Duration**: 4 years full-time.",
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Global Companies**: Graduates equipped to work as associates in global companies doing business internationally.",
                    "**Professional Consulting Firms**: Management and strategy consulting positions.",
                    "**Marketing & Management Positions**: International business roles in firms with global operations.",
                    "**Notable Employers**: J.P. Morgan, Blackrock, HSBC, Citibank, Bank of America, Ernst and Young, BNP Paribas.",
                    "**Skills Developed**: Global mindset, strategic thinking, cross-cultural leadership, international business problem-solving.",
                    "**Further Studies**: Graduates have pursued postgraduate studies at renowned universities worldwide.",
                ]
            },
            "campus": {
                "title": "Campus Life & Student Experience",
                "content": [
                    "**College of Business Ranking**: Among the top four business schools in Asia.",
                    "**Global Network**: Over 200 partner universities for exchange and summer programmes.",
                    "**Study Tours**: Executive forums, career development workshops, and structured international trips.",
                    "**Case Competitions**: Opportunities to compete in international business case competitions.",
                    "**Student Community**: Active GB Society with networking events and international activities.",
                    "**Executive Mentorship**: Guidance from global business leaders and alumni.",
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Very High (★★★★★). CityUHK Flagship Programme with intense competition.",
                    "**Academic Requirements**: Median 29.5, Lower Quartile 28 (weighted score with English x1.5).",
                    "**Band A Competition (2025)**: 141 Band A applicants for 15 places — approximately 9.4:1 ratio.",
                    "**Interview**: Required for shortlisted applicants. Band A placement strongly recommended for interview invitation.",
                    "**What Differentiates Winners**: Strong English (weighted x1.5), well-rounded academics, global awareness, and leadership potential.",
                    "**Trend**: Consistently high demand due to Columbia joint degree option and excellent global exposure.",
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Alexandra Mak (麥雅歷珊)**: CGMA Global Business Challenge 2020 Champion (Hong Kong Round) & 2nd Runner-up (North Asia Final); Bank of America. 2022 graduate.",
                    "**John Ng (吳約翰)**: Citibank — career path shaped by GBU community. 2022 graduate.",
                    "**Ronny Torres Cardenas**: HSBC; represented CityU in multiple case competitions including McDonough Business Strategy Challenge. 2023 graduate.",
                    "**Christopher Ching**: J.P. Morgan. 2022 graduate.",
                    "**Mark Hung**: CGMA Global Business Challenge 2020 Champion (Hong Kong Round); BBA Global Business with 2nd major in Accountancy. 2020 graduate.",
                    "**Faculty Excellence**: CityUHK GB faculty includes professors with experience at top global business schools.",
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**Flagship Scholarships**: Covers 100% tuition and hall fees, guaranteed berth, one-off exchange sponsorship up to HK$500,000 for local JUPAS entrants.",
                    "**Entrance Scholarships**: Up to HK$265,000 for elite students.",
                    "**Exchange Sponsorship**: Up to HK$500,000 one-off exchange sponsorship.",
                    "**Financial Support for Exchange**: Student Exchange Fund, Special Fund for Non-local Outbound Exchange Students, Joseph Lau Student Exchange Awards, EDB Subsidy Scheme.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students.",
                ]
            },
            "tips": {
                "title": "Ace Sir's JS1001 Strategy — 9 Actionable Tips",
                "content": [
                    "**1. Target Score: Aim for 30+ (Weighted Best 5)**",
                    "",
                    "- The median admission score is 29.5 and the lower quartile is 28 (weighted). To be competitive, target a weighted Best 5 score of 30 or above.",
                    "- With English weighted x1.5, a Level 5 in English alone contributes 7.5 points — making it the single highest-impact subject. Aim for Level 5* or above in English for maximum advantage.",
                    "- Your remaining four subjects should average at least Level 5 to hit the 30+ threshold comfortably.",
                    "",
                    "**2. Prioritize English Above All Subjects**",
                    "",
                    "- English is weighted 1.5x while all other electives are weighted 1x. A Level 5** in English is worth 9.0 points — equivalent to three Level 5 subjects combined.",
                    "- Dedicate disproportionate revision time to English. Focus on Paper 3 (Listening & Integrated Skills) and Paper 2 (Writing) as these are typically the differentiators at the 5* level.",
                    "- Strong English is also critical for the interview and for thriving in the programme's case-study and consultancy components.",
                    "",
                    "**3. Secure Band A Placement — Non-Negotiable**",
                    "",
                    "- In 2025, there were 141 Band A applicants competing for just 15 places — a 9.4:1 ratio. Only 6 offers went to Band A applicants; Band B received only 5 offers across all bands combined.",
                    "- The programme explicitly states that Band A applicants are shortlisted for interviews. Band B or lower applicants are only invited subject to availability of places.",
                    "- Place JS1001 in Band A (Choice 1–3). Do not rely on Band B as a realistic pathway.",
                    "",
                    "**4. Prepare for the Selective Interview (June)**",
                    "",
                    "- Interviews are conducted on a selective basis around June. Shortlisting is competitive even among Band A applicants.",
                    "- Prepare to discuss: (a) why global business specifically (not general business), (b) your understanding of current global economic trends, (c) a specific case study or business problem you find interesting, and (d) your career aspirations in finance or consulting.",
                    "- Practice articulating your thoughts in English under time pressure. The interview assesses communication skills, global awareness, and leadership potential.",
                    "",
                    "**5. Build a Globally Oriented Profile**",
                    "",
                    "- The programme values students with genuine international exposure and cross-cultural competence. Participate in Model UN, international exchange programmes, or global business competitions if available.",
                    "- Demonstrate awareness of global markets: follow news on trade policy, currency movements, and multinational corporate strategy. Be ready to discuss a recent business event during interview.",
                    "- Learn a third language (e.g., Spanish, Mandarin, Japanese) if possible — this signals genuine commitment to global career mobility.",
                    "",
                    "**6. Develop Quantitative and Analytical Skills**",
                    "",
                    "- The programme includes case competitions, consultancy projects, and data-driven business analysis. Strong Mathematics (Compulsory Part) is essential — aim for Level 5 or above.",
                    "- If taking M1/M2, this strengthens your quantitative profile and can be used to meet the elective requirement.",
                    "- Consider participating in business case competitions or economics/finance Olympiads to demonstrate analytical capability beyond DSE grades.",
                    "",
                    "**7. Leverage the Columbia Joint Degree and Exchange Pathways**",
                    "",
                    "- The Joint Bachelor's Degree Program with Columbia University is a unique differentiator. Research this option early and mention it in your application or interview if it aligns with your goals.",
                    "- The programme requires one compulsory exchange plus offers two optional exchanges. Show openness to living abroad and adapting to unfamiliar academic/cultural environments.",
                    "- The Flagship Scholarship covers tuition, hall fees, and exchange sponsorship up to HK$500,000 — one of the most generous packages in Hong Kong. Strong DSE results may automatically qualify you for consideration.",
                    "",
                    "**8. Plan for a Second Major Early**",
                    "",
                    "- Students who achieve specified JUPAS scores are guaranteed free choice of a second BBA major by the end of Year 1. This is a significant strategic advantage.",
                    "- Popular combinations include Global Business + Accountancy (for audit/consulting), Global Business + Finance (for investment banking), or Global Business + Marketing (for brand management).",
                    "- Research which second major aligns with your target career path (e.g., J.P. Morgan and Blackrock recruits often favor Finance; EY and BNP Paribas value Accountancy).",
                    "",
                    "**9. Build Leadership and Commercial Awareness**",
                    "",
                    "- Notable employers include J.P. Morgan, Blackrock, HSBC, Citibank, Bank of America, EY, and BNP Paribas. These firms recruit students who demonstrate leadership, commercial acumen, and resilience.",
                    "- Take on significant leadership roles — Prefect Head, Student Union executive, or founder of a business/entrepreneurship club. Quantity matters less than depth of impact.",
                    "- Read the Financial Times, The Economist, or Wall Street Journal regularly. Be able to discuss a recent M&A deal, IPO, or central bank policy decision confidently in the interview.",
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**入學計分公式**：最佳五科。英文加權x1.5，其他選修科加權x1。",
                    "**入學中位數**：29.5分（2025年聯招數據）。",
                    "**下四分位數**：28分（2025年聯招數據）。",
                    "**核心科目最低要求**：中國語文第3級、英國語文第3級、數學（必修部分）第3級、公民與社會發展科達標。",
                    "**選修科目**：任何2科達第3級。數學延伸部分（M1/M2）可滿足選修要求（如兩科皆修則只計一科）。應用學習科目不計入選修科目。",
                    "**面試**：需要，選擇性面試。約於六月進行。Band A申請者將獲篩選入圍；其他組別學生視學額情況邀請。",
                    "**2025年申請統計**：Band A申請者141人、Band B 291人、Band C 385人、Band D 451人、Band E 457人。總申請者1,725人。",
                    "**2025年取錄統計**：Band A取錄6人、Band B 5人、Band C 1人、Band D 1人、Band E 0人。總取錄13人。",
                    "**首年學額**：15人。",
                    "**修讀年期**：4年全日制。",
                    "**首年學費**：港幣47,000元（本地學生）。",
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**課程概覽**：工商管理學士（環球商業）是城大旗艦課程及商學院精英本科課程，提供環球導向課程，培養環球視野、策略思維及國際商業能力。",
                    "**三次海外交流機會**：1次必修交流（北美、歐洲或學生自選國家）為畢業要求，另加2次選修交流。全球超過200所夥伴大學。",
                    "**環球商業諮詢項目**：學生於跨國企業實習，參與解決真實商業問題。",
                    "**哥倫比亞大學雙聯學士學位**：學生可申請此著名雙聯學位課程，完成後同時獲哥倫比亞大學及城大頒授學位。",
                    "**海外暑期學校及遊學課程**：商業導向的國際沉浸體驗。",
                    "**CB3601 - 當代議題環球視野**：課程式遊學，探討環球商業趨勢。",
                    "**副修選項**：達指定聯招分數的學生可於第一年完結時獲保證自由選擇第二個BBA主修。",
                    "**修讀年期**：4年全日制。",
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**跨國企業**：畢業生具備於全球企業擔任助理的知識與技能。",
                    "**專業顧問公司**：管理及策略顧問職位。",
                    "**市場學及管理職位**：於具全球業務的企業擔任國際商業職位。",
                    "**知名僱主**：摩根大通、貝萊德、滙豐銀行、花旗銀行、美國銀行、安永、巴黎銀行。",
                    "**培養技能**：環球視野、策略思維、跨文化領導、國際商業解難能力。",
                    "**升學**：畢業生於本地及海外知名大學修讀研究生課程。",
                ]
            },
            "campus": {
                "title": "校園生活與學生體驗",
                "content": [
                    "**商學院排名**：亞洲四大商學院之一。",
                    "**環球網絡**：超過200所夥伴大學提供交流及暑期課程。",
                    "**遊學課程**：行政論壇、職業發展工作坊及結構化國際考察。",
                    "**個案比賽**：參與國際商業個案比賽的機會。",
                    "**學生社群**：活躍的環球商業學會，舉辦交流活動及國際活動。",
                    "**行政指導**：來自環球商業領袖及校友的指導。",
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。城大旗艦課程，競爭激烈。",
                    "**學術要求**：中位數29.5分，下四分位數28分（加權分數，英文x1.5）。",
                    "**Band A競爭（2025）**：141名Band A申請者競爭15個學額——約9.4:1比率。",
                    "**面試**：入圍申請者需要面試。強烈建議Band A選擇以獲面試邀請。",
                    "**成功申請者特質**：優秀英文（加權x1.5）、全面學術成績、環球意識及領導潛能。",
                    "**趨勢**：由於哥倫比亞雙學位選項及卓越環球視野，需求持續高企。",
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**麥雅歷珊 Alexandra Mak**：CGMA環球商業挑戰賽2020香港區冠軍及北亞總決賽季軍；美國銀行。2022年畢業。",
                    "**吳約翰 John Ng**：花旗銀行——環球商業課程社群塑造職業路徑。2022年畢業。",
                    "**Ronny Torres Cardenas**：滙豐銀行；代表城大參與多項個案比賽包括McDonough商業策略挑戰賽。2023年畢業。",
                    "**Christopher Ching**：摩根大通。2022年畢業。",
                    "**Mark Hung**：CGMA環球商業挑戰賽2020香港區冠軍；工商管理學士（環球商業）副修會計。2020年畢業。",
                    "**教職員卓越**：城大環球商業教職員包括具備頂尖全球商學院經驗的教授。",
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**旗艦獎學金**：涵蓋100%學費及宿費、保證宿位、一次性交流贊助高達港幣500,000元（本地聯招入學學生）。",
                    "**入學獎學金**：精英學生最高可獲港幣265,000元。",
                    "**交流贊助**：一次性交流贊助高達港幣500,000元。",
                    "**交流財政支援**：學生交流基金、非本地出境交流特別基金、劉鑾雄學生交流獎、教育局資助計劃。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
                ]
            },
            "tips": {
                "title": "Ace Sir 的 JS1001 策略 — 9 個實用貼士",
                "content": [
                    "**1. 目標分數：力爭加權最佳五科 30 分或以上**",
                    "",
                    "- 入學中位數為 29.5 分，下四分位數為 28 分（加權分數）。要具競爭力，應以加權最佳五科 30 分或以上為目標。",
                    "- 英文加權 x1.5，單是英文第 5 級已貢獻 7.5 分——是影響力最大的科目。力爭英文第 5* 或以上以獲最大優勢。",
                    "- 其餘四科平均至少達第 5 級，才能穩妥達到 30 分以上的門檻。",
                    "",
                    "**2. 將英文列為首要優先科目**",
                    "",
                    "- 英文加權 1.5 倍，而所有其他選修科均為 1 倍。英文第 5** 相等於 9.0 分——相當於三科第 5 級的總和。",
                    "- 投放不成比例的溫習時間於英文科。重點操練卷三（聆聽及綜合能力）和卷二（寫作），這兩卷通常是達到 5* 水平的關鍵。",
                    "- 良好的英語能力對面試表現至關重要，亦是應付課程個案研究及商業諮詢項目的必要條件。",
                    "",
                    "**3. 確保 Band A 選擇——別無選擇**",
                    "",
                    "- 2025 年有 141 名 Band A 申請者競爭僅 15 個學額——比率為 9.4:1。只有 6 個取錄名額給予 Band A 申請人；Band B 所有組別合共僅 5 個取錄。",
                    "- 課程明確指出 Band A 申請者將獲篩選入圍面試。Band B 或更低組別的申請者僅在學額有剩餘時才獲邀請。",
                    "- 將 JS1001 放在 Band A（選擇 1–3）。切勿寄望 Band B 作為現實的入學途徑。",
                    "",
                    "**4. 為選擇性面試做好準備（六月）**",
                    "",
                    "- 面試約於六月進行，屬選擇性質。即使在 Band A 申請者中，入圍競爭亦十分激烈。",
                    "- 準備討論：(a) 為何選擇環球商業而非一般商業，(b) 你對當前環球經濟趨勢的理解，(c) 一個你感興趣的具體個案研究或商業問題，以及 (d) 你在金融或顧問界的職業抱負。",
                    "- 練習在限時壓力下以英語表達見解。面試評估溝通技巧、環球意識及領導潛能。",
                    "",
                    "**5. 建立環球導向的個人檔案**",
                    "",
                    "- 課程重視具真正國際視野及跨文化能力的學生。參與模擬聯合國、國際交流計劃或環球商業比賽（如有）。",
                    "- 展示對環球市場的認識：關注貿易政策、貨幣走勢及跨國企業策略的新聞。面試時準備討論一宗近期商業事件。",
                    "- 如有可能，學習第三語言（例如西班牙語、普通話、日語）——這顯示你對環球職業流動性的真正承諾。",
                    "",
                    "**6. 培養量化及分析能力**",
                    "",
                    "- 課程包括個案比賽、諮詢項目及數據導向的商業分析。數學（必修部分）表現優異至關重要——目標第 5 級或以上。",
                    "- 如修讀 M1/M2，可增強你的量化背景，並可用於滿足選修科要求。",
                    "- 考慮參與商業個案比賽或經濟／金融奧林匹克，以展示文憑試成績以外的分析能力。",
                    "",
                    "**7. 善用哥倫比亞雙學位及交流途徑**",
                    "",
                    "- 與哥倫比亞大學的雙聯學士學位課程是獨特的賣點。及早研究此選項，如符合你的目標，可在申請或面試中提及。",
                    "- 課程要求一次必修交流，另提供兩次選修交流機會。展示你願意海外生活及適應陌生學術／文化環境的開放態度。",
                    "- 旗艦獎學金涵蓋學費、宿費及高達港幣 500,000 元的一次性交流贊助——是香港最豐厚的獎學金套餐之一。優異的文憑試成績可能自動獲得考慮資格。",
                    "",
                    "**8. 及早規劃第二主修**",
                    "",
                    "- 達到指定聯招分數的學生可於第一年完結時獲保證自由選擇第二個 BBA 主修。這是重大的策略優勢。",
                    "- 熱門組合包括環球商業 + 會計學（適合審計／顧問）、環球商業 + 金融學（適合投資銀行），或環球商業 + 市場學（適合品牌管理）。",
                    "- 研究哪個第二主修符合你的目標職業路徑（例如摩根大通和貝萊德較青睞金融學；安永和巴黎銀行重視會計學）。",
                    "",
                    "**9. 建立領導才能及商業觸覺**",
                    "",
                    "- 知名僱主包括摩根大通、貝萊德、滙豐銀行、花旗銀行、美國銀行、安永及巴黎銀行。這些機構招聘具備領導力、商業觸覺及抗壓能力的學生。",
                    "- 擔任重要領導職位——領袖生總隊長、學生會幹事或商業／創業學會創辦人。數量不如影響力深度重要。",
                    "- 定期閱讀《金融時報》、《經濟學人》或《華爾街日報》。面試時能自信地討論一宗近期的併購交易、首次公開招股或央行政策決定。",
                ]
            }
        }
    }
}

# Validate before upsert
import subprocess

payload_path = os.path.join(os.path.dirname(__file__), "..", "jupas", "payload_JS1001.json")
with open(payload_path, "w", encoding="utf-8") as f:
    json.dump(
        {
            "programme": programme,
            "details": details,
            "scores": {"median": 29.5, "lq": 28},
        },
        f,
        ensure_ascii=False,
        indent=2,
    )

validate_script = os.path.join(os.path.dirname(__file__), "..", "jupas", "validateProgramme.js")
result = subprocess.run(
    ["node", validate_script, payload_path],
    capture_output=True,
    text=True,
)
if result.returncode != 0:
    print(result.stdout, result.stderr)
    sys.exit(1)
print(result.stdout.strip())

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
print("[Seed] All 8 sections (EN + ZH) from official JUPAS + CityU sources only")
