/**
 * JUPAS Programme Details - Static fallback data
 *
 * NOTE: Primary source of programme details is now Cosmos DB via API.
 * This file is kept as a fallback for offline/development use.
 * Each entry should contain university-specific content only.
 *
 * To add a new programme:
 * 1. Add entry here for frontend fallback
 * 2. Run backend/scripts/seedJupasProgrammeDetails.js to seed to DB
 */

export const JUPAS_PROGRAM_DETAILS = {
    // =====================================================
    // CUHK - JS4501 - Medicine (MBChB)
    // =====================================================
    'JS4501': {
        id: 'cuhk-med',
        name: 'Medicine (MBChB)',
        university: 'CUHK',
        content: {
            en: {
                sections: {
                    admission: {
                        title: 'Eligibility & Admission Criteria (DSE)',
                        content: [
                            'CUHK Medicine is famous for its transparent admission scores. If you hit the "Magic Number" (published annually usually around 40-42 for 4C+2X), you are almost guaranteed an interview/offer.',
                            '**Biology & Chemistry**: While not strictly mandatory for eligibility, they hold heavy weighting (usually x 1.3 or x 1.5). Studying both gives you a massive score advantage.',
                            '**Interview**: uses a Mini-Interview format. They look for empathy, communication skills, and ethical reasoning.',
                            '**Language**: High proficiency in both English and Cantonese is essential for communicating with patients.'
                        ]
                    },
                    curriculum: {
                        title: 'Program Structure: The "Human" Touch',
                        content: [
                            '**College System**: Unlike HKU, CUHK students belong to a College (e.g., Shaw, New Asia). This adds a vibrant social life to the intense medical study.',
                            '**Bioethics & Humanities**: The curriculum places a strong emphasis on the human side of medicine, not just pure science.',
                            '**GPS (Global Physician-Leadership Stream)**: The "Elite of the Elite" stream for top scorers. Includes guaranteed mentorship and overseas leadership training.'
                        ]
                    },
                    career: {
                        title: 'Career Opportunities',
                        content: [
                            '**Public Hospitals**: Most graduates start their internship and residency in HA hospitals.',
                            '**Academic Research**: CUHK is world-renowned for biotechnology and cancer research. Great for those who want to be clinician-scientists.',
                            '**Specialization**: Path to becoming a surgeon, cardiologist, or family doctor is standard and structured.'
                        ]
                    },
                    tips: {
                        title: "Ace Sir's \"Human Doctor\" Tips",
                        content: [
                            '**The "Magic Number" Strategy**: Watch the admission score trend closely. CUHK is very formulaic. If you calculate your weighted score and it hits the median, you are safe.',
                            '**Interview Persona**: Don\'t just be smart. Be kind. Show that you care about the *person* behind the disease.',
                            '**GPS Ambition**: If you are aiming for GPS, you need 7 subjects (4C+3X) with near-perfect scores (typically 46+ in Best 7).'
                        ]
                    }
                }
            },
            zh: {
                sections: {
                    admission: {
                        title: '入學要求與計分詳情 (DSE)',
                        content: [
                            '中大醫科以收生分數透明見稱。只要你達到每年的「Magic Number」(通常 Best 6 約 40-42 分)，基本上一定有面試或 Offer。',
                            '**生物與化學**：雖然官方沒列為必修，但這兩科通常有重加權 (x 1.3 或 x 1.5)。同時修讀 Bio 和 Chem 會極大提升你的入學機會。',
                            '**面試**：採用迷你面試形式。考官看重的是同理心、溝通技巧及醫療道德推理。',
                            '**語言能力**：由於將來要面對病人，流利的廣東話與英語同樣重要。'
                        ]
                    },
                    curriculum: {
                        title: '課程結構：富有人情味的醫科',
                        content: [
                            '**書院制 (College System)**：與港大不同，中大學生有書院生活 (如新亞、崇基)。這在繁重的醫科學習中提供了寶貴的社交支援。',
                            '**生命倫理與人文**：課程非常強調醫學的人性化一面，而不僅僅是冷冰冰的科學。',
                            '**GPS (領袖專修組別)**：醫科中的「精英班」。收生分數極高，提供額外的導師指導及海外領袖培訓。'
                        ]
                    },
                    career: {
                        title: '職業前景與出路',
                        content: [
                            '**公立醫院**：絕大部分畢業生會在醫管局旗下的醫院開始實習及專科培訓。',
                            '**學術研究**：中大在生物科技及癌症研究方面享譽全球，適合想成為「臨床科學家」的同學。',
                            '**專科發展**：成為外科醫生、心臟科醫生或家庭醫生的路徑清晰且標準化。'
                        ]
                    },
                    tips: {
                        title: "Ace Sir「仁心仁術」攻略",
                        content: [
                            '**「Magic Number」策略**：密切留意收生分數走勢。中大收生很看公式。計算好自己的加權分數，只要達到中位數就相對穩陣。',
                            '**面試形象**：不要只表現聰明，要表現善良。讓考官看到你關心的是「人」而不是「病」。',
                            '**GPS 目標**：如果你瞄準 GPS，你需要修讀 7 科 (4C+3X) 並考獲近乎滿分 (通常 Best 7 要 46 分以上)。'
                        ]
                    }
                }
            }
        }
    },

    // =====================================================
    // HKU - JS6456 - Medicine (MBBS)
    // =====================================================
    'JS6456': {
        id: 'hku-med',
        name: '內外全科醫學士 (MBBS)',
        university: 'HKU',
        content: {
            en: {
                sections: {
                    admission: {
                        title: 'Eligibility & Admission Criteria (DSE)',
                        content: [
                            'HKU Medicine is one of the most competitive programmes in Asia. Admission requires exceptional academic performance, typically Best 6 scores of 42+ (standard scale).',
                            '**Biology & Chemistry**: While not strictly mandatory, both subjects carry significant weighting (often x 1.5). Taking both dramatically increases your chances.',
                            '**Interview**: HKU uses a Multiple Mini Interview (MMI) format. Stations assess communication skills, ethical reasoning, empathy, and critical thinking.',
                            '**Language**: Excellent English is essential. Cantonese proficiency is highly valued for patient interaction in Hong Kong.'
                        ]
                    },
                    curriculum: {
                        title: 'Program Structure: The HKU Edge',
                        content: [
                            '**Systems-based Curriculum**: Unlike traditional subject-based teaching, HKU organises learning around body systems (e.g., cardiovascular, respiratory) integrating anatomy, physiology, and pathology.',
                            '**Early Clinical Exposure**: Students begin hospital placements from Year 1, building patient interaction skills from day one.',
                            '**Enrichment Programmes**: The Medical Humanities Programme and overseas electives allow students to explore global health perspectives.',
                            '**Research Opportunities**: The HKU Medical Campus offers world-class research facilities in emerging infectious diseases, cancer, and stem cell biology.'
                        ]
                    },
                    career: {
                        title: 'Career Opportunities',
                        content: [
                            '**Public Hospitals**: Most graduates enter the Hospital Authority for internship and specialty training in fields like surgery, medicine, paediatrics, and obstetrics.',
                            '**Private Practice**: After completing specialist training, many establish private clinics in family medicine, dermatology, or other specialties.',
                            '**Global Health**: HKU\'s strong international networks open doors to WHO, MSF, and overseas hospital placements.',
                            '**Academic Medicine**: The Faculty of Medicine is a global research powerhouse, ideal for those pursuing clinician-scientist careers.'
                        ]
                    },
                    tips: {
                        title: "Ace Sir's HKU Medicine Strategy",
                        content: [
                            '**Score Targeting**: Aim for Best 6 of 42+ with strong Biology and Chemistry. HKU Medicine is unapologetically meritocratic.',
                            '**MMI Preparation**: Practice ethical scenarios (e.g., resource allocation, patient autonomy). Show compassion alongside clinical reasoning.',
                            '**Shadowing Experience**: Spend time in hospitals or clinics. Genuine exposure to medicine demonstrates commitment beyond academic interest.'
                        ]
                    }
                }
            },
            zh: {
                sections: {
                    admission: {
                        title: '入學要求與計分詳情 (DSE)',
                        content: [
                            '港大醫學院是亞洲競爭最激烈的課程之一。入學要求極高的學術成績，通常 Best 6 需達 42 分或以上。',
                            '**生物與化學**：雖然非嚴格必修，但兩科均有顯著加權 (通常 x 1.5)。同時修讀能大幅提升入學機會。',
                            '**面試**：港大採用迷你面試 (MMI) 形式。各站考核溝通技巧、道德推理、同理心及批判思維。',
                            '**語言能力**：優秀的英文能力是必須的。廣東話能力對香港醫患溝通極為重要。'
                        ]
                    },
                    curriculum: {
                        title: '課程結構：港大優勢',
                        content: [
                            '**系統導向課程**：與傳統科目式教學不同，港大以身體系統 (如心血管、呼吸系統) 組織學習，整合解剖學、生理學及病理學。',
                            '**早期臨床接觸**：學生從第一年開始便進行醫院實習，從第一天起建立醫患互動技巧。',
                            '**專修計劃**：醫學人文計劃及海外選修科讓學生探索全球健康視野。',
                            '**研究機會**：港大醫學院提供世界級研究設施，專注於新興傳染病、癌症及幹細胞生物學。'
                        ]
                    },
                    career: {
                        title: '職業前景與出路',
                        content: [
                            '**公立醫院**：大部分畢業生進入醫管局完成實習及專科培訓，包括外科、內科、兒科及婦產科。',
                            '**私人執業**：完成專科培訓後，不少醫生開設私人診所，從事家庭醫學、皮膚科或其他專科。',
                            '**全球健康**：港大強大的國際網絡為世界衛生組織、無國界醫生及海外醫院實習打開大門。',
                            '**學術醫學**：醫學院是全球研究重鎮，適合追求臨床科學家事業的學生。'
                        ]
                    },
                    tips: {
                        title: "Ace Sir 港大醫科攻略",
                        content: [
                            '**分數目標**：Best 6 目標 42 分以上，生物及化學成績要優異。港大醫科毫不妥協地以成績為先。',
                            '**MMI 準備**：練習倫理情境 (如資源分配、病人自主權)。展現同情心，同時展示臨床推理能力。',
                            '**影子實習經驗**：到醫院或診所實習。真正的醫學接觸能展示超越學術興趣的承諾。'
                        ]
                    }
                }
            }
        }
    }
};

// CATEGORY_TEMPLATES removed - each programme should have its own specific content
// Generic templates caused bugs where HKU Medicine showed CUHK Medicine content

export default JUPAS_PROGRAM_DETAILS;
