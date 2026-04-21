const express = require('express');
const router = express.Router();
const moment = require('moment');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Services
const UserProfileService = require('../services/UserProfileService');
const GenerativeAIService = require('../services/GenerativeAIService');
const RoadmapService = require('../services/RoadmapService');
const GamificationService = require('../services/GamificationService');
const TokenService = require('../services/TokenService');
const VoiceQuotaService = require('../services/VoiceQuotaService');
const PronunciationService = require('../services/PronunciationService');
const KnowledgeService = require('../services/KnowledgeService');
const IntentRouter = require('../services/IntentRouter');
const MathsIntentRouter = require('../services/maths/MathsIntentRouter');
const MathsLabService = require('../services/maths/MathsLabService');
const EnglishTutorService = require('../services/EnglishTutorService');
const TTSService = require('../services/TTSService');

// Prompts & Config
const { GLOBAL_BASE_RULES, ONBOARDING_PROTOCOL, AGENT_PROMPTS } = require('../system_prompts.js');

// Constants from server.js
// Constants from server.js - UPDATED TO USE ALIASES
const TIER_1_MODEL = "ace-it-flash";
const TIER_2_MODEL = "ace-it-flash";
const TIER_PRO_MODEL = "ace-it-pro";

// Placeholder if missing - though audit suggests it should be here
const ACE_SIR_INJECTION = "";

/**
 * AI Model Routing Strategy
 */
function routeRequest(message, hasImage) {
    if (message && message.includes('[SYSTEM:')) {
        return { model: TIER_PRO_MODEL, useAceSir: false };
    }
    if (message) {
        const lower = message.toLowerCase();
        if (
            lower.includes('recap') ||
            lower.includes('grade') ||
            lower.includes('score') ||
            lower.includes('mock')
        ) {
            return { model: TIER_PRO_MODEL, useAceSir: false };
        }
    }
    let model = TIER_1_MODEL;
    if (hasImage) {
        model = TIER_2_MODEL;
    } else if (message) {
        const lower = message.toLowerCase();
        if (lower.includes('check') || lower.includes('explain')) {
            model = TIER_2_MODEL;
        }
    }
    return { model, useAceSir: false };
}

/**
 * Fallback static responses
 */
const getMockResponse = (agentId) => {
    const responses = {
        ace: "I'm experiencing a brief connection issue, but don't let that stop your momentum! Let's keep exploring your DSE goals.",
        english: "I'm having a little trouble connecting to my brain right now, but I'm still here for you! Why don't we try your last question again in a moment?",
        math: "Looks like a calculation error on my end! Give me a second to reboot, and we'll get back to solving those problems.",
        science: "A bit of a laboratory glitch! I'll be back online for full experiments shortly."
    };
    return responses[agentId] || responses.ace;
};

// --- ROUTES ---

/**
 * POST /api/chat
 * Primary AI Chat entry point with intent routing and multimodal support.
 */
