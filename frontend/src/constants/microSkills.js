/**
 * Frontend Micro-Skills Constants
 * Source of truth for skill names and descriptions in both English and Traditional Chinese.
 */

export const MICRO_SKILLS = {
    // READING
    reading_literalComprehension: {
        en: { name: 'Literal Comprehension', desc: 'Understanding explicit information in texts', outcome: 'Locate explicit facts with 100% accuracy' },
        zh: { name: '字面理解', desc: '理解文中明確表達的資訊', outcome: '百分百準確定位文中明確資訊' }
    },
    reading_inference: {
        en: { name: 'Inference', desc: 'Reading between the lines, understanding implied meanings', outcome: 'Read between the lines to reveal underlying logic' },
        zh: { name: '推論能力', desc: '閱讀字裡行間，理解隱含意思', outcome: '讀懂字裡行間隱含的邏輯' }
    },
    reading_mainIdea: {
        en: { name: 'Main Idea Identification', desc: 'Identifying central themes and arguments', outcome: 'Summarize complex paragraphs in single sentences' },
        zh: { name: '主旨識別', desc: '辨識核心主題與論點', outcome: '用一句話精煉總結複雜段落大意' }
    },
    reading_detailRecognition: {
        en: { name: 'Detail Recognition', desc: 'Locating specific facts and data', outcome: 'Extract precise data from dense informational texts' },
        zh: { name: '細節辨識', desc: '定位特定的事實與數據', outcome: '從稠密資訊中提取精確數據' }
    },
    reading_sequencing: {
        en: { name: 'Sequencing', desc: 'Understanding chronological order and cause-effect', outcome: 'Reconstruct logical timelines and causal links' },
        zh: { name: '排序能力', desc: '理解時間順序與因果關係', outcome: '重組邏輯時間線與因果鏈接' }
    },
    reading_synthesis: {
        en: { name: 'Synthesis', desc: 'Combining information from multiple sources', outcome: 'Connect evidence from multiple texts to form conclusions' },
        zh: { name: '綜合能力', desc: '結合多個來源的資訊', outcome: '融合多篇文本證據以得出結論' }
    },
    reading_factVsOpinion: {
        en: { name: 'Fact vs Opinion', desc: 'Distinguishing objective from subjective statements', outcome: 'Identify bias and filter out subjective claims' },
        zh: { name: '事實與意見', desc: '區分客觀與主觀陳述', outcome: '辨識偏見並過濾主觀陳述' }
    },
    reading_authorPurpose: {
        en: { name: "Author's Purpose", desc: 'Identifying intent (persuade, inform, entertain)', outcome: 'Decode the hidden intent behind specific word choices' },
        zh: { name: '作者意圖', desc: '辨識寫作目的（說服、通知、娛樂）', outcome: '解讀特定用詞背後的隱藏意圖' }
    },
    reading_toneAttitude: {
        en: { name: 'Tone & Attitude', desc: "Detecting writer's stance and emotions", outcome: "Empathize with the writer's emotional state and stance" },
        zh: { name: '語氣與態度', desc: '偵測作者的立場與情緒', outcome: '準確感知作者的情感狀態與立場' }
    },
    reading_registerStyle: {
        en: { name: 'Register & Style', desc: 'Recognizing formal/informal language', outcome: 'Adapt reading speed to formal and informal contexts' },
        zh: { name: '語體與風格', desc: '辨識正式或非正式語言', outcome: '根據正式或非正式語境調整閱讀策略' }
    },
    reading_metaphoricalLanguage: {
        en: { name: 'Metaphorical Language', desc: 'Understanding figurative expressions', outcome: 'Deconstruct figures of speech for deeper meaning' },
        zh: { name: '比喻語言', desc: '理解修辭與比喻表達', outcome: '解構修辭格以掌握深層含義' }
    },
    reading_textOrganization: {
        en: { name: 'Text Organization', desc: 'Recognizing structure (compare/contrast, problem/solution)', outcome: 'Map the structural blueprint of any DSE passage' },
        zh: { name: '文本結構', desc: '辨識文章架構（比較/對比、問題/解決）', outcome: '快速繪製任何 DSE 文章的結構藍圖' }
    },
    reading_skimmingScanning: {
        en: { name: 'Skimming & Scanning', desc: 'Quickly locating keywords and gisting paragraphs', outcome: 'Find any keyword in under 5 seconds' },
        zh: { name: '略讀與掃描', desc: '快速定位關鍵字及掌握段落大意', outcome: '在 5 秒內精確定位任何關鍵字' }
    },
    reading_paraphrasing: {
        en: { name: 'Paraphrasing', desc: 'Restating information using different words/structures', outcome: 'Express complex ideas using simpler, clearer synonyms' },
        zh: { name: '改寫能力', desc: '使用不同的詞彙/結構重述資訊', outcome: '使用更清晰的近義詞表述複雜想法' }
    },
    reading_cohesionReference: {
        en: { name: 'Cohesion & Reference', desc: 'Understanding grammatical links (it/this/them)', outcome: 'Track subjects across long, complex sentences' },
        zh: { name: '銜接與指代', desc: '理解文中的語法連結及指代表達', outcome: '在長難句中精確追蹤指代對象' }
    },

    // WRITING
    writing_relevance: {
        en: { name: 'Relevance', desc: 'Staying on topic and addressing the prompt', outcome: 'Write responses that perfectly address every part of the prompt' },
        zh: { name: '內容扣題', desc: '確保內容符合主題並回應題目', outcome: '撰寫完全扣合題目所有要求的內容' }
    },
    writing_development: {
        en: { name: 'Development', desc: 'Elaborating ideas with examples and details', outcome: 'Richly elaborate ideas with convincing evidence' },
        zh: { name: '內容拓展', desc: '使用例子和細節發展觀點', outcome: '使用具說服力的證據豐富地發展論點' }
    },
    writing_originality: {
        en: { name: 'Originality', desc: 'Presenting unique perspectives and insights', outcome: 'Stand out with unique perspectives and creative flair' },
        zh: { name: '創意發揮', desc: '展現獨特見解與思維', outcome: '以獨特見解與創意風格脫穎而出' }
    },
    writing_vocabularyRange: {
        en: { name: 'Vocabulary Range', desc: 'Using varied and precise words', outcome: 'Wield precise, high-level vocabulary with ease' },
        zh: { name: '詞彙豐富度', desc: '使用多樣化且精準的詞彙', outcome: '游刃有餘地運用精準高階詞彙' }
    },
    writing_collocations: {
        en: { name: 'Collocations', desc: 'Natural word combinations', outcome: 'Master natural-sounding word pairings used by natives' },
        zh: { name: '詞語搭配', desc: '自然的詞語組合', outcome: '掌握母語使用者常用的自然詞語搭配' }
    },
    writing_idiomaticExpressions: {
        en: { name: 'Idiomatic Expressions', desc: 'Appropriate use of idioms and phrases', outcome: 'Incorporate idioms for a more natural, fluid tone' },
        zh: { name: '慣用語表達', desc: '恰當使用成語語常用表達', outcome: '巧妙融入慣用語以提升語言流暢度' }
    },
    writing_registerAppropriate: {
        en: { name: 'Register Appropriateness', desc: 'Matching formality to context', outcome: 'Switch perfectly between formal letters and casual blogs' },
        zh: { name: '語體適切度', desc: '根據情境調整正式程度', outcome: '在正式書信與隨筆網誌間完美切換風格' }
    },
    writing_wordChoicePrecision: {
        en: { name: 'Word Choice Precision', desc: 'Selecting exact words for meaning', outcome: 'Select the exact word to convey nuanced meanings' },
        zh: { name: '選詞精準度', desc: '挑選最準確的用詞以表達意圖', outcome: '精準選詞以傳達最細微的意義差別' }
    },
    writing_sentenceVariety: {
        en: { name: 'Sentence Variety', desc: 'Mix of simple, compound, complex sentences', outcome: 'Master the mix of simple and complex sentence structures' },
        zh: { name: '句式變化', desc: '結合簡單、並列與複合句', outcome: '靈活結合簡單與複雜句式提升文章層次' }
    },
    writing_advancedStructures: {
        en: { name: 'Advanced Structures', desc: 'Inversion, cleft sentences, conditionals', outcome: 'Use inversions and relative clauses for sophisticated flow' },
        zh: { name: '高級句式', desc: '使用倒裝、強調句、條件句等', outcome: '運用倒裝與關係從句營造高級文筆' }
    },
    writing_grammaticalAccuracy: {
        en: { name: 'Grammatical Accuracy', desc: 'Correct tenses, subject-verb agreement', outcome: 'Ensure error-free writing even under exam pressure' },
        zh: { name: '語法準確度', desc: '確保時態、主謂一致等正確', outcome: '在考試壓力下依然確保文字零語法錯誤' }
    },
    writing_punctuation: {
        en: { name: 'Punctuation', desc: 'Proper use of commas, semicolons, etc.', outcome: 'Use punctuation as a tool for clarity and impact' },
        zh: { name: '標點符號', desc: '正確使用逗號、分號等', outcome: '將標點符號作為提升清晰度與力度的工具' }
    },
    writing_paragraphStructure: {
        en: { name: 'Paragraph Structure', desc: 'Topic sentences, supporting details, conclusions', outcome: 'Build rock-solid arguments with TEEL paragraphing' },
        zh: { name: '段落結構', desc: '運用主題句、支持細節與結語', outcome: '運用 TEEL 法則構建堅實的論證段落' }
    },
    writing_transitions: {
        en: { name: 'Transitions', desc: 'Smooth connections between ideas', outcome: 'Link ideas seamlessly with advanced cohesive devices' },
        zh: { name: '過渡銜接', desc: '在想法之間建立平滑連接', outcome: '使用高級銜接詞無縫連接各個觀點' }
    },
    writing_overallCoherence: {
        en: { name: 'Overall Coherence', desc: 'Logical flow from introduction to conclusion', outcome: 'Create a logical flow that guides the reader effortlessly' },
        zh: { name: '整體連貫度', desc: '從引言到結論的邏輯流動', outcome: '創造邏輯嚴密的行文流以引導讀者' }
    },

    writing_general: {
        en: { name: 'Generic Writing Task', desc: 'All-purpose writing practice covering various DSE-style prompts.', outcome: 'Master versatile writing across multiple DSE formats.' },
        zh: { name: '綜合寫作練習', desc: '涵蓋各種 DSE 風格題目的綜合寫作練習。', outcome: '掌握多種 DSE 格式的通用寫作技巧。' }
    },

    // WRITING GENRES (The Genre Factory)
    writing_genre_debate: {
        paper: 'writing', cluster: 'argumentative',
        en: { name: 'Debate Speech', desc: 'Master the art of logical persuasion and counter-arguments.', outcome: 'Deliver a powerful, persuasive debate speech.' },
        zh: { name: '辯論演講', desc: '掌握邏輯說服與反駁技巧。', outcome: '發表極具說服力的辯論演講。' }
    },
    writing_genre_lte: {
        paper: 'writing', cluster: 'argumentative',
        en: { name: 'Letter to the Editor', desc: 'Express your views on social issues with clarity and impact.', outcome: 'Write a compelling letter addressing social concerns.' },
        zh: { name: '給編輯的信', desc: '針對社會議題清晰且有力地表達見解。', outcome: '撰寫一封探討社會問題的高品質信件。' }
    },
    writing_genre_exp: {
        paper: 'writing', cluster: 'argumentative',
        en: { name: 'Expository Essay', desc: 'Explain complex concepts with systematic logic and evidence.', outcome: 'Compose a clear and informative explanatory essay.' },
        zh: { name: '說明文', desc: '以系統性邏輯與證據解釋複雜概念。', outcome: '撰寫一篇條理清晰的說明性文章。' }
    },
    writing_genre_fic: {
        paper: 'writing', cluster: 'narrative',
        en: { name: 'Short Story', desc: 'Build engaging narratives with character and tension.', outcome: 'Create a captivating story with a strong emotional arc.' },
        zh: { name: '短篇故事', desc: '構建富有角色深度與張力的敘事。', outcome: '創作一個引人入勝且具情感共鳴的故事。' }
    },
    writing_genre_per: {
        paper: 'writing', cluster: 'narrative',
        en: { name: 'Personal Experience', desc: 'Reflect on life events with descriptive and engaging language.', outcome: 'Write a touching and vivid personal reflection.' },
        zh: { name: '個人經驗', desc: '以生動且具感染力的語言反思生活事件。', outcome: '撰寫一篇動人且形象鮮明的個人反思。' }
    },
    writing_genre_bio: {
        paper: 'writing', cluster: 'narrative',
        en: { name: 'Biographical Profile', desc: 'Document the lives of inspiring individuals with precision.', outcome: 'Write a professional profile that brings the subject to life.' },
        zh: { name: '人物簡介', desc: '精確記錄具啟發性的人物生活。', outcome: '撰寫一份生動且專業的人物簡介。' }
    },
    writing_genre_fml: {
        paper: 'writing', cluster: 'transactional',
        en: { name: 'Formal Letter', desc: 'Communicate with authority and professional register.', outcome: 'Draft professional correspondence for various contexts.' },
        zh: { name: '正式書信', desc: '以專業語體與權威感進行溝通。', outcome: '在不同語境下撰寫專業的書信往來。' }
    },
    writing_genre_rpt: {
        paper: 'writing', cluster: 'transactional',
        en: { name: 'Report', desc: 'Synthesize data and findings into a structured format.', outcome: 'Produce a clear, objective, and well-organized report.' },
        zh: { name: '報告', desc: '將數據與發現綜合為結構化的格式。', outcome: '製作一份清晰、客觀且條理分明的報告。' }
    },
    writing_genre_prp: {
        paper: 'writing', cluster: 'transactional',
        en: { name: 'Proposal', desc: 'Persuade stakeholders with well-planned initiatives.', outcome: 'Design a winning proposal with a clear action plan.' },
        zh: { name: '建議書', desc: '以周全的計劃倡議說服利益相關者。', outcome: '設計一份具備清晰行動計劃的優秀建議書。' }
    },
    writing_genre_rev: {
        paper: 'writing', cluster: 'discursive',
        en: { name: 'Review', desc: 'Analyze and evaluate products or events with subjective flair.', outcome: 'Write a sharp, engaging review that guides the reader.' },
        zh: { name: '評論', desc: '以主觀風格分析與評估產品或活動。', outcome: '撰寫一篇能引導讀者、銳利且有趣的評論。' }
    },
    writing_genre_art: {
        paper: 'writing', cluster: 'discursive',
        en: { name: 'Feature Article', desc: 'Capture attention with catchy headlines and direct address.', outcome: 'Craft an engaging article for magazines or journals.' },
        zh: { name: '特寫文章', desc: '以吸睛標題與直接受眾對話捕捉注意力。', outcome: '為雜誌或期刊創作引人入勝的文章。' }
    },
    writing_genre_let: {
        paper: 'writing', cluster: 'discursive',
        en: { name: 'Personal Letter/Email', desc: 'Connect with readers using a personal and friendly tone.', outcome: 'Communicate effectively in informal personal contexts.' },
        zh: { name: '個人書信/電郵', desc: '以個人且友好的語體與讀者連結。', outcome: '在非正式個人語境下進行有效溝通。' }
    },

    // LISTENING
    listening_mainIdea: {
        en: { name: 'Main Idea Listening', desc: 'Grasping overall message', outcome: 'Summarize the core message from high-speed audio' },
        zh: { name: '主旨聆聽', desc: '掌握整體訊息', outcome: '從高速音頻中精煉核心訊息' }
    },
    listening_detailListening: {
        en: { name: 'Detail Listening', desc: 'Catching specific information (names, dates, numbers)', outcome: 'Capture names, dates, and numbers on the first pass' },
        zh: { name: '細節聆聽', desc: '捕捉具體資訊（名字、日期、數字）', outcome: '在初次聆聽時即捕捉姓名、日期與數字' }
    },
    listening_noteTaking: {
        en: { name: 'Note-Taking', desc: 'Recording key points accurately', outcome: 'Transform complex speech into clear, actionable notes' },
        zh: { name: '筆記技巧', desc: '準確記錄關鍵點', outcome: '將複雜演說轉化為清晰且易於運用的筆記' }
    },
    listening_prediction: {
        en: { name: 'Prediction', desc: 'Anticipating what comes next', outcome: 'Anticipate speaker intent before words are spoken' },
        zh: { name: '預測能力', desc: '預期接下來的內容', outcome: '在話語出口前即預判說話者的意圖' }
    },
    listening_gist: {
        en: { name: 'Listening for Gist', desc: 'Understanding general meaning without every word', outcome: 'Master the "Global Listening" technique for full context' },
        zh: { name: '聽取大意', desc: '理解大概意思而無需聽懂每個字', outcome: '掌握「全局聆聽」法以掌握完整語境' }
    },
    listening_accentRecognition: {
        en: { name: 'Accent Recognition', desc: 'Understanding different English accents', outcome: 'Decode 10+ global English accents with confidence' },
        zh: { name: '口音辨識', desc: '理解不同地方的英語口音', outcome: '自信解碼 10 種以上的全球英語口音' }
    },
    listening_speedProcessing: {
        en: { name: 'Speed Processing', desc: 'Handling fast speech rates', outcome: 'Engage comfortably with native-speed dialogue' },
        zh: { name: '速度處理', desc: '應對快速的說話速度', outcome: '自如應對母語等級的說話速度' }
    },
    listening_speakerAttitude: {
        en: { name: 'Speaker Attitude', desc: 'Detecting emotions and opinions from tone', outcome: 'Sense underlying irony or sarcasm through tonal shifts' },
        zh: { name: '說話者態度', desc: '從語氣中偵測情緒與意見', outcome: '透過語調變化感知隱含的反語或諷刺' }
    },
    listening_integratedTasks: {
        en: { name: 'Integrated Tasks', desc: 'Combining listening with writing/speaking', outcome: 'Synthesize audio data into high-scoring written reports' },
        zh: { name: '綜合任務', desc: '結合聽力、寫作與說話能力', outcome: '將聽力數據綜合轉化為高分的書面報告' }
    },
    listening_ambiguityHandling: {
        en: { name: 'Ambiguity Handling', desc: 'Interpreting unclear or indirect statements', outcome: 'Clarify indirect meanings in rapid-fire conversations' },
        zh: { name: '歧義處理', desc: '解釋不明確或間接的陳述', outcome: '在連珠炮式的對話中釐清間接含義' }
    },

    // SPEAKING
    // Cluster 1: Delivery & Musicality
    speaking_delivery_general: {
        cluster: 'delivery',
        group: 'core',
        en: { name: 'Voice & Clarity Master Quest', desc: 'Master your pronunciation, intonation, and clarity.', outcome: 'Achieve a crystal-clear and authoritative voice.' },
        zh: { name: '聲線與清晰度綜合訓練', desc: '發音、語調與清晰度的綜合評估', outcome: '達成清晰且具權威性的發音' }
    },
    speaking_pronunciationClarity: {
        cluster: 'delivery',
        isGranular: true,
        en: { name: 'Pronunciation Clarity', desc: 'Clear articulation of sounds', outcome: 'Polish complex phonemes for crystal-clear delivery' },
        zh: { name: '發音清晰度', desc: '清楚的語音表達', outcome: '磨練複雜音段以達成透明清晰的發音' }
    },
    speaking_intonation: {
        cluster: 'delivery',
        isGranular: true,
        en: { name: 'Intonation', desc: 'Natural rise and fall of voice', outcome: 'Use pitch and stress to command attention and emphasize meaning' },
        zh: { name: '語調變化', desc: '聲線自然的起伏', outcome: '運用音高與重音控制注意力並強調核心意義' }
    },
    speaking_paceRhythm: {
        cluster: 'delivery',
        isGranular: true,
        en: { name: 'Pace & Rhythm', desc: 'Speaking at appropriate speed with natural pauses', outcome: 'Master the art of natural pauses for maximum rhetorical impact' },
        zh: { name: '節奏與速度', desc: '以適當的速度說話並自然停頓', outcome: '掌握自然停頓的藝術以發揮最強大的修辭感染力' }
    },
    speaking_grammaticalAccuracy: {
        cluster: 'delivery',
        isGranular: true,
        en: { name: 'Grammatical Accuracy', desc: 'Correct structures while speaking', outcome: 'Speak with total grammatical precision, even at speed' },
        zh: { name: '語法準確度', desc: '說話時使用正確的句式結構', outcome: '即使在快速說話時亦能保持完美的語法準確度' }
    },

    // Cluster 2: Flow & Spontaneity
    speaking_flow_general: {
        cluster: 'flow',
        group: 'core',
        en: { name: 'Natural Response Flow Master Quest', desc: 'Master fluency, spontaneity, and natural confidence.', outcome: 'Build a natural, unstunnable flow in any conversation.' },
        zh: { name: '自然對話流暢度綜合訓練', desc: '流暢度、即興反應與自信心的綜合評估', outcome: '在任何對話中建立自然且流暢的反應' }
    },
    speaking_spontaneity: {
        cluster: 'flow',
        isGranular: true,
        en: { name: 'Spontaneity', desc: 'Thinking on feet, improvising responses', outcome: 'Improvise high-scoring answers even to unexpected questions' },
        zh: { name: '即興反應', desc: '能夠即席思考並作出回應', outcome: '面對意外提問亦能即興給出高分答案' }
    },
    speaking_confidence: {
        cluster: 'flow',
        isGranular: true,
        en: { name: 'Confidence & Naturalness', desc: 'Speaking without excessive hesitation', outcome: 'Deliver fluent, native-like responses with zero hesitation' },
        zh: { name: '自信心與自然度', desc: '說話流暢，無過度猶豫', outcome: '如母語般自信流暢地應答，毫無遲疑' }
    },
    speaking_vocabularyInSpeech: {
        cluster: 'flow',
        isGranular: true,
        en: { name: 'Vocabulary in Speech', desc: 'Using varied words naturally', outcome: 'Integrate academic vocabulary into natural-sounding speech' },
        zh: { name: '口語詞彙', desc: '自然地使用多樣化詞彙', outcome: '將學術詞彙自然融入日常口語表達中' }
    },

    // Cluster 3: Dynamic Interaction
    speaking_interaction_general: {
        cluster: 'interaction',
        group: 'core',
        en: { name: 'Group Discussion Skills Master Quest', desc: 'Master the art of group interaction and discussion.', outcome: 'Dominate any group discussion with strategic interaction.' },
        zh: { name: '小組討論技巧綜合訓練', desc: '小組討論與互動技術的綜合評估', outcome: '以策略性互動主導任何小組討論' }
    },
    speaking_turnTaking: {
        cluster: 'interaction',
        isGranular: true,
        en: { name: 'Turn-Taking', desc: 'Knowing when to speak and listen', outcome: 'Dominate group discussions with polite and strategic entry' },
        zh: { name: '輪流發言技巧', desc: '知道何時發言與聆聽', outcome: '以禮貌且具策略性的切入掌控小組討論節奏' }
    },
    speaking_activeListening: {
        cluster: 'interaction',
        isGranular: true,
        en: { name: 'Active Listening', desc: 'Responding relevantly to others', outcome: 'Showcase deep engagement by building perfectly on others\' points' },
        zh: { name: '積極聆聽', desc: '對他人的發言作出相關回應', outcome: '透過對他人觀點的完美承接展現深度參與度' }
    },
    speaking_facilitation: {
        cluster: 'interaction',
        isGranular: true,
        en: { name: 'Facilitation', desc: 'Encouraging others to contribute', outcome: 'Guide quiet teammates to speak and earn leadership marks' },
        zh: { name: '帶動討論', desc: '鼓勵他人參與對話', outcome: '引導沉悶的組員發言，贏取領導才能評語' }
    },
    speaking_groupDiscussion: {
        en: { name: 'Group Discussion (Part A)', desc: 'HKDSE Paper 4: Collaborating and discussing in a group', outcome: 'Secure a Level 5** with elite collaborative discussion techniques' },
        zh: { name: '小組討論 (Part A)', desc: 'HKDSE 卷四：在小組中協作與討論', outcome: '透過頂級協作討論技巧鎖定 5** 成績' }
    },
    speaking_individualResponse: {
        en: { name: 'Individual Response (Part B)', desc: 'HKDSE Paper 4: 1-minute response to examiner question', outcome: 'Deliver tight, 1-minute responses that leave examiners impressed' },
        zh: { name: '個別應答 (Part B)', desc: 'HKDSE 卷四：就考官問題進行一分鐘應答', outcome: '給出結構緊湊、令考官驚艷的一分鐘精彩應答' }
    }
};

