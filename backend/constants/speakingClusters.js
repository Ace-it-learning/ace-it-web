/**
 * DSE English Speaking Quest Clusters
 * Defines the 3 pedagogy modules for the Quest Factory.
 */

const SPEAKING_CLUSTERS = {
    delivery: {
        id: 'delivery',
        name: 'Delivery & Musicality',
        name_zh: '表達與音樂性',
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
        name: 'Dynamic Interaction',
        name_zh: '動態互動',
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
    }
};

module.exports = SPEAKING_CLUSTERS;
