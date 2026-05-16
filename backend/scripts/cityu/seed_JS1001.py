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
# Data sources:
# - JUPAS 2025 Admissions Scores PDF (af_2025_JUPAS.pdf): Median 29.5, Lower Quartile 28
# - JUPAS Website: Entry requirements, application/offer statistics
# - CityU College of Business (cb.cityu.edu.hk/js1001): Programme features, careers, scholarships, FAQ

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
                    "**Admission Score Formula**: Best 5 subjects (include English and other elective subjects). English weighted ×1.5, other elective subjects weighted ×1.",
                    "**Median Admission Score**: 29.5 (2025 JUPAS data).",
                    "**Lower Quartile**: 28 (2025 JUPAS data).",
                    "**Core Subjects Minimum Level**: Chinese Language 3, English Language 3, Mathematics (Compulsory Part) 3, Citizenship and Social Development Attained.",
                    "**Elective Subjects**: ANY 2 SUBJECTS at Level 3. M1/M2 can be used to meet elective requirement (counted as one subject only if both taken). Applied Learning (ApL) subjects are NOT counted as elective subjects.",
                    "**Interview**: Yes, for shortlisted applicants only. Interviews scheduled around June. Band A applicants will be shortlisted; students of other bands invited subject to availability of places.",
                    "**2025 Application Statistics**: Band A 141 applicants, Total 1,725 applicants, 13 offers made.",
                    "**First Year Tuition**: HK$47,000."
                ]
            },
            "curriculum": {
                "title": "Programme Structure & Curriculum",
                "content": [
                    "**Programme Overview**: BBA Global Business is a Flagship Programme in CityUHK and an Elite Undergraduate Programme in the College of Business. It offers a globally oriented curriculum to develop global mindset, strategic thinking, and international business capabilities.",
                    "**Global Business Consultancy Project**: Students work in a multinational corporation and get involved in solving real business problems.",
                    "**Three Exchange Opportunities**: 1 compulsory exchange (in North America or Europe or country of student's choice) as a graduation requirement, plus 2 optional exchanges. Over 200 partner universities worldwide.",
                    "**Joint Bachelor's Degree Program with Columbia University (US)**: Students can apply for admission to this prestigious joint degree programme. Upon completion, students receive dual awards conferred by Columbia University and CityUHK.",
                    "**Overseas Summer School & Study Tour**: Business-focused international immersion opportunities.",
                    "**CB3601 - Global Perspectives on Contemporary Issues**: Course-based study tour investigating global business trends (e.g., Singapore Management University in 2024).",
                    "**Second Major Option**: Students can customise their study plan with a second major of interest. Students possessing specified JUPAS score are guaranteed free choice of 2nd BBA major by end of Year 1.",
                    "**Duration**: 4 years full-time."
                ]
            },
            "career": {
                "title": "Career Pathways & Prospects",
                "content": [
                    "**Global Companies**: Graduates equipped to work as associates in global companies doing business internationally.",
                    "**Professional Consulting Firms**: Management and strategy consulting positions.",
                    "**Marketing & Management Positions**: International business roles in firms with global operations.",
                    "**Notable Employers**: J.P. Morgan, Blackrock, HSBC, Citibank, Bank of America, Ernst and Young, BNP Paribas.",
                    "**Skills Developed**: Global mindset, strategic thinking, cross-cultural leadership, international business problem-solving."
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
                    "**Executive Mentorship**: Guidance from global business leaders and alumni."
                ]
            },
            "competitiveness": {
                "title": "Admission Competitiveness Analysis",
                "content": [
                    "**Overall Level**: Very High (★★★★★). CityUHK Flagship Programme with intense competition.",
                    "**Academic Requirements**: Median 29.5, Lower Quartile 28 (weighted score with English ×1.5).",
                    "**Band A Competition**: 141 Band A applicants for 13 places in 2025 — approximately 11:1 ratio.",
                    "**Interview**: Required for shortlisted applicants. Band A placement strongly recommended for interview invitation.",
                    "**What Differentiates Winners**: Strong English (weighted ×1.5), well-rounded academics, global awareness, and leadership potential.",
                    "**Trend**: Consistently high demand due to Columbia joint degree option and excellent global exposure."
                ]
            },
            "alumni": {
                "title": "Notable Alumni & Faculty",
                "content": [
                    "**Global Leaders**: Alumni in senior management at multinational corporations.",
                    "**Finance Executives**: Graduates at top investment banks and asset management firms.",
                    "**Consulting Professionals**: Alumni at major international consulting firms.",
                    "**Entrepreneurs**: Founders of cross-border businesses.",
                    "**Faculty Excellence**: CityUHK GB faculty includes professors with experience at top global business schools."
                ]
            },
            "scholarships": {
                "title": "Scholarships & Financial Aid",
                "content": [
                    "**Entrance Scholarships**: Up to HK$265,000 for elite students.",
                    "**Flagship Scholarships**: 100% Tuition and Hall Fees OR 50% Tuition and Hall Fees.",
                    "**Exchange Sponsorship**: Up to HK$500,000 one-off exchange sponsorship for Local JUPAS entrants.",
                    "**Financial Support for Exchange**: Student Exchange Fund, Special Fund for Non-local Outbound Exchange Students, Joseph Lau Student Exchange Awards, EDB Subsidy Scheme, Scholarships in Support of Student Exchange Programme.",
                    "**CityUHK Temporary Student Loan**: Available for outbound exchange studies.",
                    "**Government Aid**: TSFS and NLSPS available for eligible local students."
                ]
            },
            "tips": {
                "title": "Ace Sir's CityU Global Business Strategy",
                "content": [
                    "**Score Targeting**: Aim for weighted Best 5 of 30+. English is critical (×1.5 weighting) — aim for Level 5 or above.",
                    "**Band A Essential**: With 141 Band A applicants for 13 places, Band A placement is crucial for interview invitation.",
                    "**Prepare for Interview**: Shortlisted applicants are interviewed around June. Practice discussing global issues, career aspirations, and motivation for international business.",
                    "**Develop Global Mindset**: Show interest in international affairs, different cultures, and global business trends.",
                    "**Build Leadership**: Take on significant leadership roles in school or community.",
                    "**Consider Columbia Option**: Research the Joint Bachelor's Degree Program with Columbia University if interested in an Ivy League credential.",
                    "**Explore Second Major**: Plan early for declaring a second BBA major to broaden career options."
                ]
            }
        }
    },
    "zh": {
        "sections": {
            "admission": {
                "title": "入學要求與計分詳情 (DSE)",
                "content": [
                    "**入學計分公式**：最佳五科（包括英文及其他選修科）。英文加權×1.5，其他選修科加權×1。",
                    "**入學中位數**：29.5分（2025年聯招數據）。",
                    "**下四分位數**：28分（2025年聯招數據）。",
                    "**核心科目最低要求**：中國語文第3級、英國語文第3級、數學（必修部分）第3級、公民與社會發展科達標。",
                    "**選修科目**：任何2科達第3級。數學延伸部分（M1/M2）可滿足選修要求（如兩科皆修則只計一科）。應用學習科目不計入選修科目。",
                    "**面試**：需要，僅限入圍申請者。面試約於六月進行。Band A申請者將獲篩選入圍；其他組別學生視學額情況邀請。",
                    "**2025年申請統計**：Band A申請者141人，總申請者1,725人，錄取13人。",
                    "**首年學費**：港幣47,000元。"
                ]
            },
            "curriculum": {
                "title": "課程結構與內容",
                "content": [
                    "**課程概覽**：工商管理學士（環球商業）是城大旗艦課程及商學院精英本科課程，提供環球導向課程，培養環球視野、策略思維及國際商業能力。",
                    "**環球商業諮詢項目**：學生於跨國企業實習，參與解決真實商業問題。",
                    "**三次海外交流機會**：1次必修交流（北美、歐洲或學生自選國家）為畢業要求，另加2次選修交流。全球超過200所夥伴大學。",
                    "**哥倫比亞大學雙聯學士學位**：學生可申請此著名雙聯學位課程，完成後同時獲哥倫比亞大學及城大頒授學位。",
                    "**海外暑期學校及遊學課程**：商業導向的國際沉浸體驗。",
                    "**CB3601 - 當代議題環球視野**：課程式遊學，探討環球商業趨勢（例如2024年前往新加坡管理大學）。",
                    "**副修選項**：學生可自訂學習計劃，選修副修。達指定聯招分數的學生可於第一年完結時獲保證自由選擇第二個BBA主修。",
                    "**修讀年期**：4年全日制。"
                ]
            },
            "career": {
                "title": "職業前景與出路",
                "content": [
                    "**跨國企業**：畢業生具備於全球企業擔任助理的知識與技能。",
                    "**專業顧問公司**：管理及策略顧問職位。",
                    "**市場學及管理職位**：於具全球業務的企業擔任國際商業職位。",
                    "**知名僱主**：摩根大通、貝萊德、滙豐銀行、花旗銀行、美國銀行、安永、巴黎銀行。",
                    "**培養技能**：環球視野、策略思維、跨文化領導、國際商業解難能力。"
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
                    "**行政指導**：來自環球商業領袖及校友的指導。"
                ]
            },
            "competitiveness": {
                "title": "入學競爭力分析",
                "content": [
                    "**整體程度**：極高（★★★★★）。城大旗艦課程，競爭激烈。",
                    "**學術要求**：中位數29.5分，下四分位數28分（加權分數，英文×1.5）。",
                    "**Band A競爭**：2025年141名Band A申請者競爭13個學額——約11:1比率。",
                    "**面試**：入圍申請者需要面試。強烈建議Band A選擇以獲面試邀請。",
                    "**成功申請者特質**：優秀英文（加權×1.5）、全面學術成績、環球意識及領導潛能。",
                    "**趨勢**：由於哥倫比亞雙學位選項及卓越環球視野，需求持續高企。"
                ]
            },
            "alumni": {
                "title": "知名校友及教職員",
                "content": [
                    "**環球領袖**：校友於跨國企業擔任高級管理職位。",
                    "**金融高管**：畢業生於頂尖投資銀行及資產管理公司。",
                    "**顧問專業人士**：校友於主要國際顧問公司。",
                    "**創業家**：跨境企業創辦人。",
                    "**教職員卓越**：城大環球商業教職員包括具備頂尖全球商學院經驗的教授。"
                ]
            },
            "scholarships": {
                "title": "獎學金及經濟援助",
                "content": [
                    "**入學獎學金**：精英學生最高可獲港幣265,000元。",
                    "**旗艦獎學金**：100%學費及宿費或50%學費及宿費。",
                    "**交流贊助**：本地聯招入學學生可獲高達港幣500,000元一次性交流贊助。",
                    "**交流財政支援**：學生交流基金、非本地出境交流特別基金、劉鑾雄學生交流獎、教育局資助計劃、學生交流計劃獎學金。",
                    "**城大臨時學生貸款**：適用於出境交流學習。",
                    "**政府援助**：合資格本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。"
                ]
            },
            "tips": {
                "title": "Ace Sir 城大環球商業攻略",
                "content": [
                    "**分數目標**：加權最佳五科目標30分以上。英文至關重要（加權×1.5）——目標第5級或以上。",
                    "**Band A必需**：141名Band A申請者競爭13個學額，Band A選擇對獲面試邀請至關重要。",
                    "**準備面試**：入圍申請者約於六月面試。練習討論環球議題、職業抱負及國際商業動機。",
                    "**培養環球視野**：展示對國際事務、不同文化及環球商業趨勢的興趣。",
                    "**建立領導才能**：於學校或社區擔任重要領導角色。",
                    "**考慮哥倫比亞選項**：如對常春藤聯盟學歷感興趣，研究與哥倫比亞大學的雙聯學士學位。",
                    "**探索副修**：及早規劃申報第二個BBA主修，擴闊職業選擇。"
                ]
            }
        }
    }
}

container.upsert_item({**programme, "id": f"prog_{programme['code']}", "pk": "programmes", "type": "programme"})
container.upsert_item({**details, "id": f"detail_{details['code']}", "pk": "details", "type": "programme_detail"})

print(f"[Seed] {programme['code']} - {programme['nameEn']} / {programme['nameZh']} - Done!")
print(f"[Seed] Updated median: {programme['median']}, band_a (LQ): {programme['band_a']}")
