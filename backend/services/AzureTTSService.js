const sdk = require('microsoft-cognitiveservices-speech-sdk');
require('dotenv').config();

// Azure Speech credentials — reuse the Azure OpenAI realtime endpoint
// (it's a multi-service Cognitive Services resource)
const SPEECH_KEY = process.env.AZURE_OPENAI_REALTIME_API_KEY;
const SPEECH_REGION = 'eastus2'; // Same region as realtime endpoint

// Voice mapping for each character
const VOICE_MAP = {
    'Examiner': 'en-US-JennyNeural',      // Miss Janie: warm, professional female
    'Candidate_A': 'en-GB-SoniaNeural',   // Annie: spirited British female
    'Candidate_B': 'en-US-AndrewNeural',  // Ben: clear, neutral male
    'Candidate_C': 'en-US-EricNeural'     // Charlie: hesitant, softer male
};

// Character-specific SSML prosody settings
const PROSODY_MAP = {
    'Examiner':    { rate: '0%',  pitch: '0%',  style: 'default' },
    'Candidate_A': { rate: '5%',  pitch: '5%',  style: 'cheerful' },
    'Candidate_B': { rate: '0%',  pitch: '0%',  style: 'default' },
    'Candidate_C': { rate: '-5%', pitch: '-5%', style: 'default' }
};

let speechConfig = null;

function getSpeechConfig() {
    if (!speechConfig) {
        if (!SPEECH_KEY) {
            throw new Error('Azure Speech key not configured. Set AZURE_OPENAI_REALTIME_API_KEY in .env');
        }
        speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
        speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
    }
    return speechConfig;
}

/**
 * Synthesize speech using Azure Neural TTS
 * @param {string} text - Text to speak
 * @param {string} role - Character role (Examiner, Candidate_A, etc.)
 * @returns {Promise<string>} Base64-encoded MP3 audio
 */
async function synthesize(text, role = 'Examiner') {
    if (!text || !text.trim()) {
        throw new Error('Empty text provided for TTS');
    }

    const voiceName = VOICE_MAP[role] || VOICE_MAP['Examiner'];
    const prosody = PROSODY_MAP[role] || PROSODY_MAP['Examiner'];

    // Build SSML with prosody for natural-sounding speech
    const escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voiceName}">
            <prosody rate="${prosody.rate}" pitch="${prosody.pitch}">
                ${escapedText}
            </prosody>
        </voice>
    </speak>`;

    const config = getSpeechConfig();
    const synthesizer = new sdk.SpeechSynthesizer(config);

    return new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
            ssml,
            result => {
                synthesizer.close();
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    const audioBuffer = Buffer.from(result.audioData);
                    const base64 = audioBuffer.toString('base64');
                    resolve(base64);
                } else {
                    reject(new Error(`TTS failed: ${result.errorDetails || result.reason}`));
                }
            },
            error => {
                synthesizer.close();
                reject(error);
            }
        );
    });
}

/**
 * Get available Azure Neural voices
 */
async function listVoices() {
    const config = getSpeechConfig();
    const synthesizer = new sdk.SpeechSynthesizer(config);

    return new Promise((resolve, reject) => {
        synthesizer.getVoicesAsync('en-US').then(result => {
            synthesizer.close();
            if (result.reason === sdk.ResultReason.VoicesListRetrieved) {
                const voices = result.voices
                    .filter(v => v.voiceType === sdk.VoiceType.OnlineNeural)
                    .map(v => ({
                        name: v.name,
                        locale: v.locale,
                        gender: v.gender === 1 ? 'Female' : 'Male',
                        styleList: v.styleList || []
                    }));
                resolve(voices);
            } else {
                reject(new Error('Failed to list voices'));
            }
        }).catch(reject);
    });
}

module.exports = {
    synthesize,
    listVoices,
    VOICE_MAP
};
