import json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

from azure.cosmos import CosmosClient

endpoint = os.getenv('AZURE_COSMOS_ENDPOINT')
key = os.getenv('AZURE_COSMOS_KEY')
client = CosmosClient(endpoint, key)
db = client.get_database_client('aceit')
container = db.get_container_client('jupas_programmes')

programme = {
    "code": "JS4264",
    "nameEn": "BBA-JD",
    "nameZh": "工商管理學士與法律博士",
    "name": "工商管理學士與法律博士",
    "university": "香港中文大學",
    "faculty": "商學院及法律學院",
    "median": 35,
    "band_a": 37,
    "category": "business",
    "type": "programme"
}

en_sections = {
    "admission": {
        "title": "Eligibility & Admission Criteria (DSE)",
        "content": [
            "**Academic Threshold**: CUHK BBA-JD is extremely competitive. The median admission score is typically Best 5 = 33-35 (standard scale, 5** = 7 pts).",
            "**Core Subjects**: English (Level 5+), Mathematics (Compulsory Part, Level 4+), and a pass in Citizenship and Social Development.",
            "**Preferred Electives**: BAFS, Economics, History, or any humanities subject are advantageous. Exceptional academic ability and strong communication skills are essential.",
            "**Interview**: Panel interview assessing intellectual ability, ethical reasoning, understanding of business and law, leadership potential, and commitment to a dual-degree programme.",
            "**Non-Academic Factors**: Debate and mooting experience, leadership roles, community service, law firm or business internships, and essay writing competitions are highly valued."
        ]
    },
    "curriculum": {
        "title": "Programme Structure & Curriculum",
        "content": [
            "**Years 1-2 - Business Foundations**: Accounting, economics, finance, marketing, management, and introductory law courses. Students complete the BBA core curriculum.",
            "**Years 3-4 - Law Core**: Contract law, tort law, criminal law, constitutional law, property law, and equity. Students begin the JD (Juris Doctor) component with intensive legal training.",
            "**Years 5-6 - Integration & Specialisation**: Advanced business law, corporate governance, mergers and acquisitions, international arbitration, and capstone projects integrating business and legal perspectives.",
            "**Practical Training**: Mooting competitions, negotiation workshops, legal clinic experience, business case competitions, and internship at law firms and corporations.",
            "**Professional Preparation**: PCLL (Postgraduate Certificate in Laws) eligibility upon completion, preparing graduates for legal practice in Hong Kong.",
            "**Unique Features**: Hong Kong's only integrated BBA-JD programme producing graduates with both business acumen and legal expertise for corporate leadership roles."
        ]
    },
    "career": {
        "title": "Career Pathways & Prospects",
        "content": [
            "**Corporate Law**: Solicitors and barristers at international law firms specialising in corporate finance, M&A, and capital markets.",
            "**In-House Counsel**: Legal counsel and compliance officers at multinational corporations, banks, and listed companies.",
            "**Investment Banking**: Investment bankers with legal expertise structuring complex transactions and navigating regulatory frameworks.",
            "**Management Consulting**: Strategy consultants at top firms leveraging both business and legal knowledge for client advisory.",
            "**Entrepreneurship**: Founders of startups and businesses with deep understanding of corporate law, IP protection, and regulatory compliance.",
            "**Public Service**: Government lawyers, policy advisors, and regulators combining business insight with legal expertise."
        ]
    },
    "campus": {
        "title": "Campus Life & Student Experience",
        "content": [
            "**Dual Faculty Support**: Access to both Business School and Law School resources, faculty, and alumni networks.",
            "**Mooting & Competitions**: Active participation in international mooting competitions (Vis Moot, Jessup) and business case competitions.",
            "**Legal Clinic**: Hands-on legal practice experience through the law school's legal clinic serving real clients under supervision.",
            "**Industry Connections**: Networking with law firm partners, general counsels, and C-suite executives through mentorship programmes.",
            "**Global Exposure**: Exchange opportunities with top law schools (Harvard, Yale, Oxford) and business schools worldwide."
        ]
    },
    "competitiveness": {
        "title": "Admission Competitiveness Analysis",
        "content": [
            "**Overall Level**: Extremely High (★★★★★). One of CUHK's most competitive programmes attracting the brightest students.",
            "**Academic Requirements**: Best 5 around 33-35. Near-perfect academic record expected given the programme's rigour and duration.",
            "**Band A Competition**: Typically 5-6 applicants per place. Only students with exceptional all-round profiles are admitted.",
            "**Interview Weighting**: Very High. The panel interview assesses intellectual depth, ethical reasoning, and genuine commitment to both disciplines.",
            "**What Differentiates Winners**: Outstanding academic results, demonstrated leadership, clear career vision, and ability to articulate why the dual degree is necessary.",
            "**Trend**: Consistently high demand as Hong Kong's legal and business sectors seek professionals with dual expertise."
        ]
    },
    "alumni": {
        "title": "Notable Alumni & Faculty",
        "content": [
            "**Professor Christopher Gane**: Former Dean of Law and expert in criminal law and legal education.",
            "**Professor Kalok Chan**: Leading finance scholar and former Dean of Business with expertise in real estate and financial markets.",
            "**Alumni Network**: Graduates hold partnership positions at magic circle firms (Clifford Chance, Linklaters), general counsel roles at Hang Seng Index companies, and judicial positions.",
            "**Research Excellence**: Both faculties are internationally ranked with faculty publishing in top law reviews and business journals.",
            "**Professional Impact**: Alumni shape Hong Kong's legal and business landscape as lawyers, judges, corporate leaders, and policymakers."
        ]
    },
    "scholarships": {
        "title": "Scholarships & Financial Aid",
        "content": [
            "**CUHK Entrance Scholarships**: Full and half tuition scholarships for exceptional DSE performers (typically 5** in multiple subjects).",
            "**BBA-JD Programme Scholarships**: Merit-based awards specifically for dual-degree students covering tuition across the six-year programme.",
            "**Law Firm Sponsorships**: Major law firms (Baker McKenzie, Kirkland & Ellis) sponsor top students with internship guarantees.",
            "**Government Financial Assistance**: Local students may apply for Tertiary Student Finance Scheme (TSFS) and Non-means-tested Loan Scheme (NLSPS).",
            "**Overseas Study Grants**: Funding for exchange semesters at top international law and business schools."
        ]
    },
    "tips": {
        "title": "Ace Sir's CUHK BBA-JD Strategy",
        "content": [
            "**Score Targeting**: Aim for Best 5 of 35+ with near-perfect results. This programme is for the academic elite.",
            "**Develop Both Sides**: Show engagement with BOTH business and law — not just one. Read business news AND legal cases.",
            "**Practise Mooting**: Join debate or mooting clubs to develop the advocacy skills essential for legal practice.",
            "**Demonstrate Leadership**: Take on leadership roles in school or community organisations. The programme seeks future leaders.",
            "**Articulate Your Vision**: Be crystal clear about WHY you want both degrees and HOW you'll use them in your career."
        ]
    }
}

