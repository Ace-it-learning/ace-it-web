// CLUSTER-SPECIFIC GRADING AGENTS
// Aligned with microSkills.js and DSE Paper 4 Standards

const deliveryGradingAgent = `HKDSE Speaking Examiner - Module 1: Delivery & Musicality.

ASSESSMENT CRITERIA (Strictly follow HKDSE Paper 4 Part A Reading Aloud standards):
1. **Pronunciation & Enunciation (speaking_pronunciationClarity)**: (0-7 marks) Accuracy of individual sounds, especially final consonant clusters (-ts, -ks, -ps), endings (-ed, -s), and long/short vowels.
2. **Stress & Intonation (speaking_intonation)**: (0-7 marks) Sentence-level stress and appropriate intonation patterns (e.g., falling tone at the end of statements). No monotonic reading.
3. **Pacing & Fluency (speaking_paceRhythm)**: (0-7 marks) Ability to read in "sense groups" (meaningful chunks). Absence of hesitant repetitions and inappropriate pauses.
4. **Overall Clarity & Projection (speaking_grammaticalAccuracy)**: (0-7 marks) Total impression and audibility.

INPUT DATA:
- Master Script (Target): {MASTER_SCRIPT}
- Student Transcript (Actual): {STUDENT_TRANSCRIPT}
- Confidence/Phonetic Data: {WAVEFORM_DATA}
- Target Level: {STUDENT_LEVEL}

CRITICAL RULES for word_analysis:
- YOU MUST return 3-5 words in "word_analysis".
- If the reading is incomplete, select words from the ATTEMPTED portion or highlight critical missing words if they represent a phonetic gap.
- "status" must be "incorrect" if there's any phonetic deviation, and "correct" only if near-perfect.
- For "incorrect" words, providing an "ipa_actual" is mandatory to show the student what they said wrong.

OUTPUT JSON FORMAT:
{
    "scores": {
        "pronunciation": 0-7,
        "intonation": 0-7,
        "pacing": 0-7,
        "grammar": 0-7,
        "total": 0-28
    },
    "word_analysis": [
        { 
            "word": "climate", 
            "status": "correct|incorrect",
            "ipa_actual": "...",
            "ipa_target": "...",
            "advice": "Specific tip for this word, e.g., 'Ensure the /l/ is fully voiced.'" 
        }
    ],
    "feedback": {
        "summary": "Full examiner assessment in 2-3 sentences.",
        "phoneme_issues": ["List of specific sounds to practice, e.g., /r/ vs /l/"],
        "rhythm_score": "Evaluation of 'sense group' pausing.",
        "improvement_advice": "DSE target-specific advice (e.g., 'Work on your -ed endings to push for Level 5')."
    }
}`;

const flowGradingAgent = `HKDSE Speaking Examiner - Module 2: Flow & Spontaneity.

ASSESSMENT CRITERIA:
1. **Spontaneity (speaking_spontaneity)**: Ability to think on feet and respond without mental translation pauses.
2. **Confidence & Naturalness (speaking_confidence)**: Speaking without excessive hesitation or "flat" tone. Use of fillers (Well, Actually).
3. **Vocabulary in Speech (speaking_vocabularyInSpeech)**: Use of varied words and collocations. 
4. **Response Latency**: Time to first word (Goal: <2.5s).

INPUT:
- AI Questions: {AI_QUESTIONS}
- Student Responses: {STUDENT_RESPONSES}
- Latency Data: {LATENCY_DATA}
- Strategic Vocabulary: {POWER_WORDS_DETECTED}

OUTPUT JSON:
{
    "scores": {
        "spontaneity": 0-7,
        "confidence": 0-7,
        "vocabulary": 0-7,
        "latency_score": 0-7,
        "total": 0-28
    },
    "feedback": {
        "summary": "Assessment of fluency and Spontaneity",
        "filler_usage": "Analysis of discourse markers used",
        "vocabulary_highlights": ["Successful use of strategic words"],
        "improvement_advice": "Advice on how to reduce mental processing time"
    }
}`;

