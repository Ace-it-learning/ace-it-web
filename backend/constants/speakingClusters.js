/**
 * DSE English Speaking Quest Clusters
 * Defines the 3 pedagogy modules for the Quest Factory.
 */

const SPEAKING_CLUSTERS = {
    delivery: {
        id: 'delivery',
        name: 'Pronunciation',
        name_zh: '發音',
        module_id: 'SPEAK_DELIVERY_001',
        category: 'Mechanical Excellence',
        description: 'The "How" of speaking: Pronunciation, Intonation, Rhythm.',
        ux_mode: 'Mirror & Shadow',
        ui_components: ['Waveform Monitor', 'Rhythm Heatmap', 'Pitch Slider'],
        skills: [
            'speaking_pronunciationClarity',
            'speaking_intonation',
            'speaking_paceRhythm',
            'speaking_grammaticalAccuracy'
        ],
        learning_content: {
            anatomy: {
                definition: "The ability to produce clear sounds while using vocal melody and speed to highlight key information.",
                formula: "Phonetic Precision + Stress-Timed Rhythm = Natural Delivery",
                british_tutor_advice: "In Britain, we say 'It's not what you say, it's how you say it.' Don't pronounce every word with the same force. 'Squash' your grammar words and 'Stretch' your nouns."
            },
            quest_factory_logic: {
                format: "Individual 'Shadowing' or 'Roleplay'",
                scenarios: ["BBC Radio 4 Newsreader", "Product Reviewer", "Tour Guide"],
                strategic_instruction: "The AI should analyze the student's waveform. If they are speaking in a 'flat' tone, trigger a 'Pitch Variation' challenge."
            }
        },
        evaluation_metrics: {
            clarity: "Phoneme accuracy (ends of words: -t, -d, -s)",
            musicality: "Frequency of pitch variance (avoiding monotonic delivery)",
            pacing: "Syllables per second compared to Master Clip"
        }
    },

    flow: {
        id: 'flow',
        name: 'Flow & Spontaneity',
        name_zh: '流暢與即興',
        module_id: 'SPEAK_FLOW_002',
        category: 'Fluency',
        description: 'Automaticity: Getting the brain to move as fast as the mouth.',
        ux_mode: 'Live Response',
        ui_components: ['Confidence Meter', 'Silence Timer', 'Power Word Tracker'],
        skills: [
            'speaking_spontaneity',
            'speaking_confidence',
            'speaking_vocabularyInSpeech'
        ],
        learning_content: {
            anatomy: {
                definition: "The ability to speak without excessive pausing, using a range of vocabulary appropriate to the context.",
                formula: "Collocations + Fillers - Mental Translation = Spontaneity",
                british_tutor_advice: "Stop translating from Cantonese in your head! Use 'fillers' like 'Well,' 'Actually,' or 'To be honest' to give your brain time to think while your mouth is still moving."
            },
            quest_factory_logic: {
                format: "Improvised Response",
                scenarios: ["Sudden Interview", "Answering a Follow-up Question"],
                strategic_instruction: "The Quest Factory should present a sudden change in topic. If the student pauses for more than 2 seconds, the AI peer should gently nudge them with a filler prompt."
            }
        },
        evaluation_metrics: {
            latency: "Time between AI prompt and student response (Goal: < 2.5s)",
            filler_quality: "Use of natural discourse markers vs. silent gaps",
            lexical_range: "Variety of adjectives used vs. repetitive simple words"
        }
    },

    interaction: {
        id: 'interaction',
        name: 'Communication Strategies',
        name_zh: '溝通策略',
        module_id: 'SPEAK_INTERACT_003',
        category: 'Social Collaboration',
        description: 'The social core: Engaging, acknowledging, and managing conversation.',
        ux_mode: 'Multi-Agent Simulation',
        ui_components: ['Airtime Ring', 'Interruption Button', 'Active Listening Tracker'],
        skills: [
            'speaking_turnTaking',
            'speaking_activeListening',
            'speaking_facilitation'
        ],
        learning_content: {
            anatomy: {
                definition: "The skill of engaging with others, acknowledging their points, and managing the direction of the conversation.",
                formula: "Listening Cues + Bridging Phrases = Effective Collaboration",
                british_tutor_advice: "Being the loudest doesn't make you the best. The highest marks go to the student who 'invites' others. Be the diplomat, not the dictator."
            },
            quest_factory_logic: {
                format: "AI Group Discussion (3 AI Peers + 1 Student)",
                scenarios: ["Planning a Charity Event", "Debating School Policy", "Social Issues Debate"],
                strategic_instruction: "One AI peer should be 'The Dominator' who speaks too much. The student's task is to use 'Facilitation' to give a quieter AI peer a turn."
            }
        },
        ai_personas: [
            { role: "Dominator", behavior: "High latency, long turns, few questions" },
            { role: "Passive", behavior: "Zero initiative, short responses, needs prompting" },
            { role: "Devil's Advocate", behavior: "Politely disagrees with everyone to test 'Rebuttal' skills" }
        ],
        evaluation_metrics: {
            facilitation_score: "Frequency of inviting others (e.g., 'What do you think, Candidate B?')",
            bridging_quality: "Ability to link ideas (e.g., 'Building on what Candidate A said...')",
            turn_taking_efficiency: "Success rate of entering the conversation during 'verbal gaps'"
        },
        secret_objective: "Ensure Candidate B (The Passive Peer) speaks at least twice during this 8-minute session."
    },

    language_patterns: {
        id: 'language_patterns',
        name: 'Vocabulary',
        name_zh: '詞彙',
        module_id: 'SPEAK_LANG_004',
        category: 'Linguistic Range',
        description: 'Using specialized vocabulary and complex sentence structures to express subtle meanings.',
        ux_mode: 'Vocabulary Lab',
        ui_components: ['Word Palette', 'Sentence Builder', 'Grammar Guard'],
        skills: [
            'speaking_vocabularyInSpeech',
            'speaking_grammaticalAccuracy',
            'speaking_collocationUsage'
        ],
        learning_content: {
            anatomy: {
                definition: "The ability to use a wide range of vocabulary and grammatical structures accurately and appropriately.",
                formula: "Sophisticated Lexis + Varied Sentence Structures = Academic Authority",
                british_tutor_advice: "Don't just use 'good' or 'bad'. Use 'advantageous' or 'detrimental'. Showcase your range by using relative clauses and passive voice where appropriate."
            },
            quest_factory_logic: {
                format: "Controlled Expression Lab",
                scenarios: ["Academic Presentation", "Formal Interview", "Policy Briefing"],
                strategic_instruction: "Present the student with 'Power Words'. Reward them for integrating these words naturally into their response."
            }
        },
        evaluation_metrics: {
            lexical_resource: "Variety and sophistication of vocabulary used",
            grammatical_range: "Use of complex sentences (subordination, relative clauses)",
            accuracy: "Correctness of grammar and word choice"
        }
    },

    ideas_organisation: {
        id: 'ideas_organisation',
        name: 'Ideas & Organisation',
        name_zh: '意念與組織',
        module_id: 'SPEAK_IDEAS_005',
        category: 'Cognitive Structure',
        description: 'Structuring thoughts logically using the P.E.E.L method to ensure clarity and impact.',
        ux_mode: 'Logical Lab',
        ui_components: ['Mind Map', 'Logic Connector', 'PEEL Tracker'],
        skills: [
            'speaking_logicalDevelopment',
            'speaking_relevance',
            'speaking_organisation'
        ],
        learning_content: {
            anatomy: {
                definition: "The ability to present ideas in a logical, coherent manner, supporting points with evidence and explanation.",
                formula: "Point + Evidence + Explanation + Link = Logical Impact",
                british_tutor_advice: "A great idea is lost if it's poorly organized. Use signposts like 'Firstly', 'Moving on to...', and 'Consequently' to guide your listener through your logic."
            },
            quest_factory_logic: {
                format: "Structural Planning Lab",
                scenarios: ["Debate Opening", "Executive Summary", "Problem-Solution Pitch"],
                strategic_instruction: "Provide a visual structure (Mind Map). Nudge the student if they skip the 'Evidence' or 'Link' parts of the P.E.E.L structure."
            }
        },
        evaluation_metrics: {
            coherence: "Logical flow between sentences and ideas",
            development: "Depth of explanation and quality of evidence",
            organisation: "Effective use of signposting and transitions"
        }
    }
};

module.exports = SPEAKING_CLUSTERS;