zh_sections = {
    "admission": {
        "title": "入學要求與計分詳情 (DSE)",
        "content": [
            "**學術門檻**：中大工商管理學士與法律博士競爭程度極高。中位數入學成績通常為最佳五科33-35分（標準計分，5**=7分）。",
            "**核心科目**：英文（Level 5+）、數學（必修部分，Level 4+）及公民與社會發展科合格。",
            "**優先選修科**：企會財、經濟、歷史或任何人文科目均有優勢。卓越的學術能力及強大的溝通技巧至關重要。",
            "**面試**：小組面試，評估智力能力、倫理推理、對商業及法律的理解、領導潛質及對雙學位課程的承擔。",
            "**非學術因素**：辯論及模擬法庭經驗、領導角色、社區服務、律師事務所或商業實習及論文寫作比賽均受高度重視。"
        ]
    },
    "curriculum": {
        "title": "課程結構與內容",
        "content": [
            "**第一至二年 - 商業基礎**：會計、經濟、金融、市場學、管理學及法律導論課程。學生完成工商管理學士核心課程。",
            "**第三至四年 - 法律核心**：合約法、侵權法、刑事法、憲制法、物業法及衡平法。學生開始法律博士（Juris Doctor）部分的密集法律培訓。",
            "**第五至六年 - 整合與專修**：高級商業法、企業管治、併購、國際仲裁及整合商業與法律觀點的畢業專題。",
            "**實務訓練**：模擬法庭比賽、談判工作坊、法律診所經驗、商業個案比賽及律師事務所和企業實習。",
            "**專業準備**：完成後符合PCLL（法學專業證書）資格，為香港法律執業作準備。",
            "**課程特色**：香港唯一的綜合工商管理學士與法律博士課程，培養具商業觸覺及法律專長的畢業生擔任企業領導角色。"
        ]
    },
    "career": {
        "title": "職業前景與出路",
        "content": [
            "**企業法律**：專門從事企業金融、併購及資本市場的國際律師事務所律師及大律師。",
            "**企業法律顧問**：跨國公司、銀行及上市公司的法律顧問及合規主任。",
            "**投資銀行**：具法律專長的投資銀行家，構建複雜交易及應對監管框架。",
            "**管理顧問**：頂尖公司的策略顧問，利用商業及法律知識為客戶提供諮詢。",
            "**創業**：對公司法、知識產權保護及監管合規有深入理解的初創企業及企業創辦人。",
            "**公共服務**：結合商業洞察與法律專長的政府律師、政策顧問及監管者。"
        ]
    },
    "campus": {
        "title": "校園生活與學生體驗",
        "content": [
            "**雙學院支援**：可使用商學院及法律學院的資源、教職員及校友網絡。",
            "**模擬法庭及比賽**：積極參與國際模擬法庭比賽（Vis Moot、Jessup）及商業個案比賽。",
            "**法律診所**：透過法律學院的法律診所在監督下為真實客戶服務，獲得實務法律經驗。",
            "**業界聯繫**：透過導師計劃與律師事務所合夥人、總法律顧問及高管建立聯繫。",
            "**國際視野**：與頂尖法學院（哈佛、耶魯、牛津）及全球商學院的交流機會。"
        ]
    },
    "competitiveness": {
        "title": "入學競爭力分析",
        "content": [
            "**整體程度**：極高（★★★★★）。中大最具競爭力的課程之一，吸引最優秀的學生。",
            "**學術要求**：最佳五科約33-35分。鑑於課程的嚴謹性及年期，預期接近完美的學術成績。",
            "**Band A競爭**：通常每個學額有5-6名申請人。僅錄取具卓越全面背景的學生。",
            "**面試比重**：非常高。小組面試評估智力深度、倫理推理及對兩個學科的真正承擔。",
            "**成功申請者特質**：傑出學術成績、展示的領導力、清晰的職業願景及闡述為何需要雙學位的能力。",
            "**趨勢**：隨著香港法律及商業界尋求具雙重專長的專業人士，需求持續高企。"
        ]
    },
    "alumni": {
        "title": "知名校友及教職員",
        "content": [
            "**Christopher Gane教授**：前法律學院院長及刑事法與法律教育專家。",
            "**陳家樂教授**：領先金融學者及前商學院院長，專長房地產及金融市場。",
            "**校友網絡**：畢業生在魔圈律師事務所（高偉紳、年利達）擔任合夥人，在恒生指數公司擔任總法律顧問，以及擔任司法職位。",
            "**研究卓越**：兩個學院均獲國際排名，教職員在頂尖法律評論及商業期刊發表文章。",
            "**專業影響**：校友作為律師、法官、企業領袖及政策制定者塑造香港的法律及商業格局。"
        ]
    },
    "scholarships": {
        "title": "獎學金及經濟援助",
        "content": [
            "**中大入學獎學金**：為卓越DSE成績者提供全額及半額學費獎學金（通常多科5**）。",
            "**工商管理學士與法律博士課程獎學金**：專為雙學位學生而設的獎學金，涵蓋六年課程的學費。",
            "**律師事務所贊助**：主要律師事務所（貝克·麥堅時、凱易）贊助頂尖學生，提供實習保證。",
            "**政府資助**：本地學生可申請專上學生資助計劃（TSFS）及免入息審查貸款計劃（NLSPS）。",
            "**海外學習資助**：頂尖國際法律及商學院交流學期的資金。"
        ]
    },
    "tips": {
        "title": "Ace Sir 中大工商管理學士與法律博士攻略",
        "content": [
            "**分數目標**：最佳五科目標35分以上，接近完美成績。這是學術精英的課程。",
            "**發展兩方面**：展示對商業及法律的參與——不僅一方。閱讀商業新聞及法律案例。",
            "**練習模擬法庭**：加入辯論或模擬法庭學會，培養法律執業必需的辯論技巧。",
            "**展示領導力**：在學校或社區組織擔任領導角色。課程尋求未來領袖。",
            "**闡述你的願景**：清楚說明為何你想要兩個學位及如何在職業中運用它們。"
        ]
    }
}

details = {
    "code": "JS4264",
    "university": "香港中文大學",
    "en": {"sections": en_sections},
    "zh": {"sections": zh_sections}
}

prog_doc = {
    "id": f"prog_{programme['code']}",
    "pk": "programmes",
    "type": "programme",
    **programme,
    "updatedAt": "2026-05-14T12:00:00Z"
}
container.upsert_item(body=prog_doc)
print(f"[Seed] Upserted programme {programme['code']}")

detail_doc = {
    "id": f"detail_{details['code']}",
    "pk": "details",
    "type": "programme_detail",
    **details,
    "updatedAt": "2026-05-14T12:00:00Z"
}
container.upsert_item(body=detail_doc)
print(f"[Seed] Upserted details {details['code']}")
print("[Seed] Done!")
