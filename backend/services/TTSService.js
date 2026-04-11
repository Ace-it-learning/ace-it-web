const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Initialize Client
const keyPath = path.join(__dirname, '../serviceAccountKey.json');
const clientOptions = fs.existsSync(keyPath) ? { keyFilename: keyPath } : {};
console.log(`[TTSService] Init - Key Check: ${fs.existsSync(keyPath) ? 'Found local key' : 'Using default env'}`);

const client = new textToSpeech.TextToSpeechClient(clientOptions);

// Cache Directory Setup
const CACHE_DIR = path.join(__dirname, '../audio_cache');
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

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
    const mixed = escaped.replace(/([a-zA-Z][a-zA-Z0-9\s\-_'.]*[a-zA-Z0-9])|([a-zA-Z])/g, (match) => {
        return `<lang xml:lang="en-US">${match.trim()}</lang> `;
    });
    return `<speak>${mixed}</speak>`;
}

// --- Dynamic Voice Pools for Variety ---
const VOICE_POOL = {
    'en-US': {
        FEMALE: ['en-US-Neural2-F', 'en-US-Neural2-E', 'en-US-Neural2-C', 'en-US-Neural2-H'],
        MALE: ['en-US-Neural2-D', 'en-US-Neural2-A', 'en-US-Neural2-G', 'en-US-Neural2-J']
    },
    'en-GB': {
        FEMALE: ['en-GB-Neural2-A', 'en-GB-Neural2-F', 'en-GB-Wavenet-A'],
        MALE: ['en-GB-Neural2-B', 'en-GB-Neural2-D', 'en-GB-Wavenet-B']
    }
};

const TTS_VERSION = "2.1"; // Increment this to invalidate old caches if logic changes

function getSpeakerProfile(name) {
    const n = name.toLowerCase();
    let gender = 'FEMALE';
    const maleNames = ['bob', 'brian', 'charles', 'david', 'eric', 'frank', 'gary', 'henry', 'ivan', 'jack', 'ken', 'leo', 'mike', 'peter', 'sam', 'tom', 'victor', 'william', 'director', 'chair', 'mr', 'speaker'];
    if (maleNames.some(m => n.includes(m))) gender = 'MALE';

    let lang = 'en-US'; 
    const gbKeywords = ['helena', 'brian', 'bruce', 'mrs', 'dr', 'principal', 'council', 'official', 'rossi'];
    if (gbKeywords.some(k => n.includes(k))) lang = 'en-GB';

    return { lang, gender };
}

/**
 * Generate Audio from Text using Google Cloud TTS
 * Now supports character/word level timepoints for UI synchronization.
 */
async function generateSpeech(text, languageCode = 'en-US', gender = 'FEMALE', speakingRate = 1.0, forcedVoice = null, includeTimepoints = false) {
    try {
        const isMixedCantonese = languageCode === 'zh-HK';
        const isSSML = text.trim().startsWith('<speak>');

        let input = isSSML ? { ssml: text } : (isMixedCantonese ? { ssml: convertToSSML(text) } : { text: text });

        const request = {
            input: input,
            voice: { languageCode: languageCode, ssmlGender: gender },
            audioConfig: { audioEncoding: 'MP3', speakingRate: speakingRate },
        };

        // Enable character timepoints for highlighting
        if (includeTimepoints) {
            request.enableTimepoints = ['CHARACTER_TIMEPOINT'];
        }

        if (forcedVoice) {
            request.voice.name = forcedVoice;
        } else if (isMixedCantonese) {
            request.audioConfig.speakingRate = speakingRate || 1.2;
            request.voice.name = gender === 'MALE' ? 'yue-HK-Standard-D' : 'yue-HK-Standard-A';
        } else {
            const pool = VOICE_POOL[languageCode]?.[gender] || [];
            request.voice.name = pool[0] || (languageCode === 'en-GB' ? 'en-GB-Neural2-A' : 'en-US-Neural2-F');
        }

        const [response] = await client.synthesizeSpeech(request);
        
        if (includeTimepoints) {
            return {
                audio: response.audioContent.toString('base64'),
                timepoints: response.timepoints || []
            };
        }

        return response.audioContent.toString('base64');
    } catch (error) {
        console.error('[TTSService] API Error:', error);
        throw error;
    }
}

/**
 * Optimized Multi-Speaker Dialogue with File-based Caching
 */
async function generateMultiSpeakerSpeech(transcript) {
    const cacheKey = crypto.createHash('md5').update(`${transcript}_v${TTS_VERSION}`).digest('hex');
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.base64`);

    if (fs.existsSync(cachePath)) {
        console.log(`[TTSService] Cache Hit: ${cacheKey}`);
        return fs.readFileSync(cachePath, 'utf8');
    }

    console.log(`[TTSService] Cache Miss: ${cacheKey}. Synthesizing...`);
    console.time(`TTS_SYNTHESIS_${cacheKey}`);

    const speakerRegex = /([a-zA-Z\s\(\)]+)\s*:\s*([^]*?)(?=[a-zA-Z\s\(\)]+\s*:|$)/g;
    const matches = [...transcript.matchAll(speakerRegex)];
    
    let audioBase64;
    if (matches.length === 0) {
        const profile = getSpeakerProfile('speaker');
        const ssml = `<speak><break time="2.0s"/>${escapeSSML(transcript).replace(/\[PAUSE\]/g, '<break time="1s"/>')}</speak>`;
        audioBase64 = await generateSpeech(ssml, profile.lang, profile.gender);
    } else {
        const speakerVoiceMap = {};
        const usedVoices = new Set();
        const buffers = [];
        let currentSSML = '<speak><break time="2.0s"/>'; 
        let charCount = currentSSML.length;

        for (const match of matches) {
            const speakerName = match[1].trim();
            const cleanName = speakerName.toLowerCase();
            let content = match[2].trim();
            
            if (!speakerVoiceMap[cleanName]) {
                const profile = getSpeakerProfile(cleanName);
                const pool = VOICE_POOL[profile.lang][profile.gender];
                let selectedVoice = pool.find(v => !usedVoices.has(v)) || pool[0];
                speakerVoiceMap[cleanName] = { voice: selectedVoice, lang: profile.lang, gender: profile.gender };
                usedVoices.add(selectedVoice);
            }

            const config = speakerVoiceMap[cleanName];
            let escapedContent = escapeSSML(content).replace(/\[PAUSE\]/g, '<break time="1s"/>');
            const segment = `<voice name="${config.voice}">${escapedContent}</voice><break time="600ms"/>`;

            if (charCount + segment.length > 4800) {
                currentSSML += '</speak>';
                const audioData = await generateSpeech(currentSSML);
                buffers.push(Buffer.from(audioData, 'base64'));
                currentSSML = '<speak>' + segment;
                charCount = currentSSML.length;
            } else {
                currentSSML += segment;
                charCount += segment.length;
            }
        }

        if (currentSSML !== '<speak>') {
            currentSSML += '</speak>';
            const audioData = await generateSpeech(currentSSML);
            buffers.push(Buffer.from(audioData, 'base64'));
        }
        audioBase64 = Buffer.concat(buffers).toString('base64');
    }

    console.timeEnd(`TTS_SYNTHESIS_${cacheKey}`);
    
    // Save to cache asynchronously
    fs.writeFile(cachePath, audioBase64, (err) => {
        if (err) console.error(`[TTSService] Cache Write Error:`, err);
        else console.log(`[TTSService] Cache Saved: ${cacheKey}`);
    });

    return audioBase64;
}

module.exports = { generateSpeech, generateMultiSpeakerSpeech };
