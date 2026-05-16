const express = require('express');
const router = express.Router();
const moment = require('moment');
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
const CacheService = require('../services/CacheService');
const OcrService = require('../services/OcrService');
const TutorResponseService = require('../services/TutorResponseService');
const { requireResolvedUid } = require('../middleware/requireResolvedUid');

// Prompts & Config
const { GLOBAL_BASE_RULES, ONBOARDING_PROTOCOL, AGENT_PROMPTS } = require('../system_prompts.js');

// Constants from server.js
// Constants from server.js - UPDATED TO USE ALIASES
const TIER_1_MODEL = "ace-it-flash";
const TIER_2_MODEL = "ace-it-flash";
const TIER_PRO_MODEL = "ace-it-pro";

// --- Chat optimization budgets ---
// History window: last N messages forwarded to the model. Older turns are
// dropped and represented by a single [CONTEXT_SUMMARY] note in the system
// prompt. The student's RECENT_ACTIVITY (mock + quest summary) covers the
// long-term context, so a tight window does NOT reduce response quality.
const MAX_TURNS = 12;
const MAX_CHARS_PER_MSG = 800;
const MAX_RAG_CHARS = 600;
const MAX_LANG_SKIP_TOPICS = 8;

// Placeholder if missing - though audit suggests it should be here
const ACE_SIR_INJECTION = `
### ACE SIR: STRATEGY & JUPAS
- **Focus**: Time Management (Part B2 timing), Exam Logic (marker intent), JUPAS (weighting), Tactical Optimization.
- **Dynamic Chips**: Output 3-5 chips [SUGGESTIONS: a, b, c].
  * Initial: 'Optimize Time Management', 'Decode Exam Logic', 'Master Paper Strategy', 'Hack JUPAS Strategy', 'Professional Career Advice'.
  * Ongoing: Use professional phrases like 'Hack JUPAS Multipliers' or 'Avoid Paper 1 Traps'.
- **Markdown tables**: When you output a table, use GitHub-style pipe rows only: header row with | cells, next row |---|---|, then every data row wrapped in leading and trailing |. Put bold markers **inside** cells; never split a row across lines without pipes.
`;

// Tutor-side guidance that teaches the model to reference the new
// [RECENT_ACTIVITY] line emitted by formatInsightsForPrompt. Kept short
// because it is appended to every chat turn.
const RECENT_ACTIVITY_GUIDANCE = `
### USING [RECENT_ACTIVITY]
When the system prompt contains a [RECENT_ACTIVITY] line:
- If MOCK shows a result, briefly acknowledge it ("Nice work on your last Listening mock - you hit 5*")
  and tailor your next suggestion to the listed weak skills ("weak:..." tokens).
- If QUESTS lists recent quests, weave them into encouragement ("You finished {topic} - let's build on it").
- Never quote the raw tags back to the student. Translate them into natural language.
`;

/**
 * Build the conversation history that gets sent to Gemini.
 * Applies a server-side budget so input tokens stay flat as the thread grows.
 *
 * Returns { history, dropped, totalChars } where history is the formatted
 * array of { role, parts } entries ready for Gemini.
 */
function buildHistoryWindow(clientHistory) {
    const raw = Array.isArray(clientHistory) ? clientHistory : [];

    // Filter system-only triggers and empty messages.
    const cleaned = raw
        .map(m => {
            const role = (m.role === 'user') ? 'user' : 'model';
            const text = (m.parts?.[0]?.text || m.content || "").toString();
            return { role, text };
        })
        .filter(m => {
            if (!m.text) return false;
            const t = m.text.trim();
            if (!t) return false;
            if (t.includes('[trigger_greeting]')) return false;
            if (t === '[REDIRECT_DIAGNOSTIC]') return false;
            return true;
        });

    const dropped = Math.max(0, cleaned.length - MAX_TURNS);
    const windowed = cleaned.slice(-MAX_TURNS);

    // Truncate any individual message that's longer than budget.
    const truncated = windowed.map(m => ({
        role: m.role,
        text: m.text.length > MAX_CHARS_PER_MSG
            ? m.text.slice(0, MAX_CHARS_PER_MSG) + ' ...[truncated]'
            : m.text
    }));

    // Gemini constraint: history (when used as content) must START with 'user'.
    while (truncated.length > 0 && truncated[0].role === 'model') {
        truncated.shift();
    }

    const history = truncated.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const totalChars = history.reduce((acc, m) => acc + (m.parts[0].text?.length || 0), 0);

    return { history, dropped, totalChars };
}

