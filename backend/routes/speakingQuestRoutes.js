const express = require('express');
const router = express.Router();
const SpeakingQuestService = require('../services/SpeakingQuestService');
const { deliveryGradingAgent, flowGradingAgent, interactionGradingAgent } = require('../prompts/speakingGradingAgent');
const speakingFlowAgent = require('../prompts/speakingFlowAgent');
const speakingAgent = require('../prompts/speakingAgent');
const GenerativeAIService = require('../services/GenerativeAIService');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const UserProfileService = require('../services/UserProfileService');

// Each router owns its sub-paths (e.g. /chat, /history, /stats)

/**
 * @route   GET /api/speaking/drills/:pillar
 * @desc    Fetch pre-written drills for a specific pillar
 */
router.get('/drills/:pillar', async (req, res) => {
    try {
        const { pillar } = req.params;
        const fs = require('fs');
        const path = require('path');
        const drillsPath = path.join(__dirname, '../data/speaking_drills.json');

        if (!fs.existsSync(drillsPath)) {
            return res.status(404).json({ error: 'Drills data not found' });
        }

        const data = JSON.parse(fs.readFileSync(drillsPath, 'utf8'));
        const pillarData = data[pillar];

        if (!pillarData) {
            return res.status(404).json({ error: `No drills found for pillar: ${pillar}` });
        }

        res.json(pillarData);
    } catch (error) {
        console.error('[Speaking Drills] Fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch drills' });
    }
});

/**
 * @route   GET /api/speaking/quest/generate
 * @desc    Generate a speaking quest for a specific module
 * @query   module (delivery|flow|interaction), level (1-5), uid
 */
router.get('/quest/generate', async (req, res) => {
    try {
        const { module, level = '3', uid = 'guest', focus } = req.query;

        if (!module || !['delivery', 'flow', 'interaction', 'language_patterns', 'ideas_organisation'].includes(module)) {
            return res.status(400).json({ error: 'Invalid module. Must be delivery, flow, interaction, language_patterns, or ideas_organisation.' });
        }

        const quest = await SpeakingQuestService.generateQuest(uid, module, parseInt(level), focus);

        res.json(quest);
    } catch (error) {
        console.error('[Speaking Quest] Generation error:', error);
        res.status(500).json({ error: 'Failed to generate quest', details: error.message });
    }
});

/**
 * @route   POST /api/speaking/quest/submit
 * @desc    Submit a speaking quest for grading (Delivery, Flow, or Interaction)
 */
