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
        } else if (module === 'interaction' || module === 'strategies') {
            const history = typeof messages === 'string' ? JSON.parse(messages) : (messages || []);
            const studentMessages = history.filter(m =>
                m.speaker === 'Student' ||
                m.role === 'user' ||
                m.speaker === 'Jack Tam' ||
                m.speaker === 'Candidate_D'
            );

            // transcription of the latest recorded response
            let transcribedText = "";
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
            let historyToGrade = [...history];
            if (transcribedText) {
                // Find the latest user message to update its content from placeholder to real text
                const lastUserIdx = [...historyToGrade].reverse().findIndex(m => m.speaker === 'Student' || m.role === 'user');
                if (lastUserIdx !== -1) {
                    const actualIdx = (historyToGrade.length - 1) - lastUserIdx;
                    historyToGrade[actualIdx] = { ...historyToGrade[actualIdx], text: transcribedText };
                }
            }

            const historyText = historyToGrade.map(m => `${m.speaker || m.role}: ${m.text}`).join('\n');

            prompt = interactionGradingAgent
                .replace('{TOPIC}', master_script || 'General Discussion')
                .replace('{HISTORY}', historyText)
                .replace('{LEVEL}', level)
                .replace('{FOCUS_AREA}', focus || 'General Interaction');
        } else if (module === 'language_patterns') {
            const history = typeof messages === 'string' ? JSON.parse(messages) : (messages || []);
            const practiceResults = req.body.practice_results ? (typeof req.body.practice_results === 'string' ? JSON.parse(req.body.practice_results) : req.body.practice_results) : [];
            const studentResponses = history.filter(m => m.role === 'user').map(m => m.text).join('\n') || "N/A";
            const { languagePatternsGradingAgent } = require('../prompts/speakingGradingAgent');

            // Format results for AI
            const resultsText = practiceResults.length > 0
                ? practiceResults.map((r, i) => `[Sentence ${i + 1}]: ${r.sentence} | Target: ${r.target_word}`).join('\n')
                : `Student Direct Responses:\n${studentResponses}`;

            prompt = languagePatternsGradingAgent
                .replace('{PRACTICE_RESULTS}', resultsText)
                .replace('{LEVEL}', level);
        } else if (module === 'ideas_organisation') {
            const history = typeof messages === 'string' ? JSON.parse(messages) : (messages || []);
            const studentResponses = history.filter(m => m.role === 'user').map(m => m.text).join('\n');
            const organisationData = req.body.organisation_data || "N/A";
            const { ideasOrganisationGradingAgent } = require('../prompts/speakingGradingAgent');

            prompt = ideasOrganisationGradingAgent
                .replace('{STUDENT_RESPONSES}', studentResponses)
                .replace('{ORGANISATION_DATA}', organisationData);
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
                    scores: { total: 16, pronunciation: 4, intonation: 4, pacing: 4, grammar: 4 },
                    feedback: { summary: "AI grading is currently unavailable.", improvement_advice: "Keep practicing!" }
                }
            };
        }

        // Standardize result structure (ensure result.scores exists)
        const finalResult = result.data || result;
        console.log(`[SpeakingQuest] Standardized Final Result:`, JSON.stringify(finalResult, null, 2));

        // AWARD XP
        let xpResult = { earned: 0 };
        if (finalResult.scores && finalResult.scores.total > 0 && uid && uid !== 'guest') {
            const maxXP = 200;
            const scoreRatio = Math.min(finalResult.scores.total / 28, 1);
            const xpAmount = Math.round(scoreRatio * maxXP);

            xpResult = await GamificationService.awardXP(uid, xpAmount, 'speaking', {
                title: `${module.charAt(0).toUpperCase() + module.slice(1)} Practice`,
                score: `${finalResult.scores.total}/28`,
                subject: 'english'
            }) || { earned: 0 };
        }

        // UPDATE MICRO-SKILL MASTERY
        if (finalResult.scores && uid && uid !== 'guest') {
            const masteryScore = (finalResult.scores.total / 28) * 100;
            const skillMappings = {
                'delivery': ['speaking_delivery'],
                'flow': ['speaking_language', 'speaking_organization'],
                'interaction': ['speaking_strategies'],
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
            transcript: mockTranscript,
            xp_awarded: xpResult.earned || 0
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

        const result = await GenerativeAIService.generateJson(prompt, {
            generationConfig: { temperature: 0.7 }
        });

        res.json({
            feedback_text: result.feedback_text || "Good point.",
            question: result.question || "Can you tell me more?",
            structural_hints: result.structural_hints || [],
            is_follow_up: result.is_follow_up || false
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
        const { history: historyStr, current_speaker, topic, level, uid, focus } = req.body;
        const history = typeof historyStr === 'string' ? JSON.parse(historyStr) : (historyStr || []);
        const audioFile = req.file;

        // Build conversation history string
        const conversationHistory = history.map(turn => {
            const speakerLabel = turn.speaker === 'Student' ? 'Candidate_D' : (turn.speaker || 'Candidate_A').replace(' ', '_');
            return `${speakerLabel}: ${turn.text}`;
        }).join('\n');

        const prompt = speakingAgent
            .replace('{TOPIC}', topic)
            .replace('{HISTORY}', conversationHistory)
            .replace('{MY_IDENTITY}', current_speaker || 'Candidate_A')
            .replace('{LEVEL}', level);

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

        let result;
        if (audioFile) {
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

            result = await GenerativeAIService.generateJson(parts, {
                model: 'gemini-2.5-flash',
                audioOutput: true,
                speechConfig: speechConfig,
                generationConfig: { temperature: 0.7 }
            });
        } else {
            result = await GenerativeAIService.generateJson(prompt, {
                model: 'gemini-2.5-flash',
                audioOutput: true,
                speechConfig: speechConfig,
                generationConfig: { temperature: 0.7 }
            });
        }

        const aiContent = result.data?.content || null;
        const transcribedUserText = result.data?.user_transcript || "";
        const aiAudio = result.audio;

        console.log(`[Speaking Interaction] AI Respond: "${aiContent ? aiContent.substring(0, 50) : 'NULL'}..." | Audio: ${aiAudio ? 'YES' : 'NO'}`);

        res.json({
            content: aiContent || "That's an interesting point, Jack. How about we look at it from another angle?",
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