/**
 * AI Model Routing Strategy
 */
function routeRequest(message, hasImage) {
    const msg = (message || "").toLowerCase();
    const strategyKeywords = ['strategy', 'jupas', 'time', 'exam', 'logic', 'paper', 'university', 'career', 'mark', 'score', 'target', 'plan', '升學', '前途', '時間管理', '策略'];
    const isStrategy = strategyKeywords.some(k => msg.includes(k));
    
    // 2026 COST SAVER: Default to Flash for ALL chat interactions.
    return { model: TIER_1_MODEL, useAceSir: isStrategy };
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
router.post('/chat', requireResolvedUid, async (req, res) => {
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

        // HARD OVERRIDE: English tutor image uploads should be treated as writing-content evaluation.
        // This bypasses generic persona chat flow that can refuse "handwriting analysis".
        if (image && agentId === 'english') {
            let ocrText = "";
            let ocrConfidence = 0;
            let uncertainTokens = [];
            try {
                const ocr = await OcrService.extractDetailedFromBase64(image.data, "eng");
                ocrText = ocr?.text || "";
                ocrConfidence = Number(ocr?.confidence || 0);
                uncertainTokens = Array.isArray(ocr?.uncertainTokens) ? ocr.uncertainTokens : [];
            } catch (ocrErr) {
                console.warn("[chatRoutes] English image OCR failed:", ocrErr.message);
            }

            if (!ocrText || ocrText.trim().length < 20) {
                return res.json({
                    role: 'model',
                    tutorName: "Miss Janie",
                    text: "我已收到圖片，但 OCR 暫時未能清楚讀取內容。請再上傳一張更清晰（光線充足、正面拍攝、字體完整）的照片，或者直接貼上文字版本，我可以即時按 HKDSE 寫作標準幫你批改。",
                    diag_info: `image-ocr: insufficient_text`
                });
            }

            const clipped = ocrText.slice(0, 3500);
            const writingPrompt = `You are Miss Janie, a strict but encouraging HKDSE English writing tutor.

Student uploaded handwritten writing. OCR transcript:
"""
${clipped}
"""

Task: Evaluate this writing CONTENT (not handwriting quality) using HKDSE criteria.
Respond in Traditional Chinese with clear section headings and concise bullet points.

OCR reliability policy (CRITICAL):
- This draft comes from OCR and may contain character noise (e.g. y/r/n/m confusion, broken spacing).
- DO NOT assert specific spelling mistakes unless you are highly certain they are true errors from context.
- If a token might be OCR noise, mark it as "可能是 OCR 誤讀" and do not penalize heavily.
- Never invent corrections for words that are likely legible in normal handwriting.
- Prioritize macro quality (Content / Language range / Organisation) over micro typo policing.
- Confidence gate: if OCR confidence < 88, you MUST avoid listing exact spelling errors unless at least 2+ independent contextual clues support it.
- Uncertain OCR tokens (treat as noisy, low-trust):
${uncertainTokens.length ? uncertainTokens.join(", ") : "(none flagged)"}

Required output structure:
1) 估計等級 (HKDSE) + 1-2句原因
2) Content（內容）- 2-3 points
3) Language（語言）- 2-3 points
4) Organisation（組織）- 2-3 points
5) Top 3 改善建議（最重要）
6) Polished sample paragraph (rewrite one paragraph to stronger band)

Important:
- Do NOT say you cannot analyze handwriting.
- Use the OCR text as the student's draft and provide best-effort marking.
- If OCR has minor noise, continue with reasonable interpretation.`;

            const writingResult = await GenerativeAIService.generateContent(writingPrompt, {
                model: TIER_PRO_MODEL
            });
            const writingReply = writingResult?.response?.text?.() || "我已收到你的作文，請再給我一點時間整理詳細評語。";
            selectedModelName = writingResult.usedModel || selectedModelName;

            if (uid !== 'guest') {
                UserProfileService.saveChatMessage(uid, agentId, {
                    role: 'user',
                    content: (message || "[Image Upload: Writing Draft]").toString()
                }).catch(err => console.error("[chatRoutes] Failed to save writing upload user message:", err));
                UserProfileService.saveChatMessage(uid, agentId, {
                    role: 'model',
                    content: writingReply
                }).catch(err => console.error("[chatRoutes] Failed to save writing upload model message:", err));
            }

            return res.json({
                text: writingReply,
                role: 'model',
                tutorName: "Miss Janie",
                diag_info: writingResult.usedModel ? `${writingResult.usedPlatform || 'unknown'}: ${writingResult.usedModel} | ocr_conf=${Math.round(ocrConfidence)}` : `writing-ocr-fallback | ocr_conf=${Math.round(ocrConfidence)}`
            });
        }

        // 1. AI Service Discovery
        try {
            await GenerativeAIService.init();
        } catch (initErr) {
            console.error("[CRITICAL] AI Service Init Failure:", initErr);
        }

        if (!uid || uid === 'guest') {
            console.warn("[chatRoutes] Warning: Proceeding as GUEST (limited functionality)");
        }

        // 2. Handle Audio Input
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
        const originalMessage = (message || pronunciationFeedback?.transcript || "").toString().trim();
        let effectiveMessage = originalMessage;
        const msgLower = effectiveMessage.toLowerCase();

        // 4. Pre-load Context
        let user, skillMap, pContext;
        const subject = (agentId === 'math' || agentId === 'maths') ? 'maths' : (agentId === 'chinese' ? 'chinese' : 'english');

        try {
            if (uid !== 'guest') {
                CacheService.invalidateProfileCache(uid);
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
                systemPrompt = systemPrompt
                    .replace(/{{userName}}/g, (user?.displayName || "Student"))
                    .replace(/{{agentName}}/g, persona.name)
                    .replace(/{{DREAM_SUBJECT}}/g, (user?.dreamSubject || "University"))
                    .replace(/{{INSIGHT_PACKAGE}}/g, UserProfileService.formatInsightsForPrompt(pContext));
                if (promptOverride) systemPrompt += `\n\n${promptOverride}`;
                if (uid !== 'guest' && user) {
                    systemPrompt += `\n### STUDENT PROFILE (FROM ACCOUNT — DO NOT ASK TO RE-ENTER DATA BELOW)\n${UserProfileService.formatProfileAdmissionsBlock(user)}`;
                }

                const result = await GenerativeAIService.generateContent("Hello!", {
                    model: "ace-it-flash",
                    systemInstruction: systemPrompt
                });

                const replyText = result.response.text();
                const normalizedTutorResponse = TutorResponseService.normalizeResponse(replyText, {
                    agentId,
                    isNewStudent,
                    hasDiagnostic: pContext?.hasDiagnostic,
                    hasRecentActivity: Boolean(pContext?.recentMock || (Array.isArray(pContext?.recentQuests) && pContext.recentQuests.length > 0)),
                    leanContext: pContext?.tutorLeanContext || null
                });
                selectedModelName = result.usedModel;

                if (uid !== 'guest') {
                    await UserProfileService.saveChatMessage(uid, agentId, {
                        role: 'model',
                        content: normalizedTutorResponse.text || replyText
                    });
                }

                return res.json({
                    text: normalizedTutorResponse.text || replyText,
                    suggested_chips: normalizedTutorResponse.suggested_chips,
                    actions: normalizedTutorResponse.actions,
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
        let routerSkipped = false;
        if (!audio && effectiveMessage) {
            // Fast-path: bypass the AI router for clear greetings / acks
            // when no lab proposal is pending in the recent assistant turns.
            // This avoids one Flash call per message on the largest CHAT class.
            // Maths agent has its own router with image-handling logic, so
            // we only short-circuit for the English / Chinese / Ace path.
            const isAck = CacheService.isGreetingOrAck(effectiveMessage);
            const proposalPending = CacheService.hasRecentLabProposal(clientHistory || []);
            if (agentId !== 'math' && !image && isAck && !proposalPending) {
                routerSkipped = true;
                route = { intent: 'CHAT' };
                console.log(`[chatRoutes] Router fast-path: greeting/ack "${effectiveMessage.slice(0, 30)}" -> CHAT`);
            }

            if (!routerSkipped) {
                try {
                    const routerContext = {
                        is_new_student: isNewStudent,
                        has_active_exam: !!user?.activeExam,
                        has_image: !!image,
                        completed_topics: pContext?.completedTopics?.join(', ') || "None",
                        available_quests: (pContext?.tutorLeanContext?.availableQuestTitles || pContext?.availableQuests || []).join(', ') || "None",
                        weakest_skills: (pContext?.tutorLeanContext?.microSkills?.weakest || []).map((s) => s.name || s.skillId).join(', ') || "None",
                        unassessed_skills: (pContext?.tutorLeanContext?.microSkills?.unassessed || []).map((s) => s.name || s.skillId).join(', ') || "None",
                        diagnostic_completed: pContext?.hasDiagnostic || false
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
        }

        // --- FINAL AI RESPONSE ---
        persona = await UserProfileService.getPersona(uid, agentId);

        // Tiered system prompt assembly. We track which optional sections
        // were attached so telemetry can later attribute cost shifts.
        const tierFlags = ['core'];
        let systemPrompt = `${GLOBAL_BASE_RULES}\n\n${persona.prompt}\n\n${AGENT_PROMPTS[agentId] || AGENT_PROMPTS.ace}`;
        systemPrompt = systemPrompt
            .replace(/{{userName}}/g, (user?.displayName || "Student"))
            .replace(/{{agentName}}/g, persona.name)
            .replace(/{{DREAM_SUBJECT}}/g, (user?.dreamSubject || "University"))
            .replace(/{{INSIGHT_PACKAGE}}/g, UserProfileService.formatInsightsForPrompt(pContext));
        systemPrompt += `\n${TutorResponseService.buildTutorContractInstruction(agentId)}`;

        if (effectiveMessage.includes('[SYSTEM: PENDING_COMPLETION_SUMMARY')) {
            systemPrompt += `\n### PROACTIVE DASHBOARD SUMMARY MODE
The student has completed one or more Quest/Mock items that have not yet been summarized.
You must respond proactively as a true tutor:
1) One short celebration.
2) A grouped summary of all completed items.
3) The most important micro-skill/focus-area diagnosis.
4) A practical to-do list for the next study session.
5) One clear action button using [CTA: Start Practice | open_quest:${agentId}].
Do not ask what the student wants to do next until after giving the plan.`;
            tierFlags.push('pending_completion_summary');
        }

        // Append the small guidance block that teaches the model to use
        // the [RECENT_ACTIVITY] line. Only added when we actually have
        // recent activity to talk about, so cold-start users skip it.
        const hasRecentActivity = !!(
            pContext?.recentMock ||
            (Array.isArray(pContext?.recentQuests) && pContext.recentQuests.length > 0)
        );
        if (hasRecentActivity) {
            systemPrompt += `\n${RECENT_ACTIVITY_GUIDANCE}`;
            tierFlags.push('recent_activity');
        }

        // RAG snippets - capped to MAX_RAG_CHARS so a chatty knowledge
        // base cannot blow up the prompt.
        const ragSnippets = effectiveMessage ? KnowledgeService.retrieveKnowledge(effectiveMessage) : null;
        if (ragSnippets && ragSnippets !== "No specific snippets found.") {
            const snippet = ragSnippets.length > MAX_RAG_CHARS
                ? ragSnippets.slice(0, MAX_RAG_CHARS) + ' ...[truncated]'
                : ragSnippets;
            systemPrompt += `\nReference (RAG):\n${snippet}`;
            tierFlags.push('rag');
        }

        const routingInfo = routeRequest(effectiveMessage, !!image);
        const useAceSir = routingInfo.useAceSir;
        selectedModelName = routingInfo.model;

        if (useAceSir) {
            systemPrompt = `${ACE_SIR_INJECTION}\n\n${systemPrompt}`;
            tierFlags.push('strategy');
        }

        if ((agentId === 'english' || agentId === 'chinese') && Array.isArray(pContext?.completedTopics) && pContext.completedTopics.length > 0) {
            const topics = pContext.completedTopics;
            const head = topics.slice(0, MAX_LANG_SKIP_TOPICS).join(', ');
            const tail = topics.length > MAX_LANG_SKIP_TOPICS
                ? `, +${topics.length - MAX_LANG_SKIP_TOPICS} more`
                : '';
            systemPrompt += `\nNATIVE HK SPEAKER MODE: Proactively skip topics already completed by the student: ${head}${tail}`;
            tierFlags.push('lang_skip');
        }

        let imageForModel = image || null;
        const activeProvider = GenerativeAIService.getActiveProvider?.() || "unknown";
        // DeepSeek text models do not accept inline image parts; run OCR fallback.
        if (imageForModel && activeProvider === "deepseek") {
            try {
                const ocr = await OcrService.extractDetailedFromBase64(imageForModel.data, "eng");
                const ocrText = ocr?.text || "";
                const ocrConfidence = Number(ocr?.confidence || 0);
                const uncertainTokens = Array.isArray(ocr?.uncertainTokens) ? ocr.uncertainTokens : [];
                if (ocrText) {
                    const clipped = ocrText.slice(0, 3000);
                    systemPrompt += `\n[HANDWRITING_OCR] OCR transcript from uploaded image (treat as student's writing content):\n${clipped}`;
                    systemPrompt += `\n[OCR_CONFIDENCE] ${Math.round(ocrConfidence)} / 100`;
                    if (uncertainTokens.length > 0) {
                        systemPrompt += `\n[OCR_UNCERTAIN_TOKENS] ${uncertainTokens.join(", ")}`;
                    }
                    if (agentId === 'english') {
                        systemPrompt += `\n[WRITING_ANALYSIS_MODE] The user uploaded handwritten English writing. You MUST analyze the WRITING CONTENT using HKDSE criteria (Content, Language, Organisation). Do NOT refuse by saying you cannot analyze handwriting. Use the OCR transcript as the writing draft.`;
                        effectiveMessage = `Please grade and comment on my writing using HKDSE criteria (Content, Language, Organisation). Provide:
1) estimated band/level
2) key strengths
3) top 3 improvements
4) a polished sample paragraph

[OCR_TRANSCRIPT]
${clipped}`;
                    } else {
                        effectiveMessage = `${effectiveMessage || "Please analyze my uploaded handwriting image and give comments."}\n\n[OCR_TRANSCRIPT]\n${clipped}`;
                    }
                    tierFlags.push('ocr');
                } else {
                    effectiveMessage = `${effectiveMessage || "Please analyze my uploaded handwriting image and give comments."}\n\n[OCR_TRANSCRIPT]\n(No clear text detected from image. Please still provide best-effort comments and ask for a clearer image only if absolutely needed.)`;
                    tierFlags.push('ocr_empty');
                }
            } catch (ocrErr) {
                console.warn("[chatRoutes] OCR fallback failed:", ocrErr.message);
                effectiveMessage = `${effectiveMessage || "Please analyze my uploaded handwriting image and give comments."}\n\n[OCR_TRANSCRIPT]\n(OCR processing failed. Provide best-effort writing guidance based on the user's request.)`;
                tierFlags.push('ocr_failed');
            }
            // Prevent unsupported inline image payload from being sent to DeepSeek.
            imageForModel = null;
        }

        // Build the budgeted history window.
        const { history: formattedHistory, dropped: historyDropped, totalChars: historyChars } =
            buildHistoryWindow(clientHistory);

        if (historyDropped > 0) {
            systemPrompt += `\n[CONTEXT_SUMMARY] ${historyDropped} earlier turn(s) omitted. Rely on [STUDENT_INSIGHTS] / [RECENT_ACTIVITY] for prior context.`;
            tierFlags.push('windowed');
        }

        if (uid !== 'guest' && user) {
            systemPrompt += `\n### STUDENT PROFILE (FROM ACCOUNT — DO NOT ASK TO RE-ENTER DATA BELOW)\n${UserProfileService.formatProfileAdmissionsBlock(user)}`;
            tierFlags.push('profile_admissions');
        }

        // Build the content array, attaching the image (if any) to the last
        // user turn in the windowed history.
        let finalContent;
        if (formattedHistory.length > 0) {
            finalContent = JSON.parse(JSON.stringify(formattedHistory));
            if (imageForModel) {
                const lastUserIndex = [...finalContent].reverse().findIndex(m => m.role === 'user');
                if (lastUserIndex !== -1) {
                    const actualIndex = finalContent.length - 1 - lastUserIndex;
                    if (!finalContent[actualIndex].parts) finalContent[actualIndex].parts = [];
                    finalContent[actualIndex].parts.push({
                        inlineData: { data: imageForModel.data, mimeType: imageForModel.mimeType || 'image/jpeg' }
                    });
                }
            }
        } else {
            finalContent = imageForModel ? [
                {
                    role: 'user',
                    parts: [
                        { text: effectiveMessage || "Analyze this image." },
                        { inlineData: { data: imageForModel.data, mimeType: imageForModel.mimeType || 'image/jpeg' } }
                    ]
                }
            ] : [
                { role: 'user', parts: [{ text: effectiveMessage || "Hello" }] }
            ];
        }

        const promptTier = tierFlags.join('+');
        console.log(`[chatRoutes] tier=${promptTier} sys_chars=${systemPrompt.length} hist_msgs=${finalContent.length} hist_chars=${historyChars} dropped=${historyDropped} routerSkipped=${routerSkipped} agent=${agentId}`);

        const result = await GenerativeAIService.generateContent(finalContent, {
            model: selectedModelName,
            systemInstruction: systemPrompt
        }).catch(aiErr => {
            console.error("[chatRoutes] AI Generation CRASHED:", aiErr);
            throw aiErr;
        });

        let replyText = "";
        try {
            if (result && result.response) {
                replyText = result.response.text();
            } else {
                throw new Error("No response from AI Service");
            }
        } catch (textErr) {
            console.error("[chatRoutes] Failed to extract text from AI response:", textErr);
            // Check if it was blocked
            const candidates = result?.response?.candidates || [];
            if (candidates.length > 0 && candidates[0].finishReason === 'SAFETY') {
                replyText = "I'm sorry, but I can't respond to that as it triggers my safety filters. Let's try talking about something else!";
            } else {
                throw new Error(`AI Service Error: ${textErr.message}`);
            }
        }

        selectedModelName = result.usedModel;
        const normalizedTutorResponse = TutorResponseService.normalizeResponse(replyText, {
            agentId,
            isNewStudent,
            hasDiagnostic: pContext?.hasDiagnostic,
            hasRecentActivity,
            isPendingSummaryMode: effectiveMessage.includes('[SYSTEM: PENDING_COMPLETION_SUMMARY'),
            leanContext: pContext?.tutorLeanContext || null
        });
        const responseText = normalizedTutorResponse.text || replyText;

        if (uid !== 'guest') {
            console.log(`[chatRoutes] Auto-saving messages to Firestore for UID: ${uid}`);
            // Skip saving ephemeral system triggers to chat history
            const isSystemTrigger = originalMessage && originalMessage.includes('[SYSTEM:');
            if (!isSystemTrigger) {
                UserProfileService.saveChatMessage(uid, agentId, {
                    role: 'user',
                    content: originalMessage || (audio ? "[STT: Voice Message]" : "")
                }).catch(err => console.error("[chatRoutes] Failed to auto-save user message:", err));
            }

            UserProfileService.saveChatMessage(uid, agentId, {
                role: 'model',
                content: responseText || ""
            }).catch(err => console.error("[chatRoutes] Failed to auto-save model message:", err));
        }

        // --- TOKEN USAGE LOGGING ---
        if (result.response && result.response.usageMetadata) {
            TokenService.logUsage(uid || 'system', 'chat', result.response.usageMetadata, {
                prompt_tier: promptTier,
                agent_id: agentId,
                history_msgs: finalContent.length,
                router_skipped: routerSkipped,
                persona_id: persona?.id || null
            });
        }

        res.json({
            text: responseText,
            suggested_chips: normalizedTutorResponse.suggested_chips,
            actions: normalizedTutorResponse.actions,
            role: 'model',
            tutorName: persona.name,
            audioContent: null,
            diag_info: selectedModelName ? `${GenerativeAIService.getActiveProvider?.() || result.usedPlatform || 'unknown'}: ${selectedModelName}` : null
        });

    } catch (e) {
        console.error("HANDLED Chat API Error:", e);
        // Ensure we ALWAYS return JSON
        if (!res.headersSent) {
            res.status(500).json({
                error: e.message || "Internal AI Error",
                text: "I'm having a little trouble connecting to my brain right now, but I'm still here for you! Why don't we try your last question again in a moment?",
                diag_info: `failed: ${(GenerativeAIService.getActiveProvider?.() || 'unknown')}/${selectedModelName || 'initialization'} - ${e.message}`,
                error_details: e.message,
                handled: true
            });
        }
    }
});

/**
 * GET /api/history/:agentId
 */
router.get('/history/:agentId', requireResolvedUid, async (req, res) => {
    try {
        const { agentId } = req.params;
        const { uid } = req.query;
        if (!uid) {
            console.warn(`[chatRoutes] GET /history/${agentId} called without UID`);
            return res.json([]);
        }

        console.log(`[chatRoutes] Fetching history for UID: ${uid}, Agent: ${agentId}`);
        const history = await UserProfileService.getChatHistory(uid, agentId);

        // Final filter to ensure no internal tags leak to UI
        const filteredHistory = history.filter(m =>
            m.content &&
            !m.content.includes('[trigger_greeting]') &&
            !m.content.includes('[SYSTEM:')
        );

        console.log(`[chatRoutes] Returning ${filteredHistory.length} messages for ${uid} / ${agentId}`);
        res.json(filteredHistory);
    } catch (e) {
        console.error("History Fetch Error:", e);
        const isCosmos = /cosmos|AZURE_COSMOS/i.test(String(e?.message || ''));
        res.status(500).json({
            error: "Failed to fetch history",
            ...(isCosmos ? { hint: "Cosmos DB connection or credentials may be misconfigured on the server." } : {})
        });
    }
});

/**
 * POST /api/history/:agentId (Manual save)
 */
router.post('/history/:agentId', requireResolvedUid, async (req, res) => {
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
router.delete('/history/:agentId', requireResolvedUid, async (req, res) => {
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
 * GET /api/history/:agentId/chips
 */
router.get('/history/:agentId/chips', requireResolvedUid, async (req, res) => {
    try {
        const { agentId } = req.params;
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ error: "Missing uid" });
        const chips = await UserProfileService.getLastChatChips(uid, agentId);
        res.json({ chips });
    } catch (e) {
        console.error("History Chips Fetch Error:", e);
        res.status(500).json({ error: "Failed to fetch chat chips" });
    }
});

/**
 * POST /api/history/:agentId/chips
 */
router.post('/history/:agentId/chips', requireResolvedUid, async (req, res) => {
    try {
        const { agentId } = req.params;
        const { uid, chips } = req.body || {};
        if (!uid) return res.status(400).json({ error: "Missing uid" });
        const saved = await UserProfileService.saveLastChatChips(uid, agentId, chips);
        res.json({ success: true, chips: saved || [] });
    } catch (e) {
        console.error("History Chips Save Error:", e);
        res.status(500).json({ error: "Failed to save chat chips" });
    }
});

/**
 * DELETE /api/history/:agentId/chips
 */
router.delete('/history/:agentId/chips', requireResolvedUid, async (req, res) => {
    try {
        const { agentId } = req.params;
        const { uid } = req.query;
        if (!uid) return res.status(400).json({ error: "Missing uid" });
        await UserProfileService.clearLastChatChips(uid, agentId);
        res.json({ success: true });
    } catch (e) {
        console.error("History Chips Clear Error:", e);
        res.status(500).json({ error: "Failed to clear chat chips" });
    }
});

/**
 * POST /api/chat/transcribe
 * Dedicated STT transcription endpoint using the stable PronunciationService.
 * Used for filling the input box via voice.
 */
router.post('/transcribe', requireResolvedUid, async (req, res) => {
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
