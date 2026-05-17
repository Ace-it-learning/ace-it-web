const GenerativeAIService = require('../GenerativeAIService');
const writingSyllabus = require('../../data/writing_quest_syllabus.json');
const genrePrompts = require('../../data/genre_prompts.json');
const axios = require('axios');

class WritingQuestService {
    constructor() {
        this.aiService = GenerativeAIService;
        // Firebase Admin should be initialized globally in server.js or by the caller script.
    }

    getSyllabus() {
        const fs = require('fs');
        const path = require('path');
        const syllabusPath = path.resolve(__dirname, '../../data/writing_quest_syllabus.json');
        try {
            return JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
        } catch (e) {
            console.error("[WritingQuestService] Failed to read syllabus:", e);
            return writingSyllabus; // Fallback to require'd version if disk read fails
        }
    }

    async getFactoryTopics(genre) {
        // Resolve friendly genre name first (e.g. "debate-speech" -> "Debate Speech")
        let friendlyGenre = genre;
        const keys = Object.keys(genrePrompts.prompts);
        const match = keys.find(k =>
            k.toLowerCase() === genre.toLowerCase() ||
            k.toLowerCase() === genre.toLowerCase().replace(/-/g, ' ') ||
            k.toLowerCase() === genre.toLowerCase().replace(/_/g, ' ')
        );
        if (match) friendlyGenre = match;

        // Factory / roadmap writing cards: genre_prompts.json only (no Cosmos).
        let resolvedGenre = genre;
        if (!genrePrompts.prompts[resolvedGenre]) {
            const slugMatch = keys.find(k => k.toLowerCase() === resolvedGenre.toLowerCase().replace(/-/g, ' '));
            if (slugMatch) resolvedGenre = slugMatch;
        }

        if (!genrePrompts.prompts[resolvedGenre]) {
            return [];
        }

        return genrePrompts.prompts[resolvedGenre].map((p, idx) => ({
            id: p.id || `static_${friendlyGenre}_${idx}`,
            title: p.title || p.topic || friendlyGenre,
            prompt: p.prompt || p.topic,
            genre: friendlyGenre,
            static: true
        }));
    }

    /**
     * Pillar 1: The Brains - Brainstorming
     * Generates questions to help student develop "PEE" (Point, Evidence, Explanation).
     */
    async generateBrainstormingPrompts(topic, weakSkills = [], messages = [], currentPoints = []) {
        const pillar = writingSyllabus.learning_content.find(p => p.id === 'pillar_content');

        // Build conversational context
        const historyContext = messages.length > 0
            ? "Conversation history so far:\n" + messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n")
            : "No previous messages.";

        const prompt = `
            Role: Expert HKDSE English Writing Tutor (British Persona named {{agentName}}).
            Task: Guide the student to brainstorm for the topic: "${topic}".
            
            Objective: ${pillar.dse_objective}
            Style: ${pillar.british_tutor_hint}
            
            Key Principles:
            1. **No Repetition**: NEVER ask "What are your main arguments?" or "What's your first reason?" if the student has already given them.
            2. **Acknowledge and Guide**: Read the "Conversation history" and "${JSON.stringify(currentPoints)}" below. Acknowledge what the student has said.
            3. **Concrete Guidance**: If the student's argument is weak or simple, PROVIDE a concrete example or use the "What if?" technique to help them elaborate (e.g., "That's a start, but what if the school board argues that academics are more important? How would you counter that?").
            4. **Avoid Mechanical Questions**: Instead of asking for "Point 2", ask about a different perspective or stakeholder related to the topic.

            Current Points Collected: ${JSON.stringify(currentPoints)}
            ${historyContext}

            Output JSON:
            {
                "intro_message": "A supportive, context-aware response.",
                "next_question": "The specific next question.",
                "hint": "A bit of DSE-specific advice.",
                "extracted_points": [
                    { "point": "Argument 1", "evidence": "Evidence" },
                    { "point": "Argument 2", "evidence": "" }
                ]
            }
            
            IMPORTANT:
            - "extracted_points" must include ALL valid points found in the conversation so far, plus any new ones.
            - If the student elaborates on an existing point, update its "evidence" field instead of creating a new point.
            - Do NOT drop existing points.
        `;

        try {
            const result = await this.aiService.generateJson(prompt);
            const data = result.data;
            return {
                intro_message: data.intro_message,
                questions: [{ id: 1, text: data.next_question, hint: data.hint }],
                points: data.extracted_points || []
            };
        } catch (error) {
            console.error("[WritingQuest] Brainstorm Error:", error);
            // Fallback
            return {
                intro_message: "Let's get some ideas down. What are your main arguments?",
                questions: [
                    { id: 1, text: "What is your first main reason?", hint: "Think about the most obvious impact." },
                    { id: 2, text: "What is written in the second paragraph?", hint: "Consider the opposing view." },
                    { id: 3, text: "How would you conclude?", hint: "Summarize and look to the future." }
                ]
            };
        }
    }