router.post('/quest/submit', upload.single('audio'), async (req, res) => {
    try {
        const { module, quest_id, master_script, level, uid, focus, messages, power_words } = req.body;
        const audioFile = req.file;

        let prompt = "";
        let mockTranscript = "";
        let transcribedText = "";
        let historyToGrade = [];

        if (module === 'delivery') {
            if (!audioFile) return res.status(400).json({ error: 'No audio file provided for delivery quest' });

            const PronunciationService = require('../services/PronunciationService');

            // Real Audio Analysis
            console.log(`[Speaking Delivery] Analyzing audio for ${uid}...`);
            const analysis = await PronunciationService.analyzePronunciation(audioFile.buffer.toString('base64'), audioFile.mimetype);

            mockTranscript = analysis.transcript || "";
            const wordsSpoken = mockTranscript.split(/\s+/).filter(w => w.length > 0).length;

            // SILENCE / MINIMAL SPEECH CHECK
            if (wordsSpoken < 3) {
                console.warn(`[Speaking Delivery] Minimal speech detected (${wordsSpoken} words). Awarding zero marks.`);
                return res.json({
                    scores: { pronunciation: 0, intonation: 0, pacing: 0, grammar: 0, total: 0 },
                    feedback: {
                        summary: "Incomplete recording: Little or no speech was detected.",
                        rhythm_score: "N/A - Insufficient audio for rhythmic analysis.",
                        improvement_advice: "Please record yourself reading the full passage to receive a detailed assessment. Ensure your microphone is working correctly."
                    },
                    transcript: mockTranscript,
                    xp_awarded: 0
                });
            }

            const confidenceScore = Math.round(analysis.overallConfidence * 100);
            const wordConfidenceData = (analysis.wordDetails || []).map(w => `${w.word}: ${Math.round(w.confidence * 100)}%`).join(', ');

            prompt = deliveryGradingAgent
                .replace('{MASTER_SCRIPT}', master_script)
                .replace('{STUDENT_TRANSCRIPT}', mockTranscript)
                .replace('{WAVEFORM_DATA}', `Overall Confidence: ${confidenceScore}%. Details: ${wordConfidenceData}`)
                .replace('{STUDENT_LEVEL}', level)
                .replace('{FOCUS_AREA}', focus || 'General Delivery');
        } else if (module === 'flow') {
            const history = typeof messages === 'string' ? JSON.parse(messages) : (messages || []);
            const studentMessages = history.filter(m => m.role === 'user');

            if (studentMessages.length === 0) {
                console.warn(`[Speaking Flow] Empty submission for ${uid}. Returning zero scores.`);
                return res.json({
                    scores: { spontaneity: 0, confidence: 0, vocabulary: 0, latency_score: 0, total: 0 },
                    feedback: {
                        summary: "The interview was ended before you started speaking.",
                        improvement_advice: "Please participate in the interview by responding to the AI's questions to receive an assessment."
                    }
                });
            }

            const aiQuestions = history.filter(m => m.role === 'ai').map(m => m.text).join('\n');
            const studentResponses = studentMessages.map(m => m.text).join('\n');
            const latencyData = history.map(m => `Latency: ${m.latency || 0}s`).join(', ');
            const usedWords = power_words ? (typeof power_words === 'string' ? JSON.parse(power_words).join(', ') : power_words.join(', ')) : "None";

            prompt = flowGradingAgent
                .replace('{AI_PERSONA}', 'Interviewer')
                .replace('{SCENARIO}', 'Interview')
                .replace('{TOPIC}', 'General Flow')
                .replace('{LEVEL}', level)
                .replace('{AI_QUESTIONS}', aiQuestions)
                .replace('{STUDENT_RESPONSES}', studentResponses)
                .replace('{LATENCY_DATA}', latencyData)
                .replace('{POWER_WORDS_DETECTED}', usedWords);
        } else if (module === 'interaction' || module === 'strategies' || module === 'delivery') {
            const userLabel = (module === 'interaction' || module === 'strategies' || req.body.mode === 'lab') ? 'Student' : 'Candidate_D';
            const rawMessages = messages || req.body.transcript || [];
            const history = Array.isArray(rawMessages) ? rawMessages : (typeof rawMessages === 'string' ? JSON.parse(rawMessages) : []);
            const studentMessages = history.filter(m =>
                m.speaker === 'Student' ||
                m.role === 'user' ||
                m.speaker === 'Jack Tam' ||
                m.role === 'Student' ||
                m.speaker === userLabel
            );

            // transcription of the latest recorded response
            if (audioFile) {
                const PronunciationService = require('../services/PronunciationService');
                const analysis = await PronunciationService.analyzePronunciation(audioFile.buffer.toString('base64'), audioFile.mimetype);
                transcribedText = analysis.transcript;
                console.log(`[Interaction Submission] Transcribed student response: ${transcribedText}`);
            }

            if (!transcribedText && studentMessages.length === 0) {
                return res.json({
                    scores: { facilitation: 0, listening: 0, turn_taking: 0, bridging: 0, total: 0 },
                    feedback: {
                        summary: "Incomplete session: No student interaction detected.",
                        improvement_advice: "Join the conversation to earn marks on facilitation and active listening!"
                    }
                });
            }

            // Inject the transcribed text into the history if it was a Lab turn
            historyToGrade = [...history];
            if (transcribedText) {
                // Find the latest user message to update its content from placeholder to real text
                const lastUserIdx = [...historyToGrade].reverse().findIndex(m => m.speaker === 'Student' || m.role === 'user' || m.speaker === userLabel);
                if (lastUserIdx !== -1) {
                    const actualIdx = (historyToGrade.length - 1) - lastUserIdx;
                    historyToGrade[actualIdx] = { ...historyToGrade[actualIdx], text: transcribedText };
                }
            }

            const historyText = historyToGrade.map(m => `${m.speaker || m.role || userLabel}: ${m.text}`).join('\n');

            prompt = interactionGradingAgent
                .replace(/{TOPIC}/g, master_script || 'General Discussion')
                .replace(/{HISTORY}/g, historyText)
                .replace(/{LEVEL}/g, level || '3')
                .replace(/{USER_LABEL}/g, userLabel)
                .replace(/{FOCUS_AREA}/g, focus || 'General Interaction');
        } else if (module === 'language_patterns') {
            const history = typeof messages === 'string' ? JSON.parse(messages) : (messages || []);
            const practiceResults = req.body.practice_results ? (typeof req.body.practice_results === 'string' ? JSON.parse(req.body.practice_results) : req.body.practice_results) : [];
            const studentResponses = history.filter(m => m.role === 'user').map(m => m.text).join('\n') || "N/A";
            const { languagePatternsGradingAgent } = require('../prompts/speakingGradingAgent');

            // Format results for AI
            const resultsText = practiceResults.length > 0
                ? practiceResults.map((r, i) => {
                    // Robust lookup for transcript across different possible structures
                    const msg = history[i];
                    const studentText = msg?.text || msg?.content || msg?.transcript || "No transcript available";
                    
                    return `[SENTENCE ${i + 1}]
- [TARGET]: ${r.sentence}
- [STUDENT ACTUAL]: ${studentText}
- [POWER WORD]: ${r.target_word}`;
                }).join('\n\n')
                : `Student Direct Responses:\n${studentResponses}`;

            console.log(`[Speaking Language] Final Assessment Data constructed for ${practiceResults.length} sentences.`);
            
            prompt = languagePatternsGradingAgent
                .replace(/{PRACTICE_RESULTS}/g, resultsText)
                .replace(/{LEVEL}/g, level || '3');
        } else if (module === 'ideas_organisation') {
            const history = typeof messages === 'string' ? JSON.parse(messages) : (messages || []);
            // Robust extractor: handle 'user', 'Student', or the current user label
            const userLabel = req.body.user_label || 'Student';
            const studentResponses = history
                .filter(m => m.role === 'user' || m.speaker === 'Student' || m.speaker === userLabel)
                .map(m => m.text)
                .join('\n') || "No spoken responses recorded.";

            const organisationData = req.body.organisation_data || "N/A";
            const { ideasOrganisationGradingAgent } = require('../prompts/speakingGradingAgent');

            prompt = ideasOrganisationGradingAgent
                .replace(/{STUDENT_RESPONSES}/g, studentResponses)
                .replace(/{ORGANISATION_DATA}/g, organisationData);
        } else {
            return res.status(400).json({ error: 'Invalid or unsupported module for submission' });
        }

        const GamificationService = require('../services/GamificationService');

        console.log(`[Speaking Quest] Grading ${module} Quest ${quest_id} for ${uid}`);

        let result;
        try {
            console.log(`[SpeakingQuest] Prompt Construction Source - Level: ${level}, Focus: ${focus}`);
            console.log(`[SpeakingQuest] Final Prompt for AI:`, prompt.substring(0, 500) + '...');

            result = await GenerativeAIService.generateJson(prompt, {
                generationConfig: { temperature: 0.3 }
            });

            console.log(`[SpeakingQuest] Raw Response Object Received:`, JSON.stringify(result.data, null, 2));
        } catch (aiError) {
            console.error(`[Speaking ${module}] AI Grading failed:`, aiError);
            result = {
                data: {
                    scores: { 
                        total: 16, 
                        development: 4,
                        relevance: 4,
                        signposting: 4,
                        organisation: 4,
                        pronunciation: 4, 
                        intonation: 4, 
                        vocabulary: 4, 
                        grammar_range: 4,
                        grammar: 4 
                    },
                    feedback: { 
                        summary: "AI analysis is currently congested, but your effort is noted.", 
                        peel_analysis: "Structure your points with clear Point-Evidence-Explanation-Link sequences to boost coherence.",
                        improvement_advice: "Focus on adding one concrete example to every main point you make in your next session." 
                    }
                }
            };
        }

        // Standardize result structure (ensure result.scores exists)
        const finalResult = result.data || result;
        console.log(`[SpeakingQuest] Standardized Final Result:`, JSON.stringify(finalResult, null, 2));

        // PERSIST RESULT FOR HISTORICAL REVIEW
        let resultId = null;
        if (uid && uid !== 'guest') {
            resultId = await UserProfileService.saveQuestResult(uid, {
                module,
                quest_id,
                scores: finalResult.scores,
                feedback: finalResult.feedback,
                word_analysis: finalResult.word_analysis || [],
                transcript: historyToGrade || [],
                level: parseInt(level),
                focus,
                subject: 'english',
                paper: 'Speaking',
                missionName: req.body.missionName || `${module.charAt(0).toUpperCase() + module.slice(1)} Quest`
            });
        }

        // AWARD XP
        let xpResult = { earned: 0 };
        if (finalResult.scores && finalResult.scores.total > 0 && uid && uid !== 'guest') {
            // New standardized XP logic
            let baseXP = 150; // Default (Interaction/Group Discussion)
            
            // Scaled Criteria (everything except interaction)
            if (module !== 'interaction') {
                const GamificationService = require('../services/GamificationService');
                baseXP = GamificationService.getTieredXP(level || '4');
            }

            let questBonus = 0;
            // Handle Weekly Quest award
            if (req.body.isWeeklyQuest) {
                const weeklyResult = await GamificationService.awardWeeklyQuestCompletion(uid);
                if (weeklyResult.success) {
                    questBonus = weeklyResult.earned;
                    baseXP = 250; // Set base to weekly standard
                }
            }

            const scoreRatio = Math.min(finalResult.scores.total / 28, 1);
            const rewardAmount = Math.round(scoreRatio * baseXP);

            xpResult = await GamificationService.awardXP(uid, rewardAmount, 'speaking', {
                title: req.body.missionName || `${module.charAt(0).toUpperCase() + module.slice(1)} Practice`,
                score: `${finalResult.scores.total}/28`,
                subject: 'english',
                paper: 'Speaking',
                questName: req.body.missionName || `${module.charAt(0).toUpperCase() + module.slice(1)} Quest`,
                resultId: resultId
            }) || { earned: 0 };
            
            xpResult.earned += questBonus;
        }

        // UPDATE MICRO-SKILL MASTERY
        if (finalResult.scores && uid && uid !== 'guest') {
            const masteryScore = (finalResult.scores.total / 28) * 100;
            const skillMappings = {
                'delivery': ['speaking_delivery'],
                'flow': ['speaking_language', 'speaking_organization'],
                'interaction': ['speaking_pronunciationClarity', 'speaking_activeListening', 'speaking_vocabularyInSpeech', 'speaking_organisation'],
                'language_patterns': ['speaking_vocabularyInSpeech', 'speaking_grammaticalAccuracy'],
                'ideas_organisation': ['speaking_logicalDevelopment', 'speaking_organisation']
            };

            const targetSkills = skillMappings[module] || [];
            const skillPromises = targetSkills.map(skillId =>
                UserProfileService.updateMicroSkillLevel(uid, 'english', skillId, masteryScore, {
                    type: 'Quest',
                    difficulty: parseInt(level) || 3
                })
            );
            await Promise.all(skillPromises);
            console.log(`[SpeakingRoutes] Persisted mastery for skills: ${targetSkills.join(', ')}`);
        }

        res.json({
            scores: finalResult.scores,
            feedback: finalResult.feedback,
            word_analysis: finalResult.word_analysis || [],
            transcript: historyToGrade || [],
            xp_awarded: xpResult?.earned || 0,
            xp_breakdown: xpResult?.breakdown
        });
    } catch (error) {
        console.error('[Speaking Quest] Submission error:', error);
        res.status(500).json({ error: 'Failed to grade submission', details: error.message });
    }
});

