const speech = require('@google-cloud/speech');
const path = require('path');

// Use the same service account as Firebase
const client = new speech.SpeechClient({
    keyFilename: path.join(__dirname, '../serviceAccountKey.json')
});

class PronunciationService {
    /**
     * Analyze pronunciation from audio recording
     * @param {string} audioBase64 - Base64 encoded audio
     * @param {string} audioType - MIME type (e.g., 'audio/webm')
     * @returns {Object} Analysis results with transcript, confidence, and language detection
     */
    async analyzePronunciation(audioBase64, audioType) {
        try {
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
            console.error('[PronunciationService] Error:', error);
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

module.exports = new PronunciationService();
