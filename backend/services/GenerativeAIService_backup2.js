const axios = require('axios');

/**
 * GenerativeAIService
 * DEV-only adapter for DeepSeek API.
 * Legacy providers (Gemini, Vertex AI, Groq, Azure OpenAI) have been removed.
 * PROD retains its own deployment path (Firebase + GCP) and is not affected.
 */
class GenerativeAIService {
    constructor() {
        this.initialized = false;
        this.isDeepSeek = false;
        this.activeProvider = "deepseek";
    }

    async init() {
        if (this.initialized) return;

        const aiProvider = (process.env.AI_PROVIDER || '').toLowerCase();

        if (aiProvider === 'deepseek') {
            this.initDeepSeek();
            this.activeProvider = "deepseek";
            this.initialized = true;
            return;
        }

        // Default to deepseek in DEV regardless of env var
        console.warn(`[AIService] AI_PROVIDER not set to 'deepseek' (got '${aiProvider}'). Defaulting to DeepSeek for DEV.`);
        this.initDeepSeek();
        this.activeProvider = "deepseek";
        this.initialized = true;
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
        this.isDeepSeek = true;
        this.activeProvider = "deepseek";
        console.log(`[AIService] Initialized DeepSeek API adapter`);
    }

    getActiveProvider() {
        return this.activeProvider;
    }

    // ------------------------------------------------------------------
    // Model wrapper for callers that expect .generateContent() / .sendMessage()
    // ------------------------------------------------------------------
    getModel(config = {}) {
        const requested = config.model || "ace-it-flash";
        const modelName = this.resolveDeepSeekModel(requested);

        // Return a lightweight wrapper compatible with legacy Gemini-style callers
        const service = this;
        return {
            model: modelName,
            _modelName: modelName,
            async generateContent(prompt) {
                return service.generateContent(prompt, { ...config, model: requested });
            },
            async sendMessage(message) {
                return service.generateContent(message, { ...config, model: requested });
            }
        };
    }

    // ------------------------------------------------------------------
    // Unified entry point
    // ------------------------------------------------------------------
    async generateContent(prompt, config = {}, retries = 3) {
        await this.init();
        return this.generateContentWithDeepSeek(prompt, config);
    }

    async sendMessage(chatSession, message, config = {}, retries = 6) {
        // Legacy compatibility: some callers use sendMessage with a chat session object.
        // We ignore chatSession and treat it as a stateless generateContent call.
        return this.generateContent(message, config);
    }

    // ------------------------------------------------------------------
    // DeepSeek adapter
    // ------------------------------------------------------------------
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

                // Handle plain string items in array (e.g. [prompt, audioPart])
                if (typeof item === 'string' && item.trim()) {
                    messages.push({ role: 'user', content: item });
                    continue;
                }

                if (contentParts.length === 0) continue;
                if (contentParts.length === 1 && contentParts[0].type === 'text') {
                    messages.push({ role, content: contentParts[0].text });
                } else {
                    messages.push({ role, content: contentParts });
                }
            }
        } else if (typeof prompt === 'string') {
            messages.push({ role: 'user', content: prompt });
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
        const payload = {
            model,
            messages,
            temperature: typeof config?.generationConfig?.temperature === 'number' ? config.generationConfig.temperature : 0.4,
            max_tokens: Math.min(requestedMax, 8192)
        };

        // Add response_format for JSON mode when requested
        if (config.generationConfig?.responseMimeType === 'application/json') {
            // DeepSeek does not support response_format natively; rely on prompt engineering.
            // We inject a system-level reminder if not already present.
            const hasJsonReminder = messages.some(m =>
                m.role === 'system' &&
                typeof m.content === 'string' &&
                m.content.toLowerCase().includes('json')
            );
            if (!hasJsonReminder) {
                messages.unshift({
                    role: 'system',
                    content: 'You must respond with valid JSON only. No markdown, no explanations outside the JSON.'
                });
            }
        }

        const promptPreview = typeof prompt === 'string'
            ? prompt.substring(0, 120)
            : (Array.isArray(prompt) && prompt[0]?.text ? prompt[0].text.substring(0, 120) : 'array-prompt');
        console.log(`[DeepSeekAdapter] Request | model=${model} | messages=${messages.length} | max_tokens=${payload.max_tokens} | promptPreview="${promptPreview}..."`);

        let response;
        const dsStart = Date.now();
        try {
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

        const text = response?.data?.choices?.[0]?.message?.content || '';
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

    /**
     * Robustly extracts the first valid JSON object/array from text.
     */
    extractJson(text) {
        let startIndex = text.indexOf('{');
        let arrayStartIndex = text.indexOf('[');

        let start = startIndex;
        if (arrayStartIndex !== -1 && (startIndex === -1 || arrayStartIndex < startIndex)) {
            start = arrayStartIndex;
        }

        if (start === -1) return text;

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
        return text;
    }

    /**
     * Helper to generate and parse JSON
     */
    async generateJson(prompt, config = {}, retries = 6) {
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
            const rawText = this.extractJson(text);

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
                        const nextChar = str[i + 1];
                        const escapable = ['\\', '"', '/', 'b', 'f', 'n', 'r', 't', 'u'].includes(nextChar);

                        if (escapable) {
                            hardened += "\\";
                        } else {
                            hardened += "\\\\";
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

            const data = JSON.parse(safeText);
            return { data, model: usedModel };

        } catch (e) {
            console.warn(`[AIService] JSON Parse/Hardening Failed: ${e.message}. Attempting simple raw fallback...`);
            console.log(`[AIService] Corrupted Text Fragment: ${text ? text.substring(0, 500) : 'NULL'}`);

            try {
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
}

module.exports = new GenerativeAIService();
