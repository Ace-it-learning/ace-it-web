const speech = require('@google-cloud/speech');
const path = require('path');
const axios = require('axios');
const AzureSpeechAssessmentService = require('./AzureSpeechAssessmentService');

// Use the same service account as Firebase
const keyPath = path.join(__dirname, '../serviceAccountKey.json');
const hasKey = require('fs').existsSync(keyPath);
const isProduction = process.env.NODE_ENV === 'production';

const client = hasKey ? new speech.SpeechClient({
    keyFilename: keyPath
}) : null;

if (!client) {
    console.warn(`[PronunciationService] ⚠️ No Google Cloud Speech credentials found at ${keyPath}. Will use Azure fallback.`);
}

class PronunciationService {
    /**
     * Analyze pronunciation from audio recording.
     *
     * CASCADE:
     *   1. Azure Speech Pronunciation Assessment (primary) — real acoustic metrics
     *   2. Google Cloud Speech (secondary) — word-level confidence only
     *   3. Azure OpenAI gpt-4o-transcribe (tertiary) — transcript only
     *
     * @param {string} audioBase64 - Base64 encoded audio
     * @param {string} audioType - MIME type (e.g., 'audio/webm')
     * @param {string} referenceText - The text the student was supposed to speak (required for Azure assessment)
     * @returns {Object} Analysis results with transcript, confidence, and pronunciation metrics
     */
    async analyzePronunciation(audioBase64, audioType, referenceText = '') {
        console.log(`[PronunciationService] Audio: ${audioBase64.length} bytes, mime=${audioType}, hasRef=${!!referenceText}`);

        // === PRIMARY: Azure Speech Pronunciation Assessment ===
        // Only use if we have reference text (required for assessment) and service is configured
        if (referenceText && AzureSpeechAssessmentService.isConfigured) {
            try {
                const audioBuffer = Buffer.from(audioBase64, 'base64');
                const result = await AzureSpeechAssessmentService.assessPronunciation(
                    audioBuffer,
                    referenceText,
                    audioType
                );
                console.log(`[PronunciationService] ✅ Azure Speech Assessment succeeded.`);
                return result;
            } catch (azureErr) {
                console.warn(`[PronunciationService] Azure Speech Assessment failed: ${azureErr.message}. Falling back...`);
            }
        }

        // === SECONDARY: Google Cloud Speech ===
        if (client) {
            try {
                console.log(`[PronunciationService] Trying Google Cloud Speech...`);
                return await this._googleCloudSpeech(audioBase64, audioType);
            } catch (googleErr) {
                console.warn(`[PronunciationService] Google Cloud Speech failed: ${googleErr.message}. Falling back...`);
            }
        }

        // === TERTIARY: Azure OpenAI gpt-4o-transcribe ===
        console.log(`[PronunciationService] Falling back to Azure OpenAI transcribe...`);
        return this._azureTranscribe(audioBase64, audioType);
    }

    /**
     * Google Cloud Speech analysis
     * @private
     */
    async _googleCloudSpeech(audioBase64, audioType) {
        const audio = { content: audioBase64 };
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
                pronunciationMetrics: null,
                error: 'No speech detected'
            };
        }

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
                endTime: word.endTime?.seconds || 0,
                errorType: 'None'
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
            isEnglish,
            pronunciationMetrics: null
        };
    }

    /**
     * Azure OpenAI gpt-4o-transcribe fallback for pronunciation analysis.
     * Calls Azure transcribe endpoint directly via REST API — bypasses GenerativeAIService
     * because the active AI provider (e.g. DeepSeek) may not support audio input.
     * @private
     */
    async _azureTranscribe(audioBase64, audioType) {
        try {
            const endpoint = process.env.AZURE_OPENAI_TRANSCRIBE_ENDPOINT || process.env.AZURE_OPENAI_ENDPOINT;
            const apiKey = process.env.AZURE_OPENAI_TRANSCRIBE_API_KEY || process.env.AZURE_OPENAI_API_KEY;
            const apiVersion = process.env.AZURE_OPENAI_TRANSCRIBE_API_VERSION || '2025-03-01-preview';
            const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_TRANSCRIBE || 'gpt-4o-transcribe';

            if (!endpoint || !apiKey) {
                throw new Error('Azure transcribe endpoint not configured.');
            }

            console.log(`[PronunciationService] Azure Transcribe fallback: ${audioBase64.length} bytes`);

            const baseUrl = endpoint.replace(/\/+$/, '');
            const url = `${baseUrl}/openai/deployments/${deployment}/audio/transcriptions?api-version=${encodeURIComponent(apiVersion)}`;

            const audioBuffer = Buffer.from(audioBase64, 'base64');
            const boundary = `----FormBoundary${Date.now()}`;
            const mimeType = audioType.includes('webm') ? 'audio/webm' : (audioType.includes('wav') ? 'audio/wav' : 'audio/webm');

            const bodyParts = [
                `--${boundary}\r\n`,
                `Content-Disposition: form-data; name="file"; filename="recording.webm"\r\n`,
                `Content-Type: ${mimeType}\r\n\r\n`,
            ];

            const prefix = Buffer.from(bodyParts.join(''), 'utf8');
            const suffix = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
            const body = Buffer.concat([prefix, audioBuffer, suffix]);

            const response = await axios.post(url, body, {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': `multipart/form-data; boundary=${boundary}`
                },
                timeout: 30000,
                maxBodyLength: 50 * 1024 * 1024,
                maxContentLength: 50 * 1024 * 1024
            });

            const transcript = (response.data?.text || '').trim();
            console.log(`[PronunciationService] Azure Transcribe Result: "${transcript.substring(0, 80)}${transcript.length > 80 ? '...' : ''}"`);

            if (!transcript) {
                return {
                    transcript: '',
                    wordDetails: [],
                    overallConfidence: 0,
                    detectedLanguage: 'unknown',
                    isEnglish: false,
                    pronunciationMetrics: null,
                    error: 'No speech detected'
                };
            }

            const words = transcript.split(/\s+/).filter(w => w.length > 0);
            const wordDetails = words.map(w => ({ word: w, confidence: 0.85, errorType: 'None' }));

            return {
                transcript,
                wordDetails,
                overallConfidence: 0.85,
                detectedLanguage: 'en-HK',
                isEnglish: true,
                pronunciationMetrics: null
            };
        } catch (fallbackError) {
            console.error('[PronunciationService] Azure Transcribe CRITICAL FAILURE:', fallbackError.message);
            if (fallbackError.response) {
                console.error('[PronunciationService] Azure response status:', fallbackError.response.status);
                console.error('[PronunciationService] Azure response data:', JSON.stringify(fallbackError.response.data).substring(0, 500));
            }
            return {
                transcript: '',
                wordDetails: [],
                overallConfidence: 0,
                detectedLanguage: 'unknown',
                isEnglish: false,
                pronunciationMetrics: null,
                error: fallbackError.message
            };
        }
    }
}

module.exports = new PronunciationService();
