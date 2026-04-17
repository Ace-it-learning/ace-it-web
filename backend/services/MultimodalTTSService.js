const GenerativeAIService = require('./GenerativeAIService');

/**
 * MultimodalTTSService
 * A wrapper for Gemini-based audio generation.
 * Now consolidated to use GenerativeAIService for consistent environment handling.
 */
class MultimodalTTSService {
    /**
     * Generate synthetic speech using Gemini Multimodal (Direct Audio Output)
     */
    async generateAudio(text, options = {}) {
        const modelId = options.modelId || "ace-it-multimodal";
        const voiceName = options.voiceName || "Algenib";
        
        // Director's Notes for natural prosody
        const directorNotes = options.notes || "Speak naturally like a Hong Kong Cantonese-English tutor. Output ONLY audio.";

        try {
            console.log(`[MultimodalTTS] Generating audio via Gemini (${modelId})...`);
            
            const result = await GenerativeAIService.generateContent(`Read the following text out loud: "${text}"`, {
                model: modelId,
                audioOutput: true,
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voiceName
                        }
                    }
                },
                systemInstruction: `You are a helpful native speaking tutor. ${directorNotes}`
            });

            if (!result.audio) {
                console.error("[MultimodalTTS] No audio returned from GenerativeAIService.");
                throw new Error("Multimodal audio generation failed.");
            }

            return result.audio; // Base64
            
        } catch (error) {
            console.error("[MultimodalTTS] Critical failure:", error.message);
            throw error;
        }
    }
}

module.exports = new MultimodalTTSService();