    /**
     * Pillar 2: The Beauty - Power-Up Drafting
     * Analyzes a draft paragraph and suggests "Level 5*" upgrades.
     * Checks for "Lifting" and "Register" issues.
     */
    async analyzeDraftParagraph(text, textType, level = "5*", brainstormPoints = []) {
        const pillar = writingSyllabus.learning_content.find(p => p.id === 'pillar_language');
        const pointsContext = brainstormPoints.length > 0
            ? "\nThe student brainstormed these points earlier. Help them polish these specific ideas in their draft:\n" + brainstormPoints.map((p, i) => `${i + 1}. ${p.point}`).join("\n")
            : "";

        const prompt = `
            Role: Expert HKDSE English Writing Tutor (Persona named {{agentName}}).
            Task: Analyze this draft paragraph for a "${textType}" text.
            Draft: "${text}"
            ${pointsContext}

            Key Objectives:
            1. **Vocabulary Upgrade**: Identify simple "Level 3" words and provide "Level 5*" sophisticated alternatives.
            2. **Register Check**: Text Type is "${textType}". Formal tone only.
            3. **Cliché Detection**: Avoid "Every coin has two sides", etc.
            4. **Idea Polish**: If the draft uses the brainstormed points, praise them and suggest ways to make the *ideas* more sophisticated (e.g., more precise terminology).

            Output JSON (Strict Format):
            {
                "feedback_summary": "Overall impression...",
                "register_check": { 
                    "status": "green" | "amber" | "red", 
                    "message": "Explain tone issues if any..." 
                },
                "suggestions": [
                    { 
                        "original": "bad", 
                        "suggestion": "detrimental", 
                        "reason": "Level 3 word. Upgrade to show precise negative impact.", 
                        "type": "vocabulary" 
                    }
                ],
                "sentence_variety_score": 1-10
            }
        `;

        try {
            const result = await this.aiService.generateJson(prompt);
            return result.data;
        } catch (error) {
            console.error("[WritingQuest] Analyze Draft Error:", error);
            return {
                feedback_summary: "Good start. Let's polish this.",
                register_check: { status: "green", message: "Tone seems okay." },
                suggestions: []
            };
        }
    }

    /**
     * Cheat Feature: Level Up
     * Rewrites a paragraph to be Level 5** standard.
     */
    async rewriteParagraph(text, textType, targetLevel = "5*") {
        const prompt = `
            Role: Expert HKDSE English Writing Tutor (Persona named {{agentName}}).
            Task: Rewrite the following paragraph to achieve a "${targetLevel}" (Top Level) standard.
            
            Original Text: "${text}"
            Context: ${textType}

            Guidelines:
            1. **Vocabulary**: Use sophisticated, precise vocabulary (e.g., change "bad" to "detrimental" or "catastrophic").
            2. **Sentence Structure**: Use varied and complex sentence structures (inversion, particulate phrases, etc.).
            3. **Tone**: Maintain a formal and persuasive tone appropriate for the text type.
            4. **Meaning**: Keep the original meaning and arguments, but express them with much higher proficiency.

            Output JSON:
            {
                "rewritten_text": "The upgraded paragraph..."
            }
        `;

        try {
            const result = await this.aiService.generateJson(prompt);
            return result.data;
        } catch (error) {
            console.error("[WritingQuest] Rewrite Error:", error);
            return { rewritten_text: text }; // Fallback to original
        }
    }

    /**
     * Admin Feature: Full Essay Generation
     * Generates a full essay for a specific level.
     */
    async generateFullEssay(topic, textType, level, points = []) {
        const pointsStr = points.map(p => `- ${p.point}`).join('\n');

        const prompt = `
            Role: Expert HKDSE English Writing Tutor (Persona named {{agentName}}).
            Task: Write a full ${textType} on the topic "${topic}".
            
            Target Level: ${level} (HKDSE Standard)
            
            Key Points to Include:
            ${pointsStr}

            Guidelines for Level ${level}:
            ${level.startsWith('5')
                ? '- Use sophisticated vocabulary and complex sentence structures.\n- Ensure high coherence and cohesion.\n- Tone must be perfectly aligned with the text type.'
                : '- Use simple, clear language.\n- Focus on basic accuracy and structure.'}

            Length (mandatory): Produce a complete exam-style piece of at least 320 words with multiple paragraphs (introduction, development, conclusion as appropriate to ${textType}). Do not stop after one or two short paragraphs.

            Output JSON:
            {
                "essay_content": "Full essay text here..."
            }
        `;

        try {
            const result = await this.aiService.generateJson(prompt, {
                generationConfig: {
                    maxOutputTokens: 4096,
                    temperature: 0.45
                }
            });
            return result.data;
        } catch (error) {
            console.error("[WritingQuest] Generate Essay Error:", error);
            return { essay_content: `Error: Could not generate essay for ${topic}.` };
        }
    }

