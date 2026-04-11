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

// Prompts & Config
const { GLOBAL_BASE_RULES, ONBOARDING_PROTOCOL, AGENT_PROMPTS } = require('../system_prompts.js');

// Constants from server.js
const TIER_1_MODEL = "gemini-flash-latest";
const TIER_2_MODEL = "gemini-flash-latest";
const TIER_PRO_MODEL = "gemini-pro-latest";

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
    const { uid, message, history: clientHistory, agentId, audio, audioType, image } = req.body;
    const db_firestore = admin.firestore();

    // Force production environment discovery before chat initialization
    await GenerativeAIService.init();

    if (!uid) return res.status(400).json({ error: "Missing uid" });

    // 1. Handle Audio Input
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

    const msgLower = (message || pronunciationFeedback?.transcript || "").toString().toLowerCase().trim();

    // 2. Pre-load Context
    let user, skillMap;
    const subject = (agentId === 'math' || agentId === 'maths') ? 'maths' : (agentId === 'chinese' ? 'chinese' : 'english');
    try {
        user = await UserProfileService.getProfile(uid);
        if (!user) return res.status(404).json({ error: "User not found" });
        skillMap = await UserProfileService.getSkillMap(uid, subject);
    } catch (e) {
        return res.status(500).json({ error: "Failed to load user context", details: e.message });
    }

    const isNewStudent = user ? (user.is_new_student !== false && user.status !== 'active') : true;

    // --- SMART GREETING ---
    if (msgLower === '[trigger_greeting]') {
        try {
            const subjectLabel = agentId === 'math' ? 'Mathematics' : (agentId === 'chinese' ? 'Chinese' : 'English');
            const onboardingWithSubject = ONBOARDING_PROTOCOL.replace(/{{SUBJECT}}/g, subjectLabel);
            const persona = await UserProfileService.getPersona(uid, agentId);

            let promptOverride;
            if (isNewStudent) {
                promptOverride = `${onboardingWithSubject} \nSYSTEM INSTRUCTION: Step 1: The Invite. Greet the student with excitement, invite them to explore their personalized roadmap. Use your specific persona tone.`;
            } else {
                const pContext = await UserProfileService.getPersonalizedContext(uid, agentId);
                promptOverride = `SYSTEM INSTRUCTION: Returning student. Greet warmingly and propose next steps. (Context: Level ${pContext.level}, Weaknesses: ${pContext.topWeaknesses.join(', ')}). Use your specific persona greeting style if available.`;
            }

            let systemPrompt = `${GLOBAL_BASE_RULES}\n\n${persona.prompt}\n\n${AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace}`;
            systemPrompt = systemPrompt
                .replace(/{{userName}}/g, user.displayName || "Student")
                .replace(/{{DREAM_SUBJECT}}/g, user.dreamSubject || "University")
                .replace(/{{ONBOARDING}}/g, isNewStudent ? onboardingWithSubject : "");

            const promptToAI = persona.greeting 
                ? `${systemPrompt} \n${promptOverride} \n\nYour defined greeting: "${persona.greeting}" \n\nUser: Hello!`
                : `${systemPrompt} \n${promptOverride} \n\nUser: Hello!`;

            const result = await GenerativeAIService.generateContent(promptToAI, { model: TIER_1_MODEL });
            return res.json({ text: result.response.text(), role: 'model', tutorName: persona.name });
        } catch (err) {
            return res.json({ text: "Welcome back! How can I help you today?" });
        }
    }

    // --- INTENT ROUTING ---
    let route = { intent: 'CHAT' };
    if (!audio) {
        try {
            const routerContext = {
                is_new_student: isNewStudent,
                has_active_exam: !!user?.activeExam,
                has_image: !!image
            };
            if (agentId === 'math') {
                route = await MathsIntentRouter.classify(message || "", clientHistory || [], uid, routerContext, !!image);
            } else {
                route = await IntentRouter.classify(message || "", clientHistory || [], uid, routerContext);
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
    const persona = await UserProfileService.getPersona(uid, agentId);
    let systemPrompt = `${GLOBAL_BASE_RULES}\n\n${persona.prompt}\n\n${AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace}`;
    systemPrompt = systemPrompt
        .replace(/{{userName}}/g, user.displayName || "Student")
        .replace(/{{DREAM_SUBJECT}}/g, user.dreamSubject || "University");

    const ragSnippets = message ? KnowledgeService.retrieveKnowledge(message) : null;
    if (ragSnippets) systemPrompt += `\nReference (RAG):\n${ragSnippets}`;

    const { model: selectedModelName, useAceSir } = routeRequest(message, !!image);
    if (useAceSir) systemPrompt = `${ACE_SIR_INJECTION}\n\n${systemPrompt}`;

    try {
        const result = await GenerativeAIService.generateContent(message, { 
            model: selectedModelName,
            systemInstruction: systemPrompt
        });

        const historyRef = db_firestore.collection('users').doc(uid).collection('chat_history');
        await historyRef.add({
            agentId,
            message,
            response: result.response.text(),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ text: result.response.text(), role: 'model', tutorName: persona.name });
    } catch (e) {
        res.status(500).json({ text: getMockResponse(agentId) });
    }
});

/**
 * GET /api/history/:agentId
 */
router.get('/history/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const { uid } = req.query;
        if (!uid) return res.json([]);
        const history = await UserProfileService.getChatHistory(uid, agentId);
        res.json(history);
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
    if (!uid || !role || !content) return res.status(400).json({ error: "Missing required fields" });
    try {
        await UserProfileService.saveChatMessage(uid, agentId, { role, content });
        res.json({ success: true });
    } catch (e) {
        console.error("History Save Error:", e);
        res.status(500).json({ error: "Failed to save message" });
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
        console.error("Clear History Error:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