router.post('/chat', async (req, res) => {
    let selectedModelName = "ace-it-flash";
    let persona = { name: "Ace Sir", prompt: "" };
    let agentId = 'ace';
    let uid = 'guest';

    try {
        // 0. Initial Safety Check for Request Body
        if (!req.body) {
            return res.status(400).json({ error: "Missing request body" });
        }

        const body = req.body;
        uid = body.uid || 'guest';
        agentId = body.agentId || 'ace';
        const { message, history: clientHistory, audio, audioType, image } = body;

        // 1. Safe Firestore Context
        let db_firestore;
        try {
            if (admin.apps.length > 0) {
                db_firestore = admin.firestore();
            } else {
                console.warn("[chatRoutes] Firebase not initialized in server.js. Firestore operations will be skipped.");
            }
        } catch (fErr) {
            console.warn("[chatRoutes] Firestore Access Error:", fErr.message);
        }

        // 2. AI Service Discovery
        try {
            await GenerativeAIService.init();
        } catch (initErr) {
            console.error("[CRITICAL] AI Service Init Failure:", initErr);
        }

        if (!uid || uid === 'guest') {
            console.warn("[chatRoutes] Warning: Proceeding as GUEST (limited functionality)");
        }

        // 3. Handle Audio Input
        let pronunciationFeedback = null;
        if (audio) {
            try {
                await VoiceQuotaService.checkVoiceQuota(uid);
                pronunciationFeedback = await PronunciationService.analyzePronunciation(audio, audioType || 'audio/webm');
                await VoiceQuotaService.incrementVoiceUsage(uid);
            } catch (error) {
                console.error("Voice processing failed:", error);
                return res.status(500).json({ error: 'Voice processing failed', details: error.message });
            }
        }

        // MULTIMODAL CONSOLIDATION
        const effectiveMessage = (message || pronunciationFeedback?.transcript || "").toString().trim();
        const msgLower = effectiveMessage.toLowerCase();

        // 4. Pre-load Context
        let user, skillMap, pContext;
        const subject = (agentId === 'math' || agentId === 'maths') ? 'maths' : (agentId === 'chinese' ? 'chinese' : 'english');

        try {
            if (uid !== 'guest') {
                user = await UserProfileService.getProfile(uid);
                skillMap = await UserProfileService.getSkillMap(uid, subject);
                pContext = await UserProfileService.getPersonalizedContext(uid, agentId);
            }
        } catch (e) {
            console.error(`[CRITICAL] Context Load Failure (Non-fatal): ${e.message}`);
            // We continue as a default user if profile fetch fails
        }

        const isNewStudent = user ? (user.is_new_student !== false && user.status !== 'active') : true;

        // --- SMART GREETING ---
        if (msgLower === '[trigger_greeting]') {
            try {
                const subjectLabel = agentId === 'math' ? 'Mathematics' : (agentId === 'chinese' ? 'Chinese' : 'English');
                const onboardingWithSubject = ONBOARDING_PROTOCOL.replace(/{{SUBJECT}}/g, subjectLabel);

                persona = await UserProfileService.getPersona(uid, agentId);

                let promptOverride;
                if (isNewStudent) {
                    promptOverride = `${onboardingWithSubject} \nSYSTEM INSTRUCTION: Step 1: Greet student excitedly.`;
                } else {
                    promptOverride = `SYSTEM INSTRUCTION: Returning student. (Context: Level ${pContext?.level || 1}).`;
                }

                let systemPrompt = `${GLOBAL_BASE_RULES}\n\n${persona.prompt}\n\n${AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace}`;
                if (promptOverride) systemPrompt += `\n\n${promptOverride}`;

                const result = await GenerativeAIService.generateContent("Hello!", {
                    model: "ace-it-flash",
                    systemInstruction: systemPrompt
                });

                const replyText = result.response.text();
                selectedModelName = result.usedModel;

                if (uid !== 'guest') {
                    await UserProfileService.saveChatMessage(uid, agentId, {
                        role: 'model',
                        content: replyText
                    });
                }

                return res.json({
                    text: replyText,
                    role: 'model',
                    tutorName: persona.name,
                    diag_info: result.usedModel ? `${result.usedPlatform || 'unknown'}: ${result.usedModel}` : null
                });
            } catch (err) {
                console.error("Greeting failure:", err);
                return res.json({ text: "Welcome back! How can I help you today?" });
            }
        }

        // --- INTENT ROUTING ---
        let route = { intent: 'CHAT' };
        if (!audio && effectiveMessage) {
            try {
                const routerContext = {
                    is_new_student: isNewStudent,
                    has_active_exam: !!user?.activeExam,
                    has_image: !!image,
                    completed_topics: pContext?.completedTopics?.join(', ') || "None"
                };
                if (agentId === 'math') {
                    route = await MathsIntentRouter.classify(effectiveMessage, clientHistory || [], uid, routerContext, !!image);
                } else {
                    route = await IntentRouter.classify(effectiveMessage, clientHistory || [], uid, routerContext);
                }

                if (route.intent === 'LAB' && route.ui_command) {
                    return res.json({ text: route.bridge_text || "Opening Lab...", customComponent: 'launch_card', payload: route.ui_command, role: 'model' });
                }
                if (route.intent === 'EXAM_ROUTER') {
                    return res.json({ text: route.bridge_text || "Opening Mocks...", customComponent: 'exam_link', examType: (route.ui_command?.params?.type || "Speaking").toLowerCase(), role: 'model' });
                }
            } catch (rErr) { console.error("Router error:", rErr); }
        }

        // --- FINAL AI RESPONSE ---
        persona = await UserProfileService.getPersona(uid, agentId);
        let systemPrompt = `${GLOBAL_BASE_RULES}\n\n${persona.prompt}\n\n${AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace}`;
        systemPrompt = systemPrompt
            .replace(/{{userName}}/g, (user?.displayName || "Student"))
            .replace(/{{agentName}}/g, persona.name)
            .replace(/{{DREAM_SUBJECT}}/g, (user?.dreamSubject || "University"));

        const ragSnippets = effectiveMessage ? KnowledgeService.retrieveKnowledge(effectiveMessage) : null;
        if (ragSnippets) systemPrompt += `\nReference (RAG):\n${ragSnippets}`;

        const routingInfo = routeRequest(effectiveMessage, !!image);
        const useAceSir = routingInfo.useAceSir;
        selectedModelName = routingInfo.model;

        if (useAceSir) systemPrompt = `${ACE_SIR_INJECTION}\n\n${systemPrompt}`;

        if (agentId === 'english' || agentId === 'chinese') {
            systemPrompt += "\nNATIVE HK SPEAKER MODE: Proactively skip topics already completed by the student: " + (pContext?.completedTopics?.join(', ') || "None");
        }

        const result = await GenerativeAIService.generateContent(effectiveMessage, {
            model: "ace-it-flash",
            systemInstruction: systemPrompt
        });

        const replyText = result.response.text();
        selectedModelName = result.usedModel;

        if (uid !== 'guest') {
            console.log(`[chatRoutes] Auto-saving messages to Firestore for UID: ${uid}`);
            UserProfileService.saveChatMessage(uid, agentId, {
                role: 'user',
                content: effectiveMessage || (audio ? "[STT: Voice Message]" : "")
            }).catch(err => console.error("[chatRoutes] Failed to auto-save user message:", err));

            UserProfileService.saveChatMessage(uid, agentId, {
                role: 'model',
                content: replyText || ""
            }).catch(err => console.error("[chatRoutes] Failed to auto-save model message:", err));
        }

        // --- TOKEN USAGE LOGGING ---
        if (result.response && result.response.usageMetadata) {
            TokenService.logUsage(uid || 'system', 'chat', result.response.usageMetadata);
        }

        res.json({
            text: replyText,
            role: 'model',
            tutorName: persona.name,
            audioContent: null,
            diag_info: selectedModelName ? `${result.usedPlatform || 'unknown'}: ${selectedModelName}` : null
        });

    } catch (e) {
        console.error("HANDLED Chat API Error:", e);
        // Ensure we ALWAYS return JSON
        if (!res.headersSent) {
            res.status(500).json({
                text: getMockResponse(agentId || 'ace'),
                diag_info: `failed: ${selectedModelName || 'initialization'} (platform error)`,
                error_details: e.message,
                handled: true
            });
        }
    }
});

