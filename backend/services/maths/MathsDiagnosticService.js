const MATH_BLUEPRINT = require('../../blueprints/Math_Compulsory_Blueprint.json');
const MATH_PAPERS = require('./MathsPapers');
const GenerativeAIService = require('../GenerativeAIService');
const TIER_1_MODEL = "gemini-flash-latest"; // Pro model for high-quality diagnostic analysis
const { mapSkillToId } = require('./MathsMicroSkillMapper');
const { DSE_SCORING, accuracyToLevel } = require('../../constants/dseScoring');

class MathsDiagnosticService {

    getAssets(paperId) {
        return MATH_PAPERS[paperId] || MATHS_PAPERS['A'];
    }

    async gradeMaths(submission, uid = null) {
        const { answers, paperId } = submission;
        const paper = this.getAssets(paperId);

        const results = {
            totalScore: 0,
            maxScore: 0,
            sections: {
                paper1: { score: 0, max: 0, feedback: [] },
                paper2: { score: 0, max: 0, feedback: [] }
            },
            details: []
        };

        // 1. Grade MCQs Deterministically
        const mcqQuestions = paper.questions.filter(q => q.part === 2);
        for (const q of mcqQuestions) {
            const studentAns = answers[q.id];
            const isCorrect = String(studentAns || '').trim() === String(q.answer || '').trim();
            const points = isCorrect ? (q.marks || 1) : 0;
            const max = q.marks || 1;

            results.sections.paper2.score += points;
            results.sections.paper2.max += max;

            results.details.push({
                id: q.id,
                score: points,
                max: max,
                is_correct: isCorrect,
                student_answer: studentAns,
                question_text: q.text,
                topic: q.topic,
                explanation: isCorrect ? "Correct! (AI will provide detailed logic)" : `Incorrect. The correct answer is ${q.answer}. (AI will explain why)`,
                micro_skills: [q.topic],
                correct_answer: q.answer
            });
        }

        // 2. Prepare Conventional Questions for Grading
        const convQuestions = paper.questions.filter(q => q.part === 1);

        // 3. AI Grading & Analysis Loop
        try {
            const allQuestions = [...paper.questions];

            // Safely prepare student answers for JSON (handle multi-line text and objects)
            const studentSubmissions = allQuestions.map(q => {
                const rawAnswer = answers[q.id];
                let cleanAnswer = "(No Answer)";

                if (rawAnswer) {
                    if (typeof rawAnswer === 'object') {
                        // Multi-part question (e.g., {a: "...", b: "..."})
                        cleanAnswer = JSON.stringify(rawAnswer);
                    } else {
                        // Single answer - convert to string (JSON.stringify will handle newlines)
                        cleanAnswer = String(rawAnswer);
                    }
                }

                return {
                    id: q.id,
                    answer: cleanAnswer
                };
            });

            const gradingPrompt = `
You are a top-tier HKDSE Mathematics Expert. Analyze this student's performance.

DATA:
Questions:
${JSON.stringify(allQuestions.map(q => ({
                id: q.id,
                type: q.type,
                text: q.text,
                marks: q.marks || (q.part === 2 ? 1 : 2),
                correct_answer: q.answer || q.model_answer,
                scheme: q.marking_scheme,
                topic: q.topic
            })), null, 2)}

Student Submission:
${JSON.stringify(studentSubmissions, null, 2)}

TASK:
1. Conventional Questions: Grade them based strictly on 'marks' provided.
   - **Method Mark (M)**: Award if they correctly set up the equation (e.g., correct formula substitution, correct expansion). Use full term: "(Method Mark 1)".
   - **Answer Mark (A)**: Award ONLY if the final answer is correct (check sign, units, precision). Use full term: "(Answer Mark 1)".
   - **CRITICAL**: If the equation is correct but calculation is wrong, give Method Mark but NOT Answer Mark.
   - **STEP-BY-STEP DERIVATION (MANDATORY)**: You MUST provide a complete derivation of the correct answer. 
     * Show at least 3 mathematical steps using LaTeX.
     * **CRITICAL**: Each derivation MUST be specific to the question topic. DO NOT overuse the vertex formula (x = -b/2a) unless the question is actually about the vertex of a quadratic function.
     * Separator: Each Step MUST be separated by a newline escape sequence (\\n). 
     * CRITICAL: DO NOT use literal newlines within JSON strings. Use '\\n' for all line breaks.
     * Format: "Step 1: [Explanation] \\nStep 2: [Explanation] \\nStep 3: [Explanation]"
     * Explain the logic behind each step clearly using standard mathematical principles (expansion, indices, trig rules, etc).
2. MC Questions: **ALWAYS explain the complete logical reasoning**, even if the student answered correctly.
   - Show the equation/formula used. **BE DIVERSE**: If it's statistics, show mean/SD logic. If it's geometry, show vertical/interior angle logic.
   - Explain the step-by-step logic in 2-3 clear points
   - For CORRECT answers: "✓ Correct! Here's why: [detailed explanation]"
   - For INCORRECT answers: "✗ The correct answer is [X]. Here's the logic: [detailed explanation]"
3. Micro-skills: Identify 2-3 sub-skills per question. **CRITICAL**: Always include the 'topic' provided in DATA as one of the micro-skills.
- **Language**: Use {{LANGUAGE}}.
- **STRICTLY FORBIDDEN**: Colloquial Cantonese (口語).

OUTPUT JSON (STRICT):
IMPORTANT: Return raw JSON only. Do not use markdown code blocks or any other text.
{
    "evaluations": [
        {
            "id": "question_id",
            "score": number, // Only used for Conventional. MUST NOT EXCEED 'marks'.
            "max": number,   // MUST match 'marks' provided in DATA.
            "explanation": "Step 1: [Logic in {{LANGUAGE}}] \\[ LaTeX Equation \\] \\nStep 2: [Logic in {{LANGUAGE}}] \\[ LaTeX Equation \\] \\n\\nFinal Answer: ... (Method Mark X, Answer Mark Y)", 
            "micro_skills": ["Skill A", "Skill B"]
        }
    ]
}
`;
            const language = submission.language || 'en';
            const languageName = (language === 'zh' || language === 'zh-HK' || language === 'zh-TW')
                ? 'Traditional Chinese (Formal Written Chinese - 書面語)'
                : 'English';

            const finalPrompt = gradingPrompt.replace(/{{LANGUAGE}}/g, languageName);

            const aiResponse = await GenerativeAIService.generateJson(finalPrompt, {
                model: TIER_1_MODEL
            });

            if (aiResponse.evaluations) {
                aiResponse.evaluations.forEach(evalItem => {
                    const existingDetailIndex = results.details.findIndex(d => d.id === evalItem.id);
                    const q = paper.questions.find(pq => pq.id === evalItem.id);

                    if (q?.part === 2) {
                        // MCQ: Update Explanation & Skills ONLY. Keep Score.
                        if (existingDetailIndex !== -1) {
                            results.details[existingDetailIndex].explanation = evalItem.explanation;
                            results.details[existingDetailIndex].micro_skills = evalItem.micro_skills;
                        }
                    } else if (q?.part === 1) {
                        // Conventional: Add to results
                        const maxScore = q.marks || 2;
                        // Determine score: use AI score but cap at maxScore
                        let awardedScore = evalItem.score;
                        if (awardedScore > maxScore) awardedScore = maxScore;

                        results.sections.paper1.score += awardedScore;
                        results.sections.paper1.max += maxScore;

                        results.details.push({
                            id: evalItem.id,
                            score: awardedScore,
                            max: maxScore,
                            is_correct: awardedScore === maxScore,
                            student_answer: answers[evalItem.id],
                            question_text: q.text,
                            topic: q.topic,
                            explanation: evalItem.explanation,
                            micro_skills: evalItem.micro_skills || []
                        });
                    }
                });
            }

        } catch (e) {
            console.error("AI Analysis Failed (Fallback Mode):", e);
            console.error("Error details:", e.message);
            console.error("Stack:", e.stack);

            // Fallback for Conventional ONLY (MCQs are safe)
            convQuestions.forEach(q => {
                if (!results.details.find(d => d.id === q.id)) {
                    const maxScore = q.marks || 2;
                    results.details.push({
                        id: q.id,
                        score: 0,
                        max: maxScore,
                        student_answer: answers[q.id],
                        question_text: q.text,
                        topic: q.topic,
                        explanation: "Grading unavailable due to service feedback. Please review model answer.",
                        micro_skills: [q.topic]
                    });
                    results.sections.paper1.max += maxScore;
                }
            });
        }

        results.totalScore = results.sections.paper1.score + results.sections.paper2.score;
        results.maxScore = results.sections.paper1.max + results.sections.paper2.max;

        const percentage = results.maxScore > 0 ? (results.totalScore / results.maxScore) * 100 : 0;
        results.percentage = percentage;
        results.level = this.calculateLevel(percentage);

        // --- NEW: AGGREGATE MICRO-SKILLS FIRST ---
        const skillUpdates = {};
        results.details.forEach(detail => {
            if (detail.micro_skills && Array.isArray(detail.micro_skills)) {
                detail.micro_skills.forEach(skillRaw => {
                    const skillId = mapSkillToId(skillRaw);
                    if (skillId) {
                        if (!skillUpdates[skillId]) {
                            skillUpdates[skillId] = { total: 0, correct: 0 };
                        }
                        skillUpdates[skillId].total++;
                        if (detail.is_correct || detail.score > 0) {
                            skillUpdates[skillId].correct++;
                        }
                    }
                });
            }
        });

        // Convert to level using HKEAA-aligned scoring with Laplacian smoothing + diagnostic cap
        const processedSkills = {};
        Object.keys(skillUpdates).forEach(skillId => {
            const { correct, total } = skillUpdates[skillId];

            // Laplacian smoothing: prevents 0/1 → 0% or 1/1 → 100% extremes
            const smoothedAccuracy = (correct + 1) / (total + 2);
            const rawLevel = accuracyToLevel(smoothedAccuracy);

            // Diagnostic cap: even perfect results cap at Level 4 ("Medium")
            // Students must earn Level 5+ through accumulated Lab practice
            const cappedLevel = Math.min(rawLevel, DSE_SCORING.DIAGNOSTIC_MAX_LEVEL);

            processedSkills[skillId] = {
                level: cappedLevel,
                accuracy: smoothedAccuracy,
                practiceCount: total,   // Track actual attempts
                correctCount: correct,  // Track actual correct answers
                source: 'diagnostic'
            };
        });

        results.microSkills = processedSkills;
        results.profile = this.generateProfileMetadata(results, percentage);

        // Update Math skill map
        if (uid && uid !== 'guest') {
            try {
                const UserProfileService = require('../UserProfileService');
                // Update Firestore
                await UserProfileService.updateMathSkills(uid, processedSkills, `diagnostic_${paperId}`, results.profile);
                console.log(`[MathsDiagnosticService] Updated Math skills for ${uid}`);
            } catch (error) {
                console.error(`[MathsDiagnosticService] Failed to update Math skills:`, error);
            }
        }

        return results;
    }

