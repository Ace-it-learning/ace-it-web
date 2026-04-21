const admin = require('firebase-admin');
const SPEAKING_CLUSTERS = require('../constants/speakingClusters');
const MICRO_SKILLS = require('../constants/microSkills');
const GenerativeAIService = require('./GenerativeAIService');

class SpeakingQuestService {
    constructor() {
        this.db = admin.firestore();
    }

    /**
     * MAIN ENTRY: Generate a Speaking Quest
     */
    async generateQuest(uid, moduleId, level = 3, focus = null) {
        console.log(`[SpeakingQuest] Generating ${moduleId} quest for ${uid} (Level ${level}, Focus: ${focus})`);

        // 1. Check if the topic is a pre-written drill (e.g. a_1, b_2, etc.)
        // This bypasses AI generation for a snappier experience.
        const fs = require('fs');
        const path = require('path');
        const drillsPath = path.join(__dirname, '../data/speaking_drills.json');

        if (fs.existsSync(drillsPath)) {
            const drills = JSON.parse(fs.readFileSync(drillsPath, 'utf8'));
            const flattenedDrills = [
                ...(drills.criterion_a || []),
                ...(drills.criterion_b || []),
                ...(drills.criterion_c || []),
                ...(drills.criterion_d || [])
            ];

            const preWritten = flattenedDrills.find(d => d.id === focus); // 'focus' is often used as the drill ID in requests
            if (preWritten) {
                console.log(`[SpeakingQuest] Registry Hit: Loading pre-written drill ${focus}`);
                
                // Determine UX Mode and Cluster
                let uxMode = 'delivery';
                let clusterId = 'delivery';
                if (preWritten.id.startsWith('b_')) { uxMode = 'interaction_lab'; clusterId = 'interaction'; }
                if (preWritten.id.startsWith('c_')) { uxMode = 'vocabulary_lab'; clusterId = 'language_patterns'; }
                if (preWritten.id.startsWith('d_')) { uxMode = 'logical_lab'; clusterId = 'ideas_organisation'; }
                if (moduleId === 'flow') { uxMode = 'flow'; clusterId = 'flow'; }

                const response = {
                    template_id: preWritten.id,
                    role: preWritten.role || "AI Mentor",
                    scenario: preWritten.scenario || preWritten.title,
                    description: preWritten.description,
                    starting_question: preWritten.starting_question,
                    cluster_id: clusterId,
                    ux_mode: uxMode,
                    is_dynamic: false,
                    is_prewritten: true
                };

                // Inject specialized data for C/D
                if (clusterId === 'language_patterns') {
                    response.power_words = preWritten.power_words || [];
                    response.practice_sentences = preWritten.practice_sentences || [];
                } else if (clusterId === 'ideas_organisation') {
                    response.mind_map = preWritten.mind_map;
                    response.guidance = preWritten.guidance;
                } else {
                    // Fallback to legacy segment-based structure for Delivery/Interaction
                    response.segments = [{
                        segment_id: "P1",
                        title: preWritten.title,
                        master_script: preWritten.master_script || preWritten.stimulus,
                        master_audio_voice: "en-GB-Standard-A",
                        vocabulary: preWritten.vocabulary || [],
                        prosody: preWritten.prosody || { pauses: [], emphasis: [], intonation: [] },
                        focus_advice: preWritten.focus_advice || preWritten.strategy_goal || "Focus on natural rhythm and sentence-level stress.",
                        stimulus: preWritten.stimulus,
                        strategy_goal: preWritten.strategy_goal,
                        power_phrases: preWritten.power_phrases || []
                    }];
                }

                return response;
            }
        }

        let resolvedModuleId = moduleId;
        if (moduleId === 'speaking_groupDiscussion') resolvedModuleId = 'interaction';
        if (moduleId === 'speaking_individualResponse') resolvedModuleId = 'flow';
        if (moduleId === 'language_patterns') resolvedModuleId = 'language_patterns';
        if (moduleId === 'ideas_organisation') resolvedModuleId = 'ideas_organisation';

        const clusterKey = Object.keys(SPEAKING_CLUSTERS).find(k => k === resolvedModuleId || SPEAKING_CLUSTERS[k].module_id === resolvedModuleId);
        if (!clusterKey) throw new Error(`Invalid Speaking Module ID: ${moduleId}`);

        const cluster = SPEAKING_CLUSTERS[clusterKey];

        switch (clusterKey) {
            case 'delivery':
                return this.generateDeliveryQuest(level, cluster, focus);
            case 'flow':
                return this.generateFlowQuest(uid, level, cluster, focus);
            case 'interaction':
                return this.generateInteractionQuest(level, cluster, focus);
            case 'language_patterns':
                return this.generateLanguageQuest(level, cluster, focus);
            case 'ideas_organisation':
                return this.generateIdeasQuest(level, cluster, focus);
            default:
                throw new Error(`Unsupported Speaking Cluster: ${clusterKey}`);
        }
    }