    /**
     * Comparison Feature: Compare student draft with a model answer
     */
    /**
     * Get all scenarios across all genres
     */
    /**
     * Collapses cards that share the same visible title (e.g. factory rows with identical
     * disambiguated prefix, or duplicate DB entries). Keeps the first occurrence only.
     */
    _normalizeScenarioTitle(title) {
        return (title || '').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    async getAllScenarios() {
        const uniqueScenarios = new Map();
        const seenPrompt = new Map(); // normalized passage → first id (collapse duplicate DB rows)
        const seenTitle = new Map(); // normalized card title → first id

        for (const genreId in genrePrompts.prompts) {
            const formatScenarios = await this.getFactoryTopics(genreId);
            formatScenarios.forEach(s => {
                if (!s.id || uniqueScenarios.has(s.id)) return;

                const tKey = this._normalizeScenarioTitle(s.title);
                if (tKey && seenTitle.has(tKey)) return;

                const pKey = (s.prompt || '')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .toLowerCase();
                if (pKey.length > 12 && seenPrompt.has(pKey)) return;

                if (tKey) seenTitle.set(tKey, s.id);
                if (pKey.length > 12) seenPrompt.set(pKey, s.id);
                uniqueScenarios.set(s.id, s);
            });
        }
        return Array.from(uniqueScenarios.values());
    }

    async compareEssays(content, topic, textType, targetLevel) {
        // 1. Generate the model essay first
        // Reuse points if we had them? In result step we might not have them easily, so generate holistically.
        const modelData = await this.generateFullEssay(topic, textType, targetLevel);
        const modelEssay = modelData.essay_content;

        const prompt = `
            Role: Expert HKDSE Writing Examiner (Persona named {{agentName}}).
            Task: Compare a student's draft with a Level ${targetLevel} Model Answer.
            
            Topic: "${topic}"
            Text Type: "${textType}"
            
            Student Draft:
            "${content}"
            
            Model Answer (Level ${targetLevel}):
            "${modelEssay}"

            Requirements:
            1. Identify 3-4 key areas of difference.
            2. For each area, provide a specific example from the student's draft and show how the model answer upgraded it.
            3. Explain why the model version is superior in HKDSE terms (e.g., register, complexity, coherence).

            Output JSON:
            {
                "model_essay": "The full model answer text",
                "key_differences": [
                    {
                        "area": "Vocabulary / Sentence Structure / Coherence / etc.",
                        "student_version": "...",
                        "model_upgrade": "...",
                        "explanation": "..."
                    }
                ]
            }
        `;

        try {
            const result = await this.aiService.generateJson(prompt);
            return {
                ...result.data,
                model_essay: modelEssay // Use the one we generated
            };
        } catch (error) {
            console.error("[WritingQuest] Compare Error:", error);
            return {
                model_essay: modelEssay,
                key_differences: [{ area: "Error", student_version: "N/A", model_upgrade: "N/A", explanation: "Could not analyze differences." }]
            };
        }
    }

    /**
     * Pillar 3: The Bones - Connection Check
     * Evaluates coherence between two paragraphs.
     */
    async checkTransitions(prevParagraph, currentParagraph) {
        const pillar = writingSyllabus.learning_content.find(p => p.id === 'pillar_organization');

        const prompt = `
            Role: Expert HKDSE Writing Tutor (Persona named {{agentName}}).
            Task: Analyze the transition between these two paragraphs.
            
            Para 1 (End): "...${prevParagraph.slice(-100)}"
            Para 2 (Start): "${currentParagraph.slice(0, 100)}..."

            Objective: ${pillar.dse_objective}
            
            Did they use a transition? Is it sophisticated?
            If generic (First, Also), suggest better ones (e.g., "Turning to...", "In stark contrast...").

            Output JSON:
            {
                "rating": "weak" | "ok" | "strong",
                "comment": "Specific HKDSE-style feedback on this connection.",
                "suggested_transition": "A sophisticated connective (e.g., 'Henceforth', 'Conversely')"
            }
        `;

        try {
            const result = await this.aiService.generateJson(prompt);
            return result.data;
        } catch (error) {
            console.error("[WritingQuest] Connection Check Error:", error);
            return { rating: "ok", comment: "Transitions look okay.", suggested_transition: null };
        }
    }

    /**
     * Admin/Final: Review Essay Structure
     * Analyzes paragraph flow and logical progression.
     */
    async reviewStructure(paragraphs, topic, textType) {
        const fullContent = paragraphs.join('\n\n');
        const prompt = `
            Role: Expert HKDSE Writing Examiner (Persona named {{agentName}}).
            Task: Analyze the overall STRUCTURE of this "${textType}".
            Topic: "${topic}"
            
            Essay Content:
            ${fullContent}

            Analysis Requirements:
            1. **Logic Flow**: Does point A lead to point B?
            2. **Format Adherence**: Does a ${textType} have the required components (e.g. Salutation for speech, Title for article)?
            3. **Structural Balance**: Is the intro/body/conclusion ratio appropriate?
            
            Output JSON:
            {
                "structure_score": 1-10,
                "feedback": "Overall structural feedback...",
                "sections": [
                    { "name": "Introduction", "status": "present" | "missing" | "weak", "advice": "..." },
                    { "name": "Body Paragraphs", "status": "present" | "missing" | "weak", "advice": "..." },
                    { "name": "Conclusion", "status": "present" | "missing" | "weak", "advice": "..." }
                ],
                "flow_rating": "logical" | "choppy" | "repetitive"
            }
        `;

        try {
            const result = await this.aiService.generateJson(prompt);
            return result.data;
        } catch (error) {
            console.error("[WritingQuest] Structure Review Error:", error);
            return {
                structure_score: 5,
                feedback: "Could not analyze structure. Ensure you have an introduction and conclusion.",
                sections: [],
                flow_rating: "logical"
            };
        }
    }

    /**
     * Real-time Analysis: Review Draft
     * Performs a paragraph-by-paragraph analysis focusing on C-L-O.
     */
    async analyzeRealTime(content, topic, textType) {
        const paragraphs = content.split(/\n\n|\n/).filter(p => p.trim().length > 0);
        
        const prompt = `
            Role: expert HKDSE Writing AI Marker (Persona named {{agentName}}).
            Task: Provide real-time structural and linguistic analysis for a "${textType}" on "${topic}".
            
            Content to analyze:
            ${content}

            Requirements:
            1. **Paragraph-Level feedback**: Identify specific strengths and weaknesses in the current draft.
            2. **C-L-O Status**: Estimate the current status of Content, Language, and Organization (0-100%).
            3. **Genre Adherence**: Check if the "${textType}" must-haves are present.
            4. **Vocabulary Boost**: Suggest 3-4 "Tier 3" sophisticated vocabulary replacements for simple words used in the text.

            Output JSON (Bilingual):
            {
                "overall_feedback": { "en": "...", "zh": "..." },
                "clo_status": {
                    "content": 0-100,
                    "language": 0-100,
                    "organization": 0-100
                },
                "paragraph_analysis": [
                    { 
                        "para_index": 0, 
                        "feedback": { "en": "...", "zh": "..." }, 
                        "type": "strength" | "improvement" 
                    }
                ],
                "vocabulary_upgrades": [
                    { 
                        "original": "...", 
                        "suggestion": "...", 
                        "explanation": { "en": "...", "zh": "..." } 
                    }
                ],
                "checklist_status": [
                    { 
                        "item": { "en": "...", "zh": "..." }, 
                        "status": "met" | "missing" | "partial" 
                    }
                ]
            }

            ABSOLUTE RULES:
            - EXCLUSIVELY use Traditional Chinese (繁體中文) for all "zh" fields.
            - ALL feedback must be bilingual.
        `;

        try {
            const result = await this.aiService.generateJson(prompt);
            return result.data;
        } catch (error) {
            console.error("[WritingQuest] Real-time Analysis Error (AI unavailable, using rule-based fallback):", error.message);
            // Rule-based fallback: provide genuine C-L-O guidance without exposing the text
            return this._generateRuleBasedReview(content, topic, textType);
        }
    }

    /**
     * Rule-based real-time review fallback when AI service is unavailable.
     * Provides genuine C-L-O guidance based on text heuristics without
     * simply returning the student's text back to them.
     */
    _generateRuleBasedReview(content, topic, textType) {
        const paragraphs = content.split(/\n\n|\n/).filter(p => p.trim().length > 0);
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // --- Content (C) Analysis ---
        const hasIntroduction = paragraphs.length >= 1;
        const hasConclusion = paragraphs.length >= 2 && 
            /(?:conclusion|summary|therefore|thus|in conclusion|to conclude|overall|in short)/i.test(paragraphs[paragraphs.length - 1]);
        const hasExamples = /(?:for example|for instance|such as|like|e\.g\.|take|consider)/i.test(content);
        const hasArguments = /(?:because|since|as|due to|reason|argue|believe|think|claim|however|although|while|whereas|on the other hand|furthermore|moreover|in addition)/i.test(content);
        
        let contentScore = 30;
        if (hasIntroduction) contentScore += 15;
        if (hasConclusion) contentScore += 15;
        if (hasExamples) contentScore += 15;
        if (hasArguments) contentScore += 15;
        if (wordCount > 200) contentScore += 10;
        contentScore = Math.min(95, contentScore);
        
        const contentAdvice = [];
        if (!hasIntroduction) contentAdvice.push("begin with a clear thesis that directly addresses the topic");
        if (!hasExamples) contentAdvice.push("support your arguments with concrete examples or case studies");
        if (!hasArguments) contentAdvice.push("use signposting words (e.g., 'because', 'however', 'furthermore') to strengthen reasoning");
        if (!hasConclusion) contentAdvice.push("end with a concise conclusion that summarises your stance");
        if (wordCount < 150) contentAdvice.push("expand your ideas—aim for at least 250 words for a full response");
        if (contentAdvice.length === 0) contentAdvice.push("your content is well-developed; consider adding a counter-argument for sophistication");
        
        // --- Language (L) Analysis ---
        const hasComplexSentences = /(?:although|because|since|while|whereas|unless|if|which|who|that|despite|in spite of|not only|either|neither|whether|provided that)/i.test(content);
        const hasAdvancedVocab = /(?:proliferation|detrimental|paramount|imperative|ubiquitous|detrimental|advocate|alleviate|comprehensive|substantial|consequently|nevertheless|notwithstanding|paradigm|ramification)/i.test(content);
        const hasTransitionWords = /(?:furthermore|moreover|in addition|consequently|therefore|thus|nevertheless|however|on the contrary|in contrast|similarly|likewise|meanwhile|subsequently)/i.test(content);
        const hasErrors = /(?:\bis are\b|\bare is\b|\bwas were\b|\bwere was\b|\bhave has\b|\bhas have\b|\bdon't doesn't\b|\bdoesn't don't\b|\btheir there\b|\bthere their\b|\byour you're\b)/i.test(content);
        
        let languageScore = 35;
        if (hasComplexSentences) languageScore += 15;
        if (hasAdvancedVocab) languageScore += 15;
        if (hasTransitionWords) languageScore += 15;
        if (sentences.length > 5) languageScore += 10;
        if (hasErrors) languageScore -= 15;
        languageScore = Math.min(95, Math.max(20, languageScore));
        
        const languageAdvice = [];
        if (!hasComplexSentences) languageAdvice.push("vary your sentence structures—try complex or compound-complex sentences");
        if (!hasAdvancedVocab) languageAdvice.push("replace common words with more precise alternatives (e.g., 'important' → 'paramount')");
        if (!hasTransitionWords) languageAdvice.push("use cohesive devices to link ideas smoothly");
        if (hasErrors) languageAdvice.push("proof-read for subject-verb agreement and word-choice errors");
        if (languageAdvice.length === 0) languageAdvice.push("your language use is strong; experiment with rhetorical devices for extra impact");
        
        // --- Organization (O) Analysis ---
        const hasTopicSentences = paragraphs.slice(1, -1).some(p => /^\s*(?:firstly|secondly|thirdly|moreover|furthermore|in addition|on the other hand|however|conversely|another|one reason|one benefit|one drawback)/i.test(p));
        const hasParagraphing = paragraphs.length >= 3;
        const hasSignposting = /(?:firstly|secondly|thirdly|first|second|third|to begin with|next|finally|in conclusion|to sum up|overall)/i.test(content);
        
        let organizationScore = 30;
        if (hasParagraphing) organizationScore += 20;
        if (hasTopicSentences) organizationScore += 20;
        if (hasSignposting) organizationScore += 20;
        if (hasConclusion) organizationScore += 10;
        organizationScore = Math.min(95, organizationScore);
        
        const organizationAdvice = [];
        if (!hasParagraphing) organizationAdvice.push("divide your writing into clear paragraphs (introduction, body, conclusion)");
        if (!hasTopicSentences) organizationAdvice.push("start each body paragraph with a clear topic sentence");
        if (!hasSignposting) organizationAdvice.push("use signposting language ('Firstly', 'Moreover', 'In conclusion') to guide the reader");
        if (organizationAdvice.length === 0) organizationAdvice.push("your structure is solid; ensure each paragraph focuses on a single idea");
        
        // Build paragraph-level analysis (one per paragraph, max 4)
        const paragraphAnalysis = paragraphs.slice(0, 4).map((para, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === paragraphs.length - 1;
            const paraWordCount = para.split(/\s+/).filter(w => w.length > 0).length;
            
            let feedbackEn = "";
            let feedbackZh = "";
            let type = "strength";
            
            if (isFirst) {
                if (/\b(?:topic|issue|problem|question|debate|discuss|argue|believe|think)\b/i.test(para)) {
                    feedbackEn = "Strong opening—clearly introduces the topic.";
                    feedbackZh = "開首有力，清晰引入主題。";
                } else {
                    feedbackEn = "Consider starting with a hook or clear thesis statement.";
                    feedbackZh = "建議以引人入勝的開首或明確論點開始。";
                    type = "improvement";
                }
            } else if (isLast) {
                if (/(?:conclusion|summary|therefore|thus|overall|in short|to conclude)/i.test(para)) {
                    feedbackEn = "Effective conclusion that reinforces your position.";
                    feedbackZh = "結論有效，鞏固立場。";
                } else {
                    feedbackEn = "End with a brief conclusion summarising your key points.";
                    feedbackZh = "結尾應簡要總結要點。";
                    type = "improvement";
                }
            } else {
                if (paraWordCount < 40) {
                    feedbackEn = "This paragraph is quite short—expand with examples or explanation.";
                    feedbackZh = "此段落較短，可加入例子或解釋。";
                    type = "improvement";
                } else if (/\b(?:because|since|for example|however|furthermore)\b/i.test(para)) {
                    feedbackEn = "Good use of reasoning and connectors in this paragraph.";
                    feedbackZh = "段落運用推理和連接詞得當。";
                } else {
                    feedbackEn = "Ensure this paragraph has a clear focus and supporting evidence.";
                    feedbackZh = "確保此段落有明確重點及支持論據。";
                    type = "improvement";
                }
            }
            
            return {
                para_index: idx,
                feedback: { en: feedbackEn, zh: feedbackZh },
                type
            };
        });
        
        // Build vocabulary upgrades from common words found
        const commonWordMap = {
            'important': ['crucial', 'paramount', 'imperative'],
            'good': ['commendable', 'favourable', 'meritorious'],
            'bad': ['detrimental', 'adverse', 'deleterious'],
            'big': ['substantial', 'considerable', 'significant'],
            'small': ['negligible', 'marginal', 'minimal'],
            'think': ['contend', 'postulate', 'maintain'],
            'show': ['demonstrate', 'illustrate', 'exemplify'],
            'help': ['facilitate', 'alleviate', 'ameliorate'],
            'need': ['necessitate', 'mandate', 'require'],
            'use': ['utilise', 'employ', 'leverage'],
            'make': ['render', 'produce', 'generate'],
            'get': ['obtain', 'acquire', 'secure'],
            'say': ['assert', 'articulate', 'convey'],
            'know': ['recognise', 'acknowledge', 'comprehend'],
            'want': ['desire', 'aspire', 'seek'],
            'thing': ['matter', 'issue', 'phenomenon'],
            'people': ['individuals', 'citizens', 'the populace'],
            'very': ['exceedingly', 'profoundly', 'remarkably'],
            'many': ['numerous', 'a plethora of', 'a multitude of'],
            'some': ['certain', 'particular', 'specific'],
            'also': ['furthermore', 'moreover', 'in addition'],
            'but': ['however', 'nevertheless', 'conversely'],
            'so': ['consequently', 'therefore', 'thus'],
            'because': ['since', 'as', 'in light of'],
            'like': ['such as', 'for instance', 'namely'],
            'about': ['regarding', 'concerning', 'pertaining to'],
            'more': ['additional', 'further', 'supplementary'],
            'most': ['the majority of', 'predominantly', 'principally'],
            'should': ['ought to', 'is advisable to', 'is imperative that'],
            'must': ['is compelled to', 'is obliged to', 'is mandated to'],
            'can': ['is able to', 'is capable of', 'possesses the capacity to'],
            'will': ['shall', 'is expected to', 'is anticipated to'],
            'could': ['might', 'may potentially', 'could conceivably'],
            'would': ['would presumably', 'would likely', 'would arguably'],
            'really': ['genuinely', 'authentically', 'truly'],
            'always': ['invariably', 'without exception', 'consistently'],
            'never': ['under no circumstances', 'at no time', 'in no way'],
            'often': ['frequently', 'regularly', 'habitually'],
            'sometimes': ['occasionally', 'intermittently', 'periodically'],
            'first': ['primarily', 'initially', 'first and foremost'],
            'second': ['secondly', 'subsequently', 'in the second place'],
            'last': ['ultimately', 'finally', 'in the final analysis'],
            'end': ['conclude', 'terminate', 'culminate'],
            'start': ['commence', 'initiate', 'embark upon'],
            'change': ['transform', 'alter', 'modify'],
            'problem': ['dilemma', 'predicament', 'quandary'],
            'answer': ['response', 'reply', 'rejoinder'],
            'question': ['inquiry', 'query', 'interrogation'],
            'idea': ['notion', 'concept', 'conception'],
            'reason': ['rationale', 'justification', 'basis'],
            'result': ['outcome', 'consequence', 'repercussion'],
            'part': ['component', 'constituent', 'segment'],
            'place': ['location', 'venue', 'site'],
            'time': ['period', 'era', 'epoch'],
            'way': ['manner', 'method', 'approach'],
            'look': ['appear', 'seem', 'present'],
            'find': ['discover', 'ascertain', 'determine'],
            'give': ['provide', 'furnish', 'bestow'],
            'take': ['adopt', 'embrace', 'undertake'],
            'come': ['arise', 'emerge', 'materialise'],
            'go': ['proceed', 'advance', 'progress'],
            'see': ['perceive', 'observe', 'discern'],
            'do': ['perform', 'execute', 'accomplish'],
            'have': ['possess', 'hold', 'retain'],
            'be': ['constitute', 'represent', 'embody']
        };
        
        const foundUpgrades = [];
        const lowerContent = content.toLowerCase();
        for (const [original, suggestions] of Object.entries(commonWordMap)) {
            const regex = new RegExp(`\\b${original}\\b`, 'i');
            if (regex.test(lowerContent) && foundUpgrades.length < 4) {
                foundUpgrades.push({
                    original: original.charAt(0).toUpperCase() + original.slice(1),
                    suggestion: suggestions[0],
                    explanation: {
                        en: `Elevates tone from casual to academic.`,
                        zh: `提升語氣，由日常轉為學術。`
                    }
                });
            }
        }
        
        // Genre checklist based on textType
        const checklistStatus = [];
        const genre = (textType || 'Essay').toLowerCase();
        
        if (genre.includes('letter') || genre.includes('email')) {
            checklistStatus.push(
                { item: { en: "Appropriate salutation & sign-off", zh: "合適的稱謂與結尾敬語" }, status: /\b(dear|sir|madam|yours sincerely|yours faithfully|best regards)/i.test(content) ? "met" : "missing" },
                { item: { en: "Clear purpose stated early", zh: "開首清楚說明目的" }, status: /\b(?:writing to|am writing|purpose|regarding|concerning)/i.test(content) ? "met" : "partial" },
                { item: { en: "Appropriate register for audience", zh: "語體適合讀者身份" }, status: /\b(?:would|could|may|might|appreciate|grateful|thank you)/i.test(content) ? "met" : "partial" }
            );
        } else if (genre.includes('speech') || genre.includes('debate')) {
            checklistStatus.push(
                { item: { en: "Engaging opening hook", zh: "引人入勝的開首" }, status: /\b(?:imagine|picture|did you know|have you ever|ladies and gentlemen|honorable judges)/i.test(content) ? "met" : "missing" },
                { item: { en: "Clear stance / thesis", zh: "明確立場或論點" }, status: /\b(?:believe|argue|contend|maintain|position|stance|side|support|oppose)/i.test(content) ? "met" : "partial" },
                { item: { en: "Strong concluding call-to-action", zh: "有力的結論與呼籲" }, status: /\b(?:thank you|vote for|join us|let us|together we|call upon)/i.test(content) ? "met" : "partial" }
            );
        } else {
            // Generic essay/article
            checklistStatus.push(
                { item: { en: "Clear introduction with thesis", zh: "開首有明確論點" }, status: hasIntroduction ? "met" : "missing" },
                { item: { en: "Body paragraphs with examples", zh: "正文段落附例子" }, status: hasExamples ? "met" : "partial" },
                { item: { en: "Conclusion summarising stance", zh: "結論總結立場" }, status: hasConclusion ? "met" : "missing" }
            );
        }
        
        return {
            overall_feedback: {
                en: `**Content**: ${contentAdvice.join('; ')}. **Language**: ${languageAdvice.join('; ')}. **Organization**: ${organizationAdvice.join('; ')}.`,
                zh: `**內容**：${contentAdvice.map(a => a).join('；')}. **語言**：${languageAdvice.map(a => a).join('；')}. **結構**：${organizationAdvice.map(a => a).join('；')}.`
            },
            clo_status: {
                content: Math.round(contentScore),
                language: Math.round(languageScore),
                organization: Math.round(organizationScore)
            },
            paragraph_analysis: paragraphAnalysis,
            vocabulary_upgrades: foundUpgrades,
            checklist_status: checklistStatus,
            _fallback: true
        };
    }

    /**
     * Merge camelCase / alternate keys from LLM JSON into the snake_case shape the API + WritingResultPage expect.
     */
    normalizeFinalGradePayload(data) {
        if (!data || typeof data !== 'object') return data;
        const examiner_summary =
            data.examiner_summary ||
            data.examinerSummary ||
            data.summary ||
            null;
        const improvement_goal =
            data.improvement_goal ||
            data.improvementGoal ||
            null;
        const exemplar_comparison =
            data.exemplar_comparison ||
            data.exemplarComparison ||
            null;
        const model_answer_5_star =
            data.model_answer_5_star ||
            data.modelAnswer5Star ||
            data.model_answer ||
            data.modelAnswer ||
            '';
        const high_score_tips =
            data.high_score_tips ||
            data.highScoreTips ||
            [];
        return {
            ...data,
            examiner_summary,
            improvement_goal,
            exemplar_comparison,
            model_answer_5_star,
            high_score_tips
        };
    }

    /**
     * Final Grading: Assess all 3 pillars (Content, Language, Organization) + Predicted Level
     */
    async gradeFinalPiece(topic, textType, content, imageUrls = []) {
        const imageParts = [];
        if (imageUrls && imageUrls.length > 0) {
            console.log(`[WritingQuestService] Fetching ${imageUrls.length} images for multimodal grading...`);
            for (const url of imageUrls) {
                const base64 = await this.fetchImageAsBase64(url);
                if (base64) {
                    imageParts.push({
                        inlineData: {
                            data: base64,
                            mimeType: "image/jpeg"
                        }
                    });
                }
            }
        }

        const promptText = `
            You are a Senior HKDSE English Marker (Level 5** Chief Examiner) named {{agentName}}.
            Task: Provide a PROFESSIONAL, STERN, and DETAILED assessment of the student's work based on official HKEAA Level Descriptors.
            
            Topic: "${topic}"
            Text Type: "${textType}"
            
            ${imageParts.length > 0 
                ? "The student has provided photos of their handwritten work. Please transcribe the handwriting carefully and grade the content based on the images. If text content is also provided below, consider it as part of the response."
                : ""}
            
            Student Text Content: "${content}"

            ### OFFICIAL HKEAA WRITING DESCRIPTORS — 0-7 SCALE (Per Domain)

            #### CONTENT (0–7 marks)
            **7 (Level 5**)**: All bullet points addressed with insight, originality, and flair. Ideas are complex, well-developed, and insightful. Goes beyond the prompt with nuanced arguments.
            **6 (Level 5*)**: All bullet points addressed clearly. Ideas are well-organized and clearly expressed with some depth. Strong relevance throughout.
            **5 (Level 5)**: All bullet points addressed. Ideas are clear and effective. Good development with relevant examples. Minor gaps in depth.
            **4 (Level 4)**: Most bullet points addressed. Ideas are clear but may lack sophistication. Some development present but surface-level.
            **3 (Level 3)**: Some bullet points addressed. Main points communicated but with significant omissions. Basic development only.
            **2 (Level 2)**: Few bullet points addressed. Ideas are fragmented or underdeveloped. Limited relevance to the task.
            **1 (Level 1)**: One or two relevant points. Ideas are barely communicated. Largely off-task or incoherent.
            **0**: No attempt or completely irrelevant.

            **PENALTIES:**
            - Missing ANY mandatory bullet point: MAXIMUM 4 for Content.
            - Off-topic response: MAXIMUM 2 for Content.
            - Lifting entire phrases from the prompt without reworking: −1 Content.
            - If length is < 160 words (Part A) or < 320 words (Part B), do NOT award a 7 for Content as development is not sustained.

            #### LANGUAGE (0–7 marks)
            **7 (Level 5**)**: Sophisticated sentence structures (inversions, cleft sentences, participial phrases). Precise vocabulary with natural collocations. Virtually error-free. Native-like command.
            **6 (Level 5*)**: Wide range of structures, mostly complex. Impressive vocabulary used naturally. Very few errors.
            **5 (Level 5)**: Wide range of vocabulary and sentence structures. Communication is clear and effective. Occasional minor errors.
            **4 (Level 4)**: Language is generally accurate. Uses simple and compound sentences; some complex. Errors do not affect clarity.
            **3 (Level 3)**: Simple language used correctly. Some fairly complex sentences attempted. Basic vocabulary with repetition. Errors sometimes impede meaning.
            **2 (Level 2)**: Short and simple sentence types. Frequent grammar and spelling errors. Limited vocabulary; repetitive phrasing.
            **1 (Level 1)**: Simple basic structures accurate enough to be understood in parts. Very limited vocabulary.
            **0**: No attempt or unintelligible.

            **PENALTIES:**
            - Frequent spelling mistakes impeding clarity: −1 to −2 Language.
            - Inappropriate register (e.g., slang in formal letter): −1 Language.

            #### ORGANIZATION (0–7 marks)
            **7 (Level 5**)**: Wholly coherent. Seamless transitions. Perfect genre features (e.g., report headers, letter addresses). Logical grouping with sophisticated connectors.
            **6 (Level 5*)**: Highly coherent. Smooth transitions. Correct genre features. Well-structured paragraphs.
            **5 (Level 5)**: Coherent throughout. Logical paragraphing. Appropriate genre features. Clear progression of ideas.
            **4 (Level 4)**: Coherent. Logical paragraphing. Genre features used correctly. Adequate transitions.
            **3 (Level 3)**: Coherent in parts. Some genre features used correctly. Paragraphing present but uneven. Weak transitions.
            **2 (Level 2)**: Some evidence of paragraphing. Some genre features used. Weak or absent transitions. Poor grouping of points.
            **1 (Level 1)**: Basic genre features used. One or two links between sentences. Little coherent structure.
            **0**: No structure.

            ### 📝 MARKER'S MANDATE:
            1. **Predicted Level**: Predict an overall HKDSE Level (1 to 5**). Use the FULL 0-7 range. A Level 5** MUST show "flair" and "sophisticated control." Most average students should score 3-4. Strong students 5-6. Only exceptional students 7.
            2. **Hotspots**: Identify 3-4 specific substrings that need improvement.
               - "original_phrase": EXACT substring from student work.
               - "improved_phrase": Refined version in DSE 5** style.
               - "explanation": { "en": "...", "zh": "..." } - Linguistic reason for change.
            3. **Model Answer**: Provide a FULL-LENGTH 5** model answer (450+ words).
            4. **High Score Tips**: Provide 3 tactical "Marker's Favorites" that would elevate this specific piece.

            ### ABSOLUTE RULES:
            - BILINGUAL: ALL qualitative fields (feedback, summaries, tips) MUST contain both "en" and "zh" objects.
            - CHINESE: EXCLUSIVELY use Traditional Chinese (繁體中文).
            - NO PREAMBLE: Return ONLY the JSON object.

            Output JSON Format (Strict):
            {
                "predicted_level": "Level (e.g. 5, 5*, 5**)",
                "overall_score": float,
                "pillar_scores": {
                    "content": { "score": int, "feedback": { "en": "...", "zh": "..." } },
                    "language": { "score": int, "feedback": { "en": "...", "zh": "..." } },
                    "organization": { "score": int, "feedback": { "en": "...", "zh": "..." } }
                },
                "examiner_summary": { "en": "...", "zh": "..." },
                "improvement_goal": { "en": "...", "zh": "..." },
                "exemplar_comparison": {
                    "original_paragraph": "Student original text",
                    "upgraded_paragraph": "Polished version",
                    "hotspots": [
                        { "original_phrase": "...", "improved_phrase": "...", "explanation": { "en": "...", "zh": "..." } }
                    ]
                },
                "high_score_tips": [
                    { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } }
                ],
                "model_answer_5_star": "..."
            }
        `;

        const prompt = imageParts.length > 0 
            ? [{ text: promptText }, ...imageParts]
            : promptText;

        // Full feedback JSON (bilingual CLO + 450w model answer) requires a large completion budget — default 1024 truncates.
        const gradeJsonOpts = {
            generationConfig: { maxOutputTokens: 8192 }
        };

        const proStart = Date.now();
        try {
            console.log(`[WritingQuestService] Grading with ace-it-pro -> deepseek-reasoner | promptLength=${typeof prompt === 'string' ? prompt.length : JSON.stringify(prompt).length} chars | maxOutputTokens=${gradeJsonOpts.generationConfig.maxOutputTokens}`);
            const result = await this.aiService.generateJson(prompt, { model: 'ace-it-pro', ...gradeJsonOpts });
            console.log(`[WritingQuestService] ace-it-pro (deepseek-reasoner) succeeded in ${Date.now() - proStart}ms`);
            const data = this.normalizeFinalGradePayload(result.data);

            // Normalize internal pillar keys to lowercase for deterministic frontend mapping
            const rawPillars = data.pillar_scores || data.pillarScores || {};
            const normalizedPillars = {};
            Object.keys(rawPillars).forEach(key => {
                normalizedPillars[key.toLowerCase()] = rawPillars[key];
            });

            // Secondary normalization to ensure snake_case for frontend top-level fields
            return {
                ...data,
                predicted_level: data.predicted_level || data.predictedLevel || "4",
                overall_score: data.overall_score || data.overallScore || 4,
                pillar_scores: Object.keys(normalizedPillars).length > 0 ? normalizedPillars : {
                    content: { score: 4, feedback: { en: "Feedback loading...", zh: "正在載入評語..." } },
                    language: { score: 4, feedback: { en: "Feedback loading...", zh: "正在載入評語..." } },
                    organization: { score: 4, feedback: { en: "Feedback loading...", zh: "正在載入評語..." } }
                }
            };
        } catch (error) {
            console.warn(`[WritingQuestService] Final Grade with Pro (deepseek-reasoner) FAILED after ${Date.now() - proStart}ms:`, error.message);
            try {
                console.log(`[WritingQuestService] Falling back to ace-it-flash -> deepseek-chat...`);
                const flashStart = Date.now();
                const result = await this.aiService.generateJson(prompt, { model: 'ace-it-flash', ...gradeJsonOpts });
                console.log(`[WritingQuestService] ace-it-flash (deepseek-chat) succeeded in ${Date.now() - flashStart}ms`);
                const data = this.normalizeFinalGradePayload(result.data);
                const rawPillars = data.pillar_scores || data.pillarScores || {};
                const normalizedPillars = {};
                Object.keys(rawPillars).forEach(key => {
                    normalizedPillars[key.toLowerCase()] = rawPillars[key];
                });

                return {
                    ...data,
                    predicted_level: data.predicted_level || data.predictedLevel || "4",
                    overall_score: data.overall_score || data.overallScore || 4,
                    pillar_scores: Object.keys(normalizedPillars).length > 0 ? normalizedPillars : {
                        content: { score: 4, feedback: { en: "Feedback loading...", zh: "正在載入評語..." } },
                        language: { score: 4, feedback: { en: "Feedback loading...", zh: "正在載入評語..." } },
                        organization: { score: 4, feedback: { en: "Feedback loading...", zh: "正在載入評語..." } }
                    }
                };
            } catch (fallbackError) {
                console.error(`[WritingQuestService] Both Pro and Flash failed. Pro error: ${error.message}. Flash error:`, fallbackError.message);
                return {
                    predicted_level: "4",
                    overall_score: 4,
                    pillar_scores: {
                        content: { score: 4, feedback: { en: "Error evaluating content.", zh: "評核內容時發生錯誤。" } },
                        language: { score: 4, feedback: { en: "Error evaluating language.", zh: "評核語言時發生錯誤。" } },
                        organization: { score: 4, feedback: { en: "Error evaluating organization.", zh: "評核組織時發生錯誤。" } }
                    }
                };
            }
        }
    }

    async fetchImageAsBase64(url) {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            return Buffer.from(response.data, 'binary').toString('base64');
        } catch (e) {
            console.error(`[WritingQuestService] Failed to fetch image: ${url}`, e.message);
            return null;
        }
    }

    /**
     * HKDSE Paper 2 Mock Grading: Grades Part A and Part B together
     */
    async gradeMockPaper(topic, responses, tier = 'free') {
        const imageParts = [];
        const responsesSummary = responses.map(r => {
            return `Part ${r.part} (${r.elective || 'Compulsory'}): ${r.title}\nContent: ${r.text || 'Handwritten (see photos)'}`;
        }).join('\n\n---\n\n');

        for (const res of responses) {
            if (res.images && res.images.length > 0) {
                for (const url of res.images) {
                    const base64 = await this.fetchImageAsBase64(url);
                    if (base64) {
                        imageParts.push({
                            inlineData: {
                                data: base64,
                                mimeType: "image/jpeg"
                            }
                        });
                    }
                }
            }
        }

        const promptText = `
            You are a Senior HKDSE English Marker (Paper 2 Specialist).
            Task: Grade a full Paper 2 Mock Exam (Part A & Part B).
            
            Exam Topic: "${topic}"
            
            ${imageParts.length > 0 ? "Photos of handwritten work are provided. Transcribe and include them in your evaluation." : ""}

            Student Work Summary:
            ${responsesSummary}

            ### GRADING MANDATE:
            1. **Holistic Level**: Assign an overall HKDSE Level (1 to 5**).
            2. **Word Count Check**: 
               - Part A requires ~200 words. Part B requires ~400 words.
               - STERN RULE: If a response is significantly under-length (e.g., Part A < 160 words, Part B < 320 words), you MUST NOT award a 7 for Content. 
               - A Level 5/5*/5** response MUST demonstrate "sustained development" and "depth of thought," which is physically impossible in very short responses. Penalize Content and Organization for lack of elaboration if the work is too brief.
            3. **Part A Breakdown**: Brief comment on Content, Language, and Organization for the compulsory task.
            4. **Part B Breakdown**: Detailed analysis for the elective task.
            5. **Overall C-L-O**: Final scores (1-7) for each domain across both parts.

            Output JSON Format:
            {
                "predicted_level": "5**",
                "overall_score": float,
                "pillar_scores": {
                    "content": { "score": 7, "feedback": { "en": "...", "zh": "..." } },
                    "language": { "score": 7, "feedback": { "en": "...", "zh": "..." } },
                    "organization": { "score": 7, "feedback": { "en": "...", "zh": "..." } }
                },
                "part_a_feedback": { "en": "...", "zh": "..." },
                "part_b_feedback": { "en": "...", "zh": "..." },
                "examiner_summary": { "en": "...", "zh": "..." },
                "high_score_tips": [
                    { "title": { "en": "...", "zh": "..." }, "description": { "en": "...", "zh": "..." } }
                ]
            }

            Language: Use Traditional Chinese (繁體中文) for all "zh" fields.
        `;

        const prompt = imageParts.length > 0 
            ? [{ text: promptText }, ...imageParts]
            : promptText;

        try {
            // TIER-BASED MODEL SELECTION
            const model = (tier && tier.toLowerCase() === 'premium') ? 'ace-it-pro' : 'ace-it-flash';

            const result = await this.aiService.generateJson(prompt, { model: model });
            return result.data;
        } catch (error) {
            console.warn("[WritingQuestService] Mock Grading failed, falling back:", error.message);
            const result = await this.aiService.generateJson(prompt, { model: 'ace-it-flash' });
            return result.data;
        }
    }
}

module.exports = new WritingQuestService();
