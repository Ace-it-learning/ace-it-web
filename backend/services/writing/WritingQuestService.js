const GenerativeAIService = require('../GenerativeAIService');
const writingSyllabus = require('../../data/writing_quest_syllabus.json');
const genrePrompts = require('../../data/genre_prompts.json');
const QuestionBankStore = require('../QuestionBankStore');
const axios = require('axios');

function writingScenarioCreatedAtMs(row) {
    const v = row && row.created_at;
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
        const t = Date.parse(v);
        return Number.isFinite(t) ? t : 0;
    }
    if (typeof v.toMillis === 'function') return v.toMillis();
    if (v._seconds != null) return v._seconds * 1000;
    return 0;
}

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

    /**
     * When Firestore rows omit listing titles, the UI fell back to the genre name only
     * (“Letter to the Editor” × N). Prefer a stable, unique label: genre + prompt excerpt.
     */
    disambiguateWritingCardTitle(friendlyGenre, rawTitle, prompt) {
        const g = (friendlyGenre || '').trim();
        const t = (rawTitle || '').trim();
        const p = (prompt || '').replace(/\s+/g, ' ').trim();
        const looksLikeGenreOnly =
            !t ||
            t.toLowerCase() === g.toLowerCase() ||
            t === 'No Situation';
        if (looksLikeGenreOnly && p && p !== 'No Situation') {
            const excerpt = p.length > 88 ? `${p.slice(0, 85).trim()}…` : p;
            return `${g}: ${excerpt}`;
        }
        return t || g;
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

        // 1. Factory quests from Cosmos (question_bank)
        try {
            const queryTerms = new Set([friendlyGenre, genre]);

            const underscoreSlug = friendlyGenre.toLowerCase().replace(/ /g, '_');
            const hyphenSlug = friendlyGenre.toLowerCase().replace(/ /g, '-');

            queryTerms.add(underscoreSlug);
            queryTerms.add(hyphenSlug);
            queryTerms.add(`writing_genre_${underscoreSlug}`);
            queryTerms.add(`writing_genre_${hyphenSlug}`);
            queryTerms.add(`writing_genre_${genre.toLowerCase()}`);

            const finalTerms = Array.from(queryTerms);
            if (friendlyGenre === "Letter to the Editor" || genre.toLowerCase().includes("letter")) {
                if (!finalTerms.includes("writing_genre_letter_to_editor")) finalTerms.push("writing_genre_letter_to_editor");
                if (!finalTerms.includes("letter_to_editor")) finalTerms.push("letter_to_editor");
            }

            const queryTermsBatch = finalTerms.slice(0, 10);
            console.log(`[WritingQuestService] Querying Cosmos for genre "${friendlyGenre}" with terms:`, queryTermsBatch);

            const rows = await QuestionBankStore.queryApprovedWritingByTopics(queryTermsBatch, 250);

            console.log(`[WritingQuestService] Cosmos found ${rows.length} records.`);

            if (rows.length > 0) {
                const groups = new Map();

                rows.forEach((data) => {
                    const docId = data.id;
                    const passage = data.passage || data.reading_passage || "No Situation";
                    const key = passage.trim();

                    if (!groups.has(key)) {
                        groups.set(key, {
                            id: docId,
                            title: data.listing_title || data.title || friendlyGenre,
                            prompt: passage,
                            created_at: writingScenarioCreatedAtMs(data),
                            items: []
                        });
                    }
                    groups.get(key).items.push({ id: docId, ...data });
                });

                const factoryTopics = Array.from(groups.values())
                    .sort((a, b) => b.created_at - a.created_at)
                    .map((group) => {
                        const isAllModelAns = group.items.every(i => (i.listing_prompt || "").includes("Model Answer"));

                        const raw = isAllModelAns
                            ? `${friendlyGenre}: ${group.title}`
                            : group.title;

                        return {
                            id: group.id,
                            title: this.disambiguateWritingCardTitle(friendlyGenre, raw, group.prompt),
                            prompt: group.prompt,
                            genre: friendlyGenre,
                            factory: true
                        };
                    });

                console.log(`[WritingQuestService] Returning ${factoryTopics.length} grouped factory topics from Cosmos.`);

                return factoryTopics;
            }
        } catch (error) {
            console.warn("[WritingQuestService] Cosmos fetch failed, falling back to static:", error);
        }

        // 2. Fallback to Static JSON
        let resolvedGenre = genre;
        if (!genrePrompts.prompts[resolvedGenre]) {
            const keys = Object.keys(genrePrompts.prompts);
            const slugMatch = keys.find(k => k.toLowerCase() === resolvedGenre.toLowerCase().replace(/-/g, ' '));
            if (slugMatch) resolvedGenre = slugMatch;
        }

        if (!genrePrompts.prompts[resolvedGenre]) {
            return [];
        }

        // Map static prompts to common format
        return genrePrompts.prompts[resolvedGenre].map((p, idx) => ({
            id: `static_${resolvedGenre}_${idx}`,
            title: p.title || p.topic || resolvedGenre,
            prompt: p.prompt || p.topic,
            genre: resolvedGenre,
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

            Output JSON:
            {
                "essay_content": "Full essay text here..."
            }
        `;

        try {
            const result = await this.aiService.generateJson(prompt);
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
            console.error("[WritingQuest] Real-time Analysis Error:", error);
            return {
                overall_feedback: "Keep writing! Use the 'Review' button for deeper analysis.",
                clo_status: { content: 50, language: 50, organization: 50 },
                paragraph_analysis: [],
                vocabulary_upgrades: [],
                checklist_status: []
            };
        }
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

            ### 🎯 HKEAA MARKING CRITERIA (1-7 SCALE):
            Evaluate each pillar on a scale of 1 to 7. Use the following descriptors as your internal anchor:

            **1. Content (C) - 7 Marks Max**
            - **7 (Elite)**: Content is sophisticated and highly relevant. Ideas are extensively developed with significant depth, creativity, or insight. Audience awareness is masterful.
            - **5 (Strong)**: Content is relevant and well-developed. Ideas are clear and supported with relevant details. Good audience awareness.
            - **3 (Basic)**: Content is partially relevant. Some development of ideas but lacks depth or becomes repetitive.
            - **1 (Weak)**: Very limited content. Highly repetitive or irrelevant.
            *STERN RULE: If length is < 160 words (Part A) or < 320 words (Part B), do NOT award a 7 for Content as development is not sustained.*

            **2. Language (L) - 7 Marks Max**
            - **7 (Elite)**: Wide range of vocabulary and complex sentence structures used with flair and precision. Extremely high degree of accuracy; errors are rare/minor.
            - **5 (Strong)**: Good range of vocabulary and structures. Generally accurate; errors do not impede communication.
            - **3 (Basic)**: Simple vocabulary and structures. Frequent errors in grammar/spelling, though meaning is mostly clear.
            - **1 (Weak)**: Very limited vocabulary. Frequent errors that significantly obscure meaning.

            **3. Organization (O) - 7 Marks Max**
            - **7 (Elite)**: Perfectly cohesive and logically structured. Sophisticated use of transitions and connectives. Genre conventions are flawlessly followed.
            - **5 (Strong)**: Logically organized and cohesive. Effective use of paragraphing and transition devices.
            - **3 (Basic)**: Basic organization. Some cohesive devices used, but may be mechanical (e.g., Firstly, Secondly).
            - **1 (Weak)**: Poorly organized. Lacks clear paragraphing or logical flow.

            ### 📝 MARKER'S MANDATE:
            1. **Predicted Level**: Predict an overall HKDSE Level (1 to 5**). A Level 5** MUST show "flair" and "sophisticated control." If the writing is merely "correct" but lacks impact, cap it at Level 4 or 5.
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

        try {
            const result = await this.aiService.generateJson(prompt, { model: 'ace-it-pro' });
            const data = result.data;

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
            console.warn("[WritingQuestService] Final Grade with Pro failed, falling back to Flash:", error.message);
            try {
                const result = await this.aiService.generateJson(prompt, { model: 'ace-it-flash' });
                const data = result.data;
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
                console.error("[WritingQuestService] Both Pro and Flash failed:", fallbackError);
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
