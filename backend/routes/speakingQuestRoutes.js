const express = require('express');
const router = express.Router();
const SpeakingQuestService = require('../services/SpeakingQuestService');
const { deliveryGradingAgent, flowGradingAgent, interactionGradingAgent } = require('../prompts/speakingGradingAgent');
const speakingFlowAgent = require('../prompts/speakingFlowAgent');
const speakingAgent = require('../prompts/speakingAgent');
const GenerativeAIService = require('../services/GenerativeAIService');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

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

        if (!module || !['delivery', 'flow', 'interaction'].includes(module)) {
            return res.status(400).json({ error: 'Invalid module. Must be delivery, flow, or interaction.' });
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

            // Mock STT
            mockTranscript = "This is a sample transcript of the student's recording.";

            prompt = deliveryGradingAgent
                .replace('{MASTER_SCRIPT}', master_script)
                .replace('{STUDENT_TRANSCRIPT}', mockTranscript)
                .replace('{WAVEFORM_DATA}', 'N/A (Audio processed via STT)')
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
        } else if (module === 'interaction') {
            const history = typeof messages === 'string' ? JSON.parse(messages) : (messages || []);
            const studentMessages = history.filter(m => m.speaker === 'Student' || m.role === 'user');

            if (studentMessages.length === 0) {
                return res.json({
                    scores: { facilitation: 0, listening: 0, turn_taking: 0, bridging: 0, total: 0 },
                    feedback: {
                        summary: "Incomplete session: No student interaction detected.",
                        improvement_advice: "Join the conversation to earn marks on facilitation and active listening!"
                    }
                });
            }

            const historyText = history.map(m => `${m.speaker || m.role}: ${m.text}`).join('\n');

            prompt = interactionGradingAgent
                .replace('{TOPIC}', master_script || 'General Discussion')
                .replace('{HISTORY}', historyText)
                .replace('{LEVEL}', level)
                .replace('{FOCUS_AREA}', focus || 'General Interaction');
        } else {
            return res.status(400).json({ error: 'Invalid or unsupported module for submission' });
        }

        const GamificationService = require('../services/GamificationService');

        // ... (existing code)

        console.log(`[Speaking Quest] Grading ${module} Quest ${quest_id} for ${uid}`);

        let result;
        try {
            result = await GenerativeAIService.generateJson(prompt, {
                generationConfig: { temperature: 0.3 }
            });
        } catch (aiError) {
            console.error(`[Speaking ${module}] AI Grading failed:`, aiError);
            result = {
                scores: { total: 16, clarity: 4, pacing: 4, vocabulary: 4, grammar: 4 },
                feedback: { summary: "AI grading is currently unavailable.", improvement_advice: "Keep practicing!" }
            };
        }

        // AWARD XP
        let xpResult = { earned: 0 };
        if (result.scores && result.scores.total > 0 && uid && uid !== 'guest') {
            const maxXP = 200;
            const scoreRatio = Math.min(result.scores.total / 28, 1);
            const xpAmount = Math.round(scoreRatio * maxXP);

            xpResult = await GamificationService.awardXP(uid, xpAmount, 'speaking', {
                title: `${module.charAt(0).toUpperCase() + module.slice(1)} Practice`,
                score: `${result.scores.total}/28`,
                subject: 'english'
            }) || { earned: 0 };
        }

        res.json({
            scores: result.scores,
            feedback: result.feedback,
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
router.post('/interaction/turn', async (req, res) => {
    try {
        const { quest_id, history = [], current_speaker, topic, level, uid, focus } = req.body;

        // Build conversation context
        const conversationHistory = history.map(turn =>
            `${turn.speaker}: ${turn.text}`
        ).join('\n');

        const prompt = speakingAgent
            .replace('{TOPIC}', topic)
            .replace('{HISTORY}', conversationHistory)
            .replace('{CURRENT_SPEAKER}', current_speaker)
            .replace('{LEVEL}', level)
            .replace('{FOCUS_AREA}', focus || 'General Interaction');

        console.log(`[Interaction Turn] Requesting turn for ${current_speaker} (Focus: ${focus})`);

        let result;
        try {
            result = await GenerativeAIService.generateJson(prompt, {
                generationConfig: { temperature: 0.8 }
            });
        } catch (jsonError) {
            console.warn('[Interaction Turn] generateJson failed, attempting fallback...', jsonError.message);
            const fallbackResult = await GenerativeAIService.generateContent(prompt, {
                generationConfig: { temperature: 0.8 }
            });
            const text = fallbackResult.response.text();
            result = { content: GenerativeAIService.extractJson(text) };
        }

        res.json({
            content: result.content || result.turns?.[0]?.content || "I think that's a valid point. Let me add to that...",
            speaker: current_speaker
        });
    } catch (error) {
        console.error('[Speaking Interaction] Turn error:', error);
        res.status(500).json({ error: 'Failed to generate turn', details: error.message, stack: error.stack });
    }
});

module.exports = router;
