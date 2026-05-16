const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/**
 * GenerativeAIService
 * A polymorphic adapter that switches between Google AI Studio (Local)
 * and Vertex AI (Production/HK Region) based on the environment.
 */
class GenerativeAIService {
    constructor() {
        this.instance = null;
        this.isVertex = false;
        this.initialized = false;
        this.proRequestCount = 0; // Cost Guard: Track Pro requests
        this.lastResetTime = Date.now();
        this.isDevMode = false; // Centralized Dev State
        this.isGroq = false;
        this.activeProvider = "google";
        this.providerLocked = false;
        this.isAzureOpenAI = false;
        this.isDeepSeek = false;
    }

    async init() {
        if (this.initialized) return;

        // Configuration
        const NODE_ENV = process.env.NODE_ENV || 'development';
        const isProduction = NODE_ENV === 'production';
        const forceAIStudio = process.env.USE_AI_STUDIO_IN_PROD === 'true';
        const aiProvider = (process.env.AI_PROVIDER || '').toLowerCase();

        if (aiProvider === 'groq') {
            this.initGroq();
            this.activeProvider = "groq";
            this.providerLocked = true;
            this.initialized = true;
            return;
        }
        if (aiProvider === 'azure_openai' || aiProvider === 'azure') {
            this.initAzureOpenAI();
            this.activeProvider = "azure_openai";
            this.providerLocked = true;
            this.initialized = true;
            return;
        }
        if (aiProvider === 'deepseek') {
            this.initDeepSeek();
            this.activeProvider = "deepseek";
            this.providerLocked = true;
            this.initialized = true;
            return;
        }

        // 🛡️ HARD ISOLATION (2026 Cost Control)
        // In Development, we EXCLUSIVELY use AI Studio (Free Tier).
        // Vertex AI is physically blocked here to prevent accidental charges from the DEV service account.
        const isDev = NODE_ENV === 'development' || !process.env.K_SERVICE; // K_SERVICE is only present in Cloud Run
        const isHardBlocked = isDev && process.env.I_KNOW_THIS_COSTS_MONEY !== 'true';

        if (isHardBlocked || forceAIStudio) {
            if (isDev) {
                console.log(`[AIService] 🛡️  HARD COST GUARD: Blocking Vertex AI in DEV. Routing to Google AI Studio (Free).`);
            }
            this.initAIStudio();
            this.activeProvider = "google";
            this.initialized = true;
            return;
        }

        // Only reach this if we are in PRODUCTION (Cloud Run) or the user has explicitly bypassed the guard.
        if (isProduction || (isDev && !isHardBlocked)) {
            try {
                const { VertexAI } = require('@google-cloud/vertexai');
                const fs = require('fs');
                
                const saPath = path.join(__dirname, '../config/antigravity-tutor-prod-key.json');

                if (!fs.existsSync(saPath)) {
                    throw new Error(`CRITICAL: Production service account key missing at ${saPath}`);
                }

                // Explicitly load credentials (Bypass ADC for explicit control)
                const credentials = JSON.parse(fs.readFileSync(saPath, 'utf8'));
                const projectId = credentials.project_id;
                const region = process.env.VERTEX_LOCATION || 'asia-southeast1'; 

                console.log(`[AIService] 🛡️ Initializing Vertex AI for Project: ${projectId}`);

                const vertexConfig = { 
                    project: projectId, 
                    location: region,
                    googleAuthOptions: { credentials }
                };

                this.vertex = new VertexAI(vertexConfig);
                this.isVertex = true;
                this.activeProvider = "vertex";
                this.currentRegion = region;
                this.vertexConfig = vertexConfig; 

                const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || !process.env.K_SERVICE;

                // 2026 Model Mapping - Tier-Based Lockdown for DEV
                this.vertexModelMap = {
                    "ace-it-flash": "gemini-1.5-flash",
                    "ace-it-pro": isDev ? "gemini-1.5-flash" : "gemini-1.5-pro",
                    "gemini-flash-latest": "gemini-1.5-flash",
                    "gemini-pro-latest": isDev ? "gemini-1.5-flash" : "gemini-1.5-pro",
                    "gemini-1.5-flash": "gemini-1.5-flash",
                    "gemini-1.5-pro": isDev ? "gemini-1.5-flash" : "gemini-1.5-pro"
                };

                console.log(`[AIService] 🚀 Vertex AI Production Online (${region})`);

            } catch (e) {
                console.error("[AIService] ❌ Vertex AI Production Initialization Failed:", e.message);
                if (this.providerLocked) {
                    throw new Error(`Locked provider '${this.activeProvider}' failed: ${e.message}`);
                }
                console.warn("[AIService] ⚠️ Falling back to AI Studio...");
                this.initAIStudio();
                this.activeProvider = "google";
            }
        }
        
        this.initialized = true;
    }

    /**
     * Regional Failsafe Re-initialization
     * Switches to us-central1 if Singapore is unreachable
     */
    async switchToFailsafeRegion() {
        if (!this.isVertex || this.currentRegion === 'us-central1') return false;
        
        console.warn(`[AIService] ⚠️ Pivoting to Failsafe Region: us-central1...`);
        try {
            const { VertexAI } = require('@google-cloud/vertexai');
            this.currentRegion = 'us-central1';
            this.vertexConfig.location = 'us-central1';
            this.vertex = new VertexAI(this.vertexConfig);
            return true;
        } catch (err) {
            console.error(`[AIService] 🚨 Failsafe Region pivot failed: ${err.message}`);
            return false;
        }
    }

