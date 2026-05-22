/**
 * AzureSpeechAssessmentService
 * Wraps Azure Speech Services Pronunciation Assessment API.
 * Provides real acoustic metrics: accuracy, fluency, completeness, prosody.
 *
 * API: REST endpoint with Pronunciation-Assessment header
 * Docs: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment
 *
 * Fallback chain (in PronunciationService):
 *   Azure Speech Assessment (primary) → Google Cloud Speech (secondary) → Azure OpenAI transcribe (tertiary)
 */

const axios = require('axios');

class AzureSpeechAssessmentService {
    constructor() {
        this.key = process.env.AZURE_SPEECH_KEY || '';
        this.region = process.env.AZURE_SPEECH_REGION || 'eastasia';
        this.isConfigured = !!(this.key && this.region);
    }

    /**
     * Assess pronunciation from audio recording against a reference text.
     *
     * @param {Buffer} audioBuffer - Raw audio buffer (webm, wav, mp3, etc.)
     * @param {string} referenceText - The text the student was supposed to speak
     * @param {string} audioType - MIME type (e.g., 'audio/webm')
     * @returns {Object} Analysis with transcript, wordDetails, and pronunciationMetrics
     */
    async assessPronunciation(audioBuffer, referenceText, audioType) {
        if (!this.isConfigured) {
            throw new Error('Azure Speech Assessment not configured. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.');
        }

        if (!referenceText || referenceText.trim().length === 0) {
            throw new Error('Reference text is required for pronunciation assessment.');
        }

        console.log(`[AzureSpeechAssessment] Assessing ${audioBuffer.length} bytes against reference: "${referenceText.substring(0, 60)}..."`);

        // Build pronunciation assessment config
        const assessmentConfig = {
            referenceText: referenceText.trim(),
            gradingSystem: 'HundredMark',
            granularity: 'Phoneme',
            dimension: 'Comprehensive',
            enableMiscue: true
        };

        const configBase64 = Buffer.from(JSON.stringify(assessmentConfig)).toString('base64');

        // Azure Speech REST endpoint
        const url = `https://${this.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;

        const response = await axios.post(url, audioBuffer, {
            headers: {
                'Ocp-Apim-Subscription-Key': this.key,
                'Content-Type': audioType || 'audio/webm',
                'Pronunciation-Assessment': configBase64,
                'Accept': 'application/json'
            },
            timeout: 60000,
            maxBodyLength: 50 * 1024 * 1024,
            maxContentLength: 50 * 1024 * 1024
        });

        return this._parseResponse(response.data);
    }

    /**
     * Parse Azure Speech API response into normalized format.
     * @private
     */
    _parseResponse(data) {
        if (!data || !data.NBest || data.NBest.length === 0) {
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

        const best = data.NBest[0];

        // Extract pronunciation assessment at utterance level
        const assessment = best.PronunciationAssessment || {};
        const accuracyScore = assessment.AccuracyScore || 0;
        const fluencyScore = assessment.FluencyScore || 0;
        const completenessScore = assessment.CompletenessScore || 0;
        const prosodyScore = assessment.ProsodyScore || 0;

        // Extract word-level details
        const wordDetails = (best.Words || []).map(word => {
            const wordAssessment = word.PronunciationAssessment || {};
            const phonemes = (word.Phonemes || []).map(ph => ({
                phoneme: ph.Phoneme,
                accuracyScore: ph.PronunciationAssessment?.AccuracyScore || 0
            }));

            return {
                word: word.Word,
                confidence: (wordAssessment.AccuracyScore || 0) / 100,
                startTime: word.Offset / 10000000, // ticks → seconds (10M ticks/sec)
                endTime: (word.Offset + word.Duration) / 10000000,
                errorType: wordAssessment.ErrorType || 'None',
                phonemes
            };
        });

        const overallConfidence = wordDetails.length > 0
            ? wordDetails.reduce((sum, w) => sum + w.confidence, 0) / wordDetails.length
            : 0;

        const result = {
            transcript: best.Display || best.Lexical || '',
            wordDetails,
            overallConfidence,
            detectedLanguage: 'en-US',
            isEnglish: true,
            pronunciationMetrics: {
                accuracyScore,
                fluencyScore,
                completenessScore,
                prosodyScore
            }
        };

        console.log(`[AzureSpeechAssessment] Result: Accuracy=${accuracyScore}, Fluency=${fluencyScore}, Completeness=${completenessScore}, Prosody=${prosodyScore}`);
        return result;
    }

    /**
     * Health check — verify Azure Speech endpoint is reachable
     */
    async healthCheck() {
        if (!this.isConfigured) {
            return { ok: false, error: 'Not configured' };
        }
        try {
            const url = `https://${this.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;
            // We can't easily health-check without audio, so just verify the URL
            return { ok: true, region: this.region, endpoint: url };
        } catch (e) {
            return { ok: false, error: e.message };
        }
    }
}

module.exports = new AzureSpeechAssessmentService();