/**
 * @route   POST /api/speaking/flow/respond
 * @desc    Get AI interviewer response for Flow module
 */
router.post('/flow/respond', async (req, res) => {
    try {
        const { quest_id, history = [], user_response, level, uid, focus } = req.body;

        // Build conversation context
        const conversationHistory = history.map(msg =>
            `${msg.role === 'ai' ? 'Interviewer' : 'Student'}: ${msg.text}`
        ).join('\n');

        const prompt = speakingFlowAgent
            .replace('{AI_PERSONA}', 'Interviewer')
            .replace('{SCENARIO}', 'Interview')
            .replace('{TOPIC}', 'General Flow')
            .replace('{LEVEL}', level)
            .replace('{POWER_WORDS}', 'N/A')
                .replace('{HISTORY}', conversationHistory)
                .replace('{LAST_RESPONSE}', user_response);

        console.log(`[Speaking Flow] Generating response for ${uid}`);

        const result = await GenerativeAIService.generateContent(prompt, {
            generationConfig: {
                maxOutputTokens: 250,
                temperature: 0.7 // Phase 48: Increased from 0.2 to reduce robotic repetition
            }
        });

        const parsedResult = typeof result.text === 'string' ? JSON.parse(result.text) : (result.data || result);

        const topicFallback = focus || topic || "this topic";
        res.json({
            feedback_text: parsedResult.feedback_text || "Good attempt. Try to elaborate more using the mind map.",
            question: parsedResult.question || `Could you elaborate on how your point relates to ${topicFallback}?`,
            structural_hints: parsedResult.structural_hints || [],
            is_follow_up: parsedResult.is_follow_up || false
        });
    } catch (error) {
        console.error('[Speaking Flow] Response error:', error);
        res.status(500).json({ error: 'Failed to generate response', details: error.message });
    }
});

