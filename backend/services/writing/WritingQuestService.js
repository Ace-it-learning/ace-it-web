const GenerativeAIService = require('../GenerativeAIService');
const writingSyllabus = require('../../data/writing_quest_syllabus.json');
const genrePrompts = require('../../data/genre_prompts.json');
const admin = require('firebase-admin');

class WritingQuestService {
    constructor() {
        this.aiService = GenerativeAIService;
        // Safety: Initialize default app if it doesn't exist (prevents crashes in scripts)
        if (admin.apps.length === 0) {
            try {
                const serviceAccount = require('../../serviceAccountKey.json');
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
                console.log("[WritingQuestService] Safely initialized Firebase Admin.");
            } catch (err) {
                console.warn("[WritingQuestService] Firebase initialization skip/fail (likely running in restricted dev env).");
            }
        }
    }

    getSyllabus() {
        return writingSyllabus;
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

        // 1. Try fetching from Firestore first (Real Factory Quests)
        try {
            const db = admin.firestore();

            // Generate broad query terms to catch different formats
            const queryTerms = new Set([friendlyGenre, genre]);

            // Slugs
            const underscoreSlug = friendlyGenre.toLowerCase().replace(/ /g, '_');
            const hyphenSlug = friendlyGenre.toLowerCase().replace(/ /g, '-');

            queryTerms.add(underscoreSlug);
            queryTerms.add(hyphenSlug);
            queryTerms.add(`writing_genre_${underscoreSlug}`);
            queryTerms.add(`writing_genre_${hyphenSlug}`);
            queryTerms.add(`writing_genre_${genre.toLowerCase()}`);

            const finalTerms = Array.from(queryTerms);
            // Special cases for common discrepancies in generated quest topics
            if (friendlyGenre === "Letter to the Editor" || genre.toLowerCase().includes("letter")) {
                if (!finalTerms.includes("writing_genre_letter_to_editor")) finalTerms.push("writing_genre_letter_to_editor");
                if (!finalTerms.includes("letter_to_editor")) finalTerms.push("letter_to_editor");
            }

            const queryTermsBatch = finalTerms.slice(0, 10);
            console.log(`[WritingQuestService] Querying for genre "${friendlyGenre}" with terms:`, queryTermsBatch);

            const snapshot = await db.collection('question_bank')
                .where('topic', 'in', queryTermsBatch)
                .where('is_approved', '==', true)
                .get();

            console.log(`[WritingQuestService] Firestore found ${snapshot.size} records.`);

            if (!snapshot.empty) {
                const groups = new Map();

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const passage = data.passage || data.reading_passage || "No Situation";
                    const key = passage.trim();

                    if (!groups.has(key)) {
                        groups.set(key, {
                            id: doc.id,
                            title: data.listing_title || data.title || genre,
                            prompt: passage,
                            created_at: data.created_at ? data.created_at.toMillis() : 0,
                            items: []
                        });
                    }
                    groups.get(key).items.push({ id: doc.id, ...data });
                });

                // Convert to array and sort by most recent
                const firestoreTopics = Array.from(groups.values())
                    .sort((a, b) => b.created_at - a.created_at)
                    .map(group => {
                        // Extract the "best" title/prompt
                        // If all items are "Model Answer", use the situation as title
                        const isAllModelAns = group.items.every(i => (i.listing_prompt || "").includes("Model Answer"));

                        return {
                            id: group.id,
                            title: isAllModelAns ? (genre + ": " + group.title) : group.title,
                            prompt: group.prompt, // The situation text
                            factory: true
                        };
                    });

                console.log(`[WritingQuestService] Found ${firestoreTopics.length} grouped topics in Firestore.`);

                // USER REQUEST: If we found factory quests, we might want to ONLY show those
                // or at least prioritize them. Let's return them now.
                return firestoreTopics;
            }
        } catch (error) {
            console.warn("[WritingQuestService] Firestore fetch failed, falling back to static:", error);
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
            Role: Expert HKDSE English Writing Tutor (British Persona named Miss Janie).
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
            Role: Expert HKDSE English Writing Tutor.
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
            Role: Expert HKDSE English Writing Tutor.
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
            Role: Expert HKDSE English Writing Tutor.
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
    async getAllScenarios() {
        const uniqueScenarios = new Map();
        for (const genreId in genrePrompts.prompts) {
            const formatScenarios = await this.getFactoryTopics(genreId);
            formatScenarios.forEach(s => {
                if (s.id && !uniqueScenarios.has(s.id)) {
                    uniqueScenarios.set(s.id, s);
                }
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
            Role: Expert HKDSE Writing Examiner.
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
            Role: Expert HKDSE Writing Tutor.
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
            Role: Expert HKDSE Writing Examiner.
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
            Role: expert HKDSE Writing AI Marker.
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
    async gradeFinalPiece(topic, textType, content) {
        const prompt = `
            You are a Senior HKDSE English Marker (Level 5** Expert).
            Task: Provide a PROFESSIONAL and DETAILED assessment of the student's work based on 2025 Level Descriptors.
            
            Topic: "${topic}"
            Text Type: "${textType}"
            Student Content: "${content}"

            Grading Criteria (HKDSE 1-7 Scale for Content, Language, Organization):
            - **Content (C)**: Addressing prompt, idea development, depth.
            - **Language (L)**: Vocabulary range, grammar accuracy, complexity.
            - **Organization (O)**: Structure, cohesion, transitions.

            Requirements:
            1. Assign a score (1-7) for each pillar and predict an overall HKDSE Level.
            2. Identify 3-4 "Hotspots" for improvement. 
               - "original_phrase": EXACT substring from student work. Do not hallucinate punctuation.
               - "improved_phrase": Refined version in DSE 5** style.
               - "explanation": { "en": "...", "zh": "..." } - Linguistic reason for change.
            3. MODEL ANSWER: Provide a FULL-LENGTH 5** model answer (450+ words).
            4. HIGH SCORE TIPS: Provide 3 specific, tactical "DSE Tricks" or "Markers' Favorites" that would elevate this specific piece.
            
            ABSOLUTE RULES:
            - ALL qualitative fields MUST contain both "en" and "zh" objects.
            - LANGUAGE: EXCLUSIVELY use Traditional Chinese (繁體中文) for all "zh" fields.
            - Ensure every feedback field is fully translated into Traditional Chinese.
            - No preamble. No meta-commentary.

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

        try {
            const result = await this.aiService.generateJson(prompt);
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
            console.error("[WritingQuest] Grading Error:", error);
            return {
                predicted_level: "4",
                overall_score: 4,
                pillar_scores: {
                    content: { score: 4, feedback: { en: "Solid attempt. Ensure all prompt requirements are fully addressed with deeper analysis.", zh: "表現尚可。請確保充分回應題目要求，並進行更深入的分析。" } },
                    language: { score: 4, feedback: { en: "Generally clear but could benefit from more sophisticated vocabulary and grammatical structures.", zh: "表達基本清晰，但若能使用更豐富的詞彙和語法結構會更好。" } },
                    organization: { score: 4, feedback: { en: "Coherent structure, but transitions could be smoother between complex ideas.", zh: "結構連貫，但在處理複雜觀點時，段落間的過渡可以更流暢。" } }
                },
                examiner_summary: {
                    en: "A satisfactory performance overall. Focus on elevating the sophistication of your arguments and linguistic range to reach higher DSE tiers.",
                    zh: "整體表現令人滿意。建議專注於提升論點的深度以及語言運用的變化，以達到 DSE 更高等級。"
                },
                improvement_goal: {
                    en: "Refine linguistic precision and depth.",
                    zh: "應致力於優化語言的精確度及內容深度。"
                },
                exemplar_comparison: null,
                model_answer_5_star: "High-level exemplars are available in the gallery. / 請參考範文清單以獲取 5** 範本。"
            };
        }
    }
}

module.exports = new WritingQuestService();
