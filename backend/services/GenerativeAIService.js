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
                this.vertex = new VertexAI({
                    project: process.env.GOOGLE_CLOUD_PROJECT,
                    location: process.env.GOOGLE_CLOUD_LOCATION || 'asia-east2'
                });
                this.isVertex = true;
                console.log(`[AIService] Initialized Vertex AI (Region: ${process.env.GOOGLE_CLOUD_LOCATION || 'asia-east2'})`);
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
     * @param {Object} config - { model, generationConfig, systemInstruction }
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
            console.log(`[AIService] Routing to Vertex AI: ${modelName}`);
            return this.vertex.getGenerativeModel(modelOptions);
        } else {
            console.log(`[AIService] Routing to AI Studio: ${modelName}`);
            const requestOptions = { timeout: 300000 }; // 5 minutes for Deep Dive
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
     * Helper to generate and parse JSON
     */
    async generateJson(prompt, config = {}, retries = 3) {
        // Enforce JSON mime type if supported (Vertex/Gemini 1.5+)
        const jsonConfig = {
            ...config,
            generationConfig: {
                ...config.generationConfig,
                responseMimeType: "application/json"
            }
        };

        const result = await this.generateContent(prompt, jsonConfig, retries);
        const text = result.response.text();

        console.log('[GenerativeAIService] Raw AI Response Length:', text.length);
        console.log('[GenerativeAIService] Raw AI Response (first 500 chars):', text.substring(0, 500));
        console.log('[GenerativeAIService] Raw AI Response (last 500 chars):', text.substring(Math.max(0, text.length - 500)));

        try {
            // Clean markdown if present
            const cleanText = text.trim()
                .replace(/^```json\n?/i, '')
                .replace(/\n?```$/i, '')
                .trim();

            console.log('[GenerativeAIService] Attempting to parse cleaned JSON...');
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("[AIService] JSON Parse Error!");
            console.error("Error Message:", e.message);

            // Log a snippet of the start and end to see where it might be broken
            console.error("Start of response:", text.substring(0, 200));
            console.error("End of response:", text.substring(Math.max(0, text.length - 200)));

            throw new Error(`Failed to parse AI response as JSON: ${e.message}`);
        }
    }

    /**
     * Unified sendMessage method for chat sessions with automatic retry and Smart Fallback
     */
    async sendMessage(chatSession, message, config = {}, retries = 3) {
        return this.executeWithRetry(async (model, isRetry, currentModelName) => {
            if (isRetry) {
                // If it's a retry with a DIFFERENT model, we must use a stateless call 
                // because the chatSession is locked to the original model.
                console.log(`[AIService] Fallback detected for chat. Using generateContent for turn.`);
                // We'll simulate a chat turn using history from the session if possible, 
                // but for simplicity in fallback, we'll just send the message.
                return await model.generateContent(message);
            }
            return await chatSession.sendMessage(message);
        }, message, config, retries);
    }

    /**
     * Core retry/failover logic
     */
    async executeWithRetry(action, input, config = {}, retries = 3) {
        await this.init();

        const requestedModel = config.model || "gemini-flash-latest";
        // FALLBACK STRATEGY: 
        // 1. Try Requested (e.g. 2.5-flash or 2.0-flash)
        // 2. Fallback to gemini-2.0-flash (Highest performance/availability for this key)
        // 3. Fallback to gemini-2.0-flash-lite (Stable lightweight fallback)
        // 4. Fallback to gemini-1.5-flash-latest (Reliable legacy fallback)
        const modelQueue = [requestedModel, "gemini-flash-latest", "gemini-pro-latest", "gemini-2.0-flash-lite"];
        const uniqueQueue = [...new Set(modelQueue)];

        for (let i = 0; i < retries; i++) {
            const currentModelName = uniqueQueue[i % uniqueQueue.length];
            console.log(`[AIService] 🤖 Attempt ${i + 1} using "${currentModelName}"`);

            const modelConfig = {
                ...config,
                model: currentModelName,
                systemInstruction: config.systemInstruction // Explicitly pass through
            };
            const model = this.getModel(modelConfig);

            try {
                return await action(model, i > 0, currentModelName);
            } catch (error) {
                const isRateLimit = error.message?.includes('429') || error.message?.includes('Resource exhausted');
                const isNotFound = error.message?.includes('404') || error.message?.includes('not found') || error.message?.includes('501');

                console.error(`[AIService] Attempt ${i + 1} Failed (${currentModelName}): ${error.message}`);

                if (i < retries - 1) {
                    // If model is not found, jump to next retry IMMEDIATELY without delay
                    if (isNotFound) {
                        console.log(`[AIService] Model "${currentModelName}" not found. Trying next model immediately...`);
                        continue;
                    }

                    // Exponential backoff with jitter for Rate Limits
                    const baseDelay = isRateLimit ? 2000 : 1000;
                    const delay = (Math.pow(2, i) * baseDelay) + (Math.random() * 500);
                    console.log(`[AIService] Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
        }
    }
}

module.exports = new GenerativeAIService();
