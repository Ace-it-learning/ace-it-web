/**
 * DSE English Micro-Skills Definitions
 * Total: 47 micro-skills across 4 papers
 */

const SKILL_GROUPS = {
    CORE: 'core',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    EXPERT: 'expert'
};

const PAPERS = {
    READING: 'reading',
    WRITING: 'writing',
    LISTENING: 'listening',
    SPEAKING: 'speaking'
};

// All 47 micro-skills with metadata
const MICRO_SKILLS = {
    // READING (12 skills)
    reading_literalComprehension: {
        id: 'reading_literalComprehension',
        name: 'Literal Comprehension',
        name_zh: '字面理解',
        paper: PAPERS.READING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.CORE,
        description: 'Understanding explicit information in texts',
        description_zh: '理解文中明確表達的資訊'
    },
    reading_inference: {
        id: 'reading_inference',
        name: 'Inference',
        name_zh: '推論能力',
        paper: PAPERS.READING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Reading between the lines, understanding implied meanings',
        description_zh: '閱讀字裡行間，理解隱含意思'
    },
    reading_mainIdea: {
        id: 'reading_mainIdea',
        name: 'Main Idea Identification',
        name_zh: '主旨識別',
        paper: PAPERS.READING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.CORE,
        description: 'Identifying central themes and arguments',
        description_zh: '辨識核心主題與論點'
    },
    reading_detailRecognition: {
        id: 'reading_detailRecognition',
        name: 'Detail Recognition',
        name_zh: '細節辨識',
        paper: PAPERS.READING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Locating specific facts and data',
        description_zh: '定位特定的事實與數據'
    },
    reading_sequencing: {
        id: 'reading_sequencing',
        name: 'Sequencing',
        name_zh: '排序能力',
        paper: PAPERS.READING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Understanding chronological order and cause-effect',
        description_zh: '理解時間順序與因果關係'
    },
    reading_synthesis: {
        id: 'reading_synthesis',
        name: 'Synthesis',
        name_zh: '綜合能力',
        paper: PAPERS.READING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Combining information from multiple sources',
        description_zh: '結合多個來源的資訊'
    },
    reading_factVsOpinion: {
        id: 'reading_factVsOpinion',
        name: 'Fact vs Opinion',
        name_zh: '事實與意見',
        paper: PAPERS.READING,
        category: 'Critical Reading Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Distinguishing objective from subjective statements',
        description_zh: '區分客觀與主觀陳述'
    },
    reading_authorPurpose: {
        id: 'reading_authorPurpose',
        name: "Author's Purpose",
        name_zh: '作者意圖',
        paper: PAPERS.READING,
        category: 'Critical Reading Skills',
        group: SKILL_GROUPS.EXPERT,
        description: 'Identifying intent (persuade, inform, entertain)',
        description_zh: '辨識寫作目的（說服、通知、娛樂）'
    },
    reading_toneAttitude: {
        id: 'reading_toneAttitude',
        name: 'Tone & Attitude',
        name_zh: '語氣與態度',
        paper: PAPERS.READING,
        category: 'Critical Reading Skills',
        group: SKILL_GROUPS.ADVANCED,
        description: "Detecting writer's stance and emotions",
        description_zh: '偵測作者的立場與情緒'
    },
    reading_registerStyle: {
        id: 'reading_registerStyle',
        name: 'Register & Style',
        name_zh: '語體與風格',
        paper: PAPERS.READING,
        category: 'Critical Reading Skills',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Recognizing formal/informal language',
        description_zh: '辨識正式或非正式語言'
    },
    reading_metaphoricalLanguage: {
        id: 'reading_metaphoricalLanguage',
        name: 'Metaphorical Language',
        name_zh: '比喻語言',
        paper: PAPERS.READING,
        category: 'Critical Reading Skills',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Understanding figurative expressions',
        description_zh: '理解修辭與比喻表達'
    },
    reading_textOrganization: {
        id: 'reading_textOrganization',
        name: 'Text Organisation',
        name_zh: '文本結構',
        paper: PAPERS.READING,
        category: 'Critical Reading Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Recognizing structure (compare/contrast, problem/solution)',
        description_zh: '辨識文章架構（比較/對比、問題/解決）'
    },
    reading_skimmingScanning: {
        id: 'reading_skimmingScanning',
        name: 'Skimming & Scanning',
        name_zh: '略讀與掃描',
        paper: PAPERS.READING,
        category: 'Search Strategies',
        group: SKILL_GROUPS.CORE,
        description: 'Quickly locating keywords and gisting paragraphs',
        description_zh: '快速定位關鍵字及掌握段落大意'
    },
    reading_paraphrasing: {
        id: 'reading_paraphrasing',
        name: 'Paraphrasing',
        name_zh: '改寫能力',
        paper: PAPERS.READING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Restating information using different words/structures',
        description_zh: '使用不同的詞彙/結構重述資訊'
    },
    reading_cohesionReference: {
        id: 'reading_cohesionReference',
        name: 'Cohesion & Reference',
        name_zh: '銜接與指代',
        paper: PAPERS.READING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Understanding grammatical links (it/this/them)',
        description_zh: '理解文中的語法連結及指代表達'
    },

    // WRITING (15 skills)
    writing_relevance: {
        id: 'writing_relevance',
        name: 'Relevance',
        name_zh: '內容扣題',
        paper: PAPERS.WRITING,
        category: 'Content & Ideas',
        group: SKILL_GROUPS.CORE,
        description: 'Staying on topic and addressing the prompt',
        description_zh: '確保內容符合主題並回應題目'
    },
    writing_development: {
        id: 'writing_development',
        name: 'Development',
        name_zh: '內容拓展',
        paper: PAPERS.WRITING,
        category: 'Content & Ideas',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Elaborating ideas with examples and details',
        description_zh: '使用例子和細節發展觀點'
    },
    writing_originality: {
        id: 'writing_originality',
        name: 'Originality',
        name_zh: '創意發揮',
        paper: PAPERS.WRITING,
        category: 'Content & Ideas',
        group: SKILL_GROUPS.EXPERT,
        description: 'Presenting unique perspectives and insights',
        description_zh: '展現獨特見解與思維'
    },
    writing_vocabularyRange: {
        id: 'writing_vocabularyRange',
        name: 'Vocabulary Range',
        name_zh: '詞彙豐富度',
        paper: PAPERS.WRITING,
        category: 'Language & Vocabulary',
        group: SKILL_GROUPS.CORE,
        description: 'Using varied and precise words',
        description_zh: '使用多樣化且精準的詞彙'
    },
    writing_collocations: {
        id: 'writing_collocations',
        name: 'Collocations',
        name_zh: '詞語搭配',
        paper: PAPERS.WRITING,
        category: 'Language & Vocabulary',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Natural word combinations',
        description_zh: '自然的詞語組合'
    },
    writing_idiomaticExpressions: {
        id: 'writing_idiomaticExpressions',
        name: 'Idiomatic Expressions',
        name_zh: '慣用語表達',
        paper: PAPERS.WRITING,
        category: 'Language & Vocabulary',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Appropriate use of idioms and phrases',
        description_zh: '恰當使用成語語常用表達'
    },
    writing_registerAppropriate: {
        id: 'writing_registerAppropriate',
        name: 'Register Appropriateness',
        name_zh: '語體適切度',
        paper: PAPERS.WRITING,
        category: 'Language & Vocabulary',
        group: SKILL_GROUPS.EXPERT,
        description: 'Matching formality to context',
        description_zh: '根據情境調整正式程度'
    },
    writing_wordChoicePrecision: {
        id: 'writing_wordChoicePrecision',
        name: 'Word Choice Precision',
        name_zh: '選詞精準度',
        paper: PAPERS.WRITING,
        category: 'Language & Vocabulary',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Selecting exact words for meaning',
        description_zh: '挑選最準確的用詞以表達意圖'
    },
    writing_sentenceVariety: {
        id: 'writing_sentenceVariety',
        name: 'Sentence Variety',
        name_zh: '句式變化',
        paper: PAPERS.WRITING,
        category: 'Grammar & Sentence Structure',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Mix of simple, compound, complex sentences',
        description_zh: '結合簡單、並列與複合句'
    },
    writing_advancedStructures: {
        id: 'writing_advancedStructures',
        name: 'Advanced Structures',
        name_zh: '高級句式',
        paper: PAPERS.WRITING,
        category: 'Grammar & Sentence Structure',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Inversion, cleft sentences, conditionals',
        description_zh: '使用倒裝、強調句、條件句等'
    },
    writing_grammaticalAccuracy: {
        id: 'writing_grammaticalAccuracy',
        name: 'Grammatical Accuracy',
        name_zh: '語法準確度',
        paper: PAPERS.WRITING,
        category: 'Grammar & Sentence Structure',
        group: SKILL_GROUPS.CORE,
        description: 'Correct tenses, subject-verb agreement',
        description_zh: '確保時態、主謂一致等正確'
    },
    writing_punctuation: {
        id: 'writing_punctuation',
        name: 'Punctuation',
        name_zh: '標點符號',
        paper: PAPERS.WRITING,
        category: 'Grammar & Sentence Structure',
        group: SKILL_GROUPS.CORE,
        description: 'Proper use of commas, semicolons, etc.',
        description_zh: '正確使用逗號、分號等'
    },
    writing_paragraphStructure: {
        id: 'writing_paragraphStructure',
        name: 'Paragraph Structure',
        name_zh: '段落結構',
        paper: PAPERS.WRITING,
        category: 'Organization & Coherence',
        group: SKILL_GROUPS.CORE,
        description: 'Topic sentences, supporting details, conclusions',
        description_zh: '運用主題句、支持細節與結語'
    },
    writing_transitions: {
        id: 'writing_transitions',
        name: 'Transitions',
        name_zh: '過渡銜接',
        paper: PAPERS.WRITING,
        category: 'Organization & Coherence',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Smooth connections between ideas',
        description_zh: '在想法之間建立平滑連接'
    },
    writing_overallCoherence: {
        id: 'writing_overallCoherence',
        name: 'Overall Coherence',
        name_zh: '整體連貫度',
        paper: PAPERS.WRITING,
        category: 'Organization & Coherence',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Logical flow from introduction to conclusion',
        description_zh: '從引言到結論的邏輯流動'
    },
    writing_general: {
        id: 'writing_general',
        name: 'Generic Writing Task',
        name_zh: '綜合寫作練習',
        paper: PAPERS.WRITING,
        category: 'General Writing',
        group: SKILL_GROUPS.CORE,
        description: 'All-purpose writing practice covering various DSE-style prompts.',
        description_zh: '涵蓋各種 DSE 風格題目的綜合寫作練習。'
    },

    // WRITING GENRES (The Genre Factory)
    writing_genre_debate: {
        id: 'writing_genre_debate',
        name: 'Debate Speech',
        name_zh: '辯論演講',
        paper: PAPERS.WRITING,
        category: 'Argumentative',
        group: SKILL_GROUPS.CORE,
        description: 'Master the art of logical persuasion and counter-arguments.',
        description_zh: '掌握邏輯說服與反駁技巧。'
    },
    writing_genre_lte: {
        id: 'writing_genre_lte',
        name: 'Letter to the Editor',
        name_zh: '給編輯的信',
        paper: PAPERS.WRITING,
        category: 'Argumentative',
        group: SKILL_GROUPS.CORE,
        description: 'Express your views on social issues with clarity and impact.',
        description_zh: '針對社會議題清晰且有力地表達見解。'
    },
    writing_genre_exp: {
        id: 'writing_genre_exp',
        name: 'Expository Essay',
        name_zh: '說明文',
        paper: PAPERS.WRITING,
        category: 'Argumentative',
        group: SKILL_GROUPS.CORE,
        description: 'Explain complex concepts with systematic logic and evidence.',
        description_zh: '以系統性邏輯與證據解釋複雜概念。'
    },
    writing_genre_fic: {
        id: 'writing_genre_fic',
        name: 'Short Story',
        name_zh: '短篇故事',
        paper: PAPERS.WRITING,
        category: 'Narrative',
        group: SKILL_GROUPS.CORE,
        description: 'Build engaging narratives with character and tension.',
        description_zh: '構建富有角色深度與張力的敘事。'
    },
    writing_genre_per: {
        id: 'writing_genre_per',
        name: 'Personal Experience',
        name_zh: '個人經驗',
        paper: PAPERS.WRITING,
        category: 'Narrative',
        group: SKILL_GROUPS.CORE,
        description: 'Reflect on life events with descriptive and engaging language.',
        description_zh: '以生動且具感染力的語言反思生活事件。'
    },
    writing_genre_bio: {
        id: 'writing_genre_bio',
        name: 'Biographical Profile',
        name_zh: '人物簡介',
        paper: PAPERS.WRITING,
        category: 'Narrative',
        group: SKILL_GROUPS.CORE,
        description: 'Document the lives of inspiring individuals with precision.',
        description_zh: '精確記錄具啟發性的人物生活。'
    },
    writing_genre_fml: {
        id: 'writing_genre_fml',
        name: 'Formal Letter',
        name_zh: '正式書信',
        paper: PAPERS.WRITING,
        category: 'Transactional',
        group: SKILL_GROUPS.CORE,
        description: 'Communicate with authority and professional register.',
        description_zh: '以專業語體與權威感進行溝通。'
    },
    writing_genre_rpt: {
        id: 'writing_genre_rpt',
        name: 'Report',
        name_zh: '報告',
        paper: PAPERS.WRITING,
        category: 'Transactional',
        group: SKILL_GROUPS.CORE,
        description: 'Synthesize data and findings into a structured format.',
        description_zh: '將數據與發現綜合為結構化的格式。'
    },
    writing_genre_prp: {
        id: 'writing_genre_prp',
        name: 'Proposal',
        name_zh: '建議書',
        paper: PAPERS.WRITING,
        category: 'Transactional',
        group: SKILL_GROUPS.CORE,
        description: 'Persuade stakeholders with well-planned initiatives.',
        description_zh: '以周全的計劃倡議說服利益相關者。'
    },
    writing_genre_rev: {
        id: 'writing_genre_rev',
        name: 'Review',
        name_zh: '評論',
        paper: PAPERS.WRITING,
        category: 'Discursive',
        group: SKILL_GROUPS.CORE,
        description: 'Analyze and evaluate products or events with subjective flair.',
        description_zh: '以主觀風格分析與評估產品或活動。'
    },
    writing_genre_art: {
        id: 'writing_genre_art',
        name: 'Feature Article',
        name_zh: '特寫文章',
        paper: PAPERS.WRITING,
        category: 'Discursive',
        group: SKILL_GROUPS.CORE,
        description: 'Capture attention with catchy headlines and direct address.',
        description_zh: '以吸睛標題與直接受眾對話捕捉注意力。'
    },
    writing_genre_let: {
        id: 'writing_genre_let',
        name: 'Personal Letter/Email',
        name_zh: '個人書信/電郵',
        paper: PAPERS.WRITING,
        category: 'Discursive',
        group: SKILL_GROUPS.CORE,
        description: 'Connect with readers using a personal and friendly tone.',
        description_zh: '以個人且友好的語體與讀者連結。'
    },

    // LISTENING (10 skills)
    listening_mainIdea: {
        id: 'listening_mainIdea',
        name: 'Main Idea Listening',
        name_zh: '主旨聆聽',
        paper: PAPERS.LISTENING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.CORE,
        description: 'Grasping overall message',
        description_zh: '掌握整體訊息'
    },
    listening_detailListening: {
        id: 'listening_detailListening',
        name: 'Detail Listening',
        name_zh: '細節聆聽',
        paper: PAPERS.LISTENING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Catching specific information (names, dates, numbers)',
        description_zh: '捕捉具體資訊（名字、日期、數字）'
    },
    listening_noteTaking: {
        id: 'listening_noteTaking',
        name: 'Note-Taking',
        name_zh: '筆記技巧',
        paper: PAPERS.LISTENING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Recording key points accurately',
        description_zh: '準確記錄關鍵點'
    },
    listening_prediction: {
        id: 'listening_prediction',
        name: 'Prediction',
        name_zh: '預測能力',
        paper: PAPERS.LISTENING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Anticipating what comes next',
        description_zh: '預期接下來的內容'
    },
    listening_gist: {
        id: 'listening_gist',
        name: 'Listening for Gist',
        name_zh: '聽取大意',
        paper: PAPERS.LISTENING,
        category: 'Comprehension Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Understanding general meaning without every word',
        description_zh: '理解大概意思而無需聽懂每個字'
    },
    listening_accentRecognition: {
        id: 'listening_accentRecognition',
        name: 'Accent Recognition',
        name_zh: '口音辨識',
        paper: PAPERS.LISTENING,
        category: 'Advanced Listening Skills',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Understanding different English accents',
        description_zh: '理解不同地方的英語口音'
    },
    listening_speedProcessing: {
        id: 'listening_speedProcessing',
        name: 'Speed Processing',
        name_zh: '速度處理',
        paper: PAPERS.LISTENING,
        category: 'Advanced Listening Skills',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Handling fast speech rates',
        description_zh: '應對快速的說話速度'
    },
    listening_speakerAttitude: {
        id: 'listening_speakerAttitude',
        name: 'Speaker Attitude',
        name_zh: '說話者態度',
        paper: PAPERS.LISTENING,
        category: 'Advanced Listening Skills',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Detecting emotions and opinions from tone',
        description_zh: '從語氣中偵測情緒與意見'
    },
    listening_integratedTasks: {
        id: 'listening_integratedTasks',
        name: 'Integrated Tasks',
        name_zh: '綜合任務',
        paper: PAPERS.LISTENING,
        category: 'Advanced Listening Skills',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Combining listening with writing/speaking',
        description_zh: '結合聽力、寫作與說話能力'
    },
    listening_ambiguityHandling: {
        id: 'listening_ambiguityHandling',
        name: 'Ambiguity Handling',
        name_zh: '歧義處理',
        paper: PAPERS.LISTENING,
        category: 'Advanced Listening Skills',
        group: SKILL_GROUPS.EXPERT,
        description: 'Interpreting unclear or indirect statements',
        description_zh: '解釋不明確或間接的陳述'
    },

    // SPEAKING (10 skills)
    // SPEAKING (10 skills)
    // Cluster 1: Delivery & Musicality (Mechanical Excellence)
    speaking_pronunciationClarity: {
        id: 'speaking_pronunciationClarity',
        name: 'Pronunciation Clarity',
        name_zh: '發音清晰度',
        paper: PAPERS.SPEAKING,
        category: 'Mechanical Excellence',
        group: SKILL_GROUPS.CORE,
        description: 'Clear articulation of sounds (Phonetic Precision)',
        description_zh: '清楚的語音表達（語音精確度）'
    },
    speaking_intonation: {
        id: 'speaking_intonation',
        name: 'Intonation',
        name_zh: '語調變化',
        paper: PAPERS.SPEAKING,
        category: 'Mechanical Excellence',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Natural rise and fall of voice (Vocal Melody)',
        description_zh: '聲線自然的起伏（語音旋律）'
    },
    speaking_paceRhythm: {
        id: 'speaking_paceRhythm',
        name: 'Pace & Rhythm',
        name_zh: '節奏與速度',
        paper: PAPERS.SPEAKING,
        category: 'Mechanical Excellence',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Stress-timed rhythm and appropriate speed',
        description_zh: '重音節奏與適當的速度'
    },
    speaking_grammaticalAccuracy: {
        id: 'speaking_grammaticalAccuracy',
        name: 'Grammatical Accuracy',
        name_zh: '語法準確度',
        paper: PAPERS.SPEAKING,
        category: 'Mechanical Excellence',
        group: SKILL_GROUPS.CORE,
        description: 'Correct structures while speaking',
        description_zh: '說話時使用正確的句式結構'
    },

    // Cluster 2: Flow & Spontaneity (Fluency)
    speaking_spontaneity: {
        id: 'speaking_spontaneity',
        name: 'Spontaneity',
        name_zh: '即興反應',
        paper: PAPERS.SPEAKING,
        category: 'Fluency',
        group: SKILL_GROUPS.EXPERT,
        description: 'Thinking on feet, avoiding mental translation',
        description_zh: '即席思考，避免在腦中翻譯'
    },
    speaking_confidence: {
        id: 'speaking_confidence',
        name: 'Confidence & Naturalness',
        name_zh: '自信心與自然度',
        paper: PAPERS.SPEAKING,
        category: 'Fluency',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Speaking without excessive hesitation or "flat" tone',
        description_zh: '說話流暢，無過度猶豫或語氣平淡'
    },
    speaking_vocabularyInSpeech: {
        id: 'speaking_vocabularyInSpeech',
        name: 'Vocabulary in Speech',
        name_zh: '口語詞彙',
        paper: PAPERS.SPEAKING,
        category: 'Fluency',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Using varied words and collocations',
        description_zh: '自然地使用多樣化詞彙與搭配詞'
    },

    // Cluster 3: Dynamic Interaction (Social Collaboration)
    speaking_turnTaking: {
        id: 'speaking_turnTaking',
        name: 'Turn-Taking',
        name_zh: '輪流發言技巧',
        paper: PAPERS.SPEAKING,
        category: 'Social Collaboration',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Polite interruption and entry into conversation',
        description_zh: '禮貌地打斷並進入對話'
    },
    speaking_activeListening: {
        id: 'speaking_activeListening',
        name: 'Active Listening',
        name_zh: '積極聆聽',
        paper: PAPERS.SPEAKING,
        category: 'Social Collaboration',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Acknowledging others\' points (Recasting/Paraphrasing)',
        description_zh: '確認他人的論點（重述/改寫）'
    },
    speaking_facilitation: {
        id: 'speaking_facilitation',
        name: 'Facilitation',
        name_zh: '帶動討論',
        paper: PAPERS.SPEAKING,
        category: 'Social Collaboration',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Inviting others to contribute (Diplomacy)',
        description_zh: '邀請他人參與對話（外交手腕）'
    },
};

// Helper functions
const getAllSkills = () => Object.values(MICRO_SKILLS);
const getSkillsByPaper = (paper) => getAllSkills().filter(s => s.paper === paper);
const getSkillsByGroup = (group) => getAllSkills().filter(s => s.group === group);
const getSkillById = (id) => MICRO_SKILLS[id];

module.exports = {
    MICRO_SKILLS,
    SKILL_GROUPS,
    PAPERS,
    getAllSkills,
    getSkillsByPaper,
    getSkillsByGroup,
    getSkillById
};