    /**
     * Module 1: Delivery & Musicality
     * REFINED: Single-paragraph DSE "Reading Aloud" passage
     */
    async generateDeliveryQuest(level, cluster, focus = null) {
        const focusName = focus ? (MICRO_SKILLS[focus]?.name || focus) : "General Delivery";

        const wordLimits = { 1: 100, 2: 120, 3: 150, 4: 180, 5: 220, 6: 250, 7: 300 };
        const wordCount = wordLimits[level] || 150;

        const contexts = ["HK Current Affairs", "Technology", "Environment", "Education", "Arts & Culture", "Sports & Health", "Tourism & Leisure"];
        const chosenContext = contexts[Math.floor(Math.random() * contexts.length)];
        const randomSeed = Date.now();

        const prompt = `You are a DSE English Material Writer. Generate a coherent reading passage for a "Reading Aloud" exercise.
Context: ${chosenContext}.
Length: Approximately ${wordCount} words.
Complexity: DSE Level ${level}.
Random Seed: ${randomSeed} (Use this to ensure variety from previous generates).

STRUCTURE:
Generate EXACTLY ONE single, cohesive paragraph. 

OUTPUT JSON FORMAT:
{
    "set_id": "DYNAMIC_QUEST_" + timestamp,
    "role": "News Anchor" or "Journalist" or "Guest Speaker",
    "scenario": "A descriptive title of the context",
    "passage": {
        "title": "A headline for the passage",
        "master_script": "The full text of the paragraph",
        "master_audio_voice": "en-GB-Standard-A", 
        "focus_advice": "A specific tip on tone/intonation for this passage",
        "vocabulary": [
            { "word": "example", "translation": "例子", "ipa": "ɪɡˈzɑːmpl", "definition": "A thing characteristic of its kind" }
        ],
        "prosody": {
            "pauses": [5, 12, 20], 
            "emphasis": ["words to emphasize"],
            "intonation": [
                { "text": "rising phrase", "type": "rising" },
                { "text": "falling phrase", "type": "falling" }
            ]
        }
    }
}

CRITICAL: 
1. EXHAUSTIVE VOCABULARY: Extract EVERY academic or challenging word appropriate for Level ${level}. For levels 6 and 7, focus on exceptionally sophisticated or nuanced vocabulary typical of 5** DSE standards. I expect at least 10-15 words.
2. ACCENT: The passage MUST be read in a Native British accent (en-GB).
3. "pauses" MUST be an array of word indices (0-based) where a student should take a SIGNIFICANT breath (e.g., at commas, semicolons, or clause boundaries). Do NOT put pauses after every word.
4. Clean IPA: No slashes in the "ipa" field.
5. CLEAN SCRIPT: No literal markers like "//" in the "master_script".
6. VARIETY: Do NOT repeat themes like "Artificial Intelligence" unless specifically required by context. Focus on the specific details of ${chosenContext}.`;

        console.log(`[SpeakingQuest] Generating Dynamic Delivery Passage (Lv ${level})...`);

        try {
            const aiGenerated = await GenerativeAIService.generateJson(prompt, {
                model: "ace-it-flash",
                generationConfig: { temperature: 0.8 }
            });

            return {
                template_id: aiGenerated.set_id,
                role: aiGenerated.role,
                scenario: aiGenerated.scenario,
                segments: [{
                    segment_id: "P1",
                    title: aiGenerated.passage.title,
                    master_script: aiGenerated.passage.master_script,
                    master_audio_voice: aiGenerated.passage.master_audio_voice,
                    focus_advice: aiGenerated.passage.focus_advice,
                    vocabulary: aiGenerated.passage.vocabulary || [],
                    prosody: aiGenerated.passage.prosody || { pauses: [], emphasis: [], intonation: [] }
                }],
                cluster_id: cluster.id,
                ux_mode: cluster.ux_mode,
                ui_components: cluster.ui_components,
                evaluation_metrics: cluster.evaluation_metrics,
                scaffolding: this.getScaffoldingRules(level),
                focus_skill: focus,
                focus_name: focusName,
                is_dynamic: true
            };
        } catch (error) {
            console.error("[SpeakingQuest] Dynamic Generation Failed, falling back to static:", error);
            return this.getStaticDeliveryFallback(level, cluster, focus, focusName);
        }
    }

