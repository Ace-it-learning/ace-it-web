/**
 * Micro-Skill Assessor Service
 * AI-powered assessment of student responses for 47 micro-skills
 * Upgraded to Gemini 1.5 Pro for peak accuracy and DSE alignment
 */

const GenerativeAIService = require('./GenerativeAIService');
const { MICRO_SKILLS, getAllSkills, getSkillsByPaper } = require('../constants/microSkills');

class MicroSkillAssessor {
    constructor() {
        // Now using central GenerativeAIService
    }

    /**
     * Assess all micro-skills from diagnostic test responses
     * @param {Object} diagnosticData - Student's diagnostic test responses
     * @returns {Object} Micro-skill assessment results
     */
    async assessAllSkills(diagnosticData) {
        const { reading, writing, listening, speaking } = diagnosticData;

        console.log(`[MicroSkillAssessor] Assessing skills with keys: ${Object.keys(diagnosticData)}`);

        // Run assessments sequentially to avoid 429 Rate Limits from multiple parallel AI calls
        const readingSkills = await this.assessReadingSkills(reading).catch(e => { console.error("Reading Assessor Error:", e); return {}; });
        const writingSkills = await this.assessWritingSkills(writing).catch(e => { console.error("Writing Assessor Error:", e); return {}; });
        const listeningSkills = await this.assessListeningSkills(listening).catch(e => { console.error("Listening Assessor Error:", e); return {}; });
        const speakingSkills = await this.assessSpeakingSkills(speaking).catch(e => { console.error("Speaking Assessor Error:", e); return {}; });

        return {
            ...readingSkills,
            ...writingSkills,
            ...listeningSkills,
            ...speakingSkills
        };
    }

