const GenerativeAIService = require('./GenerativeAIService');
const PronunciationService = require('./PronunciationService');
const admin = require('firebase-admin');

// Service responsible for handling the "Study Calibration" diagnostic logic
const PAPERS = require('./DiagnosticPapers');
const mathsService = require('./maths/MathsDiagnosticService');

// Service responsible for handling the "Study Calibration" diagnostic logic
class DiagnosticService {
    constructor() {
        // Assets are now dynamic
    }

    /**
     * Returns a random paper set (A-E) for the frontend
     */
    getAssets() {
        const keys = Object.keys(PAPERS);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const selectedPaper = PAPERS[randomKey];

        // Inject the paperId into the response so frontend knows what to render (and send back)
        return {
            paperId: randomKey,
            ...selectedPaper
        };
    }

    /**
     * Grades a single step of the diagnostic.
     * @param {string} step 'reading' | 'writing' | 'listening' | 'speaking'
     * @param {any} submission The student's answer(s) + paperId
     * @param {string} uid Optional student ID for tracking
     */
    async evaluateStep(step, submission, uid = null) {
        console.log(`[Diagnostic] Grading step: ${step}`);

        // Detect which paper set was used
        const paperId = submission.paperId || 'A'; // Default to A if missing (legacy safety)
        const ASSETS = PAPERS[paperId] || PAPERS['A'];

        let prompt = "";

        if (step === 'reading') {
            prompt = `
            Task: Grade a Reading Diagnostic (HKDSE Paper 1).
            Passage: "${ASSETS.reading.passage}"
            
            Student Answers:
            ${JSON.stringify(submission.answers)}
            
            Key Questions & Answers:
            ${JSON.stringify(ASSETS.reading.questions.map(q => ({ id: q.id, text: q.text, answer: q.answer, type: q.type })))}
            
            Official HKDSE Reading Grading Framework (Full 1-5** Spectrum):
            
            **Level 5 Grading (MUST Distinguish 5/5*/5**):**
            - **5****: Flawless. Uses "juxtaposition", "pragmatic", "nuanced" correctly. Insightful analysis. Perfect evidence.
            - **5***: Excellent. Strong vocabulary and precise evidence. Very few minor slips.
            - **5**: Strong. Good vocabulary and understanding. Some valid evidence.
            
            **Level 4**: Good clarity. Correct ideas. Standard vocabulary.
            **Level 3**: Basic understanding. Simple but correct.
            **Level 2**: Partial understanding. Misinterprets simple points. Broken English.
            **Level 1**: Random guessing. Irrelevant.

            CRITICAL SCORING RULES:
            1. **Sophisticated vocabulary** (e.g. "juxtaposition", "synonymous", "nuanced") AND deep analysis -> **Eligible for Level 5* or 5** **.
            2. **Perfect textual evidence but simple vocabulary** -> **CAPPED at Level 4**.
            3. **Simple but correct answers** -> **Level 3**.
            4. **Wrong/Partial answers** -> **Level 2 or 1**.
            5. **MANDATORY**: Even if the score is high, if the language lacks complexity, **CROP the grade_label to "4"**.
            6. **MANDATORY**: Score > 95 AND Sophisticated Language = "5**". Score > 85 AND Sophisticated Language = "5*".

            Instructions:
            1. Compare answers to Key.
            2. Evaluate Sophistication of language and Depth of analysis.
            3. **OUTPUT "grade_label" STRICTLY as**: "1", "2", "3", "4", "5", "5*", or "5**".

            Return JSON: { 
                "score": number (0-100), 
                "grade_label": "string (1, 2, 3, 4, 5, 5*, 5**)",
                "feedback": "Specific strengths/weaknesses with examples", 
                "level_estimate": number (1-5, use 5 for 5/5*/5**),
                "question_breakdown": [
                    { "id": "r1", "status": "correct|incorrect", "student_answer": "...", "correct_answer": "...", "feedback": "..." }
                ]
            }
            `;
        }
        else if (step === 'writing') {
            const genre = ASSETS.writing.topic.includes('Proposal') ? 'Proposal'
                : ASSETS.writing.topic.includes('Email') ? 'Formal Email'
                    : ASSETS.writing.topic.includes('Article') ? 'Article'
                        : ASSETS.writing.topic.includes('Letter') ? 'Letter'
                            : 'General Writing';

            prompt = `
            Task: Grade a short Writing Sample (HKDSE Paper 2 Part A).
            Genre: ${genre}
            Topic: ${ASSETS.writing.topic}
            Prompt: ${ASSETS.writing.prompt}
            
            Student Text: "${submission.text}"
            
            Official HKDSE Writing Grading Framework (Full 1-5** Spectrum):
            
            **Level 5 Grading (MUST Distinguish 5/5*/5**):**
            - **5****: Native-like. Highly persuasive. Complex structures (inversion/conditionals). Precise vocabulary.
            - **5***: Excellent coherence. Strong vocabulary. Engaging.
            - **5**: Varied sentences. Good vocabulary. Clear organization.
            
            **Level 4**: Clear. Grammatically correct simple/compound sentences. Standard vocabulary.
            **Level 3**: Basic (S-V-O) sentences. **CORRECT grammar** but simple. Repetitive.
            **Level 2**: **FREQUENT ERRORS**. Fragmented sentences. Impedes meaning.
            **Level 1**: Unintelligible. Isolated words.

             CRITICAL SCORING RULES:
            1. **Repetitive S-V-O sentences (e.g. "I am happy. I like school.")** -> **MUST be Level 3** (Even if 100% correct).
            2. **Fragmented/Broken sentences** -> **Level 2**.
            3. **Sophisticated structures (inversion, relative clauses, conditional type 3)** -> **Level 5/5*/5** **.
            4. **MANDATORY**: If the text is purely simple sentences, **CROP the grade_label to "3"**.
            5. **MANDATORY**: For Level 5** (21/21), the student must write like a native-level writer.
            
            Instructions:
            1. Check Sentence Structure (Simple vs Complex).
            2. Check Grammar (Correct? Error-free? Frequent errors?).
            3. **OUTPUT "grade_label" STRICTLY as**: "1", "2", "3", "4", "5", "5*", or "5**".
            4. **Generate a Level 5** Model Rewrite**: Rewrite the student's text to be perfect.
            5. **List 3 specific improvements**.
            
            Return JSON: { 
                "score": number (0-21), 
                "grade_label": "string (1, 2, 3, 4, 5, 5*, 5**)",
                "feedback": "Specific comments on sentence variety, vocabulary, coherence, and tone", 
                "level_estimate": number (1-5, use 5 for 5/5*/5**),
                "model_rewrite": "Full text of the Level 5** version",
                "improvement_tips": ["Tip 1", "Tip 2", "Tip 3"]
            }
            `;
        }
        else if (step === 'maths') {
            prompt = await mathsService.gradeMaths(submission);
        }
        else if (step === 'listening') {
            prompt = `
            Task: Grade Listening Diagnostic (HKDSE Paper 3).
            Script: "${ASSETS.listening.script}"
            
            Student Answers:
            ${JSON.stringify(submission.answers)}
            
            Questions & Answer Key:
            ${JSON.stringify(ASSETS.listening.questions.map(q => ({ id: q.id, text: q.text, answer: q.answer })))}
            
            Official HKDSE Listening Grading Framework (Full 1-5** Spectrum):
            
            **Level 5/5* /5** (Superior Performance)**:
            - **5****: Perfect transcription, subtle tone detection (irony/humor), synthesizes complex info flawlessly.
            - **5***: Captures almost all details, understands stance/attitude, accurate grammar.
            - **5**: Captures specific names/dates, understands general feeling.
            
            **Level 4** (Good Performance):
            - Understands main points and most details.
            - Identifies general attitude clearly.
            - Brief errors in spelling/grammar but understandable.
            
            **Level 3** (Adequate Performance):
            - Grasps basic info / main topic.
            - Misses specific names or numbers.
            - Simple language with errors.

            **Level 2** (Basic/Weak Performance):
            - Catches isolated words only.
            - Misses context completely.
            - Frequent misunderstandings of basic questions.

            **Level 1** (Unclassified):
            - Random guessing or blank answers.
            - Completely unrelated to audio script.

            CRITICAL GRADING RULES:
            1. **Attitude/Tone/Implicit Detail identified** -> **Eligible for Level 5, 5* or 5** **.
            2. **Factual accuracy high but misses nuance** -> **CAPPED at Level 4**.
            3. **Grasps main topic only** -> **Level 3**.
            4. **Keywords isolated** -> **Level 2 or 1**.
            5. **MANDATORY**: Even if score is near 100, if the student doesn't show understanding of speaker attitude, **CROP to "4"**.
            6. **High Grade Labels**: Score > 95 AND Tone Analysis = "5**". Score > 85 = "5*".

            Instructions:
            1. Check accuracy of factual details.
            2. Evaluate tone/attitude recognition.
            3. **Assign a specific DSE Grade Label**: "1", "2", "3", "4", "5", "5*", or "5**".
            4. **QUESTION-BY-QUESTION BREAKDOWN**: For each question, provide a structured analysis.
            
            Return ONLY a valid JSON object (no markdown code blocks):
            { 
                "score": 0-100, 
                "grade_label": "5**",
                "feedback": "Overall high-level summary of listening performance.", 
                "level_estimate": 1-5,
                "question_breakdown": [
                    {
                        "id": "string",
                        "status": "correct" | "incorrect" | "partial",
                        "question": "The question text",
                        "student_answer": "What the student wrote",
                        "correct_answer": "The expected answer",
                        "feedback": "Brief explanation"
                    }
                ]
            }
            `;
        }
        else if (step === 'speaking') {
            // Handle Real Audio Transcription if provided
            if (submission.audio) {
                try {
                    console.log(`[Diagnostic] Transcribing real audio for speaking step...`);
                    const analysis = await PronunciationService.analyzePronunciation(submission.audio, submission.audioType || 'audio/webm');
                    if (analysis.transcript) {
                        submission.transcript = analysis.transcript;
                        submission.pronunciation = analysis; // Store for feedback
                    }
                } catch (err) {
                    console.error("[Diagnostic] Transcription failed:", err);
                }
            }

            const isPlaceholder = submission.transcript && submission.transcript.includes("[Simulated Speech...]");
            const isTooShort = !submission.transcript ||
                submission.duration < 10 ||
                (submission.transcript && submission.transcript.includes("User spoke about") && submission.duration < 15);

            if (isPlaceholder || isTooShort) {
                return {
                    score: 0,
                    grade_label: "1",
                    feedback: isPlaceholder
                        ? "Simulation detected. Please record a real response to get an accurate grade."
                        : "No meaningful speech detected. Your recording was either too short (< 15s) or silent. A valid HKDSE Speaking response requires at least 1-2 minutes of continuous speech.",
                    level_estimate: 1,
                    analysis: {
                        pronunciation_accent: "N/A - Response too short or invalid for analysis.",
                        vocabulary_usage: "N/A - Response too short or invalid for analysis.",
                        structure_content: "N/A - Response too short or invalid for analysis."
                    }
                };
            }

            prompt = `
            Task: Grade Speaking Diagnostic (HKDSE Paper 4).
            Topic: ${submission.topic || ASSETS.speaking.topics?.[0] || 'General Discussion'}
            
            Student Transcript/Recording Summary: "${submission.transcript}"
            ${submission.pronunciation ? `Pronunciation Data: ${JSON.stringify(submission.pronunciation.wordDetails.slice(0, 50))}` : ''}
            
            Official HKDSE Speaking Grading Framework (Full 1-5** Spectrum):
            
            **Level 5/5* /5** (Superior Performance)**:
            - **5****: Charismatic delivery, sophisticated language, complex ideas, effortless fluency.
            - **5***: Insightful contributions, strong vocabulary, facilitates discussion effectively.
            - **5**: Sustained conversation, varied patterns, clear pronunciation, active engagement.
            
            **Level 4** (Good Performance):
            - Maintains interaction adequately.
            - Accurate but less varied language.
            - Generally clear pronunciation.
            
            **Level 3** (Adequate Performance):
            - Basic communication achieved.
            - Simple vocabulary/structures.
            - Some pronunciation issues or hesitation.

            **Level 2** (Basic/Weak Performance):
            - Uses specific simple phrases only / memorized chunks.
            - Very hesitant; frequent silence.
            - Unintelligible parts.

            **Level 1** (Unclassified):
            - Isolated words only.
            - Does not respond to prompt.
            - Completely unintelligible.

            CRITICAL GRADING RULES:
            1. **Varied vocabulary & complex sentences** → **Level 5 or higher**.
            2. **Natural flow** → **Level 4 or higher**.
            3. **Memorized chunks/Hesitant** → **Level 2**.
            4. **Isolated words** → **Level 1**.

            Instructions:
            1. Evaluate Vocabulary, Fluency, and Engagement.
            2. **Assign a specific DSE Grade Label**: "1", "2", "3", "4", "5", "5*", or "5**".
            3. Analyze **Pronunciation/Accent** (Use the provided Word Confidence Data if available to assess clarity and phonetics; otherwise infer from transcript).
            4. Analyze **Structure** and **Usage**.
            5. Provide an **Improved Transcript** (how a native speaker would say it).
            
            Return ONLY a valid JSON object (no markdown code blocks):
            { 
                "score": 0-100, 
                "grade_label": "5**",
                "feedback": "General feedback", 
                "level_estimate": 1-5,
                "improved_transcript": "Native-speaker version",
                "analysis": {
                    "pronunciation_accent": "Comments",
                    "structure_content": "Comments",
                    "vocabulary_usage": "Comments"
                }
            }
            
            STRICT RULE: If the transcript is "[Simulated Speech...]" or generic "User spoke for X seconds", DO NOT give a high grade. You MUST return Grade 1 and score 0. Hallucinating high-level feedback for placeholder text is strictly forbidden.
            `;
        }

        try {
            const result = await GenerativeAIService.generateContent(prompt, {
                model: "gemini-2.5-pro",
                generationConfig: { responseMimeType: "application/json" }
            });
            const response = result.response;

            // Log Usage
            if (response && response.usageMetadata) {
                const TokenService = require('./TokenService');
                TokenService.logUsage(uid || 'system', 'diagnostic_evaluate', response.usageMetadata);
            }

            const text = response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            let json = {};

            try {
                if (jsonMatch) {
                    json = JSON.parse(jsonMatch[0]);
                } else {
                    json = JSON.parse(text);
                }
            } catch (parseErr) {
                console.error(`[Diagnostic] Failed to parse JSON for step ${step}. Text:`, text);
                throw new Error("Invalid response format from AI");
            }

            // Inject the transcript back into the response if it was transcribed, so frontend can display it
            if (step === 'speaking' && submission.audio) {
                json.transcript = submission.transcript;
            }

            // POST-PROCESSING: Inject Micro-Skills Tags from Assets into the Result
            if ((step === 'reading' || step === 'listening') && json.question_breakdown && Array.isArray(json.question_breakdown)) {
                json.question_breakdown = json.question_breakdown.map(qResult => {
                    const originalQ = ASSETS[step].questions.find(q => q.id === qResult.id);
                    return {
                        ...qResult,
                        skills: originalQ ? originalQ.skills : [] // Attach the hardcoded skills
                    };
                });
            }

            return json;
        } catch (error) {
            console.error("Diagnostic Step Grading failed:", error);
            throw error; // Let the route handler catch it and return 500
        }
    }

