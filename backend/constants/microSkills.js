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
        name: 'Text Organization',
        name_zh: '文本結構',
        paper: PAPERS.READING,
        category: 'Critical Reading Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Recognizing structure (compare/contrast, problem/solution)',
        description_zh: '辨識文章架構（比較/對比、問題/解決）'
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
    speaking_pronunciationClarity: {
        id: 'speaking_pronunciationClarity',
        name: 'Pronunciation Clarity',
        name_zh: '發音清晰度',
        paper: PAPERS.SPEAKING,
        category: 'Fluency & Delivery',
        group: SKILL_GROUPS.CORE,
        description: 'Clear articulation of sounds',
        description_zh: '清楚的語音表達'
    },
    speaking_intonation: {
        id: 'speaking_intonation',
        name: 'Intonation',
        name_zh: '語調變化',
        paper: PAPERS.SPEAKING,
        category: 'Fluency & Delivery',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Natural rise and fall of voice',
        description_zh: '聲線自然的起伏'
    },
    speaking_paceRhythm: {
        id: 'speaking_paceRhythm',
        name: 'Pace & Rhythm',
        name_zh: '節奏與速度',
        paper: PAPERS.SPEAKING,
        category: 'Fluency & Delivery',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Speaking at appropriate speed with natural pauses',
        description_zh: '以適當的速度說話並自然停頓'
    },
    speaking_confidence: {
        id: 'speaking_confidence',
        name: 'Confidence & Naturalness',
        name_zh: '自信心與自然度',
        paper: PAPERS.SPEAKING,
        category: 'Fluency & Delivery',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Speaking without excessive hesitation',
        description_zh: '說話流暢，無過度猶豫'
    },
    speaking_turnTaking: {
        id: 'speaking_turnTaking',
        name: 'Turn-Taking',
        name_zh: '輪流發言技巧',
        paper: PAPERS.SPEAKING,
        category: 'Interactive Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Knowing when to speak and listen',
        description_zh: '知道何時發言與聆聽'
    },
    speaking_activeListening: {
        id: 'speaking_activeListening',
        name: 'Active Listening',
        name_zh: '積極聆聽',
        paper: PAPERS.SPEAKING,
        category: 'Interactive Skills',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Responding relevantly to others',
        description_zh: '對他人的發言作出相關回應'
    },
    speaking_facilitation: {
        id: 'speaking_facilitation',
        name: 'Facilitation',
        name_zh: '帶動討論',
        paper: PAPERS.SPEAKING,
        category: 'Interactive Skills',
        group: SKILL_GROUPS.ADVANCED,
        description: 'Encouraging others to contribute',
        description_zh: '鼓勵他人參與對話'
    },
    speaking_spontaneity: {
        id: 'speaking_spontaneity',
        name: 'Spontaneity',
        name_zh: '即興反應',
        paper: PAPERS.SPEAKING,
        category: 'Language Use',
        group: SKILL_GROUPS.EXPERT,
        description: 'Thinking on feet, improvising responses',
        description_zh: '能夠即席思考並作出回應'
    },
    speaking_vocabularyInSpeech: {
        id: 'speaking_vocabularyInSpeech',
        name: 'Vocabulary in Speech',
        name_zh: '口語詞彙',
        paper: PAPERS.SPEAKING,
        category: 'Language Use',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Using varied words naturally',
        description_zh: '自然地使用多樣化詞彙'
    },
    speaking_grammaticalAccuracyInSpeech: {
        id: 'speaking_grammaticalAccuracyInSpeech',
        name: 'Grammatical Accuracy in Speech',
        name_zh: '口語語法準確度',
        paper: PAPERS.SPEAKING,
        category: 'Language Use',
        group: SKILL_GROUPS.INTERMEDIATE,
        description: 'Correct structures while speaking',
        description_zh: '說話時使用正確的句式結構'
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