    /**
     * Assess Reading micro-skills (12 skills)
     */
    async assessReadingSkills(readingData) {
        if (!readingData) {
            console.warn("No reading data for assessment");
            return {};
        }

        let empiricalEvidence = "";
        if (readingData.question_breakdown && Array.isArray(readingData.question_breakdown)) {
            empiricalEvidence = "\nEMPIRICAL QUESTION ANALYSIS (Use this to anchor your assessment):\n";
            readingData.question_breakdown.forEach(q => {
                const skills = q.skills ? q.skills.join(', ') : "General Comprehension";
                empiricalEvidence += `- Question ${q.id} (${skills}): ${q.status.toUpperCase()} (Student: "${q.student_answer}")\n`;
            });
            empiricalEvidence += "\nINSTRUCTION: If a student fails a question tagged with a specific skill, you MUST reflect this in the lower score for that skill.\n";
        }

        const prompt = `Analyze the following reading comprehension responses and assess the student's proficiency in these 12 micro-skills based STRICTLY on the HKDSE English Language Paper 1 (Reading) Assessment Framework.
${empiricalEvidence}

HKDSE READING CRITERIA:
- Level 5**: Comprehends almost all complex texts, identifies subtle nuances/tone, synthesizes info effortlessly.
- Level 4/5: Strong literal & inferential skills, understands main ideas and most details.
- Level 3: Adequate literal comprehension, identifies main topic, misses some subtle inferences.
- Level 1/2: Basic recognition of keywords, frequent literal misunderstandings.

MICRO-SKILLS & KEYS:
1. Literal Comprehension (reading_literalComprehension)
2. Inference (reading_inference)
3. Main Idea Identification (reading_mainIdea)
4. Detail Recognition (reading_detailRecognition)
5. Sequencing (reading_sequencing)
6. Synthesis (reading_synthesis)
7. Fact vs Opinion (reading_factVsOpinion)
8. Author's Purpose (reading_authorPurpose)
9. Tone & Attitude (reading_toneAttitude)
10. Register & Style (reading_registerStyle)
11. Metaphorical Language (reading_metaphoricalLanguage)
12. Text Organization (reading_textOrganization)

Student Responses:
${JSON.stringify(readingData, null, 2)}

For each micro-skill, provide:
- level: 1-7 (1=Level 1, 2=Level 2, 3=Level 3, 4=Level 4, 5=Level 5, 6=Level 5*, 7=Level 5**)
- confidence: 0.0-1.0
- evidence: Brief explanation citing specific student responses and HKDSE benchmarks

Return ONLY a JSON object with this structure:
{
  "reading_literalComprehension": { "level": 4, "confidence": 0.85, "evidence": "..." },
  ...
}
`;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: "gemini-flash-latest"
        });
        const response = result.response.text();

        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response for reading skills');
        }

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Assess Writing micro-skills (15 skills)
     */
    async assessWritingSkills(writingData) {
        if (!writingData) {
            console.warn("[MicroSkillAssessor] No writing data provided");
            return {};
        }
        console.log(`[MicroSkillAssessor] Assessing writing skills for data: ${Object.keys(writingData)}`);
        const prompt = `Analyze the following writing sample and assess the student's proficiency in these 15 micro-skills based STRICTLY on the HKDSE English Language Paper 2 (Writing) Assessment Framework (Content, Language, Organization).

HKDSE WRITING CRITERIA:
- Level 5**: Sophisticated ideas, masterful organization, flawless complex grammar (gem-like precision).
- Level 4/5: Relevant development, good range of vocabulary, mostly accurate grammar.
- Level 3: Simple development, basic vocabulary, common grammatical errors.
- Level 1/2: Limited content, fragmented organization, frequent errors affecting meaning.

MICRO-SKILLS & KEYS:
Content & Ideas:
1. Relevance (writing_relevance)
2. Development (writing_development)
3. Originality (writing_originality)

Language & Vocabulary:
4. Vocabulary Range (writing_vocabularyRange)
5. Collocations (writing_collocations)
6. Idiomatic Expressions (writing_idiomaticExpressions)
7. Register Appropriateness (writing_registerAppropriate)
8. Word Choice Precision (writing_wordChoicePrecision)

Grammar & Sentence Structure:
9. Sentence Variety (writing_sentenceVariety)
10. Advanced Structures (writing_advancedStructures)
11. Grammatical Accuracy (writing_grammaticalAccuracy)
12. Punctuation (writing_punctuation)

Organization & Coherence:
13. Paragraph Structure (writing_paragraphStructure)
14. Transitions (writing_transitions)
15. Overall Coherence (writing_overallCoherence)

Writing Sample:
${JSON.stringify(writingData, null, 2)}

For each micro-skill, provide:
- level: 1-7 (1=Level 1, 2=Level 2, 3=Level 3, 4=Level 4, 5=Level 5, 6=Level 5*, 7=Level 5**)
- confidence: 0.0-1.0
- evidence: Brief explanation referencing specific HKDSE level descriptors

Return ONLY a JSON object with this structure:
{
  "writing_relevance": { "level": 4, "confidence": 0.85, "evidence": "..." },
  ...
}
`;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: "gemini-flash-latest"
        });
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response for writing skills');
        }

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Assess Listening micro-skills (10 skills)
     */
    async assessListeningSkills(listeningData) {
        if (!listeningData) {
            console.warn("[MicroSkillAssessor] No listening data provided");
            return {};
        }
        console.log(`[MicroSkillAssessor] Assessing listening skills for data: ${Object.keys(listeningData)} `);
        let empiricalEvidence = "";
        if (listeningData.question_breakdown && Array.isArray(listeningData.question_breakdown)) {
            empiricalEvidence = "\nEMPIRICAL QUESTION ANALYSIS (Use this to anchor your assessment):\n";
            listeningData.question_breakdown.forEach(q => {
                const skills = q.skills ? q.skills.join(', ') : "General Listening";
                empiricalEvidence += `- Question ${q.id} (${skills}): ${q.status.toUpperCase()} (Student: "${q.student_answer}")\n`;
            });
            empiricalEvidence += "\nINSTRUCTION: If a student fails a question tagged with a specific skill, you MUST reflect this in the lower score for that skill.\n";
        }

        const prompt = `Analyze the following listening comprehension responses and assess the student's proficiency in these 10 micro-skills based STRICTLY on the HKDSE English Language Paper 3 (Listening & Integrated Skills) Assessment Framework.
${empiricalEvidence}

HKDSE LISTENING CRITERIA:
- Level 5**: Comprehends all details/tone, captures speaker attitude precisely.
- Level 4/5: Good recall, mostly accurate, identifies main points clearly.
- Level 3: grasps basic info, misses specific names/numbers or subtle attitude.
- Level 1/2: Catches isolated words only, frequent context misunderstandings.

MICRO-SKILLS & KEYS:
Comprehension Skills:
1. Main Idea Listening (listening_mainIdea)
2. Detail Listening (listening_detailListening)
3. Note-Taking (listening_noteTaking)
4. Prediction (listening_prediction)
5. Listening for Gist (listening_gist)

Advanced Listening Skills:
6. Accent Recognition (listening_accentRecognition)
7. Speed Processing (listening_speedProcessing)
8. Speaker Attitude (listening_speakerAttitude)
9. Integrated Tasks (listening_integratedTasks)
10. Ambiguity Handling (listening_ambiguityHandling)

Student Responses:
${JSON.stringify(listeningData, null, 2)}

For each micro-skill, provide:
- level: 1-7 (1=Level 1, 2=Level 2, 3=Level 3, 4=Level 4, 5=Level 5, 6=Level 5*, 7=Level 5**)
- confidence: 0.0-1.0
- evidence: Brief explanation citing specific responses vs DSE benchmarks

Return ONLY a JSON object with this structure:
{
  "listening_mainIdea": { "level": 4, "confidence": 0.85, "evidence": "..." },
  ...
}
`;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: "gemini-flash-latest"
        });
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response for listening skills');
        }

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Assess Speaking micro-skills (10 skills)
     */
    async assessSpeakingSkills(speakingData) {
        if (!speakingData) return {};
        const prompt = `Analyze the following speaking performance and assess the student's proficiency in these 10 micro-skills based STRICTLY on the HKDSE English Language Paper 4 (Speaking) Assessment Framework.

HKDSE SPEAKING CRITERIA:
- Level 5**: Charismatic delivery, sophisticated patterns, effortless fluency.
- Level 4/5: Sustained conversation, clear pronunciation, active engagement.
- Level 3: Basic communication, simple structures, some hesitation.
- Level 1/2: Fragmented phrases, frequent silence, pronunciation obstacles.

MICRO-SKILLS & KEYS:
Fluency & Delivery:
1. Pronunciation Clarity (speaking_pronunciationClarity)
2. Intonation (speaking_intonation)
3. Pace & Rhythm (speaking_paceRhythm)
4. Confidence & Naturalness (speaking_confidence)

Interactive Skills:
5. Turn-Taking (speaking_turnTaking)
6. Active Listening (speaking_activeListening)
7. Facilitation (speaking_facilitation)

Language Use:
8. Spontaneity (speaking_spontaneity)
9. Vocabulary in Speech (speaking_vocabularyInSpeech)
10. Grammatical Accuracy in Speech (speaking_grammaticalAccuracyInSpeech)

Speaking Data:
${JSON.stringify(speakingData, null, 2)}

For each micro-skill, provide:
- level: 1-7 (1=Level 1, 2=Level 2, 3=Level 3, 4=Level 4, 5=Level 5, 6=Level 5*, 7=Level 5**)
- confidence: 0.0-1.0
- evidence: Brief explanation citing specific responses vs DSE benchmarks

Return ONLY a JSON object with this structure:
{
  "speaking_pronunciationClarity": { "level": 4, "confidence": 0.85, "evidence": "..." },
  ...
}
`;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: "gemini-2.0-flash"
        });
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response for speaking skills');
        }

        return JSON.parse(jsonMatch[0]);
    }

    /**
     * Prioritize weaknesses based on impact, fixability, and urgency
     * @param {Object} microSkills - All micro-skill assessments
     * @param {Object} userProfile - User's profile data
     * @returns {Array} Prioritized list of weaknesses
     */
    prioritizeWeaknesses(microSkills, userProfile = {}) {
        const weaknesses = [];

        Object.entries(microSkills).forEach(([skillId, assessment]) => {
            const skillDef = MICRO_SKILLS[skillId];
            if (!skillDef) return;

            // Only consider skills below level 4 as weaknesses
            if (assessment.level < 4) {
                const impact = this.calculateImpact(skillDef, assessment.level);
                const fixability = this.calculateFixability(skillDef, assessment.level);
                const urgency = this.calculateUrgency(userProfile);

                weaknesses.push({
                    skillId,
                    skillName: skillDef.name,
                    paper: skillDef.paper,
                    category: skillDef.category,
                    currentLevel: assessment.level,
                    targetLevel: 5,
                    confidence: assessment.confidence,
                    impact,
                    fixability,
                    urgency,
                    priorityScore: (impact * 0.5) + (fixability * 0.3) + (urgency * 0.2),
                    recommendedAction: this.generateRecommendation(skillDef, assessment.level)
                });
            }
        });

        // Sort by priority score (highest first)
        return weaknesses.sort((a, b) => b.priorityScore - a.priorityScore);
    }

    /**
     * Calculate impact score (how much this skill affects overall grade)
     */
    calculateImpact(skillDef, currentLevel) {
        // Core skills have higher impact
        if (skillDef.group === 'core') return 0.9;
        if (skillDef.group === 'intermediate') return 0.7;
        if (skillDef.group === 'advanced') return 0.6;
        if (skillDef.group === 'expert') return 0.5;
        return 0.5;
    }

    /**
     * Calculate fixability score (how easy it is to improve)
     */
    calculateFixability(skillDef, currentLevel) {
        // Lower current level = easier to fix (more room for improvement)
        // Core skills are generally easier to fix
        let baseFixability = 1.0 - (currentLevel / 7);

        if (skillDef.group === 'core') baseFixability *= 1.2;
        if (skillDef.group === 'expert') baseFixability *= 0.7;

        return Math.min(baseFixability, 1.0);
    }

    /**
     * Calculate urgency score (based on exam date)
     */
    calculateUrgency(userProfile) {
        // For now, return moderate urgency
        // TODO: Calculate based on actual exam date
        return 0.7;
    }

    /**
     * Generate specific recommendation for improving a skill
     */
    generateRecommendation(skillDef, currentLevel) {
        const recommendations = {
            reading_inference: 'Practice identifying implied meanings in texts. Focus on "reading between the lines".',
            reading_synthesis: 'Combine information from multiple sources. Practice summarizing complex texts.',
            writing_sentenceVariety: 'Use a mix of simple, compound, and complex sentences. Practice with sentence combining exercises.',
            writing_vocabularyRange: 'Learn 10 new academic words per week. Use them in context.',
            listening_speedProcessing: 'Listen to podcasts at 1.25x speed. Gradually increase to 1.5x.',
            speaking_spontaneity: 'Practice impromptu speaking. Give yourself 30 seconds to respond to random topics.'
            // Add more specific recommendations
        };

        return recommendations[skillDef.id] || `Practice ${skillDef.name.toLowerCase()} through targeted drills and exercises.`;
    }

    /**
     * Convert 1-7 scale to DSE level (1-5**)
     */
    convertToDSELevel(numericLevel) {
        if (numericLevel >= 7) return '5**';
        if (numericLevel >= 6) return '5*';
        if (numericLevel >= 5) return '5';
        if (numericLevel >= 4) return '4';
        if (numericLevel >= 3) return '3';
        if (numericLevel >= 2) return '2';
        return '1';
    }
}

module.exports = new MicroSkillAssessor();