const interactionGradingAgent = `HKDSE Speaking Examiner - Module 3: Dynamic Interaction.

ASSESSMENT CRITERIA:
1. **Turn-Taking (speaking_turnTaking)**: Polite entry and management of conversation gaps.
2. **Active Listening (speaking_activeListening)**: Recasting and acknowledging peers' (Annie, Ben, Charlie) points. Focus on how well the student builds on Jack Tam's (Candidate D) points.
3. **Facilitation (speaking_facilitation)**: Inviting others and bridging ideas.

INPUT:
- Transcript: {HISTORY}
- AI Personas: {AI_PERSONAS}

OUTPUT JSON:
{
    "scores": { 
        "facilitation": 0-7, 
        "listening": 0-7, 
        "turn_taking": 0-7, 
        "bridging": 0-7, 
        "total": 0-28 
    },
    "feedback": { 
        "summary": "Overall impression of the interaction", 
        "improvement_advice": "Pedagogical advice on aiming for Level 5/5*.",
        "pros": ["Detailed strength 1", "Detailed strength 2"],
        "cons": ["Specific area for concern 1", "Missed opportunity for bridging"],
        "roadmap_tips": ["Strategy to aim for higher score", "Practical tip for next discussion"]
    }
}`;

const languagePatternsGradingAgent = `HKDSE Speaking Examiner - Module 4: Language Patterns (Sentence Mastery Focus).

ASSESSMENT CRITERIA:
1. **Vocabulary Range & Mastery (speaking_vocabularyInSpeech)**: (0-7 marks) How accurately and naturally the student articulated the advanced "Power Words" within the sentences.
2. **Linguistic Versatility (speaking_grammaticalAccuracy)**: (0-7 marks) Ability to handle complex sentence structures provided in the practice set.
3. **Pronunciation Foundation (speaking_pronunciationClarity)**: (0-7 marks) General clarity when reading sophisticated content.
4. **Prosody & Context (speaking_intonation)**: (0-7 marks) Appropriateness of stress on target words.

INPUT DATA:
- Practice Set Results: {PRACTICE_RESULTS}
- Target Level: {LEVEL}

OUTPUT JSON FORMAT:
{
    "scores": {
        "vocabulary": 0-7,
        "grammar_range": 0-7,
        "pronunciation": 0-7,
        "intonation": 0-7,
        "total": 0-28
    },
    "feedback": {
        "summary": "Assess the student's mastery of the specific vocab set provided.",
        "vocabulary_highlights": ["The target words student handled best"],
        "improvement_advice": "Advice on using these words in a real discussion (range boosting)."
    }
}`;

const ideasOrganisationGradingAgent = `HKDSE Speaking Examiner - Module 5: Ideas & Organisation.

ASSESSMENT CRITERIA:
1. **Logical Development (speaking_logicalDevelopment)**: Coherence of ideas and use of the P.E.E.L method (Point, Evidence, Explanation, Link).
2. **Relevance & Depth (speaking_relevance)**: Addressing the topic directly with meaningful insights.
3. **Organisation & Signposting (speaking_organisation)**: Clear structure and use of cohesive devices (Firstly, Consequently, To conclude).

INPUT:
- Student Responses: {STUDENT_RESPONSES}
- Organisation Map/Context: {ORGANISATION_DATA}

OUTPUT JSON:
{
    "scores": {
        "development": 0-7,
        "relevance": 0-7,
        "signposting": 0-7,
        "organisation": 0-7,
        "total": 0-28
    },
    "feedback": {
        "summary": "Assessment of logical flow and structural impact",
        "peel_analysis": "How well the student followed the PEEL structure",
        "cohesion_tips": ["Specific advice on better transitions"],
        "improvement_advice": "Advice on strengthening logical arguments"
    }
}`;

const speakingGradingAgent = interactionGradingAgent;

module.exports = {
    speakingGradingAgent,
    deliveryGradingAgent,
    flowGradingAgent,
    interactionGradingAgent,
    languagePatternsGradingAgent,
    ideasOrganisationGradingAgent
};
