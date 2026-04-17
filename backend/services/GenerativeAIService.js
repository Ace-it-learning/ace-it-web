const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const path = require('path');
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
    }

    async init() {
        if (this.initialized) return;

        // Configuration
        const NODE_ENV = process.env.NODE_ENV || 'development';
        const isProduction = NODE_ENV === 'production' || !!process.env.K_SERVICE;
        const forceAIStudio = process.env.USE_AI_STUDIO_IN_PROD === 'true';

        // Use Vertex ONLY if in Production AND not forced to AI Studio
        if (isProduction && !forceAIStudio) {
            try {
                const { VertexAI } = require('@google-cloud/vertexai');
                const fs = require('fs');
                
                // 2026 ARCHITECTURAL REQUIREMENTS:
                // 1. Project ID: Dynamically retrieved from SA JSON
                // 2. Location: asia-southeast1 (Singapore)
                // 3. Auth: Explicitly load antigravity-tutor-prod-key.json
                
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
                this.currentRegion = region;
                this.vertexConfig = vertexConfig; 

                // 2026 Model Mapping
                this.vertexModelMap = {
                    "ace-it-flash": "gemini-1.5-flash",
                    "ace-it-pro": "gemini-1.5-pro",
                    "ace-it-multimodal": "gemini-1.5-flash",
                    "gemini-flash-latest": "gemini-1.5-flash",
                    "gemini-pro-latest": "gemini-1.5-pro",
                    "gemini-1.5-flash": "gemini-1.5-flash",
                    "gemini-1.5-pro": "gemini-1.5-pro",
                    "gemini-2.0-flash": "gemini-1.5-flash",
                    "gemini-2.5-flash": "gemini-1.5-flash",
                    "gemini-2.5-pro": "gemini-1.5-pro",
                    "gemini-3.1-flash": "gemini-1.5-flash", 
                    "gemini-3.5-pro": "gemini-1.5-pro"
                };

                console.log(`[AIService] 🚀 Vertex AI Production Online (${region})`);

            } catch (e) {
                console.error("[AIService] ❌ Vertex AI Production Initialization Failed:", e.message);
                console.warn("[AIService] ⚠️ Falling back to AI Studio...");
                this.initAIStudio();
            }
        } else {
            // Development environment or forced AI Studio
            this.initAIStudio();
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
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.isVertex = false;
        this.currentRegion = 'global/api_key';

        this.studioModelMap = {
            "ace-it-flash": "gemini-2.5-flash-lite",
            "ace-it-pro": "gemini-2.5-pro",
            "ace-it-multimodal": "gemini-2.5-flash-lite",
            "gemini-flash-latest": "gemini-2.5-flash-lite",
            "gemini-pro-latest": "gemini-2.5-pro",
            "gemini-1.5-flash": "gemini-2.5-flash-lite",
            "gemini-1.5-pro": "gemini-2.5-pro",
            "gemini-2.0-flash": "gemini-2.5-flash-lite",
            "gemini-3.1-flash": "gemini-2.5-flash-lite",
            "gemini-2.5-pro": "gemini-2.5-pro",
            "gemini-3.1-pro": "gemini-2.5-pro"
        };

        console.log("[AIService] Initialized Google AI Studio (Local Mode)");
    }

    getModel(config = {}) {
        const requested = config.model || "ace-it-flash";

        let modelName = requested;
        if (this.isVertex && this.vertexModelMap?.[requested]) {
            modelName = this.vertexModelMap[requested];
        } else if (!this.isVertex) {
            // Local AI Studio: Use stable aliases (gemini-flash-latest) instead of versioned IDs that may 404
            modelName = this.studioModelMap?.[requested] || requested || "gemini-flash-latest";
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
                    ...(config.audioOutput ? { 
                        responseModalities: ["text", "audio"],
                        speechConfig: config.speechConfig || {
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Achird" } }
                        }
                    } : {})
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
            console.log(`[AIService] [STUDIO] Routing: ${modelName}`);

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

            const apiVersion = config.audioOutput ? 'v1beta' : 'v1';
            
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

            // [2026] Multimodal Audio Config - ONLY available in v1beta
            if (config.audioOutput) {
                modelOptions.generationConfig = {
                    ...modelOptions.generationConfig,
                    responseModalities: ["text", "audio"],
                    speechConfig: config.speechConfig || {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Achird" } }
                    }
                };
            }

            return this.genAI.getGenerativeModel(modelOptions, { apiVersion });
        }
    }

    /**
     * Unified generateContent method with automatic retry and Smart Fallback
     */
    async generateContent(prompt, config = {}, retries = 3) {
        const result = await this.executeWithRetry(async (model) => {
            return await model.generateContent(prompt);
        }, prompt, config, retries);

        // Standardize the response structure (Ensuring .text() is ALWAYS a function)
        if (result && result.response) {
            if (typeof result.response.text !== 'function') {
                const rawText = result.response?.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || "";
                result.response.text = () => rawText;
            }

            // [2026] Extract Multimodal Audio Content
            const parts = result.response?.candidates?.[0]?.content?.parts || [];
            const audioPart = parts.find(p => p.inlineData || p.fileData);
            if (audioPart && audioPart.inlineData) {
                result.audio = audioPart.inlineData.data; // Base64
                console.log(`[AIService] 🎙️ Multimodal Audio Extracted (${result.audio.length} bytes)`);
            } else if (config.audioOutput) {
                console.warn(`[AIService] ⚠️ Audio Output requested but no audio part found in response.`);
                console.warn(`[AIService] Response Parts:`, JSON.stringify(parts, null, 2));
            }
        }

        return result;
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
                // If a retry is triggered with a different model, the original chatSession 
                // is no longer compatible. We fall back to standard stateless generation 
                // for the retry attempt to ensure the user gets a response.
                return await retryModel.generateContent(message);
            }
            return await chatSession.sendMessage(message);
        }, message, config, retries);
    }

    /**
     * Core retry/failover logic - SHARPENED for higher reliability
     */
    async executeWithRetry(action, input, config = {}, retries = 6) {
        await this.init();

        const requestedModel = config.model || "ace-it-flash";
        const isProModel = requestedModel.includes("pro");
        const highQuality = config.highQuality === true;

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
                modelQueue = ["ace-it-pro"];
            } else {
                modelQueue = ["ace-it-flash"];
            }
        }

        // Resolve model aliases for Vertex AI
        let effectiveRequestedModel = requestedModel;
        if (this.isVertex && this.vertexModelMap?.[requestedModel]) {
            effectiveRequestedModel = this.vertexModelMap[requestedModel];
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

        // If highQuality is true, we increase retries specifically for the Pro models
        const totalRetries = highQuality ? Math.max(retries, 15) : retries;

        for (let i = 0; i < totalRetries; i++) {
            let currentModelName;

            // Smarter model selection: skip known-bad models
            const workingQueue = uniqueQueue.filter(m => !unavailableModels.has(m));
            if (workingQueue.length === 0) {
                console.error("[AIService] CRITICAL: All models in queue have failed.");
                break;
            }

            if (highQuality && i < 4 && !unavailableModels.has(uniqueQueue[0])) {
                // For high quality, stay on the first (best) model for the first 4 attempts
                currentModelName = uniqueQueue[0];
            } else {
                // Otherwise rotate through the queue of working models
                currentModelName = workingQueue[Math.min(i, workingQueue.length - 1)];
            }

            try {
                console.log(`[AIService] Attempt ${i + 1}/${totalRetries}: Using model '${currentModelName}'${highQuality ? ' (High Quality Mode)' : ''}`);
                const model = this.getModel({ ...config, model: currentModelName });
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

                if (i < totalRetries - 1) {
                    // Exponential backoff
                    let waitBase = isRateLimit ? 15000 : 3000;
                    if (highQuality) waitBase *= 1.5; // Wait longer in high quality mode to recover quota

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
