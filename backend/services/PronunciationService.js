const speech = require('@google-cloud/speech');
const path = require('path');

// Use the same service account as Firebase
const keyPath = path.join(__dirname, '../serviceAccountKey.json');
const hasKey = require('fs').existsSync(keyPath);
const isProduction = process.env.NODE_ENV === 'production';

const client = hasKey ? new speech.SpeechClient({
    keyFilename: keyPath
}) : null;

class PronunciationService {
    /**
     * Analyze pronunciation from audio recording
     * @param {string} audioBase64 - Base64 encoded audio
     * @param {string} audioType - MIME type (e.g., 'audio/webm')
     * @returns {Object} Analysis results with transcript, confidence, and language detection
     */
    async analyzePronunciation(audioBase64, audioType) {
        try {
            console.log(`[PronunciationService] Audio received: ${audioBase64.length} bytes (Mime: ${audioType})`);

            // Use the Professional SDK whenever a client (Key) is available
            if (!client) {
                console.log(`[PronunciationService] No SDK Client detected. Using Gemini fallback.`);
                throw new Error("No GCloud SDK Client available");
            }

            const audio = {
                content: audioBase64
            };

            const config = {
                encoding: audioType.includes('webm') ? 'WEBM_OPUS' : 'LINEAR16',
                sampleRateHertz: 48000,
                languageCode: 'en-HK',
                alternativeLanguageCodes: ['en-US', 'zh-HK', 'yue-Hant-HK'],
                enableWordTimeOffsets: true,
                enableWordConfidence: true,
                enableAutomaticPunctuation: true,
                model: 'latest_long',
                useEnhanced: true
            };

            const request = { audio, config };
            const [response] = await client.recognize(request);

            if (!response.results || response.results.length === 0) {
                return {
                    transcript: '',
                    wordDetails: [],
                    overallConfidence: 0,
                    detectedLanguage: 'unknown',
                    isEnglish: false,
                    error: 'No speech detected'
                };
            }

            // Check detected language
            const detectedLanguage = response.results[0]?.languageCode || 'en-US';
            const isEnglish = detectedLanguage.startsWith('en');

            const transcript = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n');

            const wordDetails = response.results.flatMap(result =>
                result.alternatives[0].words?.map(word => ({
                    word: word.word,
                    confidence: word.confidence,
                    startTime: word.startTime?.seconds || 0,
                    endTime: word.endTime?.seconds || 0
                })) || []
            );

            const overallConfidence = wordDetails.length > 0
                ? wordDetails.reduce((sum, w) => sum + w.confidence, 0) / wordDetails.length
                : 0;

            return {
                transcript,
                wordDetails,
                overallConfidence,
                detectedLanguage,
                isEnglish
            };
        } catch (error) {
            console.error('[PronunciationService] SDK Error/Fallback:', error.message);

            // FINAL FALLBACK: Use Gemini (AI Studio) to transcribe if SDK fails or is unavailable
            try {
                const GenerativeAIService = require('./GenerativeAIService');
                console.log(`[PronunciationService] Fallback: Sending ${audioBase64.length} bytes to Gemini...`);
                
                const prompt = `You are a professional automated stenographer. 
                TASK: Transcribe the provided audio EXACTLY as spoken. 
                
                STRICT RULES:
                1. Return ONLY the raw transcript text.
                2. Do NOT output "The heavy black wooden beam" or any other Harvard Calibration Sentences.
                3. Do NOT invent or "complete" a story if the audio cuts out.
                4. If you hear ONLY silence, background noise, or cannot recognize any human words, return ONLY '[NO_SPEECH]'.
                5. Do NOT include any explanations or conversational fillers in your response.`;

                const audioPart = {
                    inlineData: {
                        data: audioBase64,
                        mimeType: audioType.includes('webm') ? 'audio/webm' : 'audio/wav'
                    }
                };

                const result = await GenerativeAIService.generateContent([
                    { text: prompt },
                    audioPart
                ], { model: 'ace-it-flash' });

                const transcript = result.response.text().trim();
                console.log(`[PronunciationService] Fallback Result: "${transcript}"`);

                if (!transcript || transcript === '[NO_SPEECH]') {
                    return {
                        transcript: '',
                        wordDetails: [],
                        overallConfidence: 0,
                        detectedLanguage: 'unknown',
                        isEnglish: false,
                        error: 'No speech detected'
                    };
                }

                return {
                    transcript,
                    wordDetails: transcript.split(/\s+/).map(w => ({ word: w, confidence: 0.9 })),
                    overallConfidence: 0.9,
                    detectedLanguage: 'en-US',
                    isEnglish: true
                };
            } catch (fallbackError) {
                console.error('[PronunciationService] Gemini Fallback CRITICAL FAILURE:', fallbackError.message);
                if (fallbackError.stack) console.error(fallbackError.stack.substring(0, 300));
                return {
                    transcript: '',
                    wordDetails: [],
                    overallConfidence: 0,
                    detectedLanguage: 'unknown',
                    isEnglish: false,
                    error: fallbackError.message
                };
            }
        }
    }
}

module.exports = new PronunciationService();
