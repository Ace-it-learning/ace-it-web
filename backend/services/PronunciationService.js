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
            // [COST-SAVING] If in development, skip the billable SDK and go straight to Gemini
            if (!isProduction || !client) {
                console.log(`[PronunciationService] Local Dev Mode: Skipping GCloud SDK, using Gemini fallback.`);
                throw new Error("Local Dev mode triggered Gemini fallback");
            }

            const audio = {
                content: audioBase64
            };

            const config = {
                encoding: audioType === 'audio/webm' ? 'WEBM_OPUS' : 'LINEAR16',
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
                console.log(`[PronunciationService] Executing Gemini Emergency Transcription...`);
                
                const prompt = "Transcribe the following audio precisely. Correct minor stuttering but keep all words. Return ONLY the raw transcript text.";
                const audioPart = {
                    inlineData: {
                        data: audioBase64,
                        mimeType: audioType === 'audio/webm' ? 'audio/webm' : 'audio/wav'
                    }
                };

                const result = await GenerativeAIService.generateContent([
                    { text: prompt },
                    audioPart
                ], { model: 'ace-it-flash' });

                const transcript = result.response.text().trim();
                console.log(`[PronunciationService] Gemini Transcribed: "${transcript}"`);

                if (!transcript) throw new Error("Empty transcript from Gemini");

                return {
                    transcript,
                    wordDetails: transcript.split(/\s+/).map(w => ({ word: w, confidence: 0.9 })),
                    overallConfidence: 0.9,
                    detectedLanguage: 'en-US',
                    isEnglish: true
                };
            } catch (fallbackError) {
                console.error('[PronunciationService] Gemini Fallback Failed:', fallbackError);
                return {
                    transcript: '',
                    wordDetails: [],
                    overallConfidence: 0,
                    detectedLanguage: 'unknown',
                    isEnglish: false,
                    error: error.message
                };
            }
        }
    }
}

module.exports = new PronunciationService();