    /**
     * Fallback for generateDeliveryQuest
     */
    getStaticDeliveryFallback(level, cluster, focus, focusName) {
        // ... (Keep the previous newsreader set as emergency backup)
        return {
            template_id: "FALLBACK_NEWS",
            role: "Newsreader",
            scenario: "Global Climate Summit",
            segments: [
                {
                    segment_id: "S1",
                    title: "The Opening",
                    master_script: "World leaders have gathered in Geneva today for a pivotal summit on climate action, as rising global temperatures reach a critical threshold.",
                    master_audio_voice: "en-GB-Standard-A",
                    focus_advice: "Speak with gravity. Pause clearly after 'Geneva' and 'action'.",
                    focus_phonemes: ["/v/", "/th/"]
                },
                {
                    segment_id: "S2",
                    title: "The Crisis",
                    master_script: "Scientific data presented this morning confirms that despite international efforts, the rate of glacial melting has accelerated significantly over the past decade.",
                    master_audio_voice: "en-GB-Standard-A",
                    focus_advice: "Maintain a steady, professional pace. Enunciate 'significantly' and 'decade' with precision.",
                    focus_phonemes: ["/s/", "/d/"]
                },
                {
                    segment_id: "S3",
                    title: "The Goal",
                    master_script: "The delegates aim to finalize a comprehensive treaty that would mandate drastic reductions in carbon emissions by the year twenty-fifty.",
                    master_audio_voice: "en-GB-Standard-A",
                    focus_advice: "End with a falling intonation. Sound conclusive and authoritative.",
                    focus_phonemes: ["/f/", "/r/"]
                }
            ],
            cluster_id: cluster.id,
            ux_mode: cluster.ux_mode,
            ui_components: cluster.ui_components,
            evaluation_metrics: cluster.evaluation_metrics,
            scaffolding: this.getScaffoldingRules(level),
            focus_skill: focus,
            focus_name: focusName
        };
    }
    /**
     * Module 2: Flow & Spontaneity
     * REFINED: Dynamic Flow Quest with structural hints
     */
    async generateFlowQuest(uid, level, cluster, focus = null) {
        const focusName = focus ? (MICRO_SKILLS[focus]?.name || focus) : "General Flow";

        const prompt = `You are a DSE Speaking Examiner creating a Flow Quest. Generate a realistic interview scenario and 3 follow-up questions.
Scenario Type: ${cluster.learning_content.quest_factory_logic.scenarios[0]}
Student Level: ${level}
Focus Skill: ${focusName}

OUTPUT JSON FORMAT:
{
    "scenario_title": "A short, engaging title for the interview scenario",
    "scenario_description": "A brief description of the situation",
    "ai_persona": {
        "name": "Name of the AI",
        "description": "Brief persona description"
    },
    "questions": [
        {
            "question_id": "Q1",
            "question_text": "The first question",
            "structural_hints": [
                {"type": "Starting Sentence", "text": "I believe that..."},
                {"type": "Point of View", "text": "From a student's perspective..."},
                {"type": "Elaboration", "text": "For instance, in my school..."}
            ]
        },
        ... (2 more questions)
    ]
}

CRITICAL: The hints should help students who get stuck on the LOGICAL THINKING or STRUCTURE of the answer. Provide useful sentence starters tailored to the question.`;

        try {
            const aiGenerated = await GenerativeAIService.generateJson(prompt, {
                model: "ace-it-flash",
                generationConfig: { temperature: 0.7 }
            });

            aiGenerated.questions = (aiGenerated.questions || []).map((q, idx) => ({
                ...q,
                question_id: q.question_id || `Q${idx + 1}`,
                structural_hints: q.structural_hints || []
            }));

            return {
                template_id: `FLOW_DYNAMIC_${Date.now()}`,
                role: aiGenerated.ai_persona?.name || "AI Interviewer",
                scenario: aiGenerated.scenario_title,
                description: aiGenerated.scenario_description,
                questions: aiGenerated.questions,
                cluster_id: cluster.id,
                ux_mode: cluster.ux_mode,
                ui_components: cluster.ui_components,
                evaluation_metrics: cluster.evaluation_metrics,
                scaffolding: this.getScaffoldingRules(level),
                focus_skill: focus,
                focus_name: focusName
            };
        } catch (error) {
            console.error("[SpeakingFlow] AI Generation failed, falling back to static:", error);
            return {
                template_id: "FLOW_FALLBACK",
                role: "AI Interviewer",
                scenario: "A School Event",
                description: "You are being interviewed about a recent school celebration.",
                questions: [
                    {
                        question_id: "Q1",
                        question_text: "What was the most memorable part of the school's 50th-anniversary celebration?",
                        structural_hints: [
                            { type: "Starting Sentence", text: "The most unforgettable moment was definitely..." },
                            { type: "Point of View", text: "As a member of the student council, I noticed..." }
                        ]
                    }
                ],
                cluster_id: cluster.id,
                ux_mode: cluster.ux_mode,
                ui_components: cluster.ui_components,
                evaluation_metrics: cluster.evaluation_metrics,
                scaffolding: this.getScaffoldingRules(level),
                focus_skill: focus,
                focus_name: focusName
            };
        }
    }

