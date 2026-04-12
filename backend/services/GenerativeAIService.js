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
        console.log("[AIService] Init called. VERTEX_ENABLED:", process.env.VERTEX_ENABLED, "K_SERVICE:", process.env.K_SERVICE);
        if (this.initialized) return;

        // Determination Logic:
        // Use Vertex AI if K_SERVICE is set (Production) 
        // or if VERTEX_ENABLED is explicitly true.
        if (process.env.K_SERVICE || process.env.VERTEX_ENABLED === 'true') {
            try {
                const { VertexAI } = require('@google-cloud/vertexai');

                // Allow local developers to use Vertex AI by providing a service account path
                // Returning to Hong Kong (asia-east2) as user has confirmed quota/paid account
                const vertexOptions = {
                    project: process.env.GOOGLE_CLOUD_PROJECT || 'ace-it-learning',
                    location: 'asia-east2'
                };

                this.vertex = new VertexAI(vertexOptions);
                this.isVertex = true;
                console.log(`[AIService] Re-Initialized Vertex AI in HONG KONG (asia-east2)`);
            } catch (e) {
                console.error("[AIService] Vertex AI Initialization failed, falling back to AI Studio:", e.message);
                this.initAIStudio();
            }
        } else {
            this.initAIStudio();
        }

        this.initialized = true;
    }

    initAIStudio() {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("[AIService] Warning: No GOOGLE_API_KEY or GEMINI_API_KEY found for AI Studio fallback.");
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.isVertex = false;
        console.log("[AIService] Initialized Google AI Studio (Local Mode)");
    }

    /**
     * Get a generative model instance
     */
    getModel(config = {}) {
        const modelName = config.model || "gemini-2.0-flash";
        const generationConfig = config.generationConfig || {};

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        const modelOptions = {
            model: modelName,
            generationConfig: generationConfig,
            safetySettings: safetySettings
        };

        if (config.systemInstruction) {
            modelOptions.systemInstruction = config.systemInstruction;
        }

        if (this.isVertex) {
            console.log(`[AIService] [VERTEX] Routing: ${modelName}`);
            return this.vertex.getGenerativeModel(modelOptions);
        } else {
            console.log(`[AIService] [STUDIO] Routing: ${modelName} (API: v1beta)`);
            const requestOptions = {
                timeout: 300000,
                apiVersion: 'v1beta' // Crucial for gemini-2.0-flash and latest features
            };
            return this.genAI.getGenerativeModel(modelOptions, requestOptions);
        }
    }

    /**
     * Unified generateContent method with automatic retry and Smart Fallback
     */
    async generateContent(prompt, config = {}, retries = 3) {
        return this.executeWithRetry(async (model) => {
            return await model.generateContent(prompt);
        }, prompt, config, retries);
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
            console.log(`[GenerativeAIService] Raw AI Response Length:`, text ? text.length : 'N/A');
        } catch (textError) {
            console.error('[GenerativeAIService] Failed to get response text:', textError);
            console.error('[GenerativeAIService] Response object:', JSON.stringify(result.response, null, 2));
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
            return { data, model: usedModel };

        } catch (e) {
            console.warn(`[AIService] JSON Parse/Hardening Failed: ${e.message}. Attempting simple raw fallback...`);
            console.log(`[AIService] Corrupted Text Fragment: ${text ? text.substring(0, 500) : 'NULL'}`);

            try {
                // 4. Final Fallback: Parse the raw extracted JSON without any hardening
                const rawText = this.extractJson(text);
                const data = JSON.parse(rawText);
                return { data, model: usedModel };
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

        const requestedModel = config.model || "gemini-2.0-flash";
        const isProModel = requestedModel.includes("pro");
        const highQuality = config.highQuality === true;

        // Approved Hierarchy: Standard (Flash) vs Premium (Pro)
        let modelQueue;
        
        if (this.isVertex) {
            // VERTEX AI SPECIFIC QUEUE (Optimized for asia-east2 stable foundation models)
            if (isProModel) {
                modelQueue = ["gemini-1.5-pro-002", "gemini-1.5-pro-001", "gemini-1.5-pro"];
            } else {
                modelQueue = ["gemini-1.5-flash-002", "gemini-1.5-flash-001", "gemini-1.5-flash"];
            }
        } else {
            // AI STUDIO QUEUE (Local Development)
            if (isProModel) {
                modelQueue = ["gemini-1.5-pro", "gemini-1.5-pro-latest", "gemini-2.0-flash"];
            } else {
                modelQueue = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash"];
            }
        }

        // FORCE REQUESTED MODEL TO FRONT (If valid for the platform)
        if (requestedModel && !modelQueue.includes(requestedModel)) {
            // If requested model isn't in stable queue, honor it but it might 404
            modelQueue.unshift(requestedModel);
        } else if (requestedModel) {
            modelQueue = modelQueue.filter(m => m !== requestedModel);
            modelQueue.unshift(requestedModel);
        }

        const uniqueQueue = [...new Set(modelQueue)];
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
                // Return the raw result (with .response) but also include the model name
                const finalResult = result;
                if (typeof finalResult === 'object') {
                    finalResult.usedModel = currentModelName;
                    // For backward compatibility with server.js where it expects result.response
                    // the Google SDK result already has a .response property.
                }
                return finalResult;
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
                    } catch (e) {}
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
                    throw new Error("⚠️ HKDSE-PRO QUOTA EXHAUSTED: Gemini 1.5 Pro is currently at its limit in Development. Please try again in 1 minute, or enable Vertex AI locally for enterprise bandwidth.");
                }
                if (!isProModel && isRateLimit) {
                    throw new Error("⚠️ QUOTA EXHAUSTED: Gemini 2.0 Flash is currently at its limit. Please wait a moment and try again.");
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
