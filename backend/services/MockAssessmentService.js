const GenerativeAIService = require('./GenerativeAIService');

class MockAssessmentService {
    /**
     * Evaluate a full paper submission
     * @param {Object} mockData - The full mock JSON data
     * @param {Object} userAnswers - Student's answers keyed by question ID
     * @returns {Object} Assessment result with scores and feedback
     */
    async evaluatePaper(mockData, userAnswers, analytics = {}, tier = 'free') {
        // Route to specific evaluator based on paper type
        if (mockData.Part_B && mockData.Part_B.data_file) {
            return this.evaluateListeningPaper(mockData, userAnswers, analytics, tier);
        }
        if (mockData.Part_A && (mockData.Part_A.situation || mockData.Part_A.genre)) {
            return this.evaluateWritingPaper(mockData, userAnswers, analytics, tier);
        }
        return this.evaluateReadingPaper(mockData, userAnswers, analytics, tier);
    }



    /**
     * Evaluate a Paper 1 (Reading) submission
     */
    async evaluateReadingPaper(mockData, userAnswers, analytics = {}, tier = 'free') {
        const results = {};
        const sectionalScores = { A: { score: 0, possible: 0 }, B: { score: 0, possible: 0 } };
        const skillScores = {};
        
        const selectedPart = analytics.selectedSection || 'B2';

        const allQuestions = [
            ...(mockData.Part_A?.questions || []),
            ...(mockData.Part_B1?.questions || []),
            ...(mockData.Part_B2?.questions || [])
        ];

        // 1. Identify subjective questions for AI evaluation (ONLY for relevant path)
        const subjectiveQuestions = [];
        allQuestions.forEach(q => {
            const userAnswer = userAnswers[q.id];
            if (!userAnswer) return; // Skip if no answer

            const isPartA = q.id.startsWith('q') && !q.id.startsWith('qb');
            const isSelectedPartB = (selectedPart === 'B1' && q.id.startsWith('qb1_')) || 
                                    (selectedPart === 'B2' && q.id.startsWith('qb2_'));
            
            if ((isPartA || isSelectedPartB) && (q.type === 'Open_Ended' || q.type === 'tf_ng')) {
                subjectiveQuestions.push({ q, userAnswer, highRigor: q.high_rigor || false });
            }
        });

        // 2. Perform AI Evaluation in one batch
        let aiResults = {};
        if (subjectiveQuestions.length > 0) {
            aiResults = await this.evaluateSubjectiveBatch(subjectiveQuestions, mockData.meta?.topic, tier);
        }

        // 3. Process all questions
        allQuestions.forEach(q => {
            const userAnswer = userAnswers[q.id];
            
            // Only count questions in the selected path for the final score
            const isPartA = q.id.startsWith('q') && !q.id.startsWith('qb');
            const isSelectedPartB = (selectedPart === 'B1' && q.id.startsWith('qb1_')) || 
                                    (selectedPart === 'B2' && q.id.startsWith('qb2_'));
            
            const isRelevant = isPartA || isSelectedPartB;

            let assessment;
            if (q.type === 'Open_Ended' || q.type === 'tf_ng') {
                // Try AI result first
                assessment = aiResults[q.id];
                
                // --- LITERAL FALLBACK (Critical Safety Net) ---
                if (!assessment || assessment.status === 'incorrect' || assessment.feedback?.includes('Error')) {
                    const literalResult = this.evaluateLiteralSubjective(q, userAnswer);
                    // If literal match is better than AI (or AI failed), use it
                    if (literalResult.score > (assessment?.score || 0)) {
                        assessment = literalResult;
                    }
                }
                
                if (!assessment) {
                    assessment = { 
                        score: 0, 
                        feedback: "We couldn't determine a match for this answer. Please refer to the model answer for the intended meaning.", 
                        status: 'incorrect',
                        professionalAdvice: "Focus on identifying the specific keywords or phrases used in the question prompt within the source text."
                    };
                }
            } else {
                assessment = this.evaluateDeterministicQuestion(q, userAnswer);
            }
            
            results[q.id] = assessment;

            if (isRelevant) {
                const sectionKey = isPartA ? 'A' : 'B';
                sectionalScores[sectionKey].score += assessment.score;
                sectionalScores[sectionKey].possible += q.marks || 0;

                const skills = (q.skill_tag || 'General').split('/');
                skills.forEach(skill => {
                    const trimmedSkill = skill.trim();
                    if (!skillScores[trimmedSkill]) skillScores[trimmedSkill] = { score: 0, possible: 0 };
                    skillScores[trimmedSkill].score += assessment.score;
                    skillScores[trimmedSkill].possible += q.marks || 0;
                });
            }
        });

        const totalScore = sectionalScores.A.score + sectionalScores.B.score;
        const totalPossible = sectionalScores.A.possible + sectionalScores.B.possible;
        const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

        // DSE Grade Calculation
        const getDSELevel = (pct, part) => {
            let level = '1';
            if (pct >= 90) level = '5**';
            else if (pct >= 82) level = '5*';
            else if (pct >= 75) level = '5';
            else if (pct >= 65) level = '4';
            else if (pct >= 55) level = '3';
            else if (pct >= 45) level = '2';

            if (part === 'B1' && ['5', '5*', '5**'].includes(level)) return '4';
            return level;
        };

        return {
            totalScore,
            possibleScore: totalPossible,
            percentage,
            level: getDSELevel(percentage, selectedPart),
            sectionalScores,
            skillScores,
            analytics,
            results
        };
    }

