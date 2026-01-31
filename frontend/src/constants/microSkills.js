/**
 * Frontend Micro-Skills Constants
 * Source of truth for skill names and descriptions in both English and Traditional Chinese.
 */

export const MICRO_SKILLS = {
    // READING
    reading_literalComprehension: {
        en: { name: 'Literal Comprehension', desc: 'Understanding explicit information in texts' },
        zh: { name: '字面理解', desc: '理解文中明確表達的資訊' }
    },
    reading_inference: {
        en: { name: 'Inference', desc: 'Reading between the lines, understanding implied meanings' },
        zh: { name: '推論能力', desc: '閱讀字裡行間，理解隱含意思' }
    },
    reading_mainIdea: {
        en: { name: 'Main Idea Identification', desc: 'Identifying central themes and arguments' },
        zh: { name: '主旨識別', desc: '辨識核心主題與論點' }
    },
    reading_detailRecognition: {
        en: { name: 'Detail Recognition', desc: 'Locating specific facts and data' },
        zh: { name: '細節辨識', desc: '定位特定的事實與數據' }
    },
    reading_sequencing: {
        en: { name: 'Sequencing', desc: 'Understanding chronological order and cause-effect' },
        zh: { name: '排序能力', desc: '理解時間順序與因果關係' }
    },
    reading_synthesis: {
        en: { name: 'Synthesis', desc: 'Combining information from multiple sources' },
        zh: { name: '綜合能力', desc: '結合多個來源的資訊' }
    },
    reading_factVsOpinion: {
        en: { name: 'Fact vs Opinion', desc: 'Distinguishing objective from subjective statements' },
        zh: { name: '事實與意見', desc: '區分客觀與主觀陳述' }
    },
    reading_authorPurpose: {
        en: { name: "Author's Purpose", desc: 'Identifying intent (persuade, inform, entertain)' },
        zh: { name: '作者意圖', desc: '辨識寫作目的（說服、通知、娛樂）' }
    },
    reading_toneAttitude: {
        en: { name: 'Tone & Attitude', desc: "Detecting writer's stance and emotions" },
        zh: { name: '語氣與態度', desc: '偵測作者的立場與情緒' }
    },
    reading_registerStyle: {
        en: { name: 'Register & Style', desc: 'Recognizing formal/informal language' },
        zh: { name: '語體與風格', desc: '辨識正式或非正式語言' }
    },
    reading_metaphoricalLanguage: {
        en: { name: 'Metaphorical Language', desc: 'Understanding figurative expressions' },
        zh: { name: '比喻語言', desc: '理解修辭與比喻表達' }
    },
    reading_textOrganization: {
        en: { name: 'Text Organization', desc: 'Recognizing structure (compare/contrast, problem/solution)' },
        zh: { name: '文本結構', desc: '辨識文章架構（比較/對比、問題/解決）' }
    },

    // WRITING
    writing_relevance: {
        en: { name: 'Relevance', desc: 'Staying on topic and addressing the prompt' },
        zh: { name: '內容扣題', desc: '確保內容符合主題並回應題目' }
    },
    writing_development: {
        en: { name: 'Development', desc: 'Elaborating ideas with examples and details' },
        zh: { name: '內容拓展', desc: '使用例子和細節發展觀點' }
    },
    writing_originality: {
        en: { name: 'Originality', desc: 'Presenting unique perspectives and insights' },
        zh: { name: '創意發揮', desc: '展現獨特見解與思維' }
    },
    writing_vocabularyRange: {
        en: { name: 'Vocabulary Range', desc: 'Using varied and precise words' },
        zh: { name: '詞彙豐富度', desc: '使用多樣化且精準的詞彙' }
    },
    writing_collocations: {
        en: { name: 'Collocations', desc: 'Natural word combinations' },
        zh: { name: '詞語搭配', desc: '自然的詞語組合' }
    },
    writing_idiomaticExpressions: {
        en: { name: 'Idiomatic Expressions', desc: 'Appropriate use of idioms and phrases' },
        zh: { name: '慣用語表達', desc: '恰當使用成語語常用表達' }
    },
    writing_registerAppropriate: {
        en: { name: 'Register Appropriateness', desc: 'Matching formality to context' },
        zh: { name: '語體適切度', desc: '根據情境調整正式程度' }
    },
    writing_wordChoicePrecision: {
        en: { name: 'Word Choice Precision', desc: 'Selecting exact words for meaning' },
        zh: { name: '選詞精準度', desc: '挑選最準確的用詞以表達意圖' }
    },
    writing_sentenceVariety: {
        en: { name: 'Sentence Variety', desc: 'Mix of simple, compound, complex sentences' },
        zh: { name: '句式變化', desc: '結合簡單、並列與複合句' }
    },
    writing_advancedStructures: {
        en: { name: 'Advanced Structures', desc: 'Inversion, cleft sentences, conditionals' },
        zh: { name: '高級句式', desc: '使用倒裝、強調句、條件句等' }
    },
    writing_grammaticalAccuracy: {
        en: { name: 'Grammatical Accuracy', desc: 'Correct tenses, subject-verb agreement' },
        zh: { name: '語法準確度', desc: '確保時態、主謂一致等正確' }
    },
    writing_punctuation: {
        en: { name: 'Punctuation', desc: 'Proper use of commas, semicolons, etc.' },
        zh: { name: '標點符號', desc: '正確使用逗號、分號等' }
    },
    writing_paragraphStructure: {
        en: { name: 'Paragraph Structure', desc: 'Topic sentences, supporting details, conclusions' },
        zh: { name: '段落結構', desc: '運用主題句、支持細節與結語' }
    },
    writing_transitions: {
        en: { name: 'Transitions', desc: 'Smooth connections between ideas' },
        zh: { name: '過渡銜接', desc: '在想法之間建立平滑連接' }
    },
    writing_overallCoherence: {
        en: { name: 'Overall Coherence', desc: 'Logical flow from introduction to conclusion' },
        zh: { name: '整體連貫度', desc: '從引言到結論的邏輯流動' }
    },

    // LISTENING
    listening_mainIdea: {
        en: { name: 'Main Idea Listening', desc: 'Grasping overall message' },
        zh: { name: '主旨聆聽', desc: '掌握整體訊息' }
    },
    listening_detailListening: {
        en: { name: 'Detail Listening', desc: 'Catching specific information (names, dates, numbers)' },
        zh: { name: '細節聆聽', desc: '捕捉具體資訊（名字、日期、數字）' }
    },
    listening_noteTaking: {
        en: { name: 'Note-Taking', desc: 'Recording key points accurately' },
        zh: { name: '筆記技巧', desc: '準確記錄關鍵點' }
    },
    listening_prediction: {
        en: { name: 'Prediction', desc: 'Anticipating what comes next' },
        zh: { name: '預測能力', desc: '預期接下來的內容' }
    },
    listening_gist: {
        en: { name: 'Listening for Gist', desc: 'Understanding general meaning without every word' },
        zh: { name: '聽取大意', desc: '理解大概意思而無需聽懂每個字' }
    },
    listening_accentRecognition: {
        en: { name: 'Accent Recognition', desc: 'Understanding different English accents' },
        zh: { name: '口音辨識', desc: '理解不同地方的英語口音' }
    },
    listening_speedProcessing: {
        en: { name: 'Speed Processing', desc: 'Handling fast speech rates' },
        zh: { name: '速度處理', desc: '應對快速的說話速度' }
    },
    listening_speakerAttitude: {
        en: { name: 'Speaker Attitude', desc: 'Detecting emotions and opinions from tone' },
        zh: { name: '說話者態度', desc: '從語氣中偵測情緒與意見' }
    },
    listening_integratedTasks: {
        en: { name: 'Integrated Tasks', desc: 'Combining listening with writing/speaking' },
        zh: { name: '綜合任務', desc: '結合聽力、寫作與說話能力' }
    },
    listening_ambiguityHandling: {
        en: { name: 'Ambiguity Handling', desc: 'Interpreting unclear or indirect statements' },
        zh: { name: '歧義處理', desc: '解釋不明確或間接的陳述' }
    },

    // SPEAKING
    speaking_pronunciationClarity: {
        en: { name: 'Pronunciation Clarity', desc: 'Clear articulation of sounds' },
        zh: { name: '發音清晰度', desc: '清楚的語音表達' }
    },
    speaking_intonation: {
        en: { name: 'Intonation', desc: 'Natural rise and fall of voice' },
        zh: { name: '語調變化', desc: '聲線自然的起伏' }
    },
    speaking_paceRhythm: {
        en: { name: 'Pace & Rhythm', desc: 'Speaking at appropriate speed with natural pauses' },
        zh: { name: '節奏與速度', desc: '以適當的速度說話並自然停頓' }
    },
    speaking_confidence: {
        en: { name: 'Confidence & Naturalness', desc: 'Speaking without excessive hesitation' },
        zh: { name: '自信心與自然度', desc: '說話流暢，無過度猶豫' }
    },
    speaking_turnTaking: {
        en: { name: 'Turn-Taking', desc: 'Knowing when to speak and listen' },
        zh: { name: '輪流發言技巧', desc: '知道何時發言與聆聽' }
    },
    speaking_activeListening: {
        en: { name: 'Active Listening', desc: 'Responding relevantly to others' },
        zh: { name: '積極聆聽', desc: '對他人的發言作出相關回應' }
    },
    speaking_facilitation: {
        en: { name: 'Facilitation', desc: 'Encouraging others to contribute' },
        zh: { name: '帶動討論', desc: '鼓勵他人參與對話' }
    },
    speaking_spontaneity: {
        en: { name: 'Spontaneity', desc: 'Thinking on feet, improvising responses' },
        zh: { name: '即興反應', desc: '能夠即席思考並作出回應' }
    },
    speaking_vocabularyInSpeech: {
        en: { name: 'Vocabulary in Speech', desc: 'Using varied words naturally' },
        zh: { name: '口語詞彙', desc: '自然地使用多樣化詞彙' }
    },
    speaking_grammaticalAccuracyInSpeech: {
        en: { name: 'Grammatical Accuracy in Speech', desc: 'Correct structures while speaking' },
        zh: { name: '口語語法準確度', desc: '說話時使用正確的句式結構' }
    },
    speaking_groupDiscussion: {
        en: { name: 'Group Discussion (Part A)', desc: 'HKDSE Paper 4: Collaborating and discussing in a group' },
        zh: { name: '小組討論 (Part A)', desc: 'HKDSE 卷四：在小組中協作與討論' }
    },
    speaking_individualResponse: {
        en: { name: 'Individual Response (Part B)', desc: 'HKDSE Paper 4: 1-minute response to examiner question' },
        zh: { name: '個別應答 (Part B)', desc: 'HKDSE 卷四：就考官問題進行一分鐘應答' }
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

export const getSkillsByPaper = (paper) => {
    return Object.keys(MICRO_SKILLS).filter(id => id.startsWith(paper));
};
