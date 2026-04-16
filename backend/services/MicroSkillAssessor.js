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
13. Skimming & Scanning (reading_skimmingScanning)
14. Paraphrasing (reading_paraphrasing)
15. Cohesion & Reference (reading_cohesionReference)

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
            model: "ace-it-flash"
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

MICRO-SKILLS & PILLARS (Strict HKEAA Standard):
1. Content (writing_content): Substance, development, and relevance.
2. Language (writing_language): Grammar, vocabulary range, and accuracy.
3. Organization (writing_organization): Cohesion, structure, and paragraphing.

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
            model: "ace-it-flash"
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

HKDSE LISTENING & INTEGRATED CRITERIA (Paper 3):
- Level 5**: Comprehensive synthesis of multi-source data; perfect Part A accuracy; native-like tone detection.
- Level 4/5: Strong extraction of details; clear organization in Part B; minor errors in accuracy.
- Level 3: Basic gist understanding; misses subtle Part B content points.
- Level 1/2: Fragmented data extraction; frequent errors in Part A.

MICRO-SKILLS & PILLARS (Strict HKEAA Standard):
1. Part A Comprehension (listening_part_a): Accuracy in gap-fill, MCQs, and factual details.
2. Part B Content (listening_content): Synthesis of Data File info and multi-source points.
3. Part B Language (listening_language): Register, appropriateness, and grammatical precision.
4. Part B Organization (listening_organization): Cohesion and professional formatting.

Student Responses:
${JSON.stringify(listeningData, null, 2)}

For each micro-skill, provide:
- level: 1-7 (1=Level 1, 2=Level 2, 3=Level 3, 4=Level 4, 5=Level 5, 6=Level 5*, 7=Level 5**)
- confidence: 0.0-1.0
- evidence: Brief explanation citing specific responses vs DSE benchmarks

Return ONLY a JSON object with this structure:
{
  "listening_part_a": { "level": 4, "confidence": 0.85, "evidence": "..." },
  ...
}
`;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: "ace-it-flash"
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

HKDSE SPEAKING CRITERIA (Paper 4):
- Level 5**: Natural delivery; sophisticated language patterns; facilities discussion effortlessly.
- Level 4/5: Clear pronunciation; coherent ideas; good communicative strategies.
- Level 3: Adequate communication; simple vocabulary; minor hesitation.
- Level 1/2: Minimal participation; fragmented sentences; frequent pauses.

MICRO-SKILLS & PILLARS (Strict HKEAA Standard):
1. Pronunciation & Delivery (speaking_delivery): Clarity, intonation, and stress.
2. Communication Strategies (speaking_strategies): Interaction, turn-taking, and active listening.
3. Vocabulary & Language Patterns (speaking_language): Range and accuracy of vocabulary and grammar.
4. Ideas & Organization (speaking_organization): Development of ideas and logical flow.

Speaking Data:
${JSON.stringify(speakingData, null, 2)}

For each micro-skill, provide:
- level: 1-7 (1=Level 1, 2=Level 2, 3=Level 3, 4=Level 4, 5=Level 5, 6=Level 5*, 7=Level 5**)
- confidence: 0.0-1.0
- evidence: Brief explanation citing specific responses vs DSE benchmarks

Return ONLY a JSON object with this structure:
{
  "speaking_delivery": { "level": 4, "confidence": 0.85, "evidence": "..." },
  ...
}
`;

        const result = await GenerativeAIService.generateContent(prompt, {
            model: "ace-it-flash"
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
            reading_factVsOpinion: 'Learn to distinguish objective facts from subjective opinions. Focus on looking for loaded adjectives and modal verbs that signal value judgments.',
            reading_authorPurpose: 'Look for "Action Verbs" like advocate, clarify, or debunk to describe the writer\'s primary goal. Practice matching text styles to their intended audience and purpose.',
            reading_toneAttitude: 'Conduct a "Vibe Check" by identifying loaded words and punctuation clues. Categorize tone words into positive, negative, and neutral matrices to narrow down exam options.',
            reading_registerStyle: 'Identify "Register Shifters" like passive voice or personal pronouns. Practice the "Style Swap" by rewriting formal statements for informal audiences to master contextual tone.',
            reading_metaphoricalLanguage: 'Identify the two things being compared (Tenor vs. Vehicle) before explaining the shared quality. Use the "Association Lab" to explore how different images change the meaning of a subject.',
            reading_textOrganization: 'Use the "Jigsaw Challenge" to practice logical paragraph flow. Identify "Signpost" words (e.g., however, furthermore) to determine the text structure and functional purpose of each section.',
            reading_paraphrasing: 'Apply the "Keyword Filter" to distinguish unchangeable technical terms from changeable adjectives and verbs. Use the "Synonym Bank" to find contextual replacements for common DSE verbs.',
            reading_cohesionReference: 'Identify local plural/singular pronouns (it/they) and draw a "Logic Chain" back to their antecedents. Pay close attention to abstract references like "this reality" that point to entire preceding clauses.',
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
