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
        console.log("[AIService] Init called. VERTEX_ENABLED:", process.env.VERTEX_ENABLED, "CLOUD_RUN:", process.env.CLOUD_RUN_SERVICE);
        if (this.initialized) return;

        // Determination Logic:
        // Use Vertex AI if CLOUD_RUN_SERVICE is set (Production) 
        // or if VERTEX_ENABLED is explicitly true.
        if (process.env.CLOUD_RUN_SERVICE || process.env.VERTEX_ENABLED === 'true') {
            try {
                const { VertexAI } = require('@google-cloud/vertexai');

                // Allow local developers to use Vertex AI by providing a service account path
                const vertexOptions = {
                    project: process.env.GOOGLE_CLOUD_PROJECT,
                    location: process.env.GOOGLE_CLOUD_LOCATION || 'asia-east2'
                };

                // If running locally and a key file is provided, Google Cloud SDK will pick it up 
                // from GOOGLE_APPLICATION_CREDENTIALS automatically if it's set in the env.

                this.vertex = new VertexAI(vertexOptions);
                this.isVertex = true;
                console.log(`[AIService] Initialized Vertex AI (Region: ${vertexOptions.location})`);
            } catch (e) {
                console.error("[AIService] Failed to load Vertex SDK, falling back to AI Studio:", e);
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
    async generateJson(prompt, config = {}, retries = 3) {
        // Enforce JSON mime type if supported
        const jsonConfig = {
            ...config,
            generationConfig: {
                ...config.generationConfig,
                responseMimeType: "application/json"
            }
        };

        const result = await this.generateContent(prompt, jsonConfig, retries);
        console.log('[GenerativeAIService] Getting response text...');
        let text;
        try {
            text = result.response.text();
            console.log('[GenerativeAIService] Raw AI Response Length:', text ? text.length : 'N/A');
        } catch (textError) {
            console.error('[GenerativeAIService] Failed to get response text:', textError);
            console.error('[GenerativeAIService] Response object:', JSON.stringify(result.response, null, 2));
            throw textError;
        }

        try {
            // 1. Robust Extraction
            const cleanText = this.extractJson(text);

            // 2. Attempt Parse
            return JSON.parse(cleanText);

        } catch (e) {
            console.warn(`[AIService] JSON Parse Failed: ${e.message}. Attempting Auto-Repair...`);

            let rawText = "";
            try {
                // 3. Auto-Repair: Fix common LaTeX and control character issues
                rawText = this.extractJson(text);

                // --- ARCHITECT'S ABSOLUTE PRECISION REPAIR ---
                const repairJson = (str) => {
                    let repaired = "";
                    let insideString = false;

                    for (let i = 0; i < str.length; i++) {
                        const char = str[i];

                        if (char === '"') {
                            // Check if this quote is escaped
                            let backslashCount = 0;
                            for (let j = i - 1; j >= 0 && str[j] === '\\'; j--) {
                                backslashCount++;
                            }
                            // If even number of backslashes before it, it's a structural quote
                            if (backslashCount % 2 === 0) {
                                insideString = !insideString;
                            }
                            repaired += char;
                        }
                        else if (insideString && char === '\\') {
                            // Inside a string, literal backslashes are the #1 cause of failure in Maths Apps.
                            // We MUST ensure they are escaped for JSON, UNLESS they are escaping a quote.
                            const nextChar = str[i + 1];
                            if (nextChar === '"') {
                                repaired += "\\"; // Let it escape the quote: \" 
                            } else {
                                repaired += "\\\\"; // Double it: \\ which JSON.parse sees as one literal \
                            }
                        }
                        else if (insideString) {
                            // Handle raw control characters inside strings
                            const code = char.charCodeAt(0);
                            if (code < 32) {
                                if (char === '\n') repaired += "\\n";
                                else if (char === '\r') repaired += "\\r";
                                else if (char === '\t') repaired += "\\t";
                                else repaired += "\\u" + code.toString(16).padStart(4, '0');
                            } else {
                                repaired += char;
                            }
                        }
                        else {
                            repaired += char;
                        }
                    }
                    return repaired;
                };

                const repairedText = repairJson(rawText)
                    .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas: [1,2,] -> [1,2]
                    .replace(/,\s*\.\s*([}\]])/g, '$1') // Remove hallucinated trailing dots: [1,2,. ] -> [1,2]
                    .replace(/([}\]])\s*\.\s*$/g, '$1'); // Remove trailing dots after final bracket: { ... }. -> { ... }

                return JSON.parse(repairedText);

            } catch (repairError) {
                console.error("[AIService] JSON Parse & Repair Failed!");
                console.error("Original Error:", e.message);
                console.error("Repair Error:", repairError.message);

                // Detailed context log
                const pos = parseInt(repairError.message.match(/position (\d+)/)?.[1] || "0");
                const snippet = rawText.substring(Math.max(0, pos - 20), Math.min(rawText.length, pos + 20));
                console.error(`Error at/near: "${snippet}"`);
                console.error(`Raw Text Tail: "${rawText.slice(-500)}"`); // Log the end of the response

                throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
            }
        }
    }

    /**
     * Unified sendMessage method
     */
    async sendMessage(chatSession, message, config = {}, retries = 3) {
        return this.executeWithRetry(async (model, isRetry) => {
            if (isRetry) {
                return await model.generateContent(message);
            }
            return await chatSession.sendMessage(message);
        }, message, config, retries);
    }

    /**
     * Core retry/failover logic - SHARPENED for higher reliability
     */
    async executeWithRetry(action, input, config = {}, retries = 3) {
        await this.init();

        const requestedModel = config.model || "gemini-2.0-flash";
        const isProModel = requestedModel.includes("pro");

        // Approved Hierarchy: Standard (Flash) vs Premium (Pro)
        let modelQueue;
        if (isProModel) {
            // Priority: 2.5 Pro -> 1.5 Pro -> 2.0 Flash (Strongest Fallback) -> Flash Latest
            modelQueue = ["gemini-2.5-pro", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-flash-latest"];
        } else {
            // Priority: 2.0 Flash (Primary) -> 2.0 Flash Lite (Fast Backup) -> Flash Latest (Catch-all)
            modelQueue = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-flash-latest"];
        }

        // FORCE REQUESTED MODEL TO FRONT
        if (requestedModel && !modelQueue.includes(requestedModel)) {
            modelQueue.unshift(requestedModel);
        } else if (requestedModel) {
            // Move to front
            modelQueue = modelQueue.filter(m => m !== requestedModel);
            modelQueue.unshift(requestedModel);
        }

        const uniqueQueue = [...new Set(modelQueue)];

        let lastError = null;
        for (let i = 0; i < retries; i++) {
            // If we have more retries than models, we loop back but might want different variants.
            // For now, simple rotation is fine.
            const currentModelName = uniqueQueue[Math.min(i, uniqueQueue.length - 1)];

            try {
                console.log(`[AIService] Attempt ${i + 1}/${retries}: Using model '${currentModelName}'`);
                const model = this.getModel({ ...config, model: currentModelName });
                return await action(model, i > 0, currentModelName);
            } catch (error) {
                lastError = error;
                const isRateLimit = error.message?.includes('429') || error.message?.toLowerCase().includes('resource exhausted');
                const isOverloaded = error.message?.includes('503') || error.message?.toLowerCase().includes('busy') || error.message?.toLowerCase().includes('overloaded');

                console.error(`[AIService] FAILED Attempt ${i + 1} (${currentModelName}):`, error.message);
                if (error.status) console.error(`[AIService] Error Status: ${error.status}`);

                // If it's a model-not-supported error or region restriction, try next model IMMEDIATELY
                const isUnavailable =
                    error.message?.includes('404') ||
                    error.message?.includes('501') ||
                    error.status === 404 ||
                    error.status === 501 ||
                    error.message?.toLowerCase().includes('not found') ||
                    error.message?.toLowerCase().includes('location is not supported');

                if (isUnavailable) {
                    console.warn(`[AIService] Model ${currentModelName} unavailable, not found, or restricted in this region. Error: ${error.message}. Trying next in queue...`);
                    continue;
                }

                if (i < retries - 1) {
                    // Exponential backoff
                    // Rate limits (429) need much longer waits than simple overload (503)
                    // Free tier keys for 2.0 can have very low limits (e.g. 2-10 RPM)
                    const waitBase = isRateLimit ? 10000 : 3000;
                    const delay = (Math.pow(1.5, i) * waitBase) + (Math.random() * 3000);

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
            console.error(`[AIService] Final failure after ${retries} attempts. Last model tried: ${uniqueQueue[uniqueQueue.length - 1]}`);
            throw lastError;
        }
    }
}

module.exports = new GenerativeAIService();