export const getSkillName = (id, lang = 'en') => {
    if (MICRO_SKILLS[id]) return MICRO_SKILLS[id][lang]?.name || id;

    // Backward compatibility: try converting snake_case to camelCase
    // e.g. writing_vocabulary_range -> writing_vocabularyRange
    // Use /g for global replacement (fixes writing_word_choice_precision)
    const camelId = id.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        .replace('Appropriateness', 'Appropriate'); // Handle specific mismatch

    if (MICRO_SKILLS[camelId]) return MICRO_SKILLS[camelId][lang]?.name || id;

    return id;
};

export const getSkillDesc = (id, lang = 'en') => {
    if (MICRO_SKILLS[id]) return MICRO_SKILLS[id][lang]?.desc || '';

    // Global replacement for snake_case conversion
    const camelId = id.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        .replace('Appropriateness', 'Appropriate');

    if (MICRO_SKILLS[camelId]) return MICRO_SKILLS[camelId][lang]?.desc || '';

    return '';
};

export const getSkillOutcome = (id, lang = 'en') => {
    if (MICRO_SKILLS[id]) return MICRO_SKILLS[id][lang]?.outcome || '';

    const camelId = id.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        .replace('Appropriateness', 'Appropriate');

    if (MICRO_SKILLS[camelId]) return MICRO_SKILLS[camelId][lang]?.outcome || '';

    return '';
};
export const getSkillsByPaper = (paper) => {
    const prefix = paper.toLowerCase();
    return Object.keys(MICRO_SKILLS).filter(id => id.toLowerCase().startsWith(prefix));
};