/**
 * GET /api/history/:agentId
 */
router.get('/history/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const { uid } = req.query;
        if (!uid) {
            console.warn(`[chatRoutes] GET /history/${agentId} called without UID`);
            return res.json([]);
        }

        console.log(`[chatRoutes] Fetching history for UID: ${uid}, Agent: ${agentId}`);
        const history = await UserProfileService.getChatHistory(uid, agentId);

        // Final filter to ensure no empty content or system internal tags leak to UI
        const filteredHistory = history.filter(m =>
            m.content &&
            !(m.content && m.content.includes('[SYSTEM:')) &&
            !(m.content && m.content.includes('[trigger_greeting]'))
        );

        console.log(`[chatRoutes] Returning ${filteredHistory.length} messages for ${uid} / ${agentId}`);
        res.json(filteredHistory);
    } catch (e) {
        console.error("History Fetch Error:", e);
        res.status(500).json([]);
    }
});

/**
 * POST /api/history/:agentId (Manual save)
 */
router.post('/history/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const { uid, role, content } = req.body;

    // We allow empty content for system triggers, but uid and role are required
    if (!uid || !role) {
        console.error(`[chatRoutes] POST /history/${agentId} missing core fields:`, { uid, role });
        return res.status(400).json({ error: "Missing required fields: uid, role" });
    }

    try {
        console.log(`[chatRoutes] Manually saving message for UID: ${uid}, Agent: ${agentId}, Role: ${role}`);
        await UserProfileService.saveChatMessage(uid, agentId, {
            role: (role === 'assistant' || role === 'model') ? 'model' : 'user',
            content: content || ""
        });
        res.json({ success: true });
    } catch (e) {
        console.error("History Save Error:", e);
        res.status(500).json({ error: "Failed to save message", details: e.message });
    }
});

/**
 * DELETE /api/chat/history/:agentId
 */
router.delete('/history/:agentId', async (req, res) => {
    const { agentId } = req.params;
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: "Missing uid" });
    try {
        await UserProfileService.clearChatHistory(uid, agentId);
        res.json({ success: true });
    } catch (e) {
        console.error("History Clear Error:", e);
        res.status(500).json({ error: "Failed to clear history" });
    }
});

/**
 * POST /api/chat/transcribe
 * Dedicated STT transcription endpoint using the stable PronunciationService.
 * Used for filling the input box via voice.
 */
router.post('/transcribe', async (req, res) => {
    const { audio, audioType, uid } = req.body;
    if (!audio) return res.status(400).json({ error: "No audio data provided" });

    try {
        console.log(`[STT] Transcribe requested for UID: ${uid || 'guest'}`);
        const result = await PronunciationService.analyzePronunciation(audio, audioType || 'audio/webm');

        if (result.error) {
            console.warn(`[STT] Transcription warned: ${result.error}`);
            return res.status(500).json({ error: result.error });
        }

        console.log(`[STT] Successfully transcribed: "${result.transcript}"`);
        res.json({ transcript: result.transcript });
    } catch (e) {
        console.error("[STT] Transcription endpoint crash:", e);
        res.status(500).json({ error: "Transcription failed", details: e.message });
    }
});

module.exports = router;
