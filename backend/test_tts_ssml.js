
const textToSpeech = require('@google-cloud/text-to-speech');
const path = require('path');
const fs = require('fs');
const util = require('util');

async function testSSML() {
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    const client = new textToSpeech.TextToSpeechClient({ keyFilename: keyPath });

    const text = `小戰士，想升Level 5？Good！你嘅目標夠清晰！要喺 DSE 戰場上攞到 Level 5，唔係齋靠努力，係要講策略！我 Ace Sir 幫你拆解！`;

    // Convert to SSML
    // Regex to wrap English words (and numbers following them) in <lang> tags
    const ssml = '<speak>' + text.replace(/([a-zA-Z0-9\s]+(?=[^a-zA-Z0-9\s]|$))/g, (match) => {
        if (/[a-zA-Z]/.test(match)) {
            return `<lang xml:lang="en-US">${match.trim()}</lang> `;
        }
        return match;
    }) + '</speak>';

    console.log('Original Text:', text);
    console.log('Generated SSML:', ssml);

    const request = {
        input: { ssml: ssml },
        voice: {
            languageCode: 'zh-HK',
            name: 'yue-HK-Standard-D',
            ssmlGender: 'MALE'
        },
        audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.4
        },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        await writeFile('test_ssml.mp3', response.audioContent, 'binary');
        console.log('✅ Audio content written to file: test_ssml.mp3');
    } catch (e) {
        console.error('❌ TTS Error:', e.message);
    }
}

testSSML();