    /**
     * Evaluate subjective questions using AI
     */
    async evaluateSubjectiveBatch(items, topic, tier = 'free') {
        try {
            // Split questions into smaller batches (Atomized Evaluation) to prevent AI Laziness
            const BATCH_SIZE = 10;
            const batches = [];
            for (let i = 0; i < items.length; i += BATCH_SIZE) {
                batches.push(items.slice(i, i + BATCH_SIZE));
            }

            console.log(`[MockAssessment] Processing ${items.length} subjective questions in ${batches.length} batches...`);

            // Use semi-parallel processing with a concurrency limit of 2 to avoid 429 rate limits
            const results = [];
            const concurrencyLimit = 2;
            
            for (let i = 0; i < batches.length; i += concurrencyLimit) {
                const currentBatchChunk = batches.slice(i, i + concurrencyLimit);
                const chunkPromises = currentBatchChunk.map(async (batch, chunkIdx) => {
                    const idx = i + chunkIdx;
                    const batchIds = batch.map(it => it.q.id);
                    try {
                        return await new Promise(async (resolve, reject) => {
                            // Align with DeepSeek HTTP timeout (240s): large batches + JSON feedback need headroom.
                            const timeout = setTimeout(() => reject(new Error("BATCH_TIMEOUT")), 240000);
                            
                            const attemptBatch = async (temp = 0.2) => {
                                try {
                                    const batchPrompt = this.createBatchPrompt(batch, topic);
                                    const hasHighRigor = batch.some(it => it.highRigor);
                                    
                                    let response;
                                    try {
                                        // TIER-BASED MODEL SELECTION
                                        const normalizedTier = String(tier || '').toLowerCase();
                                        const model = (normalizedTier === 'premium' || normalizedTier === 'pro') ? 'ace-it-pro' : 'ace-it-flash';
                                        
                                        response = await GenerativeAIService.generateJson(batchPrompt, { 
                                            model: model,
                                            temperature: temp,
                                            strictModel: hasHighRigor && model === 'ace-it-pro',
                                            // Default LLM completion budget is 1024 tokens — insufficient for multi-question JSON feedback.
                                            generationConfig: { maxOutputTokens: 4096 }
                                        });
                                    } catch (proErr) {
                                        console.warn("[MockAssessment] Reading batch evaluation with Pro failed, falling back to Flash:", proErr.message);
                                        response = await GenerativeAIService.generateJson(batchPrompt, { 
                                            model: 'ace-it-flash',
                                            temperature: temp + 0.1,
                                            strictModel: false,
                                            generationConfig: { maxOutputTokens: 4096 }
                                        });
                                    }
                                    
                                    const data = response.data || {};
                                    const normalizedData = {};
                                    
                                    // Recursive function to find question data in any nested structure
                                    const findInObject = (obj) => {
                                        if (!obj || typeof obj !== 'object') return;
                                        
                                        // 1. Explicit ID Check (Handles objects with an ID property, common in arrays)
                                        const idProps = ['id', 'question_id', 'questionId', 'q_id'];
                                        for (const prop of idProps) {
                                            if (obj[prop]) {
                                                const idVal = String(obj[prop]).toLowerCase().replace(/^(question|q)_?/, '');
                                                const matchedId = batchIds.find(id => {
                                                    const cleanId = String(id).toLowerCase().replace(/^(question|q)_?/, '');
                                                    return idVal === cleanId;
                                                });
                                                if (matchedId) {
                                                    normalizedData[matchedId] = obj;
                                                }
                                            }
                                        }

                                        for (const key in obj) {
                                            const val = obj[key];
                                            // 2. Key-based Check (Handles objects where the key IS THE ID)
                                            const matchedId = batchIds.find(id => {
                                                const cleanKey = String(key).toLowerCase().replace(/^(question|q)_?/, '');
                                                const cleanId = String(id).toLowerCase().replace(/^(question|q)_?/, '');
                                                return cleanKey === cleanId || key === id;
                                            });

                                            if (matchedId && typeof val === 'object' && !Array.isArray(val)) {
                                                // Normalize internal keys from AI
                                                const normalizedVal = { ...val };
                                                if (val.professional_advice && !val.professionalAdvice) {
                                                    normalizedVal.professionalAdvice = val.professional_advice;
                                                }
                                                normalizedData[matchedId] = normalizedVal;
                                            } else if (typeof val === 'object' && val !== null) {
                                                findInObject(val);
                                            }
                                        }
                                    };

                                    findInObject(data);

                                    const missingKeys = batch.filter(it => !normalizedData[it.q.id]);
                                    if (missingKeys.length > 0 && temp === 0.2) {
                                        console.warn(`[MockAssessment] Batch ${idx} missing ${missingKeys.length} keys, retrying with high-temp...`);
                                        return await attemptBatch(0.4);
                                    }

                                    return normalizedData;
                                } catch (err) {
                                    throw err;
                                }
                            };

                            try {
                                const data = await attemptBatch();
                                clearTimeout(timeout);
                                resolve(data);
                            } catch (err) {
                                clearTimeout(timeout);
                                reject(err);
                            }
                        });
                    } catch (err) {
                        console.error(`[MockAssessment] Batch ${idx} failed:`, err.message);
                        return {};
                    }
                });

                const chunkResults = await Promise.all(chunkPromises);
                results.push(...chunkResults);
                
                // Delay between chunks to prevent quota exhaustion
                if (i + concurrencyLimit < batches.length) {
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            // Merge all batch results
            return results.reduce((acc, res) => ({ ...acc, ...res }), {});
        } catch (e) {
            console.error("[MockAssessment] AI Evaluation failed:", e);
            return {}; 
        }
    }

    createBatchPrompt(items, topic) {
        // Create a structured input for the AI to ensure high-fidelity JSON output
        const questionsInput = items.reduce((acc, it) => {
            acc[it.q.id] = {
                type: it.q.type,
                question: it.q.question,
                user_answer: it.userAnswer,
                marking_scheme: it.q.marking_scheme,
                marking_logic: it.q.marking_logic, // Contains full_marks_criteria, reject_criteria etc.
                max_marks: it.q.marks
            };
            return acc;
        }, {});

        return `
You are a Senior HKEAA (Hong Kong) English Reading Examiner specializing in high-stakes assessment (HKDSE Paper 1).
Grade these student answers for the mock: "${topic}".

### OFFICIAL HKEAA READING LEVEL DESCRIPTORS (Paper 1)
Use these descriptors to calibrate your scoring. A student answer that demonstrates Level 5 comprehension should receive FULL MARKS. Level 3–4 should receive PARTIAL. Level 1–2 should receive ZERO.

**Level 5 (Full Marks — Elite Comprehension):**
- Identifies the main theme AND subthemes or focuses of COMPLEX spoken/written texts.
- Evaluates views and attitudes expressed in complex texts.
- Makes inferences from complex texts delivered at near-natural speed.
- Extracts BOTH explicitly stated AND implied information.
- Understands figurative language.

**Level 4 (Partial Marks — Good Comprehension):**
- Identifies the main theme or ideas of a text.
- Evaluates views in fairly complex texts on familiar topics.
- Makes obvious inferences from fairly complex texts at moderate speed.
- Extracts explicitly stated and SOME implied information.
- Identifies simple figurative language.

**Level 3 (Partial Marks — Basic Comprehension):**
- Identifies main theme when straightforward.
- Identifies explicitly expressed views.
- Understands explicitly stated information in fairly complex texts at moderate speed.
- Makes straightforward inferences from literal language ONLY.

**Level 2 (Zero Marks — Weak Comprehension):**
- Identifies main idea of a SIMPLE text only when clearly signalled.
- Distinguishes fact from opinion only when clearly signalled.
- Understands explicitly stated information in simple texts.
- Understands literal language only when context is clear.

**Level 1 (Zero Marks — Minimal Comprehension):**
- Understands simple, predictable factual information in short simple texts.
- Identifies a sequence of events in texts with predictable linear structure.

### 🎯 RUBRIC-BASED SEMANTIC EVALUATION RULES:
1. **Atomized Scoring**:
   - **Full Marks (Level 5 quality)**: Student captures the core meaning of ALL required criteria in \`marking_logic.full_marks_criteria\` or \`marking_logic.key_phrases\`. The answer demonstrates inference, evaluation, or understanding of implied meaning — NOT just literal extraction.
   - **Partial Marks (Level 3–4 quality)**: Student captures the 'Main Idea' but misses a secondary 'Supporting Detail', technical nuance, or implied meaning. Use \`marking_logic.partial_marks_logic\` as a guide. Award ~50% (0.5/1 or 1.0/2).
   - **Zero Marks (Level 1–2 quality)**: The answer is factually wrong, contradicts the text, or demonstrates only literal/surface-level understanding with no grasp of the main idea.
   - **Reject List**: If the answer contains concepts from \`marking_logic.reject_criteria\` (contradictions or irrelevant "lifting"), award 0 marks immediately.

2. **Semantic Equivalence (DSE Standard)**:
   - **Meaning > Form**: Reward logical equivalence over exact string matching. "The heart is a pump" is equivalent to "The heart circulates blood mechanically."
   - **Lenience on Syntax**: Ignore minor grammatical errors or missing articles (a/an/the) unless they fundamentally change the meaning.
   - **Lifting Penalty**: If the student copies an entire sentence from the passage that contains the answer but also irrelevant information (a common DSE mistake), award Partial Marks instead of Full Marks.

3. **Strict TFNG (True/False/Not Given) Logic**:
   - If the student's Choice (T/F/NG) is INCORRECT, the score is **0**. Do not evaluate the justification.
   - If the Choice is CORRECT:
     - For TRUE/NOT_GIVEN: Award full marks (usually 1).
     - For FALSE: The justification must be a semantic match to the scheme or passage facts. If justification is missing or semantically unrelated, award **0**.

### 📝 FEEDBACK MANDATE:
Provide specific, expert feedback as "Miss Janie".
- **Tone**: Professional, encouraging, and highly specific to the DSE exam criteria.
- **Feedback**:
    - If Full Marks: Confirm the answer demonstrates Level 5 comprehension (inference, evaluation, or nuanced understanding).
    - If Partial: Specify exactly which concept from the marking scheme was missing or why the student's logic was flawed. Reference the Level Descriptor (e.g., "This is a Level 3 answer — you identified the explicit information but missed the implied attitude.").
    - If Zero: Explain why the answer demonstrates only Level 1–2 comprehension.
- **Professional Advice**: Provide a separate piece of advice to help the student reach Level 5** (e.g., "Use synonyms for keywords in the question to avoid lifting errors").

### INPUT (JSON):
${JSON.stringify(questionsInput, null, 2)}

### OUTPUT FORMAT (JSON OBJECT ONLY):
{
    "QUESTION_ID": {
        "score": number,
        "status": "correct" | "partial" | "incorrect",
        "feedback": "...",
        "professional_advice": "..."
    }
}
`;
    }

    /**
     * Evaluate deterministic questions (MCQ, Vocab, etc)
     */
    evaluateDeterministicQuestion(q, answer) {
        if (!answer) return { score: 0, feedback: "No answer provided.", status: 'incorrect' };

        switch (q.type) {
            case 'Multiple_Choice':
            case 'mc_main_idea':
                return this.evaluateMC(q, answer);
            case 'summary_cloze':
            case 'flow_chart':
                return this.evaluateExtraction(q, answer);
            case 'vocab_match':
                return this.evaluateVocabMatch(q, answer);
            case 'Fill_in_Blanks':
            default:
                // Handle various string-based types or defaults as short answers
                return this.evaluateShortAnswer(q, answer);
        }
    }

    /**
     * Evaluate string-based short answers with normalization
     */
    evaluateShortAnswer(question, answer) {
        const correctRaw = question.answer || question.marking_scheme || "";
        const userAnswer = (answer || "").toString().trim().toLowerCase();
        const correctAnswer = correctRaw.toString().trim().toLowerCase();

        // Basic normalization: remove punctuation at the end and extra spaces
        const normalize = (s) => s.replace(/[.,!?]$/, "").replace(/\s+/g, " ");
        
        if (normalize(userAnswer) === normalize(correctAnswer)) {
            return { 
                score: question.marks || 1, 
                status: 'correct', 
                feedback: "Correct. Your answer matches the required information." 
            };
        }

        // Partial match check (e.g. if the answer is contained within)
        if (userAnswer.length > 3 && correctAnswer.includes(userAnswer)) {
            return { 
                score: Math.max(0, (question.marks || 1) - 1), 
                status: 'partial', 
                feedback: "Partially correct. You have the right idea but missed some detail." 
            };
        }

        return { 
            score: 0, 
            status: 'incorrect', 
            feedback: `The correct answer was: ${correctRaw}` 
        };
    }

    evaluateMC(question, answer) {
        const correctRaw = (question.marking_scheme || question.answer || "").toString().trim();
        const userAnswer = (answer || "").toString().trim();

        // 1. Exact string match (best for modern JSON mocks)
        if (userAnswer.toLowerCase() === correctRaw.toLowerCase()) {
            return { 
                score: question.marks || 1, 
                status: 'correct', 
                feedback: "Excellent. You identified the correct option." 
            };
        }

        // 2. Character-based match (fallback for A, B, C marking schemes)
        const correctChar = correctRaw.charAt(0).toUpperCase();
        const userChar = userAnswer.charAt(0).toUpperCase();
        
        if (userChar === correctChar && userChar.match(/[A-Z]/)) {
            return { 
                score: question.marks || 1, 
                status: 'correct', 
                feedback: "Correct. Option identified." 
            };
        }

        return { 
            score: 0, 
            status: 'incorrect', 
            feedback: `The correct answer was: ${correctRaw}` 
        };
    }

    evaluateExtraction(question, answer) {
        let score = 0;
        const correctAnswers = question.answers || {};
        const subResults = {};
        Object.entries(correctAnswers).forEach(([id, correct]) => {
            const userWord = (answer[id] || "").trim().toLowerCase();
            if (userWord === correct.toLowerCase()) {
                score += 1;
                subResults[id] = { status: 'correct' };
            } else {
                subResults[id] = { status: 'incorrect', correct };
            }
        });
        return { 
            score, 
            status: score === Object.keys(correctAnswers).length ? 'correct' : (score > 0 ? 'partial' : 'incorrect'),
            feedback: score === Object.keys(correctAnswers).length ? "Perfect extraction." : `You got ${score} out of ${Object.keys(correctAnswers).length} correct.`,
            subResults 
        };
    }

    evaluateVocabMatch(question, answer) {
        let score = 0;
        const pairs = question.pairs || {};
        Object.entries(pairs).forEach(([word, meaning]) => {
            if (answer[word] === meaning) score += 1;
        });
        return { 
            score, 
            status: score === Object.keys(pairs).length ? 'correct' : 'partial',
            feedback: `You correctly matched ${score} words.`
        };
    }

    /**
     * Fallback evaluation using literal string matching and keyword heuristics
     */
    evaluateLiteralSubjective(q, answer) {
        if (!answer) return { score: 0, status: 'incorrect', feedback: "No answer provided." };

        const normalizedUser = (typeof answer === 'string' ? answer : JSON.stringify(answer)).toLowerCase().trim();

        // 1. Exact or Containment Match (Handles introductory phrases)
        const normalizedScheme = (q.marking_scheme || "").toLowerCase().trim();
        if (normalizedScheme.length > 0) {
            if (normalizedUser === normalizedScheme || normalizedUser.includes(normalizedScheme) || normalizedScheme.includes(normalizedUser)) {
                return { 
                    score: q.marks, 
                    status: 'correct', 
                    feedback: "Perfect. Your answer matches the required marking criteria.",
                    professionalAdvice: "To maintain this precision, continue focusing on identifying the relationship between key entities in the text."
                };
            }
        }

        // 2. Keyword Heuristic (Improved with fuzzy/word-level matching)
        const phrases = q.marking_logic?.key_phrases || [];
        if (phrases.length > 0) {
            const matches = phrases.filter(p => {
                const lp = p.toLowerCase();
                // A. Strict Substring match
                if (normalizedUser.includes(lp)) return true;
                
                // B. Word-level match (handles cases like "who is TRULY in control")
                const words = lp.split(/\s+/).filter(w => w.length > 2); // Only significant words
                if (words.length > 0 && words.every(w => {
                    // Simple Stemming: check if 80% of the keyword exists in any word of the user answer
                    // or if the user answer contains the keyword minus common suffixes
                    const stem = w.replace(/(ing|ed|es|s|e)$/, '');
                    return normalizedUser.includes(stem);
                })) return true;
                
                return false;
            });
            const matchRatio = matches.length / phrases.length;
            
            if (matchRatio >= 0.8) {
                const advice = q.skill_tag?.toLowerCase().includes('metaphor') 
                    ? "Your interpretation of the figurative language is spot on. Keep identifying the underlying literal meaning."
                    : "To maintain this precision, continue focusing on identifying the relationship between key entities in the text.";
                return { 
                    score: q.marks, 
                    status: 'correct', 
                    feedback: "Excellent. Your answer accurately captures the core requirements of the marking scheme.",
                    professionalAdvice: advice
                };
            } else if (matchRatio >= 0.4) {
                const advice = q.skill_tag?.toLowerCase().includes('metaphor')
                    ? "When explaining metaphors, ensure you explicitly bridge the 'figurative' image to the 'literal' consequence in the text."
                    : "Try to incorporate more specific terminology from the passage to secure full marks.";
                return { 
                    score: Math.round(q.marks * 0.5 * 2) / 2, 
                    status: 'partial', 
                    feedback: "You identified some key elements but missed others. Compare your answer with the model answer to see the missing details.",
                    professionalAdvice: advice
                };
            }
        }

        // 3. TFNG Specific Fallback (Literal Checking)
        if (q.type === 'tf_ng' && typeof answer === 'object') {
            let totalScore = 0;
            const subResults = {};
            
            const qItems = q.items || [];
            qItems.forEach((item, idx) => {
                const userItem = answer[idx] || {};
                const isChoiceCorrect = userItem.choice === item.answer;
                
                if (isChoiceCorrect) {
                    if (item.answer === 'FALSE') {
                        // Check justification
                        const userJust = (userItem.justification || "").toLowerCase().trim();
                        const schemeJust = (item.justification || "").toLowerCase().trim();
                        if (userJust === schemeJust && schemeJust.length > 0) {
                            totalScore += 1;
                            subResults[idx] = { score: 1, status: 'correct' };
                        } else {
                            subResults[idx] = { score: 0, status: 'incorrect', feedback: "Justification missing or incorrect." };
                        }
                    } else {
                        totalScore += 1;
                        subResults[idx] = { score: 1, status: 'correct' };
                    }
                } else {
                    subResults[idx] = { score: 0, status: 'incorrect' };
                }
            });

            return { 
                score: totalScore, 
                status: totalScore === qItems.length ? 'correct' : (totalScore > 0 ? 'partial' : 'incorrect'),
                feedback: "TF/NG evaluated using literal match. (Auto-verified)",
                subResults
            };
        }

        return { score: 0, status: 'incorrect', feedback: "Your answer does not match the required criteria in the marking scheme. Please check the model answer for key terminology.", professionalAdvice: "Focus on identifying the specific keywords or phrases used in the question prompt within the source text." };
    }
    /**
     * Evaluate a Paper 2 (Writing) submission
     */
    async evaluateWritingPaper(mockData, userAnswers, analytics = {}, _tier = 'free') {
        const results = {};
        const sectionalScores = { 
            A: { score: 0, possible: 21, domains: {} }, 
            B: { score: 0, possible: 21, domains: {} } 
        };
        const skillScores = {
            'Content': { score: 0, possible: 0 },
            'Language': { score: 0, possible: 0 },
            'Organization': { score: 0, possible: 0 }
        };

        const partA_Draft = userAnswers.partA_draft;
        const partB_Draft = userAnswers.partB_draft;
        const selectedPartB = analytics.selectedPartB;

        // 1. Pre-check for empty submission
        if (!String(partA_Draft || '').trim() && !String(partB_Draft || '').trim()) {
            return {
                totalScore: 0,
                possibleScore: 42,
                percentage: 0,
                level: '1',
                sectionalScores,
                skillScores,
                analytics,
                results: { error: "No content provided for either part." }
            };
        }

        // 2. Prepare AI prompt for Paper 2
        const prompt = this.createWritingBatchPrompt(mockData, partA_Draft, partB_Draft, selectedPartB);
        
        let data = {};
        const writingJsonOpts = {
            model: 'ace-it-flash',
            temperature: 0.1,
            strictModel: false,
            // Reasoner / short defaults truncate long rubric JSON; chat model + 4k avoids parse failures → 500.
            generationConfig: { maxOutputTokens: 4096 }
        };
        try {
            const response = await GenerativeAIService.generateJson(prompt, writingJsonOpts);
            data = response.data || {};
        } catch (e) {
            console.warn("[MockAssessment] Writing evaluation failed, retrying with higher temperature:", e.message);
            try {
                const response = await GenerativeAIService.generateJson(prompt, {
                    ...writingJsonOpts,
                    temperature: 0.25
                });
                data = response.data || {};
            } catch (fallbackError) {
                console.error("[MockAssessment] Writing evaluation retries failed:", fallbackError);
                throw fallbackError;
            }
        }

        // 2. Map scores to domains
            ['A', 'B'].forEach(part => {
                const partData = data[`Part_${part}`] || {};
                const scores = partData.scores || { content: 0, language: 0, organization: 0 };
                
                sectionalScores[part].domains = {
                    content: { 
                        score: scores.content || 0, 
                        feedback: partData.feedback?.content || "No attempt recorded for this domain." 
                    },
                    language: { 
                        score: scores.language || 0, 
                        feedback: partData.feedback?.language || "No attempt recorded for this domain." 
                    },
                    organization: { 
                        score: scores.organization || 0, 
                        feedback: partData.feedback?.organization || "No attempt recorded for this domain." 
                    }
                };
                
                sectionalScores[part].score = (scores.content || 0) + (scores.language || 0) + (scores.organization || 0);
                sectionalScores[part].overallFeedback = partData.overall_feedback || "The section was either left blank or contained insufficient content for a full assessment. Please ensure you address all requirements of the prompt to receive a grade.";

                // Update skill scores
                skillScores.Content.score += scores.content;
                skillScores.Content.possible += 7;
                skillScores.Language.score += scores.language;
                skillScores.Language.possible += 7;
                skillScores.Organization.score += scores.organization;
                skillScores.Organization.possible += 7;
            });

            const totalScore = sectionalScores.A.score + sectionalScores.B.score;
            const totalPossible = sectionalScores.A.possible + sectionalScores.B.possible;
            const percentage = (totalScore / totalPossible) * 100;

            // DSE Level Mapping for Writing
            const getWritingLevel = (pct) => {
                if (pct >= 88) return '5**';
                if (pct >= 80) return '5*';
                if (pct >= 72) return '5';
                if (pct >= 62) return '4';
                if (pct >= 50) return '3';
                if (pct >= 38) return '2';
                return '1';
            };

            return {
                totalScore,
                possibleScore: totalPossible,
                percentage,
                level: getWritingLevel(percentage),
                sectionalScores,
                skillScores,
                analytics,
                results: data // Detailed feedback for review
            };

    }

    createWritingBatchPrompt(mockData, partA, partB, selectedPartB) {
        const pa = mockData.Part_A || {};
        return `
You are a Senior HKEAA HKDSE English Language Paper 2 (Writing) Examiner.
Evaluate the following submission based on the official 0-7 scale for Content, Language, and Organization.

### EXAM DATA:
Part A (Compulsory):
- Genre: ${pa.genre || 'N/A'}
- Situation: ${pa.situation || 'N/A'}
- Mandatory Requirements: ${pa.requirements?.join(' | ') || 'N/A'}
- Student Draft: "${partA}"

Part B (Elective):
- Elective: ${selectedPartB?.elective}
- Question: ${selectedPartB?.question}
- Mandatory Requirements: ${selectedPartB?.requirements?.join(' | ')}
- Student Draft: "${partB}"

### OFFICIAL HKEAA WRITING DESCRIPTORS — 0-7 SCALE (Per Domain)

#### CONTENT (0–7 marks)
**7 — Exemplary (Level 5**):** All bullet points addressed with insight, originality, and flair. Ideas are complex, well-developed, and insightful. Goes beyond the prompt with nuanced arguments.
**6 — Excellent (Level 5*):** All bullet points addressed clearly. Ideas are well-organized and clearly expressed with some depth. Strong relevance throughout.
**5 — Strong (Level 5):** All bullet points addressed. Ideas are clear and effective. Good development with relevant examples. Minor gaps in depth.
**4 — Good (Level 4):** Most bullet points addressed. Ideas are clear but may lack sophistication. Some development present but surface-level.
**3 — Adequate (Level 3):** Some bullet points addressed. Main points communicated but with significant omissions. Basic development only.
**2 — Weak (Level 2):** Few bullet points addressed. Ideas are fragmented or underdeveloped. Limited relevance to the task.
**1 — Minimal (Level 1):** One or two relevant points. Ideas are barely communicated. Largely off-task or incoherent.
**0 — No attempt:** Empty or completely irrelevant.

**PENALTIES:**
- Missing ANY mandatory bullet point: MAXIMUM 4 for Content in that section.
- Off-topic response: MAXIMUM 2 for Content.
- Lifting entire phrases from the prompt without reworking: −1 Content.

#### LANGUAGE (0–7 marks)
**7 — Exemplary (Level 5**):** Sophisticated sentence structures (inversions, cleft sentences, participial phrases). Precise vocabulary with natural collocations. Virtually error-free. Native-like command.
**6 — Excellent (Level 5*):** Wide range of structures, mostly complex. Impressive vocabulary used naturally. Very few errors.
**5 — Strong (Level 5):** Wide range of vocabulary and sentence structures. Communication is clear and effective. Occasional minor errors.
**4 — Good (Level 4):** Language is generally accurate. Uses simple and compound sentences; some complex. Errors do not affect clarity.
**3 — Adequate (Level 3):** Simple language used correctly. Some fairly complex sentences attempted. Basic vocabulary with repetition. Errors sometimes impede meaning.
**2 — Weak (Level 2):** Short and simple sentence types. Frequent grammar and spelling errors. Limited vocabulary; repetitive phrasing.
**1 — Minimal (Level 1):** Simple basic structures accurate enough to be understood in parts. Very limited vocabulary.
**0 — No attempt:** Empty or unintelligible.

**PENALTIES:**
- Frequent spelling mistakes impeding clarity: −1 to −2 Language.
- Inappropriate register (e.g., slang in formal letter): −1 Language.

#### ORGANIZATION (0–7 marks)
**7 — Exemplary (Level 5**):** Wholly coherent. Seamless transitions. Perfect genre features (e.g., report headers, letter addresses). Logical grouping with sophisticated connectors.
**6 — Excellent (Level 5*):** Highly coherent. Smooth transitions. Correct genre features. Well-structured paragraphs.
**5 — Strong (Level 5):** Coherent throughout. Logical paragraphing. Appropriate genre features. Clear progression of ideas.
**4 — Good (Level 4):** Coherent. Logical paragraphing. Genre features used correctly. Adequate transitions.
**3 — Adequate (Level 3):** Coherent in parts. Some genre features used correctly. Paragraphing present but uneven. Weak transitions.
**2 — Weak (Level 2):** Some evidence of paragraphing. Some genre features used. Weak or absent transitions. Poor grouping of points.
**1 — Minimal (Level 1):** Basic genre features used. One or two links between sentences. Little coherent structure.
**0 — No attempt:** No structure.

### EVALUATION MANDATE:
1. Assign scores (0-7) for Content (C), Language (L), and Organization (O) for BOTH parts using the descriptors above.
2. Provide granular feedback for each domain, referencing the specific descriptor level the student has achieved.
3. Provide an overall summary for each part as "Miss Janie".
4. **EMPTY DRAFT RULE**: If a student draft is empty (""), award 0 for all domains and explicitly state "No content provided" in the feedback.
5. **STERN CALIBRATION**: Be highly critical. A response that is "good" but not "impressive" should NOT receive a 7. Use the full 0–7 range. Most average students should score 3–4. Strong students 5–6. Only exceptional students 7.

### OUTPUT FORMAT (JSON ONLY):
{
    "Part_A": {
        "scores": { "content": 0-7, "language": 0-7, "organization": 0-7 },
        "feedback": { "content": "...", "language": "...", "organization": "..." },
        "overall_feedback": "..."
    },
    "Part_B": {
        "scores": { "content": 0-7, "language": 0-7, "organization": 0-7 },
        "feedback": { "content": "...", "language": "...", "organization": "..." },
        "overall_feedback": "..."
    }
}
`;
    }
    /**
     * Evaluate a Paper 3 (Listening & Integrated Skills) submission
     */
    async evaluateListeningPaper(mockData, userAnswers, analytics = {}, tier = 'free') {
        const results = {};
        const sectionalScores = { 
            A: { score: 0, possible: 0 }, 
            B: { score: 0, possible: 42, domains: {} } 
        };
        const skillScores = {};
        
        const selectedPart = analytics.selectedSection || 'B2';
        const partBDrafts = userAnswers.drafts || {};

        // 1. Evaluate Part A
        const partATasks = mockData.Part_A?.tasks || [];
        const subjectiveQuestions = [];
        const deterministicQuestions = [];

        partATasks.forEach(task => {
            (task.questions || []).forEach(q => {
                const userAnswer = userAnswers[q.id];
                if (!userAnswer) {
                    results[q.id] = { score: 0, feedback: "No answer provided.", status: 'incorrect' };
                    sectionalScores.A.possible += q.marks || 1;
                    return;
                }

                // Treat string-based answers as subjective to allow for typo leniency (HKEAA Standard)
                if (['GAP_FILL', 'SHORT_RESPONSE', 'FORM_FILLING', 'Fill_in_Blanks'].includes(q.type)) {
                    subjectiveQuestions.push({ q, userAnswer });
                } else {
                    deterministicQuestions.push({ q, userAnswer });
                }
            });
        });

        // Evaluate Deterministic Part A
        deterministicQuestions.forEach(({ q, userAnswer }) => {
            const assessment = this.evaluateDeterministicQuestion(q, userAnswer);
            results[q.id] = assessment;
            sectionalScores.A.score += assessment.score;
            sectionalScores.A.possible += q.marks || 1;
        });

        // Evaluate Subjective Part A (AI with Typo Leniency)
        if (subjectiveQuestions.length > 0) {
            const aiResults = await this.evaluateListeningPartABatch(subjectiveQuestions, mockData.title, tier);
            Object.entries(aiResults).forEach(([id, assessment]) => {
                results[id] = assessment;
                sectionalScores.A.score += assessment.score;
                // Find the question to get its possible marks
                const q = subjectiveQuestions.find(it => it.q.id === id)?.q;
                sectionalScores.A.possible += q?.marks || 1;
            });
        }

        // Update skill scores for Part A
        const listeningSkill = 'Listening Accuracy';
        if (!skillScores[listeningSkill]) skillScores[listeningSkill] = { score: sectionalScores.A.score, possible: sectionalScores.A.possible };

        // 2. Evaluate Part B (Subjective Writing)
        const partBData = mockData.Part_B || {};
        const activeTasks = (selectedPart === 'B1' ? partBData.Part_B1?.tasks : partBData.Part_B2?.tasks) || partBData.tasks || [];
        
        const writingPrompt = this.createListeningIntegratedPrompt(mockData, partBDrafts, selectedPart);
        
        let aiWritingResults = {};
        try {
            // Use flash model for evaluation — it handles large JSON outputs better than reasoner
            const response = await GenerativeAIService.generateJson(writingPrompt, { 
                model: 'ace-it-flash',
                temperature: 0.1,
                generationConfig: {
                    maxOutputTokens: 4096
                }
            });
            aiWritingResults = response.data || {};
        } catch (e) {
            console.warn("[MockAssessment] Listening Part B evaluation failed:", e.message);
            aiWritingResults = { total_score: 0, overall_feedback: "AI Evaluation Service Temporarily Unavailable." };
        }

        // Map AI results to sectionalScores.B
        sectionalScores.B.domains = aiWritingResults.domains || {
            content: { score: 0, feedback: "No content data returned." },
            language: { score: 0, feedback: "No language data returned." },
            organization: { score: 0, feedback: "No organization data returned." },
            appropriacy: { score: 0, feedback: "No appropriacy data returned." }
        };
        sectionalScores.B.score = aiWritingResults.total_score || 0;
        sectionalScores.B.possible = 42; // 18 Content + 9 Lang + 9 Org + 6 App
        sectionalScores.B.overallFeedback = aiWritingResults.overall_feedback || "Integrated skills evaluated.";

        const totalScore = sectionalScores.A.score + sectionalScores.B.score;
        const totalPossible = sectionalScores.A.possible + sectionalScores.B.possible;
        const percentage = (totalScore / totalPossible) * 100;

        // Skill scores for Part B (Standard HKEAA Domains)
        skillScores['Content Synthesis'] = { score: sectionalScores.B.domains.content?.score || 0, possible: 18 };
        skillScores['Integrated Language'] = { score: sectionalScores.B.domains.language?.score || 0, possible: 9 };
        skillScores['Logical Organization'] = { score: sectionalScores.B.domains.organization?.score || 0, possible: 9 };
        skillScores['Register & Tone'] = { score: sectionalScores.B.domains.appropriacy?.score || 0, possible: 6 };

        return {
            totalScore,
            possibleScore: totalPossible,
            percentage,
            level: this.calculateListeningLevel(percentage, selectedPart),
            sectionalScores,
            skillScores,
            xpAwarded: Math.floor(percentage * 10),
            analytics,
            results: { ...results, writingEvaluation: aiWritingResults },
            userAnswers: {
                answers: userAnswers,
                drafts: partBDrafts
            }
        };
    }

    calculateListeningLevel(pct, part) {
        let level = '1';
        if (pct >= 88) level = '5**';
        else if (pct >= 80) level = '5*';
        else if (pct >= 72) level = '5';
        else if (pct >= 62) level = '4';
        else if (pct >= 50) level = '3';
        else if (pct >= 38) level = '2';
        
        if (part === 'B1' && ['5', '5*', '5**'].includes(level)) return '4';
        return level;
    }

    /**
     * Generate paper-specific cheat answers for dev/QA testing.
     * Part A answers are extracted directly from mock data.
     * Part B answers are generated via AI using the actual data files and rubrics.
     */
    async generateCheatAnswers(mockData, section, targetLevel = '5') {
        const result = {
            partA: {},
            partB: {},
            selectedSection: section === 'B1' || section === 'B2' ? section : null
        };

        // --- Part A: Extract correct answers from mock data ---
        const partATasks = mockData.Part_A?.tasks || [];
        partATasks.forEach(task => {
            (task.questions || []).forEach((q, idx) => {
                if (!q.answer) return;
                
                let answer = q.answer;
                
                // Level-based degradation for Part A
                if (targetLevel === '2') {
                    // 50% wrong answers
                    answer = idx % 2 === 0 ? q.answer : 'Wrong answer';
                } else if (targetLevel === '3') {
                    // ~25% wrong answers, some blanks
                    if (idx % 4 === 1) answer = 'Wrong answer';
                    else if (idx % 7 === 0) answer = '';
                } else if (targetLevel === '4') {
                    // ~10% minor errors (phonetic-like typos)
                    if (idx % 10 === 0 && q.answer.length > 3) {
                        answer = q.answer.slice(0, -1) + 'e'; // simple typo
                    }
                }
                // Level 5: perfect answers (no change)
                
                result.partA[q.id] = answer;
            });
        });

        // --- Part B: Generate via AI using actual data files and rubrics ---
        // Generate each task individually to avoid context window truncation
        if ((section === 'B1' || section === 'B2') && mockData.Part_B) {
            const tasks = (section === 'B1' 
                ? mockData.Part_B?.Part_B1?.tasks 
                : mockData.Part_B?.Part_B2?.tasks) || mockData.Part_B?.tasks || [];
            
            const dataFiles = mockData.Part_B?.data_file || [];
            
            const levelInstructions = {
                '5': 'Write a FLAWLESS Level 5** response. Include ALL content points with sophisticated synthesis. Use varied sentence structures, precise vocabulary, and complex grammar. Perfect format and layout. Seamless integration of Data File evidence.',
                '4': 'Write a COMPETENT Level 4 response. Include MOST content points with adequate synthesis. Minor language slips allowed (1-2 minor grammar issues). Correct format with minor layout imperfections. Good but not exceptional vocabulary.',
                '3': 'Write a BASIC Level 3 response. Include SOME content points but miss 1-2 key points. Use simple language and sentence structures. Format is mostly correct but has noticeable issues. Basic vocabulary with some repetition.',
                '2': 'Write a WEAK Level 2 response. Miss SEVERAL content points. Use simple/repetitive language with noticeable grammar errors. Format has significant errors. Limited vocabulary. Some content is irrelevant or off-topic.'
            };

            for (const task of tasks) {
                const prompt = `
You are a HKDSE English Paper 3 student writing an integrated skills task.
Generate a ${targetLevel === '5' ? 'perfect' : targetLevel === '4' ? 'good' : targetLevel === '3' ? 'basic' : 'weak'} quality response for this ONE task only.

### DATA FILES (Evidence you must use):
${dataFiles.map(df => `[${df.title}]: ${df.content.substring(0, 1500)}`).join('\n\n')}

### TASK TO WRITE:
TASK: ${task.id} (${task.type})
Instructions: ${task.instructions}
Required Content Points: ${JSON.stringify(task.grading_rubric?.content_points || [])}
Tone: ${task.grading_rubric?.tone || 'Appropriate to task'}
Word Count Guidance: ${task.wordCount || 'As appropriate'}

### QUALITY LEVEL: ${targetLevel}
${levelInstructions[targetLevel] || levelInstructions['5']}

### RULES:
- The response MUST incorporate the specific content points listed above
- Use evidence from the Data Files provided
- Match the required tone/register for the task type
- Do NOT use markdown formatting inside the text (no **bold**, no bullet points unless appropriate for the genre)
- Write as a real student would write in an exam
- IMPORTANT: Keep the response concise (under 300 words) to ensure it fits in the output. Focus on quality over quantity.

### OUTPUT FORMAT (JSON ONLY — keep it compact, no extra whitespace):
{"response":"Your response text here..."}
`;

                try {
                    const response = await GenerativeAIService.generateJson(prompt, {
                        model: 'ace-it-flash',
                        temperature: targetLevel === '5' ? 0.2 : 0.4,
                        generationConfig: {
                            maxOutputTokens: 4096
                        }
                    });
                    result.partB[task.id] = response.data?.response || '';
                } catch (e) {
                    console.error(`[MockAssessment] Cheat generation failed for ${task.id}:`, e.message);
                    result.partB[task.id] = '';
                }
            }
        }

        return result;
    }

    createListeningIntegratedPrompt(mockData, drafts, selectedPart) {
        const dataFiles = mockData.Part_B?.data_file || [];
        const tasks = (selectedPart === 'B1' ? mockData.Part_B?.Part_B1?.tasks : mockData.Part_B?.Part_B2?.tasks) || mockData.Part_B?.tasks || [];
        
        return `
You are a Senior HKEAA HKDSE English Paper 3 (Listening & Integrated Skills) Examiner.
Evaluate these Section ${selectedPart} tasks using the official 18-9-9-6 rubric, aligned with the HKEAA Level Descriptors.

### DATA FILE CONTEXT (Evidence Library):
${dataFiles.map(df => `[${df.title}]: ${df.content.substring(0, 1000)}...`).join('\n\n')}

### STUDENT SUBMISSION:
${tasks.map(t => `[${t.id} - ${t.type}]:
Draft: "${drafts[t.id] || ''}"
Instructions: ${t.instructions}
Mandatory Content Points (Audio/Data File): ${JSON.stringify(t.marking_logic || t.grading_rubric || {})}
Requirements: ${t.requirements?.join(', ')}`).join('\n\n')}

### OFFICIAL HKEAA MARKING CRITERIA — PART B INTEGRATED SKILLS (18-9-9-6)

#### 1. CONTENT (18 marks) — Based on HKEAA Level Descriptors
Score the student's ability to locate, select, and transfer relevant information from Data Files to complete the writing task.

**Score Band 16–18 (Level 5):**
- ALL Data File instructions are interpreted and followed appropriately.
- ALL relevant information is located and transferred from complex texts.
- Content is COMPLETE and WHOLLY RELEVANT to the writing task/purpose.
- Contrasting views and attitudes in complex written texts are evaluated.
- Information is SYNTHESISED (not copied in chunks). Seamless integration of evidence.

**Score Band 12–15 (Level 4):**
- MOST Data File instructions are interpreted and followed appropriately.
- MOST relevant information is located and transferred from fairly complex texts.
- MOST of the content relevant to the writing task/purpose is included.
- Some synthesis present, but may read like a list in places.

**Score Band 8–11 (Level 3):**
- SOME Data File instructions are understood and followed appropriately.
- Most relevant information from straightforward texts is transferred, but 1–2 key points are MISSING.
- SOME of the content relevant to the task is included.
- Tendency to copy Data File phrases without sufficient reworking.

**Score Band 4–7 (Level 2):**
- SOME Data File instructions are followed IN PART only.
- SOME relevant information is located and transferred from simple texts.
- Relevant content is included only when its relevance has been clearly signalled.
- Significant omissions. Some content may be irrelevant or off-topic.

**Score Band 0–3 (Level 1):**
- A few Data File instructions are followed in part.
- Minimal relevant information transferred.
- Content is largely irrelevant, missing, or misunderstood.

**PENALTIES:**
- **Relevance Penalty**: Deduct 0.5 marks (up to 2.0 max) for each piece of IRRELEVANT information.
- **Copied Chunks Penalty**: Deduct 1–2 marks for excessive copying of Data File phrases without synthesis.
- **Off-Topic Penalty**: If the response is about a completely different topic (e.g., Smart City when the task is about bag levies), award MAXIMUM 2 marks for Content.

#### 2. LANGUAGE (9 marks)
**Score Band 8–9 (Level 5):**
- Wide range of written sentence structures (complex, compound-complex, inversion, relative clauses).
- Highly accurate spelling, punctuation, and grammar.
- Precise vocabulary and natural collocations.

**Score Band 6–7 (Level 4):**
- Range of sentence structures, some complex.
- Punctuation, spelling, and most language structures are accurate.
- Errors do not affect overall clarity.

**Score Band 4–5 (Level 3):**
- Some fairly complex sentences accurately constructed.
- Simple structures are mostly accurate; some errors in complex structures.
- Basic vocabulary with some repetition.

**Score Band 2–3 (Level 2):**
- Short and simple sentence types used accurately enough to convey meaning.
- Frequent grammar and spelling errors that may impede understanding.
- Limited vocabulary; repetitive phrasing.

**Score Band 0–1 (Level 1):**
- Simple basic structures accurate enough to be understood in parts only.
- Very limited vocabulary; errors impede communication.

**PENALTIES:**
- **Miscopying Penalty**: Miscopying words/names clearly written in the Data File prevents top marks (Level 5**).
- **Spelling Penalty**: Frequent or serious spelling mistakes impeding clarity deduct 1–2 marks.

#### 3. ORGANIZATION (9 marks)
**Score Band 8–9 (Level 5):**
- Organization is WHOLLY COHERENT.
- Perfect adherence to layout (e.g., email headers, report sections, letter addresses).
- Logical grouping of points with smooth transitions.

**Score Band 6–7 (Level 4):**
- Organization is coherent.
- Correct use of familiar genre features.
- Logical paragraphing with adequate transitions.

**Score Band 4–5 (Level 3):**
- Organization is coherent IN PARTS of the text.
- Some genre features used correctly; some layout issues.
- Paragraphing present but may be uneven.

**Score Band 2–3 (Level 2):**
- Some evidence of paragraphing.
- Some features of familiar genres used.
- Weak transitions; points may be poorly grouped.

**Score Band 0–1 (Level 1):**
- One or two links between sentences.
- Basic genre features used.
- Little to no coherent structure.

#### 4. APPROPRIACY (6 marks)
**Score Band 5–6 (Level 5):**
- Register, tone, and style are APPROPRIATE throughout.
- Appropriate features of the genre are used flawlessly.
- Tone consistency maintained; no shifts.

**Score Band 4 (Level 4):**
- Register, tone, and style are appropriate in familiar tasks.
- Features of familiar genres used correctly.
- Minor tone inconsistencies (max 4 if shift occurs).

**Score Band 2–3 (Level 3):**
- Register, tone, and style are appropriate in straightforward, familiar types of writing.
- Some genre features used correctly.
- Noticeable tone issues in parts.

**Score Band 1 (Level 2):**
- Some features of familiar genres used.
- Tone may be inappropriate for parts of the task.

**Score Band 0 (Level 1):**
- Basic genre features used.
- Tone largely inappropriate.

### SECTION B1 vs B2 NOTE:
- B1 is capped at Level 4 (max 62% for B section). Grade for clarity and competence.
- B2 is uncapped. Grade for elite performance requiring flair, nuance, and seamless synthesis.

### OUTPUT FORMAT (JSON ONLY — compact, no extra whitespace):
{"total_score":0-42,"domains":{"content":{"score":0-18,"feedback":"Specific points found/missed with reference to Data File evidence."},"language":{"score":0-9,"feedback":"..."},"organization":{"score":0-9,"feedback":"..."},"appropriacy":{"score":0-6,"feedback":"..."}},"task_breakdown":{"TASK_ID":{"comments":"...","missed_points":["..."],"model_answer":"A concise model answer (under 150 words)."}},"overall_feedback":"Expert marker advice. Keep under 150 words."}
`;
    }
    /**
     * Evaluate Listening Part A subjective questions in batch
     */
    async evaluateListeningPartABatch(items, topic, tier) {
        const questionsInput = items.reduce((acc, it) => {
            acc[it.q.id] = {
                type: it.q.type,
                question: it.q.question,
                user_answer: it.userAnswer,
                marking_scheme: it.q.marking_scheme || it.q.answer,
                marking_logic: it.q.marking_logic,
                max_marks: it.q.marks || 1
            };
            return acc;
        }, {});

        const prompt = `
            You are a Senior HKEAA HKDSE English Paper 3 (Listening) Examiner.
            Grade these Part A answers for the mock: "${topic}".

            ### 🎯 HKEAA MARKING RULES (STRICT BINARY SCORING):
            1. **No Partial Marks**: Each item is worth either Full Marks (1) or Zero (0). Do NOT award 0.5 marks.
            2. **Phonetic Leniency (Communicative Clarity)**: 
               - Award 1 mark if the spelling is phonetically similar to the answer and the word is easily recognizable.
               - Examples: "acomodation" (1), "streat" (1), "enviornment" (1).
            3. **Meaning-Changing Errors (0 Marks)**:
               - If the typo results in a different English word that changes the meaning, award 0. 
               - Example: "meat" instead of "meet", "fill" instead of "feel".
            4. **Proper Nouns & Technical Terms**:
               - Be slightly stricter with proper names (e.g., "Sarah") if they are common, but allow 1-letter slips.
            5. **Capitalization**:
               - Ignore capitalization unless it is essential for the meaning (uncommon in Part A).

            ### OUTPUT FORMAT (JSON ONLY):
            {
                "QUESTION_ID": {
                    "score": 0 | 1,
                    "status": "correct" | "incorrect",
                    "feedback": "...",
                    "professional_advice": "..."
                }
            }
        `;

        try {
            const model = (tier && tier.toLowerCase() === 'premium') ? 'ace-it-pro' : 'ace-it-flash';
            const response = await GenerativeAIService.generateJson(prompt + "\n\n### INPUT:\n" + JSON.stringify(questionsInput), { 
                model: model,
                temperature: 0.1 
            });
            return response.data || {};
        } catch (e) {
            console.error("[MockAssessment] Listening Part A AI Batch failed:", e);
            return {};
        }
    }
}

module.exports = new MockAssessmentService();

