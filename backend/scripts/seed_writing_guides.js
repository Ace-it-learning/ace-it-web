const admin = require('firebase-admin');
const path = require('path');

// Initialize with service account (detect locally vs server)
if (!admin.apps.length) {
    const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const WRITING_GENRES_CONTENT = {
    'writing_genre_debate': {
        name: "Debate Speech",
        subject: "English",
        learning_content: {
            micro_skill: "Debate Speech Architecture",
            anatomy: {
                definition: "A formal spoken presentation arguing a specific stance to persuade an audience.",
                definition_zh: "正式的辯論演講，旨在說服聽眾接受特定立場。",
                formula: "Greeting + Stance + Points (1,2,3) + Rebuttal + Closing",
                formula_zh: "問候語 + 立場 + 分論點 + 反駁 + 總結",
                examples: [
                    {
                        scenario: "School Uniforms",
                        text: "Honorable Chairman, ladies and gentlemen, I am here today to speak strongly in favor of the abolition of school uniforms.",
                        clues: ["Honorable Chairman", "speak strongly in favor of"],
                        logic: "Establishing formal tone and clear stance immediately.",
                        inference_en: "The speaker respects the formal hierarchy and sets a definitive tone.",
                        inference_zh: "講者尊重正式場合的層級，並奠定了明確的基調。"
                    }
                ]
            },
            pro_tips_en: [
                "Use signposting words like 'My first point is...'",
                "Include rhetorical questions to engage the audience.",
                "End with a summary call-to-action."
            ],
            common_traps: [
                {
                    trap: "Forgetting the audience",
                    description: "Writing it like a silent essay instead of a speech.",
                    example_trap: "Using complex passive structures without direct address.",
                    solution_zh: "多使用 'You', 'We', 'Our school' 等詞彙，增加互動感。"
                }
            ],
            dse_appearance: [
                {
                    type: "Formal Debate",
                    description: "Standard inter-school debate competition.",
                    examples: ["Is social media more harmful than helpful?"]
                }
            ]
        }
    },
    'writing_genre_lte': {
        name: "Letter to the Editor",
        subject: "English",
        learning_content: {
            micro_skill: "Public Discourse & Letters",
            anatomy: {
                definition: "A formal letter written to a newspaper/magazine to express a viewpoint on public issues.",
                definition_zh: "寫給報章雜誌編者的信，旨在對公眾議題發表見解。",
                formula: "Dear Editor + Purpose + Logic (P-C-I-S) + Yours faithfully",
                formula_zh: "Dear Editor + 目的 + 邏輯框架 + Yours faithfully",
                examples: [
                    {
                        scenario: "Urban Noise Pollution",
                        text: "I am writing to express my deep concern regarding the escalating noise pollution in our neighborhood.",
                        clues: ["I am writing to express", "deep concern"],
                        logic: "Standard formal opening for LTE.",
                        inference_en: "States the purpose and urgency clearly in the first sentence.",
                        inference_zh: "在第一句話中明確說明目的和緊迫性。"
                    }
                ]
            },
            pro_tips_en: [
                "Use a formal, objective tone.",
                "Structure: Problem -> Cause -> Impact -> Suggestion.",
                "Cite local context to show relevance."
            ],
            common_traps: [
                {
                    trap: "Personal Venting",
                    description: "Being too emotional or aggressive without logic.",
                    example_trap: "I hate these noises and the government is doing nothing!",
                    solution_zh: "改用中性詞彙，如 'The situation is regrettable' 並提供解決建議。"
                }
            ],
            dse_appearance: [
                {
                    type: "Social Issues",
                    description: "Commenting on recent changes in society or policy.",
                    examples: ["Waste charging schemes", "Youth mental health"]
                }
            ]
        }
    },
    'writing_genre_exp': {
        name: "Expository Essay",
        subject: "English",
        learning_content: {
            micro_skill: "Expository Clarity",
            anatomy: {
                definition: "An essay designed to inform, explain, or describe a topic neutrally.",
                definition_zh: "旨在中立地提供資訊、解釋或描述特定主題的文章。",
                formula: "Intro (Hook/Thesis) + Content Paragraphs + Conclusion",
                formula_zh: "引言 (Hook/Thesis) + 內容段落 + 總結",
                examples: [
                    {
                        scenario: "Benefits of AI",
                        text: "In the past decade, Artificial Intelligence has transformed from a futuristic concept into a daily utility.",
                        clues: ["In the past decade", "has transformed"],
                        logic: "Providing historical context and factual background.",
                        inference_en: "The author is setting an objective foundation for the explanation.",
                        inference_zh: "作者正在為解釋奠定客觀的基礎。"
                    }
                ]
            },
            pro_tips_en: [
                "Focus on 'What', 'Why', and 'How'.",
                "Use a neutral, authoritative voice.",
                "Provide specific facts and data."
            ],
            common_traps: [
                {
                    trap: "Taking Sides",
                    description: "Slipping into an argumentative tone.",
                    example_trap: "AI is clearly better than humans in every way.",
                    solution_zh: "改用平衡句式，如 'While AI offers efficiency, human judgment remains vital.'"
                }
            ],
            dse_appearance: [
                {
                    type: "Informative Articles",
                    description: "Explaining a trend or phenomenon.",
                    examples: ["The rise of e-sports", "Renewable energy trends"]
                }
            ]
        }
    },
    'writing_genre_fic': {
        name: "Short Story",
        subject: "English",
        learning_content: {
            micro_skill: "Narrative Craftsmanship",
            anatomy: {
                definition: "A fictional narrative focusing on a self-contained incident or series of linked incidents.",
                definition_zh: "專注於單一事件或一系列相關事件的虛構敘事。",
                formula: "Exposition -> Rising Action -> Climax -> Resolution",
                formula_zh: "開端 -> 發展 -> 高潮 -> 結局",
                examples: [
                    {
                        scenario: "The Forgotten Key",
                        text: "The heavy iron door groaned as it swung open, revealing a dusty hall I hadn't seen in years.",
                        clues: ["groaned", "dusty hall", "hadn't seen in years"],
                        logic: "Building atmosphere and mystery immediately.",
                        inference_en: "Uses sensory details (sound/sight) to 'show' the setting.",
                        inference_zh: "使用感官細節（聲音/視覺）來「呈現」場景。"
                    }
                ]
            },
            pro_tips_en: [
                "Show, Don't Tell - use descriptive language.",
                "Build tension through pacing.",
                "Use dialogue effectively but sparingly."
            ],
            common_traps: [
                {
                    trap: "Flat Ending",
                    description: "Ending too suddenly without resolving the emotional arc.",
                    example_trap: "And then I woke up, it was all a dream.",
                    solution_zh: "著重描述角色的心理轉變或事件留下的餘韻。"
                }
            ],
            dse_appearance: [
                {
                    type: "Prompt-based Fiction",
                    description: "Writing a story based on a specific opening line or image.",
                    examples: ["The day everything changed...", "A lost item found."]
                }
            ]
        }
    },
    'writing_genre_per': {
        name: "Personal Experience",
        subject: "English",
        learning_content: {
            micro_skill: "Reflective Writing",
            anatomy: {
                definition: "A first-person account of a life event focusing on personal growth or lessons learned.",
                definition_zh: "以第一人稱敘述生活事件，側個人成長或所學教訓。",
                formula: "Event Recap + Internal Reflection + Final Insight",
                formula_zh: "事件回顧 + 內在反思 + 最終啟發",
                examples: [
                    {
                        scenario: "Failing a Test",
                        text: "Staring at the red marks on my paper, I realized that shortcuts never lead to success.",
                        clues: ["Staring at", "I realized"],
                        logic: "Connecting a physical action to an internal realization.",
                        inference_en: "Self-reflective tone shows maturity and personal growth.",
                        inference_zh: "自我反思的語氣展現了成熟和個人成長。"
                    }
                ]
            },
            pro_tips_en: [
                "Use internal verbs like 'I pondered', 'I realized'.",
                "Connect personal events to broader life lessons.",
                "Balance narrative with reflection."
            ],
            common_traps: [
                {
                    trap: "Storytelling without Lesson",
                    description: "Telling what happened without saying why it matters.",
                    example_trap: "I went to Japan, ate sushi, and came home.",
                    solution_zh: "增加一段關於該經歷如何改變你的世界觀的描述。"
                }
            ],
            dse_appearance: [
                {
                    type: "Reflective Essay",
                    description: "Narrating a challenge or meaningful encounter.",
                    examples: ["A person who inspired me", "A mistake I regret"]
                }
            ]
        }
    },
    'writing_genre_bio': {
        name: "Biographical Profile",
        subject: "English",
        learning_content: {
            micro_skill: "Human Profile Synthesis",
            anatomy: {
                definition: "A detailed description of a person's life, achievements, and impact.",
                definition_zh: "對一個人的生平、成就和影響的詳細描述。",
                formula: "Heading + Intro (Key Significance) + Lifecycle + Legacy",
                formula_zh: "標題 + 引言 (代表性) + 生平進程 + 傳奇/影響",
                examples: [
                    {
                        scenario: "Local Hero",
                        text: "Born into a modest family in Sham Shui Po, Dr. Lam's journey to becoming a world-renowned surgeon was paved with resilience.",
                        clues: ["Born into", "journey to becoming", "paved with resilience"],
                        logic: "Setting up a 'hero's journey' narrative for the biography.",
                        inference_en: "Highlights the person's character (resilience) alongside facts.",
                        inference_zh: "在事實之外，突出了人物的性格（韌性）。"
                    }
                ]
            },
            pro_tips_en: [
                "Use chronological order for events.",
                "Use inspirational language.",
                "Highlight challenges they overcame."
            ],
            common_traps: [
                {
                    trap: "Fact Listing",
                    description: "Writing a list of dates like a history timeline.",
                    example_trap: "In 1990 he did X. In 1995 he did Y.",
                    solution_zh: "使用連結詞將事件與人物的動機或社會影響聯繫起來。"
                }
            ],
            dse_appearance: [
                {
                    type: "Hero Profiles",
                    description: "Writing about a role model or historical figure.",
                    examples: ["A pioneer in technology", "A local community leader"]
                }
            ]
        }
    },
    'writing_genre_fml': {
        name: "Formal Letter",
        subject: "English",
        learning_content: {
            micro_skill: "Transactional Formalism",
            anatomy: {
                definition: "A business or professional letter following strict conventions of layout and register.",
                definition_zh: "遵循嚴格排版和語域規範的商務或專業信函。",
                formula: "Addresses + Salutation + Purpose + Body + Complimentary Close",
                formula_zh: "地址 + 稱呼 + 目的 + 正文 + 結尾敬語",
                examples: [
                    {
                        scenario: "Complaint Letter",
                        text: "I am writing to formally lodge a complaint regarding the substandard service received at your restaurant.",
                        clues: ["formally lodge a complaint", "regarding the substandard service"],
                        logic: "Standard professional vocabulary for complaints.",
                        inference_en: "The tone is firm, polite, and clearly defines the issue.",
                        inference_zh: "語氣堅定且客氣，並明確定義了問題。"
                    }
                ]
            },
            pro_tips_en: [
                "Get straight to the point in paragraph 1.",
                "Use the 'You' approach - focus on the recipient.",
                "Ensure correct salutation/closing pairing."
            ],
            common_traps: [
                {
                    trap: "Inconsistent Register",
                    description: "Starting formally but using slang or casual phrases later.",
                    example_trap: "Dear Sir... Thanks a lot for the help!",
                    solution_zh: "全程避免縮寫 (Contractions)，使用 'Thank you for your assistance'。"
                }
            ],
            dse_appearance: [
                {
                    type: "Complaint/Inquiry",
                    description: "Professional correspondence for specific goals.",
                    examples: ["Job application", "Complaint to a company"]
                }
            ]
        }
    },
    'writing_genre_rpt': {
        name: "Report",
        subject: "English",
        learning_content: {
            micro_skill: "Data & Findings Reporting",
            anatomy: {
                definition: "A factual document that organizes information for a specific audience and purpose.",
                definition_zh: "為特定讀者和目的整理資訊的實用文體。",
                formula: "Title + To/From/Date + Subheadings + Recommendations",
                formula_zh: "標題 + 收/發件人/日期 + 小標題 + 建議",
                examples: [
                    {
                        scenario: "Library Usage Report",
                        text: "It was observed that student attendance in the school library has dropped by 20% this term.",
                        clues: ["It was observed that", "has dropped by 20%"],
                        logic: "Using passive voice and statistics for objectivity.",
                        inference_en: "Presents findings neutrally without personal bias.",
                        inference_zh: "中立地展示調查結果，不帶個人偏見。"
                    }
                ]
            },
            pro_tips_en: [
                "Use sub-headings clearly.",
                "Use passive voice for objectivity.",
                "Include bullet points for clarity."
            ],
            common_traps: [
                {
                    trap: "Personal Bias",
                    description: "Using 'I think' instead of 'The survey indicates'.",
                    example_trap: "I think the library is too noisy.",
                    solution_zh: "改用 'Feedback from students suggests that the library environment is noisy.'"
                }
            ],
            dse_appearance: [
                {
                    type: "School/Work Report",
                    description: "Summarizing activities or research.",
                    examples: ["Report on a field trip", "Analysis of student habits"]
                }
            ]
        }
    },
    'writing_genre_prp': {
        name: "Proposal",
        subject: "English",
        learning_content: {
            micro_skill: "Strategic Justification",
            anatomy: {
                definition: "A document requesting permission or funding for a plan, emphasizing benefits.",
                definition_zh: "請求許可或資金支持的計畫書，強調其效益。",
                formula: "Purpose + Rationale + Proposed Plan + Budget + Benefits",
                formula_zh: "目的 + 基本原理/動機 + 擬議計畫 + 預算 + 效益",
                examples: [
                    {
                        scenario: "Recycling Program",
                        text: "This proposal outlines a strategy to implement a centralized recycling system within our campus.",
                        clues: ["outlines a strategy to", "implement a centralized"],
                        logic: "Clear declaration of the proposal's scope.",
                        inference_en: "Professional and forward-looking tone.",
                        inference_zh: "專業且具前瞻性的語氣。"
                    }
                ]
            },
            pro_tips_en: [
                "Focus on persuasion - why should they say YES?",
                "Be specific with details (dates, roles).",
                "Highlight the long-term benefits."
            ],
            common_traps: [
                {
                    trap: "Vague Plans",
                    description: "Suggesting ideas without explaining HOW they work.",
                    example_trap: "We should help the environment.",
                    solution_zh: "提供具體細節，如 'Installation of 5 recycling bins in the canteen by September'."
                }
            ],
            dse_appearance: [
                {
                    type: "Event Proposal",
                    description: "Planning a school activity or community project.",
                    examples: ["English Week proposal", "Charity run plan"]
                }
            ]
        }
    },
    'writing_genre_rev': {
        name: "Review",
        subject: "English",
        learning_content: {
            micro_skill: "Evaluative Critiquing",
            anatomy: {
                definition: "A balanced assessment of a creative work or service with a recommendation.",
                definition_zh: "對創意作品或服務的平衡評估，並附帶建議。",
                formula: "Title + Intro (What/Where) + Pros/Cons + Recommendation",
                formula_zh: "標題 + 引言 (基本資訊) + 優缺點分析 + 評分/建議",
                examples: [
                    {
                        scenario: "Movie Review",
                        text: "While the cinematography was breathtaking, the plot struggled to maintain coherence in the final act.",
                        clues: ["While", "breathtaking", "struggled to maintain coherence"],
                        logic: "Balanced evaluation using contrast ('While').",
                        inference_en: "Shows critical thinking by acknowledging both strengths and weaknesses.",
                        inference_zh: "透過承認優點和缺點，展現了批判性思考。"
                    }
                ]
            },
            pro_tips_en: [
                "Use evaluative adjectives (e.g. underwhelming, riveting).",
                "Provide a balanced view.",
                "End with a clear rating or target audience."
            ],
            common_traps: [
                {
                    trap: "Just Summarizing",
                    description: "Telling the whole story without giving an opinion.",
                    example_trap: "The movie is about a boy who finds a lost dog. They walk home...",
                    solution_zh: "減少情節敘述，增加對演技、配樂或主題的評價。"
                }
            ],
            dse_appearance: [
                {
                    type: "Cultural Reviews",
                    description: "Reviewing books, films, apps, or performances.",
                    examples: ["Review of a local play", "A travel app review"]
                }
            ]
        }
    },
    'writing_genre_art': {
        name: "Feature Article",
        subject: "English",
        learning_content: {
            micro_skill: "Journalistic Engagement",
            anatomy: {
                definition: "An engaging piece of journalism focusing on people, trends, or human-interest stories.",
                definition_zh: "引人入勝的新聞寫作，專注於人物、趨勢或人情味故事。",
                formula: "Catchy Headline + Byline + Lead + Human Element + Conclusion",
                formula_zh: "搶眼標題 + 署名 + 開場白 + 人情味細節 + 總結",
                examples: [
                    {
                        scenario: "The Slow Living Trend",
                        text: "In a city that never sleeps, some Hong Kongers are finally hitting the 'pause' button.",
                        clues: ["city that never sleeps", "hitting the 'pause' button"],
                        logic: "Using metaphors and idiomatic language to grab attention.",
                        inference_en: "Tone is lively and hooks the reader's interest immediately.",
                        inference_zh: "語氣生動，立即勾起讀者的興趣。"
                    }
                ]
            },
            pro_tips_en: [
                "Use a catchy headline.",
                "Use direct address ('You') to engage the reader.",
                "Mix factual info with colorful descriptions."
            ],
            common_traps: [
                {
                    trap: "Boring Title",
                    description: "Using a literal title that sounds like a textbook.",
                    example_trap: "An Article about Technology.",
                    solution_zh: "使用頭韻 (Alliteration) 或疑問句，如 'Tech: Tool or Torture?'"
                }
            ],
            dse_appearance: [
                {
                    type: "Magazine Features",
                    description: "Human interest pieces for school or local magazines.",
                    examples: ["Living in the digital age", "Tradition vs Modernity"]
                }
            ]
        }
    },
    'writing_genre_let': {
        name: "Personal Letter/Email",
        subject: "English",
        learning_content: {
            micro_skill: "Interpersonal Connection",
            anatomy: {
                definition: "Informal or semi-formal correspondence between friends or acquaintances.",
                definition_zh: "朋友或熟人之間的非正式或半正式通訊。",
                formula: "Hi [Name] + Greeting + Purpose + Body + Best/Cheers",
                formula_zh: "Hi [Name] + 問候 + 目的 + 正文 + 結語",
                examples: [
                    {
                        scenario: "Advice to a Friend",
                        text: "I was so sorry to hear you're feeling stressed about the exams. Trust me, we've all been there!",
                        clues: ["so sorry to hear", "Trust me", "all been there"],
                        logic: "Empathetic and colloquial tone appropriate for friends.",
                        inference_en: "Establishes a warm, supportive personal relationship.",
                        inference_zh: "建立了溫暖且支持性的個人關係。"
                    }
                ]
            },
            pro_tips_en: [
                "Use contractions for a natural feel.",
                "Ask questions back to the recipient.",
                "Use exclamation marks and emotive language."
            ],
            common_traps: [
                {
                    trap: "Too Formal",
                    description: "Using overly stiff language with a friend.",
                    example_trap: "I am writing this letter to inform you of my recent activities.",
                    solution_zh: "改用 'Wanted to catch up and tell you what's been happening!'"
                }
            ],
            dse_appearance: [
                {
                    type: "Friendly Advice",
                    description: "Sharing news or giving suggestions to a peer.",
                    examples: ["Invite to a party", "Study tips for a friend"]
                }
            ]
        }
    }
};

async function seed() {
    console.log("Starting Seeding for Writing Genre Guides...");
    const batch = db.batch();

    for (const [id, content] of Object.entries(WRITING_GENRES_CONTENT)) {
        console.log(`- Adding metadata & landing for: ${id}`);

        // 1. Update/Set the Landing Content
        const landingRef = db.collection('micro_skill_landing').doc(id);
        batch.set(landingRef, {
            ...content,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 2. We can also link this to the micro_skills collection if needed
        // (Assuming the micro_skills keys already exist in your constant file)
    }

    try {
        await batch.commit();
        console.log("✅ Seeding Complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
}

seed();