    initAIStudio() {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[AIService] ❌ CRITICAL: GOOGLE_API_KEY or GEMINI_API_KEY is missing from environment variables.");
            throw new Error("AI service is not configured (missing API key)");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.isVertex = false;
        this.currentRegion = 'global/api_key';
        this.requestHistory = []; // Track RPM for free-tier protection

        // 2026 COST SAVER: In DEV, we map PRO requests to FLASH by default to prevent accidental Tier 1 billing.
        this.isDevMode = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || !process.env.K_SERVICE;
        const isDev = this.isDevMode;
        
        this.studioModelMap = {
            "ace-it-flash": "gemini-flash-latest",
            "ace-it-pro": isDev ? "gemini-flash-latest" : "gemini-pro-latest",
            "gemini-1.5-flash": "gemini-flash-latest",
            "gemini-1.5-pro": isDev ? "gemini-flash-latest" : "gemini-pro-latest",
            "gemini-flash-latest": "gemini-flash-latest",
            "gemini-pro-latest": isDev ? "gemini-flash-latest" : "gemini-pro-latest"
        };

        if (isDev) {
            console.log(`[AIService] 🛡️  FREE TIER PRIORITY: Standardizing on Gemini 1.5 Flash for development.`);
        }

        console.log(`[AIService] Initialized Google AI Studio (Local Mode) | Dev Mode: ${isDev}`);
    }

