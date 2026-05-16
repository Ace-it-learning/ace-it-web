/**
 * Frontend Micro-Skills Constants (HKEAA Aligned)
 * Source of truth for skill names and descriptions in both English and Traditional Chinese.
 */

export const MICRO_SKILLS = {
    // READING (15 Granular Skills for Paper 1)
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

    // WRITING (HKEAA Target Pillars)
    writing_content: {
        en: { name: 'Content', desc: 'Relevance, development, and originality of ideas', outcome: 'Master topic development and audience engagement' },
        zh: { name: '內容與展現', desc: '主題相關性、內容發展及創意發揮', outcome: '精確回應題目要求並豐富發展論點' }
    },
    writing_language: {
        en: { name: 'Language', desc: 'Vocabulary range, grammatical accuracy, and precision', outcome: 'Wield high-level grammar and sophisticated vocabulary' },
        zh: { name: '語言與詞彙', desc: '詞彙豐富度、語法準確性及選詞精準度', outcome: '游刃有餘地運用高階語法與精準詞彙' }
    },
    writing_organization: {
        en: { name: 'Organization', desc: 'Coherence, paragraph structure, and transitions', outcome: 'Craft perfectly structured and cohesive essays' },
        zh: { name: '結構與銜接', desc: '連貫性、段落結構及過渡銜接', outcome: '打造結構嚴謹且邏輯連貫的專業文章' }
    },
    writing_quest: {
        en: { name: 'Writing Quest', desc: 'Master diverse writing genres through high-fidelity mission simulation.', outcome: 'Achieve Level 5** proficiency across all DSE writing formats.' },
        zh: { name: '寫作任務', desc: '透過高擬真任務模擬，精通多種寫作文體。', outcome: '在所有 DSE 寫作格式中達到 5** 水準。' },
        isIntegrated: true
    },

    // LISTENING (HKEAA Target Pillars)
    listening_part_a: {
        en: { name: 'Comprehension', desc: 'Accuracy in extracting factual data and implicit meanings', outcome: 'Achieve near-perfect accuracy in high-speed listening' },
        zh: { name: '聆聽理解', desc: '精確選取事實數據與理解隱含意義', outcome: '在高速聆聽中達到近乎完美的準確率' }
    },
    listening_content: {
        en: { name: 'Content', desc: 'Synthesizing data file info and auditory points', outcome: 'Flawlessly combine multi-source data for tasks' },
        zh: { name: '內容綜合', desc: '綜合處理數據文件資訊與聽力重點', outcome: '完美整合多方數據以完成複雜任務' }
    },
    listening_language: {
        en: { name: 'Language', desc: 'Register, appropriateness, and precision in writing', outcome: 'Maintain professional tone and stylistic accuracy' },
        zh: { name: '語言運用', desc: '語體適切度及寫作時的精準度', outcome: '全程保持專業語調與風格的一致性' }
    },
    listening_organization: {
        en: { name: 'Organization', desc: 'Coherence and professional text formatting', outcome: 'Structure integrated tasks with elite formatting' },
        zh: { name: '文章結構', desc: '連貫性與專業文本格式編排', outcome: '以頂級排版和結構完成綜合任務' }
    },
    listening_quest: {
        en: { name: 'Listening Quest', desc: 'Synthesize data file info and auditory clues for Paper 3 excellence.', outcome: 'Master integrated tasks with precision and speed.' },
        zh: { name: '聆聽任務', desc: '綜合處理數據文件資訊與聽力重點，追求卷三卓越表現。', outcome: '以精確度和速度掌握綜合處理任務。' },
        isIntegrated: true
    },

    // SPEAKING (HKEAA Target Pillars + Master Quest)
    speaking_delivery: {
        en: { name: 'Pronunciation', desc: 'Clarity, intonation, pace, and rhythm', outcome: 'Deliver speech with near-native intonation and clarity' },
        zh: { name: '發音', desc: '發音清晰度、語調及說話節奏', outcome: '以近乎母語的自然語調清晰表達' },
        cluster: 'delivery'
    },
    speaking_strategies: {
        en: { name: 'Communication Strategies', desc: 'Turn-taking, active listening, and facilitation', outcome: 'Strategically lead and facilitate group discussions' },
        zh: { name: '溝通策略', desc: '發言時機、積極聆聽及帶動討論', outcome: '以策略性互動引導並推向討論高潮' },
        cluster: 'interaction'
    },
    speaking_language: {
        en: { name: 'Vocabulary', desc: 'Vocabulary range and grammatical accuracy in speech', outcome: 'Master complex language patterns during live speech' },
        zh: { name: '詞彙', desc: '口語表達中詞彙的豐富度與語法準確性', outcome: '在即時說話中熟練運用複雜語言模式' },
        cluster: 'flow'
    },
    speaking_organization: {
        en: { name: 'Ideas & Organization', desc: 'Topic development, relevance, and logical flow', outcome: 'Develop unique ideas with flawless logical flow' },
        zh: { name: '點子與組織', desc: '主題發展、相關性及邏輯連貫性', outcome: '以完美邏輯呈現具備深度的獨特見解' },
        cluster: 'flow'
    },
    speaking_groupDiscussion: {
        en: { name: 'Group Discussion', desc: 'Full DSE-style group interaction simulating the real exam environment', outcome: 'Master group interaction through high-fidelity DSE simulation' },
        zh: { name: '小組討論', desc: '全 DSE 模式小組互動，模擬真實考試環境', outcome: '透過高擬真 DSE 模擬掌握小組互動技巧' },
        isIntegrated: true,
        cluster: 'interaction'
    },

    // GRAMMAR LAB (13 modules)
    grammar_accuracy_sva: {
        en: { name: 'Subject-Verb Agreement', desc: 'Ensuring subjects and verbs match in number.', outcome: 'Master core SVA rules to eliminate fossilized errors.' },
        zh: { name: '主謂一致性', desc: '確保主語與謂語動詞在單複數上保持一致。', outcome: '掌握核心 SVA 規則，消除根深蒂固的語法錯誤。' }
    },
    grammar_accuracy_tense: {
        en: { name: 'Tense Consistency', desc: 'Maintaining logical tense sequences in writing.', outcome: 'Maintain flawless tense sequences throughout complex narratives.' },
        zh: { name: '時態一致性', desc: '在寫作中保持邏輯連貫的時態序列。', outcome: '在複雜敘述中保持完美無瑕的時態連貫性。' }
    },
    grammar_accuracy_countable: {
        en: { name: 'Countable/Uncountable', desc: 'Correct usage of plurals and quantifiers.', outcome: 'Precisely navigate the complexities of noun usage.' },
        zh: { name: '可數與不可數名詞', desc: '正確使用名詞複數與數量詞。', outcome: '精確處理複雜的名詞使用規則。' }
    },
    grammar_accuracy_wordform: {
        en: { name: 'Word Form', desc: 'Selecting the correct noun, verb, adjective, or adverb.', outcome: 'Achieve 100% accuracy in morphological word transformations.' },
        zh: { name: '詞性與詞形', desc: '根據語境選擇正確的名詞、動詞、形容詞或副詞。', outcome: '在詞形變化任務中達到百分百準確率。' }
    },
    grammar_accuracy_pronoun: {
        en: { name: 'Pronoun Reference', desc: 'Ensuring pronouns clearly refer to the correct nouns.', outcome: 'Master pronoun consistency and resolve ambiguous references.' },
        zh: { name: '代詞指代', desc: '確保代詞清晰地指代正確的名詞。', outcome: '掌握代詞一致性並解決歧義指代。' }
    },
    grammar_elite_inversion: {
        en: { name: 'Inversion Mastery', desc: 'Using advanced inverted structures for emphasis.', outcome: 'Wield powerful inverted structures to wow examiners.' },
        zh: { name: '倒裝句大師', desc: '使用高級倒裝句式以增強語氣。', outcome: '熟練運用強而有力的倒裝結構令考官眼前一亮。' }
    },
    grammar_elite_subjunctive: {
        en: { name: 'Subjunctive Mood', desc: 'Expressing hypothetical or contrary-to-fact situations.', outcome: 'Sophisticatedly express hypothetical scenarios with total control.' },
        zh: { name: '虛擬語氣', desc: '表達假設性或與事實相反的情況。', outcome: '以完全掌控力細膩表達假設場景。' }
    },
    grammar_elite_participle: {
        en: { name: 'Participle Phrases', desc: 'Using participles to create concise, elegant sentences.', outcome: 'Elevate writing style with complex participle structures.' },
        zh: { name: '分詞短語', desc: '使用分詞結構構建簡潔且優雅的句子。', outcome: '運用複雜的分詞結構提升寫作風格。' }
    },
    grammar_elite_cohesion: {
        en: { name: 'Advanced Cohesion', desc: 'Sophisticated linking of complex arguments.', outcome: 'Forge unbreakable logical links between high-level concepts.' },
        zh: { name: '高級銜接技巧', desc: '在複雜論點之間建立高層次的邏輯銜接。', outcome: '在高深概念之間建立牢不可破的邏輯連結。' }
    },
    grammar_elite_nominal: {
        en: { name: 'Nominal Clauses', desc: 'Using entire clauses as subjects or objects.', outcome: 'Master complex sentence structures using noun clauses.' },
        zh: { name: '名詞性從句', desc: '將整個從句用作主語或賓語。', outcome: '掌握使用名詞性從句的複雜句子結構。' }
    },
    grammar_elite_relative: {
        en: { name: 'Advanced Relative Clauses', desc: 'Sophisticated noun modification using prepositions and quantity.', outcome: 'Master elite relative structures like "of whom" and "whereby".' },
        zh: { name: '高級關係從句', desc: '使用介詞與數量詞進行高層次的名詞修飾。', outcome: '掌握「of whom」及「whereby」等精英級關係結構。' }
    },
    grammar_elite_modals: {
        en: { name: 'Modal Nuance', desc: 'Expressing precise degrees of certainty, obligation, and advice.', outcome: 'Wield modals with surgical precision for persuasive writing.' },
        zh: { name: '情態動詞辨析', desc: '表達精確的確定性、義務及建議程度。', outcome: '在說服性寫作中精確運用情態動詞。' }
    },
    grammar_elite_passive: {
        en: { name: 'Passive Variations', desc: 'Using advanced passive structures for objectivity and emphasis.', outcome: 'Master impersonal and complex passive forms for academic excellence.' },
        zh: { name: '被動語態變體', desc: '使用高級被動結構以增強客觀性與強調。', outcome: '掌握無人稱及複雜被動形式，追求學術卓越。' }
    }
};