/**
 * @route   POST /api/speaking/interaction/turn
 * @desc    Get AI candidate response for Interaction module
 */
router.post('/interaction/turn', upload.single('audio'), async (req, res) => {
    try {
        const { history: historyStr, current_speaker, topic, level, uid, focus, user_transcript: clientTranscript } = req.body;
        const history = typeof historyStr === 'string' ? JSON.parse(historyStr) : (historyStr || []);
        const audioFile = req.file;

        // Build conversation history string
        const userLabel = req.body.mode === 'lab' ? 'Student' : 'Candidate_D';

        let conversationHistory = history.map(turn => {
            const speakerLabel = (turn.speaker === 'Student' || turn.role === 'user') ? userLabel : (turn.speaker || 'Candidate_A').replace(' ', '_');
            return `${speakerLabel}: ${turn.text}`;
        }).join('\n');
        
        // Ensure the latest transcript is in the history string for the AI to see (De-duplication logic)
        if (clientTranscript && !conversationHistory.toLowerCase().includes(clientTranscript.toLowerCase().substring(0, 15))) {
            conversationHistory += `\n${userLabel}: ${clientTranscript}`;
        }

        // Instruction to ensure JSON adherence (Reasoning length now handled by prompt template)
        const formatMandate = `\nEnsure your output is a single, valid JSON object with NO extra text. Escape all newlines in the "content" field.`;

        let prompt = speakingAgent
            .replace(/{TOPIC}/g, topic)
            .replace(/{HISTORY}/g, conversationHistory)
            .replace(/{MY_IDENTITY}/g, current_speaker || 'Candidate_A')
            .replace(/{USER_LABEL}/g, userLabel)
            .replace(/{LEVEL}/g, level || '3');

        // Inject format mandate at the end of the context
        prompt += formatMandate;

        // Phase 48: Anti-Hallucination - If history is empty OR student hasn't spoken yet, forbid referencing them
        const hasStudentSpoken = history.some(m => 
            m.role === 'user' || m.role === 'Student' || m.speaker === 'Student' || m.speaker === 'Candidate_D' || m.speaker === userLabel
        );

        if (!hasStudentSpoken) {
            prompt += "\nIMPORTANT: Candidate D (the student) has NOT spoken yet. Do NOT mention, quote, or agree with Candidate D. Focus on your own points and engaging with other candidates.";
        } else if (!conversationHistory || conversationHistory.trim().length === 0) {
            prompt += "\nIMPORTANT: This is the very beginning of the discussion. Do NOT reference what other candidates said yet. Start by stating your own initial perspective on the topic.";
        }

        // Voice mapping based on role
        const voiceMap = {
            'Candidate_A': 'Achird', // Annie: Sophisticated Female
            'Candidate_B': 'Puck',   // Ben: Competent Male
            'Candidate_C': 'Charon', // Charlie: Hesitant Male
            'Examiner': 'Achird'     // Miss Janie
        };
        const voiceName = voiceMap[current_speaker] || 'Achird';

        const speechConfig = {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } }
        };

        const genAIConfig = {
            model: 'ace-it-flash',
            audioOutput: req.body.audioOutput === true || req.body.audioOutput === 'true', // Hard Boolean Check
            speechConfig: speechConfig,
            generationConfig: { 
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        };

        let result;
        // FAST PATH: If client provided transcription, use it to bypass or speed up multimodal STT
        if (clientTranscript) {
             console.log(`[Interaction Turn] Fast Path Triggered. Client provided transcript: ${clientTranscript.substring(0, 30)}...`);
             const fastPrompt = `${prompt}\n\n[USER JUST SAID]: ${clientTranscript}\n\nREPLY IN JSON FORMAT.`;
             
             if (audioFile) {
                const parts = [
                    { text: fastPrompt },
                    {
                        inlineData: {
                            data: audioFile.buffer.toString('base64'),
                            mimeType: audioFile.mimetype
                        }
                    }
                ];
                result = await GenerativeAIService.generateJson(parts, genAIConfig);
             } else {
                result = await GenerativeAIService.generateJson(fastPrompt, genAIConfig);
             }
        } else if (audioFile) {
            console.log(`[Interaction Turn] Multimodal Audio detected. Fusing Text + Voice pass...`);
            const parts = [
                { text: prompt },
                {
                    inlineData: {
                        data: audioFile.buffer.toString('base64'),
                        mimeType: audioFile.mimetype
                    }
                }
            ];

            result = await GenerativeAIService.generateJson(parts, genAIConfig);
        } else {
            result = await GenerativeAIService.generateJson(prompt, genAIConfig);
        }

        const aiContent = result?.data?.content || null;
        const transcribedUserText = clientTranscript || result?.data?.user_transcript || "";
        const aiAudio = result?.audio;

        if (!aiContent && !aiAudio) {
            console.error(`[Speaking Interaction] CRITICAL: AI returned null content and audio. Result Info:`, JSON.stringify({ model: result?.usedModel, data: result?.data }));
        }

        console.log(`[Speaking Interaction] AI Respond: "${aiContent ? aiContent.substring(0, 50) : 'NULL'}..." | Audio: ${aiAudio ? 'YES' : 'NO'}`);

        res.json({
            content: aiContent || "I see what you mean. However, we should also consider the broader implications of this issue, particularly how it affects students' long-term development in a changing environment.",
            speaker: current_speaker,
            user_transcript: transcribedUserText,
            audio: aiAudio
        });
    } catch (error) {
        console.error('[Speaking Interaction] Turn error:', error);
        res.status(500).json({ error: 'Failed to generate turn', details: error.message });
    }
});

module.exports = router;