    /**
     * Module 3: Dynamic Interaction
     */
    async generateInteractionQuest(level, cluster, focus = null) {
        const focusName = focus ? (MICRO_SKILLS[focus]?.name || focus) : "General Interaction";
        const TOPICS = [
            {
                id: "RT_AI_EDUCATION",
                title: "How AI will disrupt education in school",
                prompt: "Discuss how artificial intelligence will disrupt education in schools. Consider both positive and negative impacts.",
                points: ["Personalized learning", "Teacher roles", "Ethical concerns", "Digital divide", "Future skills"]
            }
        ];

        const topic = TOPICS[0]; // Fixed topic

        return {
            template_id: topic.id,
            cluster_id: cluster.id,
            ux_mode: cluster.ux_mode,
            ui_components: cluster.ui_components,
            dse_prompt: topic.prompt,
            discussion_points: topic.points,
            ai_personas: cluster.ai_personas,
            secret_objective: cluster.secret_objective,
            evaluation_metrics: cluster.evaluation_metrics,
            scaffolding: this.getScaffoldingRules(level)
        };
    }

    /**
     * Scaffolding Rules
     */
    getScaffoldingRules(level) {
        return {
            subtitle_hints: level <= 3,
            linking_detection: level >= 5,
            filler_nudge_delay: level <= 3 ? 4 : 2,
            ai_impatience: level >= 7 ? 0.9 : (level >= 5 ? 0.8 : 0.2)
        };
    }

