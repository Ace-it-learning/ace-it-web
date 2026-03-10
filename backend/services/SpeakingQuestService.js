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

        let resolvedModuleId = moduleId;
        if (moduleId === 'speaking_groupDiscussion') resolvedModuleId = 'interaction';
        if (moduleId === 'speaking_individualResponse') resolvedModuleId = 'flow';

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

        const wordLimits = { 1: 100, 2: 120, 3: 150, 4: 180, 5: 220 };
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
1. EXHAUSTIVE VOCABULARY: Extract EVERY academic or challenging word from Level 3 to Level 5. I expect at least 10-15 words.
2. ACCENT: The passage MUST be read in a Native British accent (en-GB).
3. "pauses" MUST be an array of word indices (0-based) where a student should take a SIGNIFICANT breath (e.g., at commas, semicolons, or clause boundaries). Do NOT put pauses after every word.
4. Clean IPA: No slashes in the "ipa" field.
5. CLEAN SCRIPT: No literal markers like "//" in the "master_script".
6. VARIETY: Do NOT repeat themes like "Artificial Intelligence" unless specifically required by context. Focus on the specific details of ${chosenContext}.`;

        console.log(`[SpeakingQuest] Generating Dynamic Delivery Passage (Lv ${level})...`);

        try {
            const aiGenerated = await GenerativeAIService.generateJson(prompt, {
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
            { id: "RT_PLASTICS", title: "Banning Single-Use Plastics", prompt: "Should the government ban single-use plastics immediately?", points: ["Environmental impact", "Cost to small businesses", "Public hygiene"] },
            { id: "RT_AI_HOMEWORK", title: "AI in Assignments", prompt: "Should schools ban the use of AI tools for homework?", points: ["Creativity vs Cheating", "Preparing for future careers", "Fairness in grading"] },
            { id: "RT_MANDATORY_SPORTS", title: "Mandatory Sports", prompt: "Should sports participation be mandatory for all high school students?", points: ["Health benefits", "Stress relief", "Impact on study time"] }
        ];

        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

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
            ai_impatience: level >= 5 ? 0.8 : 0.2
        };
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
