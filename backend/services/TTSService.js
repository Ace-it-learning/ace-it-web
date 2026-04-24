const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multimodalTTS = require('./MultimodalTTSService');

// Initialize Client
const NODE_ENV = process.env.NODE_ENV || 'development';
const saFilename = NODE_ENV === 'production' ? 'config/antigravity-tutor-prod-key.json' : 'config/antigravity-tutor-dev-key.json';
const keyPath = path.join(__dirname, '../', saFilename);
const isProduction = process.env.NODE_ENV === 'production';
const hasKey = fs.existsSync(keyPath);

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const clientOptions = hasKey 
    ? { keyFilename: keyPath } 
    : null;

console.log(`[TTSService] Init - Key Check: ${hasKey ? `Found local key at ${saFilename}` : 'Using default env/API Key'}`);
console.log(`[TTSService] Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} (${hasKey ? 'JSON Key' : 'API Key REST fallback'})`);

const client = clientOptions ? new textToSpeech.TextToSpeechClient(clientOptions) : null;

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

function convertToSSML(text, gender = 'FEMALE') {
    const escaped = escapeSSML(text);
    const hasChinese = /[\u4e00-\u9fa5]/.test(text);

    if (hasChinese) {
        // For Cantonese/Mixed strings, use the native Hong Kong voice for everything.
        // yue-HK is the dedicated code for authentic Cantonese.
        const hkVoice = gender === 'MALE' ? 'yue-HK-Standard-B' : 'yue-HK-Standard-A';
        return `<speak><voice name="${hkVoice}"><lang xml:lang="yue-HK">${escaped}</lang></voice></speak>`;
    } else {
        // Standard English-only cleanup
        const enVoice = gender === 'MALE' ? 'en-US-Wavenet-D' : 'en-US-Wavenet-F';
        return `<speak><voice name="${enVoice}"><lang xml:lang="en-US">${escaped}</lang></voice></speak>`;
    }
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

const TTS_VERSION = "2.9"; // Increment to invalidate caches

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
    // GLOBAL BYPASS: AI Voice features can be toggled via env if needed. 
    // Defaulting to ENABLED for UX unless explicitly disabled.
    const isGlobalDisabled = process.env.DISABLE_AI_VOICE === 'true'; 
    if (isGlobalDisabled) {
        return includeTimepoints ? { audio: null, timepoints: [] } : null;
    }

    try {
        const hasChinese = /[\u4e00-\u9fa5]/.test(text);
        const isHK = (languageCode === 'zh-HK' || languageCode === 'yue-HK' || hasChinese);
        const effectiveLang = isHK ? 'zh-HK' : (languageCode || 'en-US');

        let isSSML = text.trim().startsWith('<speak>');

        // [2026 REFACTOR] Establish Voice early
        const voiceName = forcedVoice || (isHK 
            ? (gender === 'MALE' ? 'yue-HK-Standard-B' : 'yue-HK-Standard-A')
            : (gender === 'MALE' ? 'en-US-Wavenet-D' : 'en-US-Wavenet-F'));

        // TRACK 1: SSML with marks for Timepoints
        let input;
        if (includeTimepoints && !isSSML) {
            const words = text.split(/(\s+)/);
            let wordCounter = 0;
            const ssmlContent = words.map(w => {
                if (/^\s+$/.test(w)) return w;
                const mark = `<mark name="w${wordCounter}"/>${escapeSSML(w)}`;
                wordCounter++;
                return mark;
            }).join('');
            
            const langCode = isHK ? 'yue-HK' : 'en-US';
            input = { ssml: `<speak><lang xml:lang="${langCode}">${ssmlContent}</lang></speak>` };
            isSSML = true;
        } else {
            // Use character-aware SSML for mixed language strings
            input = isSSML ? { ssml: text } : { ssml: convertToSSML(text, gender) };
            isSSML = true; // Mark as SSML since we wrapped it
        }

        const request = {
            input: input,
            voice: { languageCode: effectiveLang, name: voiceName },
            audioConfig: { audioEncoding: 'MP3', speakingRate: speakingRate },
        };

        // Enable timepoints for highlighting
        if (includeTimepoints) {
            request.enableTimepoints = ['SSML_MARK'];
        }

        // Standard Flow: Default to Wavenet/Neural Standard TTS to save costs and reduce latency.
        // Multimodal is ONLY used if explicitly requested or for specific premium features.
        // [2026] DEV HARDENING: Use Gemini Multimodal in DEV to stay within AI Studio (Free Tier).
        // Standard TTS (Google Cloud) is reserved for Production to save Gemini tokens/latency.
        const preferMultimodal = NODE_ENV === 'development'; 

        if (preferMultimodal) {
            try {
                console.log(`[TTSService] Primary Path: Multimodal (${languageCode})...`);
                const audioContent = await multimodalTTS.generateAudio(text, {
                    voiceName: gender === 'MALE' ? 'Puck' : 'Algenib',
                    notes: languageCode === 'en-GB' ? "Speak in clear, academic British English." : undefined
                });
                return includeTimepoints ? { audio: audioContent, timepoints: [] } : audioContent;
            } catch (multimodalError) {
                console.warn(`[TTSService] Multimodal failed, falling back to Standard TTS:`, multimodalError.message);
                // Fall through to Standard TTS below
            }
        }

        // Standard TTS Path (Google Cloud)
        const useSDK = hasKey; // Always use SDK if we have a JSON key
        console.log(`[TTSService] ${preferMultimodal ? 'Fallback' : 'Primary'} Path: Standard TTS (${effectiveLang}) via ${useSDK ? 'SDK' : 'REST'}...`);
        
        // DEV / API KEY Path (REST fallback only if no JSON key)
        if (!useSDK) {
            const axios = require('axios');
            const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
            
            const restRequest = {
                input: input,
                voice: { languageCode: effectiveLang, ssmlGender: gender },
                audioConfig: { audioEncoding: 'MP3', speakingRate: speakingRate },
            };

            const response = await axios.post(url, restRequest);
            const audioContent = response.data.audioContent;

            if (includeTimepoints) {
                return { audio: audioContent, timepoints: [] };
            }
            return audioContent;
        }

        // PROD / Service Account Path (SDK)
        const [response] = await client.synthesizeSpeech(request);
        
        if (includeTimepoints) {
            return {
                audio: response.audioContent.toString('base64'),
                timepoints: response.timepoints || []
            };
        }

        return response.audioContent.toString('base64');

    } catch (error) {
        console.error('[TTSService] Critical API Error:', error.message);
        
        // Final Emergency Fallback: If both paths failed, try one more time with a very simple multimodal call
        try {
            console.warn('[TTSService] Attempting final emergency simple synthesis...');
            const audioData = await multimodalTTS.generateAudio(text.replace(/<[^>]*>/g, '').substring(0, 300));
            return includeTimepoints ? { audio: audioData, timepoints: [] } : audioData;
        } catch (finalError) {
            console.error('[TTSService] All synthesis paths exhausted. Using silence fallback to prevent UI hang.');
            // Reliable 0.5s silence base64 (MP3)
            const silence = "SUQzBAAAAAAAF1RTU0UAAAANAAADTGFtZTMuOThyA1IAAAAAAAAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACAAAfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX///8AAAA5TEFNRTMuOThyYf8AAAAAAAAAAAAAAAAAAAAA";
            return includeTimepoints ? { audio: silence, timepoints: [] } : silence;
        }
    }
}

/**
 * Optimized Multi-Speaker Dialogue with File-based Caching
 */
async function generateMultiSpeakerSpeech(transcript) {
    // GLOBAL BYPASS: AI Voice features can be toggled via env if needed.
    if (process.env.DISABLE_AI_VOICE === 'true') return null;

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
        const ssml = `<speak>${escapeSSML(transcript).replace(/\[PAUSE\]/g, '<break time="1s"/>')}</speak>`;
        audioBase64 = await generateSpeech(ssml, profile.lang, profile.gender);
    } else {
        const speakerVoiceMap = {};
        const usedVoices = new Set();
        const buffers = [];
        let currentSSML = '<speak><break time="400ms"/>'; 
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

/**
 * Premium Multimodal Speech Generation
 * Uses Gemini direct audio output.
 */
async function generateMultimodalSpeech(text, gender = 'FEMALE') {
    // Standardize voice name based on gender for Gemini
    const voiceName = gender === 'MALE' ? 'Puck' : 'Algenib';
    
    return await multimodalTTS.generateAudio(text, {
        voiceName: voiceName,
        modelId: 'ace-it-multimodal'
    });
}

module.exports = { generateSpeech, generateMultiSpeakerSpeech, generateMultimodalSpeech };