    initGroq() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("AI service is not configured (missing GROQ_API_KEY)");
        }
        this.groqApiKey = apiKey;
        this.groqBaseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions';
        this.groqModelMap = {
            "ace-it-flash": process.env.GROQ_FLASH_MODEL || "llama-3.1-8b-instant",
            "ace-it-pro": process.env.GROQ_PRO_MODEL || "llama-3.3-70b-versatile"
        };
        this.isVertex = false;
        this.isGroq = true;
        this.activeProvider = "groq";
        this.currentRegion = 'groq/api_key';
        this.isDevMode = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || !process.env.K_SERVICE;
        console.log(`[AIService] Initialized Groq API adapter | Dev Mode: ${this.isDevMode}`);
    }

    initAzureOpenAI() {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-21';
        if (!endpoint || !apiKey) {
            throw new Error("AI service is not configured (missing AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY)");
        }

        this.azureOpenAIEndpoint = endpoint.replace(/\/+$/, '');
        this.azureOpenAIApiKey = apiKey;
        this.azureOpenAIApiVersion = apiVersion;
        this.azureDeploymentMap = {
            "gpt-4o-mini": process.env.AZURE_OPENAI_DEPLOYMENT_4O_MINI || "gpt-4o-mini",
            "gpt-4.1-mini": process.env.AZURE_OPENAI_DEPLOYMENT_4_1_MINI || "gpt-4.1-mini",
            "o4-mini": process.env.AZURE_OPENAI_DEPLOYMENT_O4_MINI || "o4-mini"
        };
        this.azureAliasMap = {
            "ace-it-flash": "gpt-4o-mini",
            "gemini-flash-latest": "gpt-4o-mini",
            "gemini-2.0-flash": "gpt-4o-mini",
            "gemini-1.5-flash": "gpt-4o-mini",
            "ace-it-pro": "gpt-4.1-mini",
            "gemini-pro-latest": "gpt-4.1-mini",
            "gemini-1.5-pro": "gpt-4.1-mini",
            "gpt-4o-mini": "gpt-4o-mini",
            "gpt-4.1-mini": "gpt-4.1-mini",
            "o4-mini": "o4-mini"
        };
        this.isGroq = false;
        this.isVertex = false;
        this.isAzureOpenAI = true;
        this.currentRegion = "azure_openai";
        this.isDevMode = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || !process.env.K_SERVICE;
        console.log(`[AIService] Initialized Azure OpenAI adapter | API ${apiVersion}`);
    }

    initDeepSeek() {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            throw new Error("AI service is not configured (missing DEEPSEEK_API_KEY)");
        }
        this.deepSeekApiKey = apiKey;
        this.deepSeekBaseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/chat/completions';
        this.deepSeekModelMap = {
            "ace-it-flash": process.env.DEEPSEEK_FLASH_MODEL || "deepseek-chat",
            "ace-it-pro": process.env.DEEPSEEK_PRO_MODEL || "deepseek-reasoner"
        };
        this.deepSeekVisionModel = process.env.DEEPSEEK_VISION_MODEL || this.deepSeekModelMap["ace-it-flash"];
        this.isVertex = false;
        this.isGroq = false;
        this.isAzureOpenAI = false;
        this.isDeepSeek = true;
        this.activeProvider = "deepseek";
        this.currentRegion = "deepseek/api_key";
        this.isDevMode = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || !process.env.K_SERVICE;
        console.log(`[AIService] Initialized DeepSeek API adapter | Dev Mode: ${this.isDevMode}`);
    }

    getActiveProvider() {
        return this.activeProvider;
    }

    /**
     * Rate Limiter for Free Tier Protection (Local Dev Only)
     * Ensures we don't exceed the 15 RPM limit for Gemini 1.5 Flash
     */
    async enforceFreeTierLimits() {
        const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || !process.env.K_SERVICE;
        if (!isDev || this.isVertex || this.isGroq || this.isDeepSeek) return;

        const now = Date.now();
        // Remove requests older than 1 minute
        this.requestHistory = (this.requestHistory || []).filter(ts => now - ts < 60000);

        // 15 RPM is the hard limit for Gemini 1.5 Flash Free Tier
        // We use 14 for a safety margin
        if (this.requestHistory.length >= 14) {
            const oldestRequest = this.requestHistory[0];
            const waitTime = 60000 - (now - oldestRequest) + 1000; // Wait until the oldest request clears + 1s buffer
            
            console.warn(`[AIService] 🐢 FREE TIER LIMIT: Approaching 15 RPM. Throttling for ${Math.ceil(waitTime / 1000)}s to stay in Free Tier...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.enforceFreeTierLimits(); // Re-check after waiting
        }

        this.requestHistory.push(now);
    }

    getModel(config = {}) {
        if (this.isGroq || this.activeProvider === 'groq' || this.isAzureOpenAI || this.activeProvider === 'azure_openai' || this.isDeepSeek || this.activeProvider === 'deepseek') {
            throw new Error("Current provider uses direct adapter path; Gemini/Vertex model routing is blocked.");
        }
        const requested = config.model || "ace-it-flash";

        let modelName = requested;

        // SAFE ALIASING: In Development, we strictly map known aliases to prevent raw model ID billing.
        const isDevelopment = this.isDevMode;

        if (this.isVertex && this.vertexModelMap?.[requested]) {
            modelName = this.vertexModelMap[requested];
        } else if (!this.isVertex) {
            modelName = this.studioModelMap?.[requested] || (isDevelopment ? "gemini-flash-latest" : requested);
            
            // Rejection of unmapped models in Dev to prevent side-channel billing if project is linked
            if (isDevelopment && !this.studioModelMap?.[requested] && requested !== "gemini-flash-latest") {
                console.warn(`[AIService] 🛡️  Unmapped model '${requested}' blocked in DEV. Falling back to safe 'gemini-flash-latest'`);
                modelName = "gemini-flash-latest";
            }
        }

        if (this.isVertex) {
            // Vertex AI specific constants and formatting
            const { HarmCategory: VHC, HarmBlockThreshold: VHBT } = require('@google-cloud/vertexai');

            const vSafetySettings = [
                { category: VHC.HARM_CATEGORY_HARASSMENT, threshold: VHBT.BLOCK_NONE },
                { category: VHC.HARM_CATEGORY_HATE_SPEECH, threshold: VHBT.BLOCK_NONE },
                { category: VHC.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: VHBT.BLOCK_NONE },
                { category: VHC.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: VHBT.BLOCK_NONE },
            ];

            const vModelOptions = {
                model: modelName,
                generationConfig: {
                    ...(config.generationConfig || {}),
                    ...(config.generationConfig || {})
                },
                safetySettings: vSafetySettings
            };

            // Support Gemini Context Caching for PROD (Vertex)
            if (config.cachedContent) {
                vModelOptions.cachedContent = config.cachedContent;
                console.log(`[AIService] ⚡ Using Vertex Context Cache: ${config.cachedContent.substring(0, 40)}...`);
            }

            if (config.systemInstruction) {
                // Vertex SDK requires systemInstruction parts structure
                vModelOptions.systemInstruction = {
                    role: 'system',
                    parts: [{ text: config.systemInstruction }]
                };
            }

            console.log(`[AIService] [VERTEX:${this.currentRegion}] Routing: ${modelName}`);
            return this.vertex.getGenerativeModel(vModelOptions);
        } else {
            console.log(`[AIService] 💎 [STUDIO:FREE] Routing: ${modelName}`);

            const safetySettings = [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ];

            const modelOptions = {
                model: modelName,
                generationConfig: config.generationConfig || {},
                safetySettings: safetySettings
            };

            const apiVersion = (config.audioOutput || config.systemInstruction || modelName.includes('1.5') || modelName.includes('2.0') || modelName.includes('latest')) ? 'v1beta' : 'v1';
            
            // Critical Fix: Remove responseMimeType for v1 calls as it is not supported in generation_config
            if (apiVersion !== 'v1beta' && modelOptions.generationConfig.responseMimeType) {
                console.log(`[AIService] Filtering responseMimeType for compatible v1 call...`);
                delete modelOptions.generationConfig.responseMimeType;
            }

            if (config.responseMimeType && apiVersion === 'v1beta') {
                modelOptions.generationConfig.responseMimeType = config.responseMimeType;
            }

            if (config.systemInstruction) {
                modelOptions.systemInstruction = config.systemInstruction;
            }

            // Support Gemini Context Caching for DEV (Studio)
            if (config.cachedContent) {
                modelOptions.cachedContent = config.cachedContent;
                console.log(`[AIService] ⚡ Using Studio Context Cache: ${config.cachedContent.substring(0, 40)}...`);
            }

            // [2026] Multimodal Audio Config - REMOVED

            return this.genAI.getGenerativeModel(modelOptions, { apiVersion });
        }
    }

    /**
     * Unified generateContent method with automatic retry and Smart Fallback
     */
    async generateContent(prompt, config = {}, retries = 3) {
        await this.init();
        if (this.isGroq) {
            return this.generateContentWithGroq(prompt, config);
        }
        if (this.isAzureOpenAI) {
            return this.generateContentWithAzureOpenAI(prompt, config);
        }
        if (this.isDeepSeek) {
            return this.generateContentWithDeepSeek(prompt, config);
        }
        const result = await this.executeWithRetry(async (model) => {
            const contents = Array.isArray(prompt) 
                ? prompt 
                : [{ role: 'user', parts: [{ text: prompt.toString() }] }];
            return await model.generateContent({ contents });
        }, prompt, config, retries);

        // Standardize the response structure (Ensuring .text() is ALWAYS a function)
        if (result && result.response) {
            // Safety: Ensure text() is always a function to prevent crashes in routes
            if (typeof result.response.text !== 'function') {
                const candidates = result.response?.candidates || [];
                const firstPart = candidates[0]?.content?.parts?.find(p => p.text);
                const rawText = firstPart?.text || "I'm sorry, I couldn't generate a text response at this time.";
                result.response.text = () => rawText;
            }

            // [2026] Multimodal Audio Extraction - REMOVED
        }

        return result;
    }

    normalizeGroqMessages(prompt, systemInstruction = null) {
        const messages = [];
        if (systemInstruction) {
            messages.push({ role: 'system', content: systemInstruction.toString() });
        }

        if (Array.isArray(prompt)) {
            for (const item of prompt) {
                const role = item?.role === 'model' ? 'assistant' : (item?.role || 'user');
                const parts = Array.isArray(item?.parts) ? item.parts : [];
                const text = parts
                    .filter(p => typeof p?.text === 'string')
                    .map(p => p.text)
                    .join('\n')
                    .trim();
                if (text) messages.push({ role, content: text });
            }
        } else {
            messages.push({ role: 'user', content: prompt?.toString() || '' });
        }

        return messages.length > 0 ? messages : [{ role: 'user', content: 'Hello' }];
    }

    resolveGroqModel(requestedModel) {
        if (this.groqModelMap[requestedModel]) return this.groqModelMap[requestedModel];
        if (requestedModel?.includes('pro')) return this.groqModelMap["ace-it-pro"];
        return this.groqModelMap["ace-it-flash"];
    }

    async generateContentWithGroq(prompt, config = {}) {
        const requestedModel = config.model || "ace-it-flash";
        const model = this.resolveGroqModel(requestedModel);
        const messages = this.normalizeGroqMessages(prompt, config.systemInstruction);

        // Cap output size; allow higher budgets when callers request large JSON (grading, mocks).
        const requestedMax = config?.generationConfig?.maxOutputTokens || 1024;
        const cappedMaxTokens = Math.min(requestedMax, 8192);
        const payload = {
            model,
            messages,
            temperature: typeof config?.generationConfig?.temperature === 'number' ? config.generationConfig.temperature : 0.4,
            max_tokens: cappedMaxTokens
        };

        let response;
        try {
            response = await axios.post(this.groqBaseUrl, payload, {
                headers: {
                    Authorization: `Bearer ${this.groqApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 120000
            });
        } catch (err) {
            const status = err?.response?.status || err?.status || null;
            if (status === 429) {
                const retryAfterHeader = err?.response?.headers?.['retry-after'];
                const retryAfterSecs = Number.parseInt(retryAfterHeader || '8', 10);
                const waitMs = Number.isFinite(retryAfterSecs) ? Math.max(3000, retryAfterSecs * 1000) : 8000;
                console.warn(`[AIService] Groq 429 received. Waiting ${Math.ceil(waitMs / 1000)}s then retrying once...`);
                await new Promise(resolve => setTimeout(resolve, waitMs));
                response = await axios.post(this.groqBaseUrl, payload, {
                    headers: {
                        Authorization: `Bearer ${this.groqApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 120000
                });
            } else {
                const statusText = status ? `status ${status}` : 'unknown status';
                const providerMsg = err?.response?.data?.error?.message || err.message;
                const wrapped = new Error(`Groq API failed (${statusText}): ${providerMsg}`);
                wrapped.status = status;
                throw wrapped;
            }
        }

        const text = response?.data?.choices?.[0]?.message?.content || '';
        return {
            response: {
                text: () => text,
                candidates: [{ content: { parts: [{ text }] } }],
                usageMetadata: response?.data?.usage || null
            },
            usedModel: model,
            usedPlatform: 'groq'
        };
    }

    resolveDeepSeekModel(requestedModel) {
        if (this.deepSeekModelMap[requestedModel]) return this.deepSeekModelMap[requestedModel];
        if (requestedModel?.includes('pro') || requestedModel?.includes('reason')) return this.deepSeekModelMap["ace-it-pro"];
        return this.deepSeekModelMap["ace-it-flash"];
    }

    hasInlineImageParts(prompt) {
        if (!Array.isArray(prompt)) return false;
        return prompt.some((item) =>
            Array.isArray(item?.parts) &&
            item.parts.some((p) => p?.inlineData?.data && p?.inlineData?.mimeType)
        );
    }

    normalizeDeepSeekMessages(prompt, systemInstruction = null) {
        const messages = [];
        if (systemInstruction) {
            messages.push({ role: 'system', content: systemInstruction.toString() });
        }

        if (Array.isArray(prompt)) {
            for (const item of prompt) {
                const role = item?.role === 'model' ? 'assistant' : (item?.role || 'user');
                const parts = Array.isArray(item?.parts) ? item.parts : [];
                const contentParts = [];

                for (const part of parts) {
                    if (typeof part?.text === 'string' && part.text.trim()) {
                        contentParts.push({ type: 'text', text: part.text });
                    }
                    if (part?.inlineData?.data && part?.inlineData?.mimeType) {
                        const mime = part.inlineData.mimeType;
                        const data = part.inlineData.data;
                        contentParts.push({
                            type: 'image_url',
                            image_url: { url: `data:${mime};base64,${data}` }
                        });
                    }
                }

                if (contentParts.length === 0) continue;
                if (contentParts.length === 1 && contentParts[0].type === 'text') {
                    messages.push({ role, content: contentParts[0].text });
                } else {
                    messages.push({ role, content: contentParts });
                }
            }
        } else {
            messages.push({ role: 'user', content: prompt?.toString() || '' });
        }

        return messages.length > 0 ? messages : [{ role: 'user', content: 'Hello' }];
    }

    async generateContentWithDeepSeek(prompt, config = {}) {
        const requestedModel = config.model || "ace-it-flash";
        const hasImage = this.hasInlineImageParts(prompt);
        const model = hasImage ? this.deepSeekVisionModel : this.resolveDeepSeekModel(requestedModel);
        const messages = this.normalizeDeepSeekMessages(prompt, config.systemInstruction);

        const requestedMax = config?.generationConfig?.maxOutputTokens || 1024;
        // DeepSeek: allow larger completions for lab grading JSON (exemplars + breakdown).
        // Cap stays conservative vs context window; raise via generationConfig.maxOutputTokens per call.
        const payload = {
            model,
            messages,
            temperature: typeof config?.generationConfig?.temperature === 'number' ? config.generationConfig.temperature : 0.4,
            max_tokens: Math.min(requestedMax, 8192)
        };

        const promptPreview = typeof prompt === 'string'
            ? prompt.substring(0, 120)
            : (Array.isArray(prompt) && prompt[0]?.text ? prompt[0].text.substring(0, 120) : 'array-prompt');
        console.log(`[DeepSeekAdapter] Request | model=${model} | messages=${messages.length} | max_tokens=${payload.max_tokens} | promptPreview="${promptPreview}..."`);

        let response;
        const dsStart = Date.now();
        try {
            // Long-form JSON (reading batches, writing grading) can exceed 120s; align with server mock timeout / batch limits.
            const deepSeekTimeoutMs =
                typeof config?.timeoutMs === 'number' && config.timeoutMs > 0
                    ? config.timeoutMs
                    : 240000;
            response = await axios.post(this.deepSeekBaseUrl, payload, {
                headers: {
                    Authorization: `Bearer ${this.deepSeekApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: deepSeekTimeoutMs
            });
            console.log(`[DeepSeekAdapter] Response OK in ${Date.now() - dsStart}ms | usedModel=${model} | responseLength=${response?.data?.choices?.[0]?.message?.content?.length || 0}`);
        } catch (err) {
            const status = err?.response?.status || err?.status || null;
            const statusText = status ? `status ${status}` : 'unknown status';
            const providerMsg = err?.response?.data?.error?.message || err.message;
            console.error(`[DeepSeekAdapter] Response FAILED after ${Date.now() - dsStart}ms | status=${status} | error="${providerMsg}"`);
            const wrapped = new Error(`DeepSeek API failed (${statusText}): ${providerMsg}`);
            wrapped.status = status;
            throw wrapped;
        }

        const msg = response?.data?.choices?.[0]?.message || {};
        let text = (typeof msg.content === 'string' ? msg.content : '') || '';
        // deepseek-reasoner can return empty `content` while chain-of-thought is in `reasoning_content`.
        if (!String(text).trim() && typeof msg.reasoning_content === 'string' && msg.reasoning_content.trim()) {
            text = msg.reasoning_content;
        }
        return {
            response: {
                text: () => text,
                candidates: [{ content: { parts: [{ text }] } }],
                usageMetadata: response?.data?.usage || null
            },
            usedModel: model,
            usedPlatform: 'deepseek'
        };
    }

    resolveAzureModel(requestedModel = "ace-it-flash") {
        return this.azureAliasMap[requestedModel] || "gpt-4o-mini";
    }

    resolveAzureFallbackChain(modelName, config = {}) {
        const enableO4 = process.env.AZURE_ENABLE_O4_ESCALATION === 'true' || config.enableDeepReasoning === true;
        if (modelName === "gpt-4.1-mini") {
            return enableO4 ? ["gpt-4.1-mini", "gpt-4o-mini", "o4-mini"] : ["gpt-4.1-mini", "gpt-4o-mini"];
        }
        return [modelName];
    }

    async callAzureChat({ deployment, messages, config = {} }) {
        const url = `${this.azureOpenAIEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${encodeURIComponent(this.azureOpenAIApiVersion)}`;
        const payload = {
            messages,
            temperature: typeof config?.generationConfig?.temperature === 'number' ? config.generationConfig.temperature : 0.4,
            max_tokens: Math.min(config?.generationConfig?.maxOutputTokens || 1024, 4096)
        };
        const response = await axios.post(url, payload, {
            headers: {
                "api-key": this.azureOpenAIApiKey,
                "Content-Type": "application/json"
            },
            timeout: 120000
        });
        return response?.data;
    }

    async generateContentWithAzureOpenAI(prompt, config = {}) {
        const requestedModel = config.model || "ace-it-flash";
        const resolvedModel = this.resolveAzureModel(requestedModel);
        const candidates = this.resolveAzureFallbackChain(resolvedModel, config);
        const messages = this.normalizeGroqMessages(prompt, config.systemInstruction);
        let lastErr = null;

        for (const candidate of candidates) {
            try {
                const deployment = this.azureDeploymentMap[candidate] || candidate;
                const data = await this.callAzureChat({ deployment, messages, config });
                const text = data?.choices?.[0]?.message?.content || '';
                return {
                    response: {
                        text: () => text,
                        candidates: [{ content: { parts: [{ text }] } }],
                        usageMetadata: data?.usage ? {
                            promptTokenCount: data.usage.prompt_tokens,
                            candidatesTokenCount: data.usage.completion_tokens,
                            totalTokenCount: data.usage.total_tokens
                        } : null
                    },
                    usedModel: candidate,
                    usedPlatform: 'azure_openai'
                };
            } catch (err) {
                lastErr = err;
                const status = err?.response?.status || err?.status;
                const msg = err?.response?.data?.error?.message || err.message;
                console.warn(`[AIService] Azure OpenAI ${candidate} failed (${status || 'unknown'}): ${msg}`);
            }
        }

        const status = lastErr?.response?.status || lastErr?.status || 'unknown';
        const msg = lastErr?.response?.data?.error?.message || lastErr?.message || 'Unknown Azure OpenAI error';
        const wrapped = new Error(`Azure OpenAI failed (${status}): ${msg}`);
        wrapped.status = status;
        throw wrapped;
    }

    /**
     * Robustly extracts the first valid JSON object/array from text.
     */
    extractJson(text) {
        let startIndex = text.indexOf('{');
        let arrayStartIndex = text.indexOf('[');

        // Determine if it's likely an object or array
        let start = startIndex;
        if (arrayStartIndex !== -1 && (startIndex === -1 || arrayStartIndex < startIndex)) {
            start = arrayStartIndex;
        }

        if (start === -1) return text; // No JSON found

        let openChar = text[start];
        let closeChar = openChar === '{' ? '}' : ']';
        let balance = 0;
        let end = -1;
        let insideString = false;
        let escape = false;

        for (let i = start; i < text.length; i++) {
            const char = text[i];

            if (escape) {
                escape = false;
                continue;
            }
            if (char === '\\') {
                escape = true;
                continue;
            }
            if (char === '"') {
                insideString = !insideString;
                continue;
            }

            if (!insideString) {
                if (char === openChar) {
                    balance++;
                } else if (char === closeChar) {
                    balance--;
                    if (balance === 0) {
                        end = i;
                        break;
                    }
                }
            }
        }

        if (end !== -1) {
            return text.substring(start, end + 1);
        }
        return text; // Fallback
    }

    /**
     * Helper to generate and parse JSON
     */
    async generateJson(prompt, config = {}, retries = 6) {
        // Enforce JSON mime type if supported
        const jsonConfig = {
            ...config,
            generationConfig: {
                ...config.generationConfig,
                responseMimeType: "application/json"
            }
        };

        const result = await this.generateContent(prompt, jsonConfig, retries);
        const usedModel = result.usedModel;
        console.log(`[GenerativeAIService] Getting response text from ${usedModel}...`);
        
        let text;
        try {
            text = result.response.text();
            if (!text) throw new Error("No text content found in AI response.");
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            
            console.log(`[GenerativeAIService] Raw AI Response Length:`, text.length);
        } catch (textError) {
            console.error('[GenerativeAIService] Failed to get response text:', textError);
            throw textError;
        }

        try {
            // 1. Robust Extraction
            const rawText = this.extractJson(text);

            // 2. ARCHITECT'S ABSOLUTE PRECISION HARDENING (v1.9.5)
            const hardenJson = (str) => {
                let hardened = "";
                let insideString = false;
                for (let i = 0; i < str.length; i++) {
                    const char = str[i];
                    if (char === '"') {
                        let backslashCount = 0;
                        for (let j = i - 1; j >= 0 && str[j] === '\\'; j--) {
                            backslashCount++;
                        }
                        if (backslashCount % 2 === 0) insideString = !insideString;
                        hardened += char;
                    }
                    else if (insideString && char === '\\') {
                        // JSON escaping: \, ", /, b, f, n, r, t, u
                        const nextChar = str[i + 1];
                        const escapable = ['\\', '"', '/', 'b', 'f', 'n', 'r', 't', 'u'].includes(nextChar);

                        if (escapable) {
                            hardened += "\\"; // Keep existing valid escape
                        } else {
                            hardened += "\\\\"; // Escape an unescaped backslash (likely for LaTeX like \times)
                        }
                    }
                    else if (insideString) {
                        const code = char.charCodeAt(0);
                        if (code < 32) {
                            if (char === '\n') hardened += "\\n";
                            else if (char === '\r') hardened += "\\r";
                            else if (char === '\t') hardened += "\\t";
                            else hardened += "\\u" + code.toString(16).padStart(4, '0');
                        } else {
                            hardened += char;
                        }
                    }
                    else {
                        hardened += char;
                    }
                }
                return hardened;
            };

            const safeText = hardenJson(rawText)
                .replace(/,\s*([}\]])/g, '$1')
                .replace(/,\s*\.\s*([}\]])/g, '$1')
                .replace(/([}\]])\s*\.\s*$/g, '$1');

            // 3. Attempt Parse
            const data = JSON.parse(safeText);
            return { data, model: usedModel, audio: result.audio };

        } catch (e) {
            console.warn(`[AIService] JSON Parse/Hardening Failed: ${e.message}. Attempting simple raw fallback...`);
            console.log(`[AIService] Corrupted Text Fragment: ${text ? text.substring(0, 500) : 'NULL'}`);

            try {
                // 4. Final Fallback: Parse the raw extracted JSON without any hardening
                const rawText = this.extractJson(text);
                const data = JSON.parse(rawText);
                return { data, model: usedModel, audio: result.audio };
            } catch (fallbackError) {
                console.error("[AIService] JSON Final Fallback Failed!");
                console.error("[AIService] Full Raw Text for Debugging:", text);
                throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
            }
        }
    }

    /**
     * Unified sendMessage method
     */
    async sendMessage(chatSession, message, config = {}, retries = 6) {
        return this.executeWithRetry(async (retryModel, isRetry) => {
            if (isRetry) {
                const contents = Array.isArray(message) 
                    ? message 
                    : [{ role: 'user', parts: [{ text: message.toString() }] }];
                return await retryModel.generateContent({ contents });
            }
            return await chatSession.sendMessage(message);
        }, message, config, retries);
    }

    /**
     * Core retry/failover logic - SHARPENED for higher reliability
     */
    async executeWithRetry(action, input, config = {}, retries = 6) {
        // [COST GUARD]: Reduce retries in DEV to prevent "Retry Storms" that burn quota/tokens
        const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || !process.env.K_SERVICE;
        const effectiveRetries = isDev ? Math.min(retries, 2) : retries;
        
        await this.init();
        if (this.isGroq || this.activeProvider === 'groq' || this.isAzureOpenAI || this.activeProvider === 'azure_openai' || this.isDeepSeek || this.activeProvider === 'deepseek') {
            throw new Error("Current provider uses direct adapter path; executeWithRetry path is blocked.");
        }

        // 🛡️ FREE TIER PROTECTION: Wait if we are hitting the 15 RPM limit in DEV
        if (isDev) {
            await this.enforceFreeTierLimits();
        }

        let requestedModel = config.model || "ace-it-flash";
        let isProModel = requestedModel.includes("pro") || (typeof config.highQuality === 'boolean' && config.highQuality);
        const isDevelopment = (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) && process.env.FORCE_VERTEX_IN_DEV !== 'true';

        // --- COST GUARD RATE LIMITER (DEV ONLY) ---
        if (isDevelopment && isProModel) {
            // [STRICT FREE MODE]: If in DEV and trying to use a Pro model without explicit bypass
            if (process.env.ALLOW_PAID_PRO !== 'true') {
                console.warn(`[AIService] 🛡️  SAFETY BREAKER: Blocked a 'Pro' request to protect your balance. Redirecting to Flash...`);
                // Force it to be a Flash model instead of throwing to keep the app working
                config.model = "ace-it-flash";
                requestedModel = "ace-it-flash"; // CRITICAL FIX: Update the local pointer too
                isProModel = false;             // CRITICAL FIX: Reset the quality flag
            } else {
                const now = Date.now();
                if (now - this.lastResetTime > 60000) { // Reset hourly window (using 1 min for demo/safety)
                    this.proRequestCount = 0;
                    this.lastResetTime = now;
                }

                this.proRequestCount++;
                if (this.proRequestCount > 20) { // Threshold: 20 Pro requests per minute in Dev
                    console.error(`[AIService] 🛑 COST GUARD: High volume of Pro requests detected in DEV (${this.proRequestCount}). Blocking to prevent token leak.`);
                    throw new Error("⚠️ DEV COST GUARD: Too many Pro requests. Please check your loops or wait 1 minute.");
                }
            }
        }

        // Approved Hierarchy: Standard (Flash) vs Premium (Pro)
        let modelQueue;

        if (this.isVertex) {
            // VERTEX AI SPECIFIC QUEUE - Optimized for 2026 Stable Models
            if (isProModel) {
                modelQueue = ["ace-it-pro"];
            } else {
                modelQueue = ["ace-it-flash"];
            }
        } else {
            // AI STUDIO QUEUE (Local Development)
            if (isProModel) {
                modelQueue = ["ace-it-pro", "gemini-flash-latest"];
            } else {
                modelQueue = ["ace-it-flash"];
            }
            
            // Respect explicitly requested model if provided (and not in the map)
            if (config.model && !this.studioModelMap[config.model]) {
                modelQueue.unshift(config.model);
            }
        }

        // Resolve model aliases for both Vertex AI and AI Studio
        let effectiveRequestedModel = requestedModel;
        if (this.isVertex && this.vertexModelMap?.[requestedModel]) {
            effectiveRequestedModel = this.vertexModelMap[requestedModel];
        } else if (!this.isVertex && this.studioModelMap?.[requestedModel]) {
            // CRITICAL FIX: Add missing resolution for AI Studio aliases (ace-it-pro -> gemini-flash-latest in DEV)
            effectiveRequestedModel = this.studioModelMap[requestedModel];
        }

        const uniqueQueue = [...new Set(modelQueue)];

        // Ensure requested model is at the front
        if (effectiveRequestedModel) {
            const finalQueue = uniqueQueue.filter(m => m !== effectiveRequestedModel);
            finalQueue.unshift(effectiveRequestedModel);
            modelQueue = finalQueue;
        } else {
            modelQueue = uniqueQueue;
        }

        let lastError = null;
        const unavailableModels = new Set();

        // If isProModel is true, we increase retries specifically for the Pro models
        const totalRetries = isProModel ? Math.min(effectiveRetries, 3) : effectiveRetries;

        for (let i = 0; i < totalRetries; i++) {
            let currentModelName;

            // Smarter model selection: skip known-bad models
            const workingQueue = uniqueQueue.filter(m => !unavailableModels.has(m));
            if (workingQueue.length === 0) {
                console.error("[AIService] CRITICAL: All models in queue have failed.");
                break;
            }

            if (isProModel && i < 4 && !unavailableModels.has(uniqueQueue[0])) {
                // For high quality, stay on the first (best) model for the first 4 attempts
                currentModelName = uniqueQueue[0];
            } else {
                // Otherwise rotate through the queue of working models
                currentModelName = workingQueue[Math.min(i, workingQueue.length - 1)];
            }
            
            // SECURITY: Ensure we don't accidentally use a model known to be 404 in this env
            // [Removed forced -001 mapping to support environment-agnostic model resolution]

            try {
                const modelConfig = { ...config, model: currentModelName };
                const model = this.getModel(modelConfig);
                const actualModelName = model.model || model._modelName || currentModelName;

                console.log(`[AIService] Attempt ${i + 1}/${totalRetries}: Using model '${currentModelName}'${isProModel ? ' (High Quality Mode)' : ''}${currentModelName !== actualModelName ? ` -> Redirected to: ${actualModelName}` : ''}`);
                
                const result = await action(model, i > 0, currentModelName);
                // Return the raw result (with .response) but also include diagnostic metadata
                if (typeof result === 'object' && result !== null) {
                    result.usedModel = currentModelName;
                    result.usedPlatform = this.isVertex ? 'vertex' : 'studio';
                }
                return result;
            } catch (error) {
                lastError = error;
                const isRateLimit = error.message?.includes('429') || error.message?.toLowerCase().includes('resource exhausted');
                const isOverloaded = error.message?.includes('503') || error.message?.toLowerCase().includes('busy') || error.message?.toLowerCase().includes('overloaded');

                console.error(`[AIService] FAILED Attempt ${i + 1} (${currentModelName}):`, error.message);
                if (error.status) console.error(`[AIService] Error Status: ${error.status}`);

                // Deep extraction for Vertex AI errors
                if (this.isVertex && error.response) {
                    try {
                        console.error(`[AIService] Vertex Error Payload:`, JSON.stringify(error.response, null, 2));
                    } catch (e) { }
                }

                if (error.stack) console.error(`[AIService] Error Stack: ${error.stack.substring(0, 300)}...`);

                // If it's a model-not-supported error or region restriction, or a low-level fetch failure, try next model IMMEDIATELY
                const errorStr = (error.message || "").toLowerCase();
                const isUnavailable =
                    error.status === 404 ||
                    error.status === 501 ||
                    errorStr.includes('404') ||
                    errorStr.includes('501') ||
                    errorStr.includes('fetch failed') || // Handle Node low-level network failures
                    errorStr.includes('not found') ||
                    errorStr.includes('location is not supported') ||
                    errorStr.includes('model is not available');

                if (isUnavailable) {
                    // REGIONAL FAILOVER: If Singapore fails, pivot to US-Central1
                    if (this.isVertex && this.currentRegion === 'asia-southeast1') {
                        console.warn(`[AIService] [FAILOVER] Singapore region reported 404/Unreachable. Pivoting to US...`);
                        const pivoted = await this.switchToFailsafeRegion();
                        if (pivoted) {
                            i--; // Retry same attempt index but in new region
                            continue;
                        }
                    }

                    console.warn(`[AIService] Model ${currentModelName} unavailable, unreachable, or restricted. Error: ${error.message}. Removing from working set and falling back...`);
                    unavailableModels.add(currentModelName);
                    continue;
                }

                // [2026] Multimodal Failsafe: If model doesn't support audio modality, fallback to text-only
                const isTextOnlyError = error.message?.toLowerCase().includes('only supports text output') || 
                                       error.message?.toLowerCase().includes('unsupported modality') ||
                                       error.message?.toLowerCase().includes('requested response modalities');
                if (isTextOnlyError && config.audioOutput) {
                    console.warn(`[AIService] ⚠️ Model ${currentModelName} does not support audio output. Falling back to text-only mode for this request.`);
                    config.audioOutput = false; 
                    i--; // Retry same attempt but without audio
                    continue;
                }

                if (i < totalRetries - 1) {
                    // Exponential backoff
                    let waitBase = isRateLimit ? 15000 : 3000;
                    if (isProModel) waitBase *= 1.5; // Wait longer in high quality mode to recover quota

                    const delay = (Math.pow(2, i % 5) * waitBase) + (Math.random() * 5000);

                    console.log(`[AIService] ${isRateLimit ? 'QUOTA HIT (429)' : 'SERVICE BUSY (503)'}. Retrying in ${Math.round(delay)}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // Final Failure: provide architectural context
                if (isProModel && isRateLimit) {
                    throw new Error("⚠️ HKDSE-PRO QUOTA EXHAUSTED: Gemini Pro is currently at its limit. Please try again in 1 minute.");
                }
                if (!isProModel && isRateLimit) {
                    throw new Error("⚠️ QUOTA EXHAUSTED: Gemini Flash is currently at its limit. Please wait a moment and try again.");
                }
                throw error;
            }
        }
        if (lastError) {
            console.error(`[AIService] Final failure after ${totalRetries} attempts. Last model tried: ${uniqueQueue[uniqueQueue.length - 1]}`);
            throw lastError;
        }
    }
}

module.exports = new GenerativeAIService();
