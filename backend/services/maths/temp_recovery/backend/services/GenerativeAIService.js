const { GoogleGenerativeAI } = require('@google/generative-ai');
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
        if (!process.env.GEMINI_API_KEY) {
            console.warn("[AIService] Warning: No GEMINI_API_KEY found for AI Studio fallback.");
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

        const modelOptions = {
            model: modelName,
            generationConfig: generationConfig
        };

        if (config.systemInstruction) {
            modelOptions.systemInstruction = config.systemInstruction;
        }

        if (this.isVertex) {
            console.log(`[AIService] Routing to Vertex AI: ${modelName}`);
            return this.vertex.getGenerativeModel(modelOptions);
        } else {
            console.log(`[AIService] Routing to AI Studio: ${modelName}`);
            return this.genAI.getGenerativeModel(modelOptions);
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
     * Unified sendMessage method for chat sessions with automatic retry and Smart Fallback
     */
    async sendMessage(chatSession, message, config = {}, retries = 3) {
        // chatSession might be tied to a specific model instance, 
        // but if it fails, we might need a fresh session with a different model.
        // For now, we retry within the session, or if it's a model issue, the caller handles recreation.
        return this.executeWithRetry(async (model, isRetry, currentModelName) => {
            // Special case: If we are retrying with a DIFFERENT model, we can't use the same chatSession
            // So we'll need to handle that logic. But startChat/sendMessage is complex.
            // Simplified: We use generateContent logic if it's a stateless fallback, 
            // or we just retry the sendMessage if it's a temporary 429.
            return await chatSession.sendMessage(message);
        }, message, config, retries);
    }

    /**
     * Core retry/failover logic
     */
    async executeWithRetry(action, input, config = {}, retries = 3) {
        await this.init();

        const requestedModel = config.model || "gemini-2.0-flash";
        const modelQueue = [requestedModel, "gemini-2.0-flash"];
        const uniqueQueue = [...new Set(modelQueue)];

        for (let i = 0; i < retries; i++) {
            const currentModelName = uniqueQueue[i % uniqueQueue.length];
            console.log(`[AIService] 🤖 Attempt ${i + 1} using "${currentModelName}"`);

            const modelConfig = { ...config, model: currentModelName };
            const model = this.getModel(modelConfig);

            try {
                return await action(model, i > 0, currentModelName);
            } catch (error) {
                const isRateLimit = error.message?.includes('429') || error.message?.includes('Resource exhausted');
                const isNotFound = error.message?.includes('404') || error.message?.includes('not found');

                console.error(`[AIService] Attempt ${i + 1} Failed (${currentModelName}): ${error.message}`);

                if (i < retries - 1) {
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
