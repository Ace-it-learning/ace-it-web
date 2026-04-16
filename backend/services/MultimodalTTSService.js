const { VertexAI } = require('@google-cloud/vertexai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

class MultimodalTTSService {
    constructor() {
        this.vertex = null;
        this.genAI = null;
        this.isVertex = false;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        const NODE_ENV = process.env.NODE_ENV || 'development';
        const saFilename = NODE_ENV === 'production' ? 'antigravity-tutor-prod-key.json' : 'antigravity-tutor-dev-key.json';
        const saPath = path.join(__dirname, '../config', saFilename);
        
        // 1. Initialize Vertex AI if service account is available
        if (fs.existsSync(saPath)) {
            try {
                const credentials = JSON.parse(fs.readFileSync(saPath, 'utf8'));
                const projectId = credentials.project_id;
                const region = process.env.VERTEX_LOCATION || 'asia-southeast1';

                this.vertex = new VertexAI({
                    project: projectId,
                    location: region,
                    googleAuthOptions: { credentials }
                });
                this.isVertex = true;
                this.currentRegion = region;
                console.log(`[MultimodalTTSService] Vertex AI initialized (${region})`);
            } catch (e) {
                console.warn(`[MultimodalTTSService] Failed to init Vertex AI:`, e.message);
            }
        }

        // 2. Initialize AI Studio (Third-tier fallback)
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            console.log(`[MultimodalTTSService] AI Studio initialized`);
        } else {
            console.warn(`[MultimodalTTSService] No GEMINI_API_KEY found for fallback!`);
        }

        this.initialized = true;
    }

    /**
     * Generate synthetic speech using Gemini 2.5 Flash Multimodal
     * Specifically tuned for the "Miss Janie" Cantonese tutor persona.
     */
    async generateAudio(text, options = {}) {
        await this.init();

        const modelId = options.modelId || "ace-it-multimodal";
        const voiceName = options.voiceName || "Algenib";
        
        // Native HK Speaker Director's Notes
        const directorNotes = options.notes || "Speak natively in Cantonese like Hong Kong people with a warm, energetic, and supportive 'big sister' tone. Ensure the prosody matches natural Hong Kong colloquial speech.";

        try {
            if (this.isVertex) {
                try {
                    const model = this.vertex.getGenerativeModel({ 
                        model: modelId,
                        generationConfig: {
                            responseModalities: ["audio"],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: voiceName
                                    }
                                }
                            }
                        },
                        systemInstruction: {
                            role: 'system',
                            parts: [{ text: `You are a native Cantonese tutor persona. Output ONLY audio. ${directorNotes}` }]
                        }
                    });

                    const result = await model.generateContent({
                        contents: [{ role: 'user', parts: [{ text: text }] }]
                    });

                    const response = result.response;
                    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                    if (audioPart) return audioPart.inlineData.data; // Base64
                } catch (vertexErr) {
                    console.warn(`[MultimodalTTSService] Vertex AI Error:`, vertexErr.message);
                    console.log(`[MultimodalTTSService] Falling back to AI Studio...`);
                }
            }

            // AI Studio Fallback
            if (!this.genAI) {
                throw new Error("AI Studio (Gemini) not initialized. Check GEMINI_API_KEY.");
            }

            const model = this.genAI.getGenerativeModel({ model: "ace-it-multimodal" }); 
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: `[DIRECTOR: ${directorNotes}] READ EXACTLY: ${text}` }] }],
                generationConfig: {
                    responseModalities: ["audio"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: "Achird"
                            }
                        }
                    }
                }
            });
            const response = await result.response;
            const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            
            if (!audioPart) {
                console.error("[MultimodalTTSService] AI Studio Response Content:", JSON.stringify(response, null, 2));
                throw new Error("No audio content returned from AI Studio. Modalities might not be supported for this model.");
            }
            
            return audioPart.inlineData.data; // Base64
            
        } catch (error) {
            console.error("[MultimodalTTSService] Critical failure:", error.message);
            throw error;
        }
    }
}

module.exports = new MultimodalTTSService();