    calculateLevel(percentage) {
        // Use shared DSE_SCORING thresholds for consistency across English and Maths
        const accuracy = percentage / 100;
        for (const threshold of DSE_SCORING.LEVEL_THRESHOLDS) {
            if (accuracy >= threshold.minAccuracy) return threshold.label;
        }
        return '1';
    }

    generateProfileMetadata(results, percentage) {
        const microSkills = results.microSkills || {};
        const skillEntries = Object.entries(microSkills);

        // Identify Strengths (Top 3) and Weaknesses (Bottom 3)
        const sortedSkills = skillEntries.sort((a, b) => b[1].accuracy - a[1].accuracy);

        const topSkills = sortedSkills.slice(0, 3).filter(s => s[1].accuracy >= 0.7);
        const bottomSkills = sortedSkills.slice(-3).filter(s => s[1].accuracy < 0.6).reverse();

        const getSkillName = (id) => id.replace('math_', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        let archetype = "The Apprentice";
        let strengths = topSkills.length > 0 ? topSkills.map(s => getSkillName(s[0])) : ["Calculation Effort", "Logical Thinking"];
        let weaknesses = bottomSkills.length > 0 ? bottomSkills.map(s => getSkillName(s[0])) : ["Advanced Application", "Multi-step Logic"];
        let plan = [];

        if (percentage >= 85) {
            archetype = "The Mathlete";
            if (strengths.length < 3) strengths = ["Precision", "Modeling", "Speed"];
        } else if (percentage >= 70) {
            archetype = "The Logician";
        } else if (percentage >= 50) {
            archetype = "The Tactician";
        } else {
            archetype = "The Explorer";
        }

        // Generate Plan based on weaknesses
        if (bottomSkills.length > 0) {
            plan = bottomSkills.map(s => ({
                title: `Master ${getSkillName(s[0])} Essentials`,
                topic: s[0] // ACTUAL SKILL ID
            }));
            plan.push({
                title: "Complete 5 Section A Speed Drills",
                topic: "Section A Drills"
            });
        } else {
            plan = [
                { title: "Review non-routine question types", topic: "Non-routine" },
                { title: "Practice Paper 2 time management", topic: "Time Management" },
                { title: "Daily Error Hunt challenge", topic: "Error Hunting" }
            ];
        }

        return {
            archetype,
            overall_level: results.level,
            strengths,
            weaknesses,
            weekly_quest_plan: plan,
            xp_earned: 500
        };
    }
}

module.exports = new MathsDiagnosticService();