    /**
     * Module 4: Language Patterns (Vocabulary Lab)
     */
    async generateLanguageQuest(level, cluster, focus = null) {
        const focusName = focus ? (MICRO_SKILLS[focus]?.name || focus) : "Language Patterns";
        const prompt = `You are a DSE English Material Writer. Generate a Language Patterns Quest.
Student Level: ${level}
Focus: ${focusName}

OUTPUT JSON FORMAT:
{
    "scenario": "A short, engaging title",
    "description": "A brief description of the situation",
    "ai_persona": "Persona name",
    "power_words": [
        { "word": "sophisticated word", "ipa": "...", "translation": "Chinese translation", "definition": "..." },
        ... (at least 6-8 words)
    ],
    "practice_sentences": [
        { 
            "text": "Sentence using power word in **bold**", 
            "target_word": "bolded_word", 
            "explanation": "English definition",
            "explanation_cn": "Chinese translation of the definition"
        },
        ... (EXACTLY 5 sentences)
    ],
    "starting_question": "An open-ended question that requires the use of the power words."
}

CRITICAL: 
1. The power words should be challenging for Level ${level} but relevant to the scenario.
2. SENTENCE COMPLEXITY: For higher levels (5, 6, 7), use longer sentences with complex structures (relative clauses, nominalization). For lower levels (3, 4), keep them concise and direct.
3. LANGUAGE: Always include "explanation_cn" for every practice sentence.`;

        try {
            const aiGenerated = await GenerativeAIService.generateJson(prompt, { model: "ace-it-flash" });
            return {
                template_id: `LANG_DYNAMIC_${Date.now()}`,
                title: aiGenerated.scenario, // Standardized Title
                role: aiGenerated.ai_persona,
                scenario: aiGenerated.scenario,
                description: aiGenerated.description,
                power_words: aiGenerated.power_words,
                practice_sentences: aiGenerated.practice_sentences || [],
                starting_question: aiGenerated.starting_question,
                cluster_id: cluster.id,
                ux_mode: cluster.ux_mode,
                ui_components: cluster.ui_components,
                evaluation_metrics: cluster.evaluation_metrics,
                scaffolding: this.getScaffoldingRules(level),
                focus_skill: focus,
                focus_name: focusName
            };
        } catch (error) {
            console.error("[SpeakingLanguage] AI Generation failed:", error);
            return { template_id: "LANG_FALLBACK", ...aiGenerated }; // Simplification for fallback
        }
    }

    /**
     * Module 5: Ideas & Organisation (Logical Lab)
     */
    async generateIdeasQuest(level, cluster, focus = null) {
        const focusName = focus ? (MICRO_SKILLS[focus]?.name || focus) : "Ideas & Organisation";
        const prompt = `You are a DSE English Material Writer. Generate an Ideas & Organisation Quest.
Student Level: ${level}
Focus: ${focusName}

OUTPUT JSON FORMAT:
{
    "scenario": "A short, engaging title",
    "description": "A brief description of the situation",
    "ai_persona": "Persona name",
    "mind_map": {
        "center_issue": "Main topic",
        "branches": [
            { "title": "Branch 1", "sub_points": ["Point A", "Point B"] },
            ...
        ]
    },
    "guidance": "Instructions on using the P.E.E.L structure for this specific topic.",
    "starting_question": "A complex question that requires logical structuring."
}

CRITICAL: The mind_map should provide a clear logical framework for the student to follow.`;

        try {
            const aiGenerated = await GenerativeAIService.generateJson(prompt, { model: "ace-it-flash" });
            return {
                template_id: `IDEAS_DYNAMIC_${Date.now()}`,
                title: aiGenerated.scenario, // Standardized Title
                role: aiGenerated.ai_persona,
                scenario: aiGenerated.scenario,
                description: aiGenerated.description,
                mind_map: aiGenerated.mind_map,
                guidance: aiGenerated.guidance,
                starting_question: aiGenerated.starting_question,
                cluster_id: cluster.id,
                ux_mode: cluster.ux_mode,
                ui_components: cluster.ui_components,
                evaluation_metrics: cluster.evaluation_metrics,
                scaffolding: this.getScaffoldingRules(level),
                focus_skill: focus,
                focus_name: focusName
            };
        } catch (error) {
            console.error("[SpeakingIdeas] AI Generation failed:", error);
            throw error;
        }
    }

    /**
     * Helper: Get Recent Vocab
     */
    async getRecentVocab(uid) {
        try {
            if (!uid) return [];
            const vocabSnapshot = await this.db.collection('users').doc(uid)
                .collection('vocabulary')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            if (!vocabSnapshot.empty) {
                return vocabSnapshot.docs.map(doc => ({
                    word: doc.data().word || doc.data().text,
                    definition: doc.data().definition
                }));
            }
        } catch (e) {
            console.warn(`[SpeakingQuest] Failed to fetch vocab for ${uid}: ${e.message}`);
        }

        return [
            { word: "Significantly", definition: "In a sufficiently great or important way." },
            { word: "Controversial", definition: "Giving rise or likely to give rise to public disagreement." },
            { word: "Inevitably", definition: "As is certain to happen." },
            { word: "Perspective", definition: "A particular attitude toward or way of regarding something." },
            { word: "Fundamental", definition: "Forming a necessary base or core; of central importance." }
        ];
    }
}

module.exports = new SpeakingQuestService();
