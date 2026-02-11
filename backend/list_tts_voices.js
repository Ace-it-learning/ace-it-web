
const textToSpeech = require('@google-cloud/text-to-speech');
const path = require('path');
const fs = require('fs');

async function listVoices() {
    const keyPath = path.join(__dirname, 'serviceAccountKey.json');
    const client = new textToSpeech.TextToSpeechClient({ keyFilename: keyPath });

    const [response] = await client.listVoices({ languageCode: 'yue-HK' });
    const voices = response.voices;

    console.log('Voices:');
    voices.forEach(voice => {
        console.log(`Name: ${voice.name}`);
        console.log(`  SSML Gender: ${voice.ssmlGender}`);
        console.log(`  Natural Sample Rate Hertz: ${voice.naturalSampleRateHertz}`);
        console.log(`  Supported languages: ${voice.languageCodes}`);
    });
}

listVoices();
