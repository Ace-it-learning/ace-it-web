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

    // SPEAKING (HKEAA Target Pillars + Master Quest)
    speaking_delivery: {
        en: { name: 'Pronunciation & Delivery', desc: 'Clarity, intonation, pace, and rhythm', outcome: 'Deliver speech with near-native intonation and clarity' },
        zh: { name: '發音與交付', desc: '發音清晰度、語調及說話節奏', outcome: '以近乎母語的自然語調清晰表達' },
        cluster: 'delivery'
    },
    speaking_strategies: {
        en: { name: 'Comm. Strategies', desc: 'Turn-taking, active listening, and facilitation', outcome: 'Strategically lead and facilitate group discussions' },
        zh: { name: '溝通策略', desc: '發言時機、積極聆聽及帶動討論', outcome: '以策略性互動引導並推向討論高潮' },
        cluster: 'interaction'
    },
    speaking_language: {
        en: { name: 'Language Patterns', desc: 'Vocabulary range and grammatical accuracy in speech', outcome: 'Master complex language patterns during live speech' },
        zh: { name: '語言模式', desc: '口語表達中詞彙的豐富度與語法準確性', outcome: '在即時說話中熟練運用複雜語言模式' },
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
                         prefix === 'speaking' ? 'speaking_' : prefix;
                         
    return Object.keys(MICRO_SKILLS).filter(id => id.startsWith(targetPrefix));
};