    /**
     * Aggregates results and generates the final profile.
     */
    async finalizeDiagnostic(uid, fullResults) {
        const MicroSkillAssessor = require('./MicroSkillAssessor');

        // Calculate average level representing ALL papers (skipped = Level 1)
        const paperResults = ['reading', 'writing', 'listening', 'speaking']
            .map(key => fullResults[key]?.level_estimate || 1);

        const avgRawLevel = paperResults.reduce((a, b) => a + b, 0) / 4;
        const overallDseLevel = MicroSkillAssessor.convertToDSELevel(avgRawLevel);

        const skippedPapers = ['reading', 'writing', 'listening', 'speaking']
            .filter(key => !fullResults[key] || fullResults[key].level_estimate === undefined);

        let microSkills = {};
        let weaknessPriority = [];

        // Generate comprehensive profile prompt
        const prompt = `
        Task: Generate a Diagnostic Profile & Weekly Quest Plan for a HKDSE English Student.
        
        Results:
        - Reading: ${fullResults.reading ? `Level ${fullResults.reading.level_estimate} (Feedback: ${fullResults.reading.feedback})` : 'SKIPPED'}
        - Writing: ${fullResults.writing ? `Level ${fullResults.writing.level_estimate} (Feedback: ${fullResults.writing.feedback})` : 'SKIPPED'}
        - Listening: ${fullResults.listening ? `Level ${fullResults.listening.level_estimate} (Feedback: ${fullResults.listening.feedback})` : 'SKIPPED'}
        - Speaking: ${fullResults.speaking ? `Level ${fullResults.speaking.level_estimate} (Feedback: ${fullResults.speaking.feedback})` : 'SKIPPED'}
        
        System Note: ${skippedPapers.length > 0 ? `The student has SKIPPED sections: ${skippedPapers.join(', ')}. Their overall level MUST reflect this lack of completion (skipped = Level 1). Acknowledge their current performance but be clear that their overall grade is based on total test completion and correctness.` : 'All sections completed.'}
        
        Instructions:
        1. Determine an "Archetype" name (e.g. "Theory Master", "Fearless Speaker", "Grammar Safe Player", "Rising Star").
        2. List 3 key Strengths and 3 Weaknesses.
        3. Create a **"Weekly Quest Plan"** (4 actionable targets for ONE WEEK). 
           - **terminology**: Use "Practice" terminology exclusively (e.g., "Practice: Reading Inference", "Practice: Formal Email Tone").
           - **Style**: Strictly SINGLE ACTION. Avoid counts (e.g. "Complete 3...") or durations.
           - **Speaking**: NEVER specify "Part A" or "Part B". Just say "Speaking practice" or "Interactive speaking exercise".
           - Tasks should be extremely concise (max 5-6 words) to fit on one line.
        4. Identify 2-4 "Critical Areas" for immediate improvement.
        
        Return JSON STRICTLY:
        {
            "archetype": "string",
            "overall_level": "${overallDseLevel}",
            "strengths": ["s1", "s2", "s3"],
            "weaknesses": ["w1", "w2", "w3"],
            "one_month_plan": ["Practice: ...", "Practice: ...", "Practice: ...", "Practice: ..."],
            "critical_areas": ["area1", "area2"],
            "xp_earned": 500
        }
        `;

        // Generate micro-skills and comprehensive profile in parallel to save time
        try {
            // Timeout Promise
            const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("Analysis Timeout")), ms));

            const [assessedSkills, profileResult] = await Promise.race([
                Promise.all([
                    MicroSkillAssessor.assessAllSkills({
                        reading: fullResults.reading,
                        writing: fullResults.writing,
                        listening: fullResults.listening,
                        speaking: fullResults.speaking
                    }),
                    GenerativeAIService.generateContent(prompt, {
                        model: "gemini-2.5-pro",
                        generationConfig: { responseMimeType: "application/json" }
                    })
                ]),
                timeout(90000) // 90s Timeout (Increased for reliability)
            ]);

            microSkills = assessedSkills;
            weaknessPriority = MicroSkillAssessor.prioritizeWeaknesses(microSkills);

            const response = profileResult.response;
            // Log Usage for profile generation
            if (response && response.usageMetadata) {
                const TokenService = require('./TokenService');
                TokenService.logUsage(uid || 'system', 'diagnostic_finalize', response.usageMetadata);
            }

            const text = response.text();

            // Robust JSON extraction (handles markdown blocks from newer models)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            let profile = {};

            if (jsonMatch) {
                try {
                    profile = JSON.parse(jsonMatch[0]);
                } catch (jsonErr) {
                    console.error("[Diagnostic] JSON Parse Failed (Match):", jsonErr);
                }
            }

            if (Object.keys(profile).length === 0) {
                try {
                    profile = JSON.parse(text);
                } catch (fallbackErr) {
                    console.error("[Diagnostic] JSON Parse Failed (Fallback):", fallbackErr);
                    // Critical Fallback: Don't crash, return minimal valid profile
                    profile = {
                        archetype: "Resilient Learner",
                        overall_level: overallDseLevel,
                        strengths: ["Persistence"],
                        weaknesses: ["Structure"],
                        one_month_plan: ["Practice: Reading", "Practice: Vocabulary"]
                    };
                }
            }

            // Ensure critical fields exist with safe defaults if AI missed them
            profile.archetype = profile.archetype || "Ace It Student";
            profile.overall_level = profile.overall_level || overallDseLevel;
            profile.strengths = profile.strengths || ["Grammar Focus", "Reading Speed", "Vocabulary"];
            profile.weaknesses = profile.weaknesses || ["Complex Inferences", "Argument Development", "Advanced Collocations"];
            profile.one_month_plan = profile.one_month_plan || ["Practice: Reading", "Practice: Writing"];

            // Format roadmap for legacy compatibility if needed, but we start using one_month_plan
            profile.roadmap = profile.one_month_plan;

            // NEW: Add micro-skill data to profile
            profile.microSkills = microSkills;
            profile.weaknessPriority = weaknessPriority.slice(0, 10); // Top 10 weaknesses
            profile.timestamp = new Date().toISOString();
            profile.version = 2; // Enhanced skill map version
            profile.raw_results = fullResults; // PERSIST FULL DATA FOR SKILL MAPPING

            return profile;
        } catch (error) {
            console.error("Profile generation failed:", error);
            throw error; // Let the route handler catch it and return 500
        }
    }
}

module.exports = new DiagnosticService();