/**
 * Resolves which paper (reading, writing, listening, speaking) a skill belongs to.
 */
export const getPaperBySkill = (skillId) => {
    if (!skillId) return null;
    if (skillId.startsWith('reading_')) return 'reading';
    if (skillId.startsWith('writing_')) return 'writing';
    if (skillId.startsWith('listening_')) return 'listening';
    if (skillId.startsWith('speaking_')) return 'speaking';
    if (skillId.startsWith('grammar_')) return 'grammar';
    return null;
};

export const getSkillName = (id, lang = 'en') => {
    if (MICRO_SKILLS[id]) return MICRO_SKILLS[id][lang]?.name || id;

    // Fallback for snake_case to pillar mapping if needed (legacy)
    const normalizedId = id.toLowerCase();
    if (normalizedId.includes('content')) return lang === 'en' ? 'Content' : '內容';
    if (normalizedId.includes('language') || normalizedId.includes('grammar') || normalizedId.includes('vocabulary')) return lang === 'en' ? 'Language' : '語言';
    if (normalizedId.includes('organization') || normalizedId.includes('coherence') || normalizedId.includes('structure')) return lang === 'en' ? 'Organization' : '組織';
    
    return id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getSkillDesc = (id, lang = 'en') => {
    if (MICRO_SKILLS[id]) return MICRO_SKILLS[id][lang]?.desc || '';
    return '';
};

export const getSkillOutcome = (id, lang = 'en') => {
    if (MICRO_SKILLS[id]) return MICRO_SKILLS[id][lang]?.outcome || '';
    return '';
};

export const getSkillsByPaper = (paper) => {
    const prefix = paper.toLowerCase();
    // Special handling for legacy input 'Reading' -> 'reading'
    const targetPrefix = prefix === 'reading' ? 'reading_' : 
                         prefix === 'writing' ? 'writing_' : 
                         prefix === 'listening' ? 'listening_' : 
                         prefix === 'speaking' ? 'speaking_' :
                         prefix === 'grammar' ? 'grammar_' : prefix;
                         
    return Object.keys(MICRO_SKILLS).filter(id => id.startsWith(targetPrefix));
};
