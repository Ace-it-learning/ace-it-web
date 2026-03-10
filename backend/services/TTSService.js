const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const path = require('path');

// Initialize Client
// Explicitly use serviceAccountKey.json if available in the same directory (or parent)
const keyPath = path.join(__dirname, '../serviceAccountKey.json'); // Adjust path as needed
const clientOptions = fs.existsSync(keyPath) ? { keyFilename: keyPath } : {};
console.log(`[TTSService] Init - Key Check: ${fs.existsSync(keyPath) ? 'Found local key' : 'Using default env'}`);

const client = new textToSpeech.TextToSpeechClient(clientOptions);

/**
 * Escapes characters for XML/SSML
 */
function escapeSSML(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Helper to wrap English fragments in <lang xml:lang="en-US"> for better pronunciation
 */
function convertToSSML(text) {
    const escaped = escapeSSML(text);

    // 2. Identify English words/phrases and wrap them
    const mixed = escaped.replace(/([a-zA-Z][a-zA-Z0-9\s\-_'.]*[a-zA-Z0-9])|([a-zA-Z])/g, (match) => {
        return `<lang xml:lang="en-US">${match.trim()}</lang> `;
    });

    return `<speak>${mixed}</speak>`;
}

/**
 * Generate Audio from Text using Google Cloud TTS
 * @param {string} text - The text to speak
 * @param {string} languageCode - 'en-US', 'en-GB', 'zh-HK'
 * @param {string} gender - 'MALE' or 'FEMALE'
 * @returns {Promise<string>} - Base64 encoded audio string
 */
async function generateSpeech(text, languageCode = 'en-US', gender = 'FEMALE') {
    try {
        const isMixedCantonese = languageCode === 'zh-HK';
        const isSSML = text.trim().startsWith('<speak>');

        // Build request input: use SSML only when explicitly needed
        let input;
        if (isSSML) {
            input = { ssml: text };
        } else if (isMixedCantonese) {
            input = { ssml: convertToSSML(text) };
        } else {
            // Plain text — let Neural2 handle natural pacing and prosody
            input = { text: text };
        }

        const request = {
            input: input,
            voice: {
                languageCode: languageCode,
                ssmlGender: gender
            },
            audioConfig: { audioEncoding: 'MP3' },
        };

        // 2. Advanced Voice Selection (WaveNet / Standard-B Strategy)
        if (isMixedCantonese) {
            console.log(`[TTSService] Applying zh-HK customizations: Speed 1.4, Voice Standard-D`);
            console.log(`[TTSService] SSML Length: ${input.ssml?.length || text.length}`);
            request.audioConfig.speakingRate = 1.4;

            // Priority for Ace Sir (Male Cantonese)
            if (gender === 'MALE') {
                request.voice.name = 'yue-HK-Standard-D';
            } else {
                request.voice.name = 'yue-HK-Standard-A'; // Female
            }
        }

        else if (languageCode === 'en-GB') {
            // British English
            if (gender === 'MALE') {
                request.voice.name = 'en-GB-Neural2-B'; // High quality Male
            } else {
                request.voice.name = 'en-GB-Neural2-A'; // High quality Female
            }
        }
        else if (languageCode === 'en-US') {
            // US English (Default)
            if (gender === 'MALE') {
                request.voice.name = 'en-US-Neural2-D'; // High quality Male
            } else {
                request.voice.name = 'en-US-Neural2-F'; // High quality Female
            }
        }

        // 3. Call API
        const [response] = await client.synthesizeSpeech(request);

        // 4. Return as Base64 for frontend to play immediately
        return response.audioContent.toString('base64');

    } catch (error) {
        console.error('[TTSService] API Error:', error);
        throw error;
    }
}

module.exports = { generateSpeech };
